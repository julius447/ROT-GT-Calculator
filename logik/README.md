# logik/ — the shared engine for Ampy's Avdragskollen (ROT + grön teknik, tax year 2026)

One tested logic that all three wireframes import, so every number, verdict, headline and CTA is identical
everywhere. Pure ES modules, no DOM, no fetch, no dependencies. Tests run on Node >= 18.

## Module map

| File | What it is | Imports |
|---|---|---|
| `engine.js` | The calculation engine. `PARAMS_2026`, `skatteutrymme()`, `beraknaRot()`, `beraknaGt()`, plus the Python-faithful rounding helpers. | nothing |
| `ui-model.js` | The UI contract the wireframes render: `COPY` (every Swedish string), `BANKS` (question banks), `evaluate()`, `toEngineInput()`, `encodeState()`/`decodeState()`, `formatKr()`, `round100()`, `resolveBank()`, `resolveTexts()`. | `engine.js` |
| `test.mjs` | `node logik/test.mjs` runs everything and exits non-zero on any failure. Output pasted in `TESTLOGG.md`. | both + the two JSON files |
| `rot-spec.md`, `rot-testfall.json`, `rot_logik_ref.py`, `skatteutrymme_2026.py` | The ROT rule agent's spec, 41 cases and Python reference (source of truth for ROT logic). | |
| `gt-spec.md`, `gt-testfall.json` | The GT rule agent's spec and 36 cases (source of truth for GT logic). | |

Presentation doctrine (classes, headline grammar, amount states, CTA per class, share link) comes from
`research/04-ux-flode.md`. Where the specs and the UX file disagree: **specs win on logic, UX wins on
presentation**. Every such call is listed under "Reconciliations" below.

## Using it in a wireframe

```html
<script type="module">
  import { BANKS, COPY, resolveBank, evaluate, resolveTexts, defaultState, encodeState, decodeState, t }
    from './logik/ui-model.js';

  const mode = 'rot';                                   // 'rot' | 'gt'
  const link = decodeState(location.search);            // { mode, state, prefilled, src }
  let state = { ...defaultState(mode), ...(link.mode === mode ? link.state : {}) };
  const touched = new Set();                            // link-prefilled answers stay "antaget"

  function render() {
    const bank = resolveBank(mode, state);              // questions with labels, shown/folded, values
    const result = resolveTexts(evaluate(mode, state, touched));
    // ... paint bank + result. Every string is already Swedish; never inline strings in the wireframe.
  }
  function answer(id, value) { state[id] = value; touched.add(id); render(); }
</script>
```

`resolveBank()` gives each question `label`, `help`, `options[].label` (resolved), `shown` (render at all?),
`folded` (under "Fler detaljer"?), `value` and `effectiveValue`. `visible` may be a boolean or a function
of the effective state (GT `agare` is visible for batteri/sol and folded for laddbox).

## The evaluate() contract

`evaluate(mode, uiState, touched, opts = { src })` returns (`opts.src` sets the `src` query param on the offert href: `artikel` in embed, default `avdragskollen`):

```
{
  mode: 'rot'|'gt', lage: 'laddbox'|'batteri'|'sol'|null,
  klass: 'ja'|'ja_villkor'|'troligen_inte'|'nej'|'osaker',
  subtyp: string|null,            // e.g. 'flera_villkor', 'pott', 'skatt', 'tak', 'femarsregeln', 'skatt_lag',
                                  //      'batteri_utan_sol', 'hyra', 'under18', 'inte_i_ar', 'inte_an', 'brf_gemensamt', ...
  headline: { key, params },      // COPY key + params ("Ja, om {villkor}" etc.)
  eyebrowKey, ram: { key, params }, disclaimerKey,
  villkor: [{ id, fraga, status, typ, textKey, params, frasKey }],
                                  // status: 'ok'|'antaget'|'okand'|'varning'|'stopp'|'skoter_vi'
                                  // typ:    'grind'|'villkor'|'begransning'|'troligen'|'info'|'stopp'|'skoter_vi'
                                  // fraga:  the question id the row jumps to (null for "det sköter vi")
  counts: { antagna, okanda, villkor, begransningar, stopp },
  belopp: { state, avdrag_kr, avdrag_min_kr?, avdrag_max_kr?, att_betala_kr, att_betala_min_kr?, att_betala_max_kr?,
            avdrag_brutto_kr?, arbetskostnad_kr?, belopp_kr?, tak_kr, tak_slar_i?, pott_kvar_kr?,
            skatt_tacker_kr?, aterbetalningsrisk_kr?, rot_avdrag_kr? (alt_rot), rader? (gt sol+batteri),
            rubrikKey, bas_textKey, params },
                                  // state: 'punkt'|'intervall'|'tak'|'begransad_skatt'|'begransad_pott'|'noll'|'alt_rot'|'dold'
  skatt: { status, utrymme_kr?, utrymme_min_kr?, utrymme_max_kr?, behov_kr?, aterbetalningsrisk_kr?, textKey, params, hedgeKey },
                                  // status: 'ryms'|'ryms_delvis'|'ryms_inte'|'ej_bedomd'|'ej_relevant'
  nasta_steg: [{ key, params }],  // 0 to 3 steps ("Vad händer nu")
  cta: { primary: { labelKey, kind, href, solid, params?, byte? }, secondary: {...}|null },
                                  // kind: 'offert'|'tel'|'lage_byte'|'artikel'|'skatteverket'|'none'
                                  // solid: true = button, false = text link (nej/troligen never get a solid button)
                                  // byte: { mode, state } for kind 'lage_byte' (batteri utan sol -> ROT)
  metod: [COPY keys],             // "Så har vi räknat" lines
  flaggor: [...],                 // engine flag codes (rot-spec §6 / gt-spec §3)
  raw: { rot, rot_min, rot_max } | { gt }   // the engine output(s), untouched
}
```

`resolveTexts(result)` returns the same object with `text` (and `fras`) next to every key, plus
`belopp.rubrik`, `belopp.bas_text`, `belopp.att_betala_text`, `skatt.text`, `skatt.hedge`, `eyebrow`,
`disclaimer`, `metod_text`.

### Rules the contract encodes

- **Antaget / bekräftat (UX §1.4).** `touched` is the set of question ids the user has interacted with.
  An untouched gate answer is `antaget`, a "vet inte" is `okand` (never `ok`). Link-prefilled answers are
  not touched. Headline: 0 open conditions -> "Ja, du kan ...", exactly 1 (antaget, okänd or an engine
  villkor such as BRF stadgar) -> "Ja, om {villkor}", 2 or more -> "Ja, om det här stämmer:", only a
  begränsning (skatt / pott / tak / material) -> "Ja, men {begränsning}".
- **Precedence (UX §3.3).** hard nej (engine nej, pott = 0) > troligen inte (femårsregeln ombyggnad, skatt
  räcker inte / "låg eller ingen inkomst" without deep-dive, batteri utan sol) > osäkert (2+ okända, or
  föräldrarnas bostad + 1 okänd, or batteri i bostadsrätt) > ja med villkor > ja. A hard nej beats everything.
- **Amounts.** ROT with the assumed labour share -> `intervall` (share ±15 percentage points, clamped 0–100,
  each end run through the engine so caps apply); a labour amount in kr or a touched share -> `punkt`;
  empty amount -> `tak`; GT -> `punkt`. `nej` hides the amount (`dold`), pott = 0 shows `noll`, `troligen_inte`
  hides it except batteri utan sol (`alt_rot` with the ROT-on-labour number when the labour cost is known).
  Display rounding is `round100` (raw values stay exact in the object; UX §3.6).
- **Tax.** The visible `skatt` chip alone gives `ej_bedomd` (lön/pension/vet, with a hedge) or `ryms_inte`
  (låg eller ingen inkomst -> `troligen_inte`). The folded deep-dive (`skatt_djup`) runs the validated
  estimator and overrides the chip; `utrymme_min_kr`/`utrymme_max_kr` are the same person at kommunalskatt
  29 % and 35 % (GRIND 7), status is by the default 32,38 %.
- **CTA (UX §5.2).** Exactly one primary per class. `ja`/`ja_villkor` -> `/kontakt/` (live: `/offert/` 301-redirects there and drops the query, GRIND 7) with `src=avdragskollen&m&l&b&v&a&ak`
  (never income or tax); BRF laddbox with the p-plats unresolved -> tel "Ring så reder vi ut det med
  föreningen"; batteri utan sol -> `lage_byte` to ROT; skatt låg -> Skatteverket text link; hyra -> no CTA
  (text link "Hör med din hyresvärd"); under 18 -> nothing; osäkert -> tel.

## Engine API (engine.js)

- `skatteutrymme({ lon_ar, pension_ar, ar_66_plus, ks, taxeringsvarde, ranteutgifter, ovrigt_underskott })`
  -> the chain, `utrymme_rot_rut_gt` is the number both calculators use. Same keys as the Python.
  `ks` is a fraction (0.3238), the UI's `kommunalskatt` question is in percent and converted in `toEngineInput`.
- `beraknaRot(input)` -> `{ verdict, avdrag_brutto_kr, avdrag_kr, att_betala_kr, fordelning_kr, skatt_racker,
  skatt[], aterbetalningsrisk_kr, flaggor, potter_kr*, pott_kvar_kr* }` (`*` = added, not in the Python).
  Input field names are rot-spec §2. An owner without `manadsinkomst` is `ej_bedomd`.
- `beraknaGt(input)` -> `{ verdict, avdrag_brutto_kr, avdrag_kr, tak_kvar_kr, avdrag_efter_skatt_kr,
  aterbetalningsrisk_kr, skatt_racker, att_betala_kr, rot_fallback_kr?, flaggor }`. Input field names are
  gt-spec §2; `skatt_tillganglig_kr[i]` is the ROT model's `utrymme_rot_rut_gt` (null = okänd).
- `harledTaxeringsvarde(bostadstyp, vardear)` (added helper) implements rot-spec §2 "taxeringsvarde (härledd)".
- Rounding: `pyRound` reproduces Python's `round()` (ties to even on the exact double). Do not replace it
  with `Math.round`; the Skatteverket validation depends on it.

## Adding a year

1. Copy `PARAMS_2026` to `PARAMS_2027` in `engine.js` with the new Skatteverket "Belopp och procent" values
   (PBB, KS_SNITT, SKIKTGRANS, PENSIONSAVGIFT_MAX, FASTIGHETSAVGIFT_MAX), the ROT/GT caps and rates if changed,
   `FEMARSREGEL_SISTA_VARDEAR` (+1 each year), `FASTIGHETSAVGIFT_BEFRIAD_FRAN_VARDEAR` (+1), and the age limit
   (66 -> 67 from 2027, GRIND 12). Point `const P` at it.
2. Check the JSA / grundavdrag formulas in `skatteutrymme` against the new wording of IL 63:3, 63:3 a, 67:7, 67:8
   (they are coefficient tables, not just parameters).
3. Update the `vardear` chips in `ui-model.js` (`q.vardear.*` strings, `t2011`/`2012_2020`/`2021_2025` ids
   move with the year) and the year in `eyebrow.*`, `q.fyllt66.label`, `metod.rot.3`.
4. Regenerate the JSON cases from the rule agents' references, run `node logik/test.mjs`, paste into `TESTLOGG.md`.

## Running tests

```
node logik/test.mjs        # PASS/FAIL per group, exit 1 on any failure
```

Groups: (a) 4 Skatteverket runs ±1 kr + 6 E4 rows, (b) 41 ROT cases, (c) 36 GT cases, (d) ui-model
scenarios (~1 500 checks), (e) COPY hygiene and key integrity (a sweep of ~2 400 evaluate() calls over the
input space asserts every produced key exists).

## [GAP] placeholders and GRINDs that affect defaults

All live in `GAP_DEFAULTS` / `LINKS` in `ui-model.js`:

| Placeholder | Value now | Owner decision |
|---|---|---|
| `JOBB_ARBETSANDEL` labour share per job type (ROT) | 60 % for `byta_elcentral` and `annat` | GRIND 2 (elektriker signs the job catalogue + typical share). Until then ROT amounts ship as intervall, never punkt, unless the customer enters the labour cost. |
| `BELOPP_DEFAULT` / `BELOPP_PRESETS` | ROT 30 000 (15/30/60 k); laddbox 20 000; batteri 70 000; sol 150 000 | [GAP] typical Ampy amounts (UX §2.3, GT GRIND 1: GT defaults are round numbers, not Ampy prices). |
| `fastpris` (97 % schablon) | default **off** | GT GRIND 1 (blocking): owner chooses default; the constant `SCHABLON_ARBETE_MATERIAL = 0.97` is in `PARAMS_2026`. |
| `KOMMUNALSKATT_DEFAULT` | 32,38 % (Skatteverket average) with a 29–35 % band in the tax block | GRIND 7 (kommunväljare or not). |
| `INTERVALL_PP` | ±15 percentage points around the assumed share | UX §3.6 "ärligt intervall"; tune when GRIND 2 lands. |
| `LINKS.artikel_*` anchors, `LINKS.foreningar` | `#villkor`, `#hyresratt`, `#nasta-ar`, null | [GAP ägare] article anchors, "Så hjälper vi föreningar" page. |
| `/kontakt/` (was `/offert/`, which 301-redirects and drops the query) reading `src` + params | encoded as `src=avdragskollen&m&l&b&v&a&ak` | [GAP dev] UX §5.4. |
| ROT fallback on battery without solar | shown as "kan", number only when the customer enters the labour cost | GRIND 10 / GT GRIND 5 (elektriker signs; no Ampy share is assumed). |
| Ladda bilen levels in copy | not printed (only the name + link) | GT GRIND 11. |
| GT property fee in the tax pool | 0 for every bostad (no värdeår question in GT) | Conservative by up to 10 425 kr; add a värdeår chip to GT if the owner wants the exact number. |

## Reconciliations (spec vs UX vs task, every decision logged)

1. **Five-year rule.** UX §2.3 asks "Är bostaden äldre än fem år?" (ja/nej/vet). The specs and B5–B8 say
   the rule is not a general age gate: for 2026 om-/tillbyggnad needs värdeår <= 2020, repair is fine at any
   age, and BRF flats have no five-year rule. The bank therefore uses the spec's `vardear` chips (shown for
   villa/fritidshus/föräldrarnas bostad, all småhus) plus `arbetstyp` auto-shown for 2021–2025 and "vet inte".
   The UX row "NEJ, inte än, från och med 20XX" becomes `troligen_inte`/`femarsregeln` (ombyggnad on a
   2021–2025 house; the exact year is not asked, so no "från 20XX" is printed) and `nej`/`inte_an` for
   2026/ej färdigställt. `vardear` is shown for `foralder` too (task said villa/fritid only) because the row
   in the villkor list must be clickable back to a rendered question.
2. **Tax question.** UX §2.6 recommended a "skatt betalad förra året" field (A). The task specifies the
   income proxy (B) via the validated estimator, which is what ships (`skatt_djup` group). Income never
   leaves the browser, never goes in the link or the offert href, and the output is a band (29–35 %) per
   03 §F3 ("troligen").
3. **"Vet inte" grammar.** rot-spec classes one unknown as engine `osaker`; UX §3.3 renders one unknown as
   "Ja, om {villkor}" and two or more as OSÄKERT. UX wins (presentation): engine `osaker` with one unknown
   maps to `ja_villkor`/`h.ja_om`; two or more (or föräldrarnas bostad + one) map to `osaker`. Owner decision
   3 in UX §12 (stricter: every "vet inte" = OSÄKERT) is a one-line change in `classify()`.
4. **Pott = 0.** rot-spec returns verdict `ja` with `pott_slut_i_ar`; UX §3.3 says "Nej, inte i år". UX wins:
   class `nej`/`inte_i_ar`, amount `noll`, text link "Vad gäller nästa år?" ([GAP ägare, fråga 7]). Same for
   GT `tak_kvar_kr = 0`.
5. **`skatt = lag` without deep-dive** -> `ryms_inte` and `troligen_inte` (task + UX §3.4). With the deep-dive,
   the estimator decides; `ryms_inte` only when utrymme is 0 (reference semantics), otherwise `ryms_delvis`
   -> "Ja, men skatten räcker till ungefär X kr av Y kr" + `begransad_skatt`. This is why the task's scenario
   "15 000 kr/mån -> ryms_inte" is asserted as `ryms_delvis` in test.mjs (see TESTLOGG).
6. **GT BRF laddbox.** UX §3.5 had "Troligen via föreningen" + tel. gt-spec makes it depend on `pplats`
   (följer bostadsrätten -> berättigad med villkor; hyrd/gemensamt -> stopp; vet inte -> osaker). Logic per
   spec; presentation: `pplats` is auto-shown for BRF + laddbox with default "vet inte" (an okänd row, never a
   favourable assumption), and while it is unresolved the primary CTA is tel "Ring så reder vi ut det med
   föreningen" (UX §5.2 BRF row).
7. **GT batteri i bostadsrätt** -> engine `osaker` (brf_batteri_kraver_egen_produktion) maps straight to UI
   `osaker` (no question can resolve it), CTA "Prata med oss".
8. **Föräldrarnas bostad in GT.** gt-spec: berättigad with the informational flag `foralders_hushall`. UX:
   JA MED VILLKOR. UI shows the condition row (äger del + betalar) as a `villkor`, so the class is
   `ja_villkor` in both modes (the condition exists in law for both, S2/S3).
9. **GT `material_ej_avdrag` / leasing** are rendered as a begränsning ("Ja, men bara på arbetet ...") rather
   than a plain ja, per the UX grammar "Ja, men <begränsning>".
10. **GT-engine additions (documented in engine.js):** unanswered `solceller` (batteri) and unanswered `pplats`
    (laddbox + BRF) are treated like "vet inte"; unanswered `ager`/`bostad` get the flags `agande_okant` /
    `bostad_okand`; informational "_ok" flags and `skatt_okand`/`rot_rut_okant` attach only for evaluated
    classes (8–11), `stodtjanster_paverkar_inte_avdraget` only for 9–11 (matches all 36 cases); the ROT
    fallback's `att_betala_kr` includes `tillagg_elcentral_kr` (the customer pays it either way).
11. **ROT-engine additions:** `potter_kr` and `pott_kvar_kr` in the output; `harledTaxeringsvarde()`; `vet_inte`
    värdeår gives taxeringsvärde 0 (conservative). Owner 2 in ROT inherits the house (same taxeringsvärde),
    is assumed to have an unused pott, and gets its own deep-dive fields (`inkomsttyp_2`, `manadsinkomst_2`,
    `fyllt66_2`) shown when `agare = 2`; ränteutgifter and planned GT apply to owner 1 only.
12. **Share link.** Whitelist exactly as UX §7.1 (`m,l,b,y,yy,p,a,ak,a2,s,o,u,ur,src`). `y` carries the
    vardear chip ids; the legacy `ja|nej|vet` (+`yy`) are decoded onto the chips. `arbetstyp`, `plats`,
    `pplats`, `material`, `bor_detalj`, `anvandning` are not in the whitelist and are therefore not encoded
    (a säljare's link cannot carry "reparation"; the receiver answers it). `c` (bekräftad) is ignored by design.
13. **Two owners.** The spec's "fill the owner with the largest pott first" is kept in the engine. UX §3.4
    "Ja, upp till 100 000 kr om ni båda har skatt" is rendered as the `agare` row "ni båda har skatt att räkna
    av mot" (antaget until owner 2's deep-dive is touched) and `tak_kr = 100 000`.
14. **Sol + batteri samtidigt** (`batteri_samtidigt_kr`, sol mode) is two engine runs chained through the
    same pott (`gt_anvant_kr` + the solar row) and rendered as two rows under one cap, never a merged percent.
15. **ROT fallback amount on batteri utan sol** uses the GT engine's `rot_fallback_kr` (floor of 30 % of the
    entered labour cost, no cap/tax check) exactly as gt-spec §4 defines it; the full ROT check (femårsregel,
    pott, skatt) happens when the customer takes the `lage_byte` CTA into ROT mode.
16. **Under 18 row** is a prefilled `ok` row (not counted as antaget), per UX §2.5.
17. **Strings.** All draft Swedish, du-tilltal, "kan" on tax outcomes, no em/en dash, no "·", max one "!"
    (enforced by test group e). The copy agent edits `COPY` only.
