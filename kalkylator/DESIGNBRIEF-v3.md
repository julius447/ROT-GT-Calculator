# Designbrief v3: tre polerade versioner av Avdragskollen

Innehållet är rätt och låst. Designen underkändes av ägaren 2026-09-14 ("ser ut som att en femåring har
designat det"). Det här är ren designpolish: samma tre frågor, samma logik, samma ord, men hantverket ska
se ut som att Sveriges modernaste elfirma gjort det. Inte mer komplext, inte mer text.

## Ägarens feedback, ordagrant i sak (allt ska vara löst i varje version)

1. Rubriken är en H2 i artikeln och måste se ut som en riktig H2 (designsystemet: 36 px / 500 / lh 1,2).
2. Noll spacing i dag mellan fråga, underrad och container: spacing ska följa designsystemets skala och
   kännas luftig och avsiktlig.
3. Resultatet är "absolut bedrövligt": talet ska vara hero, sättas typografiskt (Outfit 700, tabulära
   siffror), med luft, i en yta som inte är midnattsblå.
4. **Ägaren hatar den mörkblå färgen.** Inga midnattsblå ytor i verktyget. Ljusa ytor (vit, sky mist),
   midnight bara som text. Teal som enda accent (aldrig som liten text; text-teal = `--ampy-action-strong`).
5. Trycker man Nej på "Äger du din bostad?" ska något hända: ett rött X och beskedet
   "Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag." (grön teknik: "… grön teknik-avdrag.")
   Talet försvinner. Trycker man Ja igen kommer talet tillbaka. Logiken i `rakna.js` ger tillstånden.
6. Verktyget visar EN sak per läge: `?m=rot` (default) visar bara ROT, `?m=gt` bara grön teknik. Aldrig båda.
7. Knapparna (Ja/Nej, Lön/Pension) ska ha rätt storlek: 48 px höga, bredd efter innehåll (inte 17 rem breda
   tomma spår), 16 till 18 px text, tydligt valt läge.
8. Mobilen (390 px) ska vara designad, inte en hoptryckt desktop: fullbreddskontroller, talet stort, luft.
9. Verktyget är för smalt i dag: det ska fylla artikelns spalt (980 px) och gärna använda bredden, t.ex.
   frågorna i vänster spalt och resultatet i höger (ägarens förslag, version 1).
10. Fontstorlekarna ska vara rätt för en 55-åring: frågor 18 till 20 px, underrad 16, tal 44 till 56 px.

## Innehållet (låst, exakta strängar)

- H2: `Räkna ut ditt ROT-avdrag` (rot) / `Räkna ut ditt grön teknik-avdrag` (gt)
- Fråga 1: `Äger du din bostad?` underrad `Villa, radhus eller lägenhet. Helt eller delvis.` svar `Ja` / `Nej`
- Fråga 2: `Är bostaden äldre än fem år?` svar `Ja` / `Nej`
- Fråga 3: `Din inkomst förra året` svar `Lön` / `Pension` + belopp i kr (placeholder `300 000`)
- Resultat, etikett: `Ditt ROT-avdrag 2026` / `Ditt grön teknik-avdrag 2026`
- Resultat, tal: ur `rakna.js`: `upp till 50 000 kr` (inkomst tom), `ca 31 000 kr`, `50 000 kr`
- Resultat, underrad: `Per person och år.`
- Nej på fem år (bara ROT): `Yngre än fem år: ROT gäller bara reparationer.` som liten rad under talet
- Nej på ägande: rött X + `Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag.`
- Ingenting annat. Inga knappar, ingen process, ingen förklaring, ingen "så har vi räknat".

## Tekniken (delad, ändra inte)

- `kalkylator/rakna.js`: `berakna({mode, ager, aldre, typ, inkomst})` -> `{status, belopp, prefix, text, not}`,
  `kr()`, `siffra()`, `formatFalt()`. Importera, räkna om på varje ändring, ingen egen logik.
- `kalkylator/system/ampy.css`: designsystemets tokens/base/komponenter (`.ampy-segment`, `.ampy-input`,
  `.ampy-card`, `.ampy-h2`, `.ampy-eyebrow`). Använd tokens för allt; egna värden bara som lokala
  variabler med kommentar. Ingen midnattsyta.
- Filer per version: `kalkylator/v<N>/index.html`, `style.css`, `app.js` (ES-modul, importerar
  `../rakna.js`). Läget ur `?m=` (default rot). Inga externa resurser. Ikonen X och bock ritas som inline-SVG
  (stroke 1,75, rund ände), aldrig emoji.
- Render: `node tools/shot.mjs kalkylator/v<N>/index.html _shots/v<N> --query "?m=rot"` och `?m=gt`
  (desktop 1440 + mobil 390, skriver höjd/overflow/fel). Sidan ska rendera verktyget i en 980 px bred
  artikelspalt på desktop (lägg en `main` med `max-width: 98rem; margin: 0 auto`) och fullbredd på mobil.

## Hantverkskraven (mät, inte tyck)

- Vertikal rytm: fråga -> underrad 6 till 8 px; underrad -> kontroll 12 till 14 px; fråga -> fråga 28 till 40 px;
  kortpadding 32 till 40 px desktop, 20 till 24 mobil. Ur `--ampy-space-*`.
- Typografi: H2 = `.ampy-h2` (36/500). Frågor 20 px/500 (`--ampy-text-h3`), underrad 16/400 dämpad,
  etikett över talet 12 px versaler med spärrning, tal 44 till 56 px/700 tabulära siffror, "per person och år" 16/400 dämpad.
- Kontroller: Ja/Nej som `.ampy-segment` med två alternativ, 48 px höga, bredd efter text (min 88 px per
  alternativ), valt läge vit pill med text-teal (systemets); eller pill-varianten `.ampy-segment--pill`
  (vald = solid teal-deep, vit text). Belopp: `.ampy-input` 48 px, 18 px siffror, "kr" som suffix inne i fältet.
- Resultatet: ljus yta som skiljer sig från frågeytan (t.ex. sky mist-panel med hårlinje, eller vit panel
  på sky mist-bakgrund), talet i midnight-text, etikett dämpad. Rött X: `--ampy-error-ink`-cirkel 40 till 48
  px med vitt kryss eller kryss i röd ring; texten i `--ampy-ink`, 18 px. Bock (grön, `--ampy-success-ink`)
  får finnas vid talet när inkomst är ifylld, om det gör beskedet tydligare.
- Kontrast ≥ 4,5:1 på all text. Fokusringar ur systemet. Reduced motion respekteras. Inga tankstreck, inga "·".
- Höjd: mobilt kort ≤ 640 px i utgångsläget. Desktop: kortet ≤ 460 px högt om två spalter, ≤ 620 om en.

## Självgranskning innan du lämnar (skriv svaren i NOTES.md)

1. Öppna desktop- och mobil-PNG:erna. Ser det ut som att en 5-åring gjort det? Vad exakt? Fixa.
2. Mät spacing (Playwright `getBoundingClientRect` mellan fråga/underrad/kontroll) och skriv siffrorna.
3. Klicka Nej på ägande, Nej på fem år, skriv 180 000, byt till Pension, byt tillbaka: alla fyra tillstånd renderade som PNG.
4. Jämför mot LED-kalkylatorn (`/Users/juliuscallahan/Desktop/Claude Code/ampy-designsystem/site/bilder/led-kalkylator-desktop.jpg`)
   och Hero-1 (`hero-1-desktop.jpg`): håller ditt hantverk samma nivå?
