# 02 · Grön teknik-regelverket 2026 (källbelagt regelmodell för kalkylatorn)

Skrivet 2026-09-11 av grön teknik-agenten. Ingen siffra är gissad. Satserna (15 / 50 / 50 %, tak 50 000 kr)
är **ägarbekräftad kanon** (`ampy-foretagsdata.md` §6.5, CLAUDE.md regel 5) och har inte webb-kollats som
satser; däremot råkar Skatteverkets sidor bekräfta dem ordagrant, vilket noteras som [FACT] utan att kanon
ändras. **Varje villkor, definition och takmekanik är verifierad mot Skatteverket med URL.**

## 0. Läsanvisning

**Taggar.** `[FACT src: Sx]` = står ordagrant i källan Sx. `[TOLKNING]` = min läsning av källan; hur jag läser
den står i texten. `[BERÄKNAT]` = räknat ur fakta. `[GAP]` = saknas; får inte fyllas med gissning.
Verbatimcitat (≤ 25 ord) och hämtstatus per URL ligger i `underlag/gt-kallor.md`.

**Källkoder** (fullständiga URL:er och citat i `underlag/gt-kallor.md`):

| Kod | Källa |
|---|---|
| S1 | Skatteverket, "Grön teknik" (privat), skatteverket.se/privat/fastigheterochbostad/gronteknik… |
| S2 | Skatteverket Rättslig vägledning 2026.1, "Grön teknik, installation" (www4…/edition/2026.1/420580.html), uppdaterad 2026-02-05 |
| S3 | Skatteverket, "Så fungerar skattereduktion för grön teknik" (privat) |
| S4 | Skatteverket, "Godkända arbeten – grön teknik" (privat) |
| S5 | Skatteverket, "Så fungerar skattereduktionen för grön teknik" (företag) |
| S6 | Skatteverket, "Ger arbetet rätt till rotavdrag?" (privat, A–Ö per bostadstyp) |
| S7 | Ställningstagande 2024-07-04, dnr 8-2971032, batteri som helt eller delvis lagrar egenproducerad el |
| S8 | Ställningstagande 2023-11-30, dnr 8-2644647, installation av batteri utan anläggning för egenproduktion |
| S9 | Ställningstagande 2022-10-24, dnr 8-1963873, frågor avseende installation (en eller flera installationer, växelriktare) |
| S10 | Ställningstagande 2020-12-14, dnr 8-650752, materialkostnader (hyra/leasing) |
| S11 | Ställningstagande 2021-01-27, dnr 8-722054, kostnader som inte ger skattereduktion (3 %-schablonen) |
| S12 | Lag (2020:1066) om förfarandet vid skattereduktion för installation av grön teknik (GRÖNFL), lydelse 2026-01-01 |
| S13 | Inkomstskattelagen (1999:1229) 67 kap. 2 §, 13 c §, 36–45 §§ (lagen.nu, lydelse t.o.m. SFS 2025:1370) |
| S14 | Riksdagen, betänkande 2024/25:SkU17 "Förändrade skattesubventioner för solceller och mikroproduktion av el" |
| S15 | Energimyndigheten, Solelportalen, "Skattereduktion för grön teknik" |
| S16 | Skatteverket, "Så fungerar rotavdraget" (privat) |
| S17 | Skatteverket e-tjänst "Mina skattereduktioner för rot, rut och grön teknik" (www7…/portal/mina-avdrag/), kräver e-legitimation |
| S18 | Naturvårdsverket, "Ladda bilen för föreningar och boendeorganisationer" (granskad 2026-09-07) |
| S19 | ampy.se/gron-teknik-2026/ (den levande artikeln, hämtad 2026-09-11) |
| S20 | Marknadssidor, endast för hur marknaden formulerar: laddboxbolaget.se/gron-teknik-2026/, 1komma5.com/se/batteri/gront-avdrag-batteri/, elinstallatoren.se (2024-08) |

**Blockerat:** ingenting som behövdes blev kvar blockerat. Rättslig vägledning (www4) avvisar curl/WebFetch
(F5-bot-skydd) men öppnade i den riktiga webbläsaren; alla ställningstaganden är lästa i sin helhet.
E-tjänsten S17 kräver inloggning: bara namn och Skatteverkets egen beskrivning av den (S16) är verifierade.

---

## A. Vem kan få avdraget

### A1. Personkraven (67 kap. 36 § IL)
- **18 år vid beskattningsårets utgång.** `[FACT src: S13, S2]` "vid beskattningsårets utgång har fyllt 18 år".
  Skatteverkets folkliga form: "Du ska ha fyllt 18 år senast vid årets slut." `[FACT src: S3]`
- **Obegränsat skattskyldig under någon del av året.** `[FACT src: S13, S2]` Räcker att man varit det en del
  av året (inflyttad mitt i året är okej). `[TOLKNING]`
- **Begränsat skattskyldig** kan få avdraget om minst 90 % av förvärvsinkomsterna är svenska. `[FACT src: S3]`
  Den som bara äger ett småhus i Sverige och bara betalar fastighetsavgift/-skatt här kan **inte** få det. `[FACT src: S2]`
- **Ha haft utgiften** för installationen: "Du ska faktureras för arbetet och/eller själv betala för arbetet."
  `[FACT src: S3]` Fakturan bör bära köparens namn/personnummer, eller köparen ska vara den som betalar. `[FACT src: S3]`
- **Vid liv när arbetet utförs.** Dödsbo kan få avdrag för arbete utfört före dödsfallet. `[FACT src: S3, S13]`
- **Enskild firma:** man kan inte fakturera sig själv via sin enskilda firma. `[FACT src: S3]`

### A2. Bostadskraven (67 kap. 39 och 41 §§ IL)
Installationen ska vara hänförlig till `[FACT src: S13, S2]`:
1. ett **småhus eller en ägarlägenhet** som ägs av den som begär avdraget,
2. en **lägenhet upplåten med bostadsrätt** som innehas av den som begär avdraget, eller
3. en **byggnad under uppförande** som ägs av den som begär avdraget och som ska bli småhus/ägarlägenhet.

- **Äga helt eller delvis.** "Du måste äga bostaden när arbetet utförs" `[FACT src: S3]`; "måste äga hela eller
  delar av den bostad som föräldern bor i" (förälderfallet) `[FACT src: S2]`. Delägande räcker alltså. `[TOLKNING]`
- **Hushållskravet ("bo där?").** Installationen ska vara "hänförlig till hushållet för den som begär
  skattereduktion eller dennes förälder" (41 §) `[FACT src: S13]`. Skatteverkets folkliga form: "Du, eller din
  förälder, ska använda bostaden som permanentbostad, fritidsbostad eller liknande." `[FACT src: S3]`
  → **Fritidshus räknas** ("Det gäller även fritidshus eller stuga som du äger") `[FACT src: S3]`.
  → **Uthyrd bostad räknas inte**: "om du hyr ut hela eller delar av den, kan du inte få skattereduktion för
  arbeten som utförs i den del du hyr ut." Och: "Om någon annan bor permanent i ditt fritidshus räknas det
  inte längre som ett fritidshus du kan använda." `[FACT src: S3]`
  → **Förälders bostad: JA** om du äger den (helt/delvis) och har haft utgiften; föräldern ska vara bosatt i
  Sverige. **Barns bostad: NEJ**, "oavsett om du äger den eller inte". `[FACT src: S2, S3]`
  → **Nyköpt bostad** du ännu inte flyttat in i: JA, om ingen annan bor där när arbetet görs och du flyttar in
  direkt. `[FACT src: S3]`
- **Hyresrätt = nej.** "hyrd bostad", "uthyrd bostad", "arrenderad bostad" ger inte rätt. `[FACT src: S3]`
- **Bostadsrätt = ja**, om installationen "ska vara kopplad till den aktuella bostadsrätten och nyttan av
  installationen ska enbart tillfalla bostadsrätten", avtalet ingås med dig som enskild innehavare, och
  "Installationen ska även följa lägenheten vid en försäljning av bostadsrätten." `[FACT src: S3]` Detaljer om
  parkeringsplats i B3.
- **Nybyggnation = ja.** "Installation av grön teknik ger rätt till skattereduktion även på en byggnad under
  uppförande" förutsatt att anläggningen ska anslutas till elnätet när huset är klart. `[FACT src: S3, S13]`
  **Det finns ingen femårsregel för grön teknik** (femårsregeln är ett ROT-villkor, 67 kap. 13 c § 5 IL,
  och finns inte i 36–45 §§). `[FACT src: S13]` `[TOLKNING på frånvaron]`
- **Tillbyggnad** av befintligt småhus: inget särskilt hinder; installationen är hänförlig till småhuset.
  `[TOLKNING]` (Skatteverket nämner inte tillbyggnad särskilt; ingen åldersregel finns.)
- **Bostaden ska vara nätansluten** (eller avses bli det): "bostad som inte är anslutna till elnätet" ger inte
  rätt. `[FACT src: S3]`
- **Bostad inom EU/EES eller Schweiz** omfattas med samma regler; utförare utan svensk näringsverksamhet
  behöver skuldfrihetsintyg i stället för F-skatt. `[FACT src: S3, S2]` Bostad utanför EES: nej. `[TOLKNING]`
- **Småhus på ofri grund och kolonistuga** kan ge rätt (stugan ska vara inrättad som bostad och kommunen
  tillåta boende del av året). `[FACT src: S3]`
- **Lantbruksenhet/näringsfastighet:** privatbostad på lantbruksenhet ja, men elen ska i princip enbart komma
  småhuset till del; vid aktiv näringsverksamhet krävs två elabonnemang. `[FACT src: S2, S3]`
  Näringsfastigheter omfattas inte. `[FACT src: S15]`

---

## B. Vad räknas, per kategori (67 kap. 38 § IL)

Tre installationer ger rätt till avdraget `[FACT src: S13, S2]`; görs alla samtidigt har ändå **tre
installationer** gjorts, och utföraren kan begära utbetalning per installation när den är utförd och slutbetald
`[FACT src: S9, S2]`. Görs två eller fler bör de **särredovisas på fakturan**. `[FACT src: S1]`

### B1. Nätanslutet solcellssystem, 15 %
- Definition: "Installation av nätanslutet solcellssystem eller, om installationen är hänförlig till en byggnad
  under uppförande, av solcellssystem som ska anslutas till elnätet." Vid kombinerad solel/solvärme ska elen
  vara minst 20 % av beräknad årsproduktion. `[FACT src: S13]`
- Satsen: 15 % av kostnaden för arbete och material inkl. moms **från 1 juli 2025** (prop. 2024/25:109),
  tillämpas på installationer slutbetalda efter 30 juni 2025. `[FACT src: S2, S14]` (Kanon §6.5 säger samma.)
- Godkänt material utöver panelerna: "stativ, kablage och växelriktare". `[FACT src: S4]`
- **Växelriktaren** hör till solcellsinstallationen (15 %) när solceller och batteri installeras vid samma
  tillfälle (Skatteverkets förtydligande 2026-02-05). `[FACT src: S2, S1]` Se B2 för retrofit-batteri.
- Elen ska "enbart komma det aktuella småhuset eller lägenheten till godo". `[FACT src: S2]` Solceller på
  åkermark: nej; på småhus, ekonomibyggnad, komplementhus eller tomtmark i nära anslutning: ja. `[FACT src: S1]`
- Ej godkänt: anslutningsavgift till elnätet, ombyggnad av tak, byte/uppgradering av elcentral inför
  installationen, återställningsarbete, reparation/demontering (kan vara ROT). `[FACT src: S4]`

### B2. System för lagring av egenproducerad elenergi (batteri), 50 %
- Definition (38 § 2): kopplat till "en sådan anläggning för egenproduktion av förnybar el som är ansluten till
  … elnätet", och systemet ska (a) lagra el för användning vid annat tillfälle än produktionstillfället och
  (b) "öka den årliga andelen egenproducerad elenergi som används inom fastigheten". `[FACT src: S13]`
- **Solcellsgrinden är FACT och nu stängd** (kanon §6.5 hade den som [GAP]): "Om batterier installeras utan att
  det finns en anläggning för egenproduktion av förnybar el på fastigheten eller utan att en installation av
  anläggning för egenproduktion av förnybar el är påbörjad är kraven för skattereduktion inte uppfyllda."
  `[FACT src: S8, S2]` Skatteverkets FAQ: "krävs det att batterierna är kopplade till redan installerade
  solceller eller att båda installationerna görs vid samma tidpunkt." `[FACT src: S1]`
  → **Batteri till befintliga solceller: JA.** `[FACT src: S1, S2]`
  → **Batteri och solceller samtidigt: JA** (även om batteriet blir klart först; "avsikten" avgör). `[FACT src: S9]`
  → **Batteri först, solceller "sen" (ingen påbörjad installation): NEJ.** `[FACT src: S8]`
  → "Förnybar el" är lagens ord; i praktiken solceller. Vindkraftverk på tomten skulle formellt duga. `[TOLKNING]`
- **Stödtjänster / arbitrage (candour-grinden).** Skatteverkets gällande ställningstagande 2024-07-04
  (dnr 8-2971032) **ersätter** det tidigare kravet "uteslutande eller så gott som uteslutande" (dnr 8-2730035,
  2024-01-25). Gällande lydelse: "installation av batteri som helt eller delvis används för att lagra
  egenproducerad el ger rätt till skattereduktion även om batteriet till viss del utnyttjas för stödtjänster
  eller elprisarbitrage." `[FACT src: S7, S2]` Bakgrund: två SRN-beslut: villkoren är uppfyllda "så snart ett
  batteri … till någon del utnyttjas för fastighetens elbehov". `[FACT src: S7]`
  → För kalkylatorn: **stödtjänster påverkar inte avdraget** så länge batteriet också lagrar egen solel. Det
  ändrar ingenting i Ampys candour-grind om *ekonomin* (stödtjänster = 0 i grundkalkylen, §6.5/§6.6); det
  säger bara att *avdraget* inte förloras. Ett batteri som **enbart** kör stödtjänster och aldrig lagrar egen
  el faller utanför lagtexten. `[TOLKNING av S7 + 38 § 2 b]`
- Godkänt material utöver batterierna: "exempelvis kablage". `[FACT src: S4]` **Batteriväxelriktare/hybrid-
  växelriktare vid retrofit** (batteri till befintlig sol): Skatteverkets 2026-02-05-förtydligande täcker bara
  det samtidiga fallet. När *enbart* batteriet installeras är växelriktaren "material nödvändigt för
  installationen" av lagringssystemet → 50 %. `[TOLKNING]` **→ GRIND 3.**
- Ej godkänt: lagring utan egen elproduktion, system som används av flera hushåll, lagring för uthyrd bostad
  eller ekonomibyggnad, installation på annan fastighet/samfälld mark, reparation och underhåll. `[FACT src: S4]`
  Lagrad el som förser andra byggnader på fastigheten än småhuset ger "i normalfallet" inte rätt. `[FACT src: S1]`
- **Batteri i bostadsrätt:** möjligt bara om det lagrar el från en egen produktionsanläggning som hör till
  bostadsrätten och nyttan enbart tillfaller bostadsrätten; en förenings solceller är inte "egenproducerad"
  el för den enskilde. `[TOLKNING av S3 + S4]` Kalkylatorn ska svara "kan inte bedöma här" i det läget.

### B3. Laddningspunkt till elfordon, 50 %
- Definition (38 § 3): "förberedd för elmätning och debitering av elkostnad" och med minst uttag/don enligt
  EN 62196-2 (typ 2) eller EN 62196-3 (Combo). `[FACT src: S13, S2]` **Inte solcellsgrindad** (ingen sådan
  förutsättning finns i lagtexten eller vägledningen). `[FACT src: S13]` `[TOLKNING på frånvaron]`
- Ska "enbart disponeras av hushållet" som äger småhuset/ägarlägenheten eller innehar bostadsrätten. `[FACT src: S2]`
  Laddningspunkter "som används av flera hushåll" är ej godkända. `[FACT src: S4]`
- **Vad ingår:** "själva laddningspunkten, fästanordning för laddningspunkten, kabeldragning från
  laddningspunkten till elcentral och laddningskabel." `[FACT src: S1]` Godkänt är även "fristående
  laddstolpar" och "material nödvändigt för installationen … exempelvis kablage och fästen". `[FACT src: S4]`
- **Vad ingår INTE:** "Nyinstallation, utbyte eller utökning av elcentral inför installationen" (kan vara ROT),
  "Mobila laddningspunkter eller extra laddkablar", andra kontaktstandarder, frakt/resor/maskiner/projektering,
  återställningsarbete, reparation och underhåll. `[FACT src: S4, S1]`
- **Lastbalanserare:** nämns inte av Skatteverket. Den kan läsas som "material nödvändigt för installationen"
  (den sitter mellan boxen och elcentralen och behövs ofta för att boxen ska kunna installeras) eller som en
  utökning av elcentralen (ej godkänt). `[TOLKNING]` Ampy rekommenderar lastbalansering till 95 % av hemmen
  (`ampy-foretagsdata` §3.4) → **GRIND 4** (hur Ampy fakturerar den).
- **V2G / dubbelriktad laddbox:** uppfyller definitionen om den är en laddningspunkt med typ 2/Combo och
  elmätning; Skatteverket har ingen särskild regel om urladdning mot huset. `[TOLKNING]` `[GAP]` på formell
  bekräftelse. En V2G-box är inte "system för lagring av egenproducerad el" (bilen är inte kopplad till
  solanläggningen i lagens mening). `[TOLKNING]`
- **Smart laddning / app / elmätare i boxen:** ingår som en del av laddningspunkten. `[TOLKNING]`
- **"Förberedelse för laddning"** (kabel/rör utan box): ingen laddningspunkt installeras → inte grön teknik;
  eldragning kan i stället vara ROT-arbete. `[TOLKNING av S1 + S6]`
- **Andra laddboxen** vid samma hushåll: ingen antalsbegränsning i lag eller vägledning; taket 50 000 kr
  gäller. `[TOLKNING]`
- **Laddbox vid fritidshus:** fritidshus är ett småhus som hushållet använder → ja. `[FACT src: S3]` `[TOLKNING]`
- **Bostadsrätt, parkeringsplats (detta är den precisa regeln):** avdrag "kan godkännas om parkeringsplatsen
  är kopplad till bostadsrätten och inte kan sägas upp vid en eventuell försäljning av bostadsrätten. Detta
  gäller även om parkeringsplatsen ligger på mark som tillhör bostadsrättsföreningen (samfälld mark). Det ska
  klart framgå att den angivna parkeringsplatsen alltid följer med vid en försäljning av bostadsrätten."
  `[FACT src: S2]` → En **hyrd p-plats som föreningen kan säga upp** ger **inte** grön teknik. `[FACT src: S2]`
  → **Föreningens gemensamma garage/laddplatser:** föreningen är köpare, inte privatperson → inte grön teknik;
  föreningen kan söka Naturvårdsverkets **Ladda bilen** (50 % av bidragsberättigade kostnader, max 15 000 kr
  per laddpunkt för boende/medlemmar; ansökan öppen). `[FACT src: S18]`
  → ROT är inte ett alternativ i bostadsrätt för laddbox: ROT-listan för bostadsrätt säger "Inget avdrag ges för
  att … installera, reparera och byta ut solceller eller laddningspunkter för elfordon". `[FACT src: S6]`
- **Småhus med p-plats på samfällighet:** ja, om platsen är kopplad till småhuset och följer med vid
  försäljning. `[FACT src: S2]`

---

## C. Vad som INTE räknas

| Post | Regel | Tagg |
|---|---|---|
| Värmepump | Inte en av de tre installationerna; arbetet kan vara ROT (30 % på arbete). | `[FACT src: S13]` + `[TOLKNING]`; kanon §3.1 säger samma |
| Batteri utan egen produktion | Nej (B2). | `[FACT src: S8]` |
| Elcentral (ny/utökad/byte) i samband med laddbox eller sol | Inte grön teknik; "se dock godkända rotarbeten". | `[FACT src: S4, S1]` |
| Resor, frakt, maskiner, utrustning, projektering, administration | Ger inte avdrag; ska betalas i sin helhet av kunden. Företaget får inte "bjuda" på resan (då anses den ingå i arbete/material och Skatteverket kan betala ut mindre). | `[FACT src: S2, S3]` |
| Material köpt av någon annan än installatören | "kan skattereduktion enbart medges för installationsarbetet" → **arbetet får fortfarande 50 % (eller 15 %)**, materialet 0. | `[FACT src: S1, S2, S3]` |
| Enbart material (utan installation av samma företag) | Ingen skattereduktion alls; en ren säljare kan inte begära utbetalning. | `[FACT src: S2, S4]` |
| Hyra / leasing / hyrköp av utrustningen | Ingen äganderättsövergång → ingen materialkostnad; bara arbetskostnaden ger avdrag. | `[FACT src: S10, S2]` |
| Utförare utan F-skatt | Fakturamodellen kräver F-skatt vid avtal eller betalning; blir företaget godkänt efteråt: ingen utbetalning. | `[FACT src: S13 43 §, S3]` |
| Kontant betalning / presentkort | Ej elektronisk betalning → ingen rätt. | `[FACT src: S13 42 §, S3]` |
| Arbete som redan fått ROT, försäkringsersättning eller bidrag (stat/kommun/region) | Inte grön teknik (67 kap. 40 §). | `[FACT src: S13, S2]` |
| Reparation, underhåll, återställningsarbete, demontering | Inte grön teknik (kan delvis vara ROT). | `[FACT src: S4]` |
| Installation på annan fastighet / samfälld mark (utom p-platsfallet i B3) | Nej. | `[FACT src: S4, S2]` |
| Bostad utanför EU/EES/Schweiz | Nej (endast EES + Schweiz omfattas). | `[FACT src: S13 38 §, S3]` `[TOLKNING]` |
| Anslutningsavgift till elnätet | Nej. | `[FACT src: S4]` |
| Mobil laddare, extra laddkabel | Nej. | `[FACT src: S4]` |

**Kombination med ROT på samma jobb:** "Det är inte möjligt att t.ex. få rotavdrag för arbetskostnader för en
åtgärd och dessutom skattereduktion för installation av grön teknik för materialkostnader för samma åtgärd."
`[FACT src: S2]` Men **separata arbeten** på samma faktura/tillfälle får var sitt avdrag: "lägger om taket …
och sedan installerar solceller … både rotavdrag för takomläggningen och skattereduktion för grön teknik."
`[FACT src: S3]` Motsvarande: laddbox (grön teknik) + byte av elcentral (ROT). `[TOLKNING, stöds av S4]`

**ROT som reservväg när grön teknik inte gäller (batteri utan sol):** ROT-listan för småhus tar upp "dra el i
samband med installation av system för lagring av egenproducerad elenergi" som rotarbete, och "installera
laddningspunkter för elfordon" samt "installera, reparera och byta ut solceller" `[FACT src: S6]`. Alltså:
**ROT 30 % kan gälla arbetskostnaden (elarbetet) vid en batteriinstallation utan solceller; materialet får
inget avdrag.** Hur stor del av installationsarbetet som är "dra el" är inte definierat av Skatteverket, och
67 kap. 13 c § 1 IL undantar "installationer … på maskiner och andra inventarier" från ROT. `[TOLKNING]` →
kalkylatorn säger "kan" och **GRIND 5** (Ampys uppdelning arbete/material på batterijobb).

---

## D. Pengarna

- **Underlag = debiterad kostnad för arbete och material inkl. moms**, inklusive utförarens vinstpålägg.
  `[FACT src: S13 36 §, S2]`
- **Satser:** 15 % sol, 50 % lagring, 50 % laddningspunkt, av underlaget. `[FACT src: S1, S2]` = kanon §6.5.
- **Tak: 50 000 kr per person och beskattningsår, gemensamt för alla tre kategorierna.** "Den sammanlagda
  skattereduktionen får uppgå till högst 50 000 kronor för ett beskattningsår." `[FACT src: S13 45 §, S12 16 §]`
  Sol + batteri + laddbox samma år delar alltså samma 50 000. `[FACT src: S13]` (Marknaden säger samma, S20.)
- **Två ägare → upp till 100 000 kr.** Var och en måste själv uppfylla villkoren (äga, ha utgiften): "kan du be
  företaget att ansöka om skattereduktion för någon annan i hushållet som också äger bostaden." `[FACT src: S3]`
  Fördelningen: "Om flera personer ska dela på skattereduktionen bör det framgå på fakturan hur mycket varje
  person ska få i avdrag." `[FACT src: S3, S5]` Omfördelning i efterhand är möjlig till make/maka/sambo med
  hushållsgemenskap "förutsatt att den personen i övrigt har rätt till avdraget" (brev till Skattekontoret
  Västervik, i deklarationen, eller omprövning). `[FACT src: S3]` Lagen sätter ingen gräns vid två personer;
  tre delägare = tre tak. `[TOLKNING]` Ampys motor räknar max 2 (§4.7).
- **Vilket år?** "Det är den dag som köparen slutbetalar för installationen … som styr vilket år som köparen kan
  medges skattereduktion." `[FACT src: S2]` Sedan 2025-01-01 räknas även förskott betalda tidigare år in när
  slutbetalningen sker (prop. 2024/25:1). `[FACT src: S1, S2, S3]` → Slutbetalning i januari 2027 belastar
  2027 års pott och 2027 års skatt, inte 2026. `[BERÄKNAT]`
- **Utbetalningstaket per installation** (GRÖNFL 7 §): för sol högst 3/17 av vad köparen betalat (= 15 % av
  underlaget), för lagring/laddpunkt högst samma belopp som köparen betalat (= 50 %). `[FACT src: S12]` För
  maximalt avdrag betalar köparen 85 % (sol) respektive 50 % (batteri/laddbox). `[FACT src: S2]`
- **3 %-schablonen vid fast pris (totalentreprenad).** Kostnader som inte ger avdrag (projektering, resor)
  får schablonberäknas till 3 % av totalpriset → **underlaget = 97 % av totalpriset**. Bara vid
  totalentreprenad till fast pris; kan inte kombineras med andra schabloner; gäller även vid utbyten.
  `[FACT src: S11, S2, S3]` Skatteverkets eget exempel: totalpris 200 000 kr, övrigt 6 000 kr, underlag
  194 000 kr, avdrag 29 100 kr (15 %). `[FACT src: S5]` Ampys motor räknar 0,485 = 50 % × 97 % (§4.7), sajten
  räknar flat 50 % (faktabas-gt-produkt [GAP-1]) → **GRIND 1**.
- **Preliminär → slutlig.** Utbetalningen till utföraren blir köparens *preliminära* skattereduktion; den
  förifylls i deklarationen; slutlig reduktion medges när deklarationen skrivs under. "Skulle däremot köparen ha
  mindre skatt att betala än det belopp som den preliminära skattereduktionen uppgår till resulterar det i en
  tillkommande post vid beräkningen av slutskatten." `[FACT src: S2]` → **Återbetalningsrisk = avdraget på
  fakturan minus vad skatten täcker.** `[BERÄKNAT]`
- **Separat från ROT/RUT.** "Förutom skattereduktion för grön teknik om 50 000 kr per år kan du få rot- och
  rutavdrag för andra arbeten med upp till 75 000 kr per år." `[FACT src: S3]` Ett hushåll kan alltså nyttja
  50 000 grön teknik + 50 000 ROT (inom 75 000 ROT+RUT) samma år **om skatten räcker till båda**. `[FACT src: S3]`
  = kanon §6.5.
- **Hela krontal:** belopp anges i hela kronor, öretal faller bort. `[FACT src: S12 5 §, S13 67:1]`
- **Kreditköp/finansiering via kreditbolag:** Skatteverket anser att kreditbolaget betalat för köparens räkning;
  avdrag kan medges när företaget fått betalt. `[FACT src: S3]` Leasing är däremot inte materialkostnad (C).

---

## E. Skatteutrymmet ("räcker din skatt?")

Kalkylatorn ska **inte** bygga egen lön→skatt-tabell (ROT-agenten äger den). Det den måste veta:

- **Vilka skatter avdraget räknas mot:** "Summan av skattereduktionerna får inte överstiga summan av kommunal
  inkomstskatt, statlig inkomstskatt, fastighetsavgift och fastighetsskatt." `[FACT src: S1, S13 67:2]`
- **Räknas INTE mot:** allmän pensionsavgift, begravningsavgift, kyrkoavgift, public service-avgift. "Dessa
  avgifter ska därför alltid betalas." `[FACT src: S2]`
- **Avräkningsordningen (67 kap. 2 § IL, lydelse SFS 2025:1370):** sjöinkomst, allmän pensionsavgift,
  arbetsinkomst (jobbskatteavdrag), sjuk-/aktivitetsersättning, förvärvsinkomst, regional skattereduktion,
  underskott av kapital, **hushållsarbete (ROT/RUT), installation av grön teknik**, gåva, a-kasseavgift,
  "i nu nämnd ordning". `[FACT src: S13]` → **Grön teknik ligger EFTER ROT/RUT.** Har du redan använt ROT/RUT
  i år tar de sin del av skatten först. `[FACT src: S13]` (Rättslig vägledning-prosan S2 räknar upp gåva och
  a-kassa *före* grön teknik, vilket avviker från lagtextens ordning; oväsentligt för beloppen men noterat i
  `gt-kallor.md`.) `[TOLKNING]`
- **Skatteverkets egen formulering** som får citeras: "Om du kan ta del av avdraget eller inte beror på hur
  mycket skatt du har betalat in under året och vilka andra avdrag du har gjort." `[FACT src: S1]` Och: "Tänk
  på att du behöver ha betalat tillräckligt med skatt under året för att kunna nyttja hela skattereduktionen.
  Det är särskilt viktigt om du också använt rot- och rutavdrag." `[FACT src: S3]`
- **Vad som händer om skatten inte räcker:** tillkommande post i slutskatten; "Köparen blir
  återbetalningsskyldig för skillnaden mellan den preliminära skattereduktionen och den slutliga
  skattereduktion som har medgetts." `[FACT src: S2]` Utföraren kan inte kontrollera kundens utrymme: "Det är
  bara din kund som kan ta reda på hur mycket skattereduktion hen har kvar." `[FACT src: S5]`
- **Verktyg hos Skatteverket:** e-tjänsten "Mina skattereduktioner för rot, rut och grön teknik" visar
  "hur mycket avdrag du har utnyttjat i år och även tidigare år" (kräver e-legitimation; annars intyg per post).
  `[FACT src: S16, S17]` "Räkna ut skatt" för preliminär beräkning. `[FACT src: S1]`

**Vad GT-kalkylatorn därför måste fråga/anta (gränssnitt mot ROT-modellen):**
1. `availableTax` per ägare = (kommunal + statlig inkomstskatt + fastighetsavgift/-skatt) minus de reduktioner
   som ligger före i ordningen (jobbskatteavdrag m.fl.). Levereras av ROT-agentens modell; GT-modellen räknar
   aldrig fram den själv. `[BERÄKNAT ur S13]`
2. `rotRutUsedKr` per ägare: "Har du använt ROT eller RUT i år?" → dras från `availableTax` innan grön teknik
   prövas. `[FACT src: S13]`
3. `gtUsedKr` per ägare: "Har du använt grön teknik-avdrag i år?" → dras från taket 50 000. `[FACT src: S13 45 §]`
4. Okänd skatt → verdictet hedgas ("kan"), aldrig blockeras: avdraget på fakturan påverkas inte av skatten,
   bara återbetalningsrisken. `[FACT src: S2]`

---

## F. Förfarandet (fakturamodellen är obligatorisk för grön teknik)

- **Fakturamodellen är enda vägen.** "Fakturamodellen måste tillämpas för att skattereduktion enligt reglerna
  för installation av grön teknik ska kunna ges … Det är inte möjligt att få skattereduktionen i efterhand genom
  ett yrkande i inkomstdeklarationen." `[FACT src: S2]` → Copyn "avdraget dras direkt på fakturan" är **sann
  per lag** för grön teknik (till skillnad från ROT-fallet i 00-grundning §6 fråga 1, som handlar om Ampys
  praxis). Utförare och köpare bör vara överens om fakturamodellen **innan arbetet påbörjas**. `[FACT src: S2]`
- **Vad köparen betalar:** köparen betalar "endast en viss del av den totala arbets- och materialkostnaden
  inklusive mervärdesskatt"; utföraren begär resten från Skatteverket. `[FACT src: S2]`
- **Utföraren ansöker**, elektroniskt (e-tjänsten "Grön teknik – företag" med e-legitimation, alternativt
  blankett SKV 4557 via ombud), **senast 31 januari året efter slutbetalningen**; installationen ska vara både
  utförd och slutbetald. `[FACT src: S12 8 §, S5, S1]` Missar utföraren fristen finns ingen efterhandsväg
  (efterhandskonstruktioner godtas inte). `[FACT src: S3]`
- **Uppgifter köparen måste lämna:** personnummer; **fastighetsbeteckning** (småhus) eller
  **bostadsrättsföreningens organisationsnummer + lägenhetsnummer** (bostadsrätt); vid nyköp ev. köpehandlingar;
  vid ofri grund arrendeavtal m.m. `[FACT src: S3, S12 9 §]`
- **Fakturan bör innehålla:** totalbelopp och skattereduktionens storlek inkl. moms; arbete, material och
  övriga kostnader var för sig; typ av arbete; uppgift om F-skatt; kundens namn och personnummer;
  fastighetsbeteckning/BRF-org.nr + lägenhetsnummer. `[FACT src: S3, S5]`
- **F-skatt:** utföraren ska vara godkänd för F-skatt när avtalet träffas eller när betalningen sker.
  `[FACT src: S13 43 §]` Ampy Nordic AB har F-skatt (kanon §1.1, självuppgift på /rot-avdrag-2026/).
- **Elektronisk betalning:** kort, BankID, Swish, bankgiro/inbetalningskort via bank; kontanter och
  presentkort godtas inte. `[FACT src: S13 42 §, S3]` (Kanon-artikeln /rot-avdrag-2026/ säger samma för ROT.)
- **Factoring:** utbetalning kan begäras först när köparen betalat factoringbolaget; Skatteverket vidhåller
  sin syn trots SRN-förhandsbesked (dnr 83-22/D). `[FACT src: S2]`
- **Köparen ser det så här:** Skatteverket skickar meddelande om preliminär skattereduktion när utbetalning
  beslutats; beloppet förifylls i inkomstdeklarationen; köparen kan följa utnyttjat belopp i e-tjänsten
  "Mina skattereduktioner för rot, rut och grön teknik". `[FACT src: S3, S16, S17]`
- **Köparens ansvar:** köparen är "ytterst ansvarig för att uppgifterna är korrekta" och kan få skattetillägg
  om avdraget godkänns för arbete som inte ger rätt (t.ex. resekostnader). `[FACT src: S2]`
- **Vem betalar tillbaka?** Två spår: (1) **skatten räcker inte** → köparen, via tillkommande skatt i
  slutskattebeskedet `[FACT src: S2]`; (2) **utbetalningen var felaktig** (t.ex. arbetet gav inte rätt) →
  Skatteverket beslutar om återbetalning från **mottagaren (utföraren)**, med kostnadsränta, inom sex år
  (GRÖNFL 12–13, 21 §§) `[FACT src: S12]`; vad utföraren sedan fakturerar kunden är civilrättsligt. Ampys
  policy vid nekat avdrag = **[GAP]** (faktabas-gt-produkt [GAP-7]) → **GRIND 6**.
- **Tvist om utförandet** ändrar inte utbetalningen: "Företaget har rätt till betalning från Skatteverket
  oavsett om du som kund är nöjd med installationen eller inte." `[FACT src: S3]`

---

## G. Ändringen 2025-07-01 och läget 2026

- **Sol 20 → 15 %** från 1 juli 2025 (prop. 2024/25:109, riksdagsbeslut 2024/25:SkU17); "tillämpas på
  installationer som har slutbetalats efter den 30 juni 2025"; äldre regler för installationer slutbetalda före.
  `[FACT src: S14, S12 övergångsbest. 2025:541, S2]` Konsekvens: en solanläggning **slutbetald** 2025-06-30
  eller tidigare fick 20 %, oavsett när arbetet gjordes. `[BERÄKNAT]`
- **Batteri och laddbox: oförändrat 50 %.** `[FACT src: S2, S15]`
- **Förskottsregeln** ändrades 2025-01-01: slutbetalningen styr; förskott från tidigare år räknas med.
  `[FACT src: S1, S2]`
- **Mikroproduktion (60-öringen) slopad 2026-01-01**, för el inmatad efter 2025-12-31. `[FACT src: S14]` Detta
  är **en annan skattereduktion** än grön teknik (kanon §6.4 varnar för sammanblandning). `[FACT src: S14]`
- **Utbetalningstaket** för sol ändrades samtidigt till 3/17 (GRÖNFL 7 §, SFS 2025:541). `[FACT src: S12]`
- **Nytt 2026-02-05:** Skatteverkets förtydligande om växelriktaren (15 % vid samtidig sol + batteri). `[FACT src: S2]`
- **Inget annat ändrat för 2026** enligt Skatteverkets vägledning 2026.1, Energimyndigheten och sökning
  2026-09-11. `[FACT src: S2, S15]` Budgetpropositionen för 2027 var inte publicerad vid research-tillfället →
  `[GAP]`: kontrollera efter BP2027 (normalt mitten/slutet av september) om något föreslås för 2027.

---

## H. Segmentfrågorna (svenska svar, källbelagda; UI-strängar utan tank-/halvstreck)

**Grön teknik i bostadsrätt.** Ja, du kan få avdraget som bostadsrättsinnehavare, men bara om installationen
är kopplad till just din lägenhet, nyttan bara tillfaller dig och avtalet ingås med dig som privatperson. För en
laddbox är det parkeringsplatsen som avgör: Skatteverket kräver att platsen hör till bostadsrätten, inte kan
sägas upp och alltid följer med när lägenheten säljs. En p-plats du hyr av föreningen räcker inte, och ROT är
ingen reservväg för laddbox utanför lägenheten. Föreningens gemensamma laddplatser kan i stället få
Naturvårdsverkets Ladda bilen-bidrag, som föreningen söker. `[FACT src: S2, S3, S6, S18]`

**Batteri utan solceller.** Då gäller inte grön teknik. Skatteverket kräver att batteriet kopplas till en egen
solanläggning som redan finns på fastigheten eller installeras samtidigt; "batteri nu, solceller sen" räcker
inte, och grannens eller föreningens solceller räknas inte som din egen produktion. Det som kan gälla i stället
är ROT: 30 % på arbetskostnaden för elarbetet, inget på batteriet. Har du solceller spelar det ingen roll att
batteriet också används till stödtjänster eller att köpa billig el på natten, så länge det också lagrar din
egen solel. `[FACT src: S8, S7, S6]` `[TOLKNING på grannen/föreningen]`

**Grön teknik för laddbox.** Laddboxen är inte beroende av solceller. 50 % på box, fäste, kabeldragning till
elcentralen och laddkabel, men inte på en ny eller utökad elcentral, som i stället kan vara ROT-arbete. Boxen
ska bara användas av ditt hushåll och sitta vid en bostad du äger, fritidshus inräknat. En andra laddbox går
bra så länge taket på 50 000 kr per person räcker. Köper du boxen själv på nätet får du 50 % bara på
installationsarbetet. `[FACT src: S1, S4, S3]` `[TOLKNING på andra boxen]`

**Pensionär.** Åldern spelar ingen roll uppåt, bara att du fyllt 18. Det som avgör är hur mycket skatt du
betalar: avdraget räknas mot kommunal och statlig inkomstskatt på pensionen och mot fastighetsavgiften, men
inte mot pensionsavgift, begravningsavgift eller public service-avgift. Har du också använt ROT eller RUT i år
tar de sin del först. Avdraget dras ändå på fakturan; räcker inte skatten kan Skatteverket kräva tillbaka
mellanskillnaden i slutskatten. `[FACT src: S13, S2]`

**Hyresrätt.** Nej. Grön teknik kräver att du äger småhuset eller ägarlägenheten, eller innehar bostadsrätten.
I en hyresrätt är det fastighetsägaren som kan installera; hör med din hyresvärd. `[FACT src: S3, S13]`

**Nybyggt hus.** Ja. Grön teknik har ingen femårsregel; en byggnad under uppförande som du äger och som ska
bli småhus eller ägarlägenhet ger rätt till avdraget, så länge anläggningen ska anslutas till elnätet när huset
är klart. Det skiljer grön teknik från ROT. `[FACT src: S3, S13]`

**Fritidshus.** Ja, om du äger det och använder det själv (eller din förälder gör det). Bor någon annan där
permanent räknas det inte längre som ditt fritidshus. `[FACT src: S3]`

---

## I. Ampy-specifikt (ur `ampy-foretagsdata.md`)

- **GT-sortimentet = laddboxar + batterilagring** (§3.1 "Produkter: Laddboxar, Batterilagring"; §3.2, §3.4).
  Solceller: Ampy skriver om sol (§3.3) men har ingen produktsida; **om Ampy installerar solceller = [GAP]**.
  → Läget `gt_sol` får inte routa till ett Ampy-solerbjudande utan ägarbekräftelse; det får svara på frågan
  (artikeln ska ranka) och peka på "prata med oss" om batteri.
- **Allt säljs inkl. installation** (faktabas-gt-produkt §1, "ägarfakta") → paketkravet (material från samma
  utförare) uppfylls per konstruktion. `[FACT src: faktabas-gt-produkt]` (ägarfakta, inte Skatteverket).
- **Sajtpriser = efter grön teknik, inkl. moms, flat ×2** (faktabas-gt-produkt: verifierat på 7 sidor). Laddbox
  fr. 4 190 kr (NexBlue Edge 2), batteri fr. 33 000 kr (Eway); tre batterier (Sonnen/SigenStor/Pixii) passerar
  50 000-taket för en ägare. `[FACT src: faktabas-gt-produkt, live 2026-08-14]`
- **Ampy Nordic AB har F-skatt** (§1.1). Org.nr = [GAP] (§1.1) → behövs inte i kalkylatorn.
- **Ladda bilen (BRF/företag):** kanon §3.4 hade nivåerna som [ASSUMPTION]; Naturvårdsverket bekräftar
  2026-09-07: 50 % av bidragsberättigade kostnader, max 15 000 kr per laddpunkt för boende/medlemmar.
  `[FACT src: S18]` → förslag att uppdatera §3.4 (görs av ägaren, inte härifrån).
- **Motorn räknar 0,485** (50 % × 97 %) för batteri (§4.7); sajten flat 50 % → GRIND 1.

**Kalkylatorn får INTE påstå:**
1. Batteriets återbetalningstid (artikeln: "under 4 år"; kanon §6.6: 7–12 år försvarbart; composite-siffror
   förbjudna som headline). Verktyget handlar om avdraget, inte om lönsamhet.
2. "Aldrig ute med pengarna" utan reservationen om skatteutrymmet. **Sant och lagfäst:** avdraget dras på
   fakturan och Ampy (utföraren) ansöker; det är enda sättet att få grön teknik. **Sant men måste sägas:**
   räcker inte skatten kräver Skatteverket tillbaka mellanskillnaden av köparen i slutskatten. Formulering som
   håller: "Avdraget dras direkt på fakturan och vi ansöker hos Skatteverket. Räcker inte din skatt kan
   Skatteverket kräva tillbaka mellanskillnaden i slutskatten."
3. "50 % av hela beloppet/totala kostnaden" utan reservation: resor, frakt och projektering ger inte avdrag;
   vid fast pris räknar Skatteverket 97 % av totalpriset som arbete och material. Skriv "50 % av arbete och
   material".
4. Att laddbox kräver solceller (falskt) eller att batteri klarar sig utan (falskt).
5. Att "resten kan tas via ROT" när grön teknik-taket nås (falskt; samma åtgärd får aldrig båda).
6. Att bostadsrättens "dedikerade" p-plats räcker (kravet är att platsen följer bostadsrätten och inte kan
   sägas upp).
7. Nivåer för Ladda bilen i copy innan §3.4 uppdaterats (nu källbelagt i S18, men kanon säger [ASSUMPTION]).
8. Något om V2G-avdrag utöver att boxen är en laddningspunkt.

---

## GRINDLISTA (ägarfrågor, numrerade; blockerande markerade)

1. **[BLOCKERANDE] 50 % flat eller 48,5 % (97 %-schablonen) i kalkylatorn?** Skatteverket räknar 97 % av
   totalpriset som underlag vid fast pris (S11, S5-exemplet). Sajten visar flat ×2, motorn 0,485. Kalkylatorn
   får en konstant `SCHABLON_ARBETE_MATERIAL = 0.97` och flaggan `fast_pris_schablon`; **ägaren väljer
   default** (rekommendation: fråga användaren "fast totalpris?" med default av, och beskriv schablonen i "Så
   har vi räknat"). Ampys fakturering av övriga kostnader avgör vad som är sant för Ampys egna jobb.
2. **Ampys egen praxis vid fakturering av två installationer samtidigt** (sol + batteri, batteri + laddbox):
   särredovisas de på fakturan som Skatteverket vill (S1)? Krävs för att verktygets "delad pott"-logik ska
   spegla verkligheten.
3. **Växelriktare vid retrofit-batteri:** fakturerar Ampy hybridväxelriktaren som batterimaterial (50 %)? Min
   läsning av S2 säger ja när enbart batteriet installeras, men Skatteverkets förtydligande täcker bara det
   samtidiga fallet (15 %). Ägaren/revisorn bekräftar, annars hedgas i copyn.
4. **Lastbalanserare:** fakturerar Ampy den som del av laddningspunkten (50 %) eller som elcentralsarbete
   (ROT/inget)? Skatteverket nämner den inte (S1, S4). Påverkar laddbox-läget för 95 % av kunderna (§3.4).
5. **Batteri utan sol → ROT-fallback:** hur stor andel av ett Ampy-batterijobb är arbetskostnad, och vilken del
   räknar Ampy som ROT-berättigat elarbete ("dra el", S6)? Utan detta visar verktyget bara "30 % av
   arbetskostnaden" med ett användarinmatat belopp, aldrig ett Ampy-tal.
6. **Neka-policy:** om Skatteverket beslutar om återbetalning från Ampy (GRÖNFL 13 §) för en installation som
   inte gav rätt, fakturerar Ampy kunden mellanskillnaden? (= faktabas [GAP-7].) Styr hedge-texten under
   verdictet.
7. **Fler än två ägare:** ska verktyget tillåta 3+ delägare (lagen tillåter det) eller stanna vid två som
   motorn (§4.7)? Rekommendation: två i UI, "fler ägare: ring oss" som textrad.
8. **Säljer/installerar Ampy solceller?** Avgör om `gt_sol` får en Ampy-CTA eller bara en informations-CTA.
9. **Artikeln /gron-teknik-2026/ behöver tre rättelser** (se Motsägelser nedan) innan kalkylatorn bäddas in,
   annars säger sidan och verktyget olika saker om samma sak.
10. **BP2027-koll:** efter budgetpropositionen för 2027 (sept 2026): någon ändring av satser/tak för 2027?
    Verktyget bör bära årtalet som en konstant (`TAX_YEAR = 2026`).
11. **Ladda bilen-nivåerna i kanon §3.4** ([ASSUMPTION]) kan uppgraderas till [FACT] med S18; ägaren beslutar om
    verktyget får skriva ut "50 %, max 15 000 kr per laddpunkt" i BRF-beskedet.

---

## Motsägelser mot kanon och artikeln

### Mot `ampy-foretagsdata.md`
| Kanon | Skatteverket | Verdict |
|---|---|---|
| §6.5 [GAP] "Standalone-battery-without-solar grön teknik eligibility (Rättslig vägledning page blocked)" | S8 (2023-11-30) + S2: batteri utan anläggning för egenproduktion ger **inte** rätt; utföraren får ingen utbetalning. | **GAP:en är stängd: NEJ.** Kanon-satsen "battery-WITHOUT-solar instead uses ROT 30 % of labour" håller som "kan" (S6). |
| §6.5 "batteri solar-gated" | S8/S2: "anläggning för egenproduktion av förnybar el" (i praktiken sol; formellt även annan förnybar). | Stämmer; ingen ändring. |
| §6.5 "2 owners → 100 000" | S3: fler i hushållet som också äger bostaden kan söka; lagen sätter ingen personantalsgräns. | Stämmer; "två" är ett UI-val, inte ett lagtak (GRIND 7). |
| §4.7 motorn 0,485 (50 % × 97 %) vs sajt flat 50 % | S11/S5: 97 % vid fast pris totalentreprenad. | Intern motsägelse i Ampys eget material, inte mot kanon-satsen → GRIND 1 (redan [GAP-1] i faktabas). |
| §3.4 Ladda bilen "up to 50 %, max 15 000 kr/laddpunkt" [ASSUMPTION] | S18 (granskad 2026-09-07): exakt så. | Kan uppgraderas till [FACT] (GRIND 11). |
| §3.3 "Ampy sells solar?" | Ingen produktsida; §3.1 listar bara laddboxar + batterilagring. | [GAP] kvarstår (GRIND 8). |
| CLAUDE.md regel 2 (candour: stödtjänster = 0) | S7: stödtjänster påverkar inte *rätten till avdraget*. | Ingen konflikt: candour-grinden gäller lönsamhetspåståenden, inte avdragsvillkoret. Verktyget får säga att avdraget inte påverkas av stödtjänster. |

### Mot den levande artikeln /gron-teknik-2026/ (S19, hämtad 2026-09-11)
| Artikeln påstår | Skatteverket | Verdict |
|---|---|---|
| "subventionerar staten 50 % av din totala kostnad för batterisystem och laddboxar" | Underlaget är arbete + material; resor/frakt/projektering utesluts; vid fast pris 97 % av totalpriset (S2, S11). | **Överdrivet.** Skriv "50 % av arbete och material". |
| "Vid kombinerade projekt där taket på 50 000 kr nås kan resterande belopp ibland delvis hanteras via ROT" | 67 kap. 40 § 1 IL och 13 c § 4: samma åtgärd får aldrig både ROT och grön teknik (S2, S13). | **Fel.** Endast *separata* ROT-arbeten (t.ex. elcentral) kan få ROT. Rättas (GRIND 9). |
| FAQ bostadsrätt: "kopplad till din lägenhet eller din dedikerade parkeringsplats" | P-platsen ska höra till bostadsrätten, inte kunna sägas upp och alltid följa med vid försäljning (S2). | **För löst.** "Dedikerad" (tilldelad/hyrd) räcker inte. Håller inte som skrivet (GRIND 9). |
| FAQ: "Logga in på Skatteverkets e-tjänst 'Skattereduktion för grön teknik'. Där kan du se hur mycket avdrag du har kvar" | Tjänsten heter "Mina skattereduktioner för rot, rut och grön teknik" och visar utnyttjat belopp i år och tidigare år (S16, S17). | **Fel namn, rätt idé.** Rätta namnet; "har kvar" följer av utnyttjat mot 50 000. |
| "Om din totala slutskatt … landar på 40 000 kr, är det också den maximala summan du kan få" | Rätt i sak, men gäller skatten *efter* ROT/RUT m.fl. och exklusive pensionsavgift, begravningsavgift, kyrko- och public service-avgift (S2, S13). | **Förenklat.** Verktyget måste räkna med avräkningsordningen. |
| "Du får då bara dra av för hantverkarens timmar" (material köpt själv) | S1/S2: arbetet ger avdrag, materialet inte. | **Rätt.** |
| "Installeras av en certifierad elektriker" som krav för avdraget | Lagen kräver F-skatt hos utföraren (43 §); elsäkerhetskraven är Elsäkerhetsverkets, inte Skatteverkets. | **Blandar två regelverk.** Sant att jobbet kräver behörigt elföretag, men det är inte avdragsvillkoret. |
| "återbetalningstid på under 4 år" (batteri) | Utanför Skatteverket; kanon §6.6 säger 7–12 år. | Ärvs inte av verktyget (redan noterat i 00-grundning §2). |
| Snabbfakta: "Krav för avdrag: … materialet måste köpas från samma företag" | S1/S2/S3. | **Rätt** (för materialdelen). |
| "Ägande: villa, bostadsrätt eller fritidshus, helt eller delvis" | S3. | **Rätt** (ägarlägenhet och byggnad under uppförande saknas men skadar inte). |
| "Grön Teknik-avdraget har en egen 'pott' på 50 000 kr som inte påverkar ditt ROT-utrymme" | S3. | **Rätt**, med tillägget att skatten måste räcka till båda. |
