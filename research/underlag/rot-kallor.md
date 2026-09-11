# ROT-källor (hämtade 2026-09-11 av ROT-agenten)

Varje rad: URL, hur den hämtades, status, och de ordagranna citat (max 25 ord) som regelmodellen i
`01-rot-regelverk.md` vilar på. Citaten är kopierade ur sidtexten, inte omskrivna.

Hämtsätt: `curl` = textextrakt via curl i scratchpad · `WebFetch` = Claude-verktyget · `browser` = webbläsarrutan
(enda vägen in på www4.skatteverket.se, vars WAF svarar "Request Rejected" på curl och WebFetch).

---

## 1. Lagtext (primär rättskälla)

### K1 · Inkomstskattelag (1999:1229), konsoliderad lydelse
- URL: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/
- Hämtad: curl, HTTP 200, hela författningen (1,06 M tecken). Lydelser märkta Lag (2025:322), (2025:1370), (2025:1376) med ikraftträdande 2026-01-01 enligt övergångsbestämmelserna.
- Citat:
  - 67 kap. 2 § 1 st: "underskott av kapital, hushållsarbete, installation av grön teknik, gåva och avgift till arbetslöshetskassa i nu nämnd ordning." (Lag 2025:1370)
  - 67 kap. 2 § 2 st: "Skattereduktion ska räknas av mot kommunal och statlig inkomstskatt ... statlig fastighetsskatt ... samt mot kommunal fastighetsavgift"
  - 67 kap. 2 § 2 st: "Skattereduktion enligt 5-9 d, 34, 35 och 46-48 §§ ska dock räknas av endast mot kommunal inkomstskatt."
  - 67 kap. 11 §: "1. vid beskattningsårets utgång har fyllt 18 år, 2. är obegränsat skattskyldiga under någon del av beskattningsåret"
  - 67 kap. 11 § 3 st: "Även dödsbon har efter begäran rätt till skattereduktion för hushållsarbete som har utförts före dödsfallet."
  - 67 kap. 13 a §: "reparation, underhåll samt om- och tillbyggnad av ett småhus eller en ägarlägenhet som ägs av den som begär skattereduktion."
  - 67 kap. 13 b §: "Arbetet utförs i lägenheten och det avser sådana åtgärder som bostadsrättshavaren svarar för."
  - 67 kap. 13 c § 1: "arbete som enbart avser installationer eller service på maskiner och andra inventarier"
  - 67 kap. 13 c § 5: "om- eller tillbyggnad av ett småhus för vilket fastighetsavgift inte har tagits ut för de fem första kalenderåren efter beräknat värdeår"
  - 67 kap. 14 §: "Till bostad räknas även biutrymmen som garage, förråd och tvättstuga."
  - 67 kap. 15 §: "hänförligt till den som begär skattereduktion eller dennes förälders hushåll. Föräldern ska dock vara bosatt i Sverige."
  - 67 kap. 15 a §: "krävs att det utförda hushållsarbetet har betalats elektroniskt."
  - 67 kap. 16 § 1: "Utföraren ska vara godkänd för F-skatt när avtalet om arbetet träffas eller när ersättningen betalas ut."
  - 67 kap. 18 § 2 st: "I underlaget räknas inte utgifter för material, utrustning och resor in."
  - 67 kap. 19 § 2 st: "högst 75 000 kronor för ett beskattningsår. Skattereduktionen för sådant hushållsarbete som anges i 13 a och 13 b §§ får dock uppgå till högst 50 000 kronor" (Lag 2025:322)
  - 67 kap. 40 § 1 (grön teknik): "åtgärder för vilka skattereduktion för hushållsarbete beviljats" räknas inte som grön teknik.
  - 67 kap. 45 § 2 st: "Den sammanlagda skattereduktionen får uppgå till högst 50 000 kronor för ett beskattningsår."
  - 67 kap. 7 § (jobbskatteavdrag under 66, Lag 2025:1376), 8 § (66+), 10 § (underskott av kapital), 46-47 §§ (förvärvsinkomst 1 500 kr): formler återgivna i `logik/skatteutrymme_2026.py`.
  - 63 kap. 3 § (grundavdrag) och 3 a § (förhöjt grundavdrag, "fyllt 66 år", Lag 2025:1376; 67-årsversionen "Träder i kraft I:2027-01-01").

### K2 · Lag (2009:194) om förfarandet vid skattereduktion för hushållsarbete (HUSFL)
- URL: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2009194-om-forfarandet-vid-skattereduktion_sfs-2009-194/
- Hämtad: curl, HTTP 200.
- Citat:
  - 6 §: "Om ... köparen inte har betalat hela utgiften för hushållsarbetet, får en sådan utförare ... begära utbetalning från Skatteverket"
  - 7 § 2 st 2: "tre sjundedelar av det belopp som köparen har betalat om den avser annat hushållsarbete." (= 30 % av arbetskostnaden; Lag 2025:324, i kraft 2026-01-01)
  - 7 § 3 st: "Utbetalning får inte ske till den del ... skulle uppgå till ett belopp som överstiger 75 000 kronor ... 13 a och 13 b §§ ... 50 000 kronor"
  - 8 §: "Begäran ska lämnas elektroniskt och ska ha kommit in till Skatteverket senast den 31 januari året efter det beskattningsår då arbetet betalades."
  - 9 a §: "uppgifter om småhusets eller ägarlägenhetens beteckning" resp. "lägenhetens beteckning samt föreningens eller bolagets organisationsnummer"
  - 17 §: "Köparen ska tillgodoräknas preliminär skattereduktion med 1. ett belopp motsvarande den utbetalning som Skatteverket ... beslutat om till utföraren"

---

## 2. Skatteverket (myndighetens egna sidor, privat)

### K3 · "Så fungerar rotavdraget" (villkorssidan)
- URL: https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete/villkorforattfarotavdrag.4.5947400c11f47f7f9dd80004014.html
- Hämtad: WebFetch + curl, HTTP 200 (den URL uppdraget angav, `...db8b080001680.html`, ger 404).
- Citat:
  - "Du måste äga bostaden under den period som arbetet utförs. Du, eller dina föräldrar, måste även helt eller delvis bo i bostaden"
  - "Komplementhus som garage och förråd räknas som en del av bostaden i ett småhus."
  - "Om någon annan bor i din bostad, till exempel om du hyr ut hela eller delar av den, kan du inte få rotavdrag"
  - Bostäder utan rätt: "nyproducerad bostad som inte är färdigbyggd · hyrd bostad · uthyrd bostad · arrenderad bostad · ditt barns bostad · din särbos bostad"
  - "Du kan inte få rotavdrag för ombyggnad eller tillbyggnad de första fem åren efter det år huset byggdes färdigt."
  - "Det år huset byggdes färdigt kallas för värdeår. Detta gäller även för bostadsrätter som är taxerade som småhus."
  - "Husets värdeår framgår av ditt senaste fastighetstaxeringsbeslut."
  - "Reparation och underhållsarbeten ger rätt till rotavdrag oavsett hur gammalt huset är."
  - "I en bostadsrätt kan du bara få rotavdrag för arbeten som utförs inne i din bostad."
  - "Om du är dold ägare ... får du inte rotavdrag"
  - "Du ska ha fyllt 18 år senast vid årets slut."
  - "Du ska vara bosatt i Sverige och betala skatt här (obegränsat skattskyldig) eller ... minst 90 procent av förvärvsinkomsterna"
  - "Om ni är två eller flera ägare som nyttjar bostaden kan ni dela på rotavdraget. Sammanlagt kan dock rotavdraget aldrig bli högre än 30 procent"
  - "Du kan få högst 75 000 kronor per år i rotavdrag och rutavdrag. Av den summan får högst 50 000 kronor vara rotavdrag."
  - "Om du kan ta del av rotavdraget eller inte beror på hur mycket skatt du har betalat in under året"
  - "Företaget måste vara godkänt för F-skatt för att kunna få utbetalning för rotavdrag innan det ingår avtal med dig eller när du betalar fakturan."
  - Uppgifter till företaget: "Personnummer. Fastighetsbeteckningen ... Bostadsrättsföreningens organisationsnummer och lägenhetsnummer (vanligen fyra siffror)"
  - "Det är bara arbetad tid på plats hos dig som ger rätt till rotavdrag."
  - Övriga kostnader utan avdrag: "restid ... kostnad per mil ... logi och traktamente ... maskiner, utrustning och avfallshantering ... administration."
  - "Företaget får inte bjuda dig på exempelvis reskostnaden."
  - "Från och med 1 januari 2020 är det krav på elektronisk betalning för rätt till rotavdrag."
  - Elektronisk betalning: "kontokort · stöd av Bank-id · Swish · inbetalningskort på bank · via e-tjänst" ... "inte ... kontanter, check eller presentkort"
  - "På fakturan ska företaget dra av rotavdraget med högst 30 procent från arbetskostnaden, inklusive moms."
  - "Det är datumet som du betalar för arbetet som styr vilket beskattningsår rotavdraget hamnar på, inte fakturadatumet."
  - "Om du gör en förskottsbetalning före ett årsskifte måste företaget ha utfört arbetet senast den 31 januari året efter"
  - "Du kan inte få rotavdrag för arbete om du får bidrag eller annat ekonomiskt stöd för arbetet från stat, kommun eller region."
  - "Om du har fått både rotavdrag och skattereduktion för installation av grön teknik måste ett av avdragen betalas tillbaka"
  - "Du kan inte få rotavdrag om du får försäkringsersättning för arbetet."
  - "Företagets ansökan om utbetalning ska ha kommit in till Skatteverket senast den 31 januari året efter att du betalade"
  - "Du kan omfördela rotavdraget till en person som du delar hushåll med ... förutsatt att den personen också äger fastigheten"
  - Dödsbo: "En ensam dödsbodelägare kan få rotavdrag för arbeten som utförs och betalas efter att bouppteckningen har registrerats"
  - E-tjänsten saknar stöd om du "har sjuk- eller aktivitetsersättning" eller "är näringsidkare med enskild verksamhet".

### K4 · "Ger arbetet rätt till rotavdrag?" (företag, listan per bostadstyp)
- URL: https://www.skatteverket.se/foretag/skatterochavdrag/rotochrut/gerarbetetratttillrotavdrag.4.5c1163881590be297b5173bf.html
- Hämtad: curl, HTTP 200.
- Citat, Småhus » El:
  - Krav: "Om bostaden är yngre än fem år får arbetet endast syfta till att återställa befintlig el till det skick den var i från början."
  - Ges för: "dra in el · modernisera el samt byta och montera vägguttag · installera och komplettera elcentraler (proppskåp) · installera inbyggda spotlights"
  - Ges för: "installera laddningspunkter för elfordon, till exempel på fasad eller i garage (men rotavdrag och skattereduktion för grön teknik kan inte ges för samma arbete)"
  - Ges för: "installera, reparera och byta ut solceller" och "dra el i samband med installation av system för lagring av egenproducerad elenergi"
  - Inget avdrag: "dra el i trädgården · installera en fristående laddstolpe · installera och reparera larm eller övervakningskameror · enbart felsöka · göra energideklarationer"
  - Inget avdrag: "reparera system för lagring av egenproducerad elenergi · reparera laddningspunkt för elfordon."
- Citat, Bostadsrätt » El:
  - Krav: "innanför bostadens tak, väggar och golv, och gälla åtgärder som bostadsrättshavaren ansvarar för enligt föreningens stadgar."
  - Ges för: "installera och komplettera elcentraler (proppskåp) · dra elledningar från proppskåpet vidare ut i bostaden, oavsett om ledningarna går i eller utanpå väggen"
  - Inget avdrag: "dra el utomhus eller till en elcentral (proppskåp) utanför bostaden · installera, reparera och byta ut solceller eller laddningspunkter för elfordon"
- Citat, Ägarlägenhet » El: "Arbeten på de gemensamma delarna av byggnaden och på samfälligheten ger inte rätt till rotavdrag."
- Citat, Småhus » VVS: "felsöka maskiner och inventarier där vi godkänner rotavdrag för reparation, till exempel värmepump" ges avdrag; "göra servicearbeten eller kontroll och översyn" ges inte.
- Citat, Småhus » VVS, schablon: "Installation av luftvärmepump ... 30 procent av den totala kostnaden."
- Citat, Småhus » Bygga om: "Bostaden ska vara äldre än fem år." och "göra tillbyggnad av bostadshus, förråd, garage, carport" ges avdrag (när huset är äldre än fem år).

### K5 · FAQ "Hur mycket måste jag tjäna för att kunna utnyttja maximal skattereduktion för rot- och rutarbete?"
- URL: https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/rotochrutarbete/privatrotochrutarbetefaq/hurmycketmastejagtjanaforattkunnautnyttjamaximalskattereduktionforrotochrutarbete.5.5fc8c94513259a4ba1d800034104.html
- Hämtad: curl, HTTP 200.
- Citat:
  - "Exakt vilken inkomst du måste ha för att kunna utnyttja den maximala skattereduktionen är omöjligt att säga."
  - "Rot- eller rutavdraget räknas av mot kommunal och statlig inkomstskatt, statlig fastighetsskatt och kommunal fastighetsavgift."
  - "aldrig ... större belopp än vad du ska betala i slutlig skatt efter det att den slutliga skatten minskats med skattereduktionerna för allmän pensionsavgift, arbetsinkomst (jobbskatteavdrag) och underskott av kapital."
  - "medges inte för den del av den slutliga skatten som rör allmän pensionsavgift, begravningsavgift och eventuell påförd kyrkoavgift."
  - "blir du återbetalningsskyldig för den del av den preliminära skattereduktionen som du inte har fått slutlig skattereduktion för."

### K6 · FAQ-index "Svar på vanliga frågor om rot- och rutarbete (privatpersoner)"
- URL: https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/rotochrutarbete.4.383cc9f31134f01c98a80003923.html
- Hämtad: curl, HTTP 200.
- Citat:
  - Bostadsrättsvilla: "det är ägandeformen som avgör rätten till skattereduktion."
  - Dotterns lägenhet: "Nej, för att få skattereduktion för rotarbeten ska bostaden användas av dig som permanent - eller fritidsbostad."
  - Dödsbo: "Dödsboet kan bara få skattereduktion för rot- eller rutarbete som har utförts före dödsfallet."
  - Betalning år 2: "Du kan inte dela upp skattereduktionen på två år eftersom du betalar hela arbetet först år 2."
  - Restid: "Nej, det är endast arbetskostnad som ger rätt till skattereduktion."

### K7 · "Rot- och rutavdrag i deklarationen"
- URL: https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/rotochrutavdragideklarationen.4.15532c7b1442f256baeae3e.html
- Hämtad: curl, HTTP 200.
- Citat:
  - "En del skatt kan du inte kvitta skattereduktionen mot, som exempelvis begravningsavgiften och allmänna pensionsavgiften."
  - Exempel: "Din slutliga skatt ... 35 000 kronor. Du har ... fått rotavdrag på fakturan med 50 000 kronor ... betala tillbaka mellanskillnaden ... 15 000 kronor."
  - Omfördelning: "makar eller sambor med gemensamt hushåll omfördelar rotavdraget ... Den person som övertar ... måste också uppfylla villkoren"
  - Exempel A/B: "B kan då föra över rotavdraget ... (25 000) till A. Sammanlagt kan då A nyttja maximalt 50 000 kronor ... och B ... 50 000 kronor (för grön teknik)"

### K8 · "Grön teknik" (privat)
- URL: https://www.skatteverket.se/privat/fastigheterochbostad/gronteknik.4.676f4884175c97df4192860.html
- Hämtad: curl, HTTP 200.
- Citat:
  - "Summan av skattereduktionerna får inte överstiga summan av kommunal inkomstskatt, statlig inkomstskatt, fastighetsavgift och fastighetsskatt. Skattereduktionerna räknas av mot din skatt i en bestämd ordning."
  - "Nej, skattereduktion för grön teknik kan inte medges för att utöka eller installera en ny elcentral."
  - "Efter 31 december 2024 är det slutbetalningen som styr skattereduktionen." (grön teknik, till skillnad från ROT)
  - "krävs det att batterierna är kopplade till redan installerade solceller eller att båda installationerna görs vid samma tidpunkt."

### K9 · "Belopp och procent inkomstår 2026"
- URL: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html
- Hämtad: curl, HTTP 200.
- Citat:
  - "Prisbasbeloppet inkomstår 2026: 59 200 kronor"
  - "Den genomsnittliga kommunala skattesatsen för 2026 är 32,38 procent."
  - "Skiktgränsen för 2026 är 643 000 kronor." · "Brytpunkten är 660 400 kronor för dig som inte fyllt 66 år" · "760 500 kronor för dig som fyllt 66 år"
  - Grundavdrag under 66: "25 100 vid låga inkomster · som högst 45 600 kronor · som lägst 17 400 kronor"
  - Förhöjt grundavdrag 66+: "65 800 kronor vid låga inkomster · som högst 179 100 kronor · som lägst 117 500 kronor"
  - "7 procent av förvärvsinkomsten men högst 47 100 kronor." (allmän pensionsavgift) ... "skattereduktion med 100 procent av avgiften"
  - "Du kan inte få högre skattereduktion än summan av din kommunala inkomstskatt, statliga inkomstskatt, fastighetsskatt och fastighetsavgift."
  - "Kommunal fastighetsavgift för småhus är 0,75 procent av fastighetens taxeringsvärde, men aldrig mer än 10 425 kronor."
  - "Du betalar ingen fastighetsavgift de första 15 åren för nybyggda småhus eller ägarlägenheter som byggdes 2012 eller senare."
  - "Begravningsavgiften är 0,292 procent. Om du är folkbokförd i Stockholm ... 0,07 procent"
  - Underskott av kapital: "upp till 100 000 kronor ger en skattereduktion med 30 procent. På underskott över 100 000 kronor är skattereduktionen 21 procent."

### K10 · "Nya lagar och regler 2026" (nyhet 2025-12-17)
- URL: https://www.skatteverket.se/omoss/pressochmedia/nyheter/2025/nyheter/nyalagarochregler2026.5.1522bf3f19aea8075ba32a2.html
- Hämtad: curl, HTTP 200.
- Citat:
  - "Från och med årsskiftet återgår avdrag för rotarbete till 30 procent av arbetskostnaden."
  - "Det ordinarie jobbskatteavdraget förstärks genom att skattereduktionen höjs för personer med arbetsinkomster som överstiger cirka 192 000 kronor per år."
  - "vissa åldersgränser höjs från 66 till 67 år med anledning av nya regler om riktålder för pension" (IL 63:3 a i 67-årslydelse träder i kraft 2027-01-01, se K1)
  - "Public service-avgift ska betalas med 1 procent av den beskattningsbara förvärvsinkomsten upp till ... 1,42 inkomstbasbelopp"

### K11 · E-tjänsten "Räkna ut rot- och rutavdrag"
- URL: https://www7.skatteverket.se/portal/rot-rut
- Hämtad: browser (JS-app i shadow DOM; curl ger bara "Your browser does not support JavaScript"). Fyra beräkningar körda 2026-09-11.
- Inputs (ordagrant ur formuläret): "Vilket år är du född?" · "Kommun där du var folkbokförd den 1 november 2025" · "Rotavdrag / Rutavdrag / Rot- och rutavdrag" · "Lön, förmåner m.m." · "Sjukpenning, a-kassa m.m." · "Pensioner m.m." · "Resor till och från arbetet" · "Tillfälligt arbete, dubbel bosättning och hemresor" · "Ränteinkomster, utdelningar, schablonintäkter" · "Vinst vid försäljning av aktier och fonder" · "Vinst vid försäljning av privatbostad" · "Ränteutgifter m.m. och förlust på andelar i räntefond" · "Förlust vid försäljning av aktier och fonder" · "Förlust vid försäljning av privatbostad" · "Småhus och ägarlägenhet (0,75%)" · "Tomtmark eller byggnad under uppförande (1 %)"
- Kan inte användas om: "Du har sjuk- eller aktivitetsersättning" · "Du vill beräkna skattereduktion för installation av grön teknik" · näringsidkare · deklarerar utomlands · avliden person.
- Output: "Preliminär beräkning av din skatt" · "Rotavdraget får högst vara N kronor per person och år" · tabellen "Så här har vi räknat" · "Glöm inte att räkna bort de rot- eller rutavdrag som du redan använt under året!"
- Körning 1 (född 1985, Stockholm, lön 360 000): "Beskattningsbar förvärvsinkomst 332 000 · Kommunal inkomstskatt + 101 426 · allmän pensionsavgift - 25 200 · jobbskatteavdrag - 37 132 · förvärvsinkomst - 1 500 · Utrymme = 37 594"
- Körning 2 (född 1955, Stockholm, pension 240 000): "Beskattningsbar förvärvsinkomst 118 800 · Kommunal inkomstskatt + 36 293 · förvärvsinkomst - 591 · Utrymme = 35 702"
- Körning 3 (född 1985, Stockholm, lön 720 000, ränteutgifter 60 000, underlag fastighetsavgift 4 000 000): "Statlig inkomstskatt + 11 920 · Fastighetsavgift + 30 000 · pensionsavgift - 47 100 · jobbskatteavdrag - 49 429 · underskott av kapital - 18 000 · Utrymme = 140 535" (tjänsten kapar inte avgiften vid 10 425; underlaget ska matas in kapat)
- Körning 4 (född 1990, Göteborg, lön 180 000): "Beskattningsbar förvärvsinkomst 134 400 · Kommunal inkomstskatt + 43 814 · pensionsavgift - 12 600 · jobbskatteavdrag - 18 625 · förvärvsinkomst - 708 · Utrymme = 11 881"
- Bakräknade kommunalskattesatser 2026: Stockholm 30,55 % (101 426 / 332 000), Göteborg 32,60 % (43 814 / 134 400). [BERÄKNAT]

---

## 3. Skatteverket Rättslig vägledning, utgåva 2026.13 (browser, www4 blockerar curl/WebFetch)

### K12 · "Villkor för rot- och rutavdrag"
- URL: https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/2943.html
- Citat:
  - "Rutavdrag får uppgå till max 50 procent och rotavdrag till max 30 procent av den debiterade arbetskostnaden inklusive mervärdesskatt."
  - "Fakturamodellen innebär att köparen får sitt rot- eller rutavdrag direkt i samband med betalningen av det utförda arbetet."
  - "Fakturamodellen är inte tvingande. Det är därför viktigt ... att utföraren och köparen är överens om att fakturamodellen ska tillämpas innan arbetet påbörjas."
  - "Det är inte möjligt att få rot- och rutavdrag i efterhand genom ett yrkande i inkomstdeklarationen."
  - "För att få rot- eller rutavdrag måste man alltså själv bo i bostaden där arbetet utförs. En bostad som hyrs ut kan därför inte" (RÅ 2010 ref. 109)
  - "En köpare kan ha sitt hushåll såväl i en eller flera permanentbostäder som i en eller flera fritidsbostäder."
  - "I ett särboförhållande kan parterna inte anses ha sitt hushåll i varandras respektive bostäder."
  - "För rotarbete gäller att den som begär skattereduktion måste äga hela eller en del av den bostad som föräldern bor i."
  - Nyköpt: "godkänner Skatteverket att köparen får rotavdrag ... förutsatt att köparen har tillträde till bostaden ... och ... genast efter renoveringen flyttar in"
  - "Ägare är den som har undertecknat köpe- eller gåvohandlingarna ... eller för en bostadsrätt, medlem i bostadsrättsföreningen."
  - "Att vara delägare i ett dödsbo är inte att jämställa med att äga en fastighet."
  - "I kostnaderna för arbete ingår också utförarens vinstkostnadspålägg för själva arbetet."
  - "Vissa utförare debiterar en särskild administrativ avgift ... En sådan avgift ger inte heller rätt till rot- eller rutavdrag."
  - Handverktyg: "motorsåg, cirkelsåg, skruvdragare och liknande är redskap som inte behöver särskiljas vid underlaget"
  - "Det är den dag som köparen betalar rot- eller rutarbetet som styr för vilket år som köparen kan medges skattereduktion."
  - "Köparen ska endast ha betalat en del av arbetskostnaden, normalt 70 procent av den debiterade arbetskostnaden för rotarbete"
  - "Det finns ingen begränsning av skattereduktionen per bostad ... Ägarandelen har inte heller någon betydelse för hur stor skattereduktionen kan bli."
  - "Den slutliga skattereduktionen för rot-eller rutarbete kan aldrig bli större än summan av kommunal och statlig inkomstskatt, fastighetsskatt och fastighetsavgift."
  - OBS intern inkonsekvens: "Dessutom avräknas skattereduktionerna för ... underskott av kapital, gåvor, arbetslöshetskassa och installation av grön teknik före rot- eller rutavdraget." (strider mot IL 67:2 och K13, se GRIND 9)
  - "skattereduktion för rot- och rutarbete inte avräknas mot allmän pensionsavgift, begravningsavgift och kyrkoavgift ... och public serviceavgift."
  - "Skatteverket anser att det är köparen som slutligen är ansvarig för en eventuellt för hög preliminär skattereduktion."
  - "Skattereduktionen kan inte heller sparas till nästa år."
  - "Omfördelning av skattereduktionen kan även ske mellan köpare som inte har hushållsgemenskap."

### K13 · "Vad är en skattereduktion?" (avräkningsordningen)
- URL: https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/2937.html
- Citat:
  - "Skattereduktionerna räknas av mot skatten i en i lagen bestämd ordning (67 kap. 2 § IL och 56 kap. 7 § SFL). Ordningen är följande:"
  - "kommunal fastighetsavgift för pensionärer m.fl. · sjöinkomst · allmän pensionsavgift · jobbskatteavdrag (arbetsinkomst) · sjukersättning och aktivitetsersättning · förvärvsinkomst · regional skattereduktion"
  - "· underskott av kapital · rot- och rutarbete · installation av grön teknik · gåvor · arbetslöshetskassa."
  - "Skattereduktionen för jobbskatteavdrag, sjukersättning och aktivitetsersättning, förvärvsinkomster samt för personer som bor i vissa områden ska dock endast räknas av mot kommunal inkomstskatt."
  - "En skattereduktion som inte kan utnyttjas får inte sparas till kommande beskattningsår."

### K14 · "Vad räknas som rotarbete?"
- URL: https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/2945.html
- Citat:
  - "Vanliga åtgärder är att man målar om · byter golv, tak och väggmaterial · byter köksinredning · moderniserar elinstallationer."
  - "Arbetskostnader för översyn och kontroll av sådana maskiner och inventarier är däremot att jämställa med service och ger inte rätt till rotavdrag."
  - "ingår ofta ett visst mått av felsökning för att reparationsåtgärden ska kunna genomföras. I sådant fall behöver utföraren inte särredovisa felsökningsmomentet"
  - "Rotavdrag medges däremot inte för fristående arbete såsom diagnosticerande allmän felsökning" (HFD mål nr 2677-17)
  - "Femårsregeln innebär att för om- och tillbyggnadsarbeten som utförs under 2026 kan fastigheter med värdeår till och med 2020 få rotavdrag."
  - "Observera att förbättringar ses som ombyggnad. Med förbättringar menas exempelvis installation av värmepump eller braskamin"
  - "Arbeten som avser reparation och underhåll ger rotavdrag oavsett småhusets värdeår."
  - "Femårsregeln gäller även för bostadsrätter som är småhus, men inte för ägarlägenheter eller bostadsrättslägenheter belägna i ett flerfamiljshus."
  - "Rotavdrag medges inte heller för arbeten som utförs före det fastighetstaxeringsår när småhuset taxeras som färdigställt (nybyggt)."
  - "Komplementhuset följer småhusets ålder, vilket innebär att ett komplementhus inte kan byggas om eller byggas till om småhuset är fem år eller yngre"
  - "Åtgärder som enbart avser installation eller service på maskiner och andra inventarier ger inte rotavdrag (67 kap. 13 c § IL)."
  - "Kostnader för arkitekt, bygglov, besiktning och liknande ger inte rotavdrag."
  - Bostadsrätt: "Renovering av eller ingrepp fasaden ger inte rotavdrag ... Bedömningen är densamma om bostadsrättslägenheten är ett radhus"
  - Bostadsrätt, elledningar: "Arbetet att dra elledningar från proppskåpet och vidare ut i bostadsrätten får anses vara utfört i lägenheten"
  - Luftvärmepump i bostadsrätt: "ges rotavdrag endast för den del av arbetet som sker inne i lägenheten."
  - Schablon: "Installation av luftvärmepump ... 30 procent av den totala entreprenadkostnaden." ... "kan endast användas vid installation av värmesystem i småhus och ägarlägenheter, inte i bostadsrätter."

### K15 · RV-indexsidor (bekräftar struktur, inga nya regler)
- https://www4.skatteverket.se/rattsligvagledning/2942.html (Rot- och rutarbete, 2026)
- https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/2936.html (Skattereduktioner, listar "Kommunal fastighetsavgift ... inte ska överstiga fyra procent av den avgiftsskyldiges inkomst")
- https://www4.skatteverket.se/rattsligvagledning/326366.html (Svensk skatt / avräkning av utländsk skatt; bekräftar vilka reduktioner som bara får räknas mot kommunal skatt)

---

## 4. Sekundära källor (hur konkurrenterna presenterar det, inte faktakälla)

### K16 · Ungdomskraft "RUT & ROT-kalkylator" (2026-03-06)
- URL: https://www.ungdomskraft.com/guide/kalkyl-rut-rot · curl, HTTP 200.
- Citat: "Genomsnittlig kommunalskatt (32,2 %) ... 30 000 kr | ~68 000 kr | 50 000 kr | 50 000 kr | 68 000 kr" och "Beräkningarna inkluderar grundavdrag och jobbskatteavdrag."
- Observation [TOLKNING]: tabellen ignorerar reduktionen för allmän pensionsavgift (25 200 kr vid 360 000) som räknas av före ROT; Skatteverkets egen tjänst ger 37 594 kr för samma lön (K11). Tabellen överskattar utrymmet med ungefär 30 000 kr i det intervallet.

### K17 · Mowin ROT-kalkylator
- URL: https://mowin.com/sv/kalkylatorer/rot · curl, HTTP 200.
- Citat: "Avdragsprocent 30 % · Maximalt avdrag 50 000 kr" ... "eller 100 000 kr för två personer som äger bostaden tillsammans."
- Observation: enbart arbetskostnad × 0,30 med tak; ingen berättigandefråga, ingen skattekapacitet.

### K18 · Ekonomifokus / Konsumentverket
- https://ekonomifokus.se/rakna-ut-rotavdrag → HTTP 404 (sidan flyttad; SERP-snippet i 00-grundning §3 kvarstår som enda observation).
- https://www.konsumentverket.se/konsumentratt/tjanster/hantverkare/rotavdrag--vad-galler/ → HTTP 404 (URL gissad; inte använd som källa).

---

## 5. Blockerat / ej hämtat
- Skatteverkets sida `villkorforattfarotavdrag.4.2ef18e6a125660db8b080001680.html` (uppdragets URL): HTTP 404. Ersatt av K3 (samma sidtitel).
- www4.skatteverket.se via curl och WebFetch: "Request Rejected" (WAF). Löst via webbläsarrutan (K12-K15).
- Prop. 2024/25:109 och regeringen.se: inte hämtade; 2026-återgången till 30 % är belagd via K1 (Lag 2025:322/324) och K10.
- Kommunalskattesatser per kommun 2026 (SCB-tabell): inte hämtad. Snittet 32,38 % (K9) används; Stockholm 30,55 % och Göteborg 32,60 % är bakräknade ur K11. [GAP] för fullständig kommunlista.
