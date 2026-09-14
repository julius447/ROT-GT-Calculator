# v2b "Bred rad": tre frågor i bredd, ett resultatband under

Filer: `index.html` (`?m=rot` standard, `?m=gt`), `style.css`, `app.js` (importerar `../rakna.js`),
`_probe.mjs` (mäter, renderar tillstånden och kör fixrundans 17 krav), `skarmdumpar/` (allt nedan + `probe.json`). Rendera:
`node tools/shot.mjs kalkylator/v2b/index.html _shots/v2b-rot --query "?m=rot"` (och `_shots/v2b-gt --query "?m=gt"`),
`node kalkylator/v2b/_probe.mjs`. Senaste körning 2026-09-14 (efter fixrundan): `errors: []`, `overflowX: false` på båda
skärmarna i båda lägena, 17 av 17 krav OK i `probe.json -> krav`.

## Idén

Verktyget ska sitta högst upp i en artikel utan att trycka undan texten. Därför är det lågt och brett:
H2:n står i artikelflödet (36/500/1,2), under den ett vitt kort där de tre frågorna ligger sida vid sida
som tre spalter med hårlinjer emellan, och under frågorna ett resultatband i sky mist under en hårlinje.
Kortet är 980 x 351 px på desktop (327 i gt-läget).

Tre beslut som bär hantverket:

1. **Frågorna på en rad, varje kontroll 14 px under sin egen fråga.** Spalterna är satta efter innehållet
   (`minmax(21rem, 1fr) minmax(min-content, 1.36fr) max-content` = 221 / 301 / 376 vid 1440): "Är bostaden
   äldre än fem år?" (255 px) står på en rad med 7 px marginal, tredje spalten bär Lön/Pension (191) + 14 + fältet (150,
   fast: "1 200 000" mäter 81,5 + padding 54 + kant 2 = 137,5). Underraden bryter meningsvis på två rader. Den
   gemensamma kontrollraden (`margin-top: auto`) är borta: den gav 69 px hål under fråga 2 och 3. Priset är att spalt 1
   är 55 px högre nedtill (142 mot 87); det ligger mot bandets hårlinje och läses som luft. Se "Fixrunda" för varför
   två spalter (R1-1) valdes bort.
2. **Talet sätts som LED-kalkylatorns siffra, i en kvittorad.** "upp till"/"ca" och "kr" i halva talets storlek
   (28/500, dämpade) på samma baslinje som talet (56/700, tabulära siffror, -0,03 em). Etiketten och "Per person och
   år." står som en stapel till vänster, talet högerställt mot fältets kant (39,6 från kortets inre kant, samma som
   fältet) och centrerat mot stapeln; femårsraden har en egen, reserverad rad under. Strängen är fortfarande exakt
   `upp till 50 000 kr` ur `rakna.js`; bara typografin är delad. Etiketten står utanför live-regionen (R1 G2), därför
   placeras live-regionens barn i bandets spår med subgrid (fallback utan subgrid: staplat som på mobil).
3. **Bandet byter aldrig höjd.** Talet med sina två underrader och det röda X:et delar spår i bandet; det dolda
   läget ligger kvar osynligt (`visibility: hidden` + `aria-hidden`). Kortet är 350,8 px i alla tio uppmätta
   tillstånd på desktop och talet står på samma y (381,8) i alla tillstånd där det visas. Bytet tonas in på 200 ms;
   ingen räknande animation; reduced motion nollas av systemet.

Ingen midnattsyta: vitt kort med hårlinje + systemets skugga på vit sida (artikelmallen är vit), band i sky mist,
midnight bara som text. Teal bara som valt läge i segmenten (`--ampy-action-strong`) och som fokusring.

## Uppmätt (Playwright `getBoundingClientRect`, `skarmdumpar/probe.json`)

Desktop 1440 (kortet 980 px brett):

| Mått | px | Brief |
|---|---|---|
| H2 | 36 / 500 / lh 43,2 | 36 / 500 / 1,2 |
| H2 -> kort | 39,6 | (systemets rubrik -> block) |
| Kortpadding (kant -> fråga) | 39,6 (40,6 till glyfboxen) | 32 till 40 |
| Fråga -> underrad | 7 | 6 till 8 |
| Underrad -> kontroll (Q1) / fråga -> kontroll (Q2, Q3) | 14 / 14 / 14 | 12 till 14 |
| Kontroll -> hårlinje (Q1 / Q2 / Q3) | 39,6 / 94,6 / 94,6 | |
| Hårlinje -> etikett / etikett -> "Per person" / "Per person" -> femårsrad (reserverad 24) / femårsrad -> kant | 20,8 / 7,9 / 7 / 19,8 | |
| Talets överkant mot etikettens / talets högerkant mot kortets inre kant | 0 / 39,6 (= fältets) | |
| Fråga / underrad / segmenttext / fält | 20/500, 16/400, 18/600, 18/500 (platshållare 400) | 18 till 20, 16, 16 till 18, 18 |
| Etikett / tal / prefix och enhet / "per person" / femårsrad / stopptext | 12/600 spärrat 0,14 em, 56/700 tabulära, 28/500, 16/400, 16/400, 18/500 | 12 versaler, 44 till 56, 18 |
| Segment / option / fält | 48 hög, 188 bred (2 x 88), option 40; fält 48 x 150 ("1 200 000": scrollWidth 148 = clientWidth 148) | 48, min 88 per alternativ |
| Spaltbredder | 221 / 301 / 376 | |
| Kortets höjd | 350,8 (frågor 221, band 128); gt 326,8 | <= 460 |

Mobil 390 (kortet 347 px brett, `pointer: coarse`):

| Mått | px | Brief |
|---|---|---|
| H2 | 26,8 / 500, 13,3 till kortet | `.ampy-h2` |
| Kortpadding | 21,5 (22,6 till glyfboxen) | 20 till 24 |
| Fråga -> underrad / underrad -> kontroll | 6,6 / 12 | 6 till 8 / 12 till 14 |
| Fråga -> fråga (över hårlinje) | 28 (13,5 + 1 + 13,5) | 28 till 40 |
| Segment / option / fält | 48 hög, 302 bred; option 44 x 147 (spår 2 + 44 + 2); fält 48 x 302 | fullbredd, träffyta >= 44 |
| Tal / prefix / segmenttext / fält / stopptext | 44/700, 22/500, 16,1/600, 18/500, 18/500 | 40 till 44, 18, 18 |
| Hårlinje -> etikett / etikett -> tal / tal -> "Per person" / "Per person" -> kant | 14,3 / 10,5 / 8,3 / 21,5 | |
| Kortets höjd i utgångsläget | 607,8 (gt 494,8); 662,4 med femårsraden (två rader, reserveras inte, se Fixrunda h) | <= 640 |
| iPhone-fönster 390 x 664 | talet 571 till 615, stoppbeskedet 571 till 648: helt synligt | |
| Tangentbord uppe (390 x 370) | fältet 161 till 209, talet 273 till 317: hon ser "ca 12 000 kr" medan hon skriver | |

Surfplatta 768 till 991: två spalter (fråga 1 och 2), inkomsten på egen rad under en hårlinje (19,8 + 1 + 19,8),
kvittoraden som på desktop; kortet 412 till 423. 992 till ca 1020: fråga 2 viker balanserat på två rader (spalt 1 håller
minst 210 så underraden aldrig får en tredje rad). Under 768 staplas allt.

## Tillstånden (renderade)

| Tillstånd | Band | Desktop | Mobil |
|---|---|---|---|
| Utgångsläge | `upp till 50 000 kr`, `Per person och år.` | `desktop-0-utgangslage.png` | `mobil-0-utgangslage.png` |
| Nej på ägande | rött X 44 px (40 på mobil, `--ampy-error-ink`, vitt kryss 1,75 rund ände) + `Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag.` på hela raden under etiketten; talet borta; Ja igen ger talet tillbaka (0 px skift) | `desktop-1-nej-agande.png` | `mobil-1-nej-agande.png`, `mobil-664-nej-agande.png` |
| Nej på fem år | `upp till 50 000 kr` + `Yngre än fem år: ROT gäller bara reparationer.` på egen rad under "Per person och år." (bläck) | `desktop-2-nej-fem-ar.png` | `mobil-2-nej-fem-ar.png` |
| Lön 180 000 | `ca 12 000 kr`, en uppläsning | `desktop-3-lon-180000.png` | `mobil-3-lon-180000.png` |
| Pension 240 000 | `ca 38 000 kr` (tillbaka till Lön: `ca 21 000 kr`; 600 000 och 1 200 000: `50 000 kr`) | `desktop-4-pension-240000.png` | `mobil-4-pension-240000.png` |
| Grön teknik, utgångsläge | `Räkna ut ditt grön teknik-avdrag`, två spalter (femårsfrågan dold), `Ditt grön teknik-avdrag 2026` | `desktop-gt-0-utgangslage.png` | `mobil-gt-0-utgangslage.png` |
| Grön teknik, Nej på ägande | `... rätt till grön teknik-avdrag.`; femårsraden visas aldrig i gt | `desktop-gt-nej-agande.png` | `mobil-gt-nej-agande.png` |

Hela sidor: `rot-desktop-1440.png`, `rot-mobil-390.png`, `gt-desktop-1440.png`, `gt-mobil-390.png` (och `_shots/v2b-{rot,gt}-{desktop,mobile}.png`).
Jämförelsen i fixrundan: `alt-tva-spalter-R1-desktop.png`, `alt-tva-spalter-28-desktop.png`.
Tangentbord: Tab till första segmentet, pil höger = Nej, fokusring ur systemet (`0 0 0 3px rgba(0,122,105,.9)`).
Enter i fältet räknar direkt och laddar inte om (URL:en oförändrad, beloppet kvar). Alla tal kommer ur `berakna()`; ingen egen logik.

## Fixrunda 2026-09-14 (R1-ux.md § v2b + R2-design.md § v2b + orkestratorns beslut a till h)

R2 fick sista ordet om layout och typografi, R1 om tillstånd och tillgänglighet. Varje rad: gjort / delvis / inte, varför, mått.

**Layoutbeslutet (R1-1 två spalter mot R2-1/R2-2 raden), avgjort med mätning.** Båda renderade i 1440 (`alt-*.png`,
`probe.json -> jamforelse`):

| | Rad (vald) | Två spalter, R1:s mått (m + hårlinje) | Två spalter, 28 utan hårlinje |
|---|---|---|---|
| Kortets höjd | **350,8** | 470,8 (> 460) | 441,8 |
| Fråga -> kontroll per spalt | 14 / 14 / 14 | 14 / 14 / 14 | 14 / 14 / 14 |
| Tomt under kontrollen | 0 / 55 / 55 (mot hårlinjen 39,6 / 94,6 / 94,6) | 0 / 0 / **175** under inkomsten | 0 / 0 / **146** under inkomsten |

Båda tar bort R1:s hål (kontrollen 14 under sin fråga i varje spalt). Två spalter klarar 460 bara utan hårlinje mellan
fråga 1 och 2 och byter då ett 55 px-band under två kontroller mot ett 146 px-hål under inkomstkontrollen plus 91 px
högre kort, och versionen slutar vara "Bred rad". Raden behålls; den synliga skillnaden (spalt 1 55 px högre nedtill) är
accepterad och dokumenterad ovan.

R1 (12 punkter):

| # | Status | Vad, varför, mått |
|---|---|---|
| 1 | delvis | Två spalter renderat och mätt (tabellen ovan) men valt bort; raden med `margin-top: 0` (R1:s alternativ) valdes: fråga -> kontroll 14 i alla spalter. |
| 2 | gjort | Mobil: H2 -> kort 13,3 (s, inte xs: 10,5 hade räckt men s håller rubriken läsbart skild från kortet), `.rk__q` padding 13,5 (fråga -> fråga 28,0), bandets topp 13,3. Stoppbeskedet 571 till 648 i 390 x 664: helt synligt (var 596 till 673). |
| 3 | gjort | `app.js`: `input` formaterar fältet direkt men räknar om 500 ms efter sista tangenten; `change`/`blur`/Enter räknar direkt. Medan "180000" skrivs (80 ms per tangent) står talet kvar på "upp till 50 000 kr", 0 mutationer; sedan "ca 12 000 kr". |
| 4 | gjort | Alla skrivningar villkorade (`satt()`, `visa()`, status, `hidden`): en mutationsbatch (4 mutationer) i live-regionen efter "180000", uppläst en gång: "ca 12 000 kr Per person och år." (var 6 batchar). |
| 5 | gjort | `@media (pointer: coarse)`: spår 2 + option 44 + 2 = 48. Mobil: option 44 x 147, spår 48. Desktop oförändrat (40 i 48). |
| 6 | gjort (R2 vann formen) | Vald är 600, men ovald också 600 (systemets `.ampy-segment`, LED: 600 på alla): R2 minor 9 och R2:s v1-fynd om vikthopp; ett hopp 500 -> 600 skulle dessutom ändra spårets bredd (max-content-kolumner). Valt läge bärs av vit pill + skugga + teal text. |
| 7 | gjort | `--rk-siffror-fs: 18px` på fältet och "kr": 18/500 på desktop och mobil (var 16,1 på mobil). |
| 8 | gjort | Stopptext 18/500 på båda skärmar (var 16,1/400 på mobil). Mobil: tre rader vid 40 px-X:et, X:et centrerat mot texten (0 px skillnad). |
| 9 | gjort | `.rk__falt { flex: 0 0 150px }` (mobil `flex: 0 0 auto`): "1 200 000" scrollWidth 148 = clientWidth 148, inget klipp (var 136 > 132). |
| 10 | inte (mobil) | Femårsraden reserveras inte på mobil: den är två rader (333 px text i 302), 48 + 6,6 px, och kortet skulle bli 655 till 662 i utgångsläget (> 640) även med alla mobilmått på briefens golv (räknat: 646,7). Kortet växer 54,6 i det läget (607,8 -> 662,4); talet flyttar inte (y 571,3 i alla tillstånd). Reserverad på desktop, se h. |
| 11 | gjort (ägarbeslut a) | Fråga 2 dold i `?m=gt`: `femar.hidden = true` + `.rk__q[hidden] { display: none }`; radioknapparna är varken fokuserbara eller i trädet. gt får två spalter (`minmax(0,1fr) max-content`): underraden på en rad, fältets högerkant på samma ställe som i rot. |
| 12 | gjort | `_probe.mjs` utbyggd med kraven (17 st, alla OK), `shot.mjs` rot + gt: `errors: []`, `overflowX: false`. R1:s egna skript i `_review/` är inte körda om (de skriver i granskningsmappen); provet mäter samma saker (`stoppHeltSynligt`, `optionHojd 44`, `klipps false`). |

R2 (11 punkter):

| # | Status | Vad, varför, mått |
|---|---|---|
| 1 | gjort | Fältet 150 fast, spalt 3 `max-content` (376). Spalt 2 `minmax(min-content, 1.36fr)` i stället för `minmax(30rem, 1.25fr)`: samma 301 vid 1440, men mellan 992 och ca 1020 px viker fråga 2 balanserat i stället för att fråga 1 kläms (med 30rem bröt "Äger du / din bostad?" vid 992). Spalt 1 minst 21rem så underraden aldrig får en tredje rad. Fråga 2 på en rad (301 mot 295 behövda). Kortet 350,8. |
| 2 | gjort | `margin-top: auto` borta: fråga -> kontroll 14 / 14 / 14. Spalt 1 55 px högre nedtill (142 mot 87). |
| 3 | gjort | `.rk__sub` och `.rk__not` som block, femårsraden på egen rad under "Per person och år." (7 px), i `--ampy-ink-body`. |
| 4 | gjort | `.rk__input::placeholder { font-weight: 400 }` (var 500). |
| 5 | gjort, med ändring | Två spann i underraden, men `display: inline-block` i stället för `nowrap`: samma meningsvisa brytning ("Villa, radhus eller lägenhet." / "Helt eller delvis." på mobil och i spalt 1), men meningen viker inuti i stället för att rinna över hårlinjen när spalten är smalare än 190 (nowrap gav 17 till 24 px överhäng vid 992 till 1000 px). |
| 6 | gjort, med ändring | Inte hårt mellanslag (`\u00a0`) utan ett `<span class="rk__nobr">` (nowrap) runt namnet i H2, etikett och stopptext: bryter varken vid mellanslaget eller bindestrecket ("grön teknik-" / "avdrag" är annars en tillåten brytning) och `textContent` förblir exakt den låsta strängen. Mobil gt: H2 på två rader "Räkna ut ditt" / "grön teknik-avdrag", stopptexten obruten (spannet har en klientrektangel). |
| 7 | gjort | Stopptext 18/500 (= R1-8). |
| 8 | gjort | Segmenttext 600 (= R1-6). |
| 9 | gjort | `body.ampy { background: var(--ampy-bg-surface) }`: vit sida, kortet med hårlinje (`--ampy-line`) + `--ampy-shadow-card`, bandet sky mist (uppmätt `rgb(245,249,255)` mot sidans `rgb(255,255,255)`). |
| 10 | gjort (orkestratorbeslut f) | Kvittoraden: etikett + "Per person och år." vänster, talet högerställt mot fältets kant (39,6 från kortets inre kant, = fältets), centrerat mot stapeln (talets överkant = etikettens boxöverkant; versalernas överkanter i linje med 5 px optisk justering). Stoppet tar hela raden under etiketten (X 13,6 under etiketten). Bandet 128 (var 171), kortet 351 (var 394), tomt till höger 39,6 (var 447). Det läses bättre än talet till vänster: bredden används, talet står under fältet hon just skrev i och högerkanterna delar linje; det som kostar är avståndet etikett -> tal (ca 700 px), som kvittoformen bär. Implementerat med subgrid (Chrome 117+, Safari 16+, Firefox 71+) bakom `@supports`; utan stöd faller desktop tillbaka till den staplade layouten. |
| 11 | gjort | `_probe.mjs` + `shot.mjs` rot och gt: fråga -> kontroll 14 i alla spalter (rot 3, gt 2), "1 200 000" utan klipp, femårsraden på egen rad, "grön teknik" obrutet i H2 och stopptext på mobil. |

Orkestratorns beslut:

| | Status | Vad |
|---|---|---|
| a | gjort | Fråga 2 dold i `?m=gt` (R1-11). |
| b | gjort | Vit demosida, kort med hårlinje + systemskugga, band sky mist (R2-9). |
| c | gjort | 500 ms på `input`, direkt på `change`/blur/Enter, DOM skrivs bara vid ändring (R1-3, R1-4). |
| d | gjort (fanns) | Submit stoppas, Enter blur:ar fältet och räknar direkt; URL:en oförändrad, beloppet kvar. |
| e | gjort | 44 px option på `pointer: coarse`, spåret 48 (R1-5). |
| f | gjort | Kvittoraden vald efter render (R2-10, motiveringen ovan). |
| g | gjort | "grön teknik-avdrag" obrutet via nowrap-spann (R2-6). |
| h | gjort på desktop, inte på mobil | Femårsraden på egen rad under "Per person och år.", reserverad 24 px på desktop och surfplatta: kortet 350,8 i alla tillstånd. På mobil kan de 48 + 6,6 px inte reserveras under 640 (R1-10); kortet växer 54,6 när kunden svarar Nej, talet flyttar inte. |

Inte rört: `kalkylator/rakna.js`, `kalkylator/system/`, andra versioner, granskningsfilerna. R1 G1(b) ("0 kr" utan "ca" i
`rakna.js`) och G7 är ägarfrågor utanför v2b.

## Självgranskning

1. **Femåringstestet.** Första rendern efter fixrundan hade två saker som såg oavsiktliga ut: X:et satt 6,6 px under
   etiketten (nu 13,6) och bandets botten var 59 px tomt under "Per person och år." med 28 px padding under den
   reserverade raden (nu 19,8, samma som toppen, så femårsraden står 19,8 från kanten när den tänds). Sedan visade
   breddsvepet (992, 1000, 1010, 1024, 1056, 1440, 768, 900) att underradens nowrap-spann rann över hårlinjen och att
   fråga 1 bröt vid 992: rättat med inline-block-spann och spalt 2 utan hård minimibredd.
2. **Spacing** enligt tabellerna ovan, allt inom briefens intervall. Avsteg: mobilens underrad -> kontroll är 12
   (xs-token ger 10,2, lyft med `max(12px, ...)`); spalt 1 på desktop är 55 px högre än 2 och 3 (avsiktligt, se ovan).
3. **Tillstånden** renderade (tabellen), kortet håller höjden på desktop i samtliga (350,8) och talet står still (381,8).
4. **Mot LED-kalkylatorn och Hero-1.** Samma grepp som LED:s siffra (etikett i versaler, stort tal med dämpad enhet på
   baslinjen, undertext), samma sunk-track-segment med vit pill och 600 på alla alternativ, samma hårlinjer och vita
   kort på ljus sida; kvittoraden gör att bandet, som LED:s panel, bär innehåll i hela bredden. Hero-1:s nivå ligger
   i rubriken (36/500) och i att verktyget har en accent, inte tre.

## Olöst / att avgöra

- Spalt 1 är 55 px högre än spalt 2 och 3 nedtill (underraden). Det enda skelettet som bär underraden utan höjdskillnad
  är staplade frågor (v1); för v2b är det accepterat.
- Femårsraden reserveras inte på mobil (kortet 607,8 -> 662,4 i det läget). Vill ägaren ha reservation även där kostar
  det briefens 640-tak (minst 647).
- Grön bock vid talet när inkomst är ifylld (briefen tillåter den) är inte med: talet är en uppskattning ("ca")
  och en bock kan läsas som ett godkännande. Rött X för det juridiska stoppet räcker.
- Kvittoraden kräver subgrid; utan stöd (Chrome < 117, Safari < 16) visas desktop staplat (etikett, tal, underrader),
  som mobilen.
