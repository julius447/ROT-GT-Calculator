# gt-spec · Beslutsmodell för Grön Teknik-kalkylatorn (2026)

Källa för varje regel: `research/02-gron-teknik-regelverk.md` (S-koder = `research/underlag/gt-kallor.md`).
Detta dokument beskriver **logik**, inte UI. Alla strängar under "UI-copy" är utkast i ampy-rost-registret:
du-tilltal, "kan" på skatteutfall, inga tank- eller halvstreck, "!" högst ett per besked.

Konstanter (år 2026, ägarbekräftad kanon §6.5):

```js
const TAX_YEAR = 2026;
const RATE = { gt_laddbox: 0.50, gt_batteri: 0.50, gt_sol: 0.15 };   // andel av arbete + material inkl. moms
const GT_CAP_PER_PERSON = 50000;                                     // kr, alla GT-kategorier tillsammans, per person och år
const SCHABLON_ARBETE_MATERIAL = 0.97;                               // Skatteverkets 3 %-schablon vid fast pris (S11); se GRIND 1
const ROT_RATE = 0.30;                                               // reservväg, bara arbetskostnad (ROT-agentens modell äger tak/skatt)
const MAX_OWNERS_UI = 2;                                             // UI-val, inte lagtak (GRIND 7)
```

---

## 1. Lägesväljare

| id | Etikett (UI) | Default | Kommentar |
|---|---|---|---|
| `gt_laddbox` | "Laddbox" | **JA** | Ampys kommersiella prioritet service > laddbox > batteri. |
| `gt_batteri` | "Solcellsbatteri" | | Solcellsgrindat (S8). |
| `gt_sol` | "Solceller" | | 15 %. Ingen Ampy-produkt-CTA utan ägarbekräftelse (GRIND 8). |

Delbar länk: `?lage=gt_batteri` förifyller läget. Byte av läge nollställer bara lägesspecifika frågor
(`solceller`, `pplats`), aldrig bostad/ägande/belopp.

---

## 2. Frågebank (minimal, per läge)

Ordning = ordningen frågorna ska ställas i. "Varför" = vad besökaren får ut; "Regel" = det villkor som testas.
Widgets är chips (radio) om inget annat sägs. `null` = obesvarad.

### 2.1 Gemensamt för alla lägen

| id | Etikett | Svar (värde) | Varför frågan finns | Regel |
|---|---|---|---|---|
| `bostad` | "Vilken typ av bostad gäller det?" | "Villa eller radhus" (`smahus`) · "Fritidshus" (`fritidshus`) · "Bostadsrätt" (`bostadsratt`) · "Ägarlägenhet" (`agarlagenhet`) · "Hyresrätt" (`hyresratt`) · "Hus som byggs just nu" (`nybygge`) | Segmentfrågorna folk googlar (bostadsrätt, fritidshus, hyresrätt, nybyggt). | 67 kap. 39 § IL (S13); hyresrätt = nej (S3); nybygge = ja, ingen femårsregel (S3). |
| `ager` | "Äger du bostaden, helt eller delvis?" (bostadsrätt: "Står du som innehavare av bostadsrätten?") | "Ja" (`true`) · "Nej" (`false`) | Grundvillkoret. Delägande räcker. | 39 § IL; S3 "äga bostaden när arbetet utförs". Döljs vid `hyresratt`. |
| `anvandning` | "Vem använder bostaden?" | "Jag själv, som hem eller fritidshus" (`sjalv`) · "Min förälder bor där" (`foralder`) · "Den hyrs ut eller någon annan bor där" (`annan`) | Skiljer uthyrd/barns bostad (nej) från eget och förälders hushåll (ja). | 41 § IL; S3 (uthyrd = nej, förälder = ja, barn = nej). Visas bara när `ager = true`. |
| `person_ok` | "Stämmer det här om dig?" (två kryss, förkryssade, "Ändra" visar dem) | `alder_18` (default `true`) · `skattskyldig_sverige` (default `true`) | Sällsynta stopp; ska inte kosta ett tryck för 98 % av besökarna. Antagandet skrivs ut i "Så har vi räknat". | 36 § IL: 18 år vid årets slut; obegränsat skattskyldig del av året (S13). |
| `material_fran_installator` | "Vem levererar utrustningen?" | "Samma företag som installerar" (`true`) · "Jag köper den själv" (`false`) | Materialfällan: självköpt = avdrag bara på arbetet. | S1/S2/S3. Leasing/hyrköp behandlas som `false` (S10) via tilläggsvalet "Hyr eller leasar" (`leasing = true`). |
| `pris_total_kr` | Laddbox: "Pris för laddbox med installation, inkl. moms" · Batteri: "Pris för batteri med installation, inkl. moms" · Sol: "Pris för solcellsanläggningen med installation, inkl. moms" | Reglage + fält. Default: laddbox 20 000 · batteri 70 000 · sol 150 000. Steg 500 kr. | Instant value på load kräver ett defaultbelopp; defaulten är ett runt tal, inte ett Ampy-pris (GRIND 1). | Underlag = arbete + material inkl. moms (36 § IL). |
| `pris_arbete_kr` | "Varav arbete (installationen), inkl. moms" | Fält. Visas bara när `material_fran_installator = false`, `leasing = true`, eller i ROT-reservvägen. | Behövs för arbetsdelen. | S1 ("enbart för installationsarbetet"); S6 (ROT). |
| `fast_pris_schablon` | "Är det ett fast totalpris där resor och projektering ingår?" | "Ja" (`true`) · "Nej, de står separat" (`false`, default) | Skatteverkets 97 %-schablon. Default = av, tills GRIND 1 avgjord. | S11; S5-exemplet. |
| `antal_agare` | "Hur många äger bostaden och kan dela på avdraget?" | "1" · "2" (default 1) | Taket är per person. | 45 § IL; S3 "någon annan i hushållet som också äger bostaden". |
| `gt_anvant_kr[i]` | "Har du använt grön teknik-avdrag tidigare i år?" (per ägare) | "Nej" (0, default) · "Ja, ungefär" + fält | Sol + batteri + laddbox delar potten. | 45 § IL (S13). |
| `rot_rut_anvant_kr[i]` | "Har du använt ROT eller RUT i år?" (per ägare) | "Nej" (0, default) · "Ja, cirka 25 000" · "Ja, cirka 50 000" · "Ja, cirka 75 000" · "Vet inte" (`null`) | ROT/RUT tar sin del av skatten före grön teknik. | 67 kap. 2 § IL (S13). |
| `skatt_tillganglig_kr[i]` | Levereras av ROT-agentens skattemodell via `availableTax` (inkomstband eller "vet inte"). GT-modellen ställer **ingen egen inkomstfråga**. | tal eller `null` | "Räcker din skatt?" | S1, S2. |

### 2.2 Bara `gt_laddbox`

| id | Etikett | Svar | Varför | Regel |
|---|---|---|---|---|
| `pplats` | "Var ska laddboxen sitta?" (visas bara när `bostad = bostadsratt`) | "På en p-plats som hör till min bostadsrätt och följer med när jag säljer" (`foljer_bostadsratten`) · "På en p-plats jag hyr av föreningen" (`hyrd_uppsagningsbar`) · "I föreningens gemensamma garage eller laddplatser" (`gemensamt`) · "Vet inte" (`vet_inte`) | Artikelns "dedikerad p-plats" håller inte; kravet är att platsen följer bostadsrätten och inte kan sägas upp. | S2 (Krav på var installationen utförs). |
| `tillagg_elcentral_kr` | "Behöver elcentralen bytas eller byggas ut samtidigt?" | "Nej" (0, default) · "Ja, ungefär" + fält | Elcentralen ger inte grön teknik; kan vara ROT. Håller underlaget rent. | S1 FAQ, S4. |

Ingen solcellsfråga i detta läge (BLOCK-fyndet i granskning-C): laddbox är inte solcellsgrindad (S13).

### 2.3 Bara `gt_batteri`

| id | Etikett | Svar | Varför | Regel |
|---|---|---|---|---|
| `solceller` | "Har du solceller på bostaden?" | "Ja, redan installerade" (`har`) · "Nej, men de installeras samtidigt som batteriet" (`samtidigt`) · "Nej" (`nej`) · "Vet inte" (`vet_inte`) | Solcellsgrinden. "Sen" räknas inte. | S8, S1 FAQ, S9. Hjälptext: "Solcellerna ska vara dina egna och sitta på samma fastighet. Grannens eller föreningens räknas inte." (TOLKNING, hedgas) |

Frågan om stödtjänster ställs **inte**: den påverkar inte avdraget (S7). Nämns i "Så har vi räknat".

### 2.4 Bara `gt_sol`

Inga extra frågor. Antaganden i "Så har vi räknat": anläggningen ansluts till elnätet och förser bara din
bostad (inte uthyrd del, ekonomibyggnad eller näringsverksamhet) (S2, S4).

---

## 3. Verdictklasser och prioritet

Utvärderas uppifrån och ner; **första träff vinner**. Klasser 1–7 ger `avdrag_kr = 0` (grön teknik).
Klass 8–11 är "berättigad" med flaggor. Flera flaggor kan gälla samtidigt inom klass 8–11.

| # | verdict | Villkor | Typ |
|---|---|---|---|
| 1 | `ej_hyresratt` | `bostad = hyresratt` | Stopp |
| 2 | `ej_ager_inte` | `ager = false` | Stopp |
| 3 | `ej_anvands_av_annan` | `anvandning = annan` | Stopp |
| 4 | `ej_person` | `alder_18 = false` eller `skattskyldig_sverige = false` | Stopp |
| 5 | `ej_brf_gemensamt` | `gt_laddbox` och `bostad = bostadsratt` och `pplats = gemensamt` | Stopp, route till föreningen (Ladda bilen) |
| 6 | `ej_brf_pplats_hyrd` | `gt_laddbox` och `bostad = bostadsratt` och `pplats = hyrd_uppsagningsbar` | Stopp, route till föreningen |
| 7 | `batteri_utan_sol_rot` | `gt_batteri` och `solceller = nej` | Stopp för GT, **reservväg ROT 30 % på arbetet** (candour: verktyget säger självmant den lägre siffran) |
| 8 | `osaker` | `gt_batteri` och `solceller = vet_inte`; eller `gt_laddbox` + `bostadsratt` + `pplats = vet_inte`; eller `gt_batteri` + `bostad = bostadsratt` (egen produktion kopplad till bostadsrätten kan inte bedömas här); eller `ager = null` / `bostad = null` | Osäker: beloppet visas som "kan bli", CTA "vi reder ut det" |
| 9 | `berattigad_skatt_racker_inte` | Berättigad, skatten känd och `avdrag_efter_skatt_kr < avdrag_kr` | Berättigad med återbetalningsrisk |
| 10 | `berattigad_tak` | Berättigad och `avdrag_brutto_kr > tak_kvar_kr` | Berättigad, taket slår i |
| 11 | `berattigad` | Allt annat | Berättigad |

Flaggor (bifogas oberoende av klass när villkoret gäller):
`material_ej_avdrag` (självköpt), `leasing_ej_material`, `elcentral_ej_gt_kan_vara_rot` (`tillagg_elcentral_kr > 0`),
`nybygge_ok_ingen_femarsregel`, `fritidshus_ok`, `foralders_hushall`, `brf_pplats_ok`, `skatt_okand`,
`gt_anvant_i_ar`, `rot_rut_anvant_i_ar`, `vaxelriktare_15_vid_samtidig_sol` (`solceller = samtidigt`),
`stodtjanster_paverkar_inte_avdraget` (batteri, klass 9–11 samt `samtidigt`/`har`), `schablon_97_tillampad`,
`tva_agare_delar`, `ladda_bilen_foreningen` (klass 5–6), `rot_ej_utanfor_lagenheten` (klass 6),
`rot_fallback_arbete_endast` (klass 7), `solceller_okant` / `pplats_okant` / `brf_batteri_kraver_egen_produktion`
(klass 8, säger vilken osäkerhet som gäller), `rot_rut_okant` (`rot_rut_anvant_kr = null` → `skatt_racker = "okant"`).

Testfallen i `gt-testfall.json` (36 st) använder exakt dessa namn; referensimplementationen av formeln i §4 ger
0 avvikelser mot dem (kört 2026-09-11).

`osaker` slår **inte** ut hårda stopp (1–7): ett hyresrättssvar är ett nej även om annat är obesvarat.

---

## 4. Beloppsformeln

```js
function gtCalc(inp) {
  const rate = RATE[inp.lage];
  const n = inp.antal_agare;                                      // 1 eller 2

  // 1. Underlag: arbete + material inkl. moms. Självköpt/leasat material ger bara arbetet.
  const materialOk = inp.material_fran_installator && !inp.leasing;
  let underlag = materialOk ? inp.pris_total_kr : inp.pris_arbete_kr;
  // Elcentral m.m. ligger aldrig i underlaget (S1 FAQ). pris_total_kr avser bara GT-installationen;
  // tillagg_elcentral_kr adderas till "att betala" men inte till underlaget.
  if (inp.fast_pris_schablon) underlag = underlag * SCHABLON_ARBETE_MATERIAL;   // 97 % (S11), GRIND 1

  // 2. Bruttoavdrag
  const avdragBrutto = Math.floor(rate * underlag);              // hela kronor (GRÖNFL 5 §)

  // 3. Tak: 50 000 per person minus redan använt GT i år, summerat över ägarna
  const takKvar = sum(i => Math.max(0, GT_CAP_PER_PERSON - (inp.gt_anvant_kr[i] || 0)), n);
  const avdragKr = Math.min(avdragBrutto, takKvar);              // det som dras på fakturan

  // 4. Skatt: GT ligger efter ROT/RUT i avräkningsordningen (67 kap. 2 § IL)
  let skattRacker = 'okant', avdragEfterSkatt = avdragKr, aterbetalningsrisk = 0;
  const skattKand = inp.skatt_tillganglig_kr.slice(0, n).every(v => v !== null)
                 && inp.rot_rut_anvant_kr.slice(0, n).every(v => v !== null);
  if (skattKand) {
    const skattKvar = sum(i => Math.max(0, inp.skatt_tillganglig_kr[i] - inp.rot_rut_anvant_kr[i]), n);
    avdragEfterSkatt = Math.min(avdragKr, skattKvar);
    aterbetalningsrisk = avdragKr - avdragEfterSkatt;
    skattRacker = aterbetalningsrisk === 0;
  }

  // 5. Att betala (fakturan): priset minus fakturaavdraget, plus ev. elcentral utanför GT
  const attBetala = inp.pris_total_kr - avdragKr + (inp.tillagg_elcentral_kr || 0);

  return { avdrag_brutto_kr: avdragBrutto, avdrag_kr: avdragKr, tak_kvar_kr: takKvar,
           avdrag_efter_skatt_kr: avdragEfterSkatt, aterbetalningsrisk_kr: aterbetalningsrisk,
           skatt_racker: skattRacker, att_betala_kr: attBetala };
}
```

**Fördelning mellan två ägare:** verktyget visar totalen och antar 50/50 om inget annat anges; fakturan bör ange
fördelningen (S3). När den ena ägarens tak eller skatt är förbrukad flyttas resten till den andra
(`takKvar`/`skattKvar` summeras över personerna, vilket motsvarar Skatteverkets omfördelningsmöjlighet, S3).

**ROT-reservvägen (klass 7):**
```js
rot_fallback_kr = Math.floor(ROT_RATE * inp.pris_arbete_kr);      // bara arbetskostnad, aldrig batteriet
// tak (50 000 ROT / 75 000 ROT+RUT) och skatt: anropa ROT-agentens modell med samma availableTax
att_betala_kr = inp.pris_total_kr - rot_fallback_kr;
```
Visas med "kan" och hänvisning till att ROT gäller elarbetet ("dra el", S6); Ampys arbetsandel är GRIND 5.

**Skattemodellens gränssnitt (delas med ROT-kalkylatorn):**
```ts
interface TaxCapacity {
  // per ägare: kommunal + statlig inkomstskatt + fastighetsavgift/-skatt, minus reduktioner som ligger
  // före hushållsarbete i 67 kap. 2 § IL (pensionsavgift, jobbskatteavdrag, förvärvsinkomst, underskott
  // av kapital). null = besökaren vet inte.
  availableTax(person: PersonInput): number | null;
}
// GT-modellen gör: skattKvar_i = max(0, availableTax_i - rotRutUsed_i); GT prövas mot skattKvar.
```
Konkret källa: ROT-agentens `logik/skatteutrymme_2026.py`, funktionen `skatteutrymme(...)`; fältet
`utrymme_rot_rut_gt` **är** `availableTax` (validerad mot Skatteverkets e-tjänst 2026-09-11 enligt filens
docstring). `skatt_tillganglig_kr[i]` i `gt-testfall.json` är exakt det värdet, så GT-testerna kan köras utan
lönetabellen. Modellens förenklingar (ingen sjöinkomst, ingen regional reduktion, ingen 4 %-spärr för
pensionärers fastighetsavgift) ärvs av GT-kalkylatorn och ska stå i "Så har vi räknat".

---

## 5. Obligatoriska hedges (renderas alltid, "Så har vi räknat")

1. "Avdraget är en skattereduktion. Räcker inte din skatt kan Skatteverket kräva tillbaka mellanskillnaden i
   slutskatten." (S2)
2. "Underlaget är arbete och material inkl. moms. Resor, frakt och projektering ger inte avdrag. Vid fast
   totalpris räknar Skatteverket normalt 97 % av priset som arbete och material." (S2, S11)
3. "Taket är 50 000 kr per person och år för solceller, batteri och laddbox tillsammans. ROT och RUT har en
   egen pott, men skatten ska räcka till allt." (S13, S3)
4. "Vi antar att du fyllt 18 år vid årets slut och betalar skatt i Sverige. Ändra om det inte stämmer." (S13)
5. "Slutbetalningen avgör vilket år avdraget hamnar på." (S2)
6. Batteri: "Att batteriet också används till stödtjänster eller att köpa billig el påverkar inte avdraget, så
   länge det lagrar din egen solel." (S7) Ingen lönsamhetssiffra visas.
7. Sol: "Solcellerna ska anslutas till elnätet och förse bara din bostad." (S2, S4)
8. Alltid: "Uppskattning, inte ett besked från Skatteverket och inte ett erbjudande. Företaget som installerar
   ansöker om avdraget, du kan inte göra det i deklarationen i efterhand." (S2)
9. Batteri utan sol: "ROT gäller arbetskostnaden för elarbetet, inte batteriet. Hur stor arbetsdelen är
   avgör beloppet." (S6, GRIND 5)

---

## 6. UI-copy per verdict (utkast, ampy-rost; inga tank- eller halvstreck)

Rubrikrad = enradsbeskedet. Under den: beloppsraden ("På fakturan: -12 500 kr" renderas av UI med vanligt
bindestreck eller minustecken, aldrig tankstreck). CTA-raden ärver beskedets mål (en primär CTA, per
granskning-C).

| verdict | Enradsbesked (UI) | CTA |
|---|---|---|
| `berattigad` (laddbox) | "Goda nyheter: du kan få 50 % grön teknik på laddboxen, draget direkt på fakturan." | "Få pris efter avdrag" |
| `berattigad` (batteri) | "Goda nyheter: batteriet kan få 50 % grön teknik eftersom det lagrar din egen solel." | "Få pris efter avdrag" |
| `berattigad` (sol) | "Du kan få 15 % grön teknik på solcellerna. Taket är 50 000 kr per person och år." | "Räkna på batteri också" (om GRIND 8 = nej) |
| `berattigad_tak` | "Du kan få avdraget, men taket på 50 000 kr per person slår i. Är ni två ägare kan ni dela på det." | "Få pris efter avdrag" |
| `berattigad_skatt_racker_inte` | "Avdraget dras på fakturan, men din skatt ser ut att täcka bara X kr. Resten kan Skatteverket kräva tillbaka i slutskatten." | "Prata med oss innan du beställer" |
| `berattigad` + `material_ej_avdrag` | "Du kan få 50 % på installationsarbetet. Boxen du köper själv ger inget avdrag. Köper du den av installatören gäller 50 % på båda." | "Få pris efter avdrag" |
| `berattigad` + `skatt_okand` | "Du kan få avdraget. Hur mycket som blir kvar beror på hur mycket skatt du betalar i år." | "Kolla ditt utrymme hos Skatteverket" (länk S17) |
| `berattigad` + `nybygge_ok_ingen_femarsregel` | "Ja, även i ett hus som byggs just nu. Grön teknik har ingen femårsregel, till skillnad från ROT." | "Få pris efter avdrag" |
| `berattigad` + `brf_pplats_ok` | "Ja, om p-platsen hör till bostadsrätten och följer med när du säljer. Föreningen ska godkänna installationen." | "Få pris efter avdrag" |
| `batteri_utan_sol_rot` | "Utan solceller gäller inte grön teknik för batteriet. ROT kan i stället ge 30 % på arbetskostnaden. Vi räknar på båda vägarna åt dig." | "Räkna på mitt fall" |
| `osaker` (sol vet inte) | "Det avgörs av om du har egna solceller. Vi kollar det åt dig innan du bestämmer något." | "Boka kostnadsfri genomgång" |
| `osaker` (p-plats vet inte) | "Det avgörs av om p-platsen följer bostadsrätten när du säljer. Fråga föreningen, eller låt oss kolla." | "Boka kostnadsfri genomgång" |
| `osaker` (batteri i bostadsrätt) | "Batteri i bostadsrätt kräver egna solceller kopplade till lägenheten. Det kan vi inte bedöma här." | "Prata med oss" |
| `ej_hyresratt` | "Grön teknik kräver att du äger bostaden. I hyresrätt är det fastighetsägaren som kan installera. Hör med din hyresvärd." | Ingen säljande CTA; länk till artikeln |
| `ej_ager_inte` | "Avdraget kräver att du äger bostaden, helt eller delvis. Äger någon annan i hushållet den kan den personen söka i stället." | "Läs mer om villkoren" |
| `ej_anvands_av_annan` | "Bostaden ska användas av dig eller din förälder. En uthyrd bostad eller ditt barns bostad ger inget avdrag." | "Läs mer om villkoren" |
| `ej_person` | "Avdraget kräver att du fyllt 18 år vid årets slut och betalar skatt i Sverige." | "Läs mer om villkoren" |
| `ej_brf_gemensamt` | "I föreningens garage är det föreningen som installerar. Den kan söka Naturvårdsverkets bidrag Ladda bilen i stället." | "Så hjälper vi föreningar" |
| `ej_brf_pplats_hyrd` | "En p-plats du hyr av föreningen ger inte grön teknik. Platsen måste höra till bostadsrätten och följa med när du säljer." | "Så hjälper vi föreningar" |

Röstkontroll före leverans: grep UI-strängarna på `—` och `–` (ska ge 0), räkna `!` (max ett per besked).

---

## 7. Instrumentering (playbook §5, consent-gatad)

`gt_view` · `gt_lage` {lage} · `gt_answer` {question_id, answer} · `gt_verdict` {verdict, flaggor[], lage,
avdrag_bucket} · `gt_cta_click` {target} · `gt_share` {lage}. Inga belopp i klartext, bara buckets.

---

## 8. Öppna punkter som styr logiken (se GRINDLISTA i 02-gron-teknik-regelverk.md)

GRIND 1 (97 %-schablon default), GRIND 4 (lastbalanserare i underlaget), GRIND 5 (arbetsandel batteri),
GRIND 7 (fler än två ägare), GRIND 8 (gt_sol-CTA). Ingen av dem hindrar att logiken byggs; de styr defaults
och copy.
