# 06 · Tre divergenta riktningar (beslutsunderlag före bygge)

Skrivet 2026-09-11 efter våg 1 (regelverk, marknad, UX) och innan en enda pixel byggts.
Provet på divergens (arbetsdirektivet §1): kan de tre beskrivas med samma mening? Nej. Riktning A är
ett besked, B är ett kvitto, C är ett instrument. De skiljer sig i idé, i vad besökaren minns, i vilken
fråga som är hero, i layoutfamilj och i yta. Alla tre delar samma motor, samma frågebank, samma copy
och samma CTA-regler (`logik/`), så valet handlar om **form och prioritering**, inte om fakta.

## Registret (bestämt före layout)

Ekonomi- och skattesida: allvarligt och noggrant, men varmt där sanningen är god. Inget mörkt
midnattskort med radial glow och centrerad vit rubrik som default (designsystemets förbjudna mall).
Ett nej säljer aldrig.

## Det som är gemensamt (ändras inte av riktningen)

| Delat | Var det bor |
|---|---|
| Frågebank per läge (ROT 4 synliga + "Fler detaljer"; GT laddbox / batteri / sol) | `logik/ui-model.js` |
| Antaget/bekräftat-modellen: "Ja, om det här stämmer:" på load, aldrig ett falskt ja | `logik/ui-model.js` |
| Fem beskedsklasser med prioritet, en CTA per klass, nej säljer inte | `research/04-ux-flode.md` §3, §5 |
| Skatteutrymmet: synlig chip (lön / pension / låg / vet inte) + frivillig fördjupning med validerad estimator | `logik/engine.js` |
| Copy i ampy-rost, "kan", "preliminärt", inga tankstreck | `logik/copy.sv.js` |
| Delbar länk utan inkomst, "Kopiera länk", utskrift | `logik/ui-model.js` |
| Tokens, Outfit self-hostad, 390×844 först, embed-budget ≤ 900 px | `wireframes/_shared/` |

## Riktning A · "Villkorstavlan" (beskedet är enheten)

- **Kärnidé:** frågan och villkoret är samma rad. Varje villkor är en rad på en tavla; du svarar i raden
  och raden tänds (bock), släcks (kryss) eller står kvar som hålring (antaget). Beskedet är summan av
  tavlan, läst uppifrån. Beloppet är en lugn rad under tavlan, inte en hero-siffra.
- **Det besökaren minns:** "sex rader, alla gröna, då gäller det." Hakjakten är gjord åt honom.
- **Hero-frågan:** *Gäller det mig?*
- **Signaturenhet:** villkorstavlan (b i UX §11). Inget annat.
- **Layoutfamilj:** diagnostik, men utan rail: en kolumn, tavlan i mitten, beskedsremsa i toppen som
  följer med (desktop: sticky topp; mobil: sticky remsa bara fristående). Ljus yta (vitt kort på
  off-white), teal bara på bockar och CTA.
- **Bevarar:** Elcentral-kollens verdict-grammatik och Behörighetskollens källrad under beskedet.
- **Styrka:** säljlänken. Kunden bekräftar tre saker på tio sekunder. Lägst risk för falskt ja.
- **Svaghet:** ingen siffra att "äga"; på stora jobb (batteri, sol) kan beloppet kännas undanstoppat.
- **Höjdrisk i embed:** låg (raderna är kompakta).

## Riktning B · "Kvittot" (offertens tvilling)

- **Kärnidé:** verktyget ser ut som det kunden får sen: en faktura. Vänster ställer du in jobbet, höger
  ligger kvittot: arbetskostnad 100 %, material 0 % (ROT) eller arbete + material (GT), avdrag, att
  betala. Villkoren är stämplar i kvittots marginal (ROT-berättigad, taket, skatten). Det oflatterande
  fulla priset står först, avdraget dras inför ögonen på kunden, summan sist.
- **Det besökaren minns:** "det här står på min faktura, och så här mycket dras av."
- **Hero-frågan:** *Vad betalar jag faktiskt?*
- **Signaturenhet:** kvittot (c i UX §11). Villkorsstämplarna är kvittots del, inte en andra enhet.
- **Layoutfamilj:** kalkylatorns tvåpanel (vit inputpanel / mörk resultatpanel). Detta är den enda av
  de tre som får använda det mörka midnattskortet, och då som ett kvitto: typografisk, rader, linjer,
  inte glow. Mobil: input → kvitto staplat.
- **Bevarar:** ROT/GT-familjeblockets "Så räknas ditt pris"-panel (rot-gt-cro D2) som kunden redan
  möter på tjänstesidorna, så artikel och tjänstesida talar samma bild.
- **Styrka:** fakturamodellen blir begriplig; materialhaken (ROT) och "arbete + material" (GT) syns
  utan förklarande text; siffran är kundens egen.
- **Svaghet:** riskerar att läsas som "en räknare till" om villkoren blir för små; svarar svagast på
  "är jag berättigad" i första ögonkastet. Fakturamodellen för ROT är fortfarande GAP 1.
- **Höjdrisk i embed:** medel (kvittot behöver ca 260 px på mobil).

## Riktning C · "Avdragsmätaren" (planera året, räcker skatten)

- **Kärnidé:** ett instrument som visar två tak samtidigt: potten (50 000 kr per person, 100 000 vid två
  ägare, redan använt ROT/RUT/GT som fylld del) och skatteutrymmet (estimatorn, som band). Jobbets
  avdrag fylls i mätaren; det som inte ryms i år ligger kvar i dämpad ton. Inkomstfrågan är synlig
  (band-slider + pensionär-toggle + ränteutgifter valfritt), eftersom det är riktningens poäng.
- **Det besökaren minns:** "jag har så här mycket kvar i år, och min skatt räcker till så här mycket."
- **Hero-frågan:** *Ryms det i år, och räcker min skatt?*
- **Signaturenhet:** avdragsmätaren med två tak (a + d i UX §11, vävda till en).
- **Layoutfamilj:** kalkylatorfamiljen, men horisontellt: mätaren i full bredd överst, reglagen i en
  rad under (desktop), besked + CTA till höger om mätaren. Ljus instrumentyta, teal fyllnad, midnight
  bara för text. Mobil: mätare → reglage → besked.
- **Bevarar:** LED-kalkylatorns "amber före break-even, teal efter"-logik i form av "ryms / ryms inte"-
  färgning inuti mätaren (scopad, aldrig global varningsfärg).
- **Styrka:** den enda riktningen som gör Julius önskan ("skriva in hur mycket skatt") till hero, och
  den enda i Sverige som visar ROT + RUT + GT + skatt i ett. Starkast för batteri/sol och för
  pensionärsfrågan (1 300 sök/mån).
- **Svaghet:** kräver att besökaren ger en inkomstuppgift för att bli personlig (GRIND 6); känsligast;
  mest komplex på 390 px; svagast på "är jag berättigad" om villkoren inte får plats bredvid mätaren.
- **Höjdrisk i embed:** hög. Kräver kompakt läge (mätaren + tre reglage) och att fördjupningen fälls.

## Vad Julius väljer mellan (i en mening)

**A** svarar först på *gäller det mig* (tavlan), **B** på *vad betalar jag* (kvittot), **C** på *ryms det
och räcker skatten* (mätaren). Alla tre svarar på alla tre frågorna, men ordningen och tyngden skiljer.

## Vad som händer efter valet

Vald riktning byggs som produktionsblock på den delade motorn; de två andra kapas (arbetsdirektivet §1).
Riktningens signaturenhet kan låna ett drag av en annan (t.ex. B:s kvittorad i A:s beloppsrad), men
aldrig två enheter i samma verktyg.
