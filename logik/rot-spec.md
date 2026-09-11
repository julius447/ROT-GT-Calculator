# ROT-kalkylatorn · beslutsmodell (logik, inte UI)

Regelkälla: `research/01-rot-regelverk.md` (A-H, varje regel har källa). Referensimplementation som producerar
exakt de utfall som beskrivs här: `logik/rot_logik_ref.py` + `logik/skatteutrymme_2026.py`. Testfall:
`logik/rot-testfall.json` (41 st, genererade ur referensen, fyra av dem kalibrerade mot Skatteverkets e-tjänst).

Designdoktrin som modellen är byggd för (ampy-wireframe-ux): en skärm, ingen wizard, instant value på load
(defaultläge ger ett svar direkt), begränsade inputs som chips/sliders, live-omräkning, progressive disclosure
(skattedelen och tvåägar-delen fälls ut vid behov), EN CTA. Alla UI-strängar nedan: du-tilltal, "kan" på
skatteutfall, inga tank- eller halvstreck, "!" högst en per block.

---

## 1. Tre block, en skärm

1. **Gäller det dig?** (berättigande, 3-6 tryck) → verdict-klass + villkorsrader.
2. **Hur mycket?** (belopp, 1-3 fält) → avdrag i kr, att betala, fördelning vid två ägare, pott kvar.
3. **Räcker din skatt?** (2-4 fält, hopfällt tills block 1 gett ja/ja_med_villkor/osaker) → ryms / ryms delvis /
   ryms inte, med kronor och återbetalningsrisk.

Blocken räknar om live. Block 2 och 3 visas även vid `troligen_ej`/`osaker` men med hedge "om jobbet går igenom".
Vid `nej` visas priset utan avdrag och rätt hänvisning (hyresvärd/förening), inget skatteblock.

Fasta antaganden som visas som text, inte frågor (för att hålla frågesetet minimalt): "Vi antar att du betalar skatt
i Sverige, betalar elektroniskt (Swish, kort eller bank) och anlitar ett företag med F-skatt. Ampy har F-skatt."
[FACT: A9, G1, G2; ampy-foretagsdata §1.1]. Om `skattskyldig_sverige` behöver frågas (GRIND 13) blir den en
chip under "Fler alternativ".

---

## 2. Frågesetet (id, etikett, widget, varför, regel)

### Block 1: Gäller det dig?

| id | Etikett (UI) | Widget / alternativ | Varför | Regel |
|---|---|---|---|---|
| `bostadstyp` | "Vilken typ av bostad gäller jobbet?" | chips: `smahus` "Villa, radhus eller fritidshus" · `bostadsratt` "Bostadsrätt" · `agarlagenhet` "Ägarlägenhet" · `hyresratt` "Hyresrätt" · `vet_inte` "Vet inte". Underval om `bostadsratt`: `bostadsratt_smahus` "Bostadsrätten är ett radhus eller en villa" (kryssruta) | Avgör regelfamilj: småhus (femårsregel, tomt ok), bostadsrätt (bara inne, stadgar), hyresrätt (nej). Styr också fastighetsavgiften i block 3. | A5, B1, B10, B14 |
| `ager` | "Äger du bostaden, helt eller delvis?" | chips: `ja` "Ja" · `nej` "Nej" · `vet_inte` "Vet inte" (dolt vid `hyresratt`) | Ägande är absolut villkor. "Delvis" räcker. Dold ägare = nej men det frågas inte (för sällsynt), täcks av hedge. | A2, A13 |
| `bor` | "Vem bor där?" | chips: `jag` "Jag bor där" · `fritid` "Det är mitt fritidshus" · `foraldrar` "Mina föräldrar bor där" · `nykopt_flyttar_in` "Nyköpt, jag flyttar in efter jobbet" · `uthyrd` "Jag hyr ut den" · `barn` "Mitt barn bor där" · `sarbo` "Min särbo bor där" · `nej` "Ingen av oss bor där" | Hushållskravet. De tre nej-fallen är de folk faktiskt frågar om (FAQ K6). | A3, A4, A6, A7, A8 |
| `vardear` | "När blev huset färdigbyggt (värdeår)?" (bara `smahus`/`bostadsratt_smahus`) | chips: `t2011` "2011 eller tidigare" · `2012_2020` "2012 till 2020" · `2021_2025` "2021 till 2025" · `2026_ej_fardig` "2026, eller inte färdigt än" · `vet_inte` "Vet inte". Hjälptext: "Står i ditt senaste fastighetstaxeringsbeslut eller på Mina sidor hos Skatteverket." | Femårsregeln (gräns värdeår 2020 för 2026) och 15-årsbefrielsen från fastighetsavgift (2012+), som påverkar skatteutrymmet. Brytpunkterna flyttas med årsväxeln (GRIND 12). | B4, B5, B9, E3 |
| `arbetstyp` | "Vad ska göras?" (bara om `vardear` = `2021_2025` eller `vet_inte`) | chips: `reparation` "Laga eller byta ut något som finns, till likvärdigt" · `ombyggnad` "Nytt, mer eller bättre än idag (t.ex. större elcentral, nya grupper, laddbox-förberedelse)" · `vet_inte` "Vet inte" | Reparation ger ROT oavsett ålder; förbättring/ombyggnad spärras 2021-2025. Frågas bara när den avgör. | B5, B6, B8 |
| `plats` | "Var i huset görs jobbet?" (bara `bostadsratt`/`bostadsratt_smahus`/`agarlagenhet`) | chips: `inne` "Inne i lägenheten (elcentral, uttag, belysning)" · `utanfor` "Utanför: fasad, trapphus, förråd, garage, p-plats" · `vet_inte` "Vet inte" | "I lägenheten" är absolut för bostadsrätt; samfällighetsdelar nej för ägarlägenhet. | B10, B11, B14 |
| `myndig_vid_arsskiftet` | "Fyller du minst 18 i år?" | liten toggle, default ja, under "Fler alternativ" | 18-årskravet; nästan alltid ja, därför undanstoppad. | A1 |
| `bidrag_forsakring_gt` | "Betalas jobbet av försäkring, bidrag från kommun/stat, eller vill du ha grön teknik-avdrag för samma arbete?" | chips: `nej` "Nej" · `ja` "Ja" · `vet_inte` "Vet inte", under "Fler alternativ", default nej | Utesluter ROT. Sällsynt men ett hårt nej. | C10, C11 |
| `dodsbo` | "Gäller det ett dödsbo?" | chips `nej`/`fore_dodsfall`/`efter_dodsfall`, under "Fler alternativ", default nej | Bara arbete före dödsfallet. | A11 |

Defaultläge vid load (instant value): `smahus` · `ja` · `jag` · `t2011` · (arbetstyp dold) → verdict `ja`.
Default arbetskostnad: [GAP] Ampys typiska arbetskostnad för ett elcentralbyte (GRIND 2), tills dess 25 000 kr.

### Block 2: Hur mycket?

| id | Etikett | Widget | Varför | Regel |
|---|---|---|---|---|
| `arbetskostnad_inkl_moms` | "Arbetskostnad inkl. moms" | slider 0-300 000 i steg om 1 000 + fält; hjälp: "Bara arbetet ger avdrag. Står separat på Ampys offert." | Underlaget. | C1 |
| `material_inkl_moms` | "Material och övrigt inkl. moms (valfritt)" | fält, default 0 | Ger rätt "att betala" och tvingar fram candour-raden "materialet ger inget avdrag". | C2 |
| `agare_antal` | "Hur många ägare bor där och delar avdraget?" | chips `1` · `2` | Två potter, fri fördelning. | A13, D3 |
| `rot_anvant_i_ar` (per ägare) | "ROT redan använt 2026" | fält, default 0; hjälp: "Kolla Mina skattereduktioner hos Skatteverket." | Potten. | D2, D8 |
| `rut_anvant_i_ar` (per ägare) | "RUT redan använt 2026" | fält, default 0 | 75 000-taket. | D2 |

### Block 3: Räcker din skatt? (progressive disclosure, per ägare)

| id | Etikett | Widget | Varför | Regel |
|---|---|---|---|---|
| `inkomsttyp` | "Vad har du för inkomst?" | chips `lon` "Lön" · `pension` "Pension" · `bada` "Både lön och pension" | Pensionsavgift och jobbskatteavdrag gäller bara lön; förhöjt grundavdrag bara 66+. | E3 |
| `manadsinkomst` | "Ungefärlig bruttoinkomst per månad" | slider 10 000-100 000 i steg om 1 000, default 35 000; vid `bada`: två fält `lon_manad` + `pension_manad` | Hela skatteberäkningen. Ingen lagring. GRIND 6. | E3 |
| `fyllt_66_vid_arets_ingang` | "Hade du fyllt 66 den 1 januari 2026?" | toggle, default nej (default ja om `pension`) | Förhöjt grundavdrag, JSA-formel för 66+. 67 från 2027 (GRIND 12). | E3 |
| `ranteutgifter_ar` | "Ränteutgifter per år (valfritt)" | fält, default 0; hjälp: "Bolåneräntan ger ränteavdrag som räknas av före ROT. 100 000 kr i ränta tar 30 000 kr av utrymmet." | Underskott av kapital ligger före ROT. | E2, E4 |
| `kommunalskatt` | "Kommunalskatt (valfritt)" | fält, default 32,38 %, under "Fler alternativ" | ±6 000 kr band vid 30 000 kr/mån. GRIND 7. | E5 |
| `gron_teknik_planerad_i_ar` | "Planerar du också grön teknik-avdrag i år (laddbox, batteri, solceller)?" | fält kr, default 0, under "Fler alternativ" | GT räknas av efter ROT; visar vilket avdrag som förlorar. | F3 |
| `taxeringsvarde` (härledd) | visas inte | `smahus` + `t2011` → 1 390 000 (ger maxavgiften 10 425) · `smahus` + `2012_2020`/`2021_2025` → 0 · bostadsrätt → 0 · ägarlägenhet → 1 390 000 | Fastighetsavgiften ingår i poolen. Kan exponeras som fält "Fastighetsavgift per år" om ägaren vill. | E3 |

---

## 3. Verdict-klasser och precedens

| klass | betydelse | typiska utlösare |
|---|---|---|
| `nej` | Ett absolut villkor faller. | hyresrätt · äger inte · bor inte där (uthyrd, barn, särbo) · under 18 · inte skattskyldig i Sverige · försäkring/bidrag/GT på samma arbete · dödsbo efter dödsfall · nybygge inte färdigställt · bostadsrätt/ägarlägenhet utanför lägenheten |
| `troligen_ej` | Regeln pekar mot nej men beror på Skatteverkets klassning av jobbet. | värdeår 2021-2025 + ombyggnad/förbättring |
| `osaker` | En avgörande fråga är obesvarad ("vet inte"). | ägande okänt · värdeår okänt (utom vid ren reparation) · plats okänd · bostadstyp okänd · stöd okänt |
| `ja_med_villkor` | Ja, men ett villkor måste hålla och sägs ut. | bostadsrätt inne (stadgar) · föräldrars bostad (delägande + utgift) · nyköpt (flytta in direkt) · värdeår 2021-2025 + reparation (likvärdigt material) · dödsbo före dödsfall |
| `ja` | Alla villkor uppfyllda. | |

**Precedens när flera villkor faller:** `nej` > `troligen_ej` > `osaker` > `ja_med_villkor` > `ja`. Ett enda `nej`
vinner alltid, även om andra svar är "vet inte". Alla utlösta flaggor listas ändå (kunden ska se allt som gäller),
men rubrik och ton styrs av den vinnande klassen. Flaggor som bara påverkar skatteutrymmet (t.ex.
`fastighetsavgift_befriad`) ändrar inte klassen.

---

## 4. Beloppsformeln

```
avdrag_brutto  = round(arbetskostnad_inkl_moms × 0,30)                      # C1, D1
pott_i         = max(0, min(50 000 − rot_anvant_i, 75 000 − rot_anvant_i − rut_anvant_i))   # D2, per ägare i
avdrag         = 0 om verdict = nej, annars min(avdrag_brutto, Σ pott_i)     # D3
fördelning     = fyll ägaren med störst pott först, sedan nästa (fakturan får fördela fritt)   # D3, GRIND 8
att_betala     = arbetskostnad + material + övrigt − avdrag
```

Skattekapacitet per ägare (E3, `skatteutrymme_2026.py`):

```
utrymme_i      = (kommunal + statlig + fastighetsavgift)
                 − allmän pensionsavgift (7 % av lön, max 47 100)
                 − jobbskatteavdrag (67:7 eller 67:8)
                 − skattereduktion för förvärvsinkomst (max 1 500)
                 − 30 % av ränteutgifter (21 % över 100 000)
behov_i        = rot_anvant_i + rut_anvant_i + fördelning_i                 # redan använt tar utrymme först
ryms_i         = min(behov_i, utrymme_i);  återbetalningsrisk_i = behov_i − ryms_i
gt_ryms_i      = max(0, min(gt_planerad_i, utrymme_i − behov_i))            # GT efter ROT/RUT (67:2), F3
skatt_racker   = ryms | ryms_delvis | ryms_inte | ej_bedomd (inkomst ej ifylld) | ej_relevant (verdict nej)
```

Årsparametrar (byts vid årsväxel, GRIND 12): prisbasbelopp 59 200 · snittkommunalskatt 32,38 % · skiktgräns
643 000 · pensionsavgiftstak 47 100 · fastighetsavgiftstak 10 425 · femårsregelns gränsår 2020 · fastighetsavgifts-
befrielsens gränsår 2012 · åldersgräns 66.

---

## 5. Hedges som MÅSTE finnas (varje visning)

1. "kan" på varje utfall: "du kan använda", "kan bli kvarskatt", aldrig "du får" eller "du slipper".
2. "Preliminärt" vid varje kronbelopp i block 3, och raden: "Skatteverket avgör i slutskattebeskedet. Räcker inte
   skatten betalar du mellanskillnaden." [D7]
3. "Bara arbetskostnaden ger avdrag, inte material eller resor." [C1, C2] visas alltid i block 2.
4. "Det är betalningsdatumet som avgör vilket år avdraget hamnar på." [D5] visas när potten är slut eller när datumet
   är nära årsskiftet (december).
5. "Räkna bort ROT och RUT du redan använt i år." [D8, K11:s egen varning] som hjälptext vid fälten.
6. "Inte ett erbjudande, inte bindande. Vi lagrar inget du fyller i." (playbook + GRIND 6)
7. Vid `troligen_ej` och `osaker`: "Skatteverket bedömer varje jobb för sig. Vi kollar det åt dig innan du bestämmer
   något."
8. Aldrig: "aldrig ute med pengarna", "garanterat", "alltid" (GRIND 1, R8).

---

## 6. Verdict-copy, en rad per klass (utkast, ampy-rost, inga tank-/halvstreck)

| klass | rubrik | följdrad (byggs av flaggorna) |
|---|---|---|
| `ja` | "Goda nyheter: du kan använda ROT-avdraget på det här jobbet." | "30 % av arbetskostnaden dras direkt på fakturan, upp till 50 000 kr per person och år." |
| `ja_med_villkor` | "Du kan använda ROT-avdraget, med ett villkor att hålla koll på." | villkorsraden för flaggan (tabell nedan) |
| `troligen_ej` | "Troligen inte den här gången." | orsaksraden + "Vi lämnar gärna ett fast pris utan avdrag, utan överraskningar på slutfakturan." |
| `nej` | "Nej, ROT-avdraget gäller inte här." | orsaksraden + hänvisning (hyresvärd, förening, Skatteverket) |
| `osaker` | "Vi kan inte säga säkert än." | "Det hänger på [fråga]. Vi kollar det åt dig i den kostnadsfria genomgången, innan du bestämmer något." |

Skatteblocket:

| `skatt_racker` | rad |
|---|---|
| `ryms` | "Din skatt räcker preliminärt för hela avdraget, ca [utrymme] kr i utrymme mot [behov] kr." |
| `ryms_delvis` | "Din skatt räcker preliminärt för [ryms] kr av [behov] kr. Resterande [risk] kr kan bli kvarskatt nästa år." |
| `ryms_inte` | "Din skatt räcker preliminärt inte för avdraget. Hela beloppet, [behov] kr, kan bli kvarskatt." |
| `ej_bedomd` | "Fyll i din inkomst så räknar vi på om skatten räcker. Vi lagrar inget." |
| `ej_relevant` | (visas inte) |

Flaggor → rad (maskinkod i `rot_logik_ref.py` → svensk text):

| flagga | rad |
|---|---|
| `hyresratt` | "I en hyresrätt äger hyresvärden bostaden och ansvarar för elen. Hör med din hyresvärd." |
| `ager_inte` | "ROT kräver att du äger bostaden, helt eller delvis. Den som äger kan i stället stå på fakturan." |
| `uthyrd_bostad` | "En bostad du hyr ut räknas inte som ditt hushåll, så avdraget gäller inte den delen." |
| `barnets_bostad` | "Ditt barns bostad räknas inte som ditt hushåll, även om du äger den. Är barnet ägare kan barnet få avdraget." |
| `sarbos_bostad` | "Särbos bostad räknas inte som ditt hushåll. Din särbo kan få avdraget om hen äger bostaden." |
| `bor_inte_dar` | "Ingen i hushållet bor i bostaden, då gäller inte ROT." |
| `under_18` | "Du behöver fylla 18 senast vid årets slut. En vuxen ägare kan stå på fakturan i stället." |
| `ej_skattskyldig_sverige` | "ROT förutsätter att du betalar skatt i Sverige. Kolla med Skatteverket vad som gäller för dig." |
| `bidrag_forsakring_eller_gt_samma_arbete` | "Betalas arbetet av försäkring, bidrag eller grön teknik-avdrag kan du inte få ROT för samma arbete." |
| `dodsbo_efter_dodsfall` | "Ett dödsbo kan bara få ROT för arbete som gjordes före dödsfallet." |
| `ej_fardigstallt_nybygge` | "Tills huset är taxerat som färdigbyggt räknas allt elarbete som del av bygget, och bygget ger inte ROT." |
| `utanfor_lagenheten` | "I en bostadsrätt gäller ROT bara inne i lägenheten. Fasad, trapphus, förråd och p-plats är föreningens sak." |
| `femarsregeln_ombyggnad` | "Huset är yngre än fem år (värdeår 2021 eller senare). Då ger nytt, mer eller bättre inget ROT förrän femte året efter värdeåret. Att laga eller byta till likvärdigt går." |
| `femarsregeln_endast_reparation` | "Villkor: huset är yngre än fem år, så avdraget gäller bara om jobbet återställer elen till samma skick med likvärdigt material." |
| `femarsregeln_arbetstyp_okand` | "Huset är yngre än fem år. Om jobbet är en reparation kan du få ROT, om det är nytt eller bättre troligen inte. Vi reder ut vilket." |
| `agande_okant` | "Om du äger bostaden avgör allt. Står du på köpekontraktet eller är medlem i föreningen är du ägare." |
| `vardear_okant` | "Värdeåret avgör. Det står i ditt senaste fastighetstaxeringsbeslut eller på Mina sidor hos Skatteverket." |
| `plats_okand` | "Om jobbet görs inne i lägenheten eller utanför avgör. Elcentral och uttag inne är ok, fasad och p-plats är inte." |
| `bostadstyp_okand` | "Bostadstypen avgör vilka regler som gäller. Villa, bostadsrätt eller hyresrätt?" |
| `stod_okant` | "Betalas något av jobbet av försäkring eller bidrag? Då kan ROT falla bort för den delen." |
| `brf_stadgar_inre_underhall` | "Villkor: jobbet ska gälla sådant du själv ansvarar för enligt föreningens stadgar. Elcentral, uttag och belysning inne i lägenheten brukar vara ditt." |
| `foraldrars_bostad_delagande_och_utgift` | "Villkor: du äger del av bostaden, du betalar fakturan och dina föräldrar bor i Sverige." |
| `nykopt_flytta_in_direkt` | "Villkor: ingen annan bor där under jobbet och du flyttar in direkt efter." |
| `fritidshus_ingen_annan_permanent` | "Fritidshus räknas som bostad så länge ingen annan bor där permanent." |
| `dodsbo_fore_dodsfall` | "Villkor: arbetet är utfört före dödsfallet." |
| `fastighetsavgift_befriad` | "Nybyggda hus betalar ingen fastighetsavgift de första 15 åren, så ditt skatteutrymme blir ca 10 000 kr lägre än för ett äldre hus." |
| `bara_arbetskostnad_ger_avdrag` | "Bara arbetskostnaden ger avdrag. Material och resor betalar du fullt." |
| `pott_delvis_forbrukad` | "Du har redan använt en del av årets pott." |
| `pott_slut_i_ar` | "Årets pott är slut." |
| `betala_efter_arsskiftet_ny_pott` | "Betalar du efter årsskiftet hamnar avdraget på nästa år, med ny pott. Det är betalningsdatumet som räknas." |
| `taket_begransar` | "Taket är 50 000 kr ROT per person och år, och 75 000 kr för ROT och RUT tillsammans." |
| `flera_agare_delar` | "Ni som äger och bor där kan dela på avdraget som ni vill. Båda ska stå med på fakturan." |
| `omfordela_mellan_agare` | "Skatten räcker inte hos er båda. Lägg mer av avdraget på den av er som har mest utrymme, inom 50 000 kr per person." |
| `gt_efter_rot_racker_inte` | "ROT räknas av före grön teknik. Med både ROT och grön teknik i år räcker din skatt preliminärt inte till hela grön teknik-avdraget, [gt_risk] kr kan bli kvarskatt." |
| `ranteavdrag_minskar_utrymmet` | "Ditt ränteavdrag räknas av före ROT och minskar utrymmet." |

---

## 7. Så har vi räknat (metodblock, hopfällt)

Tre rader räcker: (1) "30 % av arbetskostnaden inkl. moms, max 50 000 kr per person och år, ROT och RUT tillsammans
max 75 000 kr." (2) "Skatteutrymmet är din kommunala och statliga inkomstskatt plus fastighetsavgift, minus de
skattereduktioner som räknas av före ROT: allmän pensionsavgift, jobbskatteavdrag, skattereduktion för förvärvsinkomst
och ränteavdrag. Samma ordning som Skatteverket använder (inkomstskattelagen 67 kap. 2 §)." (3) "Vi räknar med
2026 års belopp: prisbasbelopp 59 200 kr, snittkommunalskatt 32,38 %, skiktgräns 643 000 kr. Skatteverkets egen
räknare ger samma resultat med samma uppgifter." Länk: Skatteverket "Räkna ut rot- och rutavdrag".

---

## 8. Instrumentering (consent-gatad, playbook §5)

`rot_view` · `rot_answer {question_id, answer}` · `rot_verdict {verdict, flaggor[]}` · `rot_amount {avdrag_bucket}` ·
`rot_tax {skatt_racker, utrymme_bucket}` · `rot_cta_click {target}`. Inkomstvärden skickas aldrig, bara buckets
(t.ex. 20-30k). Inga personuppgifter, ingen lagring.

---

## 9. Öppet för UX-agenten (inte logikfrågor)

- Default arbetskostnad och en "typexempel"-väljare (elcentral / laddbox-förberedelse / felsökning+reparation) kräver
  GRIND 2.
- Om `bostadstyp` = `hyresratt` ska CTA:n inte sälja (granskning-C §5): "Hör med din hyresvärd".
- Delbar länk med förifyllt läge (`?bostad=smahus&vardear=t2011`) kräver att inga inkomstvärden går i URL:en.
