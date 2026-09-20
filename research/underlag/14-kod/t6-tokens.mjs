import { readFile } from 'node:fs/promises';
const S = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/kalkylator/system/';
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
// flatten rules: returns [{prelude:[at-preludes...], selector, body}]
function rules(css) { const out = []; const stack = []; let i = 0; css = strip(css);
  while (i < css.length) { const open = css.indexOf('{', i); if (open < 0) break; const prelude = css.slice(i, open).trim().replace(/^[;\s]+/, '');
    // find matching close or nested
    if (prelude.startsWith('@') && !/^@font-face/.test(prelude)) { stack.push(prelude); i = open + 1; continue; }
    const close = css.indexOf('}', open); const body = css.slice(open + 1, close); out.push({ at: [...stack], selector: prelude, body }); i = close + 1;
    while (css.slice(i).match(/^\s*\}/)) { i = css.indexOf('}', i) + 1; stack.pop(); } }
  return out; }
const files = { tokens: await readFile(S + 'tokens.css', 'utf8'), base: await readFile(S + 'base.css', 'utf8'), text: await readFile(S + 'components/text.css', 'utf8'), ytor: await readFile(S + 'components/ytor.css', 'utf8'), falt: await readFile(S + 'components/falt.css', 'utf8'), knappar: await readFile(S + 'components/knappar.css', 'utf8') };
const style = await readFile('/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/kalkylator/v1/style.css', 'utf8');
const classesUsed = ['ampy-card','ampy-h2','ampy-eyebrow','ampy-number','ampy-segment','ampy-input','ampy-input--tabular','ampy-link','ampy'];
const usedRules = [];
for (const [name, css] of Object.entries(files)) { if (name === 'tokens') continue; for (const r of rules(css)) {
  const sel = r.selector; if (sel.startsWith('@font-face')) { usedRules.push({ file: name, ...r }); continue; }
  // dark variants skipped
  if (/ampy-on-dark|ampy--dark|ampy-section--dark|ampy-card--dark|ampy-frame|ampy-band--dark|ampy-card--glass|ampy-card--hover|ampy-card--raised|ampy-card--flat|ampy-card--plain|ampy-card--lg|ampy-card--tight|ampy-card--center|ampy-segment--pill|ampy-segment--line|ampy-link--quiet|ampy-link--ghost|ampy-link--tel|ampy-search|ampy-fields|ampy-field\b|ampy-textarea|ampy-select|ampy-chip|ampy-stepper|ampy-range|ampy-check|ampy-eyebrow--/.test(sel) && !/^\.ampy-card \>|^\.ampy-input(::|:|\.|\[|,)/.test(sel)) {
    // keep only if the selector list also contains a plain used class (e.g. ".ampy-input, .ampy-textarea, .ampy-select")
    if (!/^\.ampy-input\b|\.ampy-segment > label|\.ampy-segment \[|\.ampy-segment \.is-selected|\.ampy-segment > button|\.ampy-segment__option/.test(sel)) continue; }
  const hit = classesUsed.some(c => new RegExp('\\.' + c.replace(/[-]/g, '\\-') + '(?![\\w-])').test(sel)) || /^(\*|html|body|img|svg|button|h1|:where\(\.ampy\))/.test(sel);
  if (hit) usedRules.push({ file: name, ...r }); } }
const vars = new Set(); const grab = (s) => { for (const m of s.matchAll(/var\((--[\w-]+)/g)) vars.add(m[1]); };
grab(style); for (const r of usedRules) grab(r.body);
// token map
const tokenMap = {}; for (const m of strip(files.tokens).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokenMap[m[1]] = m[2].trim();
const resolve = (v, depth = 0) => { if (depth > 12) return v; return v.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, n, fb) => tokenMap[n] !== undefined ? resolve(tokenMap[n], depth + 1) : (fb ?? `UNDEF(${n})`)); };
const report = [...vars].filter(v => !v.startsWith('--rk') && !v.startsWith('--_')).sort().map(v => { const raw = tokenMap[v]; const res = raw === undefined ? 'UNDEFINED' : resolve(raw); return { v, raw, res, rem: /\brem\b/.test(res) }; });
console.log('used component rules:', usedRules.length); for (const r of usedRules) console.log('  [' + r.file + ']', (r.at.length ? r.at.join(' ') + ' { ' : '') + r.selector.replace(/\s+/g, ' ').slice(0, 110));
console.log('\nTOKENS (' + report.length + '):'); for (const r of report) console.log((r.rem ? 'REM! ' : '     ') + r.v.padEnd(28) + ' = ' + (r.raw || 'UNDEFINED').replace(/\s+/g,' ').slice(0, 60).padEnd(62) + ' -> ' + r.res.replace(/\s+/g,' ').slice(0, 70));
console.log('\nrem in used component rules:'); for (const r of usedRules) if (/\brem\b/.test(r.body) || /\brem\b/.test(r.at.join(''))) console.log('  [' + r.file + ']', r.at.join(' '), r.selector.slice(0, 80), '::', r.body.match(/[^;]*\brem\b[^;]*/g).map(s => s.trim()).join(' | '));
