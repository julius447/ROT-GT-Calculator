# 05 Leadmagnet och konvertering: förtroende utan formulär (leadmagnet-agenten, 2026-09-11)

Bygger på `04-ux-flode.md` (§3 beskedsklasser, §4 resultatstack, §5 CTA, §6 embed, §7 delbar länk tas som
givna), `03-marknad-och-konkurrens.md` (§D, §E, mönstren att stjäla), `01-rot-regelverk.md` §G och §H,
`02-gron-teknik-regelverk.md` §F och §H, `logik/rot-spec.md` §5 till 6 och `logik/gt-spec.md` §5 till 6.
Källorna, med URL och citat, ligger i `research/underlag/leadmagnet-kallor.md`. Copyreglerna för
copy-passet ligger i `logik/copy-doktrin.md`.

Taggar: `[FACT src]` står i källan. `[BEDÖMNING]` är min slutsats. `[GAP]` saknas, fylls inte med gissning.
`LM-1` till `LM-3` är de tre nya ägargrindarna (sist i filen). Befintliga grindar refereras som
`ROT GRIND n` (01-rot-regelverk), `GT GRIND n` (02-gron-teknik-regelverk) och `UX fråga n` (04-ux-flode §12).

Konventioner i UI-strängar: du-tilltal, "kan" på allt Skatteverket avgör, inga tankstreck, inga mittpunkter,
"30 %", "50 000 kr". Alla UI-strängar är utkast; `ampy-rost` har sista ordet, doktrinen står i `copy-doktrin.md`.

---

## 0. Bevis på grundning (vad som faktiskt öppnades)

| Källa | Vad jag tog med mig |
|---|---|
| `research/00-grundning.md` | uppdraget (inget formulär i verktyget, säljlänk), sökdatan, vitrummet, ägardirektiven |
| `research/04-ux-flode.md` §3 till 7, §10, §12 | beskedsklasser, kortets stack, en primär per klass, embed-budget, delbar länk, events, öppna frågor |
| `research/03-marknad-och-konkurrens.md` §D, §E, "Stjäl/Undvik", "referensverktyget" | källa + datum per regel, "vi sparar inget" intill fältet, preliminär-orden, FAQPage utan betyg, canonical utan query |
| `research/01-rot-regelverk.md` §G, §H, GRINDLISTA | fakturamodellen är frivillig för ROT (GRIND 1), vad kunden lämnar (G4), timing (G3, G7), segmentsvaren |
| `research/02-gron-teknik-regelverk.md` §F, §H, §I | fakturamodellen är obligatorisk för grön teknik, 31 januari, "vem betalar tillbaka", vad kalkylatorn inte får påstå |
| `logik/rot-spec.md` §5 till 6, `logik/gt-spec.md` §5 till 6 | de obligatoriska hedgarna, utkast till verdict-copy och CTA per klass |
| `ampy-foretagsdata.md` §1.1, §2.2, §2.3, §7, §8.1 till 8.3, §10.1, §11.1 | F-skatt [FACT], Elsäkerhetsverket-id 12047521, org.nr [GAP], candour som kostsam signal, relayer-mekaniken, publiken jagar haken, guldstandard-strängar, kvalitetsribbans punkt 4 och 5 |
| `.claude/skills/ampy-rost/SKILL.md` + `rost-samples.md` | de tolv reglerna, värme där sanningen är god, trust-tripletten, disclaimers |
| `.claude/skills/ampy-webb-playbook/SKILL.md` §1, §3, §5 + `instrumentation.md` §6 till 7 | spine, lead-magnet-doktrinen, experimentordning, KPI = kvalificerade leads per 1 000 |
| `.claude/skills/lead-magnets/SKILL.md`, `free-tools/SKILL.md` | bara hantverk: "ungated + optional" är rätt gate för verktyg, kalkylatorer för beslut med siffror. Deras e-postfångst gäller inte (ägarkrav) |
| **https://ampy.se/offert/ (live, curl + WebFetch)** | **301 till `/kontakt/` och query-strängen tappas** (se §1.4). Bricks-formulär med 8 fält + valfritt meddelande, dolda fält `ampy_tracking` och `form_type=Kontakt`, rubrik "Få en kostnadsfri rådgivning", knapp "Gratis rådgivning", "Vi ringer dig inom 24 timmar" |
| **`ampy.se/wp-content/cache/flying-press/…59-ampy-tracking-fix.js` (live)** | attributionsskriptet: whitelist av utm/gclid m.fl., `source_url` med full query för sessionens första sida, `visitor_journey` utan query, consent-gatad lagring, fyller `ampy_tracking` i varje formulär |
| **Elsäkerhetsverket "Kolla elföretaget" `?foretag=12047521` (live)** | visar "Ampy Nordic AB", verksamhetstyper, adress Västbergavägen 25, Hägersten, info@ampy.se |
| **Skatteverket "Hämta företagsinformation" (live)** + K3 | "I tjänsten kan du se om ett företag är godkänt för F-skatt"; kräver sökning på företaget |
| `elcentral-kollen/data/elcentralkollen-data.json` + `assets/elcentralkollen.js` | hur ett levande Ampy-verktyg lämnar över: `Kontakta oss` som länk till `/offert/` i ny flik, tel-länk, inbyggt 4-fältsformulär (som vi inte får ha), `ec_surface` på alla events |
| https://ampy.se/rot-avdrag-2026/ och /gron-teknik-2026/ (live) | Ampys egna processpåståenden ("vi sköter hela ROT-processen", "Du behöver inte ligga ute med pengarna") som verktyget måste harmoniera med eller rätta |

Inte gjort: ingen webb-kontroll av satser (CLAUDE.md regel 5). Ingen konkurrentkalkylator öppnad (läsningen
kommer från 00 och 03). Inga sub-agenter.

---

## 1. Konverteringsmekaniken utan formulär

### 1.1 Varför ett verktyg utan formulär kan konvertera bättre än ett med
Publiken (§7.1) läser för att hitta haken. Ett formulär i verktyget är haken: "de vill ha min mejl innan
jag får svaret". Utan formulär flyttas bytet: kunden får hela svaret, och det enda Ampy ber om är att få
ge det exakta beloppet. Det är lead-magnet-doktrinens kärna (playbook §3: värdet är alltid gratis, asken
kommer efter resultatet), bara dragen ett steg längre: asken bor på `/kontakt/`, inte i verktyget.
Konverteringen är alltså inte "fyll i", utan **"få den exakta versionen av siffran du just såg"**.
Verktyget stannar med flit vid "preliminärt"; offerten är där precisionen bor. Den inbyggda anledningen
att be om pris är raden "Exakt belopp står på offerten", inte en knapp som skriker.

### 1.2 Förtroendetrappan: fyra steg, tre övergångar

| Steg | Kunden tänker | Vad som bär honom till nästa steg |
|---|---|---|
| 1 Öppnade länken | "Vad vill de mig?" | Inget begärs. Beskedet finns från första sekunden och säger vad det antar |
| 2 Tror på beskedet | "Stämmer det här för mig?" | Ärliga nej, bandet i stället för punkten, källa + datum, Skatteverket som facit |
| 3 Tror att Ampy sköter det | "Blir det krångel, eller står jag med räkningen?" | "Det sköter vi"-raderna, "Vad händer nu" i tre lagfästa steg, raden om vem som betalar om skatten inte räcker, tredjepartslänkarna |
| 4 Ber om pris | "Vad kostar just mitt jobb?" | En primär handling som bär hans svar med sig, och som säger vad som händer när han trycker |

**Övergång 1 till 2, ögonblicken som förtjänar tilltron** (i den ordning kunden möter dem):
1. **Beskedet ljuger inte på load.** "Ja, om det här stämmer:" med hålringar (UX §1.4). Ett grönt "Ja" till
   en okänd besökare är det första en hakjägare fångar. Att beskedet namnger sina antaganden är den
   första kostsamma signalen: vi säger inte ja förrän du sagt ja.
2. **Det ärliga NEJ:et säljer inte.** Hyresrätt får "Hör med din hyresvärd" och ingen knapp. Under 18 får
   ingenting. Nybyggt hus får "inte än, från och med [år]". Ampy skickar bort ett lead i verktyget, synligt.
   Det är §2.2:s costly signal i sin renaste form, och det som gör verktyget vidarebefordringsbart
   (§2.3: hantverkaren delar bara det som inte blåser tillbaka på hans namn).
3. **Bandet, inte punkten.** ROT med antagen arbetsandel visas som "ungefär 6 000 till 10 500 kr, beror på
   hur stor del som är arbete", aldrig "9 000 kr". Och materialraden står bredvid: "Materialet ger inget
   avdrag." Den oflatterande siffran först (§11.1 punkt 2).
4. **Källa + datum under beskedet.** "Regler: Skatteverket, kontrollerade 2026-09-11. Gäller betalningar
   2026." SERP:en är full av odaterade räknare med 50 %-talet kvar (03 §B2). En daterad rad är det
   billigaste sättet att se annorlunda ut.
5. **Skatteverket är facit, inte vi.** "Vill du ha exakt: Skatteverkets Räkna ut rot- och rutavdrag." Vi
   pekar bort från oss själva. Den som pekar på myndigheten har inget att dölja.
6. **"Vi sparar inget", en gång, intill skattefältet.** Inte i sidfoten, inte som trust-bullet (03 §D2).
   Oron uppstår vid fältet, där ska raden stå. Och den ska vara sann: beloppet lämnar aldrig webbläsaren,
   hamnar aldrig i URL eller dataLayer (UX §2.6).

**Övergång 2 till 3, ögonblicken:**
1. **"Det sköter vi"-raderna i villkorslistan.** F-skatt, elektronisk betalning, material och installation
   från samma företag (grön teknik), ansökan hos Skatteverket. De renderas som förifyllda, dämpade bockar.
   Kunden ser att processbördan ligger hos Ampy utan att någon påstår det i en rubrik (§3.1).
2. **"Vad händer nu" i tre steg som går att kontrollera.** Personnummer och fastighetsbeteckning till
   fakturan, utbetalning efter betalt jobb, förtryckt i deklarationen. Specifikt = trovärdigt (§2).
3. **Raden om vem som får räkningen.** "Räcker inte din skatt betalar du mellanskillnaden i slutskatten."
   Det säger ingen som vill ha ett snabbt avslut. Därför bygger det tilltro till varje ja (03 §D3).
4. **Tredjepartslänkar som går att klicka.** Elsäkerhetsverkets register visar "Ampy Nordic AB"
   (verifierat live), Skatteverkets "Hämta företagsinformation" visar F-skatt (kräver org.nr, `LM-3`).
5. **Konsekvens.** Samma belopp i hero, "att betala" och "Så har vi räknat"; embedden motsäger inte
   artikelns Snabbfakta (UX §6.7). En motsägelse på samma skärm nollställer allt ovan.

**Övergång 3 till 4, ögonblicken:**
1. **Exakt en primär handling per klass** (§1.3), benefit-namngiven, formulerad som att hämta det man
   redan sett: "Få ett pris efter avdrag".
2. **Handlingen bär tillståndet.** Kunden slipper förklara om, säljaren ringer förberedd (§1.4).
3. **Underraden säger vad som händer när man trycker.** `/kontakt/` har åtta fält och rubriken
   "kostnadsfri rådgivning"; kunden ska inte bli överraskad. "Du fyller i namn, telefon och adress. En
   elektriker ringer upp med ett pris, oftast inom en arbetsdag. Kostnadsfritt, utan förbindelse."
4. **Telefonen som lågt alternativ.** "Hellre prata? 010-265 79 79" som textlänk under knappen, för den som
   har en fråga, inte ett ärende.
5. **Det vi inte gör:** ingen nedräkning, inget "potten tar slut", ingen "3 000 har räknat"-rad, ingen
   sticky-remsa före interaktion, ingen count-up på load. Varje sådan sak är en hake att fånga.

Mätbart per övergång (§8): andel visningar med minst ett bekräftat svar (1 till 2), andel som öppnar
"Så har vi räknat" eller "Visa villkoren" (2 till 3), offert-klick och tel-klick per klass (3 till 4).

### 1.3 Exakt en primär handling per klass: UX §5.2 tas som given, etiketterna skärps

| Klass | UX §5.2 | Rekommenderad etikett (utkast) | Ändring och argument |
|---|---|---|---|
| JA, ROT | "Få ett pris med avdraget inräknat" | **"Få ett pris efter avdrag"** | "efter avdrag" är Ampys etablerade prisspråk på varje produktsida ("efter ROT-avdrag", "efter skatteavdrag", `rost-samples` §5); "inräknat" kan läsas åt fel håll (räknas avdraget in i priset eller bort från det?). Kortare, en rad på 390 px |
| JA, GT laddbox | "Få en laddbox-offert med avdraget inräknat" | **"Få ett pris på laddbox efter avdrag"** | samma skäl; "offert" sparas till underraden |
| JA, GT batteri | (samma som JA) | **"Få ett pris på batteri efter avdrag"** | |
| JA, GT sol | (samma som JA) | **`GT GRIND 8`**: säljer Ampy solceller? Nej: ingen säljknapp, textlänk "Räkna på batteri till solcellerna" (läge-byte) + tel | ett Ampy-erbjudande som inte finns får inte ha en knapp |
| JA MED VILLKOR (ett antaget, ett "vet inte", brf, förälder, fritidshus, två ägare, pott delvis) | samma som JA | **samma som JA**, villkoret står i "Vad händer nu" steg 1 | oförändrat |
| JA MEN skatten räcker bara delvis (skattbelopp angivet) | samma som JA | **tel: "Prata med oss innan du beställer"** (gt-spec §6 har den redan för GT) | den som beställer med fullt avdrag och för lite skatt får kvarskatt. Fördelning mellan ägare och ett mindre avdrag på fakturan är ett samtal, inte ett formulär. Kostar några leads, skyddar kunden |
| TROLIGEN INTE, skatt (låg inkomst, belopp 0) | textlänk Skatteverket + tel | oförändrat: **ingen knapp**, textlänk "Kolla ditt utrymme hos Skatteverket" | |
| TROLIGEN INTE, batteri utan sol | "Räkna med ROT i stället" | oförändrat, **läge-byte** i verktyget; efter bytet får ROT-kortet sin vanliga primär | |
| TROLIGEN INTE, nybyggt + ombyggnad (ROT) | (saknas i UX) | **tel: "Ring så kollar vi vad som räknas som reparation"** | Skatteverket bedömer varje jobb för sig (ROT B8, GRIND 2); ett samtal reder ut vilket |
| TROLIGEN INTE, laddbox i BRF | "Ring så reder vi ut det med föreningen" | **"Ring så reder vi ut vad som gäller i din förening"** | "med föreningen" låter som att Ampy tar kontakten åt kunden, det är inte lovat |
| NEJ, hyra | ingen; textlänk hyresvärd + artikel | oförändrat | leads Ampy inte kan sälja till; en knapp här gör verktyget osäljbart för hantverkaren |
| NEJ, under 18 | ingen | oförändrat | |
| NEJ, inte än (ROT) | textlänk "Få ett fast pris utan avdrag" | textlänk **"Få ett pris utan avdrag"** + ny rad **"Laddbox eller batteri? Grön teknik har ingen femårsregel"** (länk till GT-kollen) | "fast" stryks: Ampy debiterar per timme på service (§3.7), "fast pris" är inte sant på alla jobb. Grön teknik-raden är en sann bro (GT §H nybyggt hus), inte en sälj |
| NEJ, inte i år (pott slut) | textlänk "Vad gäller nästa år?" | oförändrat, **gatad** (`UX fråga 7`) | fakta "betalningsdatumet styr året" står i "Så har vi räknat"; ett råd att betala i januari är skatteplanering ägaren måste vilja stå för |
| OSÄKERT | "Ring oss, fem minuter räcker" | **"Ring så reder vi ut det"** | "fem minuter" är ett tidslöfte ingen styr över (kunden kan behöva leta upp värdeåret först). Sekundär textlänk: "Eller kolla värdeåret på Mina sidor hos Skatteverket" |
| Säljlänk (`src=salj`), alla gröna klasser | (saknas i UX) | **offert-knappen döljs.** Primär = tel "Frågor om beskedet? Ring 010-265 79 79" + rad "Du har redan en offert från oss. Beloppet här är preliminärt, offerten visar exakt summa." | kunden sitter redan i ett säljsamtal med en offert i handen; en offert-knapp skapar ett dubblettlead och säger att vi inte vet vem han är. `LM-2` |

Regeln som inte ändras: efter besked finns exakt en primär. Sticky-remsan (fristående) speglar den.
Underraden under varje primär offert-knapp (utkast): "Kostnadsfritt och utan förbindelse. En elektriker
ringer upp med ett pris, oftast inom en arbetsdag." ("oftast inom en arbetsdag" är lead-magnet-kanonens
löfte, `rost-samples` §6; `/kontakt/` säger "inom 24 timmar", se `LM-1`.)

### 1.4 Vad `/offert/` måste acceptera, och vad som faktiskt händer i dag

**Fynd (live 2026-09-11):** `https://ampy.se/offert/` svarar `301` till `https://ampy.se/kontakt/` och
**query-strängen följer inte med** (`Location: https://ampy.se/kontakt/`, testat med
`?src=avdragskollen&m=rot&b=villa&v=ja_villkor&a=30000&ak=20000`). Sidans canonical är `/kontakt/`.
Formuläret är ett Bricks-formulär (`form_type=Kontakt`) med fälten förnamn, efternamn, e-post, telefon,
adress (sök), gatuadress, postnummer, postort, meddelande (valfritt) och det dolda `ampy_tracking`.
Inget skript läser egna parametrar. `UX fråga 4` ("kan `/offert/` läsa `src`?") är alltså besvarad:
**inte i dag, och inte via `/offert/` alls så länge redirecten tappar parametrarna.**

Attributionsskriptet (`ampy-tracking-fix.js`) hjälper ändå halvvägs: när en session **börjar** på en sida
sparas `source_url` med hela URL:en inklusive query. Öppnar kunden säljlänken från ett sms (ingen referrer)
och går vidare till formuläret får säljaren `source_url = https://ampy.se/rot-kollen/?m=rot&b=villa…&src=salj`
i `ampy_tracking`. Men kommer kunden från Google till artikeln och klickar CTA:n i embedden är `source_url`
artikeln, och kalkylparametrarna på CTA-länken försvinner. Det duger inte som kontrakt.

**Kontraktet (dev, `LM-1`):**
1. CTA-länken går till **`/kontakt/`** direkt (ingen redirect), eller redirecten `/offert/` till `/kontakt/`
   ändras så att query-strängen bevaras. Rekommendation: båda; länka till `/kontakt/`, laga redirecten ändå.
2. En FluentSnippet på `/kontakt/` läser **bara whitelistade** parametrar, validerar mot domänerna, och
   skriver en läsbar sträng i ett nytt dolt fält `kalkyl` (plus `kalkyl_src`). Okända värden ignoreras tyst.
3. `form_type` lämnas orört (CRM-routning). Parametrarna läggs **inte** i `ACQUISITION_PARAMS` i
   attributionsskriptet (då skulle en tool-klick starta ny session och skriva över annonsattributionen);
   `src` får gärna in i `PARAMS`-whitelisten som passiv uppgift.
4. Aldrig skattebelopp, inkomst, namn eller telefon i URL:en (UX §5.4, §7.1).

| Param | Värden | Validering | Exempel |
|---|---|---|---|
| `src` | `avdragskollen`, `salj`, `artikel` | enum | `src=artikel` |
| `m` | `rot`, `gt` | enum | `m=rot` |
| `l` | `laddbox`, `batteri`, `sol` | enum, bara med `m=gt` | `l=laddbox` |
| `b` | `villa`, `brf`, `fritid`, `hyra`, `foralder` | enum | `b=villa` |
| `v` | `ja`, `ja_villkor`, `troligen_inte`, `nej`, `osakert` | enum | `v=ja_villkor` |
| `a` | heltal, avrundat till 1 000, 0 till 1 000 000 | heltal | `a=30000` |
| `ak` | heltal, avrundat till 1 000 (bara ROT) | heltal ≤ `a` | `ak=20000` |

**Vad säljaren ser** (i leadmejlet och CRM-posten, ny rad `kalkyl`, utkast):
`Avdragskollen: ROT, villa, besked ja med villkor, jobb ca 30 000 kr, varav arbete 20 000 kr, avdrag ca 6 000 kr (preliminärt). Källa: artikel.`
Beloppet räknas om på serversidan ur `a`/`ak` med samma sats (30 % av `ak`), aldrig ur ett belopp i URL:en,
så strängen kan inte manipuleras till ett annat avdrag än reglerna ger. Säljaren ringer förberedd:
"du räknade på ett jobb runt 30 000, stämmer det?" Ingen skattesiffra finns någonstans.

**Vad som händer på `tel:`:** mobil öppnar uppringaren med 010-265 79 79; desktop visar numret som text
i samma länk (sajten gör likadant, `elcentral-kollen` rail). Ett enda nummer, ingen dynamisk nummerinsättning
(ett annat nummer än det i sidfoten är en hake). Klicket loggas som `ampy_ak_cta_click {target: tel, class}`
efter samtycke, inget annat. Säljaren som svarar ser ingenting; kunden brukar säga "jag har kollat på er
sida". Supportflödet står i §4.2.

---

## 2. "Vad händer nu" per klass

Grund: ROT `01-rot-regelverk` §G (G1 e-betalning, G2 F-skatt, G3 fakturamodellen frivillig, G4 uppgifter,
G7 timing, D5 betalningsdatum, D7 preliminärt). GT `02-gron-teknik-regelverk` §F (fakturamodellen
obligatorisk, 31 januari, uppgifter, vem betalar tillbaka). Stegen är UI-strängar (utkast).

### 2.1 ROT, steg 1: den bekräftade formuleringen och den grindade sida vid sida

Fakturamodellen är lagens normalväg men **inte tvingande** för ROT (G3, `ROT GRIND 1`). Ampy påstår live
"får avdraget direkt på fakturan" och "Du betalar bara din del (70 % av arbetet + material och resa)"
(/rot-avdrag-2026/). Det är Ampys egen publicerade praxis, inte en bekräftelse på att den gäller **alla**
jobb och delfakturor. Därför två spalter:

| | Bekräftad formulering (får skeppas nu) | Grindad formulering (skeppas först när `ROT GRIND 1` är signerad) |
|---|---|---|
| Steg 1 JA | "Du får ett pris där avdraget är avräknat. Vi drar avdraget på fakturan och sköter ansökan hos Skatteverket." | "Avdraget dras alltid direkt på fakturan, på alla ROT-jobb och på varje delfaktura. Du ligger inte ute med pengarna." |
| Ram-raden i kortet | "Vi räknar av avdraget och sköter ansökan." | "Dras på fakturan, vi sköter ansökan." |
| Vad som saknas i den bekräftade | inget löfte om "alltid", inget om a conto/delfakturor (D6), inget "aldrig ute med pengarna" | kräver: Ampy tillämpar fakturamodellen på 100 % av ROT-jobben inklusive delfakturor, och accepterar 3/7-regeln vid delbetalning |

Kanon-artikeln säger dessutom "Vi sköter all kontakt med Skatteverket". Det håller: utföraren begär
utbetalningen (G3) och kunden kan inte göra det själv i deklarationen (K12). Men "du behöver inte göra
någonting" håller inte: kunden lämnar uppgifter (G4) och måste ha skatt (D7).

### 2.2 Stegen per klass

**ROT, JA**
1. "Du får ett pris där avdraget är avräknat. Vi drar avdraget på fakturan och sköter ansökan hos
   Skatteverket." (bekräftad; grindad variant ovan)
2. "Till fakturan behöver vi ditt personnummer och fastighetsbeteckningen. Bostadsrätt: föreningens
   organisationsnummer och ditt lägenhetsnummer. Är ni två ägare: båda personnumren och hur ni vill dela."
   [FACT G4, A13]
3. "När jobbet är klart och betalt begär vi utbetalningen från Skatteverket. Du får ett meddelande om
   preliminär skattereduktion, och beloppet står förtryckt i din deklaration. Räcker inte skatten betalar
   du mellanskillnaden i slutskatten." [FACT G3, G7, D7]

**ROT, JA MED VILLKOR** (steg 2 och 3 som JA; steg 1 byts per villkor)
- värdeår vet inte: "Först kollar vi värdeåret. Det står i ditt senaste fastighetstaxeringsbeslut eller på
  Mina sidor hos Skatteverket. Reparationer ger ROT oavsett värdeår." [FACT B6, B9]
- skatt vet inte: "Kolla ditt utrymme i Skatteverkets Räkna ut rot- och rutavdrag (tar tio minuter, kräver
  dina inkomstuppgifter), eller ring oss." [FACT K11]
- bostadsrätt: "Kolla i föreningens stadgar att elen inne i lägenheten är ditt ansvar. Det brukar den vara.
  Elcentral, uttag och belysning inne är ok, fasad och p-plats är föreningens." [FACT B10, B11]
- föräldrarnas bostad: "Du ska äga hela eller del av bostaden och stå på fakturan. Din förälder ska bo i
  Sverige." [FACT A7]
- fritidshus: "Ingen annan får bo där permanent, och du får inte hyra ut det." [FACT B15]
- två ägare: "Båda ska äga och bo där, båda ska ha skatt att räkna av mot, och båda står på fakturan."
  [FACT D3]
- pott delvis: "Du har X kr kvar av årets pott. Resten av jobbet betalar du utan avdrag." [FACT D2, D7:
  outnyttjat avdrag sparas inte]

**ROT, JA MEN skatten räcker delvis** (skattbelopp angivet)
1. "Din skatt räcker preliminärt till ungefär X kr av Y kr. Ring oss innan du beställer, så lägger vi
   avdraget så att det ryms." [FACT D7, F5 omfördelning vid två ägare]
2. "Är ni två ägare kan mer av avdraget läggas på den som har mest utrymme, inom 50 000 kr per person."
   [FACT D3, D4]
3. "Exakt utrymme ser du i Skatteverkets räknare. Skatteverket stämmer av i deklarationen."

**ROT, TROLIGEN INTE, skatt** (låg inkomst, belopp 0)
1. "Avdraget kräver skatt att räkna av mot. Kolla ditt utrymme hos Skatteverket."
2. "Vill du, lämnar vi ett pris utan avdrag. Inga överraskningar på fakturan."

**ROT, TROLIGEN INTE, nybyggt hus + förbättring** (värdeår 2021 till 2025)
1. "Reparationer ger ROT oavsett husets ålder. Nytt, mer eller bättre ger inte ROT förrän sjätte året
   efter värdeåret." [FACT B5, B6, B8]
2. "Skatteverket bedömer varje jobb för sig. Ring så kollar vi vad som räknas som reparation i ditt fall."

**ROT, NEJ, hyresrätt**
1. "Hör med din hyresvärd. Det är fastighetsägaren som äger och ansvarar för elen." [FACT A5, §H]
2. "Vill du ändå anlita en elektriker för något du själv får göra i lägenheten går det, men utan avdrag."
   (information, ingen länk, ingen knapp)

**ROT, NEJ, under 18:** en rad, inga steg. "En vuxen ägare kan stå på fakturan i stället." [FACT A1]

**ROT, NEJ, inte än** (värdeår 2026 eller inte taxerat som färdigbyggt)
1. "Tills huset är taxerat som färdigbyggt räknas elarbetet som del av bygget, och bygget ger inte ROT."
   [FACT B5]
2. "Laddbox eller batteri? Grön teknik har ingen femårsregel och gäller även hus som byggs just nu." (länk
   till GT-kollen) [FACT GT A2]
3. "Vill du ha ett pris utan avdrag: inga överraskningar på fakturan." (textlänk)

**ROT, NEJ, inte i år** (pott = 0)
1. "Årets pott är använd. Outnyttjat avdrag går inte att spara, men det är betalningsdatumet som avgör
   vilket år avdraget hamnar på." [FACT D5, D7]
2. `UX fråga 7`: får verktyget säga "betalar du efter årsskiftet hamnar avdraget på nästa år"? Tills dess
   bara textlänk till artikelavsnittet.

**ROT, OSÄKERT** (två okända)
1. "Ring så reder vi ut [husets ålder] och [om skatten räcker]."
2. "Eller kolla själv: värdeåret på Mina sidor hos Skatteverket, skatteutrymmet i Räkna ut rot- och
   rutavdrag."

**GT, JA (laddbox, batteri)**
1. "Du får ett pris där avdraget är draget. Avdraget dras alltid på fakturan, det är enda sättet att få
   grön teknik. Materialet kommer från oss, det är kravet för 50 % på både arbete och material."
   [FACT S2 fakturamodellen obligatorisk, S1 samma företag, foretagsdata §3: allt säljs med installation]
2. "Till fakturan behöver vi ditt personnummer och fastighetsbeteckningen. Bostadsrätt: föreningens
   organisationsnummer och ditt lägenhetsnummer." [FACT S3, S12 9 §]
3. "När installationen är klar och slutbetald begär vi utbetalningen från Skatteverket, senast 31 januari
   året efter. Beloppet står förtryckt i din deklaration. Räcker inte skatten kan Skatteverket kräva
   mellanskillnaden i slutskatten." [FACT S12 8 §, S2, S16]

**GT, JA MED VILLKOR:** steg 1 per villkor: bostadsrätt laddbox: "P-platsen ska höra till bostadsrätten,
inte kunna sägas upp och följa med när du säljer. Föreningen ska godkänna installationen." [FACT S2, S3];
skatt vet inte: som ROT; två ägare: "Båda står på fakturan, vi delar avdraget som ni vill." [FACT S3];
självköpt box: "Boxen du köpt själv ger inget avdrag, bara arbetet." [FACT S1]

**GT, JA MEN taket slår i:** 1 "Taket är 50 000 kr per person. Är ni två ägare kan ni dela." 2 och 3 som JA.

**GT, JA MEN skatten räcker delvis:** som ROT, med tillägget "ROT och RUT räknas av före grön teknik".
[FACT 67 kap. 2 §]

**GT, TROLIGEN INTE, batteri utan sol**
1. "Utan egna solceller gäller inte grön teknik för batteriet. Batteri nu och solceller sen räcker inte."
   [FACT S8]
2. "ROT kan i stället ge 30 % på arbetskostnaden för elarbetet, inte på batteriet." [kanon §6.5 som "kan";
   `ROT GRIND 10`, `GT GRIND 5`]
3. "Räkna med ROT i stället, så ser du beloppet." (läge-byte)

**GT, TROLIGEN INTE, laddbox i föreningens garage eller på hyrd p-plats**
1. "Föreningen är part. Den kan söka Naturvårdsverkets bidrag Ladda bilen." [FACT S18; nivåerna skrivs ut
   först efter `GT GRIND 11`]
2. "Ring så reder vi ut vad som gäller i din förening."

**GT, NEJ hyra, NEJ under 18:** som ROT. **GT, NEJ äger inte / bostaden används av annan:** en rad ur
gt-spec §6, textlänk "Läs mer om villkoren" till artikeln.

**GT, OSÄKERT** (solceller vet inte, p-plats vet inte, batteri i bostadsrätt): "Ring så reder vi ut det"
+ raden ur gt-spec §6 för respektive osäkerhet.

Timing som alltid står i "Så har vi räknat": ROT: betalningsdatumet styr året, begäran senast 31 januari
året efter, preliminärt i deklarationen om begäran är inne före 1 mars (G7). GT: slutbetalningen styr året.

---

## 3. Förtroendeelementen

### 3.1 Vilka rader, var, och vad de länkar till

| Element | Var | Formulering (utkast) | Länk | Källa |
|---|---|---|---|---|
| Antaget-ringarna | villkorslistan, slot 5 | "Äldre än fem år (antaget)" | tryck flyttar fokus till frågan | UX §4.4 |
| Sköter vi: F-skatt | villkorslistan, dämpad bock, inte klickbar | "F-skatt: det har vi. Kolla själv hos Skatteverket." | Skatteverket "Hämta företagsinformation" (sök på Ampy Nordic AB; org.nr `LM-3`) | foretagsdata §1.1 [FACT, självdeklarerat]; K3 |
| Sköter vi: elektronisk betalning | villkorslistan | "Elektronisk betalning: du betalar fakturan med bank, Swish eller kort. Kontant går inte." | ingen | G1 |
| Sköter vi: ansökan | villkorslistan | ROT: "Ansökan hos Skatteverket: det sköter vi." GT: "Ansökan hos Skatteverket: det sköter vi, det är enda vägen." | ingen | G3 (bekräftad formulering), S2 |
| Sköter vi: samma företag (bara GT) | villkorslistan | "Material och installation från samma företag: det är så vi säljer." | ingen | S1, foretagsdata §3 |
| Registrerat elinstallationsföretag | under kortet, en rad med de två trust-orden | "Registrerat elinstallationsföretag hos Elsäkerhetsverket." | Elsäkerhetsverket "Kolla elföretaget", `?foretag=12047521&sok=1` (visar Ampy Nordic AB, verifierat live) | foretagsdata §1.1 |
| Inget mejl, ingen inloggning | **en gång**, i leadraden under rubriken | "Beskedet uppdateras medan du svarar. Inget mejl, ingen inloggning." | ingen | ägarens AI-signal-not: inte som trust-bullet, inte upprepad |
| Vi sparar inget | **en gång**, hjälptext intill skattefältet (4b) | "Står som slutlig skatt i din deklaration. Det du skriver här stannar i din webbläsare, vi sparar inget." | ingen | 03 §D2; sann bara om beloppet aldrig går i URL, dataLayer eller lagring (UX §2.6) |
| Källa + datum | under beloppet, en rad | "Regler: Skatteverket, kontrollerade 2026-09-11. Gäller betalningar 2026." | "Så har vi räknat" | 03 §D1 |
| Skatteverket som facit | "Vad händer nu" och "Så har vi räknat" | "Vill du ha exakt: Skatteverkets Räkna ut rot- och rutavdrag. Kräver dina inkomstuppgifter, tar tio minuter." | www7.skatteverket.se/portal/rot-rut (ROT); för GT: "Räkna ut din skatt" (Skatteverkets rot-rut-tjänst räknar inte grön teknik, F4) | K11 |
| Redan använt | hjälptext vid `anvant` | "Kolla Mina skattereduktioner hos Skatteverket, där står vad du använt i år." | www7.skatteverket.se/portal/mina-avdrag/ (kräver e-legitimation) | S16, S17 |
| Vem får räkningen | ram-raden vid skatt-relaterade villkor, alltid i "Så har vi räknat" | "Räcker inte din skatt betalar du mellanskillnaden i slutskatten." | | D7, S2 |
| Disclaimer | under kortet | "Vägledande besked utifrån dina svar, inte ett beslut från Skatteverket och inte ett erbjudande. Skatteverket avgör i deklarationen. Exakt belopp står på offerten." | | UX §4.2 slot 11 + gt-spec hedge 8 + `rost-samples` §5 |
| Byline (bara fristående) | under FAQ | "Skriven av Julius Callahan. Reglerna kontrollerade mot Skatteverket 2026-09-11." Granskare: `LM-3` | | foretagsdata §1.4 |

Vad som **inte** står bland trust-raderna: "5,0 på Google", "1000+ kunder", "3 000+ installationer om
året" (CLAUDE.md regel 3, foretagsdata §10.2 P0 1). `/kontakt/` visar två av dem i dag; det är utanför
uppdraget men noterat i `LM-1`. Inte heller "certifierad elektriker" som avdragsvillkor: villkoret är
F-skatt, behörigheten är Elsäkerhetsverkets sak (02 Motsägelser). De två hålls isär.

### 3.2 "Så har vi räknat": regel + källa + datum per rad

Samma datafil matar verktygets `<details>` och den fristående sidans utfällda avsnitt (§5). Varje rad
har formen **regel, sedan "Källa: Skatteverket, [sidnamn], kontrollerad 2026-09-11"** som länk. Inga
siffror här som inte redan står i beskedet.

ROT (K-nycklar i `01-rot-regelverk`):
1. "30 % av arbetskostnaden inklusive moms. Material, resor, maskiner och administration ger inget
   avdrag." Källa: "Så fungerar rotavdraget" (K3), IL 67 kap. (K1).
2. "Taket är 50 000 kr ROT per person och år, 75 000 kr för ROT och RUT tillsammans. Två ägare som båda
   bor där har var sin pott." Källa: K3, K1 67:19.
3. "Reparation och underhåll ger ROT oavsett husets ålder. Om- och tillbyggnad, dit förbättringar räknas,
   ger ROT från sjätte året efter värdeåret. För jobb 2026: värdeår 2020 eller tidigare." Källa: K3, K14.
4. "Avdraget räknas av mot inkomstskatt och fastighetsavgift, efter allmän pensionsavgift, jobbskatteavdrag
   och ränteavdrag. Vi räknar med 2026 års belopp och snittkommunalskatt 32,38 %. Räcker inte skatten
   betalar du mellanskillnaden i slutskatten." Källa: K5, K1 67:2, K9.
5. "Elektronisk betalning krävs. Utföraren ska ha F-skatt. Betalningsdatumet avgör vilket år avdraget
   hamnar på." Källa: K3.
6. "Det vi antar: [arbetsandel], [boende], [skatt]." (renderas ur tillståndet)
7. Länkar: Räkna ut rot- och rutavdrag (K11), Mina skattereduktioner (S17).

GT (S-nycklar i `02-gron-teknik-regelverk`):
1. "15 % för solceller, 50 % för batteri och laddbox, på arbete och material inklusive moms. Resor, frakt
   och projektering ger inget avdrag. Vid fast totalpris räknar Skatteverket 97 % av priset som underlag."
   Källa: "Grön teknik" (S1), Rättslig vägledning (S2), ställningstagande 2021-01-27 (S11). `GT GRIND 1`
   avgör om 97 % är default.
2. "Taket är 50 000 kr per person och år för solceller, batteri och laddbox tillsammans. Egen pott skild
   från ROT och RUT, men skatten ska räcka till allt, och ROT och RUT räknas av först." Källa: S13 67:2.
3. "Batteriet ska lagra el från egna solceller som finns eller installeras samtidigt. Att det också
   används till stödtjänster eller nattladdning påverkar inte avdraget." Källa: S8, S7.
4. "Laddbox: box, fäste, kabel till elcentralen och laddkabel ger 50 %. Ny eller utökad elcentral ger inte
   grön teknik, men kan ge ROT." Källa: S1, S4.
5. "Bostad: småhus, ägarlägenhet, bostadsrätt kopplad till lägenheten, fritidshus och hus under byggnad.
   Ingen femårsregel." Källa: S3, S13.
6. "Avdraget dras på fakturan och utföraren ansöker senast 31 januari året efter slutbetalningen. Det går
   inte att söka i efterhand i deklarationen." Källa: S2, S12.

### 3.3 Disclaimern, ordagrant och var
Under kortet, alltid synlig, aldrig i `<details>`: "Vägledande besked utifrån dina svar, inte ett beslut
från Skatteverket och inte ett erbjudande. Skatteverket avgör i deklarationen. Exakt belopp står på
offerten." Tre satser, tre jobb: vägledning (inte juridisk rådgivning), vem som avgör, var precisionen
bor (asken). Fristående sidan upprepar den inte i sidfoten; den står en gång.

---

## 4. Säljarens arbetsflöde

### 4.1 Scenario A: kunden frågade "är jag berättigad?", säljaren skickar länken

Förutsättning: offerten finns (arbete och material på separata rader, C4). Verktyget körs på den
fristående sidan, som äger URL:en (UX §7.2).

1. Säljaren öppnar `/rot-kollen/` (eller `/gron-teknik-kollen/`) på desktop.
2. Ställer in **läge** (ROT, eller GT laddbox/batteri/sol), **boende** från offertadressen (bostadsrätt
   syns på org.nr-raden), **belopp** = offertens totalpris inkl. moms, **varav arbete** = offertens
   arbetsrad (ROT). Skattefrågan lämnas orörd (antaget "lön"). Två ägare om offerten har två personnummer.
3. Trycker **"Kopiera länk"**. Länken innehåller läge, boende, belopp, arbetskostnad, ägare och `src=salj`.
   Aldrig namn, personnummer, telefon, skatt eller inkomst (UX §7.3). Säljaren kan **inte** bekräfta
   svaren åt kunden: mottagaren ser hålringar (UX §7.1 `c`-regeln). Det är poängen: kunden ska trycka själv.
4. Klistrar in i sms enligt mallen nedan. Ingen länkförkortare (en förkortad länk döljer domänen; kunden
   ska se `ampy.se` i länken).
5. Kunden öppnar på mobilen: mjuk scroll till beskedskortet (UX §7.2), ser "Ja, om det här stämmer:" med
   tre ringar, trycker tre chips, ser "Ja, du kan använda ROT-avdraget", beloppet och "att betala", som
   stämmer med offerten (samma arbetskostnad). Offert-knappen är dold i `src=salj` (§1.3, `LM-2`); i stället
   står "Frågor om beskedet? Ring 010-265 79 79" och raden om att offerten visar exakt summa.
6. Konverteringen sker i offertflödet (accept via e-sign), inte i verktyget. Verktyget har tagit bort
   tvivlet, inte skapat ett andra ärende.

**Sms-mallen** (ren text, högst två rader, full URL, ett utropstecken):

> Hej! Här ser du om ROT-avdraget gäller dig och ungefär vad det blir på jobbet vi pratade om: https://ampy.se/rot-kollen/?m=rot&b=villa&y=ja&a=42000&ak=28000&o=1&src=salj
> Beloppet är preliminärt, exakt summa står i offerten. /Förnamn, Ampy

Grön teknik: "Här ser du om grön teknik-avdraget gäller din laddbox och vad det blir:
https://ampy.se/gron-teknik-kollen/?m=gt&l=laddbox&b=villa&a=25000&src=salj". (URL-slugarna är `UX fråga 3`.)
Signaturen "/Förnamn, Ampy" håller sms:et personligt utan signaturblock; om ägaren vill ha samma regel
som sekvens-sms:en (ren text utan signaturrad) stryks den, `LM-2`.

**Hur säljaren bekräftar efteråt.** Säljaren ser inga klick (`src=salj` mäts bara aggregerat, aldrig per
säljare eller kund). Bekräftelsen sker i samtalet: "Stämde de tre sakerna?" Kunden som vill ha det svart
på vitt använder "Skriv ut" och sparar som PDF själv. Säljaren bifogar **aldrig** en utskrift till
offerten: utskriften är ett preliminärt besked, offerten är avtalet. CRM-notering "kollen skickad" är
`[GAP]` (fält finns inte i dag).

### 4.2 Scenario B: kunden ringer och frågar, supporten använder verktyget live

1. Supporten har `/rot-kollen/` uppe (desktop, fristående, allt utfällt). Verktyget är manuset: frågorna
   ställs i verktygets ordning (boende, ålder, belopp, skatt), inte ur huvudet.
2. Beskedet läses upp med villkoren: "Då blir det ja, förutsatt att huset är äldre än fem år, och att du
   har skatt att räkna av mot. Vet du värdeåret?"
3. Skattefrågan: supporten skriver **aldrig** in kundens skatt eller inkomst i verktyget under samtalet
   och antecknar den inte. Supporten säger vad som gäller ("avdraget räknas mot din inkomstskatt, en
   pension på 25 000 i månaden brukar räcka till ungefär 50 000 kr") och pekar på Skatteverkets räknare.
4. OSÄKERT: supporten säger var värdeåret finns (senaste fastighetstaxeringsbeslutet, Mina sidor hos
   Skatteverket) och ber kunden återkomma, eller bokar en genomgång (`[GAP]`: vad genomgången kollar).
5. Avslut: "Jag skickar länken så har du det framför dig", Kopiera länk, sms enligt mallen, sedan
   offertflödet som vanligt. Supporten lovar aldrig "det går igenom", bara "det kan gälla, Skatteverket
   avgör i deklarationen".

Regler för säljare och support (skrivs in i säljhandboken, `[GAP]` var den finns):
- Säg "avdrag" eller "skattereduktion", aldrig "rabatt" (§7).
- Säg "kan", aldrig "du får garanterat".
- Nämn alltid vem som betalar om skatten inte räcker, en gång, lugnt.
- Skicka aldrig länk med kundens skatt eller inkomst i (kan inte hända tekniskt, men skriv inte det i sms:et heller).

---

## 5. Fristående sidorna: `/rot-kollen/` och `/gron-teknik-kollen/`

Slugarna är arbetsnamn (`UX fråga 3`). Argument för "-kollen" framför "-kalkylator" (03 §E2 föreslår
`/rot-kalkylator/`): familjenamnet är Ampys (Elcentral-kollen, Elkollen), "kollen" bär beskedet ("gäller
det mig?") som är kundens första fråga, och sökintentet "räkna ut rotavdrag" fångas av title och H1, inte
av slugen. Ägaren väljer; resten nedan är oberoende av slugen.

### 5.1 Sidans ordning (uppifrån)
1. **H1** ROT: "Räkna ut ditt rotavdrag 2026 och se om det gäller dig". GT: "Räkna ut ditt grön
   teknik-avdrag 2026 för laddbox, batteri och solceller". (Mönstret [räkna ut] + [avdraget] + [2026], 03 §E2,
   plus beskedslöftet.)
   Title: "Räkna ut rotavdrag 2026: ROT-kollen | Ampy" / "Räkna ut grön teknik-avdrag 2026 | Ampy".
   Meta: "Kolla om ROT-avdraget gäller dig och räkna ut beloppet på ditt eljobb. Fyra frågor, inget mejl.
   Reglerna är Skatteverkets, kontrollerade 2026." (≤ 155 tecken, ingen "!").
2. **Ingress, två korta stycken** (ROT, utkast):
   "ROT-avdraget är 30 % av arbetskostnaden, högst 50 000 kr per person och år. Om det gäller dig beror på
   fyra saker: att du äger bostaden och bor där, husets värdeår om jobbet är en förbättring, att du har
   skatt att räkna av mot, och att jobbet görs av ett företag med F-skatt som du betalar elektroniskt."
   "Svara på frågorna så ser du beskedet och ett preliminärt belopp direkt. Inget mejl, ingen inloggning.
   Reglerna är Skatteverkets, kontrollerade 2026-09-11."
   GT, utkast: "Grön teknik-avdraget är 50 % på laddbox och solcellsbatteri och 15 % på solceller, på både
   arbete och material, högst 50 000 kr per person och år. Batteriet kräver egna solceller, laddboxen gör
   det inte, och det finns ingen femårsregel." "Välj vad du ska installera, svara på tre frågor och se
   beskedet direkt. Inget mejl, ingen inloggning. Reglerna är Skatteverkets, kontrollerade 2026-09-11."
   (Raden "inget mejl" står här, i ingressen, och sedan inte igen på sidan: verktygets egen leadrad
   utelämnar den i fristående läge. En gång, tyst.)
3. **Verktyget**, allt utfällt, sticky-remsa på mobil (UX §8.2), verktygets rubrik blir H2, inre H3.
4. **"Så har vi räknat"** som utfällt avsnitt (server-renderat, samma datafil som `<details>`), §3.2.
5. **Fem segment-FAQ:er** (§5.2), H2 "Vanliga frågor" + H3 per fråga.
6. **"Verktyget passar inte om"**, en hopfälld rad (§5.3).
7. **Källa + datum-raden** och byline.
8. **Länkar**: "Läs reglerna i sin helhet: ROT-avdrag 2026: allt du behöver veta" (artikeln), "Ska du
   installera laddbox, batteri eller solceller? Räkna på grön teknik-avdraget" (den andra kollen), och
   "Exakt uträkning: Skatteverkets Räkna ut rot- och rutavdrag".

### 5.2 Segment-FAQ:erna i ampy-rost (utkast, ≤ 80 ord, "kan" på skatteutfall)

**ROT-kollen**

*Kan jag få ROT-avdrag som pensionär?* "Ja. Det finns ingen övre åldersgräns. Det som avgör är hur mycket
skatt du betalar: avdraget räknas av mot inkomstskatten på pensionen och mot fastighetsavgiften, aldrig
mot begravnings- eller kyrkoavgiften. En pension på 25 000 kr i månaden ger ungefär 50 000 kr i utrymme
vid snittskatt, 15 000 kr i månaden ungefär 24 000 kr. Räcker inte skatten betalar du mellanskillnaden
på slutskattebeskedet. Räkna först." [FACT K1 67:2, K5; BERÄKNAT E4]

*Gäller ROT i bostadsrätt?* "Ja, för jobb inne i lägenheten, innanför tak, väggar och golv, som du själv
ansvarar för enligt föreningens stadgar. Ny elcentral, nya uttag, nya ledningar från proppskåpet och
infälld belysning kan ge ROT. Fasad, trapphus, förråd, garage och laddbox på föreningens p-plats kan inte,
där är föreningen part. Det gäller även om bostadsrätten är ett radhus. Till fakturan behöver vi
föreningens organisationsnummer och ditt lägenhetsnummer." [FACT K1 67:13 b, K4, K14]

*Gäller ROT i fritidshus?* "Ja. Ett fritidshus du äger och själv använder räknas som bostad med samma
regler som villan: 30 % av arbetskostnaden, och taket 50 000 kr per person och år delas med jobb i din
permanentbostad. Femårsregeln gäller bara om stugan är nybyggd och jobbet är en om- eller tillbyggnad,
reparationer går alltid. Hyr du ut huset, eller bor någon annan där permanent, gäller inte avdraget."
[FACT K3, K12, K14]

*Gäller ROT i hyresrätt?* "Nej. ROT förutsätter att du äger bostaden: småhus, bostadsrätt eller
ägarlägenhet. I en hyresrätt äger hyresvärden bostaden och ansvarar för elen, så vänd dig dit. Vill du
ändå anlita en elektriker för något du själv får göra i lägenheten går det, men utan avdrag."
[FACT K1 67:13, K3, K14]

*Gäller ROT i ett nybyggt hus?* "Delvis. Reparationer och underhåll ger ROT oavsett husets ålder. Om- och
tillbyggnad, dit Skatteverket räknar förbättringar som en större elcentral eller nya elgrupper, ger inget
avdrag de fem första kalenderåren efter värdeåret. För jobb 2026 behöver huset värdeår 2020 eller
tidigare. Värdeåret står i ditt senaste fastighetstaxeringsbeslut. Är huset inte taxerat som färdigbyggt
kan inget elarbete få ROT än. Laddbox och batteri kan i stället få grön teknik, som saknar femårsregel."
[FACT K1 67:13 c, K3, K4, K14; GT S3]

**Grön teknik-kollen** (ur `02-gron-teknik-regelverk` §H, samma register)

*Gäller grön teknik i bostadsrätt?* "Ja, om installationen är kopplad till just din lägenhet, nyttan
bara tillfaller dig och avtalet ingås med dig som privatperson. För en laddbox avgör p-platsen: den ska
höra till bostadsrätten, inte kunna sägas upp och följa med när du säljer. En p-plats du hyr av föreningen
räcker inte. Föreningens gemensamma laddplatser kan i stället få Naturvårdsverkets Ladda bilen-bidrag,
som föreningen söker." [FACT S2, S3, S18]

*Kan jag få grön teknik som pensionär?* "Ja, åldern spelar ingen roll uppåt. Det som avgör är hur mycket
skatt du betalar: avdraget räknas mot inkomstskatten på pensionen och mot fastighetsavgiften, inte mot
pensionsavgift, begravningsavgift eller public service-avgift. Har du använt ROT eller RUT i år tar de
sin del först. Räcker inte skatten kan Skatteverket kräva tillbaka mellanskillnaden i slutskatten."
[FACT S13, S2]

*Gäller grön teknik i fritidshus?* "Ja, om du äger det och använder det själv, eller din förälder gör
det. Bor någon annan där permanent räknas det inte längre som ditt fritidshus." [FACT S3]

*Gäller grön teknik i hyresrätt?* "Nej. Grön teknik kräver att du äger småhuset eller ägarlägenheten,
eller innehar bostadsrätten. I en hyresrätt är det fastighetsägaren som kan installera. Hör med din
hyresvärd." [FACT S3, S13]

*Gäller grön teknik i ett nybyggt hus?* "Ja. Grön teknik har ingen femårsregel. En byggnad under
uppförande som du äger ger rätt till avdraget, så länge anläggningen ska anslutas till elnätet när huset
är klart. Det skiljer grön teknik från ROT." [FACT S3, S13]

GT-sidan får dessutom "Batteri utan solceller?" och "Vad ingår i laddboxens avdrag?" ur §H, eftersom de
är de två frågor säljarna faktiskt får (granskning-C, 00 §5). Sju FAQ:er på GT, fem på ROT.

### 5.3 "Verktyget passar inte om" (hopfälld rad, utkast)
"Verktyget passar inte om jobbet görs i en näringsfastighet eller faktureras via ditt eget företag, om
bostaden ligger utanför Sverige (bostad i EU/EES kan ge avdrag, fråga Skatteverket), om det gäller ett
dödsbo, om du har sjöinkomst eller sjuk- och aktivitetsersättning (skattedelen räknar inte med dem), eller
om du vill räkna på RUT. Då: Skatteverkets Räkna ut rot- och rutavdrag." [FACT A9 till A11, E5,
GT A1 till A2] Mönstret är Skatteverkets egen "Vem kan använda tjänsten?" (03 Stjäl 5).

### 5.4 Schema, canonical, parametrar
- **Schema:** `WebPage` + `FAQPage` (svaren identiska med den synliga texten) + `BreadcrumbList`, samt
  artikelns `author`-mönster om sidan får byline. **Inte** `SoftwareApplication`/`WebApplication` (kräver
  betyg som inte finns, 03 §E1), **inte** `HowTo` (visas inte längre), **inget** `aggregateRating`. FAQPage
  ger inget SERP-utrymme för Ampy (bara myndigheter och hälsa), men bär svaren till andra motorer och
  AI-svar.
- **Canonical:** självpekande **utan query** på båda sidorna. Parametriserade URL:er (`?m=…`) får ingen
  egen canonical, ingen `noindex`, står inte i sitemap och länkas inte internt (03 §E4, Google: "Don't use
  the robots.txt file for canonicalization purposes"). `noindex` + canonical till annan sida är en blandad
  signal och används inte; GOV.UK:s noindex-mönster tas fram bara om Search Console visar att
  parametervarianter indexeras (bevakningstrigger, §8).
- **Embed-sidorna** (artiklarna) behåller sina egna canonicals; widgeten är en komponent, inte en sida
  (ingen iframe, 03 §E2).
- `utm_*`, `gclid`, `fbclid` bevaras vid `replaceState` (UX §7.2) så annonsattributionen inte tappas.

### 5.5 Interna länkar från artiklarna (ankartexter)
Från `/rot-avdrag-2026/`: embedden överst (efter ingressen, före Snabbfakta, UX §6.1); "Vem kan få ROT
2026" → "kolla om ROT-avdraget gäller dig" (`/rot-kollen/`); "Prisexempel" → "räkna ut rotavdraget på
ditt eget jobb"; "Taket 75 000" → "räkna med två ägare och redan använt RUT"; FAQ "Hur mycket är
ROT-avdraget 2026?" → "räkna ut ditt belopp". Alla till den rena URL:en; högst **en** förifylld intern
länk per artikel (den från FAQ:n), resten rena.
Från `/gron-teknik-2026/`: embedden överst; "Skatteunderlaget: din personliga gräns" → "kolla om din
skatt räcker till avdraget" (`/gron-teknik-kollen/`); "Materialfällan" → "se vad avdraget blir om du köper
boxen själv"; "GT vs ROT" → "räkna på batteri utan solceller: ROT i stället" (den enda förifyllda:
`?m=gt&l=batteri&p=nej`); FAQ "räcker skatten" → "kolla ditt utrymme".
Kollarna länkar tillbaka: "Läs reglerna i sin helhet" till respektive artikel, och till varandra.
Aldrig "klicka här".

---

## 6. Embed-varianten i artikeln (UX §6 tas som given; bara det konverteringen kräver)

| Skiljer | Fristående | Embed | Varför för konverteringen |
|---|---|---|---|
| Rubriknivå | H1 | H2 "Gäller ROT-avdraget dig? Fyra frågor, sedan ser du beloppet." | artikeln äger H1 och förtroendet (byline, bild) |
| Leadraden | utelämnar "inget mejl" (står i ingressen) | "Beskedet uppdateras medan du svarar. Inget mejl, ingen inloggning." | den enda platsen raden får stå i embed |
| Kortet | allt utfällt | kompakt: besked, belopp, ram, CTA, tel; villkor + "Vad händer nu" + dela bakom "Visa villkoren" (≤ 900 px) | artikeln måste börja inom två skärmar |
| Sticky-remsa | ja | nej (sajtens ring-bar finns) | tre handlingar på skärmen är en defekt |
| FAQ, byline, "passar inte om" | ja | nej | artikeln har egen FAQ och byline |
| Trust-rader | alla (§3.1) | "sköter vi"-raderna i villkorslistan + källa + datum + disclaimer | resten dubblerar artikeln |
| CTA-mål | `/kontakt/?…&src=avdragskollen` | `/kontakt/?…&src=artikel` (+ `placement` i dataLayer) | attribution per yta |
| "Skriv ut" | ja | nej, bara "Kopiera länk" (bygger den fristående URL:en) | utskrift av ett embed ger artikeln, inte beskedet |
| URL | verktyget äger den | rör aldrig sidans URL | artikeln äger canonical |

Två saker artikeln måste ändra innan embedden går live, annars säger sidan och verktyget olika saker
på samma skärm (candour-defekt, UX §6.7): Snabbfakta "Byggnaden måste vara äldre än 5 år" (fel som
generellt villkor, `ROT GRIND 14`) och avsnittet "Vi sköter hela ROT-processen" ska använda samma
formulering som verktygets steg 1 (bekräftad eller grindad, §2.1). GT-artikelns "Du behöver inte ligga
ute med pengarna" och "resterande belopp kan hanteras via ROT" är `GT GRIND 9`.

---

## 7. Candour-grinden tillämpad

Varje påstående verktyget kan frestas att göra, med domslut. **OK** = får stå. **OK, formulering** = får stå
i den angivna formen. **GRINDAD** = kräver signering. **ALDRIG** = ute.

| Påstående | Domslut | Skäl och ersättning |
|---|---|---|
| "Du ligger aldrig ute med pengarna" | GRINDAD (ROT, `ROT GRIND 1`); ALDRIG utan skatteförbehåll (GT) | Även för GT betalar kunden mellanskillnaden i slutskatten om skatten inte räcker (S2). Ersättning: "Avdraget dras på fakturan. Räcker inte din skatt kan Skatteverket kräva mellanskillnaden i slutskatten." |
| "Vi sköter hela ansökan" | OK (GT: lagfäst enda väg, S2); OK, formulering (ROT: "vi sköter ansökan hos Skatteverket", Ampys publicerade praxis); "alltid/på alla jobb" GRINDAD | Aldrig "du behöver inte göra något": kunden lämnar personnummer och fastighetsbeteckning och måste ha skatt |
| "Avdraget dras direkt på fakturan" | OK (GT); OK, formulering (ROT: "vi drar avdraget på fakturan"); "alltid" GRINDAD | §2.1 |
| "50 % rabatt", "30 % rabatt", "rabatt" | ALDRIG | Det är en skattereduktion: staten betalar via din skatt, och räcker den inte betalar du. "Rabatt" lovar ett pris, "avdrag" lovar en regel. Skatteverkets ord är "rotavdrag" och "skattereduktion" |
| "Du sparar X kr" / "Spara upp till 50 000 kr" | ALDRIG som rubrik eller belopp | "Spara" antyder pengar i handen och bjuder in frågan "jämfört med vad?". Ersättning: "Avdrag: X kr", "X kr dras på fakturan", "Att betala efter avdrag: Y kr" |
| "Du får X kr tillbaka" | ALDRIG | Inget betalas tillbaka till kunden; det dras på fakturan. Kvarskatt kan däremot komma tillbaka åt andra hållet |
| "Gratis" / "Helt gratis. Inget mejl, ingen inloggning, ingen hake" | OK, en gång, tyst | Kanonens trust-bullet finns, men ägaren vill inte att raden säljs in. Verktygets värde är svaret, inte att det är gratis. Aldrig "Gratis!" som rubrik |
| "Inom 60 sekunder", "på 30 sek" | ALDRIG | Konkurrentmönster (rotkalkylator.se). Ersättning: den konkreta räkningen "fyra frågor" |
| "Garanterat avdrag", "godkänns alltid" | ALDRIG | Skatteverket avgör i deklarationen. "kan" på varje utfall |
| "Upp till 100 000 kr för två ägare" | OK, formulering | "om ni båda äger och bor där och båda har skatt att räkna av mot" (D3) |
| "Batteri utan solceller: ROT 30 % på arbetet" | OK som "kan", GRINDAD som siffra | `ROT GRIND 10`, `GT GRIND 5`: arbetsandelen är Ampys, och själva batterimonteringen kan vara inventarie |
| "Laddbox kräver solceller" | ALDRIG | Falskt (S1). Granskning-C:s huvudfynd |
| "När grön teknik-taket nås kan resten tas via ROT" | ALDRIG | Falskt (67 kap. 40 §): samma åtgärd får aldrig båda. Bara separata ROT-arbeten (elcentralen) |
| "50 % av hela kostnaden / totalpriset" | ALDRIG | "50 % av arbete och material"; resor, frakt, projektering ger inget; 97 % vid fast pris (S2, S11) |
| "Ampy har F-skatt" | OK | Självdeklarerat [FACT §1.1] + länk till Skatteverkets kontroll. Org.nr `LM-3` |
| "Registrerat elinstallationsföretag" | OK | Verifierat live i Elsäkerhetsverkets register |
| "Certifierad elektriker krävs för avdraget" | OK, formulering | Avdragsvillkoret är F-skatt. Behörigheten är ett elsäkerhetskrav och står som skydd, inte som avdragsregel |
| "Vi ringer inom 24 timmar" | OK, formulering: "oftast inom en arbetsdag" | Lead-magnet-kanon. `/kontakt/` säger "inom 24 timmar", Elcentral-kollen också; intern motsägelse att jämka (`LM-1`) |
| "5,0 på Google", "1000+ kunder", "3 000+ installationer om året" | ALDRIG i verktyget | CLAUDE.md regel 3; inga rättighetsklarerade bevis (§10.2) |
| "Vi sparar inget" | OK, en gång, intill skattefältet | Sann bara om skattebeloppet aldrig lagras, loggas eller går i URL:en. Formuleringen "det du skriver här stannar i din webbläsare" håller även om sajtens attributionsskript lagrar utm-data efter samtycke (det är inte "det du skriver") |
| "Potten fylls på 1 januari, beställ nu" | ALDRIG som tryck | Fakta "betalningsdatumet styr året" får stå i "Så har vi räknat". Att föreslå betalning i januari är `UX fråga 7` |
| "Reparationer ger ROT oavsett husets ålder" | OK | B6. Rättar artikelns eget fel i kundens favör (costly signal) |
| "Pensionärer kan få ROT" | OK, formulering | "Ingen övre åldersgräns. Det som avgör är skatten." Aldrig "pensionärer får alltid" |
| "Din skatt räcker" | OK, formulering | "preliminärt", "räcker troligen", "utrymme", och raden om mellanskillnaden. Punktvärde är Skatteverkets jobb |
| "Fast pris" i CTA | OK där jobbet har fast pris; inte i den generiska CTA:n | Service debiteras per timme (§3.7). "Vi lämnar alltid ett fast pris" är artikelns claim om centralbyten, inte om allt |
| "Återbetalningstid under 4 år" (batteri) | ALDRIG | Verktyget handlar om avdraget, inte lönsamhet (GT §I) |
| "Stödtjänster ger X kr/år" | ALDRIG | Utanför verktyget. Får bara sägas: stödtjänster påverkar inte rätten till avdraget (S7) |
| "Ladda bilen: 50 %, max 15 000 kr per laddpunkt" | GRINDAD (`GT GRIND 11`) | Källbelagt (S18) men kanon säger [ASSUMPTION] tills ägaren uppdaterar §3.4 |

**De tre meningarna som gör mest för tilltron hos den analytiska villaägaren** (och varför):
1. **"Räcker inte din skatt betalar du mellanskillnaden i slutskatten. Därför räknar vi på ditt utrymme, inte
   bara på procenten."** Haken han letar efter, sagd först och av oss. Ingen konkurrent i SERP:en säger
   vem som får räkningen (03 §D3); den som säger det har inget kvar att avslöja.
2. **"Materialet ger inget ROT-avdrag. På ett jobb för 30 000 kr där 12 000 kr är material blir avdraget
   5 400 kr, inte 9 000 kr."** Den oflatterande siffran först, med ett räkneexempel han kan kontrollera
   (§11.1 punkt 2 och 3). "Arbetskostnad × 0,3" utan materialraden är exakt vad de enkla räknarna gör.
3. **"Vi kan inte se din skatt. Skatteverkets räknare kan. Vill du ha det exakt: gå dit, det tar tio
   minuter."** Att skicka kunden till myndigheten, bort från oss, är den dyraste signalen ett säljverktyg
   kan skicka, och den som gör hantverkaren trygg att vidarebefordra länken (§2.3).

---

## 8. Mätning för konvertering

Eventen är UX §10:s (`ampy_ak_*`, consent-gatade, buckets, `experiment_id` på allt). Här bara vad som
räknas och varför.

**KPI nu:** offert-klick per 1 000 visningar (`ampy_ak_cta_click {target: offert}` / `ampy_ak_view`),
delat på `surface` (embed/fristående), `src` (organic/artikel/salj) och `class`. Sekundärt: tel-klick per
1 000, delningar per 1 000 (`ampy_ak_share`: relayer-signalen, §2.3), andel visningar med minst ett
bekräftat svar, och **beskedsfördelningen**: ett ärligt verktyg visar en synlig andel TROLIGEN INTE och
NEJ. Är NEJ nära noll är förvalen juicade, inte kunderna berättigade.

**KPI när `/kontakt/` bär `kalkyl` (`LM-1`):** leads per 1 000 visningar per klass och yta, och sedan
**kvalificerade eller vunna leads per 1 000** via `lead_id`-stygnet till CRM-utfallet
(`instrumentation.md` §7). Råa formulär är diagnostik, aldrig mål. `[GAP]`: CRM-fältet för utfall.

**Tre experiment först** (UX §10, i den ordningen; ett åt gången, candour-reglerna är aldrig variabler):
1. **Besked först mot belopp först i kortet.** Testar om "är jag berättigad" verkligen är kundens första
   fråga även i embed (hypotes: ja i embed och säljlänk, kanske inte på "räkna ut"-trafik till den
   fristående sidan).
2. **CTA-verbet.** "Få ett pris efter avdrag" mot "Se ditt pris efter avdrag" mot "Begär offert efter
   avdrag". En primär, benefit-namngiven i alla armar.
3. **Skattefråga A öppen eller hopfälld.** Öppen kan ge fler personliga besked och färre leads (kunden
   ser att skatten inte räcker), hopfälld tvärtom. Mäts på leads **och** på andelen "räcker delvis"-besked:
   fler leads med färre varningar är inte en vinst.

**Nedläggningskriteriet** (ägaren sätter tröskelvärdena, förslag inom hakparentes): efter 90 dagar och
minst [2 000] visningar sammanlagt läggs verktyget ned eller byggs om om **alla tre** gäller: offert-klick
under [5] per 1 000 visningar, delning eller kopiering under [5] per 1 000, och säljarna har skickat
länken färre än [en gång i veckan]. Ett ensamt lågt leadtal räcker inte: ett verktyg som skickar bort
hyresgäster och varnar pensionärer med låg pension ska ha lägre leadtal än rotkalkylator.se, det är
poängen. Två saker som inte är nedläggning utan omedelbar rättelse: (a) leads som kommer via verktyget och
visar sig obehöriga på ett sätt frågorna skulle fångat (mer än [1 av 5]), då är logiken fel; (b) en kund
som litade på ett "Ja" och fick kvarskatt utan att verktyget varnat, då är copyn fel.

---

## 9. Nya ägargrindar (utöver ROT GRIND 1 till 14, GT GRIND 1 till 11, UX fråga 1 till 8)

**LM-1. Överlämningen till formuläret.** `/offert/` svarar 301 till `/kontakt/` och tappar
query-strängen. Besluta: (a) CTA:n går till `/kontakt/` direkt och redirecten lagas så att query följer
med; (b) en FluentSnippet på `/kontakt/` skriver whitelistade parametrar till dolt fält `kalkyl` (+
`kalkyl_src`), `form_type` orört, inget i `ACQUISITION_PARAMS`; (c) formulärets rubrik "Få en kostnadsfri
rådgivning" / knappen "Gratis rådgivning" mot verktygets "pris efter avdrag": ge `/kontakt/` en variant
när `kalkyl` finns ("Få ett pris efter avdrag: fyll i dina uppgifter så ringer en elektriker"); (d) jämka
"Vi ringer dig inom 24 timmar" (`/kontakt/`, Elcentral-kollen) mot kanonens "oftast inom en arbetsdag";
(e) noterat, utanför uppdraget: `/kontakt/` visar "5 av 5" och "3 000+ genomförda installationer om året",
som saknar rättighetsklarerad grund i datalagret.

**LM-2. Säljlänksläget.** Bekräfta: (a) i `src=salj` döljs offert-knappen och telefonen är den enda
handlingen, med raden "Du har redan en offert från oss"; (b) sms-mallen i §4.1, inklusive om säljaren
får signera "/Förnamn, Ampy" eller om sekvens-regeln (ren text, ingen signaturrad) gäller även manuella
sms; (c) att säljarna aldrig bifogar en utskrift av beskedet till offerten; (d) ett CRM-fält "kollen
skickad" om det ska mätas per ärende (aldrig per säljare i dataLayer).

**LM-3. Vem som står bakom reglerna.** (a) Org.nr för Ampy Nordic AB i F-skatt-raden så kunden kan slå
upp bolaget i Skatteverkets "Hämta företagsinformation" (datalagret saknar det, §1.1). (b) Om en namngiven
person ska stå som granskare av regelraderna ("Reglerna granskade av …") eller om raden stannar vid
"kontrollerade mot Skatteverket 2026-09-11" utan namn. Ingen "Verifierad av expert"-badge utan en
faktisk granskare. (c) Underhållsrutinen: vem uppdaterar datumraden och årsparametrarna inför 2027
(`ROT GRIND 12`, `GT GRIND 10`); ett verktyg med "kontrollerad 2026-09-11" i mars 2027 är en odaterad
räknare med datum.

---

## 10. Osäkert (sagt rakt ut)
- Om `/offert/`-redirecten är avsiktlig (kampanjlänkar?) vet jag inte; jag vet bara att den tappar query.
- Attributionsskriptets `source_url` räddar säljlänksfallet i dag, men bara när sessionen börjar på
  verktyget; jag har inte testat det i webbläsare, bara läst koden.
- Andelen NEJ som "ärligt" verktyg bör visa har jag ingen siffra på; trösklarna i §8 är förslag.
- "Fem minuter räcker" ströks på mitt omdöme; ägaren kan vilja ha kvar det.
- Elsäkerhetsverkets register visar Hägersten och info@ampy.se; datalagret säger Solna och [GAP-EMAIL].
  Rör inte det här uppdraget, noteras i källfilen.
