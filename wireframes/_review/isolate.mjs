// Isolate two suspected defects: (1) C's count-up tween overwriting a later verdict (stale amount),
// (2) B/C not registering a tap on a pre-selected chip as a confirmation (antaget -> bekräftat).
import { serve, launch, url, ADAPT, VIEW, txt, tap, typeAmount } from './lib.mjs';

const { server, base } = await serve();
const browser = await launch();
const out = {};

async function fresh(key, q) {
  const page = await browser.newPage({ viewport: VIEW.desktop });
  await page.goto(url(base, key, q), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  return page;
}

// ---- (1) C race: batteri tap then sol=nej within 100 ms vs after 1 000 ms
for (const gap of [60, 1000]) {
  const page = await fresh('c', '?m=gt');
  await tap(page, ADAPT.c.radio('gt', 'lage', 'batteri'));
  await page.waitForTimeout(gap);
  await tap(page, ADAPT.c.radio('gt', 'sol', 'nej'));
  await page.waitForTimeout(900);
  out[`c_race_gap${gap}`] = { headline: await txt(page, '#verdict-h'), rubrik: await txt(page, '.meter__rubrik') };
  await page.close();
}
// C race with a hard nej: type an amount (starts a tween), then tap hyra immediately
{
  const page = await fresh('c', '?m=rot');
  const el = page.locator(ADAPT.c.amount('rot', 'belopp'));
  await el.click(); await el.fill(''); await el.type('60000', { delay: 5 }); await el.press('Tab');
  await page.waitForTimeout(420);           // debounce fires -> tween starts (280 ms)
  await tap(page, ADAPT.c.radio('rot', 'boende', 'hyra'));
  await page.waitForTimeout(900);
  out.c_race_hyra = { headline: await txt(page, '#verdict-h'), rubrik: await txt(page, '.meter__rubrik'), legend: await txt(page, '.meter__legend') };
  await page.close();
}
// Same two sequences in A and B for comparison
for (const key of ['a', 'b']) {
  const page = await fresh(key, '?m=gt');
  await tap(page, ADAPT[key].radio('gt', 'lage', 'batteri'));
  await page.waitForTimeout(60);
  await tap(page, ADAPT[key].radio('gt', 'sol', 'nej'));
  await page.waitForTimeout(900);
  const R = ADAPT[key].read('gt');
  out[`${key}_race_gap60`] = { headline: await txt(page, R.headline), rubrik: await txt(page, R.rubrik) };
  await page.close();
}

// ---- (2) confirm-tap: tap the three pre-selected ROT chips, read the villkor statuses + headline
for (const key of ['a', 'b', 'c']) {
  const page = await fresh(key, '?m=rot');
  const A = ADAPT[key];
  await tap(page, A.radio('rot', 'boende', 'villa'));
  await page.waitForTimeout(300);
  const R = A.read('rot');
  const afterOne = await page.$$eval(R.villkor, (els) => els.filter((e) => e.offsetParent !== null).map((e) => [...e.classList].filter((c) => /(ok|antaget|okand|varning|stopp|skoter_vi|neutral)$/.test(c)).join(',')));
  await tap(page, A.radio('rot', 'vardear', 't2011'));
  await tap(page, A.radio('rot', 'skatt', 'lon'));
  await page.waitForTimeout(800);
  out[`${key}_confirm`] = { after_villa_tap_rows: afterOne, headline_after_three_taps: await txt(page, R.headline), ram: await txt(page, R.ram) };
  // keyboard variant: focus the checked radio and press Space / Enter
  await page.close();
}

// ---- (2b) keyboard: can a keyboard user confirm a pre-selected chip? (Space on a checked radio does nothing natively)
for (const key of ['a', 'b', 'c']) {
  const page = await fresh(key, '?m=rot');
  const A = ADAPT[key];
  const sel = A.radio('rot', 'boende', 'villa');
  await page.focus(sel);
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  const R = A.read('rot');
  const rows = await page.$$eval(R.villkor, (els) => els.filter((e) => e.offsetParent !== null).map((e) => [...e.classList].filter((c) => /(ok|antaget|okand|varning|stopp|skoter_vi|neutral)$/.test(c)).join(',')));
  out[`${key}_confirm_keyboard_space`] = rows;
  await page.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(out, null, 1));
