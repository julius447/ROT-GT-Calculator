import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' });
await page.goto('https://ampy.se/elcentral-guide-2026/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1000);
// stäng cookie-rutan om den finns
for (const t of ['Endast nödvändiga', 'Tillåt alla']) { const b = page.getByRole('button', { name: t }); if (await b.count()) { await b.first().click().catch(() => {}); break; } }
await page.waitForTimeout(500);
// scrolla igenom sidan så lazy-bilder laddas
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 800) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(120); }
await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(800);
const html = await page.content();
await writeFile('/tmp/artikel-rendered.html', html);
const css = await page.evaluate(() => [...document.styleSheets].map(s => s.href).filter(Boolean));
console.log('html', html.length, 'stylesheets', css.length); console.log(css.join('\n'));
const vars = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); return Object.fromEntries(['--aptext-xl','--aptext-3xl','--aptext-m','--apspace-xl','--apspace-l','--apspace-m','--apspace-s','--apradius-l','--apmidnight-blue'].map(v => [v, cs.getPropertyValue(v).trim()])); });
console.log(JSON.stringify(vars));
const toc = await page.evaluate(() => { const w = document.querySelector('.ampy-toc-wrapper'); const cs = getComputedStyle(w); const inner = w.firstElementChild; const ci = inner && getComputedStyle(inner); return { pos: cs.position, top: cs.top, w: w.getBoundingClientRect().width, cls: w.className, innerCls: inner && inner.className, innerPos: ci && ci.position, innerTop: ci && ci.top, innerBg: ci && ci.backgroundColor, innerRadius: ci && ci.borderRadius, innerShadow: ci && ci.boxShadow.slice(0, 80), innerPad: ci && ci.padding }; });
console.log(JSON.stringify(toc));
const cols = await page.evaluate(() => { const sec = document.querySelector('#brxe-zkpgew .brxe-container'); const cs = getComputedStyle(sec); return { display: cs.display, cols: cs.gridTemplateColumns, gap: cs.gap, flex: cs.flexDirection, kids: [...sec.children].map(k => ({ id: k.id, cls: k.className, w: k.getBoundingClientRect().width, order: getComputedStyle(k).order, flex: getComputedStyle(k).flex })) }; });
console.log(JSON.stringify(cols));
await browser.close();
