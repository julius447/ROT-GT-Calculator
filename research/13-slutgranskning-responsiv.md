# 13. Slutgranskning: responsivt och enheter (Avdragskollen)

Datum: 2026-09-20. Granskare: Claude (Opus), ensam agent, inga underagenter. Uppdrag: sista responsiv-/enhets-QA före lansering.
Inga källfiler ändrade. Allt nedan är mätt, inte tyckt: harness, rådata och skärmdumpar ligger i `research/underlag/enheter/`.

Mätt version (sha1, första 12 tecken): `kalkylator/v1/index.html` 6b1e967c75a9, `style.css` 1f5d6d4b7031,
`app.js` 786697dde6bd, `kalkylator/rakna.js` 696d52347d38, `kalkylator/artikel/artikel.css` 5209511c0426,
`bas-inbaddad.css` 1bb543010a07. Det är commit `a5fb45c` (2026-09-20 22:34). Artikelklonen lästes in som f9c81416c3f3
(16/9-versionen) med aktuell v1-markup insatt (samma steg som `tools/artikel-klon.py` gör); klonen regenererades av en parallell
körning till `786a0160d7e7` under mätningen, samma markup, så resultatet gäller den också.

## 1. Verdict

| Yta | Besked | Villkor |
|---|---|---|
| Fristående `kalkylator/v1/` (`?m=rot`, `?m=gt`) | **GO med två patchar** | P4 (bindestreck och ändelse hålls ihop, Major) och P5 (trevägsvalet på 320-telefoner, Major). P9 är ägarval. |
| Artikel överst (`?p=topp`) | **GO med fyra patchar** | P2 (värdsidans p-reset, Major), P4, P5, P6 (talstorlek i två spalter, Major). P7 är Minor. |
| Artikel höger (`?p=hoger`) | **NO-GO under 1260 px** (Blocker) | Spalten är 217 till 355 px mellan 781 och 1260 px och kalkylatorn ryms inte. Fungerar först från 1260 px, designbredden 384 px nås vid 1361 px. P1 eller välj `?p=topp`. |

Blockerare: 1 (högerspalten). Major: 5 (P2, P4, P5, P6 plus förhandsvisningen som ruttnar med FlyingPress, se M5). Minor: 4. Allt som passerade står i avsnitt 3 med siffror.
Ett Major-fynd ur första körningen (fältens fokusring försvann i artikeln) rättades av den parallella körningen i `a5fb45c` (artikel.css) och
är verifierat löst i körning 2: 0 av 104 artikelmätningar utan ring.

## 2. Metod

**Harness.** `tools/enhetsmatris.mjs` (Playwright 1.62.1). Statisk server på repo-roten. Artikelklonen laddar Bricks-CSS från ampy.se, och fem av de
URL:erna svarar 404 sedan FlyingPress bytte hashar (klonen är från 15/9): harnessen dirigerar om dem till dagens hashar (hämtade ur live-sidan) och cachar
alla ampy.se-tillgångar i minnet så alla motorer får samma sida. Klonens markup var inaktuell mot v1 vid körningens start, så harnessen satte in
aktuell H2 + section virtuellt. `tools/enhetsmatris-rapport.mjs` gör JSON till tabellerna nedan, `tools/enhetsmatris-fynd.mjs` tar fyndbilderna och
montaget, `tools/enhetsmatris-patchtest.mjs` verifierar patchförslagen genom att injicera dem med `addStyleTag` (källfilerna orörda).

**Motorer.** Chromium 151.0.7922.34, WebKit 26.5 (Safari-motorn, installerad med `npx playwright install webkit`), Firefox 153.0 (installerad likadant).
iPhone och iPad kördes i WebKit, Pixel och Galaxy i Chromium, enligt Playwrights enhetsprofiler. Två körningar: körning 1 (22:03) träffades av att
källfilerna ändrades 22:11 av en parallell agent, så hela matrisen kördes om (körning 2, 22:34 till 22:55) på den version som står ovan. Rapporten bygger
på körning 2.

**Enheter (26).** iPhone SE (320×568) stående och liggande, iPhone 12, iPhone 12 i mörkt läge, iPhone 14 Pro Max stående och liggande, iPhone 15, Pixel 5, Pixel 7,
Galaxy S8, Galaxy S9+, iPad Mini, iPad (gen 7), iPad Pro 11 stående och liggande, desktop 1024×768, 1280×800, 1366×768, 1440×900, 1440×900 i mörkt läge,
1920×1080, smal 320×568 och 360×640 (Chromium touch), Safari desktop 1440 (WebKit), Firefox 1440, Firefox 390×844 touch.

**Sidor (6) × tillstånd (9).** Fristående `?m=rot` och `?m=gt`; artikel `?p=topp` och `?p=hoger`, båda i rot och gt. Per sida: standard; Nej på ägande (stopp);
tillbaka till Ja; Under 18 (stopp); Över 65 + Lön 300 000 (0 kr + not); typ Båda med Varav pension 100 000; två personer; 1 200 000 i fältet; fyra personer
med tomma inkomster ("upp till 200 000 kr"). Därtill per sida: Enter i fältet, Tab-fokus (WebKit även Alt+Tab), "Ta bort", och i artikeln tre scrollägen
för fasta element. 156 sidladdningar, 1 404 tillståndsmätningar.

**Per tillstånd mättes:** `scrollWidth > clientWidth` på dokumentet och vad som orsakar det; varje synligt element i kortet mot kortets kant; textklipp
(`scrollWidth > clientWidth`) på etiketter, val, tal, disclaimer, not, länkar; talraden (bryts "kr" ensamt, bryts "upp till" ovanför talet, sticker talparet ut ur
panelen); tryckytor (val, "Lägg till en person", "Ta bort", fälten) på touch-profiler; fältens fontstorlek; disclaimerns och notens storlek och kontrast;
kolumnantal mot behållarbredd (två spalter om och bara om ≥ 720 px); "grön teknik-avdrag" och "ROT-avdrag" via `Range` över textnoderna (bryts frasen, hamnar
ändelsen "-et" ensam); panelens och etikettens läge före och efter stoppläget; fasta och klistrade element som täcker kortet; färger och kontrast i mörkt läge.

**Begränsningar.** Emulering, inte riktiga telefoner: WebKit på macOS är Safari-motorn men inte iOS Safari (tangentbord, zoom vid fokus och adressfältets
höjd är inte testade). Chromiums emulering av `pointer: coarse` flappade mellan sidor (83 av 972 touch-mätningar hade coarse = false), så 44-px-regeln
kunde bara mätas när den matchade (då 485 av 485 "Ta bort" ≥ 44 px). `@supports not (container-type)`-reserven (Safari < 16) kan inte testas i moderna motorer.
Firefox räknar två `load`-händelser vid Enter i Playwright; ingen omladdning skedde (fältet behöll "180 000" och beskedet räknades om), så det är en harness-egenhet.

## 3. Kontroller som passerade (siffror ur körning 2)

| Kontroll | Resultat |
|---|---|
| Horisontellt överflöde orsakat av kalkylatorn | 23 av 1 404 tillstånd, alla i `?p=hoger` på 810 till 834 px (Blocker B1). Fristående och `?p=topp`: 0. Klonens värdsida scrollar i sidled av egen orsak från 810 px (live-sajten har `overflow-x: hidden` på html och body, klonen saknar det); inte kalkylatorns fel. |
| "kr" ensamt på sista raden | 0 av 1 404. `.rk__talpar` (nowrap) håller. "upp till" ovanför talet är den designade reserven och inträffar på 320-telefoner, i de smala spalterna och i två spalter vid 720 till 781 px behållare (Major M4). |
| Textklipp | Bara i `?p=hoger` under 1260 px (stopptexten i gt-läget 154 > 110 px, valet "Under 18" i fetstil 90 > 88 px vid 335 px spalt). Fristående och `?p=topp`: 0. |
| Tryckytor på touch | WebKit (11 profiler) och Firefox touch: minsta yta 44 px i alla 1 404 mätningar (val 44, "Lägg till en person" 44, "Ta bort" 44, fält 48). Chromium: 44 när `pointer: coarse` matchade (se begränsningar); vid fin pekare är "Ta bort" 22 px enligt design. |
| Fältens fontstorlek | Textfälten 18 px (`--rk-text-siffror`), inget fält under 16 px: iOS zoomar inte in. |
| Disclaimer och noter | Disclaimer 14 px, kontrast 5,99:1 på panelen; "Per person och år." 16 px 5,99:1; underrader 16 px 6,33:1; noten 16 px 17,98:1. Etiketten 12 px versaler enligt designsystemets eyebrow-token, 5,99:1. Ovalt val 5,46:1 på spåret, valt 5,27:1. |
| Två spalter vid rätt bredd | 0 fel i 1 404 mätningar. Svep 700 till 800 px: fristående byter till två spalter vid fönster 764 px (behållare 720,9 px), en spalt vid 719 px, inget mellanläge, inget överflöde. Artikel `?p=topp`: 65 %-spalten når 720 px vid fönster ≈ 1 185 px (727 px vid 1194, 621 px vid 1024); `?p=hoger` är alltid staplad (max 384 px). |
| Enter i fältet | 156 av 156: `location.href` oförändrad, fältet behåller "180 000", beskedet "ca 12 000 kr". Ingen omladdning i någon motor. |
| Fokusringar (tangentbord) | Chromium och Firefox: Tab når radioknapparna (det valda i varje grupp), fälten och "Lägg till en person". Ringar: valen 3 px teal-deep-ring (`--ampy-focus-ring`), fälten teal-deep-kant + ring, knappen 2 px navy-kontur. WebKit: Tab når bara textfälten (Safari-standard), Alt+Tab når allt med samma ringar. I artikeln nu identiskt med fristående (rättat i `a5fb45c`). |
| Stoppläget flyttar inte panelen | Fristående: etikett och panel 0 px i 22 av 26 profiler. Undantag 320-telefoner (kortet blir 11,4 px kortare eftersom talraden är på två rader) och iPad Mini gt (stopptexten på fyra rader i 325 px panel: etiketten 10 px upp). Artikeln: kortet 8,2 till 9,1 px högre på telefoner och surfplattor och etiketten 4,9 px flyttad i två spalter (1366 till 1920), orsakat av M1; på 320-telefoner −3,2 px (M1 och m3 tar delvis ut varandra); 1194 och 1280 i två spalter +3,3 respektive +9 px (M4). |
| "grön teknik-avdrag" bryts aldrig vid bindestrecket | `.rk__ihop`-spännen: 0 brutna av alla mätningar. Men ändelsen efter spannet kan hamna ensam ("grön teknik-avdrag" / "et från."): 3 träffar, och "ROT-avdrag" saknar skydd helt: 82 träffar. Se M2. |
| Fasta element i artikeln | Bara sidhuvudet (sticky, 66 px) täcker kortet när det scrollar under, som allt annat innehåll. Innehållsförteckningens kort (sticky top 8rem) täckte aldrig kalkylatorn i något av tre scrollägen (0 träffar). Förhandsvisningsraden nederst (74 px på telefon) finns bara i klonen. Live-sajten har dessutom cookie-rutan vid första besöket och ingen sticky call-bar på artikelsidan (kontrollerat i live-HTML 2026-09-20). |
| Mörkt läge | `prefers-color-scheme: dark` på iPhone 12 och desktop 1440: skärmdumparna är byte-identiska med ljust läge (`cmp`). Verktyget har ingen dark-regel, ingen `color-scheme`, fälten förblir vita, talet 17,98:1. Inget försvinner. |
| Konsolfel | 0 i 156 sidladdningar, alla tre motorer. |
| Fältet med 1 200 000 | Formateras "1 200 000", ryms i fältet på alla 26 profiler (inget fältklipp), "kr"-suffixet fritt. |

## 4. Defekter

Rankade. Varje rad: var det syns, bevis, rotorsak, patch. Patcharna P2, P5, P6, P7 och P9 är verifierade med `tools/enhetsmatris-patchtest.mjs`
(`research/underlag/enheter/patchtest.json`): siffrorna "före/efter" nedan kommer därifrån. P1 och P4 är skrivna men inte körda (P1 rör värdmallen, P4 är JS).

### B1 Blocker: `?p=hoger` under 1260 px

Högerspalten är 30 % av artikelraden. Mellan 781 px (mallens staplingsgräns) och 1260 px är den 217 till 355 px bred. Kalkylatorn kräver minst ≈ 313 px för
valen och ≈ 355 px för talraden. Svep i Chromium (`research/underlag/enheter/svep-hoger.json`), fönsterbredd mot spalt:

| Fönster (px) | Spalt (px) | Val utanför kortet (px) | Tal utanför panelen (px) | "upp till" på egen rad |
|---|---|---|---|---|
| 781 | 217 | +89.8 | +30.5 | ja |
| 811 | 225 | +81.8 | +23.2 | ja |
| 901 | 251 | +57.7 | +1.1 | ja |
| 911 | 254 | +55.0 | -1.3 | ja |
| 1101 | 309 | +4.2 | -47.9 | ja |
| 1121 | 314 | -1.1 | -52.8 | ja |
| 1141 | 320 | -6.5 | -57.7 | ja |
| 1241 | 349 | -33.2 | -82.2 | ja |
| 1261 | 355 | -38.5 | -2.6 | nej |
| 1281 | 361 | -43.9 | -7.5 | nej |
| 1361 | 384 | -44.6 | -31.0 | nej |

Träffade i matrisen: iPhone 14 Pro Max liggande (814 px), iPad (gen 7) 810, iPad Pro 11 stående 834 (sidscroll orsakad av kortet, "Över 65" och "Båda" 33 till 50 px
utanför kortet, talet 22 till 53 px utanför panelen, stopptexten klippt i gt), desktop 1024 (val 25 px utanför, etiketten bryter "ROT-" / "AVDRAG"),
iPad Pro 11 liggande 1194 (spalt 335 px: "upp till" ovanför talet i standardläget, "Under 18" ellipsad i fetstil) och desktop 1280 (spalt 360 px: två rader bara för summor från 100 000 kr). Bilder: `fynd/F1-ipad-gen7-hoger-segment-utanfor.jpg`,
`fynd/F5-desktop-1024-hoger-smal-spalt.jpg`, `artikel-ipad-gen7-hoger-rot.jpg`, `artikel-ipad-pro-11-hoger-rot.jpg`, `artikel-desktop-1024-hoger-rot.jpg`.

Patch P1 (`kalkylator/artikel/artikel.css`), om högerplaceringen ska behållas: stapla som mallen gör vid 780 men redan under 1260, kalkylatorn först.
Raden är `#brxe-meojam` (flex, `column-reverse` vid ≤ 780 i post-56073.css), artikelspalten `#brxe-pfbtud` (65 %), kolumnen `#ampy-hoger` (30 %).

```css
/* Högerspalten är för smal för kalkylatorn under 1260 px (mätt 2026-09-20: valen utanför kortet < 1121 px,
   "upp till 50 000 kr" på två rader < 1261 px, designbredden 384 px först vid 1361 px). Under 1260 staplas
   kolumnerna som mallen gör vid 780, kalkylatorn först. */
@media (max-width: 1259px) {
  [data-plats="hoger"] #brxe-meojam { flex-direction: column-reverse; }
  [data-plats="hoger"] #brxe-pfbtud, [data-plats="hoger"] #ampy-hoger { width: 100%; }
  [data-plats="hoger"] #brxe-qopmij { position: static; }   /* TOC-kortet: ingen sticky i flödet */
}
```

Alternativet är enklare och robustare: gör `?p=topp` till produktionsplaceringen (den klarar 320 till 1920 px med P2, P4, P5, P6) och släpp högerspalten.
Ägarval, se grind 1.

### M1 Major: värdsidans reset nollar kalkylatorns p-marginaler (artikeln, alla 26 profiler)

`kalkylator/artikel/bas-inbaddad.css:38` har `.ampy h1, .ampy h2, .ampy h3, .ampy h4, .ampy p, .ampy ul, .ampy ol, .ampy figure { margin: 0; }`, specificitet (0,1,1).
Kalkylatorns `.rk__under`, `.rk__per`, `.rk__fin`, `.rk__not` och nya `.rk__under--rad` sätter marginaler med (0,1,0) och förlorar. Fristående base.css använder
rena elementselektorer (0,0,1) och har inte problemet. Mätt: `#rk-per` och `#rk-fin` margin-top 0 px i artikeln mot 8,3 px (390) och 9,9 px (1440) fristående,
`#rk-under-1` 0 mot 7 px, `#rk-not` 0 mot 19,8 px (104 av 104 artikelmätningar). Följder: tätare rytm än designen, och `--rk-huvud-h` räknar med 8,3 till 9,9 px som
inte finns, så stoppläget gör kortet 8,2 till 9,1 px högre på telefon och flyttar etiketten 4,9 px i två spalter (1366 till 1920). Bild: `fynd/F6a-fristaende-panel.jpg`
mot `fynd/F6b-artikel-panel.jpg`. Samma reset följer med i FluentSnippets-leveransen om den bygger på bas-inbaddad.css.

Patch P2 (`bas-inbaddad.css:38`; filhuvudet säger att den genererades ur `system/base.css` av ett `artikel-klon-bas.py`-steg som inte finns i `tools/`, så ändra filen direkt och samma rad i den leveransversion som skickas till Chris):

```css
:where(.ampy) :is(h1, h2, h3, h4, p, ul, ol, figure) { margin: 0; }   /* (0,0,1) som base.css: komponenternas marginaler vinner */
```

Verifierat med injicerad CSS: iPhone 12 artikel höger: `#rk-per` 8,3 px, stoppläget flyttar kortet 0 px (före 8,2); desktop 1440 artikel topp: etiketten 0 px (före 4,9).
Hängslen om filen inte kan ändras: samma fem regler med `.ampy-kalkylator`-prefix i artikel.css (står i `tools/enhetsmatris-patchtest.mjs`, P2).

### M2 Major: "ROT-avdrag" bryts vid bindestrecket och "-et" hamnar ensamt

`skriv()` i `app.js` skyddar bara frasen `grön teknik-avdrag`, och spannet slutar före ändelsen. Träffar i körning 2 (`Range` över textnoder):
noten "…att dra ROT-" / "avdraget från." i 29 av 156 kombinationer (iPhone 12, iPhone 14 Pro Max liggande, Galaxy S8, iPad gen 7, iPad Pro 11, 360×640,
desktop 1024 till 1920 i `?p=topp`, alla tre motorer); etiketten "DITT TILLGÄNGLIGA ROT-" / "AVDRAG" på 320-telefoner i artikeln och desktop 1024 höger;
stopptexten "…rätt till ROT-" / "avdrag." i Firefox 390 och de smala spalterna; "grön teknik-avdrag" / "et från." på Pixel 7 (artikel topp och höger, gt) och
iPad Pro 11 höger gt. Bilder: `fynd/F3-pixel7-hoger-gt-et-ensamt.jpg`, `fynd/F4-galaxy-s8-rot-avdraget-bindestreck.jpg`, `fynd/F8-iphone-se-artikel-eyebrow-bindestreck.jpg`.
Brytpunkten beror på radbredd och typsnittsmått, så fixen måste vara strukturell, inte breddtrimmad.

Patch P4 (`kalkylator/v1/app.js`, ersätter konstanten `IHOP` och `skriv()`):

```js
/* Avdragsnamnet + ändelse ("ROT-avdrag", "ROT-avdraget", "grön teknik-avdrag", "grön teknik-avdraget") hålls ihop på raden. */
const IHOP = /(grön teknik-avdrag|ROT-avdrag)[a-zåäö]*/g;
function skriv(el, text) {
  if (el.textContent === text) return false;
  el.replaceChildren();
  let i = 0;
  for (const m of text.matchAll(IHOP)) {
    if (m.index > i) el.append(text.slice(i, m.index));
    const s = document.createElement('span'); s.className = 'rk__ihop'; s.textContent = m[0]; el.append(s);
    i = m.index + m[0].length;
  }
  if (i < text.length) el.append(text.slice(i));
  return true;
}
```

`.rk__ihop` (nowrap, inline-block) finns redan i style.css. Den statiska H2:n "Räkna ut ditt ROT-avdrag" i `index.html` bröts inte i någon mätning (`text-wrap: balance`),
men kan få `<span class="rk__ihop">ROT-avdrag</span>` för säkerhets skull (klonen regenereras då).

### M3 Major: trevägsvalen ryms inte på 320-telefoner

`.rk__segment > label { min-width: 88px }` gäller även i staplat läge. På 320 px är kortets innermått 242 px: tre val à 88 + två gap à 4 = 272 px, så "Över 65"
respektive "Båda" står 7 px utanför kortets kant fristående och 15 px i artikeln (behållare 280 px). Träffat på iPhone SE, Galaxy S9+ och 320×568 i alla 54
tillstånd. Bild: `fynd/F2-iphone-se-segment-utanfor.jpg`. Textmått (16 px, vikt 500): "Under 18" 62,1 px, "18 till 65" 57,0, "Över 65" 56,9.

Patch P5 (`kalkylator/v1/style.css`, i det staplade läget; upprepas i `@supports not`-reserven som `@media (max-width: 767px)` respektive ≈ 372 px och 332 px fönster, eftersom behållaren är fönstret minus 2 × 16 px):

```css
@container rk (max-width: 719px) { .rk__segment > label { min-width: 0; } }      /* 1fr-spåren delar bredden; 88-golvet behövs bara för inline-grid på desktop */
@container rk (max-width: 339px) { .rk__segment > label { padding-inline: 5px; } } /* 320-telefoner: 78 px-spår, "Under 18" 62 + 10 */
@container rk (max-width: 299px) { .rk__segment > label { font-size: 15px; } }     /* 320 i artikeln: 75 px-spår */
```

Verifierat: iPhone SE fristående och artikel, 320×568 artikel höger: valen 23 px innanför kortet (före +7 / +15), ingen ellips, även med "Under 18" valt i fetstil.
Galaxy S8 (360) oförändrad.

### M4 Major: talet är skärmstyrt men panelen behållarstyrd i två spalter

`--rk-text-tal` är `--ampy-text-number` (clamp på vw, 56 px från ≈ 1 280 px fönster). I artikeln `?p=topp` är behållaren 727 till 832 px och panelen 45 % av den:
248 till 295 px innermått. "upp till 50 000 kr" mäter 5,22 × talstorleken (292 px vid 56 px). Vid 1280 px fönster (behållare 781) och iPad Pro 11 liggande (727)
hamnar "upp till" ovanför talet redan i standardläget, och stoppläget flyttar etiketten 9 respektive 3,3 px. Vid 1366 till 1920 (832) ryms raden med 2 px marginal
(Firefox 2,2), vilket är för lite för Windows-rendering. Bild: `fynd/F7-desktop-1280-topp-upp-till-egen-rad.jpg`.

Patch P6 (`style.css`, direkt efter `.rk { … }`-blocket; behöver container-queries, reserven behåller px):

```css
/* Två spalter: talet får inte vara större än att "upp till 50 000 kr" ryms på en rad i panelen (45 % av behållaren minus
   2 × 39,6 px padding). Raden mäter 5,22 × talstorleken (292 px vid 56 px); faktorn 5,4 ger 3 % marginal. */
@container rk (min-width: 720px) { .rk { --rk-text-tal: clamp(40px, calc((45cqi - 80px) / 5.4), var(--ampy-text-number)); } }
```

Verifierat (faktor 5,3 i testet): 1280 topp: talet 51,2 px, raden på en rad (2,4 px marginal); iPad Pro 11 liggande: 46,6 px, en rad; 1440 topp: 55,5 px;
fristående 1440 och iPad Mini oförändrade. Med 5,4 blir marginalen 9 till 11 px. Kvar efter P6: vid 720 till 800 px behållare är panelen så smal att stopptexten
tar fyra rader och flyttar etiketten ≈ 10 px (Minor m3). Alternativ: höj tvåspaltströskeln till 800 px, se grind 3.

### M5 Major (förhandsvisningen, inte verktyget): artikelklonen ruttnar med FlyingPress

Klonen länkar Bricks-CSS med FlyingPress-hashar. Fem av de tio filerna svarade 404 i dag (cachen regenererad sedan 15/9), så den som öppnade klonen på GitHub Pages
i dag fick artikelmallen utan sajtens CSS. Den parallella körningen regenererade klonen 22:34 med dagens hashar, så den fungerar igen tills nästa cache-rens.
Patch: låt `tools/artikel-klon.py` spara de tio CSS-filerna lokalt (`kalkylator/artikel/css/`) och länka dit, så förhandsvisningen är stabil. Klonen inlinear
redan snippet 14-global-css; live laddar den numera som fil, samma regler.

### m1 Minor: raden "ROT och RUT du redan använt i år" bryter fel i 832-spalten

I `?p=topp` vid 1366 till 1920 är vänsterspalten 378 px. "Låneräntor förra året" ryms bredvid sitt 140-px-fält, men "ROT och RUT du redan använt i år" gör det inte:
fältet faller ner till nästa rad och står vänsterställt medan raden ovanför har fältet i höger kant. Bild: `fynd/F9-desktop-1440-topp-rad-bryter.jpg`.
Patch P7 (`style.css`): `@container rk (min-width: 720px) { .rk__rad > .rk__belopp { margin-left: auto; } }` (i staplat läge skulle auto-marginalen slå ut `stretch`,
därför bara i två spalter). Verifierat: fältets högerkant flyttas från −651 till −414 px (samma som raden ovanför).

### m2 Minor: `pointer: coarse` missar hybrider

44-px-reglerna (`.rk__segment` 2 px spår + 44 px val, `.rk__tabort` 44 px) sitter på `@media (pointer: coarse)`, som bara läser den primära pekaren. En iPad med
Magic Keyboard eller en touch-laptop rapporterar `fine` och får 22 px "Ta bort". Patch P8: byt till `@media (any-pointer: coarse)` på båda ställena i style.css.

### m3 Minor: stoppläget ändrar kortets höjd där talraden är på två rader

`--rk-huvud-h` antar en enradig talrad. På 320-telefoner ("upp till" / "50 000 kr") blir stoppblocket 11,4 px kortare än talblocket, så kortet krymper när man
väljer Nej (etiketten står stilla, kortets nederkant flyttar). Patch P9 (`style.css`): `@container rk (max-width: 339px) { .rk { --rk-text-tal: 44px; } }`, då ryms
"upp till 50 000 kr" på en rad i 246 px (raden mäter 230 px). Verifierat: talet 44 px, kortet 8 px lägre, valen orörda. Ägarens direktiv 2026-09-14 säger 52 px på
mobil; 44 skulle bara gälla under 340 px behållare (iPhone SE, Galaxy S9+). Grind 2. Vid 720 till 800 px behållare i två spalter (iPad Mini fristående gt, artikel topp
vid 1194 till 1280) tar stopptexten fyra rader och flyttar etiketten ≈ 10 px; det försvinner om tröskeln höjs till 800 (grind 3).

### m4 Minor: "upp till 100 000 kr" och "upp till 200 000 kr" på två rader i 832-spalten

Med två personer (1 200 000 + tom) eller fyra tomma personer bryts raden till "upp till" / "200 000 kr" även på desktop 1366 till 1920 i `?p=topp` (panelen 295 px
innermått, raden 323 px vid 56 px). Fristående 980 ryms det. Designad reserv, inget "kr" ensamt; nämns för att det är ett vanligt desktopläge. P6 minskar inte
detta (56 px är taket). Om det stör: `--rk-text-tal` för ≥ 100 000 kan sättas till 48 px i JS (klass på `.rk` när talet har sex siffror).

## 5. Grindlista (Julius svarar i en tur, numren räcker)

1. **Placering i artikeln.** `?p=topp` som produktionsval (klarar 320 till 1920 efter P2, P4, P5, P6), eller behåll `?p=hoger` med P1 (staplat under 1260)?
   Under 1260 px är högerspalten inte användbar utan P1.
2. **Talet på 320-telefoner.** Får `--rk-text-tal` vara 44 px när behållaren är under 340 px (P9), trots direktivet 52 px på mobil? Utan P9: "upp till" ovanför talet
   och 11 px höjdändring i stoppläget på iPhone SE och Galaxy S9+.
3. **Tvåspaltströskeln.** Behåll 720 px med P6 (talet skalar), eller höj till 800 px så att iPad Mini stående, 1194 och 1280 i artikeln får staplat läge med hel panel
   (stopptexten på tre rader i stället för fyra)? P6 behövs oavsett för 800 till 826.
4. **bas-inbaddad.css.** Får P2 in i filen och i FluentSnippets-leveransen (den inbäddade base-CSS:en som följer med till Chris), och finns generatorn
   `artikel-klon-bas.py` någonstans så att fixen inte skrivs över när filen görs om?
5. **`any-pointer: coarse`** (P8) i stället för `pointer: coarse`: ja/nej.
6. **Riktiga enheter före lansering.** Matrisen är emulering. Ett kort pass på en fysisk iPhone och en Android (tangentbordets inzoomning, `enterkeyhint`, adressfältets
   höjd, sticky-sidhuvudet vid fältfokus) rekommenderas; jag kan inte utföra det härifrån.

## 6. Filer

| Fil | Innehåll |
|---|---|
| `research/13-slutgranskning-responsiv.md` | denna rapport |
| `research/underlag/enheter/matris.json` | all rådata, körning 2 (26 enheter × 6 sidor × 9 tillstånd, fokus, Enter, täckning, hashar) |
| `research/underlag/enheter/svep.json`, `svep-hoger.json` | breddsvep: fristående 700 till 800 px, högerspalten 781 till 1440 px |
| `research/underlag/enheter/patchtest.json` | före/efter-mätningar för P2, P5, P6, P7, P9 |
| `research/underlag/enheter/<enhet>.jpg` | en skärmdump per enhet, fristående `?m=rot`, standardläge, hela sidan, JPEG 60 |
| `research/underlag/enheter/artikel-<enhet>-<plats>-rot.jpg` | artikeln på iPhone 12, iPad gen 7, iPad Pro 11, desktop 1024, 1440, Safari 1440 |
| `research/underlag/enheter/fynd/F1..F9*.jpg` | de nio fyndbilderna |
| `research/underlag/enheter/fynd/<enhet>-<sida>-{stopp-ager,4-personer}.jpg` | kortet i stopp- och fyrapersonersläget på sju enheter |
| `research/underlag/enheter/montage-varsta-fynd.jpg` | montaget av de nio värsta fynden |
| `tools/enhetsmatris.mjs`, `enhetsmatris-rapport.mjs`, `enhetsmatris-fynd.mjs`, `enhetsmatris-patchtest.mjs` | harnessen (kör om: `node tools/enhetsmatris.mjs`, ≈ 21 min) |

## 7. Matrisen (156 rader: enhet × sida)

Kolumnerna: överflöde (kortets element utanför kortet eller sidscroll), tryckytor (minsta mätta yta på touch-profiler), klipp (`scrollWidth > clientWidth`),
noteringar (behållarbredd och kolumner i standardläget, avvikelser, Enter). "stoppläget flyttar" gäller Nej på ägande och Under 18; "kort" är kortets höjdändring.

| Enhet (motor) | Sida | Överflöde | Tryckytor | Klipp | Noteringar |
|---|---|---|---|---|---|
| iPhone SE (webkit) | fristående rot | element utanför kortet: val +7 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 288 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -11.4 px); Enter ok |
| iPhone SE (webkit) | fristående gt | element utanför kortet: val +7 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 288 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -11.4 px); Enter ok |
| iPhone SE (webkit) | artikel topp rot | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE (webkit) | artikel höger rot | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE (webkit) | artikel topp gt | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE (webkit) | artikel höger gt | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE liggande (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 530 px, 1 kol; Enter ok |
| iPhone SE liggande (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 530 px, 1 kol; Enter ok |
| iPhone SE liggande (webkit) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 518 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.6 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE liggande (webkit) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 518 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.6 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE liggande (webkit) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 518 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.6 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone SE liggande (webkit) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 518 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.6 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 12 (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 356 px, 1 kol; Enter ok |
| iPhone 12 (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 356 px, 1 kol; Enter ok |
| iPhone 12 (webkit) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 12 (webkit) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 12 (webkit) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 12 (webkit) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 12 mörkt läge (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 356 px, 1 kol; Enter ok; mörkt läge: identiskt med ljust |
| iPhone 12 mörkt läge (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 356 px, 1 kol; Enter ok; mörkt läge: identiskt med ljust |
| iPhone 12 mörkt läge (webkit) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| iPhone 12 mörkt läge (webkit) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| iPhone 12 mörkt läge (webkit) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| iPhone 12 mörkt läge (webkit) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.2 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 395 px, 1 kol; Enter ok |
| iPhone 14 Pro Max (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 395 px, 1 kol; Enter ok |
| iPhone 14 Pro Max (webkit) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 385 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max (webkit) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 385 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max (webkit) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 385 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max (webkit) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 385 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max liggande (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 770 px, 2 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); Enter ok |
| iPhone 14 Pro Max liggande (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 770 px, 2 kol; Enter ok |
| iPhone 14 Pro Max liggande (webkit) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 490 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max liggande (webkit) | artikel höger rot | JA, kortet ger sidscroll (4 tillstånd) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 226 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); talet utanför panelen (6 tillstånd, upp till +51.6 px); bindestreck/ändelse bruten: stopptext:ROT-avdrag (stopp-ager), stopptext:ROT-avdrag (stopp-u18); stoppläget flyttar (etikett 0 px, kort 45.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max liggande (webkit) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 490 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.1 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 14 Pro Max liggande (webkit) | artikel höger gt | JA, kortet ger sidscroll (3 tillstånd) | min 44 px (val 44 / lägg 44 / ta bort 44) | #rk-stopptext (154>110) (stopp-ager, stopp-u18) | behållare 226 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); talet utanför panelen (6 tillstånd, upp till +51.6 px); stoppläget flyttar (etikett 0 px, kort 45.4 px \| etikett 0 px, kort 69.6 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 15 (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 359 px, 1 kol; Enter ok |
| iPhone 15 (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 359 px, 1 kol; Enter ok |
| iPhone 15 (webkit) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 15 (webkit) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 15 (webkit) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPhone 15 (webkit) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 5 (chromium) | fristående rot | nej | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 359 px, 1 kol; Enter ok |
| Pixel 5 (chromium) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 359 px, 1 kol; Enter ok |
| Pixel 5 (chromium) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 5 (chromium) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 5 (chromium) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 5 (chromium) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 350 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 7 (chromium) | fristående rot | nej | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 378 px, 1 kol; Enter ok |
| Pixel 7 (chromium) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 378 px, 1 kol; Enter ok |
| Pixel 7 (chromium) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 368 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 7 (chromium) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 368 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 7 (chromium) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 368 px, 1 kol; bindestreck/ändelse bruten: 66-lon not:grön teknik-avdrag:  "-et" ensamt på ny rad [var att dra grön teknik-avdraget från.]; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Pixel 7 (chromium) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 368 px, 1 kol; bindestreck/ändelse bruten: 66-lon not:grön teknik-avdrag:  "-et" ensamt på ny rad [var att dra grön teknik-avdraget från.]; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S8 (chromium) | fristående rot | nej | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 327 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); Enter ok |
| Galaxy S8 (chromium) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 327 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); Enter ok |
| Galaxy S8 (chromium) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S8 (chromium) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S8 (chromium) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S8 (chromium) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S9+ (chromium) | fristående rot | element utanför kortet: val +7, val +9 px | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 288 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -26 px); Enter ok |
| Galaxy S9+ (chromium) | fristående gt | element utanför kortet: val +7 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 288 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -11.4 px); Enter ok |
| Galaxy S9+ (chromium) | artikel topp rot | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada); stoppläget flyttar (etikett 0 px, kort -17.8 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S9+ (chromium) | artikel höger rot | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada); stoppläget flyttar (etikett 0 px, kort -17.8 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S9+ (chromium) | artikel topp gt | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Galaxy S9+ (chromium) | artikel höger gt | element utanför kortet: val +15 px | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Mini (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 725 px, 2 kol; Enter ok |
| iPad Mini (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 725 px, 2 kol; stoppläget flyttar (etikett -10 px, kort 0 px); Enter ok |
| iPad Mini (webkit) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 710 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Mini (webkit) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 710 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Mini (webkit) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 710 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Mini (webkit) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 710 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad (gen 7) (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 766 px, 2 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); Enter ok |
| iPad (gen 7) (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 766 px, 2 kol; Enter ok |
| iPad (gen 7) (webkit) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 487 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.1 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad (gen 7) (webkit) | artikel höger rot | JA, kortet ger sidscroll (4 tillstånd) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 225 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); talet utanför panelen (6 tillstånd, upp till +52.6 px); bindestreck/ändelse bruten: stopptext:ROT-avdrag (stopp-ager), stopptext:ROT-avdrag (stopp-u18); stoppläget flyttar (etikett 0 px, kort 45.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad (gen 7) (webkit) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 487 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.1 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad (gen 7) (webkit) | artikel höger gt | JA, kortet ger sidscroll (4 tillstånd) | min 44 px (val 44 / lägg 44 / ta bort 44) | #rk-stopptext (154>110) (stopp-ager, stopp-u18) | behållare 225 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); talet utanför panelen (6 tillstånd, upp till +52.6 px); stoppläget flyttar (etikett 0 px, kort 45.4 px \| etikett 0 px, kort 69.6 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 789 px, 2 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); Enter ok |
| iPad Pro 11 (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 789 px, 2 kol; Enter ok |
| iPad Pro 11 (webkit) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 502 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.1 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 (webkit) | artikel höger rot | JA, kortet ger sidscroll (4 tillstånd) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 232 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); talet utanför panelen (6 tillstånd, upp till +46.7 px); bindestreck/ändelse bruten: stopptext:ROT-avdrag (stopp-ager), stopptext:ROT-avdrag (stopp-u18); stoppläget flyttar (etikett 0 px, kort 45.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 (webkit) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 502 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.1 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 (webkit) | artikel höger gt | JA, kortet ger sidscroll (4 tillstånd) | min 44 px (val 44 / lägg 44 / ta bort 44) | #rk-stopptext (154>110) (stopp-ager, stopp-u18) | behållare 232 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); talet utanför panelen (6 tillstånd, upp till +46.7 px); bindestreck/ändelse bruten: 66-lon not:grön teknik-avdrag:  "-et" ensamt på ny rad [var att dra grön teknik-avdraget från.]; stoppläget flyttar (etikett 0 px, kort 45.4 px \| etikett 0 px, kort 69.7 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 liggande (webkit) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 980 px, 2 kol; Enter ok |
| iPad Pro 11 liggande (webkit) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 980 px, 2 kol; Enter ok |
| iPad Pro 11 liggande (webkit) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 727 px, 2 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 3.3 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 liggande (webkit) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | label (90>88) (stopp-u18) | behållare 335 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -16.3 px \| etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 liggande (webkit) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 727 px, 2 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 3.3 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| iPad Pro 11 liggande (webkit) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | min 44 px (val 44 / lägg 44 / ta bort 44) | label (90>88) (stopp-u18) | behållare 335 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1024×768 (chromium) | fristående rot | nej | fin pekare | nej | behållare 930 px, 2 kol; Enter ok |
| Desktop 1024×768 (chromium) | fristående gt | nej | fin pekare | nej | behållare 930 px, 2 kol; Enter ok |
| Desktop 1024×768 (chromium) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 621 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1024×768 (chromium) | artikel höger rot | element utanför kortet: val +24.8, "Över 65" +9.3, "Över 65" +9.6 px | fin pekare | nej | behållare 287 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada), eyebrow:ROT-avdrag (2-personer), eyebrow:ROT-avdrag (1200000), eyebrow:ROT-avdrag (4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1024×768 (chromium) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 621 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.4 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1024×768 (chromium) | artikel höger gt | element utanför kortet: val +24.8, "Över 65" +9.3, "Över 65" +9.6 px | fin pekare | nej | behållare 287 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, bada, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort 21.1 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1280×800 (chromium) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1280×800 (chromium) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1280×800 (chromium) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 781 px, 2 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1280×800 (chromium) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 360 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1280×800 (chromium) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 781 px, 2 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 9 px, kort 0 px \| etikett 4.6 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1280×800 (chromium) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 360 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1366×768 (chromium) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1366×768 (chromium) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1366×768 (chromium) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1366×768 (chromium) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1366×768 (chromium) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1366×768 (chromium) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 (chromium) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1440×900 (chromium) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1440×900 (chromium) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 (chromium) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 (chromium) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 (chromium) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 mörkt läge (chromium) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok; mörkt läge: identiskt med ljust |
| Desktop 1440×900 mörkt läge (chromium) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok; mörkt läge: identiskt med ljust |
| Desktop 1440×900 mörkt läge (chromium) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 mörkt läge (chromium) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 mörkt läge (chromium) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| Desktop 1440×900 mörkt läge (chromium) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; mörkt läge: identiskt med ljust; p-marginaler nollade (värd-CSS) |
| Desktop 1920×1080 (chromium) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1920×1080 (chromium) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Desktop 1920×1080 (chromium) | artikel topp rot | nej | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1920×1080 (chromium) | artikel höger rot | nej | fin pekare | nej | behållare 384 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1920×1080 (chromium) | artikel topp gt | nej | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Desktop 1920×1080 (chromium) | artikel höger gt | nej | fin pekare | nej | behållare 384 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 320×568 (Chromium touch) (chromium) | fristående rot | element utanför kortet: val +7, val +9 px | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 288 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -26 px); Enter ok |
| Smal 320×568 (Chromium touch) (chromium) | fristående gt | element utanför kortet: val +7, val +9 px | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 288 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -11.4 px); Enter ok |
| Smal 320×568 (Chromium touch) (chromium) | artikel topp rot | element utanför kortet: val +15, val +17, "Över 65" +1.5, "Över 65" +1.8 px | min 24 px (val 40 / lägg 44 / ta bort 24) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada); stoppläget flyttar (etikett 0 px, kort -17.8 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 320×568 (Chromium touch) (chromium) | artikel höger rot | element utanför kortet: val +15, val +17, "Över 65" +1.5, "Över 65" +1.8 px | min 24 px (val 40 / lägg 44 / ta bort 24) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); bindestreck/ändelse bruten: eyebrow:ROT-avdrag (standard), eyebrow:ROT-avdrag (stopp-ager), eyebrow:ROT-avdrag (tillbaka-ja), eyebrow:ROT-avdrag (stopp-u18), eyebrow:ROT-avdrag (66-lon), eyebrow:ROT-avdrag (bada); stoppläget flyttar (etikett 0 px, kort -17.8 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 320×568 (Chromium touch) (chromium) | artikel topp gt | element utanför kortet: val +15, val +17, "Över 65" +1.5, "Över 65" +1.8 px | min 24 px (val 40 / lägg 44 / ta bort 24) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 320×568 (Chromium touch) (chromium) | artikel höger gt | element utanför kortet: val +15, val +17, "Över 65" +1.5, "Över 65" +1.8 px | min 24 px (val 40 / lägg 44 / ta bort 24) | nej | behållare 280 px, 1 kol; "upp till" ovanför talet (standard, tillbaka-ja, 2-personer, 1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort -3.2 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 360×640 (Chromium touch) (chromium) | fristående rot | nej | min 22.4 px (val 40 / lägg 44 / ta bort 22.4) | nej | behållare 327 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); Enter ok |
| Smal 360×640 (Chromium touch) (chromium) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 327 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); Enter ok |
| Smal 360×640 (Chromium touch) (chromium) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 360×640 (Chromium touch) (chromium) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 360×640 (Chromium touch) (chromium) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Smal 360×640 (Chromium touch) (chromium) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 318 px, 1 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Safari desktop 1440×900 (WebKit) (webkit) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Safari desktop 1440×900 (WebKit) (webkit) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter ok |
| Safari desktop 1440×900 (WebKit) (webkit) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Safari desktop 1440×900 (WebKit) (webkit) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Safari desktop 1440×900 (WebKit) (webkit) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Safari desktop 1440×900 (WebKit) (webkit) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter ok; p-marginaler nollade (värd-CSS) |
| Firefox 1440×900 (firefox) | fristående rot | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter: FEL url=true loads=2 |
| Firefox 1440×900 (firefox) | fristående gt | nej | fin pekare | nej | behållare 980 px, 2 kol; Enter: FEL url=true loads=2 |
| Firefox 1440×900 (firefox) | artikel topp rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 1440×900 (firefox) | artikel höger rot | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 1440×900 (firefox) | artikel topp gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 832 px, 2 kol; "upp till" ovanför talet (1200000, 4-personer-tomma); stoppläget flyttar (etikett -4.9 px, kort 0 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 1440×900 (firefox) | artikel höger gt | nej (klonens värdsida scrollar av egen orsak) | fin pekare | nej | behållare 384 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 9.9 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 390×844 touch (firefox) | fristående rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 356 px, 1 kol; bindestreck/ändelse bruten: stopptext:ROT-avdrag (stopp-ager), stopptext:ROT-avdrag (stopp-u18); Enter: FEL url=true loads=2 |
| Firefox 390×844 touch (firefox) | fristående gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 356 px, 1 kol; Enter: FEL url=true loads=2 |
| Firefox 390×844 touch (firefox) | artikel topp rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 390×844 touch (firefox) | artikel höger rot | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; bindestreck/ändelse bruten: not:ROT-avdrag (66-lon); stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 390×844 touch (firefox) | artikel topp gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
| Firefox 390×844 touch (firefox) | artikel höger gt | nej | min 44 px (val 44 / lägg 44 / ta bort 44) | nej | behållare 347 px, 1 kol; stoppläget flyttar (etikett 0 px, kort 8.3 px); Enter: FEL url=true loads=2; p-marginaler nollade (värd-CSS) |
