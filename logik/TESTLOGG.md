# TESTLOGG

Körning: `node logik/test.mjs` den 2026-09-11 14:08 CEST (exit code 0).

Grupperna: (a) skatteutrymme mot Skatteverkets fyra e-tjänstkörningar + sex rader ur uppslagstabellen E4,
(b) alla 41 ROT-fall ur `rot-testfall.json` (fält för fält, flaggor som mängder), (c) alla 36 GT-fall ur
`gt-testfall.json`, (d) ui-model-scenarierna (klasser, rubrikgrammatik, beloppspanelens tillstånd,
skatteband, delbar länk), (e) COPY-hygien (inga tank- eller halvstreck, ingen mittpunkt, max ett "!") och att
varje nyckel som bankerna och evaluate() refererar finns.

```
Avdragskollen logic tests, 2026-09-11T12:08:18.686Z (node v25.9.0)
PASS  a) skatteutrymme: 4 Skatteverket runs (±1 kr) + 6 E4 rows: 29 ok, 0 fail
PASS  b) ROT: 41 cases from rot-testfall.json: 41 ok, 0 fail
PASS  c) GT: 36 cases from gt-testfall.json: 36 ok, 0 fail
PASS  d) ui-model scenarios: 1535 ok, 0 fail
PASS  e) COPY hygiene (no em/en dash, no "·", max one "!") + referenced keys exist: 1341 ok, 0 fail
ALL GREEN: 2982 checks passed, 0 failed
```

Kända avvikelser från uppdragstexten (medvetna, se README "Reconciliations"):

- Scenario 7 ("skatt lag + fördjupning 15 000 kr/mån -> ryms_inte"): motorn ger `ryms_delvis` för 15 000 kr/mån
  (utrymme 22 136 kr i villa, 11 711 kr utan) eftersom `ryms_inte` i referensmodellen kräver utrymme 0. Testet
  verifierar 15 000 -> `ryms_delvis` + `begransad_skatt`, och 5 000 kr/mån i bostadsrätt -> `ryms_inte` +
  `troligen_inte`.
