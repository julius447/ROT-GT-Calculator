import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
const browser = await chromium.launch(); const page = await browser.newPage();
await page.setContent(`<!doctype html><input id="f" type="text" inputmode="numeric"><script>
function siffra(str){return Number(String(str??'').replace(/[,.]\\d{1,2}(?!\\d)\\s*(kr)?\\s*$/i,'').replace(/[^\\d]/g,'').slice(0,9))||0}
function formatFalt(str){const n=siffra(str);return n?new Intl.NumberFormat('sv-SE').format(n).replace(/[\\s\\u00a0\\u202f]/g,'\\u00a0'):''}
const f=document.getElementById('f');
f.addEventListener('input',()=>{const fore=f.value.slice(0,f.selectionStart??f.value.length).replace(/[^\\d]/g,'').length;const nytt=formatFalt(f.value);if(nytt!==f.value){f.value=nytt;let pos=0,n=0;while(pos<nytt.length&&n<fore){if(/\\d/.test(nytt[pos]))n++;pos++;}f.setSelectionRange(pos,pos);}});
</script>`);
const f = page.locator('#f'); await f.fill('300000'); 
await page.evaluate(() => { const i = document.getElementById('f'); i.focus(); i.setSelectionRange(2, 2); });
await page.keyboard.type('5');
const a = await page.evaluate(() => { const i = document.getElementById('f'); return { value: i.value.replace(/ /g, ' '), caret: i.selectionStart }; });
// delete a digit in the middle: caret after "3 05" (pos 4) -> Backspace removes "5"
await page.keyboard.press('Backspace');
const b = await page.evaluate(() => { const i = document.getElementById('f'); return { value: i.value.replace(/ /g, ' '), caret: i.selectionStart }; });
// type at end
await page.evaluate(() => { const i = document.getElementById('f'); i.setSelectionRange(i.value.length, i.value.length); }); await page.keyboard.type('9');
const c = await page.evaluate(() => { const i = document.getElementById('f'); return { value: i.value.replace(/ /g, ' '), caret: i.selectionStart }; });
console.log(JSON.stringify({ afterInsertAt2: a, afterBackspace: b, afterAppend: c }));
await browser.close();
