/* R2 designgranskning: mätprob för v1 / v2b / v3. Serverar repo-roten, renderar 1440 + 390 i rot- och gt-läge,
   mäter vertikal rytm (box-till-box), typografi per roll, vänsterkanter, kontroller, ytor (alla computed
   backgrounds), kontrast, baslinjer i talraden, tomrum i resultatytan, och renderar tillstånden som kort-klipp.
   Kör: node kalkylator/_review/r2-probe.mjs   -> kalkylator/_review/r2-matt.json + r2-<v>-<vp>-<state>.png */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat, writeFile } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
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

/* Selektorkarta per version (samma roller, olika klassnamn) */
const S = {
  v1: {
    h2: '#rk-rubrik', card: '#avdragskollen', fragor: '.rk__fragor', q: '.rk__fraga', qLabel: '.rk__etikett', under: '.rk__under',
    ctl: ':scope > .rk__segment, :scope > .rk__inkomst', seg: '.rk__segment', opt: '.rk__segment > label', input: '#rk-inkomst', kr: '.rk__enhet',
    panel: '.rk__panel', eyebrow: '#rk-eyebrow', talrad: '#rk-talrad', prefix: '#rk-prefix', num: '#rk-tal', unit: '#rk-talenhet', per: '#rk-per',
    not: '#rk-not', stopp: '#rk-stopp', x: '.rk__x', stopptext: '#rk-stopptext', bock: null, main: '.rk-spalt',
  },
  v2b: {
    h2: '#rk-h2', card: '.rk__card', fragor: '.rk__fragor', q: '.rk__q', qLabel: '.rk__fraga', under: '.rk__under',
    ctl: ':scope > .rk__kontroll', seg: '.rk__seg', opt: '.rk__seg > label', input: '#rk-inkomst', kr: '.rk__kr',
    panel: '.rk__band', eyebrow: '#rk-etikett', talrad: '#rk-tal', prefix: '#rk-prefix', num: '#rk-num', unit: '#rk-enhet', per: '#rk-per',
    not: '#rk-not', stopp: '#rk-stopp', x: '.rk__x', stopptext: '#rk-stopp-text', bock: null, main: '.rk-main',
  },
  v3: {
    h2: '#ak-rubrik', card: '.ak__kort', fragor: '.ak__fragor', q: '.ak__fraga', qLabel: '.ak__q', under: '.ak__under',
    ctl: ':scope > .ak__kontroll', seg: '.ak__seg', opt: '.ak__seg > label', input: '#ak-inkomst', kr: '.ak__kr',
    panel: '.ak__hero', eyebrow: '#ak-etikett', talrad: '#ak-tal', prefix: '#ak-prefix', num: '#ak-siffra', unit: '.ak__enhet', per: '.ak__per',
    not: '#ak-not', stopp: '#ak-stopp', x: '.ak__kryss', stopptext: '#ak-stopp-text', bock: '#ak-bock', main: '.ak-main',
  },
};

const browser = await chromium.launch();
const out = {};
const r1 = (n) => Math.round(n * 10) / 10;

async function matt(page, S) {
  return page.evaluate((S) => {
    const q = (s, r = document) => (s ? r.querySelector(s) : null);
    const qa = (s, r = document) => (s ? [...r.querySelectorAll(s)] : []);
    const b = (el) => el.getBoundingClientRect();
    const cs = (el) => getComputedStyle(el);
    const r1 = (n) => Math.round(n * 10) / 10;
    const vis = (el) => el && !el.hidden && cs(el).display !== 'none' && cs(el).visibility !== 'hidden' && b(el).height > 0;

    /* baslinje: nollhög inline-block med vertical-align baseline; top = baslinjens y */
    const baseline = (el) => {
      if (!el) return null;
      const probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0';
      el.appendChild(probe);
      const y = b(probe).top;
      probe.remove();
      return r1(y);
    };

    /* effektiv bakgrund: gå upp tills en icke-transparent bakgrund hittas, komponera alfa mot vit */
    const parseRgb = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const effBg = (el) => {
      let acc = null; let e = el;
      const layers = [];
      while (e && e !== document.documentElement.parentNode) {
        const c = parseRgb(cs(e).backgroundColor);
        if (c && c.a > 0) layers.push(c);
        if (c && c.a >= 1) break;
        e = e.parentElement;
      }
      let base = { r: 255, g: 255, b: 255 };
      for (let i = layers.length - 1; i >= 0; i--) { const l = layers[i]; base = { r: l.r * l.a + base.r * (1 - l.a), g: l.g * l.a + base.g * (1 - l.a), b: l.b * l.a + base.b * (1 - l.a) }; }
      return base;
    };
    const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const contrast = (fg, bg) => { const a = lum(fg), c = lum(bg); return r1(((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05)) * 100) / 100; };
    const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

    const typo = (el) => {
      if (!el) return null; const c = cs(el); const fg = parseRgb(c.color); const bg = effBg(el);
      return { fs: r1(parseFloat(c.fontSize)), fw: c.fontWeight, lh: c.lineHeight === 'normal' ? 'normal' : r1(parseFloat(c.lineHeight)), ls: c.letterSpacing, tt: c.textTransform, fvn: c.fontVariantNumeric,
        color: c.color, bg: hex(bg), kontrast: fg ? contrast(fg, bg) : null, font: c.fontFamily.split(',')[0].replace(/"/g, '') };
    };
    const box = (el) => { if (!el) return null; const r = b(el); return { x: r1(r.x), y: r1(r.y), w: r1(r.width), h: r1(r.height), bottom: r1(r.bottom), right: r1(r.right) }; };

    const card = q(S.card), h2 = q(S.h2), main = q(S.main);
    const qs = qa(S.q);
    const fragor = qs.map((el) => {
      const label = q(S.qLabel, el), under = q(S.under, el), ctl = el.querySelector(S.ctl) || q(S.seg, el);
      return {
        label: label?.textContent.trim().slice(0, 40), labelBox: box(label), underBox: under && vis(under) ? box(under) : null, ctlBox: box(ctl),
        gap_label_under: under && vis(under) ? r1(b(under).top - b(label).bottom) : null,
        gap_under_ctl: under && vis(under) ? r1(b(ctl).top - b(under).bottom) : null,
        gap_label_ctl: r1(b(ctl).top - b(label).bottom),
        /* om underraden ligger under kontrollen (v3 desktop) */
        under_efter_ctl: under && vis(under) ? b(under).top >= b(ctl).bottom - 1 : null,
        gap_ctl_under: under && vis(under) && b(under).top >= b(ctl).bottom - 1 ? r1(b(under).top - b(ctl).bottom) : null,
      };
    });
    /* fråga -> fråga: från förra frågans sista box (kontroll eller underrad) till nästa etikett */
    const qGaps = [];
    for (let i = 1; i < qs.length; i++) {
      const prevBottom = Math.max(...[...qs[i - 1].querySelectorAll('*')].filter(vis).map((e) => b(e).bottom));
      const nextTop = b(q(S.qLabel, qs[i])).top;
      qGaps.push({ fran: i, till: i + 1, gap: r1(nextTop - prevBottom), samma_rad: Math.abs(b(q(S.qLabel, qs[i])).top - b(q(S.qLabel, qs[i - 1])).top) < 2 });
    }

    const seg = qa(S.seg), opts = qa(S.opt);
    const input = q(S.input), kr = q(S.kr);
    const selected = opts.find((o) => o.querySelector('input')?.checked);
    const unselected = opts.find((o) => !o.querySelector('input')?.checked);

    const panel = q(S.panel), eyebrow = q(S.eyebrow), talrad = q(S.talrad), prefix = q(S.prefix), num = q(S.num), unit = q(S.unit), per = q(S.per), not = q(S.not), stopp = q(S.stopp), x = q(S.x), stopptext = q(S.stopptext), bock = S.bock ? q(S.bock) : null;

    /* innehållets bbox i resultatytan (för tomrum) */
    const panelKids = [...panel.querySelectorAll('*')].filter((e) => vis(e) && e.textContent.trim() && !e.querySelector('*'));
    const cb = panelKids.reduce((acc, e) => { const r = b(e); return { l: Math.min(acc.l, r.left), t: Math.min(acc.t, r.top), r: Math.max(acc.r, r.right), b: Math.max(acc.b, r.bottom) }; }, { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
    const pb = b(panel);
    const tomrum = { panel: box(panel), innehall: { x: r1(cb.l), y: r1(cb.t), w: r1(cb.r - cb.l), h: r1(cb.b - cb.t) },
      andel_bredd: r1(((cb.r - cb.l) / pb.width) * 100), andel_hojd: r1(((cb.b - cb.t) / pb.height) * 100), andel_yta: r1((((cb.r - cb.l) * (cb.b - cb.t)) / (pb.width * pb.height)) * 100),
      hoger_tomt: r1(pb.right - cb.r), vanster: r1(cb.l - pb.left), topp: r1(cb.t - pb.top), botten: r1(pb.bottom - cb.b) };

    /* alla bakgrunder i verktyget (midnattsjakt) */
    const ytor = [...card.querySelectorAll('*'), card].map((e) => ({ el: e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').join('.') : ''), bg: cs(e).backgroundColor, bgi: cs(e).backgroundImage }))
      .filter((o) => (o.bg !== 'rgba(0, 0, 0, 0)' && o.bg !== 'transparent') || o.bgi !== 'none');
    const morka = ytor.filter((o) => { const c = parseRgb(o.bg); return c && c.a > 0.5 && lum(c) < 0.25; });

    /* vänsterkanter */
    const kanter = { h2: r1(b(h2).left), fragor: fragor.map((f) => f.labelBox?.x), kontroller: fragor.map((f) => f.ctlBox?.x), eyebrow: r1(b(eyebrow).left), talrad: r1(b(talrad).left), per: per ? r1(b(per).left) : null, card: r1(b(card).left), panel: r1(b(panel).left) };

    /* kr-suffix i fältet: avstånd från fältets högerkant och från textens slut (text-align right => textens högerkant = fältets right - padding-right) */
    const ic = cs(input);
    const krInfo = kr ? { fs: typo(kr).fs, fw: typo(kr).fw, color: typo(kr).color, right_till_kant: r1(b(input).right - b(kr).right), gap_text_kr: r1(b(kr).left - (b(input).right - parseFloat(ic.paddingRight))) } : null;

    const cardCs = cs(card);
    return {
      viewport: { w: innerWidth, h: innerHeight },
      main: { box: box(main), padding: cs(main).padding, maxWidth: cs(main).maxWidth },
      card: { box: box(card), padding: cardCs.padding, border: cardCs.border, radius: cardCs.borderRadius, shadow: cardCs.boxShadow, bg: cardCs.backgroundColor, overflow: cardCs.overflow },
      h2: { ...typo(h2), box: box(h2), text: h2.textContent.trim(), rader: r1(b(h2).height / parseFloat(cs(h2).lineHeight)), margin: cs(h2).margin, i_kortet: card.contains(h2) },
      gap_h2_card: r1(b(card).top - b(h2).bottom),
      gap_h2_q1: r1(b(q(S.qLabel, qs[0])).top - b(h2).bottom),
      gap_cardtop_first: r1(b(card.contains(h2) ? h2 : (b(panel).top < b(q(S.qLabel, qs[0])).top ? eyebrow : q(S.qLabel, qs[0]))).top - b(card).top),
      gap_last_cardbottom: r1(b(card).bottom - Math.max(...[...card.querySelectorAll('*')].filter(vis).map((e) => b(e).bottom))),
      fragor, qGaps,
      typo: { q: typo(q(S.qLabel, qs[0])), under: typo(q(S.under)), eyebrow: typo(eyebrow), prefix: typo(prefix), num: typo(num), unit: typo(unit), per: typo(per), not: not && vis(not) ? typo(not) : null, stopptext: stopptext && vis(stopptext) ? typo(stopptext) : null,
        opt_vald: typo(selected), opt_ovald: typo(unselected), input: typo(input), kr: krInfo, placeholder: (() => { const c = getComputedStyle(input, '::placeholder'); return { color: c.color, fw: c.fontWeight }; })() },
      kontroller: { seg: seg.map((s) => ({ box: box(s), pad: cs(s).padding, bg: cs(s).backgroundColor, radius: cs(s).borderRadius })), opt: opts.map((o) => ({ text: o.textContent.trim(), box: box(o), radius: cs(o).borderRadius, checked: !!o.querySelector('input')?.checked, bg: cs(o).backgroundColor, shadow: cs(o).boxShadow })),
        input: { box: box(input), radius: ic.borderRadius, border: ic.border, padR: ic.paddingRight, padL: ic.paddingLeft, textAlign: ic.textAlign }, },
      panel: { box: box(panel), bg: cs(panel).backgroundColor, effBg: hex(effBg(panel)), border: { t: cs(panel).borderTop, l: cs(panel).borderLeft, b: cs(panel).borderBottom }, radius: cs(panel).borderRadius, padding: cs(panel).padding,
        gap_paneltop_eyebrow: r1(b(eyebrow).top - b(panel).top), gap_eyebrow_tal: r1(b(talrad).top - b(eyebrow).bottom), gap_tal_per: per ? r1(b(per).top - b(talrad).bottom) : null, gap_per_panelbottom: per ? r1(b(panel).bottom - b(per).bottom) : null,
        talrad: box(talrad), talrad_bredd: r1(b(talrad).width),
        baslinjer: { prefix: prefix && vis(prefix) ? baseline(prefix) : null, num: baseline(num), unit: unit && vis(unit) ? baseline(unit) : null },
        eyebrow_dash: !!eyebrow.className.match(/dash/), },
      tomrum,
      kanter,
      ytor_ej_transparenta: ytor, morka_ytor: morka,
      sidbakgrund: cs(document.body).backgroundColor,
      stopp: stopp && vis(stopp) ? { box: box(stopp), x: box(x), xBg: cs(x).backgroundColor || null, xFill: x.querySelector('circle') ? cs(x.querySelector('circle')).fill : null, text: typo(stopptext), gap_x_text: r1(b(stopptext).left - b(x).right), x_mitt_vs_text_mitt: r1((b(x).top + b(x).height / 2) - (b(stopptext).top + b(stopptext).height / 2)), text_rader: r1(b(stopptext).height / parseFloat(cs(stopptext).lineHeight)) } : null,
      bock: bock && vis(bock) ? { box: box(bock), bg: cs(bock).backgroundColor } : null,
      not: not && vis(not) ? { box: box(not), typo: typo(not), gap_per_not: per ? r1(b(not).top - b(per).bottom) : null, samma_rad_som_per: per ? Math.abs(b(not).top - b(per).top) < 2 : null, border: cs(not).borderTop } : null,
      dokHojd: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  }, S);
}

async function klipp(page, sel, path, pad = 24) {
  const r = await page.evaluate((sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }, sel);
  const vw = await page.evaluate(() => innerWidth);
  await page.screenshot({ path, clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.min(vw, r.w + pad * 2), height: r.h + pad * 2 }, fullPage: true });
}

for (const v of ['v1', 'v2b', 'v3']) {
  out[v] = {};
  for (const [vp, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    const url = (m) => `http://localhost:${port}/kalkylator/${v}/index.html?m=${m}`;
    await page.goto(url('rot'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const sel = S[v];
    const res = { errors };
    res.start = await matt(page, sel);
    /* H2-klipp: rubriken + kortets topp */
    await klipp(page, sel.h2, join(here, `r2-${v}-${vp}-h2.png`), 8);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-0-start.png`));
    /* Nej på ägande */
    await page.click(`label:has(input[name="ager"][value="nej"])`); await page.waitForTimeout(350);
    res.agerNej = await matt(page, sel);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-1-ager-nej.png`));
    await page.click(`label:has(input[name="ager"][value="ja"])`); await page.waitForTimeout(350);
    res.agerJaIgen = { num: await page.textContent(sel.num), stoppSynlig: await page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'; }, sel.stopp) };
    /* Nej på fem år */
    await page.click(`label:has(input[name="aldre"][value="nej"])`); await page.waitForTimeout(350);
    res.aldreNej = await matt(page, sel);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-2-aldre-nej.png`));
    await page.click(`label:has(input[name="aldre"][value="ja"])`); await page.waitForTimeout(200);
    /* 180 000 lön */
    await page.fill(sel.input, '180000'); await page.waitForTimeout(350);
    res.lon180 = await matt(page, sel);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-3-lon-180000.png`));
    /* Pension 240 000 */
    await page.click(`label:has(input[name="typ"][value="pension"])`); await page.fill(sel.input, '240000'); await page.waitForTimeout(350);
    res.pension240 = await matt(page, sel);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-4-pension-240000.png`));
    /* stort belopp i fältet: 1 200 000 (fältets bredd) */
    await page.click(`label:has(input[name="typ"][value="lon"])`); await page.fill(sel.input, '1200000'); await page.waitForTimeout(200);
    res.stortBelopp = { input: await page.evaluate((s) => { const i = document.querySelector(s); return { value: i.value, scrollWidth: i.scrollWidth, clientWidth: i.clientWidth, overflow: i.scrollWidth > i.clientWidth }; }, sel.input) };
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-5-lon-1200000.png`));
    /* fokus i fältet + tab-fokus i segmentet */
    await page.focus(sel.input);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-6-fokus-falt.png`));
    /* gt-läge */
    await page.goto(url('gt'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
    res.gt = await matt(page, sel);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-7-gt-start.png`));
    await klipp(page, sel.h2, join(here, `r2-${v}-${vp}-7-gt-h2.png`), 8);
    await page.click(`label:has(input[name="ager"][value="nej"])`); await page.waitForTimeout(350);
    res.gtAgerNej = await matt(page, sel);
    await klipp(page, sel.card, join(here, `r2-${v}-${vp}-8-gt-ager-nej.png`));
    out[v][vp] = res;
    await page.close();
  }
}
await browser.close(); server.close();
await writeFile(join(here, 'r2-matt.json'), JSON.stringify(out, null, 1));
console.log('skrivet: kalkylator/_review/r2-matt.json');
