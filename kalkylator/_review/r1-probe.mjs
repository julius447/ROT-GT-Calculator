/* R1 UX-prob: kör alla tillstånd i v1, v2b, v3 på desktop 1440 och mobil 390, i ?m=rot och ?m=gt.
   Mäter getBoundingClientRect före/efter varje ändring (talet, etiketten, första kontrollen, femårs-
   kontrollen, beloppsfältet, kortet), tap-ytor, fontstorlekar, strängar, tangentbord, Enter i fältet,
   reduced motion. Skriver PNG (klippta till kortet) + r1-probe.json i kalkylator/_review/.
   Kör: node kalkylator/_review/r1-probe.mjs   (från repo-roten) */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat, mkdir, writeFile } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const ut = join(here, 'shots');
await mkdir(ut, { recursive: true });

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
const port = 8700 + Math.floor(Math.random() * 200);
await new Promise((r) => server.listen(port, r));

/* Versionsspecifika selektorer */
const SEL = {
  v1:  { kort: '#avdragskollen', tal: '#rk-tal', prefix: '#rk-prefix', eyebrow: '#rk-eyebrow', stopp: '#rk-stopp', stopptext: '#rk-stopptext', not: '#rk-not', input: '#rk-inkomst', h2: '#rk-rubrik', resultat: '#rk-resultat', per: '#rk-per', bock: null },
  v2b: { kort: '.rk__card',      tal: '#rk-num', prefix: '#rk-prefix', eyebrow: '#rk-etikett', stopp: '#rk-stopp', stopptext: '#rk-stopp-text', not: '#rk-not', input: '#rk-inkomst', h2: '#rk-h2', resultat: '.rk__band', per: '#rk-per', bock: null },
  v3:  { kort: '.ak__kort',      tal: '#ak-siffra', prefix: '#ak-prefix', eyebrow: '#ak-etikett', stopp: '#ak-stopp', stopptext: '#ak-stopp-text', not: '#ak-not', input: '#ak-inkomst', h2: '#ak-rubrik', resultat: '#ak-hero', per: '.ak__per', bock: '#ak-bock' },
};
const lab = (name, value) => `label:has(input[name="${name}"][value="${value}"])`;

const browser = await chromium.launch();
const out = {};
const r1 = (n) => Math.round(n * 10) / 10;

async function matt(page, S, vanta = 420) {
  if (vanta) await page.waitForTimeout(vanta);   /* låt intoningen (200 ms) och transitions (160 ms) bli klara: vi mäter layout, inte animation */
  return page.evaluate(({ S }) => {
    const lab = (name, value) => `label:has(input[name="${name}"][value="${value}"])`;
    const q = (s) => (s ? document.querySelector(s) : null);
    const r1 = (n) => Math.round(n * 10) / 10;
    const rect = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const synlig = !!(el.offsetParent !== null || cs.position === 'fixed') && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.hidden && b.height > 0;
      return { x: r1(b.x), y: r1(b.y + scrollY), w: r1(b.width), h: r1(b.height), synlig };
    };
    const txt = (el) => (el ? (el.innerText || el.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : null);
    const fs = (el) => (el ? getComputedStyle(el).fontSize : null);
    const fw = (el) => (el ? getComputedStyle(el).fontWeight : null);
    const kort = q(S.kort), tal = q(S.tal), eyebrow = q(S.eyebrow), stopp = q(S.stopp), not = q(S.not), input = q(S.input);
    const agerJa = q(lab('ager', 'ja')), agerNej = q(lab('ager', 'nej')), aldreJa = q(lab('aldre', 'ja')), aldreNej = q(lab('aldre', 'nej')), lon = q(lab('typ', 'lon')), pension = q(lab('typ', 'pension'));
    const resultat = q(S.resultat);
    return {
      url: location.href,
      kort: rect(kort), tal: rect(tal), eyebrow: rect(eyebrow), stopp: rect(stopp), not: rect(not), input: rect(input),
      agerJa: rect(agerJa), agerNej: rect(agerNej), aldreNej: rect(aldreNej), pension: rect(pension), bock: rect(q(S.bock)),
      talText: txt(tal), prefixText: q(S.prefix) && !q(S.prefix).hidden ? txt(q(S.prefix)) : '', stoppText: txt(q(S.stopptext)), notText: not && !not.hidden && getComputedStyle(not).display !== 'none' ? txt(not) : '',
      resultatText: txt(resultat), h2Text: txt(q(S.h2)), eyebrowText: txt(eyebrow),
      typo: { tal: fs(tal), talW: fw(tal), prefix: fs(q(S.prefix)), eyebrow: fs(eyebrow), segLabel: fs(agerJa), segLabelW: fw(agerJa), segLabelValdW: fw(agerJa), segLabelOvaldW: fw(agerNej), input: fs(input), stopptext: fs(q(S.stopptext)), not: fs(not), per: fs(q(S.per)), h2: fs(q(S.h2)) },
      inputmode: input?.getAttribute('inputmode'), inputValue: input?.value,
      agerValt: (document.querySelector('input[name="ager"]:checked') || {}).value,
      aldreValt: (document.querySelector('input[name="aldre"]:checked') || {}).value,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      docH: document.documentElement.scrollHeight,
    };
  }, { S });
}

function skift(a, b, nyckel) {
  const A = a[nyckel], B = b[nyckel];
  if (!A || !B) return null;
  return { dy: r1(B.y - A.y), dh: r1(B.h - A.h) };
}

async function snap(page, S, fil) {
  const kort = await page.$(S.kort);
  await page.waitForTimeout(260);
  await kort.screenshot({ path: join(ut, fil + '.png') });
}

for (const v of ['v1', 'v2b', 'v3']) {
  const S = SEL[v];
  out[v] = {};
  for (const [vp, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    out[v][vp] = {};
    for (const mode of ['rot', 'gt']) {
      const url = `http://localhost:${port}/kalkylator/${v}/index.html?m=${mode}`;
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      const fel = [];
      page.on('pageerror', (e) => fel.push(String(e)));
      page.on('console', (m) => { if (m.type() === 'error') fel.push(m.text()); });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const T = {}; const steg = [];
      const p = `${v}-${vp}-${mode}`;

      T.default = await matt(page, S); await snap(page, S, `${p}-0-default`);

      await page.click(lab('ager', 'nej'));
      T.agerNej = await matt(page, S); await snap(page, S, `${p}-1-ager-nej`);
      steg.push({ steg: 'ager Nej', skiftEyebrow: skift(T.default, T.agerNej, 'eyebrow'), skiftForstaKontroll: skift(T.default, T.agerNej, 'agerJa'), skiftInput: skift(T.default, T.agerNej, 'input'), kortDh: r1(T.agerNej.kort.h - T.default.kort.h), talSynlig: T.agerNej.tal.synlig, stoppSynlig: T.agerNej.stopp.synlig, stoppText: T.agerNej.stoppText });

      await page.click(lab('ager', 'ja'));
      T.agerJaIgen = await matt(page, S); await snap(page, S, `${p}-2-ager-ja-igen`);
      steg.push({ steg: 'ager Ja igen', skiftTal: skift(T.default, T.agerJaIgen, 'tal'), skiftForstaKontroll: skift(T.default, T.agerJaIgen, 'agerJa'), kortDh: r1(T.agerJaIgen.kort.h - T.default.kort.h), talSynlig: T.agerJaIgen.tal.synlig, talText: T.agerJaIgen.prefixText + ' ' + T.agerJaIgen.talText });

      await page.click(lab('aldre', 'nej'));
      T.aldreNej = await matt(page, S); await snap(page, S, `${p}-3-femar-nej`);
      steg.push({ steg: 'fem år Nej', skiftTal: skift(T.default, T.aldreNej, 'tal'), skiftEyebrow: skift(T.default, T.aldreNej, 'eyebrow'), skiftForstaKontroll: skift(T.default, T.aldreNej, 'agerJa'), skiftFemarKontroll: skift(T.default, T.aldreNej, 'aldreNej'), skiftInput: skift(T.default, T.aldreNej, 'input'), kortDh: r1(T.aldreNej.kort.h - T.default.kort.h), notSynlig: T.aldreNej.not?.synlig ?? false, notText: T.aldreNej.notText });

      await page.click(lab('aldre', 'ja'));
      T.aldreJaIgen = await matt(page, S);
      steg.push({ steg: 'fem år Ja igen', kortDh: r1(T.aldreJaIgen.kort.h - T.default.kort.h), notText: T.aldreJaIgen.notText });

      /* Inkomst: skriv tecken för tecken och logga vad talet visar efter varje tangent */
      await page.click(S.input);
      const mellan = [];
      for (const ch of '180000') {
        await page.keyboard.type(ch);
        const m = await matt(page, S, 60);
        mellan.push({ falt: m.inputValue, tal: (m.prefixText + ' ' + m.talText).trim(), bock: m.bock?.synlig ?? null });
      }
      T.lon180 = await matt(page, S); await snap(page, S, `${p}-4-lon-180000`);
      steg.push({ steg: 'lön 180 000', mellan, talText: (T.lon180.prefixText + ' ' + T.lon180.talText).trim(), faltVarde: T.lon180.inputValue, skiftTal: skift(T.default, T.lon180, 'tal'), skiftForstaKontroll: skift(T.default, T.lon180, 'agerJa'), kortDh: r1(T.lon180.kort.h - T.default.kort.h) });

      /* Pension 240 000 */
      await page.click(lab('typ', 'pension'));
      await page.fill(S.input, '');
      await page.click(S.input);
      await page.keyboard.type('240000');
      T.pension240 = await matt(page, S); await snap(page, S, `${p}-5-pension-240000`);
      steg.push({ steg: 'pension 240 000', talText: (T.pension240.prefixText + ' ' + T.pension240.talText).trim(), faltVarde: T.pension240.inputValue, skiftTal: skift(T.default, T.pension240, 'tal'), kortDh: r1(T.pension240.kort.h - T.default.kort.h) });

      /* Tom igen */
      await page.click(S.input);
      await page.keyboard.press('Meta+a').catch(() => {});
      await page.fill(S.input, '');
      await page.dispatchEvent(S.input, 'input');
      T.tom = await matt(page, S); await snap(page, S, `${p}-6-tom-igen`);
      steg.push({ steg: 'inkomst tom igen', talText: (T.tom.prefixText + ' ' + T.tom.talText).trim(), skiftTal: skift(T.default, T.tom, 'tal'), kortDh: r1(T.tom.kort.h - T.default.kort.h) });

      /* Fokus i fältet: skiftar layouten? (fokusring, mm) */
      await page.click(lab('typ', 'lon'));
      await page.focus(S.input);
      T.fokus = await matt(page, S); await snap(page, S, `${p}-7-faltfokus`);
      steg.push({ steg: 'fokus i beloppsfältet', skiftInput: skift(T.default, T.fokus, 'input'), skiftTal: skift(T.default, T.fokus, 'tal'), kortDh: r1(T.fokus.kort.h - T.default.kort.h) });

      /* Enter i fältet: submit-läcka? */
      await page.keyboard.type('180000');
      const urlFore = page.url();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
      const urlEfter = page.url();
      const varde = await page.evaluate((s) => document.querySelector(s)?.value, S.input);
      const modeEfter = await page.evaluate(() => new URLSearchParams(location.search).get('m'));
      steg.push({ steg: 'Enter i fältet', urlFore, urlEfter, sidanLaddadesOm: urlFore !== urlEfter, faltVardeEfter: varde, modeEfter });

      /* Tangentbord: Tab in i första segmentet, pil höger */
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);
      await page.keyboard.press('Tab');
      const aktiv1 = await page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}[name=${a.getAttribute('name')}][value=${a.value}]` : null; });
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(250);
      const tb = await page.evaluate(({ S }) => {
        const a = document.activeElement;
        const label = a?.closest('label');
        const cs = label ? getComputedStyle(label) : null;
        const inp = a ? getComputedStyle(a) : null;
        return {
          aktiv: a ? `${a.tagName}[name=${a.getAttribute('name')}][value=${a.value}]` : null,
          agerValt: (document.querySelector('input[name="ager"]:checked') || {}).value,
          labelBoxShadow: cs?.boxShadow, labelOutline: cs?.outlineStyle + ' ' + cs?.outlineWidth,
          inputOutline: inp ? inp.outlineStyle + ' ' + inp.outlineWidth + ' opacity ' + inp.opacity : null,
          stoppSynlig: (() => { const s = document.querySelector(S.stopp); if (!s) return false; const c = getComputedStyle(s); return !s.hidden && c.display !== 'none' && c.visibility !== 'hidden'; })(),
        };
      }, { S });
      await snap(page, S, `${p}-8-tangentbord-pil`);
      /* Tab vidare: räkna hur många Tab till fältet */
      let tabs = 0, hitFalt = false;
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab'); tabs++;
        hitFalt = await page.evaluate((s) => document.activeElement === document.querySelector(s), S.input);
        if (hitFalt) break;
      }
      await page.waitForTimeout(300);
      const faltFokusStil = await page.evaluate((s) => { const el = document.querySelector(s); const c = getComputedStyle(el); return { boxShadow: c.boxShadow, borderColor: c.borderColor, outline: c.outlineStyle + ' ' + c.outlineWidth }; }, S.input);
      steg.push({ steg: 'tangentbord', forstaTab: aktiv1, efterPilHoger: tb, tabTillFalt: hitFalt ? tabs + 1 : null, faltFokusStil });

      /* gt: femårsfrågan finns? Nej på fem år gör något? */
      if (mode === 'gt') {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(200);
        const fore = await matt(page, S);
        await page.click(lab('aldre', 'nej'));
        const efter = await matt(page, S);
        steg.push({ steg: 'gt: fem år Nej', femarFragaFinns: !!(await page.$('input[name="aldre"]')), resultatFore: fore.resultatText, resultatEfter: efter.resultatText, notText: efter.notText, kortDh: r1(efter.kort.h - fore.kort.h) });
        await page.click(lab('ager', 'nej'));
        const st = await matt(page, S); await snap(page, S, `${p}-9-gt-ager-nej`);
        steg.push({ steg: 'gt: ager Nej', stoppText: st.stoppText, eyebrow: st.eyebrowText, h2: st.h2Text });
      }

      /* Reduced motion: animation-duration i bytesögonblicket */
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      const pg = await ctx.newPage();
      await pg.goto(url, { waitUntil: 'networkidle' });
      await pg.waitForTimeout(200);
      await pg.click(lab('ager', 'nej'));
      const rm = await pg.evaluate((S) => {
        const el = document.querySelector(S.stopp);
        const c = getComputedStyle(el);
        const bock = S.bock ? document.querySelector(S.bock) : null;
        return { stoppAnimDur: c.animationDuration, stoppAnimName: c.animationName, bockAnimDur: bock ? getComputedStyle(bock).animationDuration : null, reduce: matchMedia('(prefers-reduced-motion: reduce)').matches };
      }, S);
      await ctx.close();
      steg.push({ steg: 'reduced motion', ...rm });

      /* Mobil: tangentbordssynlighet: avstånd fält <-> tal */
      const avstFaltTal = T.default.tal && T.default.input ? r1(Math.max(T.default.input.y + T.default.input.h, T.default.tal.y + T.default.tal.h) - Math.min(T.default.input.y, T.default.tal.y)) : null;

      out[v][vp][mode] = {
        fel, overflowX: T.default.overflowX, docH: T.default.docH,
        kort: T.default.kort, h2: T.default.h2Text, eyebrow: T.default.eyebrowText, resultatText: T.default.resultatText,
        typo: T.default.typo, inputmode: T.default.inputmode,
        tapYtor: { agerJa: T.default.agerJa, agerNej: T.default.agerNej, pension: T.default.pension, input: T.default.input },
        talPos: T.default.tal, inputPos: T.default.input, spannFaltTal: avstFaltTal,
        steg,
      };
      await page.close();
    }
  }
}
await browser.close();
server.close();
await writeFile(join(here, 'r1-probe.json'), JSON.stringify(out, null, 1));
console.log('klart -> kalkylator/_review/r1-probe.json + shots/');
