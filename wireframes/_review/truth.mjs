// TRUTH lens: drive the six scenarios through each wireframe's UI and read what is DISPLAYED.
// Usage: node wireframes/_review/truth.mjs [desktop|mobile]   -> JSON on stdout
import { serve, launch, url, ADAPT, VIEW, txt, typeAmount, tap } from './lib.mjs';
import { SCENARIOS, truth } from './engine-truth.mjs';

const viewName = process.argv[2] || 'desktop';
const { server, base } = await serve();
const browser = await launch();
const out = { view: viewName, engine: {}, dirs: {} };
for (const sc of SCENARIOS) out.engine[sc.id] = truth(sc);

// How to reach each scenario through the UI (user actions, in order).
async function drive(page, key, sc) {
  const A = ADAPT[key];
  const mode = sc.mode;
  switch (sc.id) {
    case 1: break;
    case 2:
      await tap(page, A.radio(mode, 'boende', 'villa'));
      await tap(page, A.radio(mode, 'vardear', '2021_2025'));
      await typeAmount(page, A.amount(mode, 'belopp'), 60000);
      await tap(page, A.radio(mode, 'skatt', 'lon'));
      break;
    case 3:
      await tap(page, A.radio(mode, 'boende', 'hyra'));
      break;
    case 4:
      await tap(page, A.radio(mode, 'lage', 'laddbox'));
      await tap(page, A.radio(mode, 'boende', 'brf'));
      break;
    case 5:
      await tap(page, A.radio(mode, 'lage', 'batteri'));
      await tap(page, A.radio(mode, 'sol', 'nej'));
      break;
    case 6: {
      const d = page.locator(A.details(mode));
      await d.locator('summary').first().click();
      await page.waitForTimeout(150);
      await tap(page, A.radio(mode, 'agare', '2'));
      // anvant_rot: B renders a stepper without a text field -> press + eight times (5 000 kr steps)
      const inp = page.locator(A.amount(mode, 'anvant_rot'));
      if (await inp.count()) await typeAmount(page, A.amount(mode, 'anvant_rot'), 40000);
      else {
        const plus = page.locator('#inputs .q[data-q="anvant_rot"] .amount__btn[data-step="1"]');
        for (let i = 0; i < 8; i++) { await plus.click(); await page.waitForTimeout(40); }
        await page.waitForTimeout(500);
      }
      await typeAmount(page, A.amount(mode, 'belopp'), 100000);
      await typeAmount(page, A.amount(mode, 'arbete_kr'), 60000);
      break;
    }
    default:
  }
  await page.waitForTimeout(800);
}

async function readAll(page, key, mode) {
  const R = ADAPT[key].read(mode);
  const o = {};
  for (const [k, sel] of Object.entries(R)) {
    if (k === 'villkor') {
      o.villkor = await page.$$eval(sel, (els) => els.filter((e) => !e.hidden && e.offsetParent !== null).map((e) => {
        const cls = [...e.classList].find((c) => /^(ak-row--|srow--|is-)(ok|antaget|okand|varning|stopp|skoter_vi|neutral)$/.test(c)) || '';
        return `${cls.replace(/^(ak-row--|srow--|is-)/, '')}|${e.innerText.replace(/\s+/g, ' ').trim()}`;
      }));
      continue;
    }
    o[k] = await txt(page, sel);
  }
  // CTA anatomy
  o.cta_anatomy = await page.evaluate((sel) => {
    const root = document.querySelector(sel); if (!root) return null;
    const els = [...root.querySelectorAll('a,button')].filter((e) => e.offsetParent !== null);
    const solid = els.filter((e) => { const cs = getComputedStyle(e); return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent'; });
    return { count: els.length, labels: els.map((e) => e.innerText.trim()), hrefs: els.map((e) => e.getAttribute('href')), solid: solid.map((e) => e.innerText.trim()), solid_bg: solid.map((e) => getComputedStyle(e).backgroundColor) };
  }, R.cta);
  return o;
}

for (const key of ['a', 'b', 'c']) {
  out.dirs[key] = {};
  for (const sc of SCENARIOS) {
    const page = await browser.newPage({ viewport: VIEW[viewName] });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(url(base, key, `?m=${sc.mode}`), { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    try { await drive(page, key, sc); } catch (e) { errors.push(`drive: ${e.message.split('\n')[0]}`); }
    const read = await readAll(page, key, sc.mode);
    read.errors = errors;
    // internal state as the app sees it (for diagnosing touched semantics)
    read.app = await page.evaluate(() => {
      const ak = window.__ak; if (!ak) return null;
      try {
        if (ak.tools) { const t = ak.tools[ak.mode]; return { klass: t.view.result.klass, subtyp: t.view.result.subtyp, touched: [...t.touched] }; }
        return { klass: ak.result && ak.result.klass, subtyp: ak.result && ak.result.subtyp, touched: ak.touched ? [...ak.touched] : null };
      } catch (e) { return String(e); }
    });
    await page.screenshot({ path: `wireframes/_review/shots/truth-${key}-${sc.id}-${viewName}.png`, fullPage: false });
    out.dirs[key][sc.id] = read;
    await page.close();
  }
}
await browser.close();
server.close();
console.log(JSON.stringify(out, null, 1));
