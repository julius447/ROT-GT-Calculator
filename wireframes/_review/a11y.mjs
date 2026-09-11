// INTERACTION + A11Y lens. Usage: node wireframes/_review/a11y.mjs  -> JSON
import { serve, launch, url, ADAPT, VIEW, txt, tap, typeAmount } from './lib.mjs';
import { decodeState } from '../../logik/ui-model.js';

const { server, base } = await serve();
const browser = await launch();
const out = {};

async function open(key, q, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.mobile ? VIEW.mobile : VIEW.desktop, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', javaScriptEnabled: opts.js !== false, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url(base, key, q), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  page._errors = errors; page._ctx = ctx;
  return page;
}

for (const key of ['a', 'b', 'c']) {
  const A = ADAPT[key];
  const o = (out[key] = {});

  // ---- structure: fieldset/legend, labels, type=number, aria-live, radios in groups
  {
    const page = await open(key, '?m=rot');
    o.structure = await page.evaluate((scope) => {
      const root = document.querySelector(scope) || document;
      const radios = [...root.querySelectorAll('input[type="radio"]')];
      const noFieldset = radios.filter((r) => !r.closest('fieldset'));
      const fieldsets = [...root.querySelectorAll('fieldset')];
      const fsNoLegend = fieldsets.filter((f) => !f.querySelector('legend') && !f.getAttribute('aria-labelledby') && !f.getAttribute('aria-label'));
      const inputs = [...root.querySelectorAll('input, select')];
      const unlabelled = inputs.filter((i) => {
        if (i.type === 'hidden') return false;
        const id = i.id;
        const lab = (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) || i.closest('label');
        return !lab && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby');
      }).map((i) => `${i.tagName.toLowerCase()}[name=${i.name}]`);
      const typeNumber = [...root.querySelectorAll('input[type="number"]')].length;
      const live = [...document.querySelectorAll('[aria-live], [role="status"]')].map((e) => `${e.tagName.toLowerCase()}#${e.id || ''}.${[...e.classList].join('.')} live=${e.getAttribute('aria-live')} role=${e.getAttribute('role')}`);
      const numericInputs = [...root.querySelectorAll('input[type="text"]')].map((i) => `${i.name || i.dataset.q}:${i.inputMode || i.getAttribute('inputmode')}`);
      const hs = [...root.querySelectorAll('h1,h2,h3,h4')].map((h) => `${h.tagName}:${h.innerText.trim().slice(0, 40)}`);
      return { radios: radios.length, radios_outside_fieldset: noFieldset.length, fieldsets: fieldsets.length, fieldsets_without_legend: fsNoLegend.length, unlabelled, typeNumber, live, numericInputs, headings: hs };
    }, A.scope('rot'));
    o.structure.errors = page._errors;
    await page.close(); await page._ctx.close();
  }

  // ---- keyboard pass: Tab order vs DOM order, arrow keys move radios, Enter/Space on summary
  {
    const page = await open(key, '?m=rot');
    const scope = A.scope('rot');
    // focus the first radio in the tool, then Tab 25 times, record the focus path
    await page.focus(A.radio('rot', 'boende', 'villa'));
    const path = [];
    for (let i = 0; i < 28; i++) {
      const d = await page.evaluate(() => { const e = document.activeElement; if (!e) return null; const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), name: e.name || e.dataset?.q || e.id || '', text: (e.innerText || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 32), y: Math.round(r.top + window.scrollY), visible: r.width > 0 && r.height > 0 }; });
      path.push(d);
      await page.keyboard.press('Tab');
    }
    // DOM order check: y (document position) should be non-decreasing except when grid places columns side by side; record DOM index instead
    const domOrder = await page.evaluate(() => {
      const all = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter((e) => !e.disabled && e.offsetParent !== null);
      return all.length;
    });
    o.keyboard = { focus_path: path, focusable_visible: domOrder };
    // arrow keys within a radio group
    await page.focus(A.radio('rot', 'boende', 'villa'));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
    o.keyboard.arrow_right_selects = await page.evaluate((s) => { const e = document.activeElement; return { value: e && e.value, checked: e && e.checked, name: e && (e.name || e.dataset.q) }; }, scope);
    o.keyboard.headline_after_arrow = await txt(page, A.read('rot').headline);
    // Enter on Fler detaljer summary
    const sum = page.locator(`${A.details('rot')} > summary`);
    await sum.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    o.keyboard.details_enter_opens = await page.locator(A.details('rot')).evaluate((d) => d.open);
    await page.close(); await page._ctx.close();
  }

  // ---- aria-live: count of announcements during a burst of stepper clicks
  {
    const page = await open(key, '?m=rot');
    await page.evaluate(() => {
      window.__liveLog = [];
      for (const el of document.querySelectorAll('[aria-live], [role="status"]')) {
        new MutationObserver(() => window.__liveLog.push({ t: Math.round(performance.now()), text: el.textContent.trim().slice(0, 80) })).observe(el, { childList: true, characterData: true, subtree: true });
      }
    });
    // 6 quick stepper clicks (+5 000 each) within ~600 ms, then wait
    const plus = page.locator(`${A.scope('rot')} [data-step="1"]`).first();
    for (let i = 0; i < 6; i++) { await plus.click(); await page.waitForTimeout(80); }
    await page.waitForTimeout(1200);
    o.aria_live = await page.evaluate(() => window.__liveLog);
    await page.close(); await page._ctx.close();
  }

  // ---- reduced motion: JS count-up and CSS transitions
  {
    const page = await open(key, '?m=rot', { reduced: true });
    const R = A.read('rot');
    const before = await txt(page, R.rubrik);
    await page.evaluate((sel) => { window.__frames = []; const el = document.querySelector(sel); new MutationObserver(() => window.__frames.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }); }, R.rubrik);
    const plus = page.locator(`${A.scope('rot')} [data-step="1"]`).first();
    await plus.click();
    await page.waitForTimeout(900);
    const frames = await page.evaluate(() => window.__frames);
    const transitions = await page.evaluate((scope) => {
      const els = [...document.querySelectorAll(`${scope} *`)].slice(0, 2500);
      const withT = els.filter((e) => { const cs = getComputedStyle(e); return cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0) || (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0); });
      return withT.length;
    }, A.scope('rot'));
    o.reduced_motion = { rubrik_before: before, rubrik_after: await txt(page, R.rubrik), text_mutations: frames.length, elements_with_transition_or_animation: transitions };
    await page.close(); await page._ctx.close();
  }
  // motion with no preference: how many intermediate frames does the count-up produce (should be > 1)
  {
    const page = await open(key, '?m=rot');
    const R = A.read('rot');
    await page.evaluate((sel) => { window.__frames = []; const el = document.querySelector(sel); new MutationObserver(() => window.__frames.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true }); }, R.rubrik);
    const plus = page.locator(`${A.scope('rot')} [data-step="1"]`).first();
    await plus.click();
    await page.waitForTimeout(900);
    o.motion_countup_frames = (await page.evaluate(() => window.__frames)).length;
    await page.close(); await page._ctx.close();
  }

  // ---- sticky strip (mobile standalone): hidden on load, shown after interaction when card not visible, hidden when card >= 50 % visible; never in embed
  for (const surface of ['standalone', 'embed']) {
    const page = await open(key, `?m=rot${surface === 'embed' ? '&surface=embed' : ''}`, { mobile: true });
    const stripSel = key === 'a' ? '#ak-rot-sticky' : key === 'b' ? '#strip' : '#sticky';
    const cardSel = key === 'a' ? '#ak-rot-core' : key === 'b' ? '#kv' : '#besked';
    const vis = async (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return 'absent'; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return !e.hidden && cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5 && r.height > 0 && r.top < innerHeight; }, sel);
    const st = { on_load: await vis(stripSel) };
    // A's compact embed rows hide the chips until the row is opened ("Svara")
    const opener = page.locator('#ak-rot .ak-row__stmt[data-focus="boende"]');
    if (surface === 'embed' && key === 'a' && await opener.count()) { st.chips_hidden_until_svara = true; await opener.click(); await page.waitForTimeout(150); }
    const sel = page.locator('#inputs select[name="boende"]');
    if (surface === 'embed' && key === 'b' && await sel.count()) { st.native_select_in_embed = true; await sel.selectOption('fritid'); await page.waitForTimeout(150); }
    else await tap(page, A.radio('rot', 'boende', 'fritid'));
    await page.waitForTimeout(400);
    st.after_interaction_top = await vis(stripSel);
    st.strip_text = await txt(page, stripSel);
    st.strip_links = await page.evaluate((s) => [...document.querySelectorAll(`${s} a, ${s} button`)].map((a) => `${a.innerText.trim()} -> ${a.getAttribute('href')}`), stripSel);
    // scroll so the card is >= 50 % visible
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), cardSel);
    await page.waitForTimeout(500);
    st.card_visible_strip = await vis(stripSel);
    st.card_ratio = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); const v = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); return Math.round((v / r.height) * 100) / 100; }, cardSel);
    // scroll past the card entirely
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    st.past_card_strip = await vis(stripSel);
    st.past_card_links = await page.evaluate((s) => [...document.querySelectorAll(`${s} a, ${s} button`)].map((a) => `${a.innerText.trim()} -> ${a.getAttribute('href')}`), stripSel);
    // strip in DOM last? not aria-hidden?
    st.aria_hidden = await page.evaluate((s) => { const e = document.querySelector(s); return e ? e.getAttribute('aria-hidden') : null; }, stripSel);
    o[`sticky_${surface}`] = st;
    await page.close(); await page._ctx.close();
  }

  // ---- copy link: round trip + never income
  {
    const page = await open(key, '?m=rot', { mobile: false });
    await tap(page, A.radio('rot', 'boende', 'fritid'));
    await typeAmount(page, A.amount('rot', 'belopp'), 42000);
    // open details and set agare 2 + income deep-dive when reachable
    const d = page.locator(A.details('rot')); await d.locator('summary').first().click(); await page.waitForTimeout(150);
    await tap(page, A.radio('rot', 'agare', '2'));
    // deep-dive: toggle skatt_djup (A/B) or move the income slider (C)
    const djupToggle = page.locator(A.radio('rot', 'skatt_djup', 'true'));
    if (await djupToggle.count()) await tap(page, A.radio('rot', 'skatt_djup', 'true'));
    const slider = page.locator(`${A.scope('rot')} input[type="range"][name="manadsinkomst"], ${A.scope('rot')} input[type="range"][data-q="manadsinkomst"]`).first();
    if (await slider.count() && await slider.isVisible()) { await slider.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); }
    await page.waitForTimeout(700);
    const copyBtn = page.locator(`${A.scope('rot')} [data-share="link"], ${A.scope('rot')} [data-share="copy"], ${A.scope('rot')} [data-share]:not([data-print]):not([data-share="print"]):not([data-share="reset"])`).first();
    await copyBtn.click();
    await page.waitForTimeout(400);
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
    const status = await page.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((e) => e.textContent.trim()).filter(Boolean));
    const addressBar = page.url();
    const dec = clip ? decodeState(new URL(clip).search) : null;
    const forbidden = /(^|[?&])(s|manadsinkomst|rante|ranteutgifter_ar|kommunalskatt|inkomst|lon_manad|pension_manad|skatt_djup|d)=/;
    o.copy_link = { clipboard: clip, status, decoded: dec, forbidden_in_link: clip ? forbidden.test(new URL(clip).search) : null, address_bar: addressBar, forbidden_in_address: forbidden.test(new URL(addressBar).search), income_words_in_link: clip ? /inkomst|rante|kommunal|manad/.test(clip) : null };
    await page.close(); await page._ctx.close();
  }

  // ---- print: inputs hidden, verdict + villkor + metod visible
  {
    const page = await open(key, '?m=rot');
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.waitForTimeout(200);
    o.print = await page.evaluate((scope) => {
      const vis = (sel) => [...document.querySelectorAll(sel)].some((e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getClientRects().length > 0; });
      return { radios_visible: vis('input[type="radio"]'), text_inputs_visible: vis('input[type="text"]'), cta_visible: vis('.ak-btn, .btn--primary, .cta a, #cta a'), headline_visible: vis('#ak-rot-headline, .kv__title, #verdict-h'), villkor_visible: vis('.ak-row--c, .ak-row--q .ak-row__stmt, .srow, .villkor__row'), metod_visible: vis('.ak-metod__list li, #kv-metod li, .metod__list li'), disclaimer_visible: vis('.ak-disclaimer, .ak__disclaimer, .disclaimer'), demo_visible: vis('.demo') };
    }, A.scope('rot'));
    await page.close(); await page._ctx.close();
  }

  // ---- no JS: questions + default verdict + a table visible
  {
    const page = await open(key, '?m=rot', { js: false });
    o.nojs = await page.evaluate(() => {
      const vis = (sel) => [...document.querySelectorAll(sel)].filter((e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getClientRects().length > 0; }).length;
      return { radios: vis('input[type="radio"]'), headline: [...document.querySelectorAll('#ak-rot-headline, .kv__title, #verdict-h')].map((e) => e.innerText.trim()), table_rows: vis('table tr'), noscript_text: [...document.querySelectorAll('noscript')].map((n) => n.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)), amount_visible: [...document.querySelectorAll('#ak-rot-rubrik, .line__amt, .meter__rubrik')].map((e) => e.innerText.trim()).filter(Boolean) };
    });
    await page.screenshot({ path: `wireframes/_review/shots/nojs-${key}.png`, fullPage: true });
    await page.close(); await page._ctx.close();
  }

  // ---- chip heights on mobile + label truncation
  {
    const page = await open(key, '?m=rot', { mobile: true });
    o.chips_mobile = await page.evaluate((scope) => {
      const chips = [...document.querySelectorAll(`${scope} label.ak-chip span, ${scope} label.chip, ${scope} .chip__face, ${scope} .ak-seg__opt span`)].filter((e) => e.getClientRects().length);
      const hs = chips.map((e) => Math.round(e.getBoundingClientRect().height));
      const clipped = chips.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.innerText.trim());
      const other = [...document.querySelectorAll(`${scope} button, ${scope} a, ${scope} summary, ${scope} select`)].filter((e) => e.getClientRects().length).map((e) => ({ t: e.innerText.trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44);
      return { n: chips.length, min_h: Math.min(...hs), max_h: Math.max(...hs), clipped, targets_under_44: other };
    }, A.scope('rot'));
    await page.close(); await page._ctx.close();
  }
}

await browser.close();
server.close();
console.log(JSON.stringify(out, null, 1));
