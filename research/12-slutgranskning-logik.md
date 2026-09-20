# 12 · Slutgranskning av logiken före lansering (Avdragskollen, inkomstår 2026)

Status: KLAR 2026-09-20. Granskare: Fable 5.1 (ensam, inga underagenter). Ingen fil utom denna är ändrad.

**Dom: GO WITH FIXES.** 150 tillstånd körda mot `rakna.js` (143 rätt, 7 fel med en och samma orsak), 75
Skatteverket-körningar mot motorn (0 kr diff i 73, två kända fall utanför modellen). Inga blockerare; två Major
(falsk kvarskattevarning, etiketten "Varav pension" mot koden), tio Minor. Fixlistan med kodpatchar i §5.

Taggar: `[FACT src]` = hämtat från namngiven källa · `[BERÄKNAT]` = räknat av oss, körning i Node mot koden som
den ligger · `[GAP]` = saknas, gissas inte.

Läsordning: §5 (dom och fixlista) först om tiden är knapp; §1 och §2 är beviset; §3 och §4 är copy och besluten.

## 1. Tillståndsmatrisen

Metod: `beraknaHushall()` i `kalkylator/rakna.js` kördes oförändrad i Node 25 från repo-roten (skript i sessionens
scratchpad, `probe.mjs`) mot **150 tillstånd** plus 16 inmatningar genom `siffra()`. Väntat utfall kommer från ett
oberoende orakel skrivet ur specen (research/10 §3.3, research/11 §1 och §4), inte ur koden. Alla tal nedan är
`[BERÄKNAT]` om inget annat sägs. Hårda mellanslag i kodens text är normaliserade till vanliga i tabellen.

Tabellen är ordnad efter **utfallsväg** (status | prefix | text | not). Alla kombinationer som ger samma väg står på
samma rad med sina gränser; `per`-raden är alltid "Per person och år." vid en person och "Ni två/tre/fyra tillsammans,
per år." vid fler (vid fem: "Ni 5 tillsammans", ej nåbart i UI, MAX_PERSONER = 4).

| # | Väg (status, prefix, text, not) | Kombinationer som ger vägen (läge × äger × äldre × ålder × typ × inkomst × ränta × använt × personer) | Väntat | Koden |
|---|---|---|---|---|
| P1 | stopp, "Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag." (GT: "… grön teknik-avdrag.") | äger = nej, oavsett allt annat (A1, A2, A3). Ägarstoppet vinner över under 18 (A6). | stopp, texten per läge | OK |
| P2 | stopp, "Du behöver ha fyllt 18 år senast vid årets slut för att få ROT-avdrag." (GT: "… grön teknik-avdrag.") | äger = ja, person 1 = Under 18 (A4, A5). Person 2+ kan inte vara under 18 i UI; skickas `alder: 'u18'` ändå räknas personen som 18 till 65 (A7: "ca 62 000 kr"). | stopp | OK (A7 = känd UI-avgränsning) |
| P3 | tak, "upp till 50 000 kr", not = null | inkomst tom (0, NaN, undefined, "0", "abc"), oavsett ränta och ålder (B1, B4, B5, B6, C-neg-fältet). Räntan ignoreras när inkomst saknas (B4). | upp till 50 000 kr | OK |
| P3b | tak, "upp till 50 000 kr", not = "Yngre än fem år: ROT gäller bara reparationer." | som P3 men ROT + äldre = nej (B2). I GT-läget visas noten aldrig, även om den dolda radion står på nej (B3). | noten bara i ROT | OK |
| P4 | tak, "upp till (50 000 − använt) kr", **oavrundat** | inkomst tom, 0 < använt < 50 000: använt 1 → "upp till 49 999 kr", 400 → "upp till 49 600 kr", 31 093 → "upp till 18 907 kr", 49 999 → "upp till 1 kr" (F-tom-*, G-tom-*). | upp till (50 000 − använt): exakt eftersom taket är exakt | OK, men "upp till 1 kr" ser ut som ett fel (kosmetiskt, se M7) |
| P5 | belopp, "0 kr", not = "Du har redan använt hela årets ROT-avdrag." | inkomst tom, använt ≥ 50 000 (50 000, 50 001, 60 000, 75 000, 999 999). Ingen kvarskattenot: skatten är okänd (F-tom-50000 … F-tom-999999, G-tom-*). | 0 kr + noten | OK |
| P6 | belopp, "0 kr", not = "Din skatt räcker inte till något ROT-avdrag i år." (flera: "Er skatt …") | inkomst > 0, använt = 0, utrymme 0: lön 18-65 vid 1, 25 041, 25 042, 60 000, 80 000 (u = 0 upp till lön 84 100; 84 200–88 299 ger u = 1–499 som avrundas till 0 → samma not); ränta 1 000 000 vid lön 300 000 (E-1000000); H11 plural. | 0 kr + noten | OK. Gränsen 25 041/25 042 (pensionsavgiftens 0,423 pbb = 25 041,6) ändrar inget: grundavdraget äter hela inkomsten till 84 100. |
| P7 | belopp, "0 kr", not = "Från 66 år är skatten på lön så låg att inget blir kvar att dra ROT-avdraget från. Har du också pension, välj Båda." | ålder Över 65, typ Lön, inkomst 1–336 600 (u = 0), använt 0 (D-l66-100000, D-l66-300000, H10 plural, D-l66-300-gt i GT: "… grön teknik-avdraget från."). Vid lön 336 700–339 599 är u = 1–499 → avrundas till 0 men noten blir P6:s "räcker inte" (noten kräver u === 0). | 0 kr + 66+-noten | OK (kanten 336 700–339 599 = M6) |
| P8 | belopp, "ca N kr", not = null | inkomst > 0 och (rest < 50 000 eller använt > 0): lön 18-65 88 300 → "ca 1 000 kr"; 100 000 → ca 2 000; 180 000 → ca 12 000; 300 000 → ca 31 000; 360 000 → ca 41 000; 400 000 → ca 48 000; 406 900–468 099 → "ca 50 000 kr" (u ≥ 49 500 vid snitt men < 50 000 vid 28,93 %); pension 66+ 100 000 → ca 8 000, 240 000 → ca 38 000, 289 400–316 799 → ca 50 000; lön 66+ 348 000 → ca 2 000, 400 000 → ca 11 000; Båda 66+ 200 000 + 200 000 → ca 33 000; Båda 18-65 240 000 + 60 000 → ca 40 000; ränta 10 000 → ca 28 000, 50 000 → ca 16 000, 100 000 → ca 1 000 (lön 300 000); använt 1 vid lön 480 000 → "ca 50 000 kr" (49 999 avrundas upp); använt 12 345 vid lön 5 000 000 → "ca 38 000 kr" (37 655 avrundas upp, M8); GT: samma tal (C-gt300). | ca, avrundat till tusental | OK |
| P9 | belopp, "", "50 000 kr" (exakt) | använt = 0 och u ≥ 50 000 även vid 28,93 %: lön 18-65 ≥ **468 100** (u_snitt 60 062, u_lag 50 008; vid 468 099 är u_lag 49 986 → "ca"); pension 66+ ≥ **316 800**; pension 18-65 ≥ **218 600** (D-p18-240000 → exakt, stämmer med SKV-56: född 1960, pension 240 000 → 59 900); lön 66+ ≥ **641 100**; lön 643 000, 1 000 000, 5 000 000 → exakt (C-*, D-*, C-gt5M). | exakt bara när det håller i Österåker | OK |
| P10 | belopp, "0 kr", not = "Du har redan använt hela årets ROT-avdrag." | inkomst > 0, använt = min(50 000, u) exakt: lön 300 000 använt 31 093 (F-300-31093); lön 480 000 använt 49 999/50 000 (F-480-49999, F-480-50000); GT lön 480 000 gt använt 49 999/50 000. | 0 kr + noten | OK |
| P11 | belopp, "0 kr", not = "Du har redan använt hela årets ROT-avdrag. Du har dessutom använt ca X kr mer än skatten räcker till. Den delen kan Skatteverket kräva tillbaka i deklarationen." | inkomst > 0, använt > min(50 000, u): lön 300 000 använt 31 094 → X = 1 000 (golv); 45 000 → 14 000; 49 999/50 000/50 001 → 19 000; 60 000 → 29 000; 75 000 → 44 000; 999 999 → 969 000. 66+ lön 300 000 använt 5 000 → X = 5 000 (D-l66-300-anv). | X = använt − u, avrundat till tusental, golv 1 000 | OK när u < 50 000 |
| **P11-fel** | som P11 | **u ≥ 50 000 och använt > 50 000**: lön 480 000 (u 62 299) använt 50 001 → "dessutom använt ca 1 000 kr mer än skatten räcker till" (F-480-50001); använt 60 000 → "ca 10 000 kr mer" (F-480-60000); lön 5 000 000 använt 60 000 (ROT 50 000 + RUT 10 000, fullt lagligt, skatten räcker) → "ca 10 000 kr mer" (F-5M-60000); använt 75 000 vid lön 480 000 → "ca 25 000" när det sanna överskottet är 12 701 (F-480-75000); 999 999 → 950 000 mot sanna 937 700. Samma i GT (G-480-50001, G-480-999999), där gt använt > 50 000 dock inte kan förekomma. | X = max(0, använt − u): **0** i F-480-50001, F-480-60000, F-5M-60000; 13 000 i F-480-75000 | **AVVIK (7 fall)**: koden räknar överskottet mot min(50 000, u) i stället för mot u. Falsk kvarskattevarning i ROT-läget för den som använt ROT + RUT över 50 000 med skatt som räcker. Se Major 1. |
| P12 | belopp, "ca N kr", not = "Ni har använt ca X kr mer än skatten räcker till. …" | summa > 0 men någon person över: p1 lön 300 000 använt 45 000 + p2 lön 300 000 → "ca 31 000 kr" + X = 14 000 (H7); båda över → "0 kr" + "Ni har redan använt hela årets … Ni har dessutom använt ca 28 000 kr …" (H12). | summa + noten | OK |
| P13 | hushåll: status tak/"upp till" så snart någon inkomst saknas; "ca" så snart någon är under taket; exakt bara när alla är exakta | p1 300 000 + p2 tom → "upp till 81 000 kr" (H1, H14 GT); två tomma → "upp till 100 000"; fyra tomma → "upp till 200 000" (H3); fyra × 480 000 → "200 000 kr" exakt (H4); 300 000 + 480 000 → "ca 81 000" (H5); 480 000 + pension 66+ 300 000 → "ca 100 000" (H6); p1 tom använt 50 000 + p2 300 000 → "upp till 31 000 kr" (H8: sant som övre gräns, "ca" vore skarpare, kosmetiskt); p1 lön 80 000 + p2 tom använt 50 000 → "0 kr" + "Ni har redan använt hela årets ROT-avdrag." (H9); femårsnot + upp till (H15); 66+ lön 300 000 + 300 000 → "ca 31 000", ingen 66+-not eftersom summan > 0 (H16). | som specen | OK |
| P14 | GT-läget | identiskt med ROT för tal och prefix; använt = fältet "grön teknik du redan använt", ROT/RUT-fältet ignoreras (G-480-rotfalt → 50 000 kr exakt trots anvant 50 000); ROT-fältet ignorerar gtAnvant (F-480-gtfalt); femårsnoten aldrig; noterna säger "grön teknik-avdrag"/"grön teknik-avdraget". | posterna isär (ägarbeslut) | OK |
| P15 | Båda: lön i fältet + "Varav pension" | typ Båda, fältet 200 000 + pension 200 000, Över 65 → "ca 33 000 kr" (stämmer med SKV-53 vid Stockholmsskatt: 28 132). **Fältet tomt + pension 300 000 → "upp till 50 000 kr"** (D-b66-0-300): pensionen ignoreras eftersom `!p.inkomst` prövas före pensionen. **Fältet 400 000 + "varav pension" 200 000 (etikettens bokstavliga läsning: total 400 000 varav 200 000 pension) → "50 000 kr" exakt** (D-b66-400-200), koden räknar lön 400 000 + pension 200 000 = 600 000; rätt svar för lön 200 000 + pension 200 000 är "ca 33 000 kr". Pension större än fältet (100 000 + 300 000) räknas rakt av (ca 47 000). Kvarlämnad pension i det dolda fältet ignoreras för Lön och Pension (D-lon-pensionkvar, D-pension-pensionkvar). | pension räknas när den finns; etikett och kod ska betyda samma sak | **AVVIK**: se Major 2 (etikett mot kod) och Minor 1 (pension utan lön) |
| P16 | `siffra()` | "300 000" → 300000; "-5" → 5 (minus stryks, aldrig negativt); "abc" → 0; "1e5" → 15; "3,5" → 35; "1.000" → 1000; **"300 000,50" → 30 000 050**; "25 000,00" → 2 500 000; "0" → 0 (fältet töms av `formatFalt`); "00012" → 12; 20 nior → 1e20 (visas som "100 000 000 000 000 000 000", ger 50 000 kr). Negativa tal direkt till `beraknaHushall` (inkomst −5, ränta −50 000, använt −10 000) nollas eller kapas (C-neg, E-neg, F-neg). NaN → tom. | inga krascher, aldrig negativt | OK. Decimaler blir tusenfalt fel men fältet visar det direkt (M9). |

Gränserna i kronor per år, räknade med nuvarande motor (`[BERÄKNAT]`, snittkommunalskatt 32,38 %, lägsta 28,93 %):

| Person | u > 0 från | "ca 1 000 kr" från | "ca 50 000 kr" från (u ≥ 49 500) | u ≥ 50 000 vid snitt från | exakt "50 000 kr" från (u ≥ 50 000 vid 28,93 %) |
|---|---|---|---|---|---|
| Lön, 18 till 65 | 84 200 | 88 300 | 406 900 | 409 800 | **468 100** |
| Pension, Över 65 | 65 900 | 67 900 | 289 400 | 291 500 | **316 800** |
| Pension, 18 till 65 | 25 200 | 26 700 | 199 700 | 201 100 | **218 600** |
| Lön, Över 65 | 336 700 | 339 600 | 576 200 | 578 300 | **641 100** |

Research/10 angav bandet 409 300–467 600 med motorn före 16/9; med öreskapning och pensionsavgift till närmaste
hundratal är det 409 800–468 099. `[BERÄKNAT]` Exakt-regeln tål också den regionala skattereduktionen: vid gränsen
468 100 ger Dorotea (35,65 %) 69 592 − 1 675 = 67 917 kr, långt över 50 000. `[BERÄKNAT]`

Avrundningen: rest 49 500 → "ca 50 000 kr" (Math.round(49,5) = 50), rest 500 → "ca 1 000 kr", rest 1–499 → "0 kr"
med noten "räcker inte" (M6). Kvarskattenoten: X = max(1 000, round(överskott/1 000)·1 000), så 1 kr för mycket
visas som "ca 1 000 kr" (F-300-31094) och 400 kr som "ca 1 000 kr" (M5). `[BERÄKNAT]`

**Summering sektion 1:** 150 tillstånd körda, 143 stämmer med oraklet, 7 avviker, alla med samma orsak (kvarskatt
mot taket i stället för mot skatten). Därtill två spec-mot-kod-frågor i Båda-läget (P15) som inte är räknefel i
koden utan ett etikett-mot-kod-glapp och en ignorerad pension.

## 2. Verifiering av rakna.js mot Skatteverket (75 körningar)

Metod: `logik/engine.js` som den ligger (commit 6b729df, öreskapning + pensionsavgift till närmaste hundratal
sedan 16/9) kördes mot alla 75 körningar i `logik/verifiering-skv-2026.json` med körningens egen kommunalskatt,
födelseår ≤ 1959 = Över 65, ränta och fastighetsavgiftsunderlag som i tjänsten (skript `skv.mjs` i scratchpad).
Ovanpå lades kalkylatorns regler (min(50 000, u), avrundning, "ca"/exakt) och till sist det kunden faktiskt ser
(snittkommunalskatt, ingen fastighetsavgift) via `beraknaHushall()`. `[BERÄKNAT]` mot `[FACT src: e-tjänsten 2026-09-16, JSON]`.

### 2.1 Motorn mot Skatteverkets utrymme

| Mått | Resultat |
|---|---|
| Diff Skatteverket − motorn, 58 körningar utanför Dorotea | **0 kr i 56**, +12 075 i SKV-48 (råvärde 3 000 000 som fastighetsavgiftsunderlag, tjänsten kapar inte, motorn kapar rätt), +15 000 i SKV-63 (kapitalinkomst 50 000, utanför modellen, konservativt) |
| Diff efter regional reduktion 1 675 kr, 17 Dorotea-körningar | **0 kr i alla 17** |
| Inom ±2 kr | 73 av 75; de två övriga är de dokumenterade fallen utanför modellen |
| 66-årsgränsen | SKV-55 (född 1959, pension 240 000) 35 702 = motorn; SKV-56 (född 1960) 59 900 = motorn `[FACT src: JSON]` |
| Pensionsavgiftens avrundning | SKV-66/67/68/70/73 nu 0 kr diff (var −100 före 16/9) |
| Öreskapning | SKV-61 (66+ lön 400 000) nu 0 kr (var +2) |

Kravet "inom ±2 kr utom 17 Dorotea och två dokumenterade fall" är uppfyllt med marginal: det är **0 kr**, inte ±2.
Formlerna (grundavdrag inkl. 63 kap. 3 a §, jobbskatteavdrag 7 § och 8 §, pensionsavgift, förvärvsinkomstreduktion,
ränteavdrag, fastighetsavgift, avräkningsordningen i 67 kap. 2 §) återger e-tjänsten på kronan.

**Dokumentationsdrift, ingen kodfråga:** JSON-filens block `motorn` (skrivet 16/9 kl. 10:39, före motorfixen kl.
10:42) skiljer sig från nuvarande motor i **37 av 75 rader** (t.ex. SKV-01: JSON säger 3 656, motorn ger 3 657 =
Skatteverket; SKV-66: JSON 35 748, motorn 35 648 = Skatteverket). Research/09 §0 ("51 av 75 inom ±2") beskriver
läget före fixen; research/11 §8 ("på kronan i alla fall utom regional") beskriver läget efter och stämmer med
denna körning. Se Minor 10.

### 2.2 Kalkylatorns regler ovanpå motorn, per körning

Kolumnen "regel@ks" = kalkylatorns svar om den hade fått körningens kommunalskatt; "kund ser" = det verkliga svaret
(snitt 32,38 %, fastighetsavgift 0, samma inkomst, ränta och ålder). `[BERÄKNAT]`

| Körning | Person | SKV utrymme | Motor @ks | Diff | Regel @ks | Kund ser (snitt) |
|---|---|---|---|---|---|---|
| SKV-01 | 1985 Sthlm lön 120 000 | 3 657 | 3 657 | 0 | ca 4 000 | ca 4 000 kr |
| SKV-02 | lön 180 000 | 10 297 | 10 297 | 0 | ca 10 000 | ca 12 000 kr |
| SKV-03 | lön 240 000 | 18 836 | 18 836 | 0 | ca 19 000 | ca 21 000 kr |
| SKV-04 | lön 300 000 | 28 065 | 28 065 | 0 | ca 28 000 | ca 31 000 kr |
| SKV-05 | lön 360 000 | 37 594 | 37 594 | 0 | ca 38 000 | ca 41 000 kr |
| SKV-06 | lön 420 000 | 47 123 | 47 123 | 0 | ca 47 000 | ca 50 000 kr |
| SKV-07 | lön 480 000 | 56 795 | 56 795 | 0 | 50 000 kr | 50 000 kr |
| SKV-08 | lön 600 000 | 85 055 | 85 055 | 0 | 50 000 kr | 50 000 kr |
| SKV-09 | lön 720 000 | 128 535 | 128 535 | 0 | 50 000 kr | 50 000 kr |
| SKV-10 | lön 900 000 | 219 525 | 219 525 | 0 | 50 000 kr | 50 000 kr |
| SKV-11 | 1985 Dorotea lön 120 000 | 4 047 | 5 722 (−1 675 = 4 047) | 0 | ca 6 000 | ca 4 000 kr |
| SKV-12 | lön 180 000 | 12 562 | 14 237 | 0 | ca 14 000 | ca 12 000 kr |
| SKV-13 | lön 240 000 | 23 310 | 24 985 | 0 | ca 25 000 | ca 21 000 kr |
| SKV-14 | lön 300 000 | 34 831 | 36 506 | 0 | ca 37 000 | ca 31 000 kr |
| SKV-15 | lön 360 000 | 46 652 | 48 327 | 0 | ca 48 000 | ca 41 000 kr |
| SKV-16 | lön 420 000 | 58 474 | 60 149 | 0 | ca 50 000 | ca 50 000 kr |
| SKV-17 | lön 480 000 | 70 460 | 72 135 | 0 | 50 000 kr | 50 000 kr |
| SKV-18 | lön 600 000 | 104 840 | 106 515 | 0 | 50 000 kr | 50 000 kr |
| SKV-19 | lön 720 000 | 154 440 | 156 115 | 0 | 50 000 kr | 50 000 kr |
| SKV-20 | lön 900 000 | 254 610 | 256 285 | 0 | 50 000 kr | 50 000 kr |
| SKV-21 | 1955 Sthlm pension 150 000 | 17 495 | 17 495 | 0 | ca 17 000 | ca 19 000 kr |
| SKV-22 | pension 180 000 | 22 888 | 22 888 | 0 | ca 23 000 | ca 24 000 kr |
| SKV-23 | pension 240 000 | 35 702 | 35 702 | 0 | ca 36 000 | ca 38 000 kr |
| SKV-24 | pension 300 000 | 49 023 | 49 023 | 0 | ca 49 000 | ca 50 000 kr |
| SKV-25 | pension 360 000 | 62 672 | 62 672 | 0 | 50 000 kr | 50 000 kr |
| SKV-26 | pension 480 000 | 90 424 | 90 424 | 0 | 50 000 kr | 50 000 kr |
| SKV-27 | 1955 Dorotea pension 150 000 | 18 763 | 20 438 | 0 | ca 20 000 | ca 19 000 kr |
| SKV-28 | pension 180 000 | 25 079 | 26 754 | 0 | ca 27 000 | ca 24 000 kr |
| SKV-29 | pension 240 000 | 40 086 | 41 761 | 0 | ca 42 000 | ca 38 000 kr |
| SKV-30 | pension 300 000 | 55 686 | 57 361 | 0 | ca 50 000 | ca 50 000 kr |
| SKV-31 | pension 360 000 | 71 671 | 73 346 | 0 | 50 000 kr | 50 000 kr |
| SKV-32 | pension 480 000 | 104 095 | 105 770 | 0 | 50 000 kr | 50 000 kr |
| SKV-33 | 1985 Gbg lön 180 000 | 11 881 | 11 881 | 0 | ca 12 000 | ca 12 000 kr |
| SKV-34 | lön 360 000 | 41 909 | 41 909 | 0 | ca 42 000 | ca 41 000 kr |
| SKV-35 | lön 600 000 | 93 681 | 93 681 | 0 | 50 000 kr | 50 000 kr |
| SKV-36 | 1955 Gbg pension 240 000 | 38 137 | 38 137 | 0 | ca 38 000 | ca 38 000 kr |
| SKV-37 | 1985 Munkedal lön 240 000 | 24 033 | 24 033 | 0 | ca 24 000 | ca 21 000 kr |
| SKV-38 | lön 480 000 | 69 760 | 69 760 | 0 | 50 000 kr | 50 000 kr |
| SKV-39 | 1955 Munkedal pension 240 000 | 40 822 | 40 822 | 0 | ca 41 000 | ca 38 000 kr |
| SKV-40 | 1985 Sthlm lön 360 000, ränta 50 000 | 22 594 | 22 594 | 0 | ca 23 000 | ca 26 000 kr |
| SKV-41 | lön 360 000, ränta 100 000 | 7 594 | 7 594 | 0 | ca 8 000 | ca 11 000 kr |
| SKV-42 | lön 720 000, ränta 100 000 | 98 535 | 98 535 | 0 | 50 000 kr | 50 000 kr |
| SKV-43 | lön 240 000, ränta 100 000 | 0 | 0 | 0 | 0 | 0 kr + "räcker inte" |
| SKV-44 | 1955 pension 240 000, ränta 50 000 | 20 702 | 20 702 | 0 | ca 21 000 | ca 23 000 kr |
| SKV-45 | 1985 lön 360 000, villa max avgift | 48 019 | 48 019 | 0 | ca 48 000 | ca 41 000 kr |
| SKV-46 | lön 600 000, villa | 95 480 | 95 480 | 0 | 50 000 kr | 50 000 kr |
| SKV-47 | 1955 pension 240 000, villa | 46 127 | 46 127 | 0 | ca 46 000 | ca 38 000 kr |
| SKV-48 | lön 360 000, råvärde 3 000 000 | 60 094 | 48 019 | +12 075 (utanför modellen) | ca 48 000 | ca 41 000 kr |
| SKV-49 | lön 360 000, underlag 800 000 | 43 594 | 43 594 | 0 | ca 44 000 | ca 41 000 kr |
| SKV-50 | lön 480 000, ränta 100 000, villa | 37 220 | 37 220 | 0 | ca 37 000 | ca 32 000 kr |
| SKV-51 | 1955 pension 300 000, ränta 50 000, villa | 44 448 | 44 448 | 0 | ca 44 000 | ca 37 000 kr |
| SKV-52 | 1955 Dorotea pension 300 000, ränta 50 000, villa | 51 111 | 52 786 | 0 | ca 50 000 | ca 37 000 kr |
| SKV-53 | 1955 Sthlm lön 200 000 + pension 200 000 | 28 132 | 28 132 | 0 | ca 28 000 | ca 33 000 kr |
| SKV-54 | 1985 lön 240 000 + pension 60 000 | 36 866 | 36 866 | 0 | ca 37 000 | ca 40 000 kr |
| SKV-55 | 1959 pension 240 000 | 35 702 | 35 702 | 0 | ca 36 000 | ca 38 000 kr |
| SKV-56 | 1960 pension 240 000 | 59 900 | 59 900 | 0 | 50 000 kr | 50 000 kr |
| SKV-57 | 1955 pension 100 000 | 7 759 | 7 759 | 0 | ca 8 000 | ca 8 000 kr |
| SKV-58 | 1985 lön 60 000 | 0 | 0 | 0 | 0 | 0 kr + "räcker inte" |
| SKV-59 | lön 1 200 000 | 371 175 | 371 175 | 0 | 50 000 kr | 50 000 kr |
| SKV-60 | 1955 lön 100 000 | 0 | 0 | 0 | 0 | 0 kr + 66+-noten |
| SKV-61 | 1955 lön 400 000 | 6 477 | 6 477 | 0 | ca 6 000 | ca 11 000 kr |
| SKV-62 | 1955 lön 900 000 | 181 099 | 181 099 | 0 | 50 000 kr | 50 000 kr |
| SKV-63 | 1985 lön 360 000 + kapital 50 000 | 52 594 | 37 594 | +15 000 (utanför modellen) | ca 38 000 | ca 41 000 kr |
| SKV-64 | 1955 pension 150 000, villa | 27 920 | 27 920 | 0 | ca 28 000 | ca 19 000 kr |
| SKV-65 | 1955 pension 60 000 | 0 | 0 | 0 | 0 | 0 kr + "räcker inte" |
| SKV-66 | 1985 lön 348 000 | 35 648 | 35 648 | 0 | ca 36 000 | ca 39 000 kr |
| SKV-67 | lön 378 000 | 40 412 | 40 412 | 0 | ca 40 000 | ca 45 000 kr |
| SKV-68 | lön 124 000 | 4 081 | 4 081 | 0 | ca 4 000 | ca 5 000 kr |
| SKV-69 | lön 355 000 | 36 849 | 36 849 | 0 | ca 37 000 | ca 41 000 kr |
| SKV-70 | lön 352 200 | 36 309 | 36 309 | 0 | ca 36 000 | ca 40 000 kr |
| SKV-71 | lön 333 333 | 33 384 | 33 384 | 0 | ca 33 000 | ca 37 000 kr |
| SKV-72 | 1955 lön 348 000 | 0 | 0 | 0 | 0 | ca 2 000 kr (snittet ger u 1 951 där Stockholm ger 0) |
| SKV-73 | 1955 lön 348 000, villa | 8 701 | 8 701 | 0 | ca 9 000 | ca 2 000 kr |
| SKV-74 | 1985 lön 80 000, villa | 9 636 | 9 636 | 0 | ca 10 000 | 0 kr + "räcker inte" |
| SKV-75 | 1985 lön 40 000, villa | 7 625 | 7 625 | 0 | ca 8 000 | 0 kr + "räcker inte" |

### 2.3 Är reglerna konsekventa?

- **Exakt "50 000 kr" visas i 19 körningar** (SKV-07…10, 17…20, 25, 26, 31, 32, 35, 38, 42, 46, 56, 59, 62). I
  alla 19 är Skatteverkets eget utrymme ≥ 50 000 (lägst 56 795, SKV-07). **Inget falskt löfte.** `[BERÄKNAT]`
- **"ca 50 000 kr" i 4 körningar**: SKV-06 (Skatteverket 47 123), SKV-16 (58 474), SKV-24 (49 023), SKV-30
  (55 686). Två av dem ligger under 50 000 hos Skatteverket, så "ca" är motiverat exakt där regeln ska bita.
- **Riktningen på snittfelet:** kundens tal (snitt, ingen fastighetsavgift) är högre än Skatteverkets rot-max i 27
  körningar och lägre i 23, lika i 25. Stockholm utan villa: kalkylatorn visar 240–4 868 kr mer (typiskt ~3 000,
  störst SKV-53 Båda 66+ och SKV-67 lön 378 000). Villa (SKV-45…52, 64, 73…75) och Dorotea: kalkylatorn visar
  mindre, upp till 13 000 (SKV-52). Det är exakt de förenklingar som research/11 §7 listar, med rätt riktning.
- **min(50 000, u) − använt** stämmer med Skatteverkets "Rotavdraget får högst vara" = min(utrymme, 50 000) i alla
  75 körningar (använt = 0 i tjänsten, som inte frågar om det). `[FACT src: JSON resultat_text]`
- **SKV-72 mot 66+-noten:** vid lön 348 000 ger Stockholm 0 men snittet 1 951 → kunden ser "ca 2 000 kr" utan not.
  Noten "Från 66 år …" visas först vid u = 0 (lön ≤ 336 600 vid snitt). Konsekvent med modellen, men visar att
  66+-lönefallet ligger på gränsen där kommunen avgör om det blir 0 eller några tusen.

**Summering sektion 2:** motorn = Skatteverket på kronan i 73/75 (de två övriga utanför modellen med känd orsak och
konservativ riktning); kalkylatorns regler ovanpå ger aldrig ett exakt "50 000 kr" som Skatteverket inte täcker.

## 3. Copykontroll av varje kundvänd sträng i rakna.js

Svep (grep) över `kalkylator/rakna.js`, `kalkylator/v1/index.html`, `kalkylator/v1/app.js`: **0 tankstreck (— –),
0 "·", 0 "!" i kundsträngar** (träffarna på "!" är kodens negationer och HTML-kommentarer). `[BERÄKNAT]`
Röstregler enligt uppdraget: du-tilltal, inga utropstecken, inga streck, inget "·", "kan" på skatteutfall, inga
löften. (ampy-rost tillåter "!" med måtta sedan 2026-07-15; här finns inga alls, så frågan är inte aktuell.)

| # | Sträng (rad) | du | ! | streck/· | "kan"/hedge | Bedömning | Ändra till |
|---|---|---|---|---|---|---|---|
| S1 | "Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag." / "… grön teknik-avdrag." (32, 83) | ja | 0 | 0 | kategoriskt | **OK.** Ägandet är ett hårt lagkrav (67 kap. 11, 13 a, 15 §§; 36, 38 §§), inte en bedömning; "kan" skulle försvaga ett sant besked. | behåll |
| S2 | "Yngre än fem år: ROT gäller bara reparationer." (34, 88) | (not) | 0 | 0 | kategoriskt | **Oprecis.** Femårsregeln spärrar om- och tillbyggnad; både reparation och underhåll ger ROT (13 a §; research/07 §3.2, research/10 F14). "bara reparationer" utesluter underhåll som faktiskt går. Bostadsrätt har ingen femårsregel alls. | "Yngre än fem år: ROT gäller reparation och underhåll, inte om- och tillbyggnad." (Minor 5) |
| S3 | "Du behöver ha fyllt 18 år senast vid årets slut för att få ROT-avdrag." (85) | ja | 0 | 0 | lagens ord | **OK.** Ordagrant Skatteverkets formulering (research/07 rad 493–496). | behåll |
| S4 | "Per person och år." / "Ni två/tre/fyra tillsammans, per år." (81) | du/ni | 0 | 0 | – | **OK.** "Ni" vid flera personer är ägarens ordval 2026-09-14 och det enda naturliga för ett hushåll. | behåll |
| S5 | "Du har redan använt hela årets ROT-avdrag." / "Ni har …" (108) | ja | 0 | 0 | kundens egen siffra | **OK.** Bygger på det kunden själv skrev. Efter Major 1 visas den ihop med kvarskattenoten bara när skatten verkligen inte räcker. | behåll |
| S6 | "Från 66 år är skatten på lön så låg att inget blir kvar att dra ROT-avdraget från. Har du också pension, välj Båda." (110) | ja | 0 | 0 | generaliserar | **Generaliserar.** Sant för lönen som gav noten (≤ 336 600 kr vid snitt), men läses som en allmän sanning; vid lön 400 000 blir det ca 11 000 kr. | "Från 66 år är skatten på en lön som din så låg att inget blir kvar att dra ROT-avdraget från. Har du också pension, välj Båda." (Minor 4) |
| S7 | "Din skatt räcker inte till något ROT-avdrag i år." / "Er skatt …" (111) | ja | 0 | 0 | **saknar hedge** | Kategoriskt skatteutfall från en uppskattning med snittkommunalskatt (SKV-72: snittet ger 1 951 där Stockholm ger 0, och tvärtom vid villa). Finstilten säger "kan landa på ett annat belopp", men noten själv lovar. | "Din skatt ser inte ut att räcka till något ROT-avdrag i år." / "Er skatt ser inte ut att räcka …" (Minor 2) |
| S8 | "Du har [dessutom] använt ca 14 000 kr mer än skatten räcker till. Den delen kan Skatteverket kräva tillbaka i deklarationen." (114) | ja | 0 | 0 | "kan" ✓ | **OK i röst**, fel i logik tills Major 1 är rättad (visas i dag även när skatten räcker). "i deklarationen" är folkligt; mekaniken är en pluspost i slutskatten (SFL 56 kap. 9 §, research/07 §3.5). | behåll; valfritt "… kräva tillbaka i slutskattebeskedet." |
| S9 | prefix "upp till" / "ca", enheten "kr", `kr()` med hårt mellanslag (U+00A0) | – | 0 | 0 | – | **OK.** "upp till" är alltid en övre gräns, "ca" alltid avrundat; hårt mellanslag hindrar "50 000" från att brytas. | behåll |
| S10 | `namn`: "ROT-avdrag" / "grön teknik-avdrag"; `${namn}et` → "ROT-avdraget" / "grön teknik-avdraget" | – | 0 | 0 | – | **OK.** Böjningen fungerar för båda. | behåll |

Kundsträngar utanför rakna.js som svepet också täckte (index.html): "Uppskattning med snittkommunalskatt. Skatteverket
kan landa på ett annat belopp." ("kan" ✓), "Bara för den som också äger bostaden." ✓, "ROT och RUT du redan använt i
år" ✓, "Grön teknik du redan använt i år" ✓, "Din inkomst förra året" ✓, "Bolåneränta förra året" (se Minor 9:
ränteavdraget gäller alla lån, inte bara bolån), "Hur gammal är du? Under 18 / 18 till 65 / Över 65" (se Minor 3:
"Över 65" betyder i lagen fyllt 66 vid årets ingång), **"Varav pension" (se Major 2)**.

## 4. Expertbeslut i de tio öppna frågorna

Elektrikerna lämnade inga anmärkningar (research/11 §9). Besluten nedan är mina som skatte- och logikgranskare,
med två raders motivering var. Ägarbesluten (posterna isär, uppskattning, snittkommunalskatt, frågeuppsättningen)
öppnas inte.

**(a) Behåll det valfria fältet Bolåneränta?** **Ja, behåll.** Varje 10 000 kr ränta tar 3 000 kr av utrymmet
(67 kap. 10 §), och kärnkunden är villaägaren med bolån: utan fältet visar verktyget ca 31 000 kr där rätt svar med
100 000 kr ränta är ca 1 000 kr (E-100000). Valfritt och tomt = 0 är rätt default; fältet kostar ett svar och tar
bort det farligaste felet (research/10 F2).

**(b) Kommunfråga eller disclaimer?** **Disclaimer, som nu.** Bandet Österåker–Dorotea flyttar utrymmet ±10 %
(Stockholm: kalkylatorn 240–4 868 kr över Skatteverket i 25 körningar; villa och Dorotea: under), och exakt-regeln vid
28,93 % gör att "50 000 kr" aldrig lovas där kommunen kan sänka det (19 av 19 körningar). En kommunlista (290 rader +
76 kommuner med regional reduktion) är en v2-fråga; ägarbeslutet "snittkommunalskatt" står.

**(c) Är de sju frågorna rätt uppsättning?** **Ja, med två etikettfixar, inga nya frågor.** Fastighetsavgift,
kapitalinkomst och a-kassa ger alla *mer* utrymme än verktyget visar (aldrig för högt), RUT-frågan är stängd av
ägaren, och kommunen är (b). Det som saknas är inte frågor utan tydlighet: "Varav pension" måste betyda samma sak
som koden (Major 2) och "Över 65" behöver raden "fyllt 66 före årsskiftet" (Minor 3).

**(d) Kvarskattebeskrivningen.** **Stämmer, behåll.** Skatteverket prövar vid utbetalningen bara taket per person
(HUSFL 7 § 3 st), det utbetalda läggs tillbaka som pluspost i slutskatten (SFL 56 kap. 9 §) och den slutliga
reduktionen begränsas av potten (67 kap. 2 §): mellanskillnaden blir kvarskatt för kunden, företaget behåller sina
pengar (research/07 §3.5, `[FACT src]`). Enda nyansen: den syns i slutskattebeskedet, inte "i deklarationen";
folkligt godtagbart.

**(e) Pensionär 300 000 → fullt ROT, löntagare 31 000?** **Rätt, behåll och lyft fram.** Pension bär varken
allmän pensionsavgift (7 %) eller jobbskatteavdrag, så nästan hela kommunalskatten står kvar: Skatteverket ger
49 023 kr för pension 300 000 i Stockholm (SKV-24) mot 28 065 för lön 300 000 (SKV-04), motorn samma på kronan.
Det är verktygets bästa aha-upplevelse för en elektriker och exakt vad e-tjänsten säger.

**(f) "Båda" för 66+ som jobbar?** **Behåll valet, rätta etiketten.** Skatteverket räknar lön och pension olika
även för 66+ (SKV-53: 200 000 + 200 000 → 28 132; bara lön 348 000 → 0, SKV-72), så ett gemensamt fält vore fel.
Men "Varav pension" läses som "av totalen ovan", medan koden läser fältet ovan som *bara lön*: en kund som skriver
400 000 varav 200 000 får "50 000 kr" exakt i stället för "ca 33 000 kr" (P15). Etiketten ska säga "Pension, utöver
lönen ovan" (Major 2).

**(g) "Redan använt": ordval och hittar kunden beloppet?** **Behåll "ROT och RUT du redan använt i år", lägg en
undertext.** Beloppet finns på Mina sidor under "Mina skattereduktioner för rot, rut och grön teknik" och på varje
faktura som skattereduktion (HUSFL 19 §: köparen har rätt till besked om totalen), så det går att hitta. Risken är
att fakturans totalpris skrivs in (research/10 F11): undertext "Själva avdraget, inte hela fakturan. Du ser det på
Mina sidor hos Skatteverket." (Minor 6).

**(h) Grön teknik 50/50/15 och 97 %-schablonen.** **Satserna rätt (laddbox 50 %, batteri 50 %, sol 15 %, tak
50 000 kr per person: GRÖNFL 7 §, IL 67:45, ägarkanon 2026). Ingen schablonnot i verktyget.** Schablonen (97 % av
totalpriset räknas som arbete + material vid fast pris, research/02 S11) påverkar hur stort avdraget på en *faktura*
blir, inte hur mycket av *kundens skatt* som räcker, och verktyget svarar bara på det senare. Schablonen hör hemma i
offert- och fakturarutinen (GRINDLISTA 2), inte här.

**(i) Två ägare = två tak, och sambovarningen.** **Rätt, behåll.** Taket 50 000 kr gäller "den som begär
skattereduktion" för ett beskattningsår (67 kap. 19 § 2 st), alltså per person, och bara den som äger bostaden kan
begära (13 a §, 15 §; Skatteverkets exempel K12: ROT kan inte föras över till den sambo som inte äger). Raden "Bara
för den som också äger bostaden." räcker; varje tillagd person får dessutom sina egna inkomstfält, så skatten prövas
per person.

**(j) Ord som är fel för hur elektriker pratar med kunder.** **Tre små.** (1) "Över 65" heter i lagen "fyllt 66 vid
årets ingång"; den som fyllde 66 i år ska välja "18 till 65" och får annars 0 kr på lön (konservativt men fel): rad
under frågan. (2) "Bolåneränta" är smalare än lagen (alla ränteutgifter, även billån); "Räntor du betalade förra
året" med undertext "Bolån och andra lån" täcker. (3) "bara reparationer" i femårsnoten missar att underhåll också
ger ROT; elektrikerns "laga eller byta likvärdigt" är det som går. Övrigt ("tillgängliga", "grön teknik-avdrag",
"Person 1", "Ni fyra tillsammans") är begripligt och Skatteverkets egna ord där det behövs.

## 5. Lanseringsdom

### GO WITH FIXES

Räknemotorn är rätt (Skatteverket på kronan i 73 av 75, de två övriga utanför modellen åt det försiktiga hållet),
kalkylatorns regler ovanpå lovar aldrig ett exakt "50 000 kr" som Skatteverket inte täcker, stoppen och "upp till"
är rätt i alla 150 tillstånd, och copyn är fri från streck, "·" och utropstecken. Det som stoppar ett rent GO är
**en falsk kvarskattevarning** (Major 1, 7 av 150 tillstånd, en rad kod) och **en etikett som betyder något annat
än koden** (Major 2, Båda-läget, en rad HTML). Inga blockerare.

Vad som *inte* gjordes i denna granskning, sagt rakt: ingen rendering i webbläsare (logik och strängar, inte
layout); e-tjänsten kördes inte om (de 75 sparade körningarna användes); v2b/v3 i galleriet testades inte (de
använder gammal logik, Minor 7).

### Fixlista, i ordning

| # | Nivå | Fynd | Bevis | Patch (förslag, inte tillämpad) |
|---|---|---|---|---|
| **Major 1** | Major | **Falsk kvarskattevarning i ROT-läget** när ROT + RUT använt > 50 000 och skatten räcker. Lön 480 000 (u 62 299) och använt 60 000 → "Du har dessutom använt ca 10 000 kr mer än skatten räcker till. Den delen kan Skatteverket kräva tillbaka." Fel: ROT + RUT får vara 75 000 tillsammans (67 kap. 19 §), och skatten räcker. Även överskottet överskattas när skatten inte räcker (använt 75 000 → "25 000" mot sanna 12 701). Candour-brott: skrämmer med kvarskatt som inte finns. | P11-fel; F-480-50001, F-480-60000, F-5M-60000, F-480-75000, F-480-999999, G-480-50001, G-480-999999 | `rakna.js` rad 100: byt `if (rest < 0) forMycket += -rest;` mot `if (anvant > u) forMycket += anvant - u;  /* kvarskatt bara när skatten inte räcker; ROT+RUT får passera 50 000 (75 000 tillsammans, 67 kap. 19 §) */`. Bevisat på kopia: de tre falska varningarna försvinner, F-480-75000 ger "ca 13 000", F-300-45000 oförändrat 14 000, H7 oförändrad. |
| **Major 2** | Major | **"Varav pension" läses som del av totalen, koden läser fältet ovan som bara lön.** Kund 66+ med 200 000 lön + 200 000 pension som skriver 400 000 "varav pension 200 000" får "50 000 kr" **exakt** (koden räknar 600 000) i stället för "ca 33 000 kr". Överskattning med exakt-prefix i det läge (66+ med lön) där verktyget annars skyddar bäst. | P15; D-b66-400-200 | `index.html` rad 71 och 131: `<label class="rk__etikett" for="rk-pension-1">Pension, utöver lönen ovan</label>` (samma i mallen). Alternativ som gör etiketten sann i stället: i `utrymmeFor()` `lon_ar: p.typ === 'bada' ? Math.max(0, p.inkomst - Math.min(p.inkomst, p.pension || 0)) : …` och `pension_ar: … Math.min(p.inkomst, p.pension)`; då blir separat inmatning (200 000 + 200 000) konservativt fel i stället. Etikettfixen är rätt fix. Uppdatera research/11 §4 ("Väljer kunden Båda dyker raden 'Varav pension' upp"). |
| Minor 1 | Minor | Båda med tomt lönefält och ifylld pension → "upp till 50 000 kr" fast pensionen är känd (66+, pension 300 000 → rätt "ca 50 000 kr"). | D-b66-0-300 | `rakna.js` rad 95: `const harInkomst = p.inkomst \|\| (p.typ === 'bada' && p.pension > 0); if (!harInkomst) { … }`. Bevisat på kopia. |
| Minor 2 | Minor | "Din skatt räcker inte till något ROT-avdrag i år." saknar hedge för ett uppskattat utfall (SKV-72 visar att kommunen avgör om det blir 0 eller ca 2 000). | S7 | `rakna.js` rad 111: `… skatt ser inte ut att räcka till något ${namn} i år.` |
| Minor 3 | Minor | "Över 65" = fyllt 66 vid årets ingång (63 kap. 3 a §, verifierat SKV-55/56). Den som fyllt 66 under 2026 (född 1960) väljer "Över 65" och får 0 kr på lön 300 000 i stället för ca 31 000 (konservativt men fel besked). | research/11 §4; SKV-55/56 | `index.html` rad 40: efter legenden `<p class="rk__under" id="rk-under-alder">Över 65 gäller om du fyllt 66 före årsskiftet.</p>` + `aria-describedby="rk-under-alder"` på de tre radioknapparna. |
| Minor 4 | Minor | 66+-noten generaliserar ("Från 66 år är skatten på lön så låg …") fast den bara gäller lönen som gav 0. | S6 | `rakna.js` rad 110: `Från 66 år är skatten på en lön som din så låg att inget blir kvar att dra ${namn}et från. Har du också pension, välj Båda.` |
| Minor 5 | Minor | Femårsnoten utesluter underhåll, som ger ROT. | S2 | `rakna.js` rad 34 och 88: `'Yngre än fem år: ROT gäller reparation och underhåll, inte om- och tillbyggnad.'` |
| Minor 6 | Minor | "Använt"-fältet kan fyllas med fakturans totalpris → 0 kr (research/10 F11 kvarstår). | (g) | `index.html` under rad 85/153: `<p class="rk__under">Själva avdraget, inte hela fakturan. Du ser det på Mina sidor hos Skatteverket.</p>` |
| Minor 7 | Minor | Galleriet `kalkylator/index.html` länkar v2b och v3, som importerar gamla `berakna()` (ålder gissad från inkomsttypen, ingen ränta, inget använt: 66+ med lön 300 000 får "ca 31 000 kr" där). Live-roten pekar på v1, men galleriet är nåbart från rotens länk. README säger "Tre frågor, två tal" och "validerad ±1 kr" (inaktuellt). | grep: v2b/app.js rad 3, v3/app.js rad 3; index.html rad 3 | Ta bort korten 2 och 3 ur `kalkylator/index.html` (eller lägg `v2b/`, `v3/` under `_review/`), radera `berakna()` (rad 21–49 i rakna.js) så inget kan importera den, uppdatera README. |
| Minor 8 | Minor | `logik/verifiering-skv-2026.json` blocket `motorn` är från motorn före 16/9-fixen: 37 av 75 rader visar fel motorvärde (SKV-01: 3 656, motorn ger 3 657 = Skatteverket). Research/09 §0 ("51 av 75 inom ±2") beskriver samma gamla läge. | §2.1 | Kör om motorpasset (t.ex. `node tools/skv-etjanst-grid.mjs` utan e-tjänst, eller ett 20-raders skript som skriver om `motorn` och `diff_*`) och sätt en daterad rad överst i research/09: "Efter motorfixen 16/9 kl. 10:42: 0 kr diff i 73 av 75 (research/12 §2)." |
| Minor 9 | Minor | Etiketten "Bolåneränta" är smalare än lagen (67 kap. 10 §: alla ränteutgifter). Billån och blancolån tar också av potten; utelämnas de visar verktyget för mycket. | (j) | `index.html` rad 78/146: `Räntor du betalade förra året` + undertext `Bolån och andra lån. Delar ni lånet, skriv din del.` |
| Minor 10 | Minor | Inmatning: "300 000,50" → 30 000 050 kr (kommat stryks, decimalerna blir tusenfalt); 20 siffror → 1e20. Fältet visar det direkt så kunden ser felet; ingen krasch. | P16 | `index.html`: `maxlength="9"` på alla `.rk__input`; valfritt i `siffra()`: `String(str ?? '').split(',')[0]` (kommat är decimaltecken på svenska). |

Noterat utan patch (medvetna eller ofarliga): "upp till 1 kr" när tom inkomst och använt 49 999 (P4: exakt men ser
konstigt ut); kvarskattegolvet 1 000 kr visar "ca 1 000" för 1–1 499 kr (P11); utrymme 1–499 kr ger "0 kr" med
"räcker inte"-noten (P6/P7-kanten); "ca 38 000" när taket binder och resten är exakt 37 655 (avrundning uppåt
345 kr, P8); "upp till 31 000" där "ca" vore skarpare (H8); ägarstoppet vinner över 18-årsstoppet (A6, rätt
ordning); person 2+ kan inte vara under 18 (UI-avgränsning, dokumenterad).

### Rekommenderad ordning

1. Major 1 + Minor 1 + Minor 2 + Minor 4 + Minor 5 i samma commit i `rakna.js` (fem rader), kör `node
   kalkylator/v1/_probe.mjs` och proben i denna rapport igen.
2. Major 2 + Minor 3 + Minor 6 + Minor 9 + Minor 10 i `index.html` (etiketter och undertexter), ampy-rost-svep på de
   nya raderna, uppdatera research/11 §4.
3. Minor 7 och 8 (galleri, README, JSON, research/09) före publicering av repot, inte före embed.

Efter 1 och 2: **GO.**

---

Körda artefakter (sessionens scratchpad, inte i repot): `probe.mjs` + `probe-out.json` + `probe-tabell.txt` (150
tillstånd), `skv.mjs` + `skv-out.json` (75 körningar), `band.mjs` (gränserna), `rakna-patchad.js` + `patchtest.mjs`
(bevis för Major 1, Minor 1, Minor 4-varianten). Repot: inga ändringar utom denna fil.
