import { serve, launch, url, VIEW } from './lib.mjs';
const { server, base } = await serve(); const browser = await launch(); const out = {};
const TOOL = { a: '#ak-root', b: '#ak', c: '#verktyg' };
const FOLDS = {
  a: {
    'drop duplicated amount block (#ak-rot-sum) in embed': ['#ak-rot-sum'],
    'drop amount block + tel link': ['#ak-rot-sum', '#ak-rot-cta .ak-tel'],
    'drop amount block + tel + lead': ['#ak-rot-sum', '#ak-rot-cta .ak-tel', '#ak-rot .ak-lead'],
  },
  b: {
    'fold vardear + skatt (keep chips as selects)': ['#inputs .q[data-q="vardear"]', '#inputs .q[data-q="skatt"]'],
    'fold vardear + skatt + drop lead': ['#inputs .q[data-q="vardear"]', '#inputs .q[data-q="skatt"]', '.ak__lead'],
    'fold vardear + skatt + lead + tel': ['#inputs .q[data-q="vardear"]', '#inputs .q[data-q="skatt"]', '.ak__lead', '.cta__sec'],
    'only drop lead + avdrag note': ['.ak__lead', '.line__note'],
  },
  c: {
    'fold skatt chips into Räcker skatten': ['#q-skatt'],
    'fold skatt + drop meter ticks/legend/cap': ['#q-skatt', '.meter__ticks', '.meter__legend', '.meter__cap'],
    'fold skatt + ticks/legend/cap + lead + tel': ['#q-skatt', '.meter__ticks', '.meter__legend', '.meter__cap', '.tool__lead', '.cta__secondary'],
    'fold skatt + vardear-style: only boende + belopp visible, no meter chrome, no lead': ['#q-skatt', '.meter__ticks', '.meter__legend', '.meter__cap', '.tool__lead', '.meter__labelrow'],
  },
};
for (const key of ['a','b','c']) {
  out[key] = {};
  const page = await browser.newPage({ viewport: VIEW.mobile });
  await page.goto(url(base, key, '?m=rot&surface=embed'), { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
  const h0 = await page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().height), TOOL[key]);
  out[key]['as built'] = h0;
  for (const [name, sels] of Object.entries(FOLDS[key])) {
    const h = await page.evaluate(([s, list]) => {
      const hidden = [];
      for (const sel of list) for (const e of document.querySelectorAll(sel)) { hidden.push([e, e.style.display]); e.style.display = 'none'; }
      const h = Math.round(document.querySelector(s).getBoundingClientRect().height);
      for (const [e, d] of hidden) e.style.display = d;
      return h;
    }, [TOOL[key], sels]);
    out[key][name] = h;
  }
  await page.close();
}
await browser.close(); server.close(); console.log(JSON.stringify(out, null, 1));
