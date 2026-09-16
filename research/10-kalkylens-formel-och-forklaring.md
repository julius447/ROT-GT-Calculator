# 10 · Kalkylens formel, känslighet, granskning och förklaringen för Julius (Agent D, 2026-09-16)

**Status: KLAR 2026-09-16 (Agent D). Fyra delar + hämtlogg. Inget i repot ändrat.**

### Sammanfattning

1. Skattematematiken i `engine.js` följer Inkomstskattelagen paragraf för paragraf (del 1) och är validerad mot
   Skatteverkets e-tjänst (±1 kr). Felen sitter i det kalkylatorn **gissar**, inte i det den räknar.
2. De tre största känsligheterna i kronor på ROT-svaret `[BERÄKNAT]`: **66+ som jobbar** räknas som ung
   löntagare: −21 000 till −37 400 kr (lön 300 000: kalkylatorn säger ca 31 000, rätt är 0). **Bolåneräntan**
   gissas till noll: −15 000 kr vid 50 000 kr ränta, −30 000 vid 100 000 (lön 300 000: 31 000 mot 1 094).
   **Kommunalskatten** gissas till snittet: −4 000 till −10 400 (Österåker) / +3 900 till +9 800 (Dorotea);
   Stockholm −2 200 till −5 500.
3. Två Blockers i `rakna.js`: åldern härleds ur inkomsttypen (F1) och räntan är alltid 0 (F2). Fyra Majors:
   grön teknik-läget ignorerar ROT/RUT använt (F3), RUT frågas aldrig (F4), tillagda personer antas äga (F5),
   "50 000 kr" visas exakt i ett band där kommunen avgör (F6).
4. Åt det snälla hållet (kunden får mer än kalkylatorn säger): fastighetsavgift, a-kassa/sjukpenning,
   pension under 66, kapitalinkomster. De skadar ingen.
5. Tröskeln "räcker till 50 000": löntagare 409 300 kr per år i kalkylatorn, 549 500 med 100 000 kr ränta,
   467 600 i Österåker, 578 000 för 66+ som jobbar. Pensionär 66+: 291 500.
6. Minsta ärliga frågeuppsättning och disclaimern ligger i del 4.3 och 4.4. Ålder i tre band ersätter
   18-årsfrågan utan att kosta en extra fråga.

Uppdrag: beskriva exakt hur kalkylatorn räknar fram "tillgängligt avdrag" i dag (`kalkylator/rakna.js` →
`logik/engine.js`), mäta i kronor hur mycket varje förenkling flyttar svaret, granska `beraknaHushall()` och
förklara för Julius hur Skatteverket egentligen gör. Inkomstår 2026, Sverige. Ingen fil i repot ändras; förslagen
till patch ligger i del 3 och är inte tillämpade.

Taggar: `[FACT src: URL]` = står i källan. `[BERÄKNAT]` = räknat med `logik/engine.js` (kommandon och rådata
i del 2). `[TOLKNING]` = min läsning. `[GAP]` = saknas, aldrig gissat.

---

## Del 1 · FORMELN (så räknar kalkylatorn i dag)

Kalkylatorn (v1, `kalkylator/v1/index.html` + `app.js`) ställer sex frågor: äger du din bostad (ja/nej), är
bostaden äldre än fem år (ja/nej, bara i ROT-läget), har du fyllt 18 år (ja/nej), din inkomst förra året (lön
eller pension + ett belopp), ROT eller grön teknik du redan använt i år (belopp), och "lägg till en person"
(högst fyra). Svaren går till `beraknaHushall()` i `kalkylator/rakna.js`, som per person anropar `skatteutrymme()`
i `logik/engine.js`. Nedan är kedjan steg för steg, med lagrummet för varje steg. Alla paragrafer är lästa i
Inkomstskattelagen (1999:1229) i gällande lydelse på riksdagen.se 2026-09-16 (IL nedan).
`[FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/]`

Lagen kallar avdraget "skattereduktion". Kalkylatorn kallar det avdrag. Samma sak.

### Steg för steg, i ord

| Steg | Vad kalkylatorn gör | Lagrum (IL om inget annat sägs) | Kommentar |
|---|---|---|---|
| 0. Stoppvillkor | Äger inte → stopp. Under 18 → stopp. | 67 kap. 11 § p.1 ("vid beskattningsårets utgång har fyllt 18 år"), 67 kap. 13 a-13 b §§ (bostaden ska ägas/innehas av den som begär), 67 kap. 36 § p.1 och 39 § för grön teknik | `[FACT]` Ägarkravet är per person, men frågan ställs bara till person 1 (se del 3). |
| 1. Inkomst | Ett belopp per person, märkt lön eller pension. Beloppet användaren skriver in är "förra året". | Ingen: kalkylatorns eget val. | Skatteverket räknar på **årets** inkomst (beskattningsåret 2026). Se del 2 g. |
| 2. Fastställd förvärvsinkomst (FI) | FI = lön + pension, avrundad nedåt till helt hundratal. | 1 kap. 5 § 2 st ("avrundas nedåt till helt hundratal kronor och är den fastställda förvärvsinkomsten") | `[FACT]` Kalkylatorn hoppar över allmänna avdrag (62 kap., t.ex. pensionssparavdrag). Litet fel, konservativt åt fel håll (se del 3). |
| 3. Grundavdrag (GA) | Fem inkomstband av prisbasbeloppet 59 200 kr: 0,423 pbb vid låg inkomst, upp till 0,77 pbb, ner till 0,293 pbb. Den som fyllt 66 vid årets ingång får dessutom ett "särskilt belopp" i tolv band. GA får aldrig vara större än FI, och avrundas uppåt till helt hundratal. | 63 kap. 3 § (banden), 63 kap. 3 a § i lydelse Lag (2025:1376) (66+, "vid beskattningsårets ingång har fyllt 66 år"; 67-årsversionen träder i kraft 2027-01-01), 63 kap. 5 § (taket = inkomsten), 63 kap. 2 § 3 st (avrundas uppåt) | `[FACT]` Prisbasbelopp 59 200 kr `[FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html]`. Kalkylatorn sätter "66+" = "valde pension" (se del 2 d). |
| 4. Beskattningsbar förvärvsinkomst (BFI) | BFI = FI − GA (aldrig under 0). | 1 kap. 5 § 3 st ("Från den fastställda förvärvsinkomsten dras grundavdrag och sjöinkomstavdrag ... Det återstående beloppet är den beskattningsbara förvärvsinkomsten") | `[FACT]` |
| 5. Kommunal inkomstskatt | BFI × 32,38 % (Skatteverkets snittsats 2026). | 65 kap. 3 § (skattesatsen i hemortskommunen × BFI) | `[FACT]` Snittet 32,38 % `[FACT src: K9 ovan]`. Kalkylatorn frågar inte efter kommun. Se del 2 a. |
| 6. Statlig inkomstskatt | 20 % av den del av BFI som är över skiktgränsen 643 000 kr. | 65 kap. 5 § 1 st ("20 procent av den del av den beskattningsbara förvärvsinkomsten som överstiger en skiktgräns") | `[FACT]` Skiktgräns 643 000 kr `[FACT src: K9]`. |
| 7. Fastighetsavgift | Kalkylatorn sätter alltid **0** (`taxeringsvarde: 0`). Motorn kan räkna 0,75 % av taxeringsvärdet, max 10 425 kr, men får aldrig något värde från kalkylatorn. | 67 kap. 2 § 2 st (räknas mot "kommunal fastighetsavgift enligt lagen (2007:1398)"); beloppen: `[FACT src: K9]` "0,75 procent av fastighetens taxeringsvärde, men aldrig mer än 10 425 kronor" | Se del 2 b. Kapitalskatt (30 % på ränta, utdelning, bostadsvinst) ingår också i potten enligt 67 kap. 2 § 2 st ("kommunal och statlig inkomstskatt som beräknats enligt 65 kap.", där 65 kap. 7 § är kapitalskatten) men modelleras inte. Se del 2 f. |
| 8. Skattepotten | Pott = kommunal + statlig + fastighetsavgift. Det är de skatter som avdragen får räknas mot. Aldrig allmän pensionsavgift, begravningsavgift, kyrkoavgift eller public service-avgift. | 67 kap. 2 § 2 st | `[FACT]` Skatteverket säger samma sak: "Rot- eller rutavdraget räknas av mot kommunal och statlig inkomstskatt, statlig fastighetsskatt och kommunal fastighetsavgift." `[FACT src: https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/rotochrutarbete/privatrotochrutarbetefaq/hurmycketmastejagtjanaforattkunnautnyttjamaximalskattereduktionforrotochrutarbete.5.5fc8c94513259a4ba1d800034104.html]` |
| 9. Reduktioner som ligger FÖRE ROT | I lagens ordning: (a) allmän pensionsavgift: 7 % av lönen, max 47 100 kr, i helt hundratal (motorn rundar ner, lagen till närmaste hundratal, se F16); bara på lön, aldrig på pension. (b) Jobbskatteavdrag: fyra band under 66 (brytpunkter 0,91 / 3,24 / 8,08 pbb, 38,74 % och 25,1 %, tak 3,027 pbb minus GA, gånger kommunalskattesatsen), tre band för 66+ (22 % upp till 1,75 pbb, max 0,6293 pbb). Bara mot kommunal skatt. (c) Förvärvsinkomstreduktion: 1 500 kr, eller 0,75 % av (BFI − 40 000) när BFI ligger mellan 40 000 och 240 000. Bara mot kommunal skatt. (d) Underskott av kapital: 30 % av ränteutgifter upp till 100 000 kr, 21 % över. Kalkylatorn sätter alltid ränteutgifter = **0**. | Ordningen: 67 kap. 2 § 1 st ("sjöinkomst, allmän pensionsavgift, arbetsinkomst (jobbskatteavdrag), sjukersättning och aktivitetsersättning, förvärvsinkomst, boende i vissa områden, underskott av kapital, hushållsarbete, installation av grön teknik, gåva och avgift till arbetslöshetskassa i nu nämnd ordning", Lag 2025:1370). (a) 67 kap. 4 § + lagen (1994:1744) om allmän pensionsavgift 2-4 §§ `[FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/]`. (b) 67 kap. 7 § (under 66, Lag 2025:1376) och 8 § (66+). (c) 67 kap. 46-47 §§. (d) 67 kap. 10 §. "Bara mot kommunal": 67 kap. 2 § 2 st ("Skattereduktion enligt 5-9 d, 34, 35 och 46-48 §§ ska dock räknas av endast mot kommunal inkomstskatt"). | `[FACT]` Hoppas över med flit: sjöinkomst (67 kap. 3 §), sjuk-/aktivitetsersättning (9 a-9 d §§), regional reduktion (34-35 §§). Ligger EFTER ROT och påverkar inte: gåva, a-kasseavgift. |
| 10. Utrymme | Utrymme = pott − pensionsavgift − jobbskatteavdrag − förvärvsinkomstreduktion − underskott av kapital (aldrig under 0). | Följer av 67 kap. 2 § (avdragen "i nu nämnd ordning" mot samma pott). Skatteverket: ROT/RUT medges "aldrig ... större belopp än vad du ska betala i slutlig skatt efter det att den slutliga skatten minskats med skattereduktionerna för allmän pensionsavgift, arbetsinkomst (jobbskatteavdrag) och underskott av kapital." `[FACT src: K5 ovan]` | Skatteverket nämner inte förvärvsinkomstreduktionen i FAQ-meningen, men lagen (67 kap. 2 §) lägger den före hushållsarbete och Skatteverkets e-tjänst drar den ("förvärvsinkomst − 1 500" i körning 1, `research/underlag/rot-kallor.md` K11). `[FACT]` |
| 11. ROT per person | ROT = min(50 000, utrymme) − redan använt ROT i år (aldrig under 0). Under 50 000 avrundas svaret till närmaste tusental och får "ca". | Taket: 67 kap. 19 § 2 st ("Skattereduktionen för sådant hushållsarbete som anges i 13 a och 13 b §§ får dock uppgå till högst 50 000 kronor för ett beskattningsår", Lag 2025:322). ROT + RUT tillsammans högst 75 000 kr (samma stycke). | `[FACT]` RUT frågas inte alls (se del 3). |
| 12. Grön teknik per person | I GT-läget: GT = min(50 000, utrymme) − redan använt grön teknik i år. Samma formel som ROT, **utan** att dra bort ROT/RUT som använts i år. | Taket: 67 kap. 45 § 2 st ("Den sammanlagda skattereduktionen får uppgå till högst 50 000 kronor för ett beskattningsår"). Ordningen: 67 kap. 2 § 1 st, hushållsarbete före grön teknik. | Rätt formel vore GT = min(50 000, utrymme − ROT/RUT använt i år) − GT använt. Se del 3 (Major). |
| 13. Hushållet | Summan av varje persons rest. "upp till" om någon person saknar inkomst, "ca" om någon person räknats under taket, annars exakt. | 67 kap. 19 § och 45 § är per person ("för ett beskattningsår" per skattskyldig); taket är inte per bostad. `[FACT src: research/01-rot-regelverk.md D9, K12]` | Personer 2-4 antas äga, bo där och vara över 18 (kommentar i `index.html`). |

### Samma sak som pseudokod (exakt vad `rakna.js` + `engine.js` gör i dag)

```
PBB = 59 200 · KS = 0,3238 · SKIKT = 643 000 · TAK = 50 000

för varje person p i hushållet:
    om p.inkomst saknas:  rest = max(0, TAK − p.använt); flagga "upp till"; nästa person
    lön     = p.inkomst om p.typ == 'lon'     annars 0
    pension = p.inkomst om p.typ == 'pension' annars 0
    är66    = (p.typ == 'pension')                       # förenkling: pension ⇒ 66+

    FI   = rundaNed100(lön + pension)                    # IL 1:5
    GA   = grundavdrag(FI, är66)                         # IL 63:3, 63:3 a, 63:5, 63:2 (upp till 100)
    BFI  = max(0, FI − GA)                               # IL 1:5
    kommunal = round(BFI × KS)                           # IL 65:3
    statlig  = round(0,20 × max(0, BFI − SKIKT))         # IL 65:5
    fastighetsavgift = 0                                 # kalkylatorn skickar aldrig ett taxeringsvärde
    pott = kommunal + statlig + fastighetsavgift         # IL 67:2 2 st

    pensionsavgift = min(47 100, rundaNed100(0,07 × lön)) om lön > 0 annars 0   # IL 67:4, L 1994:1744
    pensionsavgift = min(pensionsavgift, pott)
    jsa  = min(jobbskatteavdrag(lön, GA, KS, är66), kommunal)                    # IL 67:7 / 67:8, bara kommunal
    förv = min(redFörvärvsinkomst(BFI), kommunal − jsa)                          # IL 67:46-47, bara kommunal
    kap  = redUnderskottKapital(0)  = 0                                          # IL 67:10, ränta frågas inte

    utrymme = max(0, pott − pensionsavgift − jsa − förv − kap)                   # IL 67:2 1 st, ordningen
    t    = min(TAK, utrymme)                                                     # IL 67:19 2 st / 67:45 2 st
    rest = max(0, t − p.använt)
    om t < TAK: rest = round(rest / 1000) × 1000; flagga "ca"
    summa += rest

svar = summa, med prefix "upp till" | "ca" | "" och stopp om inte ägare eller under 18
```

Motorn är validerad mot Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" med fyra körningar 2026-09-11 (±1 kr
när samma indata matas in). `[FACT src: research/underlag/rot-kallor.md K11, https://www7.skatteverket.se/portal/rot-rut]`
Så själva skattematematiken är rätt. Det som kan bli fel är **indata**: kalkylatorn gissar kommun, fastighetsavgift,
räntor, ålder, inkomsttyp och år. Del 2 mäter vad gissningarna kostar.


## Del 2 · KÄNSLIGHET (vad varje förenkling kostar i kronor)

Allt i del 2 är `[BERÄKNAT]` med motorn oförändrad: `node kanslighet.mjs` / `extra.mjs` / `ks.mjs` (skript och
rådata i sessionens scratchpad, återgivna i tabellerna nedan). Skripten importerar
`logik/engine.js` och `kalkylator/rakna.js` med `import()` och använder motorns egna funktioner (`grundavdrag`,
`jobbskatteavdrag`, `redForvarvsinkomst`, `redUnderskottKapital`) för de fall motorn själv inte kan uttrycka
(a-kassa, kapitalinkomst, pension under 66). Kontroll: den egna kedjan ger exakt samma utrymme som
`engine.skatteutrymme()` för lön och pension i alla sex basfallen.

Sex basfall: löntagare under 66 med lön 240 000 / 300 000 / 360 000 / 480 000 kr per år, pensionär 66+ med
pension 240 000 / 300 000 kr per år. "Utrymme" = `utrymme_rot_rut_gt`. "ROT-svar" = min(50 000, utrymme), det
kalkylatorn visar (före avrundning till tusental).

### 2.0 Basfallet (exakt vad kalkylatorn räknar i dag)

| Person | FI | Grundavdrag | BFI | Kommunal 32,38 % | Pensionsavgift | Jobbskatteavdrag | Förvärvsink. | Utrymme | Kalkylatorn visar |
|---|---|---|---|---|---|---|---|---|---|
| Löntagare 240 000 | 240 000 | 40 000 | 200 000 | 64 760 | −16 800 | −25 718 | −1 200 | **21 042** | ca 21 000 kr |
| Löntagare 300 000 | 300 000 | 34 000 | 266 000 | 86 131 | −21 000 | −32 537 | −1 500 | **31 094** | ca 31 000 kr |
| Löntagare 360 000 | 360 000 | 28 000 | 332 000 | 107 502 | −25 200 | −39 357 | −1 500 | **41 445** | ca 41 000 kr |
| Löntagare 480 000 | 480 000 | 17 400 | 462 600 | 149 790 | −33 600 | −52 390 | −1 500 | **62 300** | 50 000 kr |
| Pensionär 66+ 240 000 | 240 000 | 121 200 | 118 800 | 38 467 | 0 | 0 | −591 | **37 876** | ca 38 000 kr |
| Pensionär 66+ 300 000 | 300 000 | 136 500 | 163 500 | 52 941 | 0 | 0 | −926 | **52 015** | 50 000 kr |

Samma siffror som uppslagstabellen i `01-rot-regelverk.md` E4 (20 000 / 25 000 / 30 000 / 40 000 kr per månad).
Stockholm (30,55 %) och lön 360 000 ger 37 594 kr och pension 240 000 ger 35 702 kr, exakt Skatteverkets e-tjänst
(körning 1 och 2 i `research/underlag/rot-kallor.md` K11). Matematiken håller. Nu förenklingarna.

### 2.1 Tabellen: utrymme per variant (delta mot basfallet), och vad ROT-svaret blir (delta)

| Förenkling | Löntagare 240 000 | Löntagare 300 000 | Löntagare 360 000 | Löntagare 480 000 | Pensionär 240 000 | Pensionär 300 000 |
|---|---|---|---|---|---|---|
| Bas (kalkylatorn) | 21 042 · ROT 21 042 | 31 094 · ROT 31 094 | 41 445 · ROT 41 445 | 62 300 · ROT 50 000 | 37 876 · ROT 37 876 | 52 015 · ROT 50 000 |
| (a) kommunalskatt 29,0 % | 16 967 (−4 075) · ROT −4 075 | 25 499 (−5 595) · ROT −5 595 | 34 332 (−7 113) · ROT −7 113 | 52 132 (−10 168) · ROT ±0 | 33 861 (−4 015) · ROT −4 015 | 46 489 (−5 526) · ROT −3 511 |
| (a) kommunalskatt 35,3 % | 24 563 (+3 521) · ROT +3 521 | 35 927 (+4 833) · ROT +4 833 | 47 590 (+6 145) · ROT +6 145 | 71 083 (+8 783) · ROT ±0 | 41 345 (+3 469) · ROT +3 469 | 56 790 (+4 775) · ROT ±0 |
| (a) Stockholm 30,55 % | 18 835 (−2 207) · ROT −2 207 | 28 065 (−3 029) · ROT −3 029 | 37 594 (−3 851) · ROT −3 851 | 56 795 (−5 505) · ROT ±0 | 35 702 (−2 174) · ROT −2 174 | 49 023 (−2 992) · ROT −977 |
| (b) fastighetsavgift 10 425 (ensam ägare av villa) | 31 467 (+10 425) · ROT +10 425 | 41 519 (+10 425) · ROT +10 425 | 51 870 (+10 425) · ROT +8 555 | 72 725 (+10 425) · ROT ±0 | 48 301 (+10 425) · ROT +10 425 | 62 440 (+10 425) · ROT ±0 |
| (b) fastighetsavgift delad 50/50 (5 213 per ägare) | +5 212 | 36 306 (+5 212) · ROT +5 212 | 46 657 (+5 212) · ROT +5 212 | ±0 på ROT | +5 212 | ±0 på ROT |
| (c) ränteutgifter 50 000 | 6 042 (−15 000) · ROT −15 000 | 16 094 (−15 000) · ROT −15 000 | 26 445 (−15 000) · ROT −15 000 | 47 300 (−15 000) · ROT −2 700 | 22 876 (−15 000) · ROT −15 000 | 37 015 (−15 000) · ROT −12 985 |
| (c) ränteutgifter 100 000 | 0 (−21 042) · ROT −21 042 | 1 094 (−30 000) · ROT −30 000 | 11 445 (−30 000) · ROT −30 000 | 32 300 (−30 000) · ROT −17 700 | 7 876 (−30 000) · ROT −30 000 | 22 015 (−30 000) · ROT −27 985 |
| (d) "Pension" vald av en 62-åring (räknas som under 66) | n/a | n/a | n/a | n/a | 63 560 (+25 684) · ROT +12 124 (blir 50 000) | 84 631 (+32 616) · ROT ±0 |
| (d') "Lön" vald av en 67-åring som jobbar (räknas som 66+) | 0 (−21 042) · ROT −21 042 | 0 (−31 094) · ROT −31 094 | 4 046 (−37 399) · ROT −37 399 | 25 076 (−37 224) · ROT −24 924 | n/a | n/a |
| (e) a-kassa/sjukpenning i stället för lön | 46 760 (+25 718) · ROT +25 718 | 63 631 (+32 537) · ROT +18 906 (blir 50 000) | 80 802 (+39 357) · ROT +8 555 (blir 50 000) | 114 690 (+52 390) · ROT ±0 | n/a | n/a |
| (f) kapitalinkomst 30 000 (ränta, utdelning) | 30 042 (+9 000) · ROT +9 000 | 40 094 (+9 000) · ROT +9 000 | 50 445 (+9 000) · ROT +8 555 (blir 50 000) | 71 300 (+9 000) · ROT ±0 | 46 876 (+9 000) · ROT +9 000 | 61 015 (+9 000) · ROT ±0 |
| (g) årets inkomst +3 % mot fjolåret | +1 187 | +1 582 | +1 919 | ROT ±0 | +1 708 | ROT ±0 |
| (g) årets inkomst +5 % | +2 011 | +2 638 | +3 166 | ROT ±0 | +2 848 | ROT ±0 |
| (g) årets inkomst −10 % | −3 922 | −5 125 | −6 131 | 53 907 · ROT ±0 | −5 630 | 44 962 · ROT −5 038 |
| (b+c) villa ensam ägare + ränta 100 000 | 1 467 (−19 575) | 11 519 (−19 575) | 21 870 (−19 575) | 42 725 · ROT −7 275 | 18 301 (−19 575) | 32 440 · ROT −17 560 |
| (a+b+c) 35,3 % + halv avgift + ränta 50 000 | | 26 139 · ROT −4 955 | 37 802 · ROT −3 643 | 61 295 · ROT ±0 | | |
| (a+b+c) 29 % + halv avgift + ränta 50 000 | | 15 711 · ROT −15 383 | 24 544 · ROT −16 901 | 42 344 · ROT −7 656 | | |

Kommunalskattens ytterlägen 2026 är Österåker 28,93 % och Dorotea 35,65 %, snittet 32,38 %.
`[FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/ "Österåker ... 28,93 procent", "Dorotea ... 35,65 procent", "32,38 procent", 2025-12-15]`
Med de riktiga ytterlägena: löntagare 360 000 ger 34 185 (Österåker) till 48 327 (Dorotea), alltså −7 260 / +6 882
mot kalkylatorns 41 445. Stockholms stad 30,55 % `[BERÄKNAT ur K11 körning 1]` ligger under snittet, så för Ampys
Stockholmskunder **överskattar** kalkylatorn utrymmet med 2 200 till 5 500 kr.

Kronor per steg (bra att ha i huvudet): +10 000 kr i inkomst ger löntagaren +1 640 till +1 730 kr utrymme (under
skiktgränsen), pensionären +2 370 till +2 440 kr. +1 procentenhet kommunalskatt ger +1 200 (240 000) till
+3 000 kr (480 000). Varje 10 000 kr i ränteutgifter tar −3 000 kr. `[BERÄKNAT]`

Om (e): a-kassa och sjukpenning är pensionsgrundande "inkomst av anställning" (socialförsäkringsbalken 59 kap.
13 § p.4 och p.8), så allmän pensionsavgift 7 % dras, men de är **inte** arbetsinkomst i jobbskatteavdragets mening
(IL 67 kap. 6 § undantar 59 kap. 13 § utom p.11-12), så inget jobbskatteavdrag. Därför mer utrymme än lön.
`[FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialforsakringsbalk-2010110_sfs-2010-110/ 59 kap. 13 §; IL 67 kap. 6 §]`
Sjukersättning (förtidspension) är ett tredje fall: ingen pensionsavgift (L 1994:1744 4 § 2 st) men en egen
reduktion (IL 67 kap. 9 a-9 c §§) som motorn inte har; Skatteverkets e-tjänst avvisar också det fallet. `[FACT]`

Om (d) och (d'): kalkylatorn har ingen åldersfråga utöver 18 år. Den läser "Pension" som "fyllt 66 vid årets
ingång" och "Lön" som "under 66". Båda gissningarna kan slå fel:
- En 62-åring med tjänstepension eller tidigt uttag på 240 000 kr får inte det förhöjda grundavdraget (63 kap. 3 a §
  kräver fyllt 66 vid årets ingång), alltså större beskattningsbar inkomst, mer kommunalskatt, och **63 560 kr**
  utrymme, inte 37 876. Kalkylatorn säger "ca 38 000 kr", rätt svar är 50 000 kr. Fel åt det säkra hållet.
- En 67-åring som fortfarande jobbar med 300 000 kr i lön har förhöjt grundavdrag 136 500 kr, kommunalskatt 52 941
  kr, men pensionsavgift 21 000 + jobbskatteavdrag för 66+ (67 kap. 8 §) 36 599 + förvärvsinkomst 926 = 58 525 kr
  i reduktioner före ROT. Utrymmet är **0 kr**. Kalkylatorn säger "ca 31 000 kr". Fel åt det farliga hållet, och
  hela beloppet blir kvarskatt. 66+ med lön når 50 000 kr först vid 578 000 kr per år. `[BERÄKNAT]`
- 66+ med både lön och pension (150 000 + 150 000): verkligt utrymme 15 416 kr; skriver hon allt som Lön säger
  kalkylatorn 31 094, allt som Pension 52 015. `[BERÄKNAT]`

Om (g): kalkylatorn frågar efter "inkomst förra året" men Skatteverket räknar på 2026 års inkomst. Effekten är
liten i kronor (en löneökning på 3 % flyttar 1 200 till 1 900 kr) och slår bara nära tröskeln. Storleken på en
typisk löneökning 2026 är `[GAP]` (inte hämtad, behövs inte för slutsatsen). Den som gått i pension, blivit
arbetslös eller sjukskriven under året har däremot bytt kolumn, och då är det (d)/(e) som gäller, inte (g).

### 2.2 Var svaret slår om mellan "räcker till 50 000" och "räcker inte"

Lägsta årsinkomst (i 100-kronorssteg) där utrymmet når 50 000 / 75 000 (ROT + RUT) / 100 000 (ROT + grön teknik):

| Scenario | 50 000 | 75 000 | 100 000 |
|---|---|---|---|
| Löntagare, snitt 32,38 %, ingen ränta, ingen fastighetsavgift (= kalkylatorn) | **409 300** | 529 800 | 628 300 |
| Löntagare, Österåker 28,93 % | 467 600 | | |
| Löntagare, 29,0 % | 466 300 | 583 700 | 678 900 |
| Löntagare, Stockholm 30,55 % | 437 900 | | |
| Löntagare, 35,3 % | 372 200 | 493 700 | 582 100 |
| Löntagare, Dorotea 35,65 % | 368 200 | | |
| Löntagare, villa ensam ägare (avgift 10 425) | 349 000 | 488 900 | 587 100 |
| Löntagare, ränta 50 000 | 490 500 | 589 100 | 675 300 |
| Löntagare, ränta 100 000 | 549 500 | 648 100 | 704 000 |
| Löntagare, villa + ränta 100 000 | 508 400 | 606 900 | 684 000 |
| Löntagare, 35,3 % + ränta 100 000 | 511 300 | 599 600 | 676 200 |
| A-kassa/sjukpenning hela året, snitt | 251 400 | 339 600 | 426 900 |
| 66+ som jobbar (lön), snitt | 578 000 | | |
| Pensionär 66+, snitt (= kalkylatorn) | **291 500** | 395 300 | 492 600 |
| Pensionär 66+, 29,0 % | 316 300 | 431 500 | 529 100 |
| Pensionär 66+, 35,3 % | 273 700 | 369 200 | 462 800 |
| Pensionär 66+, villa ensam ägare | 247 200 | 352 200 | 454 500 |
| Pensionär 66+, ränta 50 000 | 353 900 | 456 200 | 538 900 |
| Pension men under 66, snitt | 201 100 | 273 000 | 343 200 |

Läsning: kalkylatorn säger "50 000 kr" till en löntagare från 409 300 kr per år (34 100 kr per månad). Har samma
person 100 000 kr i ränteutgifter är den riktiga gränsen 549 500 kr. Mellan 409 300 och 549 500 kr visar
kalkylatorn ett tak som Skatteverket inte kommer att ge. `[BERÄKNAT]`

### 2.3 Rangordning: värsta förenklingarna

Rangordnat efter hur många kronor ROT-svaret kan flyttas, med riktningen (överskattar = kunden kan få kvarskatt,
underskattar = kunden tror sig få mindre än hon får). Alla belopp `[BERÄKNAT]` ur tabellerna ovan.

| # | Förenkling | Max fel på ROT-svaret | Riktning | Hur vanligt (min bedömning, `[TOLKNING]`) |
|---|---|---|---|---|
| 1 | **Lön ⇒ under 66.** 66+ som jobbar räknas som ung löntagare. | −21 000 till −37 400 kr (utrymme 0 vid lön ≤ 300 000) | Överskattar, hela beloppet | Ovanligt bland ROT-kunder men inte sällsynt; många jobbar deltid efter 66. |
| 2 | **Ränteutgifter = 0.** | −15 000 (50 000 kr ränta) / −30 000 (100 000 kr ränta) | Överskattar | Mycket vanligt: nästan alla villaägare under 60 har bolån. Värst för unga villaägare, kalkylatorns kärnkund. |
| 3 | **Snittkommun 32,38 %.** | −4 000 till −10 400 (Österåker), +3 900 till +9 800 (Dorotea); Stockholm −2 200 till −5 500 | Båda; överskattar i Stockholmsregionen | Alltid, varje kund. |
| 4 | **A-kassa/sjukpenning räknas som lön.** | +18 900 till +25 700 (svaret blir 50 000 i stället för 21 000 till 31 000) | Underskattar | Mindre vanligt hela året; delår vanligt. |
| 5 | **Pension ⇒ 66+.** 62-åring med pension. | +12 100 (240 000: 38 000 → 50 000) | Underskattar | Ovanligt. |
| 6 | **Fastighetsavgift = 0.** | +10 425 ensam ägare, +5 213 per person i par; 0 för bostadsrätt och hus byggda 2012 eller senare | Underskattar | Vanligt (varje villaägare med hus äldre än 15 år). |
| 7 | **Kapitalinkomst ignoreras.** | +9 000 vid 30 000 kr ränta/utdelning; obegränsat året man säljer bostad med vinst | Underskattar | Vanligt i små belopp, stort bara vid bostadsförsäljning. |
| 8 | **Fjolårets inkomst.** | ±1 200 till ±8 400 | Båda, bara nära tröskeln | Alltid, men litet. |

Tre största i kronor, kort: (1) 66+ med lön: upp till −37 400 kr, (2) bolåneräntan: −30 000 kr vid 100 000 kr
ränta, (3) kommunalskatten: ±10 400 kr. De två första är åt det farliga hållet (kalkylatorn lovar mer än Skatteverket
ger). Fastighetsavgift, a-kassa, pension under 66 och kapitalinkomst går alla åt det snälla hållet: kunden får mer
än kalkylatorn säger, vilket inte skadar någon.


## Del 3 · GRANSKNING av rakna.js beraknaHushall()

Provkörningar P1-P18 nedan är `node probe.mjs` mot `kalkylator/rakna.js` oförändrad (rådata i scratchpad,
återgivna här). `[BERÄKNAT]`

### 3.1 Är "min(50 000, utrymme) − redan använt" samma sak som Skatteverkets sätt?

**Ja, så länge bara ROT är använt.** Skatteverket har två gränser på årets ROT: taket 50 000 kr (67 kap. 19 § 2 st)
och personens utrymme efter reduktionerna som ligger före (67 kap. 2 §). Rest = min(50 000 − ROT använt, utrymme −
ROT använt) = min(50 000, utrymme) − ROT använt. Samma tal. Det som redan använts (preliminär skattereduktion,
HUSFL 17 §) tar av båda gränserna lika mycket. `[FACT]` + `[BERÄKNAT]`

**Nej, så snart RUT eller grön teknik är med i bilden:**
- RUT använt i år tar av utrymmet (samma pott) och av det gemensamma taket 75 000 kr, men kalkylatorn frågar
  aldrig efter RUT. Rätt rest = min(50 000 − ROT använt, 75 000 − ROT − RUT använt, utrymme − ROT − RUT använt).
  Lön 360 000 och RUT 25 000 använt: rätt 16 445 kr, kalkylatorn säger ca 41 000 kr. `[BERÄKNAT]`
- I grön teknik-läget dras bara "grön teknik använt" från min(50 000, utrymme). Men ROT/RUT ligger **före** grön
  teknik i 67 kap. 2 § och äter potten först. Rätt rest = min(50 000 − GT använt, utrymme − ROT − RUT använt − GT
  använt). Lön 480 000 (utrymme 62 300), ROT 50 000 använt i vår, laddbox i höst: rätt 12 300 kr, kalkylatorn
  säger 50 000 kr (P8). Det är Ampys egen korsförsäljning (elcentral, sedan laddbox) som räknas fel. `[BERÄKNAT]`

### 3.2 Fynd, rangordnade

| # | Allvar | Fynd | Bevis | Fix (förslag, inte tillämpat) |
|---|---|---|---|---|
| F1 | **Blocker** | Åldern gissas från inkomsttypen. "Lön" = under 66, "Pension" = 66+. En 66+ som jobbar får "ca 31 000 kr" vid lön 300 000; verkligt utrymme 0 kr (förhöjt grundavdrag + jobbskatteavdrag 66+ + pensionsavgift äter hela kommunalskatten). Vid lön 360 000: 41 000 mot 4 046. Hela beloppet blir kvarskatt. Åt andra hållet: 62-åring med pension 240 000 får "ca 38 000" när rätt svar är 50 000. | Del 2, rad (d) och (d'); `rakna.js` rad `ar_66_plus: p.typ === 'pension'` | Ersätt "Har du fyllt 18 år?" med en enda åldersfråga i tre lägen: **Under 18 / 18 till 65 / 66 eller äldre** (66 = fyllt 66 den 1 januari 2026, alltså född 1959 eller tidigare, 63 kap. 3 a §). Skicka `ar_66_plus` från den, inte från typen. Samma antal frågor som i dag. För 66+ som har både lön och pension: låt "Lön / Pension" bli "Lön / Pension / Båda" med två fält, eller acceptera felet och skriv det i disclaimern. |
| F2 | **Blocker** | Ränteutgifter sätts alltid till 0. Varje 10 000 kr bolåneränta tar 3 000 kr av utrymmet (67 kap. 10 §). Löntagare 300 000 med 100 000 kr ränta: kalkylatorn ca 31 000, rätt 1 094. Med 50 000 kr ränta: rätt 16 094. Kärnkunden (villaägare 30-50 år med bolån) får det mest felaktiga svaret, åt det farliga hållet. | Del 2, rad (c); tröskeln flyttar från 409 300 till 549 500 kr | Ett valfritt fält per person: "Ränteutgifter förra året (valfritt)" med undertext "Står på kontrolluppgiften från banken. Delar ni lånet, skriv din del." Skicka `ranteutgifter`. Tomt fält = 0 som i dag, men då ska disclaimern säga att räntan inte är med. |
| F3 | **Major** | Grön teknik-läget struntar i ROT/RUT som använts i år, fast de ligger före i avräkningen. Lön 480 000 + ROT 50 000 använt: kalkylatorn 50 000, rätt 12 300. | P8; `rakna.js` har ett enda `anvant`-fält som betyder olika saker per läge | I GT-läget: två fält, "ROT och RUT du redan använt i år" och "Grön teknik du redan använt i år". Rest = max(0, min(TAK − gtAnvant, utrymme − rotRutAnvant − gtAnvant)). |
| F4 | **Major** | RUT frågas inte alls (se 3.1). Den som städar med RUT och renoverar med ROT samma år får för högt svar, upp till hela RUT-beloppet. | Del 3.1: 41 000 mot 16 445 | Minsta ändring: döp om fältet till "ROT och RUT du redan använt i år" och dra summan från både tak och utrymme (rest = min(50 000, utrymme) − summan). Det blir konservativt när taket binder (person med stort utrymme och RUT 20 000 får 30 000 i stället för 50 000), men aldrig för högt. Exakt: två fält. |
| F5 | **Major** | Personer 2-4 antas äga bostaden, bo där och vara över 18. Ägarfrågan ställs bara till person 1. En sambo som inte står på lagfarten eller i föreningen kan inte få ROT alls (K12: "Den del som avser rotarbete kan inte överföras till Ali eftersom han inte äger huset"). Hushållssumman kan då vara 50 000 kr för hög. | `index.html` kommentar "antas bo i bostaden och uppfylla frågorna ovan"; P6 "upp till 81 000 kr" | Under "Lägg till en person": en rad "Bara personer som äger bostaden och bor där." Eller en kryssruta per tillagd person, "Äger bostaden också", förvald ja. Billigast: raden. |
| F6 | **Major** | "50 000 kr" visas exakt, utan "ca", så snart utrymmet vid snittkommunalskatt är minst 50 000. Löntagare 420 000: utrymme 51 796 vid snitt, 47 123 i Stockholm, 42 985 i Österåker. Kunden får "50 000 kr" som ett löfte i ett band där svaret beror på kommunen. Bandet är 409 300 till 467 600 kr per år (34 000 till 39 000 kr per månad), vanliga löner. | P9, P10; del 2.2 | Visa exakt "50 000 kr" bara när utrymmet räknat med lägsta kommunalskatt (28,93 %, `KS_BAND[0]`) fortfarande är minst 50 000; annars "ca 50 000 kr". Alternativ: fråga efter kommun (en lista på 290 rader, eller ett postnummer) och räkna exakt. Disclaimern (del 4) täcker resten. |
| F7 | Minor | Kommunalskatten är alltid 32,38 %. Stockholms stad har 30,55 %, så Stockholmskunder får 2 200 till 5 500 kr för mycket; Dorotea får 4 000 till 9 800 för lite. | Del 2, rad (a) | Kommunfråga (valfri, postnummer eller lista) eller disclaimern. Skatteverkets egen tjänst frågar efter kommun. |
| F8 | Minor | Fastighetsavgiften är alltid 0. Villaägare (hus färdigt före 2012) har 10 425 kr mer i potten, delat på ägarna. Felet är åt det snälla hållet. | Del 2, rad (b) | Valfri fråga "Villa eller radhus byggt före 2012?" ger +10 425 delat på antalet ägare. Om fältet läggs till: dela avgiften på personerna, inte 10 425 per person. Låg prioritet: felet skadar ingen. |
| F9 | Minor | "ca 0 kr" utan förklaring när skatten inte räcker till något (lön 80 000). Kunden förstår inte varför. | P1 | När utrymme = 0 och inget använt: not "Din skatt räcker inte till något ROT-avdrag i år" (ampy-rost: "kan"). |
| F10 | Minor | Använt mer än utrymmet ger bara "Du har redan använt hela årets ROT-avdrag". Kunden har i själva verket redan ett belopp som kommer tillbaka som kvarskatt (lön 300 000, använt 45 000: 13 906 kr för mycket). Kalkylatorn ser det men säger det inte. | P4 | Om anvant > t: not "Du har använt ca X kr mer än din skatt räcker till. Den delen kan Skatteverket kräva tillbaka i deklarationen." Candour-poäng, låg kostnad. |
| F11 | Minor | Fältet "ROT du redan använt i år" kan läsas som fakturabeloppet. Skriver kunden 100 000 (renoveringens pris) i stället för 30 000 (avdraget) blir svaret 0. | P5 | Undertext: "Själva avdraget, inte hela fakturan. Du ser det i Skatteverkets tjänst Mina skattereduktioner." |
| F12 | Minor | "Din inkomst förra året" men Skatteverket räknar på 2026. Litet fel i kronor (±1 200 till ±8 400) men fel år i etiketten. | Del 2, rad (g) | Etikett "Din inkomst i år, ungefär" med undertext "Lön eller pension före skatt. Ta förra året om du inte vet." |
| F13 | Minor | "Har du fyllt 18 år?" men lagen säger fyllt 18 senast vid årets slut (67 kap. 11 § p.1). En 17-åring som fyller 18 i december svarar nej och stoppas fel. | P15 (stopptexten är rätt, frågan är fel) | Frågan "Fyller du 18 senast i år?" eller (F1) tre åldersband där det första heter "Fyller 18 först nästa år". |
| F14 | Minor | Femårsnoten: "Yngre än fem år: ROT gäller bara reparationer." Regeln räknar kalenderår efter värdeåret (67 kap. 13 c § p.5): för 2026 är om- och tillbyggnad ok vid värdeår 2020 eller tidigare (K14). Ett hus färdigt 2021 är "fem år" 2026 men fortfarande spärrat. | `01-rot-regelverk.md` B5 | Fråga "Var huset färdigbyggt 2020 eller tidigare?" i stället för "äldre än fem år". Beloppet påverkas inte, bara noten. |
| F15 | Minor | Max 4 personer är en UI-gräns, inte lag (sju delägare i ett sommarhus får sju tak, K12 familjen Ek). `rakna.js` själv klarar fler (P13 ger "Ni 5 tillsammans"). | P12, P13 | Behåll 4; skriv "Fler ägare? Var och en har ett eget tak på 50 000 kr." under knappen när den döljs. |
| F16 | Minor | Allmänna avdrag (pensionssparande med avdragsrätt, 62 kap.) och allmän pensionsavgiftens avrundning (lagen: närmaste hundratal, motorn: nedåt) ger ±100 kr. | `extra.mjs` sista blocket: lön 337 000 ger 100 kr diff | Ingen åtgärd. Under avrundningen till tusental. |
| F17 | Minor | Kapitalinkomster (30 % statlig skatt) ingår i potten enligt 67 kap. 2 § men frågas inte. Året man sålt bostad med vinst är utrymmet mycket större. Åt det snälla hållet. | Del 2, rad (f) | Ingen fråga (för sällsynt); en rad i "Så har vi räknat". |

Inga fel hittade i: avrundningen till tusental med "ca" (P2, P11: 49 259 blir "ca 49 000", ärligt), "upp till" när
inkomst saknas (P6, P7, P18: alltid en övre gräns, aldrig ett löfte), negativa belopp (P17 nollas), stoppen för
ägande och 18 år (P14, P15: rätt lagrum, rätt text), summeringen per person (taket är per person, inte per bostad,
K12), avräkningen mot samma pott för grön teknik (67 kap. 2 § 2 st). Grön teknik-läget döljer femårsfrågan med rätta
(ingen femårsregel för grön teknik, 67 kap. 38-41 §§).

### 3.3 Föreslagen patch (skiss, inte tillämpad)

```js
// rakna.js, beraknaHushall: ålder från en egen fråga, ränta och ROT/RUT-använt som valfria fält
// personer: [{ typ: 'lon'|'pension', inkomst, alder: 'under18'|'18-65'|'66plus', ranta: 0, rotRutAnvant: 0, gtAnvant: 0 }]
const r = skatteutrymme({
  lon_ar:     p.typ === 'pension' ? 0 : p.inkomst,
  pension_ar: p.typ === 'pension' ? p.inkomst : 0,
  ar_66_plus: p.alder === '66plus',              // F1: inte från typen
  ks: P.KS_SNITT, taxeringsvarde: 0,
  ranteutgifter: Math.max(0, p.ranta || 0),      // F2
});
const u = Math.max(0, r.utrymme_rot_rut_gt);
const rotRut = Math.max(0, p.rotRutAnvant || 0);
const gt = Math.max(0, p.gtAnvant || 0);
let rest = mode === 'gt'
  ? Math.min(TAK - gt, u - rotRut - gt)          // F3: ROT/RUT före grön teknik
  : Math.min(TAK, u) - rotRut;                   // F4: RUT tar av samma pott (konservativt vid taket)
rest = Math.max(0, rest);
// F6: "50 000 kr" exakt bara om det håller vid lägsta kommunalskatt
const uLag = skatteutrymme({ ...sammaIndata, ks: P.KS_BAND[0] }).utrymme_rot_rut_gt;
const exakt = rest >= TAK && uLag - rotRut - (mode === 'gt' ? gt : 0) >= TAK;
if (!exakt) { rest = Math.round(rest / 1000) * 1000; nagonCa = true; }
// F10: varna när använt överstiger utrymmet
if (rest === 0 && rotRut + gt > Math.min(TAK, u)) noter.push('Du har använt mer än din skatt räcker till. Den delen kan Skatteverket kräva tillbaka.');
```

Och i `index.html`: åldersfrågan i tre lägen ersätter 18-årsfrågan; ett valfritt räntefält per person; i GT-läget
två "använt"-fält; raden "Bara personer som äger bostaden och bor där." under "Lägg till en person". Varje ändring
går genom ampy-rost innan den skrivs in.


## Del 4 · FÖRKLARINGEN FÖR JULIUS

### 4.1 Så bestämmer Skatteverket hur mycket ROT eller grön teknik du kan få

ROT och grön teknik är inte pengar du får. De är en **rabatt på din skatt**. Elfirman drar rabatten direkt på
fakturan (30 procent av arbetet för ROT, 50 procent av allt för laddbox och batteri, 15 procent för solceller),
du betalar resten, och firman hämtar rabatten hos Skatteverket. Det kallas fakturamodellen. Du får en
"preliminär skattereduktion", ett slags lån av Skatteverket, som blir slutligt först i deklarationen året efter.

I deklarationen kollar Skatteverket två saker.

**1. Taket.** Högst 50 000 kr ROT per person och år, högst 75 000 kr ROT och RUT tillsammans, och högst 50 000 kr
grön teknik per person och år. Taket är per person, inte per hus. Två ägare har två tak.

**2. Din egen skattepott.** Rabatten kan bara dras från skatt du faktiskt betalar: kommunalskatt, statlig skatt
och fastighetsavgift. Innan ROT får dra något har andra rabatter redan tagit sitt: pensionsavgiften (7 procent
av lönen), jobbskatteavdraget och ränteavdraget på bolånet. Det som blir kvar är ditt utrymme. Räcker det inte
läggs mellanskillnaden på kvarskatten. Du får alltså tillbaka rabatten på fakturan, men betalar den igen i
deklarationen.

Det förklarar tre saker som förvånar folk:

- **En pensionär med samma inkomst har ofta mer utrymme än en löntagare.** Pension bär varken pensionsavgift
  eller jobbskatteavdrag, så nästan hela kommunalskatten är kvar att dra ROT från. Pension 300 000 ger 52 000 kr
  utrymme, lön 300 000 ger 31 000 kr. Åt andra hållet: en 67-åring som fortfarande jobbar får både förhöjt
  grundavdrag och extra jobbskatteavdrag, betalar nästan ingen skatt, och har därför nästan inget utrymme alls.
- **Bolåneräntan äter utrymmet.** Ränteavdraget (30 procent av räntan) dras före ROT ur samma pott. 100 000 kr
  i ränta tar 30 000 kr. En löntagare på 300 000 med 100 000 i ränta har cirka 1 000 kr kvar till ROT.
- **"Redan använt" räknas från samma tak och samma pott.** Har du fått 20 000 kr ROT i vår har du 30 000 kr
  kvar under taket, och 20 000 kr mindre i potten. RUT tar av samma pott, och grön teknik ligger sist i kön: har
  du använt ROT i år är det grön teknik som får ge vika först.

**Vad kalkylatorn vet och inte vet.** Den vet lagens formler (validerade mot Skatteverkets egen räknare, ±1 kr).
Den vet inte din kommun (gissar snittet 32,38 procent, Stockholm har 30,55), din bolåneränta (gissar noll), din
ålder (gissar 66+ om du valde pension) eller om du använt RUT. De tre frågor som skulle göra mest nytta:
**ränteutgifter** (valfritt fält, störst och vanligast fel, åt det farliga hållet), **ålder i tre band** i stället
för ja/nej på 18 (kostar ingen extra fråga, räddar 66+ som jobbar) och **ROT och RUT använt** som ett fält
(och i grön teknik-läget båda). Kommun är den fjärde om vi vill ha bort "ca".

### 4.2 Ett räkneexempel, rad för rad: löntagare under 66, lön 300 000 kr, snittkommun, inga räntor

| Rad | Vad | Belopp | Varför |
|---|---|---|---|
| 1 | Lön | 300 000 kr | Det du skriver in. |
| 2 | Grundavdrag | −34 000 kr | Den del av inkomsten ingen betalar skatt på (63 kap. 3 §). |
| 3 | Beskattningsbar inkomst | 266 000 kr | 300 000 − 34 000. |
| 4 | Kommunalskatt 32,38 % | 86 131 kr | Det här är hela potten. Ingen statlig skatt (under 643 000), ingen fastighetsavgift (gissas 0). |
| 5 | Pensionsavgift 7 % av lönen | −21 000 kr | Går alltid först och kan aldrig betalas med ROT. |
| 6 | Jobbskatteavdrag | −32 537 kr | Rabatten alla löntagare får (67 kap. 7 §). |
| 7 | Förvärvsinkomstreduktion | −1 500 kr | Liten fast rabatt (67 kap. 47 §). |
| 8 | Ränteavdrag | −0 kr | Gissas 0. Med 50 000 kr i ränta: −15 000. |
| 9 | **Utrymme kvar** | **31 094 kr** | 86 131 − 21 000 − 32 537 − 1 500. |
| 10 | ROT-tak | 50 000 kr | Taket binder inte, potten gör det. |
| 11 | **Kalkylatorn visar** | **ca 31 000 kr** | min(50 000, 31 094), avrundat till tusental. |
| 12 | I praktiken | arbete för 103 600 kr | 31 094 / 0,30. Större jobb än så ger ROT på fakturan som kommer tillbaka som kvarskatt. |

Samma person i Stockholm (30,55 %): 28 065 kr. Med 50 000 kr i bolåneränta: 16 094 kr. Som 67-åring som jobbar:
0 kr. `[BERÄKNAT]`

### 4.3 Minsta ärliga frågeuppsättning

1. **Äger du bostaden?** Ja / Nej. (Stopp vid nej. Undertext som i dag.)
2. **Hur gammal är du?** Fyller 18 först nästa år / 18 till 65 / 66 eller äldre. (Ersätter 18-årsfrågan. Stopp på
   det första. Det tredje = fyllt 66 den 1 januari 2026, född 1959 eller tidigare.)
3. **Din inkomst i år, ungefär.** Lön / Pension + belopp. (Undertext: "Före skatt. Ta förra året om du inte vet."
   För 66+: båda fälten synliga.)
4. **Ränteutgifter i år (valfritt).** Belopp. (Undertext: "Din del av bolåneräntan. Står på bankens
   kontrolluppgift.")
5. **ROT och RUT du redan använt i år.** Belopp. (Undertext: "Själva avdraget, inte hela fakturan.") I grön
   teknik-läget dessutom: **Grön teknik du redan använt i år.**
6. **Är bostaden äldre än fem år?** Bara i ROT-läget, som i dag (helst "färdigbyggd 2020 eller tidigare").
7. **Lägg till en person.** Med raden "Bara personer som äger bostaden och bor där."

Kommun och fastighetsavgift lämnas utanför: kommunen täcks av "ca" och disclaimern, fastighetsavgiften gör bara
svaret för lågt, aldrig för högt.

### 4.4 Disclaimern, en rad under talet (exakt copy)

Utan räntefält (som kalkylatorn ser ut i dag):

> Uppskattning på din inkomst med snittkommunalskatt, utan bolåneränta. Skatteverket kan landa på ett annat belopp.

Med räntefält (efter patchen i del 3):

> Uppskattning på det du fyllt i, med snittkommunalskatt. Skatteverket kan landa på ett annat belopp.

Kontroll mot ampy-rost: du-tilltal (din, du), inget utropstecken, "kan" på skatteutfallet, inga tank- eller
halvstreck, inga superlativ, ett konkret skäl (snittkommunalskatt, bolåneränta) så den analytiska kunden ser
vad som saknas. Grön teknik-läget använder samma rad.


## Hämtlogg (vad som faktiskt öppnades 2026-09-16)

| Källa | URL | Hur | Status | Använt till |
|---|---|---|---|---|
| Inkomstskattelag (1999:1229), gällande lydelse | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/ | curl, HTML → text (1 056 213 tecken), läst 1 kap. 3-5 §§, 63 kap. 2-5 §§, 65 kap. 3-7 §§, 67 kap. 1-11 §§, 19 §, 36-49 §§ | 200 | Del 1 lagrum, del 2 (d)(e)(f), del 3 |
| Lag (1994:1744) om allmän pensionsavgift | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/ | curl, 2-4 §§ | 200 | 7 %, tak 8,07 ibb, avrundning, undantag sjukersättning |
| Socialförsäkringsbalk (2010:110) 59 kap. 13-14 §§ | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialforsakringsbalk-2010110_sfs-2010-110/ | curl | 200 | Sjukpenning och a-kassa är pensionsgrundande (del 2 e) |
| Skatteverket "Belopp och procent inkomstår 2026" | https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html | curl gav HTTP 000 (blockerat), WebFetch | ok | 32,38 %, 59 200, 643 000, 47 100, 10 425, grundavdragets ytterlägen |
| SCB "Kommunalskatterna 2026" (statistiknyhet 2025-12-15) | https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/ | WebFetch | ok | Österåker 28,93 %, Dorotea 35,65 % |
| Skatteverket FAQ "Hur mycket måste jag tjäna" (K5) | se `research/underlag/rot-kallor.md` | inte öppnad på nytt, citat ur K5 hämtade 2026-09-11 | | Del 1 steg 8 och 10 |
| Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (K11) | https://www7.skatteverket.se/portal/rot-rut | inte körd på nytt (JS-app), fyra körningar 2026-09-11 i rot-kallor.md | | Validering av motorn; Stockholm 30,55 % |
| `logik/engine.js`, `kalkylator/rakna.js`, `kalkylator/v1/index.html`, `kalkylator/v1/app.js` | lokalt | läst, inte ändrat | | Allt |
| `node kanslighet.mjs`, `extra.mjs`, `ks.mjs`, `probe.mjs` | scratchpad | körda mot motorn oförändrad, node v25.9.0 | exit 0 | Del 2 och 3, alla `[BERÄKNAT]` |

Inte gjort: ingen körning i Skatteverkets e-tjänst för fallen 66+ med lön och a-kassa (tjänsten kräver webbläsare;
värdena i del 2 (d') och (e) följer lagtexten och motorns validerade formler men är inte dubbelkollade mot
tjänsten). Typisk löneökning 2026 `[GAP]`. Andel Ampy-kunder med bolån `[GAP]`.
