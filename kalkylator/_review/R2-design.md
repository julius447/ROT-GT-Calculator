# R2 · Designgranskning av v1 / v2b / v3 (hantverk: rytm, typografi, balans, färg, mobil)

Granskare: R2 (art director-linsen). Jag hittar och bevisar, jag fixar inte.
Underlag: `kalkylator/DESIGNBRIEF-v3.md`, `kalkylator/system/tokens.css`, de tre versionernas `index.html` /
`style.css` / `app.js` / `NOTES.md`, egna renderingar (`_shots/r2-<v>-<läge>-<skärm>.png`, `node tools/shot.mjs`,
`errors: []`, `overflowX: false` i alla sex körningar) och en egen Playwright-prob.

Bevis ligger i `kalkylator/_review/`:
- `r2-probe.mjs` → `r2-matt.json` (alla mått nedan, per version × skärm × tillstånd, `getBoundingClientRect`,
  computed styles, effektiv bakgrund, kontrast, baslinjer)
- `r2-<v>-<desktop|mobile>-<0..8>-*.png` (kortet i alla tillstånd, 2x), `r2-<v>-<skärm>-h2.png` (rubriken)
- `r2-jamfor-mobil-*.png` (de tre sida vid sida), `r2-montage-*.png`, `r2-zoom-*.png` (detaljer)
- `r2-textmatt.mjs` (textbredder som bevisar kolumnaritmetiken i avsnitt 4)
- `r2-fixtest.mjs` + `r2-fixtest-*.png` (punchlistornas huvudfixar verifierade med injicerad CSS, inga filer ändrade)

Referenser: `ampy-designsystem/site/bilder/led-kalkylator-desktop.jpg`, `hero-1-desktop.jpg`,
`article-template-desktop-mitt.jpg` (artikelsidans bakgrund är vit: pixel (20,500) = #ffffff).

---

## 0. Kort dom

| | v1 "Två spalter" | v2b "Bred rad" | v3 "Talet först" |
|---|---|---|---|
| Femåring? | Nej, men "oklippt": H2:n sitter i kortet 19,8 px över första frågan, prefixet är 20 px mot talets 56 | Nej. Ser satt ut, men hålen under fråga 2 och 3 (69 px) och det tomma bandet till höger (447 px) är det första ögat fastnar på | Nej på desktop. Hjälten är den bäst satta typografin av de tre; underraden under knappen och bocken drar ner |
| Blocker | 0 | 1 (beloppsfältet klipper "1 200 000") | 0 |
| Major | 5 | 3 | 5 |
| Minor | 4 | 6 | 7 |
| Rank som levererat | 3 | 1 | 2 |
| Potential efter punchlista | Högst (LED-skelettet: frågor vänster, tal höger; det enda skelettet som bär underraden utan hål i 980) | Hög | Medel (mobilordningen och underraden är strukturella) |

---

## 1. Mättabeller

Alla mått är box-till-box (`getBoundingClientRect`), px, ur `r2-matt.json` (`<v>.<skärm>.start`). Skalan =
`--ampy-space-*` vid 1440 / 390: 3xs 7/6,6 · 2xs 9,9/8,3 · xs 14/10,5 · s 19,8/13,3 · m 28/16,9 · l 39,6/21,5.

### 1a. Rytm, desktop 1440 (980-spalten)

| Mått | v1 | v2b | v3 | Brief / skala |
|---|---|---|---|---|
| Kort b × h, rot | 980 × 475 | 980 × 394 | 980 × 424 | ≤ 460 (två spalter) / ≤ 620 (en) |
| Kort h, gt | **519** | 394 | 424 | samma |
| H2 placering | **inne i kortet** | ovanför kortet | ovanför kortet | "en H2 i artikeln" |
| H2 → kort | – | 39,6 (l = stack-lg) | 28 (m) | systemets rubrik → block = stack-lg 39,6 |
| H2 → fråga 1 | **19,8 (s)** | – | – | (mindre än fråga → fråga 28: inverterad rytm) |
| kortkant → första innehåll | 33 | 40,6 | 39,6 | 32–40 |
| fråga → underrad | 7 | 7 | (underraden ligger under kontrollen, 9,9 efter) | 6–8 |
| underrad → kontroll | 14 | 14 | – | 12–14 |
| fråga → kontroll, fråga 2 / 3 | 14 / 14 | **69 / 69** | 14 / 14 | 12–14 |
| fråga → fråga | 28 / 28 (m) | samma rad, hårlinje 19,8 + 1 + 19,8 | samma rad, kolumngap 43,9 | 28–40 |
| sista kontroll → kortkant (eller hårlinje) | 33 | 39,6 | **98,5 under fråga 2/3**, 40,6 under underraden | 32–40 |
| Resultatyta b × h | 440 × 473 | 978 × 171 | 978 × 198 | |
| kant → etikett | 176,5 (centrerad) | 20,8 | 39,6 | |
| etikett → tal | 14 (xs) | 14 (xs) | 9,9 (2xs) | LED ≈ 14 |
| tal → "Per person och år." | 9,9 | 9,9 | 9,9 | |
| "Per person" → kant / hårlinje | 176,5 | 28 | 40,6 | |
| innehållets bbox / resultatytan (area) | **15 %** | 36 % | 30 % | |
| tomt till höger om talraden | 136 | **447** | **447** | |
| talradens bredd (upp till 50 000 kr) | 263,5 | 294 (text) | 294 (text) | |
| Höjd konstant i alla tillstånd | ja (3-radsgrid) | ja (393,9 i alla) | ja (424 i alla) | |

### 1b. Rytm, mobil 390

| Mått | v1 | v2b | v3 | Brief |
|---|---|---|---|---|
| Kort b × h, rot / gt | 356 × 620 / **652** | 347 × 625 / 625 | 347 × 616 / 616 | ≤ 640 |
| kortpadding | 22,5 | 22,6 | 22,5 | 20–24 |
| H2 | 26,8/500 i kortet, 16,9 → fråga 1 | 26,8/500, 21,5 → kort | 26,8/500, 20 → kort | |
| fråga → underrad | 6,6 | 6,6 | 6,6 | 6–8 |
| underrad → kontroll | **10,5** | 12 | 12 | 12–14 |
| fråga → kontroll (fråga 2/3) | **10,5** | 12 | 12 | 12–14 |
| fråga → fråga | **21,5** | 34,8 (16,9 + hårlinje + 16,9) | 28 | 28–40 |
| segment → fält (fråga 3) | 10,5 | 8,3 | 10,5 | |
| segment / fält bredd | 311 / 311 | 302 / 302 | 302 / 302 | fullbredd |
| tal | 42/700 | 44/700 | 44/700 | 40–44 |
| prefix / enhet | **20 / 21** | 22 / 22 | 22 / 22 | |
| etikett → tal / tal → per | 10,5 / 8,3 | 10,5 / 8,3 | 8,3 / 8,3 | |
| kortet i stoppläget | **+38,5 px** | ±0 | ±0 | |
| kortet med femårsraden | +47,5 | +48 | +48 | (kunden utlöser) |
| stopptext | **16,1/500** | **16,1/400** | 18/500 | 18 |
| rött X | 44 | 40 | 44 | 40–48 |
| underradens brytning | en rad (311 px ryms) | **"Helt / eller delvis."** | meningsvis (nowrap-spann) | |
| "grön teknik" hålls ihop (H2, stopptext) | ja (nbsp) | **nej** | **nej** | |
| träffyta Ja/Nej | 145 × 40 i spår 48 | 145 × 40 | 145 × 40 | "48 px höga" |

### 1c. Typografi, desktop 1440 (mobil i parentes där det skiljer)

| Roll | v1 | v2b | v3 | Brief / system |
|---|---|---|---|---|
| H2 | 36/500/43,2, ls −0,36 | 36/500/43,2 | 36/500/43,2 | `.ampy-h2` 36/500/1,2 ✓ alla |
| Fråga | 20/500/25, ls −0,01em | 20/500/25, ls −0,01em | 20/500/25, **ls normal** | 20/500 |
| Underrad | 16/400/22,4 dämpad | 16/400/24 | 16/400/24 | 16/400 dämpad |
| Etikett (eyebrow) | 12/600 versaler 0,14em, **med teal-streck** | 12/600 versaler 0,14em | 12/600 versaler 0,14em | 12 versaler spärrad |
| Prefix "upp till"/"ca" | **20/500** | 28/500 | 28/500 | (LED: enhet = halva talet) |
| Tal | 56/700 tabular, ls −0,03em | 56/700 tabular | 56/700 tabular | 44–56/700 tabulära ✓ |
| Enhet "kr" | **21/500** (`--ampy-text-mid` ger 21 vid 1440, inte 28) | 28/500 | 28/500, ls normal | |
| Baslinje prefix = tal = enhet | ja (313,5) | ja (461,8) | ja (266,9) | ✓ alla |
| "Per person och år." | 16/400 dämpad | 16/400 | 16/400 | 16/400 dämpad ✓ |
| Femårsraden | 16/400 ink, bakom hårlinje (mobil **14,1**) | 16/400 ink, **samma rad** som "Per person" | 16/400 ink, **samma rad** | "liten rad under talet" |
| Stopptext | 18/500, X **ovanför** texten (mobil 16,1) | 18/**400**, rad (mobil 16,1) | 18/500, rad | 18 i `--ampy-ink` |
| Segmenttext vald / ovald | 16 **600 / 500** (vikthopp) | 18 500 / 500 | 18 600 / 600 (system) | 16–18, "tydligt valt" |
| Beloppsfält siffror | 18/500 tabular | 18/500 tabular (mobil 16,1) | 18/500 tabular | 18 |
| "kr" i fältet | 16/400, 15 px från siffrorna | 18/400, 10 px | 18/400, **19 px** (mobil 16,1) | suffix inne i fältet ✓ |
| Placeholder | 400 | **500** (ser ifylld ut) | 400 | |
| Lägsta kontrast | 5,27 (teal-deep på vit) | 5,27 | 5,27 | ≥ 4,5 ✓ alla |

### 1d. Kontroller och ytor

| | v1 | v2b | v3 |
|---|---|---|---|
| Segmentspår / alternativ | 188 × 48 / 88 × 40, radie 12/8 | 188–190 × 48 / 88–90 × 40 | 188–195 × 48 / 88–91 × 40 |
| Beloppsfält desktop | 257 × 48 | **134 × 48** | 150 × 48 |
| "1 200 000" ryms (scrollWidth ≤ clientWidth) | ja (255/255) | **nej (136 > 132, sista nollan klipps)** | ja, 0 px marginal (148/148) |
| Valt läge | vit pill + shadow-subtle + teal-deep text | samma | samma |
| Kort | 1 px `--ampy-line`, radie 20, `--ampy-shadow-card` | samma, overflow hidden | samma, overflow hidden |
| Resultatyta | sky mist, hårlinje vänster, inre radie 19 (= 20 − 1, snyggt) | sky mist, hårlinje topp | sky mist, hårlinje botten |
| Mörka ytor (computed background) | inga | inga | inga (bara X-disken 44 px och bocken 28 px) |
| Demo-sidans bakgrund | vit (= artikelmallen) | sky mist (**inte** artikelmallen) | sky mist (**inte** artikelmallen) |
| Gradienttext / emoji / centrerad rubrik / mörkt kort | nej / nej / nej / nej | nej / nej / nej / nej | nej / nej / nej / nej |

---

## 2. Fynd per version

Format: **Allvar · element (fil:rad) · bevis · fix.**

### v1 "Två spalter"

**Major 1 · H2:n är en kortrubrik, inte artikelns H2** · `index.html:18`, `style.css:15,32` (`--rk-gap-h2: s`).
Bevis: H2 → fråga 1 = 19,8 px, fråga → fråga = 28 px: den största texten får minst luft under sig (inverterad
rytm). På mobil är H2 26,8/500 och frågan 20/500 med 16,9 emellan: de läses som syskon (`r2-jamfor-mobil-start.png`,
vänster). I gt-läget bryter rubriken på två rader i 55 %-spalten och kortet blir 519 px (brief ≤ 460)
(`r2-v1-desktop-7-gt-start.png`). Briefens punkt 1 säger "en H2 i artikeln".
Fix: flytta `<h2>` ut ur kortet, som v2b: `margin: 0 0 var(--ampy-space-stack-lg)`. Verifierat med injicerad CSS
(`r2-fixtest.mjs`, `r2-fixtest-v1-desktop*.png`): kortet 412 px i både rot och gt (509 px rubriktext ryms på en rad i
980), H2 → kort 39,6; mobil gt 588,5 (< 640).

**Major 2 · Prefix och enhet har två storlekar och är för små** · `style.css:92` (`--rk-text-fraga` = 20) och
`:94` (`--ampy-text-mid` = 21 vid 1440; tokenen når 28 först vid ~2 300 px fönster).
Bevis: "upp till" 20 px, "kr" 21 px, talet 56: 0,36 × talet. LED sätter enheten på 0,5 × (56 + 28). På mobil är
talet 42 och enheten 21 (0,5) men prefixet 20: proportionen ändras mellan skärmar. Syns i `r2-zoom-v1-panelkant.png`
("kr" ser större ut än "upp till").
Fix: en lokal variabel `--rk-text-enhet: calc(var(--rk-text-tal) * .5)` på båda (28 desktop / 21 mobil), samma
vikt 500, samma `letter-spacing: -0.01em`.

**Major 3 · Stoppläget: X:et staplat ovanför texten, texten 16 px på mobil** · `style.css:108` (`flex-direction:
column`), `:112` (`--ampy-text-body` bottnar på 16,1).
Bevis: `r2-v1-desktop-1-ager-nej.png` (X 44 px, 19,8 luft, sedan två rader text: tre lösa element i en 440 px
panel); `r2-matt.json v1.mobile.agerNej.stopp.text.fs = 16.1` (brief: 18). v2b och v3 sätter X + text på en rad,
centrerade mot varandra, vilket läses som ett besked.
Fix: `flex-direction: row; align-items: center; gap: var(--ampy-space-s)`, texten `font-size: 18px` fast.

**Major 4 · Panelen byter höjd på mobil** · `style.css:141` (`display: flex` på mobil, ingen reserverad höjd).
Bevis: kortet 619,9 → 658,4 i stoppläget (+38,5), → 667,4 med femårsraden (`r2-matt.json v1.mobile.*.card.box.h`).
v2b och v3 håller stopphöjden (±0).
Fix: `.rk__huvud { min-height: calc(var(--rk-text-tal) + var(--ampy-space-2xs) + 22.4px) }` på mobil (72,7 ≥ X-raden
44 + text), eller lägg talet och stoppläget i samma gridcell (`grid-area: 1/1`) som v2b `style.css:64`.

**Major 5 · Resultatpanelen är 85 % luft** · `style.css:73-85`.
Bevis: innehållets bbox 263 × 120 i en panel 440 × 473 = 15 % av ytan; 176 px tomt över och under, 136 till höger
(`r2-matt.json v1.desktop.start.tomrum`). Det är den lägsta fyllnadsgraden av de tre. Centreringen räddar den
delvis (den läses som en "display"), men 45 % av kortet bär tre rader text.
Fix: Major 1 sänker kortet till ≈ 412 och panelen till 25 % fyllnad. Behåll centreringen. Gör inte talet större
(56 är briefens tak).

**Minor 6 · Mobilens rytm ligger under briefens golv** · `style.css:124-133`.
Bevis: underrad → kontroll 10,5 (brief 12–14), fråga → kontroll 10,5, fråga → fråga 21,5 (brief 28–40).
Fix: `--rk-gap-ctl: max(12px, var(--ampy-space-xs))` (som v2b/v3), `--rk-gap-q: clamp(28px, var(--ampy-space-l), 40px)`.
Kostar ≈ 16 px höjd; med H2:n utflyttad ryms det gott under 640.

**Minor 7 · Femårsraden 14,1 px på mobil** · `style.css:103` (`--ampy-text-small`).
Fix: `font-size: var(--rk-text-under)` (16 fast, som underraden).

**Minor 8 · Vikthopp 500 → 600 när ett alternativ väljs** · `style.css:55,57`.
Bevis: `typo.opt_vald.fw 600`, `opt_ovald.fw 500`. Systemets `.ampy-segment` är 600 på båda (LED: 600 på alla).
Fix: ta bort rad 57 och sätt `font-weight: var(--ampy-w-strong)` på rad 55 (eller 500 på båda, men samma i alla tre
versioner).

**Minor 9 · Teal-strecket före etiketten** · `index.html:57` (`ampy-eyebrow--dash`).
Bevis: enda versionen med strecket; det är en dekoration, inte ett valt läge, och blir en andra teal-punkt bredvid
segmentens valda text. Brief: "Teal som enda accent" avser valt läge.
Fix: ta bort `ampy-eyebrow--dash` (smaksak, men v2b/v3 visar att etiketten bär sig själv).

Rätt gjort i v1 (behåll): "grön teknik" hålls ihop med hårt mellanslag (`app.js:23`), panelens inre radie 19 = kortets
20 − 1 (`style.css:78`), femårsraden bakom hårlinje i stället för på samma rad, beloppsfältet 257 px (7 siffror ryms
med marginal), underraden på en rad på mobil, demo-sidan vit som artikelmallen.

### v2b "Bred rad"

**Blocker 1 · Beloppsfältet klipper sjusiffriga inkomster** · `style.css:24` (kolumner `1fr 1.32fr 1.54fr`), `:49`
(`.rk__falt { flex: 1 1 auto }` utan min-bredd).
Bevis: fältet 133,8 × 48; "1 200 000" i 18/500 tabular är 81,5 px + padding 14 + 40,1 = 135,6 > 131,8 inre bredd:
`scrollWidth 136 > clientWidth 132`, sista nollan klipps ("1 200 00") i `r2-zoom-v2b-falt-1200000.png`. Även
platshållaren "300 000 kr" fyller fältet till kanten.
Fix: `.rk__falt { flex: 0 0 15rem }` (150 ≥ 81,5 + 14 + 40 + 2; på mobil `flex: 0 0 auto` eftersom raden är en
kolumn där) och ge spalt 3 plats: `grid-template-columns: minmax(0, 1fr) minmax(30rem, 1.25fr) max-content` (spalt 3 =
19,8 + 190 + 14 + 150 = 374; spalt 2 ≥ 300 eftersom spåret bär `.rk__q`:s padding 2 × 19,8 och "Är bostaden äldre än
fem år?" är 255 px; spalt 1 blir 224 ≥ etiketten 174 + padding). Verifierat med injicerad CSS (`r2-fixtest.mjs`):
fältet 150, ingen klippning, fråga 2 på en rad, kortet fortfarande 393,9.

**Major 2 · 69 px hål mellan fråga och kontroll i spalt 2 och 3** · `style.css:40` (`margin-top: auto` lägger alla
kontroller på fråga 1:s rad, som har en tvåradig underrad 48 + 7).
Bevis: `r2-matt.json v2b.desktop.start.fragor[1].gap_label_ctl 55` + 14 padding = 69 px (brief 12–14);
`r2-v2b-desktop-0-start.png`. Kolumnaritmetiken i avsnitt 4 visar att underraden inte kan bli enradig i 980.
Fix (rekommenderad): ta bort `margin-top: auto`, kontrollen 14 px under sin egen etikett/underrad i alla spalter;
hårlinjerna sträcker sig ändå över hela raden (grid `align-self: stretch` är default). Spalt 1 blir 55 px högre än
2 och 3 nedtill, vilket döljs av bandets hårlinje 39,6 under. Alternativ: underraden som hjälptext under Ja/Nej (LED
gör så: "Vi räknar för föreningens gemensamma belysning." under segmentet), då blir hålet 48 + 10 under spalt 2/3
i stället.

**Major 3 · Bandets högra två tredjedelar är tomma** · `style.css:61-80`.
Bevis: innehållets bbox 491 × 122 i 978 × 171 = 36 % av ytan, 447 px tomt till höger om "kr"
(`tomrum.hoger_tomt 447.2`, `r2-zoom-v2b-bandkant.png`). Uppgiften nämner just "an empty right half of a band".
Fix (kräver ägarens ok, byter form): kvittorad: etikett + "Per person och år." vänster som en stapel, talet
högerställt på samma rad (`display: grid; grid-template-columns: 1fr auto; align-items: baseline`); bandet
≈ 100 px, kortet ≈ 325 px och bredden används. Stoppläget: X + text vänster, hela raden. Utan ägarbeslut: låt vara,
men vet att det är versionens svagaste yta (författaren skriver samma sak i NOTES).

**Major 4 · Femårsraden läses som en fortsättning på "Per person och år."** · `style.css:77` (`gap: 0 19.8` på
samma rad), `:81`.
Bevis: `r2-zoom-v2b-femar.png`: "Per person och år.   Yngre än fem år: ROT gäller bara reparationer." på en rad, dämpad
+ bläck utan avdelare. Det är verktygets enda juridiska förbehåll och det ser ut som en bisats.
Fix: `.rk__sub { display: block }`, `.rk__not { display: block; margin-top: var(--ampy-space-3xs) }`, eller v1:s
hårlinje. Bandet växer 31 px i det läget (kunden utlöser det); vill man hålla höjden: `.rk__sub { min-height: 55px }`.

**Minor 5 · Platshållaren har samma vikt som ett ifyllt värde** · `style.css:50-54` (ingen `::placeholder`-regel,
fältet 500).
Bevis: `typo.placeholder.fw 500`; "300 000" i faint-färg men 500 ser ut som ett förifyllt belopp (v1/v3: 400).
Fix: `.rk__input::placeholder { font-weight: var(--ampy-w-ui) }`.

**Minor 6 · Underraden bryter "Helt / eller delvis." på mobil** · `index.html:22`.
Bevis: 306 px text i 302 px spalt (`r2-jamfor-mobil-start.png`, mitten). Tre-ordsmeningen delas.
Fix: `<span>Villa, radhus eller lägenhet.</span> <span>Helt eller delvis.</span>` + `.rk__under > span
{ white-space: nowrap }` (v3 `style.css:80`).

**Minor 7 · "grön teknik-avdrag" bryts inne i ordet** · `app.js:14-17,40`.
Bevis: mobil H2 "Räkna ut ditt grön / teknik-avdrag", stopptext "… rätt till grön / teknik-avdrag."
(`r2-jamfor-mobil-gt-h2.png`, `r2-jamfor-mobil-gt-stopp.png`). v1 håller ihop med `\u00a0` (`app.js:23`).
Fix: `'grön\u00a0teknik-avdrag'` i `namn` och `r.text.replace(/grön teknik/g, 'grön\u00a0teknik')` för stopptexten.

**Minor 8 · Stopptexten 16,1 px på mobil, 400 i vikt** · `style.css:86`.
Fix: `font-size: 18px; font-weight: var(--ampy-w-medium)` (brief 18; v1/v3 500).

**Minor 9 · Segmenttext 500 på vald** · `style.css:44`. Systemet och LED: 600. Fix: `var(--ampy-w-strong)`.

**Minor 10 · Demo-sidan är sky mist, artikelsidan är vit** · `base.css` body-bakgrund ärvs (`sidbakgrund
rgb(245,249,255)`).
Bevis: `article-template-desktop-mitt.jpg` pixel (20,500) = #ffffff. På sky mist smälter bandet ihop med sidan under
kortet (`r2-zoom-v2b-bandkant.png`); på vit sida läses bandet som panel. Ägaren ser alltså en sämre bild i demon
än i produktion.
Fix: `body { background: var(--ampy-bg-surface) }` i demon (som v1 `style.css:6`), eller bekräfta värdens färg.

Rätt gjort i v2b (behåll): H2 utanför kortet med systemets 39,6; talraden 56 + 28 på baslinjen (LED-greppet);
kortet 393,9 px i alla nio tillstånd; mobilens hårlinjelista med 34,8 mellan frågorna; `overflow: hidden` så bandet
klipps av kortets radie; spalter satta efter innehåll.

### v3 "Talet först"

**Major 1 · Hjälten läses som sida, inte som kort** · `style.css:5` (`.ak-body` = `--ampy-bg-page` = #f5f9ff) +
`:33` (hjälten = `--ampy-bg-subtle` = samma #f5f9ff).
Bevis: `r2-zoom-v3-kortkant.png`: kortets överkant är bara 1 px rgba(9,11,50,.14) mot samma färg; talet ser ut att
stå på sidan med en ram runt. Villkor: artikelsidan är vit (se v2b Minor 10), så i Bricks försvinner problemet, men
demon visar ägaren fel bild och varje sky mist-värd (sektioner, LED-sidan #f8f9fb) ger samma effekt.
Fix: (a) demo-sidan vit (`--ampy-bg-surface`). (b) Om värden kan vara sky mist: rama in hjälten utan att flytta
vänsterkanten: `.ak__kort { padding: var(--ampy-space-s) }`, `.ak__hero { margin: 0; padding: var(--ampy-space-s);
border-radius: var(--ampy-radius-field); border: 0 }`, `.ak__fragor { padding: 0 var(--ampy-space-s)
var(--ampy-space-s); margin-top: var(--ampy-space-m) }` → text på 19,8 + 19,8 = 39,6 i både hjälte och frågor.

**Major 2 · Underraden hänger under knappen och lämnar 98 px tomt under fråga 2 och 3** · `style.css:119-124`
(`grid-template-columns: min-content …`, `.ak__under { grid-row: 3 }`), `index.html:50`.
Bevis: spalt 1 är min-content = 191,5 px, underraden (306 px text) bryter till två rader (48 px) under Ja/Nej;
kontroll → kortkant under fråga 2/3 = 98,5 px (`gap_last_cardbottom 40.6` + 48 + 9,9) (`r2-v3-desktop-0-start.png`).
Ordningen fråga → kontroll → underrad avviker från briefens rytm; LED har precedens för hjälptext under en kontroll,
så själva placeringen är försvarbar, hålet är det inte.
Fix: låt underraden vara EN rad som får löpa ut ur spalt 1: `.ak__under { grid-row: 3; width: max-content;
margin-top: var(--ampy-space-2xs) }` (inget annat ligger på rad 3 i spalt 2/3, så inget överlappar). Verifierat med
injicerad CSS (`r2-fixtest.mjs`, `r2-fixtest-v3-desktop.png`): underraden en rad (306 px), kortet 404 px, kontroll →
kortkant under fråga 2/3 = 74,5 (varav 40,6 är kortets padding, extra 34) i stället för 98,5 (extra 58). Aritmetiken
i avsnitt 4 visar att spalt 1 inte kan göras 306 px bred utan att fältet klipps.

**Major 3 · På mobil står talet 500 px ovanför fältet man skriver i** · `index.html:20-43` (hjälten först),
`style.css:103-106`.
Bevis: hjälten y 74–221, beloppsfältet y 619–667 (`r2-matt.json v3.mobile.start`). När tangentbordet är uppe
(synlig höjd ≈ 400–500 px) rullar webbläsaren fältet i bild och hjälten hamnar utanför: kunden ser inte att talet
reagerar. v1 och v2b har talet 20–70 px under fältet. Verifiera på riktig telefon, men geometrin talar för sig.
Fix (ägarbeslut, bryter "Talet först" på mobil): i `@container ak-kort (max-width: 439px)`: `.ak__kort { display: flex;
flex-direction: column } .ak__fragor { order: 1; margin-top: 0 } .ak__hero { order: 2; margin: var(--ampy-space-l)
calc(-1 * var(--ak-kort)) calc(-1 * var(--ak-kort)); border-bottom: 0; border-top: 1px solid var(--ampy-line) }`.

**Major 4 · Grön bock = tredje accentfärgen** · `index.html:27-29`, `style.css:46-53,74`, `app.js:42`.
Bevis: `r2-zoom-v3-bock.png`: en 28 px grön disk (`--ampy-success-ink`) bredvid "kr", `align-self: center` lägger
dess mittpunkt 14 px över baslinjen som "kr" står på; den läses som "godkänt" för ett tal som börjar med "ca".
Färgdisciplinen blir teal (valt) + grön (bock) + rött (X). Brief: bocken "får finnas … om det gör beskedet
tydligare"; talbytet "upp till 50 000" → "ca 12 000" är redan beskedet (v1 och v2b resonerar likadant).
Fix: ta bort bocken (HTML, CSS, JS).

**Major 5 · Femårsraden på samma rad som "Per person och år."** · `style.css:67-69`.
Bevis: `r2-zoom-v3-femar.png`, samma fynd som v2b Major 4.
Fix: `.ak__not { flex-basis: 100%; margin-top: var(--ampy-space-3xs) }` (egen rad). Hjälten växer 31 px i det
läget; vill man hålla höjden: `.ak__rad { min-height: 55px }`.

**Minor 6 · "grön teknik-avdrag" bryts inne i ordet** · `app.js:12,15,16,38`. Samma som v2b Minor 7. Fix: `\u00a0` som v1 `app.js:23`.

**Minor 7 · H2 → kort 28 i stället för systemets 39,6** · `style.css:24` (`max(20px, var(--ampy-space-m))`).
Bevis: v2b 39,6 (`--ampy-space-stack-lg`), LED ≈ 40. Fix: `margin: 0 0 var(--ampy-space-stack-lg)`.

**Minor 8 · Etikett → tal 9,9 (2xs)** · `style.css:30` (`gap: 2xs`). v1/v2b 14, LED ≈ 14. Fix: `.ak__etikett
{ margin-bottom: 4px }` (9,9 + 4 ≈ 14) eller `gap: var(--ampy-space-xs)` och `.ak__rad { margin-top: -4px }`.

**Minor 9 · Frågans spärrning avviker** · `style.css:78` (`letter-spacing` saknas → normal; v1/v2b/`.ampy-h3`
−0,01em). Fix: `letter-spacing: var(--ampy-ls-heading)`.

**Minor 10 · Krysset i X-disken är 10 px, v1/v2b 13–14** · `style.css:64` + `index.html:34` (path 7→17 i 24-box).
Fix: path `M6 6l12 12M18 6L6 18` (12 px) eller svg 32 px; en spec för alla tre.

**Minor 11 · "kr"-gapet i fältet 19 px (v2b 10, v1 15)** · `style.css:92` (`+ var(--ampy-space-2xs)` extra).
Fix: `padding-right: calc(var(--ampy-space-xs) + 1.4em)`.

**Minor 12 · Demo-sidan sky mist** · samma som v2b Minor 10; se Major 1 (a).

Rätt gjort i v3 (behåll): talraden 56 + 28 på baslinjen; hjältens höjd konstant i alla tillstånd (198, min-height
= tal + rad); X + text på en rad, 18/500 på båda skärmar; underraden i nowrap-spann; alla vänsterkanter på 39,6
(etikett, tal, frågor, kontroller); container-queries i stället för fönsterfrågor; kontrollerna på en linje med
14 px under alla tre etiketter.

---

## 3. Alla tre: gemensamma observationer

- **Träffytan Ja/Nej är 40 px, spåret 48.** Briefen säger "knapparna 48 px höga"; alla tre tolkade det som LED-spåret
  (48/40). Systemets pill-variant höjer alternativet till 44 på touch (`falt.css:262`); den vanliga segmenten gör det
  inte. Inte en defekt mot briefen, men skriv upp det som ägarfråga: 40 eller 44 på mobil.
- **Kontrast**: lägsta 5,27:1 (teal-deep på vit), dämpad på sky mist 5,99, dämpad på spåret 5,46, platshållare 4,8.
  Ingen text-teal under 4,5. Ingen teal-core som text. ✓
- **Ytor**: inga mörka bakgrunder (computed) någonstans; X-disken (`--ampy-error-ink`) och bocken är ikoner. ✓
  Smaksak, inte fynd: `--ampy-error-ink` #7a1623 är vinröd; vid 44 px blir disken verktygets tyngsta element.
  Briefen kräver error-ink, så ingen ändring utan ägarens ord, men `--ampy-error` #b3261e (6,5:1 mot vitt) läses som
  "rött" snarare än "vin".
- **Radier** (kort 20, spår 12, alternativ 8, fält 12, disk pill) och **skuggor** (`--ampy-shadow-card` + hårlinje,
  alternativ `shadow-subtle`) är konsekventa i alla tre och med LED. ✓
- **Fokusringar** ur systemet (3 px teal-deep .9) i alla tre; reduced motion respekteras (base.css nollar, v3 även i JS). ✓
- **AI-template-tecken**: inga mörka kort, ingen glöd, ingen centrerad vit rubrik, ingen gradienttext, inga emoji.
  Mildare tecken: v1:s dekorativa teal-streck, v3:s bock-badge. v1:s `border-left` på panelen är en avdelare, inte
  en sidoflik (håller med NOTES: falskt positivt).
- **Artikelmallens H2 är fet** (≈ 30/700 i `article-template-desktop-mitt.jpg`, "Vad menas med märkeffekt?") medan
  briefen och systemet säger 36/500. Verktygets H2 kommer att stå bredvid fetare artikel-H2:or. `[GAP]` ägarfråga,
  inte ett fel i versionerna.

---

## 4. Varför tre frågor i bredd inte bär underraden i 980 (aritmetik)

Textbredder i Outfit (`r2-textmatt.mjs`): underraden 16/400 = **306,3 px**, "Är bostaden äldre än fem år?" 20/500 =
**255,3**, "1 200 000" 18/500 tabular = **81,5**, "kr" 18 = 16,2.
Kortets innehållsbredd = 980 − 2 (kant) − 2 × 39,6 = **898,8**.
Krav utan brytning: spalt 1 ≥ 306 (underraden på en rad) + spalt 2 ≥ 255 + spalt 3 ≥ 190 (Lön/Pension) + 14 + 150
(fält som rymmer 81,5 + 14 + 40 + 2) = 354 → **915 + kolumngap (v2b 79 / v3 56) = 971–995 > 899.** Det saknas
72–96 px. Alltså: antingen bryter underraden (→ hål under fråga 2/3, v2b 69 px / v3 98 px), eller så klipps fältet
(v2b), eller så läggs underraden på en rad utanför sin spalt (v3-fixen ovan). Det enda skelettet där underraden
ligger naturligt mellan fråga och kontroll utan hål är staplade frågor (v1:s vänsterspalt, LED:s inmatningskort).

---

## 5. Mot LED-kalkylatorn och Hero-1

| LED / Hero-1 gör | v1 | v2b | v3 |
|---|---|---|---|
| H2 i flödet, vänsterkant = kortets kant, ≈ 40 under | nej (i kortet) | ja (39,6) | ja men 28 |
| Hjältetal 56/700 + enhet 28/500 på baslinjen, dämpad | nej (20/21) | ja | ja |
| Etikett i versaler 12/600 0,14em, ≈ 14 över talet | ja (+streck) | ja | ja men 9,9 |
| Segment: spår 48 / pill 40 / 600 / vit vald + teal text | 600 bara vald | 500 | ja |
| Varje yta bär innehåll, inga döda zoner | panel 15 % fylld | band 36 %, 447 tomt | hjälte 30 %, 447 tomt |
| Hjälptext under kontroll (LED "Vi räknar för …") | – | – | ja (men tvåradig + hål) |
| Hårlinjer med ≈ 20 luft på var sida | ja (panel) | ja (spalter) | ja (hjälte) |
| Kort: 1 px kant + mjuk skugga på ljus sida | ja | ja | ja |
| Vikterna 700 tal / 500 rubrik / 400 UI, en accent (Hero-1) | ja | ja | nej (teal + grön + röd) |
| Ihållen ordbild ("grön teknik", meningsvisa brytningar) | ja | nej | delvis (underraden ja, H2/stopp nej) |

Var nivån inte hålls, exakt: v1: rubriken i kortet 19,8 över frågan och prefixet 20 mot talets 56 (LED 28/56); v2b:
69 px hål under två av tre etiketter och ett fält på 134 px som klipper sju siffror (LED:s fält spänner kortet);
v3: hjälten på samma färg som demo-sidan, underraden på två rader under knappen med 98 px tomt bredvid, bock i grönt.
Det LED har som ingen av de tre kan få: tätt innehåll i resultatytan. Innehållet är låst till tre rader, så
tomrummet är delvis briefens; hur tomrummet hanteras skiljer: v1 centrerar (display), v2b/v3 låter det ligga till
höger.

---

## 6. Rankning

**Som levererat (avstånd till ribban):**
1. **v2b.** Rytmen håller briefens intervall på båda skärmar, H2:n står rätt, talraden är LED-satt, kortet håller
   höjden i alla tillstånd, mobilens hårlinjelista är ritad. Blockern (fältet) är en rad CSS. Kvar: hålen (strukturellt),
   bandet (formbeslut), femårsraden, tre småfel i ordbilden.
2. **v3.** Bästa hjälten och renaste desktopraden, men fem majors varav två strukturella (hjälten mot sidan, mobilens
   ordning) och en färgdisciplinär (bocken).
3. **v1.** Bästa skelettet (LED:s: inmatning vänster, tal höger; det enda där underraden ligger utan hål) men det
   sämsta hantverket på ytan: rubriken i kortet, prefixet 20/21, X:et staplat, mobilen hoppar, kortet 475/519 mot 460.

**Potential efter punchlistorna:** v1 och v2b når ribban; v1 sannolikt högst (två-spalters skelettet + v2b:s
typografi), v2b snabbast (fyra ändringar). v3:s mobilordning är ett ägarbeslut som antingen bryter idén eller
lämnar talet utom synhåll när kunden skriver.

Rekommendation till ägaren: kör punchlistorna på **v1 och v2b**, rendera igen och välj mellan dem. v3 bara om "Talet
först" är viktigare än att se talet ändras på mobil.

---

## 7. De tre ändringar som lyfter upplevd kvalitet mest

**v1:** (1) H2:n ut ur kortet, 39,6 ovanför (kortet ≈ 412, gt på en rad). (2) "upp till"/"kr" i halva talets storlek,
samma storlek båda (28/21). (3) X + text på en rad, 18 px på båda skärmar, panelen håller höjden på mobil.

**v2b:** (1) Fältet 150 px (blockern). (2) Kontrollen 14 px under sin egen etikett (bort med `margin-top: auto`).
(3) Femårsraden på egen rad; och om ägaren vill: kvittoraden (talet högerställt) så bandet använder bredden.
Punkt 1 och 2 är verifierade med injicerad CSS: fältet 150 utan klipp, fråga → kontroll 14/14 i spalt 2 och 3,
kortet oförändrat 393,9 (`r2-fixtest-v2b-desktop.png`).

**v3:** (1) Hjälten som tydlig panel (demo på vit sida; inramad panel om värden kan vara sky mist). (2) Underraden som
en rad som får löpa ut ur spalt 1 (hålet 98 → 34). (3) Bort med bocken; femårsraden på egen rad; nbsp i "grön teknik".

---

## 8. PUNCHLISTA per version (i ordning, körbar som den står)

### v1

1. `kalkylator/v1/index.html:18` — klipp `<h2 class="ampy-h2 rk__rubrik" id="rk-rubrik">Räkna ut ditt ROT-avdrag</h2>`
   ur `.rk__fragor` och klistra in den som första barn i `<main class="rk-spalt">`, före `<section class="ampy-card rk">`.
2. `kalkylator/v1/style.css:32` — ersätt med `.rk__rubrik { margin: 0 0 var(--ampy-space-stack-lg); }`. Ta bort
   `--rk-gap-h2` på rad 15 och rad 129.
3. `kalkylator/v1/style.css:12-22` — lägg till `--rk-text-enhet: calc(var(--rk-text-tal) * .5);`.
   Rad 92: `.rk__prefix { font-size: var(--rk-text-enhet); font-weight: var(--ampy-w-medium); line-height: 1;
   letter-spacing: -0.01em; color: var(--ampy-ink-muted); }`. Rad 94: `.rk__talenhet` samma deklaration.
4. `kalkylator/v1/style.css:108` — `.rk__stopp { display: flex; flex-direction: row; align-items: center;
   gap: var(--ampy-space-s); margin-top: var(--ampy-space-s); }`.
   Rad 112: `.rk__stopptext { margin: 0; font-size: 18px; font-weight: var(--ampy-w-medium); line-height: 1.35;
   color: var(--ampy-ink); max-width: none; text-wrap: pretty; }`.
5. `kalkylator/v1/style.css:141` — lägg till i mobilblocket: `.rk__huvud { min-height: calc(var(--rk-text-tal) +
   var(--ampy-space-2xs) + 22.4px); justify-content: center; }`.
6. `kalkylator/v1/style.css:130` — `--rk-gap-q: clamp(28px, var(--ampy-space-l), 40px);` och rad 18 (gäller båda
   skärmar): `--rk-gap-ctl: max(12px, var(--ampy-space-xs));`.
7. `kalkylator/v1/style.css:103` — `font-size: var(--rk-text-under);` i stället för `var(--ampy-text-small)`.
8. `kalkylator/v1/style.css:55` — `font-weight: var(--ampy-w-strong);`; ta bort rad 57.
9. `kalkylator/v1/index.html:57` — ta bort klassen `ampy-eyebrow--dash` (valfritt, smak).
10. Kör `node kalkylator/v1/_probe.mjs` och `node tools/shot.mjs kalkylator/v1/index.html _shots/v1 --query "?m=gt"`:
    krav kort ≤ 460 (desktop rot och gt), ≤ 640 (mobil gt), stoppläge ±0 på mobil, prefix = enhet = 28 på desktop.

### v2b

1. `kalkylator/v2b/style.css:49` — `.rk__falt { position: relative; flex: 0 0 15rem; min-width: 0; }`.
   Rad 24: `grid-template-columns: minmax(0, 1fr) minmax(30rem, 1.25fr) max-content;`.
   I mobilblocket (efter rad 114): `.rk__falt { flex: 0 0 auto; }` (kolumnriktning: flex-basis skulle annars bli höjd).
   Verifiera: fyll i `1200000` och kontrollera `input.scrollWidth <= input.clientWidth`; kontrollera att fråga 2 står
   på en rad.
2. `kalkylator/v2b/style.css:40` — ta bort `margin-top: auto;` (behåll `padding-top: max(12px, var(--ampy-space-xs))`).
3. `kalkylator/v2b/style.css:76-82` — `.rk__sub { display: block; margin: var(--ampy-space-2xs) 0 0; max-width: none;
   font-size: var(--rk-under-fs); font-weight: var(--ampy-w-ui); line-height: var(--ampy-lh-body);
   color: var(--ampy-ink-muted); }` och `.rk__not { display: block; margin-top: var(--ampy-space-3xs);
   color: var(--ampy-ink-body); }` (behåll `.rk__not[hidden] { display: none }`).
4. `kalkylator/v2b/style.css:50-54` — lägg till `.rk__input::placeholder { font-weight: var(--ampy-w-ui); }`.
5. `kalkylator/v2b/index.html:22` — `<p class="rk__under" id="rk-q1-under"><span>Villa, radhus eller lägenhet.</span>
   <span>Helt eller delvis.</span></p>` och i style.css efter rad 39: `.rk__under > span { white-space: nowrap; }`.
6. `kalkylator/v2b/app.js:14` — `const namn = mode === 'gt' ? 'grön\u00a0teknik-avdrag' : 'ROT-avdrag';`
   Rad 40: `stoppText.textContent = r.text.replace(/grön teknik/g, 'grön\u00a0teknik');`.
7. `kalkylator/v2b/style.css:86` — `font-size: 18px; font-weight: var(--ampy-w-medium);` (ersätter
   `var(--ampy-text-body)` och `var(--ampy-w-ui)`).
8. `kalkylator/v2b/style.css:44` — `font-weight: var(--ampy-w-strong);`.
9. `kalkylator/v2b/style.css:6` — lägg till före: `body.ampy { background: var(--ampy-bg-surface); }` (demon på vit
   sida som artikelmallen).
10. Ägarbeslut, först därefter: kvittoraden. `.rk__band { display: grid; grid-template-columns: 1fr auto;
    column-gap: var(--ampy-space-m); align-items: baseline; }`, etikett + `.rk__sub` i vänster cell, `.rk__tal` i höger
    med `justify-self: end; text-align: right`, stoppläget `grid-column: 1 / -1`.
11. Kör `node kalkylator/v2b/_probe.mjs` + `tools/shot.mjs` (rot + gt): krav fråga → kontroll 14 i alla tre spalter,
    "1 200 000" utan klipp, femårsraden på egen rad, "grön teknik" obruten i H2 och stopptext på mobil.

### v3

1. `kalkylator/v3/style.css:5` — `.ak-body { background: var(--ampy-bg-surface); }` (demon på vit sida).
   Om värden kan vara sky mist, dessutom: rad 25 `.ak__kort { padding: var(--ampy-space-s); overflow: hidden;
   container-type: inline-size; container-name: ak-kort; }`; rad 29-35 `.ak__kort.ampy-card > .ak__hero { display: flex;
   flex-direction: column; gap: var(--ampy-space-2xs); margin: 0; padding: var(--ampy-space-s); background:
   var(--ampy-bg-subtle); border-radius: var(--ampy-radius-field); }`; rad 77 `.ak__fragor { … padding: 0
   var(--ampy-space-s) var(--ampy-space-s); margin-top: var(--ampy-space-m); }`; rad 101 samma padding för hjälten på
   mobil. Kontrollera att etikett, tal och frågor fortfarande börjar på x = 270,6 (desktop).
2. `kalkylator/v3/style.css:124` — `.ak__under { grid-row: 3; width: max-content; margin-top: var(--ampy-space-2xs); }`.
   Krav efteråt: underraden en rad, kortet ≈ 404 px, kontroll → kortkant under fråga 2/3 ≈ 74,5 (var 98,5).
3. Ta bort bocken: `kalkylator/v3/index.html:27-29`; `style.css:20, 46-53, 74`; `app.js:6` (`bock`), `app.js:42`.
4. `kalkylator/v3/style.css:67-69` — `.ak__rad { display: flex; flex-wrap: wrap; gap: 0; … }`, `.ak__per { flex: 0 0 100%;
   color: var(--ampy-ink-muted); }`, `.ak__not { flex: 0 0 100%; margin-top: var(--ampy-space-3xs); color:
   var(--ampy-ink); }`. Vill ägaren att hjälten står stilla i femårsläget: `.ak__rad { min-height: 55px; }`.
5. `kalkylator/v3/app.js:12` — `const namn = mode === 'gt' ? 'grön\u00a0teknik-avdrag' : 'ROT-avdrag';`
   Rad 38: `stoppText.textContent = r.text.replace(/grön teknik/g, 'grön\u00a0teknik');`.
6. `kalkylator/v3/style.css:24` — `.ak__rubrik { margin: 0 0 var(--ampy-space-stack-lg); }`.
7. `kalkylator/v3/style.css:36` — `.ak__etikett { margin: 0 0 4px; }` (etikett → tal ≈ 14).
8. `kalkylator/v3/style.css:78` — lägg till `letter-spacing: var(--ampy-ls-heading);`.
9. `kalkylator/v3/index.html:34` — path `M6 6l12 12M18 6L6 18` (krysset 12 px, som v1/v2b).
10. `kalkylator/v3/style.css:92` — `padding-right: calc(var(--ampy-space-xs) + 1.4em);`.
11. Ägarbeslut, först därefter: mobilordningen. I `@container ak-kort (max-width: 439px)`: `.ak__kort { display: flex;
    flex-direction: column; } .ak__fragor { order: 1; margin-top: 0; } .ak__kort.ampy-card > .ak__hero { order: 2;
    margin: var(--ampy-space-l) calc(-1 * var(--ak-kort)) calc(-1 * var(--ak-kort)); border-bottom: 0; border-top: 1px
    solid var(--ampy-line); }` (justera om punkt 1b är gjord). Alternativ: behåll och testa på riktig telefon med
    tangentbordet uppe.
12. Kör `node kalkylator/v3/_probe.mjs` + `tools/shot.mjs` (rot + gt): krav hjälten läses som panel i kortet, underraden
    en rad, ingen bock, femårsraden på egen rad, "grön teknik" obruten på mobil.
