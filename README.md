# ROT-GT-Calculator

Ampy Nordic AB: ROT- och grön teknik-kalkylatorn ("Avdragskollen"), inkomstår 2026. Kunden svarar på några
frågor (äger bostaden, äldre än fem år, ålder, inkomst, låneräntor, redan använt avdrag, fler personer i
hushållet) och får sitt uppskattade tillgängliga ROT-avdrag eller grön teknik-avdrag: det lägsta av taket per
person (50 000 kr) och personens skatteutrymme efter de reduktioner som ligger före i inkomstskattelagen
67 kap. 2 §. Räknemotorn är verifierad mot Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (75 körningar,
0 kr diff i 73, research/09 och 12). Byggd på Ampys designsystem (julius447/Design-Guide-Ampy, snapshot i
`kalkylator/system/`).

Live: https://julius447.github.io/ROT-GT-Calculator/ (roten pekar till `kalkylator/v1/?m=rot`; `?m=gt` = grön teknik).
I artikelmallen: `kalkylator/artikel/` (`?p=topp` överst i artikelspalten, `?p=hoger` i högerspalten).

| Mapp | Innehåll |
|---|---|
| `kalkylator/v1/` | Den valda kalkylatorn: `index.html`, `style.css`, `app.js`, `_probe.mjs` (96 krav), `NOTES.md`, `skarmdumpar/` |
| `kalkylator/rakna.js` | Kalkylatorns logik (`beraknaHushall`) ovanpå motorn |
| `kalkylator/system/` | Designsystemet (tokens, base, komponenter, Outfit) |
| `kalkylator/artikel/` | Klon av artikelmallen med kalkylatorn inbäddad (`bas-inbaddad.css`, `artikel.css`) |
| `kalkylator/v2b/`, `kalkylator/v3/` | Designrundans två alternativ (historik, inte den slutliga logiken) |
| `produktion/` | FluentSnippets-paketet till produktion: `dist/styles.css`, `dist/backend.php`, `dist/engine.js`, `preview/` |
| `logik/` | Motorn: `engine.js` (skatteutrymme + ROT/GT-regler), specar, testfall, `node logik/test.mjs` (3 043 kontroller), `verifiering-skv-2026.json` (75 e-tjänstkörningar), `verifiering_oberoende.py` |
| `research/` | 00–06 grundning, regelverk, marknad, UX, riktningar; 07–10 lag, parametrar, verifiering, formel (2026-09-16); 11 förklaringen för kvalitetssäkring; 12–14 slutgranskning (logik, responsivt, kod) |
| `tools/` | `shot.mjs` (render), `kontroll.mjs` (oberoende kontroll), `skv-etjanst-grid.mjs` (e-tjänstkörning), `artikel-klon.py` |
| `GRINDLISTA.md` | Ägarfrågor (historik) |

Historik: tre wireframe-riktningar (A Villkorstavlan, B Kvittot, C Avdragsmätaren) byggdes 2026-09-11 och
underkändes som för komplexa (git 5d9bd5e); v2 "tre frågor" 2026-09-14; designrundan v1/v2b/v3 samma dag med v1
vald; hushåll, ålder, räntor och verifiering 2026-09-14 till 16; slutgranskning och produktionspaket 2026-09-20.
