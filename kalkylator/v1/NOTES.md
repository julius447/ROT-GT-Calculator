# v1 "Två spalter": anteckningar

Filer: `index.html` (`?m=rot` default, `?m=gt`), `style.css`, `app.js` (importerar `../rakna.js`), `_probe.mjs`
(tillståndsprob + fixrundans 71 krav, skriver `skarmdumpar/*.png` + `skarmdumpar/probe.json`, avslutar med kod 1
om ett krav faller).
Render: `node tools/shot.mjs kalkylator/v1/index.html _shots/v1 --query "?m=rot"` och `... _shots/v1-gt --query "?m=gt"`
ger `errors: []`, `overflowX: false` på 1440 och 390 (körda 2026-09-14 efter fixrundan). `node kalkylator/v1/_probe.mjs`
ger 71/71 krav OK.

## Idén

Artikelns H2 (`.ampy-h2`, 36/500) står ovanför kortet med `--ampy-space-stack-lg` (39,6) emellan, som
LED-kalkylatorn. Under den ett vitt kort (`.ampy-card`, hårlinje + kortskugga) som fyller artikelspalten (980 px)
och delas 55/45. Vänster: tre frågor staplade, etikett över kontroll, luft i stället för ramar. Höger: beskedet på
en sky mist-panel (`--ampy-bg-subtle`) som går ända ut till kortets kant, skild från frågorna av en enda hårlinje
(`--ampy-line`), innehållet vertikalt centrerat: etikett i versaler, talet som hero (Outfit 700, tabulära siffror,
midnight), "upp till"/"ca" och "kr" i halva talets storlek (28/22) i dämpad 500 bredvid (samma grepp som
LED-kalkylatorns "kr/år"), "Per person och år." dämpad under. Ingen midnattsyta någonstans; teal är enda accenten
(vald text i segmenten, `--ampy-action-strong`). Demo-sidan är vit som artikelmallen; kortet bär hårlinje +
systemskugga så det läses som kort på vitt.

Panelen är tre rader (luft / huvud / luft): huvudbeskedet ligger alltid mitt i panelen och flyttar sig inte när
femårsraden dyker upp; raden får plats i den nedre luften bakom en hårlinje.

Stoppläget: talet, underraden och femårsraden döljs; en 44 px cirkel i `--ampy-error-ink` med vitt kryss
(inline-SVG, stroke 1,75, rund ände) och beskedet ur `rakna.js` i `--ampy-ink` 18/500 på SAMMA rad, mitt för
varandra. Stoppblocket har talblockets höjd (`--rk-huvud-h` = tal + luft + "Per person och år." = 88,3 / 74,7) och
samma avstånd från etiketten, så etikett, panel och kort står stilla när talet byts mot X + besked. Ja igen tar
talet tillbaka. Talet byts med en 200 ms intoning (aldrig count-up, aldrig på första renderingen); base.css nollar
den vid reduced motion (uppmätt 1e-06 s).

`?m=gt`: rubrik, etikett och stoppbesked i grön teknik-strängarna; femårsfrågan visas inte (den påverkar bara ROT;
`.rk[data-mode="gt"] .rk__fraga--aldre { display: none }`). "grön teknik-avdrag" ligger i en `span.rk__ihop` med
`white-space: nowrap` i H2 och stoppbesked (textContent oförändrad, varken mellanslaget eller bindestrecket bryter);
etiketten (inline-flex) använder hårt mellanslag.

Inmatning: beloppet formateras med mellanslag på varje tangent, men beskedet räknas om först 500 ms efter sista
tangenten, direkt vid `change`/blur och vid Enter/"Klar" (`submit` -> `preventDefault` + blur, ingen omladdning).
DOM:en skrivs bara när en text faktiskt ändrats, så live-regionerna (`aria-live` på talraden, stoppblocket och
femårsraden, inte på etiketten) muterar exakt en gång per verklig ändring.

Mobil (390): en spalt, frågorna först, panelen som fullbreddsblock i kortets botten bakom en hårlinje uppåt.
Segment och fält går på hela bredden, inkomstraden staplas, talet 44 px. På touch (`pointer: coarse`) är spårets
kant 2 px och alternativet 44 px högt i det 48 px höga spåret.

## Uppmätt efter fixrundan (Playwright `getBoundingClientRect`, `skarmdumpar/probe.json`)

Desktop 1440, kortet 980 x 427,6 px (55/45: frågor 538, panel 440), gt 312,6:

| Mått | px | Brief |
|---|---|---|
| H2 -> kort | 39,6 (`--ampy-space-stack-lg`) | rubrik -> block |
| kortkant -> fråga 1 | 40,6 (39,6 + 1 kant, `--ampy-space-l`) | 32 till 40 |
| fråga -> underrad | 7 (`--ampy-space-3xs`) | 6 till 8 |
| underrad -> kontroll | 14 (`max(12px, --ampy-space-xs)`) | 12 till 14 |
| fråga (etikett) -> kontroll | 14 | 12 till 14 |
| kontroll -> nästa fråga | 28 (`--ampy-space-m`) | 28 till 40 |
| sista kontroll -> kortkant | 40,6 | 32 till 40 |
| panel: etikett -> tal | 14, tal -> "Per person" 9,9 | |
| panel: etikett -> stoppblock | 14 (samma som talraden), stoppblock 88,3 hög = talblocket | |

Typografi: H2 36/500/lh 43,2 (`.ampy-h2`); frågor 20/500/lh 25; underrad 16/400 dämpad; etikett 12/600 versaler
spärrning 1,68 px (inget streck); prefix "upp till"/"ca" 28/500 dämpad = enhet "kr" 28/500 dämpad (halva talet);
tal 56/700 tabular-nums; "Per person och år." 16/400 dämpad; femårsraden 16/400; stoppbesked 18/500/lh 24,3 i
`--ampy-ink`; segment 16 (vald 600 teal-deep, ovald 500 dämpad); belopp 18/500.

Kontroller: segmentspår 188 x 48, varje val 88 x 40 (4 px spår runt, som LED-kalkylatorn); Lön/Pension-spåret är
188 både med Lön och med Pension vald ("Pension" i 600 + padding = 84,3 < 88, så viktbytet flyttar ingenting);
beloppsfält 257 x 48 med "kr" som suffix inne i fältet.

Mobil 390 (touch), kortet 356 x 590,5 px i utgångsläget (tak 640), gt 477,5: H2 -> kort 21,5, kortpadding 21,5
(+1 kant), fråga -> underrad 6,6, underrad -> kontroll 12, fråga -> kontroll 12, fråga -> fråga 28; segment 311 x 48
(val 152 x 44, spårkant 2 px), fält 311 x 48; tal 44, prefix/enhet 22, stoppbesked 18, femårsraden 16;
etikett -> tal 10,5, tal -> per 8,3. Stoppläget: kortet +-0 (stoppblock min-höjd 74,7, texten tre rader 72,9).
Femårsraden: kortet +72,5 (raden bryter på två rader vid 16 px; talet står stilla, växten ligger under talet).

Kontrast (alla >= 4,5:1, oförändrat): dämpad text `#565e82` på sky mist 5,99:1, teal-deep på vit 5,27:1, vitt kryss
på `--ampy-error-ink` 10,7:1, placeholder `#6a7190` 4,8:1, midnight på sky mist 18:1.

## Tillstånden (PNG i `skarmdumpar/`, klippta från rubriken till kortets nederkant)

1. Utgångsläge: `desktop-1-utgangslage.png`, `mobile-1-utgangslage.png` ("upp till 50 000 kr").
2. Nej på ägande: `desktop-2-ager-nej.png`, `mobile-2-ager-nej.png` (rött X + besked på en rad, talet borta;
   etikett 0 px, huvud 0 px / 0 px, kort 0 px; Ja igen ger talet tillbaka på samma plats, `agerJaIgen`).
3. Nej på fem år: `desktop-3-femar-nej.png`, `mobile-3-femar-nej.png` ("Yngre än fem år: ROT gäller bara
   reparationer." bakom hårlinje, talet 0 px; desktop kort 0 px).
4. 180 000 kr lön: `desktop-4-lon-180000.png`, `mobile-4-lon-180000.png` (ca 12 000 kr; 0 mutationer medan hon
   skriver, 1 efter fördröjningen).
5. Pension 240 000: `desktop-5-pension-240000.png`, `mobile-5-pension-240000.png` (ca 38 000 kr). Tillbaka till
   lön + 600 000 ger 50 000 kr utan prefix, tomt fält + blur ger "upp till 50 000 kr" direkt.
6. gt: `desktop-6-gt-utgangslage.png`, `mobile-6-gt-utgangslage.png` (två frågor), `desktop-7-gt-ager-nej.png`,
   `mobile-7-gt-ager-nej.png` (grön teknik-strängarna, "grön teknik-avdrag" ihop).
7. `*-8-tangentbordsfokus.png` (piltangent i segmentet: fokusring ur systemet, valet byts).

## Fixrunda 2026-09-14 (R1-ux.md v1 punkt 1 till 14, R2-design.md v1 punkt 1 till 10, orkestreringens beslut a till i)

Konfliktregel: R2 vinner på layout/typografi, R1 på tillstånd/a11y. En konflikt fanns (R2-8 mot R1-G6), se nedan.

### R1 (UX)

| # | Punkt | Status | Vad |
|---|---|---|---|
| 1 | submit -> preventDefault + blur | Klar | `app.js`: `form.addEventListener('submit', ...)`. Enter/Klar: `sidanLaddadesOm: false`, beloppet kvar, gt-läget kvar (desktop + mobil). |
| 2 | Fördröjd rendering 500 ms, direkt på change | Klar | 500 ms efter sista `input`, direkt på `change` OCH `blur` (beslut c). "ca 0" syns aldrig: 0 mutationer under skrivning, talet står på 50 000 tills "ca 12 000 kr". |
| 3 | Skriv bara när texten ändrats | Klar | `skriv()`/`gom()` jämför före varje skrivning (text + hidden + data-status). |
| 4 | aria-live från `#rk-resultat` till talrad + stopp | Klar | `aria-live="polite" aria-atomic="true"` på `#rk-talrad` och `#rk-stopp`, dessutom `aria-live="polite"` på femårsraden `#rk-not`. Etiketten ligger utanför. Stoppblocket visas först, texten skrivs sedan (uppläsning). Tillbaka från stopp skrivs talet om (uppläsning av att det är tillbaka). Uppmätt: 1 batch per verklig ändring, även med attribut i observatören. |
| 5 | prefix + enhet `--ampy-text-mid` | Klar, R2:s variant | `--ampy-text-mid` är 21 vid 1440 (R2-2); i stället `--rk-text-enhet: calc(tal * .5)` = 28/22, samma vikt 500, samma spärrning (beslut g). |
| 6 | `pointer: coarse`: spår 2 px, alternativ 44 | Klar | Uppmätt på touch-sidan: spår 48, alternativ 44, spårkant 2; tryck 2 px in i spåret väljer Nej. |
| 7 | `--rk-text-tal: 44px` mobil | Klar | 44 (prefix/enhet 22). |
| 8 | femårsraden 16 px | Klar | `--rk-text-under`; 16 på båda skärmar. Pris: raden bryter på två rader på mobil, kortet växer 72,5 i det läget (R1-7 "acceptera, det är under kortet"; att reservera raden hade lagt 48 px tom luft i utgångsläget och sprängt 640). |
| 9 | stopptext 18 px | Klar | `--rk-text-stopp: 18px`, båda skärmar. |
| 10 | X + text på en rad, stoppblock i talblockets höjd, `skiftEyebrow.dy: 0` | Klar | `.rk__stopp { display:flex; align-items:center; gap: s; margin-top: xs; min-height: var(--rk-huvud-h) }`. Etikett 0 px, huvud 0/0, kort 0 på desktop OCH mobil (beslut h). |
| 11 | ta bort `ampy-eyebrow--dash` | Klar | Inget streck. |
| 12 | `id="rk-under-1"` + `aria-describedby` på båda radioknapparna | Klar | |
| 13 | Ägarbeslut: dölj fråga 2 i gt | Klar (beslut a) | `.rk[data-mode="gt"] .rk__fraga--aldre { display: none }`; gt visar två frågor, Tab går Ja -> Lön -> fältet. |
| 14 | Kör om shot + prob | Klar | shot rot/gt: `errors: []`, `overflowX: false`. Proben: 71/71. |

### R2 (design)

| # | Punkt | Status | Vad |
|---|---|---|---|
| 1 | H2 ut ur kortet, första barn i `main` | Klar (beslut f) | Kortet 427,6 (rot) / 312,6 (gt) på desktop, 590,5 / 477,5 på mobil. gt-rubriken på en rad i 980. |
| 2 | `.rk__rubrik { margin: 0 0 stack-lg }`, bort med `--rk-gap-h2` | Klar | H2 -> kort 39,6 / 21,5. |
| 3 | `--rk-text-enhet: calc(tal * .5)` på prefix och enhet, 500, lh 1, ls -0,01em, dämpad | Klar | 28/28 desktop, 22/22 mobil, samma baslinje som talet. |
| 4 | `.rk__stopp` rad, center, gap s; stopptext 18/500/1,35 ink | Klar | R2 föreslog `margin-top: s`; R1 punkt 10 och beslut h kräver 0 px skift, så `margin-top: xs` (= talradens). Texten 18/500/lh 24,3. |
| 5 | Mobil: `.rk__huvud { min-height: ... }` | Klar, annan väg | Samma effekt via `min-height` på stoppblocket (= talblockets höjd): kortet +-0 i stoppläget på mobil, texten (72,9) ryms i 74,7. |
| 6 | Mobil `--rk-gap-q: clamp(28px, l, 40px)`, `--rk-gap-ctl: max(12px, xs)` | Klar | fråga -> fråga 28, underrad/fråga -> kontroll 12 (mobil), 14 (desktop). |
| 7 | femårsraden `--rk-text-under` | Klar | Se R1-8. |
| 8 | Segment 600 på båda (inget vikthopp) | INTE gjort, R1 vinner | R1-G6 vill ha vikt + färg + yta som valt-signal för en 55-åring (tillstånd/a11y). Kvar: vald 600, ovald 500. R2:s underliggande hantverksproblem (bredden byter när vikten byter) är löst på annat sätt: "Pension" i 600 + padding är 84,3 < min-width 88, uppmätt spår 188 -> 188 vid byte Lön/Pension. |
| 9 | ta bort `ampy-eyebrow--dash` | Klar | |
| 10 | Kör prob + shot: kort <= 460 / <= 640, stopp +-0 mobil, prefix = enhet = 28 | Klar | 427,6 / 312,6 / 590,5 / 477,5; 0 px; 28 = 28. |

### Orkestreringens beslut a till i

a) fråga 2 dold i gt: klar. b) demo-sidan vit (`--ampy-bg-surface`), kortet med hårlinje + `--ampy-shadow-card`,
panelen sky mist: klar (oförändrat från v1, verifierat). c) 500 ms debounce, direkt på change/blur, skriv bara vid
ändring: klar. d) submit -> preventDefault: klar. e) 44 px på coarse pointer: klar. f) H2 ovanför kortet med
`--ampy-space-stack-lg`: klar. g) prefix/enhet 28 vid 56, 500, dämpad: klar. h) X + mening på en rad, centrerade,
talblockets höjd: klar, 0 px skift på båda skärmar. i) "grön teknik" obrytbar i H2 och stoppmening: klar
(`span.rk__ihop`, nowrap; H2 på mobil bryter "Räkna ut ditt / grön teknik-avdrag").

### Övrigt ur fixrundan

- Kortpaddingen är nu `--ampy-space-l` (39,6 / 21,5) på alla sidor i stället för det egna värdet 32 px: med H2:n
  utflyttad finns höjden, och 39,6 ligger i briefens 32 till 40 (mobil 21,5 i 20 till 24).
- `impeccable`-hooken flaggar `border-left: 1px solid var(--ampy-line)` (panelens hårlinje, rad 90) och fältets
  `padding-right` (plats för kr-suffixet, rad 76) som "side-tab": falskt positivt båda (R2 säger detsamma om
  hårlinjen: "en avdelare, inte en sidoflik"). Inte ändrat.
- Proben kör mobilen med `hasTouch` + `isMobile` (då gäller `pointer: coarse`, som på en telefon).
  `tools/shot.mjs` kör 390 utan touch, så där är alternativen 40 px i 48-spåret (fin pekare); båda är riktiga lägen.

## Självgranskning

1. Femåring? Desktop: rubriken står i artikelflödet med 39,6 luft, kortet är kort och luftigt (427), talraden
   läses som en enhet ("upp till 50 000 kr" i 28/56/28 på samma baslinje), stoppläget är ett besked på en rad.
   Mobil: alla kontroller fullbredd, 44 px tryckyta, talet 44, ingenting hoppar när hon trycker Nej.
2. Spacing: tabellen ovan, allt inom briefens intervall, allt ur `--ampy-space-*` (enda egna: `max(12px, xs)` som
   golv på mobil, `clamp(28px, l, 40px)` som golv på mobil, textstorlekar 20/16/18 och min-width 88 som briefen anger).
3. Fyra tillstånd + gt renderade, se listan; 71 krav mätta i proben.
4. Mot LED-kalkylatorn: samma rubrik-i-flödet med 40 under, samma spår/pill-segment (48/40, 44 på touch), samma
   hero-tal med enhet i halva storleken på baslinjen, samma kort-på-ljus-yta med hårlinje, men utan mörkt
   resultatkort (ägarens krav). Mot Hero-1: samma Outfit-vikter (500 rubrik, 700 tal) och tysta ytor.

## Öppet / kunde inte lösas

- Femårsraden på mobil bryter på två rader (16 px i 313 px) och kortet växer 72,5 px i det läget; talet står
  stilla. Att reservera raden hade kostat 48 px tom luft i utgångsläget. Ägarfråga om raden får vara 14 px på mobil
  (då ryms den nästan på en rad) eller om växten accepteras (R1: "acceptera").
- Femårsfrågan är dold i gt (beslut a). Om innehållet "samma tre frågor" var tänkt bokstavligt även i gt, ta bort
  CSS-regeln `.rk[data-mode="gt"] .rk__fraga--aldre`.
- 180 000 kr lön ger "ca 12 000 kr" (skatteutrymmet är litet vid låg lön); det är `rakna.js`, inte designen.
  Briefens exempel "ca 31 000 kr" motsvarar ungefär 300 000 kr. R1-G1(b): `belopp === 0` -> "0 kr" utan "ca" är en
  ägarfråga till `rakna.js`.
- Segmentens vikt (600 vald / 500 ovald) avviker från systemets 600/600 (R2-8); ägarfråga om systemet ska ändras
  eller versionen följa det.

## Hushåll, redan använt avdrag och 18-årsfrågan (ägarbeslut 2026-09-14, efter att riktning 1 valdes)

Julius valde riktning 1 och beställde tre tillägg. Byggt direkt i v1 på samma designsystem, samma rytm.

1. **"ROT du redan använt i år"** (grön teknik: "Grön teknik du redan använt i år"): en rad under inkomsten, etiketten
   till vänster och ett 150 px-fält i höger kant, i linje med inkomstfältet (bankblankettens mönster; på mobil etikett
   ovanför fullbreddsfält). Tomt = 0. Logik i `rakna.js` `beraknaHushall()`: personens rest = max(0, min(50 000,
   skatteutrymme) − använt). Utan inkomst: "upp till 30 000 kr" vid 20 000 använt. Allt använt: "0 kr" och raden
   "Du har redan använt hela årets ROT-avdrag." (ni-form vid flera personer).
2. **Fler personer:** "+ Lägg till en person" (systemets `.ampy-link`, 16 px) under sista raden. Varje ny person får
   Lön/Pension + inkomst + "ROT använt i år"; ägande, fem år och 18 år antas gälla (ägarens ord: "vi kan ta det för
   givet att de bor på bostaden"). Från två personer visas eyebrow "Person 1", "Person 2" (+ "Ta bort") och en
   hårlinje mellan blocken; etiketten blir "Ert ROT-avdrag 2026" och underraden "Ni två tillsammans, per år."
   Högst fyra personer (`MAX_PERSONER`); länken försvinner vid fyra och kommer tillbaka vid Ta bort. Numrering och
   fokus hanteras (ny person: fokus i nya inkomstfältet; Ta bort: fokus på länken). Summan: "upp till" så snart någon
   saknar inkomst, "ca" så snart någon är räknad under taket, annars exakt (600 000 lön + 240 000 pension = ca 88 000).
3. **"Har du fyllt 18 år?"** Ja/Nej, förinställt Ja, som tredje fråga. Nej ger rött X + "Du behöver ha fyllt 18 år
   senast vid årets slut för att få ROT-avdrag." (Skatteverket: "fyllt 18 år senast vid årets slut", research/02 S3).
   Ordval: "fyllt 18" i stället för ägarens "över 18" eftersom 18-åringen räknas med.

Prövat och förkastat: fem år + 18 år sida vid sida i vänsterspalten (etiketterna kräver 578 px, spalten har 509:
frågan bröt på två rader och segmenten hamnade i otakt). En fråga per rad behölls.

Mått efter tillägget (probe.json, 96/96 krav): desktop kort 682 (gt 567), mobil 877 (gt 764); två personer 952 /
1 232. Talet står stilla i alla tillstånd på desktop; på mobil ligger panelen under frågorna som förut.
Playwright-artefakt dokumenterad i `_probe.mjs bild()`: en fullPage-skärmdump av en sida högre än viewporten släpper
`pointer: coarse` i mobilemuleringen, återställs via CDP (annars mäts 40 px alternativ i stället för 44).

Öppet för ägaren: mobilen kräver scroll för att se talet efter fem frågor (en fast resultatrad nederst på mobil är
nästa steg om det stör); "Ta bort"-länken är 22 px hög på fin pekare (44 px på touch); hushållets "redan använt"
frågas per person eftersom taket är per person.
