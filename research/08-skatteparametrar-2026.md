# 08 — Skatteparametrar 2026: verifiering av motorn mot källorna

**Status:** KLAR (Agent B, 2026-09-16). Alla sektioner exekverade; inga narrerade steg.

**Källor som faktiskt öppnats vid körningen (grundningsbevis — alla hämtade råa med curl, HTTP 200, texten läst i sin helhet för de citerade paragraferna):**
1. Skatteverket, Belopp och procent – inkomstår 2026: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html
2. Riksdagen, Inkomstskattelag (1999:1229), konsoliderad "t.o.m. SFS 2026:1393" (3,77 MB): https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/ — lästa: 1 kap. 5 §, 63 kap. 2–5 §§, 65 kap. 2–5 §§, 67 kap. 1–10 §§, 34 §, 46–48 §§, övergångsbestämmelser 2024:1131, 2025:1374, 2025:1376
3. Riksdagen, Lag (1994:1744) om allmän pensionsavgift: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/
4. Riksdagen, Lag (2007:1398) om kommunal fastighetsavgift: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/
5. Riksdagen, Lag (2008:826) om skattereduktion för kommunal fastighetsavgift: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2008826-om-skattereduktion-for-kommunal_sfs-2008-826/
6. Skatteverket, PDF "Kommunal fastighetsavgift kalenderåren 2008 och 2018–2026" (2025-11-11): https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf
7. Skatteverket, "Skattereduktioner" (turordning + räkneexempel): https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html
8. Skatteverket, Teknisk beskrivning SKV 433 för skattetabeller 2026, utgåva 36 (2025-12-10, 30 s.): https://www.skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf
9. Skatteverket, Allmänna skattetabeller månadslön 2026 (txt, 398 kB): https://www.skatteverket.se/download/18.1522bf3f19aea8075ba5af/1765287119989/allmanna-tabeller-manad.txt
10. SCB, statistiknyhet Kommunalskatterna 2026 (2025-12-15) + tabellerna "Högsta och lägsta" och "kommunvis": https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/ · https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/hogsta-och-lagsta-kommunalskatten-2026/ · https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/
11. Svensk författningssamling, SFS 2025:1376 (officiell PDF) och SFS 2024:1131 (officiell PDF): https://svenskforfattningssamling.se/sites/default/files/sfs/2025-12/SFS2025-1376.pdf · https://svenskforfattningssamling.se/sites/default/files/sfs/2024-11/SFS2024-1131.pdf
12. Skärmdump från Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" 2026-09-16 (syskonagent): `research/underlag/skv-etjanst/SKV-05-1985-Stockholm-lon360000-pen0-ranta0-fa0.png`

**Exekverat verktyg:** `research/underlag/skv433-tabellkontroll-2026.py` — fristående återimplementation av SKV 433 som träffar 481/481 rader i Skatteverkets publicerade tabell 34 (kolumn 1 och 2).

**Provenienstaggar:** `[FACT src: URL]` = hämtat från källan vid körningen · `[BERÄKNAT]` = räknat fram ur [FACT]-värden ·
`[GAP]` = kunde inte verifieras, aldrig gissat.

**Verdict-skala:** `stämmer` = motorns värde/formel matchar källan · `avviker` = matchar inte (med belopp) · `GAP` = källan gick inte att nå/hitta.

---

## 0. Sammanfattning

**Slutsats: motorn använder rätt 2026-parametrar och rätt formler på alla punkter som avgör "räcker det till 50 000 kr ROT?" — men den har tre avrundnings-/spärrfel och två omodellerade reduktioner som flyttar utrymmet med 1–6 400 kr i vissa fall.**

Stämmer (verifierat mot lagtext + Skatteverket + SCB, se §12): prisbasbelopp 59 200 · grundavdrag 63 kap. 3 § (5 intervall) · förhöjt grundavdrag 63 kap. 3 a § i 2026-lydelsen (alla 12 intervall, koefficient för koefficient, inkl. 2026-höjningen över 3,24 pbb) · åldersgräns 66 (67 från 2027) · jobbskatteavdrag 67 kap. 7 § (4 intervall, 2026-lydelsen: 38,74 % / 1,813 / 25,1 % / 3,027 pbb, ingen avtrappning) och 8 § (22 % / 0,2635 + 7 % / 0,6293 pbb) · JSA bara mot kommunalskatt · arbetsinkomst nedåt till hundratal · allmän pensionsavgift 7 % max 47 100, inte på pension, 100 % reduktion · förvärvsinkomstreduktion 1 500 / 0,75 % (40 000–240 000) · underskott av kapital 30 %/21 % vid 100 000 · statlig 20 % över skiktgräns 643 000 (brytpunkter 660 400 / 760 500 reproduceras) · fastighetsavgift 0,75 % max 10 425, takunderlag 1 390 000, 15-årsbefrielse värdeår ≥ 2012 · snittkommunalskatt 32,38 % · avräkningsbas = kommunal + statlig + fastighetsavgift (+ fastighetsskatt), och kyrko-, begravnings- och public service-avgift står utanför · avräkningsordningen · ROT 50 000 / ROT+RUT 75 000 / GT 50 000. Tio räkneexempel (§11) ligger inom −2…+1 kr från Skatteverkets egen beräkningskedja (SKV 433) och alla fyra e-tjänstfall reproduceras (motorn −1 kr i ett).

Avviker (med belopp):
1. **Allmän pensionsavgift avrundas fel** — motorn alltid nedåt till helt hundratal; lagen (1994:1744 3 §) och SKV 433: närmaste hundratal (50 → nedåt). Fel i 42 % av lönenivåerna, alltid −100 kr avgift → **+100 kr för mycket utrymme**. Skatteverkets exempel: lön 181 200 → 12 700 (motorn 12 600). (§4.1)
2. **Skattereduktioner avrundas fel** — motorn närmaste krona (`pyRound`); lagen 67 kap. 1 §: "öretal faller bort". ≤ 1 kr per reduktion, ≤ ~3 kr totalt; förklarar hela −1 kr-avvikelsen i e-tjänstfallet Göteborg. (§3.4)
3. **Pensionärers 4 %-spärr på fastighetsavgiften saknas** (Lag 2008:826; Skatteverket räknar av den FÖRST) — pensionär 65+ med villa och BFI under ~260 000 får upp till **6 383 kr för högt utrymme** (240 000 i pension: +5 673 kr). (§8.1)
4. **Regional skattereduktion saknas** — 1 675 kr i 76 kommuner (IL bilaga 67 — Skatteverkets lista: 13 i Dalarna, 7 i Gävleborg, 8 i Jämtland, 13 i Norrbotten, 10 i Värmland, 14 i Västerbotten, 6 i Västernorrland, 5 i Dalsland/Västra Götaland), räknas av före ROT → **+1 675 kr för högt utrymme** där. (§10)
5. **Inkomstgolvet 25 042 kr för pensionsavgiften saknas** — kantfall villaägare med lön < 25 042: upp till 1 400 kr för LÅGT utrymme. (§4.2)
6. **JSA-spärren** — motorn spärrar JSA mot hela kommunalskatten; Skatteverket (SKV 433 ex. 2) mot kommunalskatten minus pensionsavgiftsreduktionen. Slår bara vid låg lön (< ~60 000) i kombination med villa/statlig skatt; motorn blir då för snål (konservativ). (§3.1, §11.2 variant C)
7. **`KS_BAND` [29 %, 35 %] täcker inte verkligheten** — 2026: Österåker 28,93 % … Dorotea 35,65 % (10 kommuner över 35,00). Kosmetiskt om bandet bara är copy, materiellt om det räknar min/max. (§9)
8. Statlig inkomstskatt tas ut först när underlaget ≥ 200 kr (65 kap. 2 §) — max 40 kr, försumbart. (§7)

Inget av 1–8 ändrar svaret på 50 000-frågan för de tio standardfallen; 1, 3 och 4 kan ändra det på marginalen (utrymme 45 000–55 000) och bör åtgärdas före lansering. Fullständig [GAP]-lista i §13.

---

## 1. Basbelopp 2026

Källa hämtad rå (curl, 2026-09-16, HTTP 200): https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html

| Parameter | Motorn (`engine.js`) | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Prisbasbelopp 2026 | `PBB: 59_200` | 59 200 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Prisbasbeloppet inkomstår 2026: 59 200 kronor" | stämmer |
| Förhöjt prisbasbelopp 2026 | (används inte) | 60 500 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Förhöjt prisbasbelopp inkomstår 2026: 60 500 kronor" | n/a (behövs inte i modellen) |
| Inkomstbasbelopp 2026 | (används inte) | 83 400 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Inkomstbasbeloppet för år 2026 har fastställts till 83 400 kronor." | n/a (behövs inte: avgiftstaket för allmän pensionsavgift hämtas som färdigt belopp, se §4) |
| Skattefri årsinkomst 2026 | (implicit: `0.423 × PBB`) | 25 041 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Skattefri årsinkomst för 2026 är 25 041 kronor." | stämmer [BERÄKNAT]: 0,423 × 59 200 = 25 041,6 → deklarationsplikt från 25 042 |

Anm. Inkomstbasbeloppet behövs bara om man vill härleda 47 100 (taket för allmän pensionsavgift), se §4.

## 2. Grundavdrag (IL 63 kap. 2–3 a §§)

Källa hämtad rå (curl, 2026-09-16, HTTP 200, 3,77 MB HTML): https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/ — sidhuvud: "SFS nr: 1999:1229 … Ändrad: t.o.m. SFS 2026:1393".
Övergångsbestämmelse [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/]: "2025:1376 1. Denna lag träder i kraft den 1 januari 2026. 2. Lagen tillämpas första gången på beskattningsår som börjar efter den 31 december 2025." → de lydelser som är märkta "Lag (2025:1376)" är 2026-lydelserna.

### 2.1 Avrundning och tak (63 kap. 2 § och 5 §)

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Avrundning av grundavdraget | `rundUpp100(ga)` (uppåt till helt hundratal) | uppåt till helt hundratal | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 63 kap. 2 § 3 st: "Avdraget ska avrundas uppåt till helt hundratal kronor." | stämmer |
| Grundavdraget får inte överstiga inkomsten | `Math.min(ga, fi)` | får inte överstiga överskott av tjänst + aktiv näringsverksamhet minus allmänna avdrag | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 63 kap. 5 §: "Grundavdraget får inte överstiga den skattskyldiges sammanlagda överskott av aktiv näringsverksamhet och av tjänst, minskat med hans allmänna avdrag." | stämmer (förenkling: motorn har inga allmänna avdrag, så FI = överskottet) |
| Fastställd förvärvsinkomst avrundas | `rundNed100(lonAr + pensionAr)` | nedåt till helt hundratal | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 1 kap. 5 § 2 st: "Summan av överskott i inkomstslagen tjänst och näringsverksamhet minskas med allmänna avdrag. Det återstående beloppet avrundas nedåt till helt hundratal kronor och är den fastställda förvärvsinkomsten." | stämmer (Python-kommentaren kallar det "förenkling" — det är lagens regel) |
| Vem: obegränsat skattskyldig hela året | antas | "obegränsat skattskyldiga under hela beskattningsåret" | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 63 kap. 3 § 1 st | stämmer (antagande dokumenterat; 63 kap. 4 § delårsregel ej modellerad) |

### 2.2 Ordinarie grundavdrag, 63 kap. 3 § (Lag 2011:1256 — oförändrad 2026)

Lagtext [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] (tabellen i 3 §, prisbasbelopp = pbb):

| Fastställd förvärvsinkomst (FI) | Lagens grundavdrag | Motorn (`grundavdrag()`) | Verdict |
|---|---|---|---|
| "överstiger inte 0,99 prisbasbelopp" | "0,423 prisbasbelopp" | `fi <= 0.99p → 0.423p` | stämmer |
| "överstiger 0,99 men inte 2,72 prisbasbelopp" | "0,423 prisbasbelopp ökat med 20 procent av det belopp med vilket den fastställda förvärvsinkomsten överstiger 0,99 prisbasbelopp" | `0.423p + 0.20(fi − 0.99p)` | stämmer |
| "överstiger 2,72 men inte 3,11 prisbasbelopp" | "0,77 prisbasbelopp" | `0.77p` | stämmer |
| "överstiger 3,11 men inte 7,88 prisbasbelopp" | "0,77 prisbasbelopp minskat med 10 procent av det belopp med vilket den fastställda förvärvsinkomsten överstiger 3,11 prisbasbelopp" | `0.77p − 0.10(fi − 3.11p)` | stämmer |
| "överstiger 7,88 prisbasbelopp" | "0,293 prisbasbelopp" | `0.293p` | stämmer |

Korskontroll mot Skatteverkets publicerade belopp [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Grundavdragets storlek för dig som inte fyllt 66 år vid inkomstårets ingång är: 25 100 vid låga inkomster, som högst 45 600 kronor, som lägst 17 400 kronor vid höga inkomster."
[BERÄKNAT] ur motorn: 0,423 × 59 200 = 25 041,6 → 25 100 ✓ · 0,77 × 59 200 = 45 584 → 45 600 ✓ · 0,293 × 59 200 = 17 345,6 → 17 400 ✓. **Alla tre stämmer.**

### 2.3 Förhöjt grundavdrag 66+, 63 kap. 3 a § i 2026-lydelsen (Lag 2025:1376, "Upphör att gälla U:2027-01-01")

Lagtext [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/]: "3 a § /Upphör att gälla U:2027-01-01/ För dem som vid beskattningsårets ingång har fyllt 66 år är grundavdraget beloppet enligt 3 § med tillägg av följande särskilda belopp."

| FI-intervall (lag) | Lagens särskilda belopp | Motorn (`s`) | Verdict |
|---|---|---|---|
| "överstiger inte 0,91 prisbasbelopp" | "0,687 prisbasbelopp" | `0.687p` | stämmer |
| "överstiger 0,91 men inte 1,11" | "0,885 prisbasbelopp minskat med 20 procent av den fastställda förvärvsinkomsten" | `0.885p − 0.20·fi` | stämmer |
| "överstiger 1,11 men inte 1,965" | "0,600 prisbasbelopp ökat med 5,7 procent av den fastställda förvärvsinkomsten" | `0.600p + 0.057·fi` | stämmer |
| "överstiger 1,965 men inte 2,72" | "0,333 prisbasbelopp ökat med 19,49 procent av den fastställda förvärvsinkomsten" | `0.333p + 0.1949·fi` | stämmer |
| "överstiger 2,72 men inte 3,11" | "39,49 procent av den fastställda förvärvsinkomsten minskat med 0,212 prisbasbelopp" | `0.3949·fi − 0.212p` | stämmer |
| "överstiger 3,11 men inte 3,24" | "49,49 procent av den fastställda förvärvsinkomsten minskat med 0,523 prisbasbelopp" | `0.4949·fi − 0.523p` | stämmer |
| "överstiger 3,24 men inte 5,00" | "35,6 procent av den fastställda förvärvsinkomsten minskat med 0,073 prisbasbelopp" | `0.356·fi − 0.073p` | stämmer |
| "överstiger 5,00 men inte 7,88" | "0,017 prisbasbelopp ökat med 33,8 procent av den fastställda förvärvsinkomsten" | `0.017p + 0.338·fi` | stämmer |
| "överstiger 7,88 men inte 8,08" | "0,703 prisbasbelopp ökat med 25,1 procent av den fastställda förvärvsinkomsten" | `0.703p + 0.251·fi` | stämmer |
| "överstiger 8,08 men inte 11,16" | "2,732 prisbasbelopp" | `2.732p` | stämmer |
| "överstiger 11,16 men inte 12,84" | "9,651 prisbasbelopp minskat med 62 procent av den fastställda förvärvsinkomsten" | `9.651p − 0.62·fi` | stämmer |
| "överstiger 12,84 prisbasbelopp" | "1,691 prisbasbelopp" | `1.691p` | stämmer |

**Alla tolv intervall stämmer koefficient för koefficient.** Motorn använder `<=` på övre gränsen, vilket motsvarar lagens "överstiger … men inte" (övre gräns inkluderad).

Korskontroll mot Skatteverket [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Förhöjt grundavdrag för personer som fyllt 66 år vid inkomstårets ingång är: 65 800 kronor vid låga inkomster, som högst 179 100 kronor, som lägst 117 500 kronor vid höga inkomster."
[BERÄKNAT] ur motorn (körning `node`, hela intervallet FI 0–2 000 000 i steg om 100): lägsta = (0,423 + 0,687) × 59 200 = 65 712 → **65 800** ✓ · högsta = **179 100** vid FI 478 300–478 400 (≈ 8,08 pbb; 0,293p + 0,703p + 0,251 × 8,08p = 3,024p = 179 021 → 179 100) ✓ · vid höga inkomster (FI > 12,84 pbb = 760 128) = (0,293 + 1,691) × 59 200 = 117 452,8 → **117 500** ✓.
**Alla tre Skatteverket-beloppen reproduceras exakt av motorn.** Även <66: max 45 600 (FI 161 000–184 100), min 17 400.

### 2.4 Åldersregeln

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Ålder för förhöjt grundavdrag 2026 | `ALDERSGRANS_FORHOJT_GA: 66` ("fyllt 66 vid årets ingång") | fyllt 66 år vid beskattningsårets ingång | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 63 kap. 3 a § (2026): "För dem som vid beskattningsårets ingång har fyllt 66 år" | stämmer |
| Från 2027 | kommentar "67 from 2027, GRIND 12" | 67 år från 2027-01-01 | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] "3 a § /Träder i kraft I:2027-01-01/ För dem som vid beskattningsårets ingång har fyllt 67 år … Lag (2025:1374)." | stämmer (GRIND 12 måste flytta åldern till 67 vid årsskiftet 2026/27) |
| Skatteverkets formulering | — | "fyllt 66 år vid inkomstårets ingång" | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] Grundavdrag-avsnittet | stämmer |

Observera: 2027-lydelsen (Lag 2025:1374) har **exakt samma koefficienter** som 2026-lydelsen — bara åldern ändras (66 → 67). [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] (båda tabellerna lästa i sin helhet).

### 2.5 Förändring 2026 ("sänkt skatt för pensionärer")

Källor hämtade råa (curl, 2026-09-16, HTTP 200): SFS 2025:1376 (officiell PDF, "Utfärdad den 27 november 2025", "Publicerad den 3 december 2025", fotnot: "Prop. 2025/26:32, bet. 2025/26:FiU1, rskr. 2025/26:64", "Senaste lydelse 2024:1131"): https://svenskforfattningssamling.se/sites/default/files/sfs/2025-12/SFS2025-1376.pdf · SFS 2024:1131 (2025-lydelsen): https://svenskforfattningssamling.se/sites/default/files/sfs/2024-11/SFS2024-1131.pdf

SFS 2025:1376 ändrar "63 kap. 3 a § och 67 kap. 7, 9 b och 9 c §§" och "träder i kraft den 1 januari 2026 … tillämpas första gången på beskattningsår som börjar efter den 31 december 2025" [FACT src: https://svenskforfattningssamling.se/sites/default/files/sfs/2025-12/SFS2025-1376.pdf]. Bracket-för-bracket-diff av det särskilda beloppet:

| FI-intervall | 2025 (Lag 2024:1131) | 2026 (Lag 2025:1376) = motorn | Ändring |
|---|---|---|---|
| ≤ 0,91 pbb | 0,687 pbb | 0,687 pbb | oförändrad |
| 0,91–1,11 | 0,885 pbb − 20 % FI | samma | oförändrad |
| 1,11–1,965 | 0,600 pbb + 5,7 % FI | samma | oförändrad |
| 1,965–2,72 | 0,333 pbb + 19,49 % FI | samma | oförändrad |
| 2,72–3,11 | 39,49 % FI − 0,212 pbb | samma | oförändrad |
| 3,11–3,24 | 49,49 % FI − 0,523 pbb | samma | oförändrad |
| 3,24–5,00 | "0,096 prisbasbelopp ökat med 30,4 procent" | "35,6 procent … minskat med 0,073 prisbasbelopp" | **höjt** |
| 5,00–7,88 | "0,186 prisbasbelopp ökat med 28,6 procent" | "0,017 prisbasbelopp ökat med 33,8 procent" | **höjt** |
| 7,88–8,08 | "0,872 prisbasbelopp ökat med 19,9 procent" | "0,703 prisbasbelopp ökat med 25,1 procent" | **höjt** |
| platå | 8,08–10,94 pbb: 2,48 pbb | 8,08–11,16 pbb: **2,732 pbb** | **höjt +0,252 pbb (= +14 918 kr grundavdrag)** |
| nedtrappning | 10,94–12,47: 9,263 pbb − 62 % FI | 11,16–12,84: 9,651 pbb − 62 % FI | förskjuten uppåt |
| golv | > 12,47 pbb: 1,532 pbb | > 12,84 pbb: 1,691 pbb | **höjt +0,159 pbb** |

[BERÄKNAT] Effekt 2026 vs 2025 för pensionär 66+ (utöver prisbasbeloppsuppräkningen): ingen ändring under 3,24 pbb (191 808 kr); vid 5,00 pbb (296 000 kr) +0,091 pbb ≈ +5 387 kr grundavdrag ≈ 1 744 kr lägre skatt vid 32,38 %; vid ≥ 8,08 pbb (478 336 kr) +14 918 kr grundavdrag ≈ 4 830 kr lägre skatt. **Motorn bär 2026-lydelsen — verifierat mot den officiella SFS-PDF:en.** SKV 433 bekräftar: "Förändringar avseende det förhöjda grundavdraget för personer över 66 år" [FACT src: https://www.skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf] och dess tre 2026-exempel reproduceras exakt (§11.2).

## 3. Jobbskatteavdrag (IL 67 kap. 5–9 §§)

### 3.1 Gemensamma regler

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Underlaget (arbetsinkomst) avrundas | `rundNed100(arbetsinkomst)` | nedåt till helt hundratal | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 6 § 4 st: "Arbetsinkomsterna ska minskas med allmänna avdrag enligt 62 kap. och sjöinkomstavdrag enligt 64 kap. samt avrundas nedåt till helt hundratal kronor." | stämmer |
| Vad som är arbetsinkomst | `lon_ar` (lön); pension ingår INTE | inkomster enligt SFB 59 kap. 8–12 §§ m.fl. (lön, näringsinkomst); pension är inte arbetsinkomst | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 6 § 1 st | stämmer (pensionär med enbart pension → JSA 0, vilket motorn ger eftersom `lon_ar = 0` → `ai = 0 → return 0`) |
| JSA räknas av endast mot kommunal inkomstskatt | `Math.min(jsa, kommunal)` | ja | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 2 st: "Skattereduktion enligt 5-9 d, 34, 35 och 46-48 §§ ska dock räknas av endast mot kommunal inkomstskatt." | stämmer |
| Avrundning av reduktionen | `pyRound(u * ks)` (närmaste krona, halva till jämnt) | öretal faller bort (trunkering nedåt) | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 1 § 2 st: "Skattereduktion ska anges i hela krontal så att öretal faller bort." | **avviker** — max 1 kr per reduktion (se §3.4) |
| Åldersgräns 66 (7 § vs 8 §) | `ar66Plus` = "fyllt 66 vid årets ingång" | "vid beskattningsårets ingång inte har fyllt 66 år" resp. "har fyllt 66 år" | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 7 § och 8 § (2026-lydelse) | stämmer |
| Delårsregel (9 §) | ej modellerad | 1/12 per månad om obegränsat skattskyldig del av året | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 9 § | n/a (dokumenterad förenkling: helårsboende) |

### 3.2 Under 66 år — 67 kap. 7 § i 2026-lydelsen (Lag 2025:1376)

Lagtext [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/]: "7 § För dem som vid beskattningsårets ingång inte har fyllt 66 år uppgår skattereduktionen för summan av arbetsinkomster beräknade enligt 6 § till följande belopp." (AI = arbetsinkomst, GA = grundavdraget, ks = skattesatsen för kommunal inkomstskatt)

| AI-intervall (lag) | Lagens skattereduktion | Motorn (`u`, sedan `u × ks`) | Verdict |
|---|---|---|---|
| "överstiger inte 0,91 prisbasbelopp" | "skillnaden mellan arbetsinkomsterna och grundavdraget, multiplicerad med skattesatsen för kommunal inkomstskatt" | `ai − ga` | stämmer |
| "överstiger 0,91 men inte 3,24 prisbasbelopp" | "skillnaden mellan å ena sidan summan av 0,91 prisbasbelopp och 38,74 procent av arbetsinkomsterna mellan 0,91 och 3,24 prisbasbelopp och å andra sidan grundavdraget, multiplicerad med skattesatsen för kommunal inkomstskatt" | `0.91p + 0.3874(ai − 0.91p) − ga` | stämmer |
| "överstiger 3,24 men inte 8,08 prisbasbelopp" | "skillnaden mellan å ena sidan summan av 1,813 prisbasbelopp och 25,1 procent av arbetsinkomsterna mellan 3,24 och 8,08 prisbasbelopp och å andra sidan grundavdraget, multiplicerad med skattesatsen för kommunal inkomstskatt" | `1.813p + 0.251(ai − 3.24p) − ga` | stämmer |
| "överstiger 8,08 prisbasbelopp" | "skillnaden mellan 3,027 prisbasbelopp och grundavdraget, multiplicerad med skattesatsen för kommunal inkomstskatt" | `3.027p − ga` | stämmer |
| Avtrappning för höga inkomster | **ingen** — lagtexten 2026 har fyra intervall, inget femte "minskat med 3 procent"-steg ([FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 7 § slutar med "överstiger 8,08 prisbasbelopp … 3,027 prisbasbelopp") | ingen | stämmer |
| Multiplikation med kommunalskattesats | "multiplicerad med skattesatsen för kommunal inkomstskatt" ([FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 7 §) | `u × ks` | stämmer |
| Negativt värde | (JSA kan inte bli negativt; ett negativt "belopp" saknar mening i lagen) | `Math.max(0, …)` | stämmer (skyddsspärr) |

[BERÄKNAT] intern konsistens av koefficienterna: 0,91 + 0,3874 × (3,24 − 0,91) = 1,8126 ≈ 1,813 ✓ och 1,813 + 0,251 × (8,08 − 3,24) = 3,0278 ≈ 3,027 ✓ (kurvan är kontinuerlig vid brytpunkterna, som lagen avser).

Maximalt JSA 2026 <66 [BERÄKNAT]: (3,027 × 59 200 − 17 400) × 0,3238 = (179 198,4 − 17 400) × 0,3238 = 52 390 kr vid snittkommunalskatt (motorn: se §11, 720 000-fallet).

### 3.3 66 år och äldre — 67 kap. 8 § (Lag 2024:1131, oförändrad 2026)

Lagtext [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/]: "8 § För dem som vid beskattningsårets ingång har fyllt 66 år uppgår skattereduktionen för summan av arbetsinkomster beräknade enligt 6 § till följande belopp."

| AI-intervall (lag) | Lagens skattereduktion | Motorn | Verdict |
|---|---|---|---|
| "överstiger inte 1,75 prisbasbelopp" | "22 procent av arbetsinkomsterna" | `0.22 × ai` | stämmer |
| "överstiger 1,75 men inte 5,24 prisbasbelopp" | "summan av 0,2635 prisbasbelopp och 7 procent av arbetsinkomsterna" | `0.2635p + 0.07 × ai` | stämmer |
| "överstiger 5,24 prisbasbelopp" | "0,6293 prisbasbelopp" | `0.6293p` | stämmer |
| Ingen multiplikation med kommunalskattesats | 8 § nämner ingen skattesats ([FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 8 §) | ingen | stämmer |
| Räknas av endast mot kommunal | 67 kap. 2 § 2 st (5–9 d §§) ([FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/]) | `Math.min(jsa, kommunal)` | stämmer |

[BERÄKNAT] max JSA 66+ = 0,6293 × 59 200 = 37 254,56 → 37 254 kr (lag: öretal faller bort) / motorn `pyRound` → 37 255 kr. **Avviker med 1 kr** i just detta fall (se §3.4).

Åldern i 8 § från 2027: riksdagstexten visar ingen "Träder i kraft I:2027"-variant av 67 kap. 7–8 §§ (bara av 63 kap. 3 a § och 11 kap. 6 a §). → [GAP] huruvida 67 kap. 7–8 §§ ålder flyttas till 67 år 2027 framgår inte av den hämtade konsoliderade texten; berör inte 2026.

### 3.4 Avrundningsavvikelsen (67 kap. 1 § 2 st)

Lagen: "Skattereduktion ska anges i hela krontal så att öretal faller bort." [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] — dvs. trunkering nedåt, inte avrundning till närmaste krona.
Motorn: `pyRound()` (närmaste, halva till jämnt) i `jobbskatteavdrag()`, `redForvarvsinkomst()`, `redUnderskottKapital()`; `pyRound(bfi * ks)` för kommunalskatten (skatten i sig är inte en skattereduktion — kommunal inkomstskatt avrundas enligt SFL, se [GAP] §13).
Effekt: 0 eller +1 kr per reduktion när öresdelen ≥ 0,50 — motorn kan då ge **1 kr för mycket i reduktion → 1 kr för lite utrymme**. På 50 000-kronorsnivån är detta irrelevant för "räcker det?"-svaret, men det förklarar varför modellen inte träffar Skatteverkets e-tjänst på kronan i alla fall (Python-docstringen: "3 kr avvikelse i ett").
Verdict: **avviker (≤ 1 kr per reduktion, ≤ ~3 kr totalt)** — rekommendation: byt `pyRound` → `Math.floor` i de tre reduktionsfunktionerna (ändrar aldrig svaret på 50 000-frågan, men gör kedjan lagtrogen).

### 3.5 Förändring 2026 ("förstärkt jobbskatteavdrag")

Diff 67 kap. 7 § mellan SFS 2024:1131 (2025) och SFS 2025:1376 (2026) [FACT src: https://svenskforfattningssamling.se/sites/default/files/sfs/2024-11/SFS2024-1131.pdf · https://svenskforfattningssamling.se/sites/default/files/sfs/2025-12/SFS2025-1376.pdf]:

| AI-intervall | 2025 (Lag 2024:1131) | 2026 (Lag 2025:1376) = motorn | Ändring |
|---|---|---|---|
| ≤ 0,91 pbb | (AI − GA) × ks | samma | oförändrad |
| 0,91–3,24 | (0,91 pbb + 38,74 % × (AI − 0,91 pbb) − GA) × ks | samma | oförändrad |
| 3,24–8,08 | "summan av 1,813 prisbasbelopp och **19,9 procent** av arbetsinkomsterna mellan 3,24 och 8,08" | "1,813 prisbasbelopp och **25,1 procent**" | **höjd lutning** |
| > 8,08 pbb | "skillnaden mellan **2,776** prisbasbelopp och grundavdraget" | "**3,027** prisbasbelopp" | **höjt tak +0,251 pbb** |
| avtrappning höga inkomster | ingen (borttagen redan i 2025-lydelsen) | ingen | oförändrad |

[BERÄKNAT] Max-effekt 2026 vs 2025: +0,251 × 59 200 = +14 859 kr i underlag × 32,38 % ≈ **+4 811 kr JSA** för den som tjänar ≥ 478 336 kr (8,08 pbb); ingen ändring under 191 808 kr (3,24 pbb). Motorns koefficienter (0,3874 · 1,813 · 0,251 · 3,027) är 2026-lydelsens. 67 kap. 8 § (66+) är identisk i båda författningarna (22 % / 0,2635 pbb + 7 % / 0,6293 pbb) — oförändrad 2026. SKV 433: "Förändring av beräkning i jobbskatteavdraget för inkomstår 2026" [FACT src: https://www.skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf].

Konsekvens för ROT-utrymmet: det förstärkta JSA **minskar** utrymmet med upp till ~4 800 kr för höginkomsttagare jämfört med 2025 (mer av kommunalskatten äts upp före ROT). Motorn räknar rätt på detta.

## 4. Allmän pensionsavgift (IL 67 kap. 4 § + Lag 1994:1744)

Källa hämtad rå (curl, 2026-09-16, HTTP 200): https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/ — "Ändrad: t.o.m. SFS 2025:381".

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Procentsats | `PENSIONSAVGIFT: 0.07` | 7 % | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] 2 §: "…betala allmän pensionsavgift med 7 procent." · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "7 procent av förvärvsinkomsten men högst 47 100 kronor." | stämmer |
| Maxbelopp 2026 | `PENSIONSAVGIFT_MAX: 47_100` | 47 100 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "högst 47 100 kronor" · härledning [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] 3 § 3 st: "bortses från inkomst … till den del summan av inkomsterna överstiger 8,07 gånger det för året gällande inkomstbasbeloppet" → [BERÄKNAT] 8,07 × 83 400 = 673 038 (= Skatteverkets "Inkomsttaket … 673 038 kronor") → underlag nedåt till 673 000 → 7 % = 47 110 → närmaste hundratal = 47 100 ✓ | stämmer |
| Tas inte ut på pension | `lonAr > 0 ? … : 0` (pension_ar ingår inte) | avgiften beräknas bara på inkomst av anställning och inkomst av annat förvärvsarbete enligt SFB 59 kap. | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] 3 § 1 st: "Avgiften beräknas dels på sådan inkomst av anställning som avses i 59 kap. socialförsäkringsbalken, dels på sådan inkomst av annat förvärvsarbete…" | stämmer |
| Underlaget avrundas | `rundNed100(0.07 × lon)` avrundar AVGIFTEN nedåt (underlaget avrundas inte separat) | inkomsten avrundas nedåt till helt hundratal | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] 3 § 1 st: "Inkomst av anställning och inkomst av annat förvärvsarbete ska därvid var för sig avrundas till närmast lägre hundratal kronor." | stämmer i effekt (7 % av ett hundratal är alltid ett helt krontal; se nästa rad för avgiftens avrundning) |
| **Avgiftens avrundning** | `rundNed100(…)` = **alltid nedåt** till helt hundratal | **närmaste** hundratal; exakt 50 → nedåt | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] 3 § 4–5 st: "Avgiften avrundas till närmast hela hundratal kronor. Avgift som slutar på 50 kronor avrundas till närmast lägre hundratal kronor." | **avviker** — se §4.1 |
| Full skattereduktion (100 %) | reduktion = avgiften | 100 % | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 4 §: "Skattereduktion ska göras för allmän pensionsavgift enligt lagen (1994:1744) om allmän pensionsavgift som avser beskattningsåret." · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Alla skattskyldiga som betalar allmän pensionsavgift får en skattereduktion med 100 procent av avgiften." | stämmer |
| Räknas av mot hela basen (kommunal + statlig + fastighetsskatt + fastighetsavgift), aldrig mot avgiften själv | `min(pensionsavgift, pool)` | ja | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Du kan inte få högre skattereduktion än summan av din kommunala inkomstskatt, statliga inkomstskatt, fastighetsskatt och fastighetsavgift. Skattereduktionen får alltså inte räknas av mot till exempel den allmänna pensionsavgiften." · [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 2 st (4 § finns inte i "endast kommunal"-listan) | stämmer |
| Ordning: först (efter sjöinkomst) | först i kedjan | "sjöinkomst, allmän pensionsavgift, arbetsinkomst (jobbskatteavdrag), …" | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 1 st | stämmer |
| **Inkomstgolv** | inget golv | ingen avgift om inkomsterna understiger 42,3 % av prisbasbeloppet = [BERÄKNAT] 0,423 × 59 200 = 25 041,60 kr | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] 4 § 1 st: "Avgift ska inte betalas av den som har sådana inkomster som avses i 3 §, om inkomsterna understiger 42,3 procent av det för året gällande prisbasbeloppet" | **avviker (kantfall)** — se §4.2 |
| Ingen avgift på sjuk-/aktivitetsersättning | ej modellerat (ingen sådan inkomsttyp i motorn) | 4 § 2 st | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19941744-om-allman-pensionsavgift_sfs-1994-1744/] | n/a |

### 4.1 Avrundningsfelet på avgiften (materiellt)

[BERÄKNAT] Körning av `skatteutrymme()` för lön 25 100–800 000 kr i steg om 100 kr (7 750 fall) mot lagens avrundningsregel: **motorn avviker i 3 260 fall (42,1 %), alltid med −100 kr på avgiften** (motorn ger 100 kr lägre reduktion → **100 kr för högt utrymme**).
Exempel: lön 361 000 → 7 % = 25 270 → lag: 25 300 · motorn: 25 200. Lön 362 200 → 25 354 → lag 25 400 · motorn 25 300.
De fyra valideringsfallen mot Skatteverkets e-tjänst (360 000, 240 000 pension, 720 000 = tak, 180 000) ger alla exakt jämna hundratal (25 200 / 0 / 47 100 / 12 600) och **kunde därför aldrig avslöja felet**. Skatteverkets eget exempel i SKV 433 (2026) visar regeln: "Årsinkomsten uppgår till 181 200 kr. Den allmänna pensionsavgiften blir 12 700 kr (181 200 x 7% = 12 684 kr som avrundas till närmaste hundratal)" — motorn ger 12 600 för samma lön. Det är ett systematiskt fel på 100 kr för ~42 % av alla löner (bevis mot publicerad tabell: §11.2, variant A). Python-kommentaren "avgiften avrundas till helt hundratal i Skatteverkets beräkning (25 200 på 360 000)" är korrekt observation men fel slutsats om riktningen.
Rekommenderad fix (GRIND): `pensionsavgift = min(47 100, rundNarmast100(0.07 × rundNed100(lon)))` med regeln "slutar på exakt 50 → nedåt", dvs. `Math.floor(a/100 + 0.5)*100` justerat så att `a % 100 === 50` avrundas nedåt. Verdict: **avviker (100 kr, 42 % av fallen, alltid i "för generös" riktning).**

### 4.2 Inkomstgolvet (kantfall)

Lön under 25 042 kr: lagen tar inte ut någon avgift (→ reduktion 0). Motorn räknar 7 % ändå men spärrar mot `pool`; utan fastighetsavgift blir pool = 0 (grundavdraget äter hela inkomsten) och effekten är noll. **Med villa** (fastighetsavgift 10 425) drar motorn ändå upp till 1 400 kr i pensionsavgift som inte finns → utrymmet blir upp till 1 400 kr för LÅGT. Sällsynt kombination (villaägare med < 25 042 kr i lön och ingen pension). Verdict: **avviker (kantfall, ≤ 1 400 kr, i "för snål" riktning).** Fix: `if (lonAr < 0.423 × PBB) pensionsavgift = 0`.

## 5. Skattereduktion för förvärvsinkomst (IL 67 kap. 46–48 §§)

Lydelse Lag (2020:1166) — oförändrad 2026 (inga belopp indexeras; beloppen står i kronor i lagen).

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Nedre gräns | `bfi <= 40_000 → 0` | rätt till reduktion om BFI > 40 000 | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 46 §: "…har rätt till skattereduktion för förvärvsinkomster om den beskattningsbara förvärvsinkomsten är högre än 40 000 kronor." | stämmer |
| Fullt belopp | `1_500` | 1 500 kr | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 47 § 1 st: "Skattereduktion enligt 46 § ska uppgå till 1 500 kronor, om inte annat följer av andra stycket." | stämmer |
| Infasning | `0.0075 × (bfi − 40_000)` för BFI ≤ 240 000 | 0,75 % av (BFI − 40 000) mellan 40 000 och 240 000 | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 47 § 2 st: "För personer som har en beskattningsbar förvärvsinkomst mellan 40 000 kronor och 240 000 kronor ska skattereduktionen uppgå till 0,75 procent av skillnaden mellan den beskattningsbara förvärvsinkomsten och 40 000 kronor." | stämmer ([BERÄKNAT] 0,0075 × 200 000 = 1 500 → kontinuerlig vid 240 000) |
| Underlag = beskattningsbar förvärvsinkomst (efter grundavdrag) | `bfi` | "den beskattningsbara förvärvsinkomsten" | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 46–47 §§ | stämmer |
| Räknas av endast mot kommunal | `Math.min(forv, kommunal − jsa)` | ja (46–48 §§ i uppräkningen) | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 2 st | stämmer |
| Gäller även pensionärer | ja (ingen åldersspärr i koden) | ja — 46 § ställer bara krav på obegränsad skattskyldighet + BFI > 40 000 | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 46 § | stämmer |
| Avrundning | `pyRound` | öretal faller bort | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 1 § 2 st | avviker (≤ 1 kr, se §3.4) |
| Delårsregel | ej modellerad | 1/12 per månad | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 48 § | n/a (förenkling) |

## 6. Underskott av kapital (IL 67 kap. 10 §)

Lydelse Lag (2024:1131) — oförändrad 2026.

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| 30 % upp till 100 000 | `0.30 × min(underskott, 100_000)` | 30 % av den del som inte överstiger 100 000 | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 10 § 1 st: "Om det uppkommer ett underskott av kapital, ska skatten minskas med 30 procent av den del av underskottet som inte överstiger 100 000 kronor och med 21 procent av det återstående underskottet, om inte annat följer av andra stycket." | stämmer |
| 21 % därutöver | `0.21 × max(0, underskott − 100_000)` | 21 % av återstående | samma citat | stämmer |
| Skatteverkets belopp-sida | — | "Underskott av kapital upp till 100 000 kronor ger en skattereduktion med 30 procent. På underskott över 100 000 kronor är skattereduktionen 21 procent." | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] | stämmer |
| Undantag 30 % hela vägen (investeraravdrag, kapitalförsäkring/PEPP-avdrag) | ej modellerat | 10 § 2 st | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] | n/a (förenkling; ger i så fall något STÖRRE reduktion → mindre utrymme; sällsynt) |
| Räknas av mot hela basen (kommunal + statlig + fastighetsavgift) | ja (`kap` dras från `pool` utan kommunal-spärr) | ja — 10 § finns inte i "endast kommunal"-listan | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 2 st | stämmer |
| Ordning: före hushållsarbete | ja | "…underskott av kapital, hushållsarbete, installation av grön teknik…" | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 1 st | stämmer |
| Ränteavdragsbegränsning 2025/2026 (lån utan säkerhet ger inget avdrag) | ej modellerat — användaren matar in ränteutgifter | "Från och med inkomstår 2026 gäller nya regler … inte längre får avdrag för ränteutgifter om lånet saknar säkerhet." | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] Ränteförmån-avsnittet | n/a (UI-fråga: inmatningen bör avse avdragsgilla räntor, dvs. bolåneränta) |
| Avrundning | `pyRound` | öretal faller bort | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 1 § 2 st | avviker (≤ 1 kr) |

## 7. Statlig inkomstskatt (IL 65 kap. 5 §)

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Skattesats | `STATLIG: 0.20` | 20 % | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 65 kap. 5 § 1 st: "För fysiska personer är den statliga inkomstskatten på beskattningsbara förvärvsinkomster 20 procent av den del av den beskattningsbara förvärvsinkomsten som överstiger en skiktgräns." | stämmer |
| Skiktgräns 2026 | `SKIKTGRANS: 643_000` | 643 000 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Skiktgränsen för 2026 är 643 000 kronor." och "Det är ingen statlig inkomstskatt på beskattningsbar förvärvsinkomst upp till 643 000 kronor. På den beskattningsbara förvärvsinkomsten som överstiger 643 000 kronor är den statliga inkomstskatten 20 procent." | stämmer |
| Hur skiktgränsen bestäms | (fast värde) | 598 500 för 2024, uppräknad med KPI juni + 2 procentenheter, fastställs av regeringen, avrundas uppåt till helt hundratal | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 65 kap. 5 § 2 st | stämmer (lagen anger inte 2026-beloppet; det är regeringens förordning → Skatteverket 643 000) |
| Underlag = beskattningsbar förvärvsinkomst | `max(0, bfi − 643 000)` | BFI (efter grundavdrag) | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Skiktgränsen … är den fastställda förvärvsinkomsten minskad med grundavdrag (beskattningsbar förvärvsinkomst)." | stämmer |
| Brytpunkt <66 (FI före grundavdrag) | ej parameter (härledd) | 660 400 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Brytpunkten är 660 400 kronor för dig som inte fyllt 66 år vid inkomstårets ingång." | stämmer [BERÄKNAT]: 643 000 + 17 400 = 660 400 ✓ (motorn: FI 660 400 → GA 17 400 → BFI 643 000 → statlig 0) |
| Brytpunkt 66+ | ej parameter (härledd) | 760 500 kr | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Brytpunkten är 760 500 kronor för dig som fyllt 66 år vid inkomstårets ingång." | stämmer [BERÄKNAT]: 643 000 + 117 500 = 760 500 ✓ (kräver FI > 12,84 pbb = 760 128 → GA 117 500) |
| Minimigräns 200 kr | ej modellerad | "Statlig inkomstskatt beräknas bara om underlaget för skatten är minst 200 kronor." | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 65 kap. 2 § | avviker marginellt (max 40 kr statlig skatt på underlag 100 kr; påverkar bara BFI 643 100–643 100) |
| Kommunal inkomstskatt = (kommunalskatt + regionskatt) × BFI | `pyRound(bfi × ks)` | ja | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 65 kap. 3 § 1 st: "…summan av de skattesatser för kommunalskatt och regionskatt som gäller i hemortskommunen för beskattningsåret multiplicerad med den beskattningsbara förvärvsinkomsten." | stämmer (ks i motorn måste vara kommun + region, vilket SCB:s "total kommunal skattesats" är, se §9) |

## 8. Kommunal fastighetsavgift (Lag 2007:1398, Lag 2008:826)

Källor hämtade råa (curl, 2026-09-16, HTTP 200): https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/ ("Ändrad: t.o.m. SFS 2012:743") · https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2008826-om-skattereduktion-for-kommunal_sfs-2008-826/ ("Ändrad: t.o.m. SFS 2011:1424") · Skatteverkets PDF "Kommunal fastighetsavgift kalenderåren 2008 och 2018–2026" (daterad 2025-11-11, 4 sidor, läst med pdftotext): https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Procentsats småhus | `FASTIGHETSAVGIFT_SATS: 0.0075` | 0,75 % | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 § a): "6 000 kronor per sådant småhus, dock högst 0,75 procent av byggnadsvärdet och markvärdet" · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Kommunal fastighetsavgift för småhus är 0,75 procent av fastighetens taxeringsvärde, men aldrig mer än 10 425 kronor." | stämmer |
| Takbelopp småhus 2026 | `FASTIGHETSAVGIFT_MAX: 10_425` | 10 425 kr | [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 1, kolumn 2026 (Deklaration 2027): "Hel avgift 0,75 %, kronor 10 425 (1 390 000)" · härledning [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 § 2 st: 6 000 kr (2008) "ökad … med ett belopp motsvarande inkomstbasbeloppets förändring mellan år 2008 och det aktuella kalenderåret" → [BERÄKNAT] 6 000 × 83 400 / 48 000 = 10 425,00 (PDF Tabell 7: "+ 73,75 %") | stämmer |
| Takunderlag (taxeringsvärde där taket nås) | `TAXERINGSVARDE_MAXAVGIFT: 1_390_000` | 1 390 000 kr | [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 1: "(1 390 000)" · [BERÄKNAT] 10 425 / 0,0075 = 1 390 000 | stämmer |
| Formel | `min(10 425, 0,0075 × taxeringsvärde)` | min(takbelopp, 0,75 % × taxeringsvärde) | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 § a) | stämmer |
| Halv avgift (gamla 5+5-regeln) | ej modellerad | "Inget värde" 2022–2026 (regeln har löpt ut för alla värdeår ≤ 2011) | [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 1, rad "Halv avgift 0,375 %": "Inget värde" för 2022–2026 | stämmer (inget att modellera 2026) |
| 15-årsbefrielse nybyggda | `FASTIGHETSAVGIFT_BEFRIAD_FRAN_VARDEAR: 2012` → 0 kr för värdeår ≥ 2012 | ingen avgift "för det fastighetstaxeringsåret och de fjorton följande kalenderåren"; nya lydelsen gäller "byggnader med beräknat värdeår 2012 eller senare" | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 6 § 1 st + övergångsbest. 2012:743 p. 3 · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Du betalar ingen fastighetsavgift de första 15 åren för nybyggda småhus eller ägarlägenheter som byggdes 2012 eller senare." | stämmer [BERÄKNAT]: värdeår V → befriad V+1 … V+15; V = 2012 → 2013–2027 → **befriad 2026 ✓ och 2027 ✓; första avgiftsår 2028**. Parametern ska alltså vara 2012 även 2027 och först 2028 bli 2013 (GRIND 12-notering) |
| Ägarlägenhet | ej särskilt modellerad (samma som småhus om användaren anger taxeringsvärde) | 0,75 %, max 10 425 (identiskt med småhus) | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 § d) · [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 5: 10 425 (1 390 000) | stämmer (ingen särbehandling behövs) |
| Bostadsrätt | ej modellerad (ingen fastighetsavgift för medlemmen) | avgiften ligger på hyreshusenheten = föreningen: 1 784 kr per bostadslägenhet, max 0,3 % | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 § c) + 2 §: "Fastighetsavgift ska betalas … av den som vid ingången av kalenderåret är ägare till fastigheten" (= föreningen) · [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 4: 1 784 (594 667) | stämmer — en bostadsrättshavare har **ingen** fastighetsavgift i sin egen skatt → 0 i avräkningsbasen. UI-krav: fråga "Äger du småhus?" så att bostadsrätt inte ger 10 425 i utrymme |
| Småhus på ofri grund | ej modellerad | byggnad 5 212 + tomtmark 5 212 (halva takbeloppet vardera) | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 a § · [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 2–3 | n/a (sällsynt; summan blir ändå ≤ 10 424 ≈ tak) |
| Avgiftens avrundning | `pyRound(min(…))` | "Avgiften uttrycks i hela krontal så att öretal faller bort." | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20071398-om-kommunal-fastighetsavgift_sfs-2007-1398/] 3 § 2 st | avviker (≤ 1 kr; 0,75 % av ett taxeringsvärde i hela tusental är alltid helt krontal → i praktiken 0 kr) |
| **Pensionärers 4 %-spärr** (Lag 2008:826) | ej modellerad (dokumenterad förenkling: "no 4 %-cap on pensioners' property fee") | reduktion = fastighetsavgift − spärrbelopp; spärrbelopp = 4 % × (BFI + överskott av kapital), lägst 4 042 kr 2026 | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2008826-om-skattereduktion-for-kommunal_sfs-2008-826/] 3 § p. 1: "fyllt 65 år vid ingången av beskattningsåret" · 5 §: "Spärrbeloppet är fyra procent av summan av 1. den avgiftsskyldiges beskattningsbara förvärvsinkomst … och 2. … överskott i inkomstslaget kapital … För år 2009 och senare år får spärrbeloppet inte fastställas till ett lägre belopp än 2 800 kronor ökat … med … prisbasbeloppets förändring" · [FACT src: https://www.skatteverket.se/download/18.16f588619a39f2c14aa57/1762862283047/kommunal-fastighetsavgift-kalenderaren-2008-och-2018-2026.pdf] Tabell 8: "Lägsta möjliga spärrbelopp … 2026: 4 042" · [BERÄKNAT] 2 800 × 59 200 / 41 000 = 4 042,93 → 4 042 ✓ | **avviker (kantfall)** — se §8.1 |
| Åldersgräns för 4 %-spärren | — | **65 år** (inte 66) vid beskattningsårets ingång, samt sjuk-/aktivitetsersättning | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2008826-om-skattereduktion-for-kommunal_sfs-2008-826/] 3 § | notera: annan ålder än grundavdraget (66) |
| Spärrens avräkning | — | mot kommunal + statlig inkomstskatt, fastighetsavgift, fastighetsskatt | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2008826-om-skattereduktion-for-kommunal_sfs-2008-826/] 7 § 2 st | — |

### 8.1 4 %-spärren: när slår den?

Spärren gäller bara den som fyllt 65 vid årets ingång (eller har sjuk-/aktivitetsersättning), ägt och bott på småhuset hela året, och vars fastighetsavgift överstiger 4 % × (BFI + kapitalöverskott). Med full avgift 10 425 kr krävs BFI < 260 625 kr för att spärren ska bita (10 425 / 0,04) [BERÄKNAT]. Exempel pensionär 66+, pension 240 000 [BERÄKNAT, §11.4 P2]: GA 121 200 → BFI 118 800 → spärrbelopp 4 % × 118 800 = 4 752 kr → reduktion 10 425 − 4 752 = 5 673 kr → **avräkningsbasen för ROT krymper med 5 673 kr** jämfört med motorn (motorn låter hela 10 425 ligga kvar i poolen).
Spärren ligger **inte** i IL 67 kap. 2 §:s uppräkning — den är en egen lag som räknas av "mot kommunal och statlig inkomstskatt, kommunal fastighetsavgift och statlig fastighetsskatt" (7 §). Skatteverket lägger den **först** i turordningen: [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] "Du får skattereduktionerna i den här turordningen: Skattereduktion för fastighetsavgift för pensionärer …" (före sjöinkomst och allmän pensionsavgift). Den minskar alltså basen före ROT.
Verdict: **avviker för pensionärer 65+ med villa och BFI < ~260 000 — motorn överskattar utrymmet med (10 425 − max(4 042, 4 % × BFI)) kr, som mest 6 383 kr.** Rekommendation: modellera spärren (enkel formel ovan) eller visa varningstext för 66+-villaägare.

## 9. Kommunalskatt 2026 (SCB)

Källor hämtade råa (curl, 2026-09-16, HTTP 200): SCB statistiknyhet "Den totala kommunala skattesatsen minskar med 3 öre" (2025-12-15 08.00): https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/ · SCB "Högsta och lägsta kommunalskatten 2026" (senast uppdaterad 2025-12-15): https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/hogsta-och-lagsta-kommunalskatten-2026/ · SCB "Totala kommunala skattesatser 2026, kommunvis": https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Genomsnittlig total kommunal skattesats 2026 | `KS_SNITT: 0.3238` | 32,38 % | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/] "Den genomsnittliga totala kommunala skattesatsen minskar 2026 och uppgår till 32,38 procent." Tabell: kommunal 20,69 + region 11,69 = total 32,38 (2025: 32,41) · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Den genomsnittliga kommunala skattesatsen för 2026 är 32,38 procent." | stämmer |
| Skattesatsen = kommun + region | `ks` används som EN sats | "Den totala kommunala skattesatsen är summan av kommunskatten och regionskatten." | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/] · IL 65 kap. 3 § (se §7) | stämmer (förutsatt att UI:t matar in TOTAL sats, inte enbart kommundelen) |
| Lägsta kommun 2026 | `KS_BAND[0] = 0.29` | **Österåker 28,93 %** (kommun 16,60 + region 12,33) | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/hogsta-och-lagsta-kommunalskatten-2026/] "Lägsta kommunalskatten: Österåker 28,93" · [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/] rad Österåker: 28,93 / 16,60 / 12,33 | **avviker** — bandets nedre gräns 29,00 ligger 7 öre ÖVER den lägsta kommunen |
| Högsta kommun 2026 | `KS_BAND[1] = 0.35` | **Dorotea 35,65 %** (kommun 23,80 + region 11,85) | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/hogsta-och-lagsta-kommunalskatten-2026/] "Högsta kommunalskatten: Dorotea 35,65" · [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/] rad Dorotea: 35,65 / 23,80 / 11,85 | **avviker** — 10 kommuner ligger över 35,00 (Dorotea 35,65, Vilhelmina 35,50, Sorsele 35,45, Åsele 35,45, Degerfors 35,30, Vindeln/Norsjö/Malå/Vännäs 35,20, Nordmaling 35,10) |
| Spännvidd | 6 procentenheter (29–35) | 6,72 procentenheter | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/] "Skillnaden mellan kommunerna med högst och lägst total kommunal skattesats är således 6 kronor och 72 öre per hundralapp." | avviker (se ovan) |
| Stockholm 2026 | (valideringsfall SKV-KAL-01/02/03: 0,3055) | 30,55 % (18,22 + 12,33; −0,05 mot 2025) | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/] rad Stockholm: "30,55 · ‑0,05 · 18,22 · 0,00 · 12,33 · ‑0,05" | stämmer |
| Göteborg 2026 | (valideringsfall SKV-KAL-04: 0,3260) | 32,60 % (21,12 + 11,48) | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/] rad Göteborg: "32,60 · 0,00 · 21,12 · 0,00 · 11,48 · 0,00" | stämmer |
| Malmö 2026 | — | 32,42 % (21,24 + 11,18) | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/] rad Malmö: "32,42 · 0,00 · 21,24 · 0,00 · 11,18 · 0,00" | (referens) |
| Uppsala 2026 | — | 32,85 % (21,14 + 11,71) | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/] rad Uppsala: "32,85 · 0,00 · 21,14 · 0,00 · 11,71 · 0,00" | (referens) |
| Övriga lägsta (topp 10) | — | Kävlinge 29,59 · Lidingö 29,67 · Vellinge 29,68 · Solna 29,70 · Täby 29,88 · Nacka 30,11 · Staffanstorp 30,12 · Örkelljunga 30,24 · Sollentuna 30,45 | [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/hogsta-och-lagsta-kommunalskatten-2026/] | (referens) |

Anm. SCB: "Skattesatserna som redovisas i denna Statistiknyhet publicerades av Skatteverket den 5 december 2025. De ändringar som eventuellt rapporterats till Skatteverket efter detta datum ligger inte till grund för denna Statistiknyhet." [FACT src: https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/statistiknyhet/kommunalskatterna-2026/] — Skatteverkets egen kommunlista (xlsx "skattesatser-kommuner-2026.xlsx") finns länkad från belopp-sidan; ej öppnad ([GAP] för eventuella januari-korrigeringar).

Rekommendation för `KS_BAND`: sätt bandet till [0,2893, 0,3565] eller — hellre — låt UI:t välja kommun ur SCB-listan (290 rader) så att bandet inte behövs. Om bandet bara används som "ärlig osäkerhetsmarkering" i copy ("mellan ca 29 och 36 procent") är avvikelsen kosmetisk; om det används för att räkna min/max-utrymme är det materiellt (Dorotea-bo får 0,65 procentenheter för lite kommunalskatt i "max"-fallet).

## 10. Avräkningsbasen (IL 67 kap. 2 §) — public service-avgift, begravningsavgift, kyrkoavgift

Källa hämtad rå (curl, 2026-09-16, HTTP 200): Skatteverket "Skattereduktioner": https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html

| Parameter | Motorn | Källans värde | Källa + citat | Verdict |
|---|---|---|---|---|
| Basen = kommunal inkomstskatt + statlig inkomstskatt + statlig fastighetsskatt + kommunal fastighetsavgift | `pool = kommunal + statlig + fastighetsavgift` | exakt dessa fyra | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 2 st: "Skattereduktion ska räknas av mot kommunal och statlig inkomstskatt som beräknats enligt 65 kap., mot statlig fastighetsskatt enligt lagen (1984:1052) om statlig fastighetsskatt samt mot kommunal fastighetsavgift enligt lagen (2007:1398) om kommunal fastighetsavgift." · [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] "Summan av skattereduktionerna får inte överstiga summan av kommunal inkomstskatt, statlig inkomstskatt, fastighetsavgift och fastighetsskatt." | stämmer (statlig fastighetsskatt — obebyggd tomt, hus under uppförande — ej modellerad; n/a för ROT-kund med färdigt hus) |
| Begravningsavgift ingår INTE i basen | ingår inte | avgift enligt begravningslagen, inte "skatt enligt 65 kap." | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 2 st räknar upp basen uttömmande · [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] "Det finns avgifter du måste betala och som inte påverkas av jobbskatteavdraget. De avgifterna är begravningsavgift, eventuell avgift till trossamfund och den allmänna pensionsavgiften. Du måste också betala public service-avgiften som inte heller påverkas av jobbskatteavdraget." · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Begravningsavgiften är 0,292 procent. Om du är folkbokförd i Stockholm eller Tranås kommun är avgiften 0,07 procent respektive 0,285 procent." | stämmer |
| Kyrkoavgift ingår INTE i basen | ingår inte | avgift till registrerat trossamfund | samma citat [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Kyrkoavgift till Svenska kyrkan betalar alla medlemmar i svenska kyrkan … Kyrkoavgiften särredovisas på slutskattebeskedet." | stämmer |
| Public service-avgift ingår INTE i basen | ingår inte | 1 % av BFI, max 1 184 kr 2026 | samma citat [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] · [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Public service-avgift: Maxbelopp per person och år: 1 184 kronor." | stämmer |
| Allmän pensionsavgift ingår INTE i basen (reduktionen får inte räknas mot avgiften själv) | `min(pensionsavgift, pool)` | ja | [FACT src: https://www.skatteverket.se/privat/skatter/beloppochprocent/2026.4.1522bf3f19aea8075ba21.html] "Skattereduktionen får alltså inte räknas av mot till exempel den allmänna pensionsavgiften." | stämmer |
| Skatteverkets räkneexempel på sidan | — | Kommunalskatt 71 600 + fastighetsavgift 6 400 + allmän pensionsavgift 18 200 + kyrkoavgift 1 600 + begravningsavgift 200 + public service-avgift 1 347 − red. pensionsavgift 18 200 − red. arbetsinkomst 14 200 − red. underskott av kapital 16 600 = 50 347 kr; "Skattereduktion för rot och rutarbete som du inte kan utnyttja + 19 000 kr" | [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] | stämmer med motorns struktur [BERÄKNAT]: utrymme = 71 600 + 6 400 − 18 200 − 14 200 − 16 600 = **29 000 kr** → av 48 000 kr preliminärt ROT/RUT kan 19 000 inte utnyttjas (48 000 − 29 000 = 19 000 ✓). Kyrko-, begravnings- och public service-avgiften betalas oavsett |
| Turordning enligt Skatteverket | pensionsavgift → JSA → förvärvsinkomst → kapital → ROT/RUT → grön teknik | "Du får skattereduktionerna i den här turordningen": 1 fastighetsavgift för pensionärer · 2 sjöinkomst · 3 allmän pensionsavgift · 4 jobbskatteavdrag · 5 sjuk-/aktivitetsersättning · 6 förvärvsinkomst · 7 boende i vissa områden (regional) · 8 underskott av kapital · 9 rot/rut · 10 grön teknik · 11 gåvor · (12 a-kassa) | [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] rubrikföljden på sidan · [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 2 § 1 st | stämmer för de modellerade stegen; **pensionärsspärren (steg 1) och regional reduktion (steg 7, 1 675 kr i 76 kommuner) saknas** — båda minskar utrymmet |
| Regional skattereduktion (boende i vissa områden) | ej modellerad | 1 675 kr/år, folkbokförd 1 nov året före i kommun enligt bilaga 67 (76 kommuner), bara mot kommunal inkomstskatt, före underskott av kapital och ROT | [FACT src: https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/inkomstskattelag-19991229_sfs-1999-1229/] 67 kap. 34 §: "Rätt till skattereduktion med 1 675 kronor har fysiska personer som den 1 november året före beskattningsåret är folkbokförda i en kommun som anges i bilaga 67." · [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] "Skattereduktionen är 1 675 kronor per år … räknas endast av mot din kommunala inkomstskatt" + kommunlistan (Dalarna 13, Gävleborg 7, Jämtland 8, Norrbotten 13, Värmland 10, Västerbotten 14, Västernorrland 6, Västra Götaland 5) | **avviker** — utrymmet blir 1 675 kr för högt för boende i dessa kommuner; fix: kommunval i UI → dra 1 675 (spärrat mot kommunal − JSA − förv) |
| Oanvänt utrymme får inte sparas | (n/a) | "Om du inte kan nyttja dina skattereduktioner får du inte spara dem till kommande beskattningsår." | [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] | (copy-fakta för kalkylatorn) |
| Preliminärt ROT utan täckning → återbetalning | (copy) | "OBS! Om du inte har tillräckligt mycket skatt att räkna av reduktionen mot, blir du återbetalningsskyldig för den del av den preliminära skattereduktionen som du inte får slutlig skattereduktion för." | [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] | (copy-fakta) |
| ROT-tak | `ROT_TAK 50_000`, `ROT_RUT_TAK 75_000` | "Rot och rutavdraget är högst 75 000 kronor vardera per person och år, av det får rotavdraget vara som högst 50 000 kronor." | [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] | stämmer |
| Grön teknik-tak | `GT_TAK 50_000` | "Skattereduktionen för grön teknik är högst 50 000 kr per person/år." | [FACT src: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattereduktioner.4.3810a01c150939e893f1a17e.html] | stämmer |

## 11. Tio räkneexempel ur motorn + oberoende korskontroll

### 11.1 Motorn, snittkommunalskatt 32,38 %, ingen fastighetsavgift, inga räntor [BERÄKNAT ur `engine.js`, `node`-körning 2026-09-16]

| id | typ | brutto/år | FI | GA | BFI | kommunal (32,38 %) | statlig | red. pensionsavgift | JSA | red. förvärvsink. | **utrymme ROT/RUT/GT** | räcker till 50 000 ROT? | 75 000 ROT+RUT? | 100 000 ROT+GT? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| L1 | lön <66 | 150 000 | 150 000 | 43 400 | 106 600 | 34 517 | 0 | 10 500 | 15 449 | 500 | **8 068** | NEJ | NEJ | NEJ |
| L2 | lön <66 | 180 000 | 180 000 | 45 600 | 134 400 | 43 519 | 0 | 12 600 | 18 500 | 708 | **11 711** | NEJ | NEJ | NEJ |
| L3 | lön <66 | 240 000 | 240 000 | 40 000 | 200 000 | 64 760 | 0 | 16 800 | 25 718 | 1 200 | **21 042** | NEJ | NEJ | NEJ |
| L4 | lön <66 | 300 000 | 300 000 | 34 000 | 266 000 | 86 131 | 0 | 21 000 | 32 537 | 1 500 | **31 094** | NEJ | NEJ | NEJ |
| L5 | lön <66 | 360 000 | 360 000 | 28 000 | 332 000 | 107 502 | 0 | 25 200 | 39 357 | 1 500 | **41 445** | NEJ | NEJ | NEJ |
| L6 | lön <66 | 480 000 | 480 000 | 17 400 | 462 600 | 149 790 | 0 | 33 600 | 52 390 | 1 500 | **62 300** | JA | NEJ | NEJ |
| L7 | lön <66 | 600 000 | 600 000 | 17 400 | 582 600 | 188 646 | 0 | 42 000 | 52 390 | 1 500 | **92 756** | JA | JA | NEJ |
| L8 | lön <66 | 720 000 | 720 000 | 17 400 | 702 600 | 227 502 | 11 920 | 47 100 | 52 390 | 1 500 | **138 432** | JA | JA | JA |
| P1 | pension 66+ | 180 000 | 180 000 | 104 200 | 75 800 | 24 544 | 0 | 0 | 0 | 268 | **24 276** | NEJ | NEJ | NEJ |
| P2 | pension 66+ | 240 000 | 240 000 | 121 200 | 118 800 | 38 467 | 0 | 0 | 0 | 591 | **37 876** | NEJ | NEJ | NEJ |
| P3 | pension 66+ | 300 000 | 300 000 | 136 500 | 163 500 | 52 941 | 0 | 0 | 0 | 926 | **52 015** | JA | NEJ | NEJ |

Tolkning: en ensam löntagare utan villa och utan ränteavdrag behöver ca 430 000 kr/år (≈ 36 000 kr/mån) för att fullt ROT på 50 000 ska rymmas vid snittskatt; en pensionär (66+) med enbart pension klarar 50 000 vid ca 290 000 kr/år. (Break-even-nivåerna är [BERÄKNAT] ur motorn och ändras med kommunalskatten, fastighetsavgift (+10 425) och ränteavdrag (−30 % av räntan).)

### 11.2 Oberoende källa 1: Skatteverkets teknisk beskrivning SKV 433 (2026, utgåva 36) + publicerad månadstabell 34

Källor hämtade råa (curl, 2026-09-16, HTTP 200): SKV 433 (30 sidor, daterad 2025-12-10, "SKVFS 2025:20 som träder i kraft den 1 januari 2026"): https://www.skatteverket.se/download/18.1522bf3f19aea8075ba55c/1766385913260/teknisk-beskrivning-skv-433-2026-utgava-36.pdf · Månadstabellerna 2026 (txt, 398 kB, alla tabeller 29–42, kolumn 1–6): https://www.skatteverket.se/download/18.1522bf3f19aea8075ba5af/1765287119989/allmanna-tabeller-manad.txt · indexsida: https://www.skatteverket.se/privat/skatter/arbeteochinkomst/skattetabeller/tekniskbeskrivningforskattetabeller.4.319dc1451507f2f99e86ee.html

**Metod (exekverad, inte narrerad):** en helt fristående återimplementation av SKV 433:s regler (fil: `research/underlag/skv433-tabellkontroll-2026.py`, skriven enbart ur SKV 433-texten, delar ingen kod med `engine.js`) körs mot Skatteverkets publicerade tabell 34 (den sats SKV 433 använder: "Genomsnittliga skattesatsen för inkomståret 2026 har beräknats till 34 %", varav 1,16 procentenheter är begravnings- och kyrkoavgift → KI = 32,84 %).
Resultat: **481 av 481 rader i kolumn 1 (löntagare <66) och 481 av 481 rader i kolumn 2 (pensionär 66+) återskapas exakt** (månadsavdrag = floor(årsskatt/12)). Det bevisar att återimplementationen är Skatteverkets kedja. Samma körning visar att tabellen skiljer på motorns avrundningsval:

| Variant (= motorns nuvarande val) | Rader i tabell 34 kol 1 som avviker (av 481) |
|---|---|
| SKV 433-trogen återimplementation | **0** |
| A: allmän pensionsavgift alltid NEDÅT till helt hundratal | 24 |
| B: JSA avrundas till närmaste krona (i stället för öretal bort) | 9 |
| C: JSA spärras mot hela kommunalskatten (i stället för kommunalskatt − pensionsavgiftsreduktion) | 48 |

Korskontroll av de tio fallen (motorn körd med `ks = 0,3284` så att den är jämförbar med tabell 34; tabellvärdet W är månadsavdraget för inkomstskiktets topp, årsvärdet = 12·W har ±11 kr osäkerhet p.g.a. floor(års/12)):

| fall | tabell 34 kol | W (publicerad) | 12·W | − begr/kyrka 1,16 % av BFI | − allmän pensionsavgift | − public service | = utrymme ur tabellen (±11) | SKV 433-återimpl. exakt | **motorn** (ks 32,84) | motorn − exakt |
|---|---|---|---|---|---|---|---|---|---|---|
| lön 150 000 | 1 | 1 761 | 21 132 | 1 236 | 10 500 | 1 066 | 8 330 | 8 340 | 8 338 | **−2** |
| lön 180 000 | 1 | 2 284 | 27 408 | 1 559 | 12 600 | 1 184 | 12 065 | 12 066 | 12 066 | 0 |
| lön 240 000 | 1 | 3 491 | 41 892 | 2 320 | 16 800 | 1 184 | 21 588 | 21 597 | 21 597 | 0 |
| lön 300 000 | 1 | 4 760 | 57 120 | 3 085 | 21 000 | 1 184 | 31 851 | 31 855 | 31 854 | **−1** |
| lön 360 000 | 1 | 6 054 | 72 648 | 3 851 | 25 200 | 1 184 | 42 413 | 42 413 | 42 413 | 0 |
| lön 480 000 | 1 | 8 652 | 103 824 | 5 366 | 33 600 | 1 184 | 63 674 | 63 683 | 63 683 | 0 |
| lön 600 000 | 1 | 12 052 | 144 624 | 6 758 | 42 000 | 1 184 | 94 682 | 94 691 | 94 691 | 0 |
| lön 720 000 | 1 | 16 446 | 197 352 | 8 150 | 47 100 | 1 184 | 140 918 | 140 919 | 140 919 | 0 |
| pension 180 000 (66+) | 2 | 2 188 | 26 256 | 879 | 0 | 758 | 24 619 | 24 624 | 24 625 | **+1** |
| pension 240 000 (66+) | 2 | 3 415 | 40 980 | 1 378 | 0 | 1 184 | 38 418 | 38 422 | 38 423 | **+1** |
| pension 300 000 (66+) | 2 | 4 653 | 55 836 | 1 896 | 0 | 1 184 | 52 756 | 52 767 | 52 767 | 0 |

Avvikelserna −2/−1/+1 kr beror uteslutande på avrundning (motorn: närmaste krona; lagen/SKV 433: öretal bort) i JSA, förvärvsinkomstreduktion och kommunalskatt — se delkomponenterna:

| fall | GA exakt / motor | kommunal exakt / motor | pensionsavgift exakt / motor | JSA exakt / motor | förv exakt / motor |
|---|---|---|---|---|---|
| 150 000 <66 | 43 400 / 43 400 | 35 007 / 35 007 | 10 500 / 10 500 | 15 668 / **15 669** | 499 / **500** |
| 180 000 <66 | 45 600 / 45 600 | 44 136 / **44 137** | 12 600 / 12 600 | 18 762 / **18 763** | 708 / 708 |
| 240 000 <66 | 40 000 / 40 000 | 65 680 / 65 680 | 16 800 / 16 800 | 26 083 / 26 083 | 1 200 / 1 200 |
| 300 000 <66 | 34 000 / 34 000 | 87 354 / 87 354 | 21 000 / 21 000 | 32 999 / **33 000** | 1 500 / 1 500 |
| 360 000 <66 | 28 000 / 28 000 | 109 028 / **109 029** | 25 200 / 25 200 | 39 915 / **39 916** | 1 500 / 1 500 |
| 480 000 <66 | 17 400 / 17 400 | 151 917 / **151 918** | 33 600 / 33 600 | 53 134 / **53 135** | 1 500 / 1 500 |
| 600 000 <66 | 17 400 / 17 400 | 191 325 / **191 326** | 42 000 / 42 000 | 53 134 / **53 135** | 1 500 / 1 500 |
| 720 000 <66 | 17 400 / 17 400 | 230 733 / **230 734** | 47 100 / 47 100 | 53 134 / **53 135** | 1 500 / 1 500 |
| 180 000 66+ | 104 200 / 104 200 | 24 892 / **24 893** | 0 / 0 | 0 / 0 | 268 / 268 |
| 240 000 66+ | 121 200 / 121 200 | 39 013 / **39 014** | 0 / 0 | 0 / 0 | 591 / 591 |
| 300 000 66+ | 136 500 / 136 500 | 53 693 / 53 693 | 0 / 0 | 0 / 0 | 926 / 926 |

Grundavdraget (inkl. förhöjt) stämmer på kronan i alla elva fall, liksom SKV 433:s egna fem grundavdragsexempel (FI 120 000 → 37 400 · 324 000 → 31 600 · 66+: 90 000 → 72 000 · 200 000 → 110 900 · 390 000 → 157 900) och de två JSA-exemplen (AI 90 000, KI 32,84 → 11 976 · AI 240 000 → 26 083) — alla reproducerade exakt av motorn [BERÄKNAT, `node`].

### 11.3 Oberoende källa 2: Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (inkomstår 2026)

De fyra körningarna i `skatteutrymme_2026.py::validering()` (2026-09-11) + en ny skärmdump 2026-09-16 (`research/underlag/skv-etjanst/SKV-05-1985-Stockholm-lon360000-pen0-ranta0-fa0.png`, e-tjänsten visar: BFI 332 000 · kommunal inkomstskatt +101 426 · red. allmän pensionsavgift −25 200 · red. jobbskatteavdrag −37 132 · red. förvärvsinkomst −1 500 · **utrymme 37 594**):

| fall | e-tjänsten | motorn | SKV 433-återimpl. | kommentar |
|---|---|---|---|---|
| lön 360 000, Stockholm 30,55 %, född 1985 | **37 594** | 37 594 (0) | 37 594 (0) | kedjan 101 426 − 25 200 − 37 132 − 1 500 exakt lika i alla tre |
| pension 240 000, 66+, Stockholm | **35 702** | 35 702 (0) | 35 702 (0) | GA 121 200 · BFI 118 800 · kommunal 36 293 · förv 591 |
| lön 720 000 + ränta 60 000 + taxeringsvärde 1 390 000, Stockholm | **120 960** | 120 960 (0) | 120 960 (0) | statlig 11 920 · fastighetsavgift 10 425 · kap 18 000 |
| lön 180 000, Göteborg 32,60 % | **11 881** | 11 880 (**−1**) | 11 881 (0) | motorns JSA = round(18 625,68) = 18 626; lagen: 18 625 (öretal bort) → förklarar hela avvikelsen |

### 11.4 Tre fullständiga härledningar (snittkommunalskatt 32,38 %)

**L5 — löntagare <66, lön 360 000** [BERÄKNAT]
1. FI = 360 000 (helt hundratal). 3,11 pbb = 184 112 < FI ≤ 7,88 pbb = 466 496 → GA = 0,77 × 59 200 − 0,10 × (360 000 − 184 112) = 45 584 − 17 588,80 = 27 995,20 → uppåt → **28 000**.
2. BFI = 360 000 − 28 000 = 332 000. Kommunal = 332 000 × 0,3238 = 107 501,60 → motorn 107 502 (SKV 433-kedjan: 107 501, öretal bortfaller). Statlig: 332 000 < 643 000 → 0.
3. Allmän pensionsavgift = 7 % × 360 000 = 25 200,00 → **25 200** (jämnt hundratal, ingen avrundningsfråga).
4. JSA: AI = 360 000 i intervallet 3,24–8,08 pbb → (1,813 × 59 200 + 0,251 × (360 000 − 191 808) − 28 000) × 0,3238 = (107 329,60 + 42 216,19 − 28 000) × 0,3238 = 121 545,79 × 0,3238 = 39 356,53 → motorn **39 357** (lag/SKV 433: 39 356, öretal bortfaller).
5. Förvärvsinkomstreduktion: BFI > 240 000 → **1 500**.
6. Utrymme = 107 502 − 25 200 − 39 357 − 1 500 = **41 445** (SKV 433-trogen: 107 501 − 25 200 − 39 356 − 1 500 = 41 445 — samma, avrundningarna tar ut varandra här). Räcker inte till 50 000 ROT; **max ROT = 41 445 kr**.

**L3 — löntagare <66, lön 240 000** [BERÄKNAT]
1. GA = 45 584 − 0,10 × (240 000 − 184 112) = 45 584 − 5 588,80 = 39 995,20 → **40 000** (= SKV 433 exempel 2).
2. BFI = 200 000. Kommunal = 200 000 × 0,3238 = **64 760**. Statlig 0.
3. Pensionsavgift = 16 800.
4. JSA = (107 329,60 + 0,251 × (240 000 − 191 808) − 40 000) × 0,3238 = (107 329,60 + 12 096,19 − 40 000) × 0,3238 = 79 425,79 × 0,3238 = 25 718,07 → **25 718**.
5. Förv = 0,75 % × (200 000 − 40 000) = **1 200** (= SKV 433 exempel).
6. Utrymme = 64 760 − 16 800 − 25 718 − 1 200 = **21 042**.

**P2 — pensionär 66+, pension 240 000** [BERÄKNAT]
1. GA ordinarie = 39 995,20 (som ovan). Särskilt belopp: 3,24 pbb = 191 808 < FI ≤ 5,00 pbb = 296 000 → 0,356 × 240 000 − 0,073 × 59 200 = 85 440 − 4 321,60 = 81 118,40. Summa 121 113,60 → uppåt → **121 200** (delvärdena avrundas inte var för sig — SKV 433 §6.2).
2. BFI = 118 800. Kommunal = 118 800 × 0,3238 = 38 467,44 → **38 467**. Statlig 0.
3. Ingen pensionsavgift (pension), inget JSA (ingen arbetsinkomst).
4. Förv = 0,75 % × (118 800 − 40 000) = 591,00 → **591**.
5. Utrymme = 38 467 − 591 = **37 876**. Med villa (+10 425) skulle motorn ge 48 301, men **pensionärsspärren** (§8.1) ger reduktion 10 425 − 4 % × 118 800 = 10 425 − 4 752 = 5 673 kr, så verkligt utrymme med villa ≈ 48 301 − 5 673 = 42 628 kr [BERÄKNAT].

## 12. Verdict per parameter

| # | Parameter | Motorn | Källa | Verdict |
|---|---|---|---|---|
| 1 | Prisbasbelopp 2026 | 59 200 | 59 200 (Skatteverket; SFS 2025:872 enl. SKV-PDF) | stämmer |
| 2 | Inkomstbasbelopp 2026 | (ej parameter) | 83 400 (Skatteverket; SFS 2025:1002) | n/a — behövs bara för att härleda 47 100 |
| 3 | FI avrundas nedåt till 100 | ja | IL 1 kap. 5 § | stämmer |
| 4 | Grundavdrag 63:3, 5 intervall | 0,423 / +20 % / 0,77 / −10 % / 0,293 vid 0,99 / 2,72 / 3,11 / 7,88 pbb | IL 63 kap. 3 § | stämmer |
| 5 | Grundavdrag avrundas uppåt till 100 | ja | IL 63 kap. 2 § | stämmer |
| 6 | Grundavdrag ≤ inkomsten | min(ga, fi) | IL 63 kap. 5 § | stämmer |
| 7 | Skatteverkets GA-belopp <66: 25 100 / 45 600 / 17 400 | reproduceras | Skatteverket | stämmer |
| 8 | Förhöjt grundavdrag 63:3a, 12 intervall (2026) | alla 12 koefficienter | IL 63 kap. 3 a § (Lag 2025:1376) + SFS-PDF | stämmer |
| 9 | Skatteverkets GA-belopp 66+: 65 800 / 179 100 / 117 500 | reproduceras | Skatteverket | stämmer |
| 10 | Ålder förhöjt GA: fyllt 66 vid årets ingång; 67 från 2027 | 66 (+kommentar 67/2027) | IL 63 kap. 3 a § (U:2027 / I:2027, Lag 2025:1374) | stämmer |
| 11 | 2026-förändringen "sänkt skatt för pensionärer" | nya koefficienter över 3,24 pbb | SFS 2025:1376 vs 2024:1131 | stämmer (motorn har 2026-lydelsen) |
| 12 | JSA <66: 0,91 / 3,24 / 8,08 pbb; 38,74 %; 1,813; 25,1 %; 3,027 | alla | IL 67 kap. 7 § (Lag 2025:1376) | stämmer |
| 13 | JSA <66 ingen avtrappning | ingen | IL 67 kap. 7 § | stämmer |
| 14 | JSA × kommunalskattesats | ja | IL 67 kap. 7 § | stämmer |
| 15 | JSA 66+: 22 % ≤ 1,75 pbb; 0,2635 pbb + 7 % ≤ 5,24; 0,6293 pbb | alla | IL 67 kap. 8 § (Lag 2024:1131) | stämmer |
| 16 | 2026-förändringen "förstärkt JSA" | 19,9 → 25,1 %, 2,776 → 3,027 pbb | SFS 2025:1376 vs 2024:1131 | stämmer (motorn har 2026-lydelsen) |
| 17 | Arbetsinkomst nedåt till 100 | rundNed100 | IL 67 kap. 6 § 4 st | stämmer |
| 18 | JSA bara mot kommunal inkomstskatt | min(jsa, kommunal) | IL 67 kap. 2 § 2 st | stämmer |
| 19 | JSA-spärr mot kommunal **efter** pensionsavgiftsreduktion | nej (mot hela kommunal) | SKV 433 ex. 2 ("9 592 kr men kan endast nyttja 6 019 kr"); 48/481 tabellrader | **avviker (kantfall låg lön + villa/statlig; motorn konservativ)** |
| 20 | Skattereduktioner: öretal faller bort | pyRound (närmaste) | IL 67 kap. 1 § 2 st; SKV 433 "avrundas nedåt till hel krona" | **avviker (≤ 1 kr per reduktion)** |
| 21 | Allmän pensionsavgift 7 % | 0,07 | Lag 1994:1744 2 § | stämmer |
| 22 | Max 47 100 | 47 100 | Skatteverket; 8,07 × 83 400 → 47 100 | stämmer |
| 23 | Inte på pension | lön enbart | Lag 1994:1744 3 § (SFB 59 kap.) | stämmer |
| 24 | Full reduktion, mot hela basen, ej mot avgiften själv | min(avgift, pool) | IL 67 kap. 4 §; Skatteverket | stämmer |
| 25 | Avgiftens avrundning: närmaste 100, 50 → nedåt | alltid nedåt | Lag 1994:1744 3 §; SKV 433 exempel 181 200 → 12 700 | **avviker (−100 kr avgift = +100 kr utrymme i 42 % av fallen)** |
| 26 | Inkomstgolv 42,3 % pbb = 25 041,60 | inget golv | Lag 1994:1744 4 §; SKV 433 | **avviker (kantfall, ≤ 1 400 kr, motorn för snål)** |
| 27 | Förvärvsinkomstreduktion 1 500 / 0,75 % / 40 000–240 000 / BFI | alla | IL 67 kap. 46–47 §§ | stämmer |
| 28 | Förvärvsinkomstreduktion bara mot kommunal, efter JSA | ja | IL 67 kap. 2 §; SKV 433 | stämmer |
| 29 | Underskott av kapital 30 % ≤ 100 000, 21 % över | ja | IL 67 kap. 10 § | stämmer |
| 30 | Statlig skatt 20 % | 0,20 | IL 65 kap. 5 § | stämmer |
| 31 | Skiktgräns 643 000 | 643 000 | Skatteverket | stämmer |
| 32 | Brytpunkt 660 400 (<66) / 760 500 (66+) | härleds | Skatteverket | stämmer |
| 33 | Statlig skatt bara om underlag ≥ 200 kr | nej | IL 65 kap. 2 §; SKV 433 | avviker (≤ 40 kr, försumbart) |
| 34 | Fastighetsavgift 0,75 %, max 10 425, takunderlag 1 390 000 | alla | Lag 2007:1398 3 §; Skatteverket PDF | stämmer |
| 35 | 15-årsbefrielse värdeår ≥ 2012 → 0 kr 2026 | 2012 | Lag 2007:1398 6 § + 2012:743; Skatteverket | stämmer (gäller t.o.m. 2027; 2013 först 2028) |
| 36 | Ägarlägenhet = småhus | (samma) | Lag 2007:1398 3 § d | stämmer |
| 37 | Bostadsrätt: ingen fastighetsavgift för medlemmen | ej modellerad | Lag 2007:1398 2–3 §§ | stämmer i sak; UI måste hindra att bostadsrättshavare anger taxeringsvärde |
| 38 | Pensionärers 4 %-spärr (65+), lägst 4 042 kr 2026 | ej modellerad | Lag 2008:826; Skatteverket PDF tabell 8; turordning steg 1 | **avviker (upp till 6 383 kr för högt utrymme)** |
| 39 | Snittkommunalskatt 32,38 % (20,69 + 11,69) | 0,3238 | SCB; Skatteverket | stämmer |
| 40 | Lägsta/högsta kommun 2026 | band 29–35 % | SCB: Österåker 28,93 / Dorotea 35,65 | **avviker (bandet för smalt: 28,93–35,65)** |
| 41 | Stockholm 30,55 / Göteborg 32,60 / Malmö 32,42 / Uppsala 32,85 | (Sthlm, Gbg används i valideringen) | SCB kommunvis | stämmer |
| 42 | Avräkningsbas = kommunal + statlig + fastighetsskatt + fastighetsavgift | pool | IL 67 kap. 2 § 2 st; Skatteverket | stämmer |
| 43 | Kyrko-, begravnings-, public service-avgift utanför basen | ja | IL 67 kap. 2 §; Skatteverket "Skattereduktioner"; SKV 433 | stämmer |
| 44 | Turordning pensionsavgift → JSA → förv → kapital → ROT/RUT → GT | ja | IL 67 kap. 2 § 1 st; Skatteverket | stämmer |
| 45 | Regional skattereduktion 1 675 kr (76 kommuner) före ROT | ej modellerad | IL 67 kap. 34 §; Skatteverket | **avviker (+1 675 kr för högt utrymme i de kommunerna)** |
| 46 | ROT 50 000 / ROT+RUT 75 000 / GT 50 000 | ja | Skatteverket | stämmer |
| 47 | Tio räkneexempel vs SKV 433-kedjan | −2…+1 kr | SKV 433 + tabell 34 | stämmer (avrundning) |
| 48 | Fyra e-tjänstfall | 0 / 0 / 0 / −1 kr | e-tjänsten 2026-09-11 + skärmdump 2026-09-16 | stämmer (avrundning) |

Räkning: 48 rader → **38 stämmer · 8 avviker (varav 3 materiella: #25, #38, #45; 2 kantfall: #19, #26; 3 marginella: #20, #33, #40) · 2 n/a**.

## 13. Allt som är [GAP]

1. **[GAP] Skatteverkets exakta fördelning av pensionsavgiftsreduktionen mellan kommunal skatt och fastighetsavgift/statlig skatt i slutskatten** — SKV 433 visar tabell-logiken (JSA spärras mot kommunal − pensionsavgift), men hur e-tjänsten/slutskatteberäkningen gör när fastighetsavgift finns i basen har jag inte kunnat verifiera (kräver e-tjänstkörning med lön < ~60 000 + taxeringsvärde). Berör enbart kantfallet i #19.
2. **[GAP] Kommunal inkomstskatt: närmaste krona eller öretal bort i slutskatten?** SKV 433 trunkerar i tabellerna; e-tjänsten visade ett exakt heltal (101 426,0). ≤ 1 kr. Skatteförfarandelagen ej öppnad.
3. **[GAP] 67 kap. 7–8 §§ ålder 2027** — den konsoliderade IL-texten visar bara 63 kap. 3 a § med I:2027-version (66 → 67). Om JSA-gränsen också flyttas till 67 år 2027 framgår inte av det hämtade materialet. Berör inte 2026.
4. **[GAP] Skatteverkets kommunlista "skattesatser-kommuner-2026.xlsx/txt"** — hämtad (txt, 103 kB, med begravnings- och kyrkoavgift per församling) men inte avstämd rad för rad mot SCB:s 290 kommuner; SCB anger att ändringar rapporterade efter 2025-12-05 kan ha publicerats i januari. Stockholm/Göteborg/Malmö/Uppsala/Österåker/Dorotea är kontrollerade mot SCB.
5. **[GAP] Var i turordningen Skatteverket lägger pensionärernas fastighetsavgiftsspärr i förhållande till grön teknik** — sidan "Skattereduktioner" listar den först av alla, så den ligger före både ROT och GT; lagtexten (2008:826 7 §) anger ingen ordning. Effekten på utrymmet är densamma.
6. **[GAP] Statlig fastighetsskatt** (obebyggd tomtmark, hus under uppförande) ingår i basen enligt 67 kap. 2 § men är inte modellerad — irrelevant för ROT-kund med färdigt hus, relevant för GT-kund som bygger nytt (solceller på nybygge).
7. **[GAP] Bilaga 3 "Exempelsamling" till SKV 433** — refereras i PDF:en ("bifogas, se bilaga 3") men ingår inte i den nedladdade filen; behövs inte eftersom hela tabell 34 reproducerats.
8. **[GAP] Investeraravdrag / kapitalförsäkringsavdrag i underskott av kapital** (30 % hela vägen, 67 kap. 10 § 2 st) — ej modellerat; ger mindre utrymme för den som har sådana avdrag.
9. **[GAP] Sjöinkomst, sjuk-/aktivitetsersättning, delårsregler (63:4, 67:9, 67:48), begränsat skattskyldiga** — dokumenterade förenklingar i motorn, ej verifierade här (utanför uppdraget).

Inga siffror i denna fil är gissade; varje värde bär [FACT src] eller [BERÄKNAT].
