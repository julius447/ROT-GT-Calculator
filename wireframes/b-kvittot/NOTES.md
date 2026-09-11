# Riktning B "Kvittot", anteckningar (2026-09-11)

## 1. Idén i tre meningar
Verktyget ser ut som fakturan kunden får sen: till vänster ställer du in jobbet, till höger ligger kvittot med
fullt pris först, avdraget draget inför ögonen på dig och att betala sist. Villkoren är stämplar i kvittot: en
stor stämpel uppe till höger (Berättigad / Gäller inte / Osäkert) och små stämpelrader under totalen. Det
besökaren minns: "det här står på min faktura, och så här mycket dras av."

## 2. Vad som byggts, och avvikelser

**Filer:** `index.html` (statiskt förvalsläge ROT + fristående, genererad av `_build.mjs` ur samma renderare som
webbläsaren kör), `styles.css` (bygger på `../_shared/tokens.css` + `fonts.css`), `app.js` (ES-modul: pure
string-renderare + hydrering, importerar `../../logik/ui-model.js`), `_probe.mjs` (Playwright-test), `skarmdumpar/`.

**Ytan:** valde det mörka kortet (flat `--ap-navy`, totalplattan `--ap-navy-2`, hårlinjer `--on-dark-line`),
inte pappersvitt. Skäl: (1) tjänstesidornas ROT/GT-block (rot-gt-cro D2) visar redan "Så räknas ROT" på en mörk
panel, så artikel och tjänstesida talar samma bild; (2) kalkylatorfamiljen är vit input / mörk resultatpanel, och
ett vitt kvitto på off-white hade suddat ut var svaret finns; (3) utskriften blir ändå papper (print-stilmallen
byter tokens till svart på vitt). Ingen glow, ingen gradient, ingen centrerad rubrik; hierarkin är typografisk
(etikett 400 dämpad, belopp 500 tabular, total 600 i `--fs-h3`, avdragsraden i teal-bright som enda accent).

**Kvittots rader** (`receiptModel` i app.js), allt ur `result.belopp` + `effectiveState`:
- ROT punkt/intervall: Arbetskostnad (not: "antaget, ca 60 % av 30 000 kr" / "från offerten"), Material (not: "ger
  inget avdrag", aldrig röd), ROT-avdrag på arbetet, 30 % (negativ, teal; intervall som "-4 100 till -6 800 kr" med
  `bas_text` som not), totalplatta "Att betala efter avdrag" (intervall: "ca 23 300 till 26 000 kr").
- ROT tak (belopp tomt / osäkert): bara avdragsraden ("Upp till 50 000 kr i år") + totalen som länk "Ange vad jobbet
  kostar" som flyttar fokus till beloppsfrågan.
- ROT noll (potten slut): raderna står kvar, avdraget "0 kr i år" dämpat, att betala = hela priset.
- Begränsad skatt/pott: avdraget på fakturan som belopp, `bas_text` som not ("Resten, 200 kr, kan bli kvarskatt").
- Dold (hårt nej, troligen inte): inga siffror alls, ram-raden bär beskedet (UX §3.6).
- GT: "Laddbox med installation" (not "arbete och material"), "Grön teknik 50 % på arbete och material", att betala.
  Material själv/leasing: "Installationsarbete" + "Utrustning du köper själv / Hyrd eller leasad utrustning (ger
  inget avdrag)" + "Grön teknik 50 % på arbetet". Elcentral-tillägg som egen rad (ger inte grön teknik, kan ge ROT).
  Sol + batteri: fyra rader, två avdrag under ett tak (not: "Två rader, ett tak" eller "Taket … slår i").
  Batteri utan sol: "Grön teknik utan solceller: gäller inte" + "ROT 30 % på arbetet" (belopp om arbetskostnaden är
  angiven, annars länken "Ange arbetskostnaden" som öppnar Fler detaljer), CTA "Räkna med ROT i stället" byter läge.
- Språket är D2:s: "Så räknas ditt pris" (caps), "ROT-avdrag på arbetet", "Att betala efter avdrag" (COPY
  `b.att_betala`), totalen som platta.

**Stämpeln:** roterad -6°, konturerad rundad rektangel med dubbelring (outline), versaler, opacity .9. Tre rader:
"ROT 2026 / GRÖN TEKNIK 2026", huvudord, underrad. Klass → stämpel: ja = teal-bright "Berättigad, preliminärt";
ja_villkor = vit kontur "Berättigad, om villkoren stämmer" (ja_men: "med begränsning"); troligen_inte = grå "Gäller
inte, troligen"; nej = grå "Gäller inte" (inte_i_ar: "Inte i år", inte_an: "Inte än"); osaker = grå "Osäkert, vi
reder ut det". Stämpeln flyter (`float`) så rubriken bryter runt den; på 390 px tar den ca 12 rem.

**Stämpelraderna:** de sex tillstånden ritade inline (bock teal, hålring, frågeteckenring, varningstriangel,
kryss, dämpad bock), "(antaget)" som ord, klick flyttar fokus till frågan (öppnar Fler detaljer vid behov,
scrollar till mitten på mobil). "Sköter vi"-rader är inte klickbara.

**Frågepanelen:** `<fieldset>`/`<legend>` per fråga, CSS-räknare numrerar de synliga (dolda räknas inte), chips är
riktiga radios. Vald chip = midnight med vit text (riktningens variant: bläck på papper, 15:1 kontrast; teal
bara för CTA och avdragsraden). Belopp: textfält `inputmode="numeric"`, stepper ±5 000 (44 px+), förvalsknappar.
Fler detaljer: native `<details>`, skattefördjupningen (`skatt_djup`) ligger där som undergrupp med vänsterlinje.
Synk vid svar flyttar bara noder som ligger fel (fokus behålls, ingen omrendering av panelen).

**Avvikelse, embed (ERSATT i fixrundan, se §8):** budgeten 900 px gick inte att nå med fyra chip-frågor i
tryckstorlek på 390 px (första mätningen 2 118 px). Första bygget renderade därför chip-frågorna som native `<select>`
i embed; granskningen (B-M3) underkände det. Nu: chips (riktiga radios) i båda ytorna, två kolumner à 44 px på mobil,
och i embed ligger `vardear` (+ följdfrågan `arbetstyp`), `skatt` och GT:s `agare` bakom Fler detaljer
(`EMBED_FOLD` i app.js); deras antaget-rader i kvittots fällrad är klickbara och öppnar Fler detaljer. Hjälptexterna
för valfrågor och (under 768 px) beloppsfrågan döljs i embed (kvar i DOM för `aria-describedby`), förvalsknapparna
döljs, och kvittot visar avdragsrad + total + källrad; Arbetskostnad / Material, stämpelraderna, Vad händer nu,
dela-raden och Så har vi räknat ligger bakom "Visa hela kvittot och villkoren". Fristående sida har allt utfällt.

**Avvikelse, "beloppsraden har fast höjd":** kvittots radblock byter höjd mellan klasser (tak/punkt/intervall/dold),
CTA:n ligger under stämpelraderna. Jag satte ingen tvingad min-height: den tomma luften under "Ange vad jobbet
kostar" såg värre ut än förskjutningen, som bara sker vid klassbyte, inte vid beloppsjustering (siffrorna byts på
plats med count-up). Produktion: reservera höjd per läge om ägaren vill ha CTA:n låst.

**Inte byggt / förenklat:** `Skriv ut` saknas i embed (per research/05 §6). Ingen `[GAP]`-siffra tillagd;
förvalen är motorns. Utan JS visar sidan ROT-förvalet oavsett `?m=` (statisk fil, i produktion renderar servern
per shortcode). `noscript`-tabellen (arbetskostnad → ROT, taket markerat) räknas av motorn i bygget.

## 3. Uppmätta höjder (verktyget `#ak`, rubrik + panel + kvitto + disclaimer), errors = [] och overflowX = false överallt

Efter fixrundan 2026-09-11 (chips i embed, värdeår + skatt fällda, källrad + 44 px-tel tillagda):

| Läge / yta | 390 px | 1440 px |
|---|---|---|
| ROT, embed | **1 177 px** (inputs 367, kvitto 604); verktyget börjar 715 px ner utan demo-remsan, Snabbfakta vid 1 939 | 1 089 px |
| GT laddbox, embed | 1 314 px (inputs 504, kvitto 577) | |
| GT sol, embed | 1 314 px | |
| GT batteri, embed | 1 502 px (fyra synliga frågor: läge, boende, solceller-grinden, belopp) | |
| ROT, fristående | 2 866 px (inputs 1 185, kvitto 1 376) | 1 527 px |
| GT laddbox, fristående | 2 570 px (inputs 985, kvitto 1 280) | 1 469 px |

Budgeten 900 px (UX §6.2) hålls fortfarande inte: 277 px över i ROT-embed (var 345). Vägen: 1 245 (select) → 1 242
(chips + fällda frågor, men källrad + 44 px-tel tillkom) → 1 177 (beloppshjälpen dold under 768 px i embed, tätare
luft ovanför raderna). Under 1 000 kräver att ingressen stryks i embed (ca −60) och att tel-länken går in i fällraden
(ca −45): ägarbeslut, inte gjort. Kvittot på mobil, fristående: 1 376 px utfällt (spann-raderna + källraden + 44 px
villkorsrader lade på 90 px).

Första byggets siffror (för spårbarhet): ROT embed 1 245, GT laddbox embed 1 234, ROT fristående 2 788, GT fristående 2 492.

## 4. Interaktionstest, första bygget (ersatt av §8.3; raden "Alla tre bekräftade" nåddes då via byt-och-tillbaka, inte via rena tryck)

- Hyresrätt → "Nej, avdraget gäller den som äger bostaden", stämpel `nej`, ingen knapp, textlänk "Hör med din
  hyresvärd", beloppsfrågan dold. OK
- Värdeår vet inte + skatt vet inte → "Osäkert. Vi behöver veta om huset är äldre än fem år och om skatten räcker",
  stämpel `osaker`, solid tel-knapp + Skatteverket-länk. OK
- Alla tre bekräftade → "Ja, du kan använda ROT-avdraget", stämpel `ja` (teal). OK
- Remsa: visas efter första svaret, döljs när kvittot är ≥ 50 % synligt, text "Ja  avdrag ca 4 100 till 6 800 kr",
  knapp "Till kvittot". Speglingen av CTA:n när kortet passerats testades inte (sidan slutar strax under kortet). OK
- Fler detaljer öppnas (9 synliga frågor); klick på villkorsraden "skatt" flyttar fokus till skattfrågan. OK
- Belopp tomt → "Upp till 50 000 kr i år" + länk "Ange vad jobbet kostar"; förval 60 000 → "-8 100 till -13 500 kr",
  att betala "ca 46 500 till 51 900 kr"; arbetskostnad 40 000 → punkt "-12 000 kr", att betala 48 000 kr, andels-
  slidern döljs. OK
- Kopiera länk → status "Länk kopierad", URL `?m=rot&a=60000&ak=40000`; adressfältet uppdaterat efter 400 ms. OK
- GT batteri + nej solceller → "Troligen inte grön teknik utan egna solceller …", stämpel `troligen_inte`, knapp
  "Räkna med ROT i stället"; klick byter till ROT med boende/skatt/belopp bevarade, URL `?m=rot&a=70000`. OK
- Sol + batteri 80 000 → fyra rader, 15 % -22 500 kr, 50 % -27 500 kr, "Taket på 50 000 kr per person slår i",
  att betala 180 000 kr. OK
- Embed: fällrad finns, ingen Skriv ut, ingen remsa, rubriken H2, select-svar BRF räknar om, sidans URL rörs inte,
  basraderna (Arbetskostnad/Material) ligger i fällraden. OK
- Count-up: 48 000 → 21 000 kr passerar mellanvärden (ca 280 ms); med `prefers-reduced-motion` byts direkt. OK
- Print-media: inputs/CTA/dela/remsa/demo dolda, kvittot svart på vitt med stämpel, villkor, Vad händer nu,
  Så har vi räknat. OK
- JS-fel: 0 i alla körningar.

## 5. LOCAL_COPY (strängar som saknas i COPY, ligger i `app.js`)
Rubrik/lead: `h1.rot`, `h1.gt`, `lead`, `lead.embed`. Kvittot: `kv.caps` ("Så räknas ditt pris"), `kv.arbetskostnad`,
`kv.arbetskostnad.spann`, `kv.arbetskostnad.antaget`, `kv.arbetskostnad.andel`, `kv.arbetskostnad.offert`, `kv.material`, `kv.material.not`,
`kv.avdrag.rot`, `kv.avdrag.gt`, `kv.avdrag.gt.arbete`, `kv.avdrag.sol`, `kv.avdrag.batteri`, `kv.avdrag.alt_rot`,
`kv.gt_utan_sol`, `kv.galler_inte`, `kv.rad.laddbox/batteri/sol/arbete/egen/hyrd/elcentral`, `kv.elcentral.not`,
`kv.arbete_material`, `kv.fastpris`, `kv.tak_tva`, `kv.att_betala` (dubblerar frasen i COPY `b.att_betala`), `kv.ca`,
`kv.till`, `kv.ange_belopp`, `kv.ange_arbete`, `kv.beror_arbete`, `kv.hela`, `kv.kalla` (källa + datum, research/05
§3.1), `kv.skv.rot`, `kv.skv.gt`. Stämpeln: `stamp.rot`, `stamp.gt`, `stamp.ja`, `stamp.ja.sub`, `stamp.preliminart`, `stamp.ja_villkor.sub`,
`stamp.ja_men.sub`, `stamp.nej`, `stamp.troligen.sub`, `stamp.inte_i_ar`, `stamp.inte_an`, `stamp.osaker`,
`stamp.osaker.sub`. UI: `ui.visa_villkoren`, `ui.visa_hela`, `ui.till_kvittot`, `ui.lank_kopierad`, `ui.oka`, `ui.minska`,
`ui.typiska_belopp`, `ui.noscript`, `ui.tabell.*`. Remsan: `strip.avdrag` (rubriken i remsan är motorns `headline.text`).
Demo (inte verktyget): `demo.*`, `art.*` (platshållare utan fakta sedan fixrundan). `lead` tar `{n}` (antal synliga
huvudfrågor som ord).

## 6. Öppna frågor för ägaren
1. Embed-budgeten: värdeår + skatt är nu fällda i embed (1 177 px). Acceptera det, eller även stryka ingressen och
   lägga tel-länken i fällraden (ca 1 070 px)? Under 900 finns ingen väg utan att ta bort boende-chipsen.
2. Vald chip = midnight (riktningens variant) eller produktionens teal med vit text (kontrast 3,0:1)?
3. Mörkt kvitto valt av mig; vill ägaren se pappersvarianten renderad innan valet?
4. Stämpelns ord: nu "Preliminärt / om villkoren stämmer" (villkorat), "Preliminärt / med begränsning" (ja men) och
   "Berättigad / preliminärt" bara vid bekräftat ja. Orden är mina; ska stämpeln säga "ROT-avdrag 30 %" i stället?
5. `kv.kalla` ("kontrollerade 2026-09-11") behöver en ägare som uppdaterar datumet.
6. Avrundning: totalen visas som `round100(att_betala_kr)` från motorn; vid ett .5-fall kan pris minus avdrag skilja
   100 kr från den visade totalen. Motorn eller visningen bör bestämma en regel.
7. `[GAP]` i hjälptexten för arbetsandel ("[GAP: Ampys andel per jobbtyp]") syns för kunden tills GRIND 2 landar.

## 7. Vad jag inte hann
- Ingen tvingad fast höjd på radblocket (se §2), ingen mätning av CLS-reserv per yta.
- Sticky-remsans spegling av primär-CTA:n när kortet passerats är byggd men inte verifierad i test (sidan slutar
  strax under kortet, så kortet passeras aldrig; `kvPassed` sätts av samma IntersectionObserver som §8 verifierar).
- Ingen 200 %-zoomkontroll, ingen VoiceOver-genomgång (bara struktur: fieldset/legend, aria-live 600 ms, fokusordning).
- `navigator.share` är kodad men inte testad på riktig mobil.

## 8. Fixrunda 2026-09-11 (PUNCHLISTA.md efter GRANSKNING.md)

Ordning enligt punchlistan. "Klart" betyder: rättat i koden, omrenderat och verifierat med en probe eller en
skärmdump som nämns nedan. Inget i `logik/` eller `_shared/` är rört.

### 8.1 Punkterna

| # | Punkt | Status | Vad som gjordes / varför |
|---|---|---|---|
| 1 | B-B1 Bekräfta-trycket | **Klart** | `onRadio(el)` nås från både `click` (även på en redan vald chip, då kommer inget `change`) och `change`; idempotent (`touched.has(id) && state[id] === val` → return, ingen dubbel tracking). `keydown` Space/Enter på en vald radio → `el.click()`. `submit` på formen stoppas. Probe: tre rena tryck på förvalen → "Ja, du kan använda ROT-avdraget", stämpel `ja`; samma chip två gånger → 1 answer-event; Space på villa → första raden `srow--ok`; `_review/isolate.mjs` → `b_confirm.headline_after_three_taps` = "Ja, du kan använda ROT-avdraget", `b_confirm_keyboard_space` = `srow--ok` först. |
| 2 | B-M1 Stämpeln | **Klart** | `ja_villkor` → "Preliminärt / om villkoren stämmer", `h.ja_men` → "Preliminärt / med begränsning", "Berättigad / preliminärt" bara vid `klass === 'ja'`. Huvudordet 1,45 rem (0,09 em spärr, `nowrap`), underraden 1,2 rem; stämpeln får 15,5 rem (13,6 rem mobil) och en 0,5 rem marginal på mobil så den inte går in i eyebrow-raden. Skärmdump: `skarmdumpar/rot-mobile.png`. |
| 3 | B-M2 "Fyra frågor" | **Klart** | `leadFromBank()` räknar `shown && !folded` i huvudlistan och skriver "{n} frågor" som ord (Två … Nio); uppdateras i `syncBank` när banken ändras. Probe: ROT förval "Fyra frågor", värdeår 2021–2025 → "Fem frågor" (5 synliga). Embed-ingressen har ingen siffra. |
| 4 | B-M3 Chips i embed | **Klart** | `selectHtml`/`compactSelect` och `.sel`-CSS borttagna; chips i båda ytorna. `EMBED_FOLD = {vardear, arbetstyp, skatt, agare}` respekteras av `renderBank` och `syncBank` när `compact`. Utöver punchlistans två la jag `arbetstyp` (värdeårets följdfråga, annars dyker den upp som huvudfråga när svaret ges i fällraden) och GT:s `agare` (samma princip; taknoten "slår i" i avdragsraden pekar dit när det spelar roll). Antaget-raderna i kvittots fällrad öppnar Fler detaljer och sätter fokus på frågan (probe: klick på skatt-raden → `#more` öppen, fokus `skatt=lon`; bekräftelse där → raden `srow--ok`). ROT embed 390: **1 177 px** (se §3). |
| 5 | B-M4 Artikelattrappen | **Klart** | `art.*` är platshållare utan fakta (samma mått som A/C); "sparar" borta. `grep spar app.js` = 0. |
| 6 | B-M5 Remsan ovanpå CTA:n | **Klart** | Två observatörer: kortet (`kvVisible` ≥ 50 %, `kvPassed`) och `#kv-cta` (`ctaVisible` = ≥ 50 % i viewport; observeras om varje gång CTA-sektionen byts). Remsan visas bara när `interacted && !kvVisible && !ctaVisible`. `_review/sticky.mjs`: raden vid sidans slut (card 44 %) är `strip=off`; ingen rad med CTA:n synlig och `strip=ON`. Egen probe: toppen ON, kortet synligt off, CTA i viewport off, sidans slut off. |
| 7 | B-M6 Tryckytor | **Klart** | `.preset` 44 px under 768, `.srow__btn` `min-height: 4.4rem` + `padding: 1rem 0.4rem` (44–79 px), `.cta__sec` inline-flex 44 px. Probe `--a11y` på 390: preset 44, srow 44–79, cta_sec 44, chips 48–53, dela 44, summary 48–52. Kvar under 44: Skatteverkslänken inne i "Så har vi räknat" (inline länk i löptext, 15 px, syns bara med details öppen; WCAG:s undantag för länkar i text). |
| 8 | B-M7 Arbetskostnad i intervall | **Klart** | I `intervall` visas Arbetskostnad "ca 13 500 till 22 500 kr" (not "antaget 45 till 75 % av 30 000 kr") och Material "ca 7 500 till 16 500 kr", räknat som motorn (`andel ± GAP_DEFAULTS.INTERVALL_PP`, hundratal); 30 % av spannet = avdragsraden −4 100 till −6 800 kr. Vid 60 000: 27 000–45 000 / 15 000–33 000 / −8 100 till −13 500. I noll-/begränsat-läge med antagen andel står "antaget, 60 % av 30 000 kr" (tidigare utan "antaget"). `receiptModel` får hela `r` (läser `r.raw`). |
| 9 | B-M8 Källa + datum | **Klart** | `<p class="kv__source" id="kv-source">` ligger direkt under totalplattan i `#kv-lines`, i båda ytorna, även i dold-läget (nej). Skatteverkslänken kvar i details. `_review/truth.mjs`: `kalla` läses i alla sex scenarier. |
| 10 | B-m1 Remsans rubrik | **Klart** | Remsan visar `r.headline.text` (utan avslutande kolon), `.strip__verdict` klipper med ellipsis. `strip.ja/ja_om/ja_men/troligen/nej/osaker` borttagna; inga "…" i koden. |
| 11 | B-m2 Antaget-ringen | **Klart** | `.i-antaget { color: var(--on-dark-faint) }` → 5,6:1 mot navy (probe `--a11y`, alfa-komponerat). |
| 12 | B-m3 Omrendering | **Klart** | `receiptSections()` ger sektioner med stabila id:n (`kv-head`, `kv-lines`, `kv-stamps`, `kv-next`, `kv-cta`, `kv-share`, `kv-metod`, `kv-noscript`; embed: `kv-cta` + `kv-fold`). `paintReceipt` byter bara sektioner vars HTML ändrats (strängcache), och återställer fokus via `data-fraga`/`data-cta`/`data-share`/`data-byte`/summary om den bytta sektionen bar fokus. Dela-raden är konstant → `#share-status` överlever ("Länk kopierad" står kvar efter nytt svar, probe). Fokus på CTA:n överlever en debounce-omräkning (probe: `A.btn btn--primary`). Count-up: bara på `[data-num]`-belopp (punkt); spann-raderna är text och byts direkt (som förr). |
| 13 | B-m4 Lead i fristående | **Klart** | "Inget mejl, ingen inloggning" bara i `lead.embed`. |
| 14 | B-m5 Rubriker i kortet | **Klart** | `kv__caps` renderas som `<h3>` (fristående, under kortets h2) och `<h4>` (embed, under h3). `_review/a11y.mjs`: H1 → H2 → H3 "Så räknas ditt pris" / "Vad händer nu". |
| 15 | B-m6 Ett hedgeord | **Delvis (medvetet)** | Valde alternativ 2: "ca" bara i beloppskolumnen/totalen, aldrig i samma rad som COPY:s "ungefär" (avdragsradens not bär "ungefär", dess belopp har inget "ca"). "ungefär" i totalen hade blivit 29 tecken i 20 px på 302 px bredd med `nowrap`. Vill ägaren ha "ungefär" överallt: `kv.ca` + en mindre total på mobil. |
| 16 | B-m7 `select { font: inherit }` | **Klart** | I resetraden, även om ingen select finns kvar. |
| S-1 | Teal-kontrast, lokalt | **Klart (inget att lätta)** | Teal-bright-text på navy mätt till 8,65:1 (avdragsraden, länkar, bockar); on-dark-faint 5,6:1; totalen 16,4:1. Ingen lokal `--receipt-accent` behövdes. CTA-knappen (vit på `--ap-teal`) står kvar på 2,96:1 som produktionens token, ägargrind. |
| Motor a | `secondary.kind === 'offert'` | **Klart** | Skatten räcker delvis (fördjupning, 15 000 kr/mån, 150 000 kr arbete): solid tel "Prata med oss innan du beställer" + textlänk `cta__sec cta__sec--link` "Få ett pris efter avdrag" (probe + `_shots/b-fix-kv-delvis.png`). |
| Motor b | `lage_byte` med `solid: false` | **Klart** | GT sol: primär = `<button class="cta__link" data-byte>` "Räkna på batteri till solcellerna" (ingen solid knapp), sekundär tel; klick byter till batteri med boende/skatt/ägare bevarade, URL `?m=gt&l=batteri`. Byte-spårningen skriver rätt `from`/`to` (var hårdkodad till `rot`). |
| Bonus | `src=artikel` (S-4) | **Klart** | `evaluate(..., { src: 'artikel' })` i embed: offert-href `/kontakt/?src=artikel&m=rot&…` (probe). |
| Bonus | "60 %" bröts över rad | **Klart** | `esc()` sätter fast mellanslag mellan siffra och % (typografi, ändrar inte COPY:s ord). |

### 8.2 Render-loopen (`node tools/shot.mjs …`, 1440 + 390, 2×)

rot, gt, embed: `errors: []`, `overflowX: false` på båda viewports (tre varv: efter chips/sektioner, efter
stämpelmarginalen, efter embed-luften). `_probe.mjs --overflow`: inga element utanför 390 px. Skärmdumparna i
`skarmdumpar/` är omgjorda. Tillståndsark: `_shots/state-*-m.png` (nej/hyra, osäkert, tak, noll, skatt låg,
femårsregeln, BRF laddbox, BRF batteri) och `_shots/b-fix-kv-delvis.png`, `_shots/b-fix-cta-sol.png`.

### 8.3 Proben (`node wireframes/b-kvittot/_probe.mjs --interact`, `--a11y`, `--heights`, `--print`, `--motion`, `--details`; 0 JS-fel i alla)

- Start: "Ja, om det här stämmer:", stämpel `ja_villkor` "Preliminärt / om villkoren stämmer", ingress "Fyra frågor …".
- Rent tryck på förvalet villa → raden `ok`; samma chip igen → fortfarande 1 answer-event; tre rena tryck →
  "Ja, du kan använda ROT-avdraget", stämpel `ja` "Berättigad / preliminärt", alla rader `ok`.
- Värdeår 2021–2025 → "Ja, om jobbet är en reparation", ingress "Fem frågor", 5 synliga huvudfrågor.
- Hyresrätt → "Nej, avdraget gäller den som äger bostaden", stämpel `nej` "Gäller inte", ingen knapp, textlänk
  "Hör med din hyresvärd", beloppsfrågan dold, källraden synlig.
- Vet + vet → "Osäkert …", stämpel `osaker` "Osäkert / vi reder ut det", solid tel + Skatteverket-länk.
- Remsa: toppen ON ("Ja, du kan använda ROT-avdraget / avdrag ca 4 100 till 6 800 kr", "Till kvittot"); kortet
  synligt off; CTA:n i viewport off; sidans slut off.
- Fler detaljer: 9 synliga frågor; villkorsrad skatt → fokus på skatt-chipen.
- Belopp tomt → "Upp till 50 000 kr i år" + "Ange vad jobbet kostar"; 60 000 → spann-rader 27 000–45 000 / 15 000–33 000,
  avdrag −8 100 till −13 500, att betala ca 46 500 till 51 900; arbetskostnad 40 000 → −12 000 kr, 48 000 kr, slidern dold.
- Fokus på CTA:n överlever omräkningen; "Länk kopierad" överlever nästa svar; URL `?m=rot&b=fritid&a=50000&ak=40000`.
- Tangentbord: Space på villa → `ok`; Enter på lön → `ok`; pil höger → pension-raden byts (inga dubbla events).
- Skatten räcker delvis → tel solid + offert-textlänk. Sol → textlänk + tel, byte → batteri. Batteri utan sol →
  "Räkna med ROT i stället" (solid) → ROT med `?m=rot&a=70000`. Sol + batteri 80 000 → fyra rader, taket slår i, 180 000 kr.
- Embed: 0 select; huvudfrågor `boende, belopp`; i Fler detaljer `vardear, skatt, jobb, …`; fold finns, ingen
  Skriv ut, ingen remsa, H2, källrad synlig utanför details, offert-href med `src=artikel`; BRF via chip räknar om utan
  att röra URL:en; antaget-rad → Fler detaljer öppen + fokus; bekräftelse i fällraden → `ok`.
- Tryckytor och kontrast: se punkt 7 och S-1. Print: inputs/CTA/dela/demo/remsa dolda, kvitto + villkor + Vad händer
  nu + Så har vi räknat synliga. Count-up 48 000 → 21 000 passerar mellanvärden; reduced motion byter direkt.
- Granskarens prober: `truth.mjs desktop` → B lika med motorn i alla sex scenarier (scenario 2 "Ja, om jobbet är en
  reparation"); `isolate.mjs` → `b_confirm` grönt; `sticky.mjs` → ingen ON-rad med synlig CTA; `states.mjs` → CTA
  rätt i 13/13, 0 "!", 0 streck, enda "bannade" träffen är COPY:s "går inte att spara" (motorns rad, som i A/C);
  `a11y.mjs` → struktur/tabbordning/pilar/aria-live/reduced motion/print/utan JS utan anmärkning.

### 8.4 Det jag inte håller med om, eller gjorde annorlunda

- **Höjdmålet "ca 1 150 px"** var räknat utan källraden (+40) och utan 44 px-tel (+13) som punkterna 7 och 9 kräver.
  Med allt på plats landade det på 1 242; jag tog det till 1 177 genom att dölja beloppsfrågans hjälptext i embed under
  768 px (som chip-hjälpen redan var) och strama luften ovanför raderna. Mer kräver ägarbeslut (ingress, tel i fällraden).
- **`agare` och `arbetstyp` i embed-fällraden** står inte i punchlistan; se punkt 4 för skälet. Lätt att backa
  (`EMBED_FOLD`).
- **"Fler frågor" som rubrik på fällraden i embed** valde jag bort: COPY:s villkorsrader säger "under Fler detaljer"
  på fyra ställen, och samma ord i båda ytorna är värt mer än den exaktare rubriken.
- **Hedgeordet (B-m6):** alternativ 2, inte "ungefär" överallt; se punkt 15.
- **Skatteverkslänken 15 px** i "Så har vi räknat" lämnad som inline länk i löptext.
