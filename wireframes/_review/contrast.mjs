import { serve, launch, url, VIEW, ADAPT, tap } from './lib.mjs';
const { server, base } = await serve(); const browser = await launch(); const out = {};
const SELS = {
  a: ['.ak-lead', '.ak-q__help', '.ak-row__tag', '.ak-verdict--ja_villkor .ak-eyebrow', '.ak-verdict__ram', '.ak-sum__bas', '.ak-sum__kalla a', '.ak-tel', '.ak-btn', '.ak-chip input:checked + span', '.ak-chip input:not(:checked) + span', '.ak-preset', '.ak-disclaimer', '.ak-link--tool', '.ak-row__cap', '.ak-q__legend', '.ak-stmt__line + .ak-stmt__line', '.ak-row__fix', '.ak-metod__list li', '.ak-sticky__btn', '.ak-sticky__b'],
  b: ['.ak__lead', '.q__help', '.kv__eyebrow', '.kv__ram', '.line__label', '.line__note', '.line--deduct .line__amt', '.line--deduct .line__label', '.total__amt', '.srow__word', '.srow--skoter_vi .srow__btn', '.stamp--ja_villkor .stamp__main', '.stamp--ja_villkor .stamp__sub', '.next li', '.cta__sec', '.cta__sec strong', '.share__btn', '.metod li', '.metod > summary', '.kv__source', '.btn--primary', '.chip.is-on', '.chip:not(.is-on)', '.preset', '.preset.is-on', '.ak__disclaimer', '.total__note', '.q__legend', '.line__amt', '.kv__caps', '.strip__amt', '.strip__btn'],
  c: ['.tool__lead', '.q__help', '.eyebrow', '.meter__cap', '.meter__bas', '.meter__betala', '.meter__key.is-dim', '.meter__key', '.meter__tick', '.villkor__tag', '.verdict__ram', '.steps__h', '.textlink', '.textlink--sec', '.btn--primary', '.chip input:checked + .chip__face', '.chip input:not(:checked) + .chip__face', '.preset', '.preset.is-on', '.disclaimer', '.djup__line.is-muted', '.djup__line', '.metod__body', '.tabell th', '.q__label', '.villkor__txt', '.share__btn', '.sticky__amt'],
};
const script = (sels) => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { rgb: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
  const comp = (fg, bg) => fg.rgb.map((v, i) => Math.round(v * fg.a + bg[i] * (1 - fg.a)));
  const bgOf = (el) => {
    let e = el; let acc = null;
    while (e && e !== document.documentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { if (!acc) acc = { rgb: c.rgb, a: c.a }; else if (acc.a < 1) { acc = { rgb: comp(acc, c.rgb), a: Math.min(1, acc.a + c.a * (1 - acc.a)) }; } if (acc.a >= 1) return acc.rgb; }
      e = e.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    const base = body && body.a > 0 ? body.rgb : [255, 255, 255];
    return acc ? comp(acc, base) : base;
  };
  const res = [];
  for (const sel of sels) {
    const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
    if (!el) { res.push({ sel, missing: true }); continue; }
    const cs = getComputedStyle(el);
    const fg = parse(cs.color); const bg = bgOf(el);
    const fgc = comp(fg, bg);
    const L1 = lum(fgc), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(cs.fontSize); const w = parseInt(cs.fontWeight, 10); const large = px >= 24 || (px >= 18.66 && w >= 700);
    const eff = parseFloat(cs.opacity);
    res.push({ sel, text: (el.innerText || el.textContent || "").trim().slice(0, 28), px: Math.round(px * 10) / 10, w, ratio: Math.round(ratio * 100) / 100, need: large ? 3 : 4.5, pass: ratio >= (large ? 3 : 4.5), opacity: eff < 1 ? eff : undefined, fg: `rgb(${fgc})`, bg: `rgb(${bg})` });
  }
  return res;
};
for (const key of ['a','b','c']) {
  out[key] = {};
  for (const view of ['desktop', 'mobile']) {
    const page = await browser.newPage({ viewport: VIEW[view] });
    await page.goto(url(base, key, '?m=rot'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
    if (view === 'mobile') { await tap(page, ADAPT[key].radio('rot', 'boende', 'fritid')); await page.waitForTimeout(300); }
    out[key][view] = await page.evaluate(script, SELS[key]);
    await page.close();
  }
  // B's nej-stamp and A/C nej-eyebrow: hyra state on desktop
  const page = await browser.newPage({ viewport: VIEW.desktop });
  await page.goto(url(base, key, '?m=rot'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  await tap(page, ADAPT[key].radio('rot', 'boende', 'hyra')); await page.waitForTimeout(400);
  out[key].nej = await page.evaluate(script, key === 'b' ? ['.stamp--nej .stamp__main', '.stamp--nej .stamp__top', '.cta__link', '.i-stopp'] : key === 'a' ? ['.ak-verdict--nej .ak-eyebrow', '.ak-link'] : ['.klass-nej .verdict__eyebrow', '.textlink']);
  await page.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 1));
