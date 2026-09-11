// Shared harness for the review probes: static server + per-direction DOM adapters.
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { resolve, join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };

export async function serve() {
  const server = createServer(async (req, res) => {
    try {
      const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let fp = join(ROOT, p);
      if ((await stat(fp)).isDirectory()) fp = join(fp, 'index.html');
      res.writeHead(200, { 'content-type': mime[extname(fp)] || 'application/octet-stream' });
      res.end(await readFile(fp));
    } catch { res.writeHead(404); res.end('not found'); }
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  return { server, base: `http://localhost:${port}` };
}

export const DIRS = {
  a: { dir: 'a-villkorstavlan', name: 'A Villkorstavlan' },
  b: { dir: 'b-kvittot', name: 'B Kvittot' },
  c: { dir: 'c-avdragsmataren', name: 'C Avdragsmätaren' },
};

export function url(base, key, query) { return `${base}/wireframes/${DIRS[key].dir}/index.html${query || ''}`; }

export async function launch() { return chromium.launch(); }

export const VIEW = { desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 } };

/** Per-direction adapters: how to drive and read each wireframe. `mode` is 'rot'|'gt'. */
export const ADAPT = {
  a: {
    scope: (mode) => `#ak-${mode}`,
    radio: (mode, q, v) => `#ak-${mode} input[type="radio"][data-q="${q}"][value="${v}"]`,
    amount: (mode, q) => `#ak-${mode} input[data-q="${q}"]`,
    details: (mode) => `#ak-${mode}-details`,
    read: (mode) => ({
      headline: `#ak-${mode}-headline`, eyebrow: `#ak-${mode}-eyebrow`, ram: `#ak-${mode}-ram`,
      rubrik: `#ak-${mode}-rubrik`, bas: `#ak-${mode}-bas`, betala: `#ak-${mode}-betala`,
      cta: `#ak-${mode}-cta`, disclaimer: `#ak-${mode} .ak-disclaimer`, kalla: `#ak-${mode} .ak-sum__kalla`,
      metod: `#ak-${mode}-metodlist`, villkor: `#ak-${mode}-rows .ak-row--q, #ak-${mode}-crows .ak-row--c`,
    }),
  },
  b: {
    scope: () => '#ak',
    radio: (mode, q, v) => `#inputs input[type="radio"][name="${q}"][value="${v}"]`,
    amount: (mode, q) => `#inputs input[name="${q}"]`,
    details: () => '#more',
    read: () => ({
      headline: '.kv__title', eyebrow: '.kv__eyebrow', ram: '.kv__ram', stamp: '.stamp',
      rubrik: '.line[data-line="avdrag"] .line__amt', bas: '.line[data-line="avdrag"] .line__note', betala: '.total',
      cta: '#kv-cta', disclaimer: '.ak__disclaimer', kalla: '.kv__source', metod: '#kv-metod ol', villkor: '#kv-stamps .srow',
    }),
  },
  c: {
    scope: () => '#verktyg',
    radio: (mode, q, v) => `#verktyg input[type="radio"][name="${q}"][value="${v}"]`,
    amount: (mode, q) => `#verktyg input[name="${q}"]`,
    details: () => '#fler',
    read: () => ({
      headline: '#verdict-h', eyebrow: '.verdict__eyebrow', ram: '.verdict__ram',
      rubrik: '.meter__rubrik', bas: '.meter__bas', betala: '.meter__betala',
      cta: '#cta', disclaimer: '#verktyg .disclaimer', kalla: '.metod__kalla', metod: '#metod-list', villkor: '.villkor__row',
    }),
  },
};

export const txt = async (page, sel) => {
  const el = await page.$(sel);
  if (!el) return null;
  return (await el.evaluate((e) => e.innerText.replace(/\s+/g, ' ').trim()));
};

/** Set an amount field the way a user would: click, select all, type, blur; wait for debounces. */
export async function typeAmount(page, sel, value) {
  const el = page.locator(sel).first();
  await el.click();
  await el.fill('');
  await el.type(String(value), { delay: 10 });
  await el.press('Tab');
  await page.waitForTimeout(700);
}

/** Tap a radio chip (click the label so it behaves like a finger on the chip). */
export async function tap(page, sel) {
  const el = page.locator(sel).first();
  const label = el.locator('xpath=ancestor::label[1]');
  if (await label.count()) await label.click(); else await el.click({ force: true });
  await page.waitForTimeout(80);
}
