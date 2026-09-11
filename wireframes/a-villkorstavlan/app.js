/**
 * Riktning A "Villkorstavlan": renderare + hydrering (ES-modul).
 *
 * Samma render-funktioner bygger den statiska index.html (via _build.mjs i Node) och patchar DOM:en live
 * i webbläsaren. Motorn och alla strängar kommer från ../../logik/ui-model.js; det enda lokala är LOCAL_COPY.
 * Ingen nätverkskod. Enda utgången är track() -> window.dataLayer (stub, buckets, aldrig belopp i klartext).
 */
import {
  resolveBank, evaluate, resolveTexts, defaultState, effectiveState, encodeState, decodeState, formatKr, t, PARAMS,
} from '../../logik/ui-model.js';

// ---------------------------------------------------------------------------------------------------
// Strängar som saknas i COPY (listade i NOTES.md). Copy-agenten får gärna flytta in dem i ui-model.js.
// ---------------------------------------------------------------------------------------------------
export const LOCAL_COPY = Object.freeze({
  'ui.title.rot': 'Gäller ROT-avdraget dig?',                                  // UX §1.5 utkast, kortad
  'ui.title.gt': 'Gäller grön teknik-avdraget dig?',
  'ui.lead.standalone': 'Svara på raderna. Beskedet räknas om medan du svarar.',           // 05 §6: "inget mejl" står i sidans ingress
  'ui.lead.embed': 'Svara på raderna. Beskedet räknas om medan du svarar. Inget mejl, ingen inloggning.', // 05 §3.1, en gång
  'ui.visa_villkoren': 'Visa villkoren',                                       // UX §6.2
  'ui.svara': 'Svara',                                                         // kompakt rad i artikeln på mobil: öppnar radens chips
  'ui.andra_pris': 'Ändra pris',                                               // samma, för beloppsraden
  'ui.till_beskedet': 'Till beskedet',                                         // UX §8.2 remsans knapp
  'ui.lank_kopierad': 'Länk kopierad',                                         // UX §7.3
  'ui.galler_inte': 'Gäller inte i det här läget',                             // UX §9 beloppsraden vid hårt nej
  'ui.avdrag_label': 'Ditt avdrag, preliminärt',                               // etikett över beloppsraden (UX §4.2 slot 3 "BELOPP")
  'ui.oka': 'Öka med {steg} kronor',                                           // UX §9 aria-label
  'ui.minska': 'Minska med {steg} kronor',
  'ui.kalla': 'Regler: Skatteverket, kontrollerade 2026-09-11. Gäller betalningar 2026.', // 05 §3.1 källa + datum
  'ui.noscript': 'Slå på JavaScript för att räkna på ditt fall.',              // UX §6.4
  'ui.utskrift': 'Utskrivet {datum}. Räkna själv: {url}',                     // UX §7.4: datum + länk på utskriften
  'ui.static.caption.rot': 'Utan JavaScript: så mycket kan ROT-avdraget bli',
  'ui.static.caption.gt': 'Utan JavaScript: så mycket kan grön teknik-avdraget bli för en laddbox',
  'ui.static.th1.rot': 'Arbetskostnad',
  'ui.static.th1.gt': 'Pris, arbete och material',
  'ui.static.th2': 'Avdrag',
  'ui.static.taket': 'taket',
  'ui.demo.namn': 'Riktning A: Villkorstavlan',
  'ui.demo.rot': 'ROT',
  'ui.demo.gt': 'Grön teknik',
  'ui.demo.standalone': 'Fristående sida',
  'ui.demo.embed': 'I artikeln',
  'ui.demo.alla': 'Alla riktningar',
  'ui.artikel.bild': 'Artikelbild, 230 px',
  'ui.artikel.h1': 'Artikelns rubrik på två rader, platshållare för artikeln om avdraget',
  'ui.artikel.ingress1': 'Här ligger artikelns ingress. Två stycken som ställer läsarens fråga och lovar ett svar, innan verktyget tar vid. Platshållartext utan fakta, satt i samma mått som mallen.',
  'ui.artikel.ingress2': 'Andra ingresstycket. Det bär inga siffror och inga påståenden, det finns bara här för att verktyget ska hamna på rätt höjd, ungefär 640 px ner på en mobil.',
  'ui.artikel.snabbfakta': 'Snabbfakta',
  'ui.artikel.body': 'Här börjar artikelns brödtext. Platshållare.',
});

const lc = (key, params) => {
  const s = LOCAL_COPY[key];
  if (s === undefined) return key;
  return params ? s.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined ? m : String(params[k]))) : s;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NBSP = ' ';
const group = (n) => String(Math.round(Math.abs(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

// Underfrågor som bor i en annan rad (frågan + villkoret är samma rad, UX §1.4 / riktning A).
const HOST = Object.freeze({ rot: Object.freeze({ arbetstyp: 'vardear' }), gt: Object.freeze({}) });
const isSub = (mode, id) => Boolean(HOST[mode][id]);
const STATUSES = ['ok', 'antaget', 'okand', 'varning', 'stopp', 'skoter_vi', 'neutral'];
const RANK = { stopp: 6, varning: 5, okand: 4, antaget: 3, ok: 2, skoter_vi: 1, neutral: 0 };
const KLASSER = ['ja', 'ja_villkor', 'troligen_inte', 'nej', 'osaker'];

// ---------------------------------------------------------------------------------------------------
// Ikoner: de sex radtillstånden + beskedsmärkena, inline-SVG (1,75 px stroke, 24 px). Inga ikonbibliotek.
// ---------------------------------------------------------------------------------------------------
const RING = '<circle cx="12" cy="12" r="10.25" fill="none" stroke="currentColor" stroke-width="1.75"/>';
const CHECK = (stroke) => `<path d="M7.2 12.4l3.1 3.1 6.5-6.9" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
const QMARK = `${RING}<path d="M9.4 9.6a2.6 2.6 0 1 1 3.7 2.35c-.75.4-1.1.9-1.1 1.75" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="12" cy="16.9" r="1.05" fill="currentColor"/>`;
const TRI = '<path d="M12 4.2l9 15.6H3z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 9.6v4.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.05" fill="currentColor"/>';
const CROSS = `${RING}<path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>`;
const SYMBOLS = Object.freeze({
  ok: `<circle cx="12" cy="12" r="11" fill="currentColor"/>${CHECK('#fff')}`,
  antaget: RING,
  okand: QMARK,
  varning: TRI,
  stopp: CROSS,
  skoter_vi: `<circle cx="12" cy="12" r="10.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.6 2.6"/>${CHECK('currentColor')}`,
  neutral: '<circle cx="12" cy="12" r="2.6" fill="currentColor"/>',
  'v-ja': `<circle cx="12" cy="12" r="11" fill="currentColor"/>${CHECK('#fff')}`,
  'v-ja_villkor': `${RING}${CHECK('currentColor')}`,
  'v-troligen_inte': TRI,
  'v-nej': CROSS,
  'v-osaker': QMARK,
});
/** Spriten ligger en gång i sidan; varje märke är en <use>. */
export const SPRITE = `<svg class="ak-sprite" aria-hidden="true" focusable="false" width="0" height="0" style="position:absolute">${Object.entries(SYMBOLS).map(([k, inner]) => `<symbol id="akm-${k}" viewBox="0 0 24 24">${inner}</symbol>`).join('')}</svg>`;
const use = (k) => `<svg class="ak-m ak-m--${k}" aria-hidden="true" focusable="false"><use href="#akm-${k}"/></svg>`;
const MARKS_ALL = STATUSES.map((s) => use(s)).join('');
const VERDICT_MARKS_ALL = KLASSER.map((k) => use(`v-${k}`)).join('');
const ICON_MINUS = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 10h10M10 5v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// ---------------------------------------------------------------------------------------------------
// Vyn: bank + resultat + villkorsraderna fördelade på tavlans rader
// ---------------------------------------------------------------------------------------------------
export function computeView(mode, state, touched) {
  const bank = resolveBank(mode, state);
  const eff = effectiveState(mode, state);
  const result = resolveTexts(evaluate(mode, state, touched));
  for (const q of bank) if (q.id === 'arbete' && (q.effectiveValue === null || q.effectiveValue === undefined)) q.effectiveValue = eff.arbete_andel;   // antagen andel visas i reglaget
  const qById = Object.fromEntries(bank.map((q) => [q.id, q]));
  const byHost = new Map();
  const compact = [];
  for (const v of result.villkor) {
    const host = v.fraga ? (HOST[mode][v.fraga] || v.fraga) : null;
    const hq = host ? qById[host] : null;
    if (hq && hq.shown && !hq.folded && host !== 'lage') {
      if (!byHost.has(host)) byHost.set(host, []);
      byHost.get(host).push(v);
    } else compact.push({ ...v });
  }
  const rows = {};
  let dim = false;
  for (const q of bank) {
    if (!q.shown || q.folded || q.id === 'lage') continue;
    if (isSub(mode, q.id)) { rows[q.id] = { sub: true, status: 'neutral', lines: [], tag: false, focus: q.id, dim }; continue; }
    const vs = byHost.get(q.id) || [];
    const status = vs.reduce((a, v) => (RANK[v.status] > RANK[a] ? v.status : a), 'neutral');
    const lines = vs.map((v) => v.text);
    if (q.id === 'belopp') lines.unshift(result.belopp.state === 'dold' ? lc('ui.galler_inte') : result.belopp.rubrik);
    rows[q.id] = { status, lines, tag: vs.some((v) => v.status === 'antaget'), focus: vs[0] && vs[0].fraga ? vs[0].fraga : q.id, dim };
    if (status === 'stopp') dim = true;
  }
  for (const v of compact) { v.dim = dim; if (v.status === 'stopp') dim = true; }
  return { bank, eff, result, rows, compact, qById };
}

// ---------------------------------------------------------------------------------------------------
// Render (strängar). Används av _build.mjs för index.html och av init() för embed-ytan.
// ---------------------------------------------------------------------------------------------------
const fmtInput = (v, pct) => (pct ? String(Number(v).toFixed(2)).replace('.', ',').replace(/,00$/, '') : group(v));

function renderControl(mode, q) {
  const name = `${mode}-${q.id}`;
  const helpId = q.help ? `${name}-help` : '';
  const help = q.help ? `<p class="ak-q__help" id="${helpId}">${esc(q.help)}</p>` : '';
  const desc = helpId ? ` aria-describedby="${helpId}"` : '';
  const val = q.effectiveValue;
  switch (q.widget) {
    case 'chips':
    case 'toggle': {
      const bool = !(q.options && q.options.length);
      const opts = bool ? [{ id: 'true', label: t('toggle.ja') }, { id: 'false', label: t('toggle.nej') }] : q.options;
      const cur = bool ? String(Boolean(val)) : String(val);
      const chips = opts.map((o) => `<label class="ak-chip"><input type="radio" name="${name}" value="${esc(o.id)}" data-q="${q.id}"${String(o.id) === cur ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('');
      const optHelp = opts.filter((o) => o.help).map((o) => `<p class="ak-q__help">${esc(o.label)}: ${esc(o.help)}</p>`).join('');
      return `<fieldset class="ak-q ak-q--chips"${desc}><legend class="ak-q__legend">${esc(q.label)}</legend><div class="ak-chips${q.widget === 'toggle' ? ' ak-chips--toggle' : ''}" data-chips="${q.id}">${chips}</div>${optHelp}${help}</fieldset>`;
    }
    case 'amount':
    case 'stepper': {
      const pct = q.id === 'kommunalskatt';
      const empty = val === null || val === undefined || (q.id === 'belopp' && !(val > 0)) || (q.id === 'arbete_kr' && val === null);
      const shown = empty ? '' : fmtInput(val, pct);
      const step = q.step || 1000;
      const steppers = pct ? '' : `<button type="button" class="ak-step" data-q="${q.id}" data-step="-1" aria-label="${esc(lc('ui.minska', { steg: group(step) }))}">${ICON_MINUS}</button><button type="button" class="ak-step" data-q="${q.id}" data-step="1" aria-label="${esc(lc('ui.oka', { steg: group(step) }))}">${ICON_PLUS}</button>`;
      const presets = q.presets ? `<div class="ak-presets" data-presets="${q.id}">${renderPresets(q)}</div>` : '';
      return `<div class="ak-q ak-q--amount"${desc}><label class="ak-q__legend" for="${name}" data-label="${q.id}">${esc(q.label)}</label><div class="ak-amount"><div class="ak-amount__field"><input class="ak-amount__input" id="${name}" type="text" inputmode="${pct ? 'decimal' : 'numeric'}" enterkeyhint="done" autocomplete="off" data-q="${q.id}" value="${shown}"><span class="ak-amount__unit">${pct ? '%' : 'kr'}</span></div>${steppers}</div>${presets}${help}</div>`;
    }
    case 'slider': {
      const v = Number(val) || 0;
      const pct = q.id === 'arbete';
      return `<div class="ak-q ak-q--slider"${desc}><label class="ak-q__legend" for="${name}">${esc(q.label)}</label><div class="ak-slider"><input type="range" id="${name}" data-q="${q.id}" min="${q.min}" max="${q.max}" step="${q.step}" value="${v}"><output for="${name}" class="ak-slider__out">${pct ? `${v}${NBSP}%` : formatKr(v)}</output></div>${help}</div>`;
    }
    case 'checkbox':
      return `<div class="ak-q ak-q--check"${desc}><label class="ak-check"><input type="checkbox" id="${name}" data-q="${q.id}"${val ? ' checked' : ''}><span>${esc(q.label)}</span></label>${help}</div>`;
    default:
      return '';
  }
}

function renderPresets(q) {
  const pres = (q.presets || []).map((p) => `<button type="button" class="ak-preset" data-q="${q.id}" data-preset="${p}">${group(p)}</button>`).join('');
  return `${pres}<button type="button" class="ak-preset ak-preset--annat" data-q="${q.id}" data-preset="annat">${esc(t('q.belopp.annat'))}</button>`;
}

function renderLines(lines) {
  return lines.map((l) => `<span class="ak-stmt__line">${esc(l)}</span>`).join('');
}

function renderQRow(mode, q, rv) {
  const sub = isSub(mode, q.id);
  const status = rv ? rv.status : 'neutral';
  const cls = ['ak-row', 'ak-row--q', `ak-row--${status}`, sub ? 'ak-row--sub' : '', q.folded ? 'ak-row--f' : '', q.id === 'belopp' ? 'ak-row--belopp' : '',
    rv && !sub && !rv.lines.length ? 'ak-row--nocond' : '', rv && rv.dim ? 'is-dim' : ''].filter(Boolean).join(' ');
  const cap = q.id === 'belopp' ? `<span class="ak-row__cap">${esc(lc('ui.avdrag_label'))}</span>` : '';
  const openLabel = q.id === 'belopp' ? lc('ui.andra_pris') : lc('ui.svara');
  return `<li class="${cls}" id="ak-${mode}-row-${q.id}" data-q="${q.id}"${q.shown ? '' : ' hidden'}>
<div class="ak-row__mark" aria-hidden="true">${MARKS_ALL}</div>
<div class="ak-row__cond">${cap}<button type="button" class="ak-row__stmt" data-focus="${rv ? rv.focus : q.id}" aria-controls="ak-${mode}-ans-${q.id}">${renderLines(rv ? rv.lines : [])}<span class="ak-row__open" aria-hidden="true">${esc(openLabel)}</span></button><span class="ak-row__tag"${rv && rv.tag ? '' : ' hidden'}>${esc(t('ui.antaget'))}</span></div>
<div class="ak-row__ans" id="ak-${mode}-ans-${q.id}">${renderControl(mode, q)}</div>
</li>`;
}

function renderCRow(v) {
  const link = v.fraga ? `<button type="button" class="ak-row__fix" data-fix="${v.fraga}">${esc(t('ui.stammer_inte'))}</button>` : '';
  return `<li class="ak-row ak-row--c ak-row--${v.status}${v.dim ? ' is-dim' : ''}" data-v="${v.id}"><div class="ak-row__mark" aria-hidden="true">${MARKS_ALL}</div><div class="ak-row__cond"><span class="ak-row__stmt ak-row__stmt--c">${esc(v.text)}</span>${v.status === 'antaget' ? `<span class="ak-row__tag">${esc(t('ui.antaget'))}</span>` : ''}</div><div class="ak-row__ans ak-row__ans--c">${link}</div></li>`;
}

function renderVerdict(mode, r, H2) {
  return `<div class="ak-verdict ak-verdict--${r.klass}" id="ak-${mode}-verdict"><div class="ak-verdict__mark" aria-hidden="true">${VERDICT_MARKS_ALL}</div><div class="ak-verdict__body"><span class="ak-eyebrow" id="ak-${mode}-eyebrow">${esc(r.eyebrow)}</span><${H2} class="ak-verdict__h" id="ak-${mode}-headline">${esc(r.headline.text)}</${H2}><p class="ak-verdict__ram" id="ak-${mode}-ram">${esc(r.ram.text)}</p></div></div>`;
}

function renderSum(mode, r) {
  const b = r.belopp;
  return `<div class="ak-sum${b.state === 'dold' ? ' is-empty' : ''}" id="ak-${mode}-sum"><p class="ak-h ak-sum__h">${esc(lc('ui.avdrag_label'))}</p><p class="ak-sum__rubrik" id="ak-${mode}-rubrik">${esc(b.rubrik)}</p><p class="ak-sum__bas" id="ak-${mode}-bas">${esc(b.bas_text)}</p><p class="ak-sum__betala" id="ak-${mode}-betala">${esc(b.att_betala_text || '')}</p><p class="ak-sum__kalla"><a href="#ak-${mode}-metod" data-open-metod>${esc(lc('ui.kalla'))}</a></p></div>`;
}

const stegItems = (r) => r.nasta_steg.map((s) => `<li>${esc(s.text)}</li>`).join('');
function renderSteg(mode, r, H2) {
  const items = stegItems(r);
  return `<section class="ak-steg" id="ak-${mode}-steg"${items ? '' : ' hidden'}><${H2} class="ak-h">${esc(t('ui.vad_hander_nu'))}</${H2}><ol class="ak-steg__list" id="ak-${mode}-steglist">${items}</ol></section>`;
}

function ctaInner(r) {
  const p = r.cta.primary; const s = r.cta.secondary;
  let prim = '';
  if (p && p.kind !== 'none' && p.labelKey) {
    const cls = p.solid ? 'ak-btn' : 'ak-link';
    if (p.kind === 'lage_byte') prim = `<button type="button" class="${cls}" data-cta="lage_byte">${esc(p.label)}</button>`;
    else prim = `<a class="${cls}" href="${esc(p.href)}" data-cta="${p.kind}"${p.kind === 'skatteverket' ? ' target="_blank" rel="noopener"' : ''}>${esc(p.label)}</a>`;
  }
  const sec = s && s.labelKey ? `<a class="ak-tel" href="${esc(s.href)}" data-cta="${s.kind}"${s.kind === 'skatteverket' ? ' target="_blank" rel="noopener"' : ''}>${esc(s.label)}</a>` : '';
  return prim + sec;
}
const renderCta = (mode, r) => `<div class="ak-cta" id="ak-${mode}-cta">${ctaInner(r)}</div>`;

function renderDela(mode, surface) {
  const print = surface === 'standalone' ? `<button type="button" class="ak-link ak-link--tool" data-print>${esc(t('ui.skriv_ut'))}</button>` : '';
  return `<div class="ak-dela" id="ak-${mode}-dela"><button type="button" class="ak-link ak-link--tool" data-share>${esc(t('ui.kopiera_lank'))}</button>${print}<span class="ak-dela__status" role="status" id="ak-${mode}-status"></span></div>`;
}

const metodItems = (r) => [...(r.skatt.text ? [r.skatt.text] : []), ...r.metod_text].map((l) => `<li>${esc(l)}</li>`).join('');
const renderMetod = (mode, r) => `<details class="ak-metod" id="ak-${mode}-metod"><summary>${esc(t('ui.sa_har_vi_raknat'))}</summary><ul class="ak-metod__list" id="ak-${mode}-metodlist">${metodItems(r)}</ul></details>`;

function renderStatic(mode) {
  const rot = mode === 'rot';
  const rate = rot ? PARAMS.ROT_SATS : PARAMS.GT_RATE.gt_laddbox;
  const tak = rot ? PARAMS.ROT_TAK : PARAMS.GT_TAK;
  const rows = [10_000, 20_000, 50_000, 100_000, 200_000].map((kr) => {
    const raw = kr * rate; const capped = Math.min(raw, tak);
    return `<tr><td>${formatKr(kr)}</td><td>${formatKr(capped)}${raw > tak ? ` (${esc(lc('ui.static.taket'))})` : ''}</td></tr>`;
  }).join('');
  return `<noscript><p class="ak-noscript">${esc(lc('ui.noscript'))}</p></noscript><table class="ak-static"><caption>${esc(lc(`ui.static.caption.${mode}`))}</caption><thead><tr><th>${esc(lc(`ui.static.th1.${mode}`))}</th><th>${esc(lc('ui.static.th2'))}</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderSticky(mode) {
  return `<div class="ak-sticky" id="ak-${mode}-sticky" hidden><div class="ak-sticky__text"><span class="ak-sticky__h" id="ak-${mode}-sticky-h"></span><span class="ak-sticky__b" id="ak-${mode}-sticky-b"></span></div><a class="ak-sticky__btn" id="ak-${mode}-sticky-btn" href="#ak-${mode}-besked">${esc(lc('ui.till_beskedet'))}</a></div>`;
}

export function renderTool({ mode, state, touched = new Set(), surface = 'standalone', hidden = false }) {
  const view = computeView(mode, state, touched);
  const { bank, result, rows, compact } = view;
  const embed = surface === 'embed';
  const H1 = embed ? 'h2' : 'h1'; const H2 = embed ? 'h3' : 'h2';
  const id = `ak-${mode}`;
  const lageQ = bank.find((q) => q.id === 'lage');
  const lage = lageQ ? `<fieldset class="ak-lage" id="${id}-lage"><legend class="ak-q__legend">${esc(lageQ.label)}</legend><div class="ak-seg" data-chips="lage">${lageQ.options.map((o) => `<label class="ak-seg__opt"><input type="radio" name="${mode}-lage" value="${o.id}" data-q="lage"${String(lageQ.effectiveValue) === o.id ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}</div></fieldset>` : '';
  const main = bank.filter((q) => q.id !== 'lage' && !q.folded).map((q) => renderQRow(mode, q, rows[q.id])).join('');
  const fold = bank.filter((q) => q.id !== 'lage' && q.folded).map((q) => renderQRow(mode, q, null)).join('');
  const crows = `<ol class="ak-rows ak-rows--c" id="${id}-crows">${compact.map(renderCRow).join('')}</ol>`;
  const details = `<details class="ak-details" id="${id}-details"><summary>${esc(t('ui.fler_detaljer'))}</summary><ol class="ak-rows ak-rows--f" id="${id}-frows">${fold}</ol></details>`;
  const core = `<div class="ak-besked__core" id="${id}-core">${renderSum(mode, result)}${embed ? '' : renderSteg(mode, result, H2)}${renderCta(mode, result)}</div>`;
  const besked = embed
    ? `<div class="ak-besked" id="${id}-besked">${core}<details class="ak-more" id="${id}-more"><summary>${esc(lc('ui.visa_villkoren'))}</summary>${crows}${details}${renderSteg(mode, result, H2)}${renderDela(mode, surface)}${renderMetod(mode, result)}</details></div>`
    : `<div class="ak-besked" id="${id}-besked">${core}${renderDela(mode, surface)}${renderMetod(mode, result)}</div>`;
  return `<section class="ak-tool" id="${id}" data-mode="${mode}" data-surface="${surface}" aria-labelledby="${id}-title"${hidden ? ' hidden' : ''}>
<div class="ak-card">
<header class="ak-head"><${H1} class="ak-title" id="${id}-title">${esc(lc(`ui.title.${mode}`))}</${H1}><p class="ak-lead">${esc(lc(`ui.lead.${surface}`))}</p></header>
${lage}
<div class="ak-board" id="${id}-board">
${renderVerdict(mode, result, H2)}
<p class="ak-sr" aria-live="polite" id="${id}-live"></p>
<ol class="ak-rows ak-rows--main" id="${id}-rows">${main}</ol>
${embed ? '' : crows}
${embed ? '' : details}
</div>
${besked}
${renderStatic(mode)}
</div>
<p class="ak-disclaimer">${esc(result.disclaimer)}</p>
<p class="ak-print-foot" id="${id}-printfoot" hidden></p>
${embed ? '' : renderSticky(mode)}
</section>`;
}

export function renderPage() {
  const rot = renderTool({ mode: 'rot', state: defaultState('rot') });
  const gt = renderTool({ mode: 'gt', state: defaultState('gt'), hidden: true });
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Villkorstavlan: ROT- och grön teknik-kollen (riktning A)</title>
<meta name="description" content="Wireframe, riktning A. Frågan och villkoret är samma rad; beskedet är summan av tavlan.">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="surface-standalone">
${SPRITE}
<nav class="demo" aria-label="Demo: byt läge och yta">
<span class="demo__name">${esc(lc('ui.demo.namn'))}</span>
<span class="demo__group"><a href="?m=rot" data-demo="m" data-val="rot">${esc(lc('ui.demo.rot'))}</a><a href="?m=gt" data-demo="m" data-val="gt">${esc(lc('ui.demo.gt'))}</a></span>
<span class="demo__group"><a href="?m=rot" data-demo="surface" data-val="standalone">${esc(lc('ui.demo.standalone'))}</a><a href="?m=rot&amp;surface=embed" data-demo="surface" data-val="embed">${esc(lc('ui.demo.embed'))}</a></span>
<a class="demo__back" href="../index.html">${esc(lc('ui.demo.alla'))}</a>
</nav>
<main class="page" id="page">
<article class="artikel" id="artikel" hidden>
<header class="artikel__head">
<div class="artikel__bild" aria-hidden="true"><span>${esc(lc('ui.artikel.bild'))}</span></div>
<h1 class="artikel__h1">${esc(lc('ui.artikel.h1'))}</h1>
<p class="artikel__ingress">${esc(lc('ui.artikel.ingress1'))}</p>
<p class="artikel__ingress">${esc(lc('ui.artikel.ingress2'))}</p>
</header>
<div class="artikel__slot" id="slot"></div>
<h2 class="artikel__h2" id="snabbfakta">${esc(lc('ui.artikel.snabbfakta'))}</h2>
<p class="artikel__body">${esc(lc('ui.artikel.body'))}</p>
</article>
<div class="ak-root" id="ak-root">
${rot}
${gt}
</div>
</main>
<script type="module" src="app.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------------------------------
// Webbläsaren: hydrering, live-omräkning, dela, remsa, URL, dataLayer-stub
// ---------------------------------------------------------------------------------------------------
const app = { mode: 'rot', surface: 'standalone', tools: {}, keepParams: [] };

function track(event, props) {
  if (typeof window === 'undefined') return;
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...props });
}
const bucket = (kr) => (kr < 10_000 ? '<10k' : kr < 25_000 ? '10k_25k' : kr < 50_000 ? '25k_50k' : kr < 100_000 ? '50k_100k' : '100k_plus');
const base = (tool) => ({ mode: tool.mode, lage: tool.view ? tool.view.result.lage : null, surface: app.surface, src: tool.src || 'organic' });
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const debounce = (fn, ms) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; };

function grab(tool) {
  const m = tool.mode; const $ = (s) => document.getElementById(`ak-${m}-${s}`);
  tool.section = document.getElementById(`ak-${m}`);
  tool.el = { rows: $('rows'), crows: $('crows'), frows: $('frows'), details: $('details'), verdict: $('verdict'), eyebrow: $('eyebrow'), headline: $('headline'), ram: $('ram'),
    sum: $('sum'), rubrik: $('rubrik'), bas: $('bas'), betala: $('betala'), steg: $('steg'), steglist: $('steglist'), cta: $('cta'), status: $('status'), metod: $('metod'), metodlist: $('metodlist'),
    live: $('live'), besked: $('besked'), core: $('core'), sticky: $('sticky'), stickyH: $('sticky-h'), stickyB: $('sticky-b'), stickyBtn: $('sticky-btn'), lage: $('lage'), more: $('more') };
  tool.rowEl = {};
  tool.section.querySelectorAll('.ak-row--q').forEach((li) => { tool.rowEl[li.dataset.q] = li; });
}

function setStatus(el, status, prefix = 'ak-row--') {
  STATUSES.forEach((s) => el.classList.toggle(`${prefix}${s}`, s === status));
}

function setFade(el, text) {
  if (el.textContent === text) return;
  if (reduced()) { el.textContent = text; return; }
  el.classList.add('is-fading');
  clearTimeout(el._fade);
  el._fade = setTimeout(() => { el.textContent = text; el.classList.remove('is-fading'); }, 140);
}

const NUM_RE = /\d[\d  ]*\d|\d/g;
function setAmountText(el, text, animate) {
  cancelAnimationFrame(el._raf || 0);
  const old = el.textContent;
  if (!animate || reduced() || old === text) { el.textContent = text; return; }
  const from = (old.match(NUM_RE) || []).map((s) => Number(s.replace(/\D/g, '')));
  const to = (text.match(NUM_RE) || []).map((s) => Number(s.replace(/\D/g, '')));
  if (!to.length || from.length !== to.length) { el.textContent = text; return; }
  const parts = text.split(NUM_RE);
  const start = performance.now(); const dur = 280;
  const frame = (now) => {
    const p = Math.min(1, (now - start) / dur); const e = 1 - (1 - p) ** 3;
    let s = '';
    parts.forEach((part, i) => { s += part; if (i < to.length) s += group(from[i] + (to[i] - from[i]) * e); });
    el.textContent = p < 1 ? s : text;
    if (p < 1) el._raf = requestAnimationFrame(frame);
  };
  el._raf = requestAnimationFrame(frame);
}

function reconcile(list, desired) {
  desired.forEach((node, i) => { const cur = list.children[i]; if (cur !== node) list.insertBefore(node, cur || null); });
}

function syncControl(tool, q, container) {
  const val = q.effectiveValue;
  switch (q.widget) {
    case 'chips':
    case 'toggle': {
      const bool = !(q.options && q.options.length);
      const cur = bool ? String(Boolean(val)) : String(val);
      container.querySelectorAll(`input[type="radio"][data-q="${q.id}"]`).forEach((r) => { const want = r.value === cur; if (r.checked !== want) r.checked = want; });
      break;
    }
    case 'amount':
    case 'stepper': {
      const input = container.querySelector(`input[data-q="${q.id}"]`);
      if (!input) break;
      const pct = q.id === 'kommunalskatt';
      const empty = val === null || val === undefined || (q.id === 'belopp' && !(val > 0));
      const want = empty ? '' : fmtInput(val, pct);
      if (document.activeElement !== input && input.value !== want) input.value = want;
      const label = container.querySelector(`[data-label="${q.id}"]`);
      if (label && label.textContent !== q.label) label.textContent = q.label;
      const pres = container.querySelector(`[data-presets="${q.id}"]`);
      if (pres) { const html = renderPresets(q); if (pres.dataset.sig !== String(q.presets)) { pres.innerHTML = html; pres.dataset.sig = String(q.presets); } }
      break;
    }
    case 'slider': {
      const input = container.querySelector(`input[data-q="${q.id}"]`);
      if (!input) break;
      const v = Number(val) || 0;
      if (document.activeElement !== input && Number(input.value) !== v) input.value = String(v);
      const out = container.querySelector('output');
      if (out) out.textContent = q.id === 'arbete' ? `${v}${NBSP}%` : formatKr(v);
      break;
    }
    case 'checkbox': {
      const input = container.querySelector(`input[data-q="${q.id}"]`);
      if (input && input.checked !== Boolean(val)) input.checked = Boolean(val);
      break;
    }
    default:
  }
}

function update(tool, { animate = false, first = false } = {}) {
  const view = computeView(tool.mode, tool.state, tool.touched);
  const { bank, result, rows, compact } = view;
  const prev = tool.view; tool.view = view;
  const E = tool.el;

  // 1. Radernas plats (huvudtavlan / Fler detaljer) och synlighet. Bara noder som står fel flyttas.
  const mainDesired = []; const foldDesired = [];
  for (const q of bank) {
    if (q.id === 'lage') { if (E.lage) syncControl(tool, q, E.lage); continue; }
    const row = tool.rowEl[q.id]; if (!row) continue;
    if (row.hidden !== !q.shown) row.hidden = !q.shown;
    (q.folded ? foldDesired : mainDesired).push(row);
  }
  reconcile(E.rows, mainDesired); reconcile(E.frows, foldDesired);

  // 2. Radernas innehåll: märke, villkorstext, "antaget", dämpning efter ett stopp
  for (const q of bank) {
    if (q.id === 'lage') continue;
    const row = tool.rowEl[q.id]; if (!row) continue;
    row.classList.toggle('ak-row--f', q.folded);
    syncControl(tool, q, row);
    if (!q.shown || q.folded) { row.classList.remove('is-dim'); continue; }
    const rv = rows[q.id];
    setStatus(row, rv.status);
    row.classList.toggle('ak-row--nocond', !rv.sub && !rv.lines.length);
    row.classList.toggle('is-dim', rv.dim);
    const stmt = row.querySelector('.ak-row__stmt');
    const html = `${renderLines(rv.lines)}<span class="ak-row__open" aria-hidden="true">${esc(q.id === 'belopp' ? lc('ui.andra_pris') : lc('ui.svara'))}</span>`;
    if (stmt.innerHTML !== html) stmt.innerHTML = html;
    stmt.dataset.focus = rv.focus;
    row.querySelector('.ak-row__tag').hidden = !rv.tag;
  }
  // 3. De kompakta villkorsraderna (inga reglage, kan ritas om)
  const chtml = compact.map(renderCRow).join('');
  if (E.crows.innerHTML !== chtml) E.crows.innerHTML = chtml;

  // 4. Beskedsremsan (summan av tavlan)
  KLASSER.forEach((k) => E.verdict.classList.toggle(`ak-verdict--${k}`, k === result.klass));
  E.eyebrow.textContent = result.eyebrow;
  if (first) E.headline.textContent = result.headline.text; else setFade(E.headline, result.headline.text);
  E.ram.textContent = result.ram.text;

  // 5. Beloppsraden under tavlan (fast höjd i CSS, count-up bara vid beloppsändring)
  const b = result.belopp;
  E.sum.classList.toggle('is-empty', b.state === 'dold');
  setAmountText(E.rubrik, b.rubrik, animate);
  E.bas.textContent = b.bas_text;
  setAmountText(E.betala, b.att_betala_text || '', animate);

  // 6. Vad händer nu, CTA, Så har vi räknat
  const sh = stegItems(result);
  if (E.steglist.innerHTML !== sh) E.steglist.innerHTML = sh;
  E.steg.hidden = !sh;
  const ch = ctaInner(result);
  if (E.cta.innerHTML !== ch) E.cta.innerHTML = ch;
  const mh = metodItems(result);
  if (E.metodlist.innerHTML !== mh) E.metodlist.innerHTML = mh;

  // 7. Skärmläsare, remsa, URL, mätning
  tool.announce(`${result.headline.text.replace(/[:.]$/, '')}. ${b.rubrik || ''}`.trim());
  syncSticky(tool);
  if (!first) tool.syncUrl();
  if (prev && prev.result.klass !== result.klass) {
    track('ampy_ak_verdict', { ...base(tool), class: result.klass, subtype: result.subtyp, amount_bucket: b.avdrag_kr ? bucket(b.avdrag_kr) : null, unknowns_n: result.counts.okanda, assumed_n: result.counts.antagna });
  }
}

function syncSticky(tool) {
  const E = tool.el; if (!E.sticky) return;
  const r = tool.view.result;
  E.stickyH.textContent = r.headline.text;
  E.stickyB.textContent = r.belopp.state === 'dold' ? '' : r.belopp.rubrik;
  const p = r.cta.primary;
  const mirror = tool.corePassed && p && p.solid && (p.kind === 'offert' || p.kind === 'lage_byte');
  if (mirror) { E.stickyBtn.textContent = p.label; E.stickyBtn.href = p.kind === 'lage_byte' ? '#rot' : p.href; E.stickyBtn.dataset.cta = p.kind; }
  else { E.stickyBtn.textContent = lc('ui.till_beskedet'); E.stickyBtn.href = `#ak-${tool.mode}-besked`; delete E.stickyBtn.dataset.cta; }
  const show = app.surface === 'standalone' && isMobile() && tool.interacted && !tool.coreVisible && !tool.section.hidden;
  if (E.sticky.hidden === show) { E.sticky.hidden = !show; }
  E.sticky.classList.toggle('is-in', show);
  document.body.classList.toggle('has-sticky', show);
}

function parseAmount(raw, pct) {
  const s = String(raw || '').trim();
  if (!s) return null;
  if (pct) { const n = Number(s.replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : null; }
  const digits = s.replace(/\D/g, '');
  return digits ? Number(digits) : null;
}

function clamp(q, v) { if (v === null) return null; const lo = q.min ?? 0; const hi = q.max ?? 1_000_000; return Math.min(hi, Math.max(lo, v)); }

function answer(tool, id, value, opts = {}) {
  tool.state[id] = value;
  tool.touched.add(id);
  tool.interacted = true;
  if (id === 'skatt' && value === 'lag' && tool.el.details) { tool.el.details.open = true; if (tool.el.more) tool.el.more.open = true; }   // UX §2.6: fördjupningen öppnas
  update(tool, { animate: Boolean(opts.animate) });
  if (id === 'lage') track('ampy_ak_mode_select', { ...base(tool), from: opts.from, to: value });
  else if (!opts.quiet) trackAnswer(tool, id, value);
}

function trackAnswer(tool, id, value) {
  let vb = value;
  if (id === 'belopp' || /_kr$/.test(id) || /^anvant/.test(id)) vb = value ? bucket(Number(value)) : 'tomt';
  if (/inkomst|lon_manad|pension_manad|rante|kommunalskatt/.test(id)) vb = 'angiven';
  track('ampy_ak_answer', { ...base(tool), question_id: id, value_bucket: String(vb) });
}
const trackAnswerSlow = debounce(trackAnswer, 400);

const isCompact = () => app.surface === 'embed' && isMobile();
/** Kompakt rad (artikel, mobil): öppnar radens svarskolumn, och värdradens underfrågor. Stannar öppen. */
function openRow(tool, id) {
  const host = HOST[tool.mode][id] || id;
  const ids = [host, ...Object.keys(HOST[tool.mode]).filter((k) => HOST[tool.mode][k] === host)];
  for (const k of ids) {
    const row = tool.rowEl[k]; if (!row) continue;
    row.classList.add('is-open');
    const stmt = row.querySelector('.ak-row__stmt'); if (stmt) stmt.setAttribute('aria-expanded', 'true');
  }
}
function syncCompact(tool) {
  const compact = isCompact();
  tool.section.classList.toggle('is-compact', compact);
  for (const row of Object.values(tool.rowEl)) {
    const stmt = row.querySelector('.ak-row__stmt'); if (!stmt) continue;
    if (compact && !row.classList.contains('ak-row--f')) stmt.setAttribute('aria-expanded', row.classList.contains('is-open') ? 'true' : 'false');
    else stmt.removeAttribute('aria-expanded');
  }
}

function focusQuestion(tool, id, { open = false } = {}) {
  const q = tool.view.qById[id]; const row = tool.rowEl[id]; if (!row) return;
  if ((q && q.folded) || open) { tool.el.details.open = true; if (tool.el.more) tool.el.more.open = true; }
  if (isCompact()) openRow(tool, id);
  const target = row.querySelector(`input[data-q="${id}"]:checked`) || row.querySelector(`input[data-q="${id}"]`) || row.querySelector('.ak-row__ans input, .ak-row__ans button');
  if (!target) return;
  if (isMobile()) row.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
  target.focus({ preventScroll: isMobile() });
}

function standaloneUrl(tool) {
  const q = encodeState(tool.mode, tool.state);
  const url = new URL(location.href);
  url.search = q;
  return url.toString();
}

async function share(tool) {
  const url = standaloneUrl(tool);
  const st = tool.el.status;
  if (isMobile() && navigator.share) {
    try { await navigator.share({ url }); track('ampy_ak_share', { ...base(tool), method: 'native' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); st.textContent = lc('ui.lank_kopierad'); }
  catch { st.textContent = url; }
  track('ampy_ak_share', { ...base(tool), method: 'clipboard' });
  clearTimeout(st._t); st._t = setTimeout(() => { st.textContent = ''; }, 4000);
}

function lageByte(tool) {
  const p = tool.view.result.cta.primary; if (!p || !p.byte) return;
  const to = app.tools[p.byte.mode]; if (!to) return;
  Object.assign(to.state, p.byte.state);
  for (const k of ['boende', 'skatt', 'agare']) if (tool.touched.has(k)) to.touched.add(k);
  to.interacted = true;
  update(to);
  track('ampy_ak_mode_select', { ...base(tool), from: `gt_${tool.view.result.lage}`, to: 'rot' });
  showMode(p.byte.mode);
  to.el.verdict.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
}

function bind(tool) {
  const S = tool.section; const E = tool.el;
  const qOf = (id) => tool.view.qById[id];
  // En redan vald chip ger inget change-event, men trycket är kundens bekräftelse (antaget -> bekräftat).
  // Därför svarar vi på click OCH change, idempotent: bara när värdet eller touched-läget ändras.
  const radioAnswer = (el) => {
    const id = el.dataset.q; const q = qOf(id); if (!q || !el.checked) return;
    const bool = !(q.options && q.options.length);
    let v = el.value; if (bool) v = v === 'true'; else if (id === 'agare') v = Number(v);
    if (tool.state[id] === v && tool.touched.has(id)) return;
    answer(tool, id, v, { from: id === 'lage' ? tool.view.result.lage : undefined });
  };
  S.addEventListener('click', (ev) => { const el = ev.target; if (el instanceof HTMLInputElement && el.type === 'radio' && el.dataset.q) radioAnswer(el); });
  S.addEventListener('change', (ev) => {
    const el = ev.target; const id = el.dataset.q; if (!id) return;
    const q = qOf(id); if (!q) return;
    if (el.type === 'radio') radioAnswer(el);
    else if (el.type === 'checkbox') answer(tool, id, el.checked);
    else if (el.classList.contains('ak-amount__input')) {
      const pct = id === 'kommunalskatt';
      let v = clamp(q, parseAmount(el.value, pct));
      if (id === 'belopp' && v === null) v = 0;
      el.value = v === null ? '' : fmtInput(v, pct);
      if (tool.state[id] !== v) answer(tool, id, v, { animate: true, quiet: true });
      trackAnswer(tool, id, v);
    }
  });
  S.addEventListener('input', (ev) => {
    const el = ev.target; const id = el.dataset.q; if (!id) return;
    const q = qOf(id); if (!q) return;
    if (el.type === 'range') { answer(tool, id, Number(el.value), { quiet: true }); trackAnswerSlow(tool, id, Number(el.value)); }
    else if (el.classList.contains('ak-amount__input')) {
      const pct = id === 'kommunalskatt';
      let v = clamp(q, parseAmount(el.value, pct));
      if (id === 'belopp' && v === null) v = 0;
      if (!pct && v !== null && String(v) !== el.value.replace(/\D/g, '')) el.value = fmtInput(v, false);  // klampat
      answer(tool, id, v, { animate: true, quiet: true });
      trackAnswerSlow(tool, id, v);
    }
  });
  S.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.classList && ev.target.classList.contains('ak-amount__input')) ev.target.blur(); });
  S.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-step],[data-preset],[data-focus],[data-fix],[data-share],[data-print],[data-open-metod],[data-cta]');
    if (!el || !S.contains(el)) return;
    if (el.dataset.step) {
      const id = el.dataset.q; const q = qOf(id); const input = S.querySelector(`input[data-q="${id}"]`);
      const cur = q.id === 'belopp' ? (tool.view.eff.belopp_tomt ? 0 : tool.view.eff.belopp) : (Number(q.effectiveValue) || 0);
      const v = clamp(q, cur + Number(el.dataset.step) * (q.step || 1000));
      input.value = fmtInput(v, false);
      answer(tool, id, v, { animate: true });
    } else if (el.dataset.preset) {
      const id = el.dataset.q; const input = S.querySelector(`input[data-q="${id}"]`);
      if (el.dataset.preset === 'annat') { input.focus(); input.select(); return; }
      const v = Number(el.dataset.preset); input.value = fmtInput(v, false);
      answer(tool, id, v, { animate: true });
    } else if (el.dataset.focus) { focusQuestion(tool, el.dataset.focus); }
    else if (el.dataset.fix) { focusQuestion(tool, el.dataset.fix, { open: true }); track('ampy_ak_expand', { ...base(tool), section: 'fler_detaljer' }); }
    else if (el.hasAttribute('data-share')) { share(tool); }
    else if (el.hasAttribute('data-print')) { E.metod.open = true; track('ampy_ak_share', { ...base(tool), method: 'print' }); window.print(); }
    else if (el.hasAttribute('data-open-metod')) { E.metod.open = true; }
    else if (el.dataset.cta) {
      const kind = el.dataset.cta; const r = tool.view.result;
      track('ampy_ak_cta_click', { ...base(tool), target: kind === 'lage_byte' ? 'mode_switch' : kind, class: r.klass, amount_bucket: r.belopp.avdrag_kr ? bucket(r.belopp.avdrag_kr) : null });
      if (kind === 'lage_byte') { ev.preventDefault(); lageByte(tool); }
    }
  });
  S.addEventListener('toggle', (ev) => {
    const d = ev.target; if (!(d instanceof HTMLDetailsElement) || !d.open) return;
    const section = d === E.details ? 'fler_detaljer' : d === E.metod ? 'sa_har_vi_raknat' : d === E.more ? 'visa_villkoren' : 'details';
    track('ampy_ak_expand', { ...base(tool), section });
  }, true);
  S.addEventListener('focusin', () => { tool.interacted = true; }, { once: true });

  // Skärmläsare: kort textform, 600 ms debounce (UX §9)
  tool.announce = debounce((text) => { E.live.textContent = text; }, 600);
  // URL: bara fristående, replaceState med 400 ms debounce; utm/gclid/fbclid bevaras (UX §7.2)
  tool.syncUrl = debounce(() => {
    if (app.surface !== 'standalone' || tool.section.hidden) return;
    const url = new URL(location.href);
    const q = new URLSearchParams(encodeState(tool.mode, tool.state, { src: tool.src }));
    for (const [k, v] of app.keepParams) q.set(k, v);
    url.search = q.toString();
    history.replaceState(null, '', url.toString());
  }, 400);

  // Sticky-remsan (bara fristående, bara mobil): efter första interaktionen, döljs när beskedet är >= 50 % synligt
  if (E.sticky && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        tool.coreVisible = en.intersectionRatio >= 0.5;
        tool.corePassed = !tool.coreVisible && en.boundingClientRect.bottom < 0;
      }
      syncSticky(tool);
    }, { threshold: [0, 0.5, 1] });
    io.observe(E.core);
    const firstRow = E.rows.querySelector('.ak-row');
    window.addEventListener('scroll', () => {
      if (!tool.interacted && firstRow && firstRow.getBoundingClientRect().bottom < 0) { tool.interacted = true; syncSticky(tool); }
    }, { passive: true });
    window.addEventListener('resize', () => syncSticky(tool));
  }
  window.addEventListener('resize', () => syncCompact(tool));
}

function showMode(mode) {
  app.mode = mode;
  for (const m of Object.keys(app.tools)) app.tools[m].section.hidden = m !== mode;
  document.querySelectorAll('.demo a[data-demo]').forEach((a) => {
    const tool = app.tools[mode];
    const key = a.dataset.demo; const val = a.dataset.val;
    const m = key === 'm' ? val : mode; const s = key === 'surface' ? val : app.surface;
    const q = new URLSearchParams({ m });
    if (m === 'gt') q.set('l', (key === 'm' ? app.tools.gt : tool).state.lage || 'laddbox');
    if (s === 'embed') q.set('surface', 'embed');
    a.href = `?${q.toString()}`;
    const current = (key === 'm' && val === mode) || (key === 'surface' && val === app.surface);
    if (current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (app.tools[mode].syncUrl) app.tools[mode].syncUrl();
  syncSticky(app.tools[mode]);
}

function init() {
  const params = new URLSearchParams(location.search);
  const link = decodeState(location.search);
  const surface = params.get('surface') === 'embed' ? 'embed' : 'standalone';
  const mode = link.mode || 'rot';
  app.surface = surface;
  app.keepParams = [...params.entries()].filter(([k]) => /^utm_/.test(k) || k === 'gclid' || k === 'fbclid' || k === 'surface');
  document.body.classList.remove('surface-standalone', 'surface-embed');
  document.body.classList.add(`surface-${surface}`);

  const root = document.getElementById('ak-root');
  if (surface === 'embed') {
    // Embed: attrappen av artikeln runt verktyget. I produktion server-renderas ytan; här ritar JS om verktyget för H2/H3 och det kompakta kortet.
    const art = document.getElementById('artikel');
    art.hidden = false;
    document.getElementById('slot').appendChild(root);
  }
  for (const m of ['rot', 'gt']) {
    const state = { ...defaultState(m), ...(link.mode === m ? link.state : {}) };
    const tool = { mode: m, state, touched: new Set(), prefilled: link.mode === m ? link.prefilled : [], src: link.src, interacted: false, coreVisible: false, corePassed: false };
    if (surface === 'embed') {
      const old = document.getElementById(`ak-${m}`);
      old.outerHTML = renderTool({ mode: m, state, surface, hidden: m !== mode });
    }
    grab(tool);
    bind(tool);
    app.tools[m] = tool;
    update(tool, { first: true });
    syncCompact(tool);
  }
  showMode(mode);
  window.addEventListener('beforeprint', () => {
    const T = app.tools[app.mode]; if (!T) return;
    if (T.el.metod) T.el.metod.open = true;
    const foot = document.getElementById(`ak-${T.mode}-printfoot`);
    if (foot) { foot.textContent = lc('ui.utskrift', { datum: new Date().toISOString().slice(0, 10), url: standaloneUrl(T) }); foot.hidden = false; }
  });
  window.addEventListener('afterprint', () => { document.querySelectorAll('.ak-print-foot').forEach((f) => { f.hidden = true; }); });
  const T = app.tools[mode];
  track('ampy_ak_view', { ...base(T), prefilled: T.prefilled.length > 0, params_n: T.prefilled.length });
  if (T.prefilled.length && isMobile()) T.el.verdict.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });   // UX §7.2 punkt 3
  window.__ak = app;   // för Playwright-proben
}

if (typeof document !== 'undefined' && document.getElementById('ak-root')) init();
