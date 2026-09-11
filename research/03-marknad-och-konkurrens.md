# 03 · Marknad, konkurrens och bästa praxis (Research-agent, 2026-09-11)

Bygger på `00-grundning.md` (SERP:arna hämtades inte om, de grävdes djupare). Alla källor med hämtstatus och
ordagranna citat ligger i `underlag/konkurrens-kallor.md`. Taggar: **[FACT src: url]** = hämtat och läst,
**[BEDÖMNING]** = min slutsats, **[GAP]** = kunde inte verifieras.

## 0. Vad jag kunde och inte kunde se (läs detta först)

- **Skatteverkets båda e-tjänster är JS-only** (web components i shadow DOM). WebFetch gav bara "Start av
  e-tjänst". Jag öppnade dem i webbläsaren och läste hela DOM-texten (alla fält, hjälptexter, resultatmallen).
  Jag **fyllde inte i och skickade inte** formulären (policy: inga formulär skickas utan Julius ja), så
  resultatsidan beskrivs från mallens text, inte från en körning.
- **Webbläsarpanelen var dold** under hela körningen, så skärmdumpar blev tomma. Designbetygen i matrisen är
  därför **DOM-bedömda** (struktur, fältantal, copy), inte pixelbedömda. Det står "DOM" i kolumnen. Mobil
  kunde inte verifieras visuellt: "?" betyder just det.
- **Blockerat/nere:** rotavdragen.se (SERP #3) svarade **508 Resource Limit Is Reached** både via fetch och
  webbläsare, hemsol.se 403, energysavingtrust.org.uk 403, france-renov.gouv.fr (certfel, men den nya
  tjänsten mesaides.france-renov.gouv.fr gick), Skatteverkets Rättsliga vägledning (URL rejected),
  lagen.nu (för stor), Rewiring Americas resultatsida (kräver formulärskick).
- **Ägarkanon respekterad:** satserna (ROT 30 %, sol 15 %, batteri/laddbox 50 %, tak 50 000/75 000) är
  inte webbkollade (CLAUDE.md regel 5). Jag har bara noterat var **konkurrenter** avviker från kanon, och
  belagt **villkoren** (ålder, äga/bo, 5 år, F-skatt, e-betalning, skattekapacitet) mot Skatteverket.

---

## A. Den officiella baslinjen: vad Skatteverket själv gör

### A1. "Räkna ut rot- och rutavdrag" (www7.skatteverket.se/portal/rot-rut) [FACT, DOM läst i webbläsare]

**Vad tjänsten är:** en *skatteuträkning*, inte en avdragsräknare. Den frågar **inte** efter arbetskostnad.
Den räknar fram hur mycket skatt du kommer att betala 2026 och visar det som ditt **"Utrymme för rot- och
rutavdrag"**. Ingress: *"Här kan du räkna ut hur mycket rot- eller rutavdrag du kan få under 2026."*

**Flöde: tre numrerade steg på en och samma sida** (steg 2 och 3 fälls ut efter "Nästa"):

| Steg | Rubrik | Fält (ordagranna etiketter) |
|---|---|---|
| 1 | Fyll i grunduppgifter | "Vilket år är du född?" (ÅÅÅÅ, obligatoriskt) · "Kommun där du var folkbokförd den 1 november 2025" (select, 290 kommuner) · "Välj vilket avdrag du vill uppskatta": Rotavdrag / Rutavdrag / Rot- och rutavdrag |
| 2 | Fyll i ditt underlag | Tjänsteinkomster: "Lön, förmåner m.m." · "Sjukpenning, a-kassa m.m." · "Pensioner m.m." · Avdrag under tjänst: "Resor till och från arbetet" · "Tillfälligt arbete, dubbel bosättning och hemresor" · Kapital: "Ränteinkomster, utdelningar, schablonintäkter" · "Vinst vid försäljning av aktier och fonder" · "Vinst vid försäljning av privatbostad" · "Ränteutgifter m.m. och förlust på andelar i räntefond" · "Förlust vid försäljning av aktier och fonder" · "Förlust vid försäljning av privatbostad" · Fastighet: "Småhus och ägarlägenhet (0,75%)" · "Tomtmark eller byggnad under uppförande (1 %)" |
| 3 | Se beräkning | "Preliminär beräkning av din skatt" → "Utrymme för rot-och rutavdrag = X kronor" · "Så här har vi räknat" · "Rotavdraget får högst vara X kronor per person och år" · "Gör en ny beräkning" |

**Hur det är formulerat (mönster att låna):**
- Disclaimer i resultatet: *"Resultatet är beräknat utifrån de uppgifter du har fyllt i och är endast
  preliminärt. Glöm inte att räkna bort de rot- eller rutavdrag som du redan använt under året!"*
- Varje inkomstfält har en "I … ingår:"-lista (lön, förmåner, traktamente…). Ambitiöst men tungt.
- Kommun-fältet förklaras: *"Den kommun du var folkbokförd i den 1 november året före inkomståret avgör
  vilken kommun du betalar skatt till och vilken skattesats som gäller."*
- "Gör en ny beräkning" bekräftas med *"Inga uppgifter du har fyllt i kommer att sparas."*
- Ett hopfällt block **"Vem kan använda tjänsten?"** listar vem den *inte* passar: näringsidkare,
  sjuk-/aktivitetsersättning, deklarerar utomlands, avliden person, **"Du vill beräkna skattereduktion för
  installation av grön teknik"**, tjänsteresor/övriga utgifter/uthyrning → hänvisas till "Räkna ut din skatt".

**Vad den INTE svarar på:**
- Berättigad? Nej. Inget om äga/bo, 5-årsregeln, F-skatt, e-betalning.
- Belopp från arbetskostnad? Nej. Den ger taket för dig, inte avdraget för jobbet.
- Grön teknik? Nej, uttryckligen exkluderat.
- Två ägare? Nej, en person i taget.
- Det är en **12+ fält lång inkomstdeklaration i miniatyr**. [BEDÖMNING] Det är därför marknaden fylls av
  "arbetskostnad × 0,3"-räknare: Skatteverket svarar exakt men dyrt, resten svarar billigt men ofullständigt.

### A2. "Räkna ut din skatt" (www7.skatteverket.se/portal/rakna-ut-skatt) [FACT, DOM läst]

Samma treskegsmotor men bredare. Här finns fälten för rot, rut **och** grön teknik som redan dragits på
fakturan ("Rotarbete som dragits av på fakturan", "Kostnad för grön teknik som slutbetalats") och man kan
välja inkomstår 2026 och sju år bakåt. Tre formuleringar värda att stjäla rakt av:

- *"Denna tjänst kräver ingen inloggning och saknar uppgifter om dig. Inga uppgifter sparas."*
- *"Det är datumet du betalar fakturan som styr vilket år du får din skattereduktion. En slutlig beräkning
  görs först i samband med att du deklarerar."*
- *"På Mina sidor kan du se hur mycket av ditt rot- eller rutavdrag som du hittills har använt."*

### A3. Informationssidorna (villkoren Ampy måste följa) [FACT src: skatteverket.se, se källfil]

**ROT (Så fungerar rotavdraget):** *"Du ska ha fyllt 18 år senast vid årets slut"* · äga bostaden när arbetet
utförs · *"Du, eller dina föräldrar, måste även helt eller delvis bo i bostaden"* (permanent-, fritids- eller
liknande) · småhus, bostadsrätt, ägarlägenhet; **inte** hyresrätt · 5-årsregeln: *"Du kan inte få rotavdrag
för ombyggnad eller tillbyggnad de första fem åren efter det år huset byggdes färdigt"* · *"Du ska vara bosatt
i Sverige och betala skatt här (obegränsat skattskyldig)"* · *"Företaget måste vara godkänt för F-skatt"* ·
*"Från och med 1 januari 2020 är det krav på elektronisk betalning"* (kort, BankID, Swish, banköverföring;
inte kontant/check/presentkort) · *"Om ni är två eller flera ägare som nyttjar bostaden kan ni dela på
rotavdraget"* · preliminärt besked: *"Du får ett meddelande om preliminär skattereduktion för rotarbete när
Skatteverket har fattat beslut"*, slutligt i deklarationen.

**Grön teknik (Så fungerar skattereduktionen för grön teknik):** fyllt 18 · *"Du ska äga bostaden när
arbetet utförs"* · *"Du, eller din förälder, ska använda bostaden som permanentbostad, fritidsbostad eller
liknande"* · bostadsrätt kräver att *"nyttan av installationen ska enbart tillfalla bostadsrätten"* ·
**byggnad under uppförande är OK** (till skillnad från ROT:s 5-årsregel) · F-skatt · e-betalning · material
måste köpas av utföraren (*"Om du enbart köper material av ett företag kan du inte få någon
skattereduktion"*) · batteri: *"batterierna är kopplade till redan installerade solceller eller att båda
installationerna görs vid samma tidpunkt"* · ROT och GT dubblar inte: *"Du kan exempelvis inte få både
skattereduktion för grön teknik och rotavdrag för installationen"* men *takomläggning (ROT) + solceller (GT)*
går · **skattekapacitet:** *"Summan av skattereduktionerna får inte överstiga summan av kommunal
inkomstskatt, statlig inkomstskatt, fastighetsavgift och fastighetsskatt."* · rådet: *"Använd gärna
tjänsten Räkna ut din skatt … Det är särskilt viktigt om du använder både rot- och rutavdrag och
skattereduktion för grön teknik ett år."*

**Schablonen 97 % (företagssidan):** *"Vid installation av grön teknik till fast pris (totalentreprenad) kan
kostnaderna för arbete och material beräknas till 97 procent av totalpriset"* → i praktiken 48,5 % på
laddbox/batteri och 14,55 % på sol vid fast pris. Endast mowin bland konkurrenterna har ett
"Schablonberäkning / Totalentreprenad med fast pris"-läge. [FACT src: skatteverket företag + mowin]

**FAQ "Hur mycket måste jag tjäna…":** *"Exakt vilken inkomst du måste ha för att kunna utnyttja den maximala
skattereduktionen är omöjligt att säga."* Faktorerna: inkomsttyp, kommunal skattesats, kapitalunderskott.
Hänvisar till e-tjänsten. **Det är det officiella svaret på Julius kärnfråga: "det beror på, räkna".**

**Grön teknik-e-tjänsten för köparen:** det finns ingen separat "räkna ut grön teknik"-tjänst. Köparen ser
sitt utfall som ett *"meddelande om preliminär skattereduktion för grön teknik när Skatteverket har fattat
beslut"* (efter utförarens ansökan, senast 31 januari året efter) och på Mina sidor hur mycket rot/rut som
använts. [FACT src: skatteverket privat GT + räkna-ut-din-skatt]

### A4. Vad "officiellt" ser ut som och vad Ampy inte får motsäga [BEDÖMNING på A1–A3]

1. Skatteverket säger aldrig "du får X kr". Det säger "utrymme", "preliminärt", "slutlig beräkning i
   deklarationen". Ampys verktyg måste ha samma tre ord i resultatet.
2. Skatteverket räknar taket per **person**, aldrig per hushåll. Två ägare = två personer med var sitt utrymme.
3. Skatteverket separerar strikt rot/rut-tjänsten från grön teknik. Ampy får slå ihop dem i ett gränssnitt
   men aldrig i en beräkning.
4. "Redan använt under året" är en explicit påminnelse i det officiella resultatet. Saknas den i Ampys
   verktyg ger vi ett för högt tal till alla som redan städat/renoverat i år.
5. Skatteverkets 12-fältsformulär är facit, inte konkurrent. Ampys verktyg ska länka dit som "vill du ha
   exakt: Skatteverkets tjänst" i stället för att låtsas vara exakt.

---

## B. Svenska kalkylatorer: matris, felfakta och vitrummet

Kolumner: **Ber.** = kollar berättigande (branchar på villkor, inte bara nämner dem) · **Skatt** = uppskattar om
skatten räcker · **2 äg.** = två ägare · **75k** = ROT+RUT-taket · **GT** = grön teknik · **2026** = alla satser
korrekta för 2026 · **Design (DOM)** 1–5, hårt · **Mobil** · **För** = hantverkare (H) / privatperson (P) ·
**CTA** · **Trust** = källa / "uppdaterad" / disclaimer.

| # | Verktyg (URL i källfilen) | Inputs | Outputs | Ber. | Skatt | 2 äg. | 75k | GT | 2026 | Design (DOM) | Mobil | För | CTA / lead | Trust |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Skatteverket** Räkna ut rot- och rutavdrag | födelseår, kommun, rot/rut/båda, 12+ inkomst-/avdragsfält | "Utrymme för rot- och rutavdrag = X kr", "Så här har vi räknat" | N | **J (exakt)** | N | J | **N (exkl.)** | J | 3: korrekt DS, men 3 steg och 12+ fält | J (viewport, responsivt DS) | P | ingen | "endast preliminärt", "inga uppgifter sparas", "räkna bort redan använt" |
| 2 | **Skatteverket** Räkna ut din skatt | + fält för rot/rut/GT draget på faktura, inkomstår | preliminär skatt | N | J (exakt) | N | J | J (som inmatning) | J | 3 | J | P | ingen | "kräver ingen inloggning och saknar uppgifter om dig" |
| 3 | mowin.com/sv/kalkylatorer/rot | arbete, material, övrigt (SEK), Framåt/Bakåt, inkl/exkl moms | avdrag 30 %, max 50 000, slutpris | N | N | text (100 000) | flik Rut | flik GT | J (30 %) | 3: hantverkarverktyg, mycket text | ? | H | "Prova Mowin 30 dagar gratis", kontaktformulär | Skatteverket-länk, ingen uppdaterad-datum |
| 4 | mowin GT-kalkylator | Solcellssystem/Energilagring/Laddbox, Schablon vs fast pris, framåt/bakåt, moms | underlag, avdrag, slutpris | N | N | text | – | **J** | J (sol 15, laddbox 50; batteri-sats ej utskriven) | 3 | ? | H | samma | ingen källa, ingen disclaimer |
| 5 | rotavdragen.se/rakna-ut-rotavdraget | – | – | ? | ? | ? | ? | ? | ? | **sajten nere: 508** vid två försök | ? | ? | ? | ? |
| 6 | skattereduktion.se | ingen kalkylator (trots titeln) | exempel | N | N | N | text | N | **N: "multiplicerar … med 0,5"** samtidigt som tabell säger 30 % | 1: motsägelsefull, sidomeny-tung | ? | P | Servicefinder-widget, lagerannons | inget datum |
| 7 | ekonomifokus.se …/rut-och-rot-avdraget | material, arbete, "antal personer" | RUT+ROT delat på personer | N | N (nämns) | **J** | **J** | text | **N: "Grönt avdrag 20–50 %"** | 2: artikel + affiliate-widgets (Sambla-lån) | ? | P | Servicefinder, lånewidget | "Uppdaterad 2 januari 2026", 79 kommentarer |
| 8 | jamforbokforingsprogram.se/rot-rut-kalkylator | Välj avdrag ROT 30/RUT 50, arbete, material, "Årsgräns (schablon)", **"Redan utnyttjat (kr)"** | Avdrag, **"Kvar av taket"**, slutpris, **"Kopiera resultat"** | N | N | N | N (schablon-fält) | N | J | 3: rent, litet, kopieringsknapp | ? | H/enskild firma | affiliate "Prova gratis" ×3, popup-quiz | "Källa: Skatteverket", "Senast uppdaterad: januari 2026" |
| 9 | sv.fieldly.com …/rot-avdrag | arbete, övriga kostnader | total före, avdrag, total efter | N (FAQ nämner 18 år, äga/bo) | N | N | **N: "räknas ihop … max 50 000"** (fel, är 75 000) | N | delvis (30 % rätt, FAQ säger "2025") | 3: enkel trefältare | ? | H | "Boka demo" | Skatteverket/Lantmäteriet-länk, inget datum |
| 10 | dryft.se/rot-avdrag | ingen kalkylator | 4 räkneexempel | text (regler) | **text: "~400 000 kr/år", Sthlm ~34 000/mån** | text (100 000) | J | text **"20–50 %"** (stale) | ROT J | 3: lång guide, 15 FAQ | ? | P | "kostnadsfri rådgivning och offert", namngiven kontakt | Skatteverket-länkar, publ. 2026-01-02, uppdaterad tom |
| 11 | **ungdomskraft.com/guide/kalkyl-rut-rot** | **"Månadslön (brutto)", "Kommunalskatt", "Redan använt RUT i år", "Redan använt ROT i år"** | **"Uppskattad skatt/år", "Kombinerat max kvar", "Max RUT kvar", "Max ROT kvar"** + 3 lönetabeller (30 / 32,2 / 34,5 %) | N | **J (uppskattning)** | text | J | N | J | 2–3: rätt idé, tabelltung, fyra fält utan intervall | ? | P | "Boka en RUT-berättigad tjänst", telefon | "Siffrorna är uppskattningar", grundavdrag+jobbskatteavdrag angivet, inga källänkar |
| 12 | mrpotato.se/rot-rut-kalkylator | typ ROT/RUT, "Anpassat avdragsprocent", totalt inkl moms, arbetskostnad, moms, "Redan utnyttjat avdrag i år" | avdrag, kundens kostnad, **"Skatteverkets betalning"**, nettointäkt | N (lista) | text: "tillräckligt skatteutrymme", **"företaget betalningsansvarigt"** | N | N | N | J | 3: fakturaperspektiv | ? | **H** | "Skapa ROT-faktura gratis", 179 kr/mån | ingen länk, ingen datum |
| 13 | svartbackens.se/rakna-ut-rot-avdrag | 4 kalkylatorer (pris före/efter × material i % / kr) | material, arbete, avdrag, pris | N | text ("beskattningsbar inkomst") | J (avsnitt) | J | N | **N: 30 % = "de gamla reglerna", länkar 50 %-räknare "nya reglerna"** | 1: fyra räknare för en fråga, stale | ? | P | flyttfirmans tjänster | inget datum |
| 14 | svenskoffertpartner.se/rot-avdrag-kalkylator | "Arbetskostnad exkl. moms", **"Antal personer som delar avdraget"** | inkl moms, ROT 30 %, tak, avdrag, "Kunden betalar" | N | N | **J** | text | N | J | 3: kort svar → räknare → FAQ → **embed-kod** | ? | H/P | inget leadformulär, iframe-embed gratis | Skatteverket ×2, "senast granskad 2026-05-19" |
| 15 | byggexp.se/sv/verktyg/rot-avdrag-kalkylator | arbete inkl moms, material, **"Antal ägare som delar avdraget" (1 = 50 000 / 2 = 100 000)** | ROT-avdrag, arbete efter ROT, "Kunden betalar totalt" | N | N | **J** | J (text) | N | J | 3: räknare överst, exempel, FAQ, embed | ? | H | "Vill du ha hjälp vidare?"-formulär, "Boka demo" | **"Beräkningen är en uppskattning enligt reglerna 2026…"**, ingen källa |
| 16 | bliqat.com/rot-kalkylator | arbete inkl moms, material (valfritt), **"Antal ägare av bostaden med rätt till ROT"** | avdrag, "Kunden betalar" | text (5 år, F-skatt) | text ("betalat tillräckligt med skatt") | **J** | N | N | J | 3 | ? | H | "Prova Bliqat gratis i 14 dagar" | "Kalkylen är vägledande och förutsätter att kunden har rätt till ROT-avdrag och outnyttjat utrymme" |
| 17 | omvero.se/rot-kalkylator | arbete, material, övrigt, **avdragsprocent 30 % "Gäller idag" / 50 % "Alternativt"**, moms | total, avdrag, slutpris | N | text | N | N | N | J-ish (50 % kvar som val) | 3 | ? | H/P | ingen | "Beräkningen är förenklad … Kontrollera alltid … hos Skatteverket", inget datum |
| 18 | raknautrotavdrag.se | ingen egen räknare (länkar rotkalkylator.se) | 5 räkneexempel | text (5 krav) | text | J | J | **N: "max 30 000 kr"** (fel) | ROT J | 2: SEO-sida | ? | P | → rotkalkylator.se | "Vi är ingen myndighet…", "Uppdaterad april 2026" |
| 19 | **rotkalkylator.se** | "Vilken typ av jobb?", "Vad kostar arbetet?" **slider 10 000–500 000, default 120 000**, ägare | "Du sparar med ROT: X kr", tabell | text | text | J | J | N | J | 2: leadfabrik | ? | P | **e-postvägg → "3 företag inom 24 timmar", "2 847 har räknat ut sin besparing"** | "Senast uppdaterad: 28 april 2026" |
| 20 | **elkostnadskollen.se/gron-teknik-avdrag** | **"Typ av installation" (Solceller 15 % / Lagring 50 % / Laddningspunkt 50 %), "Total kostnad", "Personer som delar avdraget", "Redan utnyttjat grön teknik-avdrag i år"** | "Ditt beräknade avdrag", "Din nettokostnad" | N (nämner batteri-sol) | text | **J** | – | **J** | **J** | 3: rätt fält, generisk | ? | P | sponsrad "Begär offert" (Tjänstetorget) | **"Senast verifierad 23 augusti 2026"**, 3 källänkar, "ger inte juridisk rådgivning" |
| 21 | 1komma5.com/se/batteri/gront-avdrag-batteri | ingen räknare | exempel | text | text | text (100 000) | – | J | J | 3: säljartikel | ? | P | "Beräkna besparingar", nyhetsbrev, rådgivare | "Uppdaterad den 16 juli 2026" |
| 22 | brabyggare.se/info/rotavdrag-pensionar (SERP "rotavdrag pensionär") | ingen | – | text | text ("ekonomiskt utrymme") | N | **N: "totala taket … 50 000"** (fel) | N | ? | 2 | ? | P | "Få hjälp här" | "Uppdaterad 2025-06-19" |
| 23 | offerta.se …/rut-och-rotavdrag-pensionarer | ingen | – | text | text ("tillräcklig slutlig skatt"), inga siffror | N | J | N | J | 2 | ? | P | "Få offerter gratis", nyhetsbrev | Skatteverket ×2, "2025-12-22 (uppdaterat för 2026)" |

**Extra sökningar** ("grön teknik kalkylator", "räkna ut grön teknik avdrag", "laddbox avdrag kalkylator",
"solceller avdrag räkna ut", "rotavdrag kalkylator pensionär"): gav mowin GT, elkostnadskollen och en lång rad
artiklar (zaptec, laddboxbolaget, energify, stey, brabyggare, kopernicus, offerta). **Ingen
grön teknik-räknare kollar berättigande, ingen räknar skattekapacitet, ingen har pensionärsläge.** "Rotavdrag
pensionär" (1 300/mån) besvaras enbart av artiklar, varav den bäst rankade (BraByggare) anger fel tak.

### B2. Felfaktakartan (det konkurrenterna får fel, ordagrant) [FACT, se källfil]

| Fel | Var | Rätt enligt kanon/Skatteverket |
|---|---|---|
| ROT "multiplicerar man arbetskostnaden med 0,5" | skattereduktion.se (SERP #4) | 30 % 2026 |
| 30 % = "de gamla reglerna", 50 % = "de nya reglerna" | svartbackens.se (SERP #11) | tvärtom: 50 % upphörde 2025-12-31 |
| "ROT- och RUT-avdraget räknas ihop och är sammanlagt max 50 000 kronor" | fieldly (SERP #7) | 75 000 gemensamt, varav max 50 000 ROT |
| "Det totala taket för rot- och rutavdrag tillsammans på 50 000 kronor" | brabyggare (topp för "rotavdrag pensionär") | 75 000 |
| Grön teknik "20–50 %" | ekonomifokus, dryft | sol 15 %, batteri/laddbox 50 % |
| Grön teknik "max 30 000 kr" | raknautrotavdrag.se | 50 000 kr/person |
| "2025"-tak i FAQ på en 2026-sida | fieldly | 2026 |
| 50 % kvar som valbart "Alternativt avdrag" | omvero | 30 % är enda satsen 2026 |

[BEDÖMNING] Det är en **transient** fördel (marknadsanalys-skillen: rivalen fixar det på fem minuter), men just
nu är fyra av de tio bästa träffarna för "räkna ut rotavdrag" faktafel. Ampys verktyg ska visa datum + källa
per regel så att skillnaden syns utan att vi behöver peka på någon.

### B3. Vitrummet i ett stycke [BEDÖMNING på matrisen]

Inget svenskt verktyg besvarar de tre frågor kunden faktiskt ställer i ordning: *får jag avdraget* (branchande
villkor: äga/bo, hyresrätt, bostadsrätt, fritidshus, nybyggt < 5 år, 18 år, F-skatt, e-betalning), *hur mycket
blir det för det här jobbet* (arbetskostnad för ROT, arbete + material för GT, per läge sol/batteri/laddbox
med rätt sats och 97 %-schablonen) och *räcker min skatt* (två ägare, redan använt i år, ROT+RUT-taket 75 000,
pensionärens högre grundavdrag). Skatteverket gör fråga tre exakt men med 12+ fält och utan fråga ett och två;
ungdomskraft gör fråga tre grovt (lön + kommunalskatt) utan ett och två; byggexp/bliqat/svenskoffertpartner gör
fråga två med två ägare men riktar sig till hantverkaren; elkostnadskollen gör fråga två för grön teknik med
"redan utnyttjat" men utan berättigande. Ingen har ett pensionärsläge trots 1 300 sökningar/mån, ingen ger
ett ärligt "nej, och här är vad du gör i stället" (hyresrätt → hyresvärd, batteri utan sol → ROT på arbetet),
och ingen visar källa + verifieringsdatum per regel. Det tomrummet är exakt "berättigad → belopp → räcker
skatten" på en skärm, i candour-register, med Skatteverket som facit-länk.

---

## C. Internationella guldstandarder: vad som ska stjälas och inte

### C1. Rewiring America, "Your savings calculator" (homes.rewiringamerica.org/calculator) [FACT, DOM läst]
- **Flöde:** en skärm, hushållsnivå: "Rent or own" (Homeowner) · "ZIP" · "Electric utility" · "Household
  income" · "Tax filing status" (Single) · "Household size" (1 person) · **"Email address (optional)"** →
  "View results". Resultatet kunde jag inte se (formulärskick).
- **Osäkerhet:** ingress *"Enter your household info to see the programs you're eligible for"*; metodiksidan
  säger *"we estimate"* och bygger på HUD:s AMI-tabeller per hushållsstorlek.
- **Trust:** sidfot i själva widgeten: *"Calculator by Rewiring America · Privacy Policy · Terms · Powered by
  the Rewiring America API · Methodology · FAQ"*. Öppen embed med **förifyllnings-attribut** (`zip`,
  `household-income`, `tax-filing`, `household-size`, `owner-status`, `state`, `projects`, `lang`) [FACT src:
  github rewiringamerica/embed].
- **Stjäl:** inkomst frågas som en input bland hushållsfakta, inte som "din lön"; e-post frivillig och sist;
  metod/FAQ/API-länkar i widgetens fot; partner-förifyllning via attribut.
- **Stjäl inte:** exakt inkomstfält som obligatoriskt; ZIP+utility-beroende (Sverige: kommun räcker och kan
  vara valfri).

### C2. GOV.UK Design System "Question pages" + Service Manual "Structuring forms" [FACT]
- **Regeln:** *"Asking just one question per question page helps users understand what you're asking them to
  do, and focus on the specific question and its answer."* Skälen i Service Manual: förstå uppgiften, fokusera,
  hitta i en okänd process, **mobil**, återhämta sig från fel; för tjänsten: spara svar automatiskt, analys per
  fråga, **hantera förgreningar och loopar**.
- **När INTE:** *"User research will tell you when you can merge pages together. For example, if you're
  designing an internal service for government users who need to repeat and switch between tasks quickly."*
  Rubriken = frågan; hint text en mening; "Continue", inte "Next".
- **Läsning för Ampy [BEDÖMNING]:** GOV.UK-mönstret är byggt för *transaktioner* med okänd längd och förgrening.
  Ampys flöde är 4–6 tap-frågor som ska ge *instant value* och där kunden "stämmer gitarren" (NN/g, D nedan).
  Ta **strukturen** (en fråga = en rubrik, hint under, fel intill fältet, "Ändra" på svaren) men inte
  **sidbytet**. En skärm med numrerade frågeblock och alltid synligt resultat (wireframe-ux-doktrinen).

### C3. GOV.UK "Check if you need a UK visa" (smart answer) [FACT, DOM + meta läst]
- **Flöde:** en fråga per sida, svaren kodas i **URL-sökvägen** (`/check-uk-visa/y/australia/no/tourism`),
  varje sida visar **"Your answers"** med **"Change"** per svar och **"Start again"**.
- **Resultat:** verdict först som rubrik: *"You'll need an electronic travel authorisation (ETA) or a visa"*,
  sedan villkor ("You must apply for either…"), sedan "What you can and cannot do", sedan nästa steg.
- **Indexering:** utfallssidorna bär `<meta name="robots" content="noindex">` [FACT, läst i DOM]. Delbar
  länk, men inte indexerad. Det är svaret på grundningens öppna fråga 4.
- **Stjäl:** verdict-rubriken, "Dina svar"-panelen med ändra-länk, noindex på tillståndsbärande URL:er.
- **Stjäl inte:** en sida per fråga (se C2).

### C4. Vero (Finland), "Kotitalousvähennyslaskuri" [FACT src: vero.fi]
- Officiell räknare för hushållsavdraget (35 % av arbetet, max 1 600 €/person, självrisk 150 €). Ingress:
  *"Use this calculator to determine how much tax credit for household expenses you can claim for work paid
  for in 2025 or 2026."*
- **Candour-raden att kopiera i anda:** *"If the tax credit is greater than the amount of taxes you have to
  pay, the Tax Administration automatically deducts the tax credit from your spouse's taxes. If your spouse
  does not have enough tax to pay either, you are not eligible…"* Finland flyttar automatiskt till maken;
  **Sverige gör det inte** (utföraren måste fakturera rätt person). Det är en skillnad Ampys verktyg måste
  säga rakt ut för två ägare.
- "Page last updated 1/1/2026" på räknarsidan. Stjäl datumstämpeln, inte layouten (ren myndighetstext).

### C5. IRS Interactive Tax Assistant (irs.gov/help/ita) [FACT]
- Hubb: *"Your information is anonymous and only used to answer your question. We don't share, store or use
  it in any other way."* Ämnessidor: *"This interview will help you determine if…"*, **"Information you'll
  need"**-lista, tidsuppskattning (10 min), *"Conclusions are based on information provided by you in
  response to the questions you answered."* Sessionsvarning efter 30 min.
- **Stjäl:** "Det här behöver du ha framme" (fakturan/offerten, ungefärlig inkomst), anonymitetsraden,
  slutsatsformeln "baserat på dina svar".
- **Stjäl inte:** ja/nej-intervju på 10 minuter; sessionsutgång.

### C6. Tyskland: BEG/KfW/BAFA-Förderrechner (reduco.ai, bygger på Förderrichtlinie 17.07.2026) [FACT]
- **Flöde:** wizard: Eigentümer/Unternehmen → byggnad + PLZ (valfri) → åtgärder (kryss) → tre ja/nej-bonusar,
  varav **inkomsten frågas binärt: "Haushaltseinkommen unter 40.000 €"**.
- **Resultat:** "Zuschuss gesamt und Gesamtförderquote, dazu Betrag, Fördersatz und Programm je Maßnahme".
- **Trust:** *"kostenlos und ohne Anmeldung"*, *"zuletzt aktualisiert: September 2026"*, *"Datengrundlage &
  Quellen: KfW · BAFA · BMWE (Förderrichtlinie … vom 17.07.2026)"*, *"Ein Rechtsanspruch besteht nicht:
  verbindlich ist allein der Zuwendungsbescheid."*
- **Stjäl:** tröskelfrågan i stället för exakt inkomst; källa + regelversion + datum som en rad; "bindande
  är bara beslutet".
- **Stjäl inte:** wizard-formen; B2B-CTA.

### C7. Frankrike: Mes Aides Réno (mesaides.france-renov.gouv.fr) [FACT, DOM läst; svaren kunde inte klickas igenom]
- **Flöde:** "Étape 1 sur 3" (Ma situation → Mon projet → …), en fråga per vy med hjälpblock **"💡 Comment
  répondre ?"** som förklarar *varför* frågan ställs; "Précédent/Suivant"; **"Partager la page · Partager par
  email · Copier dans le presse-papier"** på varje vy; "J'ai besoin d'aide".
- **Trust:** "Service public de France Rénov'", MIT-licens, ADEME/beta.gouv, och en **ärlig varning överst**
  att CEE-delen är inaktuell och att man ska ringa rådgivare. Inkomst hanteras via ANAH:s fyra RFR-profiler
  (Bleu/Jaune/Violet/Rose), alltså **tranche, inte exakt** [FACT src: sökresultat, ej klickat].
- **Stjäl:** "Så här svarar du"-hjälpen per fråga; dela-knapp på plats; att skriva "den här delen är inte
  uppdaterad" i stället för att låtsas.
- **Stjäl inte:** tre etapper med sidbyte; URL-tillstånd kunde inte verifieras [GAP].

### C8. EcoWatch IRA-räknare (US) [FACT src: ecowatch]
- En skärm: kategori, "Filing status", inkomst som **"Estimate for this year"**, delstat → "Check
  Incentives". Tabell "Details · Incentive · Available · Your Value". Raden *"Don't worry – we don't track or
  store any data!"* och sidfotens *"not intended to provide accounting, legal or tax advice"*.
- **Stjäl:** ordet "uppskatta" i inkomstfältets etikett; tillgänglighetsfönster per stöd ("Now – 2035" →
  hos oss: "gäller t.o.m. 2026-12-31, betaldatum styr").

### C9. Ofgem Boiler Upgrade Scheme (UK) [FACT src: ofgem]
- Ingen räknare; men exakt samma **fakturamodell** som ROT/GT: *"The value of the grant … should be provided
  to you as an upfront discount on the quote provided to you by your installer"*, installatören *"make a BUS
  application on your behalf"*. Uteslutningar listas som "not new build / not social housing / not already
  funded".
- **Stjäl:** uteslutningslistan som tydliga "nej"-rader; att förklara att installatören söker.

### C10. Norge [FACT src: regjeringen ROT-rapport + E24]
- Norge har **inget** ROT-/håndverkerfradrag (utredning 2014 avrådde). Enova-stöd i stället. Ingen analog
  räknare att stjäla från. Skatteetaten hoppas därför över.

---

## D. Trust- och candour-mönster för pengaverktyg, med evidens

### D1. Hur de bästa visar källa och "senast uppdaterad" [FACT]
- **Per regel, med datum och regelversion:** reduco "Datengrundlage & Quellen … Förderrichtlinie vom
  17.07.2026 · zuletzt aktualisiert: September 2026". Elkostnadskollen "Senast verifierad 23 augusti 2026" +
  tre namngivna Skatteverket/Energimyndigheten-länkar. Svenskoffertpartner "senast granskad 2026-05-19".
  Vero "Page last updated 1/1/2026".
- **Vad som inte räcker:** ett årtal i titeln (jamforbokforingsprogram: "2026" i titel, "januari 2026" i
  fot) eller "© 2026" (mrpotato). Fieldly har 30 % i räknaren och "2025" i FAQ: odaterade sidor ruttnar.
- [BEDÖMNING] Ampy: en rad under resultatet: "Regler: Skatteverket, kontrollerade 2026-09-11. Satser gäller
  betalningar t.o.m. 2026-12-31." plus länk per villkor i "Så har vi räknat".

### D2. "Vi sparar inget" [FACT]
Skatteverket: *"Denna tjänst kräver ingen inloggning och saknar uppgifter om dig. Inga uppgifter sparas."* ·
IRS: *"Your information is anonymous and only used to answer your question. We don't share, store or use it
in any other way."* · EcoWatch: *"Don't worry – we don't track or store any data!"* · reduco: *"kostenlos und
ohne Anmeldung"*. [BEDÖMNING] Placera raden **intill inkomstfältet**, inte i sidfoten; det är där oron uppstår.
Och håll den sann: inkomst får då varken loggas i dataLayer (bucketa bara utfallet "räcker / räcker delvis /
räcker inte") eller läggas i delbar URL.

### D3. Preliminär siffra utan överlöfte [FACT]
Skatteverket: "endast preliminärt … Glöm inte att räkna bort de rot- eller rutavdrag som du redan använt";
"En slutlig beräkning görs först i samband med att du deklarerar". Vero: "not eligible" om skatten inte
räcker. reduco: "verbindlich ist allein der Zuwendungsbescheid". mrpotato (hantverkarsidan): *"Om kunden inte
har tillräcklig skatt … blir företaget betalningsansvarigt"*. Bliqat: *"förutsätter att kunden har rätt till
ROT-avdrag och outnyttjat utrymme"*. [BEDÖMNING] Ampys resultat ska bära tre ord: **utrymme, preliminärt,
deklarationen** och skriva vem som får räkningen om skatten inte räcker (hedging-direktivet: villkoret EN gång,
i finstilten, men detta villkor är inte 1/200-fallet utan pensionärens huvudfall).

### D4. "Vet inte"-svar [FACT NN/g 2024]
NN/g:s 12 rekommendationer (Kohler, 2024-04-19): *"Accommodate Variable Amounts of User Input"*, *"Offer to
Explain the Purpose of Inputs"*, *"Help Users Understand Inputs"*, *"Avoid Misleading Defaults"* (rotkalkylator.se
defaultar 120 000 kr arbetskostnad; ett ankare som skruvar upp förväntningen). Rewiring gör e-post valfri.
[BEDÖMNING] Varje icke-nödvändig fråga får ett "vet inte"-läge som ger ett intervall i stället för ett tal:
inkomst okänd → "räcker för de flesta med lön över X, kontrollera på Skatteverket" [X = logikagentens siffra].

### D5. Evidensen på interaktionsvalen [FACT, citerade]
| Fråga | Evidens | Vad den säger |
|---|---|---|
| En skärm eller steg? | GOV.UK Service Manual (C2); Baymard "One Page Checkouts" (Holst 2011): *"if a C version were introduced that took precisely the same form fields as the one page, but split test it across two pages… there wouldn't be much, if any, difference"*; NN/g 2024 #5 "Provide Immediate Results" | Antalet fält och vad användaren måste göra styr, inte antalet sidor. För 4–6 tap-frågor + instant value: **en skärm**. Steg motiveras av förgrening/spara-behov som Ampy inte har. |
| Live-uppdatering? | NN/g 2024 #6 *"Once users have seen outputs, they should be able to change individual inputs without having to reenter all the other inputs"*; NN/g expectations: *"users approach calculators as if they were tuning a guitar"* | **Ja**, live, och resultatet synligt medan man ändrar. |
| Slider för pengar? | NN/g Harley 2015: *"Sliders work best when the specific value does not matter… whenever the exact value matters, sliders are not okay"*; GOV.UK har ingen slider-komponent | **Nej** för arbetskostnad/inkomst. Skrivet fält med `inputmode="numeric"`. |
| `type=number`? | GOV.UK text input: *"risk of users accidentally incrementing a number when they're trying to do something else - for example, scroll up or down the page"* | Använd text + inputmode, prefix/suffix "kr". |
| Stepper? | NN/g föreslår "tap or even type" i stället för dra | Stepper bara för små heltal (antal ägare 1/2), inte kronor. |
| Radio/segment eller select för 2–4 val? | GOV.UK Select: *"should only be used as a last resort in public-facing services because research shows that some users find selects very difficult to use"* → "such as a Radios component" | Synliga knappar. **Segmented control** saknar egen evidens i källorna [GAP]; behandla som radioknappar med chip-utseende, kräv 44 px höjd och synlig vald-status (wireframe-ux). |
| Inkomst: exakt eller intervall? | reduco: binär tröskel; Frankrike: fyra tranches; Rewiring/EcoWatch: exakt men "estimate"; Skatteverket: exakt per inkomstslag | Se F. |

---

## E. SEO för verktyget och artiklarna

### E1. Vad Google faktiskt visar 2026 [FACT src: developers.google.com]
- **FAQPage:** rich result *"only shown for well-known, authoritative government and health websites"*
  (ändring 2023-09-14). Markupen får ligga kvar (andra motorer/LLM-svar), men förvänta inget SERP-utrymme.
- **HowTo:** *"no longer shown in search results, on both desktop and mobile"* (2023-09-14). Bygg inte HowTo.
- **SoftwareApplication/WebApplication:** ger rich result **bara** med `aggregateRating` eller `review`
  (obligatoriskt) + `offers.price: 0`. Ampy har inga verifierade betyg på verktyget → **använd inte**; ett
  påhittat betyg är candour-brott och Google-policybrott.
- [BEDÖMNING] Kör `WebPage` + `Article`/`author` (bylinerotationen) + `FAQPage` (för LLM-/AI-svar och andra
  motorer) + `BreadcrumbList`. Sluta där.

### E2. Egen URL och embed i artikeln: båda, så här [FACT + BEDÖMNING]
- NN/g 2024 #1 *"Optimize Calculator-Tool Pages for SEO"* och #2 *"Embed Calculators Directly in Webpages"*:
  användarna startar i sökmotorn **och** vill ha verktyget på den relevanta sidan, inte i popup.
- Kalkylatorintentet är eget ("räkna ut rotavdrag" 390, "rotavdrag kalkylator" 30–40) och artikelintentet är
  eget ("rotavdrag 2026" 14 800). Två sidor, två intents: **`/rot-kalkylator/`** och
  **`/gron-teknik-kalkylator/`** som egna, indexerade, server-renderade sidor med förklarande text, FAQ och
  "Så har vi räknat"; **samma widget embeddad överst i `/rot-avdrag-2026/` och `/gron-teknik-2026/`**.
- Duplicering: widgeten är en komponent, inte en sida. Google canonicaliserar *sidor* med "very similar
  pages"; en delad komponent på två sidor vars övriga innehåll skiljer sig är inte ett canonical-problem så
  länge verktygssidan har eget unikt textinnehåll (intro, metod, FAQ). Använd `rel=canonical` självpekande på
  båda. Använd **inte** iframe för embedden (iframe-innehåll indexeras på iframe-URL:en, inte artikeln; och
  svenskoffertpartner/byggexp bjuder just iframe-embed till partners, vilket ger dem länkar men inte artikeln
  innehåll) [BEDÖMNING på Google-doktrin].
- Konkurrenternas titelmönster som rankar: "ROT & RUT-kalkylator 2026 – Räkna ut rotavdrag och rutavdrag"
  (#6), "Rotavdrag 2026 | ROT-kalkylator — Räkna ut ditt avdrag på 30 sek" (rotkalkylator.se),
  "BÄSTA ROTRÄKNAREN (30%)" (#2 mowin). Mönstret: **[räkna ut] + [rotavdrag] + [2026] + [kalkylator]** i title,
  H1 med "räkna ut", widget **överst** (byggexp, mrpotato, svenskoffertpartner alla lägger räknaren först,
  sedan "Så fungerar beräkningen", exempel, FAQ), 6–15 FAQ-frågor, "senast uppdaterad".
- Svenskoffertpartners upplägg "Kort svar → räknare → Så fungerar beräkningen → FAQ → embed-kod" är den
  renaste strukturen i fältet. [BEDÖMNING] Ampys verktygssida: H1 "Räkna ut ditt rotavdrag 2026" → widget →
  "Så har vi räknat" (regel + källa + datum) → segment-FAQ (pensionär, bostadsrätt, fritidshus, hyresrätt,
  nybyggt: de fem segmentfrågorna ur grundningen) → byline.

### E3. Intern länkning [BEDÖMNING på artikelstrukturen i grundningen]
- Från `/rot-avdrag-2026/`: embed överst (under H1/ingress), och textlänkar till `/rot-kalkylator/` från
  "Vem kan få ROT 2026" (→ berättigad-läget), "Prisexempel" (→ belopp-läget), "Taket 75 000" (→
  två-ägare/RUT-läget) och FAQ "hur mycket" (→ förifylld länk). Motsvarande i `/gron-teknik-2026/` från
  "Skatteunderlaget: din personliga gräns" (→ räcker-skatten), "Materialfällan", "GT vs ROT".
- Ankartext med intentordet ("räkna ut ditt rotavdrag", "kolla om din skatt räcker"), inte "klicka här".
- Verktygssidorna länkar tillbaka till artiklarna som "läs reglerna i sin helhet" och till Skatteverkets
  tjänst som "exakt uträkning".

### E4. Delbar länk med förifyllt läge [FACT + BEDÖMNING]
- **Belagda mönster:** GOV.UK kodar svar i sökvägen och sätter **noindex** på de sidorna (C3). Rewiring
  förifyller via embed-attribut för partners (C1). Mes Aides Réno har "Partager la page / Copier dans le
  presse-papier" på varje vy (C7). jamforbokforingsprogram har "Kopiera resultat" (B #8).
- **Google-fallgropen:** *"Overly complex URLs, especially those containing multiple parameters, can cause
  problems for crawlers by creating unnecessarily high numbers of URLs that point to identical or similar
  content"* (URL structure). Och: *"Don't use the robots.txt file for canonicalization purposes."*
- **Rekommendation:** `?lage=rot&bostad=villa&kostnad=25000&agare=2` läses av widgeten på
  `/rot-kalkylator/`; sidan svarar med **självpekande canonical utan query** (`/rot-kalkylator/`) så alla
  varianter konsolideras; parametrar **bara i whitelistad form** (okända ignoreras); **aldrig inkomst, skatt
  eller kommun i URL:en** (D2); säljaren får en "Kopiera länk"-knapp som bygger URL:en ur nuvarande läge
  (utan inkomstfältet) plus en `?src=salj` som bucketas i dataLayer. Inga parametriserade URL:er i sitemap.

---

## F. Differentiatorn "räcker din skatt": vem gör det, hur, och hur Ampy bör fråga

### F1. Vem gör det i Sverige [FACT]
| Aktör | Hur inkomsten frågas | Vad som kommer ut | Svaghet |
|---|---|---|---|
| Skatteverket (A1/A2) | Exakt, per inkomstslag, plus kommun och födelseår, plus kapital och fastighet | Utrymme i kronor, "Så här har vi räknat" | 12+ fält; ingen koppling till jobbet; GT exkluderat i rot-rut-tjänsten |
| ungdomskraft.com | "Månadslön (brutto)" + "Kommunalskatt" (procent, skrivs in) + "Redan använt RUT/ROT i år" | "Uppskattad skatt/år", "Max ROT kvar", "Kombinerat max kvar", tre lönetabeller (30 / 32,2 / 34,5 %) med rader 10 000 / 30 000 / 40 000 kr/mån; regeln *"du [kan] aldrig få mer tillbaka än vad du betalat in i skatt under året"* | Kräver att kunden kan sin kommunalskatt; lön-only (pension saknas trots FAQ om pensionärer); "Siffrorna är uppskattningar" utan källa; antaganden (grundavdrag, jobbskatteavdrag) nämns men visas inte |
| dryft.se | Ingen input; text: "~400 000 kr/år", "Stockholm ~34 000 kr/mån, Göteborg ~32 000 kr/mån" för max | Tumregel | Ospecificerat om det avser 50 000 eller 75 000; ingen källa |
| brabyggare / offerta (pensionär) | Ingen | "ha ekonomiskt utrymme" | Fel tak (brabyggare) |
| Vero (FI) | Ingen input, regeltext | "not eligible" + makeöverföring | Annan lagstiftning |
| reduco (DE) | Binär tröskel "unter 40.000 €" | Bonus ja/nej | Bara en tröskel |
| Mes Aides Réno (FR) | RFR-tranche (fyra profiler) | Profil → satser | Ej klickat |

**Analys av ungdomskrafts modell [BEDÖMNING]:** rätt tanke (skatt ≈ f(lön, kommunalskatt) med grundavdrag och
jobbskatteavdrag), fel inputs för en privatperson. Ingen vet sin kommunalskatt i procent; alla vet ungefär
sin månadslön eller pension. Och tabellrad 10 000 kr/mån → "~12 500 kr skatt → max ROT 12 500" visar exakt det
verktyget ska säga: **"ditt tak är din skatt, inte 50 000"**.

### F2. Fakta logikagenten behöver för en förenklad skattemodell [FACT src: skatteverket FAQ statlig skatt]
- *"För inkomståret 2026 är skiktgränsen 643 000 kronor."* Statlig skatt 20 % över den.
- Brytpunkt (bruttoinkomst): *"inte har fyllt 66 år vid årets ingång … 660 400 kronor"*; *"fyllt 66 år …
  760 500 kronor"*. Skillnaden (17 400 vs 117 500) är grundavdraget vid den inkomstnivån; **förhöjt grundavdrag
  66+ är den enskilt största faktorn för pensionärsfallet.**
- Skattekapacitet = kommunal + statlig inkomstskatt + fastighetsavgift + fastighetsskatt (A3). Andra
  reduktioner (jobbskatteavdrag, allmän pensionsavgift, ränteavdrag/underskott av kapital) räknas av **före**
  rot/rut/GT; exakt lagstadgad ordning i 67 kap. 2 § IL kunde jag inte läsa (lagen.nu för stor, Rättslig
  vägledning blockerad) → **[GAP: avräkningsordningen verifieras av ROT-/GT-agenten mot lagtexten]**. Skatteverkets
  FAQ nämner uttryckligen "kapitalunderskott" som en faktor som äter utrymme.
- Genomsnittlig kommunalskatt 2026: **[GAP]** (SCB-siffran hittades inte i sökningen; ungdomskraft använder
  30 / 32,2 / 34,5 som spann).

### F3. Rekommendation: så bör Ampy fråga [BEDÖMNING, grundad i D2, D4, D5, C6, C8]
1. **Fråga inte "hur mycket tjänar du". Fråga "ungefär hur mycket får du in per månad före skatt?"** med
   **intervallknappar** (t.ex. under 15 000 / 15–25 000 / 25–35 000 / 35–50 000 / över 50 000 kr) och ett
   "vet inte"-läge. Intervall ger tillräcklig upplösning för ett räcker/räcker delvis/räcker inte-besked,
   sänker känsligheten (reduco/Frankrike-mönstret) och kräver ingen kommunalskatt-kunskap (ungdomskrafts miss).
   Exakt fält finns hos Skatteverket; länka dit som "exakt svar".
2. **En toggle "Jag är pensionär (66+)"** som byter grundavdrag och tar bort jobbskatteavdraget. Det är det
   branchande segment kvalitetsribban kräver (§11.1 p1) och den frågan 1 300 personer/mån googlar.
3. **"Har du redan använt rot- eller rutavdrag i år?"** (belopp, valfritt) exakt som Skatteverket och
   jamforbokforingsprogram ("Redan utnyttjat" → "Kvar av taket"). Utan den ljuger verktyget för alla som
   haft städhjälp.
4. **Två ägare = två inkomstintervall**, inte "×2". Vero-lärdomen omvänd: i Sverige flyttas inget
   automatiskt, så verktyget ska säga "då fakturerar utföraren er var för sig" (fakturamodellen är ägargrind,
   GAP 1 i grundningen).
5. **Kommun: valfri**, default = riksgenomsnitt med texten "skattesatsen skiljer några procent mellan
   kommuner; det ändrar sällan beskedet". Skatteverket kräver kommun; för ett intervallbesked är det
   överdrivet.
6. **Utdata som band, inte punkt:** "Din skatt räcker troligen till hela avdraget (ca X–Y kr utrymme)" /
   "räcker till en del" / "räcker troligen inte; det här händer då: …". Ordet **"troligen"** och intervallet
   är candour-registret; punktvärden är Skatteverkets jobb.
7. **Integritetsraden bredvid fältet:** "Vi sparar inte det du fyller i. Inget skickas någonstans." Sant bara
   om inkomst hålls utanför dataLayer och URL (D2, E4).
8. **Alltid Skatteverket som facit-länk** direkt under beskedet: "Vill du ha exakt: Skatteverkets Räkna ut
   rot- och rutavdrag (tar 5–10 min, kräver inkomstuppgifter)."

---

## 10 mönster att stjäla, 5 att undvika

### Stjäl
1. **Verdict först som rubrik, sedan villkor, sedan nästa steg** — GOV.UK check-uk-visa utfallssida
   (`gov.uk/check-uk-visa/y/australia/no/tourism`): "You'll need … " → "You must…" → "What you can and cannot do".
2. **"Dina svar" med Ändra-länk per svar + "Börja om"** — samma sida. Ger tillit och gör verktyget
   "stämbart" (NN/g #6).
3. **"Så här har vi räknat" + "endast preliminärt" + "räkna bort det du redan använt i år"** — Skatteverket
   rot-rut (`www7.skatteverket.se/portal/rot-rut`). Ta orden, inte formuläret.
4. **"Kräver ingen inloggning och saknar uppgifter om dig. Inga uppgifter sparas."** — Skatteverket Räkna
   ut din skatt (`www7.skatteverket.se/portal/rakna-ut-skatt`). Placeras vid inkomstfältet.
5. **"Vem passar tjänsten inte?"-listan** — Skatteverket rot-rut ("Vem kan använda tjänsten?"). Ampy:
   "Verktyget passar inte om du… (näringsidkare, avliden, bor utomlands)" i en hopfälld rad.
6. **Inkomst som tröskel/intervall, inte exakt** — reduco.ai (`reduco.ai/rechner/foerdermittel`,
   "Haushaltseinkommen unter 40.000 €") och ANAH:s RFR-tranches (Mes Aides Réno).
7. **Regelversion + källa + datum som en rad under resultatet** — reduco ("Datengrundlage & Quellen … vom
   17.07.2026 · zuletzt aktualisiert September 2026"), elkostnadskollen ("Senast verifierad 23 augusti 2026",
   `elkostnadskollen.se/gron-teknik-avdrag`).
8. **"Redan utnyttjat" → "Kvar av taket" + "Kopiera resultat"** — jamforbokforingsprogram
   (`jamforbokforingsprogram.se/rot-rut-kalkylator/`). Kopieringsknappen är säljarens delnings-mekanik.
9. **"Det här behöver du ha framme" + "Slutsatsen bygger på dina svar"** — IRS ITA
   (`irs.gov/help/ita/...`). Ampy: "Ha offerten framme: arbete och material på separata rader."
10. **Widgetfot "Metod · FAQ · Källor" + partner-förifyllning via attribut, e-post valfri och sist** —
    Rewiring America (`homes.rewiringamerica.org/calculator`, `github.com/rewiringamerica/embed…`).
11. (bonus) **Ärlig inaktualitetsvarning överst** — Mes Aides Réno ("les informations … ne sont plus à
    jour … contactez votre espace conseil"). Om en regel ändras mitt i året: skriv det, dölj inte.
12. (bonus) **Sats i etiketten**: "Solceller (15 %) / Lagring (50 %) / Laddningspunkt (50 %)" —
    elkostnadskollen. Kunden ser satsen innan han räknar.

### Undvik
1. **E-postvägg + fejkad social proof + "3 offerter inom 24 h"** — rotkalkylator.se ("2 847 har räknat ut
   sin besparing", "Du anger din e-post nedan"). Candour-grinden dödar alla tre; NN/g #4/#5 säger att
   kalkylatoranvändare "are just exploring, not committing".
2. **Slider för kronor med förvalt 120 000 kr** — rotkalkylator.se. NN/g 2015: exakt värde → ingen slider;
   NN/g 2024 #10: missvisande defaults ankrar förväntningen.
3. **Gammal sats kvar som val eller "gamla/nya regler"** — omvero ("50 % Alternativt avdrag"), svartbackens
   ("de nya reglerna" = 50 %), skattereduktion.se ("0,5"). Regeln: aldrig en gammal sats utan 2026-målet i
   samma andetag, och aldrig som klickbart läge.
4. **Skatteverkets 12-fältsformulär som huvudväg** — `www7.skatteverket.se/portal/rot-rut`. Det är facit,
   inte flödet. Ampy: intervall + länk till facit.
5. **Fyra räknare för en fråga, odaterade** — svartbackens (Priskalkylator 1–4), fieldly (30 % i räknaren,
   "2025" i FAQ, fel 50 000-tak). Ett läge, ett datum, en källa.
6. (bonus) **En fråga per sida för ett 5-frågors utforskande verktyg** — GOV.UK-mönstret är byggt för
   transaktioner med förgrening och sparbehov; Ampys doktrin är en skärm med instant value.
7. (bonus) **SoftwareApplication-schema med påhittat betyg** — Google kräver `aggregateRating`/`review`;
   Ampy har inga.

---

## Vad som gör Ampys verktyg till referensverktyget (rankat efter effekt)

1. **Tre svar i ett, i kundens ordning:** berättigad? → hur mycket för *det här* jobbet? → räcker min skatt?
   Ingen svensk aktör gör alla tre (B3). Det är hela vitrummet.
2. **Fyra lägen med korrekt logik, inte en gemensam frågebank:** `rot | gt_sol | gt_batteri | gt_laddbox`
   (granskning-C:s fynd: laddbox är inte solcellsgrindad), med 2026-satserna och 97 %-schablonen vid fast
   pris, och GT/ROT-växlingen ("batteri utan sol → ROT 30 % på arbetet").
3. **Räcker-skatten via intervall + pensionärsläge (66+) + "redan använt i år" + två ägare var för sig**,
   utan att lagra något, utan kommunalskatt-krav, med Skatteverket som facit-länk (F3).
4. **Ärliga nej som skyddar kunden:** hyresrätt → "prata med hyresvärden, inte med oss"; nybyggt < 5 år →
   "inte ROT, men grön teknik går i byggnad under uppförande"; kontantbetalning → "då försvinner avdraget".
   Det är det costly signal-mönstret ur §2.2/§7 som hantverkaren vågar vidarebefordra.
5. **"Så har vi räknat" med regel + Skatteverket-källa + verifieringsdatum per rad** (NN/g #11, reduco,
   elkostnadskollen). Det gör felfaktakartan (B2) synlig utan att vi nämner någon.
6. **ROT+RUT-taket 75 000 och två-ägare-logiken rätt** där fieldly, brabyggare och flera guider har fel.
7. **Delbar, förifylld länk för säljarna** (`?lage=&bostad=&kostnad=&agare=`) med canonical utan query och
   utan inkomst i URL:en, plus "Kopiera länk/resultat" (E4, GOV.UK-noindex-lärdomen).
8. **Egen indexerad verktygssida per läge + samma widget överst i båda artiklarna** (NN/g #1–#2, E2), med
   segment-FAQ på de fem googlade frågorna (pensionär, bostadsrätt, fritidshus, hyresrätt, nybyggt hus).
9. **Preliminär-språket från Skatteverket** ("utrymme", "preliminärt", "slutlig beräkning i deklarationen",
   "troligen") i stället för "Du sparar X kr".
10. **Ingen e-postvägg, inga sliders, ingen fejkad social proof, inget påhittat schema**: allt som gör
    rotkalkylator.se till en leadfabrik är precis det som gör att den analytiska villaägaren och elektrikern
    inte litar på den.

---

## Öppna frågor till GRINDLISTA.md (från denna research)

1. **Avräkningsordningen** i 67 kap. 2 § IL (vilka reduktioner räknas före rot/rut/GT och i vilken ordning
   rot/rut vs GT) — kunde inte läsas; ROT-/GT-agenten belägger mot lagtext. [GAP]
2. **Genomsnittlig kommunalskatt 2026** som default när kommun inte anges. [GAP]
3. **Ska inkomst frågas alls**, eller räcker "räcker/räcker inte"-intervall utan siffra? Min rekommendation:
   intervallknappar + vet inte (F3). Ägarbeslut (grundningens fråga 3).
4. **Fakturamodellen** vid två ägare och vid otillräcklig skatt: fakturerar Ampy var för sig, och vem bär
   återkravet? (GAP 1 sedan 2026-08-14.)
5. **Andel arbetskostnad per Ampy-jobbtyp** (ROT gäller bara arbete): Julius är datakällan.
6. **Bostadsrätt + laddbox**: när är det grön teknik (egen parkering, nyttan tillfaller bostadsrätten) och
   när är det föreningens sak (Ladda bilen-bidraget)? GT-agenten.
7. **rotavdragen.se** (SERP #3) var nere (508) vid båda försöken; om den kommer upp kan matrisraden fyllas.
8. **Mobil och visuell design** hos konkurrenterna är inte pixelgranskad (dold webbläsarpanel). Om
   designagenten vill ha skärmdumpar behövs en körning med synlig panel.
