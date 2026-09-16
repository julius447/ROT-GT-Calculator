# 09 · Verifiering mot Skatteverket 2026 (Agent C)

Status: KLAR 2026-09-16. 75 körningar i Skatteverkets e-tjänst, alla sparade i `logik/verifiering-skv-2026.json`.

Syfte: kontrollera att `logik/engine.js` → `skatteutrymme()` → `utrymme_rot_rut_gt` ("tillgängligt avdrag") ger samma
svar som Skatteverkets egen e-tjänst "Räkna ut rot- och rutavdrag" (https://www7.skatteverket.se/portal/rot-rut) för
inkomstår 2026, över ett bredare rutnät än de fyra körningar som gjordes 2026-09-11 (`research/01-rot-regelverk.md` §E3).
Motorn (`engine.js`, `rakna.js`) är inte ändrad.

Taggar: `[FACT src]` = hämtat från namngiven källa · `[BERÄKNAT]` = räknat av oss · `[GAP]` = saknas, gissas inte.

## 0. Kort svar

- **51 av 75 fall: motorn ligger inom ±2 kr från Skatteverket rakt av** (max 2 kr, SKV-61); ytterligare 17 (Dorotea)
  ligger inom ±1 kr så snart den regionala reduktionen räknas in. Avvikelsen ±1–2 kr beror på att Skatteverket
  **kapar öretal** på varje skatt och reduktion (skatteförfarandeförordningen 22 kap. 1 §, IL 67 kap. 1 §) medan motorn
  avrundar. Formlerna är rätt. `[FACT src: e-tjänsten + IL 67:1 + SFF 22:1]`
- **Två riktiga avvikelser, båda i riktningen "motorn visar mer utrymme än Skatteverket":**
  1. **Allmän pensionsavgift, 100 kr.** Lagen (1994:1744) 3 § och e-tjänsten rundar avgiften till *närmaste* hundratal
     (50 → nedåt); motorn rundar *nedåt*. När 7 % av lönen slutar på 51–99 kr visar motorn 100 kr för högt utrymme.
     Det slår på ca 47 % av årsinkomster angivna i 1 000-kr-steg (0 % för jämna 10 000-tal). Bevis: SKV-66/67/68/70/73.
  2. **Regional skattereduktion, 1 675 kr.** Boende i de 76 kommunerna i IL bilaga 67 (Norrland, nordvästra Svealand,
     Dalsland) får 1 675 kr mindre utrymme i e-tjänsten (IL 67 kap. 34 §). Motorn saknar den (känd förenkling, GRIND 11).
     Bevis: alla 17 Dorotea-fall, rest ±1 kr.
- Den **oberoende räknaren** (`logik/verifiering_oberoende.py`, skriven ur lagtexten) träffar Skatteverket på
  **kronan i alla 74 jämförbara fall**. Den bekräftar att öreskapning + pensionsavgiftsregeln + regional reduktion är
  hela skillnaden mellan motorn och Skatteverket.
- Två fall är avsiktliga dokumentationsfall utanför motorns modell: kapitalinkomst (SKV-63, +15 000 i tjänsten, motorn
  konservativ) och råvärdet 3 000 000 som fastighetsavgiftsunderlag (SKV-48; tjänsten kapar inte själv, motorn gör det).

## 1. Metod (utförd, inte berättad)

1. **E-tjänsten, automatiserad med Playwright** (Chromium headless, `tools/skv-etjanst-grid.mjs`). Sidan
   https://www7.skatteverket.se/portal/rot-rut laddar en webbkomponent `<skbskut-rot-rut>` i shadow DOM (därav att
   `innerText` är tomt; Playwright-locators går igenom). Ingen automationsspärr träffades: standard-headless fungerade
   direkt, det enda 401-svaret (`wapi.skatteverket.se/my.policy`) är inloggningskollen och påverkar inte tjänsten.
   Kakbannern besvarades med "Tillåt endast nödvändiga". `[FACT src: körloggar 2026-09-16]`
2. **Flödet per fall:** steg 1 "Fyll i grunduppgifter" (födelseår, kommun ur en lista med 290 kommuner, val
   Rotavdrag) → "Nästa" → steg 2 "Fyll i ditt underlag" (lön / pension / ränteutgifter / fastighetsavgiftsunderlag /
   kapitalinkomst) → "Uppskatta ditt avdrag" → steg 3 "Se beräkning": raden *"Rotavdraget får högst vara N kronor per
   person och år"* och panelen **"Så här har vi räknat"** (kommunalskatt, beskattningsbar förvärvsinkomst, varje skatt
   och reduktion, "Utrymme för rot-och rutavdrag"). Hela panelen sparas rad för rad i JSON-filen.
3. **Kommunalskatt:** tjänsten räknar själv fram satsen från kommunen (Stockholm 30,55 %, Göteborg 32,60 %, Munkedal
   34,86 %, Dorotea 35,65 %) och visar den. Exakt den satsen matas in i motorn (`ks`) och i den oberoende räknaren, så
   jämförelsen testar formeln, inte kommunlistan. Tjänsten tillåter **ingen fri sats**, så snittet 32,38 % kunde inte
   köras; Göteborg (32,60 %) fick vara "nära snittet". `[FACT src: e-tjänsten]`
4. **Motorn:** `skatteutrymme({lon_ar, pension_ar, ar_66_plus: född ≤ 1959, ks, taxeringsvarde, ranteutgifter})` ur
   `logik/engine.js`, körd i samma Node-process och stickprovad separat med `node -e` (SKV-05, -13, -23, -50, -66 gav
   identiska tal). `taxeringsvarde` matas med samma underlag som tjänsten fick; motorn kapar själv vid 10 425.
5. **Oberoende räknare:** `logik/verifiering_oberoende.py` skriven direkt ur IL 1:5, 63:2–3 a, 65:3/5/7, 67:1–2, 6–8,
   10, 34, 46–47, lagen (1994:1744) om allmän pensionsavgift 2–4 §§, SFF 22:1 och "Belopp och procent 2026", med
   Decimal-aritmetik och lagens avrundningar (nedåt/uppåt till hundratal, öreskapning, "närmaste hundratal, 50 nedåt").
   Källtexterna hämtades 2026-09-16 (Riksdagens konsoliderade IL, SFS 2025:1376 som pdf, lagen.nu för SFF). Den läser
   JSON-filen, räknar varje fall och skriver tillbaka fältet `oberoende`.
6. **Skärmdumpar** (steg 3 med "Så här har vi räknat" uppfälld): `research/underlag/skv-etjanst/` — SKV-05, SKV-13,
   SKV-23, SKV-50, SKV-66 (fem stycken; alla 75 finns i sessionens scratchpad).

## 2. Antal körningar

**75 körningar, alla lyckade** (23 pensionsfall fick köras om efter ett locator-fel i första passet; inget fall saknas).

| Grupp | Fall | Antal |
|---|---|---|
| Löntagare född 1985, Stockholm | lön 120/180/240/300/360/420/480/600/720/900 tkr | 10 |
| Löntagare född 1985, Dorotea (35,65 %, regional reduktion) | samma tio | 10 |
| Pensionär född 1955, Stockholm | pension 150/180/240/300/360/480 tkr | 6 |
| Pensionär född 1955, Dorotea | samma sex | 6 |
| Göteborg (32,60 %, nära snittet) | lön 180/360/600 tkr, pension 240 tkr | 4 |
| Munkedal (34,86 %, hög sats utan regional reduktion) | lön 240/480 tkr, pension 240 tkr | 3 |
| Ränteutgifter 50 000 / 100 000 | lön 360 (×2), 720, 240 tkr; pension 240 tkr | 5 |
| Fastighetsavgift (villa, taxeringsvärde 3 000 000 → underlag 1 390 000) | lön 360/600 tkr, pension 240 tkr; råvärde 3 000 000; underlag 800 000 | 5 |
| Kombinationer ränta + fastighetsavgift | lön 480 tkr; pension 300 tkr (Stockholm, Dorotea) | 3 |
| Blandade inkomster, åldersgräns, ytterligheter | lön+pension (1955, 1985), född 1959/1960, pension 100/60 tkr, lön 60/1 200 tkr, 66+ med lön 100/400/900 tkr | 11 |
| Dokumentationsfall utanför motorn | kapitalinkomst 50 000; pensionär med villa (4 %-spärren) | 2 |
| Ojämna inkomster (pensionsavgiftens avrundning) | lön 348 000 / 378 000 / 124 000 / 355 000 / 352 200 / 333 333; 66+ lön 348 000 | 7 |
| Avräkningsordning (låg lön + villa) | 66+ lön 348 000 + villa; lön 80 000 + villa; lön 40 000 + villa | 3 |

## 3. Tabell: fall | Skatteverket | motorn | oberoende | diff

Belopp i kr = "Utrymme för rot-och rutavdrag" (före 50 000-taket). `diff` = Skatteverket − motorn; **negativ diff =
motorn visar mer utrymme än Skatteverket.** Alla Skatteverket-tal `[FACT src: e-tjänsten 2026-09-16]`, motorn och
oberoende `[BERÄKNAT]`.

| fall | Skatteverket | motorn | oberoende | diff | förklaring |
|---|---|---|---|---|---|
| SKV-01 · f. 1985 · Stockholm (30.55 %) · lön 120 000 | 3 657 | 3 656 | 3 657 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-02 · f. 1985 · Stockholm (30.55 %) · lön 180 000 | 10 297 | 10 297 | 10 297 | +0 |  |
| SKV-03 · f. 1985 · Stockholm (30.55 %) · lön 240 000 | 18 836 | 18 835 | 18 836 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-04 · f. 1985 · Stockholm (30.55 %) · lön 300 000 | 28 065 | 28 065 | 28 065 | +0 |  |
| SKV-05 · f. 1985 · Stockholm (30.55 %) · lön 360 000 | 37 594 | 37 594 | 37 594 | +0 |  |
| SKV-06 · f. 1985 · Stockholm (30.55 %) · lön 420 000 | 47 123 | 47 123 | 47 123 | +0 |  |
| SKV-07 · f. 1985 · Stockholm (30.55 %) · lön 480 000 | 56 795 | 56 795 | 56 795 | +0 |  |
| SKV-08 · f. 1985 · Stockholm (30.55 %) · lön 600 000 | 85 055 | 85 055 | 85 055 | +0 |  |
| SKV-09 · f. 1985 · Stockholm (30.55 %) · lön 720 000 | 128 535 | 128 535 | 128 535 | +0 |  |
| SKV-10 · f. 1985 · Stockholm (30.55 %) · lön 900 000 | 219 525 | 219 525 | 219 525 | +0 |  |
| SKV-11 · f. 1985 · Dorotea (35.65 %) · lön 120 000 | 4 047 | 5 722 | 4 047 | -1675 | regional skattereduktion 1 675 kr saknas i motorn |
| SKV-12 · f. 1985 · Dorotea (35.65 %) · lön 180 000 | 12 562 | 14 238 | 12 562 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-13 · f. 1985 · Dorotea (35.65 %) · lön 240 000 | 23 310 | 24 985 | 23 310 | -1675 | regional skattereduktion 1 675 kr saknas i motorn |
| SKV-14 · f. 1985 · Dorotea (35.65 %) · lön 300 000 | 34 831 | 36 506 | 34 831 | -1675 | regional skattereduktion 1 675 kr saknas i motorn |
| SKV-15 · f. 1985 · Dorotea (35.65 %) · lön 360 000 | 46 652 | 48 327 | 46 652 | -1675 | regional skattereduktion 1 675 kr saknas i motorn |
| SKV-16 · f. 1985 · Dorotea (35.65 %) · lön 420 000 | 58 474 | 60 148 | 58 474 | -1674 | regional skattereduktion 1 675 kr saknas i motorn; rest +1 = öreskapning |
| SKV-17 · f. 1985 · Dorotea (35.65 %) · lön 480 000 | 70 460 | 72 136 | 70 460 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-18 · f. 1985 · Dorotea (35.65 %) · lön 600 000 | 104 840 | 106 516 | 104 840 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-19 · f. 1985 · Dorotea (35.65 %) · lön 720 000 | 154 440 | 156 116 | 154 440 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-20 · f. 1985 · Dorotea (35.65 %) · lön 900 000 | 254 610 | 256 286 | 254 610 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-21 · f. 1955 · Stockholm (30.55 %) · pension 150 000 | 17 495 | 17 494 | 17 495 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-22 · f. 1955 · Stockholm (30.55 %) · pension 180 000 | 22 888 | 22 889 | 22 888 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-23 · f. 1955 · Stockholm (30.55 %) · pension 240 000 | 35 702 | 35 702 | 35 702 | +0 |  |
| SKV-24 · f. 1955 · Stockholm (30.55 %) · pension 300 000 | 49 023 | 49 023 | 49 023 | +0 |  |
| SKV-25 · f. 1955 · Stockholm (30.55 %) · pension 360 000 | 62 672 | 62 671 | 62 672 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-26 · f. 1955 · Stockholm (30.55 %) · pension 480 000 | 90 424 | 90 425 | 90 424 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-27 · f. 1955 · Dorotea (35.65 %) · pension 150 000 | 18 763 | 20 437 | 18 763 | -1674 | regional skattereduktion 1 675 kr saknas i motorn; rest +1 = öreskapning |
| SKV-28 · f. 1955 · Dorotea (35.65 %) · pension 180 000 | 25 079 | 26 755 | 25 079 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-29 · f. 1955 · Dorotea (35.65 %) · pension 240 000 | 40 086 | 41 761 | 40 086 | -1675 | regional skattereduktion 1 675 kr saknas i motorn |
| SKV-30 · f. 1955 · Dorotea (35.65 %) · pension 300 000 | 55 686 | 57 362 | 55 686 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-31 · f. 1955 · Dorotea (35.65 %) · pension 360 000 | 71 671 | 73 345 | 71 671 | -1674 | regional skattereduktion 1 675 kr saknas i motorn; rest +1 = öreskapning |
| SKV-32 · f. 1955 · Dorotea (35.65 %) · pension 480 000 | 104 095 | 105 771 | 104 095 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-33 · f. 1985 · Göteborg (32.60 %) · lön 180 000 | 11 881 | 11 880 | 11 881 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-34 · f. 1985 · Göteborg (32.60 %) · lön 360 000 | 41 909 | 41 908 | 41 909 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-35 · f. 1985 · Göteborg (32.60 %) · lön 600 000 | 93 681 | 93 682 | 93 681 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-36 · f. 1955 · Göteborg (32.60 %) · pension 240 000 | 38 137 | 38 138 | 38 137 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-37 · f. 1985 · Munkedal (34.86 %) · lön 240 000 | 24 033 | 24 032 | 24 033 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-38 · f. 1985 · Munkedal (34.86 %) · lön 480 000 | 69 760 | 69 759 | 69 760 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-39 · f. 1955 · Munkedal (34.86 %) · pension 240 000 | 40 822 | 40 823 | 40 822 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-40 · f. 1985 · Stockholm (30.55 %) · lön 360 000, ränta 50 000 | 22 594 | 22 594 | 22 594 | +0 |  |
| SKV-41 · f. 1985 · Stockholm (30.55 %) · lön 360 000, ränta 100 000 | 7 594 | 7 594 | 7 594 | +0 |  |
| SKV-42 · f. 1985 · Stockholm (30.55 %) · lön 720 000, ränta 100 000 | 98 535 | 98 535 | 98 535 | +0 |  |
| SKV-43 · f. 1985 · Stockholm (30.55 %) · lön 240 000, ränta 100 000 | 0 | 0 | 0 | +0 |  |
| SKV-44 · f. 1955 · Stockholm (30.55 %) · pension 240 000, ränta 50 000 | 20 702 | 20 702 | 20 702 | +0 |  |
| SKV-45 · f. 1985 · Stockholm (30.55 %) · lön 360 000, fa-underlag 1 390 000 | 48 019 | 48 019 | 48 019 | +0 |  |
| SKV-46 · f. 1985 · Stockholm (30.55 %) · lön 600 000, fa-underlag 1 390 000 | 95 480 | 95 480 | 95 480 | +0 |  |
| SKV-47 · f. 1955 · Stockholm (30.55 %) · pension 240 000, fa-underlag 1 390 000 | 46 127 | 46 127 | 46 127 | +0 |  |
| SKV-48 · f. 1985 · Stockholm (30.55 %) · lön 360 000, fa-underlag 3 000 000 | 60 094 | 48 019 | 48 019 | +12075 | råvärde 3 000 000 inmatat: tjänsten kapar inte (22 500 kr avgift), motorn kapar vid 10 425 |
| SKV-49 · f. 1985 · Stockholm (30.55 %) · lön 360 000, fa-underlag 800 000 | 43 594 | 43 594 | 43 594 | +0 |  |
| SKV-50 · f. 1985 · Stockholm (30.55 %) · lön 480 000, ränta 100 000, fa-underlag 1 390 000 | 37 220 | 37 220 | 37 220 | +0 |  |
| SKV-51 · f. 1955 · Stockholm (30.55 %) · pension 300 000, ränta 50 000, fa-underlag 1 390 000 | 44 448 | 44 448 | 44 448 | +0 |  |
| SKV-52 · f. 1955 · Dorotea (35.65 %) · pension 300 000, ränta 50 000, fa-underlag 1 390 000 | 51 111 | 52 787 | 51 111 | -1676 | regional skattereduktion 1 675 kr saknas i motorn; rest -1 = öreskapning |
| SKV-53 · f. 1955 · Stockholm (30.55 %) · lön 200 000, pension 200 000 | 28 132 | 28 131 | 28 132 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-54 · f. 1985 · Stockholm (30.55 %) · lön 240 000, pension 60 000 | 36 866 | 36 865 | 36 866 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-55 · f. 1959 · Stockholm (30.55 %) · pension 240 000 | 35 702 | 35 702 | 35 702 | +0 |  |
| SKV-56 · f. 1960 · Stockholm (30.55 %) · pension 240 000 | 59 900 | 59 900 | 59 900 | +0 |  |
| SKV-57 · f. 1955 · Stockholm (30.55 %) · pension 100 000 | 7 759 | 7 760 | 7 759 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-58 · f. 1985 · Stockholm (30.55 %) · lön 60 000 | 0 | 0 | 0 | +0 |  |
| SKV-59 · f. 1985 · Stockholm (30.55 %) · lön 1 200 000 | 371 175 | 371 175 | 371 175 | +0 |  |
| SKV-60 · f. 1955 · Stockholm (30.55 %) · lön 100 000 | 0 | 0 | 0 | +0 |  |
| SKV-61 · f. 1955 · Stockholm (30.55 %) · lön 400 000 | 6 477 | 6 475 | 6 477 | +2 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-62 · f. 1955 · Stockholm (30.55 %) · lön 900 000 | 181 099 | 181 099 | 181 099 | +0 |  |
| SKV-63 · f. 1985 · Stockholm (30.55 %) · lön 360 000, kapitalink. 50 000 | 52 594 | 37 594 | 52 594 | +15000 | kapitalinkomst: 30 % statlig kapitalskatt i tjänstens pool, utelämnad i motorn (konservativt) |
| SKV-64 · f. 1955 · Stockholm (30.55 %) · pension 150 000, fa-underlag 1 390 000 | 27 920 | 27 919 | 27 920 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-65 · f. 1955 · Stockholm (30.55 %) · pension 60 000 | 0 | 0 | 0 | +0 |  |
| SKV-66 · f. 1985 · Stockholm (30.55 %) · lön 348 000 | 35 648 | 35 748 | 35 648 | -100 | pensionsavgift: lagen/tjänsten närmaste 100, motorn nedåt |
| SKV-67 · f. 1985 · Stockholm (30.55 %) · lön 378 000 | 40 412 | 40 513 | 40 412 | -101 | pensionsavgift: lagen/tjänsten närmaste 100, motorn nedåt (-1 öreskapning) |
| SKV-68 · f. 1985 · Stockholm (30.55 %) · lön 124 000 | 4 081 | 4 181 | 4 081 | -100 | pensionsavgift: lagen/tjänsten närmaste 100, motorn nedåt |
| SKV-69 · f. 1985 · Stockholm (30.55 %) · lön 355 000 | 36 849 | 36 850 | 36 849 | -1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-70 · f. 1985 · Stockholm (30.55 %) · lön 352 200 | 36 309 | 36 409 | 36 309 | -100 | pensionsavgift: lagen/tjänsten närmaste 100, motorn nedåt |
| SKV-71 · f. 1985 · Stockholm (30.55 %) · lön 333 333 | 33 384 | 33 384 | 33 384 | +0 |  |
| SKV-72 · f. 1955 · Stockholm (30.55 %) · lön 348 000 | 0 | 0 | 0 | +0 |  |
| SKV-73 · f. 1955 · Stockholm (30.55 %) · lön 348 000, fa-underlag 1 390 000 | 8 701 | 8 800 | 8 701 | -99 | pensionsavgift: lagen/tjänsten närmaste 100, motorn nedåt (+1 öreskapning) |
| SKV-74 · f. 1985 · Stockholm (30.55 %) · lön 80 000, fa-underlag 1 390 000 | 9 636 | 9 635 | 9 636 | +1 | öreskapning (SFF 22:1 / IL 67:1) mot avrundning |
| SKV-75 · f. 1985 · Stockholm (30.55 %) · lön 40 000, fa-underlag 1 390 000 | 7 625 | 7 625 | 7 625 | +0 |  |

## 4. Största avvikelse

| Mått | Värde | Fall |
|---|---|---|
| Största \|diff\| i de 68 fallen utan de tre kända orsakerna (51 rena + 17 Dorotea med regional reduktion tillagd) | **2 kr** | SKV-61 (66+, lön 400 000: jobbskatteavdrag 37 254,56 → 37 254 och förvärvsinkomstred. 1 497,75 → 1 497 kapas i tjänsten, motorn avrundar båda uppåt) |
| Pensionsavgiftens avrundning | **−100 kr** (−99 … −101 med öreskapning) | SKV-66, -67, -68, -70, -73 |
| Regional skattereduktion | **−1 675 kr** (rest ±1) | alla 17 Dorotea-fall |
| Dokumentationsfall utanför modellen | +15 000 (kapitalinkomst 50 000) · +12 075 (råvärde 3 000 000 som underlag) | SKV-63 · SKV-48 |
| Oberoende räknare mot Skatteverket | **0 kr** i 74 av 74 jämförbara fall | (SKV-48 undantaget: räknaren kapar underlaget som hjälptexten säger) |

Fördelning av diff i de 75 fallen `[BERÄKNAT]`: 31 × 0 · 12 × +1 · 7 × −1 · 1 × +2 · 5 × ≈−100 · 17 × ≈−1 675 · 1 × +15 000 · 1 × +12 075.

## 5. Klartext-domslut

**Ja, motorn återger Skatteverkets formel** — grundavdrag (inkl. det särskilda beloppet för 66+ enligt Lag 2025:1376),
jobbskatteavdrag (7 § och 8 §), förvärvsinkomstreduktionen, statlig skatt, fastighetsavgift, underskott av kapital och
avräkningsordningen (jobbskatteavdrag och förvärvsinkomstreduktion bara mot kommunalskatt; pensionsavgiftsreduktionen mot
hela poolen) stämmer i alla 75 fall. Åldersgränsen "fyllt 66 vid årets ingång" = född ≤ 1959 bekräftades med SKV-55/56
(född 1959: 35 702, född 1960: 59 900 — samma som motorn). Ingen avtrappning av 66+-jobbskatteavdraget vid hög lön
finns i tjänsten (SKV-62, lön 900 000: 37 254 = 0,6293 pbb), vilket stämmer med 67 kap. 8 § i gällande lydelse
(Lag 2024:1131) och med motorn.

**Men "inom ±1 kr över rutnätet" håller inte fullt ut.** Tre saker skiljer:

1. **Öreskapning (±1–2 kr).** Skatteverket anger skatter och skattereduktioner "i hela krontal så att öretal faller
   bort" (SFF 22 kap. 1 §; IL 67 kap. 1 § andra stycket, Lag 2025:1370). Motorn använder `pyRound` (avrunda, halva
   till jämnt) på kommunalskatt, statlig skatt, jobbskatteavdrag, förvärvsinkomst- och kapitalreduktion. Skillnaden
   är ±1 kr per led, i praktiken max 2 kr, åt båda hållen. Ofarligt, men det är därför "±1 kr" i §E5 är för snävt.
2. **Allmän pensionsavgift (100 kr, motorn för generös).** Lagen (1994:1744) 3 §: *"Avgiften avrundas till närmast
   hela hundratal kronor. Avgift som slutar på 50 kronor avrundas till närmast lägre hundratal kronor."* Motorn gör
   `rundNed100(0.07 × lön)`. För lön 348 000 (29 000 kr/mån) ger lagen 24 400, motorn 24 300 → utrymmet blir 100 kr
   för högt (SKV-66: 35 648 mot 35 748). Rutnätets jämna inkomster dolde detta (7 % av 60 000-multiplar är jämna
   hundratal); först de ojämna fallen avslöjade det. Träffar ca hälften av "verkliga" löner. `[FACT src: lag 1994:1744
   3 §, SKV-66/67/68/70/73]`
3. **Regional skattereduktion 1 675 kr (motorn för generös i 74 kommuner).** IL 67 kap. 34 § + bilaga 67. Tjänsten
   drar den före rot/rut (67 kap. 2 §). Motorn kan inte veta kommunen (den frågar efter skattesats), så den kan bara
   lösa detta med en fråga ("bor du i …") eller en hedge. Dokumenterad förenkling (GRIND 11), men nu mätt: exakt 1 675.

Utöver detta är motorn **konservativ** där den förenklar: kapitalinkomster (30 % statlig kapitalskatt går in i poolen,
SKV-63) och sjukpenning/a-kassa (ingen pensionsavgift, inget jobbskatteavdrag) ger *mer* utrymme hos Skatteverket.

**Rekommendation (rör inte engine.js i denna körning; ägarbeslut):**
- Byt `rundNed100(0.07 × lön)` mot "närmaste hundratal, 50 nedåt" (en rad). Då försvinner 100-kronorsfelet.
- Byt `pyRound` mot kapning (`Math.floor`) på skatter och reduktioner om kronexakthet mot tjänsten önskas
  (rätt enligt SFF 22:1 / IL 67:1). Med båda ändringarna skulle motorn träffa tjänsten på kronan i 56 av 75 fall
  (alla utom de 17 Dorotea-fallen, SKV-48 och SKV-63); med regional reduktion också 73 av 75 — det är exakt vad den
  oberoende räknaren visar (0 kr i 74 av 74 jämförbara fall).
- Regional reduktion: lägg till en valfri fråga eller en rad i "Så har vi räknat" ("bor du i Norrlands inland m.fl.
  kommuner: −1 675 kr").
- Uppdatera felbandet i `01-rot-regelverk.md` §E5 från "±1 kr" till "±2 kr (öreskapning) + de två punkterna ovan".

## 6. Vad e-tjänsten själv säger att den räknar med och inte (kalkylatorn ärver gränserna)

Ur "Vem kan använda tjänsten?" och hjälptexterna, hämtade 2026-09-16 `[FACT src: e-tjänsten]`:

- **Kan inte använda tjänsten:** näringsidkare med enskild verksamhet eller handelsbolagsdelägare; den som har sjuk-
  eller aktivitetsersättning; den som deklarerar i ett annat land än Sverige; beräkning för en avliden person;
  **beräkning av skattereduktion för installation av grön teknik**; den som har tjänsteresor, övriga utgifter eller
  överskott vid uthyrning av privatbostad. Hänvisning: "Räkna ut din skatt", där man fyller i önskat rot-/rutavdrag.
- **Räknar med:** lön/förmåner (inkl. sjöinkomst), sjukpenning/a-kassa m.m., pensioner m.m., avdrag för resor
  (över 15 000 kr) och dubbel bosättning, kapitalinkomster (ränta/utdelning/schablonintäkt, aktievinst,
  bostadsvinst), avdrag under kapital (ränteutgifter, aktie- och bostadsförlust), underlag för fastighetsavgift
  (småhus/ägarlägenhet 0,75 %) och fastighetsskatt (tomt/byggnad under uppförande 1 %). Kommunalskatten sätts av
  kommunen den 1 november 2025. Regional skattereduktion tillämpas automatiskt utifrån kommunen.
- **Fastighetsavgiften:** "Fyll i underlaget för din fastighetsavgift. Tänk på att underlaget inte alltid är
  taxeringsvärdet eftersom fastighetsavgiften har ett takbelopp. … För inkomståret 2026 är underlaget för takbeloppet
  1 390 000 kronor." Tjänsten kapar alltså inte själv (SKV-48: 3 000 000 → 22 500 kr avgift). Motorn kapar vid 10 425,
  vilket är det juridiskt rätta.
- **Räknar inte med (och det gör inte motorn heller):** pensionärers begränsningsregel för fastighetsavgiften
  (max 4 % av inkomsten) — SKV-64 visar full avgift 10 425 vid pension 150 000; redan använt rot/rut under året
  ("Glöm inte att räkna bort de rot- eller rutavdrag som du redan använt under året!"); grön teknik.
- **Resultatet är preliminärt:** "Resultatet är beräknat utifrån de uppgifter du har fyllt i och är endast
  preliminärt." Kalkylatorns hedge ("kan", aldrig "får") står sig.
- **Rotavdraget får högst vara** = min(utrymme, 50 000) per person och år; utrymmet visas ändå i "Så här har vi
  räknat" (t.ex. SKV-26: utrymme 90 424, rotavdrag högst 50 000).

Mindre iakttagelser: tjänstens kommunlista (290 kommuner) matchar det öppna API:t
`portal-wapi/open/skatteberakning/v1/api/skattesats/2026/kommuner` (kommundel + begravningsavgift, utan regiondel);
regiondelen läggs på i appen. Stockholms kommundel är 18,22 % där, totalen 30,55 % i tjänsten. `[FACT src: API + e-tjänst]`
Sveriges lägsta/högsta totala sats 2026 är fortfarande `[GAP]` (kräver regionsatserna; inte hämtat).

## 7. Filer

- `logik/verifiering-skv-2026.json` — 75 körningar: indata, tjänstens svar rad för rad, motorns mellanled, oberoende
  räknarens mellanled, diffar; `_meta.sammanfattning`.
- `logik/verifiering_oberoende.py` — oberoende räknare ur lagtexten; `python3 logik/verifiering_oberoende.py` skriver
  jämförelsetabellen (`--skriv` uppdaterar JSON).
- `tools/skv-etjanst-grid.mjs` — Playwright-körningen mot e-tjänsten (`node tools/skv-etjanst-grid.mjs --only=SKV-05`).
- `research/underlag/skv-etjanst/` — skärmdumpar SKV-05, SKV-13, SKV-23, SKV-50, SKV-66.
- Källor som hämtades: IL konsoliderad (data.riksdagen.se/dokument/sfs-1999-1229), SFS 2025:1376 (pdf,
  svenskforfattningssamling.se), lagen (1994:1744) om allmän pensionsavgift (data.riksdagen.se/dokument/sfs-1994-1744),
  SFF 2011:1261 22 kap. 1 § (lagen.nu), Skatteverket "Belopp och procent inkomstår 2026".
