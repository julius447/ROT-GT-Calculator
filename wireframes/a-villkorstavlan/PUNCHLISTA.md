# Punchlista, riktning A Villkorstavlan (från `wireframes/GRANSKNING.md`, 2026-09-11)

Utlåtande: **SHIPBAR MED FIX.** 0 blockers, 5 majors, 6 minors. Gör punkterna i ordning, kör om
`node tools/shot.mjs` (rot, gt, embed) och `_probe.mjs` efter varje block, och lägg dessutom till de nya testerna
i punkt 2 och 4 i `_probe.mjs`. Rör inte `logik/` eller `_shared/`.

## Majors (före ägarvisning)

1. **Ett belopp, inte två (A-M1).** Beloppet står i tavlans beloppsrad (`app.js:125`, `lines.unshift(...)`) och i
   blocket under tavlan (`renderSum`, `app.js:208`, i `core` `app.js:267`).
   - Fristående: ta bort `lines.unshift(result.belopp.rubrik)` för `belopp`-raden; raden visar då etiketten
     "Vad kostar jobbet ungefär?" + reglaget med neutral prick (behåll `ui.galler_inte` vid `dold`). Blocket under
     tavlan är det enda beloppet.
   - Embed: gör tvärtom. Behåll radens belopp (kompakt) och rendera INTE `renderSum` i `core` när `embed`; flytta
     `att_betala_text` och källraden (`ui.kalla`) in i `<details class="ak-more">` ("Visa villkoren") ovanför
     villkorsraderna. Mätt i DOM: 1 154 → 912 px på 390 px. Uppdatera `.surface-embed .ak-sum` i `styles.css:332`
     (behövs inte längre) och `.ak-row__cap` så att versaletiketten "DITT AVDRAG, PRELIMINÄRT" bara finns en gång per
     yta (A-m4).
   - Räkna om höjderna i NOTES §3.

2. **Tangentbordsbekräftelse (A-M2).** I `bind` (`app.js:616–623`) lyssnar du på `click` och `change`. Space/Enter
   på en redan vald radio ger inget av dem. Lägg till:
   `S.addEventListener('keydown', (ev) => { if ((ev.key === ' ' || ev.key === 'Enter') && ev.target instanceof HTMLInputElement && ev.target.type === 'radio' && ev.target.dataset.q && ev.target.checked) { ev.preventDefault(); radioAnswer(ev.target); } });`
   `radioAnswer` är redan idempotent. Test i `_probe.mjs`: fokusera villa-radion, tryck Space, raden ska bli `ok`.

3. **Kompakta radernas affordans i artikeln (A-M3).** `styles.css:316–317`, `app.js:21–22, 191, 466`.
   - Gör hela `.ak-row__stmt` till tryckytan: `display: grid`, `min-height: 4.4rem`, `padding-block: 0.6rem`,
     `align-items: center`, chevron (inline-SVG, 1,75 px, `--ink`) längst till höger i `.ak-row__open` i stället för
     understruken text i `--ink-muted`.
   - Skriv "Svara" i `--ink`, `--w-semi`, inte understruket; "Ändra pris" samma.
   - Öppna första huvudraden (`boende`) från start i kompakt läge (`is-open` i `syncCompact` när ingen rad är öppen),
     så att kunden ser att raderna innehåller chips.
   - Ge `.ak-row__stmt` `aria-expanded` bara i kompakt läge (finns), och `aria-label="Svara: {villkorstext}"` så
     skärmläsaren hör att det är en fråga.

4. **Embed-höjd (A-M4).** Löses av punkt 1 (912 px). Om ägaren vill under 900: nästa spak är tel-länken in i
   "Visa villkoren" (856 px) och kortare lead (808 px), men gör det bara på ägarens ja (05 §6 vill ha tel i kortet).

5. **Kontrast (A-M5).** `styles.css:92`: `.ak-verdict--ja .ak-eyebrow, .ak-verdict--ja_villkor .ak-eyebrow` →
   `color: var(--ink-muted)` (2,96:1 i dag; klassen bärs redan av vänsterkanten och märket). Vill du ha teal kvar:
   en 2,4 rem teal-bar före texten som referensen (`.eyebrow::before`), texten i `--ink-muted`. CTA:ns vita text på
   teal (2,96:1) är designsystemets token, ägarbeslut (GRANSKNING S-1), ändra inte själv.

## Minors (före produktion)

6. **Tavlans bredd (A-m1).** `--ak-measure: 86rem` (`styles.css:7, 47`) ger 290 px tomt på var sida vid 1 440.
   Ägarfråga (fullbreddsdirektivet 2026-08-14 mot riktningens 760–840 px). Förbered en variant: `--ak-measure: 104rem`
   och `--ak-cond-col: minmax(0, 30rem)`, visa ägaren båda.

7. **Tabbstopp och tryckytor (A-m2).** `.ak-row__stmt` (`styles.css:116`) och `.ak-row__fix` (`:204`) är 24 px höga.
   `min-height: 4.4rem` via padding (löses delvis av punkt 3). På ≥ 768 px: `tabindex="-1"` på `.ak-row__stmt`
   (frågan står redan bredvid; sex extra tabbstopp försvinner).

8. **Hyresrätt (A-m3).** Banken tar bort belopp/skatt; UX §9 vill gråa ut med "Gäller inte i det här läget". Behåll
   bankens beteende men skriv upp i NOTES att C har gråningen, så ägaren kan välja.

9. **Reduced motion (A-m5).** `styles.css:357`: stryk den lokala regeln (tokens.css täcker allt med
   `* { transition: none }`) eller komplettera den med `.ak-btn, .ak-step, .ak-preset, .ak-chip span, .ak-row`.

10. **Källrad och tel i embed (A-m6).** Inget att göra nu; notera i NOTES att de är nästa spak (mätta 856/808 px).

11. **NOTES §4.** Byt påståendet "55/55 gröna" mot utfallet efter punkt 2 (tangentbordstestet) och lägg till
    "bekräfta genom att trycka på förvalet" som eget test (mus + tangentbord).

## Verifiering

- `node tools/shot.mjs wireframes/a-villkorstavlan/index.html _shots/a-rot --query "?m=rot"` (+ gt, + embed):
  `errors: []`, `overflowX: false`, embed mobil ≤ 920 px.
- `node wireframes/_review/truth.mjs desktop` ska ge samma sex rader som motorn för A (redan grönt; får inte
  regrediera).
- `node wireframes/_review/isolate.mjs`: `a_confirm_keyboard_space` ska visa `ak-row--ok` på första raden.
