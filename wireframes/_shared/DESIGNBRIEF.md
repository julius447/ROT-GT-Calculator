# Designbrief (gemensam för riktning A, B och C)

Du bygger EN av tre divergenta, interaktiva wireframes för Ampy Nordic AB:s ROT-kalkylator + Grön
Teknik-kalkylator. Wireframen ska gå att klicka i, räkna rätt (den delade motorn räknar), se bra ut
på 390×844 och på desktop, och tåla att ägaren väljer den som produktionsriktning. Mid-fi med riktiga
tokens, riktig copy och riktig logik. Inga stockbilder, inga ikonbibliotek, inga CDN:er.

## 0. Läs innan du skriver en rad (i ordning)

1. `research/06-riktningar.md` (din riktning + det gemensamma)
2. `research/04-ux-flode.md` §1.4–1.6, §2, §3.2, §3.6, §4.2, §4.4–4.6, §5.2, §6.2–6.4, §7.2–7.3, §8, §9 (bindande)
3. `logik/README.md` (motorns kontrakt: `resolveBank`, `evaluate`, `resolveTexts`, `encodeState`/`decodeState`, `formatKr`) och skumma `logik/ui-model.js` (BANKS, COPY-nycklarna)
4. `.claude/skills/ampy-design-system/SKILL.md` (i projektroten `/Users/juliuscallahan/Desktop/Claude Code/.claude/skills/ampy-design-system/`) + `reference/index.html` + `reference/reference.css` + `reference/tokens.css` (guldstandarden, matcha hantverksnivån; kopiera INTE mittpunkten "·" i dess eyebrow)
5. `research/05-leadmagnet-och-konvertering.md` §3.1 (förtroenderaderna), §6 (embed-varianten)
6. AI-signalerna som ägaren avvisar (Personal-OS-direktiv): tankstreck (em/en dash) i löptext, mittpunkt "·" som avdelare, gradient i rubriktext, midnattsblå gradient-scrims, ojämn spacing, "text på text", förklarande fluff, citat utan avsändare, siffror utan källa. Dessutom: dark card + radial glow + gradient-ikon + centrerad vit rubrik = den förbjudna AI-mallen.

## 1. Filer du skapar (bara i din egen mapp)

```
wireframes/<din-mapp>/index.html     statisk sida, server-renderat förvalsläge (utan JS syns frågor + förvalsbesked)
wireframes/<din-mapp>/styles.css     din CSS, byggd på ../_shared/tokens.css (importera den + ../_shared/fonts.css)
wireframes/<din-mapp>/app.js         din renderare (ES-modul) som importerar ../../logik/ui-model.js
wireframes/<din-mapp>/NOTES.md       svenska: idén, vad som byggts, uppmätta höjder, lokala strängar, öppna frågor
wireframes/<din-mapp>/skarmdumpar/   slutliga PNG:er (se §6)
```

Rör ALDRIG `logik/` (en copy-agent finslipar strängarna där just nu; de laddas vid körning, så din layout
måste tåla att en sträng blir 30 % längre eller kortare). Rör aldrig `_shared/` eller andra riktningars mappar.
Behöver du en sträng som saknas i COPY: lägg den i `app.js` under `const LOCAL_COPY = {...}` med kommentar,
och lista den i NOTES.md. Hitta aldrig på siffror eller fakta.

## 2. Vad sidan måste göra

- **Läge via URL:** `?m=rot` (default) / `?m=gt` (+ `?l=laddbox|batteri|sol`), `?surface=standalone` (default) /
  `?surface=embed`. Läs med `decodeState(location.search)`; `surface` läser du själv. Överst på sidan (utanför
  verktyget) ligger en liten demo-remsa med länkar för att byta läge och yta (den ingår inte i verktyget).
- **Embed-ytan** renderar en attrapp av artikeln runt verktyget: en artikel-header (bild-platshållare 230 px,
  H1 två rader, två ingressstycken ≈ 230 px) → verktyget → första brödtextrubriken "Snabbfakta". Så syns
  höjdbudgeten (UX §6.2: verktyget ≤ 900 px på 390 px i utgångsläget, kompakt kort, ingen sticky-remsa).
  Rubriken i verktyget är H2 i embed, H1 fristående.
- **Instant value:** förvalsläget renderas i HTML (statiskt) så att sidan utan JS visar frågorna + förvalsbeskedet
  + en statisk beloppstabell. JS hydrerar (byter inte ut strukturen) och kopplar interaktionen.
- **Live-omräkning** på varje ändring, synkront. `touched` = frågor kunden rört; länk-förifyllt = antaget.
- **Tillstånden:** alla fem beskedsklasser, alla beloppstillstånd, villkorsradernas sex tillstånd (bock, hålring
  "antaget", frågeteckenring, varningstriangel, kryss, dämpad bock "det sköter vi"), CTA per klass (solid knapp
  bara där `cta.primary.solid` är true; nej/troligen får aldrig en solid knapp), sekundär tel-textlänk.
- **Villkorsrad → fråga:** klick på en rad flyttar fokus till frågan (mobil: scroll).
- **Fler detaljer:** `<details>`, native. Skattefördjupningen (`skatt_djup`) ligger där (utom i riktning C).
- **Dela:** "Kopiera länk" (`encodeState` → fristående URL, `navigator.share` på mobil, annars urklipp + status
  `role="status"` "Länk kopierad") och "Skriv ut" (print-stilmall: bara beskedskortet, villkoren, vad händer nu,
  så har vi räknat).
- **Så har vi räknat:** `<details>` med `result.metod_text`-raderna.
- **Sticky-remsa** (bara `surface=standalone`, bara mobil <768): visas efter första interaktionen, döljs när
  beskedskortet är ≥ 50 % synligt (IntersectionObserver), speglar kortets primära CTA. Aldrig tel i remsan.
- **Tillgänglighet:** `<fieldset>`/`<legend>` per fråga, riktiga `<input type="radio">` + `<label>` för chips,
  `aria-live="polite"` (debounce 600 ms) på beskedet, fokusordning = DOM, kontrast ≥ 4,5:1 brödtext, tryckytor
  ≥ 44 px, `inputmode="numeric"` på belopp (aldrig `type="number"`), `prefers-reduced-motion`.
- **Rörelse:** ≤ 300 ms. Count-up på belopp bara vid ändring, aldrig på load. Ingen layoutförskjutning (beloppsraden
  har fast höjd, CTA:n flyttar sig aldrig).
- **Ingen nätverkskod, ingen tracking-kod.** Bara `dataLayer.push` stubbar (en funktion `track(event, props)` som
  pushar till `window.dataLayer` om den finns; events per UX §10; aldrig belopp i klartext, aldrig inkomst).

## 3. Ytan (tokens och hantverk)

- `html { font-size: 62.5% }`, Outfit via `../_shared/fonts.css`, tokens via `../_shared/tokens.css`. Inga råa hex
  utöver det tokens saknar (då: definiera en lokal variabel överst i din CSS med kommentar).
- Fullbreddsregeln (ägardirektiv 2026-08-14): verktyget får gå nära full bredd; container upp till ~1200–1280 px
  med liten kantpadding (24–32 px desktop). Inga 1280-vanor av gammal vana.
- Hierarki genom vikt och storlek, inte boxar. Luft är budgeten. EN accent (teal) för primär handling och bockar.
  Midnight bara som text/mörk yta där riktningen kräver det. Spring-green max som en highlight.
- Riktiga skuggor (tokens `--shadow-*`), aldrig `#bebebe`-fallbacken.
- Chips: vit yta, 1,5 px linje, vald = teal fylld med vit text (eller din riktnings variant), höjd ≥ 48 px mobil.
- Inga ikonbibliotek: rita de sex radtillstånden med inline-SVG (enkla former, 1,5–2 px stroke) eller CSS.
- Siffror: `formatKr` ger "9 000 kr". Procent "30 %". Aldrig "—" som skiljetecken.
- Mobil är re-layoutad, inte nedskalad (UX §8.1 ordning: frågor → besked; riktning C se egen brief).

## 4. Registret

Ekonomi- och skattesida: allvarligt, noggrant, varmt när beskedet är gott. Inget skrikigt, inga utropstecken i
UI utöver det COPY redan har. Ett nej säljer aldrig.

## 5. Render-loopen (obligatorisk, minst tre varv)

```
node tools/shot.mjs wireframes/<din-mapp>/index.html _shots/<din-mapp>-rot --query "?m=rot"
node tools/shot.mjs wireframes/<din-mapp>/index.html _shots/<din-mapp>-gt --query "?m=gt"
node tools/shot.mjs wireframes/<din-mapp>/index.html _shots/<din-mapp>-embed --query "?m=rot&surface=embed"
```
Skriptet skriver `*-desktop.png` (1440) och `*-mobile.png` (390×844, hel sida) och skriver ut höjd, overflowX
och JS-fel per viewport. Öppna PNG:erna (Read-verktyget) och TITTA: hierarki, luft, radbrytningar, kapade
etiketter, kontrast, om beskedet är hero, om CTA:n står ensam. Fixa, rendera om. `errors` ska vara `[]` och
`overflowX` false på båda viewports. Gör dessutom ett interaktionstest med Playwright (skriv ett litet
`_probe.mjs` i din mapp om du vill): klicka Hyresrätt → beskedet blir NEJ utan knapp; välj "vet inte" på två
frågor → OSÄKERT med tel; batteri + nej solceller → "Räkna med ROT i stället"; öppna Fler detaljer; kopiera
länk. Skriv resultatet i NOTES.md.

## 6. Leverans

- `skarmdumpar/`: `rot-desktop.png`, `rot-mobile.png`, `gt-desktop.png`, `gt-mobile.png`, `embed-mobile.png`,
  `embed-desktop.png` (slutliga, 2× DPR).
- `NOTES.md`: (1) idén i tre meningar, (2) vad du byggde och avvek från, (3) uppmätta höjder per läge/yta mot
  budgeten 900 px (embed, mobil), (4) interaktionstestets utfall, (5) LOCAL_COPY-strängar, (6) öppna frågor
  för ägaren, (7) vad du inte hann.
- Avsluta med en sammanfattning på ≤ 15 rader: filer, höjder, testutfall, det du är minst nöjd med.
