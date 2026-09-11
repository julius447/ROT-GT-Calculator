# Riktning C, "Avdragsmätaren" (wireframe, 2026-09-11)

## 1. Idén i tre meningar

Ett instrument med två tak på samma skala: årets pott (50 000 kr per person, 100 000 vid två ägare, redan använt
ROT/RUT/GT som en grå redan-fylld del) och skatteutrymmet (estimatorn, ritad som ett andra tak med 29 till 35 %-bandet
som spannlinje). Jobbets avdrag fylls i teal; det som ryms inte i skatten är amber-streckat inne i mätaren
("kan bli kvarskatt") och det som inte ryms i potten är en amber-svans utanför taket ("ryms inte i år"). Inkomstfrågan
är synlig från start (band-slider, lön/pension/båda, fyllt 66, ränteutgifter), för det är riktningens poäng:
"jag har så här mycket kvar i år, och min skatt räcker till så här mycket".

## 2. Vad som byggts, och avvikelser

Filer: `index.html` (server-renderat förvalsläge, genererat av `_build.mjs` ur samma mallfunktioner som hydreringen
använder), `styles.css` (bygger på `../_shared/tokens.css` + `fonts.css`), `app.js` (ES-modul, importerar
`../../logik/ui-model.js`), `_build.mjs` (skriver index.html), `_probe.mjs` (Playwright: höjder + interaktionstest),
`skarmdumpar/`. Inga ändringar i `logik/`, `_shared/` eller andra riktningars mappar.

Byggt enligt briefen:
- Mätaren: 36 px spår desktop / 24 px mobil, rundade ändar, 2 px skiljelinjer mellan segment, tick-linjal var
  10 000 kr med etiketter 0 / 50 000 kr / 100 000 kr, svans för "ryms inte i år", markörlinje + etikett
  "Din skatt räcker hit (ca …)" (pinnad "räcker till hela potten" när utrymmet är större än potten), spannlinje för
  29 till 35 %-bandet ovanför spåret. Legend med belopp: Redan använt / Det här jobbet (eller Solceller 15 % +
  Batteri 50 %) / Kan bli kvarskatt / Ryms inte i år. Solida fyllningar animeras med `transform: scaleX`, streckade
  lager med `clip-path` (scaleX tänjer mönstret), markör/skiljelinjer/etikett med `translateX` av fullbredds-lager.
  280 ms, `prefers-reduced-motion` stänger av allt (tokens.css). Count-up på beloppet bara vid ändring, aldrig på load.
- Alla mätartillstånd: intervall (streckat teal-band min..max), punkt, takläge (konturerad rest av potten), noll
  (potten full, "0 kr i år"), dold/alt_rot (gråad, streckad bakgrund + "Gäller inte i det här läget"), två ägare
  (skalan växer till 100 000), sol + batteri (två segment under ett tak), begränsad av skatt, begränsad av pott.
- Layout: desktop ≥ 992 två kolumner, mätare + reglage + fördjupning + Fler detaljer till vänster, beskedspanelen
  (sticky) till höger med villkorslistan (sex radtillstånd som inline-SVG), Vad händer nu, EN CTA (solid bara när
  `cta.primary.solid`), tel-textlänk, Kopiera länk / Skriv ut / Börja om, Så har vi räknat (metodrader + statisk
  beloppstabell ur PARAMS + källrad + Skatteverkslänk). Mobil: mätare → reglage → fördjupning → Fler detaljer →
  besked → CTA, sticky-remsa (bara fristående, bara < 768, efter första interaktionen, döljs när beskedet är ≥ 50 %
  synligt, speglar primär-CTA:n när kortet passerats, aldrig tel).
- Ljus instrumentyta: vitt kort på off-white, teal för "ryms" och CTA, midnight/ink bara som text och markör,
  `--meter-over` (dämpad amber) definierad lokalt i `.meter` och används bara där.
- Villkorsrad → fråga (öppnar Fler detaljer/fördjupningen vid behov, fokus, scroll på mobil), `<details>` native,
  `aria-live="polite"` med 600 ms debounce, `<fieldset>/<legend>` per fråga, riktiga radios, `inputmode="numeric"`,
  44 px stepper- och thumb-ytor, 48 px chips på mobil, fokusringar, kontrast via tokens.
- Delbar länk via `encodeState` (aldrig inkomst, ränta eller fördjupning i URL:en; `replaceState` med 400 ms debounce
  bara fristående, `utm_*`/`gclid`/`fbclid` bevaras), `navigator.share` på mobil annars urklipp + `role="status"`.
  Utskrift: beskedet, villkoren, Vad händer nu, Så har vi räknat, mätarens avläsning, datum + länk (`beforeprint`).
- `track(event, props)` pushar bara till `window.dataLayer` om den finns; belopp i buckets, inkomst aldrig.

Avvikelser (medvetna):
- **Skattefördjupningen är synlig i fristående läge utan att `skatt_djup` är på.** Reglaget står på förvalet
  35 000 kr men estimatorn körs först när kunden rör något i gruppen (då sätts `skatt_djup = true`). Annars skulle
  mätaren rita ett skattetak för en inkomst kunden aldrig angett, ett falskt "personligt" besked.
- **Embed visar bara boende, belopp och skatt** (+ `sol` för batteri, grinden som avgör läget). Värdeår, p-plats,
  ägare m.fl. ligger under Fler detaljer i embed men syns i fristående läge enligt bankens `visible`. Skälet är
  höjdbudgeten (§3). Beskedet ljuger inte om det: raderna står som antagna (hålring) i villkorslistan och klick på
  raden öppnar frågan.
- **Belopp och skatt gråas vid hårt nej** (UX §9 "Gäller inte i det här läget") i stället för att tas bort ur DOM som
  bankens `showWhen` säger. Övriga ej visade frågor ligger i DOM med `hidden`.
- **"Så har vi räknat" ligger inuti "Visa villkoren" i embed** (05 §6: kompakt kort = besked, belopp, ram, CTA, tel).
- **Mätarens avläsning bär beloppet**, inte beskedspanelen (UX §4.2 slot 3). Beskedspanelen har eyebrow, rubrik, ram,
  villkor, steg, CTA. Beloppet står en gång, vid instrumentet.
- **Hjälptexter, "Att betala"-raden och dämpade legend-poster döljs i embed** (höjd). Legenden döljs i embed när bara
  "Det här jobbet" är tänd (avläsningen bär redan siffran).
- Två ägare med fördjupning: spannlinjen (29 till 35 %) bygger på ägare 1:s band; markören på summan av bådas utrymme.
- Läget byts (`?m=`/`?l=`/`surface`) och länk-förifyllning renderar verktyget om på klienten; bara förvalsläget
  (rot, fristående, inga svar) hydreras utan att strukturen byts. I produktion renderar servern rätt läge.
- Statiska `index.html` speglar COPY vid byggtillfället; copy-passet i `logik/` kräver `node wireframes/c-avdragsmataren/_build.mjs`
  för att den server-renderade texten ska följa med (hydreringen målar om mätare och besked ur aktuell COPY på load).

## 3. Uppmätta höjder (verktygets `#verktyg`, px, 2026-09-11)

| Läge / yta | 390 × 844 | 1440 × 1000 |
|---|---|---|
| embed, ROT | **1 398** (budget 900) | 1 290 |
| embed, GT laddbox | 1 538 | |
| embed, GT batteri | 1 689 | |
| fristående, ROT | 3 106 | 1 707 |
| fristående, GT batteri | 3 362 | |

Embed ROT på 390 px, ärligt: **1 398 px mot budgeten 900**. Verktyget börjar vid 797 px (attrappen: bild 230, H1, två
ingresstycken) och Snabbfakta börjar vid ca 2 250 px, dvs knappt tre skärmar i stället för två. Fördelningen:
rubrik + lead 111, mätare ~190 (avläsning 72, spår 24, linjal 26), tre reglage 499 (boende 182 = 5 chips i tre rader
à 48 px, belopp 122, skatt 147), två hopfällare 90, kompakt besked ~300, disclaimer ~60, luft ~150.
Det som redan är gjort för att komma ner: bara tre reglage, hjälptexter dolda, förval utan "kr" i en rad, legend och
etikettrad dolda tills de behövs, Så har vi räknat inuti Visa villkoren, disclaimer i eyebrow-storlek.
Kvarvarande spakar (ägarbeslut): 44 px chips i stället för 48 (ca −40 px), boende som två kolumner med lika breda
chips ändrar inget (fem alternativ = tre rader), kortare rubrik på en rad (−28), lead på en rad (−22), tel-länken in i
Visa villkoren (−44). Ens med allt det landar riktningen runt 1 250 px: tre chip-frågor plus instrument plus kompakt
kort ryms inte på 900 px vid 48 px tryckytor. Budgeten är realistisk bara om embed nöjer sig med två synliga frågor.

## 4. Interaktionstest (`node wireframes/c-avdragsmataren/_probe.mjs`, Chromium, 39/39 godkända)

- Load: "Ja, om det här stämmer:", inga JS-fel, sticky dold.
- Hyresrätt → "Nej, avdraget gäller den som äger bostaden", ingen solid knapp, mätaren inaktiv, beloppsfrågan gråad
  men kvar i DOM, sticky-remsan visas efter interaktionen (mobil, fristående).
- Värdeår "vet inte" + skatt "vet inte" → "Osäkert. Vi behöver veta om …", tel som primär, takläge (kontur) i mätaren.
- 15 000 kr/mån + 200 000 kr → "Ja, men skatten räcker till ungefär 22 100 kr av 36 000 kr", markör + kvarskatt-segment
  ritas, etiketten "Din skatt räcker hit (ca 22 100 kr)", legenden "Kan bli kvarskatt 13 900 kr".
- URL:en efter `replaceState` bär `a=200000` men aldrig inkomst, ränta eller fördjupning.
- Fler detaljer öppnas och innehåller ägare + redan använt; villkorsrad flyttar fokus till frågan; Kopiera länk ger
  status "Länk kopierad".
- GT batteri + nej solceller → "Troligen inte grön teknik utan egna solceller …", CTA "Räkna med ROT i stället" byter
  läge till ROT (rubriken börjar med Ja).
- GT sol + batteri 80 000 → två segment (0,45 / 0,55 av skalan) och svansen "ryms inte i år" på.
- Två ägare → tick 100 000 kr, villkorsraden "Ni båda har skatt att räkna av mot" som antagen.
- Pott slut (`u=50000`) → "Nej, inte i år …", använt-segmentet fyller hela skalan.
- Embed: rubriken är H2, fördjupningen bakom "Räcker skatten?", villkoren bakom "Visa villkoren", Skriv ut dold,
  sticky-remsan aldrig.
- `tools/shot.mjs`: `errors: []` och `overflowX: false` på båda viewports för rot, gt och embed. Horisontell scroll
  som etiketten orsakade på mobil i skattelägen är fixad (etikettraden klipper, etiketten bryts i två rader vid
  markören).

## 5. LOCAL_COPY (strängar som saknas i COPY, bara riktning C)

Verktyg: `c.title.rot` "Ryms ROT-avdraget i år, och räcker din skatt?", `c.title.gt` "Ryms grön teknik-avdraget i år,
och räcker din skatt?", `c.lead` "Beskedet uppdateras medan du svarar. Inget mejl, ingen inloggning." (05 §3.1).
Mätaren: `c.meter.eyebrow.rot` "ROT-potten 2026", `c.meter.eyebrow.gt` "Grön teknik-potten 2026", `c.meter.cap.1`
"{tak} per person och år", `c.meter.cap.2` "{tak} för två ägare", `c.meter.tax_hit` "Din skatt räcker hit (ca {kr})",
`c.meter.tax_hela` "Din skatt räcker till hela potten (ca {kr})", `c.meter.tax_ingen` "Din skatt räcker inte till
avdraget", `c.meter.galler_inte` "Gäller inte i det här läget" (UX §9), `c.meter.aria` "Avdragsmätare: {text}",
`c.legend.anvant` "Redan använt", `c.legend.jobb` "Det här jobbet", `c.legend.sol` "Solceller 15 %", `c.legend.batteri`
"Batteri 50 %", `c.legend.kvarskatt` "Kan bli kvarskatt", `c.legend.ryms_inte` "Ryms inte i år", `c.legend.upp_till`
"upp till {kr}", `c.legend.till` "{min} till {max}", `c.tick.noll` "0".
Fördjupningen: `c.djup.prompt` "Dra i reglaget så ritar vi in var din skatt räcker.", `c.djup.valuetext` "cirka {kr}
kronor i månaden" (aria-valuetext), `c.djup.fold` "Räcker skatten?" (embed), `c.djup.agare2` "Ägare 2".
UI: `c.fold.villkor` "Visa villkoren" (UX §6.2), `c.ui.lank_kopierad` "Länk kopierad", `c.ui.borja_om` "Börja om",
`c.ui.till_beskedet` "Till beskedet", `c.ui.nojs` "Slå på JavaScript för att räkna på ditt fall." (UX §6.4),
`c.ui.minska`/`c.ui.oka` "Minska med {steg}"/"Öka med {steg}" (aria-label), `c.ui.kr` "kr", `c.ui.procent` "%",
`c.print.rad` "Utskrivet {datum}. Länk till din uträkning: {url}".
Så har vi räknat: `c.tabell.rot` "Arbetskostnad och avdrag, 30 % upp till {tak} per person", `c.tabell.gt` "{vad} och
avdrag, {sats} % upp till {tak} per person", `c.tabell.kol1.rot` "Arbetskostnad", `c.tabell.kol1.gt` "Pris med
installation", `c.tabell.kol2` "Avdrag", `c.tabell.tak` "{kr} (taket)", `c.kalla` "Regler: Skatteverket, kontrollerade
2026-09-11. Gäller betalningar 2026." (05 §3.1), `c.skv.rot` "Räkna ut rot- och rutavdrag hos Skatteverket", `c.skv.gt`
"Mina skattereduktioner hos Skatteverket".
Utanför verktyget (demo-remsa, artikelattrapp): `c.demo.*`, `c.art.*` (platshållartext, inga fakta).

COPY-strängar som skaver i riktning C: `sk.ej_bedomd` och `sk.ej_bedomd.lag` säger "under Fler detaljer", men här står
fördjupningen framme. Wireframen visar `c.djup.prompt` + `q.skatt_djup.help` i stället tills fördjupningen är ifylld.
Copy-agenten kan ge en variant utan platsangivelse.

## 6. Öppna frågor för ägaren

1. Embed-budgeten (§3): acceptera ca 1 400 px, eller minska till två synliga frågor i embed (boende + belopp, skatten
   bakom "Räcker skatten?"), eller 44 px chips?
2. Ska mätaren rita skattetaket redan på load med förvalet 35 000 kr (mer "instrument" direkt) eller först när kunden
   rör reglaget (som nu, inget falskt personligt besked)? GRIND 6 (får inkomst frågas alls) ligger under.
3. Beloppet står vid mätaren, inte i beskedspanelen (UX §4.2 slot 3). Ok för den här riktningen?
4. Värdeår m.fl. under Fler detaljer i embed (antaget + klickbar rad) eller synligt trots höjden?
5. Svansen "ryms inte i år" är fast bredd (belopp i legenden), inte proportionell. Räcker det?
6. "Börja om" i dela-raden (nollställer inkomst enligt UX §2.6). Behålla?
7. Två ägare: bandet 29 till 35 % ritas från ägare 1. Räcker för wireframe, men produktionsversionen bör summera båda.

## 7. Det jag inte hann

- Ingen visuell diff mot riktning A och B (jag såg dem inte), så gemensamma detaljer (chip-form, radikoner) kan skilja.
- Ingen riktig tangentbordsgenomgång av slidern i Firefox (bara Chromium via Playwright); `::-moz-range-*` är skriven
  men inte sedd.
- Count-up tweenar bara belopp i avläsningen, inte legendens siffror (de byts direkt).
- Utskriften är kontrollerad med `emulateMedia('print')` (utan `beforeprint`), så "Så har vi räknat" öppen i utskrift
  är verifierad i kod, inte i bild.
