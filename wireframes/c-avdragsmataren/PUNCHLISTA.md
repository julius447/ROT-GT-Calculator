# Punchlista, riktning C Avdragsmätaren (från `wireframes/GRANSKNING.md`, 2026-09-11)

Utlåtande: **OMARBETA.** 3 blockers, 8 majors, 6 minors. Blockers först; sedan de tre strukturfixarna (besked på
mobil, en inkomstfråga, slidern) som avgör om riktningen håller. Kör om `node tools/shot.mjs` (rot, gt, embed) och
`_probe.mjs` efter varje block. Rör inte `logik/` eller `_shared/`.

## Blockers

1. **Count-up-racet (C-B1).** `paintMeter` `app.js:895–919`. En pågående tween (280 ms) avbryts bara inne i
   `tweenAmounts` (`:922`). När den nya avläsningen saknar belopp (`alt_rot`, `dold`, `tak`) returnerar `paintMeter`
   tidigt och tweenens sista bildruta skriver tillbaka det gamla beloppet: batteri → "Nej" på solceller inom 280 ms
   ger "Troligen inte…" med "Uppskattat avdrag: 35 000 kr". Fix, överst i `paintMeter`:
   ```js
   if (App.tween) { cancelAnimationFrame(App.tween); App.tween = null; }
   ```
   och i `tweenAmounts`: spara `el.dataset.target = template` och avbryt i `step` om `el.dataset.target !== template`.
   Verifiera: `node wireframes/_review/isolate.mjs` → `c_race_gap60.rubrik` = "ROT 30 % på arbetskostnaden kan gälla
   i stället". Lägg samma sekvens (två tryck inom 60 ms) i `_probe.mjs`.

2. **Bekräfta-trycket (C-B2).** `onChange` `app.js:697–705` lyssnar bara på `change`. Lägg i `bind`:
   ```js
   tool.addEventListener('click', (e) => {
     const el = e.target;
     if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.checked) return;
     const id = qFrom(el); if (!id || (App.touched.has(id) && String(App.state[id]) === el.value)) return;
     onChange({ target: el });
   });
   tool.addEventListener('keydown', (e) => {
     const el = e.target;
     if ((e.key === ' ' || e.key === 'Enter') && el instanceof HTMLInputElement && el.type === 'radio' && el.checked) { e.preventDefault(); el.click(); }
   });
   ```
   Verifiera: `isolate.mjs` → `c_confirm.headline_after_three_taps` = "Ja, du kan använda ROT-avdraget".

3. **Etikettens tal vid två ägare (C-B3).** `meterModel` `app.js:159–175` sätter `kr: used + room` där `room` är
   summan av båda ägarnas utrymme; `meterLabel` `:361` skriver ut det. Med två ägare och fördjupning på båda blir
   etiketten "Din skatt räcker hit (ca 171 000 kr)" medan motorns text på samma skärm säger "22 100 kr av 45 000 kr".
   Fix: hämta talet ur motorn, aldrig ur en egen summa:
   - `ryms_delvis`: `kr = r.skatt.behov_kr − r.skatt.aterbetalningsrisk_kr` (= motorns `ryms`), `x = used + kr`.
   - `ryms`: `kr = r.skatt.utrymme_kr` (motorns `utrymme`; vid band `utrymme_min_kr`/`utrymme_max_kr` som spannlinje).
   - `ryms_inte`: som nu (`tax_ingen`).
   Lägg ett Node-test i `_probe.mjs` (två ägare, 15 000 + 60 000 kr/mån, 150 000 kr arbete) som jämför etikettens
   tal med `r.skatt.params.ryms`.

## Majors (före ägarvisning)

4. **Beskedet på mobil (C-M1).** Verktyget är 3 347 px på 390 px och beskedet börjar vid ca 2 400 px (2,8 skärmar);
   UX §8.1 kräver det direkt under sista synliga frågan. I `.tool__main`/`.tool__grid` (`styles.css:47, 317–335`):
   under 992 px ge `#besked { order: 2 }`, `.controls { order: 1 }`, `.djup { order: 3 }`, `#fler { order: 4 }` (eller
   flytta `renderVerdict` i DOM och använd grid-area på desktop). Mät om: beskedet ska börja ≤ ca 1 300 px.

5. **En inkomstfråga, inte två (C-M2).** `renderDjup` `app.js:392–409`. Chippen "Betalar du inkomstskatt på lön
   eller pension?" och fördjupningens "Vad har du för inkomst? Lön/Pension/Både" står på samma skärm. Välj ett:
   - (rekommenderat) dölj `inkomsttyp` i djup-bandet; härled ur chippen (`effInkomsttyp` gör det redan) och visa
     bara en toggle "Både lön och pension?" som sätter `inkomsttyp = 'bada'`;
   - eller dölj skatt-chippen i C och låt fördjupningen vara skattefrågan (kräver att `skatt` sätts ur
     `inkomsttyp`, och att "Låg eller ingen inkomst"/"Vet inte" får en plats).
   Skriv valet i NOTES §2.

6. **Slidern på 35 000 kr utan att gälla (C-M3).** `renderQuestion` (slider) + `renderDjupStatus` `app.js:411–418`.
   I orört läge: `output` = "Dra för att ange", tumme i `--ink-faint`, `aria-valuetext="inte angivet"`; värdet 35 000
   syns först när kunden rört reglaget (då körs estimatorn, som nu). En hjälprad, inte tre: behåll `q.skatt_djup.help`
   (COPY, "vi sparar inget") och stryk `c.djup.prompt` + "Ungefär räcker. Beskedet blir ett spann." tills reglaget rörts.
   Alternativet (kör estimatorn på förvalet och märk "antaget 35 000 kr/mån") är ägarfråga 2; mellanläget ska bort.

7. **Embed (C-M4).** 1 398 px (ROT), 1 689 (batteri) mot 900. Ingen enskild vikning når 1 000 (mätt: skatt-chipsen in i
   "Räcker skatten?" → 1 235; + linjal/legend/takrad → 1 170; + lead + tel → 1 065). Bygg embed-varianten som "två
   synliga frågor": `EMBED_VISIBLE = new Set(['boende', 'belopp', 'sol'])` (`app.js:284`), skatten bakom
   "Räcker skatten?" med sin antaget-rad klickbar i "Visa villkoren", `body[data-surface="embed"] .meter__ticks,
   .meter__legend, .meter__cap { display: none }`. Mät och skriv i NOTES §3; det landar ca 1 100 och kräver ägarens ja.

8. **Kontrast (C-M5).** `styles.css`:
   - `:157` vald chip: `background: var(--ink); border-color: var(--ink)` (vit på teal är 2,96:1; A och B använder bläck).
   - `:257` `.villkor__tag { color: var(--ink-muted); font-weight: var(--w-reg) }` (2,98:1 → 6,3:1; ordet bär tillståndet).
   - `:132` `.meter__key.is-dim { color: var(--ink-muted) }` och lägg dämpningen på swatchen (finns).
   - `:181` `.preset.is-on { color: var(--ink); border-color: var(--ap-teal) }`.
   - `:49` `.eyebrow { color: var(--ink-muted) }` med teal-bar före (`::before` som referensen) om teal ska synas.
   CTA:ns vita text på teal är designsystemets token (GRANSKNING S-1), ändra inte själv.

9. **Statiska tabellen bara utan JS (C-M6).** `renderStaticTable` inne i `metod` (`app.js:492`) visar fem belopp
   som inte finns i beskedet även med JS. Wrappa i `<noscript>` (som B) eller sätt `document.documentElement.classList.add('js')`
   i `<head>` och `.js .tabell { display: none }` (som A).

10. **Källa + datum synlig (C-M7).** `metod__kalla` `app.js:492` inne i `<details>`. Flytta raden till under
    `.meter__readout` (under "Att betala") som `<p class="meter__kalla">`, utanför details; Skatteverkslänken kan
    stanna i details.

11. **Två hjältar + tom mätare (C-M8).**
    - Desktop: avläsningen (30 px/800) och beskedet (28 px/700) står på samma höjd med samma vikt. Sänk beskedet till
      `--fs-lead`/600 i panelen (mätaren är hjälten) eller lägg beskedet som remsa ovanför mätaren i lead-storlek.
    - Skalan: på 30 000 kr fyller jobbet 8–14 % av spåret. Inför dynamisk skala i `meterModel`: `scale = jobbet > 25 000
      ? tak : tak / 2` med hela potten markerad ("50 000 kr kvar" som tick/etikett vid högerkanten) så segmentet får
      kropp; eller rita potten som "kvar" och jobbet framför. Skriv upp valet i NOTES; det är riktningens kända svaghet
      (06 "tom på små jobb") och måste synas löst innan ägaren väljer.

## Minors (före produktion)

12. **Rubrikordning (C-m1).** `app.js:403, 479`: fördjupningens rubrik H3 kommer före beskedets H2. Gör den H2 (H3 i
    embed) eller `<p class="djup__h">`.
13. **Skärmläsartexten (C-m2).** `scheduleLive` `app.js:970`: `headline.text.replace(/[:.]$/, '')` före punkten.
14. **Scroll → evaluate (C-m3).** `app.js:666, 953`: `syncSticky()` utan `c` kör `currentCtx()` per scroll-event.
    Spara `App.ctx = c` i `paint` och använd den.
15. **Legenden på mobil (C-m4).** `styles.css:328`: `grid-template-columns: 1fr` när fler än två poster är tända
    (klass `has-many` från `renderLegend`), annars kolliderar "Kan bli kvarskatt 13 900 kr" med "Ryms inte i år".
16. **Fieldset utan legend (C-m5).** `app.js:277`: `<legend class="sr-only">{q.label}</legend>` för `checkbox`.
17. **Lead i fristående (C-m6).** `c.lead` `app.js:25`: "Inget mejl, ingen inloggning" bara i embed (05 §6).

## Verifiering

- `node wireframes/_review/isolate.mjs`: `c_race_gap60`, `c_confirm`, `c_confirm_keyboard_space` gröna.
- `node wireframes/_review/truth.mjs desktop` och `mobile`: scenario 2 = "Ja, om jobbet är en reparation",
  scenario 5 = "ROT 30 % på arbetskostnaden kan gälla i stället" i avläsningen.
- `node wireframes/_review/contrast.mjs`: inga FAIL-rader utom CTA:n (delad token).
- `node tools/shot.mjs … --query "?m=rot"` mobil: beskedets `#besked` börjar ≤ ca 1 300 px; embed ≤ ca 1 100 px.
