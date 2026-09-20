# 14. Slutgranskning av koden före lansering + paketeringsplan för WordPress (Bricks + FluentSnippets)

Status: KLAR 2026-09-20. Granskare: Opus 5 (ensam, inga underagenter). Ingen källfil är ändrad av mig. Det som
skrivits: den här rapporten och bevisfilerna i `research/underlag/14-kod/` (probskript, körutdata, tre nedladdade
värdsidesfiler från ampy.se daterade 2026-09-20).

> **Källfilerna ändrades under granskningen.** Kl. 22:11 skrev research/12-agenten (logikgranskningen) om
> `kalkylator/rakna.js`, `kalkylator/v1/index.html` och `kalkylator/v1/style.css` (git: 46 rader in, 35 ut:
> `inkomstDelar()`, ny `siffra()`, `maxlength="9"` på alla fält, ny underrad "Själva avdraget, inte hela fakturan."
> med `aria-describedby` på två id:n, "Låneräntor", "Fyllde du 66 i år"). `app.js` och `engine.js` är orörda.
> Alla fynd nedan är omkörda mot den nya versionen kl. 22:30-22:45 och radnumren avser den. Ändringen införde ett
> nytt fel (M4) och ett nytt beteende (m1, `maxlength`), båda med bevis.

Taggar: `[MÄTT]` = kört i Chromium (Playwright 1.62, Node 25) eller Node mot koden som den ligger, skript och utdata
i `research/underlag/14-kod/`. `[LÄST]` = läst i källan på angiven rad. `[GAP]` = saknas, gissas inte.

---

## 0. Sammanfattning för Julius

**Vad som granskats.** `kalkylator/v1/index.html`, `style.css`, `app.js`, `kalkylator/rakna.js`,
`logik/engine.js` (bara skatteutrymme + hjälpare), designsystemets filer i `kalkylator/system/` som skulle följa med,
artikelvarianten `kalkylator/artikel/` och leveranskontraktet `fluentsnippets-delivery.md`. Allt är mätt, inte
läst ur minnet: 9 skript, 4 renderingar (ROT/GT × 1280/390), 150+ DOM-kontroller, kontrast på 20 färgpar, en
tvåinstans-sida, och tre av sajtens riktiga CSS-filer hämtade i dag.

**Utfall i en mening.** Kalkylatorn v1 som den ligger på GitHub Pages har **inga blockerare**: giltig HTML, inga
konsolfel, inga externa anrop, alla textfärger klarar WCAG AA, reduced motion respekteras, personer läggs till
och tas bort med rätt numrering och fokus. Ett Major (M4) kom in med 22:11-ändringen och ska rättas (en funktion
i app.js, patchen är testad). Det som finns är småsaker (m1-m10 i §2.1, var och en med patch eller
motivering; de tre som är värda att göra före paketeringen är m1, m3 och m4, se K4).

**Men WordPress-paketet får inte byggas som en ren kopia.** Tre blockerare och en major (M3 i §2.1) måste lösas
i paketeringen, och två fel i artikelklonen måste rättas innan den får bli förlaga:

| # | Rang | Vad | Bevis |
|---|---|---|---|
| B1 | Blockerare (paketet) | Två kalkylatorer på samma sida: den andra är död (inte kopplad), 32 dubbla id:n, båda visar samma svar. `app.js` söker `#id` och `input[name]` i hela dokumentet och kör som en modul en gång. | `[MÄTT]` `ut-multi.json` |
| B2 | Blockerare (paketet) | CSS som skulle läcka ut i hela sajten om den klistras som den är: `[hidden]{display:none!important}` (style.css:184) och designsystemets globala regler (`*`, `html{font-size:62.5%}`, `body`, `svg`, `button,input`, `h1..figure`) i base.css:29-45. | `[LÄST]` |
| B3 | Blockerare (paketet) | Två `rem`-värden som beror på sajtens 10 px-rot: `flex: 0 0 14rem` (style.css:82 → 140px) och `@container (max-width: 34rem)` (falt.css:257 → 340px). Inga rem via tokens: alla 68 tokens kalkylatorn använder löser ut till px, färg eller enhetslöst. | `[MÄTT]` `ut-tokens.txt` |
| M1 | Major (artikelklonen + paketet) | Sajtens egen FluentSnippet "14-global-css" (ligger live, hämtad i dag) har `input:focus { border-color:#5EB1BF !important }`. I artikelklonen blir fältets fokuskant därför ljusblå (#5EB1BF) i stället för teal-deep (#007a69). | `[MÄTT]` `ut-fokus.txt` |
| M2 | Major (artikelklonen) | `artikel.css:38` (`.ampy-kalkylator input[type="text"] { box-shadow:none }`) slår ut fokusringen på alla fält i artikelvarianten (`box-shadow: none` när fältet har fokus; v1 visar ringen). WCAG 2.4.7 faller i inbäddat läge. | `[MÄTT]` `ut-fokus.txt` |
| M4 | Major (v1, nytt kl. 22:11) | Personmallen fick `aria-describedby="rk-enhet-anvant-N rk-under-anvant-N"` (två id:n). `app.js:74` byter bara `-N"` (sista id:t), så varje tillagd person får en hängande referens `rk-enhet-anvant-N` (och `rk-enhet-gtanvant-N`): 6 trasiga referenser efter tre tillägg, "kr"-beskrivningen tappas för person 2-4. Patch verifierad (0 trasiga). | `[MÄTT]` `t14-clone-fix.mjs` |

Resten (M3, tio mindre och fem informativa fynd) står i tabellen i §2.1 med patch per rad. Paketeringsplanen i §3
är skriven så att nästa agent kan bygga `produktion/` i ett svep. Frågorna som bara du kan svara på står i §4
(K1-K7, svara med nummer).

---

## 1. Metod och bevis

Alla skript ligger i `research/underlag/14-kod/` och kan köras igen: `cd research/underlag/14-kod && node <skript>.mjs`
(absoluta sökvägar till repot och till `tools/node_modules/playwright`; egen lokal server; utdata och skärmdumpar
hamnar i katalogen du står i).

| Skript | Vad det bevisar | Utdata |
|---|---|---|
| `t1-siffra.mjs` | `siffra()`/`formatFalt()`/`kr()` på inklistrad text ("300.000", "300 000 kr", "1,2 miljoner", 1e15, 20 siffror) och `beraknaHushall()` på extremvärden | `ut-siffra.txt` |
| `t2-kontrast.mjs` | WCAG-kontrast (WCAG 2.x relativ luminans) för 20 färgpar som kalkylatorn faktiskt använder, alfa-färger komponerade mot sin bakgrund | `ut-kontrast.txt` |
| `t3-probe.mjs` | Renderar v1 i ROT och GT vid 1280 och 390 (touch): konsolfel, alla nätverksanrop, dubbla id:n, `for`/`aria-*`-mål, legend-först i fieldset, lägger till 3 personer, tar bort en, lägger till igen, klistrar in text, stoppläget, reduced motion, print. Sparar datorstilar (font, vikt, storlek, färg, padding) för paritetskontrollen | `probe.json` |
| `t4-htmlcheck.mjs` | Egen strikt HTML-kontroll (taggbalans, void-element, attributcitat, dubbla attribut, dubbla id:n, referensmål, aria-label på generiska element, inputattribut). `html-validate` finns inte offline och `npx` fick inte hämta den | `ut-htmlcheck.txt` |
| `t5-multi.mjs` | Två kalkylatorer på en sida (markupen dubblerad, en gång `data-mode="gt"`): vad som händer | `ut-multi.json` |
| `t6-tokens.mjs` | Vilka komponentregler ur designsystemet som träffar kalkylatorns markup, och varje `--ampy-*`-token löst hela vägen ner: rem eller inte | `ut-tokens.txt` |
| `t7-mini.mjs` | Person 2:s fält uppdaterar beskedet; markörhopp vid redigering mitt i talet; Enter på desktop; segmentetiketten vid 360 px; artikelklonen (utan sajtens CSS, se §2.5) | `ut-mini.json` |
| `t8-host.mjs` | Försök att rendera artikelklonen med sajtens CSS: klonens `flying-press/…`-länkar svarar 404/CORS i dag (fem av nio), därför är klonen inte längre en användbar värdsimulering | (utdata i §2.5) |
| `t9-css.mjs` | style.css parsad i Chromium: 68 regler (efter 22:11), 0 tappade deklarationer | `ut-cssparse.txt` |
| `t11-siffra-patch.mjs`, `t12-caret.mjs` | Patcharna m1 och m4 verifierade (Node resp. Chromium) | `ut-siffra-patch.txt` |
| `t13-maxlength.mjs` | Vad `maxlength="9"` (22:11) gör med skrivna och klistrade tal | (utdata i §2.4) |
| `t14-clone-fix.mjs` + `app-patched-robust.js` | M4: hängande aria-referenser efter kloning i nuvarande app.js, och 0 med patchen | (utdata i §2.4) |
| `t10-focus.mjs` | Fokusringen på inkomstfältet i v1 respektive artikelklonen (sajtens CSS blockerad, bara repofilerna) | `ut-fokus.txt` |

Värdsidans CSS: `host-14-global-css-2026-09-20.css` (sajtens FluentSnippet "14-global-css", olagrad),
`host-bricks-frontend-light-layer-2026-09-20.min.css` (Bricks frontend, allt i `@layer bricks`),
`host-theme-style-ampy-2026-09-20.min.css` (temat, olagrad, `html{font-size:62.5%}`). Hämtade med curl från
`https://ampy.se/elcentral-guide-2026/` och dess `<link>`-adresser 2026-09-20. Artikelklonens egna `<link>` till
`flying-press/…` svarar 404 i dag (cachen är omgenererad), så klonen kan inte längre renderas med sajtens CSS;
det som finns kvar av sajten i klonen är de inline-block som kopierades in (bl.a. "14-global-css").

---

## 2. Del 1: fynd

### 2.1 Alla fynd, rankade

Rang: **Blockerare** = får inte lanseras så. **Major** = fel som syns eller bryter tillgänglighet. **Minor** =
robusthet/hygien, ingen synlig effekt i dag. **Info** = inget att göra, bara veta. "Gäller" säger var felet
finns: v1 (fristående), artikel (klonen) eller paketet (det som ska byggas).

| # | Rang | Gäller | Fynd | Bevis | Patch (sammanfattning, koden står i 2.2-2.5) |
|---|---|---|---|---|---|
| B1 | Blockerare | paketet | Ingen multi-instans: dokumentvida `#id`-sökningar (app.js:5-21), `val(name)` mot `document` (app.js:48, 102, 115-116), modulnivå-state (`lopnummer`, `timer`, `forsta`), `?m=`-läge och `document.title` (app.js:40-46). Två instanser: andra död, 32 dubbla id:n | `ut-multi.json` | §3.3: IIFE med `init(root)`, alla sökningar via klass inom `root`, id-prefix per instans i PHP |
| B2 | Blockerare | paketet | Globala regler som skulle skeppas: style.css:185 `[hidden]`, base.css:29 `*`, :30 `html{62.5%}`, :31-41 `body`, :42 `img,video`, :43 `svg`, :44 `button,input…`, :45 `h1…figure`, :74 `::selection` | `[LÄST]` | §3.2: allt under `.ampy-avdragskollen`, `html`/`body`-reglerna skeppas inte (bas-inbaddad.css:33-38 visar formen) |
| B3 | Blockerare | paketet | `rem`: style.css:82 `14rem`, falt.css:257 `34rem` (style.css:8 `98rem` är demosidan och skeppas inte). Tokens: 0 rem | `ut-tokens.txt` | 140px, 340px |
| M1 | Major | artikel + paketet | Sajtens snippet "14-global-css": `input:focus{outline:none;border-color:#5EB1BF!important;box-shadow:0 0 0 3px rgb(94 177 191/.2)}`. `!important` slår vår `.ampy-input:focus-visible{border-color:#007a69}` (falt.css:79). Fokuskant = #5EB1BF i artikeln | `ut-fokus.txt` rad "artikel": `border: rgb(94, 177, 191)` | Motregel i paketet: `.ampy-avdragskollen .rk__input:focus{border-color:var(--ampy-action-strong)!important}` (samma i artikel.css) |
| M2 | Major | artikel | artikel.css:38 dödar fokusringen: `.ampy-kalkylator input[type="text"]{box-shadow:none}` (0,2,1) > `.ampy-input:focus-visible` (0,2,0) | `ut-fokus.txt` rad "artikel": `boxShadow: none` | Ta bort raden (Bricks-regeln den skyddar mot ligger i `@layer bricks` och förlorar ändå), eller `:where(.ampy-kalkylator) input[type="text"]{box-shadow:none}` |
| M3 | Major | paketet | I GT-läget skrivs rubriken och eyebrowen om av JS (app.js:43-46, 124). I WordPress måste PHP rendera rätt text från start, annars blinkar "ROT" förbi före JS | `[LÄST]` | §3.4: `{{NAMN}}`-platshållare i markupen, PHP fyller i per läge; JS-raden för `document.title` stryks |
| m1 | Minor | v1 (ändrat 22:11) | Före 22:11: ingen längdgräns (20 siffror → fältet skrevs om till ett annat tal) och "300 000,50" → 30 000 050. Efter 22:11: `siffra()` klipper vid komma (`split(',')`) men inte vid punkt ("300000.50" → 30 000 050), och `maxlength="9"` räknar TECKEN i det formaterade värdet: skriv "12000000" → fältet visar "1 200 000" (åttonde siffran tyst borta), klistra "12 000 000" → "1 200 000". Gränsen blir 9 999 999 kr och en inkomst på 12 miljoner går inte att ange | `ut-siffra.txt`, `t13-maxlength.mjs` | rakna.js:13 + stryk `maxlength` (10 fält), se 2.4 |
| m2 | Minor | v1 | `aria-label="kronor"` på `<span>` utan roll (10 st: index.html:66,75,82,89,97,128,137,152,159,167). ARIA 1.2 förbjuder aria-label på generiska element; fungerar i praktiken (VoiceOver läser "kronor") men fälls av validatorer | `ut-htmlcheck.txt` | Stryk `aria-label`; beskrivningen blir "kr". Vill man behålla "kronor": `<span class="rk__enhet" id="…" aria-hidden="true">kr</span>` + `aria-describedby` får peka på en visuellt dold `<span>kronor</span>` (mer markup) |
| m3 | Minor | v1 | `#rk-not` (index.html:198) har `aria-live="polite"` men inte `aria-atomic="true"`; texten byts hel, så uppläsningen kan bli fragment | `[LÄST]` | Lägg till `aria-atomic="true"` |
| m4 | Minor | v1 | Markören hoppar till slutet när man redigerar mitt i ett tal (formatFalt skriver om `value` på varje tangent) | `ut-mini.json` → `caret: 9` efter insättning på position 2 | app.js:152-156, se 2.4 (frivillig) |
| m5 | Minor | v1 | Person 2+:s inkomstfält heter bara "Inkomst förra året" för skärmläsare; "Person 2" (eyebrowen) ingår inte i namnet | `[LÄST]` index.html:115,119,127 | Ge eyebrowen `id="rk-person-etikett-N"` och sätt `aria-labelledby="rk-person-etikett-N rk-inkomst-etikett-N"` |
| m6 | Minor | v1 + paketet | Globala namn: `@keyframes rk-in` (style.css:182), `container-name: rk` (192). Krockar bara om värden har samma namn; osannolikt | `[LÄST]` | Behåll (byte-identiskt) eller prefixa `ampy-avdragskollen-in` i paketet. Rekommendation: behåll |
| m7 | Minor | paketet | `@supports not (container-type: inline-size) { @media (max-width:767px) … }` (style.css:213-234) är en viewport-@media, vilket kontraktet förbjuder för layout. Den är en reserv för Safari < 16 / Chrome < 105 och identisk med @container-blocket (diffad: 0 skillnader) | `[MÄTT]` diff | Behåll (skadar inte i moderna webbläsare), rem→px gäller inte där (inga rem). Ägargrind K3 |
| m8 | Minor | v1 | Ingen print-stil: Chrome skriver inte ut panelens bakgrund/hårlinje som standard; två spalter behålls | `probe.json` → `print` | Frivilligt: `@media print{.rk__panel{print-color-adjust:exact;-webkit-print-color-adjust:exact}}` |
| m9 | Minor | v1 | Segmentets vita pill mot spåret är 1,16:1 och vald/ovald textfärg skiljer 1,2:1 (WCAG 1.4.11 icke-text 3:1). Tre signaler bär valet (pill+skugga, teal-deep, vikt 600 mot 500); mönstret är designsystemets kanon (LED-kalkylatorn) | `ut-kontrast.txt` | Ingen patch här: designsystemsnivå (ägargrind K5) |
| m10 | (uppgått i M4) | v1 | Klonen av personmallen görs via `innerHTML.replaceAll('-N"', …)` (app.js:74): täckte alla attribut så länge varje värde slutade på `-N"`. 22:11-ändringen bröt förutsättningen (två id:n i ett `aria-describedby`), se M4 | `probe.json` (före), `t14-clone-fix.mjs` (efter) | Attributbaserad kloning i 2.4, verifierad |
| i1 | Info | v1 | `submit`-hanteraren (app.js:165) körs aldrig via Enter: formuläret har 5 textfält och ingen submit-knapp, så webbläsaren gör ingen implicit submit. Enter ger ändå omräkning via `change` (mätt: "24 000" direkt) | `ut-mini.json` → `enter` | Behåll som skydd |
| i2 | Info | v1 | `change` + `blur` ger två `rendera()` när man lämnar ett ändrat fält; andra körningen ändrar inget och tonar inte | `[LÄST]` app.js:157-158 | Inget |
| i3 | Info | v1 | Webbläsarkrav i praktiken: `:has()` (Safari 15.4+, för vald pill), `@container` (Safari 16+), `replaceChildren` (Safari 14+), `replaceAll`/`??`/`?.` (Safari 13.1+). `text-wrap: pretty` är progressiv (Chrome 117+, ignoreras annars) | `probe.json` → `textWrapPretty: true` i Chromium | Inget |
| i4 | Info | v1 | Alla 20 textfärgspar klarar AA (lägst 4,54:1: placeholder #6a7190 mot sky mist; 4,80 mot vitt). Teal-core används aldrig som text | `ut-kontrast.txt` | Inget |
| i5 | Info | v1 | 0 konsolfel/varningar, 0 externa anrop (13 anrop, alla lokala), reduced motion → `animation-duration: 1e-06s`, typsnittet self-hostat (44 696 byte, sha256 identisk med sajtens `/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2`) | `probe.json`, curl | Inget |

### 2.2 HTML

**Giltighet** `[MÄTT]`. Egen strikt kontroll (t4, omkörd efter 22:11): 164 taggar, 46 id:n, 0 balansfel, 0 dubbla
attribut, 0 ociterade attribut, 0 dubbla id:n, alla `for`/`aria-labelledby`/`aria-describedby` har mål i den
statiska sidan (efter kloning: M4). Chromium bygger samma träd som
källan (fieldset-first-child är legend i alla 4, `<template>` har 1 barn, inga parser-tillrättalägganden). Enda
utslaget är m2 (aria-label på span).

**Semantik** `[LÄST]`.
- Fråga 1-3 och inkomsten: `fieldset` + `legend` (rad 20-21, 29-30, 39-40, 55-56). Radioknappar i `label` med
  `<span>`, text = namn. Fråga 1:s radios bär `aria-describedby="rk-under-1"` (finns).
- Person 2+ ålder: `div role="radiogroup" aria-labelledby="rk-alder-etikett-N"` (rad 138-139), motiverat i
  kommentaren (fieldset kan inte vara flex-rad). Korrekt.
- Beloppsfälten: `aria-labelledby` mot legenden (inkomst) eller `label for` (pension, ränta, använt). Enhet via
  `aria-describedby` → "kr" (m2).
- Live-regioner: `#rk-talrad` (polite, atomic), `#rk-stopp` (polite, atomic, `hidden` tills stopp), `#rk-not`
  (polite, ej atomic, m3). Ordningen i JS (visa först, skriv texten sedan, app.js:127-128) gör att stoppbeskedet
  läses upp. Eyebrowens "Ditt/Ert" byts utan uppläsning: rätt, den bär ingen ny information.
- `hidden`: används på stopp, not, prefix, enhet, "Lägg till"-raden. Bara `.rk__stopp` (display:flex) behöver
  `[hidden]{display:none!important}`; övriga är inline/block. Regeln är därför nödvändig men ska vara scopad (B2).
- Rubriknivå: `h2.ampy-h2` utanför `<section aria-labelledby="rk-rubrik">` (rad 15-17). I artikeln hamnar den i
  raden av artikel-H2:or (rätt nivå i artikelspalten). I högerspalten är H2 diskutabelt; paketet får
  `heading_level="2|3"` (§3.4).
- Inputattribut: alla 10 textfält har `type="text" inputmode="numeric" autocomplete="off" enterkeyhint="done"`
  (t4 kontrollerar varje). Inget `type="number"` (avsiktligt: mellanslag i talet).
- `<form novalidate autocomplete="off">` utan `action`: Enter kan aldrig ladda om (i1).

**Kloningen ur `<template>`** `[MÄTT]`. Efter "Lägg till" ×3: radiogrupper `typ-2/alder-2 … typ-4/alder-4`, id:n
`rk-inkomst-2 … rk-enhet-gtanvant-4`, 0 dubbletter. Ta bort person 3 → etiketter numreras om till "Person 1/2/3"
medan namnen förblir `typ-1/typ-2/typ-4` (rätt: löpnumret återanvänds aldrig, så ett nytt tillägg får `typ-5`,
inga krockar). Fokus: efter tillägg på det nya inkomstfältet (`rk-inkomst-4`), efter borttag på "Lägg till en
person". `replaceAll('-N"')` täcker `name="alder-N"`, `for="rk-ranta-N"` och `aria-labelledby="rk-alder-etikett-N"`
eftersom de slutar på `-N"` i den serialiserade mallen (innerHTML citerar alltid med dubbla citattecken).
**Men** (M4, sedan 22:11): `aria-describedby="rk-enhet-anvant-N rk-under-anvant-N"` (index.html:160, 168) har
två id:n, och bara det sista byts. Resultat efter tre tillägg: sex hängande referenser
(`rk-enhet-anvant-N`, `rk-enhet-gtanvant-N` ×3), person 2-4:s "använt"-fält tappar beskrivningen "kr" och
sidan är inte längre giltig. Före 22:11 var det 0. Patchen i 2.4 byter alla `-N` i attributen, verifierad:
0 hängande, samma numrering, samma tal (`t14-clone-fix.mjs`).

### 2.3 CSS

**Scope** `[LÄST]`. Alla regler i style.css utom fyra är under `.rk`/`.rk__*`/`.rk-*`:
`.rk-sida` (rad 7, body på demosidan), `.rk-spalt` (rad 8-9, 192, 235-237, demosidans spalt), `[hidden]` (rad 185)
och `@keyframes rk-in` (182). De två första skeppas inte; `[hidden]` scopas; keyframes behålls. Designsystemets
filer bär globala regler (B2-listan) som bas-inbaddad.css redan scopat till `.ampy` för artikeln; paketet gör
samma sak med `.ampy-avdragskollen`.

**rem** `[MÄTT]`. I det som skeppas finns exakt två: `flex: 0 0 14rem` (style.css:82) och
`@container (max-width: 34rem)` (falt.css:257). Konvertering vid 1 rem = 10 px: 140px, 340px. Tokens: alla 68
`--ampy-*` som kalkylatorn refererar löser ut till px-clamp, färg, ms, cubic-bezier eller enhetslöst (0 rem;
listan i `ut-tokens.txt`). `em`: en förekomst, `1.1em` i `.rk__input` padding-right (rad 111), relativ till fältets
egen fontstorlek, korrekt att behålla. `vw`: tokens är vw-baserade clamp() (sajtens fluida skala), samma i
referensen, ingen drift.

**@container + reserv** `[MÄTT]`. `.rk-behallare, .rk-spalt { container-type: inline-size; container-name: rk }`
och `@container rk (max-width: 719px)`. Reservblocket under `@supports not (container-type: inline-size)` +
`@media (max-width: 767px)` är diffat mot @container-blocket: identiskt. Brytpunkterna skiljer (719 behållare mot
767 viewport) vilket är avsiktligt: reserven kan bara se skärmen. I en smal kolumn på bred skärm ger reserven två
spalter i 384 px i Safari 15; samma i referensen, accepteras (i3, m7).

**`.rk__ihop`** `[MÄTT]`. I GT-läget finns spannet på två ställen (rubrik + eyebrow, i stoppläget även beskedet),
`white-space: nowrap; display: inline-block`. Ordet "grön teknik-avdrag" bryts aldrig: nowrap stoppar mellanslaget,
inline-block stoppar bindestrecket (Chrome bryter annars efter "-"). Fungerar, `skriv()` gör bara DOM-ändring när
texten faktiskt byts (app.js:27-36).

**Dubbla/motsägande regler.** De två staplade blocken (194-211 och 215-232) är byte-lika utom indrag (diffade igen
efter 22:11-ändringen). Inga andra
dubbletter. Alla `.rk*`-regler används i markupen eller sätts av JS (`is-swap`, `rk__ihop`); fyra klasser i
markupen saknar regel och är bara krokar (`rk__belopp--kort`, `rk__fraga--ager`, `--alder`, `--ranta`).

**Specificitet: ordningen bär** `[LÄST]`. Fem par har samma specificitet där style.css vinner enbart genom att
komma sist: `.rk__segment > label` mot `.ampy-segment > label` (vikt 500/600, padding, fontstorlek),
`.rk__eyebrow{display:block}` mot `.ampy-eyebrow{display:inline-flex}`, `.rk__lank{font-size:16px}` mot
`.ampy-link{14px}`, `.rk__segment{display:inline-grid; container-type:normal}` mot `.ampy-segment{grid;
inline-size}`, `.rk__tabort{min-height:0}` mot `.ampy-link{44px}`. Paketeraren måste därför montera CSS:en i
ordningen tokens → bas → komponenter → style.css och paritetstestet måste kontrollera just dessa (§3.7).
Bricks-reglerna `label{margin-bottom:5px}`, `input:not([type=submit]){padding:0 12px;line-height:40px;font-size:
inherit}`, `fieldset{padding:.35em .75em .625em}`, `legend{display:table}`, `:where(p){margin-block:0 1.2em}`
ligger i `@layer bricks` (hämtad fil) och förlorar mot alla olagrade regler, men bara för egenskaper vi själva
sätter: `label` sätter vi ingen margin på i segmentet → artikel.css:37 `label{margin:0}` är nödvändig och ska med
i paketet. Med wrapper-prefixet får alla våra regler minst (0,2,0) och vinner även om Bricks en dag tar bort
lagret.

**Kontrast** `[MÄTT]` (WCAG 2.x, alfa komponerad mot faktisk bakgrund, `ut-kontrast.txt`):

| Text | Färg | Bakgrund | Kvot | Krav | |
|---|---|---|---|---|---|
| underrad, "kr", ovald segmenttext | `--ampy-ink-muted` #565e82 | vit | 6,33 | 4,5 | ok |
| eyebrow 12/600, "Per person och år", disclaimer 14/400 | #565e82 | sky mist #f5f9ff | 5,99 | 4,5 | ok |
| "upp till"/"ca"/"kr" 28 resp 26 px/500 | #565e82 | sky mist | 5,99 | 3 (stor) | ok |
| ovald segmenttext på spåret | #565e82 | ink .07 på vit | 5,46 | 4,5 | ok |
| frågor, fältsiffror | `--ampy-ink` #090b32 | vit | 19,00 | 4,5 | ok |
| talet, stoppbeskedet, noten | #090b32 | sky mist | 17,98 | 4,5 | ok |
| länkar 16/500, vald pill 16/600 | `--ampy-action-strong` #007a69 | vit | 5,27 | 4,5 | ok |
| samma på sky mist | #007a69 | sky mist | 4,98 | 4,5 | ok |
| placeholder "300 000" 18/400 | `--ampy-ink-faint` #6a7190 | vit | 4,80 | 4,5 | ok |
| vitt X på röd cirkel | vit | `--ampy-error-ink` #7a1623 | 10,68 | 3 | ok |
| röd cirkel mot panelen | #7a1623 | sky mist | 10,11 | 3 | ok |
| fältkant | ink .48 på vit | vit | 3,39 | 3 (1.4.11) | ok |
| fokusring | teal-deep .9 | vit | 4,40 | 3 | ok |
| segmentspår mot vit pill | ink .07 | vit | 1,16 | 3 | se m9 |
| teal-core som text (kontroll: används inte) | #00a991 | vit | 2,96 | 4,5 | används ej |

Disabled-läget finns inte i kalkylatorn (ingen `disabled`), placeholder är den svagaste färgen (4,80/4,54).

### 2.4 JavaScript

**Strict/globaler** `[LÄST]`. `app.js`, `rakna.js` och `engine.js` är ES-moduler → strict mode och inga globaler
(kontrollerat: inga `window.`-tilldelningar, inga odeklarerade variabler). I paketet (klassiskt skript i footern)
måste `'use strict'` stå först i IIFE:n.

**Koppling efter kloning** `[MÄTT]`. `koppla(b)` körs på det lösa blocket innan det läggs in (app.js:78-79);
lyssnarna följer med noden. Person 2:s fält: 180 000 ger "upp till 62 000 kr" + "Ni två tillsammans, per år."
(`ut-mini.json`). Debounce 500 ms är en gemensam timer per instans (rad 148), `change`/`blur` räknar direkt.

**Inklistrad text** `[MÄTT]`. `siffra()` (rakna.js:13) tar bara siffrorna: "300.000" → 300 000, "300 000 kr" →
300 000, "  42  " → 42, "-5000" → 5 000, arabiska/fullbreddssiffror → 0 (regexens `\d` är ASCII, rätt för
`inputmode="numeric"`). Före 22:11: "300 000,50" → 30 000 050, ingen längdgräns (17+ siffror tappar precision och
fältet skrivs om till ett annat tal; 23 siffror → "100 000 000 000 000 000 000 000"). Efter 22:11: `split(',')[0]`
tar bort allt efter ett komma ("300 000,50" → 300 000, men "300000.50" → 30 000 050 och "1,2 miljoner" → 1) och
`maxlength="9"` på fälten. `maxlength` räknar tecken i det formaterade värdet (mellanslagen inräknade), så gränsen
blir sju siffror vid skrivning: "12000000" visas som "1 200 000" och det klistrade "12 000 000" blir "1 200 000"
(`t13-maxlength.mjs`). Fältet ljuger då om vad man skrev, och 12 miljoner går inte att mata in. Utfallet är
"säkert" (jättetal → 50 000 kr, enorm ränta → 0 kr) men fel för den som faktiskt tjänar över 9 999 999 kr.

Patch m1: stryk `maxlength="9"` på de tio fälten (index.html) och låt `siffra()` kapa på SIFFROR, inte tecken,
och stryka ett öretal oavsett decimaltecken (rakna.js:13, ersätter 22:11-versionen; `formatFalt` följer med):

```js
/** Plockar siffrorna ur ett fält: "300 000" -> 300000. Ett avslutande öretal (",50" / ".50", ev. följt av "kr")
    stryks först så "300 000,50" blir 300 000 och inte 30 000 050. Högst 9 siffror (999 999 999 kr) så ett
    inklistrat jättetal aldrig skrivs om av flyttalsprecisionen. */
export function siffra(str) {
  return Number(String(str ?? '').replace(/[,.]\d{1,2}(?!\d)\s*(kr)?\s*$/i, '').replace(/[^\d]/g, '').slice(0, 9)) || 0;
}
```

Kontrollerat i Node mot 22 fall (`t11-siffra-patch.mjs`, `ut-siffra-patch.txt`, alla ok): "300.000" → 300000
(tre siffror efter punkten = tusental, stryks inte), "300 000,50" → 300000, "25 000,00" → 25000, "3,5" → 3,
"12,50 kr" → 12, "1,2 miljoner" → 12 (oförändrat, inget mönster att lita på), 20 siffror → 123 456 789.
Vid skrivning ändras inget: kommat stryks redan i dag på tangenten efter (formatFalt), så decimalregeln träffar
bara inklistrad text. Ändrar inga av research/12:s väntade utfall utom P16:s tre komma-fall ("3,5",
"300 000,50", "25 000,00"), som research/12 redan pekat ut som fel.

**Markören** (m4). `f.value = formatFalt(f.value)` flyttar markören till slutet varje gång värdet ändras. Frivillig
patch app.js:152-156 (ingen pixel ändras):

```js
f.addEventListener('input', () => {
  const fore = f.value.slice(0, f.selectionStart ?? f.value.length).replace(/[^\d]/g, '').length;   /* siffror före markören */
  const nytt = formatFalt(f.value);
  if (nytt !== f.value) {
    f.value = nytt;
    let pos = 0, n = 0;
    while (pos < nytt.length && n < fore) { if (/\d/.test(nytt[pos])) n++; pos++; }
    f.setSelectionRange(pos, pos);
  }
  clearTimeout(timer);
  timer = setTimeout(direkt, 500);
});
```

Kontrollerat i Chromium på en minimal sida (`t12-caret.mjs`): "300 000", markör efter "30", skriv 5 → "3 050 000"
med markören efter "3 05"; Backspace → "300 000" med markören efter "30"; skriv 9 sist → "3 000 009", markör sist.

**Mallkloningen** (M4), patch av app.js:74-77. Ersätter `innerHTML`-strängbytet med kloning av mallens innehåll
och byte av varje `-N` i de fem attributen, även när ett attribut bär två id:n:

```js
  const b = mall.content.firstElementChild.cloneNode(true);
  b.querySelectorAll('[id],[for],[name],[aria-labelledby],[aria-describedby]').forEach((el) => {
    for (const a of ['id', 'for', 'name', 'aria-labelledby', 'aria-describedby']) {
      const v = el.getAttribute(a);
      if (v && /-N(\s|$)/.test(v)) el.setAttribute(a, v.replace(/-N(?=\s|$)/g, `-${n}`));
    }
  });
```

Verifierad i Chromium mot filerna efter 22:11 (`t14-clone-fix.mjs`, patchad kopia `app-patched-robust.js`):
före = 6 hängande referenser efter 3 tillägg + 1 borttag + 1 tillägg; efter = 0, `typ-2/alder-2`, person 2:s
`aria-describedby="rk-enhet-anvant-2 rk-under-anvant-2"`, samma summa (162 000), 0 konsolfel. Fungerar också
med paketets id-prefix (`ak1-rk-enhet-anvant-N` → `…-2`).

**`skriv()` och `.rk__ihop`** `[MÄTT]`: jämför `textContent` före skrivning, så en oförändrad text ger 0 DOM-
mutationer och ingen uppläsning; med `IHOP` i texten byggs ett `<span class="rk__ihop">` per förekomst. Tom sträng
tömmer elementet. Rätt.

**Fokus** `[MÄTT]`: nytt fält efter tillägg, "Lägg till"-knappen efter borttag. Grenen `nasta.querySelector(...)`
i `taBort` (rad 89) nås aldrig (efter borttag är antalet ≤ 3 så knappen är alltid synlig); ofarlig.

**`dataset.typ`** `[LÄST]`: sätts i `lasPersoner()` (rad 99) vid varje rendering, styr pensionsraden i CSS
(style.css:86). Sidoeffekt i en läsfunktion, men idempotent. Byter man från Båda till Lön ligger pensionsbeloppet
kvar i det dolda fältet och ignoreras av `utrymmeFor` (rakna.js:59). Rätt.

**Minnesläckor**: inga. Lyssnare sitter på noder som tas bort med `b.remove()`; en väntande timer efter borttag
kör bara `rendera()`. `void el.offsetWidth` (rad 55) är en avsiktlig reflow för att starta om animationen.

**Två instanser** `[MÄTT]` (B1): 32 dubbla id:n (`rk-rubrik`, `avdragskollen`, `rk-form`, `rk-under-1`, …; 29 före
22:11-ändringen),
`kort.dataset.mode` skrivs bara på första sektionen (den andra tappar `data-mode="gt"`), "Nej" i instans 2 gör
ingenting i någon instans, 180 000 i instans 2:s fält gör ingenting. Lösningen står i §3.3-3.4.

### 2.5 Prestanda och robusthet

- Typsnitt: en variabel Outfit (100-900) i en fil, 44 696 byte, `format("woff2-variations")` + `format("woff2")`
  (base.css:19-26). Sajten serverar exakt samma fil (sha256 `99bd3f38…`) från
  `/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2`, 10 års cache, verifierat 2026-09-20. Kontraktets
  "en @font-face per vikt" gäller statiska filer; för en variabel fil är ett `font-weight: 100 900` det korrekta
  och ger ingen faux-bold.
- Nätverk: 13 anrop, alla lokala (HTML, 2 CSS + 6 importerade CSS, 3 JS, 1 woff2). Inga googleapis/gstatic/jsdelivr.
- Konsol: 0 fel, 0 varningar i ROT/GT × 1280/390.
- Reduced motion: base.css:95-97 nollar `animation-duration` (mätt 1e-06s); temat har samma regel live
  (`@media (prefers-reduced-motion) *{animation-duration:1ms!important}`).
- Print: ingen print-stil (m8).
- Utan JS: markupen är serverrenderad med "upp till 50 000 kr / Per person och år." (sant för alla), fälten
  gör inget. Paketet kan lägga en `<noscript>`-rad (§3.4, frivilligt).
- Artikelklonen: mina renderingar av den (t7, t8) saknar sajtens CSS eftersom klonens `flying-press/…`-länkar
  svarar 404 sedan cachen byttes. Mätvärdena `cardW 1424`/`inputFs 16.119` i `ut-mini.json` speglar därför inte
  den godkända renderingen och ska inte användas; klonens skärmdumpar från 2026-09-15 står kvar som förlaga.
  Slutsats för paketet: värdsimuleringen måste bygga på nyhämtad CSS (§3.6), inte på klonen.

---

## 3. Del 2: paketeringsplan för `produktion/`

Format-kontrakt, aldrig designkontrakt: ingen pixel, vikt, färg eller ord ändras. Referens = `kalkylator/v1/`
som den ligger. Byggs av ett deterministiskt skript ur källfilerna (som `elkollen-fluent-snippets/_build/build.py`),
aldrig för hand. Det som här kallas "verbatim" betyder byte-lika rader ur källfilen.

### 3.1 Fillista

```
produktion/
  dist/styles.css                    CSS-snippet (FluentSnippets: CSS, Frontend, wp_head)
  dist/backend.php                   PHP-snippet (FluentSnippets: Functions/PHP, Frontend & Backend)
  dist/engine.js                     JS-snippet (FluentSnippets: JS, Frontend, wp_footer)
  dist/fonts/Outfit-VariableFont_wght.woff2   kopia av kalkylator/system/fonts/ (sha256 99bd3f38…), för preview och som reserv
  preview/index.html                 tunn värdsida: <link dist/styles.css>, shortcodens markup för BÅDA lägena (ak1 = rot, ak2 = gt), <script dist/engine.js>
  preview/host-sim.html              samma + sajtens riktiga värdregler (§3.6), för driftprovet
  HANDOVER.md                        till Chris, på engelska (§3.8)
  _build/paketera.mjs                bygger dist/ + preview/ ur kalkylator/ (kör: node produktion/_build/paketera.mjs)
  _build/paritet.mjs                 paritetskontrollen (§3.7), exit 1 vid drift
  _build/host-rules-2026-09-20.css   värdreglerna som host-sim använder (ur research/underlag/14-kod/host-*.css)
```

Inget `data.json`, ingen REST-rutt, ingen webhook: kalkylatorn har inga dynamiska data (allt är text och tal i
koden), skickar ingenting och samlar inga leads (ägarbeslut: inga knappar). Kontraktets regel 8-9 är därför
inte tillämpliga och `HANDOVER.md` säger det rakt ut, så ingen letar efter ett lead-flöde som inte finns.

### 3.2 `dist/styles.css`: montering i exakt ordning

Ordningen är bindande (§2.3, "ordningen bär"). Varje selektor prefixas med `.ampy-avdragskollen ` (efterföljare),
utom wrapperns egna regler. Alla `rem` → px vid 1 rem = 10 px (två förekomster). Inga `:root`, inga `html`/`body`.

**Block 0, huvud.** Kommentar: version, datum, "FORMAT-ONLY: byggd ur kalkylator/v1 + kalkylator/system av
_build/paketera.mjs, redigera aldrig här".

**Block 1, @font-face** (ur base.css:19-26, sökvägen bytt till sajtens egen fil, ägargrind K1):

```css
@font-face {
  font-family: "Outfit";
  src: url("/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2") format("woff2-variations"),
       url("/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

Sajten deklarerar redan samma fil för Outfit 100-900 (theme-style, en @font-face per vikt mot samma URL), så
raden är en försäkring, inte en extra nedladdning (samma URL = samma cachepost).

**Block 2, wrapper + tokens** (lager 2-namnen behålls så att style.css förblir ordagrann; värdena är lager 1
utlösta till literaler; listan är exakt de 59 som skeppade regler refererar = `ut-tokens.txt` (68) minus de 9
som bara oskeppade regler använder: `--ampy-bg-page`, `--ampy-error`, `--ampy-lh-display`, `--ampy-on-dark`,
`--ampy-on-dark-muted`, `--ampy-space-stack`, `--ampy-space-xl`, `--ampy-text-h1`, `--ampy-text-h3`):

```css
.ampy-avdragskollen-outer { container-type: inline-size; container-name: rk; }   /* = style.css:191 för .rk-behallare */
.ampy-avdragskollen {
  /* ytor och bläck */
  --ampy-bg-surface: #ffffff; --ampy-bg-subtle: #f5f9ff;
  --ampy-ink: #090b32; --ampy-ink-body: #090b32; --ampy-ink-muted: #565e82; --ampy-ink-faint: #6a7190;
  --ampy-action-strong: #007a69; --ampy-error-ink: #7a1623;
  --ampy-focus: #090b32; --ampy-focus-ring: 0 0 0 3px rgba(0,122,105,.9);
  --ampy-line: rgba(9,11,50,.14); --ampy-line-strong: rgba(9,11,50,.48); --ampy-field-track: rgba(9,11,50,.07);
  --ampy-shadow-card: 0 10px 30px rgba(9,11,50,.07); --ampy-shadow-subtle: 0 1px 2px rgba(9,11,50,.06);
  /* radier och fält */
  --ampy-radius-card: clamp(16px, 0.42vw + 14.7px, 20px);
  --ampy-radius-field: clamp(10px, 0.21vw + 9.3px, 12px);
  --ampy-radius-small: clamp(6px, 0.21vw + 5.3px, 8px);
  --ampy-field-h: 48px; --ampy-field-fs: 16px;
  /* rörelse */
  --ampy-dur-fast: 160ms; --ampy-dur-base: 200ms;
  --ampy-ease: cubic-bezier(.2,.6,.2,1); --ampy-ease-out: cubic-bezier(.16,1,.3,1);
  /* typografi */
  --ampy-font: "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif;
  --ampy-text-h2: clamp(26px, 1.04vw + 22.7px, 36px);
  --ampy-text-body: clamp(16px, 0.21vw + 15.3px, 18px);
  --ampy-text-small: clamp(14px, 0.21vw + 13.3px, 16px);
  --ampy-text-number: clamp(38px, 1.989vw + 30.54px, 56px);
  --ampy-text-eyebrow: 12px; --ampy-text-label: 14px; --ampy-text-fine: 13px; --ampy-text-button: 16px;
  --ampy-w-display: 700; --ampy-w-heading: 500; --ampy-w-strong: 600; --ampy-w-medium: 500; --ampy-w-ui: 400; --ampy-w-body: 300;
  --ampy-lh-heading: 1.2; --ampy-lh-h3: 1.25; --ampy-lh-body: 1.5; --ampy-lh-ui: 1.4; --ampy-lh-tight: 1;
  --ampy-ls-heading: -0.01em; --ampy-ls-number: -0.03em; --ampy-ls-eyebrow: 0.14em;
  --ampy-measure: 62ch;
  /* avstånd (px-clamp, samma värden som --apspace-*) */
  --ampy-space-4xs: clamp(4.9px, 0.03vw + 4.8px, 5.2px);
  --ampy-space-3xs: clamp(6.6px, 0.05vw + 6.4px, 7px);
  --ampy-space-2xs: clamp(8.2px, 0.18vw + 7.6px, 9.9px);
  --ampy-space-xs:  clamp(10.2px, 0.39vw + 9px, 14px);
  --ampy-space-s:   clamp(12.8px, 0.73vw + 10.5px, 19.8px);
  --ampy-space-m:   clamp(16px, 1.25vw + 12px, 28px);
  --ampy-space-l:   clamp(20px, 2.04vw + 13.5px, 39.6px);
  --ampy-space-card: var(--ampy-space-m); --ampy-space-stack-lg: var(--ampy-space-l);
  --ampy-space-inline-xs: var(--ampy-space-3xs); --ampy-space-inline-sm: var(--ampy-space-2xs);
  /* basen: = :where(.ampy) (base.css:63) + body:39-40 */
  font-family: var(--ampy-font); font-size: var(--ampy-text-body); font-weight: var(--ampy-w-body);
  line-height: var(--ampy-lh-body); color: var(--ampy-ink-body);
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}
```

Byggskriptet ska generera blocket ur tokens.css (lösa `var()` rekursivt, som `t6-tokens.mjs` gör) och FALLA om
någon utlöst token innehåller `rem` eller är odefinierad.

**Block 3, scopad reset** (= bas-inbaddad.css:33-38 med `.ampy` → `.ampy-avdragskollen`, bara elementen som finns):

```css
.ampy-avdragskollen, .ampy-avdragskollen *, .ampy-avdragskollen *::before, .ampy-avdragskollen *::after { box-sizing: border-box; }
.ampy-avdragskollen svg { max-width: 100%; display: inline-block; vertical-align: -0.15em; }
.ampy-avdragskollen button, .ampy-avdragskollen input { font: inherit; color: inherit; }
.ampy-avdragskollen h2, .ampy-avdragskollen h3, .ampy-avdragskollen p { margin: 0; }
.ampy-avdragskollen :where(p) { max-width: var(--ampy-measure); }                       /* base.css:68 */
.ampy-avdragskollen ::selection { background: rgba(0,169,145,.22); color: var(--ampy-ink); }   /* base.css:74 */
.ampy-avdragskollen :focus-visible { outline: 3px solid var(--ampy-focus); outline-offset: 3px; border-radius: var(--ampy-radius-small); }   /* base.css:77-79 */
@media (prefers-reduced-motion: reduce) {
  .ampy-avdragskollen *, .ampy-avdragskollen *::before, .ampy-avdragskollen *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }   /* base.css:95-97 */
  .ampy-avdragskollen .ampy-segment > * { transition: none; }                            /* falt.css:395, den del som gäller här */
}
```

**Block 4, rollklasser** (base.css rad 50 `.ampy-h2`, 55 `.ampy-eyebrow`, 56 `.ampy-number`, verbatim med prefix).

**Block 5, komponenter, i filordning** (verbatim med prefix; radnummer i källan):
- text.css:25 `.ampy-eyebrow { display:inline-flex; … }`
- ytor.css:17-25 `.ampy-card`, 33-34 `.ampy-card > :first-child/:last-child`
- falt.css:63-74 `.ampy-input` (selektorlistan får krympas till `.ampy-input`; `.ampy-textarea`/`.ampy-select`
  finns inte), 75 placeholder, 76 hover, 77-80 focus-visible/is-focus, 93 `--tabular`
- falt.css:236-240 `.ampy-segment`, 241-249 optionen (behåll hela selektorlistan, den är ofarlig), 250 dold radio,
  251 hover, 252-254 vald, 255 focus-visible, 257 `@container (max-width: 340px)` (var 34rem)
- knappar.css:162-169 `.ampy-link`, 170 hover, 171 focus-visible, 172 svg

Utelämnas medvetet, kan aldrig matcha i den skeppade markupen: falt.css:81-92 (aria-invalid, disabled, --sm/--lg),
94-96 (type=number, webkit-spin/search), 256 (segment disabled), alla `:where(.ampy-on-dark …)`-varianter,
`.ampy-card--*`, `.ampy-segment--pill/--line`, `.ampy-link--*`. Byggskriptet listar vad det tog med och vad det
lämnade, så nästa granskare kan diffa mot den här listan.

**Block 6, style.css** rad 15-234 verbatim med prefix, med exakt tre ändringar:
- rad 82: `flex: 0 0 14rem` → `flex: 0 0 140px`
- rad 185: `[hidden] { display: none !important; }` → `.ampy-avdragskollen [hidden] { display: none !important; }`
- rad 192: `.rk-behallare, .rk-spalt { container-type … }` utgår (block 2 bär den på `.ampy-avdragskollen-outer`)

Utgår helt: rad 7-9 (`.rk-sida`, `.rk-spalt`, demosidans @media), 235-237 (demosidans mobilpadding).
Behålls: `@keyframes rk-in` (182, globalt namn, m6), `@media (pointer: coarse)` (73, 103-106: kapabilitets-
fråga, inte viewport), `@supports not (…) { @media (max-width:767px) … }` (213-234, ägargrind K3).
Radnumren gäller filen efter 22:11; byggskriptet ska hitta blocken på innehåll (regex på selektorn), inte på rad.

**Block 7, värdskydd** (artikel.css:35-39 utan rad 38, plus två nya ur §2.1 M1 och §2.3):

```css
/* Skydd mot värdsidans element-regler. Bricks frontend ligger i @layer bricks och förlorar mot allt ovan,
   men label{margin-bottom:5px} träffar egenskaper vi inte sätter, och sajtens egen snippet "14-global-css"
   sätter input:focus{border-color:#5EB1BF!important} (olagrad, !important). Bevis: research/14 §2.1 M1-M2. */
.ampy-avdragskollen fieldset { min-width: 0; border: 0; padding: 0; margin: 0; }
.ampy-avdragskollen legend { padding: 0; }
.ampy-avdragskollen label { margin: 0; }
.ampy-avdragskollen button { text-transform: none; letter-spacing: 0; }
.ampy-avdragskollen .rk__input:focus { border-color: var(--ampy-line-strong) !important; }              /* fokus utan tangentbord: samma kant som vila (som i v1) */
.ampy-avdragskollen .rk__input:focus-visible { border-color: var(--ampy-action-strong) !important; }     /* tangentbordsfokus: teal-deep (falt.css:79) */
```

Den sista regeln finns för att `!important` bara kan slås av `!important`; värdet är detsamma som falt.css:79, så
v1 ändras inte en pixel. Utan raden är kanten #5EB1BF i WordPress (mätt i klonen). Artikel.css:38 (`box-shadow:none`)
tas INTE med: den dödar fokusringen (M2).

**Byggregler för skriptet.** (1) Läs källfilerna, plocka radintervallen ovan, prefixa varje selektor i varje
selektorlista (även inne i `@container`/`@media`/`@supports`), rör inte `@keyframes`-blockets `from`/`to`.
(2) `rem`→px med regex `(-?\d*\.?\d+)rem\b` × 10, som build.py. (3) Vägra bygga om resultatet innehåller `:root`,
`html{`, `body{`, `rem`, `googleapis`, `gstatic`, `jsdelivr` eller en oprefixad selektor utanför `@font-face`/
`@keyframes`. (4) Skriv en manifestkommentar sist i filen: källfil + radintervall per block + sha256 på källorna.

### 3.3 `dist/engine.js`: en IIFE, root-scopad, multi-instans

Innehåll i ordning, allt inne i `(function () { 'use strict'; … })();`:

1. **Motorn** ur `logik/engine.js`, verbatim utan `export`: rad 23-51 (`PARAMS_2026`), 53 (`P`), 68 (`rundUpp100`),
   71 (`rundNed100`), 75 (`kapa`), 80-85 (`pensionsavgiftKr`), 88-91 (`toInt`), 98-126 (`grundavdrag`), 128-144
   (`jobbskatteavdrag`), 146-150 (`redForvarvsinkomst`), 153-156 (`redUnderskottKapital`), 169-220 (`skatteutrymme`).
   Inte med: `pyRound` (60-65, används inte av skatteutrymme) och allt efter rad 220 (ROT/GT-bedömningarna).
2. **rakna.js** verbatim utan `import`/`export` (rader efter 22:11): rad 5 (`TAK`), 8-10 (`kr`), 13 (`siffra`, med
   patchen m1 om K4 = ja), 16-19 (`formatFalt`), 52-53 (`ANTAL_ORD`, `MAX_PERSONER`), 56-64 (`inkomstDelar`), 67-77
   (`utrymmeFor`), 90-131 (`beraknaHushall`). Inte med: `berakna` (29-49, används inte av app.js).
3. **app.js** omskriven till `init(root)`. Hela funktionen nedan är app.js rad för rad; varje avvikelse är märkt
   `PAKET:`. Inget i renderingslogiken ändras.

```js
  /* ---------- app.js som init(root) ---------- */
  const IHOP = 'grön teknik-avdrag';
  function skriv(el, text) {                                   /* app.js:27-36 verbatim */
    if (el.textContent === text) return false;
    const delar = text.split(IHOP);
    el.replaceChildren();
    delar.forEach((d, i) => {
      if (i) { const s = document.createElement('span'); s.className = 'rk__ihop'; s.textContent = IHOP; el.append(s); }
      if (d) el.append(d);
    });
    return true;
  }
  const gom = (el, dolj) => { if (el.hidden !== dolj) el.hidden = dolj; };

  function init(root) {
    if (root.dataset.booted === '1') return;                   /* PAKET: multi-instans-spärr */
    root.dataset.booted = '1';
    const $ = (s) => root.querySelector(s);                    /* PAKET: aldrig document-wide; klass i stället för id */
    const kort = $('.rk');
    const form = $('.rk__fragor');
    const eyebrow = $('.rk__eyebrow');
    const resultat = $('.rk__resultat');
    const talrad = $('.rk__talrad');
    const prefix = $('.rk__prefix');
    const tal = $('.rk__tal');
    const talenhet = $('.rk__talenhet');
    const per = $('.rk__per');
    const not = $('.rk__not');
    const stopp = $('.rk__stopp');
    const stopptext = $('.rk__stopptext');
    const personer = $('.rk__personer');
    const lagg = $('.rk__lagg .rk__lank');
    const mall = $('template');
    if (!kort || !form || !mall) return;                       /* PAKET: inert om markupen saknas */

    /* PAKET: läget ur data-mode på wrappern (PHP sätter det), inte ur ?m=. Rubrik och title skrivs inte om:
       PHP renderar rätt text från start (M3). */
    const mode = root.dataset.mode === 'gt' ? 'gt' : 'rot';
    kort.dataset.mode = mode;
    const NAMN = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';

    const val = (name, rot = form) => (rot.querySelector(`input[name="${name}"]:checked`) || {}).value;   /* PAKET: form, inte document */

    let forsta = true;                                         /* app.js:51-57 verbatim */
    function tona(el) {
      if (forsta) return;
      el.classList.remove('is-swap');
      void el.offsetWidth;
      el.classList.add('is-swap');
    }

    let lopnummer = 1;                                         /* app.js:61-91 verbatim (per instans) */
    function block() { return [...personer.querySelectorAll('.rk__person')]; }
    function numrera() {
      const alla = block();
      alla.forEach((b, i) => {
        b.dataset.person = String(i + 1);
        b.querySelector('.rk__personetikett').textContent = `Person ${i + 1}`;
      });
      personer.dataset.antal = String(alla.length);
      gom(lagg.parentElement, alla.length >= MAX_PERSONER);
    }
    function laggTill() {
      const n = ++lopnummer;
      const b = mall.content.firstElementChild.cloneNode(true);   /* PAKET = patch M4: alla -N i attributen byts, även "id1-N id2-N" */
      b.querySelectorAll('[id],[for],[name],[aria-labelledby],[aria-describedby]').forEach((el) => {
        for (const a of ['id', 'for', 'name', 'aria-labelledby', 'aria-describedby']) {
          const v = el.getAttribute(a);
          if (v && /-N(\s|$)/.test(v)) el.setAttribute(a, v.replace(/-N(?=\s|$)/g, `-${n}`));
        }
      });
      koppla(b);
      personer.append(b);
      numrera();
      rendera();
      b.querySelector('[data-falt="inkomst"]').focus({ preventScroll: false });
    }
    function taBort(b) {
      const nasta = b.previousElementSibling || personer;
      b.remove();
      numrera();
      rendera();
      (lagg.parentElement.hidden ? nasta.querySelector('[data-falt="inkomst"]') : lagg).focus();
    }
    lagg.addEventListener('click', laggTill);

    function lasPersoner() {                                   /* app.js:94-110 verbatim */
      return block().map((b) => {
        const n = b.querySelector('input[name^="typ-"]').name.split('-')[1];
        const falt = (namn) => siffra((b.querySelector(`[data-falt="${namn}"]`) || {}).value);
        const typ = val(`typ-${n}`, b);
        if (b.dataset.typ !== typ) b.dataset.typ = typ;
        return { typ, alder: val(`alder-${n}`) || '18-65', inkomst: falt('inkomst'), pension: falt('pension'), ranta: falt('ranta'), anvant: falt('anvant'), gtAnvant: falt('gtanvant') };
      });
    }

    function rendera() {                                       /* app.js:112-144 verbatim */
      const r = beraknaHushall({ mode, ager: val('ager') === 'ja', aldre: val('aldre') === 'ja', personer: lasPersoner() });
      const fran = resultat.dataset.status;
      if (fran !== r.status) resultat.dataset.status = r.status;
      let andrat = false;
      skriv(eyebrow, `${r.antal > 1 ? 'Ert' : 'Ditt'} tillgängliga ${NAMN}`);
      if (r.status === 'stopp') {
        gom(stopp, false);
        andrat = skriv(stopptext, r.text);
        gom(not, true);
      } else {
        gom(stopp, true);
        const m = r.text.match(/^(.*\S)\s(kr)$/);
        const nyttTal = m ? m[1] : r.text;
        if (fran === 'stopp') tal.textContent = '';
        andrat = [skriv(prefix, r.prefix), skriv(tal, nyttTal), skriv(talenhet, m ? m[2] : ''), skriv(per, r.per), skriv(not, r.not || '')].some(Boolean);
        gom(prefix, !r.prefix);
        gom(talenhet, !m);
        gom(not, !r.not);
      }
      if (andrat || fran !== r.status) tona(r.status === 'stopp' ? stopp : talrad);
      forsta = false;
    }

    let timer = 0;                                             /* app.js:148-165 verbatim (timer per instans) */
    const direkt = () => { clearTimeout(timer); timer = 0; rendera(); };
    function koppla(rot) {
      rot.querySelectorAll('.rk__input').forEach((f) => {
        f.addEventListener('input', () => {
          f.value = formatFalt(f.value);                       /* eller m4-varianten, om K4 = ja */
          clearTimeout(timer);
          timer = setTimeout(direkt, 500);
        });
        f.addEventListener('change', direkt);
        f.addEventListener('blur', direkt);
      });
      rot.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', rendera));
      const bort = rot.querySelector('.rk__tabort');
      if (bort) bort.addEventListener('click', () => taBort(rot));
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = document.activeElement;                       /* PAKET: bara den egna instansens fält */
      if (a && root.contains(a) && a.classList.contains('rk__input')) a.blur();
    });

    koppla(kort);
    rendera();
  }

  function boot() { document.querySelectorAll('.ampy-avdragskollen').forEach(init); }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
```

`readyState`-kontrollen gör att skriptet fungerar både i footern och om FlyingPress "Delay JS" skjuter upp det
till efter `DOMContentLoaded`. Ingen `window.*`, ingen data-global (kontraktets "inert if data absent" motsvaras
av `if (!kort …) return`). Syntaxen är ES2021 (`replaceAll`, `??`, mallsträngar, spridning; `?.` från app.js:165
finns inte kvar), samma krav som CSS:en redan ställer (i3). Ingen minifiering i repot: FlyingPress får minifiera live.

### 3.4 `dist/backend.php`: shortcoden

Signatur: `[ampy_avdragskollen mode="rot|gt" heading="…" heading_level="2|3"]`. Returnerar markupen
(`ob_start`/`ob_get_clean` eller strängretur, aldrig `echo`). Ingen data, ingen REST, ingen nonce, ingen webhook,
inga `add_action` utöver shortcoden. Ingen "en per sida"-spärr (elcentral har en): två instanser är tillåtna och
fungerar tack vare id-prefixet + root-scopad JS.

```php
<?php
/**
 * Avdragskollen (ROT / grön teknik) - FluentSnippets snippet 2/3 (type: PHP / Functions). Run: Frontend & Backend.
 * Registers [ampy_avdragskollen mode="rot|gt" heading="..." heading_level="2|3"]. Returns markup only.
 * No data injection (nothing is dynamic), no REST route (nothing is submitted), no webhook, no tracking.
 * Auto-built by produktion/_build/paketera.mjs from kalkylator/v1/index.html - rebuild, never hand-edit.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( ! function_exists( 'ampy_avdragskollen_markup' ) ) {
	/** index.html rad 17-202 (sektionen, efter 22:11) ordagrant. Två platshållare: {{MODE}} (rad 17 data-mode) och
	 *  {{NAMN}} (rad 178, eyebrowen "Ditt tillgängliga ROT-avdrag"). Nowdoc: inget i markupen tolkas av PHP. */
	function ampy_avdragskollen_markup() {
		return <<<'AMPY_AK_MARKUP'
  <section class="ampy-card rk" id="avdragskollen" aria-labelledby="rk-rubrik" data-mode="{{MODE}}">
    …(index.html rad 18-201 byte för byte, med "Ditt tillgängliga ROT-avdrag" → "Ditt tillgängliga {{NAMN}}")…
  </section>
AMPY_AK_MARKUP;
	}
}

if ( ! function_exists( 'ampy_avdragskollen_shortcode' ) ) {
	function ampy_avdragskollen_shortcode( $atts = array() ) {
		static $instans = 0;
		$instans++;
		$a = shortcode_atts( array( 'mode' => 'rot', 'heading' => null, 'heading_level' => '2' ), $atts, 'ampy_avdragskollen' );
		$mode  = ( 'gt' === strtolower( trim( (string) $a['mode'] ) ) ) ? 'gt' : 'rot';
		$namn  = ( 'gt' === $mode ) ? '<span class="rk__ihop">grön teknik-avdrag</span>' : 'ROT-avdrag';   // samma DOM som app.js skriv() ger
		$nivaa = ( '3' === (string) $a['heading_level'] ) ? 'h3' : 'h2';
		$uid   = 'ak' . $instans;                                   // id-prefix per instans: ak1-rk-inkomst-1, ak2-rk-inkomst-1 …

		$html = ampy_avdragskollen_markup();
		$html = str_replace(
			array( 'id="rk-', 'for="rk-', 'aria-labelledby="rk-', 'aria-describedby="rk-', 'id="avdragskollen"' ),
			array( 'id="' . $uid . '-rk-', 'for="' . $uid . '-rk-', 'aria-labelledby="' . $uid . '-rk-', 'aria-describedby="' . $uid . '-rk-', 'id="' . $uid . '-avdragskollen"' ),
			$html
		);
		$html = str_replace( array( '{{MODE}}', '{{NAMN}}' ), array( $mode, $namn ), $html );

		// Rubriken: default per läge (index.html rad 15 / app.js rad 44), egen text via heading="…", bort via heading="".
		if ( null === $a['heading'] ) {
			$rubrik = 'Räkna ut ditt ' . $namn;
		} else {
			$rubrik = esc_html( trim( (string) $a['heading'] ) );
		}
		if ( '' === $rubrik ) {
			// ingen rubrik: sektionen får ett namn ändå (aria-labelledby skulle peka på ingenting)
			$html   = str_replace( 'aria-labelledby="' . $uid . '-rk-rubrik"', 'aria-label="' . esc_attr( 'Räkna ut ditt ' . ( 'gt' === $mode ? 'grön teknik-avdrag' : 'ROT-avdrag' ) ) . '"', $html );
			$rubrik_html = '';
		} else {
			$rubrik_html = '<' . $nivaa . ' class="ampy-h2 rk__rubrik" id="' . $uid . '-rk-rubrik">' . $rubrik . '</' . $nivaa . '>' . "\n";
		}

		return '<div class="ampy-avdragskollen-outer"><div class="ampy-avdragskollen" lang="sv" data-mode="' . $mode . '" data-booted="0">' . "\n"
			. $rubrik_html
			. $html
			. '<noscript><p class="rk__under">Kalkylatorn räknar i din webbläsare och behöver JavaScript.</p></noscript>' . "\n"   // ägargrind K7
			. '</div></div>';
	}
	add_shortcode( 'ampy_avdragskollen', 'ampy_avdragskollen_shortcode' );
}
```

Anmärkningar:
- `str_replace` på de fyra attributprefixen träffar exakt id:n och referenser (klasser heter `rk__…`/`rk`, aldrig
  `rk-` efter `="`), även inne i `<template>`. JS:ens `replaceAll('-N"')` fungerar oförändrad eftersom prefixet
  ligger först. Byggskriptet gör samma ersättning i Node för preview-sidan, så PHP och preview har identisk DOM.
- Rubriken `.ampy-h2` på ett `<h3>` ser ut exakt som på `<h2>` (klassen sätter allt). Nivån är ett val för
  högerspalten (K2).
- `php -l dist/backend.php` ska vara ren (PHP 8.5 finns lokalt: `/opt/homebrew/bin/php`). Inga `?>` i markupen,
  ingen `</script>`-sträng, ingen `AMPY_AK_MARKUP` i markupen.
- Bricks: lägg shortcoden i ett **Shortcode**-element, aldrig Code-elementet (kontraktet §1). Bricks kör
  `do_shortcode` direkt, så ingen `wpautop`/`wptexturize` rör returvärdet; paritetstestet på staging (§3.7 punkt 9)
  bekräftar att `"18 till 65"` och attributen är orörda.

### 3.5 Typsnitt

- Källa: `kalkylator/system/fonts/Outfit-VariableFont_wght.woff2`, 44 696 byte, sha256
  `99bd3f38d4854dbb296b53fb55c0956891e0111ccc86053966b7e99d6f99c162`.
- Sajten serverar samma bytes på `https://ampy.se/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2`
  (HTTP 200, `cache-control: max-age=315360000`, `access-control-allow-origin: *`, verifierat 2026-09-20 med curl).
- Rekommendation (K1): `@font-face` i `dist/styles.css` pekar på den sökvägen. Inget att ladda upp. Reserv om
  Julius hellre följer elcentral-konventionen: ladda upp `dist/fonts/…` till `/wp-content/uploads/ampy-fonts/`
  och byt URL:en i byggskriptets konstant `FONTBASE` (en rad).
- En @font-face, `font-weight: 100 900` (variabel fil). Inga googleapis/gstatic/jsdelivr.
- Preview: `preview/index.html` lägger en egen `<style>@font-face{… src:url("../dist/fonts/Outfit-VariableFont_wght.woff2") …}</style>`
  FÖRE `<link dist/styles.css>` så att sidan renderar rätt utan sajten (dist-CSS:ens `/wp-content/…`-URL svarar
  404 lokalt; paritetsservern mappar dessutom `/wp-content/uploads/fonts/` → `dist/fonts/` så även den träffar).
  Det är värdsidans chrome, inte en kopia av dist.

### 3.6 `preview/index.html` och `preview/host-sim.html`

`preview/index.html` (genereras av byggskriptet):

```html
<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Avdragskollen, förhandsvisning av snippet-paketet</title>
<meta name="robots" content="noindex">
<style>@font-face{font-family:"Outfit";src:url("../dist/fonts/Outfit-VariableFont_wght.woff2") format("woff2-variations"),url("../dist/fonts/Outfit-VariableFont_wght.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}</style>
<link rel="stylesheet" href="../dist/styles.css">
<style>/* värdsidans chrome, inte en del av leveransen: samma spalt som kalkylator/v1 (style.css:7-9, 234-236) */
body{margin:0;background:#fff} .spalt{max-width:980px;margin:0 auto;padding:56px 0} @media (max-width:1040px){.spalt{padding-inline:28px}} @media (max-width:767px){.spalt{padding:16.9px}} .spalt > * + *{margin-top:56px}</style>
</head>
<body>
<main class="spalt">
  <!-- = [ampy_avdragskollen mode="rot"] : shortcodens returvärde, ak1 -->
  <div class="ampy-avdragskollen-outer"><div class="ampy-avdragskollen" lang="sv" data-mode="rot" data-booted="0"> … </div></div>
  <!-- = [ampy_avdragskollen mode="gt"] : ak2 -->
  <div class="ampy-avdragskollen-outer"><div class="ampy-avdragskollen" lang="sv" data-mode="gt" data-booted="0"> … </div></div>
</main>
<script src="../dist/engine.js"></script>
</body>
</html>
```

Ingen `html{font-size:62.5%}` på preview-sidan: roten är 16 px, vilket bevisar rem-oberoendet. Två instanser på
samma sida bevisar multi-instans varje gång sidan öppnas.

`preview/host-sim.html` = samma sida + en `<style>` med `_build/host-rules-2026-09-20.css` före dist-länken:
`html{font-size:62.5%}`, `body{font-size:var(--aptext-sm);font-family:"Outfit";font-weight:300}`, `h2{font-size:
var(--aptext-2-5xl);font-weight:500}` och `--aptext-*`-variablerna ur global-variables (så h2-regeln löser ut),
hela "14-global-css" verbatim (olagrad), och Bricks frontend-filen verbatim inne i `@layer bricks{…}`. Det är
den sida som ska visa att §2.1 M1 och `label{margin-bottom:5px}` är neutraliserade, och att ingenting annat driver.

### 3.7 Paritetskontroller (`_build/paritet.mjs`, exit 1 vid drift)

Servern serverar repo-roten och mappar `/wp-content/uploads/fonts/*` → `produktion/dist/fonts/*`.
Referens: `kalkylator/v1/index.html?m=rot` och `?m=gt`. Kandidat: `preview/index.html` instans 1 (rot) och 2 (gt).
Viewports: 1280×900 (fin pekare) och 390×844 (touch, `isMobile`, dsf 2). Kör i den ordningen:

1. **Konsol och nät.** 0 `pageerror`, 0 console error/warning, 0 anrop utanför localhost.
2. **DOM.** Per instans: 0 dubbla id:n i hela dokumentet (med två instanser!), alla `for`/`aria-*` löser, legend
   först i varje fieldset, `template` finns, samma antal tabbstopp som v1 (14 i ROT, 12 i GT vid start).
3. **Datorstilar, exakt lika** (samma Chromium, samma typsnittsfil → värdena ska vara identiska, inte "nära").
   Selektorer relativt varje root: `.rk`, `.rk__rubrik`, `.rk__etikett`, `.rk__under`, `.rk__segment`,
   `.rk__segment > label` (ovald) och `label:has(input:checked)` (vald), `.rk__input` + `::placeholder`,
   `.rk__enhet`, `.rk__lank` (Lägg till), `.rk__panel`, `.rk__eyebrow`, `.rk__talrad`, `.rk__tal`, `.rk__prefix`,
   `.rk__per`, `.rk__fin`, `.rk__stopp`, `.rk__stopptext`, `.rk__x circle`, `.rk__not`.
   Egenskaper: `fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, color, backgroundColor, padding,
   margin, borderColor, borderWidth, borderRadius, boxShadow, minHeight, display, gridTemplateColumns, whiteSpace,
   textTransform, fill`, plus `getBoundingClientRect().width/height` avrundat till 0,5 px. Jämför även rotens
   `fontSize` (17.988 vid 1280, 16.12 vid 390) och `.rk__rad > .rk__belopp` bredd (140 px på desktop, det
   omvandlade rem-värdet).
4. **Tillståndsvandring**, samma 9 tillstånd i referens och kandidat, jämför `innerText` av `.rk__resultat`
   (normaliserade blanksteg) och datorstilarna i punkt 3 efter varje: (1) utgångsläge, (2) Äger = Nej, (3) Under 18,
   (4) lön 180 000, (5) pension 240 000 Över 65, (6) lön 1 200 000, (7) använt 60 000 (allt använt), (8) två personer
   (180 000 + tom), (9) fyra personer (Lägg till dold).
5. **Fokus.** Tab till inkomstfältet: `box-shadow` = `rgba(0, 122, 105, 0.9) 0px 0px 0px 3px`, `border-color` =
   `rgb(0, 122, 105)` (vänta 400 ms på transitionen). Samma i `host-sim.html` (det är M1-provet). "Lägg till"
   med tangentbord: `outline` 2px navy. Segmentpill med tangentbord: fokusringen på labeln.
6. **Interaktion i instans 2 påverkar inte instans 1** (Nej i gt-instansen, 180 000 i gt-instansen: rot-instansen
   står kvar på "upp till 50 000 kr").
7. **Skärmdumpar**: kortets `getBoundingClientRect()` klippt, 1280 och 390, referens mot kandidat. Väntat: byte-
   lika PNG (samma motor). Om de skiljer: `pixelmatch` + `pngjs` (`npm i -D` i `tools/`) med tröskel 0,1 % pixlar,
   och diffbilden sparas i `produktion/_build/out/`.
8. **Reduced motion** (`reducedMotion: 'reduce'`): `animationDuration` 1e-06s på `.rk__talrad.is-swap`.
9. **Textprov för värdfilter**: `innerText` av hela kortet i kandidat = referens (fångar om `wptexturize` eller
   FlyingPress ändrar citattecken/mellanslag; körs igen på staging mot den riktiga sidan med samma skript,
   `--url https://staging…`).
10. **Byte-diff**: efter att Chris klistrat in: `diff dist/styles.css <(hämtad inline-style)` osv. Manuellt steg i
    HANDOVER.

Tröskel: allt i punkt 1-6 och 8-9 måste vara exakt lika; punkt 7 ≤ 0,1 %. Skriptet skriver `_build/out/paritet.json`
och en montage-PNG per viewport (referens | kandidat | host-sim) som är beviset i handovern.

### 3.8 `HANDOVER.md` (engelska, till Chris), innehåll i ordning

1. What this is (one paragraph) and what it is not: no lead capture, no data, no REST, no tracking, no webhook.
2. Install: three FluentSnippets (CSS → Frontend, `wp_head`; PHP → Frontend & Backend; JS → Frontend, footer),
   paste raw (no editor auto-format), activate order CSS → JS → PHP, run `php -l` on staging first.
3. Place: Bricks **Shortcode element** with `[ampy_avdragskollen mode="rot"]` or `mode="gt"`; optional
   `heading="…"`, `heading=""`, `heading_level="3"` (sidebar). Two instances on one page are fine.
4. Fonts: nothing to upload. The snippet points at the theme's own Outfit file (path + sha256). Fallback: upload
   `dist/fonts/` to `/wp-content/uploads/ampy-fonts/` and change one URL.
5. Caching/FlyingPress: purge after activation; add `ampy-avdragskollen` to the "Remove unused CSS" exclusion
   list; "Delay JS" is safe (the script boots on `readyState`); do not minify by hand.
6. Host CSS interactions we already neutralised (input:focus !important in "14-global-css", label margin in the
   Bricks layer) and what to do if the site CSS changes: rerun `_build/paritet.mjs --url <page>`.
7. Staging QA (10 minutes): rot + gt render, 390 stacks, focus ring visible, Enter never reloads, two instances
   independent, no console errors, no external requests in the Network tab, Lighthouse a11y ≥ same as reference.
8. Versioning: never edit `dist/` by hand, edit `kalkylator/` and run `node produktion/_build/paketera.mjs`, then
   `node produktion/_build/paritet.mjs`; file headers carry version + build date + source sha256.
9. Placement CSS for the article page (right column / top of column) is a page-level Bricks matter, see
   `kalkylator/artikel/artikel.css` lines 7-32; it is not part of the snippets.

### 3.9 Risklista: vad som kan driva

| # | Risk | Sannolikhet | Motmedel |
|---|---|---|---|
| R1 | Sajtens snippet "14-global-css": `input:focus{border-color:#5EB1BF!important}` | säker (ligger live) | block 7-regeln med `!important`; host-sim + paritet punkt 5 |
| R2 | Bricks-lagret `label{margin-bottom:5px}`, `input:not([type=submit]){padding;line-height;font-size:inherit}`, `fieldset{padding}`, `legend{display:table}`, `:where(p){margin-block}` | säker (i `@layer bricks`, förlorar mot olagrat) | vi sätter alla utom label-margin → block 7 `label{margin:0}`; prefixet ger (0,2,0) så vi vinner även om lagret försvinner i en Bricks-uppdatering |
| R3 | Temat `h2{font-size:var(--aptext-2-5xl);font-weight:500}` (olagrad) | säker | `.ampy-h2` (0,2,0) vinner; paritet punkt 3 mäter rubriken |
| R4 | Rotstorlek: sajten kör `html{font-size:62.5%}` i dag; en temaändring skulle ändra alla rem | låg | 0 rem kvar efter bygget; byggskriptet vägrar rem |
| R5 | vw-tokens mäter skärmen, inte behållaren: i högerspalten (384 px på 1440-skärm) är avstånden desktopvärden | säker, men = referensen | ingen åtgärd (godkänd rendering); nämns i HANDOVER |
| R6 | Typsnittsfilen på sajten byts/flyttas | låg | vår @font-face pekar på samma URL; om 404 → system-ui; K1 reserv |
| R7 | FlyingPress "Remove unused CSS" plockar bort regler som bara JS-tillstånd använder (`.is-swap`, `[data-status="stopp"]`, `[data-antal]`, `[data-typ="bada"]`) | medel | undantagslista `ampy-avdragskollen` + `rk`; staging-provet punkt 4 |
| R8 | FlyingPress minifierar inline-JS med gammal minifierare som inte kan ES2021 | låg (elcentral-JS:en lever redan med samma syntax) | staging-prov; annars stäng av minifiering för snippeten |
| R9 | Bricks-kolumn med `overflow:hidden` klipper kortskuggan (0 10px 30px) | medel på artikelsidan | kontrollera kolumnen; artikel.css sätter `min-width:0` på kolumnen, samma här |
| R10 | Ordningen mellan sajtens CSS-snippets och vår: FluentSnippets skriver ut alla i `wp_head`; vår vinner på specificitet + `!important` där det behövs, inte på ordning | låg | block 7; host-sim |
| R11 | `wptexturize`/`wpautop` på returvärdet | låg (Bricks kör `do_shortcode` direkt) | paritet punkt 9 mot staging |
| R12 | Två instanser i SAMMA form (omöjligt via shortcode) | ingen | radiogrupper är per `<form>`, id:n per instans |
| R13 | Safari 15.4-15.6 / Chrome < 105 utan `@container`: reserven vid 767 px viewport | låg, samma som referensen | K3 |
| R14 | Cascade-lager: om FluentSnippets en dag lägger snippets i ett eget lager förlorar vi mot olagrad sajt-CSS | låg | paritet mot staging efter varje plugin-uppdatering (HANDOVER punkt 6) |
| R15 | Artikelklonen är död som förlaga (flying-press-länkarna 404) | säker | host-sim byggs på nyhämtad CSS; klonen ska klonas om innan den används igen (K6) |

---

## 4. Grindlista: frågor bara Julius kan stänga (svara med nummer)

| # | Fråga | Rekommendation | Blockerar |
|---|---|---|---|
| K1 | Typsnittet: peka på sajtens befintliga `/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2` (samma bytes, inget att ladda upp) eller ladda upp en kopia till `/wp-content/uploads/ampy-fonts/` som elcentral gör? | sajtens fil | bygget (en konstant) |
| K2 | Rubriken i shortcoden: default "Räkna ut ditt ROT-avdrag" / "… grön teknik-avdrag" med `heading=""` för att slippa den och `heading_level="3"` i högerspalten. Ok? | ja | nej |
| K3 | Behålla `@supports not (container-type)`-reserven (viewport-@media, bryter kontraktets bokstav men skadar inte) eller stryka den? | behåll | nej |
| K4 | Får v1 få patcharna innan paketering: M4 (kloningen, måste), m1 (siffra kapar på siffror + öretal stryks, `maxlength` bort), m3 (`aria-atomic` på noten), m4 (markören stannar)? Ingen pixel ändras | ja på M4 + m1 + m3, m4 valfri | M4 blockerar v1 tills den är rättad; paketet byggs ur den version du väljer |
| K5 | m9: segmentkontrollens spår/pill 1,16:1 mot WCAG 1.4.11 är designsystemets mönster (LED-kalkylatorn). Parkeras i Design-Guide-Ampy? | parkera | nej |
| K6 | Artikelklonen: rätta artikel.css nu (stryk rad 38, lägg till fokus-motregeln från block 7) och klona om artikeln (flying-press-länkarna är döda)? | ja, båda | artikelplaceringen, inte paketet |
| K7 | `<noscript>`-raden "Kalkylatorn räknar i din webbläsare och behöver JavaScript." i shortcoden (syns bara utan JS)? | ja | nej |

---

## Bilaga A. Tokens kalkylatorn refererar (68 st, utlösta), rem-status

Full lista med råvärde och utlöst värde: `research/underlag/14-kod/ut-tokens.txt`. Räknat: 19 färger/skuggor/
linjer (hex, rgba), 22 px-clamp (typ, avstånd, radier; 17 egna + 5 alias som `--ampy-space-card`), 6 fasta px
(eyebrow 12, label 14, fine 13, button 16, field 48/16), 12 enhetslösa (6 vikter, 6 radavstånd), 4 em/ch
(spärrning, mått), 4 rörelse (ms, bezier), 1 typsnittsstack = 68. **0 rem.**

## Bilaga B. Komponentregler som träffar markupen (54 st före rensning)

`ut-tokens.txt` överdel. De 25 som skeppas står i §3.2 block 3-5; de 29 som inte kan matcha (mörka varianter,
disabled, invalid, textarea/select, pill/line-segment, quiet/ghost/tel-länkar, hr/a/small/strong/h1/h3/h4) utelämnas.

## Bilaga C. Mätvärden att pricka av i pariteten (v1, Chromium, `probe.json`)

| Element | 1280 | 390 (touch) |
|---|---|---|
| `.rk` bredd × kolumner | 980 px, `537.891px 440.109px` | 356 px, `354.25px` |
| `.rk__rubrik` | 36px / 500 / lh 43.2 / margin 0 0 39.6 | 26.756px / 500 / margin 0 0 21.456 |
| `.rk__etikett` | 20px / 500 / lh 25 / ls -0.2 | 20px |
| `.rk__under` | 16px / 400 / lh 22.4 / #565e82 / margin-top 7 | (samma) |
| `.rk__segment > label` (vald) | 16px / 600 / #007a69 / padding 7 13.992 / min-h 40 / 88×40 | 16px / min-h 44 / padding 6.6 10.521 / 152×44 |
| `.rk__input` | 18px / 500 / padding 0 43.692 0 13.992 / min-h 48 / kant rgba(9,11,50,.48) / radie 11.988 / 165×48 | 18px / padding 0 38.623 0 10.521 / 311×48 |
| `.rk__enhet` | 16px / 400 / #565e82 | (samma) |
| `#rk-lagg` (`.rk__lank`) | 16px / 500 / #007a69 / min-h 44 | (samma) |
| `.rk__panel` | padding 39.6 / bg #f5f9ff / border-left 1px rgba(9,11,50,.14) / radie 0 19 19 0 | padding 28 21.456 / border-top / radie 0 0 15.338 15.338 |
| `.rk__eyebrow` | 12px / 600 / ls 1.68 / #565e82 | (samma) |
| `.rk__tal` | 55.9992px / 700 / lh = fs / ls -1.68 | 52px |
| `.rk__prefix` | 27.9996px / 500 / #565e82 | 26px |
| `.rk__per`, `.rk__fin` | 16px resp 14px / 400 / #565e82 / margin-top 9.9 | (samma) |
| `.rk__talrad` margin-top | 13.992 | 14 |
| `.rk__stopptext` | 18px / 500 / lh 24.3 / #090b32 | (samma) |
| Fokus på `.rk__input` | ring `rgba(0,122,105,.9) 0 0 0 3px`, kant `rgb(0,122,105)` | (samma) |
