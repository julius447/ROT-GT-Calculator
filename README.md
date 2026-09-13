# ROT-GT-Calculator

Ampy Nordic AB: ROT- och grön teknik-kalkylatorn ("Avdragskollen"). Tre frågor, två tal.
Äger du din bostad, är den äldre än fem år, vad hade du i inkomst förra året: ut kommer ditt uppskattade
ROT-tak och grön teknik-tak 2026, räknat på din skatt med samma modell som Skatteverkets e-tjänst
(validerad ±1 kr). Inga knappar, ingen process, ingen förklaringstext. Byggd på Ampys designsystem
(julius447/Design-Guide-Ampy, snapshot i `kalkylator/system/`).

Live: https://julius447.github.io/ROT-GT-Calculator/ (roten pekar till `kalkylator/`; `?m=gt` sätter grön teknik först).

| Mapp | Innehåll |
|---|---|
| `kalkylator/` | Kalkylatorn v2: `index.html`, `kalkylator.css`, `kalkylator.js`, `system/` (designsystemet), `_probe.mjs` |
| `logik/` | Motorn: `engine.js` (skatteutrymme + ROT/GT-regler), specar, 77 testfall, `node logik/test.mjs` |
| `research/` | Grundning, regelverk (ROT, grön teknik), marknad, UX, leadmagnet, riktningar (historik) |
| `GRINDLISTA.md` | Ägarfrågor som väntar på Julius |

Historik: tre wireframe-riktningar (A Villkorstavlan, B Kvittot, C Avdragsmätaren) byggdes 2026-09-11 och
underkändes av ägaren som för komplexa; de ligger i git-historiken (commit 5d9bd5e) men inte på sajten.
