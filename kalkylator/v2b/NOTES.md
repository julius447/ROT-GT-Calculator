# v2b "Bred rad": tre frågor i bredd, ett resultatband under

Filer: `index.html` (`?m=rot` standard, `?m=gt`), `style.css`, `app.js` (importerar `../rakna.js`),
`_probe.mjs` (mäter och renderar tillstånden), `skarmdumpar/` (allt nedan). Rendera:
`node tools/shot.mjs kalkylator/v2b/index.html _shots/v2b-rot --query "?m=rot"` (och `?m=gt`),
`node kalkylator/v2b/_probe.mjs`. Senaste körning: `errors: []`, `overflowX: false` på båda skärmarna.

## Idén

Verktyget ska sitta högst upp i en artikel utan att trycka undan texten. Därför är det lågt och brett:
H2:n står i artikelflödet (36/500/1,2), under den ett vitt kort där de tre frågorna ligger sida vid sida
som tre spalter med hårlinjer emellan, och under frågorna ett resultatband i sky mist under en hårlinje.
Kortet är 980 x 394 px på desktop.

Tre beslut som bär hantverket:

1. **Frågorna på en rad, kontrollerna på en rad.** Spalterna är satta efter innehållet (1 : 1,32 : 1,54),
   inte lika breda: "Är bostaden äldre än fem år?" mäter 261 px vid 20 px och får plats på en rad, och den
   tredje spalten bär två kontroller (Lön/Pension 190 px + fält 134 px). Kontrollerna ligger på en gemensam
   rad (`margin-top: auto`), så att fråge-raden, underraden och kontrollraden bildar en tabell. Jag renderade
   även varianten med kontrollerna direkt under varje fråga: tre olika höjder, tydligt sämre.
2. **Talet sätts som LED-kalkylatorns siffra:** "upp till"/"ca" och "kr" i halva talets storlek (28/500,
   dämpade) på samma baslinje som talet (56/700, tabulära siffror, -0,03 em). Strängen är fortfarande exakt
   `upp till 50 000 kr` ur `rakna.js`; bara typografin är delad.
3. **Bandet byter aldrig höjd.** Talet och det röda X:et delar samma cell i bandet (`grid-area: 1/1`); det
   dolda läget ligger kvar osynligt (`visibility: hidden` + `aria-hidden`). Kortet är 393,9 px i alla nio
   uppmätta tillstånd på desktop. Bytet tonas in på 200 ms; ingen räknande animation; reduced motion nollas
   av systemet.

Ingen midnattsyta: vitt kort på sky mist-sida, band i sky mist, midnight bara som text. Teal bara som valt
läge i segmenten (`--ampy-action-strong`, 18 px) och som fokusring.

## Uppmätt (Playwright `getBoundingClientRect`, `skarmdumpar/probe.json`)

Desktop 1440 (kortet 980 px brett):

| Mått | px | Brief |
|---|---|---|
| H2 | 36 / 500 / lh 43,2 | 36 / 500 / 1,2 |
| H2 -> kort | 39,6 | (systemets rubrik -> block) |
| Kortpadding (kant -> fråga) | 39,6 (40,6 till glyfboxen) | 32 till 40 |
| Fråga -> underrad | 7 | 6 till 8 |
| Underrad -> kontroll | 14 | 12 till 14 |
| Fråga -> kontroll (spalt 2 och 3) | 69 | (delad kontrollrad) |
| Kontroll -> hårlinje | 39,6 | |
| Hårlinje -> etikett / etikett -> tal / tal -> underrad / underrad -> kant | 20,8 / 14 / 9,9 / 28 | |
| Fråga / underrad / segmenttext / fält | 20/500, 16/400, 18/500, 18/500 | 18 till 20, 16, 16 till 18, 18 |
| Etikett / tal / prefix och enhet / "per person" | 12/600 spärrat 0,14 em, 56/700 tabulära, 28/500, 16/400 | 12 versaler, 44 till 56 |
| Segment / option / fält | 48 hög, 188 bred (2 x 88), option 40; fält 48 x 134 | 48, min 88 per alternativ |
| Spaltbredder | 213 / 267 / 338 (innehåll) | |
| Kortets höjd | 393,9 (frågor 221, band 171) | <= 460 |

Mobil 390 (kortet 347 px brett):

| Mått | px | Brief |
|---|---|---|
| H2 | 26,8 / 500 | `.ampy-h2` |
| Kortpadding | 21,5 | 20 till 24 |
| Fråga -> underrad / underrad -> kontroll | 6,6 / 12 | 6 till 8 / 12 till 14 |
| Fråga -> fråga (över hårlinje) | 34,8 | 28 till 40 |
| Segment / fält | 48 hög, 302 bred (2 x 145) / 48 x 302 | fullbredd |
| Tal / prefix / segmenttext | 44/700, 22/500, 16,1/500 | 40 till 44 |
| Kortets höjd i utgångsläget | 624,8 (672,8 med femårsraden, som bryter till egen rad) | <= 640 |

Surfplatta 768 till 991: två spalter (fråga 1 och 2), inkomsten på egen rad under en hårlinje, fältet max
240 px. Under 992 px viker frågespalterna, under 768 staplas allt.

## De fyra tillstånden (och några till)

| Tillstånd | Band | Desktop | Mobil |
|---|---|---|---|
| Utgångsläge | `upp till 50 000 kr`, `Per person och år.` | `desktop-0-utgangslage.png` | `mobil-0-utgangslage.png` |
| Nej på ägande | rött X 44 px (`--ampy-error-ink`, vitt kryss 1,75 rund ände) + `Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag.`; talet borta; Ja igen ger talet tillbaka (verifierat) | `desktop-1-nej-agande.png` | `mobil-1-nej-agande.png` |
| Nej på fem år | `upp till 50 000 kr` + `Yngre än fem år: ROT gäller bara reparationer.` på underraden (bläck, 19,8 px efter "Per person och år.") | `desktop-2-nej-fem-ar.png` | `mobil-2-nej-fem-ar.png` |
| Lön 180 000 | `ca 12 000 kr` | `desktop-3-lon-180000.png` | `mobil-3-lon-180000.png` |
| Pension 240 000 | `ca 38 000 kr` (tillbaka till Lön: `ca 21 000 kr`; 600 000: `50 000 kr`) | `desktop-4-pension-240000.png` | `mobil-4-pension-240000.png` |
| Grön teknik, Nej på ägande | `Ditt grön teknik-avdrag 2026` + `... rätt till grön teknik-avdrag.`; femårsraden visas aldrig i gt | `desktop-gt-nej-agande.png` | `mobil-gt-nej-agande.png` |

Hela sidor: `rot-desktop-1440.png`, `rot-mobil-390.png`, `gt-desktop-1440.png`, `gt-mobil-390.png`.
Tangentbord: Tab till första segmentet, pil höger = Nej, fokusring ur systemet (`0 0 0 3px rgba(0,122,105,.9)`).
Enter i fältet räknar bara om (submit stoppas). Alla tal kommer ur `berakna()`; ingen egen logik.

## Självgranskning

1. **Femåringstestet.** Första rendern hade tre fel som såg ut precis så: segmentspåret var 58 px (paddingen
   låg i spåret, pillen satt snett), enheten blev "50 000 k" + "kr" (delningen sökte vanligt mellanslag, `kr()`
   ger hårda) och prefixet fick 21 px av `--ampy-text-mid` i stället för 28. Alla tre rättade och mätta. Sedan
   togs den teala eyebrow-strecket bort (kunde läsas som tankstreck) och spalterna sattes efter textmått så
   att ingen fråga bryter på desktop.
2. **Spacing** enligt tabellerna ovan, allt inom briefens intervall. Enda avsteget: mobilens
   underrad -> kontroll är 12 (xs-token ger 10,5, lyft med `max(12px, ...)`).
3. **Tillstånden** renderade ovan, kortet håller höjden på desktop i samtliga.
4. **Mot LED-kalkylatorn och Hero-1.** Samma grepp som LED:s siffra (etikett i versaler, stort tal med dämpad
   enhet på baslinjen, undertext), samma sunk-track-segment med vit pill, samma hårlinjer och vita kort på
   ljus sida. Hero-1:s nivå ligger i rubriken (36/500) och i att verktyget har en accent, inte tre. Det som
   skiljer: LED:s resultatpanel är tät med data; vårt band bär ett tal och mycket luft till höger. Det är
   avsiktligt (innehållet är låst) men är också den svagaste ytan i versionen.

## Olöst / att avgöra

- Bandets högra halva är tom på desktop. Alternativ om det känns för tomt: "Per person och år." på talets
  baslinje till höger, eller bandet som en rad med talet högerställt (kvittostil). Båda bryter briefens
  "etikett vänster, tal vänster eller centrerat", så jag lät bli.
- Grön bock vid talet när inkomst är ifylld (briefen tillåter den) är inte med: talet är en uppskattning ("ca")
  och en bock kan läsas som ett godkännande. Rött X för det juridiska stoppet räcker.
- Femårsraden på mobil bryter till en egen rad och kortet växer 48 px i det läget (672,8). På desktop ligger
  den på samma rad som "Per person och år." och kortet håller höjden.
- Spalt 2 har 7 px marginal innan "Är bostaden äldre än fem år?" bryter (t.ex. om Outfit inte laddas);
  brytningen är balanserad ("Är bostaden / äldre än fem år?") och kontrollraden påverkas inte.
- Kolumnerna är inte lika breda (1 : 1,32 : 1,54). Lika breda ger antingen en bruten fråga eller ett fält på
  79 px; jag valde innehållet.
