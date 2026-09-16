# 01 · ROT-regelverket 2026, regelmodell för kalkylatorn (ROT-agenten, 2026-09-11)

Allt nedan är belagt mot lagtext, Skatteverkets sidor, Skatteverkets Rättslig vägledning (utgåva 2026.13)
och fyra körningar i Skatteverkets egen e-tjänst. Varje påstående bär en tagg:

- `[FACT src: Kn]` = står ordagrant i källan; Kn pekar på `research/underlag/rot-kallor.md` där URL, hämtstatus
  och citat ligger. De viktigaste URL:erna upprepas inline.
- `[TOLKNING]` = min läsning av källan, där källan inte säger det rakt ut.
- `[BERÄKNAT]` = framräknat ur angivna inputs (formler i `logik/skatteutrymme_2026.py`).
- `[GAP]` = saknas; fylls aldrig med gissning.
- `GRIND n` = ägar- eller elektrikersignering krävs (samlas i GRINDLISTA sist).

Satserna (30 %, 50 000, 75 000) är ägarbekräftad kanon (`ampy-foretagsdata` §6.5, CLAUDE.md regel 5) och har
**inte** webb-kollats som satser. Att de råkar bekräftas av K1/K12 noteras bara som samstämmighet.

Källnycklar (fullständigt i rot-kallor.md):
K1 Inkomstskattelagen (riksdagen.se) · K2 Lag 2009:194 (riksdagen.se) · K3 Skatteverket "Så fungerar rotavdraget" ·
K4 Skatteverket "Ger arbetet rätt till rotavdrag?" · K5 FAQ "Hur mycket måste jag tjäna" · K6 FAQ-index ·
K7 "Rot- och rutavdrag i deklarationen" · K8 "Grön teknik" · K9 "Belopp och procent 2026" · K10 "Nya lagar 2026" ·
K11 e-tjänsten "Räkna ut rot- och rutavdrag" · K12 RV "Villkor för rot- och rutavdrag" · K13 RV "Vad är en
skattereduktion?" · K14 RV "Vad räknas som rotarbete?" · K16 Ungdomskraft · K17 Mowin.

---

## A. Vem kan få ROT

| # | Villkor | Verdict | Källa |
|---|---|---|---|
| A1 | Fyllt 18 år senast vid årets slut (beskattningsårets utgång). | [FACT] | K1 67:11 p.1; K3 "Du ska ha fyllt 18 år senast vid årets slut." |
| A2 | Äger bostaden (helt eller delvis) **under den period arbetet utförs**. Ägare = den som skrivit på köpe-/gåvohandling och är eller kan bli lagfaren ägare, eller för bostadsrätt: medlem i föreningen. Dold ägare får inte ROT. | [FACT] | K3 "Du måste äga bostaden under den period som arbetet utförs"; K12 "Ägare är den som har undertecknat köpe- eller gåvohandlingarna"; K3 dold äganderätt. |
| A3 | Bostaden ingår i köparens hushåll: köparen (eller köparens föräldrar) bor där helt eller delvis, som permanentbostad, fritidsbostad "eller liknande". Flera permanent- och fritidsbostäder samtidigt är tillåtet. | [FACT] | K1 67:15; K3; K12 "En köpare kan ha sitt hushåll såväl i en eller flera permanentbostäder som i en eller flera fritidsbostäder." |
| A4 | Uthyrd bostad = nej (helt eller den uthyrda delen). Om någon annan bor permanent i fritidshuset = nej. | [FACT] | K3; K12 (RÅ 2010 ref. 109). |
| A5 | Hyresrätt, arrende, andelslägenhet, kooperativ hyresrätt = nej. Lagtexten är uttömmande om bostadsformer. | [FACT] | K3 "hyrd bostad · arrenderad bostad"; K14 "Inte heller andelslägenheter eller kooperativa hyresrätter omfattas". |
| A6 | Barnets bostad = nej, även om föräldern äger den (undantag: barn föräldern har underhållsskyldighet för, t.ex. gymnasieelev på annan ort, räknas till föräldrarnas hushåll). Särbos bostad = nej. | [FACT] | K3; K6 dotterns lägenhet; K12 "Barn som föräldrar har underhållsskyldighet för ... anses tillhöra föräldrarnas hushåll". |
| A7 | Förälders bostad = ja, om köparen (a) äger hela eller del av bostaden, (b) har haft utgiften, (c) föräldern är bosatt i Sverige. Förälder = biologisk, adoptiv-, styv- och fosterförälder. | [FACT] | K1 67:15; K3 "Du kan få rotavdrag för arbete som utförs i dina föräldrars bostad om du har haft utgiften ... Det krävs dessutom att du helt eller delvis äger"; K12. |
| A8 | Nyköpt, ej inflyttad bostad = ja med villkor: tillträde vid arbetet, ingen annan bor där, inflyttning direkt efter renoveringen (vid långa renoveringar senast året efter). Sälja/hyra ut i stället = nej. | [FACT] | K3 "Nyköpt bostad"; K12. |
| A9 | Obegränsat skattskyldig i Sverige under någon del av året, eller begränsat skattskyldig som väljer IL-beskattning med minst 90 % av förvärvsinkomsterna i Sverige. Den som bara äger ett småhus här och betalar fastighetsavgift kan **inte** få ROT. | [FACT] | K1 67:11 p.2 + 2 st; K3; K12. |
| A10 | Bostaden får ligga i hela EU/EES eller Schweiz (samma regler som i Sverige). Kalkylatorn avgränsas till bostad i Sverige, EES-fallet hänvisas till Skatteverket. | [FACT] + [TOLKNING] avgränsningen | K3 "Bostaden ska finnas inom EU/EES eller Schweiz."; K1 67:14. GRIND 13. |
| A11 | Dödsbo: bara arbete utfört **före** dödsfallet. Ensam dödsbodelägare: arbete utfört och betalt efter registrerad bouppteckning, om hen bor där. Flera delägare: arvskifte krävs först. Delägare i dödsbo räknas inte som ägare. | [FACT] | K1 67:11 3 st; K3; K6; K12. |
| A12 | Utföraren får inte vara köparen själv eller närstående (make/sambo med gemensamt barn, föräldrar, mor-/farföräldrar, barn, barnbarn, syskon m.fl.). Egen enskild firma = nej. | [FACT] | K3 "Den som utför arbetet får inte vara släkt med dig"; K6. Irrelevant för Ampy-kunder utom som info. |
| A13 | Flera ägare som nyttjar bostaden kan dela på avdraget. Ägarandelen saknar betydelse. Taket är per person, inte per bostad. Den som ska ha avdraget ska stå på fakturan med namn/personnummer eller vara den som betalar. | [FACT] | K3 "Om ni är två eller flera ägare ... kan ni dela"; K12 "Ägarandelen har inte heller någon betydelse ... ingen begränsning ... per bostad". |

## B. Bostaden

| # | Regel | Verdict | Källa |
|---|---|---|---|
| B1 | Godkända bostadstyper: **småhus** (villa, radhus, kedjehus, parhus, fritidshus, kolonistuga inrättad som bostad, hus på ofri grund), **ägarlägenhet**, **bostadsrätt** (även i bostadsförening/bostadsaktiebolag). Bostaden måste vara inredd och utrustad för boende (matlagning, förvaring, hygien). Taxeringsvärde krävs inte. | [FACT] | K3 "Detta räknas som bostad"; K14 "utrustning för boendets olika funktioner". |
| B2 | Komplementhus (garage, förråd, växthus) på samma tomt räknas till småhuset: reparation, underhåll, om- och tillbyggnad ger ROT. **Nybyggnad** av garage/friggebod/växthus = nej (HFD 2012 ref. 47). Komplementhus på samfälld mark = nej. | [FACT] | K1 67:14; K3; K14 "Komplementhus". |
| B3 | Arbetet ska ske i bostaden eller på tomten i nära anslutning; el i trädgården och fristående laddstolpe = nej (se C). | [FACT] | K4 småhus » El. |
| B4 | **Femårsregeln.** Ingen ROT för om- eller tillbyggnad av småhus de fem första kalenderåren efter värdeåret (det år huset färdigställdes enligt fastighetstaxeringen). "Det är året som räknas, inte vilken månad eller dag." Lagtekniskt: småhus där fastighetsavgift inte tagits ut de fem första åren efter beräknat värdeår. | [FACT] | K1 67:13 c p.5; K3; K14. |
| B5 | Konkret för 2026: om-/tillbyggnad ger ROT om **värdeår ≤ 2020**. Värdeår 2021-2025: bara reparation/underhåll som återställer till ursprungligt skick, med likvärdigt material. Värdeår 2026 eller inte taxerat som färdigställt: ingen ROT alls (räknas som färdigställande av nybygge). | [FACT] | K14 "för om- och tillbyggnadsarbeten som utförs under 2026 kan fastigheter med värdeår till och med 2020 få rotavdrag"; K4 "Om bostaden är yngre än fem år får arbetet endast syfta till att återställa befintlig el"; K14 "inte heller för arbeten som utförs före det fastighetstaxeringsår när småhuset taxeras som färdigställt". |
| B6 | **Reparation och underhåll ger ROT oavsett husets ålder.** Det är alltså inte sant att "bostaden måste vara äldre än fem år" generellt. | [FACT] | K3 "Reparation och underhållsarbeten ger rätt till rotavdrag oavsett hur gammalt huset är."; K14. |
| B7 | **Tillbyggnad på hus yngre än fem år = nej** (samma spärr som ombyggnad). Uppdragets fråga "tillbyggnad är ROT även på <5 år?" besvaras nej. | [FACT] | K1 67:13 c p.5 "om- eller tillbyggnad"; K3 "ombyggnad eller tillbyggnad de första fem åren". |
| B8 | **Förbättring = ombyggnad** i femårsregelns mening (t.ex. värmepump, kakel i stället för våtrumstapet). Elmässigt [TOLKNING]: att utöka elcentralen, dra nya grupper, förbereda för laddbox eller uppgradera till bättre standard är förbättring/ombyggnad → spärrat på hus med värdeår 2021-2025; att byta en trasig komponent mot likvärdig är reparation → ok. Gränsdragningen per Ampy-jobb är GRIND 2. | [FACT] + [TOLKNING] | K14 "Observera att förbättringar ses som ombyggnad"; K4 "Om material byts ska det nya vara likvärdigt med det gamla." |
| B9 | Var hittar kunden värdeåret: senaste fastighetstaxeringsbeslutet / Mina sidor » Fastigheter. Flera småhus på tomten: det mest värdefulla husets värdeår gäller. Komplementhus följer småhusets värdeår. | [FACT] | K3; K14. |
| B10 | **Bostadsrätt:** ROT bara för arbete **inne i lägenheten** (innanför tak, väggar, golv) och bara för åtgärder **bostadsrättshavaren ansvarar för enligt stadgarna**. Fasad, balkong, trapphus, förråd, tvättstuga, gemensam el, p-plats, garage i föreningens regi = nej. Gäller även om bostadsrätten är ett radhus/parhus/villa ("bostadsrättsvilla"). | [FACT] | K1 67:13 b; K3; K4 bostadsrätt » El; K6 bostadsrättsvilla; K14. |
| B11 | Bostadsrätt, el som är ok: installera/komplettera elcentral (proppskåp) i lägenheten; dra ledningar från proppskåpet ut i bostaden (i eller utanpå vägg); byta/montera uttag; inbyggda spotlights. Inte ok: el utomhus eller till en elcentral utanför bostaden; solceller/laddpunkt (går via föreningen eller grön teknik). | [FACT] | K4 bostadsrätt » El; K14 "Elledningar". |
| B12 | Bostadsrätt, femårsregeln: gäller **bara** bostadsrätter som är småhus. I flerbostadshus får man bygga om direkt efter färdigställandet, men att färdigställa en nyproducerad lägenhet ger aldrig ROT. Samma för ägarlägenhet. | [FACT] | K3; K14 "Femårsregeln gäller även för bostadsrätter som är småhus, men inte för ägarlägenheter eller bostadsrättslägenheter". |
| B13 | Luftvärmepump i bostadsrätt: ROT bara för arbetet inne i lägenheten. Schablonen (30 % av totalentreprenaden) gäller **inte** bostadsrätter. | [FACT] | K14. |
| B14 | **Ägarlägenhet:** arbete på den del kunden äger och har underhållsansvar för (lägenheten, egen balkong/terrass, ytterdörr). Samfällighetens delar (tak, fasad, trapphus) = nej. Ingen femårsregel. | [FACT] | K4 ägarlägenhet; K14. |
| B15 | **Fritidshus** som köparen äger och själv använder = ja (småhusregler). Om någon annan bor där permanent = nej. Sommarhus ägt av flera: alla ägare som använder det kan få ROT var för sig upp till sitt eget tak. | [FACT] | K3; K12 exempel familjen Ek. |
| B16 | Tvåfamiljshus med uthyrd del: tak/fasad/fönster/ytterdörrar ger ROT trots uthyrning; invändigt arbete i den uthyrda delen = nej. Näringsverksamhet i del av villan: bara bostadsdelen. | [FACT] | K12; K14 "Tvåfamiljsfastigheter". |

## C. Vad som räknas (arbetskostnad, jobbtyper)

| # | Regel | Verdict | Källa |
|---|---|---|---|
| C1 | Underlaget är **arbetskostnaden inklusive moms**, och bara arbetad tid på plats hos kunden. Utförarens vinstpålägg på arbetet ingår. | [FACT] | K1 67:11 a, 67:18; K3 "Det är bara arbetad tid på plats hos dig"; K12 "I kostnaderna för arbete ingår också utförarens vinstkostnadspålägg för själva arbetet." |
| C2 | Inget avdrag för: material (inte ens till självkostnad under inköpspris), hyrd/leasad utrustning, maskiner, resor/restid, milersättning, logi/traktamente, avfallshantering, administration, särskild "ROT-hanteringsavgift". Enklare handverktyg (skruvdragare, cirkelsåg) behöver inte särskiljas. | [FACT] | K3 "Övriga kostnader"; K12; K5 restid. |
| C3 | Resor ska debiteras separat. **"Företaget får inte bjuda dig på exempelvis reskostnaden."** Tar företaget inte betalt för resor anser Skatteverket att de ingår i arbetet och kan betala ut mindre. | [FACT] | K3. GRIND 4 (Ampys framkörning/minimidebitering). |
| C4 | Fakturan ska visa: totalbelopp och ROT-avdragets storlek inkl. moms, uppdelning arbete/material/övrigt, typ av arbete, att företaget har F-skatt, kundens namn + personnummer, fastighetsbeteckning eller BRF:s org.nr + lägenhetsnummer, och vid flera personer hur avdraget fördelas. | [FACT] | K3 "Faktura för rotarbete"; K2 9-9 a §§. |
| C5 | **El i småhus som ger ROT:** dra in el; modernisera el; byta och montera vägguttag; installera och komplettera elcentraler (proppskåp); inbyggda spotlights; laddningspunkt på fasad/i garage (om inte grön teknik används för samma arbete); installera/reparera/byta solceller (dito); dra el vid installation av lagringssystem (dito). Reparation av fast monterade maskiner nödvändiga för värme/vatten (t.ex. värmepump). | [FACT] | K4 småhus » El och VVS; K14 "moderniserar elinstallationer". |
| C6 | **El som INTE ger ROT:** el i trädgården; fristående laddstolpe; larm och övervakningskameror; **enbart felsökning**; energideklaration; reparation av batterilager; reparation av laddningspunkt; el till elcentral utanför bostaden (BRF); "smarta hem-lösningar och installation av programvara". Service, kontroll och översyn av maskiner = nej. Besiktning, arkitekt, bygglov, kvalitetsansvarig = nej. Täthetskontroll efter renovering = nej. | [FACT] | K4; K14 "Service och installationer ger inte rotavdrag"; K14 "Kostnader för arkitekt, bygglov, besiktning". |
| C7 | **Felsökning, den viktiga nyansen för en elfirma:** felsökning som är ett moment i en reparation som ger ROT får ingå i underlaget utan att särredovisas, även om den sker vid ett tidigare tillfälle. **Fristående** diagnostisk felsökning ger aldrig ROT, "oavsett om felsökningen sker i direkt samband med att ett skattereduktionsgrundande rotarbete utförs" (HFD mål nr 2677-17). [TOLKNING] för Ampy: "Felsökning" som egen tjänst utan efterföljande reparation av Ampy = 0 % ROT; felsökning + reparation på samma uppdrag = ROT på hela arbetstiden. | [FACT] + [TOLKNING] | K14 "ingår ofta ett visst mått av felsökning ... behöver utföraren inte särredovisa felsökningsmomentet"; K4 "enbart felsöka". GRIND 3. |
| C8 | "Enbart installation eller service på maskiner och andra inventarier" är inte ROT (13 c § p.1), men installationer som "regelmässigt innefattar byggarbete" godkänns (värmepump, panna, kamin, markis). [TOLKNING]: en elcentral, fast belysning och fast kabeldragning är byggnadsdelar, inte inventarier, och listas uttryckligen som ROT (C5). Fristående apparater (inkoppling av vitvaror, parabol) = nej. | [FACT] + [TOLKNING] | K1 67:13 c p.1; K14. |
| C9 | Luftvärmepump (Ampy säljer): ROT på arbetet; vid totalentreprenad till fast pris får arbetskostnaden schablonberäknas till **30 % av totalpriset** (småhus/ägarlägenhet, inte bostadsrätt). Bergvärme 35 %. | [FACT] | K4 VVS; K14. |
| C10 | Bidrag/stöd från stat, kommun eller region för samma arbete = nej. Försäkringsersättning för arbetet = nej (även vid åldersavdrag); om ersättningen uttryckligen bara täcker material kan arbetet ge ROT; tilläggsarbeten utanför skadan kan faktureras separat med ROT. | [FACT] | K1 67:13 c p.2-3; K3; K12. |
| C11 | Grön teknik och ROT kan aldrig ges för samma arbete; har man fått båda ska ett betalas tillbaka. Separat arbete i samma projekt (t.ex. lägga om taket vid solcellsinstallation, eller **utöka elcentralen vid laddboxinstallation**) kan gå på ROT. | [FACT] | K1 67:13 c p.4 och 67:40 p.1; K3; K8 "kan inte medges för att utöka eller installera en ny elcentral" (grön teknik); K12. GRIND 5. |

**Ampys jobblista mot regelverket** (elektriker signerar, GRIND 2):

| Ampy-jobb | ROT? | Femårsregel-klass [TOLKNING] | Grund |
|---|---|---|---|
| Byta elcentral (likvärdig, samma säkringsstorlek) | Ja, 30 % på arbetet | Reparation/underhåll → ok oavsett värdeår | K4 "installera och komplettera elcentraler"; K14 reparation |
| Byta/utöka elcentral med fler grupper, större huvudsäkring, jordfelsbrytare där det saknades | Ja | Förbättring → ombyggnad → spärrad värdeår 2021-2025 | K14 "förbättringar ses som ombyggnad" |
| Ny elinstallation / nya grupper / dra in el | Ja | Ombyggnad → spärrad 2021-2025 | K4 "dra in el", "modernisera el" |
| Byta uttag, strömbrytare, fast belysning, spotlights | Ja | Byte likvärdigt = reparation; nya punkter = ombyggnad | K4 |
| Utomhusbelysning på fasad/tomt i nära anslutning | Ja (småhus) | Ny = ombyggnad | K4 småhus; K3 "i nära anslutning"; BRF = nej (fasad) |
| El i trädgården, belysning längs gång | Nej | | K4 "dra el i trädgården" |
| Felsökning som egen tjänst | **Nej** | | K4 "enbart felsöka"; K14 HFD 2677-17 |
| Felsökning + reparation samma uppdrag | Ja, hela arbetstiden | Reparation | K14 |
| Elbesiktning, energideklaration, rådgivning | Nej | | K4; K14 "besiktning" |
| Laddbox i småhus | Ja **eller** grön teknik 50 %, aldrig båda; elcentral-utökningen i samband = ROT | Kanon: laddbox → grön teknik | K4; K8; kanon §6.5 |
| Laddbox på BRF:s p-plats/garage | Nej (utanför lägenheten); föreningen är part | | K4 bostadsrätt; K14 |
| Batteri utan solceller | Kanon §6.5 säger ROT 30 % på arbetet; Skatteverket listar "dra el i samband med installation av system för lagring" | [GAP] själva batterimonteringen | K4; K1 67:13 c p.1. GRIND 10 |
| Solceller (arbete) | ROT 30 % arbete **eller** grön teknik 15 % arbete+material, aldrig båda | | K4; K8 |
| Luftvärmepump | Ja; schablon 30 % av totalpris (småhus) | Installation = förbättring/ombyggnad → spärrad 2021-2025 | K14 |
| Larm, kameror, smarta hem, mjukvara | Nej | | K4 |

## D. Pengarna

| # | Regel | Verdict | Källa |
|---|---|---|---|
| D1 | Avdrag = högst **30 % av arbetskostnaden inkl. moms**, draget på fakturan; kunden betalar minst 70 % av arbetskostnaden. Utbetalningen till företaget = 3/7 av vad kunden betalat för arbetet. | Kanon §6.5 (samstämmigt K12, K2 7 §) | K2 7 § "tre sjundedelar"; K3; K12. |
| D2 | Tak: **50 000 kr ROT per person och år**; ROT + RUT tillsammans högst **75 000 kr**. Samma tak för 2026 i både IL 67:19 (slutlig) och HUSFL 7 och 17 §§ (preliminär/utbetalning). Inga separata tak 2026 → ingen grind. | Kanon §6.5 (samstämmigt K1, K2) | K1 67:19 (Lag 2025:322); K2 7 § (Lag 2025:324); K3; K12. |
| D3 | Två ägare: var sin pott (2 × 50 000). Fördelningen mellan ägare som uppfyller villkoren är fri och ska framgå av fakturan. Totalt aldrig mer än 30 % av arbetskostnaden. Båda måste vara ägare **och** bo där; en make/sambo som inte äger kan inte få ROT-delen (men kan få RUT). | [FACT] | K3; K7 exempel Leila/Ali (RV K12): "Den del som avser rotarbete kan inte överföras till Ali eftersom han inte äger huset". |
| D4 | Omfördelning i efterhand: till person i samma hushåll som också äger bostaden och uppfyller villkoren; före deklarationen via brev, i deklarationen, eller via omprövning efter slutskattebesked. Kan även ske mellan köpare utan hushållsgemenskap om villkoren är uppfyllda. Den som lämnar ifrån sig betalar ändå tillbaka sin kvarskatt. | [FACT] | K3 "Omfördela rotavdraget"; K7; K12. |
| D5 | **Betalningsdatumet styr året**, inte fakturadatum eller när jobbet görs. Betalar du år 2 hamnar avdraget år 2 (ny pott). Arbetet måste vara utfört och företagets begäran inne senast 31 januari året efter betalningen. Förskott före årsskifte: arbetet måste vara utfört senast 31 januari. | [FACT] | K3 "Din betalning styr vilket år rotavdraget hamnar på"; K6; K2 8 §. |
| D6 | Delfakturor/a conto: avdraget ska finnas på **varje** faktura; hela avdraget får inte läggas på slutfakturan om arbetet redan betalats. Betalar kunden bara del av fakturan får företaget begära 3/7 av det betalda. | [FACT] | K3 "Delfakturering, a conto och förskottsbetalning"; K12 exempel Kevin. |
| D7 | Avdraget är **preliminärt** vid fakturan (HUSFL 17 §), blir slutligt i deklarationen. Räcker inte skatten läggs den preliminära reduktionen tillbaka som pluspost och kunden får betala mellanskillnaden (kvarskatt). Outnyttjat avdrag kan inte sparas till nästa år. Köparen är ytterst ansvarig, kan få skattetillägg vid oriktig uppgift, återkrav upp till sex år. | [FACT] | K2 17 §; K7 exemplen 100 000/35 000; K12 "Skattereduktionen kan inte heller sparas till nästa år"; K5. |
| D8 | Kunden kan se använt avdrag i e-tjänsten "Mina skattereduktioner för rot, rut och grön teknik" (bara ärenden Skatteverket beslutat); företaget kan inte få ut uppgiften från Skatteverket. Kunden får ett meddelande om preliminär skattereduktion när utbetalning beslutats. | [FACT] | K3 "Har du rotavdrag att använda?"; K3 "Rätta och komplettera". |
| D9 | Ingen begränsning per bostad, bara per person: familj med sju delägare i ett sommarhus kan få 7 × 50 000 om var och en haft utgiften och uppfyller villkoren. | [FACT] | K12 exempel familjen Ek. |

## E. Räcker din skatt? (differentiatorn)

### E1. Vad Skatteverket säger rakt ut
- "Exakt vilken inkomst du måste ha för att kunna utnyttja den maximala skattereduktionen är omöjligt att säga."
  Beror på inkomsttyp, kommunalskatt och underskott av kapital. [FACT src: K5]
- ROT/RUT räknas av mot **kommunal inkomstskatt, statlig inkomstskatt, statlig fastighetsskatt och kommunal
  fastighetsavgift**, och aldrig mot **allmän pensionsavgift, begravningsavgift, kyrkoavgift eller public
  service-avgift** ("Dessa avgifter ska därför alltid betalas"). [FACT src: K1 67:2; K5; K7; K12]
- ROT/RUT medges aldrig med mer än slutlig skatt **efter** reduktionerna för allmän pensionsavgift,
  jobbskatteavdrag och underskott av kapital. [FACT src: K5]
- Räcker inte skatten blir kunden återbetalningsskyldig för mellanskillnaden. [FACT src: K5, K7]

### E2. Avräkningsordningen 2026 (IL 67 kap. 2 §, Lag 2025:1370, i kraft 2026-01-01)
Lagtextens ordning "i nu nämnd ordning": **sjöinkomst → allmän pensionsavgift → arbetsinkomst (jobbskatteavdrag)
→ sjukersättning och aktivitetsersättning → förvärvsinkomst → boende i vissa områden (regional) → underskott av
kapital → hushållsarbete (ROT/RUT) → installation av grön teknik → gåva → avgift till arbetslöshetskassa.**
[FACT src: K1] Rättslig vägledning 2026 lägger dessutom "kommunal fastighetsavgift för pensionärer m.fl."
(lag 2008:826) allra först. [FACT src: K13]

Jobbskatteavdrag, sjuk-/aktivitetsersättning, förvärvsinkomst och regional reduktion får **bara** räknas av mot
kommunal inkomstskatt; övriga (inkl. pensionsavgift, underskott av kapital, ROT/RUT, grön teknik) mot hela poolen
kommunal + statlig + fastighetsskatt + fastighetsavgift. [FACT src: K1 67:2 2 st; K13]

Konsekvens för kalkylatorn: **ROT/RUT ligger före grön teknik.** Räcker skatten inte till båda är det grön
teknik-avdraget som faller bort först (se F). Uppdragets frågelista ("pensionär-fastighetsavgift, sjöinkomst,
pensionsavgift, jobbskatteavdrag, sjuk-/aktivitetsersättning, underskott av kapital, sedan hushållsarbete, sedan
grön teknik, gåvor") stämmer med lagen med ett tillägg: **förvärvsinkomstreduktionen (1 500 kr) och den regionala
reduktionen ligger också före ROT**, och mikroproduktion är borta ur ordningen från 2026 (K1 67:2, K13, jfr kanon
§6.4 "60-öringen avskaffad"). Notera RV-inkonsekvensen i GRIND 9.

### E3. Estimatorn (försvarbar, replikerar Skatteverkets e-tjänst)
Inputs: (a) årsinkomst av lön och/eller pension (kalkylatorn tar månadsbrutto × 12), (b) segment: löntagare under
66 / pensionär 66+ / 66+ som både jobbar och har pension, (c) kommunalskatt, default **32,38 %** (Skatteverkets
snitt 2026, K9), (d) valfritt: ränteutgifter per år (underskott av kapital), (e) fastighetsavgift (villa: 0,75 % av
taxeringsvärdet, max 10 425 kr; 0 för hus byggda 2012 eller senare de första 15 åren; 0 för bostadsrätt eftersom
föreningen betalar). Åldersgränsen 66 gäller "vid beskattningsårets ingång", dvs född 1959 eller tidigare för 2026.

Formler (alla [FACT] ur K1/K9, implementerade i `logik/skatteutrymme_2026.py`):
1. `FI` = fastställd förvärvsinkomst = lön + pension (avrundad nedåt till 100 kr).
2. `GA` = grundavdrag enligt 63 kap. 3 § (0,423 pbb vid låg inkomst, max 0,77 pbb, min 0,293 pbb; avrundas uppåt
   till 100 kr) + för 66+ det särskilda beloppet i 63 kap. 3 a § (2026-lydelsen). Kontroll mot K9: 25 100 / 45 600 /
   17 400 respektive 65 800 / 179 100 / 117 500 kr, allt stämmer.
3. `BFI` = FI − GA. `Kommunal` = BFI × kommunalskatt. `Statlig` = 20 % × max(0, BFI − 643 000).
4. `Pool` = Kommunal + Statlig + fastighetsavgift (+ ev. fastighetsskatt).
5. Före ROT dras: `Pensionsavgift` = 7 % × lön (max 47 100; bara på lön/arbetsinkomst, inte på pension);
   `JSA` enligt 67 kap. 7 § (under 66, fyra intervall med brytpunkter 0,91 / 3,24 / 8,08 pbb, koefficienter 38,74 %,
   25,1 %, tak 3,027 pbb − GA, × kommunalskatt) eller 8 § (66+: 22 % upp till 1,75 pbb, max 0,6293 pbb);
   `Förvärvsinkomst` = 1 500 kr (0,75 % × (BFI − 40 000) i intervallet 40 000-240 000);
   `Underskott av kapital` = 30 % av ränteutgifter upp till 100 000, 21 % därutöver.
6. **Utrymme för ROT/RUT (och därefter grön teknik)** = Pool − Pensionsavgift − JSA − Förvärvsinkomst − Underskott.
7. Redan använt ROT/RUT i år (preliminärt) tar utrymme först; nytt ROT ryms om (använt + nytt) ≤ utrymme; planerad grön
   teknik ryms i det som blir kvar därefter.

Parametrar 2026 [FACT src: K9, K10]: prisbasbelopp 59 200 kr; snittkommunalskatt 32,38 %; skiktgräns 643 000 kr
(brytpunkt 660 400 under 66, 760 500 för 66+); statlig skatt 20 %; allmän pensionsavgift 7 %, max 47 100 kr;
fastighetsavgift småhus max 10 425 kr; inkomstbasbelopp 83 400 kr. Jobbskatteavdragets 2026-lydelse ger som mest
52 390 kr/år vid snittskatt [BERÄKNAT], vilket stämmer med Ekonomifaktas "upp till 4 366 kr per månad"
(ekonomifakta.se/sakomraden/skatt/din-skatt-ar-2026_1246309.html, sekundär kontroll).

**Validering mot Skatteverkets egen e-tjänst (K11), fyra körningar 2026-09-11:**

| Fall i e-tjänsten | Skatteverket | Modellen | Diff |
|---|---|---|---|
| Född 1985, Stockholm (30,55 %), lön 360 000 | 37 594 | 37 594 | 0 |
| Född 1955, Stockholm, pension 240 000 | 35 702 | 35 702 | 0 |
| Född 1985, Stockholm, lön 720 000, ränta 60 000, fastighetsavgift | 140 535 (med okapad avgift 30 000) | 120 960 (avgift kapad 10 425) | 0 efter justering |
| Född 1990, Göteborg (32,60 %), lön 180 000 | 11 881 | 11 880 | −1 (avrundning) |

Skatteverkets tjänst frågar dessutom om sjukpenning/a-kassa, reseavdrag, kapitalinkomster, aktievinster/-förluster
och fastighetsskatt (tomt/byggnad under uppförande) och avvisar näringsidkare, sjuk-/aktivitetsersättning och grön
teknik-beräkningar (hänvisar till "Räkna ut din skatt"). [FACT src: K11] Vår estimator utelämnar dessa medvetet.

### E4. Uppslagstabell [BERÄKNAT]
Månadsbrutto × segment → utrymme (kr) och om det täcker 50 000 kr ROT / 75 000 kr ROT+RUT. Snittkommunalskatt
32,38 %, inga ränteutgifter, "villa" = fastighetsavgift 10 425 kr, "utan" = bostadsrätt eller villa byggd 2012+.

| Månadsbrutto | Löntagare <66, utan | 50k/75k | Löntagare <66, villa | 50k/75k | Pensionär 66+, utan | 50k/75k | Pensionär 66+, villa | 50k/75k |
|---|---|---|---|---|---|---|---|---|
| 15 000 | 11 711 | nej/nej | 22 136 | nej/nej | 24 276 | nej/nej | 34 701 | nej/nej |
| 20 000 | 21 042 | nej/nej | 31 467 | nej/nej | 37 876 | nej/nej | 48 301 | nej/nej |
| 25 000 | 31 094 | nej/nej | 41 519 | nej/nej | 52 015 | ja/nej | 62 440 | ja/nej |
| 30 000 | 41 445 | nej/nej | 51 870 | ja/nej | 66 501 | ja/nej | 76 926 | ja/ja |
| 35 000 | 51 796 | ja/nej | 62 221 | ja/nej | 81 069 | ja/ja | 91 494 | ja/ja |
| 40 000 | 62 300 | ja/nej | 72 725 | ja/nej | 95 931 | ja/ja | 106 356 | ja/ja |
| 45 000 | 77 528 | ja/ja | 87 953 | ja/ja | 115 359 | ja/ja | 125 784 | ja/ja |
| 50 000 | 92 756 | ja/ja | 103 181 | ja/ja | 134 787 | ja/ja | 145 212 | ja/ja |
| 55 000 | 107 984 | ja/ja | 118 409 | ja/ja | 154 215 | ja/ja | 164 640 | ja/ja |
| 60 000 | 138 432 | ja/ja | 148 857 | ja/ja | 185 559 | ja/ja | 195 984 | ja/ja |
| 65 000 | 169 860 | ja/ja | 180 285 | ja/ja | 216 917 | ja/ja | 227 342 | ja/ja |
| 70 000 | 201 288 | ja/ja | 211 713 | ja/ja | 248 345 | ja/ja | 258 770 | ja/ja |
| 75 000 | 232 716 | ja/ja | 243 141 | ja/ja | 279 773 | ja/ja | 290 198 | ja/ja |
| 80 000 | 264 144 | ja/ja | 274 569 | ja/ja | 311 202 | ja/ja | 321 627 | ja/ja |

Trösklar [BERÄKNAT, snittskatt]: löntagare täcker 50 000 kr ROT från ca **34 500 kr/mån** (villa: 29 500), 75 000 kr
ROT+RUT från ca **44 500 kr/mån** (villa: 41 000), ROT 50 000 + grön teknik 50 000 från ca 52 500 (villa: 49 000).
Pensionär 66+ täcker 50 000 från ca **24 500 kr/mån** (villa: 21 000) och 75 000 från ca 33 000 (villa: 29 500).
Garantipensionsnivå 12 000 kr/mån ger bara ca 17 400 kr (villa: 27 800).

Två läsningar som ska bära copyn:
1. **Pensionärer har oftare utrymme än löntagare på samma bruttoinkomst**, eftersom pension varken bär allmän
   pensionsavgift eller jobbskatteavdrag (de två reduktioner som äter mest av löntagarens pool). Det svarar på
   "rotavdrag pensionär" (1 300 sök/mån): ja, pensionärer får ROT; det som begränsar är låg pension, inte åldern.
2. **Bolåneräntan äter utrymmet.** 100 000 kr i ränteutgifter = −30 000 kr utrymme. Löntagare 30 000 kr/mån med villa:
   51 870 utan ränta, 36 870 med 50 000 kr ränta, 21 870 med 100 000 kr ränta, 11 370 med 150 000 kr. Därför måste
   kalkylatorn fråga om ränteutgifter (valfritt), annars ljuger den för unga villaägare.

### E5. Felband
- Modell mot Skatteverkets tjänst med samma inputs: 0 kr i 56 av 75 körningar efter rättningen 2026-09-16 (öretal kapas, pensionsavgift till närmaste hundratal); kvar: regional skattereduktion 1 675 kr i 76 kommuner som inte frågas (research/09). [BERÄKNAT]
- Kommunalskattens spridning (29 % vs 35 %) flyttar utrymmet ±3 500 kr vid 20 000 kr/mån, ±6 300 vid 30 000, ±9 000
  vid 40 000, ±12 600 vid 50 000. [BERÄKNAT] Sveriges lägsta/högsta sats 2026: [GAP], kommunlista ej hämtad (GRIND 7).
- Varje 10 000 kr ränteutgifter = −3 000 kr. Sjukpenning/a-kassa (ingen JSA) ger mer utrymme än lön. Kapitalinkomster
  (ränta, utdelning, vinst vid försäljning av bostad eller aktier) beskattas med 30 % statlig inkomstskatt som **ingår**
  i poolen (65 kap. och 67:2; K15/326366 listar "statlig inkomstskatt på kapitalinkomster" bland de skatter ROT fördelas
  mot; K11 frågar efter dem). De ger alltså **mer** utrymme, t.ex. året man sålt en bostad med vinst. Estimatorn
  utelämnar dem = konservativt. [FACT src: K1 67:2, K15; TOLKNING på konsekvensen]
- Inte modellerat (förenklingar, med hedge i UI): sjöinkomst, sjuk-/aktivitetsersättning, regional skattereduktion
  (1 675 kr i vissa glesbygdskommuner), pensionärers fastighetsavgiftsspärr (4 % av inkomsten), fastighetsskatt på
  tomt/byggnad under uppförande, gåvor och a-kassa (ligger efter ROT och påverkar inte). GRIND 11.
- Ordningsfel i konkurrenternas tabeller: Ungdomskraft anger ~68 000 kr utrymme vid 30 000 kr/mån (32,2 %); Skatteverkets
  tjänst ger 37 594 (Stockholm) och vår modell 41 445 (snitt). Skillnaden är exakt pensionsavgiftsreduktionen + 1 500 kr
  som de missar. [FACT src: K16 + K11, TOLKNING på orsaken]

### E6. Vad kalkylatorn ska fråga (min rekommendation, se rot-spec.md)
Månadsbrutto (slider), inkomsttyp (lön/pension/båda), fyllt 66 före 2026-01-01 (ja/nej), bostadstyp (ger fastighets-
avgiften), valfritt ränteutgifter/år, valfritt kommunalskatt. Ingen lagring, inga personuppgifter. GRIND 6 avgör om
inkomst får frågas alls eller om intervall räcker.

## F. Samspel med grön teknik

| # | Regel | Verdict | Källa |
|---|---|---|---|
| F1 | Grön teknik har eget tak **50 000 kr/person/år**, oberoende av ROT/RUT-taket. Slutbetalningen styr året för grön teknik (från 2025), betalningsdatum för ROT. | Kanon §6.5 (samstämmigt K1 67:45, K8) | K8 "Efter 31 december 2024 är det slutbetalningen som styr". |
| F2 | Aldrig ROT och grön teknik på samma arbete/krona. Vid laddbox: själva laddpunkten, fästet, kabeln till elcentralen och laddkabeln = grön teknik; ny/utökad elcentral = **inte** grön teknik (kan vara ROT). | [FACT] | K1 67:13 c p.4, 67:40 p.1; K8; K3. |
| F3 | Ordning vid otillräcklig skatt: **ROT/RUT räknas av före grön teknik** (67:2). Exempel [BERÄKNAT]: utrymme 72 725 (löntagare 40 000 kr/mån, villa), ROT 50 000 + grön teknik 50 000 → ROT ryms helt, grön teknik ryms med 22 725, resterande 27 275 kr grön teknik blir kvarskatt. | [FACT] + [BERÄKNAT] | K1 67:2; K13; testfall G20. |
| F4 | Skatteverkets egen ROT/RUT-räknare kan **inte** räkna grön teknik; kunden hänvisas till "Räkna ut din skatt". Här finns vitrummet: ingen räknar ROT + GT + skatteutrymme i ett. | [FACT] | K11; 00-grundning §3. |
| F5 | Omfördelningsexempel A/B i K7: par där ena maken har ROT 25 000 och planerar grön teknik 50 000 kan flytta ROT-delen till den andra ägaren, om den äger bostaden. Kalkylatorn ska nämna omfördelning när skatten inte räcker och det finns två ägare. | [FACT] | K7; K12. |

## G. Processfakta för Ampy

| # | Regel | Verdict | Källa |
|---|---|---|---|
| G1 | **Elektronisk betalning** är lagkrav sedan 2020-01-01 (67:15 a). Godkänt: kontokort, BankID-stöd, Swish, inbetalningskort på bank, via e-tjänst; betalningen ska förmedlas av betaltjänstleverantör och visa avsändare, mottagare, belopp, tidpunkt. Inte godkänt: kontanter, check, presentkort (utom spårbara digitala), kryptovaluta. Kreditbolag/factoring ok med särskilda regler. | [FACT] | K1 67:15 a; K3 "Elektronisk betalning"; K12. |
| G2 | **F-skatt**: utföraren ska vara godkänd när avtalet träffas eller när kunden betalar. Blir företaget godkänt efter betalning: ingen utbetalning. Kunden kan kontrollera i "Hämta företagsinformation". Ampy Nordic AB har F-skattsedel [FACT src: ampy-foretagsdata §1.1, självdeklarerat]; org.nr [GAP]. | [FACT] | K1 67:16; K3. |
| G3 | **Fakturamodellen (lagmekaniken):** utföraren fakturerar med avdraget draget på fakturan; kunden betalar sin del; när arbetet är **utfört och betalt** begär utföraren utbetalning elektroniskt från Skatteverket (3/7 av det kunden betalat för arbetet, dvs 30 %); Skatteverket betalar till utförarens konto och kunden tillgodoräknas preliminär skattereduktion; begäran senast 31 januari året efter betalningen. Modellen är **inte tvingande**: utförare och köpare måste vara överens innan arbetet börjar, och det går inte att yrka ROT i efterhand i deklarationen. | [FACT] | K2 6-8, 11-12, 17 §§; K12 "Fakturamodellen är inte tvingande". GRIND 1. |
| G4 | Vad kunden ska lämna: personnummer; fastighetsbeteckning (småhus, finns under Mina sidor » Fastigheter) eller bostadsrättsföreningens organisationsnummer + lägenhetsnummer (vanligen fyra siffror); ibland köpehandlingar (nyköpt utan lagfart) eller arrendeavtal (ofri grund). Gäller även vid skyddade personuppgifter. | [FACT] | K3 "Se till att ge företaget rätt uppgifter"; K2 9-9 a §§. |
| G5 | Utföraren ska i begäran ange debiterad ersättning för arbete, material och övrigt, betalt belopp, betaldatum, vad arbetet avsett och antal arbetade timmar. Det är utföraren som vid kontroll ska kunna visa att material inte ingår i arbetskostnaden; kan hen inte det uppskattar Skatteverket en skälig arbetskostnad (HFD 2017 ref. 46). | [FACT] | K2 9 §; K12 "Uppskattning av skälig arbetskostnad". |
| G6 | Företaget har rätt till utbetalning även om kunden är missnöjd (civilrättslig tvist). Fel kan rättas före begäran; efterhandskonstruktioner (kreditera + ny betalning efter kontant betalning, saknad F-skatt eller försenad begäran) godtas inte. | [FACT] | K3 "Brister och ej utfört arbete"; K3 "Rätta fel". |
| G7 | Timing för kunden: preliminärt avdrag syns i deklarationen om Skatteverket fått begäran före 1 mars året efter; annars på slutskattebeskedet. Kunden ser sina avdrag på Mina sidor / "Mina skattereduktioner". | [FACT] | K6; K3. |
| G8 | Skatteverket kan kräva tillbaka felaktigt avdrag i upp till sex år; återkravet riktas mot företaget eller kunden beroende på utredningen. | [FACT] | K7 "Avdrag på felaktiga grunder". |

## H. Segmentfrågorna folk googlar (svarsutkast, ampy-rost, "kan" på skatteutfall)

**Pensionär (1 300 sök/mån).** Ja, du kan få ROT som pensionär, det finns ingen åldersgräns uppåt. Det som avgör är
hur mycket skatt du betalar, för avdraget räknas av mot din kommunala och statliga inkomstskatt och fastighetsavgiften,
aldrig mot begravnings- eller kyrkoavgiften. En pension på 25 000 kr i månaden ger ungefär 50 000 kr i utrymme vid
snittskatt, en pension på 15 000 kr runt 24 000 kr, och äger du en villa tillkommer fastighetsavgiften på upp till
10 425 kr. Räcker inte skatten får du betala tillbaka mellanskillnaden på slutskattebeskedet, så räkna först.
[FACT src: K1 67:2, K5, K9; BERÄKNAT tabell E4]

**Bostadsrätt (320).** Ja, om du är bostadsrättshavare och jobbet görs inne i lägenheten, innanför tak, väggar och golv,
och gäller sådant du själv ansvarar för enligt föreningens stadgar. Byte av elcentralen i lägenheten, nya uttag, nya
ledningar från proppskåpet och infälld belysning kan ge ROT. Fasad, trapphus, förråd, garage och laddbox på föreningens
p-plats kan inte, där är föreningen part. Det gäller även om bostadsrätten är ett radhus. Du behöver föreningens
organisationsnummer och ditt lägenhetsnummer till fakturan. [FACT src: K1 67:13 b, K4, K14, K6]

**Fritidshus (320).** Ja, ett fritidshus du äger och själv använder räknas som bostad, med samma regler som villan:
30 procent av arbetskostnaden, taket 50 000 kr per person och år delas med jobb i din permanentbostad. Femårsregeln
gäller för om- och tillbyggnad om stugan är nybyggd, reparationer går alltid. Bor någon annan där permanent, eller hyr
du ut det, gäller inte avdraget. [FACT src: K3, K12, K14]

**Hyresrätt (170).** Nej. ROT förutsätter att du äger bostaden: småhus, bostadsrätt eller ägarlägenhet. I en hyresrätt
är det hyresvärden som äger och ansvarar för elen, så vänd dig dit om något behöver göras. Vill du ändå anlita en
elektriker för något du själv får göra i lägenheten går det förstås, men utan avdrag. [FACT src: K1 67:13 a-b, K3, K14]

**Nybyggt hus (110).** Delvis. Reparationer och underhåll ger ROT oavsett husets ålder, men om- och tillbyggnad, dit
Skatteverket även räknar förbättringar som en större elcentral eller nya elgrupper, ger inget avdrag de fem första
kalenderåren efter värdeåret. För jobb 2026 betyder det att huset behöver värdeår 2020 eller tidigare; värdeåret står i
ditt senaste fastighetstaxeringsbeslut. Är huset inte ens taxerat som färdigställt kan inget elarbete få ROT, det
räknas som del av bygget. Bostadsrättslägenheter och ägarlägenheter har ingen femårsregel. [FACT src: K1 67:13 c p.5,
K3, K4, K14]

---

## GRINDLISTA (ägar- eller elektrikersignering krävs innan verktyget låses)

1. **Fakturamodellen hos Ampy.** Lagen gör den frivillig (K12 "inte tvingande"). Bekräfta att Ampy alltid drar ROT direkt
   på fakturan och begär utbetalning för alla ROT-jobb, annars stryks "du ligger aldrig ute med pengarna". (= GAP 1 i
   00-grundning §6 sedan 2026-08-14.)
2. **Jobbkatalog med femårsklass.** Elektriker signerar tabellen i §C: vilka Ampy-jobb är reparation/underhåll (ok oavsett
   värdeår) och vilka är förbättring/ombyggnad (spärrade 2021-2025), plus typisk arbetskostnadsandel per jobbtyp för
   "vet inte"-läget i beloppssteget. (= fråga 2 i 00-grundning §6.)
3. **Felsökning.** Skatteverket: "enbart felsöka" = 0 % ROT; felsökning som moment i reparation = ROT. Bekräfta att Ampys
   offert-/faktureringspraxis skiljer på de två och att /elservice/felsökning-sidan inte lovar ROT.
4. **Framkörning/resor.** Resekostnad måste debiteras separat och får inte "bjudas på" (K3). Bekräfta hur Ampys
   framkörningsavgift och minimidebitering redovisas på fakturan (öppen grind sedan service-annonspaketet).
5. **Laddbox och elcentral på samma faktura.** Laddpunkten går på grön teknik, elcentral-utökningen på ROT (K8). Bekräfta
   att fakturan delas så och att säljarna vet att båda avdragen aldrig får gälla samma arbete.
6. **Får verktyget fråga om inkomst?** Månadsbrutto behövs för ett ärligt "räcker skatten"-svar (ingen lagring). Alternativ:
   intervallväljare. Ägarbeslut. (= fråga 3 i 00-grundning §6.)
7. **Kommunalskatt.** Default 32,38 % (snitt) med valfritt eget värde, eller kommunväljare (290 rader, SCB-tabell ej hämtad,
   [GAP]). Bandet vid snitt är ±6 000 kr vid 30 000 kr/mån.
8. **Fördelning mellan två ägare.** Verktyget föreslår att fylla den ägare med störst pott/utrymme först. Bekräfta att Ampys
   fakturarutin kan ta två personnummer och fri fördelning.
9. **RV-inkonsekvensen om ordningen.** Lagen (67:2) och RV:s ordningssida (K13) säger ROT/RUT före grön teknik; RV:s
   villkorssida (K12) skriver tvärtom i en mening. Verktyget följer lagen. Ingen åtgärd, men ägaren ska veta det, och
   en kontrollkörning i Skatteverkets "Räkna ut din skatt" med ROT + grön teknik samtidigt är [GAP].
10. **Batteri utan solceller = ROT 30 % på arbetet** står som [FACT] i kanon §6.5. Skatteverket listar "dra el i samband med
    installation av system för lagring" som ROT, men "enbart installation av inventarier" är inte ROT (13 c § p.1).
    Elektriker/skatteexpert signerar innan GT-kalkylatorn lovar ROT-fallback på fristående batteri.
11. **Förenklingar i estimatorn** (ingen sjöinkomst, sjuk-/aktivitetsersättning, regional reduktion, pensionärsspärr på
    fastighetsavgift, fastighetsskatt på tomt). Acceptera med hedge i UI, eller bygg fler fält.
12. **66 blir 67 år 2027** (K1 63:3 a, K10). Verktyget behöver en årsväxel för åldersgränsen och parametrarna; ägaren äger
    underhållsrutinen inför 2027.
13. **Geografi.** Bostad inom EES/Schweiz kan ge ROT, men verktyget avgränsas till bostad i Sverige. Bekräfta.
14. **Artikelrättelser** (se Motsägelser nedan): "bostad äldre än 5 år" som generellt villkor, och alla "aldrig ute med
    pengarna"-formuleringar.

## Motsägelser mot kanon och artikeln

**Mot `ampy-foretagsdata` §6.5 (kanon):**
- ROT 30 %, 50 000 kr, 75 000 kr ROT+RUT, arbetskostnad only, återgång 2026-01-01: **ingen motsägelse**, allt samstämmigt
  med K1 (Lag 2025:322/324) och K10.
- "Battery-WITHOUT-solar instead uses ROT 30 % of labour" [FACT i kanon]: **delvis stöd**. Skatteverket ger ROT för el-
  dragningen vid lagringsinstallation; om själva batterimonteringen är "installation av inventarier" utan byggarbete är
  den inte ROT. → GRIND 10 (skärper kanonens [FACT] till [TOLKNING] tills signerat).
- Kanon saknar villkoren (5-årsregeln, äga/bo, 18 år, avräkningsordning, F-skatt, e-betalning). De är nu belagda i A-G
  och kan kanoniseras efter GRIND-signering (Personal-OS-chatt, aldrig härifrån).

**Mot artikeln /rot-avdrag-2026/ (00-grundning §2):**
- Artikeln listar "bostad äldre än 5 år" som ett allmänt villkor. Skatteverket: femårsregeln spärrar bara om- och
  tillbyggnad; reparation/underhåll ger ROT oavsett ålder; bostadsrättslägenheter/ägarlägenheter har ingen femårsregel.
  → rättelse (GRIND 14). Samma fel finns i Avdragskollens fråga 2 ("Är bostaden äldre än fem år?" → "Nej" ger
  kategoriskt nej) i `rot-gt-cro/research/underlag/riktning-C.md`; UX-agenten ska ärva B5/B6, inte den frågan.
- "100 000 kr för två delägare": stämmer, med villkoret att båda äger **och** bor där (D3).
- "Tillfälliga 50 % upphörde 2025-12-31": stämmer (Lag 2025:323 i kraft 2025-05-12, Lag 2025:322/324 i kraft 2026-01-01).
- "Vi sköter hela ROT-processen": stämmer med fakturamodellen men förutsätter GRIND 1.
- Artikelns villkorslista saknar: bidrag/försäkringsersättning (C10), felsökningsundantaget (C7), att betalningsdatumet
  styr året (D5), och att avdraget är preliminärt med återbetalningsrisk (D7). Förslag: lägg in dem, verktyget bär dem
  redan.

**Mot uppdragsbriefen:**
- Briefen frågar om "allmän pensionsavgift" kan kvittas: **nej** (K5, K7, K12). Pensionsavgiften betalas alltid; dess
  100-procentiga reduktion äter dessutom av poolen före ROT (K1 67:2).
- Briefen antar "mikroproduktion" sist i ordningen: borta ur 67:2 från 2026 (K1, kanon §6.4).
- Briefen frågar om separata tak 2026: **nej**, 50 000/75 000 gäller identiskt i IL och HUSFL (D2).
