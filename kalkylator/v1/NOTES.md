# v1 "Två spalter": anteckningar

Filer: `index.html` (`?m=rot` default, `?m=gt`), `style.css`, `app.js` (importerar `../rakna.js`), `_probe.mjs`
(tillståndsprob, skriver `skarmdumpar/*.png` + `skarmdumpar/probe.json`).
Render: `node tools/shot.mjs kalkylator/v1/index.html _shots/v1 --query "?m=rot"` (och `?m=gt`) ger
`errors: []`, `overflowX: false` på 1440 och 390. `node kalkylator/v1/_probe.mjs` ger samma.

## Idén

Ett vitt kort (`.ampy-card`, hårlinje + kortskugga) som fyller artikelspalten (980 px) och delas 55/45.
Vänster: H2 + tre frågor staplade, etikett över kontroll, luft i stället för ramar. Höger: beskedet på en
sky mist-panel (`--ampy-bg-subtle`) som går ända ut till kortets kant, skild från frågorna av en enda
hårlinje (`--ampy-line`), innehållet vertikalt centrerat: teal-streck + etikett (`.ampy-eyebrow--dash`),
talet som hero (Outfit 700, tabulära siffror, midnight), "kr" som mindre enhet bredvid (samma grepp som
LED-kalkylatorns "kr/år"), "Per person och år." dämpad under. Ingen midnattsyta någonstans; teal är enda
accenten (strecket 24 x 2 samt vald text i segmenten, `--ampy-action-strong`).

Panelen är tre rader (luft / huvud / luft): huvudbeskedet ligger alltid mitt i panelen och flyttar sig
inte när femårsraden dyker upp; raden får plats i den nedre luften bakom en hårlinje. Uppmätt: talradens
överkant 265,5 px både utan och med femårsraden (desktop), 541,7 px på mobil.

Stoppläget: talet, underraden och femårsraden döljs; en 44 px cirkel i `--ampy-error-ink` med vitt kryss
(inline-SVG, stroke 1,75, rund ände) och beskedet ur `rakna.js` i `--ampy-ink` 18/500. Ja igen tar talet
tillbaka. Talet byts med en 200 ms intoning (aldrig count-up, aldrig på första renderingen); base.css
nollar den vid reduced motion.

Mobil (390): en spalt, frågorna först, panelen som fullbreddsblock i kortets botten bakom en hårlinje
uppåt. Segment och fält går på hela bredden, inkomstraden staplas, talet 42 px.

## Uppmätt (Playwright `getBoundingClientRect`, `skarmdumpar/probe.json`)

Desktop 1440, kortet 980 x 475 px (55/45: frågor 538, panel 440):

| Mått | px | Brief |
|---|---|---|
| kortkant -> H2 | 33 (32 + 1 kant) | 32 till 40 |
| H2 -> fråga 1 | 19,8 (`--ampy-space-s`) | |
| fråga -> underrad | 7 (`--ampy-space-3xs`) | 6 till 8 |
| underrad -> kontroll | 14 (`--ampy-space-xs`) | 12 till 14 |
| fråga (etikett) -> kontroll | 14 | 12 till 14 |
| kontroll -> nästa fråga | 28 (`--ampy-space-m`) | 28 till 40 |
| sista kontroll -> kortkant | 33 | 32 till 40 |
| panel: etikett -> tal | 14, tal -> "Per person" 9,9 | |

Typografi: H2 36/500/lh 43,2 (`.ampy-h2`); frågor 20/500/lh 25; underrad 16/400 dämpad; etikett
12/600 versaler spärrning 1,68 px; tal 56/700 tabular-nums; "Per person och år." 16/400 dämpad; segment 16
(vald 600 teal-deep, ovald 500 dämpad); belopp 18/500.

Kontroller: segmentspår 188 x 48, varje val 88 x 40 (4 px spår runt, som LED-kalkylatorn); beloppsfält
257 x 48 med "kr" som suffix inne i fältet. Talraden "upp till 50 000 kr" är 264 px bred i 360 px panel.

Mobil 390, kortet 356 x 620 px i utgångsläget (tak 640): kortpadding 22,5, H2 -> fråga 16,9,
fråga -> underrad 6,6, underrad -> kontroll 10,5, fråga -> fråga 21,5; segment 311 x 48 (val 150 x 40), fält
311 x 48; tal 42 px. Med femårsraden 667, i stoppläget 658, i gt-läget 652 (rubriken bryter på två rader).

Kontrast (alla >= 4,5:1): dämpad text `#565e82` på sky mist 5,99:1, teal-deep på vit 5,27:1, vitt kryss på `--ampy-error-ink` 10,7:1, placeholder
`#6a7190` 4,8:1, midnight på sky mist 18:1.

## De fyra tillstånden (PNG i `skarmdumpar/`)

1. Nej på ägande: `desktop-2-ager-nej.png`, `mobile-2-ager-nej.png` (rött X + besked, talet borta; Ja igen
   ger talet tillbaka, proben verifierar `agerJaIgen`).
2. Nej på fem år: `desktop-3-femar-nej.png`, `mobile-3-femar-nej.png` ("Yngre än fem år: ROT gäller bara
   reparationer." bakom hårlinje, talet står kvar på samma plats).
3. 180 000 kr lön: `desktop-4-lon-180000.png`, `mobile-4-lon-180000.png` (ca 12 000 kr).
4. Pension 240 000: `desktop-5-pension-240000.png`, `mobile-5-pension-240000.png` (ca 38 000 kr). Tillbaka
   till lön + 600 000 ger 50 000 kr utan prefix, tomt fält ger "upp till 50 000 kr" igen (`lon600k`, `tomIgen`).

Dessutom: `*-1-utgangslage.png`, `*-6-gt-utgangslage.png`, `*-7-gt-ager-nej.png` (grön teknik-strängarna),
`*-8-tangentbordsfokus.png` (piltangent i segmentet: fokusring ur systemet, valet byts).

## Självgranskning

1. Femåring? Första utkastet hade kortet 924 px brett (spaltens padding åt 56 px) och "grön / teknik-avdrag"
   bröts fel i gt-rubriken. Rättat: kortet är 980, "grön teknik" hålls ihop med hårt mellanslag så
   rubriken bryter "Räkna ut ditt / grön teknik-avdrag". På mobil ärvde de tomma 1fr-raderna femårsradens
   höjd och sköt ner talet 47 px; rättat med flex-kolumn på mobil (talet står nu stilla på 541,7).
2. Spacing: tabellen ovan. Allt ur `--ampy-space-*`; enda egna värdet är kortets vertikala padding 32 px
   (skalan har 28 eller 39,6 vid 1440; 32 är briefens golv).
3. Fyra tillstånd renderade, se listan.
4. Mot LED-kalkylatorn: samma spår/pill-segment (48/40), samma etikett-över-kontroll-rytm, samma
   hero-tal med mindre enhet, samma kort-på-ljus-yta med hårlinje, men utan mörkt resultatkort (ägarens
   krav). Mot Hero-1: samma Outfit-vikter (500 rubrik, 700 tal) och samma tysta ytor. Nivån håller.

## Öppet / kunde inte lösas

- **Korthöjd desktop 475 px mot briefens 460.** Med H2:n inne i kortet och briefens egna rytmgolv
  (padding 32, fråga -> fråga 28, underrad -> kontroll 12 till 14) blir minsta möjliga ca 466 px; 460 nås
  bara om H2:n flyttas ut ovanför kortet (som LED-kalkylatorn) eller frågeavståndet krymps till 24. Jag
  valde rytmen. Om 460 är hårt: `--rk-gap-q: 24px` ger 467, H2 ovanför kortet ger ca 412.
- Grön teknik-rubriken är 32 tecken och bryter på två rader i 36 px (kortet 519 px desktop, 652 mobil).
  Den ryms inte på en rad i en 55-procentsspalt oavsett.
- Fråga 2 (fem år) visas även i `?m=gt` fast den inte påverkar grön teknik (innehållet är låst till
  samma tre frågor; `rakna.js` ignorerar den i gt). Ägarfråga om den ska döljas i gt-läget.
- Bocken (grön) är medvetet utelämnad: talbytet "upp till 50 000" -> "ca 12 000" är beskedet, en ikon till
  bredvid talet gör det inte tydligare.
- Sidan renderas på vit bakgrund (artikelmallens brödyta), inte systemets sky mist, så panelen syns som
  panel. I Bricks-artikeln blir det samma sak.
- `impeccable`-hooken flaggar `border-left: 1px solid var(--ampy-line)` på panelen som "side-tab accent":
  falskt positivt, det är hårlinjen mellan spalterna, inte en färgad kant.
- 180 000 kr lön ger "ca 12 000 kr" (skatteutrymmet är litet vid låg lön); det är `rakna.js`, inte
  designen. Briefens exempel "ca 31 000 kr" motsvarar ungefär 300 000 kr.
