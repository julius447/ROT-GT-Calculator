import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator';
const patched = process.argv[2];
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => { const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/kalkylator/v1/app.js' && patched) { res.writeHead(200, { 'content-type': mime['.js'] }); return res.end(await readFile(patched)); }
  try { let p = join(root, path); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(0, r)); const port = server.address().port;
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=rot`, { waitUntil: 'networkidle' });
for (let i = 0; i < 3; i++) { await page.click('#rk-lagg'); await page.waitForTimeout(50); }
await page.evaluate(() => document.querySelectorAll('.rk__tabort')[1].click()); await page.waitForTimeout(50);
await page.click('#rk-lagg'); await page.waitForTimeout(50);
const r = await page.evaluate(() => { const ids = [...document.querySelectorAll('[id]')].map(e => e.id); const dup = ids.filter((id, i) => ids.indexOf(id) !== i); const refs = [];
  for (const el of document.querySelectorAll('[for],[aria-labelledby],[aria-describedby]')) for (const attr of ['for','aria-labelledby','aria-describedby']) { const v = el.getAttribute(attr); if (!v) continue; for (const id of v.split(/\s+/)) if (!document.getElementById(id)) refs.push(attr + '=' + id); }
  const p2 = document.querySelectorAll('.rk__person')[1]; return { dup, refs, p2names: [...p2.querySelectorAll('input[type=radio]')].map(i => i.name).filter((v, i, a) => a.indexOf(v) === i), p2anvantDesc: p2.querySelector('[data-falt="anvant"]').getAttribute('aria-describedby'), p2alder: p2.querySelector('[role=radiogroup]').getAttribute('aria-labelledby'), personer: document.querySelectorAll('.rk__person').length }; });
await page.fill('#rk-inkomst-2', '180000'); await page.waitForTimeout(650);
r.tal = await page.evaluate(() => document.querySelector('#rk-tal').textContent.replace(/\u00a0/g, ' ')); r.errors = errors;
console.log((patched ? 'PATCHAD ' : 'NUVARANDE ') + JSON.stringify(r)); await browser.close(); server.close();
