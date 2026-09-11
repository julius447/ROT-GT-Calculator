# Riktning A: Villkorstavlan (anteckningar från bygget, 2026-09-11)

## 1. Idén i tre meningar

Frågan och villkoret är samma rad: tavlan består av villkorsrader där villkorstexten (ur `result.villkor[]`) står
till vänster, svarschipsen till höger och märket (bock, hålring "antaget", frågeteckenring, varningstriangel,
kryss, dämpad bock "det sköter vi") längst ut. Beskedet är summan av tavlan och sitter som en smal remsa överst
(sticky på desktop; på mobil speglas det i bottenremsan), beloppet är en lugn rad under tavlan, inte en hero-siffra.
Det besökaren minns: sex rader, alla gröna, då gäller det.

## 2. Vad som byggdes, och var jag avvek

**Filer:** `index.html` (server-renderat förvalsläge, genererat av `_build.mjs` ur samma renderare som JS:en
hydrerar med, så statisk markup och DOM aldrig glider isär), `styles.css` (bara tokens, fem lokala variabler
kommenterade överst), `app.js` (ES-modul, importerar `../../logik/ui-model.js`), `_build.mjs` (skriver index.html),
`_probe.mjs` (Playwright: höjder + 55 interaktionstester), `skarmdumpar/` (sex PNG, 2x).

**Tavlan.** Huvudraderna byggs av bankens synliga frågor i bankordning; varje villkorsrad från motorn hängs på
raden för sin `fraga` (underfrågan `arbetstyp` bor i värdeårsraden, så "femårsregeln" är en rad med två
chipsgrupper). Villkorsrader vars fråga ligger under Fler detaljer, eller saknar fråga (F-skatt), ritas som kompakta
rader efter huvudraderna med "Stämmer inte?" som öppnar Fler detaljer och fokuserar reglaget. Beloppsraden är
informativ: vänsterkolumnen visar avdraget (`belopp.rubrik`) under etiketten "Ditt avdrag, preliminärt", och tar
takvarningen (`tak`, fraga=belopp) som andra rad. Rader utan villkorsrad (t.ex. `agare` i GT-batteri) får bara
etikett + reglage och en neutral prick. Efter ett stopp (kryss) dämpas raderna under till 0,55 men förblir
interaktiva; vid hyresrätt döljer banken själv belopp/skatt, så där finns inget under att dämpa (UX §9 vill gråa
ut beloppsfrågan i stället; jag följde banken, `shown: false`).

**Beskedsremsan:** eyebrow + rubrik (`--fs-h3`, 600) + ram, klassen bärs av märket och en 3 px vänsterkant
(teal för ja/ja_villkor, midnight för troligen/nej/osäkert), aldrig en fylld bakgrund. Design-hooken
(impeccable) flaggade kanten som "side-tab accent"; den är föreskriven i riktningsbriefen och behålls medvetet.
Sticky topp inom tavlan på desktop (>= 992) i fristående läge.

**Chips:** vit yta, 1,5 px linje, vald = bläck (`--ink`) med vit text, inte teal: riktningen reserverar teal för
märken och den enda CTA:n. 44 px desktop, 48 px mobil, etiketter radbryts i chippen, kapas aldrig.

**Bekräfta-trycket.** Ett tryck på en redan vald chip ger inget `change`-event, men det trycket är hela poängen
(antaget -> bekräftat). Därför lyssnar jag på `click` och `change`, idempotent, och räknar trycket som `touched`.

**Embed.** Artikelattrapp (bild 230 px, H1 två rader, två ingressstycken) -> verktyget (H2/H3) -> "Snabbfakta".
Kompakt kort: villkorsraderna för Fler detaljer, "Vad händer nu", dela och "Så har vi räknat" ligger bakom "Visa
villkoren"; Fler detaljer ligger också där (så tavlan i embed är bara beskedet + huvudraderna). Hjälptexter och
"Annat belopp" är dolda i embed, "Skriv ut" saknas i embed (05 §6), URL:en rörs aldrig. **Avvikelse:** på mobil i
embed är huvudraderna kompakta: märke + villkorstext + "Svara" (beloppsraden: "Ändra pris"); trycket på
villkoret öppnar radens chips i raden (`aria-expanded`, `aria-controls`), och raden stannar öppen. Skälet är
mätningen i §3: med chipsen öppna kostar tavlan 1 763 px på 390 px. Fristående sida och desktop-embed har alla
chips öppna från start.

**Mobil fristående:** frågor -> besked (tavlan är beskedet, remsan överst är statisk), bottenremsa 56 px efter
första interaktionen eller scroll förbi första raden, döljs när beskedsblocket (belopp + steg + CTA) är >= 50 %
synligt, speglar primär-CTA:n när blocket passerats (aldrig tel). Länk med parametrar på mobil scrollar till
beskedsremsan.

**Övrigt enligt brief:** live-omräkning synkront på varje ändring; count-up (280 ms) bara när beloppet ändras;
rubrikbyte tonar 140 ms; märkesbyte 150 ms; reduced motion stänger allt. Fast höjd på beloppsblocket i alla
belopps-tillstånd utom `dold` (hårt nej), där blocket faller ihop, se §6. `aria-live="polite"` med 600 ms
debounce. `replaceState` med 400 ms debounce, utm/gclid/fbclid bevaras. "Kopiera länk" = `navigator.share` på
mobil, annars urklipp + `role="status"` "Länk kopierad"; länken är alltid den fristående URL:en utan `src`.
Print-stilmall: besked, villkorsrader med märken och "antaget", belopp, vad händer nu, så har vi räknat, plus
datum och länk till verktyget. Utan JS: förvalsläget + statisk beloppstabell (10/20/50/100/200 tkr, taket markerat,
räknad ur `PARAMS`), `<noscript>`-rad. Ingen nätverkskod; `track()` pushar till `window.dataLayer` om den finns,
events per UX §10 med buckets, aldrig belopp eller inkomst i klartext.

**Statisk fil:** index.html innehåller BÅDA verktygen (ROT synligt, GT `hidden`), så `?m=gt` bara visar det andra;
`?surface=embed` ritas om av JS (H2/H3, kompakt kort). I produktion server-renderar shortcoden rätt yta.

## 3. Uppmätta höjder (Playwright, `getBoundingClientRect`, CSS-px)

| Läge / yta | Desktop 1440 | Mobil 390 | Budget |
|---|---|---|---|
| ROT fristående, verktyget (kort + disclaimer) | 2 076 (kort 2 009) | 2 773 (kort 2 667) | ingen |
| GT laddbox fristående | 1 977 (kort 1 910) | 2 548 (kort 2 442) | ingen |
| ROT i artikeln, kompakt kort | 1 386 (kort 1 319) | **1 154 (kort 1 048)** | 900 |
| GT laddbox i artikeln, kompakt kort | 1 263 (kort 1 196) | **1 094 (kort 987)** | 900 |
| ROT i artikeln med chipsen öppna (variant som förkastades) | 1 487 | 1 763 | 900 |

Verktyget börjar 801 px ner på mobil (demo-remsan 72 px inräknad, dvs. ca 730 px artikel, mot mallens 640).
"Snabbfakta" börjar vid 1 988 px (ROT) / 1 927 px (GT) på mobil; UX §6.2 vill senast ca 1 540.

Var pixlarna sitter i ROT-embed på mobil (kompakt): rubrik + lead 74, beskedsremsa 101, fyra rader 370
(100/100/95/76), beloppsblock 235 (etikett, belopp, basrad 3 rader, att betala 2 rader, källrad 2 rader), CTA +
tel 108, "Visa villkoren" 53, disclaimer 91, kortets padding ca 50. Det som återstår över budgeten (ca 250 px)
är doktrininnehåll (basraden, att betala, källraden, tel-länken, disclaimern), inte luft. Med chipsen öppna
kostar de fyra raderna ensamma 934 px (5 + 5 + 4 chips på tre rader vardera); UX §6.2 räknade med 100 px per
fråga, det stämmer inte för radiochips med fem alternativ. 06-riktningar.md:s "höjdrisk i embed: låg" var alltså
fel för den här radanatomin; det kompakta läget är svaret.

## 4. Interaktionstestet (`node wireframes/a-villkorstavlan/_probe.mjs`)

55/55 gröna, 0 JS-fel, `overflowX` false på båda viewports i alla tre lägena (tools/shot.mjs).
Bland annat: load ger "Ja, om det här stämmer:" (ja_villkor) och dold remsa; Hyresrätt -> NEJ, kryss på raden,
ingen solid knapp, beloppsblocket tomt; två "vet inte" -> OSÄKERT med solid tel-knapp och frågeteckenringar;
allt bekräftat -> JA med tre bockar; förval 60 000, stepper +5 000, tomt fält = takläge, formatering vid blur;
Fler detaljer öppnar, två ägare ger kompakt villkorsrad; "Stämmer inte?" fokuserar kryssrutan under 18; klick på
villkorsrad fokuserar chipen; Kopiera länk ger "Länk kopierad" och en URL med `m=rot&a=42000&o=2`; URL:en
uppdateras; låg inkomst -> troligen inte utan knapp; 2026 ej färdigt -> nej, raderna under dämpas; remsan döljs
när beskedet syns; GT batteri + nej solceller -> "Räkna med ROT i stället", lägesbytet bevarar boende; länk
`?m=gt&l=sol&a=150000` förifyller som antaget (hålringar); embed: H2, kompakta rader med aria-expanded, öppning +
fokus, bekräftat svar tänder bocken, ingen remsa, inget "Skriv ut", URL orörd, kopierad länk utan `surface`;
utan JS: statisk tabell + förvalsbesked + riktiga radioknappar; fieldset/legend, aria-live, inputmode=numeric,
kontrast brödtext 17,9:1 och hjälptext 6,3:1.

## 5. LOCAL_COPY (strängar som saknas i COPY, ligger i app.js)

- `ui.title.rot` "Gäller ROT-avdraget dig?", `ui.title.gt` "Gäller grön teknik-avdraget dig?"
- `ui.lead.standalone` "Svara på raderna. Beskedet räknas om medan du svarar.", `ui.lead.embed` samma plus
  "Inget mejl, ingen inloggning." (05 §6: raden står bara i embed)
- `ui.visa_villkoren` "Visa villkoren", `ui.svara` "Svara", `ui.andra_pris` "Ändra pris", `ui.till_beskedet`
  "Till beskedet", `ui.lank_kopierad` "Länk kopierad"
- `ui.galler_inte` "Gäller inte i det här läget" (UX §9), `ui.avdrag_label` "Ditt avdrag, preliminärt"
- `ui.oka` / `ui.minska` "Öka/Minska med {steg} kronor" (aria-label på stepperknapparna)
- `ui.kalla` "Regler: Skatteverket, kontrollerade 2026-09-11. Gäller betalningar 2026." (05 §3.1)
- `ui.noscript` "Slå på JavaScript för att räkna på ditt fall.", `ui.utskrift` "Utskrivet {datum}. Räkna själv: {url}"
- `ui.static.*` (den statiska tabellens rubriker), `ui.demo.*` och `ui.artikel.*` (demo-remsan och
  artikelattrappen, ingår inte i verktyget)

## 6. Öppna frågor för ägaren

1. **Embed-budgeten.** Kompakt kort landar på 1 154 px mot 900. Vill du ha 900 måste något av doktrininnehållet
   fällas i embed (källraden och basraden bakom "Visa villkoren" ger ca 90 px, tel-länken 44 px), eller så
   accepteras ca 1 150 px för riktning A i artikeln.
2. **Kompakta rader i embed på mobil** (svaren öppnas per rad) är en avvikelse från "alla chips synliga". Är det
   okej som artikelvariant, eller ska artikeln få tavlan med chipsen öppna (1 763 px)?
3. **Hyresrätt:** banken döljer belopp/skatt (`showWhen`), UX §9 vill gråa ut beloppsfrågan med "Gäller inte i
   det här läget". Vilket gäller? Jag följde banken.
4. **Hårt nej:** beloppsblocket faller ihop (ingen tom yta på 120 px). Det flyttar CTA-raden vid ja -> nej, men vid
   ett nej byts CTA:n ändå till en textlänk. Okej?
5. **Hjälptexten på boende** ("Vi antar att du äger bostaden...") står kvar när kunden valt Hyresrätt och fått
   nej. Copy-agentens sträng; kanske villkorad på svaret.
6. **Dubbleringen** av beloppet (i beloppsraden och i blocket under tavlan) är medveten enligt riktningen; på
   mobil i embed står de 250 px från varandra. Vill du ha bara den ena?
7. **"Svara"/"Ändra pris"** som etikett på de kompakta raderna, och "Ditt avdrag, preliminärt" som etikett, är
   mina utkast (LOCAL_COPY).
8. Chipsens valda läge är bläck (midnight), inte teal, för att teal ska vara märkena och CTA:n ensamma. Godkänt?

## 7. Vad jag inte hann

- Ingen 200 %-zoom-kontroll i webbläsare (allt är i rem, men inte verifierat med skärmdump).
- Bottenremsan är inte testad mot sajtens riktiga ring-bar (finns bara i embed enligt UX §8.2, där remsan är av).
- Count-up är testad i Playwright bara som slutvärde, inte visuellt bildruta för bildruta.
- Desktop-embed (1 386 px) har inget budgetmål och är inte kompaktad.
- Det kompakta läget (`is-compact`) byter bara på resize via klasser; en rad som öppnats stänger aldrig (medvetet),
  men det finns ingen "stäng"-knapp.

---

## Fixrunda 2026-09-11 (efter `PUNCHLISTA.md` / `GRANSKNING.md` 4A, §3, §6)

Allt nedan är kört, inte berättat: `node tools/shot.mjs` (rot, gt, embed, plus `?w=bred`) ger `errors: []` och
`overflowX: false` på båda viewports; `_probe.mjs` 81/81; reviewerns `_review/isolate.mjs` visar `ak-row--ok` på
första raden efter Space; `_review/truth.mjs` desktop + mobil = motorn i alla sex scenarier, 0 JS-fel.
Skärmdumparna i `skarmdumpar/` är omtagna (2x), plus `rot-desktop-bred.png` för punkt 6.

### Punkt för punkt

| # | Punkt | Utfall | Vad som gjordes / varför |
|---|---|---|---|
| 1 | Ett belopp, inte två (A-M1) | **Klar** | `computeView(mode, state, touched, { embed })`: fristående lägger raden inget belopp längre (`lines.unshift` borta; `ui.galler_inte` kvar vid `dold`), beloppsraden visar etiketten + reglaget med neutral prick och blocket under tavlan är det enda beloppet. I artikeln bär raden beloppet (`rows.belopp.amount` → `.ak-stmt__amt`, count-up via `setAmountText` utan att raden ritas om), `renderSum` ritas inte i `core`, och att betala + basraden + källraden ligger överst i "Visa villkoren" (`renderMoreSum`, `#ak-{mode}-moresum`). Versaletiketten "Ditt avdrag, preliminärt" ritas bara i artikeln (`cap` i `renderQRow`), så den finns exakt en gång per yta (A-m4, probe-test). `.surface-embed .ak-sum` struken. Bonus: artikeln skickar nu `src: 'artikel'` till `evaluate()` (S-4 låg i motorn, nu stödd), offert-CTA:n i embed bär `src=artikel`. |
| 2 | Tangentbordsbekräftelse (A-M2) | **Klar** | `keydown` i `bind`: Space/Enter på en redan vald `input[type=radio][data-q]` → `preventDefault()` + `radioAnswer(el)` (idempotent). Probe: Space på förvald värdeår → `ok`, Enter på förvald skatt → `ok`, värdet byts inte, pil byter värde och räknar om; mus: klick på förvald chip → `ok`. `isolate.mjs`: `a_confirm_keyboard_space` = `["ak-row--ok", ...]`. |
| 3 | Kompakta radernas affordans (A-M3) | **Klar** | `.ak-row__stmt` är nu `display: grid`, hela villkorskolumnen är knappen, ≥ 44 px via `padding: 0.6rem 0; margin: -0.6rem 0` (texten flyttar sig inte). Innehållet ligger i `.ak-row__lines` + `.ak-row__open` = "Svara"/"Ändra pris" i `--ink`, `--w-semi`, utan understrykning, med inline-SVG-chevron (1,75 px) längst till höger, vertikalt centrerad. Första huvudraden (`boende`) öppnas från start i kompakt läge (`syncCompact`). `aria-expanded` + `aria-label="Svara: {villkor}"` (`"Ändra pris: {belopp}"` på beloppsraden) bara i kompakt läge (`syncStmtA11y`, synkas vid varje `update`). Rader utan villkorsrad (t.ex. `agare` i batteri) visade förut bara en prick i kompakt läge (latent bugg); nu visas frågans etikett som reserv (`.ak-stmt__q`). |
| 4 | Embed-höjd (A-M4) | **Delvis** | Punkt 1 gav 924 px med alla rader stängda (reviewern mätte 912; +12 är att skatt-raden går på två rader när "Svara ›" får en egen kolumn). Men punkt 3 (första raden öppen) kostar 172 px: **som byggt 1 096 px (ROT), 1 107 (laddbox), 1 264 (batteri)**. Verifieringsraden "≤ 920" och punkt 3 går inte ihop; jag följde punkt 3 (affordansen är en konverteringsfråga, höjden är en budgetfråga) och redovisar båda talen nedan. Att stänga första raden är en rad i `syncCompact`. |
| 5 | Kontrast (A-M5) | **Klar** | Eyebrow i ja-lägen i `--ink-muted` (6,3:1), teal-regeln struken (klassen bärs av kanten + märket). Dessutom all teal TEXT på vit borta lokalt: "Länk kopierad" i bläck (17,9:1), hover på `.ak-link`, `.ak-row__fix`, källraden och sekundärlänken i bläck med teal bara som understrykning. Probe sveper `#ak-rot *` och hittar ingen teal text utanför CTA-knappen. CTA-knappen kvar på produktions-token (2,96:1, ägargrind S-1). |
| 6 | Tavlans bredd (A-m1) | **Klar (variant)** | `body.is-wide { --ak-measure: 104rem; --ak-cond-col: minmax(0, 30rem) }`, slås på med `?w=bred` via demo-remsans "Bred tavla" (bara desktop). `skarmdumpar/rot-desktop-bred.png` (1 040 px tavla) mot `rot-desktop.png` (860 px). Ägarfråga, inget valt. |
| 7 | Tabbstopp och tryckytor (A-m2) | **Klar** | `.ak-row__stmt` ≥ 44 px överallt (se 3), `.ak-row__fix` ≥ 44 px via `padding: 1rem 0; margin: -1rem 0`. På ≥ 768 px och ej kompakt: `tabindex="-1"` på villkorsknapparna (sex tabbstopp färre, musklick fungerar). Probe-test. |
| 8 | Hyresrätt (A-m3) | **Noterat** | Bankens beteende kvar (`showWhen` döljer belopp/skatt). Riktning C har gråningen "Gäller inte i det här läget" om ägaren vill se den. Ägarfråga 3 i §6 står. |
| 9 | Reduced motion (A-m5) | **Klar** | Den lokala regeln struken; `tokens.css` stänger allt globalt och `reduced()` i app.js stänger count-up, tona och smooth scroll. |
| 10 | Källrad och tel i embed (A-m6) | **Noterat** | Kvar utanför fällraden (05 §6). Nästa spakar mätta i DOM, se tabellen nedan. |
| 11 | NOTES §4 | **Klar** | Se "Interaktionstestet efter fixrundan" nedan (ersätter "55/55"). |

Motorns två ändringar sedan bygget hanteras: sekundär `kind: 'offert'` ritas som textlänk (`.ak-sec`, tidigare
`.ak-tel` som nu bara är ett tillägg på tel-länken) och `lage_byte` med `solid: false` (sol) ritas som textlänk-knapp
`button.ak-link`; `lageByte()` hårdkodar inte längre `rot` (sol → batteri byter i samma verktyg, `from`/`to` i
`ampy_ak_mode_select` läses före bytet). Probe: "räcker delvis" = solid tel "Prata med oss innan du beställer" +
offert-textlänk; sol = "Räkna på batteri till solcellerna" som textlänk, ingen solid knapp, tel sekundär, bytet
bevarar boende.

En bugg jag själv införde och hittade med reviewerns scenario 2 (värdeår 2021–2025 + belopp skrivet tecken för
tecken): underfrågans radmodell saknade `amount`, så en tom beloppsplats ritades och `setAmountText` fick
`undefined` (sex `TypeError` under count-up). Rättat (`amount: null` på underrader, `!= null`-vakt, `setAmountText`
tål `null`/saknat element); sekvensen ligger nu i `_probe.mjs` (7b) för båda ytorna.

### Uppmätta höjder efter fixrundan (Playwright, CSS-px, `_probe.mjs` §1)

| Läge / yta | Desktop 1440 | Mobil 390 | Budget |
|---|---|---|---|
| ROT fristående, verktyget (kort + disclaimer) | 2 053 (kort 1 985) | 2 761 (kort 2 654) | ingen |
| GT laddbox fristående | 1 977 (kort 1 910) | 2 536 (kort 2 429) | ingen |
| ROT i artikeln, kompakt kort, **första raden öppen (som byggt)** | 1 183 (kort 1 116) | **1 096 (kort 989)** | 900 |
| GT laddbox i artikeln | 1 086 (kort 1 019) | **1 107 (kort 1 001)** | 900 |
| GT batteri i artikeln | 1 396 (kort 1 328) | **1 264 (kort 1 157)** | 900 |

Varianter i artikeln på 390 px (mätta i DOM på samma sida, verktyget inkl. disclaimer):

| Variant | ROT | GT laddbox | GT batteri |
|---|---|---|---|
| Som byggt: första raden öppen | 1 096 | 1 107 | 1 264 |
| Alla rader stängda (reviewerns punkt 1-mått) | 924 | 935 | 1 092 |
| Första raden öppen, utan tel-länken | 1 040 | 1 051 | 1 208 |
| Första raden öppen, utan tel och lead | 992 | 1 004 | 1 160 |
| Alla stängda, utan tel | 868 | 879 | 1 036 |
| Alla stängda, utan tel och lead | 820 | 832 | 988 |

Verktyget börjar 712 px ner (exkl. demo-remsan; mallen räknar 640). "Snabbfakta" börjar vid 1 840 (ROT) /
1 851 (laddbox) / 2 008 (batteri) exkl. demo-remsan; UX §6.2 vill ≤ ca 1 540. Med alla rader stängda: ca 1 668.
Var pixlarna sitter (ROT, som byggt): rubrik + lead 74, beskedsremsa 101, boende öppen 272 (varav chips 172),
värdeår 100, belopp 95, skatt 100 (var 76: "Svara ›" tar en egen kolumn), CTA + tel 108, "Visa villkoren" 52,
disclaimer 91, kortets padding ca 50.

### Interaktionstestet efter fixrundan (`node wireframes/a-villkorstavlan/_probe.mjs`)

**81/81 gröna, 0 JS-fel** i alla höjdmätningar och testblock. Nytt sedan bygget: bekräfta genom att trycka på
förvalet med mus (klick på vald chip → `ok`) och tangentbord (Space och Enter på vald radio → `ok`, värdet byts
inte; pil byter värde), scenario 2 tecken för tecken på båda ytorna (underfråga synlig + count-up, inga fel), ett
belopp per yta (fristående: blocket, `ak-row--nocond` på beloppsraden; artikeln: `.ak-stmt__amt` = motorns rubrik,
inget `#ak-rot-sum`, att betala + basrad + källrad i stängd "Visa villkoren", `src=artikel` i offert-hrefen),
kompakt läge (första raden öppen, övriga stängda, `aria-expanded`, `aria-label "Svara: …"`, ≥ 44 px tryckyta,
chevron, ink utan understrykning, tryck öppnar + fokuserar), `tabindex=-1` på ≥ 768, "Stämmer inte?" ≥ 44 px,
kontrast (eyebrow 6,3:1, "Länk kopierad" 17,9:1, sekundärlänk 6,3:1, ingen teal text utanför CTA-knappen),
"räcker delvis"-CTA och sol-CTA. Kvar oförändrat: allt ur §4 ovan.
Reviewerns egna prober: `isolate.mjs` → `a_confirm_keyboard_space: ["ak-row--ok", "ak-row--antaget", ...]`;
`truth.mjs desktop` och `mobile` → A = motorn i sex av sex (rubrik, belopp, att betala, eyebrow, ram, CTA,
sekundär), `errors: []` i alla tolv körningar.

### Ändringar i LOCAL_COPY

- `ui.demo.bred` "Bred tavla" (demo-remsan, ingår inte i verktyget).
- `ui.svara` används nu också i `aria-label` ("Svara: {villkor}"), `ui.andra_pris` likaså.

### Öppna frågor som fixrundan lägger till eller ändrar (för ägaren)

- **Fråga 1 (embed-budgeten) uppdaterad:** som byggt 1 096 px; med första raden stängd 924; spakarna (tel, lead)
  ger 868/820 med stängda rader. Under 900 kräver antingen stängd första rad + tel bort, eller stängd rad + kortare lead.
- **Fråga 6 (dubbleringen) är stängd:** ett belopp per yta.
- **Fråga 7 (etiketterna):** "Svara"/"Ändra pris" står kvar som mina utkast, nu som knappetikett med chevron.
- **Ny, A-m1:** 860 px eller 1 040 px bred tavla på desktop (`rot-desktop.png` mot `rot-desktop-bred.png`).
- **Ny, till copy-agenten (logik/, inte min mapp):** i sol-läget säger steg 1 "Stämmer det att du äger bostaden? Då får
  du ett pris efter avdrag" bredvid en CTA som medvetet inte säljer sol (GT GRIND 8). `s.ja.*` behöver en solvariant.

### Det jag inte håller med om i punchlistan

- Punkt 4:s "löses av punkt 1 (912 px)" och punkt 3:s "öppna första raden från start" adderar inte ihop; öppen rad
  kostar 172 px. Jag valde affordansen och redovisar båda måtten. Vill ägaren ha 924 är det `syncCompact` (en rad).
- Punkt 1 lade basraden ("Beror på hur stor del … som är arbete") utanför förslaget; jag tog med den i "Visa
  villkoren" tillsammans med att betala och källraden, för utan den står intervallet i raden utan förklaring och
  det kostar inget synligt.
