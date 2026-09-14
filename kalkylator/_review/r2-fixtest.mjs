/* Verifierar att punchlistornas huvudfixar ger utlovat resultat. Injicerar CSS/DOM-flytt i sidan (page.addStyleTag /
   evaluate), ändrar inga filer. */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFile, stat } from 'fs/promises'; import { join, extname, resolve, dirname } from 'path'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url)); const root = resolve(here, '../..');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.woff2':'font/woff2' };
const server = createServer(async (req,res)=>{ try { let p=join(root, decodeURIComponent(new URL(req.url,'http://x').pathname)); if((await stat(p)).isDirectory()) p=join(p,'index.html'); res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'}); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
const port = 9100 + Math.floor(Math.random()*90); await new Promise(r=>server.listen(port,r));
const b = await chromium.launch();
const r1 = (n) => Math.round(n*10)/10;
const out = {};

/* v1: H2 ut ur kortet */
for (const [vp,w,h,m] of [['desktop',1440,1000,'rot'],['desktop-gt',1440,1000,'gt'],['mobile-gt',390,844,'gt']]) {
  const page = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=${m}`, { waitUntil:'networkidle' });
  await page.evaluate(() => { const h2 = document.querySelector('#rk-rubrik'); const main = document.querySelector('.rk-spalt'); main.insertBefore(h2, main.firstChild); });
  await page.addStyleTag({ content: `.rk__rubrik{margin:0 0 var(--ampy-space-stack-lg)} .rk{--rk-text-enhet:calc(var(--rk-text-tal)*.5)} .rk__prefix,.rk__talenhet{font-size:var(--rk-text-enhet);font-weight:500;line-height:1;letter-spacing:-0.01em} .rk__stopp{flex-direction:row;align-items:center} .rk__stopptext{font-size:18px;line-height:1.35} @media (max-width:767px){.rk__huvud{min-height:calc(var(--rk-text-tal) + var(--ampy-space-2xs) + 22.4px);justify-content:center} .rk{--rk-gap-q:clamp(28px,var(--ampy-space-l),40px);--rk-gap-ctl:max(12px,var(--ampy-space-xs))}}` });
  await page.waitForTimeout(200);
  const m1 = await page.evaluate(() => { const c = document.querySelector('#avdragskollen').getBoundingClientRect(); const h2 = document.querySelector('#rk-rubrik').getBoundingClientRect(); return { kortH: c.height, h2Rader: h2.height/43.2, gapH2Kort: c.top - h2.bottom, prefix: getComputedStyle(document.querySelector('#rk-prefix')).fontSize, enhet: getComputedStyle(document.querySelector('#rk-talenhet')).fontSize }; });
  await page.click('label:has(input[name="ager"][value="nej"])'); await page.waitForTimeout(300);
  const m2 = await page.evaluate(() => ({ kortHStopp: document.querySelector('#avdragskollen').getBoundingClientRect().height }));
  await page.screenshot({ path: join(here, `r2-fixtest-v1-${vp}.png`), fullPage: true });
  out[`v1-${vp}`] = { ...m1, ...m2 }; await page.close();
}

/* v2b: fältet + kolumner + kontroll under etikett */
{
  const page = await b.newPage({ viewport:{width:1440,height:1000}, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/kalkylator/v2b/index.html?m=rot`, { waitUntil:'networkidle' });
  await page.addStyleTag({ content: `.rk__fragor{grid-template-columns:minmax(0,1fr) minmax(30rem,1.25fr) max-content} .rk__falt{flex:0 0 15rem} .rk__kontroll{margin-top:0} .rk__sub{display:block} .rk__not{display:block;margin-top:var(--ampy-space-3xs)} .rk__input::placeholder{font-weight:400}` });
  await page.fill('#rk-inkomst', '1200000'); await page.waitForTimeout(200);
  const m = await page.evaluate(() => { const i = document.querySelector('#rk-inkomst'); const qs = [...document.querySelectorAll('.rk__q')]; const lab = (q) => q.querySelector('.rk__fraga').getBoundingClientRect(); const seg = (q) => q.querySelector('.rk__seg').getBoundingClientRect();
    return { faltB: i.getBoundingClientRect().width, overflow: i.scrollWidth > i.clientWidth, kolB: qs.map(q=>Math.round(q.getBoundingClientRect().width)), q2Rader: lab(qs[1]).height/25, gapLabelCtl: qs.map(q=>Math.round((seg(q).top - lab(q).bottom)*10)/10), kortH: document.querySelector('.rk__card').getBoundingClientRect().height }; });
  await page.screenshot({ path: join(here, 'r2-fixtest-v2b-desktop.png'), fullPage: true });
  out['v2b-desktop'] = m; await page.close();
}

/* v3: underraden en rad ut ur spalt 1 + bock bort + rad */
{
  const page = await b.newPage({ viewport:{width:1440,height:1000}, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/kalkylator/v3/index.html?m=rot`, { waitUntil:'networkidle' });
  await page.addStyleTag({ content: `@container ak-kort (min-width: 860px){ .ak__under{grid-row:3;width:max-content;margin-top:var(--ampy-space-2xs)} } .ak__bock{display:none !important} .ak-body{background:var(--ampy-bg-surface)} .ak__rubrik{margin:0 0 var(--ampy-space-stack-lg)} .ak__etikett{margin:0 0 4px}` });
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => { const u = document.querySelector('.ak__under').getBoundingClientRect(); const k = document.querySelector('.ak__kort').getBoundingClientRect(); const c2 = document.querySelectorAll('.ak__seg')[1].getBoundingClientRect(); const et = document.querySelector('#ak-etikett').getBoundingClientRect(); const tal = document.querySelector('#ak-tal').getBoundingClientRect();
    return { underRader: u.height/24, underB: Math.round(u.width), kortH: k.height, tomtUnderQ2: Math.round((k.bottom - c2.bottom)*10)/10, etikettTal: Math.round((tal.top - et.bottom)*10)/10 }; });
  await page.screenshot({ path: join(here, 'r2-fixtest-v3-desktop.png'), fullPage: true });
  out['v3-desktop'] = m; await page.close();
}
await b.close(); server.close();
console.log(JSON.stringify(out, null, 1));
