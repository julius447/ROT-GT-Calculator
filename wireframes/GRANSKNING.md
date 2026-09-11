# Granskning av de tre wireframes (red team, 2026-09-11)

Granskare: reviewer-agenten. Byggarna rättar själva enligt `PUNCHLISTA.md` i sin mapp. Inga filer i `logik/`,
`_shared/` eller riktningarnas mappar är ändrade. Alla prober, mätfiler och skärmdumpar som bevisen bygger på
ligger i `wireframes/_review/` (Playwright ur `tools/node_modules`, Chromium, 1440×1000 och 390×844).

## 0. Vad som faktiskt kördes (bevis, inte berättelse)

| Steg | Fil i `_review/` | Utfall |
|---|---|---|
| Motorns facit för sex scenarier | `engine-truth.mjs` | `evaluate()` + `resolveTexts()` med samma `touched` som en kund som trycker på chipsen |
| Sanningskörning, sex scenarier × A/B/C, drivna genom UI:t (tryck, skriv, öppna Fler detaljer) | `truth.mjs` → `truth-desktop.json`, `truth-mobile.json`, `shots/truth-*.png` | 36 körningar, 0 JS-fel; mobil = desktop i allt utom B:s versal-etikett |
| Isolering av två misstänkta fel | `isolate.mjs` | C:s count-up-race och B/C:s saknade bekräfta-tryck bekräftade |
| Interaktion + tillgänglighet | `a11y.mjs` → `a11y.json` | struktur, tabbordning, pilar, aria-live, reduced motion, remsa, kopiera länk, print, utan JS, tryckytor |
| Sticky-remsan mot kortets synlighet, per 300 px | `sticky.mjs` | A och C rätt; B visar remsan vid sidans slut |
| Embed-mätning 390 px, ROT/laddbox/batteri | `embed.mjs` → `embed.json`, `shots/embed-*.png` | se §5 |
| Vikningsförslag mätta i DOM (dölj element, mät om) | `folds.mjs` | se §5 |
| Kontrast (beräknad ur computed style med alfa-komposition) | `contrast.mjs` → `contrast.json` | se per riktning + §3 |
| 13 extra tillstånd × A/B/C: CTA-disciplin, rubrik mot motorn, bannade ord, streck, "!" | `states.mjs` → `states.json` | CTA rätt i alla 39 körningar |
| Grep på tankstreck, mittpunkt, ellipsis, gradient-text, scrims, "!" | (bash) | 0 tankstreck, 0 mittpunkter i alla tre; B har 2 ellipsis |
| Alla PNG:er i `skarmdumpar/` öppnade + egna renderingar | `shots/*.png`, `shots/crop-*.png` (3×) | referensen `.claude/skills/ampy-design-system/reference` renderad till `shots/ref-*.png` |

---

## 1. Sanningsmatrisen (sex scenarier, det som faktiskt VISAS)

Motorns värden är facit. "=" betyder identiskt med motorn (och identiskt på mobil). Avvikelser i fetstil.

| # | Scenario | Motorn | A | B | C |
|---|---|---|---|---|---|
| 1 | Förval ROT | ja_villkor · "Ja, om det här stämmer:" · Ungefär 4 100 kr till 6 800 kr · Att betala ungefär 23 300 kr till 26 000 kr · CTA "Få ett pris efter avdrag" (solid) · tel | = | = (kvittoform: "-4 100 till -6 800 kr", "ca 23 300 till 26 000 kr", samma tal) | = |
| 2 | ROT villa, värdeår 2021–2025, 60 000, lön (alla fyra tryckta) | ja_villkor/vardear · **"Ja, om jobbet är en reparation"** · Ungefär 8 100 kr till 13 500 kr · 46 500 kr till 51 900 kr · solid offert | = | **"Ja, om det här stämmer:", 3 saker att kolla** (trycket på villa/lön registreras inte, raderna står som antaget) | **samma fel som B** |
| 3 | ROT hyresrätt | nej/hyra · "Nej, avdraget gäller den som äger bostaden" · belopp dolt · ingen knapp · textlänk "Hör med din hyresvärd" · ingen tel | = | = (stämpel GÄLLER INTE) | = |
| 4 | GT laddbox bostadsrätt, p-plats orörd | ja_villkor · "Ja, om det här stämmer:" · Uppskattat avdrag: 10 000 kr · Att betala 10 000 kr · solid tel "Ring så reder vi ut vad som gäller i din förening" · sekundär Skatteverket | = | = ("-10 000 kr") | = |
| 5 | GT batteri, solceller = nej | troligen_inte/batteri_utan_sol · "Troligen inte grön teknik utan egna solceller. ROT kan gälla elarbetet i stället" · "ROT 30 % på arbetskostnaden kan gälla i stället" · inget att betala · solid "Räkna med ROT i stället" · tel | = | = ("Ange arbetskostnaden", att betala "beror på arbetsdelen") | **avläsningen visar "Uppskattat avdrag: 35 000 kr"** (batteriets avdrag som inte gäller; count-up-race, se C-B1) |
| 6 | ROT Fler detaljer: två ägare, 40 000 använt, 100 000, arbete 60 000 | ja_villkor · "Ja, om det här stämmer:" · Uppskattat avdrag: 18 000 kr · Att betala 82 000 kr · "60 000 kr kvar av årets pott" · solid offert, href `…&a=100000&ak=60000` | = | = ("-18 000 kr", 82 000 kr) | = |

Villkorsradernas tillstånd: identiska med motorn i 16 av 18 körningar; avvikelsen är S2 i B och C (boende och skatt
"antaget" i stället för bekräftat). CTA-href: identisk i alla 18 (`/kontakt/?src=avdragskollen&m=…&b=…&v=…&a=…[&ak=…]`,
aldrig inkomst). Disclaimern (ordagrann, 05 §3.3) syns i alla 18. Källa + datum-raden syns bara i A (B och C har den
inne i "Så har vi räknat").

**Slutsats sanning:** A är lika med motorn i alla sex. B och C är lika med motorn i fyra av sex; de två avvikelserna är
inte räknefel utan interaktionsfel (bekräfta-trycket saknas) och ett renderingsrace (C). Talen som visas är motorns i
alla tre, med ett undantag: C:s 35 000 kr i scenario 5 är ett falskt belopp bredvid ett "troligen inte".

---

## 2. Embed-mätning (390 × 844, demo-remsan borträknad)

Budget (UX §6.2): verktyget ≤ 900 px, första brödtextraden senast vid ca 1 540 px (två skärmar = 1 688).

| Riktning | ROT | GT laddbox | GT batteri | Snabbfakta börjar (ROT) | Första brödtextstycket (ROT) |
|---|---|---|---|---|---|
| A | **1 154** | 1 094 | 1 249 | 1 899 | 1 937 |
| B | **1 245** | 1 234 | 1 414 | 1 998 | 2 072 |
| C | **1 398** | 1 538 | 1 689 | 2 121 | 2 160 |

Ingen håller budgeten. Verktyget börjar vid 704–712 px (attrappen är ca 70 px högre än mallens 640).

**Den enskilt mest verksamma vikningen per riktning (mätt i DOM, inte gissad):**

| Riktning | Vikning | Höjd efter |
|---|---|---|
| A | Ta bort det dubblerade beloppsblocket (`#ak-rot-sum`) i embed; beloppet står redan i tavlans beloppsrad. Att betala + källrad in i "Visa villkoren". | **912 px** (utan tel-länken 856, utan lead 808) |
| B | Fäll `vardear` + `skatt` bakom Fler detaljer i embed, deras antaget-rader kvar (klickbara) i kvittots fällrad. | **1 062 px** (+ stryk lead → 1 002; + tel → 959). Selecten som B använder är inte acceptabel som kompromiss, se B-M3: med chips i två kolumner à 44 px blir det ca 1 150. |
| C | Skatt-chipsen in i den befintliga fällraden "Räcker skatten?". | **1 235 px**; + mätarens linjal, legend och takrad → 1 170; + lead + tel → 1 065. Ingen enskild vikning når 1 000: C:s embed kräver en annan arketyp (två synliga frågor). |

---

## 3. Gemensamt för alla tre (utanför byggarnas mappar)

| Nr | Allvar | Lins | Fynd | Åtgärd (ägare / logik) |
|---|---|---|---|---|
| S-1 | Major | DESIGN/A11Y | Vit text på `--ap-teal` #00a991 = **2,96:1** (kräver 4,5:1; 3:1 om ≥ 18,66 px/700). Alla tre CTA-knappar, A:s och C:s teal-eyebrows, C:s valda chips. Uppmätt i `contrast.json`. | Designsystemets token, inte byggarnas. Ägarbeslut: acceptera (produktionen har samma), eller en mörkare text-teal för text-på-teal (#007d6b ≈ 5,1:1). Eyebrows i `--ink-muted` eller teal bara som bar före texten (som referensen) löser textfallet lokalt. |
| S-2 | Major | CONVERSION (motorn) | 05 §1.3: "JA MEN skatten räcker bara delvis" ska ha **tel** som primär ("Prata med oss innan du beställer"). Motorn ger offert-knappen; alla tre visar solid "Få ett pris efter avdrag" bredvid varningen "13 900 kr kan bli kvarskatt". | `ctaFor()` i `logik/ui-model.js`: `begransad_skatt` → tel primär. Logik-agenten. |
| S-3 | Major | CONVERSION (motorn) | GT solceller får solid offert. 05 §1.3 / GT GRIND 8: ingen säljknapp om Ampy inte säljer sol; textlänk "Räkna på batteri till solcellerna" + tel. | Ägargrind + `ctaFor()`. |
| S-4 | Minor | CONVERSION (motorn) | 05 §6: CTA i embed ska bära `src=artikel`; motorn hårdkodar `src=avdragskollen` och wireframen kan inte skicka in ytan. | `offertHref(mode, eff, klass, opts)` med `opts.src`. |
| S-5 | Minor | TRUTH (motorn) | Två ägare: motorn lägger avdraget på ägare 1 (störst pott) även när ägare 1:s skatteutrymme är minst; ägare 2 får status `ryms` med behov 0 så raden `v.agare.omfordela` triggas aldrig. Kört i Node mot motorn (samma fall som C-B3): 150 000 kr arbete, 15 000/60 000 kr i månadsinkomst → "räcker till 22 100 kr av 45 000 kr" trots 149 000 kr utrymme hos ägare 2. | ROT-agentfråga (rot-spec §4 fördelning). |
| S-6 | Minor | VOICE (COPY) | `sk.ej_bedomd`/`sk.ej_bedomd.lag` säger "under Fler detaljer"; i C ligger fördjupningen framme. | Copyvariant utan platsangivelse. |
| S-7 | Minor | A11Y | Space/Enter på en redan vald radio ger inget event i någon riktning: en tangentbordsanvändare kan inte bekräfta ett förval (A bekräftar bara på klick). | Se A-M2, B-B1, C-B2. |

---

## 4. Fynd per riktning

Allvar: **Blocker** = får inte visas för ägaren som färdig / måste rättas före val. **Major** = rättas före produktion,
påverkar sanning, konvertering eller doktrin. **Minor** = hantverk.

### 4A. Riktning A, Villkorstavlan

Blockers: 0 · Majors: 5 · Minors: 6

| Nr | Allvar | Lins | Element / fil:rad | Fynd | Åtgärd |
|---|---|---|---|---|---|
| A-M1 | Major | DESIGN | beloppsraden `app.js:125` + `renderSum` `app.js:208`, `core` `app.js:267` | Beloppet visas två gånger: "DITT AVDRAG, PRELIMINÄRT · Ungefär 4 100 kr till 6 800 kr" i tavlans beloppsrad och igen i blocket under tavlan. I embed på 390 står de 250 px isär i samma skärm (`skarmdumpar/embed-mobile.png`). Riktningen säger "en lugn rad under tavlan", inte två. | Ett belopp. Fristående: ta bort `lines.unshift(result.belopp.rubrik)` (raden visar frågan + reglaget med neutral prick) och behåll blocket. Embed: behåll radens belopp och rendera inte `renderSum` i `core`; att betala + källrad in i "Visa villkoren". Mätt: embed 1 154 → 912 px. |
| A-M2 | Major | INTERACTION/A11Y | `bind`, `app.js:616–623` | Bekräfta-trycket fungerar med mus och finger (click-lyssnaren) men inte med tangentbord: Space på en redan vald radio ger varken `click` eller `change` (probe `a_confirm_keyboard_space`: alla rader antaget). | Lyssna även på `keydown` (Space/Enter) på `input[type=radio][data-q]` och kalla `radioAnswer(el)` när `el.checked`. |
| A-M3 | Major | DESIGN/EMBED | `.is-compact` `styles.css:316–317`, `ui.svara` `app.js:21, 191, 466` | Kompakta rader i artikeln på mobil döljer chipsen bakom "Svara" (14 px text, 24 px hög) och "Ändra pris". Bryter "alla frågor på en yta" (UX §1.4) och 44 px-regeln; raden läses som ett påstående, inte som något att svara på (`shots/crop-a-compact-rows-embed-mobile.png`). | Gör hela raden tryckbar (statement-knappen full bredd, `min-height: 4.4rem`, chevron i `--ink`), öppna första raden från start, och skriv "Svara" som knapp, inte understruken länk. Alternativ: chips synliga men i två kolumner à 44 px utan hjälptext (mätt av byggaren till 1 763 px, för dyrt); det kompakta läget kan stå kvar om affordansen fixas. |
| A-M4 | Major | EMBED | hela kortet | 1 154 px mot 900; Snabbfakta vid 1 899 px (mål ≤ ca 1 540). | A-M1 (embed-delen) ger 912 px. |
| A-M5 | Major | A11Y | `.ak-verdict--ja .ak-eyebrow` `styles.css:92`; `.ak-btn` | Eyebrow i teal 2,96:1 i ja-lägen; CTA vit på teal 2,96:1 (delat S-1). | Eyebrow: `--ink-muted` även i ja-lägen (klassen bärs redan av kanten + märket). CTA: ägarbeslut S-1. |
| A-m1 | Minor | DESIGN | `--ak-measure: 86rem` `styles.css:7, 47` | Tavlan är 860 px bred på 1 440: 290 px tomt på var sida. Fullbreddsdirektivet (2026-08-14) mot riktningens "760–840 px". | Ägarfråga. Om fullbredd: `--ak-measure: 104rem`, `--ak-cond-col: minmax(0, 30rem)`. |
| A-m2 | Minor | A11Y | `.ak-row__stmt` `styles.css:116`, `.ak-row__fix` `:204` | Villkorsknapparna (24 px höga) ligger i tabbordningen mellan varje fråga (sex extra stopp) och "Stämmer inte?" är 24 px. | `min-height: 4.4rem` via padding; på ≥ 768 `tabindex="-1"` på stmt-knapparna (frågan är redan synlig bredvid). |
| A-m3 | Minor | UX | bankens `showWhen` | Hyresrätt tar bort belopp/skatt ur DOM; UX §9 vill gråa ut ("Gäller inte i det här läget"). Dokumenterat som fråga 3. | Ägarfråga; C har gråningen om ägaren vill se den. |
| A-m4 | Minor | DESIGN | `.ak-row__cap` + `.ak-sum__h` | Versaletiketten "DITT AVDRAG, PRELIMINÄRT" två gånger. | Försvinner med A-M1. |
| A-m5 | Minor | CRAFT | `styles.css:357` | Den lokala `prefers-reduced-motion`-regeln listar fyra element; resten täcks av `tokens.css` (`* { transition: none }`). Ser ut som en glömd lista. | Stryk den lokala regeln eller gör den komplett. |
| A-m6 | Minor | EMBED | `.ak-tel`, `.ak-sum__kalla` | Tel-länk (44 px) och källrad (41 px) står utanför fällraden i embed. Rätt enligt 05 §6, men nästa spak om ägaren vill under 900 (856/808 px mätt). | Behåll; notera. |

Det som är bra i A, så det inte "fixas bort": rätt i alla sex scenarier, rätt CTA i alla 19 tillstånd, 48 px chips utan
kapning, tabbordning = DOM, en aria-live-uppläsning per burst, reduced motion respekterad, remsan rätt, print rätt,
utan JS komplett (frågor + besked + tabell), inga tankstreck, valda chips i bläck (17,9:1).

### 4B. Riktning B, Kvittot

Blockers: 1 · Majors: 8 · Minors: 7

| Nr | Allvar | Lins | Element / fil:rad | Fynd | Åtgärd |
|---|---|---|---|---|---|
| B-B1 | **Blocker** | INTERACTION/TRUTH | `inputs.addEventListener('change', …)` `app.js:571` | Ett tryck på en redan vald chip (villa, 2011, lön) registreras inte: bara `change` lyssnas. Raderna kan aldrig bli bekräftade → "Ja, du kan använda ROT-avdraget" nås bara genom att välja fel svar och byta tillbaka. Säljlänkens "bekräfta tre saker på tio sekunder" (06, UX §1.4) finns inte. Probe: efter tryck på alla tre står "Ja, om det här stämmer:", raderna antaget (`isolate.mjs`, `b_confirm`). NOTES §4 påstår motsatsen; proben måste ha bytt svar fram och tillbaka. | Lägg till `click`-lyssnare på `input[type=radio]` i `#inputs` som anropar `answer(id, val, { bucket })` när `el.checked && !touched.has(id)` (idempotent, ingen dubbel tracking), plus `keydown` Space/Enter på samma sätt. Kör om NOTES-testet med ett rent tryck på förvalet. |
| B-M1 | Major | TRUTH/VOICE | `stampModel` `app.js:215–219`, `stamp.ja` `app.js:58` | Stämpeln säger **BERÄTTIGAD** redan på load, där rubriken hedgar "Ja, om det här stämmer:" med tre antagna rader. Stämpeln är kortets största versalord (`crop-b-stamp-head-mobile.png`); underraden "om villkoren stämmer" är 10,5 px. Det är UX §12 risk 1, ett falskt ja på load, i stämpelform. | `ja_villkor` → huvudord "PRELIMINÄRT" (eller "VILLKORAT") med underrad "om villkoren stämmer"; `ja_men` → "PRELIMINÄRT / med begränsning". "BERÄTTIGAD" bara när `klass === 'ja'`, fortfarande med "preliminärt". |
| B-M2 | Major | VOICE/TRUTH | `lead` `app.js:19` | "Fyra frågor, sedan står det på kvittot…" är fel i tre av fem lägen: ROT med värdeår 2021–2025 visar 5 frågor, batteri 6, sol 5 (räknat ur `resolveBank`). | Räkna `bank.filter(q => q.shown && !q.folded).length` och skriv "{n} frågor", eller stryk siffran: "Några frågor, sedan står det på kvittot: fullt pris, avdrag, att betala." |
| B-M3 | Major | EMBED/UX | `selectHtml` `app.js:151`, `compactSelect` `app.js:189`; `styles.css:26, 103` | Native `<select>` för chip-frågorna i embed. Doktrinen (UX §2.2, brief §2) säger chips = riktiga radios med label. Konsekvenser: (a) bekräfta-trycket är omöjligt i en select, nuvarande värde kan inte "väljas"; (b) iOS visar hjulväljare, alternativen och hjälptexten är dolda; (c) artikelläsaren möter en annan reglagegrammatik än säljlänken; (d) `select` saknar `font: inherit` → systemtypsnitt i fälten (`crop-b-inputs-embed-mobile.png`). Vinsten är höjd (2 118 → 1 245). **Bedömning: inte acceptabelt som embed-kompromiss.** | Chips i embed, två kolumner à 44 px, hjälptexter dolda, och fäll `vardear` + `skatt` bakom Fler detaljer med antaget-raderna kvar i kvittots fällrad (mätt 1 062 px med selects, ca 1 150 med chips). Om ägaren ändå vill ha select: `select { font: inherit }`, och en synlig, klickbar "antaget"-rad per fråga i kvittot. |
| B-M4 | Major | VOICE (candour) | `art.p1` `app.js:98`, `art.snabb.*` | Artikelattrappen innehåller "hur mycket du faktiskt **sparar**" (ALDRIG-ord, 05 §7) och riktiga fakta ("30 %", "50 000 kr per person och år") i en platshållare som briefen bad vara utan fakta. Det är demo, men det står på sidan ägaren ska bedöma. | Byt till faktalös platshållare som A/C, eller minst "sparar" → "vad du faktiskt betalar". |
| B-M5 | Major | CONVERSION/INTERACTION | `io.observe(kv)` `app.js:716`, `kvVisible` `:713` | Kvittot på mobil är 1 286 px högt, högre än viewporten. Vid sidans slut är kortet 47 % synligt och remsan "Till kvittot" ligger ovanpå CTA:n + tel = tre handlingar på skärmen (`sticky.mjs`: y=2 254, card=47 %, strip=ON). | Observera `#kv-cta` (eller kvittots huvud + CTA som två mål) i stället för hela `#kv`; dölj remsan när CTA:n är synlig. |
| B-M6 | Major | A11Y | `.preset` `styles.css:97`; `.srow__btn` `:190`; `.cta__sec` `:215` | Förvalsknapparna är 36 px höga (brief: tryckytor ≥ 44 px), villkorsknapparna 37 px, tel-länken 31 px (`a11y.json` chips_mobile). | `.preset { min-height: 4.4rem }` på < 768; `.srow__btn { padding: 1rem 0.4rem }`; `.cta__sec { min-height: 4.4rem; display: inline-flex }`. |
| B-M7 | Major | TRUTH | `receiptModel` `app.js:243–252` | I intervall-läget står "Arbetskostnad ca 18 000 kr" (60 %) medan avdraget är "-4 100 till -6 800 kr" (45–75 %). 30 % av 18 000 = 5 400 kr, som inte syns någonstans; den analytiska villaägaren räknar och hittar inte siffran (05 §7, mening 2). | I intervall-läget: arbetskostnad och material som spann ur `r.raw.rot_min`/`rot_max` ("ca 13 500 till 22 500 kr" / "ca 7 500 till 16 500 kr"), eller punkten 5 400 kr med spannet som not. Det första följer motorns canon (spann tills arbetskostnaden anges). |
| B-M8 | Major | TRUST | `metodHtml` `app.js:350–352`, `.kv__source` | Källa + datum ("Regler: Skatteverket, kontrollerade 2026-09-11…") ligger inne i `<details>`; 05 §3.1 vill ha raden synlig under beloppet, även i embed. | Flytta `<p class="kv__source">` till direkt under totalplattan, utanför details. |
| B-m1 | Minor | VOICE | `strip.ja_om`/`strip.ja_men` `app.js:82–83` | Remsan visar "Ja, om …" med ellipsis i stället för rubriken. A/C visar hela rubriken. | `r.headline.text` + CSS-ellipsis. |
| B-m2 | Minor | A11Y | `.i-antaget` `styles.css:197` | Hålringen "antaget" i 22 % vit ≈ 1,9:1 mot navy (icke-text kräver 3:1). Ordet "(antaget)" räddar betydelsen. | `color: var(--on-dark-faint)`. |
| B-m3 | Minor | INTERACTION | `kv.innerHTML = renderReceipt(…)` `app.js:487` | Hela kvittot renderas om vid varje ändring: fokus på "Kopiera länk"/CTA tappas vid tangentbordsändringar, `#share-status` nollställs, ingen count-up på intervall. | Byt bara ändrade noder (som A/C) eller bevara fokus (`document.activeElement` → samma selector efter render). |
| B-m4 | Minor | VOICE | `lead` `app.js:19` | "Inget mejl, ingen inloggning" står i fristående; 05 §6 lägger raden bara i embed. | Villkora på `surface`. |
| B-m5 | Minor | A11Y | `kv__caps` | "Så räknas ditt pris" / "Vad händer nu" är `<p>`, inte rubriker; kortet saknar struktur för skärmläsare (H1 → H2, sedan inget). | `<h3 class="kv__caps">`. |
| B-m6 | Minor | VOICE | `kv.ca` / basraden | "ca" (kvittoraden) och "ungefär" (motorns basrad) på samma kort. | Ett hedgeord per kort; "ungefär" är COPY:s. |
| B-m7 | Minor | CRAFT | `styles.css:26` | `select` saknas i `button, input { font: inherit }`. | Lägg till `select`. |

Det som är bra i B: kvittot är den enda av de tre som gör materialhaken synlig utan förklaring; typografisk hierarki
på mörk yta utan glow eller gradient; alla texter på navy ≥ 5,6:1; CTA rätt i alla 19 tillstånd; print byter till
papper med stämpel; utan JS komplett; remsan speglar kortets CTA först när kortet passerats (rätt regel).

### 4C. Riktning C, Avdragsmätaren

Blockers: 3 · Majors: 8 · Minors: 6

| Nr | Allvar | Lins | Element / fil:rad | Fynd | Åtgärd |
|---|---|---|---|---|---|
| C-B1 | **Blocker** | TRUTH | `paintMeter` `app.js:895–919`, `tweenAmounts` `:921–931` | Count-up-race: `paintMeter` avbryter bara tweenen inne i `tweenAmounts`. När den nya texten saknar belopp (alt_rot, dold, tak) sätts texten och funktionen returnerar utan `cancelAnimationFrame`, och tweenens sista bildruta skriver tillbaka det gamla beloppet. Två tryck inom 280 ms (batteri → "Nej" på solceller) ger rubriken "Troligen inte grön teknik…" med avläsningen **"Uppskattat avdrag: 35 000 kr"**, batteriavdraget som inte gäller, tills nästa ändring (`isolate.mjs`: gap 60 ms fel, gap 1 000 ms rätt; syns i `truth-*.json` scenario 5). Samma kodväg (tidig retur vid `dold`) ger enligt koden ett belopp bredvid ett hårt nej om trycket kommer inom 280 ms efter en beloppsändring. | Överst i `paintMeter`: `if (App.tween) { cancelAnimationFrame(App.tween); App.tween = null; }` före alla returer; spara måltexten i `ro.dataset.target` och avbryt tweenen om den inte matchar. |
| C-B2 | **Blocker** | INTERACTION/TRUTH | `onChange` `app.js:697–705` | Bekräfta-trycket saknas (bara `change`): villa/2011/lön kan aldrig bekräftas, "Ja, du kan använda ROT-avdraget" nås inte via normal väg (`isolate.mjs`, `c_confirm`). Samma som B-B1. | `click`-lyssnare på `input[type=radio]` (och `keydown` Space/Enter) som kallar `setAnswer(id, value)` när `el.checked && !App.touched.has(id)`. |
| C-B3 | **Blocker** | TRUTH | `meterModel` `app.js:159–175` (`kr: used + room`), `meterLabel` `:355–364` | Två ägare med fördjupning på båda: markörens etikett "Din skatt räcker hit (ca {kr})" räknas som `used + room` där `room` är summan av båda ägarnas utrymme, medan motorns text på samma skärm säger "Din skatt räcker preliminärt till 22 100 kr av 45 000 kr". Testat i Node (150 000 kr, 15 000/60 000 kr i månaden): etiketten skulle säga **ca 171 000 kr** mot motorns 22 100 kr. Två olika tal om samma sak på samma skärm. | Etikettens tal ur motorn: `r.skatt.params.ryms` vid `ryms_delvis`, `utrymme` (eller `min`–`max`) vid `ryms`; markörens x = `used + (behov − risk)`. Aldrig en lokal summa. |
| C-M1 | Major | DESIGN/UX | `.tool__grid`/`.tool__main` ordning, `styles.css:47, 317–335` | Beskedet ligger 2,8 skärmar ner på mobil (verdict vid ca 2 400 px av 3 347): UX §8.1 kräver beskedet direkt under sista synliga frågan, inom ca 1,5 skärmar. Fördjupningen (ca 700 px) + Fler detaljer ligger emellan (`skarmdumpar/rot-mobile.png`). | På < 992: `#besked` direkt efter `.controls` (CSS `order`), fördjupningen och Fler detaljer efter beskedet. |
| C-M2 | Major | UX/VOICE | `renderDjup` `app.js:392–409`; chip `skatt` | Inkomsten frågas två gånger på samma skärm: chippen "Betalar du inkomstskatt på lön eller pension? Ja, på lön" och fördjupningens "Vad har du för inkomst? Lön / Pension / Både lön och pension" + slidern. UX §2.6 valde chip synlig + fördjupning frivillig; C får visa fördjupningen, men då är inkomsttypen redan känd (`effInkomsttyp`). | Dölj `inkomsttyp` i fördjupningen tills kunden behöver "Både lön och pension" (en toggle), eller ta bort skatt-chippen i C och låt fördjupningen vara skattefrågan. En fråga per sak. |
| C-M3 | Major | TRUTH/UX | slidern `manadsinkomst`, `renderDjupStatus` `app.js:411–418` | Slidern står på "35 000 kr" utan att vara aktiverad (estimatorn körs först vid touch). En 55-åring läser 35 000 kr som verktygets antagande om honom; mellanläget "syns men räknas inte" är det sämsta av de två (NOTES fråga 2). Dessutom tre hjälprader under varandra ("Ungefär räcker…", "Dra i reglaget…", "Frivilligt…"), text på text. | Antingen rendera slidern utan värde i orört läge (output "Dra för att ange", dämpad tumme) eller kör estimatorn på förvalet och märk "antaget" i legenden. En hjälprad. |
| C-M4 | Major | EMBED | `EMBED_VISIBLE` `app.js:284`; hela kortet | 1 398 px mot 900 (batteri 1 689); Snabbfakta vid 2 121 px. Ingen enskild vikning når 1 000 (§2). | Embed-arketyp med två synliga frågor (boende + belopp), skatten bakom "Räcker skatten?", mätaren utan linjal/legend/takrad → ca 1 100. Ägarbeslut (NOTES fråga 1). |
| C-M5 | Major | A11Y/DESIGN | `styles.css:157` (vald chip), `:257` (`.villkor__tag`), `:132` (`.meter__key.is-dim`), `:181` (`.preset.is-on`), `:49` (`.eyebrow`) | Kontrast: vald chip vit på teal 2,96:1; "antaget"-taggen 2,98:1 (ordet bär tillståndet, UX §9: färg aldrig ensam bärare, alltså måste ordet gå att läsa); dämpad legend 3,15:1; `preset.is-on` teal-text 2,96:1; eyebrow 2,96:1 (`contrast.json`). | Vald chip = `--ink` som A/B; tag = `--ink-muted`; legend dim = `--ink-muted` med opacity bara på swatchen; preset.is-on = teal-kant + `--ink`-text; eyebrow `--ink-muted` eller teal-bar. |
| C-M6 | Major | TRUTH (doktrin) | `renderStaticTable` inne i `metod` `app.js:459–475, 492` | Den statiska tabellen ligger alltid i "Så har vi räknat", även med JS: fem nya belopp (3 000, 6 000, 15 000, 30 000, 50 000 kr) som inte finns i beskedet (UX §4.7 "inga nya siffror", copy-doktrin §7.10). A döljer den med JS, B har den i `<noscript>`. | `<noscript>`-wrap, eller `.js .tabell { display: none }` med en `js`-klass på `<html>`. |
| C-M7 | Major | TRUST | `metod__kalla` `app.js:492` | Källa + datum inne i `<details>` (samma som B-M8). | Flytta raden till under avläsningen (`.meter__readout`) eller under CTA:n, utanför details. |
| C-M8 | Major | DESIGN | `.meter__rubrik` (30 px/800) och `.verdict__h` (28 px/700), `styles.css:306` | Två hjältar på desktop: avläsningen uppe till vänster och beskedet uppe till höger på samma höjd, samma vikt. Riktningen säger att mätaren är hjälten; då är beskedet sekundärt. Och: på ett typiskt jobb (30 000 kr) fyller mätaren 8–14 % av spåret, instrumentet ser tomt ut i det vanligaste fallet (06 varnade "tom på små jobb"; `skarmdumpar/rot-desktop.png`). | Beskedet i lead-storlek/600 som remsa ovanför mätaren (som A) eller behåll panelen men i `--fs-lead`. Mätaren: dynamisk skala (0–25 000 när jobbet < 25 000, med hela potten markerad som "kvar") så segmentet får kropp. |
| C-m1 | Minor | A11Y | `app.js:403, 479` | Rubrikordning H1 → H3 ("Räkna på om skatten räcker") → H2 (beskedet) → H3. | Fördjupningens rubrik som H2, eller `<p>` med rubrikstil. |
| C-m2 | Minor | A11Y | `scheduleLive` `app.js:966–973` | Skärmläsartexten "Ja, om det här stämmer:. Ungefär …" (dubbel interpunktion). | Strippa avslutande ":" och "." som A gör. |
| C-m3 | Minor | PERF | `app.js:666, 953` | `syncSticky()` körs på varje scroll-event utan `c` och kör `currentCtx()` (= full `evaluate`) per event. | Cacha senaste ctx i `App`. |
| C-m4 | Minor | DESIGN | `.meter__legend` `styles.css:328` | På mobil kolliderar "Kan bli kvarskatt 13 900 kr" med "Ryms inte i år" i två kolumner (`crop-c-meter-mobile-tax.png`). | En kolumn när fler än två poster är tända. |
| C-m5 | Minor | A11Y | `app.js:277` | Fieldset utan legend för kryssrutan `under18`. | `<legend class="sr-only">`. |
| C-m6 | Minor | VOICE | `c.lead` `app.js:25` | "Inget mejl, ingen inloggning" även i fristående (05 §6: bara embed). | Villkora på surface. |

Det som är bra i C: mätaren i skattebegränsat läge är det starkaste enskilda ögonblicket i alla tre riktningarna
("Din skatt räcker hit (ca 22 100 kr)" + streckat "Kan bli kvarskatt 13 900 kr", `crop-c-meter-mobile-tax.png`);
länken bär aldrig inkomst trots att slidern rörts; CTA rätt i alla 19 tillstånd; print och utan JS rätt; gråning av
belopp/skatt vid hårt nej enligt UX §9; "Börja om" nollställer inkomsten (UX §2.6).

---

## 5. Voice och AI-signaler (grep + rendering)

| Signal | A | B | C |
|---|---|---|---|
| Tankstreck (U+2014/U+2013) i index/app/css | 0 | 0 | 0 |
| Mittpunkt "·" | 0 | 0 | 0 |
| Ellipsis "…" | 0 | 2 (remsan) | 0 |
| Gradient-text (`background-clip: text`) | 0 | 0 | 0 |
| Midnattsscrims / radial glow | 0 | 0 (`radial-gradient` = kvittots punktledare, funktionell) | 0 (`repeating-linear-gradient` = streckmönster, funktionellt) |
| "!" i renderad text, 19 tillstånd | 0 | 0 | 0 |
| Bannade ord i renderad text | 0 | "sparar" i artikelattrappen (B-M4) | 0 (träffen "vi sparar inget" är COPY:s tillåtna rad) |
| Förbjudna mallen (mörkt kort + glow + gradient-ikon + centrerad vit rubrik) | nej | nej (flat navy, vänsterställd) | nej |
| LOCAL_COPY med fakta/siffror | `ui.kalla` (datum, 05 §3.1) — ok | `art.p1/snabb` (30 %, 50 000, 75 000; i demo, B-M4), `kv.avdrag.rot` "30 %", `kv.fastpris` "97 %", `kv.tak_tva` — alla ur regelverket, ok; `lead` "Fyra frågor" fel (B-M2) | `c.tabell.rot` "30 %", `c.legend.sol` "15 %"/`batteri` "50 %", `c.kalla` — ur PARAMS/regelverket, ok; `c.meter.cap.*` ur PARAMS, ok |
| Fluff ("varför vi frågar" o.d.) | 0 | 0 | 0 (men tre hjälprader under slidern, C-M3) |

---

## 6. Smakproberna (skrivna svar)

**(a) Kan de tre beskrivas med samma mening?** Nej. A är en checklista som tänds rad för rad (frågan är villkoret),
B är en faktura med en stämpel (fullt pris, avdrag, att betala), C är en mätare med två tak (potten och skatten).
Idé, hero-fråga, layoutfamilj och yta skiljer. Det som är lika är den nedre halvan i alla tre (villkorslista, Vad
händer nu, CTA, dela, Så har vi räknat), och det är avsiktligt: den delade motorn och COPY:n gör de raderna till en
komponent. Divergensen sitter i övre halvan, där den ska sitta.

**(b) Bär var och en exakt EN signaturenhet?** A: ja, tavlan. Beloppsblocket under tavlan är inte en andra enhet men
dubblerar radens belopp (A-M1), vilket får det att kännas som två. B: ja, kvittot, och stämpeln är kvittots del som
riktningen kräver. C: ja, mätaren, men det synliga inkomstbandet (tre reglage + tre hjälprader) konkurrerar om
uppmärksamheten och gör att mätaren + fördjupningen läses som två instrument på mobil (C-M2/M3).

**(c) Skulle en 55-årig villaägare känna att en människa gjort var och en?** B mest: en faktura med prickledare och en
stämpel är något han har sett i verkligheten, och kvittots ordning (fullt pris först) är en hantverkares ärlighet.
A: ja, som en blankett en noggrann handläggare ritat, men "ANTAGET" i versaler, det dubbla beloppet och "Svara"-länken
i artikeln är systemets röst, inte människans. C: delvis. Instrumentet är begripligt när skatten är ifylld (mätaren
med "räcker hit" är riktigt bra), men på load är spåret nästan tomt, slidern står på 35 000 kr utan förklaring och han
möter frågan om inkomst innan han fått något besked. Det känns som en app, inte som en elektriker.

**(d) Skulle var och en kunna ligga oförändrad på en generisk konkurrents sajt?** A: ja, med ett färgbyte. En
villkorschecklista med bock/ring/kryss är inte Ampys form; det Ampy-specifika är copyn ("det sköter vi"-raderna,
F-skatt-raden, "Få ett pris efter avdrag"), inte ytan. Inte en Ampy-tillgång än. B: nej. "Så räknas ditt pris" är
tjänstesidornas ROT/GT-block (D2), midnight + teal-avdragsraden är sajtens kalkylatorfamilj, och fakturamodellen är
Ampys försäljningsargument. Närmast en Ampy-tillgång. C: halvt. Ingen konkurrent i SERP:en visar pott + skatt i samma
instrument (03 vitrummet), så innehållet är unikt, men ytan är en generisk mätare i teal; med en annan palett vore
den vilken räknare som helst.

**(e) Minst AI-slop och mest riskabel.** Minst slop: **B**. Den har en fysisk metafor som bär hela verktyget, utförd
med återhållsamhet (inga glows, inga gradienter, tabulära siffror, riktig prickledare) och den enda av de tre som
gör materialhaken synlig utan en förklarande mening. A är renast men också minst särpräglad. Mest riskabel att
skeppa: **C**. Den har tre blockers (varav ett race som visar ett falskt belopp bredvid ett "troligen inte"), den
högsta embed-höjden utan väg under 1 000 px, beskedet nästan tre skärmar ner på mobil, en inkomstfråga på load som
GRIND 6 inte har avgjort, kontrastfel på de valda chipsen och "antaget"-ordet, och ett instrument som ser tomt ut i det
vanligaste fallet. Dess bästa ögonblick (skatten räcker hit) är det ingen annan har, men det kräver att kunden ger sin
inkomst först.

---

## 7. Rankat utlåtande

| Plats | Riktning | Utlåtande | Blockers / Majors / Minors | De tre fixar som betyder mest |
|---|---|---|---|---|
| 1 | **A Villkorstavlan** | **SHIPBAR MED FIX** | 0 / 5 / 6 | (1) Ett belopp, inte två: radens belopp i embed, blocket i fristående (A-M1, ger 912 px i embed). (2) Tangentbordsbekräftelse via `keydown` (A-M2). (3) Kompakta radernas affordans i artikeln: hela raden tryckbar, 44 px, "Svara" som knapp (A-M3). |
| 2 | **B Kvittot** | **SHIPBAR MED FIX** (blockern är en click-lyssnare; kvar är doktrinfixar) | 1 / 8 / 7 | (1) Bekräfta-trycket: `click` + `keydown` på radios (B-B1). (2) Stämpeln: "PRELIMINÄRT / om villkoren stämmer" i ja_villkor, "BERÄTTIGAD" bara vid bekräftat ja (B-M1). (3) Chips i embed i stället för select, med värdeår + skatt fällda (B-M3, ca 1 150 px). |
| 3 | **C Avdragsmätaren** | **OMARBETA** | 3 / 8 / 6 | (1) Avbryt tweenen i `paintMeter` (C-B1) och bekräfta-trycket (C-B2). (2) Beskedet direkt under reglagen på mobil, fördjupningen efter (C-M1), och en inkomstfråga i stället för två (C-M2/M3). (3) Etikettens tal ur motorn (C-B3) + kontrasten på valda chips och "antaget" (C-M5). |

Gemensamt, till ägaren: S-1 (teal-tokens kontrast), S-2/S-3 (CTA vid delvis skatt och vid solceller ligger i motorn,
inte i wireframen). Ingen av de tre håller embed-budgeten 900 px; A når 912 med en fix, B ca 1 050–1 150, C kräver en
egen embed-arketyp.

Osäkert, sagt rakt ut: C-B3 är verifierad i Node mot `meterModel`, inte klickad fram i webbläsaren (kräver två ägare +
fördjupning på båda). B-M5 uppstår i zonen där CTA:n är synlig men kortet som helhet är under 50 % synligt; zonen
finns så länge kvittot är högre än viewporten, oavsett hur lång sidan är under. På en längre fristående sida (FAQ
under, 05 §5.1) tillkommer att remsan speglar CTA:n när kortet passerats, vilket är rätt, men zonen försvinner inte.
