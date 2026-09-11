# Riktning C, "Avdragsmätaren" (wireframe, 2026-09-11)

## 0. Fixrunda 2026-09-11 (efter granskningen, `PUNCHLISTA.md`)

Allt nedan är kört och mätt, inte berättat: `node wireframes/c-avdragsmataren/_probe.mjs` (91/91), reviewerns
`_review/isolate.mjs`, `truth.mjs desktop|mobile`, `contrast.mjs`, `a11y.mjs`, och `tools/shot.mjs` för rot/gt/embed
(`errors: []`, `overflowX: false` på båda viewports i alla tre). Skärmdumparna i `skarmdumpar/` är omgjorda.
Inget i `logik/` eller `_shared/` är rört. Avsnitt 2 till 6 nedan är den ursprungliga texten; där den motsägs står det
inom klammer.

### Punchlistan, post för post

| # | Post | Status | Vad som gjordes, och bevis |
|---|---|---|---|
| 1 | C-B1 count-up-racet | **Klart** | `paintMeter` avbryter tweenen överst, före alla returer; `tweenAmounts` sparar måltexten i `dataset.target` och avbryter tyst om målet bytts. `isolate.mjs`: `c_race_gap60.rubrik` = "ROT 30 % på arbetskostnaden kan gälla i stället" (var "Uppskattat avdrag: 35 000 kr"); `truth` scenario 5 = motorn på desktop och mobil. Probat: 60 ms, 1 000 ms och belopp→hyra inom 280 ms. |
| 2 | C-B2 bekräfta-trycket | **Klart** | `click`-lyssnare på vald radio (`onRadioClick`) + `keydown` Space/Enter (`onRadioKey` → `el.click()`), dubblett-skydd i `onChange` (samma svar redan bekräftat → inget andra anrop). `isolate.mjs`: `c_confirm.headline_after_three_taps` = "Ja, du kan använda ROT-avdraget", `c_confirm_keyboard_space` = `is-ok` på rad 1. `truth` scenario 2 = "Ja, om jobbet är en reparation". |
| 3 | C-B3 etikettens tal | **Klart** | `meterModel` tar talet ur motorn: `ryms_delvis` → `behov_kr − aterbetalningsrisk_kr` (= motorns `params.ryms`), `ryms` → `utrymme_kr`, aldrig en egen summa. Node-test (två ägare 15 000/60 000, 150 000 kr arbete): etikett "ca 22 100 kr" = villkorsradens "22 100 kr av 45 000 kr" (var ca 171 000). Samma fall i `_probe.mjs` genom UI:t. **Avvikelse från punchlistans formel:** för ROT är markörens x = talet (inte `used + talet`), för motorns `behov` innehåller redan använt ROT/RUT; `used + talet` gäller GT (vars utrymme är "efter ROT/RUT"). Det streckade kvarskatt-segmentet ritas `risk` kr från markören, aldrig förbi jobbets slut. |
| 4 | C-M1 beskedet på mobil | **Klart, siffran delvis** | Under 992 px öppnas `.tool__main` (`display: contents`) och ordningen sätts med `order`: läge, mätare, reglage, **besked**, fördjupning, Fler detaljer. Beskedet börjar vid **1 367 px** (exkl. demo-remsan; var ca 2 400). Målet "≤ ca 1 300" nås inte utan ägargrind: kvar är 48 px-chipsen (44 px = −40) och frågornas COPY-hjälptexter (−150). Dessutom gjort på mobil: reglagens gap 24→16, legendens släckta poster dolda, legenden dold när bara "Det här jobbet" är tänd. |
| 5 | C-M2 en inkomstfråga | **Klart** (alternativ 1) | `inkomsttyp`-chippen är borta ur bandet; typen härleds ur chippen "Betalar du inkomstskatt på lön eller pension?" (motorns `effInkomsttyp`). Kvar: en kryssruta "Både lön och pension" (COPY `q.inkomsttyp.bada`) som sätter `inkomsttyp = 'bada'` och visar lön/pension-fälten. Ägare 2 behåller sina chips (ingen skatt-chip finns för ägare 2). |
| 6 | C-M3 slidern på 35 000 | **Klart** | Orört reglage: output "Dra för att ange", `aria-valuetext="inte angivet"`, dämpad tumme, ingen fyllning; talet syns först när kunden rört det. Fördjupningen (`skatt_djup`) tänds bara när en inkomst är ANGIVEN (reglaget rört, eller lön/pension ifyllt vid "Både"); fyllt 66/ränta/kryssrutan ensamma tänder den inte (annars ritas ett skattetak på 35 000 kr kunden aldrig sett). En hjälprad: `q.skatt_djup.help` under rubriken; `c.djup.prompt` och `q.manadsinkomst.help` renderas inte. Ägare 2:s orörda reglage när fördjupningen redan är på visar talet med ordet "antaget" (motorn räknar då på förvalet; ett använt tal döljs aldrig). |
| 7 | C-M4 embed | **Klart, kräver ägarens ja** | `EMBED_VISIBLE = {boende, belopp, sol}`; skatt-chippen ligger inne i "Räcker skatten?" (villkorsraden "antaget" öppnar fällraden och fokuserar chippen, probat); linjal, legend och takrad dolda i embed. **ROT 1 157 px, laddbox 1 271, batteri 1 422** (var 1 398/1 538/1 689). Reviewerns ca 1 100 antog att lead och tel-länk stryks; tel-länken är kvar (05 §6: kompakt kort = besked, belopp, ram, CTA, tel), leaden är en rad ("Inget mejl, ingen inloggning."). Snabbfakta börjar vid 1 881 px (budget 1 540). |
| 8 | C-M5 kontrast | **Klart** | Vald chip = bläck med vit text (som A/B), `.villkor__tag` ink-muted/400, `.meter__key.is-dim` ink-muted (dämpningen på swatchen), `.preset.is-on` teal-kant + bläck, eyebrow ink-muted med teal-bar före. Därtill: alla textlänkar i bläck med teal-understrykning (teal som text är 2,96:1), "Länk kopierad" i bläck. `contrast.mjs`: 0 FAIL utom `.btn--primary` (S-1, delad token, orörd). Nya element mätta med samma metod: "kvar i år" 5,47:1, källrad/hjälprad/orört reglage 6,33:1. |
| 9 | C-M6 statiska tabellen | **Klart** | `<noscript>` runt tabellen (som B). Med JS finns ingen `.tabell` i DOM; utan JS syns den (5 rader) i "Så har vi räknat", verifierat med JS avstängt. |
| 10 | C-M7 källa + datum | **Klart** | `.meter__kalla` under "Att betala" i avläsningen, utanför details; Skatteverkslänken kvar i "Så har vi räknat". Följer med i utskrift. |
| 11 | C-M8 två hjältar + tom mätare | **Klart, med annat val än punchlistans** | Beskedet i `--fs-lead`/600 (mätarens avläsning är hjälten). Skalan: **inte** dynamisk. En halv skala måste hoppa tillbaka till full så fort skattemarkören (t.ex. 40 000 kr) ska ritas, dvs. instrumentet byter skala mitt i ett drag i reglaget. I stället punchlistans andra alternativ: potten ritad som "kvar" och jobbet framför: texten "{kvar} kvar i år" står i spårets tomma del, talet är motorns `pott_kvar_kr`/`tak_kvar_kr` (samma som villkorsraden `v.pott.kvar`), inget nytt tal. Den tänds bara när den tomma delen är ≥ 45 % av spåret och skattemarkören inte står där (annars kolliderar texten). Takraden är därmed alltid taket. Tomheten betyder nu något: "jag har så här mycket kvar i år" (06, det besökaren minns). |
| 12 | C-m1 rubrikordning | **Klart** | Fördjupningens rubrik H2 (H3 i embed). `a11y.mjs`: H1, H2, H2, H3. |
| 13 | C-m2 skärmläsartexten | **Klart** | Avslutande ":" / "." strippas: "Ja, om det här stämmer. Ungefär …". |
| 14 | C-m3 scroll → evaluate | **Klart** | `App.ctx` sätts i `paint`, `syncSticky()` läser den. |
| 15 | C-m4 legenden på mobil | **Klart** | `has-many` (> 2 tända) → en kolumn; probat med använt + jobb + kvarskatt. Släckta poster visas inte på mobil. |
| 16 | C-m5 fieldset utan legend | **Klart** | `<legend class="sr-only">` för kryssrutor. `a11y.mjs`: 0 fieldsets utan legend. |
| 17 | C-m6 lead | **Klart** | `c.lead.standalone` "Beskedet uppdateras medan du svarar." / `c.lead.embed` "Inget mejl, ingen inloggning." |

Motorändringarna sedan bygget: (a) "räcker delvis" → solid tel "Prata med oss innan du beställer" + textlänk "Få ett
pris efter avdrag" till `/kontakt/` (sekundär `kind: 'offert'` renderas som bläck-länk, probat); (b) läge sol → primär
`lage_byte` som textlänk (solid: false) "Räkna på batteri till solcellerna" som byter till batteri + tel (probat).
Sticky-remsan speglar bara solid offert, så vid tel-primär står "Till beskedet".

Hittat under rundan, utanför punchlistan: resultatraden i fördjupningen låg först ovanför reglaget och växte när ett
värde committades, så reglagen flyttade sig under tummen (Playwrights klick missade kryssrutan av exakt det skälet).
Rättat: hjälpraden statisk under rubriken, motorns skatterad + hedge SIST i bandet, dold tills inkomsten är angiven.
`role="status"` på den raden togs bort igen (dubbel uppläsning med `#live`).

### Höjder efter rundan (px, demo-remsan borträknad)

| Läge / yta | 390 × 844 | 1440 × 1000 | Före |
|---|---|---|---|
| embed, ROT | **1 157** (budget 900) | 1 111 | 1 398 |
| embed, GT laddbox | **1 271** | | 1 538 |
| embed, GT batteri | **1 422** | | 1 689 |
| fristående ROT, verktyget | 2 888 | 1 587 | 3 106 / 1 707 |
| fristående ROT, beskedet börjar | **1 367** (mål ≤ ca 1 300) | 203 | ca 2 400 |
| fristående GT batteri, beskedet börjar | 1 558 | | |

Ärligt: 900 px i embed nås inte med den här arketypen. 1 157 är golvet med 48 px-chips (boende = 5 chips = 3 rader),
ett kompakt kort med CTA + tel och två fällrader; reviewerns "ca 1 235 med en vikning" är slagen med 78 px, inte med
det 1 100 som antog att tel-länken stryks. Spakar kvar (ägarens): 44 px-chips (−40), "Räcker skatten?" och "Fler
detaljer" som EN fällrad (−45), tel-länken in i "Visa villkoren" (−44).

### Probresultat

- `_probe.mjs`: **91/91**. Nytt sedan rundan: race 60/1 000 ms + belopp→hyra, bekräfta-tryck (mus + Space + Enter),
  två ägare + fördjupning på båda (etikett = motorns tal), mobil ordning, reglagets orörda läge, "Både lön och
  pension", noscript-tabell, källrad, rubrikordning, aria-live-punkten, kontrastvärden, tel-primär + offert-sekundär,
  sol-textlänken, "kvar i år" på/av, has-many, embed-arketypen (två frågor, chippen i fällraden, villkorsrad → fällrad).
- `_review/isolate.mjs`: `c_race_gap60.rubrik` rätt, `c_confirm` rätt, `c_confirm_keyboard_space` rätt.
- `_review/truth.mjs desktop` och `mobile`: alla sex scenarier = motorn, 0 JS-fel (scenario 2 och 5 var fel).
- `_review/contrast.mjs`: 0 FAIL utom CTA-knappen (S-1). `_review/a11y.mjs`: struktur ren, tabbordning DOM, pilar,
  reduced motion utan count-up, remsan rätt, länken bär aldrig inkomst.

### Där jag inte följde punchlistan, och varför

1. C-B3:s "x = used + kr" för ROT dubbelräknar redan använt (motorns `behov` innehåller det). x = kr för ROT.
2. C-M8:s dynamiska skala: förkastad, skalan skulle hoppa när skattetaket ritas. "Kvar i år"-etiketten i stället.
3. C-M1:s ≤ 1 300 och C-M4:s ca 1 100: nås inte utan ägargrindade spakar (44 px-chips, hjälptexter, tel-länken).

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
- **Skattefördjupningen är synlig i fristående läge utan att `skatt_djup` är på.** [Fixrundan: reglaget visar inget
  tal alls förrän det rörts ("Dra för att ange"), och `skatt_djup` tänds bara när en inkomst är angiven; fyllt 66,
  ränta eller "Både" ensamma tänder den inte.] Annars skulle mätaren rita ett skattetak för en inkomst kunden aldrig
  angett, ett falskt "personligt" besked.
- **Embed visar bara boende och belopp** [Fixrundan: skatt-chippen flyttade in i "Räcker skatten?", C-M4] (+ `sol` för batteri, grinden som avgör läget). Värdeår, p-plats,
  ägare m.fl. ligger under Fler detaljer i embed men syns i fristående läge enligt bankens `visible`. Skälet är
  höjdbudgeten (§3). Beskedet ljuger inte om det: raderna står som antagna (hålring) i villkorslistan och klick på
  raden öppnar frågan.
- **Belopp och skatt gråas vid hårt nej** (UX §9 "Gäller inte i det här läget") i stället för att tas bort ur DOM som
  bankens `showWhen` säger. Övriga ej visade frågor ligger i DOM med `hidden`.
- **"Så har vi räknat" ligger inuti "Visa villkoren" i embed** (05 §6: kompakt kort = besked, belopp, ram, CTA, tel).
- **Mätarens avläsning bär beloppet**, inte beskedspanelen (UX §4.2 slot 3). Beskedspanelen har eyebrow, rubrik, ram,
  villkor, steg, CTA. Beloppet står en gång, vid instrumentet.
- **Hjälptexter, "Att betala"-raden och legenden döljs i embed** (höjd) [Fixrundan: även linjalen och takraden]. På
  mobil visas bara tända legend-poster, och legenden döljs när bara "Det här jobbet" är tänd (avläsningen bär siffran).
- Två ägare med fördjupning: spannlinjen (29 till 35 %) bygger på ägare 1:s band; markören och etiketten på motorns
  tal för ägare 1 (`ryms`/`utrymme`), aldrig en summa [Fixrundan C-B3].
- Läget byts (`?m=`/`?l=`/`surface`) och länk-förifyllning renderar verktyget om på klienten; bara förvalsläget
  (rot, fristående, inga svar) hydreras utan att strukturen byts. I produktion renderar servern rätt läge.
- Statiska `index.html` speglar COPY vid byggtillfället; copy-passet i `logik/` kräver `node wireframes/c-avdragsmataren/_build.mjs`
  för att den server-renderade texten ska följa med (hydreringen målar om mätare och besked ur aktuell COPY på load).

## 3. Uppmätta höjder (verktygets `#verktyg`, px, 2026-09-11) [ERSATT av tabellen i avsnitt 0]

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
och räcker din skatt?", `c.lead.standalone` "Beskedet uppdateras medan du svarar.", `c.lead.embed` "Inget mejl, ingen
inloggning." (05 §6, bara embed).
Mätaren (nytt i fixrundan): `c.meter.kvar` "{kr} kvar i år" (talet = motorns pott_kvar_kr).
Mätaren: `c.meter.eyebrow.rot` "ROT-potten 2026", `c.meter.eyebrow.gt` "Grön teknik-potten 2026", `c.meter.cap.1`
"{tak} per person och år", `c.meter.cap.2` "{tak} för två ägare", `c.meter.tax_hit` "Din skatt räcker hit (ca {kr})",
`c.meter.tax_hela` "Din skatt räcker till hela potten (ca {kr})", `c.meter.tax_ingen` "Din skatt räcker inte till
avdraget", `c.meter.galler_inte` "Gäller inte i det här läget" (UX §9), `c.meter.aria` "Avdragsmätare: {text}",
`c.legend.anvant` "Redan använt", `c.legend.jobb` "Det här jobbet", `c.legend.sol` "Solceller 15 %", `c.legend.batteri`
"Batteri 50 %", `c.legend.kvarskatt` "Kan bli kvarskatt", `c.legend.ryms_inte` "Ryms inte i år", `c.legend.upp_till`
"upp till {kr}", `c.legend.till` "{min} till {max}", `c.tick.noll` "0".
Fördjupningen: `c.djup.dra` "Dra för att ange" (reglagets output orört), `c.djup.ej_angiven` "inte angivet"
(aria-valuetext orört), `c.djup.valuetext` "cirka {kr} kronor i månaden" (aria-valuetext), `c.djup.fold` "Räcker
skatten?" (embed), `c.djup.agare2` "Ägare 2". (`c.djup.prompt` är struken.) Kryssrutan "Både lön och pension"
använder COPY `q.inkomsttyp.bada`.
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
fördjupningen framme. Wireframen visar `q.skatt_djup.help` i stället tills inkomsten är angiven. Copy-agenten kan ge
en variant utan platsangivelse (S-6). `q.manadsinkomst.help` ("Ungefär räcker. Beskedet blir ett spann.") renderas
inte i C (en hjälprad i bandet, C-M3).

## 6. Öppna frågor för ägaren

1. Embed-budgeten: nu två synliga frågor (boende + belopp, skatten bakom "Räcker skatten?") = 1 157 px (ROT). Ja till
   den arketypen? Och 44 px-chips (−40), en fällrad i stället för två (−45), tel in i "Visa villkoren" (−44)?
2. Reglaget visar inget tal förrän det rörts (fixrundan, C-M3). Alternativet (räkna på förvalet 35 000 kr och märka
   "antaget") är kvar som ägarfråga; GRIND 6 (får inkomst frågas alls) ligger under.
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
