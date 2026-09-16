/**
 * engine.js  (ES module, pure, DOM-free, no dependencies)
 *
 * Shared calculation engine for Ampy's ROT-kalkylator and Grön Teknik-kalkylator, tax year 2026.
 *
 *  - skatteutrymme(person)  : JS port of logik/skatteutrymme_2026.py (validated against Skatteverket's
 *                             e-service "Räkna ut rot- och rutavdrag": 4 runs 2026-09-11, 75 runs 2026-09-16,
 *                             research/09; öretal kapas och pensionsavgiften rundas till närmaste hundratal sedan 2026-09-16).
 *  - beraknaRot(input)      : port of logik/rot_logik_ref.py (rot-spec.md §2–4). Passes rot-testfall.json (41).
 *  - beraknaGt(input)       : implementation of gt-spec.md §3–4. Passes gt-testfall.json (36).
 *
 * Rounding is kept identical to the Python reference: Python's round() is round-half-to-even on the
 * exact IEEE-754 double, so pyRound() below reproduces it bit for bit. Never replace with Math.round.
 *
 * Every rule points to research/01-rot-regelverk.md (A–H) or research/02-gron-teknik-regelverk.md (S-codes).
 * Nothing here is invented; where the specs are silent the choice is documented in logik/README.md
 * ("Reconciliations").
 */

// ---------------------------------------------------------------------------------------------------
// Year parameters (GRIND 12 / GT GRIND 10: bump these at the year change, nothing else should change)
// ---------------------------------------------------------------------------------------------------
export const PARAMS_2026 = Object.freeze({
  TAX_YEAR: 2026,

  // Skatteverket "Belopp och procent inkomstår 2026" [FACT]
  PBB: 59_200,                       // prisbasbelopp
  KS_SNITT: 0.3238,                  // genomsnittlig kommunal skattesats
  KS_BAND: Object.freeze([0.2893, 0.3565]), // lägsta/högsta kommunalskatt 2026: Österåker 28,93 / Dorotea 35,65 (SCB, research/08 §9)
  SKIKTGRANS: 643_000,               // statlig inkomstskatt 20 % above this
  STATLIG: 0.20,
  PENSIONSAVGIFT: 0.07,
  PENSIONSAVGIFT_MAX: 47_100,
  FASTIGHETSAVGIFT_SATS: 0.0075,
  FASTIGHETSAVGIFT_MAX: 10_425,      // småhus 2026
  TAXERINGSVARDE_MAXAVGIFT: 1_390_000, // derived value that yields the max fee (rot-spec §2, block 3)
  ALDERSGRANS_FORHOJT_GA: 66,        // "fyllt 66 vid årets ingång" (67 from 2027, GRIND 12)

  // ROT (01-rot-regelverk §C, §D)
  ROT_SATS: 0.30,
  ROT_TAK: 50_000,                   // per person and year
  ROT_RUT_TAK: 75_000,               // ROT + RUT together, per person and year
  FEMARSREGEL_SISTA_VARDEAR: 2020,   // om-/tillbyggnad ok in 2026 when värdeår <= 2020 (B5)
  FASTIGHETSAVGIFT_BEFRIAD_FRAN_VARDEAR: 2012, // 15-year exemption -> 0 fee for värdeår 2012+ (E3)

  // Grön teknik (02-gron-teknik-regelverk §D)
  GT_RATE: Object.freeze({ gt_laddbox: 0.50, gt_batteri: 0.50, gt_sol: 0.15 }),
  GT_TAK: 50_000,                    // per person and year, all three categories together
  SCHABLON_ARBETE_MATERIAL: 0.97,    // 3 % schablon at fixed total price (S11), GRIND 1: default OFF
  MAX_OWNERS_UI: 2,                  // UI limit, not a legal cap (GT GRIND 7)
});

const P = PARAMS_2026;

// ---------------------------------------------------------------------------------------------------
// Rounding helpers (Python-faithful)
// ---------------------------------------------------------------------------------------------------

/** Python round(x) -> int: nearest, ties to even, evaluated on the exact double. */
export function pyRound(x) {
  const f = Math.floor(x);
  const diff = x - f;
  if (diff === 0.5) return (f % 2 === 0) ? f : f + 1;
  return Math.round(x);
}

/** int(math.ceil(x / 100.0) * 100) */
export function rundUpp100(x) { return Math.ceil(x / 100.0) * 100; }

/** int(math.floor(x / 100.0) * 100) */
export function rundNed100(x) { return Math.floor(x / 100.0) * 100; }

/** Öretal faller bort (SFF 22 kap. 1 §, IL 67 kap. 1 § 2 st): skatter och skattereduktioner i hela kronor, kapade.
    Verifierat mot Skatteverkets e-tjänst 2026-09-16 (research/09, SKV-61: 37 254,56 -> 37 254). */
export function kapa(x) { return Math.max(0, Math.floor(x)); }

/** Allmän pensionsavgift: 7 % av lönen, "avrundas till närmast hela hundratal kronor. Avgift som slutar på 50 kronor
    avrundas till närmast lägre hundratal" (Lag 1994:1744 3 §). Heltalsräkning: lon*7 = avgiften i hundradels kronor.
    Verifierat mot e-tjänsten (research/09 SKV-66: lön 348 000 -> 24 400, inte 24 300). */
export function pensionsavgiftKr(lonAr) {
  const enheter = lonAr * 7;                       // avgift * 100
  const bas = Math.floor(enheter / 10_000) * 10_000;
  const rest = enheter - bas;
  return (rest > 5_000 ? bas + 10_000 : bas) / 100;
}

/** Python int(): truncation toward zero; undefined/null/NaN -> 0. */
export function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

// ---------------------------------------------------------------------------------------------------
// Skatteutrymme 2026  (port of skatteutrymme_2026.py)
// ---------------------------------------------------------------------------------------------------

/** IL 63 kap. 3 § (+ 3 a § for 66+). fi = fastställd förvärvsinkomst. */
export function grundavdrag(fi, ar66Plus) {
  const p = P.PBB;
  let ga;
  if (fi <= 0.99 * p) ga = 0.423 * p;
  else if (fi <= 2.72 * p) ga = 0.423 * p + 0.20 * (fi - 0.99 * p);
  else if (fi <= 3.11 * p) ga = 0.77 * p;
  else if (fi <= 7.88 * p) ga = 0.77 * p - 0.10 * (fi - 3.11 * p);
  else ga = 0.293 * p;
  if (ar66Plus) {
    // särskilt belopp, 63 kap. 3 a § i lydelse Lag (2025:1376), gäller 2026
    let s;
    if (fi <= 0.91 * p) s = 0.687 * p;
    else if (fi <= 1.11 * p) s = 0.885 * p - 0.20 * fi;
    else if (fi <= 1.965 * p) s = 0.600 * p + 0.057 * fi;
    else if (fi <= 2.72 * p) s = 0.333 * p + 0.1949 * fi;
    else if (fi <= 3.11 * p) s = 0.3949 * fi - 0.212 * p;
    else if (fi <= 3.24 * p) s = 0.4949 * fi - 0.523 * p;
    else if (fi <= 5.00 * p) s = 0.356 * fi - 0.073 * p;
    else if (fi <= 7.88 * p) s = 0.017 * p + 0.338 * fi;
    else if (fi <= 8.08 * p) s = 0.703 * p + 0.251 * fi;
    else if (fi <= 11.16 * p) s = 2.732 * p;
    else if (fi <= 12.84 * p) s = 9.651 * p - 0.62 * fi;
    else s = 1.691 * p;
    ga += s;
  }
  ga = Math.min(ga, fi);          // grundavdraget kan inte överstiga inkomsten
  return rundUpp100(ga);          // 63 kap. 2 §: avrundas uppåt till helt hundratal
}

/** IL 67 kap. 7 § (under 66) resp. 8 § (66+). Only against kommunal skatt. */
export function jobbskatteavdrag(arbetsinkomst, ga, ks, ar66Plus) {
  const ai = rundNed100(arbetsinkomst);
  const p = P.PBB;
  if (ai <= 0) return 0;
  if (!ar66Plus) {
    let u;
    if (ai <= 0.91 * p) u = ai - ga;
    else if (ai <= 3.24 * p) u = 0.91 * p + 0.3874 * (ai - 0.91 * p) - ga;
    else if (ai <= 8.08 * p) u = 1.813 * p + 0.251 * (ai - 3.24 * p) - ga;
    else u = 3.027 * p - ga;
    return kapa(u * ks);
  }
  if (ai <= 1.75 * p) return kapa(0.22 * ai);
  if (ai <= 5.24 * p) return kapa(0.2635 * p + 0.07 * ai);
  return kapa(0.6293 * p);
}

/** IL 67 kap. 46–47 §§: 1 500 kr, or 0,75 % of (BFI - 40 000) in the 40 000–240 000 interval. */
export function redForvarvsinkomst(bfi) {
  if (bfi <= 40_000) return 0;
  if (bfi <= 240_000) return kapa(0.0075 * (bfi - 40_000));
  return 1_500;
}

/** IL 67 kap. 10 §: 30 % up to 100 000, 21 % above. */
export function redUnderskottKapital(underskott) {
  if (underskott <= 0) return 0;
  return kapa(0.30 * Math.min(underskott, 100_000) + 0.21 * Math.max(0, underskott - 100_000));
}

/**
 * skatteutrymme(person) -> the full chain. `utrymme_rot_rut_gt` is what is left to set ROT/RUT (and then
 * grön teknik) against, after the reductions that precede hushållsarbete in IL 67 kap. 2 §.
 *
 * person = { lon_ar, pension_ar, ar_66_plus, ks (fraction, default 0.3238), taxeringsvarde, ranteutgifter,
 *            ovrigt_underskott }  (same names and semantics as the Python function)
 *
 * Output keys are identical to the Python dict (Swedish, with åäö) so the two stay diffable.
 * Simplifications inherited from the reference (01-rot-regelverk §E5, GRIND 11): no sjöinkomst, no
 * sjuk-/aktivitetsersättning, no regional reduction, no capital income, no 4 %-cap on pensioners' property fee.
 */
export function skatteutrymme(person = {}) {
  const lonAr = toInt(person.lon_ar ?? 0);
  const pensionAr = toInt(person.pension_ar ?? 0);
  const ar66 = Boolean(person.ar_66_plus ?? false);
  const ks = Number(person.ks ?? P.KS_SNITT);
  const taxeringsvarde = toInt(person.taxeringsvarde ?? 0);
  const ranteutgifter = toInt(person.ranteutgifter ?? 0);
  const ovrigtUnderskott = toInt(person.ovrigt_underskott ?? 0);

  const fi = rundNed100(lonAr + pensionAr);             // fastställd förvärvsinkomst (rounded down)
  const ga = grundavdrag(fi, ar66);
  const bfi = Math.max(0, fi - ga);                     // beskattningsbar förvärvsinkomst
  const kommunal = kapa(bfi * ks);
  const statlig = kapa(P.STATLIG * Math.max(0, bfi - P.SKIKTGRANS));
  const fastighetsavgift = taxeringsvarde > 0
    ? kapa(Math.min(P.FASTIGHETSAVGIFT_MAX, P.FASTIGHETSAVGIFT_SATS * taxeringsvarde))
    : 0;
  const pool = kommunal + statlig + fastighetsavgift;   // 67:2 2 st: the taxes reductions may be set against

  /* Allmän pensionsavgift tas inte ut när inkomsten understiger 0,423 pbb (SFB 59 kap. 13 §, research/08 §4) */
  let pensionsavgift = lonAr >= 0.423 * P.PBB ? Math.min(P.PENSIONSAVGIFT_MAX, pensionsavgiftKr(lonAr)) : 0;
  pensionsavgift = Math.min(pensionsavgift, pool);
  const jsa = Math.min(jobbskatteavdrag(lonAr, ga, ks, ar66), Math.max(0, kommunal)); // only vs kommunal
  let forv = redForvarvsinkomst(bfi);
  forv = Math.min(forv, Math.max(0, kommunal - jsa));
  const kap = redUnderskottKapital(ranteutgifter + ovrigtUnderskott);

  const kvar = pool - pensionsavgift - jsa - forv - kap;
  const utrymme = Math.max(0, kvar);
  return {
    'fastställd_förvärvsinkomst': fi,
    'grundavdrag': ga,
    'beskattningsbar_förvärvsinkomst': bfi,
    'kommunal_inkomstskatt': kommunal,
    'statlig_inkomstskatt': statlig,
    'fastighetsavgift': fastighetsavgift,
    'red_allmän_pensionsavgift': pensionsavgift,
    'red_jobbskatteavdrag': jsa,
    'red_förvärvsinkomst': forv,
    'red_underskott_kapital': kap,
    'utrymme_rot_rut_gt': utrymme,
    'räcker_rot_50k': utrymme >= P.ROT_TAK,
    'räcker_rot_rut_75k': utrymme >= P.ROT_RUT_TAK,
    'räcker_rot_50k_plus_gt_50k': utrymme >= P.ROT_TAK + P.GT_TAK,
  };
}

/**
 * Derived taxeringsvärde for the property-fee part of the pool (rot-spec §2, block 3, "taxeringsvarde (härledd)").
 * Added helper (not in the Python): the reference takes taxeringsvarde as an explicit per-owner input.
 *   smahus + t2011 -> 1 390 000 (max fee 10 425)   smahus + 2012_2020 / 2021_2025 / 2026_ej_fardig -> 0
 *   bostadsratt -> 0 (föreningen betalar)          agarlagenhet -> 1 390 000
 *   vet_inte -> 0 (conservative: lower utrymme)     [reconciliation, see README]
 */
export function harledTaxeringsvarde(bostadstyp, vardear) {
  if (bostadstyp === 'agarlagenhet') return P.TAXERINGSVARDE_MAXAVGIFT;
  if (bostadstyp === 'smahus' || bostadstyp === 'bostadsratt_smahus') {
    return vardear === 't2011' ? P.TAXERINGSVARDE_MAXAVGIFT : 0;
  }
  return 0;
}

// ---------------------------------------------------------------------------------------------------
// ROT  (port of rot_logik_ref.py)
// ---------------------------------------------------------------------------------------------------

export const ROT_PRECEDENS = Object.freeze(['nej', 'troligen_ej', 'osaker', 'ja_med_villkor', 'ja']);

const SMAHUS = new Set(['smahus', 'bostadsratt_smahus']);
const LAGENHET = new Set(['bostadsratt', 'bostadsratt_smahus', 'agarlagenhet']);
const BRF = new Set(['bostadsratt', 'bostadsratt_smahus']);
const BOR_NEJ = Object.freeze({ uthyrd: 'uthyrd_bostad', barn: 'barnets_bostad', sarbo: 'sarbos_bostad', nej: 'bor_inte_dar' });

/** Returns { verdict, flaggor } for the question set in rot-spec.md §2. */
export function bedomRot(inp = {}) {
  const f = [];
  const klasser = new Set();
  const bostad = inp.bostadstyp;
  const ager = inp.ager;
  const bor = inp.bor;
  const vardear = inp.vardear;
  const arbetstyp = inp.arbetstyp;
  const plats = inp.plats;
  const myndig = inp.myndig_vid_arsskiftet ?? true;
  const skattSverige = inp.skattskyldig_sverige ?? true;
  const stod = inp.bidrag_forsakring_gt ?? 'nej';
  const dodsbo = inp.dodsbo ?? 'nej';

  // hårda nej (A, B, C, G)
  if (bostad === 'hyresratt') { klasser.add('nej'); f.push('hyresratt'); }
  if (ager === 'nej') { klasser.add('nej'); f.push('ager_inte'); }
  if (bor in BOR_NEJ) { klasser.add('nej'); f.push(BOR_NEJ[bor]); }
  if (!myndig) { klasser.add('nej'); f.push('under_18'); }
  if (!skattSverige) { klasser.add('nej'); f.push('ej_skattskyldig_sverige'); }
  if (stod === 'ja') { klasser.add('nej'); f.push('bidrag_forsakring_eller_gt_samma_arbete'); }
  if (dodsbo === 'efter_dodsfall') { klasser.add('nej'); f.push('dodsbo_efter_dodsfall'); }
  if (SMAHUS.has(bostad) && vardear === '2026_ej_fardig') { klasser.add('nej'); f.push('ej_fardigstallt_nybygge'); }
  if (LAGENHET.has(bostad) && plats === 'utanfor') { klasser.add('nej'); f.push('utanfor_lagenheten'); }

  // femårsregeln (B4–B8): only om-/tillbyggnad is blocked for värdeår 2021–2025; repair is fine at any age
  if (SMAHUS.has(bostad) && vardear === '2021_2025') {
    if (arbetstyp === 'ombyggnad') { klasser.add('troligen_ej'); f.push('femarsregeln_ombyggnad'); }
    else if (arbetstyp === 'reparation') { klasser.add('ja_med_villkor'); f.push('femarsregeln_endast_reparation'); }
    else { klasser.add('osaker'); f.push('femarsregeln_arbetstyp_okand'); }
  }

  // osäkert (vet inte på avgörande fråga)
  if (ager === 'vet_inte') { klasser.add('osaker'); f.push('agande_okant'); }
  if (SMAHUS.has(bostad) && vardear === 'vet_inte' && arbetstyp !== 'reparation') { klasser.add('osaker'); f.push('vardear_okant'); }
  if (LAGENHET.has(bostad) && plats === 'vet_inte') { klasser.add('osaker'); f.push('plats_okand'); }
  if (bostad === 'vet_inte') { klasser.add('osaker'); f.push('bostadstyp_okand'); }
  if (stod === 'vet_inte') { klasser.add('osaker'); f.push('stod_okant'); }

  // villkorade ja
  if (BRF.has(bostad) && plats === 'inne') { klasser.add('ja_med_villkor'); f.push('brf_stadgar_inre_underhall'); }
  if (bor === 'foraldrar') { klasser.add('ja_med_villkor'); f.push('foraldrars_bostad_delagande_och_utgift'); }
  if (bor === 'nykopt_flyttar_in') { klasser.add('ja_med_villkor'); f.push('nykopt_flytta_in_direkt'); }
  if (bor === 'fritid') f.push('fritidshus_ingen_annan_permanent');
  if (dodsbo === 'fore_dodsfall') { klasser.add('ja_med_villkor'); f.push('dodsbo_fore_dodsfall'); }
  if (bostad === 'smahus' && vardear === '2012_2020') f.push('fastighetsavgift_befriad'); // only affects utrymme

  for (const k of ROT_PRECEDENS) if (klasser.has(k)) return { verdict: k, flaggor: f };
  return { verdict: 'ja', flaggor: f };
}

/**
 * beraknaRot(input) -> amounts + tax capacity, exactly as rot_logik_ref.rakna().
 * input: the question set of rot-spec.md §2 (bostadstyp, ager, bor, vardear, arbetstyp, plats,
 *        myndig_vid_arsskiftet, skattskyldig_sverige, bidrag_forsakring_gt, dodsbo, arbetskostnad_inkl_moms,
 *        material_inkl_moms, ovriga_kostnader_inkl_moms, agare: [{ rot_anvant_i_ar, rut_anvant_i_ar,
 *        manadsinkomst, inkomsttyp, lon_manad, pension_manad, fyllt_66_vid_arets_ingang, taxeringsvarde,
 *        kommunalskatt (fraction), ranteutgifter_ar, gron_teknik_planerad_i_ar }]).
 * An owner without `manadsinkomst` (absent or null) is "ej_bedomd".
 * Added output fields vs the Python: `potter_kr` (pott kvar per ägare), `pott_kvar_kr` (sum).
 */
export function beraknaRot(inp = {}) {
  const { verdict, flaggor } = bedomRot(inp);
  const arb = toInt(inp.arbetskostnad_inkl_moms ?? 0);
  const mat = toInt(inp.material_inkl_moms ?? 0);
  const ovr = toInt(inp.ovriga_kostnader_inkl_moms ?? 0);
  const total = arb + mat + ovr;
  let agare = Array.isArray(inp.agare) ? inp.agare : [];
  if (agare.length === 0) agare = [{}];

  // 1) 30 % of the labour cost (only labour)
  const brutto = pyRound(arb * 0.30);
  if (mat + ovr > 0) flaggor.push('bara_arbetskostnad_ger_avdrag');

  // 2) pott kvar per ägare (ROT cap 50 000, ROT+RUT 75 000)
  const potter = [];
  for (const a of agare) {
    const rotAnv = toInt(a.rot_anvant_i_ar ?? 0);
    const rutAnv = toInt(a.rut_anvant_i_ar ?? 0);
    const kvar = Math.max(0, Math.min(P.ROT_TAK - rotAnv, P.ROT_RUT_TAK - rotAnv - rutAnv));
    potter.push(kvar);
    if (kvar < P.ROT_TAK) flaggor.push('pott_delvis_forbrukad');
  }
  const pottSum = potter.reduce((s, x) => s + x, 0);
  if (pottSum === 0) { flaggor.push('pott_slut_i_ar'); flaggor.push('betala_efter_arsskiftet_ny_pott'); }
  const avdrag = verdict === 'nej' ? 0 : Math.min(brutto, pottSum);
  if (avdrag < brutto && verdict !== 'nej') flaggor.push('taket_begransar');
  if (agare.length > 1) flaggor.push('flera_agare_delar');

  // 3) fördelning: fill the owner with the largest pott first (stable order on ties, like Python's sort)
  const ordning = agare.map((_, i) => i).sort((a, b) => potter[b] - potter[a]);
  const tilldelat = new Array(agare.length).fill(0);
  let rest = avdrag;
  for (const i of ordning) { const t = Math.min(potter[i], rest); tilldelat[i] = t; rest -= t; }

  // 4) skattekapacitet per ägare (already used ROT/RUT + new avdrag + planned GT must fit)
  const skatt = [];
  let totalBrist = 0;
  let gtBrist = 0;
  agare.forEach((a, i) => {
    if (a.manadsinkomst === undefined || a.manadsinkomst === null) { skatt.push({ status: 'ej_bedomd' }); return; }
    const ar = toInt(a.manadsinkomst) * 12;
    const typ = a.inkomsttyp ?? 'lon';
    const p66 = Boolean(a.fyllt_66_vid_arets_ingang ?? false);
    let lon = (typ === 'lon' || typ === 'bada') ? ar : 0;
    let pen = typ === 'pension' ? ar : 0;
    if (typ === 'bada') { lon = toInt(a.lon_manad ?? 0) * 12; pen = toInt(a.pension_manad ?? 0) * 12; }
    const tax = toInt(a.taxeringsvarde ?? 0);
    const r = skatteutrymme({
      lon_ar: lon, pension_ar: pen, ar_66_plus: p66,
      ks: Number(a.kommunalskatt ?? P.KS_SNITT),
      taxeringsvarde: tax, ranteutgifter: toInt(a.ranteutgifter_ar ?? 0),
    });
    const utr = r.utrymme_rot_rut_gt;
    const redan = toInt(a.rot_anvant_i_ar ?? 0) + toInt(a.rut_anvant_i_ar ?? 0);
    const gt = toInt(a.gron_teknik_planerad_i_ar ?? 0);
    const behovRot = redan + tilldelat[i];
    const rymsRot = Math.min(behovRot, utr);
    const brist = behovRot - rymsRot;
    const gtRyms = Math.max(0, Math.min(gt, utr - behovRot));   // GT after ROT/RUT (IL 67:2) -> GT loses first
    const gtb = gt - gtRyms;
    const status = brist === 0 ? 'ryms' : (rymsRot > 0 ? 'ryms_delvis' : 'ryms_inte');
    skatt.push({
      utrymme_kr: utr, behov_rot_rut_kr: behovRot, status,
      aterbetalningsrisk_kr: brist, gt_planerad_kr: gt, gt_ryms_kr: gtRyms, gt_aterbetalningsrisk_kr: gtb,
    });
    totalBrist += brist; gtBrist += gtb;
  });

  let skattRacker;
  if (verdict === 'nej') skattRacker = 'ej_relevant';
  else if (skatt.some((s) => s.status === 'ej_bedomd')) skattRacker = 'ej_bedomd';
  else if (totalBrist === 0) skattRacker = 'ryms';
  else if (skatt.some((s) => s.status === 'ryms_delvis') || skatt.some((s) => s.status === 'ryms')) skattRacker = 'ryms_delvis';
  else skattRacker = 'ryms_inte';
  if (totalBrist > 0 && agare.length > 1) flaggor.push('omfordela_mellan_agare');
  if (gtBrist > 0) flaggor.push('gt_efter_rot_racker_inte');
  if (agare.some((a) => toInt(a.ranteutgifter_ar ?? 0) > 0)) flaggor.push('ranteavdrag_minskar_utrymmet');

  const attBetala = total - avdrag;
  const fl = [...new Set(flaggor)];   // dedupe, keep order
  return {
    verdict,
    avdrag_brutto_kr: brutto,
    avdrag_kr: avdrag,
    att_betala_kr: attBetala,
    fordelning_kr: tilldelat,
    skatt_racker: skattRacker,
    skatt,
    aterbetalningsrisk_kr: totalBrist,
    flaggor: fl,
    // added (not in the Python output):
    potter_kr: potter,
    pott_kvar_kr: pottSum,
  };
}

// ---------------------------------------------------------------------------------------------------
// Grön teknik  (gt-spec.md §3–4)
// ---------------------------------------------------------------------------------------------------

export const GT_STOPP = Object.freeze(['ej_hyresratt', 'ej_ager_inte', 'ej_anvands_av_annan', 'ej_person',
  'ej_brf_gemensamt', 'ej_brf_pplats_hyrd']);
export const GT_VERDICTS = Object.freeze([...GT_STOPP, 'batteri_utan_sol_rot', 'osaker',
  'berattigad_skatt_racker_inte', 'berattigad_tak', 'berattigad']);

function fillArr(v, n, fillValue) {
  const arr = Array.isArray(v) ? v.slice(0, n) : [];
  while (arr.length < n) arr.push(fillValue);
  return arr.map((x) => (x === undefined ? fillValue : x));
}

/**
 * beraknaGt(input) -> { verdict, avdrag_brutto_kr, avdrag_kr, tak_kvar_kr, avdrag_efter_skatt_kr,
 *                       aterbetalningsrisk_kr, skatt_racker, att_betala_kr, rot_fallback_kr?, flaggor }
 * input: gt-spec §2 field names. Defaults as gt-testfall.json _meta: alder_18 true, skattskyldig_sverige true,
 *        material_fran_installator true, leasing false, fast_pris_schablon false, antal_agare 1,
 *        gt_anvant_kr [0,0], rot_rut_anvant_kr [0,0] (null = vet inte), tillagg_elcentral_kr 0,
 *        skatt_tillganglig_kr [null,...] (= ROT model's utrymme_rot_rut_gt per owner; null = okänd).
 * skatt_racker: true | false | 'okant' | 'ej_relevant' (stop) | 'rot_modellen' (ROT fallback path).
 * Added vs the spec: unanswered (null) `solceller` on batteri and unanswered `pplats` on laddbox+brf are
 * treated like "vet inte" (osaker), and unanswered ager/bostad get the flags agande_okant / bostad_okand.
 */
export function beraknaGt(inp = {}) {
  const lage = inp.lage;
  const rate = P.GT_RATE[lage];
  if (rate === undefined) throw new Error(`beraknaGt: okänt läge "${lage}"`);
  const n = Math.max(1, toInt(inp.antal_agare ?? 1));
  const alder18 = inp.alder_18 ?? true;
  const skv = inp.skattskyldig_sverige ?? true;
  const matInst = inp.material_fran_installator ?? true;
  const leasing = inp.leasing ?? false;
  const fast = inp.fast_pris_schablon ?? false;
  const gtAnv = fillArr(inp.gt_anvant_kr, n, 0).map((x) => (x === null ? 0 : toInt(x)));
  const rotRut = fillArr(inp.rot_rut_anvant_kr, n, 0).map((x) => (x === null ? null : toInt(x)));
  const skattT = fillArr(inp.skatt_tillganglig_kr, n, null).map((x) => (x === null ? null : toInt(x)));
  const tillagg = toInt(inp.tillagg_elcentral_kr ?? 0);
  const pris = toInt(inp.pris_total_kr ?? 0);
  const prisArb = toInt(inp.pris_arbete_kr ?? 0);
  const bostad = inp.bostad ?? null;
  const ager = inp.ager ?? null;
  const anv = inp.anvandning ?? null;
  const sol = inp.solceller ?? null;
  const pplats = inp.pplats ?? null;
  const isLadd = lage === 'gt_laddbox';
  const isBatt = lage === 'gt_batteri';
  const brf = bostad === 'bostadsratt';

  // --- §4 amounts (computed for every class; overridden for stops / ROT fallback) ---
  const materialOk = Boolean(matInst) && !leasing;
  let underlag = materialOk ? pris : prisArb;
  if (fast) underlag = underlag * P.SCHABLON_ARBETE_MATERIAL;      // 97 % (S11), GRIND 1
  const avdragBrutto = Math.floor(rate * underlag);                  // hela kronor (GRÖNFL 5 §)
  let takKvar = 0;
  for (let i = 0; i < n; i++) takKvar += Math.max(0, P.GT_TAK - gtAnv[i]);
  const avdragKr = Math.min(avdragBrutto, takKvar);
  let skattRacker = 'okant';
  let avdragEfterSkatt = avdragKr;
  let risk = 0;
  const skattKand = skattT.every((v) => v !== null) && rotRut.every((v) => v !== null);
  if (skattKand) {
    let skattKvar = 0;
    for (let i = 0; i < n; i++) skattKvar += Math.max(0, skattT[i] - rotRut[i]);
    avdragEfterSkatt = Math.min(avdragKr, skattKvar);
    risk = avdragKr - avdragEfterSkatt;
    skattRacker = risk === 0;
  }

  // --- §3 verdict, first hit wins ---
  let verdict;
  const osakerFlaggor = [];
  if (bostad === 'hyresratt') verdict = 'ej_hyresratt';
  else if (ager === false) verdict = 'ej_ager_inte';
  else if (anv === 'annan') verdict = 'ej_anvands_av_annan';
  else if (alder18 === false || skv === false) verdict = 'ej_person';
  else if (isLadd && brf && pplats === 'gemensamt') verdict = 'ej_brf_gemensamt';
  else if (isLadd && brf && pplats === 'hyrd_uppsagningsbar') verdict = 'ej_brf_pplats_hyrd';
  else if (isBatt && sol === 'nej') verdict = 'batteri_utan_sol_rot';
  else {
    if (isBatt && (sol === 'vet_inte' || sol === null)) osakerFlaggor.push('solceller_okant');
    if (isLadd && brf && (pplats === 'vet_inte' || pplats === null)) osakerFlaggor.push('pplats_okant');
    if (isBatt && brf) osakerFlaggor.push('brf_batteri_kraver_egen_produktion');
    if (ager === null) osakerFlaggor.push('agande_okant');
    if (bostad === null) osakerFlaggor.push('bostad_okand');
    if (osakerFlaggor.length) verdict = 'osaker';
    else if (skattKand && avdragEfterSkatt < avdragKr) verdict = 'berattigad_skatt_racker_inte';
    else if (avdragBrutto > takKvar) verdict = 'berattigad_tak';
    else verdict = 'berattigad';
  }
  const isStopp = GT_STOPP.includes(verdict);
  const isFallback = verdict === 'batteri_utan_sol_rot';
  const evaluated = !isStopp && !isFallback;             // classes 8–11
  const berattigad = verdict.startsWith('berattigad');    // classes 9–11

  // --- flags ---
  const f = [];
  // neutral cost/pott flags, independent of class
  if (matInst === false) f.push('material_ej_avdrag');
  if (leasing) f.push('leasing_ej_material');
  if (tillagg > 0) f.push('elcentral_ej_gt_kan_vara_rot');
  if (gtAnv.some((x) => x > 0)) f.push('gt_anvant_i_ar');
  if (rotRut.some((x) => x !== null && x > 0)) f.push('rot_rut_anvant_i_ar');
  if (fast) f.push('schablon_97_tillampad');
  if (n >= 2) f.push('tva_agare_delar');
  // informational "ok" flags and skatt-unknown flags: only when the case is actually evaluated (8–11)
  if (evaluated) {
    if (bostad === 'nybygge') f.push('nybygge_ok_ingen_femarsregel');
    if (bostad === 'fritidshus') f.push('fritidshus_ok');
    if (anv === 'foralder') f.push('foralders_hushall');
    if (isLadd && brf && pplats === 'foljer_bostadsratten') f.push('brf_pplats_ok');
    if (isBatt && sol === 'samtidigt') f.push('vaxelriktare_15_vid_samtidig_sol');
    if (skattT.some((v) => v === null)) f.push('skatt_okand');
    if (rotRut.some((v) => v === null)) f.push('rot_rut_okant');
  }
  if (berattigad && isBatt && (sol === 'har' || sol === 'samtidigt')) f.push('stodtjanster_paverkar_inte_avdraget');
  if (verdict === 'ej_brf_gemensamt' || verdict === 'ej_brf_pplats_hyrd') f.push('ladda_bilen_foreningen');
  if (verdict === 'ej_brf_pplats_hyrd') f.push('rot_ej_utanfor_lagenheten');
  if (isFallback) f.push('rot_fallback_arbete_endast');
  if (verdict === 'osaker') f.push(...osakerFlaggor);
  const flaggor = [...new Set(f)];

  // --- result per class ---
  if (isStopp) {
    return {
      verdict, avdrag_brutto_kr: 0, avdrag_kr: 0, tak_kvar_kr: takKvar,
      avdrag_efter_skatt_kr: 0, aterbetalningsrisk_kr: 0, skatt_racker: 'ej_relevant',
      att_betala_kr: pris + tillagg, flaggor,
    };
  }
  if (isFallback) {
    const rotFallback = Math.floor(P.ROT_SATS * prisArb);          // only labour, never the battery (S6)
    return {
      verdict, avdrag_brutto_kr: 0, avdrag_kr: 0, tak_kvar_kr: takKvar,
      avdrag_efter_skatt_kr: 0, aterbetalningsrisk_kr: 0, skatt_racker: 'rot_modellen',
      rot_fallback_kr: rotFallback, att_betala_kr: pris - rotFallback + tillagg, flaggor,
    };
  }
  return {
    verdict, avdrag_brutto_kr: avdragBrutto, avdrag_kr: avdragKr, tak_kvar_kr: takKvar,
    avdrag_efter_skatt_kr: avdragEfterSkatt, aterbetalningsrisk_kr: risk, skatt_racker: skattRacker,
    att_betala_kr: pris - avdragKr + tillagg, flaggor,
  };
}
