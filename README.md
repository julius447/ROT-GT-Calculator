# ROT-GT-Calculator

Ampy Nordic AB: ROT- och grön teknik-kalkylatorn ("Avdragskollen"), inkomstår 2026. Kunden svarar på några
frågor (äger bostaden, äldre än fem år, ålder, inkomst, låneräntor, fler personer i hushållet) och får sitt uppskattade tillgängliga ROT-avdrag eller grön teknik-avdrag: det lägsta av taket per
person (50 000 kr) och personens skatteutrymme efter de reduktioner som ligger före i inkomstskattelagen
67 kap. 2 §. Räknemotorn är verifierad mot Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (75 körningar,
0 kr diff i 73, research/09 och 12). Byggd på Ampys designsystem (julius447/Design-Guide-Ampy, snapshot i
`kalkylator/system/`).

Live: https://julius447.github.io/ROT-GT-Calculator/ (roten öppnar `produktion/preview/artikel-rot.html`: paketet
överst i artikelmallen; `artikel-gt.html` = grön teknik). Enda placeringen (ägarbeslut 2026-09-21): först i
artikelspalten, före Snabbt svar-kortet, på /rot-avdrag-2026/ och /gron-teknik-2026/.

| Mapp | Innehåll |
|---|---|
| `produktion/` | **Leveransen till Chris**: `HANDOVER.md` (EN), `dist/styles.css` + `backend.php` + `engine.js` (FluentSnippets), `preview/artikel-rot|gt.html` (mallen med paketet), `skarmdumpar/`, `LASMIG.md`; `_build/` = bygget (`paketera.mjs`), pariteten (`paritet.mjs`, 341 kontroller), skärmdumparna (`skarmdumpar.mjs`), fixturerna (`prov/`) |
| `kalkylator/v1/` | Källan (den godkända designen): `index.html`, `style.css`, `app.js`, `_probe.mjs` (86 krav), `NOTES.md`, `skarmdumpar/`. Byggkälla, inte en egen leverans |
| `kalkylator/rakna.js` | Kalkylatorns logik (`beraknaHushall`) ovanpå motorn |
| `kalkylator/system/` | Designsystemet (tokens, base, komponenter, Outfit) |
| `kalkylator/artikel/` | Referensklonen: artikelmallen med källan överst i artikelspalten (`bas-inbaddad.css`, `artikel.css` = förlagan till paketets block 7 och 8) |
| `logik/` | Motorn: `engine.js` (skatteutrymme + ROT/GT-regler), specar, testfall, `node logik/test.mjs` (3 043 kontroller), `verifiering-skv-2026.json` (75 e-tjänstkörningar), `verifiering_oberoende.py` |
| `research/` | 00–06 grundning, regelverk, marknad, UX, riktningar; 07–10 lag, parametrar, verifiering, formel (2026-09-16); 11 förklaringen för kvalitetssäkring; 12–14 slutgranskning (logik, responsivt, kod) |
| `tools/` | `shot.mjs` (render), `kontroll.mjs` (oberoende kontroll), `skv-etjanst-grid.mjs` (e-tjänstkörning), `klona-artikel.mjs` + `artikel-klon.py` (referensklonen), `enhetsmatris*.mjs` (research/13) |
| `GRINDLISTA.md` | Ägarfrågor (historik) |

Historik: tre wireframe-riktningar (A Villkorstavlan, B Kvittot, C Avdragsmätaren) byggdes 2026-09-11 och
underkändes som för komplexa (git 5d9bd5e); v2 "tre frågor" 2026-09-14; designrundan v1/v2b/v3 samma dag med v1
vald (v2b/v3 och galleriet borttagna 2026-09-21); hushåll, ålder, räntor och verifiering 2026-09-14 till 16;
slutgranskning och produktionspaket 2026-09-20; placeringen överst i artikeln som enda leverans 2026-09-21.
