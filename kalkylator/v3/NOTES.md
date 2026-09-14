# v3 "Talet först": anteckningar

Filer: `index.html` (`?m=rot` default, `?m=gt`), `style.css`, `app.js` (importerar `../rakna.js`), `_probe.mjs`
(tillståndsprob + fixrundans krav), `skarmdumpar/` (tillstånden + `_probe-resultat.json` med alla mått).
Renderingar: `_shots/v3-rot-desktop.png`, `_shots/v3-rot-mobile.png`, `_shots/v3-gt-desktop.png`, `_shots/v3-gt-mobile.png`
(`node tools/shot.mjs kalkylator/v3/index.html _shots/v3-rot --query "?m=rot"` och `_shots/v3-gt --query "?m=gt"`).
Alla fyra körningar: `errors: []`, `overflowX: false`. `node kalkylator/v3/_probe.mjs`: `krav.alla: true` (17 av 17).

## Idén

Resultatet är hjälten: en sky mist-panel med radie inne i det vita kortet (etikett i versaler, talet 56 px Outfit 700 med
tabulära siffror, "upp till"/"ca" och "kr" i 28 px dämpat på samma baslinje, "Per person och år." under). Under panelen
de tre frågorna på EN rad: etiketterna på en linje, underraden till fråga 1 på en rad direkt under sin etikett, kontrollerna
på en linje, varje kontroll så bred som sitt innehåll (Ja/Nej 188 px, Lön/Pension 200 px, beloppet 150 px). Talet räknas
om vid varje tryck (och 500 ms efter sista tangenten i beloppsfältet) och gör en liten "tick", av vid reduced motion.
Nej på ägande: talet försvinner, ett rött X (44 px, `--ampy-error-ink`, kryss 12 px) och beskedet tar dess plats, panelen
behåller sin höjd. Nej på fem år: noten på egen rad under "Per person och år.", i en rad som är reserverad från början,
så panelen och kontrollerna står stilla.

**På mobil (spalt < 440) byter panelen plats:** frågorna först, talpanelen direkt under beloppsfältet. Skälet är
tangentbordet: talet ska synas medan hon skriver (R1 v3-3, R2 Major 3). DOM-ordningen är oförändrad (`order` i CSS);
panelen har inga fokuserbara element så tab-ordningen påverkas inte.

**Ytvalet.** Panelen är inramad i kortet (kortpadding 19.8 + panelpadding 19.8 = text på 39.6 från kortkanten, samma linje
som frågorna) i stället för kant i kant: så läses den som ett kort i kortet på både vit och sky mist-värd (R2 Major 1).
Demo-sidan är vit, som artikelsidan. Enda accent: teal i valt läge. Rött bara i X:et. Ingen bock, ingen midnattsyta.

## Uppmätt (Playwright, `_probe.mjs`, `getBoundingClientRect`, efter fixrundan)

| Mått | Desktop 1440 (980-spalt) | Mobil 390 | Brief |
|---|---|---|---|
| Kort bredd x höjd | 980 x 408 (gt 377) | 347 x 614 (gt 501) | desktop <= 460 (rad), mobil <= 640 |
| H2 -> kort | 39.6 | 21.5 | (stack-lg, som LED) |
| Kortkant -> panelkant | 20.8 (19.8 + 1 px kant) | 11.5 | |
| Panelkant -> etikett (upptill / sidan) | 28 / 19.8 | 16.9 / 13.3 | |
| Kortkant -> text (etikett, tal, frågor, kontroller: samma linje) | 40.6 | 24.9 | kortpadding 32 till 40 / 20 till 24 |
| Etikett -> tal, tal -> "Per person" | 13.9 / 9.9 | 12.3 / 8.3 | LED ~14 |
| Reserverad rad (Per person + not) | 55 (2 rader + 6.6) | 24 (ingen reservation, se fixrundan i) | |
| Panelhöjd, konstant i alla tillstånd | 200.6 (gt 169.6) | 136.8; växer 54.6 bara vid femårsnoten, under kontrollerna | |
| Panel -> fråga 1 (desktop) / fält -> panel (mobil) | 28 | 16.9 | |
| Fråga -> underrad -> kontroll (fråga 1) | 7 / 14 | 6.6 / 12 | 6 till 8 / 12 till 14 |
| Fråga -> kontroll (fråga 2, 3) | 45 / 45 (tom rad 2, se nedan) | 12 / 12 | 12 till 14 |
| Fråga -> fråga | kolumngap 49.8 / 49.8 (gt: 158.3) | 28 / 28 | 28 till 40 (staplat) |
| Underraden | 1 rad, 306 px, slutar 68.6 px in under fråga 2:s etikett (rad 2) | 2 rader (meningsvis) | |
| Sista kontroll -> kortkant | 40.6 | (panelen under) | |
| Segment: spår, alternativ | 48, 88 x 40 | 48, 145 x 44 (touch) | 48, min 88; 44 på touch |
| Belopp: höjd, bredd, gap siffror -> kr | 48, 150, 9 | 48, 297, 10.7 | 48; "1 000 000" ryms utan klipp |
| Kryss | 12 px i 44 px disk (`M6 6l12 12M18 6L6 18`) | samma | 40 till 48 |

Typografi: H2 36/500 (mobil 26.8), frågor 20/500 spärrning -0.01em, underrad 16/400 dämpad, etikett 12/600 versaler 0.14em,
tal 56/700 (mobil 44/700) tabulära siffror, prefix/enhet 28 (mobil 22), "Per person och år." och noten 16/400, stoppbesked
18/500, segmenttext 18 (mobil 16.1) med 500 ovalt / 600 valt, belopp 18. Bakgrunder: sida vit, kort vit, panel #f5f9ff radie 12.
Kontrast oförändrad från R1:s beräkning (lägst teal-deep på vit pill 5,27:1). Reduced motion: ingen tick, ingen mjuk rullning.

## Tillstånden (PNG i `skarmdumpar/`, kortklippta, 2x)

`desktop-0-start`, `mobil-0-start`, `desktop-gt-0-start` (utgångsläget), `desktop-1-ager-nej` / `mobil-1-ager-nej` (rött X +
besked, kontroller 0 px skift, panel 0 px), `desktop-2-aldre-nej` / `mobil-2-aldre-nej` (noten på egen rad; desktop: panel
0 px, mobil: panelen växer 54.6 under kontrollerna, kontroller 0 px), `desktop-3-lon-180000` / `mobil-3-lon-180000`
("ca 12 000 kr", fältet "180 000"), `desktop-4-pension-240000` / `mobil-4-pension-240000` ("ca 38 000 kr"; tillbaka till
Lön: "ca 21 000 kr"), `desktop-gt-1-ager-nej` ("... rätt till grön teknik-avdrag."), `mobil-tangentbord-370-skriver` och
`-blur` (390 x 370: fältet och hela panelen i bild medan hon skriver och efter "Klar").

## Självgranskning

1. Femåringstestet, desktop: panelen läses nu som en yta i kortet (inte som sidan med en ram), underraden en rad direkt under
   sin fråga, inga hål under kontrollerna, ingen grön disk. Mobil: kontrollerna först, talet under fältet, ingenting hoppar
   under fingret. Kvar som ärlig luft: rad 2 är tom för fråga 2 och 3 (45 px etikett -> kontroll) och panelens nedre 50 px
   på desktop är den reserverade notraden.
2. Spacing: tabellen ovan, alla briefens intervall hålls (kortpadding mobil 23.8 från kantens insida, 24.9 inkl. 1 px kant).
3. Tillstånden: 15 PNG + `_probe-resultat.json`.
4. Mot LED och Hero-1: eyebrow -> tal -> enhet -> underrad, vit yta + sky mist-panel med hårlinjelös radie, teal bara i valt
   läge, vänsterkanter på en linje, 1 px kant + mjuk skugga. Panelens högra halva är luft med avsikt (innehållet är låst).

## Fixrunda (R1 v3 1 till 15, R2 v3 1 till 12, orkestreringsbeslut a till k)

Regel: R2 vinner på layout/typografi, R1 på tillstånd/a11y. Där jag valt annan väg än punchlistans ordagranna kod står skälet.

| # | Punkt | Status | Vad som gjordes, mätt |
|---|---|---|---|
| R1-1 / e | Enter i fältet laddar om | Klart | `submit` på `#ak-fragor` -> `preventDefault()` + `blur()`. Enter: `sidanLaddadesOm: false`, läget kvar, fältet "180 000", fokus lämnar fältet (desktop, mobil, mobil 370 via "Klar"). |
| R1-2 / R2-4 / R2-M5 / i | Femårsnoten flyttar kontrollerna (mobil 48 px); noten på samma rad som "Per person" | Klart | `.ak__rad` är kolumn på alla skärmar (noten på egen rad). Desktop: `min-height` = 2 rader + 6.6 reserverade, panelen 200.6 i alla tillstånd, kontroller 0 px, tal 0 px. Mobil: panelen ligger under kontrollerna, så ingen rad reserveras (annars 55 px tomt i panelen på en telefon); panelen växer 54.6 (noten bryter till två rader) men kontrollerna flyttar 0 px, talet 0 px. Vill ägaren ha konstant höjd även på mobil: ta bort `--ak-rad-h`-överskrivningen i mobilblocket och sätt `calc(3 * 1.5 * var(--ak-under) + var(--ampy-space-3xs))`. |
| R1-3 / R2-M3 / h | Talet osynligt när tangentbordet är uppe | Klart | Mobil (spalt < 440): `.ak__kort` flex-kolumn, frågorna `order: 1`, panelen `order: 2` direkt under fältet. 390 x 370 med fältet fokuserat: fält 161 till 209, panel 226 till 363, "ca 12 000 kr" synligt medan hon skriver; efter blur panel 226 till 363. Värsta fallet (fältet vid nederkanten före fokus): fokus -> efter 300 ms rullas fråga 3 till toppen (bara om panelen inte redan syns), panel 200 till 337; Enter/"Klar" -> blur -> panelen kontrolleras igen. Desktop rörs aldrig (panelen ovanför). |
| R1-4 / R2-M2 / g | Underraden efter kontrollen visuellt men före i DOM; två rader + 98 px hål | Klart | Rad 2 = underraden, direkt under etiketten, EN rad (306 px). Inte `width: max-content` (R2:s fixtest visar att det breddar kolumn 1 till 306 och klipper fältet, `r2-fixtest-v3-desktop.png`) utan `grid-column: 1 / -1` + `white-space: nowrap`: spänner över raden utan att bredda någon kolumn. `.ak__fraga`/`.ak__text` är `display: contents` så etikett, underrad och kontroll är egna rutnätsobjekt. `ordning.stammer: true` på båda skärmar. Priset: fråga 2 och 3 får tom rad 2, etikett -> kontroll 45 px (var 14), och underraden löper 68.6 px in under fråga 2:s etikett på rad 2. Kontroll -> kortkant 40.6 för alla tre (var 98.5 under fråga 2/3). |
| R1-5 / R2-M4 / c | Grön bock vid "ca 0 kr", tredje accent | Klart | Borttagen ur HTML, CSS (`--ak-ikon-bock`, `.ak__bock`, `ak-bock`-animationen) och JS. Ett enda SVG kvar (krysset). |
| R1-6 / d | "ca 0 kr" medan hon skriver; DOM skrivs per tangent | Klart | `input` -> formatera fältet + `setTimeout(rakna, 500)`; `change`/`blur`/radio -> direkt. `rakna()` returnerar tidigt om status/text/prefix/not är oförändrade; annars skrivs bara de noder vars text/hidden faktiskt ändras. Talet under "180000" (80 ms/tangent): "upp till 50 000 kr" x 6, sedan "ca 12 000 kr". |
| R1-7 | aria-live på hela hjälten (etiketten läses upp) | Klart, annan form | `aria-live="polite" aria-atomic="true"` ligger på en `.ak__live`-omslutning runt tal + stoppbesked + rad, inte på etiketten. Inte på `#ak-tal`/`#ak-stopp` var för sig: en live-region som själv går från `hidden` till synlig läses inte tillförlitligt upp (regionen fanns inte i trädet när den ändrades); en bestående region runt båda gör bytet tal <-> besked till en ändring i regionen. En mutationsbatch efter "180000" (desktop 1, mobil 1). |
| R1-8 / f | Tap-yta 40 px | Klart | `@media (pointer: coarse)`: spår padding 2, alternativ `min-height: 44`. Mobil (touch-emulering): spår 48, alternativ 44, klick 2 px in i spåret väljer Nej. Desktop (mus) förblir 48/40. |
| R1-9 | Ovalt = valt i vikt | Klart | Ovalt 500, valt 600 (`:has(input:checked)`). |
| R1-10 / R2-M5 | Noten inline efter "Per person och år." | Klart | Se R1-2: kolumn, egen rad, `gap` 6.6. |
| R1-11 | Sista kontrollen under vikningen 390 x 664 | Behövs inte | Med panelen under frågorna ligger fältet 476 till 524 (var 619 till 667) och talet 588 till 632 i ett 664-fönster: allt i bild. Panelens padding är 16.9/13.3 på mobil (ur tokens), inte R1:s föreslagna ändring. |
| R1-12 | Underraden inte kopplad för skärmläsare | Klart | `id="ak-under-1"` + `aria-describedby="ak-under-1"` på radiogruppen. |
| R1-13 | NOTES: "hjälten växer 24 px" | Rättat | Uppmätt före fixen: 48 px (noten bröt till två rader i hjälten på mobil, R1 `skiftFemarKontroll.dy: 48`). Efter fixen: kontroller 0 px på båda skärmar; panelen 0 px desktop, +54.6 mobil under kontrollerna. |
| R1-14 / a | Fråga 2 i gt gör ingenting | Klart (beslut) | `:root[data-mode="gt"] .ak__fraga--femar { display: none }`; två synliga frågor i gt, ingen not, ingen reserverad rad (panel 169.6). Bred rad i gt: `min-content max-content`, gap 158.3 (`--ampy-space-4xl`) så att underraden (306) slutar 39.9 px före kolumn 2. |
| R1-15 / R2-12 | Kör om proberna | Klart, egen prob | `_probe.mjs` utökad med alla krav (Enter, skift, DOM-ordning, tangentbord 370, 44 px, live-batchar, bock, gt). `_review/`-skripten är inte körda om (de skriver egna JSON/PNG i granskningsmappen som jag inte rör); observera att `r1-a11y.mjs` väntar bara 80 ms efter sista tangenten och skulle nu visa 0 batchar (fördröjningen är 500 ms), inte 1. |
| R2-1 / b | Hjälten läses som sida; demo på sky mist | Klart | Demo vit (`--ampy-bg-surface`). Panel inramad: kort padding 19.8 (mobil 10.5), panel `margin: 0`, padding 28/19.8 (mobil 16.9/13.3), radie `--ampy-radius-field`, frågorna padding 0 19.8 19.8. Text på x = 270.6 på desktop (230 + 40.6) för etikett, tal, frågor och kontroller. |
| R2-2 | Underraden en rad | Klart | Se R1-4: rad 2 (orkestreringsbeslut g), inte rad 3. |
| R2-3 | Bocken bort | Klart | Se R1-5. |
| R2-4 | Rad: per/not på var sin rad, `min-height` | Klart | Se R1-2. |
| R2-5 / j | "grön teknik" bryts inne i ordet | Klart | `ihop()` sätter hårt mellanslag i rubrik, etikett och stoppbesked (regex, U+00A0); dokumenttiteln har vanligt mellanslag. Verifierat i rot- och gt-läge, båda skärmar. |
| R2-6 | H2 -> kort 28 i stället för 39.6 | Klart | `margin: 0 0 var(--ampy-space-stack-lg)`: 39.6 desktop, 21.5 mobil. |
| R2-7 | Etikett -> tal 9.9 | Klart | `.ak__etikett { margin: 0 0 4px }`: 13.9 desktop, 12.3 mobil. |
| R2-8 | Frågans spärrning | Klart | `letter-spacing: var(--ampy-ls-heading)` = -0.2 px vid 20 px. Etikettens spärrning 1.68 px = 0.14em ur `.ampy-eyebrow` (systemet). |
| R2-9 / k | Krysset 10 px | Klart | Path `M6 6l12 12M18 6L6 18` i 24-box, renderat 24 px: kryss 12 px, stroke 1.75. |
| R2-10 | "kr"-gapet 19 px | Klart | `padding-right: calc(var(--ampy-space-xs) + 1.4em)`: gap 9 desktop, 10.7 mobil. |
| R2-11 / h | Mobilordningen | Klart | Se R1-3. |
| Extra | Lön/Pension bredde ut sig i mellanbandet (spalt 440 till 939) | Klart | `.ak__inkomst { grid-template-columns: max-content minmax(14rem, 20rem); justify-content: start }`: Lön/Pension 200, fältet 200, som Ja/Nej. |
| Extra | Container-frågan satt på kortet | Ändrat | En container-fråga kan inte styra behållaren själv, så mobilordningen (som styr `.ak__kort`) gick inte att sätta. Behållaren är nu sektionen `.ak` (= spaltens bredd): mobil `<= 439`, kontroller efter innehåll `>= 440`, raden `>= 940` (raden kräver 856 px innehåll + kortets 79.2 + kant). I Bricks (980) blir det raden; demon ger raden från ca 1010 px fönster. |

**Kvar / observationer (inga ägarfrågor utöver de som orkestreringen redan avgjort):**

- Rot desktop: underraden (306 px) löper 68.6 px in under "Är bostaden äldre än fem år?" på rad 2. Aritmetiken i R2 avsnitt 4
  gäller: kolumn 1 kan inte göras 306 bred utan att raden spränger 899. Alternativet är rad 3 under kontrollen (R2:s väg), som
  bryter DOM = visuell ordning.
- Fråga 2 och 3 har tom rad 2 på desktop (etikett -> kontroll 45 px). Kontrollerna står på en linje, som R2 ville.
- Mobil: reaktionen på Nej (X + besked) ligger nu ca 400 px under Nej-knappen (som v1/v2b), och femårsnoten landar vid ca
  671 px i ett 664-fönster, alltså precis under vikningen ("Per person och år." slutar på 664). Priset för att talet ska
  synas när tangentbordet är uppe.
- Desktop: panelens nedre 50 px är den reserverade notraden (tom i utgångsläget). Vill ägaren hellre att panelen växer 30.6 px
  vid Nej på fem år: `.ak__rad { min-height: 0 }`.
- Subgrid används inte längre; `display: contents`, container queries och `:has()` kräver Chrome 105+/Safari 16+/Firefox 121+.
  Äldre webbläsare får den staplade layouten med kontroller efter innehåll (ingen container-fråga träffar), fortfarande korrekt.
