import { serve, launch, url, VIEW } from './lib.mjs';
const { server, base } = await serve(); const browser = await launch(); const out = {};
const SEL = {
  a: { tool: '#ak-root', h2: '#snabbfakta', p: '.artikel__body', demo: '.demo' },
  b: { tool: '#ak', h2: '#art-after h2', p: '#art-after .snabb p', demo: '.demo' },
  c: { tool: '#verktyg', h2: '.article__h2', p: '.article__p', demo: '.demo' },
};
for (const key of ['a','b','c']) {
  out[key] = {};
  for (const q of ['?m=rot&surface=embed', '?m=gt&surface=embed', '?m=gt&l=batteri&surface=embed']) {
    const page = await browser.newPage({ viewport: VIEW.mobile, deviceScaleFactor: 2 });
    await page.goto(url(base, key, q), { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    const m = await page.evaluate((S) => {
      const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), bottom: Math.round(b.bottom + scrollY), h: Math.round(b.height) }; };
      const demo = r(S.demo);
      const t = r(S.tool), h2 = r(S.h2), p = r(S.p);
      const chips = [...document.querySelectorAll('input[type="radio"]')].filter((e) => { const l = e.closest('label'); return l && l.getClientRects().length && getComputedStyle(l).display !== 'none' && l.offsetParent !== null; }).length;
      const selects = [...document.querySelectorAll('select')].filter((e) => e.offsetParent !== null).length;
      const textInputs = [...document.querySelectorAll('input[type="text"]')].filter((e) => e.offsetParent !== null).length;
      return { demo_h: demo ? demo.h : 0, tool_top: t.top, tool_h: t.h, tool_bottom: t.bottom, snabbfakta_top: h2 ? h2.top : null, first_p_top: p ? p.top : null, visible_chips: chips, visible_selects: selects, visible_text_inputs: textInputs, page_h: document.documentElement.scrollHeight };
    }, SEL[key]);
    // subtract the demo strip so numbers reflect the article template
    m.tool_top_excl_demo = m.tool_top - m.demo_h; m.first_p_top_excl_demo = m.first_p_top - m.demo_h; m.snabbfakta_top_excl_demo = m.snabbfakta_top - m.demo_h;
    out[key][q] = m;
    await page.screenshot({ path: `wireframes/_review/shots/embed-${key}-${q.replace(/[?&=]/g, '_')}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close(); server.close(); console.log(JSON.stringify(out, null, 1));
