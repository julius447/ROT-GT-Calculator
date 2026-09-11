import { serve, launch, url, VIEW, ADAPT } from './lib.mjs';
import { evaluate, resolveTexts, decodeState, defaultState } from '../../logik/ui-model.js';
const { server, base } = await serve(); const browser = await launch(); const out = {};
const STATES = ['?m=rot&b=villa&y=vet_inte&s=vet', '?m=rot&s=lag', '?m=rot&y=2026_ej_fardig', '?m=rot&u=50000', '?m=rot&y=2021_2025', '?m=gt&l=sol', '?m=gt&l=sol&a2=80000', '?m=gt&l=laddbox&b=brf', '?m=gt&l=batteri&b=brf', '?m=gt&l=laddbox&b=hyra', '?m=rot&b=foralder', '?m=rot&b=brf', '?m=rot&a=0'];
const TOOL = { a: '#ak-root', b: '#ak', c: '#verktyg' };
const banned = /\b(rabatt|spara|sparar|får tillbaka|garanterat|gratis|60 sek|30 sek)\b/i;
for (const key of ['a','b','c']) {
  out[key] = {};
  for (const q of STATES) {
    const page = await browser.newPage({ viewport: VIEW.desktop });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url(base, key, q), { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    const link = decodeState(q); const r = resolveTexts(evaluate(link.mode, { ...defaultState(link.mode), ...link.state }, []));
    const mode = link.mode;
    const R = ADAPT[key].read(mode);
    const d = await page.evaluate(([R, tool]) => {
      const t = (s) => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; };
      const root = document.querySelector(R.cta);
      const els = root ? [...root.querySelectorAll('a,button')].filter((e) => e.offsetParent !== null) : [];
      const solid = els.filter((e) => { const cs = getComputedStyle(e); return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent'; }).map((e) => e.innerText.trim());
      const text = document.querySelector(tool).innerText;
      return { headline: t(R.headline), rubrik: t(R.rubrik), betala: t(R.betala), solid, labels: els.map((e) => e.innerText.trim()), bangs: (text.match(/!/g) || []).length, dashes: (text.match(/[—–]/g) || []).length, banned: (text.match(/\b(rabatt|spara|sparar|får tillbaka|garanterat|gratis|60 sek|30 sek)\b/gi) || []) };
    }, [R, TOOL[key]]);
    d.engine = { klass: r.klass, subtyp: r.subtyp, headline: r.headline.text, rubrik: r.belopp.rubrik, cta: r.cta.primary.label, solid: r.cta.primary.solid, sec: r.cta.secondary ? r.cta.secondary.label : null };
    d.headline_ok = d.headline === r.headline.text;
    d.solid_ok = (r.cta.primary.solid ? d.solid.length === 1 && d.solid[0] === r.cta.primary.label : d.solid.length === 0);
    d.errors = errors;
    out[key][q] = d;
    await page.close();
  }
}
await browser.close(); server.close(); console.log(JSON.stringify(out, null, 1));
