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

**Avvikelse, embed:** budgeten 900 px gick inte att nå med fyra chip-frågor i tryckstorlek på 390 px (första
mätningen 2 118 px). I embed renderas därför chip-frågorna som kompakta native `<select>` (etikett över, en rad
per fråga, som fälten i fakturans huvud), `lage` behåller sin segmenterade rad, hjälptexterna för valfrågor döljs
(finns kvar i DOM för `aria-describedby`), förvalsknapparna döljs, och kvittot visar avdragsrad + total; Arbetskostnad
/ Material, stämpelraderna, Vad händer nu, dela-raden och Så har vi räknat ligger bakom "Visa hela kvittot och
villkoren". Fristående sida har allt utfällt med chips.

**Avvikelse, "beloppsraden har fast höjd":** kvittots radblock byter höjd mellan klasser (tak/punkt/intervall/dold),
CTA:n ligger under stämpelraderna. Jag satte ingen tvingad min-height: den tomma luften under "Ange vad jobbet
kostar" såg värre ut än förskjutningen, som bara sker vid klassbyte, inte vid beloppsjustering (siffrorna byts på
plats med count-up). Produktion: reservera höjd per läge om ägaren vill ha CTA:n låst.

**Inte byggt / förenklat:** `Skriv ut` saknas i embed (per research/05 §6). Ingen `[GAP]`-siffra tillagd;
förvalen är motorns. Utan JS visar sidan ROT-förvalet oavsett `?m=` (statisk fil, i produktion renderar servern
per shortcode). `noscript`-tabellen (arbetskostnad → ROT, taket markerat) räknas av motorn i bygget.

## 3. Uppmätta höjder (verktyget `#ak`, rubrik + panel + kvitto + disclaimer), errors = [] och overflowX = false överallt

| Läge / yta | 390 px | 1440 px |
|---|---|---|
| ROT, embed | **1 245 px** (inputs 507, kvitto 532), Snabbfakta börjar vid 2 127 px | 1 207 px |
| GT laddbox, embed | 1 234 px (inputs 503, kvitto 498) | |
| ROT, fristående | 2 788 px (inputs 1 169, kvitto 1 286) | 1 455 px |
| GT laddbox, fristående | 2 492 px (inputs 969, kvitto 1 190) | 1 397 px |

Budgeten 900 px (UX §6.2) hålls inte: 345 px över i ROT-embed. Vägen dit: 2 118 → 1 808 (hjälptexter av, tätare
chips) → 1 383 (select-fält) → 1 245 (förval av, mindre luft). Resten är fyra frågor à ca 90 px + kvittots huvud
(107) + avdrag/total (206) + CTA/tel (110) + fällraden (44). Att komma under 900 kräver att två av de fyra synliga
frågorna fälls (t.ex. värdeår och skatt bakom "Fler detaljer" med sina antaget-rader kvar i kvittot), vilket är ett
doktrinbeslut (UX §2.1), inte ett layoutbeslut. Kvittot på mobil, fristående: 1 286 px utfällt (UX gissade 260 px
för ett kompakt kort; kompakta kvittot i embed är 532 px inkl. CTA och fällrad).

## 4. Interaktionstest (`node wireframes/b-kvittot/_probe.mjs --interact`, Playwright, 390×844)

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
`kv.arbetskostnad.antaget`, `kv.arbetskostnad.andel`, `kv.arbetskostnad.offert`, `kv.material`, `kv.material.not`,
`kv.avdrag.rot`, `kv.avdrag.gt`, `kv.avdrag.gt.arbete`, `kv.avdrag.sol`, `kv.avdrag.batteri`, `kv.avdrag.alt_rot`,
`kv.gt_utan_sol`, `kv.galler_inte`, `kv.rad.laddbox/batteri/sol/arbete/egen/hyrd/elcentral`, `kv.elcentral.not`,
`kv.arbete_material`, `kv.fastpris`, `kv.tak_tva`, `kv.att_betala` (dubblerar frasen i COPY `b.att_betala`), `kv.ca`,
`kv.till`, `kv.ange_belopp`, `kv.ange_arbete`, `kv.beror_arbete`, `kv.hela`, `kv.kalla` (källa + datum, research/05
§3.1), `kv.skv.rot`, `kv.skv.gt`. Stämpeln: `stamp.rot`, `stamp.gt`, `stamp.ja`, `stamp.ja.sub`, `stamp.ja_villkor.sub`,
`stamp.ja_men.sub`, `stamp.nej`, `stamp.troligen.sub`, `stamp.inte_i_ar`, `stamp.inte_an`, `stamp.osaker`,
`stamp.osaker.sub`. UI: `ui.visa_villkoren`, `ui.visa_hela`, `ui.till_kvittot`, `ui.lank_kopierad`, `ui.oka`, `ui.minska`,
`ui.typiska_belopp`, `ui.noscript`, `ui.tabell.*`. Remsan: `strip.ja`, `strip.ja_om`, `strip.ja_men`, `strip.troligen`,
`strip.nej`, `strip.osaker`, `strip.avdrag`. Demo (inte verktyget): `demo.*`, `art.*`.

## 6. Öppna frågor för ägaren
1. Embed-budgeten: acceptera ca 1 250 px, eller fälla värdeår + skatt bakom Fler detaljer i embed (då ca 1 050 px)?
2. Vald chip = midnight (riktningens variant) eller produktionens teal med vit text (kontrast 3,0:1)?
3. Mörkt kvitto valt av mig; vill ägaren se pappersvarianten renderad innan valet?
4. Stämpelns ord: "Berättigad" + "om villkoren stämmer" är mitt; ska stämpeln säga "ROT-avdrag 30 %" i stället?
5. `kv.kalla` ("kontrollerade 2026-09-11") behöver en ägare som uppdaterar datumet.
6. Avrundning: totalen visas som `round100(att_betala_kr)` från motorn; vid ett .5-fall kan pris minus avdrag skilja
   100 kr från den visade totalen. Motorn eller visningen bör bestämma en regel.
7. `[GAP]` i hjälptexten för arbetsandel ("[GAP: Ampys andel per jobbtyp]") syns för kunden tills GRIND 2 landar.

## 7. Vad jag inte hann
- Ingen tvingad fast höjd på radblocket (se §2), ingen mätning av CLS-reserv per yta.
- Sticky-remsans spegling av primär-CTA:n när kortet passerats är byggd men inte verifierad i test.
- Ingen 200 %-zoomkontroll, ingen VoiceOver-genomgång (bara struktur: fieldset/legend, aria-live 600 ms, fokusordning).
- `navigator.share` är kodad men inte testad på riktig mobil.
