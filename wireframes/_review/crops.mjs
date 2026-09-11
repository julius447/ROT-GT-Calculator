import { serve, launch, url, VIEW, ADAPT, tap, typeAmount } from './lib.mjs';
const { server, base } = await serve(); const browser = await launch();
async function crop(key, q, sel, name, pre) {
  const page = await browser.newPage({ viewport: VIEW.mobile, deviceScaleFactor: 3 });
  await page.goto(url(base, key, q), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  if (pre) await pre(page);
  const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await el.screenshot({ path: `wireframes/_review/shots/crop-${name}.png` });
  await page.close();
}
await crop('b', '?m=rot', '.kv__head', 'b-stamp-head-mobile');
await crop('b', '?m=rot', '.kv__lines', 'b-lines-mobile');
await crop('c', '?m=rot', '.meter', 'c-meter-mobile');
await crop('c', '?m=rot', '.meter', 'c-meter-mobile-tax', async (p) => { const s = p.locator('#verktyg input[type="range"][name="manadsinkomst"]'); await s.focus(); for (let i = 0; i < 20; i++) await p.keyboard.press('ArrowLeft'); await typeAmount(p, ADAPT.c.amount('rot', 'belopp'), 200000); await p.waitForTimeout(600); });
await crop('c', '?m=rot', '.verdict', 'c-verdict-mobile-tax', async (p) => { const s = p.locator('#verktyg input[type="range"][name="manadsinkomst"]'); await s.focus(); for (let i = 0; i < 20; i++) await p.keyboard.press('ArrowLeft'); await typeAmount(p, ADAPT.c.amount('rot', 'belopp'), 200000); await p.waitForTimeout(600); });
await crop('a', '?m=rot&surface=embed', '#ak-rot-rows', 'a-compact-rows-embed-mobile');
await crop('a', '?m=rot', '#ak-rot-rows', 'a-rows-mobile');
await crop('b', '?m=rot&surface=embed', '#inputs', 'b-inputs-embed-mobile');
await crop('c', '?m=rot', '.djup', 'c-djup-mobile');
await browser.close(); server.close(); console.log('ok');
