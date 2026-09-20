import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator';
const src = await readFile(join(root, 'kalkylator/v1/index.html'), 'utf8');
// two copies of the section (ids untouched = what a naive double shortcode would do), one module script
const section = src.slice(src.indexOf('<h2 class="ampy-h2 rk__rubrik"'), src.indexOf('</section>') + '</section>'.length);
const multi = src.replace(section, section + '\n<hr>\n' + section.replace('data-mode="rot"', 'data-mode="gt"'));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/kalkylator/v1/multi.html') { res.writeHead(200, { 'content-type': mime['.html'] }); return res.end(multi); }
  try { let p = join(root, path); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r)); const port = server.address().port;
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
await page.goto(`http://localhost:${port}/kalkylator/v1/multi.html`, { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const secs = [...document.querySelectorAll('section.rk')];
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id); const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  return { instances: secs.length, dupIds: dup.length, sample: dup.slice(0, 6), modes: secs.map(s => s.dataset.mode), tal: [...document.querySelectorAll('#rk-tal')].map(t => t.textContent) };
});
// answer "Nej" in the SECOND instance and see which panel changes
await page.evaluate(() => { const i = document.querySelectorAll('input[name="ager"][value="nej"]')[1]; i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForTimeout(100);
const after = await page.evaluate(() => [...document.querySelectorAll('section.rk')].map(s => ({ status: s.querySelector('.rk__resultat').dataset.status, stoppHidden: s.querySelector('.rk__stopp').hidden })));
// type income in the SECOND instance's field
await page.evaluate(() => { const i = document.querySelectorAll('[data-falt="inkomst"]')[1]; i.value = '180000'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForTimeout(700);
const after2 = await page.evaluate(() => [...document.querySelectorAll('section.rk')].map(s => ({ status: s.querySelector('.rk__resultat').dataset.status, tal: s.querySelector('.rk__tal').textContent, prefix: s.querySelector('.rk__prefix').textContent, personerLasta: s.querySelectorAll('.rk__person').length })));
console.log(JSON.stringify({ errors, r, afterNejInstance2: after, afterIncomeInstance2: after2 }, null, 1));
await browser.close(); server.close();
