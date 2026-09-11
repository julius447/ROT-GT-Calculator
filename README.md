# ROT-GT-Calculator

Ampy Nordic AB: ROT-kalkylatorn och Grön Teknik-kalkylatorn. Två verktyg, en design, olika logik.
Svarar på kundens fråga "är jag berättigad, och hur mycket blir det?" för ROT-avdraget och
skattereduktionen för grön teknik 2026. Embeddas i början av `/rot-avdrag-2026/` och
`/gron-teknik-2026/` och skickas som länk av säljarna.

## Struktur

| Mapp | Innehåll |
|---|---|
| `research/` | Grundning, regelverk (ROT, grön teknik), marknad, UX-flöde, leadmagnet, riktningar |
| `logik/` | Beslutsmodell och testfall per avdrag (`*-spec.md`, `*-testfall.json`), motorn (`engine.js`) |
| `wireframes/` | Tre divergenta, interaktiva wireframes + galleri (`index.html`) |
| `GRINDLISTA.md` | Numrerade ägarfrågor som väntar på Julius |

Live: https://julius447.github.io/ROT-GT-Calculator/
