# ROT/GT-calculator: leverans till produktion (2026-09-21, paket 1.1.0)

Avdragskollen, Ampys ROT- och grön teknik-kalkylator, färdig för ampy.se (Bricks + FluentSnippets). En placering:
**överst i artikelspalten, före Snabbt svar-kortet**, på /rot-avdrag-2026/ (`mode="rot"`) och /gron-teknik-2026/
(`mode="gt"`), i den nya artikelmallen.

| Innehåll | Vad |
|---|---|
| `HANDOVER.md` | Instruktionen till Chris (engelska): tre snippets, exakt var Shortcode-elementet ska in i mallen, designen mått för mått (desktop två spalter, iPad och mobil staplat), QA efter inklistring, bevisen |
| `dist/styles.css` | CSS-snippet (Frontend, head) |
| `dist/backend.php` | PHP-snippet (Functions, Frontend & Backend): registrerar `[ampy_avdragskollen mode="rot|gt"]` |
| `dist/engine.js` | JS-snippet (Frontend, footer) |
| `dist/fonts/` | Outfit (reserv; sajten har redan samma fil) |
| `preview/artikel-rot.html`, `preview/artikel-gt.html` | Artikelmallen med paketet på plats (dist-filerna by reference, sajtens CSS i `preview/sajt/`): så ser det ut live |
| `skarmdumpar/` | Desktop 1440 (sidan, kalkylatorn, exempel 300 000), iPad 1024, mobil 390 (två skärmar), ROT och grön teknik |
| `Sa-raknar-Avdragskollen.html` | Förklaringen av räknelogiken (kvalitetssäkrad av elektrikerna) |

Bevis: paritetsprovet 341/341 (paketet i artikelmallen = källan i artikelmallen: samma lägen, samma 1 481 datorvärden,
byte-lika skärmdumpar vid 1440/1024/390, motorn igång, fokus rätt inuti sajtens CSS). Detaljer i HANDOVER §8.
Källkod, research och tester: https://github.com/julius447/ROT-GT-Calculator (mappen `produktion/` = den här leveransen).
Live: https://julius447.github.io/ROT-GT-Calculator/ (roten öppnar `produktion/preview/artikel-rot.html`).
