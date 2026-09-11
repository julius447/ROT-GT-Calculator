# 04 UX-flöde: ROT-kollen och Grön teknik-kollen (interaktionsdesign)

Skrivet av UX-agenten 2026-09-11. Status: utkast till design-agenterna, ROT-agenten och GT-agenten.
Källorna står i `research/underlag/ux-kallor.md`. Grundning: `research/00-grundning.md`.

**Vad den här filen bestämmer:** frågorna, ordningen, reglagen, tillstånden, hur beskedet visas, hur
verktyget sitter i artikeln, delbar länk, mobil, tillgänglighet och mätning.
**Vad den inte bestämmer:** färger, pixlar, typografi (design-agenterna) och juridiska villkor
(ROT-agenten och GT-agenten). Där ett villkor behövs står `[→ ROT-agent]` eller `[→ GT-agent]`.
Där fakta saknas står `[GAP]`. Alla UI-strängar nedan är **utkast**, `ampy-rost` har sista ordet.

Konventioner i UI-strängar: du-tilltal, "kan" på allt som Skatteverket avgör, inga tankstreck,
inga mittpunkter, inga gradient-texter, procent skrivs "30 %", belopp "50 000 kr".

---

## 0. Bevis på grundning (vad som faktiskt öppnades)

| Källa | Vad jag tog med mig |
|---|---|
| `00-grundning.md` | Uppdraget, sökdatan (pensionär, bostadsrätt, fritidshus, hyresrätt, nybyggt hus), vitrummet: ingen av 19 räknare kombinerar berättigad + räcker skatten + belopp |
| `ampy-wireframe-ux` (SKILL, wireframes, archetypes) | Det invarianta skelettet, två layoutfamiljer, "Osäker" som fullvärdigt svar, grön cell säljer inte |
| `ampy-webb-playbook` (SKILL + instrumentation.md) | Friktion per tratt-steg, consent-gatad dataLayer, buckets, experiment_id |
| `ampy-foretagsdata` §7, §8.1 till 8.3, §11.1 till 11.4 | Köparen jagar haken, mer optimism = mer säljare, värme där sanningen är god, kvalitetsribban |
| `rot-gt-cro/.../riktning-C.md` + `granskning-C.md` | Sex lägen i stället för fyra (laddbox är inte solcellsgrindad), komplett matris med prioritet, EN primär CTA efter besked, hyresrätt pekar på hyresvärden |
| `elcentral-kollen` (index, preview, data-JSON, JS) | Kompakt `?q=`-tillståndsvektor, trunkerad URL ger aldrig fejkat besked, blockläge äger aldrig URL:en, sticky mobil-CTA speglar kortets CTA via IntersectionObserver, `ec_surface` på alla events. **Observation:** verktyget är i praktiken stegat (start, sju frågor en per vy, besked) med history per steg |
| `ampy-behorighetskollen` (data-JSON, hero.html) | Ett val ger besked, källrad under beskedet, `?jobb=`-URL:er som delnings- och SEO-hävstång, disclaimer "Vägledning, inte juridisk rådgivning" |
| `ampy.se/rot-avdrag-2026/` och `/gron-teknik-2026/` (live 2026-09-11) | Mallen: header, bild, H1, två ingressstycken, Snabbfakta-ruta, H2-kedja. Ingen sidebar, ingen sticky |
| Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (öppnad, steg 1 till 2 observerade) | Flerstegs-formulär: födelseår, kommun, avdragstyp, sedan inkomstrader (lön, sjukpenning, pension). Exkluderar grön teknik uttryckligen. Det är den tunga vägen, vår är den lätta |

---

## 1. Register och arketyp

### 1.1 Register
Ekonomi- och skattesida: **allvarligt och noggrant register**, men varmt där sanningen är god
("Goda nyheter" på ett bekräftat ja är rätt, "Grattis!" är fel). Ett nej-besked är lugnt och säljer inte.

### 1.2 Arketypen, ärligt
Det här är en **hybrid**, inte en ren arketyp:

| Frågan kunden ställer | Arketyp enligt doktrinen | Vad som är hero |
|---|---|---|
| "Är jag berättigad?" | B, diagnostik (besked, ingen siffra) | ett besked med synliga villkor |
| "Hur mycket blir det?" | Kostnadsuppskattning (ett ärligt intervall, ingen kurva) | ett belopp med sin bas synlig |

Beslut: **beskedet är hero, beloppet är stödnivån direkt under.** Ingen återbetalningskurva finns
(det finns inget "över tid" att rita). Beloppet visas som punkt när underlaget är känt, annars som
intervall eller tak (§3.6). Det följer kostnadsuppskattningens regel: aldrig en fejkprecis siffra.

### 1.3 Var "ingen wizard" skaver, och hur referenserna faktiskt gör
Doktrinen säger en skärm, ingen wizard, live-omräkning. Diagnostikfamiljens levande referens
(Elcentral-kollen) är i praktiken ett stegat flöde: start, sju frågor en per vy, besked sist, med
history per steg. Det fungerar där för att svaren är många (sju) och beskedet inte går att räkna
"halvvägs". Här är det annorlunda:

- bara **tre till fyra grindfrågor** avgör beskedet, resten är pengar,
- beloppet ska **räknas om live** när kunden drar i beloppet (kärnan i kalkylatorfamiljen),
- säljlänken kräver att kunden kan **bekräfta tre saker på tio sekunder**, inte klicka "Nästa" sju gånger.

Ett stegat flöde skulle döda live-omräkningen och göra säljlänken till ett formulär. Därför:

### 1.4 Lösningen: alla frågor på en yta, beskedet finns från första sekunden och säger vad det antar
1. **Alla frågor synliga på en yta** (max sex synliga, resten under "Fler detaljer").
2. **Förvalda svar på varje fråga**, så ett komplett besked och ett belopp renderas på load.
3. **Beskedet ljuger aldrig om vad det antar.** Varje grindfråga har två tillstånd: *antagen*
   (förvalet är orört) och *bekräftad* (kunden har tryckt). Rubriken följer regeln:
   - 0 antagna grindsvar: "Ja, du kan använda ROT-avdraget"
   - 1 antaget eller "vet inte": "Ja, om huset är äldre än fem år" (villkoret namnges)
   - 2 eller fler antagna: "Ja, om det här stämmer:" följt av villkorslistan
   På load står alltså "Ja, om det här stämmer:" med tre hålringar under, aldrig ett grönt "Ja"
   till en okänd besökare. Det är så vi håller "instant value" utan att skapa ett falskt ja.
4. **Villkorslistan i beskedet är samma tre till fyra frågor** som i frågepanelen, i samma ordning.
   Ett tryck på en rad i listan flyttar fokus till frågan (desktop: scrollar inte, frågan är redan
   synlig; mobil: scrollar till frågan). Ingen dubbel sanning, en datamodell.

### 1.5 Layoutfamilj: kalkylatorns tvåpanel, med ett diagnostik-hero
Vald familj: **(a) kalkylator-tvåpanel** (vit frågepanel, mörk beskedspanel). Inte (b) rail + stage, av tre skäl:
- artikeln äger redan H1, ingress och förtroendet; en rail med egen H1 och trust-bullets skulle dubblera dem,
- beskedet och frågorna måste stå bredvid varandra för live-omräkning,
- säljlänken öppnas fristående på mobil och där blir familjerna ändå identiska (staplade).

Desktop, struktur (inga färger, inga mått utöver proportioner):

```
┌────────────────────────────── verktyget, i artikelns fulla blockbredd ──────────────────────────────┐
│ H2 (server-renderad): "Gäller ROT-avdraget dig? Fyra frågor, sedan ser du beloppet."  [utkast]      │
│ lead: "Beskedet uppdateras medan du svarar. Inget mejl, ingen inloggning."            [utkast]      │
│ ┌──── VÄNSTER: vit frågepanel (~52 %) ───────────┐ ┌──── HÖGER: mörk beskedspanel (~48 %, sticky) ──┐ │
│ │ [GT: Läge   Laddbox | Solcellsbatteri | Solceller]│ │ eyebrow   "Ditt besked, ROT-avdraget 2026"      │ │
│ │ 1 Hur bor du där jobbet ska göras?                │ │ BESKED    "Ja, om det här stämmer:"              │ │
│ │   [Villa eller radhus] [Bostadsrätt] [Fritidshus] │ │ BELOPP    "ca 9 000 kr"                           │ │
│ │   [Hyresrätt] [Föräldrarnas bostad]               │ │ basrad    "30 % av arbetet på ett jobb för 30 000"│ │
│ │ 2 Är bostaden äldre än fem år? [Ja][Nej][Vet inte]│ │ ram       en ärlig rad (§4.2)                     │ │
│ │ 3 Vad kostar jobbet ungefär?  [ 30 000 ] kr − +   │ │ VILLKOR   ○ Du äger bostaden (antaget)            │ │
│ │   [15 000] [30 000] [60 000] [Annat belopp]       │ │           ○ Äldre än fem år (antaget)             │ │
│ │ 4 Betalar du inkomstskatt?                        │ │           ○ Skatt att räkna av mot (antaget)      │ │
│ │   [Ja, på lön][Ja, på pension][Låg eller ingen]   │ │           ✓ F-skatt och e-betalning: det sköter vi│ │
│ │   [Vet inte]                                      │ │ VAD HÄNDER NU  1  2  3                            │ │
│ │ ▸ Fler detaljer (ägare, redan använt, arbetsandel,│ │ [ EN CTA: Få ett pris med avdraget inräknat ]     │ │
│ │   byggår, under 18)                               │ │ Hellre prata? 010-265 79 79 (textlänk)            │ │
│ └───────────────────────────────────────────────────┘ │ Kopiera länk   Skriv ut                           │ │
│                                                       │ ▸ Så har vi räknat                                │ │
│                                                       └───────────────────────────────────────────────────┘ │
│ "Vägledande besked utifrån dina svar. Skatteverket avgör. Exakt belopp står på offerten."   [utkast]     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Beskedspanelen är `position: sticky` på desktop (≥ 992 px) så beskedet står kvar när frågepanelen
är längre än viewporten (händer när "Fler detaljer" är öppen). Mobil: §8.

### 1.6 Det invarianta skelettet, punkt för punkt

| # | Invariant | Hur verktyget uppfyller den |
|---|---|---|
| 1 | Värde före ask | Besked + belopp renderas på load med förval, ingen inmatning krävs. Ingen e-postvägg, inget formulär |
| 2 | Hero, stöd, referens | Hero = beskedsrubriken. Stöd = beloppet + villkorslistan. Referens = "Så har vi räknat" |
| 3 | Begränsade inputs | Chips (radio), toggles, stepper. Ett enda skrivfält (belopp) med numeriskt tangentbord, stepper och förvalsknappar, klampat |
| 4 | En skärm | Alla frågor på en yta. "Fler detaljer" och "Så har vi räknat" är progressive disclosure, inte steg |
| 5 | Live-omräkning | Varje ändring räknar om besked, belopp, villkorslista och CTA synkront, ingen spinner |
| 6 | Progressive disclosure | Ägare, redan använt, arbetsandel, byggår, under 18, skattebelopp ligger hopfällda |
| 7 | EN CTA | Exakt en primär knapp per beskedsklass (§5). Sekundär tel är en textlänk |
| 8 | Formuläret efter resultatet | Det finns inget formulär i verktyget (ägarkrav). CTA:n leder till `/offert/` |
| 9 | Ärligt utfall | Intervall när arbetsandelen är antagen, punkt när den är känd, tak när belopp saknas. "Så har vi räknat" visar basen, satsen, taket, antagandena |
| 10 | Konsekvens | Beloppet i hero, i "att betala"-raden och i "Så har vi räknat" är samma beräknade värde, avrundat först vid visning |

---

## 2. Frågebanken

### 2.1 Ordningsprinciper
1. **Det kunden vet utan att slå upp något kommer först** (hur man bor, om huset är nytt, vad man ska installera, om man har solceller).
2. **Pengarna i mitten** (vad jobbet kostar, ägare, redan använt).
3. **Skattefrågan sist**, med ett förval, och den känsliga delen (belopp) frivillig och hopfälld.
4. **"Vet inte" bara där Ampy eller Skatteverket kan reda ut det** (husets ålder, skatten). Inte på boende, där är kunden den enda källan. Inte på "har du solceller".
5. Max **sex synliga frågor** per läge. Resten under "Fler detaljer".

### 2.2 Reglagen (vokabulär från `ampy-calc__*`-kitet)
- **Chips** = `__segmented` som får radbrytas, varje chip är en riktig `<input type="radio">` med `<label>`. Höjd ≥ 48 px på mobil.
- **Toggle** = `__toggle`, två lägen.
- **Stepper** = `__stepper` (− och +), steg 5 000 kr för belopp, 1 för år.
- **Belopp** = `__input` typ text, `inputmode="numeric"`, tusentalsavstånd formateras vid blur, klampat 0 till 1 000 000, tomt fält = "inget belopp" (takläge, §3.6). Aldrig `type="number"` (oavsiktlig scroll-ändring, gov.uk-riktlinjen i källfilen).
- **Förvalsknappar** under beloppsfältet (tre typiska belopp + "Annat belopp"), de sätter fältets värde.

### 2.3 ROT-banken (läge `rot`)

| # | id | Etikett (utkast) | Reglage | Alternativ (utkast) | Förval | Synlig? | Varför här | "Vet inte" |
|---|---|---|---|---|---|---|---|---|
| 1 | `boende` | Hur bor du där jobbet ska göras? | chips, 5 | Villa eller radhus (äger) / Bostadsrätt (äger) / Fritidshus (äger) / Hyresrätt (hyr) / Föräldrarnas bostad | Villa eller radhus | Ja | Det första kunden vet. Bär både boendeform och ägande i samma tryck, så ägandefrågan slipper ställas separat. Svarar direkt på tre av segmentfrågorna folk googlar (bostadsrätt, fritidshus, hyresrätt) | Ingen, kunden är källan |
| 2 | `alder` | Är bostaden äldre än fem år? | chips, 3 | Ja / Nej, nyare / Vet inte | Ja | Ja | Andra saken kunden vet. Svarar på "rotavdrag nybyggt hus". Hur åldern räknas: `[→ ROT-agent]` (hjälptext under frågan) | "Vet inte" ger "Ja, om…" + nästa steg "vi kollar värdeåret åt dig" `[→ ROT-agent: var värdeåret står]` |
| 2b | `byggar` | Vilket år blev bostaden klar? | stepper år | 2019 till 2026 | tomt | Visas bara när 2 = Nej | Låter verktyget säga "från och med 20XX kan ROT gälla" i stället för ett tomt nej `[→ ROT-agent: räkneregeln]` | tomt = beskedet säger bara "inte än" |
| 3 | `belopp` | Vad kostar jobbet ungefär? | belopp + stepper + förval | 15 000 / 30 000 / 60 000 / Annat belopp `[GAP: typiska belopp per jobbtyp, Julius]` | 30 000 `[GAP]` | Ja | Pengafrågan. Totalpris inkl. moms är det kunden har (offerten eller en känsla). Arbetsandelen antas per jobbtyp och kan preciseras i 3b | tomt fält = takläge ("upp till 50 000 kr") |
| 3b | `arbete` | Varav arbete | slider 0 till 100 % eller belopp i kr | förval per jobbtyp `[GAP: arbetskostnadsandel per jobbtyp, Julius]` | per jobbtyp | Fler detaljer | ROT gäller bara arbetet. Antagen andel ger intervall, angiven ger punkt (§3.6). Sälj-länken fyller i kr från offerten | n/a |
| 3c | `jobb` | Vilket jobb gäller det? | chips | Byta elcentral / Annat elarbete `[GAP: vilka jobb, Julius]` | Byta elcentral | Fler detaljer | Styr bara förvalet i 3b och exempeltexten. Ändrar logik (andelen), inte bara copy | n/a |
| 4 | `skatt` | Betalar du inkomstskatt på lön eller pension? | chips, 4 | Ja, på lön / Ja, på pension / Låg eller ingen inkomst / Vet inte | Ja, på lön (antaget) | Ja, sist | Känsligast, därför sist och med förval. "Ja, på pension" svarar uttryckligen på "rotavdrag pensionär" (1 300 sök/mån) `[→ ROT-agent: pension som underlag]`. "Låg eller ingen" öppnar 4b automatiskt | "Vet inte" ger "Ja, om skatten räcker" + nästa steg |
| 4b | `skattbelopp` | Ungefär hur mycket skatt betalade du förra året? | belopp, frivilligt | tomt / belopp | tomt | Fler detaljer (öppnas automatiskt vid "Låg eller ingen") | Ger en personlig gräns i beloppspanelen (§2.6). Lämnar aldrig webbläsaren, aldrig i URL:en | tomt = beskedet räknar med taket |
| 5 | `agare` | Hur många äger bostaden? | toggle | En / Två eller fler | En | Fler detaljer | Två ägare dubblar taket (kanon). Sällan avgörande på små jobb, därför hopfälld | n/a |
| 6 | `anvant` | Har du redan använt ROT eller RUT i år? | toggle → två steppers | Nej / Ja → ROT: kr, RUT: kr | Nej | Fler detaljer | Ändrar kvarvarande pott (50 000 ROT inom 75 000 gemensamt, kanon). Svarar på "rot och rut samma år" `[→ ROT-agent: formeln för kvarvarande utrymme]` | n/a |
| 7 | `under18` | Jag är under 18 år | kryssruta | av / på | av | Fler detaljer | Lagkrav som nästan aldrig gäller, ska inte kosta ett tryck för alla vuxna. Visas i villkorslistan som förifylld rad | n/a |

Synliga i ROT: 1, 2, 3, 4 (fyra frågor). Under "Fler detaljer": 2b, 3b, 3c, 4b, 5, 6, 7.

### 2.4 GT-bankerna (lägen `gt_laddbox`, `gt_batteri`, `gt_sol`)
Läget är segmentet som ändrar logiken (kvalitetsribbans punkt 1): olika sats, olika villkor, olika frågebank. Per granskning-C: aldrig en gemensam GT-bank.

| # | id | Etikett (utkast) | Reglage | Alternativ | Förval | Laddbox | Batteri | Solceller | Varför |
|---|---|---|---|---|---|---|---|---|---|
| 0 | `lage` | Vad ska du installera? | chips, 3 | Laddbox / Solcellsbatteri / Solceller | Laddbox (kommersiell prioritet laddbox före batteri) | synlig | synlig | synlig | Segmentet först. Byter frågebank, sats och villkor |
| 1 | `boende` | Hur bor du där det ska installeras? | chips, 5 | som ROT | Villa eller radhus | synlig | synlig | synlig | Bostadsrätt och föräldrarnas bostad tolkas annorlunda i GT `[→ GT-agent]` |
| 2 | `sol` | Har du solceller, eller installerar du samtidigt? | chips, 3 | Ja, har / Installerar samtidigt / Nej | Ja, har (antaget) | dold | synlig | dold | Batteriets grind (kanon). Ställs aldrig på laddbox eller sol (granskning-C:s block) |
| 3 | `belopp` | Vad kostar installationen ungefär? | belopp + förval | förval per läge `[GAP: typiska belopp, Julius]` | per läge `[GAP]` | synlig | synlig | synlig | GT räknar arbete + material, så totalen räcker. Ingen arbetsandel behövs |
| 3b | `batteri_samtidigt` | Installerar du batteri samtidigt? | toggle → belopp 2 | Nej / Ja → kr | Nej | dold | dold | Fler detaljer | Sol 15 % och batteri 50 % är två rader under samma tak. Aldrig en sammanslagen procent (dubbelbas-vakten) `[→ GT-agent: takordningen]` |
| 4 | `skatt` | Betalar du inkomstskatt på lön eller pension? | chips, 4 | som ROT | Ja, på lön (antaget) | synlig | synlig | synlig | Sist, som i ROT |
| 4b | `skattbelopp` | som ROT | belopp, frivilligt | | tomt | detaljer | detaljer | detaljer | |
| 5 | `agare` | Hur många äger bostaden? | toggle | En / Två eller fler | En | detaljer | **synlig** | **synlig** | Batteri och sol slår ofta i 50 000-taket, då avgör två ägare mycket. Laddbox gör det sällan `[GAP: typiska belopp avgör]` |
| 6 | `anvant_gt` | Redan använt grön teknik-avdrag i år? | toggle → stepper | Nej / Ja → kr | Nej | detaljer | detaljer | detaljer | Egen pott skild från ROT `[→ GT-agent]` |
| 7 | `under18` | som ROT | kryssruta | | av | detaljer | detaljer | detaljer | |

Synliga: laddbox 4 (0, 1, 3, 4), batteri 6 (0, 1, 2, 3, 4, 5), sol 5 (0, 1, 3, 4, 5).

### 2.5 Processfakta visas, frågas inte
F-skatt, elektronisk betalning och "samma företag levererar material och installation" (GT) är
saker Ampy uppfyller, inte saker kunden ska svara på. De renderas som **förifyllda rader i
villkorslistan** med etiketten "det sköter vi" (utkast: "F-skatt och elektronisk betalning: det sköter
vi via fakturan"). Det är ett förtroendeargument i sig. Exakt formulering `[→ ROT-agent]`, `[→ GT-agent]`.
"18 år" är en förifylld rad med ett litet "Stämmer inte?" som öppnar kryssrutan i "Fler detaljer".

### 2.6 Skattefrågan: tre sätt att fråga, och rekommendationen
Villkoret är att skatten räcker att räkna av avdraget mot. Skatteverkets egen tjänst löser det med
födelseår, kommun och alla inkomstrader. Vi ska inte bygga en andra skattemotor. Tre alternativ:

| | A. Skriv in skatten | B. Inkomst-proxy | C. Självskattning i band |
|---|---|---|---|
| Fråga | "Ungefär hur mycket skatt betalade du förra året?" belopp | "Ungefärlig månadsinkomst före skatt" slider i 5 000-steg + pensionär-toggle | "Betalar du inkomstskatt på lön eller pension?" fyra chips |
| Plus | Exakt det Julius bad om. Enkel logik: jämför avdraget med skatten. Ger en personlig gräns | Folk vet sin månadslön. Bandet är mindre känsligt än en exakt siffra. Svarar på pensionär-segmentet med en toggle | Noll personuppgifter. Ett tryck. Ärligt: vi kan ändå inte räkna exakt. Verktyget blir aldrig fel på skatten, bara försiktigt |
| Minus | Få vet siffran utantill (står som slutlig skatt i deklarationen). Preliminär skatt på lönespecen är inte samma sak. Känsligt. Avräkningsordningen mot andra reduktioner gör att skatten inte är hela sanningen `[→ ROT-agent]` | Kräver en schablon (kommunalskatt 29 till 35 %, grundavdrag, jobbskatteavdrag, pensionärers högre grundavdrag). Det är en skattemotor till, som ROT-agenten måste signera och som blir fel i kanterna. Fejkprecision | Ger ingen personlig gräns till den med låg inkomst. Tappar Julius önskan om att skriva in skatten |

**Rekommendation: C som den synliga frågan, A som frivillig fördjupning under "Fler detaljer". B byggs inte.**
- C avgör beskedsklassen (ja / ja men kolla / troligen inte / vet inte).
- A används bara för att göra beloppspanelen personlig: "Din skatt räcker till hela avdraget" eller
  "Din skatt räcker till ungefär X kr av Y kr" `[→ ROT-agent: vad som får jämföras mot vad]`.
- Väljer kunden "Låg eller ingen inkomst" öppnas A automatiskt, med hjälptexten "Står som slutlig skatt
  i din deklaration. Vet du inte, låt fältet vara tomt så räknar vi med taket" (utkast).
- Integritetsregler: skattebeloppet lämnar aldrig webbläsaren, hamnar aldrig i URL:en, aldrig i
  dataLayer (bara `skatt: angiven`), och nollställs vid "Börja om".
- Nästa steg vid osäkerhet pekar alltid på Skatteverkets e-tjänst (den enda som vet) och på Ampys
  kostnadsfria genomgång `[GAP 1: vad genomgången faktiskt kollar]`.

### 2.7 Beloppsfrågan: total först, arbete i detaljerna
- ROT: kunden anger **totalpris**. Verktyget antar arbetsandel per jobbtyp `[GAP]` och visar avdraget som
  **intervall** ("ungefär 6 000 till 10 500 kr, beror på hur stor del som är arbete"). Anger kunden
  "Varav arbete" (från offerten, eller från säljlänken) blir det en **punkt**.
- GT: totalpris räcker (arbete + material). Punkt direkt.
- Sol + batteri i samma installation: två rader, två satser, ett tak. Visas som två rader i "Så har vi räknat", aldrig som en procent.
- Förvalsknapparna är typiska belopp för Ampys jobb `[GAP: Julius är källan]`. Förvalet på load är
  det mellersta.

---

## 3. Tillståndsmatrisen

### 3.1 Variabler
- `boende` ∈ {villa, brf, fritid, hyra, foralder}
- `alder` ∈ {ja, nej, vet} (bara ROT), `byggar` ∈ {tomt, 2019..2026}
- `lage` ∈ {laddbox, batteri, sol} (bara GT), `sol` ∈ {ja, samtidigt, nej} (bara batteri)
- `skatt` ∈ {lon, pension, lag, vet}, `skattbelopp` ∈ {tomt, kr}
- `agare` ∈ {1, 2}, `anvant` (kr ROT, kr RUT, kr GT), `under18` ∈ {av, på}
- `belopp` ∈ {tomt, kr}, `arbete` ∈ {antagen %, angiven kr}
- per grindfråga: `bekraftad` ∈ {nej, ja}

### 3.2 Beskedsklasserna

| Klass | Ton (semantik, färg väljs av design) | Rubrikgrammatik (utkast) | Beloppspanelen | CTA |
|---|---|---|---|---|
| **JA** | positiv, varm | "Ja, du kan använda ROT-avdraget" | punkt eller intervall | primär → `/offert/` |
| **JA MED VILLKOR** | villkorad, lugn | "Ja, om <villkor>" eller "Ja, om det här stämmer:" eller "Ja, men <begränsning>" | punkt/intervall, eller begränsad ("räcker till ca X kr", "X kr kvar i år") | primär → `/offert/`, villkoret står i "Vad händer nu" steg 1 |
| **TROLIGEN INTE** | neutral, förklarande | "Troligen inte, <skäl>" | dold, eller alternativraden ("ROT 30 % på arbetet kan gälla i stället") | mjuk: läge-byte, eller tel, eller "Få ett pris utan avdrag" |
| **NEJ** | lugn, säljer inte | "Nej, <skäl>" (undertyp "Nej, inte än" med årtal) | dold | ingen solid knapp. Textlänk till rätt nästa steg (hyresvärd, artikelavsnitt, "från 20XX") |
| **OSÄKERT** | neutral | "Osäkert, vi behöver veta <två saker>" | takläge ("upp till 50 000 kr om villkoren stämmer") | tel: "Ring oss, fem minuter räcker" |

### 3.3 Prioritetsordningen (första träff vinner)
1. **NEJ (hårt):** `boende = hyra`, eller `under18 = på`, eller kvarvarande pott = 0 kr ("Nej, inte i år").
2. **NEJ, inte än:** ROT och `alder = nej` (med `byggar` ⇒ "från och med 20XX" `[→ ROT-agent]`).
3. **TROLIGEN INTE:** `skatt = lag` och `skattbelopp = 0`; GT batteri och `sol = nej` (fallback-raden till ROT, hedgad "normalt" per granskning-C); GT och `boende = brf` `[→ GT-agent: föreningen söker?]`.
4. **OSÄKERT:** två eller fler grindsvar är "vet inte" (`alder`, `skatt`), eller `boende = foralder` kombinerat med ett "vet inte".
5. **JA MED VILLKOR:** exakt ett grindsvar är antaget eller "vet inte"; `skatt = lag` med belopp > 0 men mindre än avdraget; `boende = brf` i ROT `[→ ROT-agent: inre underhåll]`; `boende = foralder` `[→ ROT-agent]`, `[→ GT-agent]`; `boende = fritid` i GT `[→ GT-agent]`; `agare = 2` (båda behöver skatt `[→ ROT-agent]`); kvarvarande pott > 0 men mindre än avdraget; två eller fler antagna grindsvar (rubriken "Ja, om det här stämmer:").
6. **JA:** allt annat.

Regeln som skyddar candour-grinden: **ett hårt nej slår allt, skatten gör ett ja till "ja, men",
okända svar ger aldrig ett rent ja.** Ett enskilt "vet inte" ger "Ja, om <villkor>" (villkoret namnges,
nästa steg pekas ut). Vill ägaren ha det striktare (varje "vet inte" ⇒ OSÄKERT) är det ett rent
etikettbyte i data, logiken bär båda (ägarbeslut 3, §12).

### 3.4 ROT-matrisen (kombinationer som betyder något)

| boende | alder | skatt | övrigt | Klass | Rubrik (utkast) | Belopp | CTA |
|---|---|---|---|---|---|---|---|
| hyra | valfri | valfri | | NEJ | "Nej, ROT gäller den som äger bostaden" | dold | textlänk "Hör med din hyresvärd" + artikelavsnitt. Ingen sälj (leads Ampy inte kan sälja till) |
| valfri | valfri | valfri | under18 | NEJ | "Nej, du behöver ha fyllt 18 år" | dold | ingen |
| villa/brf/fritid | ja | lon/pension | pott = 0 | NEJ, inte i år | "Nej, inte i år. Potten är använd" | "0 kr kvar" | textlänk "Vad gäller nästa år?" `[→ ROT-agent: vad som räknas som använt, betalningsdatum]` `[GAP ägare: får vi föreslå fakturering nästa år?]` |
| villa | nej | valfri | byggar satt | NEJ, inte än | "Nej, inte än. Från och med 20XX kan ROT gälla" | dold | textlänk "Få ett fast pris utan avdrag" (ärlig sälj, ingen solid knapp) |
| villa | nej | valfri | byggar tomt | NEJ, inte än | "Nej, inte än. ROT kräver att bostaden är äldre än fem år" | dold | samma |
| villa | vet | vet | | OSÄKERT | "Osäkert. Vi behöver veta husets ålder och om skatten räcker" | tak | tel |
| villa | ja | lag, belopp 0 | | TROLIGEN INTE | "Troligen inte. Avdraget kräver skatt att räkna av mot" | dold | textlänk Skatteverket + tel |
| villa | ja | lag, belopp < avdrag | | JA MED VILLKOR | "Ja, men skatten räcker till ungefär X kr" | begränsad | primär |
| villa | ja | vet | | JA MED VILLKOR | "Ja, om skatten räcker" | punkt/intervall + not | primär, steg 1 "Kolla ditt utrymme hos Skatteverket, eller låt oss kolla" |
| villa | vet | lon | | JA MED VILLKOR | "Ja, om bostaden är äldre än fem år" | punkt/intervall | primär, steg 1 "Vi kollar värdeåret" `[→ ROT-agent]` |
| brf | ja | lon | | JA MED VILLKOR | "Ja, för arbete i din lägenhet" `[→ ROT-agent: gränsen mot föreningens delar]` | punkt/intervall | primär |
| fritid | ja | lon | | JA | "Ja, fritidshus räknas" `[→ ROT-agent]` | punkt/intervall | primär |
| foralder | ja | lon | | JA MED VILLKOR | "Ja, om <villkor för förälders bostad>" `[→ ROT-agent]` | punkt/intervall | primär |
| villa | ja | lon | agare 2 | JA MED VILLKOR | "Ja, upp till 100 000 kr om ni båda har skatt att räkna av mot" `[→ ROT-agent]` | punkt/intervall, tak 100 000 | primär |
| villa | ja | lon | anvant > 0, pott > avdrag | JA | rubrik JA, villkorslistan visar "X kr kvar i år" | punkt/intervall | primär |
| villa | ja | lon | anvant > 0, pott < avdrag | JA MED VILLKOR | "Ja, men bara X kr kvar i år" | begränsad | primär |
| villa (antaget) | ja (antaget) | lon (antaget) | load-läget | JA MED VILLKOR | "Ja, om det här stämmer:" | "ca 9 000 kr på ett jobb för 30 000 kr" | primär |
| villa | ja | lon | allt bekräftat | JA | "Ja, du kan använda ROT-avdraget" | punkt/intervall | primär |

Kombinationer som inte står i tabellen faller genom §3.3 i ordning. Byggaren får aldrig hitta på en cell.

### 3.5 GT-matriserna

**Laddbox**

| boende | skatt | övrigt | Klass | Rubrik (utkast) | Belopp | CTA |
|---|---|---|---|---|---|---|
| hyra | valfri | | NEJ | "Nej, avdraget gäller den som äger bostaden" | dold | "Hör med din hyresvärd" |
| brf | valfri | | TROLIGEN INTE eller JA MED VILLKOR `[→ GT-agent: laddbox i BRF-garage, vem söker]` | "Troligen via föreningen" | dold | tel "Ring så reder vi ut det med föreningen" |
| fritid | lon | | `[→ GT-agent]` | | | |
| villa | lon | allt bekräftat | JA | "Ja, du kan använda grön teknik-avdraget" | punkt 50 % | primär "Få en laddbox-offert med avdraget inräknat" |
| villa | lag / vet | | JA MED VILLKOR | som ROT | | primär |
| villa | lon | anvant_gt ⇒ pott < avdrag | JA MED VILLKOR | "Ja, men bara X kr kvar i år" | begränsad | primär |
| villa | lon | pott = 0 | NEJ, inte i år | | "0 kr kvar" | textlänk |

**Solcellsbatteri**

| boende | sol | skatt | Klass | Rubrik (utkast) | Belopp | CTA |
|---|---|---|---|---|---|---|
| hyra | valfri | valfri | NEJ | som ovan | dold | hyresvärd |
| villa | nej | valfri | TROLIGEN INTE | "Troligen inte grön teknik utan solceller. ROT 30 % på arbetet kan gälla i stället" (hedgat "normalt", `[→ GT-agent: fristående batteri]`) | alternativraden: ROT-belopp på arbetsandelen `[GAP arbetsandel batteri]` | mjuk: "Räkna med ROT i stället" (byter läge till `rot` med boende och skatt bevarade) |
| villa | ja / samtidigt | lon, bekräftat | JA | "Ja, du kan använda grön teknik-avdraget" | punkt 50 %, tak per ägare | primär |
| villa | ja | lag / vet | JA MED VILLKOR | som ROT | | primär |
| brf | valfri | valfri | `[→ GT-agent]` | | | tel |
| villa | ja | lon, agare 2 | JA MED VILLKOR | "Ja, upp till 100 000 kr om ni båda har skatt" | tak 100 000 | primär |

**Solceller**

| boende | skatt | övrigt | Klass | Rubrik | Belopp | CTA |
|---|---|---|---|---|---|---|
| villa | lon | bekräftat | JA | "Ja, 15 % på solcellerna" | punkt 15 % (+ rad 2 batteri 50 % om valt), ett tak | primär |
| villa | lon | batteri samtidigt, summan > tak | JA MED VILLKOR | "Ja, men taket på 50 000 kr slår in" | två rader, takat | primär |
| brf / hyra / fritid / foralder | | | som laddbox `[→ GT-agent]` | | | |

### 3.6 Beloppspanelens tillstånd

| Tillstånd | När | Visas som (utkast) |
|---|---|---|
| Punkt | ROT med angiven arbetskostnad, eller GT med belopp | "Uppskattat avdrag: 9 000 kr" + basrad "30 % av arbetskostnaden 30 000 kr. Materialet ger inget avdrag" |
| Intervall | ROT med antagen arbetsandel | "Ungefär 6 000 till 10 500 kr" + "beror på hur stor del som är arbete, exakt står på offerten" |
| Tak | belopp tomt | "Upp till 50 000 kr i år" (100 000 vid två ägare) |
| Begränsad av skatt | skattbelopp angivet och < avdrag | "Din skatt räcker till ungefär X kr av Y kr" `[→ ROT-agent]` |
| Begränsad av pott | pott < avdrag | "X kr kvar av potten i år, resten nästa år" `[→ ROT-agent: om "nästa år" får sägas]` |
| Noll | pott = 0 | "0 kr i år" |
| Alternativrad | batteri utan sol | "Grön teknik gäller normalt inte. ROT 30 % på arbetet: ungefär X kr" |
| Dold | hårt NEJ | ingen siffra alls. Ett nej med en siffra bredvid är en säljpitch |
| Att betala | alla punkt/intervall-lägen | "Att betala efter avdrag: 21 000 kr" (kvittoraden, §11) |

Avrundning: avdraget avrundas till närmaste 100 kr vid visning. Samma beräknade värde i alla tre
ställen (hero, att betala, "Så har vi räknat").

### 3.7 "Vet inte"-regler
- Ett "vet inte" på en grindfråga: rubriken namnger villkoret, "Vad händer nu" steg 1 blir "vi kollar det åt dig" eller "kolla hos Skatteverket".
- Två eller fler: OSÄKERT, telefonen är CTA.
- "Vet inte" räknas som *bekräftat men okänt*: hålringen i villkorslistan byts till en frågeteckenring (design väljer form), aldrig till en bock.
- "Vet inte" på beloppet finns inte, tomt fält är takläget.

---

## 4. Resultatpresentationen

### 4.1 Beskedet först, beloppet direkt efter
Argument:
1. Frågan kunden ställer (dagligen till säljarna, och i sökdatan: "vem har rätt", "har jag rätt",
   pensionär, bostadsrätt, hyresrätt) är **är jag berättigad**. Beloppet är följdfrågan.
2. §7.1: köparen jagar haken. Ett stort kronbelopp överst läses som säljarens siffra. Ett besked med
   villkoren synliga är hakjakten gjord åt honom, sedan är siffran hans.
3. Säljlänken: kunden fick länken för att få svar på "gäller det mig". Rubriken ska besvara exakt det.
4. Men beskedet och beloppet står i **samma andetag**, i samma kort: "Ja. Ungefär 9 000 kr." Beloppet
   är stödnivån, inte en andra hero.

### 4.2 Beskedskortets stack (fast ordning)

| Slot | Innehåll | Per klass |
|---|---|---|
| 1 eyebrow | "Ditt besked, ROT-avdraget 2026" / "Ditt besked, grön teknik 2026" | alltid |
| 2 BESKED | rubrik enligt grammatiken §3.2 | alltid |
| 3 BELOPP | beloppspanelens tillstånd §3.6, med basrad | dold vid hårt NEJ |
| 4 ram | en ärlig rad. JA: "Avdraget dras på fakturan, vi sköter ansökan" `[GAP 1: fakturamodell, den bekräftade formuleringen är "vi räknar av avdraget och sköter ansökan"]`. Villkor: "Ett villkor kvar att kolla, se nedan". NEJ: "Det går att göra jobbet ändå, men utan avdrag". OSÄKERT: "Två saker avgör, vi reder ut dem på fem minuter" | alltid |
| 5 VILLKOR | villkorslistan §4.4 | alltid (vid NEJ visas raden som stoppar först) |
| 6 VAD HÄNDER NU | 1, 2, 3 (§4.5) | alltid utom NEJ under 18 |
| 7 CTA | exakt en (§5) | per klass |
| 8 tel | "Hellre prata? 010-265 79 79" textlänk | alla utom NEJ hyra / under 18 (där finns inget att prata om) |
| 9 dela | "Kopiera länk" + "Skriv ut" (§7) | alltid |
| 10 Så har vi räknat | `<details>` §4.7 | alltid |
| 11 disclaimer | "Vägledande besked utifrån dina svar. Skatteverket avgör. Exakt belopp står på offerten." | alltid, under kortet |

### 4.3 Rubrikgrammatiken (sammanfattning)
"Ja, du kan …" (allt bekräftat) / "Ja, om <villkor>" (ett antaget eller okänt) / "Ja, om det här
stämmer:" (två eller fler antagna) / "Ja, men <begränsning>" (skatt eller pott) / "Troligen inte,
<skäl>" / "Nej, <skäl>" / "Nej, inte än. Från 20XX …" / "Osäkert. Vi behöver veta <två saker>".
Alltid "kan", aldrig "får du" eller "du får". Ordvalen är `ampy-rost`.

### 4.4 Villkorslistan
Rader i samma ordning som frågorna. Fem radtillstånd (ikon + ord, färg är aldrig ensam bärare):

| Tillstånd | Ikon (semantik) | Exempel (utkast) |
|---|---|---|
| bekräftad | bock | "Du äger bostaden" |
| antagen | hålring + ordet "antaget" | "Äldre än fem år (antaget)" |
| okänd | frågeteckenring | "Skatt att räkna av mot: vet inte, vi kollar" |
| villkor/begränsning | varningstriangel | "Skatten räcker till ungefär 6 000 kr av 9 000 kr" |
| stopp | kryss | "Hyresrätt: avdraget gäller den som äger" |
| sköter vi | bock, dämpad | "F-skatt och elektronisk betalning: det sköter vi" |

Varje rad är klickbar och flyttar fokus till sin fråga (mobil: scrollar dit). Det gör listan till en
navigering, inte bara en spegel. Raden "sköter vi" är inte klickbar.

### 4.5 "Vad händer nu", tre steg per klass (utkast, `[GAP 1]` gäller steg 1 i JA)
- **JA / JA MED VILLKOR:** 1 "Du får ett fast pris där avdraget är avräknat" (`[GAP 1]`, fallback: "Du får ett fast pris. Vi räknar av avdraget och sköter ansökan") / vid villkor: "Vi kollar <villkoret> innan du bestämmer något". 2 "Vi skickar ansökan till Skatteverket efter jobbet." 3 "Skatteverket stämmer av mot din skatt i deklarationen" `[→ ROT-agent]`, `[→ GT-agent]`.
- **TROLIGEN INTE:** 1 "Kolla <x> hos Skatteverket / föreningen." 2 "Vill du, lämnar vi ett fast pris utan avdrag." 3 (inget).
- **NEJ, hyra:** 1 "Hör med din hyresvärd. Det är oftast fastighetsägaren som beställer elarbeten." 2 länk till artikelns avsnitt. Ingen sälj.
- **NEJ, inte än:** 1 "Från och med 20XX kan ROT gälla." 2 "Vill du ha ett pris ändå: utan avdrag, inga överraskningar."
- **NEJ, inte i år:** 1 "Potten fylls på 1 januari" `[→ ROT-agent]`. 2 `[GAP ägare]`.
- **OSÄKERT:** 1 "Ring oss, fem minuter räcker." 2 "Eller kolla <x> hos Skatteverket."

### 4.6 Rörelse
- **Belopp:** count-up ≤ 300 ms, bara när beloppet ändras av kunden. Aldrig på load (siffran står färdig, ingen layoutförskjutning, ingen enarmad bandit).
- **Besked:** rubrikbyte = 150 ms tona, ingen glidning. Villkorsrad som byter tillstånd: 150 ms.
- **Sticky-remsan (mobil):** 200 ms in/ut.
- `prefers-reduced-motion: reduce`: allt byts direkt, ingen count-up, ingen toning.
- Ingen animation får flytta CTA:n medan tummen är på väg mot den (beloppsraden har fast höjd).

### 4.7 "Så har vi räknat" (hopfälld `<details>`)
Innehåll, i ordning: sats och bas ("30 % av arbetskostnaden, inte materialet" / "50 % av arbete och
material" / "15 % för solceller, 50 % för batteri, samma tak"), takraden med kundens siffror ("50 000 kr
per person och år, du har X kr kvar"), skatteraden (antagande eller angivet), det som är antaget
(arbetsandel, boende), regeldatum ("Reglerna gäller 2026 och kontrollerades <datum> mot Skatteverket"
`[→ ROT-agent]`, `[→ GT-agent]`), länk till Skatteverkets e-tjänst, och disclaimern. Inga nya
siffror här som inte redan finns i beskedet.

---

## 5. CTA-strategin utan formulär

### 5.1 Alternativen bedömda

| Alternativ | Bedömning |
|---|---|
| Länk till `/offert/` (sajtens befintliga formulär) | **Primär** på gröna klasser. Bär verktygets tillstånd i query-strängen så formuläret kan förifylla och attribuera (`[GAP dev: kan /offert/ läsa parametrar?]`) |
| `tel:` | **Primär** på OSÄKERT (snabbast att reda ut två okända) och på "via föreningen". **Sekundär textlänk** på alla andra klasser utom hyra/under 18 |
| "Skicka resultatet till mig" | **Nej.** Kräver e-post, det är en e-postvägg i förklädnad och ett formulär i verktyget (ägarkrav). Delbar länk + utskrift löser behovet |
| "Kopiera länk" / "Dela" | **Verktyg, inte CTA.** Alltid synlig i dela-raden, aldrig som knapp bredvid CTA:n |
| "Skriv ut / spara som PDF" | **Ja, via print-stilmall.** Ingen server, inga uppgifter, ingen e-post |
| Läge-byte ("Räkna med ROT i stället") | **Mjuk CTA** bara på batteri-utan-sol. Stannar i verktyget |
| Nedräkning, "bara i år", knapphet | **Aldrig.** Candour-grinden. Att potten fylls på i januari är ett faktum som får stå i "Så har vi räknat", inte en pressknapp |

### 5.2 Exakt en primär per klass

| Klass | Primär (utkast, benefit-namngiven) | Mål | Sekundär |
|---|---|---|---|
| JA | "Få ett pris med avdraget inräknat" (GT laddbox: "Få en laddbox-offert med avdraget inräknat") | `/offert/?src=avdragskollen&m=…&…` | tel-textlänk |
| JA MED VILLKOR | samma som JA (villkoret står i steg 1) | `/offert/` | tel-textlänk |
| TROLIGEN INTE, batteri utan sol | "Räkna med ROT i stället" (läge-byte) | i verktyget | tel-textlänk |
| TROLIGEN INTE, skatt | ingen solid knapp. Textlänk "Kolla ditt utrymme hos Skatteverket" | Skatteverket | tel-textlänk |
| TROLIGEN INTE, BRF | "Ring så reder vi ut det med föreningen" | `tel:` | ingen |
| NEJ, hyra | ingen. Textlänk "Hör med din hyresvärd" + artikelavsnitt | artikel | ingen |
| NEJ, under 18 | ingen | | ingen |
| NEJ, inte än | textlänk "Få ett fast pris utan avdrag" | `/offert/` | tel-textlänk |
| NEJ, inte i år | textlänk "Vad gäller nästa år?" (artikelavsnitt) `[GAP ägare]` | artikel | tel-textlänk |
| OSÄKERT | "Ring oss, fem minuter räcker" | `tel:` | textlänk Skatteverket |

Regel från granskning-C: efter besked finns exakt en primär handling. Sticky-remsan på mobil
**speglar** kortets primär (samma etikett, samma mål), den lägger aldrig till en andra.

### 5.3 Var tel-länken bor
Under CTA:n i kortet, som textlänk ("Hellre prata? 010-265 79 79"). Inte i sticky-remsan (då blir
det tre handlingar på skärmen). I embed-läget på sidor som redan har sajtens sticky ring-bar finns
telefonen där, verktyget lägger inte till en till.

### 5.4 Överlämningen till `/offert/` (kontrakt, `[GAP dev]`)
Query-parametrar på CTA-länken: `src=avdragskollen`, `m` (rot/gt), `l` (läge), `b` (boende), `v` (beskedsklass),
`a` (belopp, avrundat till 1 000), `ak` (arbetskostnad om angiven). **Aldrig** skattebelopp, aldrig inkomst.
Formuläret på `/offert/` behöver: (1) läsa `src` för attribution, (2) helst förifylla ett dolt fält "kalkyl"
med sträng, så säljaren ser vad kunden räknat på. Går inte (1), tappas KPI:n leads per 1000 visningar.

---

## 6. Embed i artikeln

### 6.1 Placering och rubriknivå
Mallen live: header, bild, H1, två ingressstycken, Snabbfakta-ruta, H2-kedja. Verktyget sätts **efter
ingressen, före Snabbfakta**. Verktygets egen rubrik blir artikelns första H2 ("Gäller ROT-avdraget
dig? …", utkast, bär sök-intentet "räkna ut rotavdrag"). Rubriker inne i verktyget är H3. Fristående
sida: verktygets rubrik är H1, inre rubriker H2 (samma nedflyttning som Elcentral-kollens blockläge).

### 6.2 Höjdbudget på mobil (390×844)
Uppmätt mall: header 66 px, bild ca 230 px, H1 två rader ca 110 px, ingress ca 230 px. Före verktyget:
**ca 640 px**. Två skärmar = 1 688 px. Första brödtextraden (Snabbfakta) ska börja senast vid ca 1 540 px.
**Budget för verktyget i embed-läge: ≤ 900 px** i utgångsläget.

Så klarar vi det: embed-läget renderar de synliga frågorna (ROT: fyra, ca 4 × 100 px), rubrik + lead
(ca 100 px) och ett **kompakt beskedskort** (besked, belopp, ram, CTA, ca 260 px) med villkorslistan,
"Vad händer nu" och dela-raden hopfällda bakom "Visa villkoren" (ca 48 px). Summa ca 810 px. Allt
expanderar på plats, inget navigerar bort. Fristående sida: allt utfällt från start.

Design-agenterna mäter budgeten i sina wireframes och redovisar höjden per läge.

### 6.3 CLS-fritt
- **Server-rendera hela markupen** (frågor med förvalen ikryssade, beskedskortet med förvalsbeskedet,
  villkorslistan, "Så har vi räknat"). JS **hydrerar**, den injicerar inte struktur.
- Reserverad höjd: `min-height` per yta (embed mobil, embed desktop, fristående), värdena mäts av design.
- Beloppsraden har fast höjd oavsett tillstånd (tak, intervall, punkt) så CTA:n aldrig hoppar.
- Typsnitt self-hostade med `font-display: swap` och rätt fallback-metrics (design), aldrig Google Fonts (GDPR-invarianten).

### 6.4 Utan JavaScript
Den server-renderade markupen **är** fallbacken: frågorna står som en statisk villkorslista ("Det här
avgör om avdraget gäller dig"), beskedskortet visar förvalsbeskedet i ordform och en **statisk
beloppstabell** (arbetskostnad 10 000 / 20 000 / 50 000 / 100 000 kr → avdrag, med taket markerat, siffror
`[→ ROT-agent]`, `[→ GT-agent]`). Radioknapparna fungerar utan JS men räknar inte om; en `<noscript>`-rad
säger "Slå på JavaScript för att räkna på ditt fall". Google läser alltid ett komplett block.
Lärdomen från leadmagnet-auditen: aldrig svar i data-URI eller bara i JS.

### 6.5 Lat JS, inget nätverksanrop
- Ett JS-paket, `defer`, mål < 20 kB minifierat. Ren beräkningsmotor (ingen DOM) + renderare, testbar separat.
- **Frågebanker, texter och satser ligger inline** i HTML-utdatan som `<script type="application/json">`,
  aldrig via `fetch`. Verktyget renderar och räknar fullt ut utan ett enda nätverksanrop (Elcentral-kollen
  hämtar sin JSON, det ska vi inte kopiera i embed).
- Ingen tredjepartskod. dataLayer-push är det enda som lämnar verktyget, och bara efter samtycke.

### 6.6 En komponent, två lägen (rekommendation)
**En komponent** med `data-mode="rot|gt"`, `data-lage="laddbox|batteri|sol"` (bara gt) och
`data-surface="embed|standalone"`, med **fyra frågebanker** i datan (`rot`, `gt_laddbox`, `gt_batteri`, `gt_sol`).
Skäl: identisk design garanterad, ett läge-byte i verktyget (batteri → ROT) kräver att båda logikerna
finns i samma körning, en motor att testa. Kostnaden är några kB JS. Två separata byggen ger två
driftfel att jaga och ingen väg mellan dem.
Shortcode-kontrakt (utkast): `[avdragskollen mode="rot" surface="embed"]`, `[avdragskollen mode="gt" lage="laddbox" surface="embed"]`.

### 6.7 SEO-not
Verktygets server-renderade text får inte motsäga artikelns Snabbfakta. Satser och tak ska komma från
**en** datafil som både verktyget och artikeln (via ACF eller manuellt) speglar `[→ ROT-agent]`, `[→ GT-agent]`.
Två "30 %" på samma sida är fint, "30 %" och "50 %" om samma sak är en candour-defekt.

---

## 7. Delbar länk

### 7.1 Tillståndet i query-strängen
Kompakt, läsbar, utan personuppgifter. Elcentral-kollens `?q=`-vektor är förlagan, men här är
parametrarna namngivna så en säljare kan skriva dem för hand.

| Param | Värden | Not |
|---|---|---|
| `m` | `rot`, `gt` | läge |
| `l` | `laddbox`, `batteri`, `sol` | bara med `m=gt` |
| `b` | `villa`, `brf`, `fritid`, `hyra`, `foralder` | boende |
| `y` | `ja`, `nej`, `vet` | äldre än fem år (rot) |
| `yy` | 2019..2026 | byggår, bara med `y=nej` |
| `p` | `ja`, `sam`, `nej` | solceller (batteri) |
| `a` | heltal kr | totalbelopp |
| `ak` | heltal kr | arbetskostnad (rot), sätter punktläge |
| `a2` | heltal kr | batteri samtidigt (sol) |
| `s` | `lon`, `pension`, `lag`, `vet` | skatt, **aldrig ett belopp** |
| `o` | `1`, `2` | ägare |
| `u` | heltal kr | redan använt (rot: `u` ROT, `ur` RUT; gt: `u`) |
| `c` | `1` | "bekräftad"-flagga: mottagaren ser raderna som bekräftade av avsändaren? **Nej.** Länkade svar renderas som *antagna* (hålringar) tills mottagaren trycker. En säljare kan inte bekräfta åt kunden |
| `src` | `salj`, `artikel` | bara för mätning, inga namn |

Exempel:
- `https://ampy.se/rot-kollen/?m=rot&b=villa&y=ja&a=42000&ak=28000&src=salj` (URL-slug `[GAP ägare, fråga 4]`)
- `https://ampy.se/gron-teknik-kollen/?m=gt&l=laddbox&b=villa&a=25000&src=salj`
- `https://ampy.se/gron-teknik-kollen/?m=gt&l=batteri&b=villa&p=nej` (öppnar med fallback-raden och "Räkna med ROT i stället")

### 7.2 Vad som händer när länken öppnas
1. Parametrarna läses, valideras mot domänerna, **okända eller trasiga värden ignoreras tyst** (aldrig ett fejkat besked på en trunkerad länk, Elcentral-kollens regel).
2. Frågorna sätts, beskedet renderas, allt syns på en gång.
3. Om länken bär `m` plus minst ett svar och skärmen är mobil: mjuk scroll till **beskedskortet** efter render (kunden fick länken för svaret). Utan parametrar: ingen scroll (inget kapat embed).
4. Fristående sida: verktyget äger URL:en och uppdaterar den med `replaceState` (debounce 400 ms) så adressfältet alltid är delbart. `utm_*`, `gclid`, `fbclid` bevaras (Elcentral-kollens `urlWithoutQ`-lärdom).
5. Embed: verktyget **rör aldrig sidans URL** (artikeln äger canonical). "Kopiera länk" bygger den fristående URL:en med tillståndet.

### 7.3 "Kopiera länk" och "Dela"
- Mobil med `navigator.share`: systemets delningsark med bara URL:en (SMS-vänligt). Annars: urklipp + status "Länk kopierad" i `role="status"`.
- Säljarens arbetsflöde: öppna verktyget, ställ in kundens läge och belopp från offerten, tryck "Kopiera länk", klistra in i SMS. Ingen länkbyggare behövs.
- Länken innehåller aldrig skattebelopp, inkomst, namn eller telefon.

### 7.4 Utskrift / PDF: ja
Print-stilmall: beskedskortet, villkorslistan, "Vad händer nu" och "Så har vi räknat" med alla
antaganden utskrivna, plus datum och länken till verktyget. Frågepanel, CTA och sticky-rems döljs.
Kunden använder "Dela → Skriv ut → Spara som PDF". Ingen e-postfångst, ingen server, ingen kö.

---

## 8. Mobil 390×844

### 8.1 Vertikal ordning
Frågorna före beskedet (avviker medvetet från wireframes.md:s "resultat överst": ett förvalsbesked
om en okänd besökare är en gissning, inte ett värde; tre tryck senare är det kundens besked).
Beskedet ligger direkt under den sista synliga frågan, inom ca 1,5 skärmar från toppen.

```
┌──────────── 390 px ────────────┐
│ H2 (2 rader) + lead (1 rad)     │  ~100 px
│ [GT: Laddbox|Batteri|Solceller] │  ~56 (bara gt)
│ 1 Boende: chips i två kolumner  │  ~150
│ 2 Ålder: [Ja][Nej][Vet inte]    │  ~92
│ 3 Belopp: [ 30 000 ] kr  −  +   │  ~110
│    [15 000][30 000][60 000][Annat]
│ 4 Skatt: chips i två kolumner   │  ~150
│ ▸ Fler detaljer                 │  ~48
│ ┌ BESKEDSKORT (mörkt) ────────┐ │
│ │ eyebrow                     │ │
│ │ BESKED (rubrik)             │ │
│ │ BELOPP + basrad             │ │
│ │ ram                         │ │
│ │ villkor ○ ○ ○ ✓ (embed: ▸)  │ │
│ │ vad händer nu 1 2 3         │ │
│ │ [ EN CTA, full bredd ]      │ │
│ │ Hellre prata? 010-265 79 79 │ │
│ │ Kopiera länk   Skriv ut     │ │
│ │ ▸ Så har vi räknat          │ │
│ └─────────────────────────────┘ │
│ disclaimer                      │
│ ╭ sticky-remsa (bara fristående) ╮
│ │ Ja, om… ca 9 000 kr  [Till beskedet] │
│ ╰────────────────────────────────╯
└─────────────────────────────────┘
```

### 8.2 Sticky-remsan: ja på fristående sida, nej i embed
Beslut: **en sticky remsa i botten** på den fristående sidan medan kunden svarar. Den visar live
besked + belopp i en rad och en knapp som scrollar till beskedskortet (eller, när kortet redan är
passerat, speglar kortets primära CTA). Regler:
- Visas först när kunden **interagerat** eller scrollat förbi första frågan. Aldrig på load.
- Döljs (IntersectionObserver) när beskedskortet är ≥ 50 % synligt. Samma mekanik som Elcentral-kollens `syncStickyCta`.
- Höjd 56 px, `padding-bottom: env(safe-area-inset-bottom)`.
- **Avstängd i embed** (sajten har redan en sticky ring-bar på flera sidor, två remsor är en defekt; och embed-höjden är kort nog att beskedet är ett svep bort).
- Ingen tel-knapp i remsan (CTA-räkningen).

### 8.3 Tryckytor, tangentbord, tumräckvidd
- Chips ≥ 48 × 48 px, 8 px mellanrum, radbrytning i två kolumner när etiketterna är långa (boende, skatt). Etiketterna får aldrig kapas med ellips, hellre två rader i chippen.
- Stepper-knappar 44 × 44 px (WCAG 2.5.8 kräver 24, Apple HIG rekommenderar 44, vi tar 44).
- Beloppsfält: `inputmode="numeric"`, `enterkeyhint="done"`, `autocomplete="off"`. Fältet formaterar "30 000" vid blur. Inget `type="number"`.
- Stepper-knapparna står till höger om fältet (tumzon), förvalsknapparna under.
- CTA:n ligger i beskedskortets nedre del, full bredd, ≥ 52 px hög.
- "Fler detaljer" är en `<details>` med `<summary>` ≥ 44 px.

### 8.4 Scroll-beteende
Inget auto-scroll när kunden svarar (svaren ändrar bara beskedet, remsan visar det). Enda scrollarna:
(1) öppnad säljlänk → beskedskortet (§7.2), (2) tryck på en villkorsrad → dess fråga, (3) remsans knapp → kortet.

---

## 9. Tillgänglighet

- Varje fråga är `<fieldset>` med `<legend>` (frågetexten). Chips är `<input type="radio">` + `<label>`, hjälptexten kopplas med `aria-describedby`. Toggle = två radioknappar, inte en switch utan namn.
- Beloppsfältet har synlig `<label>`, suffix "kr" i texten, stepper-knapparna har `aria-label="Öka med 5 000 kronor"` / "Minska …".
- Beskedskortet är `<section aria-labelledby>`; rubriken + beloppet ligger i ett `aria-live="polite"`-område med **debounce 600 ms** och en kort textform ("Besked: Ja, om skatten räcker. Uppskattat avdrag 9 000 kronor.") så skärmläsaren inte läser varje stepper-steg.
- Fokusordning = DOM-ordning: frågor, "Fler detaljer", besked, CTA, tel, dela, "Så har vi räknat". Sticky-remsan ligger sist i DOM och är en vanlig knapp (inte `aria-hidden`), döljs med `hidden` när den inte visas.
- Färg är aldrig ensam bärare: beskedsklassen bärs av ordet ("Ja", "Nej") och ikonen, villkorsraderna av ikon + ord ("antaget"). Kontrastkrav på den mörka panelen: design verifierar ≥ 4,5:1 för brödtext, ≥ 3:1 för stor rubrik och ikoner.
- Felförebyggande i stället för felmeddelanden: beloppet klampas, icke-siffror tas bort vid inmatning, år begränsas av steppern, ömsesidigt uteslutande chips. Det finns ingen "fel"-röd i verktyget alls. Ett hårt NEJ gråar ut (disabled, med texten "Gäller inte i det här läget") beloppsfrågan, tar inte bort den ur DOM.
- `prefers-reduced-motion` respekteras (§4.6). Ingen fokusfälla, `<details>` är native.
- Statusmeddelanden ("Länk kopierad") i `role="status"`.
- Texten skalar: alla mått i rem, verktyget fungerar vid 200 % zoom (chips radbryts, panelerna staplas).

---

## 10. Instrumentering

Prefix `ampy_ak_` (Avdragskollen). Vendor-agnostisk `dataLayer`, alla events bär `mode`, `lage`,
`surface` (embed/standalone), `placement` (artikel-slug), `src` (salj/artikel/organic), `experiment_id`, `variant`.

| Event | När | Egenskaper (aldrig PII) |
|---|---|---|
| `ampy_ak_view` | verktyget renderat med sitt förvalsbesked | `prefilled` (bool), `params_n` |
| `ampy_ak_mode_select` | läge byts (gt laddbox/batteri/sol, eller batteri → rot-fallback) | `from`, `to` |
| `ampy_ak_answer` | ett svar ändras (debounce 400 ms på belopp) | `question_id`, `value_bucket`: chips → option-id; belopp → `<10k`, `10k_25k`, `25k_50k`, `50k_100k`, `100k_plus`; skatt → `lon/pension/lag/vet` och `angiven` (aldrig beloppet); år → `years_until` 0/1/2/3plus |
| `ampy_ak_verdict` | beskedsklassen ändras | `class` (ja/ja_villkor/troligen_inte/nej/osakert), `subtype`, `amount_bucket`, `unknowns_n`, `assumed_n` |
| `ampy_ak_expand` | "Fler detaljer", "Visa villkoren", "Så har vi räknat" öppnas | `section` |
| `ampy_ak_cta_click` | primär eller sekundär handling | `target` (offert/tel/mode_switch/article/skatteverket), `class`, `amount_bucket` |
| `ampy_ak_share` | dela eller kopiera eller skriv ut | `method` (native/clipboard/print) |

Regler (playbook instrumentation.md):
- **Consent-gatat**: allt buffras tills analytics-samtycke, max en cookielös ping (`ampy_tool_rendered`) före.
- **Ingen PII, inga exakta belopp**: buckets. Skattebelopp och inkomst loggas aldrig i någon form.
- **En experiment åt gången**, `experiment_id` på varje event. Testa först: (1) besked-först mot belopp-först i kortet, (2) CTA-verbet, (3) om skattefrågan A ligger öppen eller hopfälld. Candour-reglerna är aldrig variabler.
- **KPI**: offert-klick per 1 000 visningar på kort sikt; leads per 1 000 visningar när `/offert/` bär `src` (`[GAP dev]`). Raw "answers" är diagnostik, aldrig mål.
- Säljlänkar mäts separat via `src=salj`, aldrig via säljarnamn.

---

## 11. Tre kandidater till signaturenhet

Kriteriet: enheten ska **visa haken köparen jagar**, inte dekorera. En per riktning.

| Kandidat | Vad den visar | Haken den dramatiserar | Styrka | Svaghet | Passar riktning |
|---|---|---|---|---|---|
| (a) **Avdragsmätaren** | en mätare mot taket 50 000 kr (100 000 vid två ägare) som fylls av jobbets avdrag, med redan använt ROT/RUT som redan fylld del, och skatteutrymmet som ett andra tak när det är angivet | "taket", "potten är slut", "räcker skatten" (om (d) vävs in som andra taket) | gör pott-logiken och två-ägare-effekten synlig på en sekund, bra för stora jobb (batteri, sol) | svag på "är jag berättigad" (mätaren är meningslös vid nej), tom på små jobb, kräver siffror | **riktning "planera året"**: ROT + RUT + GT över året, två ägare, stora jobb |
| (b) **Villkorstavlan** | villkorsraderna som tänds en i taget när kunden bekräftar (hålring → bock), skatten sist; ett nej släcker tavlan med ett kryss | "finns det en hake?" i sin renaste form, beskedet **är** enheten | starkast för säljlänken (bekräfta tre saker), noll fejkprecision, gör antaget/bekräftat-modellen (§1.4) fysisk | beloppet blir bisak, ingen "wow"-siffra | **riktning "beskedet"**: den ärliga kollen, verdict-ledd |
| (c) **Kvittot** | tre rader som en faktura: arbetskostnad 100 %, avdrag 30 % (ROT: "material 0 %"), att betala | "vad betalar jag faktiskt" och ROT:s material-hake, GT:s "arbete och material" blir tydlig kontrast | den oflatterande siffran (fullt pris) står först, siffrorna är kundens, passar fakturamodellen ("dras på fakturan") `[GAP 1]` | säger inget om berättigande, riskerar att bli en vanlig räknare som SERP:en redan är full av | **riktning "offertens tvilling"**: beloppsledd, säljstöd |
| (d) **Skattestapeln** | två staplar: din skatt, ditt avdrag | "räcker skatten", pensionärsfrågan | träffar segmentet pensionär rakt | kräver skattebelopp (känsligt) eller blir en abstrakt stapel utan tal, fejkprecision om inkomst-proxy används | **vävs in i (a)** som mätarens andra tak, inte egen enhet |

Rekommenderad fördelning till de tre design-agenterna: **(b) Villkorstavlan**, **(c) Kvittot**, **(a+d)
Avdragsmätaren med två tak**. Alla tre bär samma frågebank, matris och CTA-regler ur den här filen;
det som skiljer är vilken enhet som sitter i beskedskortets slot 3 till 5 och hur beskedet och beloppet
viktas mot varandra. Ingen riktning får två enheter.

---

## 12. Grindlista, ägarbeslut och risker

### Öppna frågor (numrerade, fylls på i GRINDLISTA.md)
1. `[GAP 1]` Fakturamodellen: dras avdraget alltid direkt på fakturan för ROT? Styr ram-raden och "Vad händer nu" steg 1.
2. `[GAP]` Typiska belopp per jobbtyp och arbetskostnadsandel (ROT) per jobbtyp. Julius är källan. Utan dem: intervall och tak, aldrig punkt.
3. `[GAP ägare]` URL-slugar för de fristående sidorna (`/rot-kollen/`, `/gron-teknik-kollen/` är förslag).
4. `[GAP dev]` Kan `/offert/` läsa `src` och en kalkylsträng? Utan det ingen lead-attribution.
5. `[→ ROT-agent]` Hur femårsregeln räknas (värdeår), pension som skatteunderlag, bostadsrätt (inre underhåll), förälders bostad, två ägare, kvarvarande utrymme ROT/RUT, vad som räknas som "använt" (betalningsdatum), avräkningsordningen mot andra reduktioner.
6. `[→ GT-agent]` Bostadsrätt och fritidshus per läge, fristående batteri (hedgning), takordningen sol + batteri, egen pott mot ROT, formuleringen av "samma företag"-villkoret.
7. `[GAP ägare]` Får verktyget föreslå "nästa år" vid pott slut eller nybyggt hus?
8. `[GAP]` Vilka jobb ska ligga i `jobb`-chipsen (3c)?

### Tre beslut ägaren måste ta
1. **Skattefrågan:** C synlig + A frivillig (rekommenderat), eller bara C, eller B med signerad schablon.
2. **Fristående sidor + överlämning till `/offert/`:** bygga två URL:er med tillstånd i query-strängen och låta `/offert/` läsa `src` (rekommenderat), eller bara embed och tel.
3. **Hur strikt osäkerheten är, och nej-policyn:** ett "vet inte" ger "Ja, om <villkor>" (rekommenderat) eller alltid OSÄKERT; och att hyresrätt/under 18 aldrig får en säljknapp även om det kostar leads.

### Tre största riskerna
1. **Ett falskt ja på load.** Förvalsbeskedet är ett ja om en okänd besökare. Mitigering: rubriken "Ja, om det här stämmer:", hålringar, beloppet märkt "på ett jobb för 30 000 kr". Granskningen ska testa exakt det här.
2. **Beloppet vilar på osignerat underlag.** Arbetsandel (ROT) är [GAP] och regelvillkoren landar parallellt. Om de inte signeras före lansering ska beloppet skeppas i intervall- och takläge, aldrig punkt.
3. **Embed-höjd och två sticky-remsor på mobil.** Sprängs 900-budgeten trycks artikeln under två skärmar; kolliderar remsan med sajtens ring-bar blir det tre handlingar. Regel: remsan är av i embed, kortet är kompakt, design mäter.
