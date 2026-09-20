import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r)); const port = server.address().port;
const browser = await chromium.launch();
const out = {};

const domCheck = () => {
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  const refs = [];
  for (const el of document.querySelectorAll('[for],[aria-labelledby],[aria-describedby],[aria-controls]')) {
    for (const attr of ['for','aria-labelledby','aria-describedby','aria-controls']) {
      const v = el.getAttribute(attr); if (!v) continue;
      for (const id of v.split(/\s+/)) if (!document.getElementById(id)) refs.push({ attr, id, el: el.outerHTML.slice(0, 80) });
    }
  }
  const inputsNoName = [...document.querySelectorAll('input.rk__input')].filter(i => {
    const lbl = i.labels && i.labels.length; const al = i.getAttribute('aria-labelledby') || i.getAttribute('aria-label'); return !lbl && !al; }).map(i => i.id);
  const radioGroups = {}; for (const r of document.querySelectorAll('input[type=radio]')) { radioGroups[r.name] = (radioGroups[r.name] || 0) + 1; }
  const templates = [...document.querySelectorAll('template')].map(t => ({ id: t.id, kids: t.content.children.length }));
  const legends = [...document.querySelectorAll('fieldset')].map(f => ({ ok: f.firstElementChild && f.firstElementChild.tagName === 'LEGEND', txt: f.firstElementChild && f.firstElementChild.textContent.trim().slice(0, 40) }));
  const badLegend = legends.filter(l => !l.ok);
  const tabbable = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e => !e.disabled && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').map(e => e.id || e.className || e.tagName);
  return { dup, refs, inputsNoName, radioGroups, templates, badLegend, legendCount: legends.length, tabbableCount: tabbable.length,
    textWrapPretty: CSS.supports('text-wrap', 'pretty'), container: CSS.supports('container-type', 'inline-size'), has: CSS.supports('selector(:has(a))'),
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
    activeId: document.activeElement && (document.activeElement.id || document.activeElement.className) };
};

const styleSpot = () => {
  const pick = (sel, props = ['fontFamily','fontWeight','fontSize','lineHeight','color','letterSpacing','padding','margin','backgroundColor','borderRadius','minHeight','width']) => {
    const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); const o = { rect: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)] };
    for (const p of props) o[p] = cs[p]; return o; };
  return {
    kort: pick('#avdragskollen', ['fontFamily','fontWeight','fontSize','lineHeight','color','backgroundColor','borderRadius','boxShadow','gridTemplateColumns','padding','border']),
    rubrik: pick('#rk-rubrik'), etikett: pick('.rk__etikett'), under: pick('.rk__under'), segLabel: pick('.rk__segment > label'), segChecked: pick('.rk__segment > label:has(input:checked)'),
    input: pick('#rk-inkomst-1', ['fontFamily','fontWeight','fontSize','lineHeight','color','padding','minHeight','borderColor','borderRadius','backgroundColor','textAlign']),
    enhet: pick('.rk__enhet'), lagg: pick('#rk-lagg'), panel: pick('.rk__panel', ['padding','backgroundColor','borderLeft','borderTop','borderRadius']), eyebrow: pick('#rk-eyebrow'),
    tal: pick('#rk-tal'), prefix: pick('#rk-prefix'), per: pick('#rk-per'), fin: pick('#rk-fin'), stopptext: pick('#rk-stopptext'), talrad: pick('#rk-talrad', ['marginTop']),
    ihop: (() => { const s = document.querySelector('.rk__ihop'); return s ? { text: s.textContent, ws: getComputedStyle(s).whiteSpace, display: getComputedStyle(s).display, count: document.querySelectorAll('.rk__ihop').length } : null; })(),
  };
};

for (const mode of ['rot', 'gt']) for (const [vp, w, h, touch] of [['1280', 1280, 900, false], ['390', 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1 });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e)); page.on('console', m => { if (['error','warning'].includes(m.type())) errors.push(m.type() + ': ' + m.text()); });
  page.on('request', r => requests.push(r.url()));
  await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=${mode}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const r = { errors, external: requests.filter(u => !u.startsWith(`http://localhost:${port}`)), requests: requests.map(u => u.replace(`http://localhost:${port}`, '')) };
  r.dom0 = await page.evaluate(domCheck);
  r.style = await page.evaluate(styleSpot);
  r.title = await page.title();
  r.h2 = await page.locator('#rk-rubrik').innerHTML();
  // add 3 persons
  for (let i = 0; i < 3; i++) { await page.click('#rk-lagg'); await page.waitForTimeout(50); }
  r.dom3 = await page.evaluate(domCheck);
  r.laggHidden = await page.evaluate(() => document.querySelector('#rk-lagg').parentElement.hidden);
  r.focusAfterAdd = await page.evaluate(() => document.activeElement.id);
  // remove person 3 (middle)
  await page.evaluate(() => document.querySelectorAll('.rk__tabort')[1].click()); await page.waitForTimeout(50);
  r.focusAfterRemove = await page.evaluate(() => document.activeElement.id || document.activeElement.className);
  r.labelsAfterRemove = await page.evaluate(() => [...document.querySelectorAll('.rk__personetikett')].map(p => p.textContent + '#' + p.closest('.rk__person').dataset.person + ':' + p.closest('.rk__person').querySelector('input[name^=typ-]').name));
  await page.click('#rk-lagg'); await page.waitForTimeout(50);
  r.dom4 = await page.evaluate(domCheck);
  r.namesAfterReadd = await page.evaluate(() => [...document.querySelectorAll('.rk__person')].map(p => p.querySelector('input[name^=typ-]').name + '/' + [...p.querySelectorAll('[id]')].map(e => e.id).join(',')));
  // Type a pasted value and check formatting
  await page.fill('#rk-inkomst-1', '300.000'); await page.waitForTimeout(600);
  r.fill1 = await page.evaluate(() => ({ v: document.querySelector('#rk-inkomst-1').value, tal: document.querySelector('#rk-tal').textContent, prefix: document.querySelector('#rk-prefix').textContent, hiddenPrefix: document.querySelector('#rk-prefix').hidden }));
  await page.fill('#rk-inkomst-1', '12345678901234567890'); await page.waitForTimeout(600);
  r.fillLong = await page.evaluate(() => ({ v: document.querySelector('#rk-inkomst-1').value, len: document.querySelector('#rk-inkomst-1').value.length, tal: document.querySelector('#rk-tal').textContent }));
  // Ager = nej -> stopp
  await page.evaluate(() => { const i = document.querySelector('input[name="ager"][value="nej"]'); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }); await page.waitForTimeout(100);
  r.stopp = await page.evaluate(() => ({ status: document.querySelector('#rk-resultat').dataset.status, stoppHidden: document.querySelector('#rk-stopp').hidden, text: document.querySelector('#rk-stopptext').innerHTML, finVis: getComputedStyle(document.querySelector('#rk-fin')).visibility, anim: getComputedStyle(document.querySelector('#rk-stopp')).animationName }));
  await page.screenshot({ path: `shot-${mode}-${vp}.png`, fullPage: true });
  await ctx.close();
  out[`${mode}-${vp}`] = r;
}
// reduced motion + print
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=rot`, { waitUntil: 'networkidle' });
  await page.fill('#rk-inkomst-1', '180000'); await page.waitForTimeout(600);
  out.reducedMotion = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('#rk-talrad')); return { animationName: cs.animationName, animationDuration: cs.animationDuration, cls: document.querySelector('#rk-talrad').className }; });
  await page.emulateMedia({ media: 'print' }); await page.screenshot({ path: 'shot-print.png', fullPage: true });
  out.print = await page.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, panelBg: getComputedStyle(document.querySelector('.rk__panel')).backgroundColor, cols: getComputedStyle(document.querySelector('#avdragskollen')).gridTemplateColumns }));
  await ctx.close();
}
await writeFile('probe.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 12000));
await browser.close(); server.close();
