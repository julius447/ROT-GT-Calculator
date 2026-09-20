#!/usr/bin/env node
/*
 * paketera.mjs: bygger WordPress-paketet (FluentSnippets) för Avdragskollen ur kalkylator/v1 + kalkylator/system.
 *
 *   node produktion/_build/paketera.mjs            (från repo-roten; skriptet hittar roten själv)
 *
 * FORMAT-KONTRAKT, ALDRIG DESIGNKONTRAKT: ingen pixel, vikt, färg eller ord ändras. Skriptet plockar rader ur
 * källfilerna, prefixar selektorer med .ampy-avdragskollen, löser designsystemets tokens till literaler på wrappern,
 * gör rem -> px (1 rem = 10 px), gör app.js root-scopad (multi-instans) och lägger markupen i en shortcode.
 * Planen: research/14-slutgranskning-kod.md §3. Deterministiskt: samma källor -> samma bytes (inga tidsstämplar).
 *
 * Skriver:
 *   produktion/dist/styles.css                 CSS-snippet  (FluentSnippets: CSS, Frontend, wp_head)
 *   produktion/dist/engine.js                  JS-snippet   (FluentSnippets: JS, Frontend, wp_footer)
 *   produktion/dist/backend.php                PHP-snippet  (FluentSnippets: Functions/PHP, Frontend & Backend)
 *   produktion/dist/fonts/Outfit-VariableFont_wght.woff2   reserv + preview (sajten har samma bytes)
 *   produktion/preview/index.html              två instanser (rot + gt) mot dist/ BY REFERENCE
 *   produktion/preview/host-sim.html           samma + sajtens riktiga värd-CSS (research/underlag/14-kod/host-*.css)
 *   produktion/_build/host-rules-2026-09-20.css   värdreglerna som host-sim länkar
 *
 * Bygget VÄGRAR om resultatet innehåller :root, html{, body{, rem, googleapis, gstatic, jsdelivr eller en oprefixad
 * selektor utanför @font-face/@keyframes, om en token löser ut till rem, eller om en väntad källrad saknas.
 * Finns php lokalt körs dessutom `php -l` och ett byte-diff mellan PHP:s shortcode-utdata och preview-markupen.
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));            // produktion/_build
const OUT = dirname(HERE);                                        // produktion
const ROOT = dirname(OUT);                                        // repo-roten
const SRC = {
  html: 'kalkylator/v1/index.html',
  css: 'kalkylator/v1/style.css',
  app: 'kalkylator/v1/app.js',
  rakna: 'kalkylator/rakna.js',
  engine: 'logik/engine.js',
  tokens: 'kalkylator/system/tokens.css',
  base: 'kalkylator/system/base.css',
  text: 'kalkylator/system/components/text.css',
  ytor: 'kalkylator/system/components/ytor.css',
  falt: 'kalkylator/system/components/falt.css',
  knappar: 'kalkylator/system/components/knappar.css',
  inbaddad: 'kalkylator/artikel/bas-inbaddad.css',
  artikel: 'kalkylator/artikel/artikel.css',
  font: 'kalkylator/system/fonts/Outfit-VariableFont_wght.woff2',
};
const HOST = {
  theme: 'research/underlag/14-kod/host-theme-style-ampy-2026-09-20.min.css',
  global: 'research/underlag/14-kod/host-14-global-css-2026-09-20.css',
  bricks: 'research/underlag/14-kod/host-bricks-frontend-light-layer-2026-09-20.min.css',
  klon: 'kalkylator/artikel/index.html',                          // core-framework-inline (--aptext-* m.fl.) hämtad 2026-09-15
};

const PAKET_VERSION = '1.0.0';
const WRAP = '.ampy-avdragskollen';                                // wrappern som bär tokens + basen
const OUTER = '.ampy-avdragskollen-outer';                         // container-query-behållaren
const FONT_SITE = '/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2';   // K1: sajtens egen fil (samma bytes)
const FONT_SHA256 = '99bd3f38d4854dbb296b53fb55c0956891e0111ccc86053966b7e99d6f99c162';
const NOSCRIPT = 'Kalkylatorn räknar i din webbläsare och behöver JavaScript.';   // K7

const fail = (msg) => { console.error('\nBYGGET STOPPAT: ' + msg); process.exit(1); };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const read = (p) => readFile(join(ROOT, p), 'utf8');
const log = [];
const note = (s) => { log.push(s); console.log(s); };

/* =====================================================================================================================
   1. CSS-verktyg: en liten vandrare som hittar regler, prefixar selektorer och kan plocka/slänga regler
   ===================================================================================================================== */

/** Index för den } som matchar { på openIdx; hoppar över strängar och kommentarer. */
function matchBrace(css, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < css.length; i++) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { i = css.indexOf('*/', i + 2) + 1; continue; }
    if (c === '"' || c === "'") { const q = c; i++; while (i < css.length && css[i] !== q) { if (css[i] === '\\') i++; i++; } continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('obalanserade klamrar');
}

/** Delar en selektorlista på kommatecken utanför parenteser (":is(a, b)" hålls ihop). */
function splitSelectors(list) {
  const out = []; let depth = 0, cur = '';
  for (const c of list) {
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Prefixar EN selektor: ":where(.ampy) X" / ".ampy X" / "X" -> ".ampy-avdragskollen X". Enhetligt +(0,1,0). */
function prefixOne(sel) {
  let m;
  if ((m = sel.match(/^:where\(\.ampy\)\s*(.*)$/))) return m[1] ? `${WRAP} ${m[1]}` : WRAP;
  if ((m = sel.match(/^\.ampy(?![\w-])\s*(.*)$/))) return m[1] ? `${WRAP} ${m[1]}` : WRAP;
  return `${WRAP} ${sel}`;
}

/**
 * Vandrar css-texten. opts.rule(selectorList, body, atStack) -> ny selektorlista (sträng) eller null (regeln slängs).
 * opts.at(prelude, atStack) -> true/false (behåll/släng hela at-blocket). opts.comments: false = släng kommentarer.
 * Text mellan reglerna (blanksteg, radbrytningar) bevaras; slängs en regel slängs också dess efterföljande radkommentar.
 */
function walkCss(css, opts, atStack = []) {
  let out = ''; let i = 0;
  const dropTrailing = () => {                                    // efter slängd regel: "   /* kommentar */\n" bort
    let j = i; while (j < css.length && (css[j] === ' ' || css[j] === '\t')) j++;
    if (css.startsWith('/*', j)) j = css.indexOf('*/', j) + 2;
    while (j < css.length && (css[j] === ' ' || css[j] === '\t')) j++;
    if (css[j] === '\n') j++;
    i = j;
  };
  while (i < css.length) {
    if (css.startsWith('/*', i)) { const e = css.indexOf('*/', i) + 2; if (opts.comments !== false) out += css.slice(i, e); i = e; continue; }
    if (/\s/.test(css[i])) { out += css[i]; i++; continue; }
    const open = css.indexOf('{', i); const semi = css.indexOf(';', i);
    if (semi !== -1 && (open === -1 || semi < open)) {           // @import/@charset-sats
      const stmt = css.slice(i, semi + 1); i = semi + 1;
      if (opts.statement !== false) out += stmt; else dropTrailing();
      continue;
    }
    if (open === -1) { out += css.slice(i); break; }
    const prelude = css.slice(i, open).trim();
    const close = matchBrace(css, open);
    const inner = css.slice(open + 1, close);
    i = close + 1;
    if (prelude.startsWith('@')) {
      const name = prelude.split(/[\s({]/)[0];
      const keep = opts.at ? opts.at(prelude, atStack) : true;
      if (!keep) { dropTrailing(); continue; }
      if (name === '@font-face' || /keyframes$/.test(name)) { out += prelude + ' {' + inner + '}'; continue; }
      const innerOut = walkCss(inner, opts, [...atStack, prelude]);
      if (innerOut.trim()) out += prelude + ' {' + innerOut + '}'; else dropTrailing();
      continue;
    }
    const sel2 = opts.rule(prelude, inner, atStack);
    if (sel2 === null) { dropTrailing(); continue; }
    out += sel2 + ' {' + inner + '}';
  }
  return out;
}

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** rem -> px vid 1 rem = 10 px, bara utanför kommentarer. Returnerar [css, träffar]. */
function remToPx(css) {
  const hits = [];
  const parts = css.split(/(\/\*[\s\S]*?\*\/)/);
  for (let k = 0; k < parts.length; k++) {
    if (parts[k].startsWith('/*')) continue;
    parts[k] = parts[k].replace(/(?<![\w.-])(-?\d*\.?\d+)rem\b/g, (m, n) => {
      const px = Math.round(parseFloat(n) * 10 * 10000) / 10000;
      const s = String(px) + 'px'; hits.push(`${m} -> ${s}`); return s;
    });
  }
  return [parts.join(''), hits];
}

/* =====================================================================================================================
   2. Tokens: lös --ampy-* ur tokens.css; lager 1 (--ap*) blir literaler, --ampy-* som pekar på --ampy-* behålls
   ===================================================================================================================== */
function tokenMap(tokensCss) {
  const map = {};
  for (const m of stripComments(tokensCss).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map[m[1]] = m[2].trim();
  return map;
}
function buildTokenBlock(tokensCss, shippedCss) {
  const map = tokenMap(tokensCss);
  const wanted = new Set();
  for (const m of stripComments(shippedCss).matchAll(/var\((--ampy-[\w-]+)/g)) wanted.add(m[1]);
  const resolveLager1 = (v, depth = 0) => {
    if (depth > 16) fail('token-rekursion för djup: ' + v);
    return v.replace(/var\((--[\w-]+)(?:\s*,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (m, name, fb) => {
      if (name.startsWith('--ampy-')) { wanted.add(name); return m; }              // behåll referensen, ta med tokenen
      if (map[name] === undefined) { if (fb !== undefined) return fb; fail(`odefinierad token ${name} (i "${v}")`); }
      return resolveLager1(map[name], depth + 1);
    });
  };
  const values = {};
  let size;
  do {                                                            // stängning: nya --ampy-* kan dyka upp under upplösning
    size = wanted.size;
    for (const name of [...wanted]) {
      if (values[name] !== undefined) continue;
      if (map[name] === undefined) fail(`token ${name} används men finns inte i tokens.css`);
      values[name] = resolveLager1(map[name]);
    }
  } while (wanted.size !== size);
  const names = [...wanted].sort();
  for (const n of names) {
    if (/\brem\b/.test(values[n])) fail(`token ${n} löser ut till rem: ${values[n]}`);
    if (/var\(--(?!ampy-)/.test(values[n])) fail(`token ${n} har kvar en lager-1-referens: ${values[n]}`);
  }
  const grupp = (n) => /^--ampy-(bg|ink|action|error|focus|line|field-track|shadow)/.test(n) ? 'ytor, bläck, linjer, skuggor'
    : /^--ampy-(radius|field-)/.test(n) ? 'radier och fält'
    : /^--ampy-(dur|ease)/.test(n) ? 'rörelse'
    : /^--ampy-(font|text|w-|lh|ls|measure)/.test(n) ? 'typografi'
    : 'avstånd';
  const grupper = {};
  for (const n of names) (grupper[grupp(n)] ||= []).push(n);
  let block = '';
  for (const g of ['ytor, bläck, linjer, skuggor', 'radier och fält', 'rörelse', 'typografi', 'avstånd']) {
    if (!grupper[g]) continue;
    block += `  /* ${g} */\n`;
    for (const n of grupper[g]) block += `  ${n}: ${values[n]};\n`;
  }
  return { block, names, values };
}

/* =====================================================================================================================
   3. Regelurval ur designsystemet: bara det som träffar kalkylatorns markup, i källfilens ordning
   ===================================================================================================================== */
const ELEMENT_I_MARKUP = new Set(['*', '*::before', '*::after', 'svg', 'button', 'input', 'h2', 'h3', 'p']);
const KAN_ALDRIG_TRAFFA = /ampy-on-dark|ampy--dark|ampy-section--dark|ampy-card--|ampy-frame|ampy-band|ampy-segment--|ampy-link--|ampy-textarea|ampy-select|ampy-field\b|ampy-fields|ampy-chip|ampy-stepper|ampy-range|ampy-check|ampy-eyebrow--|ampy-focus|ampy-readout|ampy-search|ampy-segment__option|aria-invalid|is-invalid|is-focus|is-selected|is-hover|aria-pressed|aria-checked|:disabled|aria-disabled|is-disabled|--sm\b|--lg\b|type="number"|::-webkit|> button|ampy-display|ampy-h1|ampy-h3|ampy-lead|ampy-body|ampy-small|ampy-label|ampy-button-text|ampy-container|ampy-section/;
const KOMPONENT_START = /^\.ampy-(input--tabular|input|segment|link|card|eyebrow|number|h2)(?![\w-])/;   // --tabular är den enda modifieraren i markupen

/** Plockar ur en systemfil de regler vars selektorer kan träffa markupen. Returnerar { css, tog: [], slangde: [] }. */
function pickSystemRules(css, fileTag, extraKeep = () => false) {
  const tog = [], slangde = [];
  const out = walkCss(css, {
    comments: false, statement: false,
    at: (prelude) => /^@(media|container|supports)/.test(prelude),   // @font-face ur base.css skeppas i egen form (block 1)
    rule: (list, body, atStack) => {
      const sels = splitSelectors(list);
      const kept = sels.filter((s) => {
        if (KAN_ALDRIG_TRAFFA.test(s)) return false;
        if (KOMPONENT_START.test(s)) return true;
        if (ELEMENT_I_MARKUP.has(s)) return true;
        let m;
        if ((m = s.match(/^:where\(\.ampy\)\s*(.*)$/))) return ['p', '::selection', ':focus-visible'].includes(m[1]);
        if ((m = s.match(/^\.ampy\s+(.*)$/))) return ['*', '*::before', '*::after'].includes(m[1]);
        return extraKeep(s, atStack);
      });
      const at = atStack.length ? atStack.join(' ') + ' { ' : '';
      if (!kept.length) { slangde.push(`[${fileTag}] ${at}${norm(list)}`); return null; }
      const dropped = sels.filter((s) => !kept.includes(s));
      tog.push(`[${fileTag}] ${at}${kept.join(', ')}${dropped.length ? '   (utan: ' + dropped.join(', ') + ')' : ''}`);
      return kept.map(prefixOne).join(', ');
    },
  });
  // städning: källkommentarer bort (de talar om andra byggen), radslutsblanksteg bort, tomma rader bort, }-rader till kolumn 0
  const css2 = stripComments(out).split('\n').map((l) => l.trimEnd()).filter((l) => l.trim()).join('\n').replace(/\n[ \t]*\}/g, '\n}');
  return { css: css2, tog, slangde };
}

/** Hämtar deklarationer ur en namngiven regel (första träffen på exakt selektorlista). */
function ruleBody(css, selectorList) {
  let found = null;
  walkCss(css, { comments: false, rule: (list, body) => { if (found === null && norm(list) === norm(selectorList)) found = body; return null; } });
  if (found === null) fail(`regeln "${selectorList}" hittades inte`);
  return found;
}
function declarations(body) {
  return stripComments(body).split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const i = d.indexOf(':'); return [d.slice(0, i).trim(), d.slice(i + 1).trim()]; });
}

/* =====================================================================================================================
   4. JS-verktyg: plocka deklarationer ur ES-moduler på namn (med JSDoc-kommentaren ovanför)
   ===================================================================================================================== */
function extractDecl(src, name) {
  const re = new RegExp(`^(?:export\\s+)?(?:function|const)\\s+${name}\\b`, 'm');
  const m = src.match(re);
  if (!m) fail(`hittar inte "${name}" i källan`);
  let start = m.index;
  // ta med kommentarblock direkt ovanför (utan tom rad emellan)
  for (;;) {
    const before = src.slice(0, start);
    const prevEnd = before.replace(/[ \t]*$/, '');
    if (!prevEnd.endsWith('*/\n')) break;
    const cStart = prevEnd.lastIndexOf('/*');
    const lineStart = prevEnd.lastIndexOf('\n', cStart - 1) + 1;
    if (prevEnd.slice(lineStart, cStart).trim() !== '') break;
    start = lineStart;
  }
  // slutet: function = matchande } efter parameterlistan; const = första ; på djup 0 efter =
  const declStart = m.index + m[0].length;
  let end;
  if (/function/.test(m[0])) {
    const paren = src.indexOf('(', declStart);
    const parenEnd = scanJs(src, paren, (c, depth) => c === ')' && depth === 0);
    const open = src.indexOf('{', parenEnd);
    end = scanJs(src, open, (c, depth) => c === '}' && depth === 0) + 1;
  } else {
    end = scanJs(src, src.indexOf('=', declStart) + 1, (c, depth) => c === ';' && depth === 0) + 1;
  }
  end = src.indexOf('\n', end); if (end === -1) end = src.length;        // t.o.m. radslut (radkommentar följer med)
  return src.slice(start, end).replace(/^export\s+/m, '');
}
/**
 * Går genom JS från index `from`, hoppar över kommentarer, strängar, mallsträngar och regex-literaler, räknar
 * (){}[]-djup och returnerar index för första tecknet där stop(c, djupEfterTecknet) är sant.
 */
function scanJs(src, from, stop) {
  let depth = 0; let prevSig = '';                                  // prevSig = senaste betydande tecknet (för regex-heuristiken)
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i) - 1; continue; }
    if (c === '"' || c === "'" || c === '`') { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } prevSig = q; continue; }
    if (c === '/' && /[=(,;!&|?:{}\[]/.test(prevSig)) {             // regex-literal (aldrig division efter de här tecknen)
      i++; while (i < src.length && src[i] !== '/') { if (src[i] === '\\') i++; else if (src[i] === '[') { while (src[i] !== ']') { if (src[i] === '\\') i++; i++; } } i++; }
      prevSig = '/'; continue;
    }
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    if (stop(c, depth)) return i;
    if (!/\s/.test(c)) prevSig = c;
  }
  throw new Error('scanJs: nådde slutet utan stopp');
}
function stripJsComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''); }
/** Exakt-en-gång-byten: varje "from" måste finnas exakt en gång, annars stoppar bygget (källan har ändrats). */
function replaceExact(src, table, what) {
  for (const [from, to] of table) {
    const n = src.split(from).length - 1;
    if (n !== 1) fail(`${what}: väntade exakt 1 träff på ${JSON.stringify(from.slice(0, 70))}, fick ${n}`);
    src = src.replace(from, () => to);
  }
  return src;
}

/* =====================================================================================================================
   5. Markup: sektionen ur index.html, platshållare, id-prefix per instans (samma regex som PHP:n)
   ===================================================================================================================== */
function extractSection(html) {
  const a = html.indexOf('<section class="ampy-card rk"');
  const b = html.indexOf('</section>', a);
  if (a === -1 || b === -1) fail('hittar inte <section class="ampy-card rk"> i index.html');
  const lineStart = html.lastIndexOf('\n', a) + 1;
  return html.slice(lineStart, b + '</section>'.length);
}
function prefixIds(html, uid) {
  return html.replace(/\b(id|for|name|aria-labelledby|aria-describedby)="([^"]*)"/g, (m, attr, v) =>
    `${attr}="${v.trim().split(/\s+/).filter(Boolean).map((t) => `${uid}-${t}`).join(' ')}"`);
}
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

/** Node-tvilling till ampy_avdragskollen_shortcode() i backend.php: samma DOM byte för byte (kontrolleras mot php nedan). */
function renderShortcode(markup, { mode = 'rot', heading = null, heading_level = '2' } = {}, uid) {
  mode = String(mode).trim().toLowerCase() === 'gt' ? 'gt' : 'rot';
  const namn = '<span class="rk__ihop">' + (mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag') + '</span>';   // = index.html:15/178 + app.js skriv()
  const nivaa = String(heading_level) === '3' ? 'h3' : 'h2';
  let html = prefixIds(markup, uid);
  html = html.split('{{MODE}}').join(mode).split('{{NAMN}}').join(namn);
  const rubrik = heading === null ? 'Räkna ut ditt ' + namn : escHtml(String(heading).trim());
  let rubrikHtml;
  if (rubrik === '') {
    html = html.replace(`aria-labelledby="${uid}-rk-rubrik"`, `aria-label="${escHtml('Räkna ut ditt ' + (mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag'))}"`);
    rubrikHtml = '';
  } else {
    rubrikHtml = `  <${nivaa} class="ampy-h2 rk__rubrik" id="${uid}-rk-rubrik">${rubrik}</${nivaa}>\n`;
  }
  return `<div class="${OUTER.slice(1)}"><div class="${WRAP.slice(1)}" lang="sv" data-mode="${mode}">\n`
    + rubrikHtml + html + '\n'
    + `  <noscript><p class="rk__under">${NOSCRIPT}</p></noscript>\n`
    + '</div></div>';
}

/* =====================================================================================================================
   BYGGET
   ===================================================================================================================== */
const src = {};
for (const [k, p] of Object.entries(SRC)) src[k] = k === 'font' ? await readFile(join(ROOT, p)) : await read(p);
const srcSha = Object.fromEntries(Object.entries(SRC).map(([k, p]) => [p, sha(src[k])]));

/* ---------- 1. dist/styles.css ---------- */
const tog = [], slangde = [];

// Block 3: scopad reset ur base.css (formen ur bas-inbaddad.css, bara elementen som finns i markupen)
// Block 4: rollklasser .ampy-h2/.ampy-eyebrow/.ampy-number, sedan :where(.ampy) p / ::selection / :focus-visible, reduced motion
const base = pickSystemRules(src.base, 'base');
tog.push(...base.tog); slangde.push(...base.slangde);
// Block 5: komponenter i filordning
const text = pickSystemRules(src.text, 'text');
const ytor = pickSystemRules(src.ytor, 'ytor');
const falt = pickSystemRules(src.falt, 'falt');
const knappar = pickSystemRules(src.knappar, 'knappar');
for (const f of [text, ytor, falt, knappar]) { tog.push(...f.tog); slangde.push(...f.slangde); }

// Block 6: style.css utan demosidans regler (.rk-sida, .rk-spalt, .rk-behallare) och utan sidans mobil-@media
const DEMO = /^\.rk-(sida|spalt|behallare)\b/;
const styleTog = [];
let styleCss = walkCss(src.css, {
  rule: (list, body, atStack) => {
    const sels = splitSelectors(list);
    const kept = sels.filter((s) => !DEMO.test(s));
    if (!kept.length) { slangde.push('[style] ' + norm(list)); return null; }
    if (kept.length !== sels.length) fail('style.css: blandad demo/kalkylator-selektorlista: ' + list);
    styleTog.push(norm(list));
    return kept.map(prefixOne).join(', ');
  },
});
if (!styleTog.includes('.rk__rubrik')) fail('style.css: .rk__rubrik saknas');
if (styleTog.some((s) => /rk-(sida|spalt|behallare)/.test(s))) fail('style.css: demoregel slank igenom');
styleCss = styleCss.replace(/^\/\* Avdragskollen v1[\s\S]*?\*\/\n\n/, '');            // filhuvudet (talar om demosidan) ersätts av paketets eget
styleCss = styleCss.replace(/^\/\* ---------- Sidan: artikelspalten[^\n]*\n\s*/m, ''); // rubrikkommentaren till de slängda demoreglerna
styleCss = styleCss.replace(/\n{3,}/g, '\n\n').trim();
for (const must of ['.rk [hidden]', '@container rk (max-width: 719px)', '@supports not (container-type: inline-size)', '@keyframes rk-in', 'flex: 0 0 140px']) {
  if (!styleCss.includes(must)) fail(`style.css-blocket saknar "${must}"`);
}

// Block 2: wrapper + tokens (lösta) + basen (:where(.ampy) + body:s font-smoothing/text-rendering)
const whereAmpy = declarations(ruleBody(src.base, ':where(.ampy)'));
const bodyDecl = declarations(ruleBody(src.base, 'body')).filter(([p]) => ['-webkit-font-smoothing', 'text-rendering'].includes(p));
if (bodyDecl.length !== 2) fail('base.css body: font-smoothing/text-rendering saknas');
const basDecl = [...whereAmpy, ...bodyDecl].map(([p, v]) => `${p}: ${v};`).join(' ');

const shippedForTokens = [base.css, text.css, ytor.css, falt.css, knappar.css, styleCss, basDecl].join('\n');
const tokens = buildTokenBlock(src.tokens, shippedForTokens);

// Block 1: @font-face ur base.css med sajtens sökväg (K1)
const fontFaceSrc = src.base.match(/@font-face \{[\s\S]*?\}/)[0];
const fontFace = fontFaceSrc.replace(/url\("[^"]*"\)/g, `url("${FONT_SITE}")`);
if (!fontFace.includes('font-weight: 100 900')) fail('@font-face: variabel vikt saknas');

// Block 7: värdskydd (artikel.css:35-37 + 41 utan box-shadow-raden, plus fokus-motreglerna ur research/14 §3.2 block 7)
const artikelSkydd = ['fieldset', 'legend', 'label', 'button'].map((el) => {
  let body = ruleBody(src.artikel, `.ampy-kalkylator ${el}`).replace('letter-spacing: 0', 'letter-spacing: normal');   // normal = v1:s datorvärde (0 ritar likadant)
  if (el === 'legend') body += ' max-width: none;';        // Bricks: legend{max-width:100%}; v1 = none (ingen pixel, men samma datorvärde)
  if (el === 'button') body += ' text-align: center; appearance: auto;';   // Bricks: button{text-align:inherit; -webkit-appearance:button}; v1 = UA-standarden (bakgrund/kant är redan 0: ingen pixel)
  return `${WRAP} ${el} {${body} }`;
}).join('\n');
const block7 = `/* ---------- Skydd mot värdsidans element-regler ----------
   Bricks frontend ligger i @layer bricks och förlorar mot allt ovan, men label{margin-bottom:5px} träffar en egenskap vi
   inte sätter, och sajtens egen snippet "14-global-css" sätter input:focus{border-color:#5EB1BF!important} (olagrad,
   !important). Bevis: research/14 §2.1 M1-M2, §3.2 block 7. Värdena = v1:s egna (falt.css:79), ingen pixel ändras. */
${artikelSkydd}
${WRAP} .rk__input:focus { border-color: var(--ampy-line-strong) !important; }              /* fokus utan tangentbord: samma kant som i vila (som i v1) */
${WRAP} .rk__input:focus-visible { border-color: var(--ampy-action-strong) !important; }     /* tangentbordsfokus: teal-deep (falt.css:79) */`;

const header = `/* =====================================================================================================================
   AVDRAGSKOLLEN (ROT / grön teknik), FluentSnippets snippet 1/3, typ "CSS". Kör: Frontend, wp_head. Paket ${PAKET_VERSION}.
   FORMAT-ONLY: byggd ur kalkylator/v1/style.css + kalkylator/system av produktion/_build/paketera.mjs. Redigera aldrig
   här: ändra källorna och kör "node produktion/_build/paketera.mjs" + "node produktion/_build/paritet.mjs".
   Allt ligger under .ampy-avdragskollen (tokens på wrappern, inga :root/html/body, 0 rem, @container för layouten).
   Typsnittet: sajtens egen Outfit-fil (${FONT_SITE}, sha256 ${FONT_SHA256.slice(0, 8)}…), samma bytes som dist/fonts/.
   ===================================================================================================================== */`;

let styles = `${header}

/* ---------- 1. Outfit (variabel 100-900), samma fil som temat redan laddar: ingen extra nedladdning ---------- */
${fontFace}

/* ---------- 2. Behållare + wrapper: designsystemets tokens (lager 2, --ampy-*) utlösta till literaler, plus basen ---------- */
${OUTER} { container-type: inline-size; container-name: rk; }   /* = style.css .rk-behallare: kortet frågar sin egen bredd */
${WRAP} {
${tokens.block}  /* basen: = :where(.ampy) (base.css) + body:s font-smoothing/text-rendering */
  ${basDecl}
}

/* ---------- 3-4. Scopad reset + rollklasser + fokus + reduced motion (base.css, bara elementen som finns i markupen) ---------- */
${base.css}

/* ---------- 5. Komponenter (text.css, ytor.css, falt.css, knappar.css): bara reglerna som träffar markupen ---------- */
${text.css}
${ytor.css}
${falt.css}
${knappar.css}

/* ---------- 6. Kalkylatorn (kalkylator/v1/style.css verbatim med prefix; demosidans .rk-sida/.rk-spalt utelämnade) ---------- */
${styleCss}

${block7}
`;

const [stylesPx, remHits] = remToPx(styles);
styles = stylesPx;

// Manifest sist i filen
const manifest = `
/* ---------- Manifest (skrivet av paketera.mjs) ----------
   Källor (sha256):
${Object.entries(srcSha).filter(([p]) => !/engine|rakna|app\.js|index\.html|font/.test(p)).map(([p, h]) => `     ${p}  ${h}`).join('\n')}
   rem -> px: ${remHits.length ? remHits.join(', ') : 'inga'}
   Tokens på wrappern: ${tokens.names.length} st
   Systemregler som togs med: ${tog.length} st, slängda som inte kan träffa markupen: ${slangde.length} st (listan skrivs av bygget)
   ---------- */
`;
styles += manifest;

// Guards (utanför kommentarer)
{
  const naked = stripComments(styles);
  for (const [re, what] of [[/:root\b/, ':root'], [/(^|[^\w.-])html\s*\{/, 'html{'], [/(^|[^\w.-])body\s*\{/, 'body{'], [/\brem\b/, 'rem'], [/googleapis|gstatic|jsdelivr/, 'extern typsnittskälla']]) {
    if (re.test(naked)) fail(`styles.css innehåller ${what}`);
  }
  // oprefixade selektorer utanför @font-face/@keyframes
  const bad = [];
  walkCss(naked, {
    rule: (list, body, atStack) => {
      for (const s of splitSelectors(list)) if (!s.startsWith(WRAP) && !s.startsWith(OUTER)) bad.push((atStack.join(' ') + ' ' + s).trim());
      return null;
    },
  });
  if (bad.length) fail('oprefixade selektorer: ' + bad.join(' | '));
  // .rk__ih op etc. finns; ingen demoregel
  if (/\.rk-(sida|spalt|behallare)\b/.test(naked)) fail('demosidans regler i paketet');
}
await mkdir(join(OUT, 'dist', 'fonts'), { recursive: true });
await writeFile(join(OUT, 'dist', 'styles.css'), styles);
note(`dist/styles.css: ${styles.length} tecken, ${tokens.names.length} tokens, ${tog.length} systemregler, rem->px: ${remHits.join(', ') || 'inga'}`);

/* ---------- 2. dist/engine.js ---------- */
const eng = src.engine;
const engineParts = ['PARAMS_2026', 'P', 'rundUpp100', 'rundNed100', 'kapa', 'pensionsavgiftKr', 'toInt', 'grundavdrag', 'jobbskatteavdrag', 'redForvarvsinkomst', 'redUnderskottKapital', 'skatteutrymme']
  .map((n) => extractDecl(eng, n));
const raknaParts = ['TAK', 'kr', 'siffra', 'formatFalt', 'ANTAL_ORD', 'MAX_PERSONER', 'inkomstDelar', 'utrymmeFor', 'beraknaHushall']
  .map((n) => extractDecl(src.rakna, n));
for (const part of [...engineParts, ...raknaParts]) if (/^\s*(import|export)\b/m.test(part)) fail('import/export kvar i motordelen: ' + part.slice(0, 60));
// Numeriska avgränsare (59_200, ES2021) -> 59200: samma tal, men äldre minifierare (FlyingPress, research/14 R8) klarar dem inte.
const utanSep = (t) => t.replace(/(\d)_(?=\d)/g, '$1');
let sepN = 0;
for (const arr of [engineParts, raknaParts]) arr.forEach((part, i) => {
  const kod = stripJsComments(part);
  const iKod = (kod.match(/\d_\d/g) || []).length, iAllt = (part.match(/\d_\d/g) || []).length;
  if (iKod !== iAllt) fail('siffra_siffra i en kommentar, kan inte normalisera säkert: ' + part.slice(0, 60));
  sepN += iAllt; arr[i] = utanSep(part);
});

// app.js -> init(root): rad för rad ur källan, avvikelser märkta PAKET. Varje byte måste träffa exakt en gång.
let app = src.app;
const appHeader = app.match(/^\/\*[\s\S]*?\*\/\n/)[0];
app = app.slice(appHeader.length);
app = replaceExact(app, [
  [`import { beraknaHushall, formatFalt, siffra, MAX_PERSONER } from '../rakna.js';\n`, ''],
  [`const $ = (s) => document.querySelector(s);`, `const $ = (s) => root.querySelector(s);                      /* PAKET: aldrig document-wide; klasser i stället för id:n */`],
  [`const kort = $('#avdragskollen');`, `const kort = root;`],
  [`const form = $('#rk-form');`, `const form = $('.rk__fragor');`],
  [`const rubrik = $('#rk-rubrik');\n`, ''],
  [`const eyebrow = $('#rk-eyebrow');`, `const eyebrow = $('.rk__eyebrow');`],
  [`const resultat = $('#rk-resultat');`, `const resultat = $('.rk__resultat');`],
  [`const talrad = $('#rk-talrad');`, `const talrad = $('.rk__talrad');`],
  [`const prefix = $('#rk-prefix');`, `const prefix = $('.rk__prefix');`],
  [`const tal = $('#rk-tal');`, `const tal = $('.rk__tal');`],
  [`const talenhet = $('#rk-talenhet');`, `const talenhet = $('.rk__talenhet');`],
  [`const per = $('#rk-per');`, `const per = $('.rk__per');`],
  [`const not = $('#rk-not');`, `const not = $('.rk__not');`],
  [`const stopp = $('#rk-stopp');`, `const stopp = $('.rk__stopp');`],
  [`const stopptext = $('#rk-stopptext');`, `const stopptext = $('.rk__stopptext');`],
  [`const personer = $('#rk-personer');`, `const personer = $('.rk__personer');`],
  [`const lagg = $('#rk-lagg');`, `const lagg = $('.rk__lagg .rk__lank');`],
  [`const mall = $('#rk-personmall');\n`, `const mall = $('template');\nif (!form || !eyebrow || !resultat || !personer || !lagg || !mall) return;   /* PAKET: inert om markupen saknas */\n`],
  [`/* Läget ur ?m= (default rot). Ett läge, ett avdrag: aldrig båda. Femårsfrågan visas bara i ROT (style.css). */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
kort.dataset.mode = mode;
const NAMN = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
if (mode === 'gt') {
  skriv(rubrik, 'Räkna ut ditt grön teknik-avdrag');
  document.title = 'Räkna ut ditt grön teknik-avdrag: Ampy';
}
`, `/* PAKET: läget ur data-mode på sektionen (shortcoden sätter det), inte ur ?m=. Ett läge, ett avdrag: aldrig båda.
   Rubriken och sidtiteln skrivs inte om: PHP renderar rätt text från start (research/14 M3). */
const mode = root.dataset.mode === 'gt' ? 'gt' : 'rot';
kort.dataset.mode = mode;
const NAMN = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
`],
  [`const val = (name, rot = document) => (rot.querySelector(\`input[name="\${name}"]:checked\`) || {}).value;`,
   `/* PAKET: radionamnen bär instansens prefix (ak1-ager, ak1-typ-2 ...); prefixet läses ur markupen och sökningen stannar i formuläret */
const pre = (form.querySelector('input[type="radio"][name$="ager"]') || { name: 'ager' }).name.slice(0, -'ager'.length);
const val = (name, rot = form) => (rot.querySelector(\`input[name="\${pre}\${name}"]:checked\`) || {}).value;`],
  [`const n = b.querySelector('input[name^="typ-"]').name.split('-')[1];`, `const n = b.querySelector('input[name*="typ-"]').name.split('-').pop();   /* PAKET: sista ledet, namnet kan ha prefix */`],
  [`form.addEventListener('submit', (e) => { e.preventDefault(); if (document.activeElement?.classList.contains('rk__input')) document.activeElement.blur(); });`,
   `form.addEventListener('submit', (e) => {
  e.preventDefault();
  const a = document.activeElement;                                   /* PAKET: bara den egna instansens fält */
  if (a && root.contains(a) && a.classList.contains('rk__input')) a.blur();
});`],
], 'app.js -> init(root)');
if (/document\.(querySelector|getElementById|title)|location\./.test(app)) fail('app-porten söker fortfarande dokumentvida: ' + app.match(/.*document\.(querySelector|getElementById|title).*|.*location\..*/)[0]);
if (/#rk-|#avdragskollen/.test(app)) fail('app-porten har kvar id-selektorer');
const indent = (s, n = 2) => s.split('\n').map((l) => (l.trim() ? ' '.repeat(n) + l : l)).join('\n');

const engineJs = `/*
 * AVDRAGSKOLLEN (ROT / grön teknik), FluentSnippets snippet 3/3, typ "JS". Kör: Frontend, wp_footer. Paket ${PAKET_VERSION}.
 * FORMAT-ONLY: byggd av produktion/_build/paketera.mjs ur logik/engine.js (skatteutrymmet), kalkylator/rakna.js (hushållet)
 * och kalkylator/v1/app.js (som init(root), root-scopad, multi-instans). Redigera aldrig här: ändra källorna och bygg om.
 * En IIFE, 'use strict', inga globaler. Startar varje ".ampy-avdragskollen .rk[data-mode]" en gång (data-booted).
 * Syntax: ES2020 (mallsträngar, ??, spridning, replaceChildren). Talens avgränsare (59_200) är utskrivna som vanliga tal.
 * Inget lagras, inget skickas: ingen fetch, ingen REST, ingen webhook, ingen spårning.
 * Källor (sha256): engine.js ${srcSha[SRC.engine].slice(0, 12)}, rakna.js ${srcSha[SRC.rakna].slice(0, 12)}, app.js ${srcSha[SRC.app].slice(0, 12)}
 */
(function () {
  'use strict';

  /* ---------- logik/engine.js: parametrar, avrundning och skatteutrymmet 2026 (verifierat mot Skatteverkets e-tjänst, research/09) ---------- */
${indent(engineParts.join('\n\n'))}

  /* ---------- kalkylator/rakna.js: hushållets besked ---------- */
${indent(raknaParts.join('\n\n'))}

  /* ---------- kalkylator/v1/app.js som init(root): rad för rad ur källan, avvikelser märkta PAKET ---------- */
${indent(appHeader.replace(/\.\.\/rakna\.js/, 'rakna.js ovan'))}
  function init(root) {
    if (root.dataset.booted === '1') return;                          /* PAKET: en start per instans */
    root.dataset.booted = '1';
${indent(app.trim(), 4)}
  }

  function boot() { document.querySelectorAll('${WRAP} .rk[data-mode]').forEach(init); }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
`;
if (!engineJs.startsWith('/*') || !engineJs.includes("(function () {\n  'use strict';")) fail('engine.js: IIFE/strict saknas');
if (/\b(import|export)\s/.test(stripJsComments(engineJs))) fail('engine.js: import/export kvar');
if (/\bwindow\.\w+\s*=/.test(engineJs)) fail('engine.js: global tilldelning');
if (/fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(engineJs)) fail('engine.js: nätverksanrop');
await writeFile(join(OUT, 'dist', 'engine.js'), engineJs);
// syntaxkontroll: kör IIFE:n i Node med en tom document-stubb
{
  const vm = await import('node:vm');
  const ctx = vm.createContext({ document: { readyState: 'complete', querySelectorAll: () => [], createElement: () => ({}) }, Intl, console });
  try { vm.runInContext(engineJs, ctx, { filename: 'engine.js' }); } catch (e) { fail('engine.js kör inte: ' + e.message); }
}
note(`dist/engine.js: ${engineJs.length} tecken (${engineParts.length} motordelar + ${raknaParts.length} rakna-delar + init(root)), ${sepN} numeriska avgränsare -> vanliga tal`);

/* ---------- 3. dist/backend.php ---------- */
let markup = extractSection(src.html);
markup = replaceExact(markup, [
  [`data-mode="rot">`, `data-mode="{{MODE}}">`],
  [`Ditt tillgängliga <span class="rk__ihop">ROT-avdrag</span>`, `Ditt tillgängliga {{NAMN}}`],   // = index.html:178; PHP fyller i samma DOM som app.js skriv() ger
], 'markup');
if (/AMPY_AK_MARKUP|<\?|\?>|<\/script/.test(markup)) fail('markupen innehåller PHP-/script-känsliga tecken');
if (!/^  <section /.test(markup) || !/\n  <\/section>$/.test(markup)) fail('sektionen har oväntad form');

const backendPhp = `<?php
/**
 * AVDRAGSKOLLEN (ROT / grön teknik), FluentSnippets snippet 2/3, typ "Functions (PHP)". Kör: Frontend & Backend. Paket ${PAKET_VERSION}.
 * ---------------------------------------------------------------------------------------------------------------------
 * Install all THREE snippets in FluentSnippets, then drop the shortcode into a Bricks Shortcode element:
 *   1. CSS -> dist/styles.css (Frontend, wp_head)   2. PHP -> this file (Frontend & Backend)   3. JS -> dist/engine.js (Frontend, wp_footer)
 * Registers [ampy_avdragskollen mode="rot|gt" heading="..." heading_level="2|3"] and RETURNS the markup (never echo).
 *   mode           rot (default) or gt. One mode per instance; the ROT page uses mode="rot", the grön teknik page mode="gt".
 *   heading        default "Räkna ut ditt ROT-avdrag" / "Räkna ut ditt grön teknik-avdrag"; heading="" omits the heading.
 *   heading_level  2 (default) or 3 (sidebar placement). Same look either way (.ampy-h2 sets everything).
 * Several instances on one page are fine: every id, for, aria-* and radio name is prefixed per instance (ak1-, ak2-, ...).
 * No data injection (nothing is dynamic), no REST route (nothing is submitted), no webhook, no tracking, no nonce.
 * Auto-built by produktion/_build/paketera.mjs from kalkylator/v1/index.html (section verbatim, sha256 ${srcSha[SRC.html].slice(0, 12)}).
 * Rebuild, never hand-edit.
 * ---------------------------------------------------------------------------------------------------------------------
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! function_exists( 'ampy_avdragskollen_markup' ) ) {
	/**
	 * kalkylator/v1/index.html: the <section> byte for byte. Two placeholders: {{MODE}} (the section's data-mode) and
	 * {{NAMN}} (the eyebrow's <span class="rk__ihop">ROT-avdrag</span>). Nowdoc: nothing inside is interpreted by PHP.
	 */
	function ampy_avdragskollen_markup() {
		return <<<'AMPY_AK_MARKUP'
${markup}
AMPY_AK_MARKUP;
	}
}

if ( ! function_exists( 'ampy_avdragskollen_prefix' ) ) {
	/** Prefixes every id / for / name / aria-labelledby / aria-describedby token with the instance id (also inside <template>). */
	function ampy_avdragskollen_prefix( $html, $uid ) {
		return preg_replace_callback(
			'/\\b(id|for|name|aria-labelledby|aria-describedby)="([^"]*)"/',
			function ( $m ) use ( $uid ) {
				$out = array();
				foreach ( preg_split( '/\\s+/', trim( $m[2] ) ) as $t ) {
					if ( '' !== $t ) { $out[] = $uid . '-' . $t; }
				}
				return $m[1] . '="' . implode( ' ', $out ) . '"';
			},
			$html
		);
	}
}

if ( ! function_exists( 'ampy_avdragskollen_shortcode' ) ) {
	function ampy_avdragskollen_shortcode( $atts = array() ) {
		static $instans = 0;
		$instans++;
		$a     = shortcode_atts( array( 'mode' => 'rot', 'heading' => null, 'heading_level' => '2' ), $atts, 'ampy_avdragskollen' );
		$mode  = ( 'gt' === strtolower( trim( (string) $a['mode'] ) ) ) ? 'gt' : 'rot';
		$namn  = '<span class="rk__ihop">' . ( 'gt' === $mode ? 'grön teknik-avdrag' : 'ROT-avdrag' ) . '</span>';   // same DOM as index.html + app.js skriv() (rk__ihop keeps the word on one line)
		$nivaa = ( '3' === (string) $a['heading_level'] ) ? 'h3' : 'h2';
		$uid   = 'ak' . $instans;                                   // id prefix per instance: ak1-rk-inkomst-1, ak2-rk-inkomst-1 ...

		$html = ampy_avdragskollen_prefix( ampy_avdragskollen_markup(), $uid );
		$html = str_replace( array( '{{MODE}}', '{{NAMN}}' ), array( $mode, $namn ), $html );

		// The heading: default per mode (index.html line 15 / app.js), own text via heading="...", none via heading="".
		if ( null === $a['heading'] ) {
			$rubrik = 'Räkna ut ditt ' . $namn;
		} else {
			$rubrik = esc_html( trim( (string) $a['heading'] ) );
		}
		if ( '' === $rubrik ) {
			// no heading: the section still gets a name (aria-labelledby would point at nothing)
			$html        = str_replace( 'aria-labelledby="' . $uid . '-rk-rubrik"', 'aria-label="' . esc_attr( 'Räkna ut ditt ' . ( 'gt' === $mode ? 'grön teknik-avdrag' : 'ROT-avdrag' ) ) . '"', $html );
			$rubrik_html = '';
		} else {
			$rubrik_html = '  <' . $nivaa . ' class="ampy-h2 rk__rubrik" id="' . $uid . '-rk-rubrik">' . $rubrik . '</' . $nivaa . '>' . "\\n";
		}

		return '<div class="${OUTER.slice(1)}"><div class="${WRAP.slice(1)}" lang="sv" data-mode="' . $mode . '">' . "\\n"
			. $rubrik_html
			. $html . "\\n"
			. '  <noscript><p class="rk__under">${NOSCRIPT}</p></noscript>' . "\\n"
			. '</div></div>';
	}
	add_shortcode( 'ampy_avdragskollen', 'ampy_avdragskollen_shortcode' );
}
`;
await writeFile(join(OUT, 'dist', 'backend.php'), backendPhp);
note(`dist/backend.php: ${backendPhp.length} tecken`);

/* ---------- 4. Typsnittet ---------- */
if (sha(src.font) !== FONT_SHA256) fail(`typsnittsfilen har ändrats (sha256 ${sha(src.font)}), sajtens fil är ${FONT_SHA256}`);
await copyFile(join(ROOT, SRC.font), join(OUT, 'dist', 'fonts', 'Outfit-VariableFont_wght.woff2'));
note(`dist/fonts/Outfit-VariableFont_wght.woff2: ${src.font.length} byte, sha256 ${FONT_SHA256.slice(0, 12)}… (= sajtens fil)`);

/* ---------- 5. preview/index.html + host-sim.html ---------- */
const inst1 = renderShortcode(markup, { mode: 'rot' }, 'ak1');
const inst2 = renderShortcode(markup, { mode: 'gt' }, 'ak2');
const chrome = `/* värdsidans chrome, inte en del av leveransen: samma spalt som kalkylator/v1 (style.css .rk-sida/.rk-spalt) med
   tokens utlösta, så pariteten mäter kortet i exakt samma bredd (980 / 356,25 px). Roten är 16 px: 0 rem i paketet. */
body { margin: 0; background: #fff; }
.spalt { max-width: 980px; margin: 0 auto; padding: clamp(25px, 3.23vw + 14.7px, 56px) 0; }
@media (max-width: 1040px) { .spalt { padding-inline: clamp(16px, 1.25vw + 12px, 28px); } }
@media (max-width: 767px) { .spalt { padding: clamp(16px, 1.25vw + 12px, 28px); } }
.spalt > * + * { margin-top: 56px; }`;
const previewPage = (extraHead, title) => `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="data:,">
<!-- preview-typsnitt: dist-CSS:ens @font-face pekar på sajtens /wp-content/uploads/fonts/ (404 lokalt utom i paritetsservern som mappar den);
     samma bytes ur dist/fonts/ deklareras här som reserv så sidan renderar rätt även från fil. Inte en del av leveransen. -->
<style>@font-face{font-family:"Outfit";src:url("../dist/fonts/Outfit-VariableFont_wght.woff2") format("woff2-variations"),url("../dist/fonts/Outfit-VariableFont_wght.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}</style>
${extraHead}<link rel="stylesheet" href="../dist/styles.css">
<style>
${chrome}
</style>
</head>
<body>
<main class="spalt">
<!-- = [ampy_avdragskollen mode="rot"] : shortcodens returvärde, instans ak1 -->
${inst1}
<!-- = [ampy_avdragskollen mode="gt"] : instans ak2 -->
${inst2}
</main>
<script src="../dist/engine.js"></script>
</body>
</html>
`;
await mkdir(join(OUT, 'preview'), { recursive: true });
await writeFile(join(OUT, 'preview', 'index.html'), previewPage('', 'Avdragskollen, förhandsvisning av snippet-paketet (rot + gt)'));

// host-sim: sajtens riktiga CSS (hämtad 2026-09-20) före dist-länken, i sajtens ordning: tema -> core-framework-inline -> 14-global-css -> Bricks
let hostRules = null;
try {
  const theme = await read(HOST.theme);
  const global = (await read(HOST.global)).replace(/^<\?php[\s\S]*?\?>/, '');
  const bricks = await read(HOST.bricks);
  const klon = await read(HOST.klon);
  const cf = klon.match(/<style id="core-framework-frontend-inline">([\s\S]*?)<\/style>/);
  hostRules = `/* Värdregler för produktion/preview/host-sim.html. Skrivet av paketera.mjs ur research/underlag/14-kod/host-*.css
   (hämtade från https://ampy.se/elcentral-guide-2026/ 2026-09-20) + core-framework-frontend-inline ur artikelklonen (2026-09-15).
   Inte en del av leveransen: det här är sajten som den ser ut, så paritetsprovet kan visa att ingenting driver. */

/* ---- 1. theme-style (olagrad: html{font-size:62.5%}, body Outfit 300, h2 40/500, :root --ap*) ---- */
${theme}

/* ---- 2. core-framework-frontend-inline (--aptext-*, --apspace-* i rem) ---- */
${cf ? cf[1] : '/* saknas i klonen */'}

/* ---- 3. FluentSnippet "14-global-css" (olagrad, input:focus{border-color:#5EB1BF!important}) ---- */
${global}

/* ---- 4. Bricks frontend (@layer bricks: label{margin-bottom:5px}, input{padding;line-height:40px}, fieldset, legend, :where(p)) ---- */
${bricks}
`;
  await writeFile(join(HERE, 'host-rules-2026-09-20.css'), hostRules);
  await writeFile(join(OUT, 'preview', 'host-sim.html'), previewPage('<link rel="stylesheet" href="../_build/host-rules-2026-09-20.css">\n', 'Avdragskollen, snippet-paketet inuti sajtens CSS (host-sim)'));
  note('preview/index.html + preview/host-sim.html + _build/host-rules-2026-09-20.css skrivna');
} catch (e) {
  note('host-sim: värdfilerna saknas (' + e.message + '), bara preview/index.html skriven');
}

/* ---------- 6. PHP-kontroll: php -l + shortcode-utdata byte för byte = preview-markupen ---------- */
let phpBin = null;
for (const c of ['/opt/homebrew/bin/php', '/usr/bin/php', 'php']) { try { execFileSync(c, ['--version'], { stdio: 'pipe' }); phpBin = c; break; } catch {} }
if (phpBin) {
  const lint = execFileSync(phpBin, ['-l', join(OUT, 'dist', 'backend.php')], { encoding: 'utf8' });
  if (!/No syntax errors/.test(lint)) fail('php -l: ' + lint);
  note('php -l: ' + lint.trim());
  const harness = join(HERE, 'rendera-shortcode.php');
  const cases = [
    [{ mode: 'rot' }, inst1],
    [{ mode: 'gt' }, inst2],
    [{ mode: 'gt', heading: '', heading_level: '3' }, renderShortcode(markup, { mode: 'gt', heading: '', heading_level: '3' }, 'ak3')],
    [{ mode: 'rot', heading: 'Egen rubrik & test', heading_level: '3' }, renderShortcode(markup, { mode: 'rot', heading: 'Egen rubrik & test', heading_level: '3' }, 'ak4')],
  ];
  const outPhp = execFileSync(phpBin, [harness, JSON.stringify(cases.map((c) => c[0]))], { encoding: 'utf8', cwd: HERE });
  const rendered = JSON.parse(outPhp);
  cases.forEach(([atts, expected], i) => {
    if (rendered[i] !== expected) {
      const a = rendered[i], b = expected; let k = 0; while (k < a.length && a[k] === b[k]) k++;
      fail(`PHP-utdata ≠ Node-preview för ${JSON.stringify(atts)} vid tecken ${k}:\n  php:  ${JSON.stringify(a.slice(k - 40, k + 80))}\n  node: ${JSON.stringify(b.slice(k - 40, k + 80))}`);
    }
  });
  note(`php: shortcode-utdata byte-lika med preview-markupen i ${cases.length} fall (rot, gt, heading="" + h3, egen rubrik)`);
} else {
  note('php saknas lokalt: php -l och PHP/Node-jämförelsen hoppades över (kör dem på staging)');
}

/* ---------- 7. Byggrapport ---------- */
const rapport = `# Byggrapport paketera.mjs (paket ${PAKET_VERSION})

Skrivs om vid varje bygge. Källor och sha256:
${Object.entries(srcSha).map(([p, h]) => `- ${p}: ${h}`).join('\n')}

## Tokens på wrappern (${tokens.names.length})
${tokens.names.map((n) => `- ${n}: ${tokens.values[n]}`).join('\n')}

## Systemregler som togs med (${tog.length})
${tog.map((t) => '- ' + t).join('\n')}

## Systemregler som slängdes, kan inte träffa markupen (${slangde.length})
${slangde.map((t) => '- ' + t).join('\n')}

## style.css-regler (${styleTog.length}), demosidans utelämnade
${styleTog.map((t) => '- ' + t).join('\n')}

## rem -> px
${remHits.map((t) => '- ' + t).join('\n') || '- inga'}

## Logg
${log.map((t) => '- ' + t).join('\n')}
`;
await writeFile(join(HERE, 'byggrapport.md'), rapport);
console.log(`\nKLART. Rapport: ${relative(ROOT, join(HERE, 'byggrapport.md'))}. Kör nu: node produktion/_build/paritet.mjs`);
