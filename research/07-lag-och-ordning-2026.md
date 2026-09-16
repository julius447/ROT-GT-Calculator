# 07 · Lag och ordning 2026: rättslig verifiering av skatteutrymmet (Agent A, 2026-09-16)

**Status: KLAR 2026-09-16. Alla åtta avsnitt och hämtloggen är ifyllda.**

Syfte: verifiera eller falsifiera den rättsliga grunden för hur `logik/engine.js` (skatteutrymme()) och
`kalkylator/rakna.js` (beraknaHushall()) räknar fram "tillgängligt avdrag" = max(0, min(50 000, skatteutrymme)
− redan använt), summerat per person. Inkomstår 2026, Sverige. Ingen ny research av villkoren i 01/02, bara
lagstödet i 2026-lydelse plus det som 01/02 missade.

Taggar: `[FACT src: URL, citat]` = källan säger det ordagrant. `[TOLKNING]` = min läsning. `[GAP]` = kunde
inte verifieras, aldrig gissat. Primärkällor för FACT: riksdagen.se (SFS 1999:1229 i gällande lydelse),
skatteverket.se (inkl. Rättslig vägledning 2026), lagen.nu som spegel. Sekundärkällor bara som samstämmighet.

Hämtlogg (vad som faktiskt öppnades, status) ligger sist i dokumentet.

---

## 1. Vilka skatter avdragen får räknas mot (IL 67 kap. 2 § 1 st)

**Källa (primär, gällande lydelse):** riksdagen.se, Inkomstskattelag (1999:1229), "t.o.m. SFS 2026:1393", hämtad
2026-09-16 som fil (3,8 MB) och läst lokalt: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/
Kontrollerad mot originalet SFS 2025:1370 (PDF, svenskforfattningssamling.se/sites/default/files/sfs/2025-12/SFS2025-1370.pdf, utfärdad 2025-11-27).

Lagtexten, ordagrant (andra stycket i 67 kap. 2 §, det är där listan över skatter står):

> "Skattereduktion ska räknas av mot kommunal och statlig inkomstskatt som beräknats enligt 65 kap., mot statlig
> fastighetsskatt enligt lagen (1984:1052) om statlig fastighetsskatt samt mot kommunal fastighetsavgift enligt lagen
> (2007:1398) om kommunal fastighetsavgift. Skattereduktion enligt 5-9 d, 34, 35 och 46-48 §§ ska dock räknas av endast
> mot kommunal inkomstskatt. Skattereduktion för en juridisk person ska räknas av endast mot statlig inkomstskatt.
> Lag (2025:1370)."
> `[FACT src: riksdagen.se IL 67 kap. 2 § 2 st; identiskt i SFS 2025:1370 s. 1]`

Obs: uppdragets numrering "67:2 1 st" avser skattelistan; i lagen ligger **ordningen i första stycket och skattelistan i
andra stycket**. `[FACT src: samma]`

**Poolen** som ROT/RUT och grön teknik får räknas av mot är alltså exakt fyra skatteslag (statlig inkomstskatt omfattar både förvärvs- och kapitalinkomst), inget annat:

| Post | Ingår i poolen? | Grund |
|---|---|---|
| Kommunal inkomstskatt | **Ja** | 67:2 2 st "kommunal ... inkomstskatt som beräknats enligt 65 kap." |
| Statlig inkomstskatt på förvärvsinkomst (20 % över skiktgränsen) | **Ja** | 67:2 2 st + 65 kap. 5 § |
| Statlig inkomstskatt på **kapitalinkomst** (30 %, 65 kap. 7 §) | **Ja** | 67:2 2 st säger "statlig inkomstskatt som beräknats enligt 65 kap." utan undantag för kapital; 65 kap. 7 § är statlig inkomstskatt. `[FACT src: IL 65 kap. 7 §, se citat i avsnitt 1.1]` `[TOLKNING]` på konsekvensen: ränteinkomster, utdelningar, vinst vid bostads-/aktieförsäljning och **ISK-schablonintäkten** (42 kap. 35-42 §§, beskattas som inkomst av kapital) ger alltså **mer** utrymme. Skatteverkets e-tjänst frågar av just det skälet efter kapitalinkomster (01-rot-regelverk §E3). |
| Statlig fastighetsskatt (tomt, byggnad under uppförande, hyreshus m.m.) | **Ja** | 67:2 2 st, lagen (1984:1052) |
| Kommunal fastighetsavgift (småhus max 10 425 kr 2026) | **Ja** | 67:2 2 st, lagen (2007:1398) |
| Allmän pensionsavgift (7 %) | **Nej** | Inte i listan. Är en avgift enligt lagen (1994:1744), inte inkomstskatt enligt 65 kap. Dessutom neutraliseras den av sin egen reduktion (67:4) som ligger **före** ROT i ordningen och alltså äter av poolen. |
| Public service-avgift | **Nej** | Inte i listan (lagen 2018:1893 om finansiering av radio och tv i allmänhetens tjänst). Skatteverket: "Dessa avgifter ska därför alltid betalas." `[FACT src: Skatteverket, se avsnitt 1.2]` |
| Begravningsavgift | **Nej** | Inte i listan (begravningslagen 1990:1144). Samma Skatteverket-citat. |
| Kyrkoavgift / avgift till trossamfund | **Nej** | Inte i listan. Samma Skatteverket-citat. |
| Egenavgifter (enskild näringsidkare) | **Nej** | Inte i listan (socialavgiftslagen 2000:980). `[TOLKNING]` Kalkylatorn räknar inte näringsinkomst alls, så frågan uppstår inte i motorn; Skatteverkets ROT-räknare avvisar näringsidkare (01 §E3). |
| Skatt på ISK/kapital | **Ja, ingår** (se raden om statlig inkomstskatt på kapital) | ISK-schablonintäkten tas upp i inkomstslaget kapital och beskattas med 30 % statlig inkomstskatt (65 kap. 7 §). `[TOLKNING]` |

### 1.1 Stöd i 65 kap. för att kapitalskatten ingår
65 kap. 1 §: "I detta kapitel finns bestämmelser om beräkning av statlig och kommunal inkomstskatt."
65 kap. 3 § 1 st: "För fysiska personer som är obegränsat skattskyldiga under någon del av beskattningsåret är den
kommunala inkomstskatten summan av de skattesatser för kommunalskatt och regionskatt som gäller i hemortskommunen för
beskattningsåret multiplicerad med den beskattningsbara förvärvsinkomsten."
65 kap. 5 § 1 st: "För fysiska personer är den statliga inkomstskatten på beskattningsbara förvärvsinkomster 20 procent
av den del av den beskattningsbara förvärvsinkomsten som överstiger en skiktgräns."
65 kap. 7 §: "För fysiska personer är den statliga inkomstskatten på kapitalinkomster 30 procent av överskottet i
inkomstslaget kapital."
`[FACT src: riksdagen.se IL 65 kap. 1, 3, 5, 7 §§, lydelse t.o.m. SFS 2026:1393]`

`[TOLKNING]` Eftersom 67:2 2 st hänvisar till "statlig inkomstskatt som beräknats enligt 65 kap." utan att undanta 7 §,
ingår kapitalskatten i poolen. Det stämmer med att Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" frågar efter
kapitalinkomster (01-rot-regelverk §E3, K11) och med att Skatteverket beskriver skatten på ISK-schablonintäkten som
inkomstskatt på kapital. Kommunal skatt tas bara ut på **förvärvsinkomst** (65:3), aldrig på kapital, så kapitalinkomster
kan aldrig hjälpa de reduktioner som bara får gå mot kommunal skatt (jobbskatteavdraget m.fl.), men de hjälper ROT/GT.

### 1.2 Skatteverkets egen formulering (samstämmig med lagen)
- FAQ "Hur mycket måste jag tjäna för att kunna utnyttja maximal skattereduktion för rot- och rutarbete?"
  (skatteverket.se, hämtad 2026-09-16, HTTP 200): "Rot- eller rutavdraget räknas av mot kommunal och statlig
  inkomstskatt, statlig fastighetsskatt och kommunal fastighetsavgift." och "Du kan aldrig få skattereduktion för rot-
  eller rutarbete med större belopp än vad du ska betala i slutlig skatt efter det att den slutliga skatten minskats med
  skattereduktionerna för allmän pensionsavgift, arbetsinkomst (jobbskatteavdrag) och underskott av kapital." och
  "Skattereduktion för rot- eller rutarbete medges inte för den del av den slutliga skatten som rör allmän
  pensionsavgift, begravningsavgift och eventuell påförd kyrkoavgift."
  `[FACT src: https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/rotochrutarbete/privatrotochrutarbetefaq/hurmycketmastejagtjanaforattkunnautnyttjamaximalskattereduktionforrotochrutarbete.5.5fc8c94513259a4ba1d800034104.html]`
- Rättslig vägledning 2026.13, "Villkor för rot- och rutavdrag" (öppnad i webbläsare 2026-09-16, www4 blockerar
  curl): "Observera att skattereduktion för rot- och rutarbete inte avräknas mot allmän pensionsavgift,
  begravningsavgift och kyrkoavgift till Svenska kyrkan eller övriga trossamfund och public serviceavgift. Dessa
  avgifter ska därför alltid betalas." `[FACT src: https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/2943.html]`
  Identisk mening för grön teknik i RV 2026.13 "Grön teknik, installation":
  `[FACT src: https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/420580.html]`
- Rättslig vägledning 2026.13, "Vad är en skattereduktion?": "Skattereduktionerna räknas av mot kommunal
  inkomstskatt, statlig inkomstskatt, kommunal fastighetsavgift och statlig fastighetsskatt. Skattereduktionen för
  jobbskatteavdrag, sjukersättning och aktivitetsersättning, förvärvsinkomster samt för personer som bor i vissa
  områden ska dock endast räknas av mot kommunal inkomstskatt." och "En skattereduktion som inte kan utnyttjas får
  inte sparas till kommande beskattningsår." `[FACT src: https://www4.skatteverket.se/rattsligvagledning/edition/2026.13/2937.html]`
- "Belopp och procent inkomstår 2026" (skatteverket.se): "Statlig inkomstskatt på kapitalinkomster är 30 procent."
  och under Allmän pensionsavgift: "Obs! Du kan inte få högre skattereduktion än summan av din kommunala
  inkomstskatt, statliga inkomstskatt, fastighetsskatt och fastighetsavgift. Skattereduktionen får alltså inte
  räknas av mot till exempel den allmänna pensionsavgiften." Public service-avgift 2026: "Maxbelopp per person och år:
  1 184 kronor." Begravningsavgift 2026: "0,292 procent" (Stockholm 0,07 %, Tranås 0,285 %).
  `[FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html]`

Samma sida bekräftar motorns parametrar: prisbasbelopp 59 200 kr; skiktgräns 643 000 kr (brytpunkt 660 400 under 66,
760 500 för 66+); allmän pensionsavgift 7 %, högst 47 100 kr; kommunal fastighetsavgift småhus 0,75 %, högst
10 425 kr, ingen avgift de första 15 åren för småhus byggda 2012 eller senare; genomsnittlig kommunal skattesats
32,38 %; grundavdrag 25 100 / 45 600 / 17 400 (under 66) och 65 800 vid låga inkomster (66+). `[FACT src: samma]`
= `PARAMS_2026` i engine.js rad 26-34. **Stämmer.**


## 2. Avräkningsordningen 2026 (IL 67 kap. 2 § 1 st) och vad som bara får räknas mot kommunal skatt

Ordagrant, första stycket:

> "2 § Skattereduktion ska göras för sjöinkomst, allmän pensionsavgift, arbetsinkomst (jobbskatteavdrag), sjukersättning
> och aktivitetsersättning, förvärvsinkomst, boende i vissa områden (regional skattereduktion), underskott av kapital,
> hushållsarbete, installation av grön teknik, gåva och avgift till arbetslöshetskassa i nu nämnd ordning."
> `[FACT src: riksdagen.se IL 67 kap. 2 § 1 st, lydelse t.o.m. SFS 2026:1393; identiskt i SFS 2025:1370]`

**Lagkedjan bakom 2026-lydelsen (verifierad i original-PDF:erna):**
- SFS 2025:539 (utfärdad 2025-05-22, prop. 2024/25:109): upphävde 67 kap. 27-33 §§ (mikroproduktion av förnybar el) och
  skrev om 67:2 utan "mikroproduktion". Ikraftträdande: "1. Denna lag träder i kraft den 1 januari 2026."
  `[FACT src: svenskforfattningssamling.se/sites/default/files/sfs/2025-05/SFS2025-539.pdf]`
- SFS 2025:1370 (utfärdad 2025-11-27, prop. 2025/26:1): "föreskrivs att 67 kap. 1 och 2 §§ inkomstskattelagen (1999:1229)
  i stället för lydelsen enligt lagen (2025:539) om ändring i den lagen ska ha följande lydelse" och lägger till meningen
  om juridiska personer (gåva från företag). Ordningen är oförändrad mot 2025:539. Träder i kraft med 2025:539, dvs
  2026-01-01. `[FACT src: SFS2025-1370.pdf]` `[TOLKNING]` på ikraftträdandet (2025:1370 har inga egna
  övergångsbestämmelser, den ersätter lydelsen i 2025:539 som träder i kraft 2026-01-01).
- Inget i 67 kap. 2 § har ändrats under 2026: den senaste ändringslagen i konsolideringen, SFS 2026:1393, träder i kraft
  2029-01-01 och rör CSN-kompensation, inte 67 kap. `[FACT src: riksdagen.se, övergångsbestämmelser till 2026:1393:
  "Denna lag träder i kraft den 1 januari 2029."]`

**Ordningen i klartext, med vad varje reduktion får räknas mot:**

| # | Reduktion | Paragraf | Får räknas mot |
|---|---|---|---|
| 1 | Sjöinkomst | 67:3 | hela poolen |
| 2 | Allmän pensionsavgift | 67:4 | hela poolen |
| 3 | Arbetsinkomst (jobbskatteavdrag) | 67:5-9 | **endast kommunal inkomstskatt** |
| 4 | Sjukersättning och aktivitetsersättning | 67:9 a-9 d | **endast kommunal inkomstskatt** |
| 5 | Förvärvsinkomst (max 1 500 kr) | 67:46-48 | **endast kommunal inkomstskatt** |
| 6 | Boende i vissa områden (regional, 1 675 kr) | 67:34-35 | **endast kommunal inkomstskatt** |
| 7 | Underskott av kapital (30 %/21 %) | 67:10 | hela poolen |
| 8 | **Hushållsarbete (ROT/RUT)** | 67:11-19 | hela poolen |
| 9 | **Installation av grön teknik** | 67:36-45 | hela poolen |
| 10 | Gåva | 67:20-26 a | hela poolen |
| 11 | Avgift till arbetslöshetskassa (25 %) | 67:49-52 | hela poolen |

`[FACT src: 67:2 2 st: "Skattereduktion enligt 5-9 d, 34, 35 och 46-48 §§ ska dock räknas av endast mot kommunal
inkomstskatt."]` Att förvärvsinkomstreduktionen (46-48 §§) och den regionala (34-35 §§) bara går mot kommunal skatt
står alltså i lagen, inte bara i Rättslig vägledning.

**Skattereduktionen för kommunal fastighetsavgift för pensionärer (lagen 2008:826)** ligger utanför 67 kap. och
utanför denna lista; den begränsar själva fastighetsavgiften (till 4 % av inkomsten, med golv) och slår därmed
igenom som en mindre fastighetsavgift i poolen innan 67 kap. tillämpas. `[TOLKNING]` Motorn modellerar den inte
(se avsnitt 7). Rättslig vägledning 2026 nämner den först i sin ordningsuppräkning (01-rot-regelverk §E2, K13);
det är inte en motsägelse mot 67:2 utan en annan lag. `[TOLKNING]`

**Konsekvens för motorn:** `skatteutrymme()` drar pensionsavgift, jobbskatteavdrag, förvärvsinkomstreduktion och
underskott av kapital från poolen och lämnar resten till ROT/RUT och därefter grön teknik. Det följer 67:2 i rätt
ordning för de reduktioner som modelleras. Sjöinkomst (#1), sjuk-/aktivitetsersättning (#4) och regional (#6)
modelleras inte; gåva (#10) och a-kassa (#11) ligger efter och påverkar inte ROT/GT-utrymmet. `[TOLKNING]` Se
avsnitt 7 för storleksordningar.


## 3. ROT/RUT: personkrav, bostad, tak, sats, fakturamodellen (IL 67 kap. 11-19 §§, Lag 2009:194)

Alla citat nedan ur riksdagen.se, IL lydelse t.o.m. SFS 2026:1393 respektive Lag (2009:194) om förfarandet vid
skattereduktion för hushållsarbete (HUSFL), lydelse t.o.m. SFS 2025:324, båda hämtade som fil 2026-09-16:
https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2009194-om-forfarandet-vid-skattereduktion_sfs-2009-194/

### 3.1 Personkraven, 67 kap. 11 §
> "11 § Rätt till skattereduktion enligt 12-19 §§ har efter begäran de som
> 1. vid beskattningsårets utgång har fyllt 18 år,
> 2. är obegränsat skattskyldiga under någon del av beskattningsåret, och
> 3. har haft utgifter för utfört hushållsarbete, fått förmån av hushållsarbete som ska tas upp i inkomstslaget tjänst
> eller har redovisat ersättning för utfört hushållsarbete i en förenklad arbetsgivardeklaration.
> Sådan rätt till skattereduktion har efter begäran också de som är begränsat skattskyldiga enligt 3 kap. 18 § första
> stycket 1, 2 eller 3, om deras överskott av förvärvsinkomster i Sverige och i andra länder, uteslutande eller så gott
> som uteslutande, utgörs av överskott av förvärvsinkomster i Sverige.
> Även dödsbon har efter begäran rätt till skattereduktion för hushållsarbete som har utförts före dödsfallet.
> Lag (2020:1068)."
> `[FACT src: IL 67 kap. 11 §]`

Kalkylatorns fråga "Har du fyllt 18 år?" med förklaringen "senast vid årets slut" (rakna.js rad 69: "Du behöver ha fyllt
18 år senast vid årets slut") motsvarar "vid beskattningsårets utgång har fyllt 18 år". **Stämmer.** `[FACT]`
Skattskyldigheten (obegränsat skattskyldig någon del av året) frågas inte; för en svensk privatkund är den uppfylld.
`[TOLKNING]` Se öppen fråga i avsnitt 8.

### 3.2 Bostad, ägande, hushåll, 67 kap. 13 a-15 §§
> "13 a § Som hushållsarbete räknas vid tillämpningen av detta kapitel även reparation, underhåll samt om- och
> tillbyggnad av ett småhus eller en ägarlägenhet som ägs av den som begär skattereduktion. Med ägare avses även den
> som enligt 1 kap. 5 § fastighetstaxeringslagen (1979:1152) ska likställas med ägare. Lag (2009:536)."
> "13 b § Som hushållsarbete räknas vid tillämpningen av detta kapitel även reparation, underhåll samt om- och
> tillbyggnad av en lägenhet som upplåtits med bostadsrätt om följande förutsättningar är uppfyllda:
> 1. Lägenheten innehas av den som begär skattereduktion.
> 2. Arbetet utförs i lägenheten och det avser sådana åtgärder som bostadsrättshavaren svarar för. [...]"
> "15 § För rätt till skattereduktion krävs att det utförda hushållsarbetet är hänförligt till den som begär
> skattereduktion eller dennes förälders hushåll. Föräldern ska dock vara bosatt i Sverige. [...]"
> `[FACT src: IL 67 kap. 13 a, 13 b, 15 §§]`

Två krav som måste vara uppfyllda samtidigt för ROT: **äga** (13 a/13 b: "ägs av den som begär", "innehas av den som
begär") och **hushåll** (15 §: arbetet hänförligt till den sökandes eller förälderns hushåll). Lagen har ingen
regel om att makar/sambor får låna varandras rätt; den som inte äger kan inte begära ROT. `[FACT]` + `[TOLKNING]`
Kalkylatorns första fråga "äger du bostaden" och stoppet "Eftersom du inte äger din bostad har du inte rätt till
ROT-avdrag" följer 13 a/13 b. **Stämmer.** (Att den svarande också bor där antas, jfr rakna.js rad 58-59.)

### 3.3 Taket, 67 kap. 19 § (2026-lydelsen)
> "19 § Skattereduktionen uppgår till
> 1. belopp motsvarande den preliminära skattereduktion som avses i 18 § första stycket 1,
> 2. 50 procent av underlaget enligt 18 § första stycket 2 till den del det avser sådant hushållsarbete som anges i
> 13 § och 30 procent av underlaget till den del det avser annat hushållsarbete, och
> 3. belopp motsvarande de arbetsgivaravgifter i fråga om sådan ersättning för hushållsarbete som har redovisats i en
> förenklad arbetsgivardeklaration enligt 18 § första stycket 3.
> Den sammanlagda skattereduktionen får uppgå till högst 75 000 kronor för ett beskattningsår. Skattereduktionen för
> sådant hushållsarbete som anges i 13 a och 13 b §§ får dock uppgå till högst 50 000 kronor för ett beskattningsår.
> Lag (2025:322)."
> `[FACT src: IL 67 kap. 19 §]`

Ikraftträdande för 2025:322: "1. Denna lag träder i kraft den 1 januari 2026. 2. Lagen tillämpas första gången på
hushållsarbete som har betalats [...] efter den 31 december 2025." `[FACT src: riksdagen.se, övergångsbestämmelser IL,
2025:322]` Motorns `ROT_TAK: 50_000` och `ROT_RUT_TAK: 75_000` **stämmer** med 2026-lydelsen.

**Observera vad 19 § p.1 säger:** vid fakturamodellen är ROT-avdraget i deklarationen = "belopp motsvarande den
preliminära skattereduktion" (det Skatteverket betalat ut till företaget). Procentsatsen 30 % står inte i 19 § för det
fallet; 30 % i 19 § p.2 gäller bara förmån av hushållsarbete. Satsen för fakturamodellen sitter i stället i HUSFL 7 §
(tre sjundedelar av vad kunden betalat, se 3.4). `[FACT src: IL 67:19, HUSFL 7 §]` `[TOLKNING]`: 3/7 av 70 % = 30 % av
arbetskostnaden.

### 3.4 Satsen 30 % 2026, och att 50 % från 2025 är slut
HUSFL 7 § 2 st, 2026-lydelsen (Lag 2025:324, i kraft 2026-01-01):
> "Utbetalning får dock uppgå till högst
> 1. samma belopp som köparen har betalat om den avser sådant hushållsarbete som anges i 67 kap. 13 § inkomstskattelagen
> (1999:1229), och
> 2. tre sjundedelar av det belopp som köparen har betalat om den avser annat hushållsarbete."
> `[FACT src: HUSFL 7 §, riksdagen.se lydelse t.o.m. 2025:324]`

"Annat hushållsarbete" = ROT (13 a/13 b). 3/7 av köparens betalning: betalar kunden 70 % är utbetalningen 30 % av
totalen. **30 % för ROT 2026: bekräftat.** `[FACT]` + `[TOLKNING]` på räkneexemplet.

Hela kedjan för det tillfälliga 50 %-året, läst i original-PDF:erna på svenskforfattningssamling.se (alla utfärdade
2025-05-08, prop. 2024/25:156, bet. 2024/25:FiU32):
- **SFS 2025:323** (HUSFL 7 §, tillfällig): "Utbetalning får dock uppgå till högst samma belopp som köparen har
  betalat." (= 50 % även för ROT) "1. Denna lag träder i kraft den 12 maj 2025. 2. Lagen tillämpas första gången för
  beskattningsår som börjar efter den 31 december 2024." `[FACT src: svenskforfattningssamling.se/sites/default/files/sfs/2025-05/SFS2025-323.pdf]`
- **SFS 2025:321** (IL 67:19, tillfällig): "2. 50 procent av underlaget enligt 18 § första stycket 2" utan
  30 %-delen; i kraft 2025-05-12, "efter den 11 maj 2025". `[FACT src: SFS2025-321.pdf]`
- **SFS 2025:324** (HUSFL 7 §, återgång): "tre sjundedelar av det belopp som köparen har betalat om den avser annat
  hushållsarbete" och "1. Denna lag träder i kraft den 1 januari 2026. 2. Lagen tillämpas första gången för
  beskattningsår som börjar efter den 31 december 2025." `[FACT src: SFS2025-324.pdf]`
- **SFS 2025:322** (IL 67:19, återgång): "30 procent av underlaget till den del det avser annat hushållsarbete";
  "1. Denna lag träder i kraft den 1 januari 2026. 2. Lagen tillämpas första gången på hushållsarbete som har
  betalats [...] efter den 31 december 2025." `[FACT src: SFS2025-322.pdf]`

Den tillfälliga höjningen upphörde alltså med utgången av 2025; ROT-arbete som **betalas** 2026-01-01 eller senare får
30 %, oavsett när det utfördes. `[FACT]` + `[TOLKNING]` på "betalas", grundat i IL 67:12 ("det beskattningsår då
utgifter för utfört hushållsarbete har betalats") och 2025:322 p.2.

### 3.5 Fakturamodellen förklarad enkelt (HUSFL 6-8, 11, 17, 19 §§; SFL 56 kap. 9 §)
Så här hänger det ihop, i lagens egna ord:

1. **Företaget drar av på fakturan och begär resten av Skatteverket.** HUSFL 6 §: "Om den som kan ha rätt till
   skattereduktion för hushållsarbete (köparen) inte har betalat hela utgiften för hushållsarbetet, får en sådan
   utförare [...] begära utbetalning från Skatteverket enligt 8 §." HUSFL 8 §: "Utbetalning får begäras efter det att
   hushållsarbetet har utförts och betalats. Begäran ska lämnas elektroniskt och ska ha kommit in till Skatteverket
   senast den 31 januari året efter det beskattningsår då arbetet betalades." `[FACT src: HUSFL 6, 8 §§]`

2. **Vad Skatteverket kontrollerar vid utbetalningen: bara taket per person, inte skatteutrymmet.** HUSFL 7 § 3 st:
   "Utbetalning får inte ske till den del köparens sammanlagda preliminära skattereduktion enligt 17 § skulle uppgå till
   ett belopp som överstiger 75 000 kronor för ett beskattningsår. Utbetalning får inte ske till den del den preliminära
   skattereduktionen för sådant hushållsarbete som anges i 67 kap. 13 a och 13 b §§ inkomstskattelagen skulle överstiga
   50 000 kronor för ett beskattningsår. Lag (2025:324)." `[FACT src: HUSFL 7 §]` Det finns **ingen** bestämmelse i HUSFL
   som låter Skatteverket vägra utbetalning för att köparens skatt inte räcker; utbetalningen är en preliminär åtgärd
   och skatten är inte känd förrän deklarationen. `[TOLKNING]` Skatteverket säger detsamma till företag: "Det är bara
   din kund som kan ta reda på hur mycket skattereduktion hen har kvar." (02-gron-teknik §E, S5.) Kontrollen vid
   utbetalning omfattar dessutom formkraven (F-skatt, e-betalning, personnummer, fastighetsbeteckning, arbetets art,
   HUSFL 9-9 a §§, IL 67:15 a-16). `[FACT src: HUSFL 9, 9 a §§]`

3. **"Preliminär skattereduktion" = det Skatteverket betalat ut till företaget.** HUSFL 17 § 1 st: "Köparen ska
   tillgodoräknas preliminär skattereduktion med 1. ett belopp motsvarande den utbetalning som Skatteverket enligt 11 §
   beslutat om till utföraren [...]". 3 st: "Den preliminära skattereduktionen får sammanlagt uppgå till högst 75 000
   kronor för ett beskattningsår. Den preliminära skattereduktionen för sådant hushållsarbete som anges i 67 kap. 13 a
   och 13 b §§ inkomstskattelagen (1999:1229) får uppgå till högst 50 000 kronor för ett beskattningsår. Lag (2024:419)."
   `[FACT src: HUSFL 17 §]` Köparen får ett skriftligt meddelande om beloppet (HUSFL 19 §) och kan när som helst begära
   "ett särskilt meddelande om den totala preliminära skattereduktionen" (19 § sista st). `[FACT src: HUSFL 19 §]`

4. **Vid deklarationen blir det preliminära slutligt, men bara så långt skatten räcker.** IL 67:19 p.1 ger
   skattereduktion med "belopp motsvarande den preliminära skattereduktion", och IL 67:2 2 st säger att reduktionen
   "ska räknas av mot" de fyra skatterna i poolen, i den ordning 67:2 1 st anger. Finns ingen skatt kvar när turen
   kommer till hushållsarbete blir den slutliga reduktionen lägre än den preliminära. `[FACT src: IL 67:2, 67:19]`

5. **Kvarskatten uppstår i slutskatteberäkningen.** SFL 56 kap. 9 §: "Till den slutliga skatten ska följande belopp
   läggas: [...] 3. preliminär skattereduktion enligt 17 § lagen (2009:194) om förfarandet vid skattereduktion för
   hushållsarbete, 4. preliminär skattereduktion enligt 16 § lagen (2020:1066) om förfarandet vid skattereduktion för
   installation av grön teknik, [...]" `[FACT src: riksdagen.se, Skatteförfarandelag (2011:1244) 56 kap. 9 §, lydelse
   t.o.m. SFS 2026:1305]` Med andra ord: hela det belopp företaget fick av Skatteverket läggs tillbaka som en pluspost,
   och den slutliga skattereduktionen (begränsad av poolen) dras av. Räcker skatten är nettot noll; räcker den inte blir
   skillnaden kvarskatt för köparen. Företaget behåller sina pengar. `[TOLKNING]` Skatteverket (RV): "Skulle däremot
   köparen ha mindre skatt att betala än det belopp som den preliminära skattereduktionen uppgår till resulterar det i
   en tillkommande post vid beräkningen av slutskatten" (02-gron-teknik §D, S2; samma mekanik för ROT).

**Sammanfattning för ägaren, utan jargong:** Skatteverket betalar ut till Ampy så länge kunden inte redan har passerat
50 000 kr ROT (75 000 kr ROT+RUT) i år. Om kundens skatt sedan inte räcker till får kunden, inte Ampy, betala
tillbaka mellanskillnaden i slutskattebeskedet (december året efter). Därför är kalkylatorns "tillgängligt avdrag"
= min(tak − redan använt, skatteutrymme) rätt fråga att ställa: taket är Skatteverkets spärr vid utbetalning,
skatteutrymmet är kundens verkliga risk. `[TOLKNING]`


## 4. Grön teknik (IL 67 kap. 36-45 §§, Lag 2020:1066)

Placeringen 36-45 §§ gäller oförändrat 2026 (rubriken "Installation av grön teknik" följer direkt efter 35 a §).
`[FACT src: riksdagen.se IL 67 kap.]` GRÖNFL = Lag (2020:1066) om förfarandet vid skattereduktion för installation
av grön teknik, lydelse t.o.m. SFS 2025:541, hämtad som fil 2026-09-16:
https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20201066-om-forfarandet-vid-skattereduktion_sfs-2020-1066/

### 4.1 Vem, 67 kap. 36 §
> "36 § Rätt till skattereduktion enligt 37-45 §§ har efter begäran de som
> 1. vid beskattningsårets utgång har fyllt 18 år,
> 2. är obegränsat skattskyldiga under någon del av beskattningsåret, och
> 3. har haft utgifter för utförd installation av grön teknik. [...]
> Utgifterna för installation av grön teknik utgörs av det debiterade beloppet för arbete och material inklusive
> mervärdesskatt. Lag (2020:1068)."
> `[FACT src: IL 67 kap. 36 §]`
Samma 18-årsregel som ROT (ordagrant lika). Kalkylatorns 18-årsfråga gäller alltså båda lägena. **Stämmer.**

### 4.2 Bostad och ägande, 67 kap. 39 och 41 §§
> "39 § Som installation av grön teknik räknas bara installation som är hänförlig till
> 1. ett småhus eller en ägarlägenhet som ägs av den som begär skattereduktion,
> 2. en lägenhet som upplåtits med bostadsrätt och som innehas av den som begär skattereduktion, eller
> 3. en byggnad under uppförande som ägs av den som begär skattereduktion och som när den är uppförd ska vara ett
> småhus eller en ägarlägenhet. [...]"
> "41 § För rätt till skattereduktion för en installation hänförlig till ett småhus, en ägarlägenhet eller en lägenhet
> som upplåtits med bostadsrätt krävs att den utförda installationen är hänförlig till hushållet för den som begär
> skattereduktion eller dennes förälder. Föräldern ska dock vara bosatt i Sverige. [...]"
> `[FACT src: IL 67 kap. 39, 41 §§]`
Äga + hushåll, som för ROT. Kalkylatorns stopp för icke-ägare i GT-läget **stämmer**. Ingen femårsregel för grön
teknik (13 c § p.5 gäller bara hushållsarbete; 40 § listar inget om husets ålder), och byggnad under uppförande
är uttryckligen tillåten (39 § p.3). `[FACT]` Kalkylatorn visar därför rätt i att femårsnoten bara visas i ROT-läget
(rakna.js rad 72: `mode === 'rot' && !aldre`). **Stämmer.**

### 4.3 Vad, 67 kap. 38 §, och satserna 2026 (GRÖNFL 7 §)
38 § 1 st definierar de tre kategorierna (1. nätanslutet solcellssystem, 2. system för lagring av egenproducerad
elenergi kopplat till egenproduktion, 3. laddningspunkt till elfordon med typ 2/Combo-uttag). `[FACT src: IL 67:38]`
Procentsatserna står **inte** i IL. IL 67:45: "Skattereduktionen uppgår till belopp motsvarande den preliminära
skattereduktion som avses i 44 §. Den sammanlagda skattereduktionen får uppgå till högst 50 000 kronor för ett
beskattningsår. Lag (2020:1068)." `[FACT src: IL 67:45]` Satsen sitter i utbetalningstaket, GRÖNFL 7 § 2 st:
> "Utbetalningen får dock uppgå till högst
> 1. tre sjuttondelar av det belopp som köparen har betalat om utbetalningen avser sådan installation som anges i
> 67 kap. 38 § första stycket 1 inkomstskattelagen (1999:1229), och
> 2. samma belopp som köparen har betalat om utbetalningen avser sådan installation som anges i 67 kap. 38 § första
> stycket 2 eller 3 samma lag.
> Utbetalning får inte ske till den del köparens sammanlagda preliminära skattereduktion enligt 16 § skulle uppgå till
> ett belopp som överstiger 50 000 kronor för ett beskattningsår. Lag (2025:541)."
> `[FACT src: GRÖNFL 7 §]`
`[TOLKNING]` 3/17 av köparens 85 % = 15 % av underlaget (sol); "samma belopp som köparen har betalat" = 50/50 (lagring,
laddningspunkt). Motorns `GT_RATE: { gt_laddbox: 0.50, gt_batteri: 0.50, gt_sol: 0.15 }` **stämmer** med 2026-lydelsen.
Kanonens satser (CLAUDE.md regel 5) bekräftas alltså av lagen; ingen webb-satskoll utöver detta.

**Ändringen 20 → 15 % för sol:** GRÖNFL övergångsbestämmelser "2025:541 1. Denna lag träder i kraft den 1 juli 2025.
2. Lagen tillämpas första gången på utbetalning som avser sådan installation som har slutbetalats efter den 30 juni
2025. 3. Äldre föreskrifter gäller fortfarande för utbetalning som avser sådan installation som har betalats eller
slutbetalats före ikraftträdandet." `[FACT src: GRÖNFL övergångsbestämmelser]` Slutbetalning 2025-06-30 eller
tidigare: 20 %; slutbetalning 2025-07-01 eller senare: 15 %. För 2026 gäller 15 % hela året. `[TOLKNING]`

### 4.4 Tak 50 000 kr per person och år, och efter ROT/RUT i ordningen
IL 67:45 2 st (ovan) och GRÖNFL 16 § 3 st: "Den preliminära skattereduktionen får sammanlagt uppgå till högst 50 000
kronor för ett beskattningsår." `[FACT src: GRÖNFL 16 §]` Taket är per skattskyldig (den som "begär"), inte per bostad
eller hushåll, och gemensamt för sol + lagring + laddningspunkt. `[FACT src: IL 67:45 "Den sammanlagda"]`
Ordningen: "hushållsarbete, installation av grön teknik" i 67:2 1 st, dvs grön teknik prövas mot den skatt som är kvar
efter ROT/RUT. `[FACT src: IL 67:2]` Se avsnitt 2.

### 4.5 Betalningsårsregeln ("slutbetalats", från 2025)
IL 67:37: "En begäran om skattereduktion för installation av grön teknik ska göras i inkomstdeklarationen för det
beskattningsår då utgifter för installation av grön teknik har slutbetalats. Lag (2024:1131)." Övergångsbestämmelse
2024:1131 p.8: "Bestämmelsen i 67 kap. 37 § tillämpas första gången för begäran om skattereduktion för grön teknik som
avser sådan installation som har slutbetalats efter den 31 december 2024." `[FACT src: IL 67:37 + övergångsbest.
2024:1131]` GRÖNFL 8 §: "Utbetalning får begäras efter det att installationen av grön teknik har utförts och
slutbetalats. Begäran ska lämnas elektroniskt och ska ha kommit in till Skatteverket senast den 31 januari året efter
det beskattningsår då arbetet slutbetalades." `[FACT src: GRÖNFL 8 §]`
Skillnad mot ROT: ROT följer **betalningsdagen per betalning** (IL 67:12 "har betalats"; HUSFL 8 § "då arbetet
betalades"), grön teknik följer **slutbetalningen** för hela installationen. `[FACT]` + `[TOLKNING]`

### 4.6 Fakturamodellen för grön teknik (GRÖNFL 6-8, 10, 16, 18 §§)
Samma konstruktion som HUSFL: utföraren begär utbetalning (6, 8 §§), Skatteverket spärrar bara mot 50 000-taket
(7 § 3 st), köparen tillgodoräknas preliminär skattereduktion "med ett belopp motsvarande den utbetalning som
Skatteverket enligt 10 § beslutat om till utföraren" (16 §), köparen underrättas skriftligt (18 §), beloppet läggs
tillbaka i slutskatteberäkningen (SFL 56 kap. 9 § p.4) och den slutliga reduktionen begränsas av poolen (IL 67:2,
67:45). `[FACT src: GRÖNFL 6-8, 10, 16, 18 §§; SFL 56:9]` Skillnaden mot ROT: för grön teknik finns ingen väg via
deklarationen utan fakturamodell (IL 67:44 bygger underlaget enbart på preliminär skattereduktion enligt GRÖNFL 16 §),
vilket 02-gron-teknik §F redan slagit fast. `[FACT src: IL 67:44]`


## 5. Hushållsmekaniken: eget tak, eget utrymme, ägare, delning, "redan använt"

### 5.1 Taket och utrymmet är per person, aldrig per bostad eller hushåll
- Lagen: 67:19 2 st "för ett beskattningsår" gäller "den som begär skattereduktion" (13 a §, 11 §); HUSFL 7 § 3 st
  och 17 § 3 st talar om "köparens sammanlagda preliminära skattereduktion". Samma konstruktion för grön teknik
  (67:45, GRÖNFL 7 § 3 st, 16 § 3 st). `[FACT src: IL 67:11, 13 a, 19, 45; HUSFL 7, 17; GRÖNFL 7, 16]`
- Skatteverket RV 2026.13 "Villkor för rot- och rutavdrag": "Den sammanlagda skattereduktionen för rot- och
  rutarbete får uppgå till högst 75 000 kr per person och beskattningsår. Av detta får dock skattereduktion för
  rotarbete som högst uppgå till 50 000 kr. Det finns ingen begränsning av skattereduktionen per bostad. Det innebär
  att alla som hyr eller är delägare till ett småhus, ägarlägenhet eller bostadsrätt kan få skattereduktion.
  Ägarandelen har inte heller någon betydelse för hur stor skattereduktionen kan bli. Observera dock att bostaden
  måste finnas i köparens hushåll för att denne ska kunna få skattereduktion. För att få rotavdrag krävs dessutom att
  köparen äger bostaden." `[FACT src: RV 2943.html]`
- Skatteverkets exempel "Familjen Ek": föräldrar 25 % vardera, fem barn 10 % vardera, arbetskostnad 450 000 kr →
  "kan de få skattereduktion på sammanlagt 135 000 kr (30 procent av 450 000 kr) [...] Det finns ingen begränsning av
  beloppet per bostad, men däremot per person. Ägarandelen har ingen betydelse." `[FACT src: RV 2943.html]`
- Skatteutrymmet är per definition individuellt: 67:2 2 st räknar av mot **den skattskyldiges** skatt (65 kap. 3 §
  "den beskattningsbara förvärvsinkomsten" för "fysiska personer"). Sambeskattning finns inte. `[FACT]` + `[TOLKNING]`

→ Motorns modell "varje person eget tak (50 000) och eget skatteutrymme; summan är hushållets" (rakna.js rad 59-61,
85-88) **stämmer** med lagen, med förbehållet i 5.2.

### 5.2 Makar/sambor: bara den som äger får ROT/GT
- IL 67:13 a "ägs av den som begär skattereduktion", 13 b "innehas av den som begär", 67:39 samma för grön teknik.
  `[FACT src: IL]`
- Skatteverkets exempel "Leila och Ali" (RV 2943.html): "Huset ägs av Leila. [...] Den del som avser rotarbete kan
  inte överföras till Ali eftersom han inte äger huset och därmed inte uppfyller villkoren för skattereduktion för
  rotarbete." `[FACT src: RV 2943.html]`
- skatteverket.se "Så fungerar rotavdraget": "Om ni är två eller flera ägare som nyttjar bostaden kan ni dela på
  rotavdraget. Sammanlagt kan dock rotavdraget aldrig bli högre än 30 procent av den totala arbetskostnaden. För att
  få rotavdrag ska du faktureras eller betala för arbetet." och "Om du redan har utnyttjat hela eller delar av ditt
  rotavdrag, kan företaget ansöka om utbetalning för någon annan i hushållet som också äger bostaden."
  `[FACT src: https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/safungerarrotavdraget.html]`
- Grön teknik, samma: "Om du redan har utnyttjat hela eller delar av ditt avdrag, kan du be företaget att ansöka om
  skattereduktion för någon annan i hushållet som också äger bostaden." och "Om flera personer ska dela på
  skattereduktionen bör det framgå på fakturan hur mycket varje person ska få i avdrag."
  `[FACT src: https://www.skatteverket.se/privat/fastigheterochbostad/gronteknik/safungerarskattereduktionenforgronteknik.4.676f4884175c97df4192870.html]`

→ **Diff mot motorn:** kalkylatorn frågar bara den svarande om ägande ("äger du bostaden") och antar att övriga
personer i hushållet "bo i bostaden och uppfyller villkoren" (rakna.js rad 58-59). En make/sambo som **inte står som
ägare** (vanligt när bara en står på lagfarten/bostadsrätten) får i verkligheten 0 kr ROT/GT, men kalkylatorn ger
hen 50 000 kr. Det är en **överskattning** på upp till 50 000 kr per sådan person. Se avsnitt 7. `[TOLKNING]`

### 5.3 Delägare som tar hela fakturan: ja
- "Ägarandelen har inte heller någon betydelse för hur stor skattereduktionen kan bli" (RV 2943.html) och exemplet
  Ek. `[FACT]` En 10 %-ägare kan alltså ta ett avdrag som svarar mot hela arbetskostnaden, upp till sitt eget tak, om
  hen "har haft utgiften" (67:11 p.3) och står på fakturan eller betalar. `[FACT src: IL 67:11; skatteverket.se
  "Du ska faktureras för arbetet och/eller ha utgiften för arbetet"]` `[TOLKNING]` på sammanvägningen.

### 5.4 Dela en faktura mellan ägare
- Fördelningen är fri och ska framgå av fakturan/begäran: HUSFL 9 § p.2 kräver köparens personnummer per begäran;
  Skatteverket: "Om flera personer ska dela på skattereduktionen bör det framgå på fakturan hur mycket varje person
  ska få i avdrag." (grön teknik-sidan) `[FACT src: HUSFL 9 §; skatteverket.se grön teknik]`
- Omfördelning i efterhand (ROT/RUT): "Personer som tillhör samma hushåll och som gemensamt har låtit utföra ett rot-
  eller rutarbete kan omfördela avdraget mellan sig om det visar sig att en av personerna inte kan utnyttja sin del av
  avdraget. Den person som övertar ett rot- eller rutavdrag måste också uppfylla villkoren för rot- eller rutavdrag."
  och "Omfördelning av skattereduktionen kan även ske mellan köpare som inte har hushållsgemenskap. Alla villkor måste
  då vara uppfyllda för den som skattereduktionen omfördelas till." `[FACT src: RV 2943.html]` Skatteverket.se
  "Rot- och rutavdrag i deklarationen" beskriver hur (e-tjänsten: Ändra → Skattereduktioner rotarbete eller rutarbete;
  papper: Övriga upplysningar) och att "Omfördelar du avdraget kommer du fortfarande att behöva betala tillbaka den
  eventuella kvarskatt som du har fått." `[FACT src: https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/rotochrutavdragideklarationen.4.15532c7b1442f256baeae3e.html]`

### 5.5 "Redan använt" = preliminära reduktioner i år, och var kunden ser dem
- Lagen: HUSFL 17 § (preliminär skattereduktion tillgodoräknas löpande) och 18 § "i den ordning som belopp [...]
  registreras av Skatteverket"; HUSFL 19 § sista st: "Skatteverket ska på begäran av köparen lämna denne ett särskilt
  meddelande om den totala preliminära skattereduktionen som tillgodoräknats enligt 17 §." Motsvarande GRÖNFL 16-18 §§.
  `[FACT src: HUSFL 17-19 §§; GRÖNFL 16-18 §§]`
- Skatteverket.se: "Det är bara du själv som kan ta reda på hur mycket rotavdrag du har kvar att utnyttja under året.
  I e-tjänsten Mina skattereduktioner för rot, rut och grön teknik kan du se hur mycket avdrag du har utnyttjat i år
  och även tidigare år. Om du inte har e-legitimation kan du få ett intyg hemskickat. Tänk på att uppgifterna bara tar
  hänsyn till ärenden som kommit in till Skatteverket och där Skatteverket har fattat beslut."
  `[FACT src: skatteverket.se "Så fungerar rotavdraget"]` E-tjänstens namn bekräftat ordagrant; inloggning krävs
  (www7.skatteverket.se/portal/mina-avdrag/, ej öppnad, kräver e-legitimation). `[FACT]` + `[GAP]` på innehållet
  bakom inloggningen.
- Vad "redan använt" betyder i lagens termer: summan av **preliminär skattereduktion** för ROT (13 a/13 b-arbete)
  som tillgodoräknats i år. Det räknas mot 50 000-taket (HUSFL 7 § 3 st) **och** tar skatteutrymme före nästa
  ROT-jobb eftersom allt ROT/RUT i året avräknas i klump (67:19 = summan av preliminära reduktioner). `[FACT]` +
  `[TOLKNING]` Motorns `rest = max(0, min(TAK, utrymme) − anvant)` (rakna.js rad 85-86) gör exakt det. **Stämmer** för
  ROT-läget. Två luckor: (a) RUT som använts i år tar också utrymme (och 75 000-taket) men frågas inte; (b) i GT-läget
  frågas bara efter använt **grön teknik**-avdrag, medan använt ROT/RUT ligger **före** grön teknik i 67:2 och därför
  borde dras från utrymmet också. Se avsnitt 7.


## 6. Femårsregeln och 18-årsregeln, ordagrant

### 6.1 Femårsregeln (bara om-/tillbyggnad av småhus)
- IL 67:13 c: "Som hushållsarbete räknas inte [...] 5. om- eller tillbyggnad av ett småhus för vilket fastighetsavgift
  inte har tagits ut för de fem första kalenderåren efter beräknat värdeår, eller [...]" `[FACT src: IL 67:13 c p.5]`
  Regeln nämner bara **småhus** och bara **om- eller tillbyggnad**. Reparation/underhåll spärras inte; bostadsrätts-
  lägenhet i flerbostadshus och ägarlägenhet är inte småhus och spärras inte. `[FACT]` + `[TOLKNING]`
- Skatteverket.se "Så fungerar rotavdraget": "Du kan inte få rotavdrag för ombyggnad eller tillbyggnad de första fem
  åren efter det år huset byggdes färdigt. Det är året som räknas, inte vilken månad eller dag som huset blev färdigt.
  Det år huset byggdes färdigt kallas för värdeår. Detta gäller även för bostadsrätter som är taxerade som småhus."
  och "Reparation och underhållsarbeten ger rätt till rotavdrag oavsett hur gammalt huset är." och "Om bostadsrätten
  är ett småhus och yngre än fem år får arbetet endast syfta till att återställa byggnaden till det skick den var i
  från början. Om du bor i en bostadsrättslägenhet i ett flerfamiljshus eller i en ägarlägenhet kan du få rotavdrag
  för ombyggnad och tillbyggnad som utförs direkt efter att bostaden är färdigställd. Inget rotavdrag ges dock för
  färdigställande eller nybyggnation." `[FACT src: skatteverket.se "Så fungerar rotavdraget"]`
- Konkret 2026: värdeår ≤ 2020 → om-/tillbyggnad ok; värdeår 2021-2025 → bara reparation/underhåll (01-rot-regelverk
  B5, K14). Motorns `FEMARSREGEL_SISTA_VARDEAR: 2020` **stämmer**. `[FACT]`
- Kalkylatorns not "Yngre än fem år: ROT gäller bara reparationer." (rakna.js rad 34/72) är i linje med lagen; den är
  formulerad som en not, inte som ett stopp, vilket är rätt eftersom reparation ger ROT oavsett ålder. Nyans: noten
  visas för alla bostadstyper, men femårsregeln gäller inte bostadsrättslägenhet/ägarlägenhet; en sådan kund som
  svarar "yngre än fem år" får en onödig (men ofarlig) not. `[TOLKNING]` Se avsnitt 7.

### 6.2 18-årsregeln
- IL 67:11 p.1: "vid beskattningsårets utgång har fyllt 18 år"; IL 67:36 p.1 identiskt för grön teknik.
  `[FACT src: IL 67:11, 67:36]`
- Skatteverket.se (rot och grön teknik, samma mening): "Du ska ha fyllt 18 år senast vid årets slut."
  `[FACT src: skatteverket.se "Så fungerar rotavdraget"; "Så fungerar skattereduktionen för grön teknik"]`
- RV 2026.13: "Personen har fyllt 18 år vid beskattningsårets utgång." `[FACT src: RV 2943.html]`
- Kalkylatorns text "Du behöver ha fyllt 18 år senast vid årets slut" (rakna.js rad 69). **Stämmer ordagrant med
  Skatteverkets folkliga form.** Den som fyller 18 i december 2026 har alltså rätt till avdrag för hela 2026.
  `[TOLKNING]`


## 7. Diff mot motorn (engine.js / rakna.js)

Metod: varje avvikelse är räknad med motorn själv (`node`, skript i scratchpad `diff.mjs`, kört 2026-09-16) genom att
jämföra kalkylatorns anrop (rakna.js rad 79-84: `ks: KS_SNITT, taxeringsvarde: 0, ranteutgifter: 0`,
`ar_66_plus: typ === 'pension'`) med samma motor matad med det lagen egentligen tittar på. "Kalkyl" = vad
kalkylatorn visar (före avrundning och 50 000-tak), "verklig" = motorns svar med rätt input. Alla belopp är
skatteutrymme i kr per person; kalkylatorn visar sedan min(50 000, utrymme) − använt. `[BERÄKNAT]`

**Vad som stämmer med lagen (ingen diff):** poolen (kommunal + statlig + fastighetsavgift), ordningen
(pensionsavgift → JSA → förvärvsinkomst → underskott av kapital → ROT/RUT → grön teknik), att JSA och
förvärvsinkomstreduktionen bara får gå mot kommunal skatt, grundavdraget inkl. 66+-tillägget i 2026-lydelse,
taken 50 000 / 75 000 / 50 000, 30 % / 15 % / 50 % / 50 %, 18-årsregeln, äga-kravet, femårsregeln som not (inte
stopp) och att den döljs i GT-läget, "redan använt" dras från personens rest, eget tak + eget utrymme per person.
`[FACT]` (avsnitt 1-6.)

### 7.1 Avvikelsetabell

| # | Avvikelse | Riktning | Storlek i typiskt fall `[BERÄKNAT]` | Spelar det roll i en enkel publik kalkylator? |
|---|---|---|---|---|
| D1 | **Make/sambo som inte äger** får ändå en egen pott. Kalkylatorn frågar bara person 1 om ägande; övriga antas uppfylla villkoren (rakna.js rad 58-59). Lagen: 67:13 a/13 b, 67:39 "ägs av/innehas av den som begär". Skatteverket: "Den del som avser rotarbete kan inte överföras till Ali eftersom han inte äger huset." | **Över** | Två personer, lön 35 000 + 30 000/mån: kalkyl "ca 91 000 kr", verklig 50 000 kr om person 2 inte står som ägare. Upp till 50 000 kr per icke-ägande person. | **Ja.** Vanligt att bara en står på lagfart/bostadsrätt. En rad text ("varje person måste själv äga bostaden") eller en ägarfråga per person löser det. |
| D2 | **Använt ROT/RUT ignoreras i grön teknik-läget.** I GT-läget frågas bara "Grön teknik du redan använt i år". ROT/RUT ligger **före** grön teknik i 67:2 och tar skatteutrymme först. | **Över** | Lön 40 000/mån, ROT 50 000 använt i år: kalkyl 50 000 kr, verklig ≈ 12 300 kr. Lön 35 000/mån, ROT 30 000 använt: kalkyl 50 000, verklig ≈ 21 800. | **Ja** för Ampys kärnfall (elcentral på ROT + laddbox på grön teknik samma år, GRIND 5 i 01). Fråga "ROT/RUT använt i år" även i GT-läget och dra det från utrymmet (inte från 50 000-taket). |
| D3 | **Använt RUT ignoreras i ROT-läget.** Fältet heter "ROT du redan använt i år"; RUT tar samma utrymme (67:19 summerar) och samma 75 000-tak. | **Över** | RUT 20 000 använt, lön 35 000/mån: kalkyl 50 000, verklig ROT-rest ≈ 30 000 (utrymme 51 796 − 20 000). | **Delvis.** Typiskt RUT-belopp 5 000-20 000 kr/år. Enklast: döp fältet "ROT och RUT du redan använt i år" (rätt för utrymmet; ger en liten underskattning av taket när RUT > 25 000, vilket är ovanligt). |
| D4 | **"Lön" antas = under 66 år; "Pension" antas = 66+** (rakna.js rad 41/82). Lagen knyter förhöjt grundavdrag (63:3 a) och 66+-jobbskatteavdraget (67:8) till ålder "vid beskattningsårets ingång", inte till inkomsttyp. | **Över** för 66+ som jobbar; **under** för <66 med pension | 66+ med lön 25 000/mån: kalkyl 31 094, verklig **0**. Lön 35 000/mån: kalkyl 51 796 (visas som 50 000), verklig 14 414. Lön 45 000: kalkyl 77 528, verklig 40 304. Omvänt: pension 20 000/mån vid 63 år: kalkyl 37 876, verklig 63 560 (underskattning, ofarlig). | **Ja, den största enskilda felkällan.** En 67-åring som fortfarande jobbar deltid är en typisk villakund och får "50 000" när verkligheten är 0-15 000. Fix: fråga "Har du fyllt 66 år?" (eller födelseår ≤ 1959 för 2026) i stället för att gissa ur inkomsttypen; låt lön + pension kombineras. Motorn stöder redan båda fälten och flaggan. |
| D5 | **Ränteutgifter (underskott av kapital) ignoreras** (ranteutgifter: 0). 67:10: 30 % upp till 100 000, 21 % därutöver, ligger **före** ROT i 67:2. | **Över** | Lön 35 000/mån, bolåneränta 100 000 kr/år: kalkyl 51 796 → "50 000", verklig 21 796. Ränta 50 000: verklig 36 796. Lön 45 000 med 150 000 kr ränta: 77 528 → 37 028. | **Ja för unga villaägare** (3 Mkr lån à 3,5 % ≈ 105 000 kr ränta → −31 000 kr utrymme). 01-rot-regelverk §E4 sa redan "annars ljuger den för unga villaägare"; rot-spec valde bort fältet (GRIND 6). Minsta åtgärd: en rad under resultatet ("Har du stora ränteutgifter minskar utrymmet med 30 % av räntan"). Bäst: valfritt fält, motorn stöder det. |
| D6 | **Kommunal fastighetsavgift ignoreras** (taxeringsvarde: 0). Den ingår i poolen enligt 67:2. | **Under** | Villa med max-avgift: +10 425 kr utrymme i alla fall under taket (lön 30 000/mån: 41 445 → 51 870; pension 20 000/mån: 37 876 → 48 301). Tröskeln för fullt 50 000 sjunker från ca 34 200 till ca 29 100 kr/mån för löntagare. | **Måttligt, ofarlig riktning.** Underskattning gör att en villaägare med 30 000/mån ser "ca 41 000" när 50 000 ryms. Fix: fråga bostadstyp (villa/bostadsrätt) och lägg på 10 425 för villa (schablon, 0 för hus med värdeår 2011+; avgiften är nästan alltid maxad, taxeringsvärde > 1 390 000). |
| D7 | **Kapitalinkomster ignoreras** (ränta, utdelning, ISK-schablon, vinst vid bostads-/aktieförsäljning). 30 % statlig skatt enligt 65:7 ingår i poolen. | **Under** | 100 000 kr kapitalvinst = +30 000 kr utrymme. ISK 1 Mkr 2026: schablonintäkt ≈ 3,55 % × (1 000 000 − 300 000 fribelopp) ≈ 24 850 kr → +7 455 kr. | **Nej.** Konservativt och sällsynt stort utom det år man sålt bostad. En rad i "Så har vi räknat" räcker. |
| D8 | **Sjukpenning, föräldrapenning, a-kassa** kan bara matas in som "Lön" → motorn drar jobbskatteavdrag. 67:6 definierar arbetsinkomst genom en sluten uppräkning av SFB-poster ("59 kap. 8-12 §§, 13 § 11 och 12, 14 § första stycket 1-3 och 5 samt 15-19 och 27 §§"); sjukpenning, föräldrapenning och a-kassa ingår inte i uppräkningen och ger därför inget jobbskatteavdrag, men de bär allmän pensionsavgift. `[FACT src: IL 67:6]` + `[TOLKNING]` på SFB-numreringen (ej öppnad). | **Under** | 25 000/mån helt i sjukpenning: kalkyl 31 094, verklig ≈ 63 631. | **Nej** (ofarlig riktning, ovanlig helårssituation). Nämn i "Så har vi räknat". |
| D9 | **Sjuk-/aktivitetsersättning** har egen reduktion (67:9 a-9 d) som liknar jobbskatteavdraget; motorn har ingen sådan post. Angiven som "Pension" → förhöjt GA (fel), ingen reduktion (fel). | Oklar, båda fel tar delvis ut varandra | Inte räknad; kräver 9 c §-tabellen. `[GAP]` | **Nej.** Skatteverkets egen ROT-räknare avvisar också gruppen (01 §E3). Hänvisa till Skatteverket. |
| D10 | **Regional skattereduktion 1 675 kr** (67:34, bilaga 67-kommuner, bara mot kommunal skatt) ligger före ROT. | **Över** | −1 675 kr för boende i berörda glesbygdskommuner. | **Nej.** Under kalkylatorns avrundning (1 000 kr) i praktiken. |
| D11 | **Kommunalskatt = snitt 32,38 %.** Lagen: hemortskommunens sats (65:3). | ± | Lön 30 000/mån: 34 300 (29 %) / 41 400 (snitt) / 47 000 (35 %). Lön 40 000: 52 100 / 62 300 / 70 200. | **Måttligt.** Det är därför prefixet "ca" finns. Kommunväljare = GRIND 7 i 01. |
| D12 | **"Din inkomst förra året"** (v1 index.html rad 54) används som proxy för 2026 års skatt. Lagen: avdraget prövas mot skatten det beskattningsår betalningen sker (67:12, 67:2), dvs 2026 års inkomst. | ± | Fel bara vid inkomstförändring 2025→2026 (pensionering, föräldraledighet, löneökning). | **Litet, men etiketten är missvisande.** "Din inkomst i år (ungefär)" är det lagen frågar efter. Ägarbeslut om copy. |
| D13 | **Femårsnoten visas för alla bostadstyper.** 67:13 c p.5 gäller bara småhus (och bostadsrätt taxerad som småhus); flerbostadshus-bostadsrätt och ägarlägenhet har ingen femårsregel. | Ingen beloppseffekt | Bara en onödig not för bostadsrättskunder som svarar "nej". | **Nej.** Möjlig finputs: "gäller villa/radhus". |
| D14 | **Sambeskattning av "ca" och avrundning**: personens rest avrundas till närmaste 1 000 innan summering (rakna.js rad 87). | ± 500 kr/person | Kosmetiskt. | **Nej.** |
| D15 | **Pensionärers 4 %-spärr på fastighetsavgiften** (lag 2008:826) och **statlig fastighetsskatt** (tomt, byggnad under uppförande) modelleras inte. | Ingen effekt i kalkylatorn | Fastighetsavgiften är redan satt till 0 (D6), så spärren blir aldrig aktuell; fastighetsskatt är sällsynt för målgruppen. | **Nej.** Hör till engine.js-förenklingarna (GRIND 11). |
| D16 | **Fördelningen mellan poolens delar** när en "hela poolen"-reduktion (pensionsavgift) ligger före en "bara kommunal"-reduktion (JSA): motorn drar pensionsavgiften från hela poolen och begränsar JSA mot **hela** kommunalskatten (engine.js rad 173-175). Om Skatteverket i stället avräknar pensionsavgiften mot kommunalskatten först blir JSA-utrymmet mindre och ROT-utrymmet större. | **Under** (om alls) | Bara vid låg lön **och** statlig skatt/fastighetsavgift i poolen; exempel lön 5 000/mån + villa: ca 3 000 kr. I kalkylatorn är poolen = kommunalskatt (D6), så frågan uppstår inte. Ej belagd i lagtext eller RV. `[GAP]` | **Nej** för kalkylatorn; en kontrollkörning i Skatteverkets tjänst med låg lön + villa skulle avgöra det för engine.js. |

### 7.2 Vad som bör ändras, i prioritetsordning (min läsning, ägarbeslut)
1. **D4, åldersfrågan.** Byt gissningen "pension = 66+" mot en fråga "Fyllt 66 år vid årets början?" (66 → 67 från
   2027, 63:3 a "Träder i kraft I:2027-01-01", GRIND 12). Den enda avvikelsen som ger ett rent falskt "50 000" till
   en vanlig kundgrupp (66+ som jobbar). `[TOLKNING]`
2. **D1, ägande per person.** "Äger du din bostad?" ställs bara till person 1. Lägg antingen till en ägarfråga per
   tillagd person eller en tydlig rad: "Räkna bara med personer som äger bostaden." `[TOLKNING]`
3. **D2, ROT/RUT i grön teknik-läget.** Lägg till fältet "ROT/RUT använt i år" i GT-läget och dra det från
   utrymmet (inte från taket 50 000). Det är exakt det avräkningsordningen i 67:2 kräver, och 02-gron-teknik §E
   punkt 2 hade redan detta krav (`rotRutUsedKr`) som föll bort i v1. `[FACT src: IL 67:2]` + `[TOLKNING]`
4. **D5, ränteutgifter.** Minst en varningsrad, helst valfritt fält. Motorn har fältet.
5. **D3, etiketten "ROT du redan använt i år" → "ROT och RUT du redan använt i år".** Ren copyändring.
6. **D6, fastighetsavgift.** Fråga villa/lägenhet och lägg på 10 425 kr för villa; höjer träffsäkerheten för
   villakunder med 25 000-34 000 kr/mån utan ny risk (underskattningen försvinner).
7. D12, etiketten "förra året" → "i år".

Resten (D7-D11, D13-D16) hör hemma i "Så har vi räknat"-texten, inte i formuläret. `[TOLKNING]`


## 8. Öppna frågor till ägaren

1. **Åldersfrågan (D4):** får kalkylatorn fråga "Har du fyllt 66 år?" (eller födelseår) i stället för att härleda
   ålder ur "Lön/Pension"? Utan den frågan visar verktyget "50 000 kr" för en 67-åring med lön 35 000/mån vars
   verkliga utrymme är ca 14 000 kr.
2. **Ägande per person (D1):** ska varje tillagd person få frågan "Äger den här personen bostaden?", eller räcker en
   textrad "räkna bara med ägare"? (Ägarbeslut 2026-09-14 antog att övriga personer uppfyller villkoren.)
3. **ROT/RUT-fält i grön teknik-läget (D2):** godkänner du att GT-läget får ett andra fält "ROT och RUT använt i år"
   som sänker utrymmet? Det är lagens ordning (67:2) och Ampys vanligaste kombination (elcentral + laddbox).
4. **Ränteutgifter (D5):** varningsrad eller valfritt fält? Fältet finns i motorn; rot-spec valde bort det.
5. **Fastighetsavgift (D6):** får vi fråga "villa/radhus eller lägenhet" och lägga på schablonen 10 425 kr för
   villa? (Ofarlig riktning, gör svaret rätt för villakunder med 25 000-34 000 kr/mån.)
6. **Etiketter:** "ROT du redan använt i år" → "ROT och RUT du redan använt i år" (D3) och "Din inkomst förra året" →
   "Din inkomst i år, ungefär" (D12). Copybeslut i ampy-rost.
7. **RV-inkonsekvensen kvarstår i 2026.13:** Rättslig vägledning "Villkor för rot- och rutavdrag" skriver att gåvor,
   a-kassa och grön teknik avräknas **före** rot/rut, och "Grön teknik, installation" skriver att gåvor och a-kassa
   avräknas före grön teknik. Lagen (67:2, SFS 2025:1370) och RV:s egen ordningssida (2937.html) säger tvärtom:
   rot/rut → grön teknik → gåva → a-kassa. Verktyget följer lagen. Vill du att vi frågar Skatteverket skriftligt
   (för att kunna citera svaret i "Så har vi räknat"), eller räcker lagtexten? (= GRIND 9 i 01, nu verifierad mot
   utgåva 2026.13.)
8. **Kontrollkörning "Räkna ut din skatt" med ROT + grön teknik samtidigt** är fortfarande inte gjord (GRIND 9/F4 i
   01). Den skulle bevisa i Skatteverkets egen tjänst att grön teknik faller bort först när skatten inte räcker.
   `[GAP]` Kräver e-legitimation? Nej, tjänsten är öppen; det är en manuell körning på ca 15 minuter.
9. **Skattskyldighet:** kalkylatorn frågar inte om kunden är obegränsat skattskyldig (67:11 p.2, 67:36 p.2). För
   en svensk privatkund är det uppfyllt; vill du ha en rad om utlandsboende (begränsat skattskyldig med 90 %-regeln)
   eller lämna det?
10. **Sjuk-/aktivitetsersättning och sjukpenning (D8-D9):** hänvisa till Skatteverket i "Så har vi räknat", eller
    bygga fler inkomsttyper? (Skatteverkets egen räknare avvisar gruppen.)
11. **2027-växeln:** 63:3 a byter till 67 år 2027-01-01 (redan i lagtexten som "Träder i kraft I:2027-01-01");
    parametrarna (prisbasbelopp, skiktgräns, takbelopp) byts i `PARAMS_2026`. Vem äger årsväxeln? (GRIND 12 i 01.)
12. **Budgetpropositionen för 2027** (väntas mitten/slutet av september 2026): ingen ändring av 67 kap. 2, 19 eller
    45 §§ syns i lagtexten per 2026-09-16 (senaste ändring i konsolideringen är SFS 2026:1393, CSN-relaterad, i kraft
    2029). `[FACT src: riksdagen.se]` Ska någon bevaka BP2027 för ROT/grön teknik-förslag? `[GAP]` efter 2026-09-16.


## Hämtlogg (2026-09-16, allt öppnat på riktigt; inget citerat ur minne)

| Källa | Sätt | Status | Använt till |
|---|---|---|---|
| riksdagen.se, Inkomstskattelag (1999:1229), konsoliderad "t.o.m. SFS 2026:1393" | curl → fil (3,8 MB) → text, läst lokalt | 200 | 63:2-3 a, 65:1-7, 67:1-52, övergångsbest. 2024:1131, 2025:322, 2025:539, 2025:1376, 2026:1393 |
| svenskforfattningssamling.se, SFS 2025:1370 (PDF) | curl → pdftotext | 200 | 67:1-2 originaltext, utfärdad 2025-11-27, prop. 2025/26:1 |
| svenskforfattningssamling.se, SFS 2025:539 (PDF) | curl → pdftotext | 200 | 67:2 utan mikroproduktion, ikraft 2026-01-01, prop. 2024/25:109 |
| svenskforfattningssamling.se, SFS 2025:321, 322, 323, 324 (PDF) | curl → pdftotext | 200 | avsnitt 3.4: tillfälliga 50 % (12 maj-31 dec 2025) och återgången till 30 % 2026-01-01 |
| riksdagen.se, Lag (2009:194) HUSFL, "t.o.m. SFS 2025:324" | curl → text | 200 | 6-9 a, 11, 17-19 §§, övergångsbest. 2024:416, 2024:419, 2025:323, 2025:324 |
| riksdagen.se, Lag (2020:1066) GRÖNFL, "t.o.m. SFS 2025:541" | curl → text | 200 | 6-9, 10, 16-18 §§, övergångsbest. 2024:1139, 2025:541 |
| riksdagen.se, Skatteförfarandelag (2011:1244), "t.o.m. SFS 2026:1305" | curl → text | 200 | 56 kap. 9 § (pluspost för preliminär skattereduktion) |
| skatteverket.se FAQ "Hur mycket måste jag tjäna…" | curl → text | 200 | avsnitt 1.2 |
| skatteverket.se "Rot- och rutavdrag i deklarationen" | curl → text | 200 | avsnitt 3.5, 5.4 (exemplen 100 000/35 000, A/B-omfördelning) |
| skatteverket.se "Så fungerar rotavdraget" (safungerarrotavdraget.html; villkorforattfarotavdrag… omdirigerar hit) | curl → text | 200 | avsnitt 5.2, 5.5, 6 |
| skatteverket.se "Grön teknik" (privat) | curl → text | 200 | avsnitt 4 (15/50/50, "bestämd ordning", slutbetalning) |
| skatteverket.se "Så fungerar skattereduktionen för grön teknik" (privat) | curl → text | 200 | avsnitt 4.1, 5.2, 5.4 |
| skatteverket.se "Så fungerar skattereduktionen för grön teknik" (företag) | curl → text | 200 | hämtad, inte citerad (02 täcker) |
| skatteverket.se "Belopp och procent inkomstår 2026" | curl → text | 200 | avsnitt 1.2 (parametrarna) |
| www4.skatteverket.se RV 2026.13 "Vad är en skattereduktion?" (2937.html) | curl blockerad (F5), öppnad i webbläsare, text via DOM | OK | avsnitt 1.2, 2 |
| www4.skatteverket.se RV 2026.13 "Villkor för rot- och rutavdrag" (2943.html) | webbläsare, DOM | OK | avsnitt 1.2, 3.5, 5, 6.2, öppen fråga 7 |
| www4.skatteverket.se RV 2026.13 "Grön teknik, installation" (420580.html) | webbläsare, DOM | OK | avsnitt 1.2, 4.3, öppen fråga 7 |
| lagen.nu/1999:1229 | WebFetch | **misslyckades** (>10 MB) | ersatt av riksdagen.se-filen |
| www7.skatteverket.se/portal/mina-avdrag/ (e-tjänsten) | ej öppnad, kräver e-legitimation | `[GAP]` | bara namnet, via skatteverket.se |
| Skatteverkets "Räkna ut din skatt" med ROT + GT samtidigt | ej kört | `[GAP]` | öppen fråga 8 |

Inga sekundärkällor behövdes för något [FACT]. Kanonens satser (CLAUDE.md regel 5) är inte webb-kollade som
satser; att lagtexten (HUSFL 7 §, GRÖNFL 7 §) råkar bekräfta dem noteras som samstämmighet.
