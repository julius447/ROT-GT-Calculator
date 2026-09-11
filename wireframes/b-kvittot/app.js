/**
 * Riktning B "Kvittot": renderare + hydrering. ES-modul.
 * Pure string-renderers (renderPage/renderBank/receiptSections) används både av _build.mjs (statisk index.html,
 * "server-renderat" förvalsläge) och av webbläsaren. Runtime-delen (init) körs bara när `document` finns.
 * Rör aldrig logik/: allt räknas av ../../logik/ui-model.js. Ingen nätverkskod. Bara dataLayer-stubbar.
 * Fixrunda 2026-09-11 (PUNCHLISTA.md): bekräfta-tryck, stämpel, frågeräkning, chips i embed, spann-rader,
 * källrad, CTA-observatör, sektionsvis omrendering med bevarat fokus, motorns nya CTA-former.
 */
import {
  resolveBank, evaluate, resolveTexts, defaultState, effectiveState, encodeState, decodeState,
  formatKr, round100, t, LINKS, PARAMS, GAP_DEFAULTS,
} from '../../logik/ui-model.js';

// ---------------------------------------------------------------------------------------------------
// Strängar som saknas i COPY (kvittots etiketter, stämplarna, remsan, demo-attrappen). Listas i NOTES.md.
// Fakta här: bara satser/tak ur PARAMS och datumet för regelkontrollen (research/05 §3.1).
// ---------------------------------------------------------------------------------------------------
export const LOCAL_COPY = Object.freeze({
  'h1.rot': 'Vad betalar du efter ROT-avdraget?',
  'h1.gt': 'Vad betalar du efter grön teknik-avdraget?',
  'lead': '{n} frågor, sedan står det på kvittot: fullt pris, avdrag, att betala. Uppdateras medan du svarar.',
  'lead.embed': 'Kvittot uppdateras medan du svarar. Inget mejl, ingen inloggning.',
  'kv.caps': 'Så räknas ditt pris',
  'kv.arbetskostnad': 'Arbetskostnad',
  'kv.arbetskostnad.spann': 'antaget {lo} till {hi} % av {belopp}',
  'kv.arbetskostnad.antaget': 'antaget, {andel} % av {belopp}',
  'kv.arbetskostnad.andel': '{andel} % av {belopp}',
  'kv.arbetskostnad.offert': 'från offerten',
  'kv.material': 'Material',
  'kv.material.not': 'ger inget avdrag',
  'kv.avdrag.rot': 'ROT-avdrag på arbetet, 30 %',
  'kv.avdrag.gt': 'Grön teknik {sats} % på arbete och material',
  'kv.avdrag.gt.arbete': 'Grön teknik {sats} % på arbetet',
  'kv.avdrag.sol': 'Grön teknik 15 % på solcellerna',
  'kv.avdrag.batteri': 'Grön teknik 50 % på batteriet',
  'kv.avdrag.alt_rot': 'ROT 30 % på arbetet',
  'kv.gt_utan_sol': 'Grön teknik utan solceller',
  'kv.galler_inte': 'gäller inte',
  'kv.rad.laddbox': 'Laddbox med installation',
  'kv.rad.batteri': 'Batteri med installation',
  'kv.rad.sol': 'Solceller med installation',
  'kv.rad.arbete': 'Installationsarbete',
  'kv.rad.egen': 'Utrustning du köper själv',
  'kv.rad.hyrd': 'Hyrd eller leasad utrustning',
  'kv.rad.elcentral': 'Elcentral, byte eller utbyggnad',
  'kv.elcentral.not': 'ger inte grön teknik, kan ge ROT',
  'kv.arbete_material': 'arbete och material',
  'kv.fastpris': 'fast pris, 97 % räknas som arbete och material',
  'kv.tak_tva': 'Två rader, ett tak: {tak} per person och år',
  'kv.att_betala': 'Att betala efter avdrag',
  'kv.ca': 'ca',
  'kv.till': 'till',
  'kv.ange_belopp': 'Ange vad jobbet kostar',
  'kv.ange_arbete': 'Ange arbetskostnaden',
  'kv.beror_arbete': 'beror på arbetsdelen',
  'kv.kalla': 'Regler: Skatteverket, kontrollerade 2026-09-11. Gäller betalningar 2026.',
  'kv.skv.rot': 'Vill du ha exakt: Skatteverkets Räkna ut rot- och rutavdrag',
  'kv.skv.gt': 'Vad du redan använt i år: Mina skattereduktioner hos Skatteverket',
  'stamp.rot': 'ROT 2026',
  'stamp.gt': 'Grön teknik 2026',
  'stamp.ja': 'Berättigad',
  'stamp.ja.sub': 'preliminärt',
  'stamp.preliminart': 'Preliminärt',
  'stamp.ja_villkor.sub': 'om villkoren stämmer',
  'stamp.ja_men.sub': 'med begränsning',
  'stamp.nej': 'Gäller inte',
  'stamp.troligen.sub': 'troligen',
  'stamp.inte_i_ar': 'Inte i år',
  'stamp.inte_an': 'Inte än',
  'stamp.osaker': 'Osäkert',
  'stamp.osaker.sub': 'vi reder ut det',
  'ui.visa_villkoren': 'Visa villkoren',
  'ui.visa_hela': 'Visa hela kvittot och villkoren',
  'kv.hela': 'Hela kvittot',
  'ui.till_kvittot': 'Till kvittot',
  'ui.lank_kopierad': 'Länk kopierad',
  'ui.oka': 'Öka med {steg} kronor',
  'ui.minska': 'Minska med {steg} kronor',
  'ui.typiska_belopp': 'Typiska belopp',
  'ui.noscript': 'Slå på JavaScript för att räkna på ditt fall.',
  'ui.tabell.caps': 'Så mycket ger ROT på arbetskostnaden',
  'ui.tabell.arbete': 'Arbetskostnad',
  'ui.tabell.avdrag': 'ROT-avdrag',
  'ui.tabell.tak': '(taket)',
  'strip.avdrag': 'avdrag {belopp}',
  'demo.label': 'Demo, ingår inte i verktyget:',
  'demo.rot': 'ROT',
  'demo.laddbox': 'Grön teknik: laddbox',
  'demo.batteri': 'batteri',
  'demo.sol': 'solceller',
  'demo.standalone': 'Fristående sida',
  'demo.embed': 'I artikeln',
  // artikelattrappen: platshållare utan fakta (samma mått som A/C), aldrig påståenden om avdraget
  'art.tag': 'Artikelattrapp (demo, inte verktyget)',
  'art.img': 'Bild, 230 px',
  'art.h1': 'Artikelns rubrik på två rader, platshållare för artikeln om avdraget',
  'art.p1': 'Här ligger artikelns ingress. Två stycken som ställer läsarens fråga och lovar ett svar innan verktyget tar vid. Platshållartext utan fakta, satt i samma mått som mallen.',
  'art.p2': 'Andra ingresstycket. Det bär inga siffror och inga påståenden, det finns bara här för att verktyget ska hamna på rätt höjd, ungefär 640 px ner på en mobil.',
  'art.snabb.h': 'Snabbfakta',
  'art.snabb.1': 'Här börjar artikelns brödtext. Platshållare utan fakta, första stycket.',
  'art.snabb.2': 'Andra stycket, i samma längd som ett riktigt stycke i artikeln.',
  'art.snabb.3': 'Tredje stycket, så att höjden efter verktyget går att mäta.',
});
export const L = (key, params) => {
  const s = LOCAL_COPY[key];
  if (s === undefined) return key;
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined || params[k] === null ? m : String(params[k])));
};

// ---------------------------------------------------------------------------------------------------
// Hjälpare
// ---------------------------------------------------------------------------------------------------
// esc: HTML-escape + typografi: siffra och procenttecken hålls ihop ("60 %" bryts aldrig över rad).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])).replace(/(\d) %/g, '$1\u00a0%');
const NBSP = formatKr(1000).charAt(1); // samma tecken som motorn använder i "1 000 kr"
const num = (n) => String(Math.round(Math.abs(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP); // "30 000"
const kr100 = (n) => formatKr(round100(n));
const SKATT_DJUP_IDS = new Set(['inkomsttyp', 'manadsinkomst', 'lon_manad', 'pension_manad', 'fyllt66', 'ranteutgifter_ar', 'kommunalskatt', 'gt_planerad_kr', 'inkomsttyp_2', 'manadsinkomst_2', 'fyllt66_2']);
// Embed (i artikeln): värdeår + skatt (och värdeårets följdfråga arbetstyp) ligger bakom Fler detaljer så att
// verktyget håller höjdbudgeten; deras antaget-rader i kvittot är klickbara och öppnar fällraden (GRANSKNING B-M3).
// Samma princip för GT:s ägarfråga (batteri/sol): taknoten "slår i" i avdragsraden pekar dit när det spelar roll.
const EMBED_FOLD = new Set(['vardear', 'arbetstyp', 'skatt', 'agare']);
const isFolded = (q, compact) => !!q.folded || (compact && EMBED_FOLD.has(q.id));
const N_ORD = { 1: 'En', 2: 'Två', 3: 'Tre', 4: 'Fyra', 5: 'Fem', 6: 'Sex', 7: 'Sju', 8: 'Åtta', 9: 'Nio' };
/** Ingressen räknar de synliga huvudfrågorna (B-M2): "{n} frågor, sedan står det på kvittot ...". Embed: utan siffra. */
export function leadFromBank(bank, surface) {
  if (surface === 'embed') return L('lead.embed');
  const n = bank.filter((q) => q.shown && !isFolded(q, false)).length;
  return L('lead', { n: N_ORD[n] || String(n) });
}
const evalOpts = (surface) => (surface === 'embed' ? { src: 'artikel' } : {}); // offert-länken bär src=artikel i embed (05 §6)

// De sex radtillstånden + reglageikoner, ritade inline (1,5 till 2 px stroke). Inga ikonbibliotek.
const ICON = {
  ok: '<svg class="i-ok" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="M6.8 11.3l2.9 2.9 5.6-5.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  antaget: '<svg class="i-antaget" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="9.25" stroke="currentColor" stroke-width="1.75"/></svg>',
  okand: '<svg class="i-okand" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="M8.6 8.9a2.5 2.5 0 1 1 3.6 2.25c-.8.4-1.2.9-1.2 1.75" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="11" cy="15.6" r="1.05" fill="currentColor"/></svg>',
  varning: '<svg class="i-varning" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 3.2 20 18.5H2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M11 8.6v4.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="11" cy="15.9" r="1.05" fill="currentColor"/></svg>',
  stopp: '<svg class="i-stopp" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="M7.6 7.6l6.8 6.8M14.4 7.6l-6.8 6.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  skoter_vi: '<svg class="i-skoter_vi" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M5.2 11.6l3.6 3.6 8-8.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  minus: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3.5 9h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3.5v11M3.5 9h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  link: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.6 2.6 0 0 1 3.7 3.7L10.7 8.2M9 11.5l-1.2 1.2a2.6 2.6 0 0 1-3.7-3.7L5.3 7.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  print: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 6V2.5h7V6M4.5 11h7v2.5h-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2.5 11V7.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1V11" stroke="currentColor" stroke-width="1.5"/></svg>',
};

// ---------------------------------------------------------------------------------------------------
// Frågepanelen (pure). Chips är riktiga radios i båda ytorna (ingen select, B-M3).
// ---------------------------------------------------------------------------------------------------
function isWide(label) { return label.length > 34; }

function chipsHtml(q, value, opts = {}) {
  const options = q.options && q.options.length ? q.options : [{ id: 'true', label: t('toggle.ja') }, { id: 'false', label: t('toggle.nej') }];
  const cur = value === null || value === undefined ? '' : String(value);
  const seg = q.id === 'lage' ? ' chips--seg' : '';
  return `<div class="chips${seg}">${options.map((o) => {
    const on = String(o.id) === cur;
    return `<label class="chip${isWide(o.label) ? ' chip--wide' : ''}${on ? ' is-on' : ''}"><input type="radio" name="${esc(q.id)}" value="${esc(o.id)}"${on ? ' checked' : ''}${opts.describedBy ? ` aria-describedby="${opts.describedBy}"` : ''}><span>${esc(o.label)}${o.help ? `<span class="chip__help">${esc(o.help)}</span>` : ''}</span></label>`;
  }).join('')}</div>`;
}

function amountHtml(q, value, opts = {}) {
  const main = q.id === 'belopp';
  const unit = q.id === 'kommunalskatt' ? '%' : 'kr';
  const v = value === null || value === undefined ? '' : (q.id === 'kommunalskatt' ? String(value).replace('.', ',') : (Number(value) === 0 && main ? '' : num(value)));
  const stepKr = num(q.step || 5000);
  const steppers = main ? `<button type="button" class="amount__btn" data-step="-1" aria-label="${esc(L('ui.minska', { steg: stepKr }))}">${ICON.minus}</button><button type="button" class="amount__btn" data-step="1" aria-label="${esc(L('ui.oka', { steg: stepKr }))}">${ICON.plus}</button>` : '';
  const presets = main && q.presets ? `<div class="presets" role="group" aria-label="${esc(L('ui.typiska_belopp'))}">${q.presets.map((p) => `<button type="button" class="preset${Number(value) === p ? ' is-on' : ''}" data-v="${p}">${formatKr(p)}</button>`).join('')}<button type="button" class="preset" data-v="annat">${esc(t('q.belopp.annat'))}</button></div>` : '';
  return `<div class="amount${main ? '' : ' amount--small'}"><div class="amount__field"><input class="amount__input" id="in-${esc(q.id)}" name="${esc(q.id)}" type="text" inputmode="${q.id === 'kommunalskatt' ? 'decimal' : 'numeric'}" autocomplete="off" enterkeyhint="done" value="${esc(v)}" placeholder="0" aria-labelledby="lg-${esc(q.id)}"${opts.describedBy ? ` aria-describedby="${opts.describedBy}"` : ''}><span class="amount__unit" aria-hidden="true">${unit}</span></div>${steppers}</div>${presets}`;
}

function sliderHtml(q, value, eff) {
  const fallback = q.id === 'arbete' && eff ? eff.arbete_andel : (q.effectiveValue ?? q.min);
  const v = value === null || value === undefined ? fallback : value;
  const pct = ((v - q.min) / (q.max - q.min)) * 100;
  const out = q.id === 'arbete' ? `${v}${NBSP}%` : formatKr(v);
  return `<div class="slider"><input class="range" type="range" id="in-${esc(q.id)}" name="${esc(q.id)}" min="${q.min}" max="${q.max}" step="${q.step}" value="${v}" style="--pct:${pct.toFixed(1)}%" aria-labelledby="lg-${esc(q.id)}"><output class="slider__out" for="in-${esc(q.id)}">${out}</output></div>`;
}

function stepperHtml(q, value) {
  const v = Number(value) || 0;
  const stepKr = num(q.step || 5000);
  return `<div class="stepper"><button type="button" class="amount__btn" data-step="-1" aria-label="${esc(L('ui.minska', { steg: stepKr }))}">${ICON.minus}</button><output class="stepper__out" id="out-${esc(q.id)}" aria-labelledby="lg-${esc(q.id)}">${formatKr(v)}</output><button type="button" class="amount__btn" data-step="1" aria-label="${esc(L('ui.oka', { steg: stepKr }))}">${ICON.plus}</button></div>`;
}

function checkboxHtml(q, value) {
  return `<label class="check"><input type="checkbox" name="${esc(q.id)}"${value ? ' checked' : ''}><span>${esc(q.label)}</span></label>`;
}

export function renderQuestion(q, ropts = {}) {
  const helpId = q.help ? `help-${q.id}` : null;
  const help = q.help ? `<p class="q__help" id="${helpId}">${esc(q.help)}</p>` : '';
  let body;
  const opts = { describedBy: helpId };
  switch (q.widget) {
    case 'chips': case 'toggle': body = chipsHtml(q, q.value === null && q.id !== 'belopp' ? q.effectiveValue : q.value, opts); break;
    case 'amount': body = amountHtml(q, q.id === 'belopp' ? q.effectiveValue : q.value, opts); break;
    case 'slider': body = sliderHtml(q, q.value, ropts.eff); break;
    case 'stepper': body = stepperHtml(q, q.value); break;
    case 'checkbox': body = checkboxHtml(q, q.value); break;
    default: body = '';
  }
  const sub = SKATT_DJUP_IDS.has(q.id) ? ' q--sub' : '';
  const legend = q.widget === 'checkbox' ? `<legend class="q__legend sr" id="lg-${esc(q.id)}">${esc(q.label)}</legend>` : `<legend class="q__legend" id="lg-${esc(q.id)}"><span>${esc(q.label)}</span></legend>`;
  const inner = q.widget === 'checkbox' ? `${legend}${body}${help}` : `${legend}${help}${body}`;
  return `<li class="q${sub}" data-q="${esc(q.id)}" data-widget="${esc(q.widget)}"${q.shown ? '' : ' hidden'}><fieldset class="q__set">${inner}</fieldset></li>`;
}

export function renderBank(mode, state, ropts = {}) {
  const bank = resolveBank(mode, state);
  const compact = !!ropts.compact;
  ropts = { ...ropts, eff: effectiveState(mode, state) };
  const main = bank.filter((q) => !isFolded(q, compact)).map((q) => renderQuestion(q, ropts)).join('');
  const more = bank.filter((q) => isFolded(q, compact)).map((q) => renderQuestion(q, ropts)).join('');
  return `<form class="bank" id="bank" novalidate autocomplete="off"><ol class="bank__list" id="bank-main">${main}</ol><details class="more" id="more"><summary>${esc(t('ui.fler_detaljer'))}</summary><ol class="bank__list" id="bank-more">${more}</ol></details></form>`;
}

// ---------------------------------------------------------------------------------------------------
// Kvittot (pure)
// ---------------------------------------------------------------------------------------------------
/** Stämpeln: "Berättigad" bara vid ett bekräftat ja; villkorat = "Preliminärt" (B-M1). */
function stampModel(mode, r) {
  const top = mode === 'rot' ? L('stamp.rot') : L('stamp.gt');
  let main = L('stamp.nej'); let sub = '';
  if (r.klass === 'ja') { main = L('stamp.ja'); sub = L('stamp.ja.sub'); }
  else if (r.klass === 'ja_villkor') { main = L('stamp.preliminart'); sub = r.headline.key === 'h.ja_men' ? L('stamp.ja_men.sub') : L('stamp.ja_villkor.sub'); }
  else if (r.klass === 'troligen_inte') { main = L('stamp.nej'); sub = L('stamp.troligen.sub'); }
  else if (r.klass === 'nej') { main = r.subtyp === 'inte_i_ar' ? L('stamp.inte_i_ar') : r.subtyp === 'inte_an' ? L('stamp.inte_an') : L('stamp.nej'); }
  else { main = L('stamp.osaker'); sub = L('stamp.osaker.sub'); }
  return { top, main, sub, cls: r.klass };
}

const stripKr = (s) => s.replace(`${NBSP}kr`, '');
/** "ca 13 500 till 22 500 kr" (hundratal, som motorns spann). "ca" bara i beloppskolumnen (B-m6). */
const spanText = (lo, hi, neg = false) => `${neg ? '' : `${L('kv.ca')} `}${stripKr(formatKr(neg ? -round100(lo) : round100(lo)))} ${L('kv.till')} ${formatKr(neg ? -round100(hi) : round100(hi))}`;

/** Kvittots rader ur result.belopp. Returnerar { caps, lines[], total, quiet }. Siffror bara ur result/eff. */
export function receiptModel(mode, r, eff) {
  const b = r.belopp;
  const lines = [];
  let total = null; let quiet = null;
  const attBetala = L('kv.att_betala');
  if (b.state === 'dold') return { caps: null, lines, total, quiet: null, dold: true }; // ett nej utan siffror (UX §3.6)
  const tak = formatKr(b.tak_kr);
  const takNote = b.tak_slar_i ? t('b.tak_slar_i', { tak: formatKr(mode === 'rot' ? PARAMS.ROT_TAK : PARAMS.GT_TAK) }) : null;
  const begr = b.state === 'begransad_skatt' || b.state === 'begransad_pott';
  if (mode === 'rot') {
    const ded = L('kv.avdrag.rot');
    if (b.state === 'tak') {
      lines.push({ key: 'avdrag', cls: 'deduct', label: ded, text: b.rubrik, note: b.bas_text });
      total = { label: attBetala, link: { label: L('kv.ange_belopp'), fraga: 'belopp' } };
      return { caps: L('kv.caps'), lines, total, quiet };
    }
    const arb = b.arbetskostnad_kr ?? eff.arbetskostnad_kr; const tot = b.belopp_kr ?? eff.belopp; const mat = Math.max(0, tot - arb);
    const ca = b.state === 'intervall';
    if (ca) {
      // Intervall (B-M7): arbetskostnad och material som samma spann som avdraget (andel ± INTERVALL_PP), så att
      // 30 % av arbetsspannet är avdragsraden. Samma räkning som motorn (toEngineInput med arbeteAndel).
      const pp = GAP_DEFAULTS.INTERVALL_PP; const andel = Number(b.params.andel);
      const loPct = Math.max(0, andel - pp); const hiPct = Math.min(100, andel + pp);
      const arbLo = Math.round(tot * loPct / 100); const arbHi = Math.round(tot * hiPct / 100);
      lines.push({ key: 'arbete', label: L('kv.arbetskostnad'), text: spanText(arbLo, arbHi), note: L('kv.arbetskostnad.spann', { lo: loPct, hi: hiPct, belopp: formatKr(tot) }) });
      lines.push({ key: 'material', label: L('kv.material'), text: spanText(tot - arbHi, tot - arbLo), note: L('kv.material.not') });
    } else {
      // andelen är antagen (inte vald, ingen arbetskostnad angiven) när motorn räknat spannet men beloppsläget är noll/begränsat
      const assumed = eff.arbete_kr === null && !!(r.raw && r.raw.rot_min);
      const arbNote = eff.arbete_kr !== null ? L('kv.arbetskostnad.offert') : L(assumed ? 'kv.arbetskostnad.antaget' : 'kv.arbetskostnad.andel', { andel: eff.arbete_andel, belopp: formatKr(tot) });
      lines.push({ key: 'arbete', label: L('kv.arbetskostnad'), num: arb, note: arbNote });
      lines.push({ key: 'material', label: L('kv.material'), num: mat, note: L('kv.material.not') });
    }
    if (b.state === 'noll') lines.push({ key: 'avdrag', cls: 'muted', label: ded, text: b.rubrik, note: b.bas_text });
    else if (ca) lines.push({ key: 'avdrag', cls: 'deduct', label: ded, text: spanText(b.avdrag_min_kr, b.avdrag_max_kr, true), note: b.bas_text });
    else lines.push({ key: 'avdrag', cls: 'deduct', label: ded, num: -round100(b.avdrag_kr), note: begr ? b.bas_text : takNote });
    total = ca ? { label: attBetala, text: `${L('kv.ca')} ${stripKr(b.params.att_betala_min)} ${L('kv.till')} ${b.params.att_betala_max}`, ca: true }
      : { label: attBetala, num: round100(b.att_betala_kr) };
    return { caps: L('kv.caps'), lines, total, quiet };
  }
  // ---- grön teknik ----
  const lage = eff.lage;
  const sats = Math.round((PARAMS.GT_RATE[`gt_${lage}`] || 0.5) * 100);
  const installator = eff.material === 'installator';
  if (b.state === 'tak') {
    lines.push({ key: 'avdrag', cls: 'deduct', label: installator ? L('kv.avdrag.gt', { sats }) : L('kv.avdrag.gt.arbete', { sats }), text: b.rubrik, note: b.bas_text });
    total = { label: attBetala, link: { label: L('kv.ange_belopp'), fraga: 'belopp' } };
    return { caps: L('kv.caps'), lines, total, quiet };
  }
  if (b.state === 'alt_rot') {
    if (!eff.belopp_tomt) lines.push({ key: 'pris', label: L('kv.rad.batteri'), num: eff.belopp, note: L('kv.arbete_material') });
    lines.push({ key: 'gt', cls: 'muted', label: L('kv.gt_utan_sol'), text: L('kv.galler_inte') });
    if (b.rot_avdrag_kr !== null && b.rot_avdrag_kr !== undefined) {
      lines.push({ key: 'avdrag', cls: 'deduct', label: L('kv.avdrag.alt_rot'), num: -round100(b.rot_avdrag_kr), note: b.bas_text });
      total = { label: attBetala, num: round100(b.att_betala_kr) };
    } else {
      lines.push({ key: 'avdrag', cls: 'deduct', label: L('kv.avdrag.alt_rot'), link: { label: L('kv.ange_arbete'), fraga: 'arbete_kr' }, note: b.bas_text });
      total = { label: attBetala, text: L('kv.beror_arbete'), muted: true };
    }
    return { caps: L('kv.caps'), lines, total, quiet };
  }
  const rows = b.rader || [];
  const tillagg = lage === 'laddbox' ? Number(eff.tillagg_elcentral_kr) || 0 : 0;
  if (rows.length === 2) {
    lines.push({ key: 'sol', label: L('kv.rad.sol'), num: rows[0].underlag_kr, note: L('kv.arbete_material') });
    lines.push({ key: 'batt', label: L('kv.rad.batteri'), num: rows[1].underlag_kr, note: L('kv.arbete_material') });
    lines.push({ key: 'avdrag_sol', cls: 'deduct', label: L('kv.avdrag.sol'), num: -round100(rows[0].avdrag_kr) });
    lines.push({ key: 'avdrag', cls: 'deduct', label: L('kv.avdrag.batteri'), num: -round100(rows[1].avdrag_kr), note: begr ? b.bas_text : (takNote || L('kv.tak_tva', { tak })) });
  } else {
    const rad = rows[0] || { underlag_kr: b.underlag_kr, avdrag_kr: b.avdrag_kr };
    const pris = b.belopp_kr ?? eff.belopp;
    if (installator) lines.push({ key: 'pris', label: L(`kv.rad.${lage}`), num: pris, note: eff.fastpris ? L('kv.fastpris') : L('kv.arbete_material') });
    else {
      lines.push({ key: 'arbete', label: L('kv.rad.arbete'), num: rad.underlag_kr ?? (eff.arbete_kr || 0) });
      lines.push({ key: 'utrustning', label: eff.material === 'leasing' ? L('kv.rad.hyrd') : L('kv.rad.egen'), num: Math.max(0, pris - (rad.underlag_kr ?? (eff.arbete_kr || 0))), note: L('kv.material.not') });
    }
    if (tillagg > 0) lines.push({ key: 'elcentral', label: L('kv.rad.elcentral'), num: tillagg, note: L('kv.elcentral.not') });
    const ded = installator ? L('kv.avdrag.gt', { sats }) : L('kv.avdrag.gt.arbete', { sats });
    if (b.state === 'noll') lines.push({ key: 'avdrag', cls: 'muted', label: ded, text: b.rubrik, note: b.bas_text });
    else lines.push({ key: 'avdrag', cls: 'deduct', label: ded, num: -round100(b.avdrag_kr), note: begr ? b.bas_text : (eff.fastpris ? b.bas_text : takNote) });
  }
  total = { label: attBetala, num: round100(b.att_betala_kr) };
  return { caps: L('kv.caps'), lines, total, quiet };
}

function lineHtml(ln) {
  const cls = ln.cls ? ` line--${ln.cls}` : '';
  let amt;
  if (ln.link) amt = `<span class="line__amt"><button type="button" class="line__link" data-fraga="${esc(ln.link.fraga)}">${esc(ln.link.label)}</button></span>`;
  else if (typeof ln.num === 'number') amt = `<span class="line__amt" data-key="${esc(ln.key)}" data-num="${ln.num}">${esc(formatKr(ln.num))}</span>`;
  else amt = `<span class="line__amt${ln.cls === 'muted' ? ' line__amt--muted' : ''}">${esc(ln.text || '')}</span>`;
  return `<div class="line${cls}" data-line="${esc(ln.key)}"><span class="line__label">${esc(ln.label)}</span><span class="line__lead" aria-hidden="true"></span>${amt}${ln.note ? `<span class="line__note">${esc(ln.note)}</span>` : ''}</div>`;
}

function totalHtml(tl) {
  let amt;
  if (tl.link) amt = `<span class="total__amt total__amt--ca"><button type="button" class="line__link" data-fraga="${esc(tl.link.fraga)}">${esc(tl.link.label)}</button></span>`;
  else if (typeof tl.num === 'number') amt = `<span class="total__amt" data-key="total" data-num="${tl.num}">${esc(formatKr(tl.num))}</span>`;
  else amt = `<span class="total__amt${tl.ca || tl.muted ? ' total__amt--ca' : ''}">${esc(tl.text)}</span>`;
  return `<div class="total"><span class="total__label">${esc(tl.label)}</span>${amt}${tl.note ? `<span class="total__note">${esc(tl.note)}</span>` : ''}</div>`;
}

function villkorHtml(v) {
  const word = v.status === 'antaget' ? ` <em class="srow__word">(${esc(t('ui.antaget'))})</em>` : '';
  const inner = `${ICON[v.status] || ICON.antaget}<span>${esc(v.text)}${word}</span>`;
  const btn = v.fraga ? `<button type="button" class="srow__btn" data-fraga="${esc(v.fraga)}">${inner}</button>` : `<div class="srow__btn">${inner}</div>`;
  return `<li class="srow srow--${esc(v.status)} srow--${esc(v.typ)}">${btn}</li>`;
}

/**
 * CTA per klass (UX §5.2): solid knapp bara där primary.solid är true. Motorns former:
 * lage_byte solid (batteri utan sol → ROT) eller som textlänk (sol → batteri, solid: false); sekundär tel med numret
 * i fetstil; sekundär offert/Skatteverket som textlänk under knappen (skatten räcker delvis, osäkert).
 */
function ctaHtml(r) {
  const p = r.cta.primary; const s = r.cta.secondary;
  const parts = [];
  const trackAttr = (kind) => ` data-cta="${esc(kind)}"`;
  if (p && p.kind !== 'none') {
    if (p.kind === 'lage_byte') parts.push(`<button type="button" class="${p.solid ? 'btn btn--primary' : 'cta__link'}" data-byte="1"${trackAttr(p.kind)}>${esc(p.label)}</button>`);
    else if (p.solid) parts.push(`<a class="btn btn--primary" href="${esc(p.href)}"${trackAttr(p.kind)}>${esc(p.label)}</a>`);
    else parts.push(`<a class="cta__link" href="${esc(p.href)}"${trackAttr(p.kind)}>${esc(p.label)}</a>`);
  }
  if (s) {
    if (s.kind === 'tel') {
      const tel = s.params && s.params.tel ? s.params.tel : LINKS.tel_text;
      const label = esc(s.label).replace(esc(tel), `<strong>${esc(tel)}</strong>`);
      parts.push(`<a class="cta__sec" href="${esc(s.href)}"${trackAttr('tel')}><span>${label}</span></a>`); // en span: inline-flex får inte äta mellanslaget före numret
    } else if (!p || p.kind === 'none') parts.push(`<a class="cta__link" href="${esc(s.href)}"${trackAttr(s.kind)}>${esc(s.label)}</a>`);
    else parts.push(`<a class="cta__sec cta__sec--link" href="${esc(s.href)}"${trackAttr(s.kind)}>${esc(s.label)}</a>`);
  }
  return `<div class="cta" id="kv-cta"${parts.length ? '' : ' hidden'}>${parts.join('')}</div>`;
}

function shareHtml(surface) {
  const print = surface === 'embed' ? '' : `<button type="button" class="share__btn" data-share="print">${ICON.print}${esc(t('ui.skriv_ut'))}</button>`;
  return `<div class="share" id="kv-share"><button type="button" class="share__btn" data-share="link">${ICON.link}${esc(t('ui.kopiera_lank'))}</button>${print}<span class="share__status" role="status" aria-live="polite" id="share-status"></span></div>`;
}

function metodHtml(mode, r, open) {
  const link = mode === 'rot' ? `<a href="${esc(LINKS.skatteverket_rot_rut)}" rel="noopener">${esc(L('kv.skv.rot'))}</a>` : `<a href="${esc(LINKS.skatteverket_mina_avdrag)}" rel="noopener">${esc(L('kv.skv.gt'))}</a>`;
  return `<details class="metod" id="kv-metod"${open ? ' open' : ''}><summary>${esc(t('ui.sa_har_vi_raknat'))}</summary><ol>${r.metod_text.map((m) => `<li>${esc(m)}</li>`).join('')}<li>${link}</li></ol></details>`;
}

function noscriptHtml() {
  // Statisk beloppstabell (UX §6.4), räknad av motorn: arbetskostnad -> ROT-avdrag, taket markerat.
  const rows = [10000, 20000, 50000, 100000, 200000].map((x) => {
    const r = evaluate('rot', { ...defaultState('rot'), belopp: x, arbete_kr: x }, ['boende', 'vardear', 'skatt']);
    const a = r.belopp.avdrag_kr;
    return `<tr><td>${esc(formatKr(x))}</td><td>${esc(formatKr(a))}${a >= PARAMS.ROT_TAK ? ` ${esc(L('ui.tabell.tak'))}` : ''}</td></tr>`;
  }).join('');
  return `<noscript id="kv-noscript"><div class="nojs"><p>${esc(L('ui.noscript'))}</p><p class="kv__caps">${esc(L('ui.tabell.caps'))}</p><table><thead><tr><th>${esc(L('ui.tabell.arbete'))}</th><th>${esc(L('ui.tabell.avdrag'))}</th></tr></thead><tbody>${rows}</tbody></table></div></noscript>`;
}

/**
 * Kvittots innehåll som sektioner [{ id, html }] (inuti <section class="kv">). Varje sektion har ett stabilt id och
 * finns alltid (tom = hidden), så att webbläsaren kan byta bara de sektioner vars HTML ändrats (B-m3).
 * opts: { surface, openMetod, openFold, titleTag }
 */
export function receiptSections(mode, r, eff, opts = {}) {
  const surface = opts.surface || 'standalone';
  const compact = surface === 'embed';
  const st = stampModel(mode, r);
  const m = receiptModel(mode, r, eff);
  const H = opts.titleTag || 'h2';
  const C = H === 'h2' ? 'h3' : 'h4'; // kortets mellanrubriker en nivå under kortets rubrik (B-m5)
  const caps = (txt) => `<${C} class="kv__caps">${esc(txt)}</${C}>`;
  const head = `<div class="kv__head" id="kv-head"><p class="kv__eyebrow">${esc(r.eyebrow)}</p><div class="stamp stamp--${esc(st.cls)}" aria-hidden="true"><span class="stamp__top">${esc(st.top)}</span><span class="stamp__main">${esc(st.main)}</span>${st.sub ? `<span class="stamp__sub">${esc(st.sub)}</span>` : ''}</div><${H} class="kv__title" id="kv-h">${esc(r.headline.text)}</${H}><p class="kv__ram">${esc(r.ram.text)}</p></div>`;
  const isCore = (ln) => ln.cls === 'deduct' || ln.cls === 'muted';
  const visibleLines = compact ? m.lines.filter(isCore) : m.lines;
  const foldedLines = compact ? m.lines.filter((ln) => !isCore(ln)) : [];
  const source = `<p class="kv__source" id="kv-source">${esc(L('kv.kalla'))}</p>`; // källa + datum synlig under beloppet (05 §3.1, B-M8)
  const lines = m.dold
    ? `<div class="kv__lines kv__lines--dold" id="kv-lines">${source}</div>`
    : `<div class="kv__lines" id="kv-lines">${caps(m.caps)}<div class="lines">${visibleLines.map(lineHtml).join('')}</div>${m.total ? totalHtml(m.total) : ''}${source}</div>`;
  const baseLines = foldedLines.length ? `<div class="kv__base">${caps(L('kv.hela'))}<div class="lines">${foldedLines.map(lineHtml).join('')}</div></div>` : '';
  const stamps = `<ul class="stamps" id="kv-stamps">${r.villkor.map(villkorHtml).join('')}</ul>`;
  const next = `<div class="next" id="kv-next"${r.nasta_steg.length ? '' : ' hidden'}>${r.nasta_steg.length ? `${caps(t('ui.vad_hander_nu'))}<ol>${r.nasta_steg.map((s) => `<li>${esc(s.text)}</li>`).join('')}</ol>` : ''}</div>`;
  const cta = ctaHtml(r);
  const share = shareHtml(surface);
  const metod = metodHtml(mode, r, opts.openMetod);
  const secs = [{ id: 'kv-head', html: head }, { id: 'kv-lines', html: lines }];
  if (compact) {
    secs.push({ id: 'kv-cta', html: cta });
    secs.push({ id: 'kv-fold', html: `<details class="kv__fold" id="kv-fold"${opts.openFold ? ' open' : ''}><summary>${esc(L('ui.visa_hela'))}</summary>${baseLines}${stamps}${next}${share}${metod}</details>` });
  } else {
    secs.push({ id: 'kv-stamps', html: stamps }, { id: 'kv-next', html: next }, { id: 'kv-cta', html: cta }, { id: 'kv-share', html: share }, { id: 'kv-metod', html: metod });
  }
  secs.push({ id: 'kv-noscript', html: noscriptHtml() });
  return secs;
}
export function renderReceipt(mode, r, eff, opts = {}) { return receiptSections(mode, r, eff, opts).map((s) => s.html).join(''); }

// ---------------------------------------------------------------------------------------------------
// Hela sidan (pure), används av _build.mjs. Ger ROT + fristående som statisk fallback.
// ---------------------------------------------------------------------------------------------------
export function renderPage({ mode = 'rot', surface = 'standalone', state = null, touched = [] } = {}) {
  const st = state || defaultState(mode);
  const r = resolveTexts(evaluate(mode, st, touched, evalOpts(surface)));
  const eff = effectiveState(mode, st);
  const H = surface === 'embed' ? 'h2' : 'h1';
  const K = surface === 'embed' ? 'h3' : 'h2';
  const lead = leadFromBank(resolveBank(mode, st), surface);
  const demo = `<nav class="demo" aria-label="Demo"><strong>${esc(L('demo.label'))}</strong><a href="?m=rot">${esc(L('demo.rot'))}</a><a href="?m=gt&amp;l=laddbox">${esc(L('demo.laddbox'))}</a><a href="?m=gt&amp;l=batteri">${esc(L('demo.batteri'))}</a><a href="?m=gt&amp;l=sol">${esc(L('demo.sol'))}</a><span aria-hidden="true">|</span><a href="?m=rot&amp;surface=standalone">${esc(L('demo.standalone'))}</a><a href="?m=rot&amp;surface=embed">${esc(L('demo.embed'))}</a></nav>`;
  const art = `<div class="art" id="art" hidden><p class="kv__caps" style="color:var(--ink-faint)">${esc(L('art.tag'))}</p><div class="art__img" aria-hidden="true">${esc(L('art.img'))}</div><h1>${esc(L('art.h1'))}</h1><p>${esc(L('art.p1'))}</p><p>${esc(L('art.p2'))}</p></div>`;
  const artAfter = `<div class="art art--after" id="art-after" hidden><h2>${esc(L('art.snabb.h'))}</h2><div class="snabb"><p>${esc(L('art.snabb.1'))}</p><p>${esc(L('art.snabb.2'))}</p><p>${esc(L('art.snabb.3'))}</p></div></div>`;
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Avdragskollen, riktning B: Kvittot</title>
<link rel="stylesheet" href="styles.css">
</head>
<body data-mode="${esc(mode)}" data-surface="${esc(surface)}">
${demo}
<div class="page" id="page">
${art}
<section class="ak" id="ak" aria-labelledby="ak-h">
  <header class="ak__head"><${H} class="ak__title" id="ak-h">${esc(L(`h1.${mode}`))}</${H}><p class="ak__lead">${esc(lead)}</p></header>
  <div class="ak__grid">
    <div class="inputs" id="inputs">${renderBank(mode, st, { compact: surface === 'embed' })}</div>
    <div class="result" id="result"><section class="kv" id="kv" aria-labelledby="kv-h">${renderReceipt(mode, r, eff, { surface, titleTag: K })}</section><p class="ak__disclaimer">${esc(r.disclaimer)}</p></div>
  </div>
</section>
${artAfter}
</div>
<div class="strip is-off" id="strip" hidden><div class="strip__txt"><span class="strip__verdict" id="strip-verdict"></span><span class="strip__amt" id="strip-amt"></span></div><a class="strip__btn" id="strip-btn" href="#kv">${esc(L('ui.till_kvittot'))}</a></div>
<div class="sr" role="status" aria-live="polite" id="live"></div>
<script type="module" src="app.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------------------
// Runtime (bara i webbläsaren)
// ---------------------------------------------------------------------------------------------------
function track(event, props) {
  try { if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: `ampy_ak_${event}`, ...props }); } catch { /* stub */ }
}
const bucket = (kr) => (kr < 10000 ? '<10k' : kr < 25000 ? '10k_25k' : kr < 50000 ? '25k_50k' : kr < 100000 ? '50k_100k' : '100k_plus');

/** Nyckel för att hitta samma reglage igen efter att en sektion i kvittot bytts ut (fokus bevaras, B-m3). */
function focusKey(el) {
  const b = el.closest('[data-fraga],[data-cta],[data-share],[data-byte],summary');
  if (!b) return null;
  if (b.dataset.fraga) return `[data-fraga="${b.dataset.fraga}"]`;
  if (b.dataset.byte) return '[data-byte]';
  if (b.dataset.cta) return `[data-cta="${b.dataset.cta}"]`;
  if (b.dataset.share) return `[data-share="${b.dataset.share}"]`;
  if (b.tagName === 'SUMMARY' && b.parentElement && b.parentElement.id) return `#${b.parentElement.id} > summary`;
  return null;
}

function init() {
  const qs = new URLSearchParams(location.search);
  const surface = qs.get('surface') === 'embed' ? 'embed' : 'standalone';
  const compact = surface === 'embed';
  const link = decodeState(location.search);
  let mode = link.mode || 'rot';
  let state = { ...defaultState(mode), ...link.state };
  const prefilled = new Set(link.prefilled);
  let touched = new Set();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const inputs = $('#inputs'); const kv = $('#kv'); const live = $('#live'); const strip = $('#strip');
  const prevNums = new Map();
  const lastHtml = new Map();
  let lastKlass = null; let interacted = false; let kvVisible = true; let ctaVisible = true; let kvPassed = false;
  let result = null;

  document.body.dataset.mode = mode; document.body.dataset.surface = surface;
  for (const a of document.querySelectorAll('.demo a')) {
    const u = new URLSearchParams(a.getAttribute('href').replace(/^\?/, ''));
    const sameMode = (u.get('m') || 'rot') === mode && (mode === 'rot' || (u.get('l') || 'laddbox') === (state.lage || 'laddbox'));
    const sameSurface = (u.get('surface') || 'standalone') === surface;
    if (u.has('surface') ? sameSurface : sameMode) a.setAttribute('aria-current', 'true');
    // demo-länkarna bevarar den andra dimensionen
    if (!u.has('surface') && surface === 'embed') a.setAttribute('href', `${a.getAttribute('href')}&surface=embed`);
    if (u.has('surface') && mode === 'gt') a.setAttribute('href', `?m=gt&l=${state.lage || 'laddbox'}&surface=${u.get('surface')}`);
  }
  if (surface === 'embed') { $('#art').hidden = false; $('#art-after').hidden = false; }

  // ---- render ----
  function compute() {
    result = resolveTexts(evaluate(mode, state, touched, evalOpts(surface)));
    return result;
  }
  function paintBank() { inputs.innerHTML = renderBank(mode, state, { compact }); }
  function paintLead(bank) {
    const lead = $('.ak__lead'); if (!lead) return;
    const txt = leadFromBank(bank || resolveBank(mode, state), surface);
    if (lead.textContent !== txt) lead.textContent = txt;
  }
  function paintHead() {
    const H = surface === 'embed' ? 'h2' : 'h1';
    const head = $('.ak__head');
    head.innerHTML = `<${H} class="ak__title" id="ak-h">${esc(L(`h1.${mode}`))}</${H}><p class="ak__lead"></p>`;
    paintLead();
  }
  function paintReceipt(animate) {
    const r = compute();
    const eff = effectiveState(mode, state);
    const openMetod = $('#kv-metod') ? $('#kv-metod').open : false;
    const openFold = $('#kv-fold') ? $('#kv-fold').open : false;
    const K = surface === 'embed' ? 'h3' : 'h2';
    const title = $('.kv__title');
    const titleChanged = title && title.textContent !== r.headline.text;
    // sektionsvis byte: bara sektioner vars HTML ändrats (fokus, dela-status och count-up överlever), B-m3
    const active = document.activeElement;
    const key = active && kv.contains(active) ? focusKey(active) : null;
    let ctaChanged = false;
    for (const s of receiptSections(mode, r, eff, { surface, openMetod, openFold, titleTag: K })) {
      if (lastHtml.get(s.id) === s.html) continue;
      const tpl = document.createElement('template'); tpl.innerHTML = s.html;
      const node = tpl.content.firstElementChild; const old = document.getElementById(s.id);
      if (old) old.replaceWith(node); else kv.appendChild(node);
      lastHtml.set(s.id, s.html);
      if (s.id === 'kv-cta') ctaChanged = true;
    }
    if (key && document.activeElement !== active) { const again = kv.querySelector(key); if (again) again.focus({ preventScroll: true }); }
    $('.ak__disclaimer').textContent = r.disclaimer;
    if (animate && titleChanged && !reduced) { const tt = $('.kv__title'); tt.classList.add('is-swap'); requestAnimationFrame(() => requestAnimationFrame(() => tt.classList.remove('is-swap'))); }
    // count-up på belopp, bara vid ändring (aldrig på load)
    for (const el of kv.querySelectorAll('[data-num]')) {
      const key2 = el.dataset.key; const n = Number(el.dataset.num);
      const prev = prevNums.get(key2);
      if (animate && !reduced && prev !== undefined && prev !== n) tween(el, prev, n);
      prevNums.set(key2, n);
    }
    announce(r);
    if (ctaChanged) watchCta();
    paintStrip(r);
    if (r.klass !== lastKlass) {
      track('verdict', { mode, lage: r.lage, surface, class: r.klass, subtype: r.subtyp, amount_bucket: r.belopp.avdrag_kr ? bucket(r.belopp.avdrag_kr) : null, unknowns_n: r.counts.okanda, assumed_n: r.counts.antagna });
      lastKlass = r.klass;
    }
    return r;
  }
  function tween(el, from, to) {
    const t0 = performance.now(); const dur = 280;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (to - from) * e);
      el.textContent = formatKr(p === 1 ? to : v);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  let liveTimer = null;
  function announce(r) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { live.textContent = `${r.headline.text} ${r.belopp.rubrik || ''}`.trim(); }, 600);
  }

  // ---- bank sync (behåller fokus: flyttar bara noder som är fel placerade) ----
  function syncBank() {
    const bank = resolveBank(mode, state);
    const main = $('#bank-main'); const more = $('#bank-more');
    const want = { main: [], more: [] };
    for (const q of bank) {
      const el = inputs.querySelector(`.q[data-q="${q.id}"]`); if (!el) continue;
      el.hidden = !q.shown;
      want[isFolded(q, compact) ? 'more' : 'main'].push(el);
      if (q.id === 'arbete' && q.help) { const h = el.querySelector('.q__help'); if (h) h.textContent = q.help; }
      if (mode === 'gt' && q.id === 'belopp') {
        const lg = el.querySelector('.q__legend span'); if (lg && lg.textContent !== q.label) {
          lg.textContent = q.label;
          const pr = el.querySelector('.presets');
          if (pr) pr.innerHTML = `${q.presets.map((p) => `<button type="button" class="preset${Number(q.effectiveValue) === p ? ' is-on' : ''}" data-v="${p}">${formatKr(p)}</button>`).join('')}<button type="button" class="preset" data-v="annat">${esc(t('q.belopp.annat'))}</button>`;
          const inp = el.querySelector('.amount__input'); if (inp && document.activeElement !== inp) inp.value = q.effectiveValue ? num(q.effectiveValue) : '';
        }
      }
    }
    for (const [container, list] of [[main, want.main], [more, want.more]]) {
      list.forEach((el, i) => { if (container.children[i] !== el) container.insertBefore(el, container.children[i] || null); });
    }
    // förvalens markering
    const bel = inputs.querySelector('.q[data-q="belopp"]');
    if (bel) { const v = effectiveState(mode, state).belopp; for (const p of bel.querySelectorAll('.preset')) p.classList.toggle('is-on', Number(p.dataset.v) === v); }
    paintLead(bank);
  }

  // ---- svar ----
  let answerTimer = null;
  function answer(id, value, opts = {}) {
    state[id] = value; touched.add(id); interacted = true;
    syncBank();
    paintReceipt(true);
    syncUrl();
    clearTimeout(answerTimer);
    const emit = () => track('answer', { mode, lage: state.lage || null, surface, question_id: id, value_bucket: opts.bucket !== undefined ? opts.bucket : (typeof value === 'number' ? bucket(value) : String(value)) });
    if (opts.debounce) answerTimer = setTimeout(emit, 400); else emit();
  }
  function coerce(id, raw) {
    if (raw === 'true') return true; if (raw === 'false') return false;
    if (id === 'agare') return Number(raw);
    return raw;
  }
  function parseAmount(id, str) {
    if (id === 'kommunalskatt') { const v = parseFloat(String(str).replace(',', '.').replace(/[^\d.]/g, '')); return Number.isFinite(v) ? Math.max(25, Math.min(40, v)) : null; }
    const digits = String(str).replace(/\D/g, '');
    if (!digits) return id === 'belopp' ? 0 : null;
    return Math.min(1_000_000, Number(digits));
  }
  /**
   * Bekräfta-trycket (B-B1): ett tryck på en chip når hit både via click (även när chipen redan är vald, då kommer
   * inget change) och via change (byte). Idempotent: samma svar som redan är bekräftat ger varken omräkning eller
   * dubbel tracking. Tab/pil/Space-vägen går via keydown nedan.
   */
  function onRadio(el) {
    const chips = el.closest('.chips');
    if (chips) for (const c of chips.querySelectorAll('.chip')) c.classList.toggle('is-on', c.contains(el));
    const id = el.name; const val = coerce(id, el.value);
    if (touched.has(id) && state[id] === val) return;
    if (id === 'lage') track('mode_select', { mode, from: state.lage, to: val, surface });
    answer(id, val, { bucket: String(el.value) });
  }
  inputs.addEventListener('submit', (e) => e.preventDefault());
  inputs.addEventListener('click', (e) => {
    const el = e.target;
    if (el instanceof HTMLInputElement && el.type === 'radio' && el.checked) onRadio(el);
  });
  inputs.addEventListener('keydown', (e) => {
    const el = e.target;
    if ((e.key === ' ' || e.key === 'Enter') && el instanceof HTMLInputElement && el.type === 'radio' && el.checked) { e.preventDefault(); el.click(); }
  });
  inputs.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('input[type="radio"]')) onRadio(el);
    else if (el.matches('input[type="checkbox"]')) answer(el.name, el.checked, { bucket: String(el.checked) });
  });
  inputs.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('.amount__input')) {
      const id = el.name; const v = parseAmount(id, el.value);
      if (id !== 'kommunalskatt') { const caret = el.selectionStart; const before = el.value; el.value = el.value.replace(/[^\d ]/g, ''); if (before !== el.value) el.setSelectionRange(Math.max(0, caret - 1), Math.max(0, caret - 1)); }
      answer(id, v, { debounce: true, bucket: v === null ? 'tom' : (id === 'kommunalskatt' ? 'angiven' : bucket(v)) });
    } else if (el.matches('.range')) {
      const v = Number(el.value); const q = el.closest('.q').dataset.q;
      el.style.setProperty('--pct', `${(((v - Number(el.min)) / (Number(el.max) - Number(el.min))) * 100).toFixed(1)}%`);
      const out = el.closest('.slider').querySelector('.slider__out'); out.textContent = q === 'arbete' ? `${v}${NBSP}%` : formatKr(v);
      answer(q, v, { debounce: true, bucket: q === 'arbete' ? `${Math.round(v / 10) * 10}` : 'angiven' });
    }
  });
  inputs.addEventListener('focusout', (e) => {
    const el = e.target;
    if (el.matches && el.matches('.amount__input') && el.name !== 'kommunalskatt') { const v = parseAmount(el.name, el.value); el.value = v ? num(v) : ''; }
  });
  inputs.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    const qEl = btn.closest('.q'); const id = qEl && qEl.dataset.q;
    if (btn.matches('.preset')) {
      const inp = qEl.querySelector('.amount__input');
      if (btn.dataset.v === 'annat') { inp.focus(); inp.select(); return; }
      const v = Number(btn.dataset.v); inp.value = num(v); answer(id, v, { bucket: bucket(v) });
    } else if (btn.matches('.amount__btn') && btn.dataset.step) {
      const bank = resolveBank(mode, state); const q = bank.find((x) => x.id === id);
      const stepN = q.step || 5000; const dir = Number(btn.dataset.step);
      const cur = q.widget === 'stepper' ? (Number(state[id]) || 0) : (state[id] === null || state[id] === undefined ? Number(q.effectiveValue) || 0 : Number(state[id]) || 0);
      const next = Math.max(q.min ?? 0, Math.min(q.max ?? 1_000_000, cur + dir * stepN));
      if (q.widget === 'stepper') qEl.querySelector('.stepper__out').textContent = formatKr(next);
      else { const inp = qEl.querySelector('.amount__input'); inp.value = next ? num(next) : ''; }
      answer(id, next, { bucket: bucket(next) });
    }
  });
  const more = () => $('#more');
  inputs.addEventListener('toggle', (e) => { if (e.target.id === 'more' && e.target.open) track('expand', { mode, surface, section: 'fler_detaljer' }); }, true);

  // ---- kvittot ----
  function focusQuestion(id) {
    const el = inputs.querySelector(`.q[data-q="${id}"]`); if (!el || el.hidden) return;
    const m = more(); if (m && m.contains(el) && !m.open) m.open = true;
    const target = el.querySelector('input:checked') || el.querySelector('input, button');
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: isMobile() ? 'center' : 'nearest' });
    if (target) target.focus({ preventScroll: true });
  }
  kv.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fraga]'); if (f) { focusQuestion(f.dataset.fraga); return; }
    const byte = e.target.closest('[data-byte]');
    if (byte) {
      const b = result.cta.primary.byte;
      const from = mode === 'rot' ? 'rot' : `gt_${state.lage}`; const to = b.mode === 'rot' ? 'rot' : `gt_${b.state.lage}`;
      track('mode_select', { mode, from, to, surface }); track('cta_click', { target: 'mode_switch', class: result.klass, mode, surface });
      const keep = new Set([...touched].filter((k) => k in b.state));
      mode = b.mode; state = { ...defaultState(mode), ...b.state }; touched = keep; prevNums.clear();
      document.body.dataset.mode = mode; paintHead(); paintBank(); paintReceipt(false); syncUrl(); kv.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const cta = e.target.closest('[data-cta]');
    if (cta) track('cta_click', { target: cta.dataset.cta, class: result.klass, mode, surface, amount_bucket: result.belopp.avdrag_kr ? bucket(result.belopp.avdrag_kr) : null });
    const sh = e.target.closest('[data-share]');
    if (sh) { if (sh.dataset.share === 'print') { openAll(); window.print(); track('share', { method: 'print', mode, surface }); } else share(); }
  });
  kv.addEventListener('toggle', (e) => {
    if (e.target.id === 'kv-metod' && e.target.open) track('expand', { mode, surface, section: 'sa_har_vi_raknat' });
    if (e.target.id === 'kv-fold' && e.target.open) track('expand', { mode, surface, section: 'visa_villkoren' });
  }, true);
  function openAll() { for (const d of document.querySelectorAll('details')) d.open = true; }
  window.addEventListener('beforeprint', openAll);

  function shareUrl() {
    const base = `${location.origin}${location.pathname}`;
    return `${base}?${encodeState(mode, state, { src: link.src || undefined })}`;
  }
  let shareTimer = null;
  async function share() {
    const url = shareUrl(); const status = $('#share-status');
    try {
      if (navigator.share && isMobile()) { await navigator.share({ url }); track('share', { method: 'native', mode, surface }); return; }
      await navigator.clipboard.writeText(url);
      if (status) status.textContent = L('ui.lank_kopierad');
      clearTimeout(shareTimer); shareTimer = setTimeout(() => { const s = $('#share-status'); if (s) s.textContent = ''; }, 2400);
      track('share', { method: 'clipboard', mode, surface });
    } catch {
      if (status) status.textContent = url;
    }
  }

  // ---- URL (bara fristående) ----
  let urlTimer = null;
  function syncUrl() {
    if (surface !== 'standalone') return;
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      const keep = new URLSearchParams();
      for (const [k, v] of qs) if (/^utm_/.test(k) || k === 'gclid' || k === 'fbclid' || k === 'src') keep.set(k, v);
      const enc = new URLSearchParams(encodeState(mode, state, { src: link.src || undefined }));
      for (const [k, v] of keep) if (!enc.has(k)) enc.set(k, v);
      history.replaceState(null, '', `${location.pathname}?${enc.toString()}`);
    }, 400);
  }

  // ---- sticky-remsan (fristående, mobil) ----
  function paintStrip(r) {
    if (surface !== 'standalone') return;
    $('#strip-verdict').textContent = r.headline.text.replace(/:\s*$/, ''); // hela rubriken (utan avslutande kolon), CSS klipper (B-m1)
    const b = r.belopp; let amt = '';
    if (b.state === 'intervall') amt = L('strip.avdrag', { belopp: `${L('kv.ca')} ${stripKr(b.params.min)} ${L('kv.till')} ${b.params.max}` });
    else if (b.state === 'punkt' || b.state === 'begransad_skatt' || b.state === 'begransad_pott') amt = L('strip.avdrag', { belopp: kr100(b.avdrag_kr) });
    else if (b.state === 'tak' || b.state === 'noll' || b.state === 'alt_rot') amt = b.rubrik;
    $('#strip-amt').textContent = amt;
    const btn = $('#strip-btn'); const p = r.cta.primary;
    if (kvPassed && p && p.solid && p.kind !== 'lage_byte' && p.href) { btn.textContent = p.label; btn.href = p.href; btn.classList.add('strip__btn--primary'); btn.dataset.mirror = '1'; }
    else { btn.textContent = L('ui.till_kvittot'); btn.href = '#kv'; btn.classList.remove('strip__btn--primary'); delete btn.dataset.mirror; }
    updateStrip();
  }
  let stripTimer = null;
  function updateStrip() {
    if (surface !== 'standalone') return;
    // Remsan står aldrig bredvid den synliga CTA:n (B-M5): dold när kortet är >= 50 % synligt ELLER CTA:n syns.
    const show = interacted && !kvVisible && !ctaVisible && isMobile();
    clearTimeout(stripTimer);
    if (show) { strip.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => strip.classList.remove('is-off'))); }
    else { strip.classList.add('is-off'); stripTimer = setTimeout(() => { strip.hidden = true; }, 220); }
  }
  let ctaIo = null;
  function watchCta() {
    if (!ctaIo) return;
    ctaIo.disconnect();
    const c = $('#kv-cta');
    if (c && !c.hidden) ctaIo.observe(c); else { ctaVisible = false; updateStrip(); }
  }
  if (surface === 'standalone') {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) { kvVisible = en.intersectionRatio >= 0.5; kvPassed = en.boundingClientRect.bottom < 0; }
      if (result) paintStrip(result);
    }, { threshold: [0, 0.5, 1] });
    io.observe(kv);
    ctaIo = new IntersectionObserver((entries) => {
      for (const en of entries) ctaVisible = en.isIntersecting && en.intersectionRatio >= 0.5;
      updateStrip();
    }, { threshold: [0, 0.5, 1] });
    const firstQ = inputs.querySelector('.q');
    window.addEventListener('scroll', () => { if (!interacted && firstQ && firstQ.getBoundingClientRect().bottom < 0) { interacted = true; updateStrip(); } }, { passive: true });
    window.addEventListener('resize', updateStrip);
    strip.addEventListener('click', (e) => {
      const btn = e.target.closest('#strip-btn');
      if (btn && !btn.dataset.mirror) { e.preventDefault(); kv.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
      else if (btn) track('cta_click', { target: 'offert', class: result.klass, mode, surface, via: 'strip' });
    });
  }

  // ---- start: hydrera (rot, fristående, inga länksvar) eller rendera om ----
  const hydrateOnly = mode === 'rot' && surface === 'standalone' && prefilled.size === 0;
  if (!hydrateOnly) { paintHead(); paintBank(); kv.innerHTML = ''; } // den statiska filen är ROT + fristående; sektionerna byggs om i rätt ordning
  syncBank();
  const r0 = paintReceipt(false);
  watchCta();
  track('view', { mode, lage: r0.lage, surface, prefilled: prefilled.size > 0, params_n: prefilled.size });
  if (prefilled.size > 0 && isMobile()) kv.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  window.__ak = { get state() { return state; }, get result() { return result; }, get mode() { return mode; }, get touched() { return touched; }, shareUrl };
}

if (typeof document !== 'undefined' && document.getElementById('kv')) init();
