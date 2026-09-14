/* Mäter textbredder (Range) för att bevisa att tre frågor i bredd inte rymmer underraden på en rad i 980-spalten. */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFile, stat } from 'fs/promises'; import { join, extname, resolve, dirname } from 'path'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url)); const root = resolve(here, '../..');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.woff2':'font/woff2' };
const server = createServer(async (req,res)=>{ try { let p=join(root, decodeURIComponent(new URL(req.url,'http://x').pathname)); if((await stat(p)).isDirectory()) p=join(p,'index.html'); res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'}); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
const port = 8900 + Math.floor(Math.random()*90); await new Promise(r=>server.listen(port,r));
const b = await chromium.launch(); const page = await b.newPage({ viewport:{width:1440,height:1000} });
await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=rot`, { waitUntil:'networkidle' });
const out = await page.evaluate(() => {
  const w = (el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.round(r.getBoundingClientRect().width*10)/10; };
  const q = (s) => document.querySelector(s);
  const mk = (text, css) => { const s = document.createElement('span'); s.style.cssText = 'position:absolute;white-space:nowrap;font-family:Outfit;' + css; s.textContent = text; document.body.appendChild(s); const r = s.getBoundingClientRect().width; s.remove(); return Math.round(r*10)/10; };
  return {
    underrad_16_400: mk('Villa, radhus eller lägenhet. Helt eller delvis.', 'font-size:16px;font-weight:400'),
    fraga2_20_500: mk('Är bostaden äldre än fem år?', 'font-size:20px;font-weight:500;letter-spacing:-0.01em'),
    fraga1_20_500: mk('Äger du din bostad?', 'font-size:20px;font-weight:500;letter-spacing:-0.01em'),
    fraga3_20_500: mk('Din inkomst förra året', 'font-size:20px;font-weight:500;letter-spacing:-0.01em'),
    belopp_1200000_18_500_tab: mk('1 200 000', 'font-size:18px;font-weight:500;font-variant-numeric:tabular-nums lining-nums'),
    belopp_300000_18_500_tab: mk('300 000', 'font-size:18px;font-weight:500;font-variant-numeric:tabular-nums lining-nums'),
    kr_18: mk('kr', 'font-size:18px;font-weight:400'),
    h2_gt_36: mk('Räkna ut ditt grön teknik-avdrag', 'font-size:36px;font-weight:500;letter-spacing:-0.01em'),
    h2_rot_36: mk('Räkna ut ditt ROT-avdrag', 'font-size:36px;font-weight:500;letter-spacing:-0.01em'),
    talrad_upptill_56_28: mk('upp till', 'font-size:28px;font-weight:500') + 9.9 + mk('50 000', 'font-size:56px;font-weight:700;letter-spacing:-0.03em;font-variant-numeric:tabular-nums') + 9.9 + mk('kr', 'font-size:28px;font-weight:500'),
    stopptext_18: mk('Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag.', 'font-size:18px;font-weight:500'),
    femar_16: mk('Yngre än fem år: ROT gäller bara reparationer.', 'font-size:16px;font-weight:400'),
  };
});
console.log(JSON.stringify(out, null, 1));
await b.close(); server.close();
