/*
 * AVDRAGSKOLLEN (ROT / grön teknik), FluentSnippets snippet 3/3, typ "JS". Kör: Frontend, wp_footer. Paket 1.0.0.
 * FORMAT-ONLY: byggd av produktion/_build/paketera.mjs ur logik/engine.js (skatteutrymmet), kalkylator/rakna.js (hushållet)
 * och kalkylator/v1/app.js (som init(root), root-scopad, multi-instans). Redigera aldrig här: ändra källorna och bygg om.
 * En IIFE, 'use strict', inga globaler. Startar varje ".ampy-avdragskollen .rk[data-mode]" en gång (data-booted).
 * Syntax: ES2020 (mallsträngar, ??, spridning, replaceChildren). Talens avgränsare (59_200) är utskrivna som vanliga tal.
 * Inget lagras, inget skickas: ingen fetch, ingen REST, ingen webhook, ingen spårning.
 * Källor (sha256): engine.js 46c03df1c981, rakna.js 12dd1cd63726, app.js 10382653d70d
 */
(function () {
  'use strict';

  /* ---------- logik/engine.js: parametrar, avrundning och skatteutrymmet 2026 (verifierat mot Skatteverkets e-tjänst, research/09) ---------- */
  const PARAMS_2026 = Object.freeze({
    TAX_YEAR: 2026,

    // Skatteverket "Belopp och procent inkomstår 2026" [FACT]
    PBB: 59200,                       // prisbasbelopp
    KS_SNITT: 0.3238,                  // genomsnittlig kommunal skattesats
    KS_BAND: Object.freeze([0.2893, 0.3565]), // lägsta/högsta kommunalskatt 2026: Österåker 28,93 / Dorotea 35,65 (SCB, research/08 §9)
    SKIKTGRANS: 643000,               // statlig inkomstskatt 20 % above this
    STATLIG: 0.20,
    PENSIONSAVGIFT: 0.07,
    PENSIONSAVGIFT_MAX: 47100,
    FASTIGHETSAVGIFT_SATS: 0.0075,
    FASTIGHETSAVGIFT_MAX: 10425,      // småhus 2026
    TAXERINGSVARDE_MAXAVGIFT: 1390000, // derived value that yields the max fee (rot-spec §2, block 3)
    ALDERSGRANS_FORHOJT_GA: 66,        // "fyllt 66 vid årets ingång" (67 from 2027, GRIND 12)

    // ROT (01-rot-regelverk §C, §D)
    ROT_SATS: 0.30,
    ROT_TAK: 50000,                   // per person and year
    ROT_RUT_TAK: 75000,               // ROT + RUT together, per person and year
    FEMARSREGEL_SISTA_VARDEAR: 2020,   // om-/tillbyggnad ok in 2026 when värdeår <= 2020 (B5)
    FASTIGHETSAVGIFT_BEFRIAD_FRAN_VARDEAR: 2012, // 15-year exemption -> 0 fee for värdeår 2012+ (E3)

    // Grön teknik (02-gron-teknik-regelverk §D)
    GT_RATE: Object.freeze({ gt_laddbox: 0.50, gt_batteri: 0.50, gt_sol: 0.15 }),
    GT_TAK: 50000,                    // per person and year, all three categories together
    SCHABLON_ARBETE_MATERIAL: 0.97,    // 3 % schablon at fixed total price (S11), GRIND 1: default OFF
    MAX_OWNERS_UI: 2,                  // UI limit, not a legal cap (GT GRIND 7)
  });

  const P = PARAMS_2026;

  /** int(math.ceil(x / 100.0) * 100) */
  function rundUpp100(x) { return Math.ceil(x / 100.0) * 100; }

  /** int(math.floor(x / 100.0) * 100) */
  function rundNed100(x) { return Math.floor(x / 100.0) * 100; }

  /** Öretal faller bort (SFF 22 kap. 1 §, IL 67 kap. 1 § 2 st): skatter och skattereduktioner i hela kronor, kapade.
      Verifierat mot Skatteverkets e-tjänst 2026-09-16 (research/09, SKV-61: 37 254,56 -> 37 254). */
  function kapa(x) { return Math.max(0, Math.floor(x)); }

  /** Allmän pensionsavgift: 7 % av lönen, "avrundas till närmast hela hundratal kronor. Avgift som slutar på 50 kronor
      avrundas till närmast lägre hundratal" (Lag 1994:1744 3 §). Heltalsräkning: lon*7 = avgiften i hundradels kronor.
      Verifierat mot e-tjänsten (research/09 SKV-66: lön 348 000 -> 24 400, inte 24 300). */
  function pensionsavgiftKr(lonAr) {
    const enheter = lonAr * 7;                       // avgift * 100
    const bas = Math.floor(enheter / 10000) * 10000;
    const rest = enheter - bas;
    return (rest > 5000 ? bas + 10000 : bas) / 100;
  }

  /** Python int(): truncation toward zero; undefined/null/NaN -> 0. */
  function toInt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  /** IL 63 kap. 3 § (+ 3 a § for 66+). fi = fastställd förvärvsinkomst. */
  function grundavdrag(fi, ar66Plus) {
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
  function jobbskatteavdrag(arbetsinkomst, ga, ks, ar66Plus) {
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
  function redForvarvsinkomst(bfi) {
    if (bfi <= 40000) return 0;
    if (bfi <= 240000) return kapa(0.0075 * (bfi - 40000));
    return 1500;
  }

  /** IL 67 kap. 10 §: 30 % up to 100 000, 21 % above. */
  function redUnderskottKapital(underskott) {
    if (underskott <= 0) return 0;
    return kapa(0.30 * Math.min(underskott, 100000) + 0.21 * Math.max(0, underskott - 100000));
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
  function skatteutrymme(person = {}) {
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

  /* ---------- kalkylator/rakna.js: hushållets besked ---------- */
  const TAK = P.ROT_TAK;   // 50 000 kr per person och år, samma för ROT och grön teknik

  /** Formaterar kronor med hårda mellanslag: 50 000 kr */
  function kr(n) {
    return new Intl.NumberFormat('sv-SE').format(n).replace(/[\s  ]/g, ' ') + ' kr';
  }

  /** Plockar siffrorna ur ett fält: "300 000" -> 300000 */
  /* "300 000,50 kr" -> 300000 (öretal med komma eller punkt stryks, "300.000" behålls som tusental), högst nio siffror */
  function siffra(str) {
    return Number(String(str ?? '').replace(/[,.]\d{1,2}(?!\d)\s*(kr)?\s*$/i, '').replace(/[^\d]/g, '').slice(0, 9)) || 0;
  }

  /** Formaterar fältets värde med mellanslag medan man skriver */
  function formatFalt(str) {
    const n = siffra(str);
    return n ? new Intl.NumberFormat('sv-SE').format(n).replace(/[\s  ]/g, ' ') : '';
  }

  /* ---------- Hushåll: flera personer, redan använt avdrag, ålder, bolåneränta (ägarbeslut 2026-09-14, research 07-10 2026-09-16) ---------- */
  const ANTAL_ORD = { 2: 'två', 3: 'tre', 4: 'fyra' };

  const MAX_PERSONER = 4;

  /** Lön och pension ur svaren. "Båda": fältet är hela inkomsten och "Varav pension" är pensionsdelen (research/12 Major 2). */
  function inkomstDelar(p) {
    const inkomst = Math.max(0, p.inkomst || 0);
    if (p.typ === 'pension') return { lon: 0, pension: inkomst };
    if (p.typ === 'bada') {
      const pension = Math.min(inkomst || Math.max(0, p.pension || 0), Math.max(0, p.pension || 0));
      return inkomst ? { lon: inkomst - pension, pension } : { lon: 0, pension };   /* bara pensionen ifylld: räkna på den (research/12 Minor 1) */
    }
    return { lon: inkomst, pension: 0 };
  }

  /** Utrymmet för en person vid en given kommunalskatt (delad med ålder från frågan, inte från inkomsttypen: research/10 F1) */
  function utrymmeFor(p, ks) {
    const delar = inkomstDelar(p);
    const r = skatteutrymme({
      lon_ar: delar.lon,
      pension_ar: delar.pension,
      ar_66_plus: p.alder === '66+',
      ks, taxeringsvarde: 0,
      ranteutgifter: Math.max(0, p.ranta || 0),        /* underskott av kapital ligger före ROT i 67 kap. 2 § (research/10 F2) */
    });
    return Math.max(0, r.utrymme_rot_rut_gt);
  }

  /**
   * beraknaHushall({ mode, ager, aldre, personer: [{ typ, inkomst, alder: 'u18'|'18-65'|'66+', ranta, anvant, gtAnvant }] })
   * -> { status: 'stopp'|'tak'|'belopp', belopp, prefix, text, not, per, antal }
   *   ager/aldre som i berakna(); person 1:s ålder 'u18' = fyller 18 först nästa år -> stopp (67 kap. 11 §).
   *   Per person (67 kap. 19 § tak + 67 kap. 2 § pott): rest = min(50 000, utrymme) − det som redan använts i år av
   *   SAMMA post (ROT och RUT i ROT-läget, grön teknik i grön teknik-läget). Ägarbeslut 2026-09-16: posterna hålls isär
   *   och syns inte i varandra; att ROT/RUT ligger före grön teknik i 67 kap. 2 § är därför en känd förenkling
   *   (uppskattning, research/10 F3).
   *   Summan är hushållets. "upp till" så snart någon inkomst saknas, "ca" så snart någon är räknad under taket eller när
   *   "50 000" inte håller vid landets lägsta kommunalskatt (research/10 F6), annars exakt.
   */
  function beraknaHushall({ mode = 'rot', ager = true, aldre = true, myndig, personer = [{}] } = {}) {
    const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
    const antal = Math.max(1, personer.length);
    const per = antal === 1 ? 'Per person och år.' : `Ni ${ANTAL_ORD[antal] || antal} tillsammans, per år.`;
    const stopp = (text) => ({ status: 'stopp', belopp: null, prefix: '', text, not: null, per, antal });
    if (!ager) return stopp(`Eftersom du inte äger din bostad har du inte rätt till ${namn}.`);
    const under18 = myndig === false || (myndig === undefined && personer[0] && personer[0].alder === 'u18');
    if (under18) return stopp(`Du behöver ha fyllt 18 år senast vid årets slut för att få ${namn}.`);

    const noter = [];
    if (mode === 'rot' && !aldre) noter.push('Yngre än fem år: ROT gäller reparation och underhåll, inte om- och tillbyggnad.');

    let summa = 0, nagonTak = false, nagonCa = false, anvantTot = 0, forMycket = 0, nagonInkomst = false, lon66 = false;
    for (const p of personer) {
      const anvant = Math.max(0, (mode === 'gt' ? p.gtAnvant : p.anvant) || 0);
      anvantTot += anvant;
      const restVid = (u) => Math.min(TAK, u) - anvant;
      const delar = inkomstDelar(p);
      if (delar.lon + delar.pension === 0) { summa += Math.max(0, restVid(Infinity)); nagonTak = true; continue; }
      nagonInkomst = true;
      const u = utrymmeFor(p, P.KS_SNITT);
      if (u === 0 && p.alder === '66+' && p.typ === 'lon') lon66 = true;   /* 66+ med bara lön: förhöjt grundavdrag + jobbskatteavdrag 66+ äter hela kommunalskatten (verifierat: SKV-72) */
      let rest = restVid(u);
      if (anvant > u) forMycket += anvant - u;         /* kvarskatt bara när skatten inte räcker; ROT och RUT får passera 50 000 (75 000 tillsammans, 67 kap. 19 §) (research/12 Major 1) */
      rest = Math.max(0, rest);
      const exakt = rest >= TAK && restVid(utrymmeFor(p, P.KS_BAND[0])) >= TAK;   /* "50 000 kr" bara om det håller i Österåker (28,93 %) */
      if (!exakt) { rest = Math.round(rest / 1000) * 1000; nagonCa = true; }
      summa += rest;
    }

    const ni = antal > 1;
    if (summa === 0 && anvantTot > 0) noter.push(`${ni ? 'Ni' : 'Du'} har redan använt hela årets ${namn}.`);
    else if (summa === 0 && nagonInkomst) noter.push(lon66
      ? `Från 66 år är skatten på en lön som din så låg att inget blir kvar att dra ${namn}et från. Har du också pension, välj Båda.`
      : `${ni ? 'Er' : 'Din'} skatt ser inte ut att räcka till något ${namn} i år.`);
    if (forMycket > 0) {
      const fm = Math.max(1000, Math.round(forMycket / 1000) * 1000);
      noter.push(`${ni ? 'Ni' : 'Du'} har ${summa === 0 && anvantTot > 0 ? 'dessutom ' : ''}använt ca ${kr(fm)} mer än skatten räcker till. Den delen kan Skatteverket kräva tillbaka i deklarationen.`);
    }
    if (summa === 0) return { status: 'belopp', belopp: 0, prefix: '', text: kr(0), not: noter.join(' ') || null, per, antal };
    const prefix = nagonTak ? 'upp till' : nagonCa ? 'ca' : '';
    return { status: nagonTak ? 'tak' : 'belopp', belopp: summa, prefix, text: kr(summa), not: noter.join(' ') || null, per, antal };
  }

  /* ---------- kalkylator/v1/app.js som init(root): rad för rad ur källan, avvikelser märkta PAKET ---------- */
  /* Avdragskollen v1 "Två spalter". Svaren in, ett besked ut. All logik ligger i rakna.js ovan; här bara läsning av
     svaren, formatering av fälten, personer som läggs till och rendering av beskedet. Inget lagras, inget skickas. */

  function init(root) {
    if (root.dataset.booted === '1') return;                          /* PAKET: en start per instans */
    root.dataset.booted = '1';
    const $ = (s) => root.querySelector(s);                      /* PAKET: aldrig document-wide; klasser i stället för id:n */
    const kort = root;
    const form = $('.rk__fragor');
    const eyebrow = $('.rk__eyebrow');
    const resultat = $('.rk__resultat');
    const talrad = $('.rk__talrad');
    const prefix = $('.rk__prefix');
    const tal = $('.rk__tal');
    const talenhet = $('.rk__talenhet');
    const per = $('.rk__per');
    const not = $('.rk__not');
    const stopp = $('.rk__stopp');
    const stopptext = $('.rk__stopptext');
    const personer = $('.rk__personer');
    const lagg = $('.rk__lagg .rk__lank');
    const mall = $('template');
    if (!form || !eyebrow || !resultat || !personer || !lagg || !mall) return;   /* PAKET: inert om markupen saknas */

    /* "grön teknik-avdrag" hålls ihop på raden: samma text (textContent oförändrad), men orden ligger i en span
       med white-space: nowrap så varken mellanslaget eller bindestrecket blir en radbrytning. Skriver bara när
       texten faktiskt ändrats (ingen DOM-mutation, ingen uppläsning, i onödan). */
    /* Avdragsnamnet med ändelse ("ROT-avdrag", "ROT-avdraget", "grön teknik-avdrag", "grön teknik-avdraget") hålls ihop
       på raden: Chrome bryter annars efter bindestrecket (research/13 M2). */
    const IHOP = /(grön teknik-avdrag|ROT-avdrag)[a-zåäö]*/g;
    function skriv(el, text) {
      if (el.textContent === text) return false;
      el.replaceChildren();
      let i = 0;
      for (const m of text.matchAll(IHOP)) {
        if (m.index > i) el.append(text.slice(i, m.index));
        const s = document.createElement('span'); s.className = 'rk__ihop'; s.textContent = m[0]; el.append(s);
        i = m.index + m[0].length;
      }
      if (i < text.length) el.append(text.slice(i));
      return true;
    }
    const gom = (el, dolj) => { if (el.hidden !== dolj) el.hidden = dolj; };

    /* PAKET: läget ur data-mode på sektionen (shortcoden sätter det), inte ur ?m=. Ett läge, ett avdrag: aldrig båda.
       Rubriken och sidtiteln skrivs inte om: PHP renderar rätt text från start (research/14 M3). */
    const mode = root.dataset.mode === 'gt' ? 'gt' : 'rot';
    kort.dataset.mode = mode;
    const NAMN = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';

    /* PAKET: radionamnen bär instansens prefix (ak1-ager, ak1-typ-2 ...); prefixet läses ur markupen och sökningen stannar i formuläret */
    const pre = (form.querySelector('input[type="radio"][name$="ager"]') || { name: 'ager' }).name.slice(0, -'ager'.length);
    const val = (name, rot = form) => (rot.querySelector(`input[name="${pre}${name}"]:checked`) || {}).value;

    /* Kort intoning när beskedet byts (aldrig på första renderingen, aldrig count-up) */
    let forsta = true;
    function tona(el) {
      if (forsta) return;
      el.classList.remove('is-swap');
      void el.offsetWidth;
      el.classList.add('is-swap');
    }

    /* Personerna: person 1 står i HTML:en, fler klonas ur mallen med löpnummer. Etiketterna numreras om när någon tas
       bort så det alltid står Person 1 .. N. Ett hushåll har högst MAX_PERSONER. */
    let lopnummer = 1;
    function block() { return [...personer.querySelectorAll('.rk__person')]; }
    function numrera() {
      const alla = block();
      alla.forEach((b, i) => {
        b.dataset.person = String(i + 1);
        b.querySelector('.rk__personetikett').textContent = `Person ${i + 1}`;
      });
      personer.dataset.antal = String(alla.length);
      gom(lagg.parentElement, alla.length >= MAX_PERSONER);
    }
    function laggTill() {
      const n = ++lopnummer;
      /* Klona mallen och byt varje "-N" i id/for/name/aria-* mot löpnumret, även när ett attribut bär två id:n
         (t.ex. aria-labelledby="rk-person-etikett-N rk-inkomst-etikett-N"). Strängbyte på innerHTML täckte inte det (research/14 M4). */
      const b = mall.content.firstElementChild.cloneNode(true);
      for (const el of [b, ...b.querySelectorAll('*')]) {
        for (const a of ['id', 'for', 'name', 'aria-labelledby', 'aria-describedby']) {
          const v = el.getAttribute(a);
          if (v && /-N(\s|$)/.test(v)) el.setAttribute(a, v.replace(/-N(?=\s|$)/g, `-${n}`));
        }
      }
      koppla(b);
      personer.append(b);
      numrera();
      rendera();
      b.querySelector('[data-falt="inkomst"]').focus({ preventScroll: false });
    }
    function taBort(b) {
      const nasta = b.previousElementSibling || personer;
      b.remove();
      numrera();
      rendera();
      (lagg.parentElement.hidden ? nasta.querySelector('[data-falt="inkomst"]') : lagg).focus();
    }
    lagg.addEventListener('click', laggTill);

    /* Person 1:s ålder är frågan ovanför blocken (alder-1), övrigas ligger i blocket (alder-N). Tomma fält = 0. */
    function lasPersoner() {
      return block().map((b) => {
        const n = b.querySelector('input[name*="typ-"]').name.split('-').pop();   /* PAKET: sista ledet, namnet kan ha prefix */
        const falt = (namn) => siffra((b.querySelector(`[data-falt="${namn}"]`) || {}).value);
        const typ = val(`typ-${n}`, b);
        if (b.dataset.typ !== typ) b.dataset.typ = typ;      /* styr pensionsraden ("Båda") i CSS */
        return {
          typ,
          alder: val(`alder-${n}`) || '18-65',
          inkomst: falt('inkomst'),
          pension: falt('pension'),
          ranta: falt('ranta'),
        };
      });
    }

    function rendera() {
      const r = beraknaHushall({
        mode,
        ager: val('ager') === 'ja',
        aldre: val('aldre') === 'ja',
        personer: lasPersoner(),
      });

      const fran = resultat.dataset.status;
      if (fran !== r.status) resultat.dataset.status = r.status;
      let andrat = false;

      skriv(eyebrow, `${r.antal > 1 ? 'Ert' : 'Ditt'} tillgängliga ${NAMN}`);   /* ägarens ordval 2026-09-14: "tillgängliga", inget årtal */

      if (r.status === 'stopp') {
        gom(stopp, false);                              /* synlig först, texten sedan: då läser skärmläsaren upp beskedet */
        andrat = skriv(stopptext, r.text);
        gom(not, true);
      } else {
        gom(stopp, true);
        /* "50 000 kr" ur rakna.js: siffrorna som hero, enheten mindre bredvid (som LED-kalkylatorns kr/år) */
        const m = r.text.match(/^(.*\S)\s(kr)$/);
        const nyttTal = m ? m[1] : r.text;
        if (fran === 'stopp') tal.textContent = '';    /* tillbaka från stoppläget: talet skrivs om även om det är samma, så det läses upp igen */
        andrat = [skriv(prefix, r.prefix), skriv(tal, nyttTal), skriv(talenhet, m ? m[2] : ''), skriv(per, r.per), skriv(not, r.not || '')].some(Boolean);
        tal.classList.toggle('rk__tal--lang', nyttTal.replace(/\D/g, '').length >= 6);   /* sexsiffriga summor (hushåll) i ett mindre steg så raden håller (research/13 m4) */
        gom(prefix, !r.prefix);
        gom(talenhet, !m);
        gom(not, !r.not);
      }

      if (andrat || fran !== r.status) tona(r.status === 'stopp' ? stopp : talrad);
      forsta = false;
    }

    /* Beloppen formateras med mellanslag medan hon skriver. Beskedet räknas om 500 ms efter sista tangenten (annars
       blinkar "ca 0 kr" förbi på 1, 18, 180 ...), och direkt när hon lämnar fältet eller trycker Enter/Klar. */
    let timer = 0;
    const direkt = () => { clearTimeout(timer); timer = 0; rendera(); };
    function koppla(rot) {
      rot.querySelectorAll('.rk__input').forEach((f) => {
        f.addEventListener('input', () => {
          f.value = formatFalt(f.value);
          clearTimeout(timer);
          timer = setTimeout(direkt, 500);
        });
        f.addEventListener('change', direkt);
        f.addEventListener('blur', direkt);
      });
      rot.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', rendera));
      const bort = rot.querySelector('.rk__tabort');
      if (bort) bort.addEventListener('click', () => taBort(rot));
    }
    /* Enter/Klar i ett fält: aldrig en omladdning (formuläret har inget mål), bara räkna om och stäng tangentbordet */
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = document.activeElement;                                   /* PAKET: bara den egna instansens fält */
      if (a && root.contains(a) && a.classList.contains('rk__input')) a.blur();
    });

    koppla(kort);
    rendera();
  }

  function boot() { document.querySelectorAll('.ampy-avdragskollen .rk[data-mode]').forEach(init); }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
