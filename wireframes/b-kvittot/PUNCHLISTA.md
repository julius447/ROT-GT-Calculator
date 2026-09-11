# Punchlista, riktning B Kvittot (från `wireframes/GRANSKNING.md`, 2026-09-11)

Utlåtande: **SHIPBAR MED FIX.** 1 blocker, 8 majors, 7 minors. Blockern är en lyssnare; resten är doktrin- och
hantverksfixar. Gör punkterna i ordning, kör om `node tools/shot.mjs` (rot, gt, embed) och `_probe.mjs --interact`
efter varje block. Rör inte `logik/` eller `_shared/`.

## Blocker

1. **Bekräfta-trycket (B-B1).** `app.js:571` lyssnar bara på `change`. Ett tryck på en redan vald chip (villa,
   2011, lön) ger inget event; raderna kan aldrig bli bekräftade och "Ja, du kan använda ROT-avdraget" nås bara
   genom att välja fel svar och byta tillbaka. Lägg till före `change`-lyssnaren:
   ```js
   inputs.addEventListener('click', (e) => {
     const el = e.target;
     if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.checked) return;
     const id = el.name; if (touched.has(id) && state[id] === coerce(id, el.value)) return;   // idempotent
     answer(id, coerce(id, el.value), { bucket: String(el.value) });
   });
   inputs.addEventListener('keydown', (e) => {
     const el = e.target;
     if ((e.key === ' ' || e.key === 'Enter') && el instanceof HTMLInputElement && el.type === 'radio' && el.checked) { e.preventDefault(); el.click(); }
   });
   ```
   (`change` fortsätter sköta byten; `click` på en redan vald chip når nu `answer` en gång.) Skriv om NOTES §4-raden
   "Alla tre bekräftade": testa med ett rent tryck på förvalet, inte byt-och-tillbaka. Verifiera med
   `node wireframes/_review/isolate.mjs` → `b_confirm.headline_after_three_taps` = "Ja, du kan använda ROT-avdraget".

## Majors (före ägarvisning)

2. **Stämpeln säger BERÄTTIGAD på load (B-M1).** `stampModel` `app.js:215–219`, `LOCAL_COPY` `app.js:58–61`.
   - `ja_villkor`: huvudord `stamp.preliminart` = "Preliminärt", underrad "om villkoren stämmer" (behåll);
     `h.ja_men`: "Preliminärt" + "med begränsning".
   - `ja` (allt bekräftat): "Berättigad" + "preliminärt" (som nu).
   - Stämpelns underrad är 10,5 px (`styles.css:159`); höj till `1.2rem` och huvudordet till `1.45rem` så orden bär
     lika mycket som färgen.

3. **"Fyra frågor" (B-M2).** `lead` `app.js:19`. ROT med värdeår 2021–2025 visar 5 frågor, batteri 6, sol 5. Räkna:
   `const n = resolveBank(mode, state).filter((q) => q.shown && !q.folded).length` och skriv "{n} frågor, sedan
   står det på kvittot…" (uppdatera i `paintHead` och `syncBank` när banken ändras), eller stryk siffran:
   "Några frågor, sedan står det på kvittot: fullt pris, avdrag, att betala."

4. **Chips i embed, inte select (B-M3).** `selectHtml` `app.js:151`, `compactSelect` `app.js:189`.
   - Ta bort `compactSelect`-vägen; rendera chips i embed med `body[data-surface="embed"] .chip { min-height: 4.4rem;
     flex: 1 1 calc(50% - 0.6rem); padding: 0.6rem 1rem }` och hjälptexter dolda (finns redan).
   - Fäll `vardear` och `skatt` bakom "Fler detaljer" i embed (en `EMBED_FOLD = new Set(['vardear','skatt'])` som
     `renderBank` respekterar när `ropts.compact`), och se till att deras antaget-rader i kvittots fällrad förblir
     klickbara (`focusQuestion` öppnar `#more`, finns).
   - Mätt: 1 062 px med selects, ca 1 150 med chips; skriv den nya siffran i NOTES §3. Under 1 000 kräver att lead
     stryks i embed (−60) och tel-länken går in i fällraden (−43); gör det bara på ägarens ja.
   - Om ägaren ändå vill ha select: `select { font: inherit }` (`styles.css:26`) och behåll punkt 1:s logik för
     `change` på select.

5. **Artikelattrappen (B-M4).** `art.p1` `app.js:98`: stryk "hur mycket du faktiskt sparar" ("sparar" är ett
   ALDRIG-ord, 05 §7). Byt `art.p1`, `art.p2` och `art.snabb.*` till faktalös platshållartext som A/C, eller minst
   "…det är den detaljen som avgör vad du faktiskt betalar."

6. **Remsan ovanpå CTA:n (B-M5).** `io.observe(kv)` `app.js:716`. Kvittot på mobil är 1 286 px; vid sidans slut är
   kortet 47 % synligt och remsan visas bredvid CTA + tel. Observera CTA:n: `io.observe(document.querySelector('#kv-cta') || kv)`
   och räkna `kvVisible = en.intersectionRatio >= 0.5` på CTA:n (den är liten, så tröskeln blir "CTA på skärmen").
   Behåll `kvPassed` på hela kortet för spegling. Kör `node wireframes/_review/sticky.mjs`: raden vid sidans slut ska
   vara `strip=off`.

7. **Tryckytor (B-M6).** `styles.css`: `.preset` (`:97`) `min-height: 4.4rem` under 768 px (nu 36 px); `.srow__btn`
   (`:190`) `padding: 1rem 0.4rem` (nu 37 px); `.cta__sec` (`:215`) `display: inline-flex; min-height: 4.4rem;
   align-items: center` (nu 31 px).

8. **Arbetskostnad i intervall-läget (B-M7).** `receiptModel` `app.js:243–252`. När `b.state === 'intervall'`:
   `const lo = r.raw.rot_min, hi = r.raw.rot_max` finns i `result.raw`; visa
   Arbetskostnad `ca 13 500 till 22 500 kr` (arbetskostnaden vid 45 % och 75 %, dvs `tot * (andel ∓ 15) / 100`) och
   Material `ca 7 500 till 16 500 kr`, med noten "antaget 45 till 75 % av 30 000 kr". Då stämmer 30 % av spannet med
   avdragsraden. (Alternativ: punkten "ca 18 000 kr" + avdrag "ca 5 400 kr" med spannet som not; välj det första,
   det är motorns canon.) Skicka `r.raw` in i `receiptModel` (i dag bara `r.belopp`).

9. **Källa + datum synlig (B-M8).** `metodHtml` `app.js:352`: flytta `<p class="kv__source">` ut ur `<details>` till
   direkt under `totalHtml(...)` i `renderReceipt` (både fristående och embed). Behåll Skatteverkslänken i details.

## Minors (före produktion)

10. **Remsans rubrik (B-m1).** `strip.ja_om`/`strip.ja_men` `app.js:82–83` med "…": visa `r.headline.text` och låt
    `.strip__verdict` klippa med `text-overflow: ellipsis` (finns).
11. **Antaget-ringen (B-m2).** `.i-antaget { color: var(--on-dark-line-2) }` `styles.css:197` ≈ 1,9:1 → `var(--on-dark-faint)`.
12. **Omrendering av hela kvittot (B-m3).** `app.js:487`. Minst: spara `document.activeElement`s `data-*`/klass före
    `kv.innerHTML = …` och återställ fokus efter; låt `#share-status` leva utanför `kv` (flytta till `.result`).
13. **Lead i fristående (B-m4).** `lead` `app.js:19`: "Inget mejl, ingen inloggning" bara i `lead.embed` (05 §6).
14. **Rubriker i kortet (B-m5).** `kv__caps` för "Så räknas ditt pris" och "Vad händer nu" som `<h3 class="kv__caps">`
    (H4 i embed).
15. **Ett hedgeord (B-m6).** Kvittot blandar "ca" (`kv.ca`) och COPY:s "ungefär" (basraden). Välj "ungefär" i
    `kv.ca`, eller acceptera "ca" bara i beloppskolumnen och aldrig i samma rad som "ungefär".
16. **`select { font: inherit }` (B-m7).** `styles.css:26`, även om selecten tas bort (Fler detaljer kan få en).

## Verifiering

- `node tools/shot.mjs wireframes/b-kvittot/index.html _shots/b-kvittot-embed --query "?m=rot&surface=embed"`:
  `errors: []`, `overflowX: false`, mobil ≤ ca 1 150 px med chips.
- `node wireframes/_review/truth.mjs desktop`: scenario 2 ska ge "Ja, om jobbet är en reparation" för B.
- `node wireframes/_review/isolate.mjs`: `b_confirm` grönt, `b_confirm_keyboard_space` ska visa `srow--ok` först.
- `node wireframes/_review/sticky.mjs`: ingen rad med `strip=ON` när CTA:n är synlig.
