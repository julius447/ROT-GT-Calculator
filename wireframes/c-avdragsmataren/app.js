/**
 * Riktning C, "Avdragsmätaren". Renderare för wireframen (ES-modul).
 *
 * Två roller i samma fil:
 *   1. Rena mallfunktioner (renderTool, renderPage, meterModel) som _build.mjs kör i Node för att skriva
 *      det server-renderade förvalsläget till index.html. Inga DOM-anrop vid import.
 *   2. Hydrering i webbläsaren (init): läser URL:en, binder reglagen, räknar om live och målar om
 *      mätaren, beskedspanelen och CTA:n. Strukturen byts inte ut i förvalsläget (rot, standalone).
 *
 * All logik, alla siffror och alla beskedssträngar kommer ur ../../logik/ui-model.js. Strängar som
 * saknas i COPY och som bara den här riktningen behöver ligger i LOCAL_COPY (listade i NOTES.md).
 */
import {
  BANKS, LINKS, GAP_DEFAULTS, resolveBank, effectiveState, evaluate, resolveTexts, defaultState,
  encodeState, decodeState, toEngineInput, t, formatKr, round100, PARAMS as P,
} from '../../logik/ui-model.js';

// ---------------------------------------------------------------------------------------------------
// Lokala strängar (saknas i COPY, gäller bara riktning C). Inga tankstreck, inga mittpunkter.
// ---------------------------------------------------------------------------------------------------
export const LOCAL_COPY = Object.freeze({
  // verktygets rubrik och lead (COPY har ingen verktygsrubrik; UX §1.5 och 05 §3.1 ger utkasten)
  'c.title.rot': 'Ryms ROT-avdraget i år, och räcker din skatt?',
  'c.title.gt': 'Ryms grön teknik-avdraget i år, och räcker din skatt?',
  'c.lead': 'Beskedet uppdateras medan du svarar. Inget mejl, ingen inloggning.',
  // mätaren
  'c.meter.eyebrow.rot': 'ROT-potten 2026',
  'c.meter.eyebrow.gt': 'Grön teknik-potten 2026',
  'c.meter.cap.1': '{tak} per person och år',
  'c.meter.cap.2': '{tak} för två ägare',
  'c.meter.tax_hit': 'Din skatt räcker hit (ca {kr})',
  'c.meter.tax_hela': 'Din skatt räcker till hela potten (ca {kr})',
  'c.meter.tax_ingen': 'Din skatt räcker inte till avdraget',
  'c.meter.galler_inte': 'Gäller inte i det här läget',
  'c.meter.aria': 'Avdragsmätare: {text}',
  'c.legend.anvant': 'Redan använt',
  'c.legend.jobb': 'Det här jobbet',
  'c.legend.sol': 'Solceller 15 %',
  'c.legend.batteri': 'Batteri 50 %',
  'c.legend.kvarskatt': 'Kan bli kvarskatt',
  'c.legend.ryms_inte': 'Ryms inte i år',
  'c.legend.upp_till': 'upp till {kr}',
  'c.legend.till': '{min} till {max}',
  'c.tick.noll': '0',
  // skattefördjupningen (synlig i riktning C)
  'c.djup.prompt': 'Dra i reglaget så ritar vi in var din skatt räcker.',
  'c.djup.valuetext': 'cirka {kr} kronor i månaden',
  'c.djup.fold': 'Räcker skatten?',
  'c.djup.agare2': 'Ägare 2',
  // hopfällning i embed (UX §6.2), dela, status, sticky
  'c.fold.villkor': 'Visa villkoren',
  'c.ui.lank_kopierad': 'Länk kopierad',
  'c.ui.borja_om': 'Börja om',
  'c.ui.till_beskedet': 'Till beskedet',
  'c.ui.nojs': 'Slå på JavaScript för att räkna på ditt fall.',
  'c.print.rad': 'Utskrivet {datum}. Länk till din uträkning: {url}',
  'c.ui.minska': 'Minska med {steg}',
  'c.ui.oka': 'Öka med {steg}',
  'c.ui.kr': 'kr',
  'c.ui.procent': '%',
  // "Så har vi räknat": statisk tabell (UX §6.4) och källrad (05 §3.1)
  'c.tabell.rot': 'Arbetskostnad och avdrag, 30 % upp till {tak} per person',
  'c.tabell.gt': '{vad} och avdrag, {sats} % upp till {tak} per person',
  'c.tabell.kol1.rot': 'Arbetskostnad',
  'c.tabell.kol1.gt': 'Pris med installation',
  'c.tabell.kol2': 'Avdrag',
  'c.tabell.tak': '{kr} (taket)',
  'c.kalla': 'Regler: Skatteverket, kontrollerade 2026-09-11. Gäller betalningar 2026.',
  'c.skv.rot': 'Räkna ut rot- och rutavdrag hos Skatteverket',
  'c.skv.gt': 'Mina skattereduktioner hos Skatteverket',
  // demo-remsan och artikelattrappen (utanför verktyget)
  'c.demo.namn': 'Riktning C, Avdragsmätaren',
  'c.demo.rot': 'ROT',
  'c.demo.laddbox': 'Laddbox',
  'c.demo.batteri': 'Batteri',
  'c.demo.sol': 'Solceller',
  'c.demo.standalone': 'Fristående',
  'c.demo.embed': 'I artikeln',
  'c.art.bild': 'Bild, 230 px',
  'c.art.h1.rot': 'ROT-avdraget 2026: så fungerar det för elarbeten i hemmet',
  'c.art.h1.gt': 'Grön teknik 2026: avdraget för laddbox, batteri och solceller',
  'c.art.ingress1': 'Platshållare för ingressens första stycke. Två till tre meningar om vad artikeln svarar på, i samma längd som den riktiga ingressen på ampy.se.',
  'c.art.ingress2': 'Platshållare för ingressens andra stycke. Ytterligare två meningar, så att höjden före verktyget landar på ungefär 640 pixlar på mobilen.',
  'c.art.snabbfakta': 'Snabbfakta',
  'c.art.brod': 'Här börjar artikelns brödtext. Verktyget ovanför ska sluta senast vid ungefär 1 540 pixlar på 390 pixlars bredd, så att det här stycket syns inom två skärmar.',
});

/** Strängupplösning: LOCAL_COPY först, sedan COPY via t(). */
function L(key, params) {
  const s = LOCAL_COPY[key];
  if (s === undefined) return t(key, params);
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined || params[k] === null ? m : String(params[k])));
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kr100 = (n) => formatKr(round100(n));
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const pct = (x) => `${(clamp01(x) * 100).toFixed(3)}%`;

// Frågor som hör till skattefördjupningen (renderas synligt i riktning C, aldrig under Fler detaljer)
const DJUP_BAND = new Set(['inkomsttyp', 'manadsinkomst', 'lon_manad', 'pension_manad', 'fyllt66', 'ranteutgifter_ar', 'inkomsttyp_2', 'manadsinkomst_2', 'fyllt66_2']);
const DJUP_ALL = new Set([...DJUP_BAND, 'skatt_djup', 'kommunalskatt', 'gt_planerad_kr']);
// Reglage som ska stå kvar (gråade) vid ett hårt nej i stället för att försvinna (UX §9)
const KEEP_ON_NEJ = new Set(['belopp', 'skatt']);

// ---------------------------------------------------------------------------------------------------
// Mätarens modell: allt i kronor på skalan 0..scale (potten). Ren funktion, testbar i Node.
// ---------------------------------------------------------------------------------------------------
export function meterModel(mode, state, r) {
  const eff = effectiveState(mode, state);
  const b = r.belopp;
  const raw = mode === 'rot' ? r.raw.rot : r.raw.gt;
  const scale = b.tak_kr || (mode === 'rot' ? P.ROT_TAK : P.GT_TAK) * eff.agare;
  const pottKvar = mode === 'rot' ? raw.pott_kvar_kr : raw.tak_kvar_kr;
  const used = Math.max(0, Math.min(scale, scale - pottKvar));
  const inactive = b.state === 'dold' || b.state === 'alt_rot';
  const m = {
    scale, used, pottKvar, inactive, state: b.state, agare: eff.agare,
    jobs: [],            // [{ typ, from, to, kr }] solida fyllningar
    band: null,          // intervall: { from, to } (streckat teal)
    outline: null,       // takläge: { from, to }
    over: 0,             // ryms inte i potten i år (svansen), kr
    tax: null,           // { x, lo, hi, pinned, risk, room, kr }
    gaps: [],
  };
  if (inactive) return m;
  const central = Number(b.avdrag_kr) || 0;
  if (b.state === 'tak') {
    m.outline = { from: used, to: scale };
    return m;
  }
  if (b.state === 'noll') return m;
  // solida jobbsegment (GT sol + batteri = två rader under samma tak)
  let cursor = used;
  const rows = Array.isArray(b.rader) && b.rader.length > 1 ? b.rader : [{ typ: 'jobb', avdrag_kr: central }];
  for (const row of rows) {
    const kr = Math.max(0, Number(row.avdrag_kr) || 0);
    const from = cursor; const to = Math.min(scale, cursor + kr);
    m.jobs.push({ typ: row.typ === 'sol' || row.typ === 'batteri' ? row.typ : 'jobb', from, to, kr });
    cursor = to;
  }
  if (b.state === 'intervall' && b.avdrag_min_kr !== undefined) {
    // solid till min, streckat band min..max (bandet ersätter det solida segmentets övre del)
    const min = Math.max(0, Number(b.avdrag_min_kr) || 0);
    const max = Math.max(min, Number(b.avdrag_max_kr) || 0);
    m.jobs[0].to = Math.min(scale, used + min);
    m.band = { from: Math.min(scale, used + min), to: Math.min(scale, used + max) };
    m.jobs[0].max = max; m.jobs[0].min = min;
  }
  const jobEnd = m.band ? m.band.to : cursor;
  const brutto = Number(b.avdrag_brutto_kr);
  if (Number.isFinite(brutto) && brutto > central) m.over = brutto - central;
  // gaps mellan segment
  if (used > 0 && jobEnd > used) m.gaps.push(used);
  for (let i = 1; i < m.jobs.length; i++) if (m.jobs[i].to > m.jobs[i].from) m.gaps.push(m.jobs[i].from);
  // skattetaket (andra taket) när fördjupningen är ifylld
  const s = r.skatt || {};
  if (eff.skatt_djup && ['ryms', 'ryms_delvis', 'ryms_inte'].includes(s.status) && Number.isFinite(s.utrymme_kr)) {
    let room;
    if (mode === 'rot') {
      const usedTax = (Number(eff.anvant_rot) || 0) + (Number(eff.anvant_rut) || 0);
      const sum = (raw.skatt || []).filter((x) => x && x.status !== 'ej_bedomd').reduce((a, x) => a + (Number(x.utrymme_kr) || 0), 0);
      room = Math.max(0, sum - usedTax);
    } else {
      const inp = toEngineInput('gt', state);
      room = inp.skatt_tillganglig_kr.reduce((a, v, i) => a + (v === null ? 0 : Math.max(0, v - (inp.rot_rut_anvant_kr[i] || 0))), 0);
    }
    const risk = Math.max(0, Number(b.aterbetalningsrisk_kr ?? s.aterbetalningsrisk_kr) || 0);
    let x = risk > 0 ? used + Math.max(0, central - risk) : Math.max(used + central, used + room);
    const lo = Math.max(0, (Number(s.utrymme_kr) || 0) - (Number(s.utrymme_min_kr) || 0));
    const hi = Math.max(0, (Number(s.utrymme_max_kr) || 0) - (Number(s.utrymme_kr) || 0));
    const pinned = x >= scale;
    x = Math.min(scale, x);
    m.tax = { x, lo: Math.max(0, x - lo), hi: Math.min(scale, x + hi), pinned, risk, room, kr: used + room, status: s.status };
    if (risk > 0) m.gaps.push(x);
  }
  return m;
}

// ---------------------------------------------------------------------------------------------------
// Ikoner (inline-SVG, 1,75 px stroke). Sex radtillstånd + kopiera/skriv ut.
// ---------------------------------------------------------------------------------------------------
const ICON = {
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7.5 12.5l3 3 6-6.5" stroke="#fff"/></svg>',
  antaget: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>',
  okand: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.8a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2.9-1.2 1.7"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/></svg>',
  varning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 21 19.5H3z" stroke-linejoin="round"/><path d="M12 9.5v4.5"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/></svg>',
  stopp: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  skoter_vi: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16 9.6"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.4 1.4"/><path d="M14 10a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.4-1.4"/></svg>',
  print: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v6H7z"/></svg>',
  reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/></svg>',
};

// ---------------------------------------------------------------------------------------------------
// Mallar (strängar). Samma funktioner används av _build.mjs (statiskt) och av hydreringen.
// ---------------------------------------------------------------------------------------------------
function ctx(mode, state, touched, surface) {
  const bank = resolveBank(mode, state);
  const result = resolveTexts(evaluate(mode, state, touched));
  const eff = effectiveState(mode, state);
  const meter = meterModel(mode, state, result);
  const hard = result.klass === 'nej';
  return { mode, state, touched, surface, bank, result, eff, meter, hard, embed: surface === 'embed' };
}

/** Är frågan en del av fördjupningsbandet, och ska den synas där just nu (djup antas på)? */
function djupShown(q, eff) {
  if (!DJUP_BAND.has(q.id)) return false;
  const e = { ...eff, skatt_djup: true };
  return q.showWhen ? Boolean(q.showWhen(e)) : true;
}

function displayValue(q, c) {
  const v = c.state[q.id];
  if (q.id === 'belopp') return c.eff.belopp_tomt ? '' : String(c.eff.belopp);
  if (v === null || v === undefined) {
    const e = c.eff[q.id];
    return e === null || e === undefined ? '' : String(e);
  }
  return String(v);
}

function fmtField(n) { return n === '' ? '' : String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

function renderQuestion(q, c) {
  const id = q.id;
  const helpId = q.help ? `help-${id}` : '';
  const describe = helpId ? ` aria-describedby="${helpId}"` : '';
  const disabled = c.hard && KEEP_ON_NEJ.has(id) && !q.shown;
  const dis = disabled ? ' disabled' : '';
  const isGate = Boolean(q.gate);
  let body = '';
  const w = q.widget;
  if (w === 'chips' || (w === 'toggle' && q.options && q.options.length)) {
    const cur = displayValue(q, c);
    const opts = q.options.map((o) => {
      const checked = String(o.id) === cur ? ' checked' : '';
      const oh = o.help ? `<span class="chip__help">${esc(o.help)}</span>` : '';
      return `<label class="chip"><input type="radio" name="${id}" value="${esc(o.id)}"${checked}${dis}${describe}><span class="chip__face">${esc(o.label)}${oh}</span></label>`;
    }).join('');
    body = `<div class="chips${w === 'toggle' ? ' chips--toggle' : ''}">${opts}</div>`;
  } else if (w === 'toggle') {
    // boolesk toggle: två radioknappar Ja / Nej
    const cur = displayValue(q, c) === 'true';
    body = `<div class="chips chips--toggle">
      <label class="chip"><input type="radio" name="${id}" value="true"${cur ? ' checked' : ''}${dis}${describe}><span class="chip__face">${esc(t('toggle.ja'))}</span></label>
      <label class="chip"><input type="radio" name="${id}" value="false"${!cur ? ' checked' : ''}${dis}${describe}><span class="chip__face">${esc(t('toggle.nej'))}</span></label>
    </div>`;
  } else if (w === 'checkbox') {
    const cur = displayValue(q, c) === 'true';
    body = `<label class="check"><input type="checkbox" name="${id}"${cur ? ' checked' : ''}${dis}${describe}><span class="check__box" aria-hidden="true"></span><span>${esc(q.label)}</span></label>`;
  } else if (w === 'slider') {
    const cur = displayValue(q, c);
    const val = Number(cur || q.default || q.min);
    const p = (val - q.min) / (q.max - q.min);
    const isKr = q.max > 1000;
    const shown = isKr ? formatKr(val) : `${val} ${L('c.ui.procent')}`;
    const vt = isKr ? L('c.djup.valuetext', { kr: fmtField(val) }) : `${val} procent`;
    body = `<div class="slider">
      <input type="range" id="in-${id}" name="${id}" min="${q.min}" max="${q.max}" step="${q.step}" value="${val}" style="--p:${pct(p)}" aria-valuetext="${esc(vt)}" aria-labelledby="lg-${id}"${dis}${describe}>
      <output class="slider__out" for="in-${id}">${esc(shown)}</output>
    </div>`;
  } else if (w === 'stepper' || w === 'amount') {
    const cur = displayValue(q, c);
    const step = q.step || 1000;
    const unit = q.id === 'kommunalskatt' ? L('c.ui.procent') : L('c.ui.kr');
    const stepTxt = q.id === 'kommunalskatt' ? `${step} procent` : formatKr(step);
    const presets = q.presets && q.presets.length ? `<div class="presets" role="group" aria-label="${esc(q.label)}">${q.presets.map((pv) => `<button type="button" class="preset${String(pv) === cur ? ' is-on' : ''}" data-preset="${pv}"${dis}>${esc(fmtField(pv))}</button>`).join('')}<button type="button" class="preset preset--annat" data-preset="annat"${dis}>${esc(t('q.belopp.annat'))}</button></div>` : '';
    body = `<div class="amount">
      <button type="button" class="amount__btn" data-step="-1" aria-label="${esc(L('c.ui.minska', { steg: stepTxt }))}"${dis}>&minus;</button>
      <span class="amount__field" data-unit="${esc(unit)}"><input type="text" id="in-${id}" name="${id}" inputmode="${q.id === 'kommunalskatt' ? 'decimal' : 'numeric'}" enterkeyhint="done" autocomplete="off" value="${esc(fmtField(cur))}" aria-labelledby="lg-${id}"${dis}${describe}${q.id === 'belopp' ? ' placeholder="0"' : ''}></span>
      <button type="button" class="amount__btn" data-step="1" aria-label="${esc(L('c.ui.oka', { steg: stepTxt }))}"${dis}>+</button>
    </div>${presets}`;
  }
  const legend = w === 'checkbox' ? '' : `<legend class="q__label" id="lg-${id}">${esc(q.label)}</legend>`;
  const help = q.help ? `<p class="q__help" id="${helpId}">${esc(q.help)}</p>` : '';
  const note = disabled ? `<p class="q__note">${esc(L('c.meter.galler_inte'))}</p>` : '';
  return `<fieldset class="q q--${w}${isGate ? ' q--gate' : ''}" id="q-${id}" data-q="${id}"${dis}>${legend}${body}${note}${help}</fieldset>`;
}

// Embed (UX §6.2): bara pengafrågorna står framme, boende + belopp + skatt (+ sol för batteri, grinden som avgör läget)
const EMBED_VISIBLE = new Set(['boende', 'belopp', 'skatt', 'sol']);

/** Var hör frågan hemma just nu: 'lage' | 'controls' | 'djup' | 'folded' | 'hidden' */
export function placeOf(q, c) {
  if (q.id === 'lage') return 'lage';
  if (DJUP_BAND.has(q.id)) return djupShown(q, c.eff) ? 'djup' : 'hidden';
  if (q.id === 'skatt_djup') return 'hidden';
  if (!q.shown) return c.hard && KEEP_ON_NEJ.has(q.id) ? 'controls' : 'hidden';
  if (DJUP_ALL.has(q.id)) return c.eff.skatt_djup ? 'folded' : 'hidden';
  if (c.embed && !EMBED_VISIBLE.has(q.id)) return 'folded';
  return q.folded ? 'folded' : 'controls';
}

function renderMeter(c) {
  const { meter: m, result: r, mode } = c;
  const b = r.belopp;
  const eyebrow = L(`c.meter.eyebrow.${mode}`);
  // taket per person; när något redan är använt visas i stället hur mycket som är kvar (COPY-raden v.pott.kvar)
  const cap = m.used > 0 && b.state !== 'noll'
    ? t(mode === 'rot' ? 'v.pott.kvar' : 'v.gt.pott.kvar', { kvar: formatKr(m.pottKvar) })
    : L(m.agare === 2 ? 'c.meter.cap.2' : 'c.meter.cap.1', { tak: formatKr(m.scale) });
  const seg = (cls, from, to, extra = '') => `<div class="meter__seg ${cls}" style="--x:${(from / m.scale).toFixed(5)};--w:${((to - from) / m.scale).toFixed(5)}"${extra}></div>`;
  const clip = (cls, from, to, on) => `<div class="meter__seg ${cls}${on ? ' is-on' : ''}" style="--x:${(from / m.scale).toFixed(5)};--w:${((to - from) / m.scale).toFixed(5)}"></div>`;
  const jobs = m.jobs;
  const j1 = jobs[0] || { from: m.used, to: m.used, typ: 'jobb' };
  const j2 = jobs[1] || { from: j1.to, to: j1.to, typ: 'batteri' };
  const band = m.band || { from: j1.to, to: j1.to };
  const over = m.tax && m.tax.risk > 0 ? { from: m.tax.x, to: band.to > j1.to ? band.to : (jobs.length > 1 ? j2.to : j1.to) } : { from: 0, to: 0 };
  const outline = m.outline || { from: 0, to: 0 };
  const taxOn = Boolean(m.tax);
  const tax = m.tax || { x: 0, lo: 0, hi: 0 };
  const gaps = [0, 1, 2].map((i) => `<div class="meter__gap${m.gaps[i] !== undefined ? ' is-on' : ''}" style="--x:${((m.gaps[i] || 0) / m.scale).toFixed(5)}"></div>`).join('');
  const label = meterLabel(c);
  const ticks = [0, P.ROT_TAK, P.ROT_TAK * 2].filter((v) => v <= m.scale).map((v) => `<span class="meter__tick" style="--x:${(v / m.scale).toFixed(5)}">${v === 0 ? L('c.tick.noll') : esc(formatKr(v))}</span>`).join('');
  const legend = renderLegend(c);
  const readoutTxt = m.inactive && b.state === 'dold' ? '' : b.rubrik;
  const aria = L('c.meter.aria', { text: [readoutTxt, label.text].filter(Boolean).join('. ') });
  return `<div class="meter${m.inactive ? ' is-inactive' : ''}" data-state="${esc(b.state)}" data-label="${label.text ? 'on' : 'off'}" style="--ticks:${Math.round(m.scale / 10_000)}">
    <div class="meter__head">
      <div class="meter__title"><span class="eyebrow">${esc(eyebrow)}</span><span class="meter__cap">${esc(cap)}</span></div>
      <div class="meter__readout">
        <strong class="meter__rubrik" data-amounts="${esc(amountsIn(readoutTxt).join(','))}">${esc(readoutTxt)}</strong>
        <span class="meter__bas">${esc(m.inactive && b.state === 'dold' ? '' : b.bas_text)}</span>
        <span class="meter__betala">${esc(b.att_betala_text || '')}</span>
      </div>
    </div>
    <div class="meter__labelrow"><span class="meter__taxlabel${label.cls}" style="--x:${(tax.x / m.scale).toFixed(5)}"><span class="meter__taxtxt">${esc(label.text)}</span></span><span class="meter__taxband${taxOn ? ' is-on' : ''}" style="--x:${(tax.lo / m.scale).toFixed(5)};--w:${((tax.hi - tax.lo) / m.scale).toFixed(5)}"></span></div>
    <div class="meter__bar" role="img" aria-label="${esc(aria)}">
      <div class="meter__track">
        ${seg('meter__seg--used', 0, m.used)}
        ${seg(`meter__seg--job meter__seg--${j1.typ}`, j1.from, j1.to)}
        ${seg(`meter__seg--job2 meter__seg--${j2.typ}`, j2.from, j2.to)}
        ${clip('meter__seg--band', band.from, band.to, band.to > band.from)}
        ${clip('meter__seg--over', over.from, over.to, over.to > over.from)}
        ${clip('meter__seg--outline', outline.from, outline.to, outline.to > outline.from)}
        ${gaps}
        <div class="meter__marker${taxOn ? ' is-on' : ''}${m.tax && m.tax.pinned ? ' is-pinned' : ''}" style="--x:${(tax.x / m.scale).toFixed(5)}"></div>
      </div>
      <div class="meter__tail${m.over > 0 ? ' is-on' : ''}" aria-hidden="true"></div>
    </div>
    <div class="meter__ticks">${ticks}</div>
    <ul class="meter__legend${legendSolo(legend) ? ' is-solo' : ''}">${legend}</ul>
  </div>`;
}

function amountsIn(s) {
  const out = []; const re = /(\d{1,3}(?:[\u00a0 ]\d{3})*)[\u00a0 ]kr/g; let mm;
  while ((mm = re.exec(String(s || '')))) out.push(Number(mm[1].replace(/[\u00a0 ]/g, '')));
  return out;
}

function meterLabel(c) {
  const { meter: m, result: r } = c;
  if (m.inactive) return { text: L('c.meter.galler_inte'), cls: ' is-note' };
  if (r.belopp.state === 'noll') return { text: '', cls: '' };
  if (!m.tax) return { text: '', cls: '' };
  if (m.tax.status === 'ryms_inte' && m.tax.room <= 0) return { text: L('c.meter.tax_ingen'), cls: ' is-on is-left' };
  const kr = kr100(m.tax.kr);
  if (m.tax.pinned) return { text: L('c.meter.tax_hela', { kr }), cls: ' is-on is-pinned' };
  return { text: L('c.meter.tax_hit', { kr }), cls: ` is-on${m.tax.x / m.scale > 0.5 ? ' is-right' : ''}` };
}

function renderLegend(c) {
  const { meter: m, result: r } = c;
  const b = r.belopp;
  const item = (cls, label, value, on) => `<li class="meter__key meter__key--${cls}${on ? '' : ' is-dim'}"><span class="meter__swatch" aria-hidden="true"></span><span class="meter__keylabel">${esc(label)}</span>${value ? `<span class="meter__keyval">${esc(value)}</span>` : ''}</li>`;
  const items = [];
  items.push(item('used', L('c.legend.anvant'), m.used > 0 ? formatKr(m.used) : '', m.used > 0 && !m.inactive));
  if (m.jobs.length > 1) {
    items.push(item('sol', L('c.legend.sol'), kr100(m.jobs[0].kr), true));
    items.push(item('batteri', L('c.legend.batteri'), kr100(m.jobs[1].kr), true));
  } else {
    let val = '';
    let on = !m.inactive;
    if (b.state === 'intervall') val = L('c.legend.till', { min: kr100(b.avdrag_min_kr), max: kr100(b.avdrag_max_kr) });
    else if (b.state === 'tak') val = L('c.legend.upp_till', { kr: formatKr(m.pottKvar) });
    else if (b.state === 'noll') { val = formatKr(0); on = false; }
    else if (!m.inactive) val = kr100(b.avdrag_kr);
    items.push(item('job', L('c.legend.jobb'), val, on));
  }
  const risk = m.tax ? m.tax.risk : 0;
  items.push(item('kvarskatt', L('c.legend.kvarskatt'), risk > 0 ? kr100(risk) : '', risk > 0));
  items.push(item('over', L('c.legend.ryms_inte'), m.over > 0 ? kr100(m.over) : '', m.over > 0));
  return items.join('');
}

function legendSolo(html) { const lit = (html.match(/meter__key meter__key--[a-z]+"/g) || []).length; return lit <= 1; }

function renderDjup(c) {
  const { bank, result: r, embed } = c;
  const qs = bank.filter((q) => DJUP_BAND.has(q.id));
  const cell = (q) => `<div class="djup__cell djup__cell--${q.id}"${djupShown(q, c.eff) ? '' : ' hidden'}>${renderQuestion(q, c)}</div>`;
  const first = qs.filter((q) => ['inkomsttyp', 'fyllt66'].includes(q.id)).map(cell).join('');
  const income = qs.filter((q) => ['manadsinkomst', 'lon_manad', 'pension_manad'].includes(q.id)).map(cell).join('');
  const rest = qs.filter((q) => ['ranteutgifter_ar'].includes(q.id)).map(cell).join('');
  const own2 = qs.filter((q) => q.id.endsWith('_2')).map(cell).join('');
  const status = renderDjupStatus(c);
  const inner = `<div class="djup__grid djup__grid--1">${first}${income}<div class="djup__status" id="djup-status">${status}</div>${rest}</div>
    <div class="djup__grid djup__grid--2"${c.eff.agare === 2 ? '' : ' hidden'} data-agare2><span class="djup__owner">${esc(L('c.djup.agare2'))}</span>${own2}</div>`;
  const h = embed ? 'h4' : 'h3';
  if (embed) {
    return `<section class="djup djup--embed" aria-labelledby="djup-h"><details class="fold fold--djup" id="fold-djup"><summary class="fold__sum"><span>${esc(L('c.djup.fold'))}</span></summary>
      <${h} class="djup__h" id="djup-h">${esc(t('q.skatt_djup.label'))}</${h}>${inner}</details></section>`;
  }
  return `<section class="djup" aria-labelledby="djup-h"><${h} class="djup__h" id="djup-h">${esc(t('q.skatt_djup.label'))}</${h}>${inner}</section>`;
}

function renderDjupStatus(c) {
  const { result: r, eff } = c;
  const s = r.skatt;
  if (r.klass === 'nej') return `<p class="djup__line is-muted">${esc(L('c.meter.galler_inte'))}</p>`;
  if (eff.skatt_djup && s.text && ['ryms', 'ryms_delvis', 'ryms_inte'].includes(s.status)) {
    return `<p class="djup__line is-result">${esc(s.text)}</p><p class="djup__line is-muted">${esc(s.hedge)}</p>`;
  }
  return `<p class="djup__line">${esc(L('c.djup.prompt'))}</p><p class="djup__line is-muted">${esc(t('q.skatt_djup.help'))}</p>`;
}

function renderVillkor(c) {
  const rows = c.result.villkor.map((v) => {
    const clickable = v.fraga && v.status !== 'skoter_vi';
    const tag = v.status === 'antaget' ? ` <span class="villkor__tag">${esc(t('ui.antaget'))}</span>` : '';
    const inner = `<span class="villkor__ico villkor__ico--${v.status}">${ICON[v.status] || ICON.antaget}</span><span class="villkor__txt">${esc(v.text)}${tag}</span>`;
    return clickable
      ? `<li class="villkor__row is-${v.status}"><button type="button" class="villkor__btn" data-fraga="${esc(v.fraga)}">${inner}</button></li>`
      : `<li class="villkor__row is-${v.status}"><span class="villkor__static">${inner}</span></li>`;
  }).join('');
  return `<ul class="villkor">${rows}</ul>`;
}

function renderSteps(c) {
  const st = c.result.nasta_steg;
  if (!st.length) return '';
  const h = c.embed ? 'h4' : 'h3';
  return `<div class="steps"><${h} class="steps__h">${esc(t('ui.vad_hander_nu'))}</${h}><ol class="steps__list">${st.map((s) => `<li>${esc(s.text)}</li>`).join('')}</ol></div>`;
}

function renderCta(c) {
  const { cta } = c.result;
  const p = cta.primary; const s = cta.secondary;
  let prim = '';
  if (p && p.kind !== 'none' && p.labelKey) {
    const attrs = `data-cta="${esc(p.kind)}"`;
    if (p.kind === 'lage_byte') prim = `<button type="button" class="${p.solid ? 'btn btn--primary' : 'textlink'}" ${attrs}>${esc(p.label)}</button>`;
    else prim = `<a class="${p.solid ? 'btn btn--primary' : 'textlink'}" href="${esc(p.href)}" ${attrs}${p.kind === 'skatteverket' ? ' rel="noopener" target="_blank"' : ''}>${esc(p.label)}</a>`;
  }
  const sec = s && s.labelKey ? `<a class="textlink textlink--sec" href="${esc(s.href)}" data-cta="${esc(s.kind)}"${s.kind === 'skatteverket' ? ' rel="noopener" target="_blank"' : ''}>${esc(s.label)}</a>` : '';
  return `${prim ? `<div class="cta__primary">${prim}</div>` : ''}${sec ? `<div class="cta__secondary">${sec}</div>` : ''}`;
}

function renderMetod(c) {
  const { result: r, mode } = c;
  const lines = r.metod_text.map((x) => `<li>${esc(x)}</li>`).join('');
  return `<ol class="metod__list">${lines}</ol>`;
}

function renderStaticTable(mode, lage) {
  // Statisk beloppstabell (UX §6.4): ren aritmetik ur PARAMS, taket markerat. Inga nya fakta.
  const rows = [10_000, 20_000, 50_000, 100_000, 200_000];
  let sats; let tak; let head; let col1;
  if (mode === 'rot') { sats = P.ROT_SATS; tak = P.ROT_TAK; head = L('c.tabell.rot', { tak: formatKr(tak) }); col1 = L('c.tabell.kol1.rot'); }
  else {
    const key = lage === 'sol' ? 'gt_sol' : lage === 'batteri' ? 'gt_batteri' : 'gt_laddbox';
    sats = P.GT_RATE[key]; tak = P.GT_TAK;
    head = L('c.tabell.gt', { vad: L('c.tabell.kol1.gt'), sats: Math.round(sats * 100), tak: formatKr(tak) }); col1 = L('c.tabell.kol1.gt');
  }
  const tr = rows.map((x) => {
    const a = Math.floor(x * sats);
    const capped = a >= tak;
    return `<tr><td>${esc(formatKr(x))}</td><td>${esc(capped ? L('c.tabell.tak', { kr: formatKr(tak) }) : formatKr(a))}</td></tr>`;
  }).join('');
  return `<table class="tabell"><caption>${esc(head)}</caption><thead><tr><th scope="col">${esc(col1)}</th><th scope="col">${esc(L('c.tabell.kol2'))}</th></tr></thead><tbody>${tr}</tbody></table>`;
}

function renderVerdict(c) {
  const { result: r, embed, mode } = c;
  const hv = embed ? 'h3' : 'h2';
  const body = `<span class="eyebrow verdict__eyebrow">${esc(r.eyebrow)}</span>
    <${hv} class="verdict__h" id="verdict-h">${esc(r.headline.text)}</${hv}>
    <p class="verdict__ram">${esc(r.ram.text)}</p>`;
  const detail = `${renderVillkor(c)}${renderSteps(c)}`;
  const share = `<div class="share">
      <button type="button" class="share__btn" data-share="copy">${ICON.link}<span>${esc(t('ui.kopiera_lank'))}</span></button>
      <button type="button" class="share__btn share__btn--print" data-share="print"${embed ? ' hidden' : ''}>${ICON.print}<span>${esc(t('ui.skriv_ut'))}</span></button>
      <button type="button" class="share__btn share__btn--reset" data-share="reset">${ICON.reset}<span>${esc(L('c.ui.borja_om'))}</span></button>
      <span class="share__status" role="status" aria-live="polite"></span>
    </div>`;
  const skv = mode === 'rot' ? `<a class="textlink" href="${esc(LINKS.skatteverket_rot_rut)}" rel="noopener" target="_blank">${esc(L('c.skv.rot'))}</a>` : `<a class="textlink" href="${esc(LINKS.skatteverket_mina_avdrag)}" rel="noopener" target="_blank">${esc(L('c.skv.gt'))}</a>`;
  const metod = `<details class="metod" id="metod"><summary class="fold__sum"><span>${esc(t('ui.sa_har_vi_raknat'))}</span></summary>
      <div class="metod__body"><div id="metod-list">${renderMetod(c)}</div>${renderStaticTable(mode, c.eff.lage)}<p class="metod__kalla">${esc(L('c.kalla'))} ${skv}</p></div></details>`;
  const cta = `<div class="cta" id="cta">${renderCta(c)}</div>`;
  const folded = embed
    ? `<details class="fold fold--villkor" id="fold-villkor"><summary class="fold__sum"><span>${esc(L('c.fold.villkor'))}</span></summary><div id="verdict-detail">${detail}</div>${share}${metod}</details>`
    : `<div id="verdict-detail">${detail}</div>`;
  return `<section class="verdict klass-${esc(r.klass)}" id="besked" aria-labelledby="verdict-h" data-klass="${esc(r.klass)}">
    <div class="verdict__body" id="verdict-body">${body}</div>
    ${embed ? cta : ''}
    ${folded}
    ${embed ? '' : cta}
    ${embed ? '' : share}
    ${embed ? '' : metod}
  </section>`;
}

export function renderTool(mode, state, touched, surface) {
  const c = ctx(mode, state, touched, surface);
  const { bank, embed } = c;
  const lage = bank.find((q) => q.id === 'lage');
  const controls = bank.filter((q) => !['lage'].includes(q.id) && !DJUP_ALL.has(q.id)).map((q) => {
    const place = placeOf(q, c);
    return { q, place, html: renderQuestion(q, c) };
  });
  const foldedDjup = bank.filter((q) => DJUP_ALL.has(q.id) && !DJUP_BAND.has(q.id) && q.id !== 'skatt_djup').map((q) => ({ q, place: placeOf(q, c), html: renderQuestion(q, c) }));
  const inControls = controls.filter((x) => x.place === 'controls').map((x) => x.html).join('');
  const inFolded = [...controls.filter((x) => x.place === 'folded'), ...foldedDjup.filter((x) => x.place === 'folded')].map((x) => x.html).join('');
  const hiddenOnes = [...controls.filter((x) => x.place === 'hidden'), ...foldedDjup.filter((x) => x.place === 'hidden')].map((x) => x.html.replace('<fieldset ', '<fieldset hidden ')).join('');
  const ht = embed ? 'h2' : 'h1';
  return `<section class="tool" id="verktyg" data-mode="${mode}" data-surface="${surface}" aria-labelledby="tool-title">
  <header class="tool__head">
    <${ht} class="tool__title" id="tool-title">${esc(L(`c.title.${mode}`))}</${ht}>
    <p class="tool__lead">${esc(L('c.lead'))}</p>
  </header>
  <div class="tool__grid">
    <div class="tool__main">
      ${lage ? `<div class="lage">${renderQuestion(lage, c)}</div>` : ''}
      ${renderMeter(c)}
      <div class="controls" id="controls">${inControls}</div>
      ${renderDjup(c)}
      <details class="fold fold--fler" id="fler"><summary class="fold__sum"><span>${esc(t('ui.fler_detaljer'))}</span></summary><div class="fler__body" id="folded">${inFolded}</div></details>
      <div class="q-hidden" id="q-hidden" hidden>${hiddenOnes}</div>
    </div>
    ${renderVerdict(c)}
  </div>
  <p class="disclaimer">${esc(c.result.disclaimer)}</p>
  <p class="print-only" id="print-rad"></p>
  <noscript><p class="nojs">${esc(L('c.ui.nojs'))}</p></noscript>
</section>`;
}

function demoHref(mode, lage, surface) {
  const q = new URLSearchParams(); q.set('m', mode); if (mode === 'gt') q.set('l', lage); if (surface === 'embed') q.set('surface', 'embed');
  return `?${q.toString()}`;
}

export function renderDemo(mode, lage, surface) {
  const a = (m, l, s, label, on) => `<a class="demo__link${on ? ' is-on' : ''}" href="${demoHref(m, l, s)}" data-demo="${m}:${l}:${s}">${esc(label)}</a>`;
  return `<nav class="demo" aria-label="Demo: byt läge och yta"><span class="demo__name">${esc(L('c.demo.namn'))}</span>
    ${a('rot', 'laddbox', surface, L('c.demo.rot'), mode === 'rot')}${a('gt', 'laddbox', surface, L('c.demo.laddbox'), mode === 'gt' && lage === 'laddbox')}${a('gt', 'batteri', surface, L('c.demo.batteri'), mode === 'gt' && lage === 'batteri')}${a('gt', 'sol', surface, L('c.demo.sol'), mode === 'gt' && lage === 'sol')}
    <span class="demo__sep" aria-hidden="true"></span>
    ${a(mode, lage, 'standalone', L('c.demo.standalone'), surface === 'standalone')}${a(mode, lage, 'embed', L('c.demo.embed'), surface === 'embed')}
  </nav>`;
}

export function renderArticleTop(mode) {
  return `<header class="article__head"><div class="article__img" aria-hidden="true"><span>${esc(L('c.art.bild'))}</span></div>
    <h1 class="article__h1">${esc(L(`c.art.h1.${mode}`))}</h1>
    <p class="article__lead">${esc(L('c.art.ingress1'))}</p><p class="article__lead">${esc(L('c.art.ingress2'))}</p></header>`;
}
export function renderArticleBottom() {
  return `<h2 class="article__h2">${esc(L('c.art.snabbfakta'))}</h2><p class="article__p">${esc(L('c.art.brod'))}</p>`;
}

export function renderPage(mode, state, touched, surface) {
  const eff = effectiveState(mode, state);
  const embed = surface === 'embed';
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Avdragsmätaren, riktning C: ROT- och grön teknik-kalkylatorn</title>
<meta name="description" content="Wireframe, riktning C. Ett instrument med två tak: årets pott och skatteutrymmet.">
<link rel="stylesheet" href="../_shared/fonts.css">
<link rel="stylesheet" href="../_shared/tokens.css">
<link rel="stylesheet" href="styles.css">
</head>
<body data-surface="${surface}">
<div id="demo">${renderDemo(mode, eff.lage || 'laddbox', surface)}</div>
<div class="page">
  <article class="article" id="article-top"${embed ? '' : ' hidden'}>${renderArticleTop(mode)}</article>
  <div id="tool-root">${renderTool(mode, state, touched, surface)}</div>
  <article class="article article--after" id="article-bottom"${embed ? '' : ' hidden'}>${renderArticleBottom()}</article>
</div>
<div class="sticky" id="sticky" hidden><div class="sticky__txt"><strong class="sticky__h"></strong><span class="sticky__amt"></span></div><a class="btn btn--primary btn--sm sticky__btn" href="#besked">${esc(L('c.ui.till_beskedet'))}</a></div>
<p class="sr-only" id="live" aria-live="polite"></p>
<script type="module" src="app.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------------------
// Webbläsaren: hydrering, live-omräkning, målning
// ---------------------------------------------------------------------------------------------------
function track(event, props) {
  try { if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...props }); } catch (e) { /* stub */ }
}
const bucket = (kr) => (kr < 10_000 ? '<10k' : kr < 25_000 ? '10k_25k' : kr < 50_000 ? '25k_50k' : kr < 100_000 ? '50k_100k' : '100k_plus');

const App = {
  mode: 'rot', state: null, touched: new Set(), prefilled: new Set(), surface: 'standalone', interacted: false,
  lastKlass: null, prevAmounts: null, liveTimer: null, urlTimer: null, io: null, tween: null, lastLage: null,
};

function $(sel, root) { return (root || document).querySelector(sel); }
function isMobile() { return window.matchMedia('(max-width: 991px)').matches; }
function reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

function currentCtx() { return ctx(App.mode, App.state, App.touched, App.surface); }

function init() {
  const params = new URLSearchParams(location.search);
  const link = decodeState(location.search);
  App.surface = params.get('surface') === 'embed' ? 'embed' : 'standalone';
  App.mode = link.mode || 'rot';
  App.state = { ...defaultState(App.mode), ...link.state };
  App.prefilled = new Set(link.prefilled);
  App.touched = new Set();
  const isDefaultRender = App.mode === 'rot' && App.surface === 'standalone' && App.prefilled.size === 0;
  document.body.dataset.surface = App.surface;
  if (!isDefaultRender) rerenderTool();
  else bind();
  $('#article-top').hidden = App.surface !== 'embed';
  $('#article-bottom').hidden = App.surface !== 'embed';
  paint({ initial: true });
  track('ampy_ak_view', { mode: App.mode, lage: App.state.lage || null, surface: App.surface, prefilled: App.prefilled.size > 0, params_n: App.prefilled.size });
  if (App.prefilled.size > 0 && isMobile()) {
    const el = $('#besked'); if (el) setTimeout(() => el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }), 60);
  }
  window.addEventListener('beforeprint', () => {
    const m = $('#metod'); if (m) m.open = true;
    const pr = $('#print-rad'); if (pr) pr.textContent = L('c.print.rad', { datum: new Date().toISOString().slice(0, 10), url: shareUrl() });
  });
}

function rerenderTool() {
  const root = $('#tool-root');
  root.innerHTML = renderTool(App.mode, App.state, App.touched, App.surface);
  const eff = effectiveState(App.mode, App.state);
  $('#demo').innerHTML = renderDemo(App.mode, eff.lage || 'laddbox', App.surface);
  $('#article-top').innerHTML = renderArticleTop(App.mode);
  if (App.io) { App.io.disconnect(); App.io = null; }
  bind();
}

function bind() {
  const tool = $('#verktyg');
  // reglagen (delegering)
  tool.addEventListener('change', onChange);
  tool.addEventListener('input', onInput);
  tool.addEventListener('click', onClick);
  tool.addEventListener('focusout', onBlur);
  tool.addEventListener('toggle', (e) => {
    const d = e.target; if (!(d instanceof HTMLDetailsElement) || !d.open) return;
    track('ampy_ak_expand', { section: d.id });
  }, true);
  // sticky-remsan
  const sticky = $('#sticky');
  if (sticky && !App.stickyBound) sticky.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; if (a.getAttribute('href') === '#besked') { e.preventDefault(); $('#besked').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); } else track('ampy_ak_cta_click', { target: 'offert', via: 'sticky' }); });
  if ('IntersectionObserver' in window) {
    App.io = new IntersectionObserver((entries) => { App.verdictVisible = entries[0].intersectionRatio >= 0.5; syncSticky(); }, { threshold: [0, 0.5, 1] });
    App.io.observe($('#besked'));
  }
  if (!App.stickyBound) window.addEventListener('scroll', () => syncSticky(), { passive: true });
  App.stickyBound = true;
}

function qFrom(el) { const fs = el.closest('fieldset[data-q]'); return fs ? fs.dataset.q : null; }
function bankQ(id) { return BANKS[App.mode].find((q) => q.id === id); }

function parseAmount(id, raw) {
  const q = bankQ(id);
  const digits = String(raw || '').replace(/[^\d.,]/g, '').replace(',', '.');
  if (digits === '') return q && q.default === null && id !== 'belopp' ? null : 0;
  let n = Number(digits); if (!Number.isFinite(n)) n = 0;
  if (q) { if (q.min !== undefined) n = Math.max(q.min, n); if (q.max !== undefined) n = Math.min(q.max, n); }
  return id === 'kommunalskatt' ? Math.round(n * 100) / 100 : Math.round(n);
}

function setAnswer(id, value, opts = {}) {
  App.state[id] = value;
  App.touched.add(id);
  App.interacted = true;
  if (DJUP_BAND.has(id) && !App.state.skatt_djup) { App.state.skatt_djup = true; App.touched.add('skatt_djup'); }
  const q = bankQ(id);
  let vb;
  if (q && (q.widget === 'amount' || q.widget === 'stepper')) vb = value === null ? 'antaget' : bucket(Number(value));
  else if (DJUP_BAND.has(id)) vb = 'angiven';
  else vb = String(value);
  if (!opts.silent) track('ampy_ak_answer', { question_id: id, value_bucket: vb });
  if (id === 'lage') track('ampy_ak_mode_select', { from: App.lastLage, to: value });
  paint();
}

function onChange(e) {
  const el = e.target;
  const id = qFrom(el); if (!id) return;
  if (el.type === 'radio') {
    const v = el.value === 'true' ? true : el.value === 'false' ? false : (/^\d+$/.test(el.value) && id === 'agare' ? Number(el.value) : el.value);
    setAnswer(id, v);
  } else if (el.type === 'checkbox') setAnswer(id, el.checked);
  else if (el.type === 'range') setAnswer(id, Number(el.value));
}

function onInput(e) {
  const el = e.target;
  if (el.type === 'range') {
    const id = qFrom(el); if (!id) return;
    const v = Number(el.value); const q = bankQ(id);
    el.style.setProperty('--p', pct((v - q.min) / (q.max - q.min)));
    const out = el.parentElement.querySelector('output'); if (out) out.textContent = q.max > 1000 ? formatKr(v) : `${v} ${L('c.ui.procent')}`;
    el.setAttribute('aria-valuetext', q.max > 1000 ? L('c.djup.valuetext', { kr: fmtField(v) }) : `${v} procent`);
    setAnswer(id, v, { silent: true });
  } else if (el.type === 'text') {
    const id = qFrom(el); if (!id) return;
    // siffror in, live-omräkning med lätt debounce (UX §10: 400 ms på belopp)
    clearTimeout(App.amtTimer);
    App.amtTimer = setTimeout(() => setAnswer(id, parseAmount(id, el.value)), 400);
  }
}

function onBlur(e) {
  const el = e.target;
  if (el.type === 'text') {
    const id = qFrom(el); if (!id) return;
    clearTimeout(App.amtTimer);
    const v = parseAmount(id, el.value);
    if (App.state[id] !== v) setAnswer(id, v); else paintFields();
  }
}

function onClick(e) {
  const btn = e.target.closest('button, a'); if (!btn) return;
  // stepper
  if (btn.dataset.step) {
    const id = qFrom(btn); const q = bankQ(id); const input = btn.parentElement.querySelector('input');
    const cur = parseAmount(id, input.value) ?? (App.state[id] ?? effectiveState(App.mode, App.state)[id] ?? 0);
    const base = cur === null ? (effectiveState(App.mode, App.state)[id] || 0) : cur;
    const step = q.step || 1000;
    let v = base + Number(btn.dataset.step) * step;
    v = Math.max(q.min ?? 0, Math.min(q.max ?? 1e6, v));
    v = Math.round(v / step) * step;
    if (id === 'kommunalskatt') v = Math.round(v * 100) / 100;
    setAnswer(id, v);
    return;
  }
  if (btn.dataset.preset) {
    const id = qFrom(btn); const input = btn.closest('fieldset').querySelector('input[type="text"]');
    if (btn.dataset.preset === 'annat') { input.value = ''; input.focus(); setAnswer(id, 0); return; }
    setAnswer(id, Number(btn.dataset.preset));
    return;
  }
  if (btn.dataset.fraga) { e.preventDefault(); focusQuestion(btn.dataset.fraga); return; }
  if (btn.dataset.share) { e.preventDefault(); share(btn.dataset.share); return; }
  if (btn.dataset.cta) {
    const c = currentCtx(); const p = c.result.cta.primary;
    track('ampy_ak_cta_click', { target: btn.dataset.cta, class: c.result.klass, amount_bucket: c.result.belopp.avdrag_kr ? bucket(c.result.belopp.avdrag_kr) : null });
    if (btn.dataset.cta === 'lage_byte' && p && p.byte) { e.preventDefault(); switchMode(p.byte.mode, p.byte.state); }
  }
}

function switchMode(mode, prefState) {
  track('ampy_ak_mode_select', { from: App.mode === 'gt' ? App.state.lage : 'rot', to: mode });
  const old = App.state || {};
  App.mode = mode;
  App.state = { ...defaultState(mode) };
  App.prefilled = new Set();
  for (const [k, v] of Object.entries(prefState || {})) { if (k in App.state && v !== undefined) { App.state[k] = v; App.prefilled.add(k); } }
  if (prefState && prefState.skatt_djup) for (const k of DJUP_BAND) if (k in App.state && old[k] !== undefined) App.state[k] = old[k];
  App.touched = new Set();
  rerenderTool();
  paint({ initial: true });
  const h = $('#verdict-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  $('#besked').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
}

function focusQuestion(id) {
  const fs = document.getElementById(`q-${id}`); if (!fs) return;
  const fler = fs.closest('#fler'); if (fler) fler.open = true;
  const fd = fs.closest('#fold-djup'); if (fd) fd.open = true;
  const input = fs.querySelector('input:checked, input[type="range"], input[type="text"], input');
  if (isMobile()) fs.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  if (input) input.focus({ preventScroll: true });
  fs.classList.add('is-flash'); setTimeout(() => fs.classList.remove('is-flash'), 900);
}

function shareUrl() {
  const keep = new URLSearchParams();
  for (const [k, v] of new URLSearchParams(location.search)) if (/^utm_/.test(k) || k === 'gclid' || k === 'fbclid') keep.set(k, v);
  const qs = encodeState(App.mode, App.state);
  const extra = keep.toString();
  return `${location.origin}${location.pathname}?${qs}${extra ? `&${extra}` : ''}`;
}

async function share(what) {
  const status = $('.share__status');
  if (what === 'print') { track('ampy_ak_share', { method: 'print' }); window.print(); return; }
  if (what === 'reset') {
    App.state = { ...defaultState(App.mode) }; App.touched = new Set(); App.prefilled = new Set(); App.interacted = false;
    paint(); if (status) status.textContent = ''; return;
  }
  const url = shareUrl();
  try {
    if (navigator.share && window.matchMedia('(max-width: 767px)').matches) { await navigator.share({ url }); track('ampy_ak_share', { method: 'native' }); return; }
    await navigator.clipboard.writeText(url);
    track('ampy_ak_share', { method: 'clipboard' });
    if (status) { status.textContent = L('c.ui.lank_kopierad'); setTimeout(() => { status.textContent = ''; }, 3000); }
  } catch (err) {
    if (status) { status.textContent = url; }
  }
}

// ---- målning ----
function paint(opts = {}) {
  const c = currentCtx();
  paintFields(c);
  paintMeter(c, opts);
  paintVerdict(c);
  paintDjup(c);
  syncSticky(c);
  scheduleLive(c);
  scheduleUrl();
  if (c.result.klass !== App.lastKlass) {
    if (App.lastKlass !== null) track('ampy_ak_verdict', { class: c.result.klass, subtype: c.result.subtyp, unknowns_n: c.result.counts.okanda, assumed_n: c.result.counts.antagna, amount_bucket: c.result.belopp.avdrag_kr ? bucket(c.result.belopp.avdrag_kr) : null });
    App.lastKlass = c.result.klass;
  }
  App.lastLage = c.eff.lage || null;
}

function containerFor(place) {
  return { controls: $('#controls'), folded: $('#folded'), hidden: $('#q-hidden'), djup: null, lage: $('.lage') }[place];
}

function paintFields(c = currentCtx()) {
  const { bank } = c;
  for (const q of bank) {
    if (q.id === 'skatt_djup') continue;
    const fs = document.getElementById(`q-${q.id}`); if (!fs) continue;
    const place = placeOf(q, c);
    if (DJUP_BAND.has(q.id)) { const cell = fs.closest('.djup__cell'); if (cell) cell.hidden = place !== 'djup'; }
    else if (place !== 'lage') {
      const target = containerFor(place);
      fs.hidden = place === 'hidden';
      if (target && fs.parentElement !== target) moveInOrder(fs, target, q.id);
    }
    // disabled-läge vid hårt nej (UX §9): reglaget står kvar, gråat
    const disabled = c.hard && KEEP_ON_NEJ.has(q.id) && !q.shown;
    fs.disabled = disabled;
    fs.querySelectorAll('input, button').forEach((el) => { el.disabled = disabled; });
    let note = fs.querySelector('.q__note');
    if (disabled && !note) { note = document.createElement('p'); note.className = 'q__note'; note.textContent = L('c.meter.galler_inte'); fs.insertBefore(note, fs.querySelector('.q__help')); }
    if (!disabled && note) note.remove();
    // värden
    const cur = displayValue(q, c);
    if (q.widget === 'chips' || q.widget === 'toggle') {
      fs.querySelectorAll('input[type="radio"]').forEach((r) => { r.checked = r.value === cur; });
    } else if (q.widget === 'checkbox') {
      const cb = fs.querySelector('input[type="checkbox"]'); if (cb) cb.checked = cur === 'true';
    } else if (q.widget === 'slider') {
      const r = fs.querySelector('input[type="range"]');
      if (r && document.activeElement !== r) { r.value = cur || q.default || q.min; r.style.setProperty('--p', pct((Number(r.value) - q.min) / (q.max - q.min))); const out = fs.querySelector('output'); if (out) out.textContent = q.max > 1000 ? formatKr(Number(r.value)) : `${r.value} ${L('c.ui.procent')}`; }
    } else if (q.widget === 'amount' || q.widget === 'stepper') {
      const inp = fs.querySelector('input[type="text"]');
      if (inp && document.activeElement !== inp) inp.value = fmtField(cur);
      fs.querySelectorAll('.preset[data-preset]').forEach((b) => { b.classList.toggle('is-on', b.dataset.preset === cur); });
      const help = fs.querySelector('.q__help'); if (help && q.help) help.textContent = q.help;
    }
  }
  // GT: beloppsetiketten och förvalen följer läget
  const bq = bank.find((q) => q.id === 'belopp'); const bfs = bq && document.getElementById('q-belopp');
  if (bfs) {
    const lg = bfs.querySelector('legend'); if (lg && lg.textContent !== bq.label) lg.textContent = bq.label;
    const pr = bfs.querySelector('.presets');
    if (pr && bq.presets) {
      const want = bq.presets.map(String).join(',');
      if (pr.dataset.presets !== want) {
        pr.dataset.presets = want;
        pr.innerHTML = `${bq.presets.map((pv) => `<button type="button" class="preset" data-preset="${pv}">${esc(fmtField(pv))}</button>`).join('')}<button type="button" class="preset preset--annat" data-preset="annat">${esc(t('q.belopp.annat'))}</button>`;
        const cur = displayValue(bq, c); pr.querySelectorAll('.preset').forEach((b) => b.classList.toggle('is-on', b.dataset.preset === cur));
      }
    }
  }
  const a2 = $('[data-agare2]'); if (a2) a2.hidden = c.eff.agare !== 2;
}

function moveInOrder(fs, target, id) {
  const order = BANKS[App.mode].map((q) => q.id);
  const idx = order.indexOf(id);
  const next = [...target.querySelectorAll(':scope > fieldset[data-q]')].find((el) => order.indexOf(el.dataset.q) > idx);
  if (next) target.insertBefore(fs, next); else target.appendChild(fs);
}

function paintMeter(c, opts = {}) {
  const el = $('.meter'); if (!el) return;
  const fresh = renderMeter(c);
  // struktur och etiketter: byt bara textinnehåll och variabler, aldrig segmentnoderna (animeras via CSS)
  const tmp = document.createElement('div'); tmp.innerHTML = fresh;
  const nm = tmp.firstElementChild;
  el.className = nm.className; el.dataset.state = nm.dataset.state; el.dataset.label = nm.dataset.label; el.style.cssText = nm.style.cssText; $('.meter__bar', el).setAttribute('aria-label', $('.meter__bar', nm).getAttribute('aria-label'));
  $('.meter__title', el).innerHTML = $('.meter__title', nm).innerHTML;
  $('.meter__bas', el).textContent = $('.meter__bas', nm).textContent;
  $('.meter__betala', el).textContent = $('.meter__betala', nm).textContent;
  $('.meter__ticks', el).innerHTML = $('.meter__ticks', nm).innerHTML;
  $('.meter__legend', el).innerHTML = $('.meter__legend', nm).innerHTML; $('.meter__legend', el).className = $('.meter__legend', nm).className;
  const lbl = $('.meter__taxlabel', el); const nl = $('.meter__taxlabel', nm);
  lbl.className = nl.className; lbl.style.cssText = nl.style.cssText; $('.meter__taxtxt', lbl).textContent = $('.meter__taxtxt', nl).textContent;
  // segment: kopiera style-variabler + is-on
  const segs = el.querySelectorAll('.meter__seg, .meter__gap, .meter__taxband, .meter__marker, .meter__tail');
  const nsegs = nm.querySelectorAll('.meter__seg, .meter__gap, .meter__taxband, .meter__marker, .meter__tail');
  segs.forEach((s, i) => { const n = nsegs[i]; if (!n) return; s.style.cssText = n.style.cssText; s.className = n.className; });
  // readout: count-up bara vid ändring, aldrig på load
  const ro = $('.meter__rubrik', el); const nro = $('.meter__rubrik', nm);
  const newText = nro.textContent; const newAmts = amountsIn(newText); const oldAmts = (ro.dataset.amounts || '').split(',').filter(Boolean).map(Number);
  ro.dataset.amounts = newAmts.join(',');
  if (opts.initial || reduced() || newAmts.length === 0 || newAmts.length !== oldAmts.length || ro.textContent === newText) { ro.textContent = newText; return; }
  tweenAmounts(ro, newText, oldAmts, newAmts);
}

function tweenAmounts(el, template, from, to) {
  if (App.tween) cancelAnimationFrame(App.tween);
  const start = performance.now(); const dur = 280;
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - k, 3);
    let i = 0;
    el.textContent = template.replace(/(\d{1,3}(?:[\u00a0 ]\d{3})*)[\u00a0 ]kr/g, () => { const v = from[i] + (to[i] - from[i]) * e; i++; return formatKr(round100(v)); });
    if (k < 1) App.tween = requestAnimationFrame(step); else { el.textContent = template; App.tween = null; }
  };
  App.tween = requestAnimationFrame(step);
}

function paintVerdict(c) {
  const v = $('#besked'); if (!v) return;
  const tmp = document.createElement('div'); tmp.innerHTML = renderVerdict(c);
  const nv = tmp.firstElementChild;
  v.className = nv.className; v.dataset.klass = nv.dataset.klass;
  const swap = (sel) => { const a = $(sel, v); const b = $(sel, nv); if (a && b && a.innerHTML !== b.innerHTML) { a.innerHTML = b.innerHTML; return true; } return false; };
  const head = $('#verdict-body', v); const nh = $('#verdict-body', nv);
  if (head.innerHTML !== nh.innerHTML) { head.classList.add('is-fading'); head.innerHTML = nh.innerHTML; requestAnimationFrame(() => head.classList.remove('is-fading')); }
  swap('#verdict-detail'); swap('#cta'); swap('#metod-list');
  const tbl = $('.tabell', v); const ntbl = $('.tabell', nv); if (tbl && ntbl && tbl.outerHTML !== ntbl.outerHTML) tbl.outerHTML = ntbl.outerHTML;
}

function paintDjup(c) {
  const s = $('#djup-status'); if (s) { const h = renderDjupStatus(c); if (s.innerHTML !== h) s.innerHTML = h; }
}

function syncSticky(c) {
  const st = $('#sticky'); if (!st) return;
  const show = App.surface === 'standalone' && App.interacted && window.matchMedia('(max-width: 767px)').matches && !App.verdictVisible;
  if (!show) { st.hidden = true; return; }
  const cc = c && c.result ? c : currentCtx();
  const r = cc.result;
  $('.sticky__h', st).textContent = r.headline.text;
  $('.sticky__amt', st).textContent = r.belopp.state === 'dold' ? '' : r.belopp.rubrik;
  const btn = $('.sticky__btn', st);
  const rect = $('#besked').getBoundingClientRect();
  const passed = rect.bottom < 0;
  const p = r.cta.primary;
  if (passed && p && p.solid && p.kind === 'offert') { btn.textContent = p.label; btn.setAttribute('href', p.href); }
  else { btn.textContent = L('c.ui.till_beskedet'); btn.setAttribute('href', '#besked'); }
  st.hidden = false;
}

function scheduleLive(c) {
  clearTimeout(App.liveTimer);
  App.liveTimer = setTimeout(() => {
    const live = $('#live'); if (!live) return;
    const txt = `${c.result.headline.text}. ${c.result.belopp.state === 'dold' ? '' : c.result.belopp.rubrik}`.trim();
    if (live.textContent !== txt) live.textContent = txt;
  }, 600);
}

function scheduleUrl() {
  if (App.surface !== 'standalone' || !window.history || !window.history.replaceState) return;
  clearTimeout(App.urlTimer);
  App.urlTimer = setTimeout(() => {
    const keep = new URLSearchParams();
    for (const [k, v] of new URLSearchParams(location.search)) if (/^utm_/.test(k) || k === 'gclid' || k === 'fbclid') keep.set(k, v);
    const qs = encodeState(App.mode, App.state); const extra = keep.toString();
    const url = `${location.pathname}?${qs}${extra ? `&${extra}` : ''}`;
    if (`${location.pathname}${location.search}` !== url) history.replaceState(null, '', url);
  }, 400);
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}
