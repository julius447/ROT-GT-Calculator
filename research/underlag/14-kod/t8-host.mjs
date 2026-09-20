import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => { try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(0, r)); const port = server.address().port;
const browser = await chromium.launch();
for (const [w, h] of [[1440, 1000], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const failed = []; page.on('requestfailed', r => failed.push(r.url().slice(0, 100)));
  const resp = []; page.on('response', r => { if (/\.css/.test(r.url())) resp.push(r.status() + ' ' + r.url().slice(0, 110)); });
  await page.goto(`http://localhost:${port}/kalkylator/artikel/index.html?p=hoger&m=rot`, { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const el = document.querySelector('#rk-inkomst-1'); const hits = [];
    const walk = (rules, sheet) => { for (const rule of rules) { try { if (rule.cssRules && !(rule instanceof CSSStyleRule)) { walk(rule.cssRules, sheet); continue; } if (rule instanceof CSSStyleRule && rule.style && (rule.style.fontSize || rule.style.font) && el.matches(rule.selectorText)) hits.push({ sheet: (sheet.href || 'inline').slice(-60), sel: rule.selectorText.slice(0, 120), fs: rule.style.fontSize || rule.style.font, prio: rule.style.getPropertyPriority('font-size') }); } catch (e) {} } };
    for (const s of document.styleSheets) { try { walk(s.cssRules, s); } catch (e) { hits.push({ sheet: (s.href || 'inline').slice(-60), err: 'cors' }); } }
    const k = document.querySelector('#avdragskollen');
    return { hits, inputFs: getComputedStyle(el).fontSize, cardW: Math.round(k.getBoundingClientRect().width), cols: getComputedStyle(k).gridTemplateColumns.split(' ').length, sheets: document.styleSheets.length };
  });
  console.log('=== ' + w + ' ===', JSON.stringify({ ...r, failed: failed.slice(0, 5), cssResp: resp.slice(0, 12) }, null, 1));
  await page.close();
}
await browser.close(); server.close();
