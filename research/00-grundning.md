# 00 · Grundning (mätt 2026-09-11, innan någon agent startade)

Allt nedan är hämtat, inte gissat. Källa står vid varje rad. `[GAP]` = saknas, hittas inte på.

## 1. Uppdraget (Julius, 2026-09-11, ordagrant i kortform)

- Två artiklar ska ranka över tid: `https://ampy.se/rot-avdrag-2026/` och `https://ampy.se/gron-teknik-2026/`.
- Bygg en **ROT-kalkylator** och en **Grön Teknik-kalkylator**: samma design, olika logik.
- Kärnfrågan kunderna ställer dagligen: *"Är jag berättigad till ROT-avdraget / grön teknik-avdraget?"*
- Villkoren han räknar upp: maxbelopp · kombination ROT+RUT · bara arbete (ROT) · ålder · tillräckligt
  mycket skatt · boende · F-skattsedel · elektronisk betalning. Och: kunna räkna, t.ex. *"skriva in hur
  mycket skatt de har betalat förra året"*.
- Placering: **embeddad i början av båda artiklarna** (SEO + intent) **och** en länk säljarna kan skicka
  till kunder som frågar.
- Inget kontaktformulär i verktyget. Ska bygga tillräckligt förtroende för att kunden ev. konverterar.
- Leverans: research + **minst tre wireframes**, agentteam: research · design · UX · ROT · grön teknik ·
  leadmagnet. Repo: `https://github.com/julius447/ROT-GT-Calculator` (tomt, publikt, 2026-09-11).

## 2. De två artiklarna i dag (hämtade live 2026-09-11 via WebFetch)

### /rot-avdrag-2026/ (publicerad 30/01/26, byline Julius Callahan)
H1 "ROT avdrag 2026: Allt du behöver veta". H2-kedja: Sammanfattning → Snabbfakta → Vad är ROT →
Vad omfattas inte → Vem kan få ROT 2026 → Prisexempel → Taket 75 000 (ROT+RUT) → Vad har hänt sedan
förra året → Vanliga misstag → Vi sköter hela ROT-processen → Sammanfattning. FAQ: hur mycket · måste
jag ansöka själv · kombinera ROT och grön teknik · pott slut.
Siffror artikeln påstår: 30 % · 50 000 kr/person/år · 75 000 kr ROT+RUT gemensamt · 5-årsregeln
(räknas från värdeår) · 100 000 kr för två delägare · tillfälliga 50 % upphörde 2025-12-31.
Villkor artikeln påstår: äga helt/delvis + bo (permanent, fritidshus eller förälders bostad) · bostad
äldre än 5 år · tillräcklig skatt · elektronisk betalning (Swish/kort/bank, kontant diskvalificerar) ·
utföraren har F-skatt · ROT max 50 000 inom 75 000-taket.
**Observation:** adressen i artikeln är "Västbergavägen 25, 126 30 Hägersten" medan datalagret säger
Ankdammsgatan 33, Solna (känd [GAP] sedan tidigare, rör inte det här uppdraget).

### /gron-teknik-2026/ (publicerad 30 jan 2026, byline Julius Callahan)
H1 "Grön Teknik 2026: Allt du behöver veta". Snabbfakta: laddbox 50 % (arbete+material) · batteri 50 % ·
solceller 15 % · max 50 000 kr/person/år · krav auktoriserat elföretag + material från samma företag.
H2: Vad är grön teknik → Vem har rätt → Skatteunderlaget: din personliga gräns → Materialfällan →
Prisexempel → Laddboxar/V2G → Batteriboomen → Solcellsbatterier → Tekniska krav (batteri kopplat till
egen förnybar produktion, ökar egenanvändning, certifierad elektriker) → GT vs ROT → Varför Ampy.
FAQ: bostadsrätt · värmepump (nej, ROT i stället) · redan använt ROT (egen pott 50 000) · räcker skatten
(Skatteverkets e-tjänst).
**Observation (utanför uppdraget, noteras bara):** artikeln påstår "återbetalningstid ofta under 4 år"
för batteri; datalagret §6.6 säger 7–12 år som försvarbart 2026. Verktyget ska inte ärva den siffran.

## 3. Sökdata (mätt 2026-09-11)

### Google Search Console, sc-domain:ampy.se, 2026-03-01 → 2026-09-09
- `/rot-avdrag-2026/`: **0 klick, 13 visningar, alla på "site:ampy.se"**. Ingen riktig sökfråga.
- `/gron-teknik-2026/`: "grön teknik 2026" 3 visningar pos 82; "skatteverket grönt avdrag batteri 2026"
  1 visning pos 89. 0 klick.
- Hela domänen, frågor som innehåller rot/grön teknik/avdrag/skattereduktion (2026-06 → 09): inga äkta
  träffar (bara "idrottshall", "strömavbrott" som regex-brus).
**Slutsats:** baslinjen är noll. Artiklarna rankar inte i dag. Verktyget bygger från ingenting.

### DataForSEO, Google Ads-volym, Sverige/sv (snitt 12 mån t.o.m. 2026-07)
| Sökfras | Vol/mån | Not |
|---|---|---|
| rotavdrag 2026 / rot avdrag 2026 | **14 800** | topp 22 200 i jan+mars, 5 400 aug 2025 → säsong: årsskifte + vår |
| rotavdrag | 6 600 | fallande från 12 100 (aug 2025) |
| rot avdrag | 3 600 | |
| rotavdrag pensionär | **1 300** | egen segmentfråga: räcker pensionärens skatt |
| grön teknik avdrag | 880 | CPC 2,95 USD, konkurrens MEDIUM |
| hur fungerar rotavdrag | 720 | |
| rotavdrag regler | 480 | |
| räkna ut rotavdrag | **390** | den direkta kalkylatorfrågan |
| grönt avdrag | 390 | |
| rotavdrag bostadsrätt | 320 | |
| rotavdrag fritidshus | 320 | |
| rotavdrag hur mycket | 320 | |
| grön teknik 2026 | 170 | |
| skattereduktion grön teknik | 170 | |
| rotavdrag hyresrätt | 170 | (svaret är nej, men frågan ställs) |
| rotavdrag skatteverket | 170 | |
| vem har rätt till rotavdrag | 140 | |
| rotavdrag maxbelopp | 140 | |
| rotavdrag nybyggt hus | 110 | 5-årsregeln |
| rotavdrag elektriker | 90 | CPC 4,14 USD |
| har jag rätt till rotavdrag | 70 | |
| rot kalkylator / rotavdrag kalkylator | 40 / 30 | |
| grön teknik laddbox | 30 | konkurrens HIGH |
| rotavdrag 5 år / nyproduktion / villkor / skatt | 20 / 20 / 10 / 10 | |
| grön teknik kalkylator · räkna ut grön teknik · grön teknik avdrag 2026 · rot och rut samma år · grön teknik batteri utan solceller · grön teknik bostadsrätt · rotavdrag elcentral · grön teknik solceller 2026 · grön teknik batteri 2026 | ingen data | Google Ads rapporterar 0/okänt |

**Läsning:** ROT-intentet är stort och kalkylator-intentet finns (390 + 320 + 140 + 70 + 40 + 30).
Grön teknik-intentet är ~1/15 av ROT-intentet men dyrare (CPC 3 USD) och kommersiellt närmare
laddbox/batteri. "Pensionär", "bostadsrätt", "fritidshus", "hyresrätt", "nybyggt hus" är de fem
segmentfrågorna folk faktiskt googlar, dvs kalkylatorns segmentväljare ska kunna svara på just dem.

### SERP "räkna ut rotavdrag" (Sverige, 2026-09-11, topp 19 organiska)
1. **Skatteverket: "Räkna ut rot- och rutavdrag"** www7.skatteverket.se/portal/rot-rut (officiell tjänst, "hur mycket rot- eller rutavdrag du kan få under 2026")
2. mowin.com/sv/kalkylatorer/rot ("BÄSTA ROTRÄKNAREN (30%)")
3. rotavdragen.se/rakna-ut-rotavdraget
4. skattereduktion.se (snippet säger fortfarande "multiplicerar med 0,5" = inaktuellt 2025-tal)
5. ekonomifokus.se (delar upp på flera personer, tar hänsyn till taken)
6. jamforbokforingsprogram.se/rot-rut-kalkylator
7. sv.fieldly.com/resurser/verktyg/rot-avdrag
8. dryft.se/rot-avdrag
9. **ungdomskraft.com/guide/kalkyl-rut-rot** ("baserat på din lön och skattesats", tabeller per lönenivå = närmast Julius "hur mycket skatt")
10. mrpotato.se/rot-rut-kalkylator (hantverkarperspektiv)
11. svartbackens.se (snippet: "50 % … ROT och RUT delar på samma skatteutrymme, max 75 000")
12. svenskoffertpartner.se/rot-avdrag-kalkylator
13. **Skatteverket FAQ "Hur mycket måste jag tjäna för att kunna utnyttja maximal skattereduktion"** (snippet: "rot och rut räknas ihop, högst 75 000 kr per person och år")
14. byggexp.se · 15. mowin rut · 16. bliqat.com/rot-kalkylator · 17. omvero.se/rot-kalkylator · 18. ungdomskraft (dubblett) · 19. **konsumentverket.se "Rotavdrag – vad gäller?"** (hänvisar till Skatteverkets "Räkna ut din skatt")

**Läsning:** SERP:en är full av enkla "arbetskostnad × 0,3"-räknare, flera med inaktuella tal. Ingen av de
19 kombinerar *berättigad?* + *räcker skatten?* + *belopp* i ett verktyg. Det är vitrummet.

### SERP "grön teknik avdrag" (Sverige, 2026-09-11, topp 18)
1. **Skatteverket "Grön teknik - Privat"** (snippet: "beror på hur mycket skatt du har betalat in")
2. Energimyndigheten solelportalen (15 % sol / 50 % lagring)
3. eon.se artikel · 4. laddboxbolaget.se/gron-teknik-2026 · 5. dalakraft.se · 6. ttenergi.se (GT vs ROT) ·
7. dt-energi.se · 8. 1komma5.com (gemensamt tak, sol+batteri+laddbox räknas ihop) · 9. dryft.se ·
10. revisi.se (företag) · 11. Skatteverket företag · 12. aderbys.se · 13. elkedjan.se · 14. oresundskraft
(inaktuellt 20 %) · 15. lundqvistel.se · 16. vattenfall.se (GT eller ROT 30 % på arbetet för sol) ·
17. enklaelbolaget.se (inaktuellt 20 %) · 18. kopernicus.se (batteririktlinjer).
**Läsning:** inga kalkylatorer alls i topp 18, bara artiklar, flera med gamla satser. Vitrummet är ännu
tydligare för grön teknik.

## 4. Kanon som styr (läs innan du skriver en siffra)

- `ampy-foretagsdata.md` §6.5: **ROT 30 %** av arbetskostnad, tak 50 000 kr ROT / 75 000 kr ROT+RUT;
  **grön teknik sol 15 % · batteri 50 % · laddbox 50 %**, tak 50 000 kr/person/år (2 ägare → 100 000),
  arbete + material; batteri solcellsgrindat; ROT och GT dubblar aldrig på samma krona; 60-öringen
  avskaffad. Satserna är **ägarbekräftade** (CLAUDE.md regel 5): **webb-kolla inte satserna**, flagga
  bara interna motsägelser. Villkor (5-årsregeln, äga/bo, 18 år, avräkningsordning, F-skatt, e-betalning)
  är däremot **inte** kanoniserade → de ska beläggas mot Skatteverket med källa, och varje avvikelse mot
  kanon eller mot artiklarna skrivs som **grind**, aldrig tyst överskriven.
- `ampy-foretagsdata.md` §1.1: Ampy Nordic AB har F-skattsedel [FACT src: /rot-avdrag-2026/]; org.nr [GAP].
- `ampy-foretagsdata.md` §11.1 kvalitetsribban (5 punkter), §11.2 signaturenhet (EN per verktyg), §11.3
  två layoutfamiljer, §11.4 token-defekter.
- `.claude/skills/ampy-wireframe-ux/SKILL.md`: **en skärm, ingen wizard, instant value på load,
  begränsade inputs, live-omräkning, progressive disclosure, EN CTA, värde före ask, "Så har vi räknat"**.
  Diagnostikfamiljen tillåter "tap-only questions, one screen" med verdict.
- `.claude/skills/ampy-rost/SKILL.md`: du-tilltal, "kan" på skatte-/juridikutfall, inga em-dash i UI,
  utropstecken tillåtna doserat (ägardirektiv 2026-07-15), "hela Sverige" tillåtet.
- Ägardirektiv (Personal-OS `20-Bolag/Ampy/direktiv.md`): fullbreddsregeln; Outfit stannar; inga
  midnattsblå gradient-scrims; verktyg som är godkända rörs inte; register = allvarligt på ekonomi-sidor.
- Kvalitetsribban (Personal-OS): mobil 390×844 · inga AI-tells (em-dash, mittpunkt "·" i UI, gradienttext,
  fluff) · bevis före påstående · tre divergenta riktningar · öppna frågor som numrerad grindlista.

## 5. Tidigare arbete att bygga på (repona är sanningen)

- `rot-gt-cro/research/underlag/riktning-C.md` + `granskning-C.md`: **"Avdragskollen"**, en 2-trycks
  mikrodiagnostik i processblocket. Granskningen fann: (1) gemensam GT-frågebank ger **falskt besked på
  laddbox** (laddbox är inte solcellsgrindad, bara batteri) → lägen måste vara `rot | gt_batteri |
  gt_laddbox | gt_sol`; (2) kombinationsmatrisen måste vara komplett med prioritetsordning; (3) efter
  besked får bara EN primär CTA finnas; (4) "aldrig ute med pengarna" är ogrindat → fakturamodellen är
  ägargrind; (5) hyresrättsbesked ska peka på hyresvärden, inte sälja.
- `rot-gt-cro/` (julius447/ROT-GT-CRO-, live Pages): processblocken, familjens H2-mall "[jobb] med
  [sats] % [avdrag]", finstilten "Taket är 50 000 kr per person och år. Du får avdraget som privatperson
  om du äger bostaden och betalar skatt." (hedging-direktivet: villkoret EN gång).
- `elcentral-kollen/` och `ampy-behorighetskollen/`: diagnostikfamiljens levande referenser (rail + stage,
  trust-bullets, verdict).
- Tokens: `wireframes/_shared/tokens.css` (= `.claude/skills/ampy-design-system/reference/tokens.css`),
  Outfit self-hostad i `wireframes/_shared/fonts/`.

## 6. Öppna frågor redan nu (fylls på av agenterna, samlas i GRINDLISTA.md)

1. Fakturamodellen för ROT: drar Ampy alltid avdraget direkt på fakturan? (GAP 1 sedan 2026-08-14.)
2. Vilka av Ampys jobb är ROT-berättigade respektive grön teknik, och hur stor är arbetskostnadsandelen
   typiskt (ROT gäller bara arbete) per jobbtyp? Julius är datakällan.
3. Ska verktyget be om inkomst/skatt (känsligt) eller nöja sig med "räcker/räcker inte"-intervall?
4. Länkstrategi: egen URL (/rot-kalkylator/) + embed i artikeln, eller bara embed? Delbar länk med
   förifyllt läge?
