import { serve, launch, url, ADAPT, VIEW, tap } from './lib.mjs';
const { server, base } = await serve(); const browser = await launch(); const out = {};
for (const key of ['a','b','c']) {
  const page = await browser.newPage({ viewport: VIEW.mobile });
  await page.goto(url(base, key, '?m=rot'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const stripSel = key === 'a' ? '#ak-rot-sticky' : key === 'b' ? '#strip' : '#sticky';
  const cardSel = key === 'a' ? '#ak-rot-core' : key === 'b' ? '#kv' : '#besked';
  await tap(page, ADAPT[key].radio('rot', 'boende', 'fritid')); await page.waitForTimeout(300);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const rows = [];
  for (let y = 0; y <= H; y += 300) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(350);
    rows.push(await page.evaluate(([s, c]) => {
      const e = document.querySelector(s); const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      const visible = !e.hidden && cs.display !== 'none' && parseFloat(cs.opacity) > 0.5 && r.top < innerHeight && r.height > 0 && (cs.transform === 'none' || !/translate/.test(cs.transform) || r.top < innerHeight - 5);
      const k = document.querySelector(c).getBoundingClientRect(); const v = Math.max(0, Math.min(k.bottom, innerHeight) - Math.max(k.top, 0));
      return `y=${Math.round(scrollY)} card=${Math.round((v / k.height) * 100)}% passed=${k.bottom < 0} strip=${visible ? 'ON' : 'off'} btn="${e.querySelector('a,button')?.innerText.trim()}"`;
    }, [stripSel, cardSel]));
  }
  out[key] = rows; await page.close();
}
await browser.close(); server.close(); console.log(JSON.stringify(out, null, 1));
