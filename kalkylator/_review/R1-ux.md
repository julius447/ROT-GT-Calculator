# R1: UX-granskning av v1, v2b och v3 (Avdragskollen)

Lins: en 55-åring i lägenhet, på telefon. Begriplighet, interaktionstillstånd, mobil, tillgänglighet, copyhygien.
Jag hittar och bevisar; jag rättar inte. Alla siffror nedan är uppmätta med Playwright (Chromium), inte lästa ur
NOTES. Datum: 2026-09-14.

## Bevis (allt i `kalkylator/_review/`)

| Fil | Vad |
|---|---|
| `r1-probe.mjs` -> `r1-probe.json` | Alla tillstånd x 3 versioner x desktop 1440 / mobil 390 x rot / gt. getBoundingClientRect före/efter varje ändring (tal, etikett, första kontrollen, femårskontrollen, fältet, kortet), fontstorlekar, strängar, tangentbord, Enter i fältet, reduced motion. |
| `r1-mobil.mjs` -> `r1-mobil.json` | iPhone-fönster 390 x 664 (Safari med fält): vikningen. Tangentbord uppe (390 x 370): syns talet medan hon skriver? Ryms "1 000 000" i fältet? |
| `r1-a11y.mjs` -> `r1-a11y.json` | MutationObserver på aria-live-regionen medan "180000" skrivs. Är spårets 4 px-kant tryckbar? DOM-ordning mot visuell ordning för fråga 1. |
| `r1-kontrast.mjs` | WCAG-kontrast, räknad ur tokens. |
| `shots/<v>-<skärm>-<läge>-<n>-<tillstånd>.png` | 114 kortklippta PNG: 0 default, 1 ager-nej, 2 ager-ja-igen, 3 femar-nej, 4 lon-180000, 5 pension-240000, 6 tom-igen, 7 faltfokus, 8 tangentbord-pil, 9 gt-ager-nej. |
| `shots/<v>-mobil-664-ager-nej.png`, `shots/<v>-mobil-tangentbord-370.png` | Vikning och tangentbord. |
| `shots/_montage-*.png` | Sammansatta jämförelser (mobiltillstånd, tangentbord 370, vikning 664, fokusringar). |
| `../../_shots/r1-<v>-<läge>-{desktop,mobile}.png` | `tools/shot.mjs` för alla sex kombinationer: `errors: []`, `overflowX: false` överallt. |

## Kortversionen

- **Två blockerare, en delad orsak:** i v1 och v3 laddas sidan om när hon trycker Enter eller "Klar" i beloppsfältet
  (formuläret har ingen submit-hanterare). Beloppet försvinner, och i `?m=gt` byter verktyget tyst till ROT
  (URL:en blir `?ager=ja&aldre=ja&typ=lon`). v2b har hanteraren och klarar det.
- **Delat för alla tre (Major):** medan hon skriver 180 000 visar talet "ca 0 kr" fem tangenttryck i rad (1, 18,
  180, 1 800, 18 000) och skärmläsaren får hela beskedet uppläst per tangent (6 mutationsbatchar för 6 tecken).
  v3 sätter dessutom en grön bock bredvid "ca 0 kr".
- **Delat för alla tre (Major, mobil):** Ja/Nej-alternativen är 40 px höga i ett 48 px spår; spårets kant är inte
  tryckbar (bevisat med klick 2 px in i spåret: valet ändras inte). Verklig tap-yta 40 px, under 44.
- **v3 på mobil:** Nej på fem år flyttar alla kontroller 48 px nedåt (den hon just tryckte på också), och med
  tangentbordet uppe ligger talet 219 px ovanför det synliga: hon skriver sin inkomst och ser ingenting hända.
- **v2b på desktop:** tre frågor på en rad ger fråga 2 och 3 ett 69 px hål mellan fråga och spår (fråga 1: 7 + 14); på mobil
  hamnar stoppbeskedet delvis under vikningen (596 till 673 px i ett 664 px-fönster).
- **v1** är lättast för henne: naturlig läsordning på desktop (fråga vänster, svar höger på samma höjd), talet
  syns bredvid fältet medan hon skriver på mobil, alla reaktioner inom vikningen. Men "upp till" är bara 20 px
  bredvid ett 56 px-tal, femårsraden är 14 px på mobil och etiketten hoppar 19 px i stoppläget.
- Tangentbord, fokusringar, reduced motion, inputmode, kontrast (alla par >= 4,8:1) och de låsta strängarna: OK i
  alla tre. Inga tankstreck, inga "·".
- Rankning: **v1 > v2b > v3.** Med blockeraren rättad (en rad) är v1 tydligt bäst för henne.

---

## 1. Gemensamt för alla tre versioner

| # | Nivå | Fynd | Bevis | Fix |
|---|---|---|---|---|
| G1 | **Major** | **"ca 0 kr" medan hon skriver.** Tal efter varje tangent i "180000": `ca 0`, `ca 0`, `ca 0`, `ca 0`, `ca 0`, `ca 12 000`. En 55-åring som skriver långsamt ser "ca 0 kr" i flera sekunder och tror att hon inte får något. Orsak: `rakna.js` räknar på varje `input`-händelse och ger `belopp: 0, prefix: 'ca'` för låga inkomster; alla tre `app.js` renderar direkt. | `r1-probe.json` -> `steg[lön 180 000].mellan` (identiskt i v1/v2b/v3). | (a) Fördröj renderingen 500 ms efter sista tangent (`clearTimeout/setTimeout` i input-lyssnaren) och rendera direkt på `change`/blur. (b) Ägarfråga till `rakna.js`: `belopp === 0` bör ge texten `0 kr` utan "ca" (delad logik, ändras inte i versionerna). |
| G2 | **Major (a11y)** | **Live-regionen läses upp per tangent.** `aria-live="polite" aria-atomic="true"` på hela resultatytan; textContent skrivs vid varje rendering även när texten är oförändrad, så DOM muterar per tangent. Skärmläsare: "Ditt ROT-avdrag 2026 ca 0 kr Per person och år" x 5, sedan "ca 12 000 kr". v1 och v3 har dessutom etiketten inne i den atomära regionen (läses upp varje gång); v2b har regionen på själva värdet (bättre). | `r1-a11y.json` -> `live.batchar: 6` för 6 tecken i alla tre; `live.attr.text` visar vad som läses upp. | Skriv bara till DOM när strängen faktiskt ändrats (jämför `senast`), plus samma 500 ms-fördröjning som G1. Lägg `aria-live` på talraden (v2b:s upplägg), inte på etiketten. |
| G3 | **Major (mobil)** | **Tap-yta 40 px.** Segmentets alternativ (`label`) är 40 px höga i ett 48 px spår; spårets 4 px padding tillhör inte labeln, så ett tryck där gör ingenting. Kommer ur systemet (`system/components/falt.css:237` padding 4, `:242` min-height 40); v1 `style.css:54`, v2b `:44`, v3 `:85` upprepar 40. | `r1-a11y.json` -> `tap.spårkantTryckbar: false`, `labelHojd: 40`, `sparHojd: 48` (alla tre, båda skärmar). | I versionens CSS: `@media (pointer: coarse) { .ampy-segment { padding: 2px; } .ampy-segment > label { min-height: 44px; } }` (spåret förblir 48, alternativet blir 44). |
| G4 | **Ägarfråga** | **Femårsfrågan i `?m=gt` gör ingenting.** Frågan visas, Nej ger ingen rad och inget byte. Hon svarar på en fråga som inte påverkar något. Innehållet är låst, så det är ett ägarbeslut (alla tre NOTES flaggar det). | `r1-probe.json` -> `steg[gt: fem år Nej]`: `resultatFore === resultatEfter`, `notText: ""` (alla tre). | Dölj fråga 2 i gt-läget (`[data-mode="gt"] .fraga-2 { display: none }`), eller behåll och acceptera. |
| G5 | Minor | **Underraden är inte kopplad till frågan för skärmläsare** i v1 och v3 (v2b har `aria-describedby="rk-q1-under"` på radiogruppen, `index.html:24`). | Kodläsning: v1 `index.html:22-24`, v3 `index.html:49-53`. | Ge underraden ett `id` och `aria-describedby` på radiogruppen (v3) eller på varje radio (v1, fieldset saknar describedby-stöd i vissa SR). |
| G6 | Minor | **Valt/ovalt läge bärs nästan bara av färg.** Vald pill är vit med `--ampy-shadow-subtle` och teal text; ovald är dämpad grå på grått spår (5,46:1, godkänt). v1 ger valt läge 600 mot 500, v2b 500/500, v3 600/600. För en 55-åring är vikt + färg + yta bättre än färg + yta. | `r1-probe.json` -> `typo.segLabelValdW / segLabelOvaldW`. | v2b: `.rk__seg > label:has(input:checked) { font-weight: var(--ampy-w-strong); }`. v3: `.ak__seg.ampy-segment > label { font-weight: var(--ampy-w-medium); }` (vald ärver 600 från systemet). Alternativ för alla: `.ampy-segment--pill` (solid teal-deep, vit text), som briefen tillåter. |
| G7 | Info | Etiketten "DITT ROT-AVDRAG 2026" är 12 px versaler (låst av briefen). Minsta texten i verktyget; kontrast 5,99:1 godkänd. | `r1-probe.json` -> `typo.eyebrow: 12px`. | Ingen åtgärd (låst). |

**OK i alla tre (uppmätt):** inga konsolfel, ingen horisontell scroll (1440/390, rot/gt). `inputmode="numeric"` på fältet
(numeriskt tangentbord). Tab går till den valda radion, pil höger byter till Nej, räknar om och visar systemets
fokusring (`rgba(0,122,105,.9) 0 0 0 3px`); fältets fokus ger teal kant + ring; 4 Tab till fältet. Reduced motion:
`animation-duration: 1e-06s` i bytesögonblicket (v3 stänger dessutom av "tick" i JS). Nej på ägande: talet borta,
rött X + exakt besked; Ja igen: talet tillbaka (0 px skift). Tom inkomst igen: "upp till 50 000 kr". gt-läget visar
bara grön teknik-strängar (H2, etikett, stoppbesked).

**Kontrast (räknad, `r1-kontrast.mjs`):** midnight på vit 19,0:1, på sky mist 18,0:1; dämpad text på vit 6,33:1, på
sky mist 5,99:1, på spåret 5,46:1; teal-deep på vit pill 5,27:1; placeholder 4,80:1; vitt kryss på error-ink 10,7:1;
vit bock på success-ink 6,2:1. Allt >= 4,5:1.

**Copyhygien:** inga tankstreck, en dash eller "·" i något av de tre paketens HTML/JS-strängar (grep). H2, frågor,
underrad, Ja/Nej/Lön/Pension, placeholder `300 000`, etikett, tal, "Per person och år.", femårsraden och
stoppbeskedet är exakt de låsta strängarna i alla tre. v3 delar underraden i två `<span>` (samma text). v1 lägger
hårt mellanslag i "grön teknik" (samma text, bättre radbrytning).

---

## 2. v1 "Två spalter"

| # | Nivå | Fynd | Element / fil:rad | Bevis | Fix |
|---|---|---|---|---|---|
| v1-1 | **Blocker** | **Enter eller "Klar" i beloppsfältet laddar om sidan.** Formuläret har ingen submit-hanterare, ett textfält + radios = implicit submit. Beloppet försvinner, och i `?m=gt` blir URL:en `?ager=ja&aldre=ja&typ=lon`, dvs verktyget byter till ROT med fel rubrik i en grön teknik-artikel. iOS visar "Klar" (`enterkeyhint="done"`) som gör exakt detta. | `index.html:20` `<form class="rk__form" novalidate autocomplete="off">`; `app.js` saknar submit-lyssnare. | `r1-probe.json` -> `steg[Enter i fältet]`: `sidanLaddadesOm: true`, `faltVardeEfter: ""`, `modeEfter: null` (desktop + mobil, rot + gt). | I `app.js`: `document.querySelector('.rk__form').addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });` (så gör v2b, `app.js:55`). |
| v1-2 | **Major** | **"upp till" och "ca" är för små.** Prefixet är 20 px/500 dämpat bredvid ett 56 px-tal (36 % av talet); det är ordet som gör "50 000 kr" ärligt, och det är det minsta på raden. v2b/v3 sätter det i 28 px (halva talet), där läser man "upp till 50 000" som en enhet. | `style.css:92` `.rk__prefix { font-size: var(--rk-text-fraga) }` (20 px); `:94` `.rk__talenhet` 21 px. | `r1-probe.json` -> `typo.prefix: 20px` (v1) mot `28px` (v2b, v3). | `.rk__prefix, .rk__talenhet { font-size: var(--ampy-text-mid); }` (28 vid 1440, 21 vid 390). |
| v1-3 | Minor | **Etiketten hoppar 19 px uppåt i stoppläget** (desktop). Huvudet är vertikalt centrerat; stoppblocket (X + två rader) är högre än talblocket, så allt centreras om. | `style.css:84-85` `grid-template-rows: 1fr auto 1fr` + `.rk__huvud`. | `r1-probe.json` -> `desktop.rot.steg[ager Nej].skiftEyebrow.dy: -19`. | `.rk__stopp { min-height: <talradens + per-radens höjd> }` (v3:s grepp, `v3/style.css:57`) eller `align-items: start` med fast `padding-top` i panelen. |
| v1-4 | Minor | **Talet 42 px på mobil**; briefen säger 44 till 56 (NOTES citerar "40 till 44", det står inte i briefen). | `style.css:131` `--rk-text-tal: 42px`. | `r1-probe.json` -> `mobile.rot.typo.tal: 42px`. | `--rk-text-tal: 44px`. |
| v1-5 | Minor | **Femårsraden 14 px på mobil** (`--ampy-text-small`): minsta texten i verktyget för det enda fallet som ändrar svaret. | `style.css:103`. | `typo.not: 14.119px` (mobil). | `font-size: var(--rk-text-under)` (16). |
| v1-6 | Minor | **Stoppbeskedet 16,1 px på mobil** (briefen: 18 px). | `style.css:112` `font-size: var(--ampy-text-body)`. | `typo.stopptext: 16.119px` (mobil). | `font-size: 18px` som lokal variabel. |
| v1-7 | Minor | **Mobilkortet växer** 38,5 px (Nej ägande) och 47,5 px (Nej fem år): artikeln under flyttar sig. Talet står stilla. | `style.css:141` flex-kolumn på mobil, `:99-105` `.rk__not`. | `mobile.rot.steg[...].kortDh: 38.5 / 47.5`. | Reservera en rad: `.rk__resultat { min-height: <höjd med not> }` på mobil, eller acceptera (det är under kortet). |
| v1-8 | Minor | **Teal 24 x 2-streck före etiketten** läses som ett tankstreck (ett streck före DITT ROT-AVDRAG 2026); briefen vill inga tankstreck, v2b tog bort det av samma skäl. | `index.html:57` `ampy-eyebrow--dash`. | `_shots/r1-v1-rot-desktop.png`. | Ta bort `ampy-eyebrow--dash`. |
| v1-9 | Minor | **Kortet högre än briefen:** desktop 475 (brief <= 460), gt 519 (H2:n bryter på två rader inne i kortet), mobil gt 652 (brief <= 640). | `style.css:14` `--rk-pad-y: 32px`; H2 inne i kortet `index.html:18`. | `r1-probe.json` -> `kort.h`. | Flytta H2 ovanför kortet som v2b/v3 (NOTES: ca 412), eller `--rk-gap-q: 24px` (467). |

**Det som fungerar för henne (mät, inte tyck):** desktop: fråga och svar på samma höjd (etikett y 335, tal y 265, fråga 1
y 224). Mobil 664: talet 542 till 584 helt synligt, sista kontrollen 421 till 469, stoppbeskedet 545 till 653 helt
synligt (`r1-mobil.json`). Tangentbord uppe (370 px): fältet 161 till 209, talet 282 till 324, hon ser talet byta
medan hon skriver (`shots/v1-mobil-tangentbord-370.png`). Läsordning DOM = visuell. Fältet rymmer "1 000 000".

---

## 3. v2b "Bred rad"

| # | Nivå | Fynd | Element / fil:rad | Bevis | Fix |
|---|---|---|---|---|---|
| v2b-1 | **Major** | **Tre frågor i bredd bryter rytmen fråga -> svar** (desktop). Kontrollerna ligger på en gemensam rad (`margin-top: auto`), så fråga 2 och 3 får 69 px luft mellan fråga och spår (73 till alternativet) medan fråga 1 har underraden emellan (7 + 14). Ögat läser frågeraden, sedan letar det nedåt; raden läses som tre fristående reglage. En 55-åring vill ha "fråga, svar, nästa fråga" uppifrån och ned. | `style.css:24` `grid-template-columns: 1fr 1.32fr 1.54fr`; `:40` `.rk__kontroll { margin-top: auto }`. | Uppmätt 2026-09-14: fråga -> alternativ 73 px för alla tre (fråga 1 via underraden), dvs 69 till spåret för fråga 2 och 3; `_shots/r1-v2b-rot-desktop.png`. | Antingen två spalter (fråga 1 + 2 vänster staplade, inkomst höger) så varje kontroll ligger 14 px under sin fråga, eller behåll raden men `.rk__kontroll { margin-top: 0 }` och lägg fråga 1:s underrad under kontrollen (som v3) så alla tre får 14 px; det kostar läsordningen för fråga 1 (se v3-3), så två spalter är det rena valet. |
| v2b-2 | **Major (mobil)** | **Stoppbeskedet hamnar delvis under vikningen.** I ett 390 x 664-fönster (iPhone med Safari-fält) ligger X + besked på 596 till 673; sista raden är osynlig utan scroll. Talet ligger 596 till 640, precis vid vikningen. Orsak: H2 ovanför kortet (+21,5 px), 16,9 px padding på båda sidor om varje hårlinje, bandets 16,9 px topp. | `style.css:18` H2-marginal, `:107-111` mobilpadding, `:115` bandets padding. | `r1-mobil.json` -> `v2b.fonster664.stoppHeltSynligt: false` (596 till 673); `shots/v2b-mobil-664-ager-nej.png`. | Mobil: `.rk__h2 { margin-bottom: var(--ampy-space-xs) }`, `.rk__q { padding: var(--ampy-space-s) 0 }` (2 x 12,8 i stället för 2 x 16,9), `.rk__band { padding-top: var(--ampy-space-s) }`. Sparar ca 30 px och lägger hela beskedet över 664. |
| v2b-3 | Minor | **Valt läge skiljer sig inte i vikt** (500 mot 500), bara färg + pill. | `style.css:44`. | `typo.segLabelValdW: 500, segLabelOvaldW: 500`. | `.rk__seg > label:has(input:checked) { font-weight: var(--ampy-w-strong); }`. |
| v2b-4 | Minor | **Siffrorna i fältet 16,1 px på mobil** (briefen: 18 px). | `style.css:51` `font-size: var(--ampy-text-body)`. | `mobile.rot.typo.input: 16.119px`. | `font-size: 18px`. |
| v2b-5 | Minor | **Stoppbeskedet 16,1/400 på mobil** (briefen 18 px i `--ampy-ink`); tunnaste stopptexten av de tre. | `style.css:86`. | `typo.stopptext: 16.119px`, vikt 400. | `font-size: 18px; font-weight: var(--ampy-w-medium)`. |
| v2b-6 | Minor | **Fältet klipper "1 000 000"** på desktop (132 px innehållsbredd, texten kräver 136). | `style.css:24` spalt 3, `:49` `.rk__falt`. | `r1-mobil.json` -> `v2b.faltMiljon.klipps: true`. | `.rk__falt { min-width: 150px }` och spalt 3 `1.6fr`. |
| v2b-7 | Minor | **Mobilkortet växer 48 px** när femårsraden bryter till egen rad (två rader). Talet flyttar inte. | `style.css:76-80` `.rk__sub` wrap. | `mobile.rot.steg[fem år Nej].kortDh: 48`. | Reservera två rader på mobil (`.rk__sub { min-height: 3em }`) eller acceptera. |

**Det som fungerar för henne:** 0 px skift i alla nio desktoptillstånd (kortet 393,9 px hela tiden, X och tal delar
cell). Enter räknar bara om (`app.js:55`). Prefix 28 px. Live-regionen ligger på värdet, inte på etiketten (bäst av
tre). `aria-describedby` på fråga 1. Tangentbord uppe: fältet 161 till 209, talet 277 till 321, hon ser talet
(`shots/v2b-mobil-tangentbord-370.png`). Hårlinjer mellan frågorna hjälper skanning på mobil.

---

## 4. v3 "Talet först"

| # | Nivå | Fynd | Element / fil:rad | Bevis | Fix |
|---|---|---|---|---|---|
| v3-1 | **Blocker** | **Enter eller "Klar" i beloppsfältet laddar om sidan**, samma fel som v1-1: beloppet borta, `?m=gt` blir ROT. | `index.html:46` `<form class="ak__fragor" ...>`; `app.js` saknar submit-lyssnare. | `r1-probe.json` -> `v3.*.steg[Enter i fältet].sidanLaddadesOm: true`, `modeEfter: null`. | `document.querySelector('.ak__fragor').addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });` |
| v3-2 | **Major (mobil)** | **Nej på fem år flyttar alla kontroller 48 px nedåt**, även den hon just tryckte på och beloppsfältet. Femårsraden bryter till två rader i hjälten, hjälten växer 48 (NOTES säger 24: fel, det är två rader). Briefens krav: layouten hoppar inte. | `style.css:67` `.ak__rad { flex-wrap: wrap }`; hjälten ligger ovanför frågorna. | `mobile.rot.steg[fem år Nej]`: `skiftForstaKontroll.dy: 48`, `skiftFemarKontroll.dy: 48`, `skiftInput.dy: 48`, `kortDh: 48`; `shots/_montage-v3-mobile-tillstand.png` (bild 2). | Reservera raden på mobil: i `@container ak-kort (max-width: 439px) { .ak__rad { flex-direction: column; min-height: calc(3 * var(--ak-under) * 1.5); } }` (rum för "Per person och år." + två rader not). |
| v3-3 | **Major (mobil)** | **Talet är osynligt medan hon skriver.** Med tangentbordet uppe (synligt ca 370 px) ligger talet 219 px ovanför fönstret; avstånd fält -> tal 544 px (v1: 162, v2b: 160). Hon skriver 180 000 och ser inget hända; för att se resultatet måste hon stänga tangentbordet och scrolla upp. | Layoutordningen (hjälte överst, fält sist), `style.css:27-35`, `:77`. | `r1-mobil.json` -> `v3.tangentbord370.tal.top: -219`, `talSynligtMedTangentbord: false`; `shots/v3-mobil-tangentbord-370.png`. | Byt ordning på mobil (hjälten under frågorna, dvs v1/v2b:s ordning) med `order` i container-frågan <= 439, eller minst: på `blur`/"Klar" `hero.scrollIntoView({ block: 'start', behavior: 'smooth' })`. |
| v3-4 | **Major (desktop)** | **Underraden hamnar efter kontrollen visuellt men före i DOM.** "Villa, radhus eller lägenhet. Helt eller delvis." renderas under Ja/Nej (grid-row 3); hon trycker innan hon läst "Helt eller delvis" (just den som äger delvis tvekar). Skärmläsare läser underrad, sedan kontroll; seende får kontroll, sedan underrad (WCAG 1.3.2). | `style.css:123-124` `.ak__kontroll { grid-row: 2 }`, `.ak__under { grid-row: 3 }`. | `r1-a11y.json` -> `v3.desktop.ordning.stammer: false` (`domUnderForst: true`, `visuelltUnderForst: false`); `_shots/r1-v3-rot-desktop.png`. | `.ak__under { grid-row: 2 }`, `.ak__kontroll { grid-row: 3 }` och gör underraden en rad (`.ak__under { white-space: nowrap }` ryms i kolumn 1 vid 980); fråga 2 och 3 får då ca 24 px tom rad, ärlig luft. |
| v3-5 | **Major** | **Grön bock bredvid "ca 0 kr".** Bocken visas så fort `status === 'belopp'`, alltså även vid 1, 18, 180, 1 800, 18 000 kr inkomst där talet är "ca 0 kr". En bock bredvid en nolla är ett falskt godkännande; bredvid "ca 12 000" läses den också som "beviljat" fast talet är en uppskattning. | `app.js:42` `bock.hidden = r.status !== 'belopp'`; `style.css:46-52`. | `r1-probe.json` -> `v3.*.steg[lön 180 000].mellan[*].bock: true` med `tal: "ca 0"`. | Ta bort bocken (v1/v2b:s resonemang), eller visa bara när `r.belopp > 0` och först efter blur / 500 ms-paus (G1). |
| v3-6 | Minor | **Svaret före frågorna.** "upp till 50 000 kr" står överst innan hon svarat; läses lätt som "det här får jag". Etiketten + "upp till" bär det, men v1/v2b läser fråga -> svar. | Layoutidén. | `_shots/r1-v3-rot-mobile.png`. | Om riktningen behålls: ingen billig fix; se v3-3 (ordning på mobil). |
| v3-7 | Minor | **Femårsraden på samma rad som "Per person och år."** på desktop, dämpad + bläck utan skiljetecken; läses som en mening: "Per person och år. Yngre än fem år: ROT gäller bara reparationer." | `style.css:67` `.ak__rad { display: flex; gap: 0 19.8px }`. | `shots/_montage-v3-desktop-femar-lon.png`. | `.ak__rad { flex-direction: column }` (hänger ihop med v3-2). |
| v3-8 | Minor | **Ovalt = valt i vikt** (600/600), bara färg + pill skiljer. | `style.css:85` (vikten sätts inte, systemets 600 ärvs). | `typo.segLabelValdW: 600, segLabelOvaldW: 600`. | `.ak__seg.ampy-segment > label { font-weight: var(--ampy-w-medium); } .ak__seg.ampy-segment > label:has(input:checked) { font-weight: var(--ampy-w-strong); }`. |
| v3-9 | Minor | **Sista kontrollen under vikningen** på 390 x 664: fältet 619 till 667 (3 px under). Hon måste scrolla för att nå sista frågan; v1 (469) och v2b (528) behöver det inte. | `style.css:24` H2-marginal, `:32` hjältens padding 21,5, `:77` gap 21,5. | `r1-mobil.json` -> `v3.fonster664.sistaKontrollHeltSynlig: false`. | Mobil: hjältens `padding-block: var(--ampy-space-m)` (16,9) och `.ak__fragor { margin-top: var(--ampy-space-m) }`: sparar ca 14 px. |

**Det som fungerar för henne:** reaktionen på Nej (X + besked) ligger närmast frågan på mobil (216 px från fråga 1,
v1 388, v2b 407) och helt inom vikningen (122 till 199). Desktop: 0 px skift i alla tillstånd (kortet 424 hela
tiden). Prefix 28 px. Stoppbeskedet 18/500 på mobil (enda versionen som håller briefens 18). Fältet rymmer
"1 000 000" (148 px). `maxlength="11"`.

---

## 5. Tillståndsmatris

Skift = getBoundingClientRect-delta i px efter att animationen (200 ms) är klar. "Tal" = talelementet, "1:a" =
första Ja-alternativet, "fält" = beloppsfältet, "kort" = kortets höjd. Alla mätvärden ur `r1-probe.json`.

### Desktop 1440 (`?m=rot`)

| Tillstånd | v1 | v2b | v3 |
|---|---|---|---|
| Utgångsläge | OK. Kort 980 x 475. "upp till 50 000 kr" | OK. Kort 980 x 394 | OK. Kort 980 x 424 |
| Nej på ägande | OK, men **etiketten skiftar dy -19**; tal borta, X + besked; 1:a 0, fält 0, kort 0 | OK. Etikett 0, 1:a 0, fält 0, kort 0 | OK. Etikett 0, 1:a 0, fält 0, kort 0 |
| Ja igen | OK. Tal tillbaka, tal 0, kort 0 | OK. 0 / 0 | OK. 0 / 0 |
| Nej på fem år | OK. Not under hårlinje i nedre luften; tal 0, etikett 0, 1:a 0, femårskontroll 0, kort 0 | OK. Not på raden efter "Per person och år."; allt 0 | OK (men v3-7: not inline efter "Per person"); allt 0 |
| Lön 180 000 | "ca 12 000 kr", 0 skift. **"ca 0" x 5 medan hon skriver (G1)** | samma | samma **+ grön bock vid "ca 0" (v3-5)** |
| Pension 240 000 | "ca 38 000 kr", 0 skift | samma | samma |
| Inkomst tom igen | "upp till 50 000 kr", 0 skift | samma | samma |
| Fokus i fältet | 0 skift, teal kant + ring | samma | samma |
| Enter / "Klar" i fältet | **FEL: sidan laddas om, belopp borta, mode borta** | OK: räknar om, blur | **FEL: som v1** |
| Tab + pil höger | OK: Nej valt, ring på labeln, stoppläge | OK | OK |
| Reduced motion | OK: 1e-06 s | OK | OK |
| `?m=gt` utgångsläge | OK strängar. Kort 519 (H2 på två rader) | OK. Kort 394 | OK. Kort 424 |
| `?m=gt` Nej på ägande | OK: "... rätt till grön teknik-avdrag." | OK | OK |
| `?m=gt` Nej på fem år | Ingen effekt (G4) | Ingen effekt (G4) | Ingen effekt (G4) |

### Mobil 390 (`?m=rot`)

| Tillstånd | v1 | v2b | v3 |
|---|---|---|---|
| Utgångsläge | OK. Kort 356 x 620 | OK. Kort 347 x 625 (+ H2 utanför) | OK. Kort 347 x 616 (+ H2 utanför) |
| Nej på ägande | OK. Etikett 0, 1:a 0, fält 0, **kort +38,5** | OK. Allt 0, kort 0 | OK. Allt 0, kort 0 |
| Ja igen | OK. 0 | OK. 0 | OK. 0 |
| Nej på fem år | OK. Tal 0, 1:a 0, fält 0, **kort +47,5** (not 14 px) | OK. Tal 0, 1:a 0, fält 0, **kort +48** (not bryter till egen rad) | **FEL: 1:a +48, femårskontroll +48, fält +48, kort +48** (v3-2) |
| Lön 180 000 | "ca 12 000 kr", 0 skift; **talet syns med tangentbordet uppe** | samma, syns | samma; **talet 219 px ovanför synligt fönster (v3-3)** |
| Pension 240 000 | "ca 38 000 kr", 0 | samma | samma |
| Inkomst tom igen | "upp till 50 000 kr", 0 | samma | samma |
| Fokus i fältet | 0 skift | 0 | 0 |
| Enter / "Klar" | **FEL: omladdning** | OK | **FEL: omladdning** |
| Tab + pil höger | OK | OK | OK |
| Reduced motion | OK | OK | OK |
| `?m=gt` | OK. Kort 652 (> 640) | OK. Kort 625 | OK. Kort 616 |

---

## 6. Mobilmått (390 px, `?m=rot`, ur `r1-probe.json` och `r1-mobil.json`)

| Mått | v1 | v2b | v3 | Krav |
|---|---|---|---|---|
| Kortets höjd, utgångsläge | 620 | 625 | 616 | <= 640 |
| Tal (px / vikt) | **42** / 700 | 44 / 700 | 44 / 700 | 44 till 56 |
| Prefix "upp till" / "ca" | 20 | 22 | 22 | |
| Frågor / underrad | 20 / 16 | 20 / 16 | 20 / 16 | 18 till 20 / 16 |
| Segmenttext | 16 | 16,1 | 16,1 | 16 till 18 |
| Siffror i fältet | 18 | **16,1** | 18 | 18 |
| Stoppbesked | **16,1** / 500 | **16,1** / 400 | 18 / 500 | 18 |
| Femårsraden | **14,1** | 16 | 16 | "liten rad" |
| Segment: spår x alternativ | 311 x 48, alternativ 150 x **40** | 302 x 48, 145 x **40** | 302 x 48, 145 x **40** | 48 hög, >= 44 tap |
| Fält | 311 x 48 | 302 x 48 | 302 x 48 | 48 |
| Fullbreddskontroller | ja | ja | ja | ja |
| Horisontell scroll | nej | nej | nej | nej |
| `inputmode` | numeric | numeric | numeric | numeric |
| Talet i 390 x 664 (y topp till botten) | 542 till 584, synligt | 596 till 640, synligt (vid vikningen) | 122 till 166, synligt | |
| Sista kontrollen i 664 | 421 till 469, synlig | 480 till 528, synlig | **619 till 667, 3 px under** | nåbar utan scroll |
| Stoppbeskedet i 664 | 545 till 653, synligt | **596 till 673, sista raden under** | 122 till 199, synligt | |
| Avstånd fråga 1 -> stoppbesked | 388 | 407 | 216 | kortare = bättre |
| Tangentbord uppe (370 px synligt): talet | 282 till 324, **syns** | 277 till 321, **syns** | **-219 till -175, syns inte** | |
| Avstånd fält <-> tal | 162 | 160 | 544 | |
| Fältet rymmer "1 000 000" (desktop) | ja (255 px) | **nej, klipps (132 < 136)** | ja (148 px) | |

---

## 7. Rankning: vilken är lättast för henne

**1. v1 "Två spalter"** (med v1-1 rättad, det är en rad kod).
Varför: på desktop står frågan till vänster och svaret till höger på samma ögonhöjd; hon läser "Äger du din
bostad?", trycker, och ser panelen reagera utan att flytta blicken nedåt. På mobil ligger frågorna före svaret
(hon svarar, sedan läser hon), talet står bredvid fältet när tangentbordet är uppe, och alla reaktioner ryms
inom 664 px. DOM-ordning = läsordning. Valt läge markeras med vikt + färg + pill. Två saker som skulle lyfta
mest: (1) prefix "upp till"/"ca" i 28 px (v1-2) så det ärliga ordet syns; (2) submit-stoppet (v1-1) plus
44 px-tapytor (G3).

**2. v2b "Bred rad".**
Varför: tekniskt renast (0 px skift på desktop, Enter hanterad, live-regionen rätt avgränsad, fältet formaterar
fint) och på mobil nästan identisk med v1. Men desktopraden bryter rytmen fråga -> svar (69 px hål för fråga 2
och 3) och på mobil hamnar stoppbeskedet under vikningen. Två saker: (1) två spalter i stället för tre i bredd
(v2b-1); (2) 30 px mindre luft på mobil så X + besked hamnar över 664 (v2b-2).

**3. v3 "Talet först".**
Varför: det starkaste "hero"-talet och den kortaste vägen fråga -> reaktion på mobil, men för henne kostar
ordningen: talet försvinner bakom tangentbordet när hon skriver (544 px från fältet), Nej på fem år flyttar
kontrollen under tummen 48 px, underraden kommer efter kontrollen på desktop, och bocken står bredvid "ca 0 kr".
Två saker: (1) på mobil lägg hjälten under frågorna (v3-3) och reservera notraden (v3-2); (2) ta bort bocken
eller visa den bara vid belopp > 0 efter paus (v3-5), och rätta submit (v3-1).

---

## 8. PUNCHLISTA per version (ordnad, körbar ordagrant)

### v1

1. `kalkylator/v1/app.js`: lägg till efter rad 80:
   `document.querySelector('.rk__form').addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });`
2. `kalkylator/v1/app.js` rad 76-79: byt input-lyssnaren till fördröjd rendering:
   `let t; inkomst.addEventListener('input', () => { inkomst.value = formatFalt(inkomst.value); clearTimeout(t); t = setTimeout(rendera, 500); }); inkomst.addEventListener('change', () => { clearTimeout(t); rendera(); });`
3. `kalkylator/v1/app.js` rad 63-66: skriv bara när texten ändrats:
   `const nyTal = m ? m[1] : r.text; if (tal.textContent !== nyTal) tal.textContent = nyTal;` (samma för `prefix`, `talenhet`, `not`, `stopptext`).
4. `kalkylator/v1/index.html` rad 55: flytta `aria-live="polite" aria-atomic="true"` från `#rk-resultat` till `<div class="rk__talrad" id="rk-talrad">` och till `#rk-stopp`.
5. `kalkylator/v1/style.css` rad 92: `.rk__prefix { font-size: var(--ampy-text-mid); ... }` och rad 94 `.rk__talenhet { font-size: var(--ampy-text-mid); ... }`.
6. `kalkylator/v1/style.css`: lägg till
   `@media (pointer: coarse) { .rk__segment.ampy-segment { padding: 2px; } .rk__segment > label { min-height: 44px; } }`
7. `kalkylator/v1/style.css` rad 131: `--rk-text-tal: 44px;`
8. `kalkylator/v1/style.css` rad 103: `.rk__not { ... font-size: var(--rk-text-under); ... }`
9. `kalkylator/v1/style.css` rad 112: `.rk__stopptext { ... font-size: 18px; ... }` (lokal variabel `--rk-text-stopp: 18px` med kommentar).
10. `kalkylator/v1/style.css` rad 108: lägg X och text på samma rad som v2b/v3 och ge blocket talblockets höjd: `.rk__stopp { flex-direction: row; align-items: center; gap: var(--ampy-space-s); margin-top: var(--ampy-space-xs); min-height: calc(var(--rk-text-tal) + var(--ampy-space-2xs) + var(--rk-text-under) * var(--ampy-lh-ui)); }`. Mål: `skiftEyebrow.dy: 0` i `r1-probe.json` (i dag -19: stoppblocket är 120 px, talblocket 88, centreringen delar skillnaden).
11. `kalkylator/v1/index.html` rad 57: ta bort klassen `ampy-eyebrow--dash`.
12. `kalkylator/v1/index.html` rad 23-24: ge underraden `id="rk-under-1"` och sätt `aria-describedby="rk-under-1"` på båda radioknapparna i fråga 1.
13. Ägarbeslut: dölj fråga 2 i gt (`.rk[data-mode="gt"] .rk__fraga:nth-of-type(2) { display: none; }`) eller behåll.
14. Kör om: `node tools/shot.mjs kalkylator/v1/index.html _shots/v1 --query "?m=rot"` + `?m=gt`, `node kalkylator/_review/r1-probe.mjs`; kontrollera `sidanLaddadesOm: false`, `skiftEyebrow.dy: 0`, `labelHojd: 44` på mobil.

### v2b

1. `kalkylator/v2b/style.css` rad 24 och 40: byt raden mot två spalter på desktop:
   `.rk__fragor { grid-template-columns: 1fr 1.3fr; }`, `.rk__q:nth-child(2) { grid-column: 1; border-left: 0; border-top: 1px solid var(--ampy-line); padding: var(--ampy-space-m) 0 0; margin-top: var(--ampy-space-m); }`, `.rk__q--inkomst { grid-column: 2; grid-row: 1 / span 2; }`, `.rk__kontroll { margin-top: 0; }` (kontrollen 14 px under sin fråga i alla tre).
   Alternativ om raden ska behållas: `.rk__kontroll { margin-top: 0 }` och acceptera tre olika höjder.
2. `kalkylator/v2b/style.css` rad 105-116 (mobil): `.rk__h2 { margin-bottom: var(--ampy-space-xs); }`, `.rk__q { padding: var(--ampy-space-s) 0; }`, `.rk__band { padding-top: var(--ampy-space-s); }`. Mål: X + besked helt över 664 px (mät med `r1-mobil.mjs`).
3. `kalkylator/v2b/app.js` rad 54: fördröjd rendering som v1 punkt 2 (`setTimeout 500` på input, direkt på change).
4. `kalkylator/v2b/app.js` rad 46-48: skriv bara när texten ändrats (`if (num.textContent !== delat.tal) ...`).
5. `kalkylator/v2b/style.css`: `@media (pointer: coarse) { .rk__seg.ampy-segment { padding: 2px; } .rk__seg > label { min-height: 44px; } }`
6. `kalkylator/v2b/style.css` rad 44: lägg till `.rk__seg > label:has(input:checked) { font-weight: var(--ampy-w-strong); }`
7. `kalkylator/v2b/style.css` rad 51: `font-size: 18px;` (lokal variabel `--rk-siffror-fs: 18px`).
8. `kalkylator/v2b/style.css` rad 86: `font-size: 18px; font-weight: var(--ampy-w-medium);`
9. `kalkylator/v2b/style.css` rad 49: `.rk__falt { ...; min-width: 150px; }`
10. Mobil, valfritt: `.rk__sub { min-height: calc(2 * 1.5 * var(--rk-under-fs)); }` så kortet inte växer 48 px.
11. Ägarbeslut: fråga 2 i gt (som v1 punkt 13).
12. Kör om shot + `r1-probe.mjs` + `r1-mobil.mjs`; kontrollera `stoppHeltSynligt: true`, `labelHojd: 44`, `faltMiljon.klipps: false`.

### v3

1. `kalkylator/v3/app.js`: lägg till efter rad 54:
   `document.querySelector('.ak__fragor').addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });`
2. `kalkylator/v3/style.css` rad 103-106 (container <= 439): lägg till `.ak__rad { flex-direction: column; min-height: calc(3 * 1.5 * var(--ak-under)); }` (rum för "Per person och år." + två rader not: kontrollerna står stilla).
3. `kalkylator/v3/style.css` inne i `@container ak-kort (max-width: 439px)`: lägg hjälten under frågorna på mobil: `.ak__kort { display: flex; flex-direction: column; } .ak__kort.ampy-card > .ak__hero { order: 2; margin: 0 calc(-1 * var(--ak-kort)) calc(-1 * var(--ak-kort)); border-bottom: 0; border-top: 1px solid var(--ampy-line); } .ak__kort.ampy-card > .ak__fragor { order: 1; margin-top: 0; margin-bottom: var(--ampy-space-l); }` (specificiteten 0,3,0 krävs: systemets `.ampy-card > :last-child { margin-bottom: 0 }` träffar annars formuläret, som fortfarande är sista DOM-barnet). Alternativ (minsta): i `app.js` `inkomst.addEventListener('blur', () => hero.scrollIntoView({ block: 'start', behavior: 'smooth' }))`.
4. `kalkylator/v3/style.css` rad 123-124: `.ak__under { grid-row: 2; margin-top: var(--ampy-space-3xs); } .ak__kontroll { grid-row: 3; margin-top: var(--ampy-space-xs); }` (behåll `.ak__under > span { white-space: nowrap }`, rad 80: hela underraden på en rad gör kolumn 1 ca 360 px och raden spränger 980). DOM-ordning = visuell ordning. Priset: fråga 2 och 3 får en tom rad 2 (underradens 48 px), alltså samma 69 px-hål som v2b. Om det inte accepteras är valet två spalter (v2b punkt 1), inte att lägga underraden efter kontrollen.
5. `kalkylator/v3/app.js` rad 42: `bock.hidden = !(r.status === 'belopp' && r.belopp > 0 && document.activeElement !== inkomst);` och kör `rakna()` även på `inkomst.addEventListener('blur', rakna)`. Eller ta bort bocken helt (`index.html` rad 27-29, `style.css` rad 46-52, 74).
6. `kalkylator/v3/app.js` rad 53: fördröjd rendering (500 ms på input, direkt på change), skriv bara vid ändrad text (rad 40-44).
7. `kalkylator/v3/index.html` rad 20: flytta `aria-live="polite" aria-atomic="true"` från `#ak-hero` till `#ak-tal` och `#ak-stopp`.
8. `kalkylator/v3/style.css`: `@media (pointer: coarse) { .ak__seg.ampy-segment { padding: 2px; } .ak__seg.ampy-segment > label { min-height: 44px; } }`
9. `kalkylator/v3/style.css` rad 85: `.ak__seg.ampy-segment > label { font-weight: var(--ampy-w-medium); ... }` + `.ak__seg.ampy-segment > label:has(input:checked) { font-weight: var(--ampy-w-strong); }`
10. `kalkylator/v3/style.css` rad 67: `.ak__rad { flex-direction: column; gap: 0; }` även på desktop (noten på egen rad, inte inline efter "Per person och år.").
11. `kalkylator/v3/style.css` rad 101: mobil `.ak__kort.ampy-card > .ak__hero { padding: var(--ampy-space-m) var(--ak-kort); }` och rad 77 `.ak__fragor { margin-top: var(--ampy-space-m); }` (sista kontrollen över 664).
12. `kalkylator/v3/index.html` rad 50-53: `id="ak-under-1"` på underraden, `aria-describedby="ak-under-1"` på radiogruppen.
13. `kalkylator/v3/NOTES.md`: rätta "hjälten växer 24 px" till 48 (uppmätt).
14. Ägarbeslut: fråga 2 i gt.
15. Kör om shot + `r1-probe.mjs` + `r1-mobil.mjs` + `r1-a11y.mjs`; kontrollera `skiftFemarKontroll.dy: 0`, `talSynligtMedTangentbord: true`, `ordning.stammer: true`, `mellan[*].bock: false` vid "ca 0".
