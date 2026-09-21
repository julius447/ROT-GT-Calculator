# Avdragskollen at the top of the article: WordPress handover

For Chris. Package **1.1.0**, built 2026-09-21 by `produktion/_build/paketera.mjs`, verified by
`produktion/_build/paritet.mjs` (341/341 checks, §8). One placement only, decided by the owner 2026-09-21: **the
calculator is the first block in the article column, above the "Snabbt svar" card**, on the two article pages built on
the new article template (the one behind https://ampy.se/elcentral-guide-2026/).

| Page | Shortcode | Renders |
|---|---|---|
| /rot-avdrag-2026/ | `[ampy_avdragskollen mode="rot"]` | heading "Räkna ut ditt ROT-avdrag" + the ROT card (with the "äldre än fem år" question) |
| /gron-teknik-2026/ | `[ampy_avdragskollen mode="gt"]` | heading "Räkna ut ditt grön teknik-avdrag" + the grön teknik card |

What it looks like, before you touch anything: open `preview/artikel-rot.html` and `preview/artikel-gt.html` in a
browser (they are the article template with the package rendered in place, loading the three `dist/` files by
reference) and look at `skarmdumpar/` (desktop 1440, iPad 1024, phone 390). That is the approved design, pixel for
pixel (§8).

## 1. What this is (and what it is not)

Three FluentSnippets snippets. Everything is namespaced under `.ampy-avdragskollen`, so the snippets cannot restyle
the site and the site cannot restyle the calculator (the package was measured inside the site's real CSS, §7).

It is **not** a lead-capture tool: it collects nothing and sends nothing. No REST route, no webhook, no nonce, no
tracking, no cookies, no external requests, no data injection. The number on screen is computed in the visitor's
browser from the answers on the card. Nothing to configure after pasting.

| File | Size | Type | FluentSnippets settings |
|---|---|---|---|
| `dist/styles.css` | 33.0 kB, 456 lines | **CSS** snippet | Run: **Frontend**, location **wp_head** (default for CSS) |
| `dist/backend.php` | 14.6 kB, 236 lines | **Functions (PHP)** snippet | Run: **Frontend & Backend** |
| `dist/engine.js` | 25.3 kB, 481 lines | **JS** snippet | Run: **Frontend**, location **footer** (`wp_footer`) |
| `dist/fonts/Outfit-VariableFont_wght.woff2` | 44.7 kB | reserve only | nothing to upload, see §5 |

`preview/artikel-rot.html` and `preview/artikel-gt.html` are the reference pages: the rendered DOM of the article
template (fetched 2026-09-21, scripts and cookie banner removed, the site's stylesheets copied to `preview/sajt/`,
images loaded from ampy.se) with the shortcode's exact output inserted where the Bricks element goes, plus
`<link href="../dist/styles.css">` and `<script src="../dist/engine.js">`. Open them from disk or from
https://julius447.github.io/ROT-GT-Calculator/produktion/preview/artikel-rot.html (and `artikel-gt.html`).

## 2. Install (three snippets, ~5 minutes)

Paste each file **raw** (no editor auto-format, no re-indent, no minifier) and check the paste with a byte diff
(§9). Activate in the order CSS → JS → PHP.

1. **CSS**: FluentSnippets → New snippet → type **CSS**. Paste `dist/styles.css` verbatim. Run location:
   Frontend, head. Save, activate.
2. **JS**: New snippet → type **JS**. Paste `dist/engine.js` verbatim. Run location: Frontend, footer. Save,
   activate. (It also works if FlyingPress delays it: it boots on `document.readyState`.)
3. **PHP**: New snippet → type **Functions / PHP**. Paste `dist/backend.php` verbatim. Run location:
   **Frontend & Backend**. The file starts with `<?php`; if the FluentSnippets editor already shows its own fixed
   `<?php` line, paste from line 2. **Test on staging first and run `php -l` on the pasted code**: a PHP error
   white-screens the site. `php -l` on `dist/backend.php` is clean (PHP 8.5.7).

The PHP snippet only registers the shortcode. It registers no hooks, prints nothing on its own, and is inert on
pages that do not use the shortcode.

## 3. Place it: first element in the article column

The article template's column structure (Bricks element ids from the rendered page):

```
Section
└─ Container  #brxe-meojam          (row, space-between, column-gap apspace-l; ≤ 780 px: column-reverse)
   ├─ Block   #brxe-pfbtud          the article column, 65 % (flex column, align-items center, row-gap apspace-s)
   │  ├─ Code element  (.brxe-code, the article CSS; 0 px tall)
   │  ├─ ► Shortcode element  [ampy_avdragskollen mode="rot"]   ← NEW, here, nowhere else
   │  ├─ Div  #brxe-vjjqxy          the "Snabbt svar" card
   │  └─ Div  #brxe-osowze  >  Post Content  #brxe-wupkem  (.brxe-post-content)
   └─ Block   #brxe-qopmij          the TOC card, 30 %, sticky
```

Add a Bricks **Shortcode** element (never the Code element) inside Block `#brxe-pfbtud`, directly after the Code
element and before the "Snabbt svar" Div, with the shortcode as its content. One mode per page:

- Both articles share the template, so use **two Shortcode elements with Bricks element conditions**: one with
  `[ampy_avdragskollen mode="rot"]` and the condition *Post ID / slug = rot-avdrag-2026*, one with `mode="gt"` and
  *= gron-teknik-2026*. Every other article renders neither. (If each article has its own template copy, one
  element per template is enough.) A dynamic-data alternative also works: a custom field holding `rot` or `gt` and
  `[ampy_avdragskollen mode="{cf_ampy_avdragskollen_mode}"]` with the element conditioned on the field being set.
- Do **not** put the shortcode in the post content editor: it would render below "Snabbt svar", inside
  `.brxe-post-content`, where the template's `h2 { margin-top: apspace-xl !important }` rules would also hit the
  calculator heading.
- Do not add a heading above the element (the shortcode renders its own, styled as the template's H2), no wrapper
  Div, no custom CSS on the element, no padding on the element. The element must be a **direct child** of the Block:
  the Block is a flex column with `align-items: center`, and the package sets its own container to
  `width: 100%; min-width: 0` (a container-query box has no intrinsic width; without this rule it collapses to 0 px,
  which the parity script catches).

Options on the shortcode (none needed for the two pages): `heading="Your own heading"` replaces the heading text
(plain text, escaped); `heading=""` removes it (the card keeps an accessible name via `aria-label`);
`heading_level="3"` renders `<h3>` instead of `<h2>` (identical look). `mode` defaults to `rot`.

## 4. The design, exactly (what you should see)

Measured on the reference pages in Chromium (`_build/out/paritet.json`); the tokens are the design system's
(`--ampy-*`, resolved to px on the wrapper) and the article template's (`--aptext-*`, `--apspace-*`).

**Heading** = the template's own H2: Outfit 700, `clamp(24px, 0.83vw + 21.3px, 32px)` (32 px at 1440), line-height
1.25, letter-spacing −0.025em, midnight `rgb(9, 11, 50)`, margin-bottom `apspace-s` (19.8 px at 1440); ≤ 768 px
viewport: `clamp(22px, 0.63vw + 20px, 28px)` (22.5 px at 390). The mode name never breaks across lines
("grön teknik-avdrag" sits in a nowrap span).

**Card**: white, 1 px hairline `rgba(9, 11, 50, .14)`, radius 20 px, shadow `0 10px 30px rgba(9, 11, 50, .07)`.
Base font Outfit 300 18/27, midnight. Questions: label 20 px/500 midnight, sub-line 16 px muted `rgb(86, 94, 130)`,
segment control (pill group `rgba(9, 11, 50, .07)`, radius 12, 4 px inset; selected pill white with teal-deep
`rgb(0, 122, 105)` 600 text, unselected muted 500), number fields 18 px/500 tabular, 48 px tall, radius 12, border
`rgba(9, 11, 50, .48)`, unit "kr" inside; "Lägg till en person" is a teal-deep 16 px/500 link with a plus icon.
**Result panel**: sky mist `rgb(245, 249, 255)`, eyebrow 12 px uppercase, letter-spacing 1.68 px, muted; the number
Outfit 700 tabular with the prefix ("upp till"/"ca") at half size and "kr" beside it; "Per person och år." 16 px muted;
disclaimer 14 px muted. Focus: teal-deep border + 3 px ring `rgba(0, 122, 105, .9)` (keyboard and mouse), never the
site's `#5EB1BF`.

**Layout is container-driven** (CSS container query on `.ampy-avdragskollen-outer`, the calculator's own width, not
the viewport), so nothing has to be set per breakpoint in Bricks:

| Where | Column width | Card | Number |
|---|---|---|---|
| Desktop 1440 (article column 65 % = 832 px) | ≥ 720 px → **two columns**: questions 456.5 px left, result panel 373.5 px right (panel has a left hairline, radius on the right corners) | 832 × 788 (ROT), 832 × 673 (grön teknik) | 54.5 px (scales with the column: `clamp(40px, (45cqi − 80px) / 5.4, 64px)`) |
| Desktop 1280 (column 781 px) | two columns | | ~50 px |
| iPad portrait 1024 (column 621 px) | < 720 px → **stacked**: questions first, result panel below with a top hairline and bottom corners, full-width controls | 621 × 1026 | 52 px |
| Phone 390 (template stacks its two columns at ≤ 780 px; the TOC card comes first, then the article column, so the calculator is the first thing in the article column) | stacked, 347 px wide, segment pills 44 px tall (touch), panel padding 28 px | 347 × 1006 | 52 px |
| < 340 px | stacked, tighter pills (5 px side padding), number 44 px | | 44 px |

Spacing: the Block's `row-gap` (apspace-s, 19.8 px at 1440) plus the package's own `margin-bottom: apspace-m`
(28 px at 1440) put the card **47.8 px above "Snabbt svar"**, exactly the distance the template already keeps between
"Snabbt svar" and the post content (its `margin-bottom` is apspace-m too). On the phone the same rule gives 30.2 px.

Screenshots in `skarmdumpar/` (taken from the reference pages, dsf 2): `desktop-{rot,gt}-sida.png` (page top to the
calculator: the context), `desktop-{rot,gt}-kalkylator.png` (heading + card + the gap to "Snabbt svar"),
`desktop-{rot,gt}-exempel.png` (300 000 typed → "ca 31 000 kr"), `ipad-{rot,gt}-kalkylator.png`,
`mobil-{rot,gt}-1.png` (questions) and `-2.png` (result), both 390×844 screens cut from the full page (the sticky
site header is not in them: the clone has no JS).

## 5. Fonts: nothing to upload

`styles.css` declares one `@font-face` for Outfit (variable, weights 100-900) pointing at the site's **existing**
file `/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2` (sha256 `99bd3f38d4854dbb…`, HTTP 200, 10-year
cache, checked 2026-09-20). The theme already loads the same URL, so it costs no extra download. `dist/fonts/` holds
a byte-identical copy as a reserve: if the site's file ever moves, upload the copy to `/wp-content/uploads/ampy-fonts/`
and change the two `url(...)` values in block 1 of `styles.css` (or `FONT_SITE` in `_build/paketera.mjs` and
rebuild). No Google Fonts, no CDN, no third-party request.

## 6. Caching / FlyingPress

- Purge the cache after activating the three snippets.
- "Remove unused CSS": add `ampy-avdragskollen` (and `rk`) to the exclusion list. Several rules only apply in
  JavaScript-driven states (`.is-swap`, `[data-status="stopp"]`, `[data-antal]`, `[data-typ="bada"]`,
  `.rk__tal--lang`) and an unused-CSS scan would drop them.
- "Delay JS" is safe (the script boots on `readyState` and `DOMContentLoaded`).
- Minification: the JS is plain ES2020 (template strings, `??`, spread, `replaceChildren`; no `?.`, no numeric
  separators). If the minifier still complains, exclude the snippet from minification rather than editing it.
- Do not minify or reformat the files by hand.

## 7. Site CSS already neutralised (and what to do if the site CSS changes)

The reference pages carry the site's real stylesheets (theme `style.css`, Bricks frontend, core-framework inline,
global variables, the "14-global-css" snippet, the page CSS of the template), so the parity run is the proof that the
site's CSS does not leak in:

- `input:focus { border-color: #5EB1BF !important }` in the site's "14-global-css" snippet: countered by
  `.ampy-avdragskollen .rk__input:focus / :focus-visible { border-color: ... !important }` with the design's own
  values (teal-deep `#007a69`, ring `0 0 0 3px rgba(0,122,105,.9)`). Measured with a mouse click and with Tab.
- Bricks' `@layer bricks` element rules (`label { margin-bottom: 5px }`, `input { padding: 0 12px; line-height:
  40px }`, `fieldset { padding }`, `legend { display: table; max-width: 100% }`, `button { text-align: inherit;
  -webkit-appearance: button }`, `:where(p) { margin-block }`) and the theme's `button`/`input` typography (300
  weight, uppercase, letter-spacing): all lose to the prefixed rules; the properties the calculator does not set
  itself are pinned in block 7 of `styles.css` ("Skydd mot värdsidans element-regler").
- The theme's `html { font-size: 62.5% }`: irrelevant, the package contains **zero `rem`** (the one `rem` in the
  sources, the segment's `34rem` narrow-mode query, became `340px` at 1 rem = 10 px; the build refuses any other).
- The Block's `align-items: center`: handled by `width: 100%` on the package's container (§3).

If the theme, Bricks, a global snippet or the template changes: re-fetch the article with
`node tools/klona-artikel.mjs` + `python3 tools/artikel-klon.py`, refresh `research/underlag/14-kod/host-*.css`,
rebuild, and run `node produktion/_build/paritet.mjs`. Any property that drifts shows up as a row in the table.

## 8. What the parity script proved for this package

Reference = the approved source (`kalkylator/v1`, and the article clone `kalkylator/artikel/` with that source in
the same place). Candidate = the three `dist/` files loaded by reference. Chromium; `_build/out/paritet.json` and
`_build/out/*.png` hold the evidence. **341/341 checks.**

| Group | Check | Result |
|---|---|---|
| **Article (the delivery)**, ROT and grön teknik, at 1440, 1024 (touch) and 390 (touch) | Position and size (x, y, width, height) of the heading, the card, the "Snabbt svar" card below and the whole article column; element order in the column | identical to the reference in all 6 cases |
| | Computed styles: 1481 values on 26 elements (57 properties + box size: wrapper, heading, question, sub-line, segment unselected/selected, input + placeholder, unit, link, panel, eyebrow, number row, number, prefix, unit, per-line, disclaimer, stop, stop text, X, note, detail field, person label) | 1481/1481 identical in all 6 cases |
| | Screenshot of heading + card + the gap down into "Snabbt svar" (top edge snapped to a whole pixel in both pages) | **byte-identical PNG** in all 6 cases |
| | Engine: 300 000 → "ca 31 000 kr"; "Nej" → stop state (same text as the reference) | pass |
| | Focus inside the site's real CSS: border `rgb(0, 122, 105)` + ring on mouse click | pass |
| | Console errors/warnings 0; requests only to localhost and ampy.se (the article's own images and fonts); Outfit only from the site file; no Google/CDN | pass |
| | The calculator stays inside the column, no inner overflow | pass |
| **Two instances on one page** (fixture `_build/prov/tva-instanser.html`) at 1280 and 390 | Computed styles (1422 values on 25 elements) vs `kalkylator/v1`; card screenshots byte-identical; state walk (10 states, both modes) with identical result text, status and styles after each; DOM (0 duplicate ids with two instances, 0 dangling `for`/`aria-*`, legend first, template, same tab stops); two instances independent; `data-booted` guard; Enter never reloads; keyboard focus ring/outline; reduced motion | pass |
| **Inside the site's CSS** (fixture `_build/prov/host-sim.html`) | same style values; mouse click in the field keeps the teal-deep border, not `#5EB1BF` | pass |

Deliberate differences are format only, never design: the wrapper carries the tokens instead of `:root`, `rem`
became px, ids/names are prefixed per instance (`ak1-`), the mode comes from the shortcode attribute instead of
`?m=`, and the heading/eyebrow are rendered by PHP from the start (no JS rewrite, no "ROT" flash on the grön teknik
page).

## 9. Staging QA after pasting (10 minutes)

1. Both pages: the calculator is the first thing in the article column, above "Snabbt svar"; nothing on any other
   article. ROT page shows the five-year question, grön teknik page does not. Heading text per mode; "grön
   teknik-avdrag" never breaks across lines.
2. Desktop: two columns (questions left, result right), the card as wide as "Snabbt svar", 47.8 px above it. Phone:
   stacked card, full width, below the TOC card (the template's order).
3. Type 300000 in "Din inkomst förra året": **ca 31 000 kr** (180 000 → "ca 12 000 kr"; pension 240 000 + Över 65 →
   "ca 38 000 kr"; 1 200 000 → "50 000 kr" without "ca").
4. "Nej" on "Äger du din bostad?" shows the red X and the stop message; "Ja" brings the number back.
5. "Lägg till en person" adds "Person 2" with its own fields; "Ta bort" removes it; four persons hide the link.
6. Keyboard: Tab into the income field shows the teal-deep border + ring (not the site's light blue); Enter in a
   field never reloads the page; the "Lägg till" link shows the 2 px navy outline.
7. DevTools console: 0 errors, 0 warnings. Network tab: no request except the site's own Outfit file.
8. Optional: Lighthouse accessibility on the page is at least what it was before.

Byte check after pasting: copy the snippet content back out of FluentSnippets into a file and
`diff dist/styles.css <file>` (same for `engine.js`, `backend.php`). Any difference means the editor changed it.
Hashes (sha256, first 16): `styles.css 25e53143cbb9cfd4`, `engine.js 17ac0fc04f566a16`, `backend.php 6bda275e74b06f1c`.

## 10. Versioning: never edit `dist/` by hand

`dist/` is generated. To change anything, edit the sources (`kalkylator/v1/index.html`, `style.css`, `app.js`,
`kalkylator/rakna.js`, `logik/engine.js`, `kalkylator/system/*`, and for the article placement
`kalkylator/artikel/artikel.css`) and run from the repo root:

```
node produktion/_build/paketera.mjs      # rebuilds dist/, preview/artikel-*.html, the fixtures; php -l + PHP-vs-Node byte diff
node produktion/_build/paritet.mjs       # Chromium parity against the sources, exit 1 on any drift
node produktion/_build/skarmdumpar.mjs   # the screenshots in skarmdumpar/
```

The build refuses to write if the result contains `:root`, `html{`, `body{`, `rem`, an external font host, or an
unprefixed selector, if a source line it expects has changed, or if the template's tokens no longer resolve to the
values block 8 (the article placement) was approved with. The file headers carry the package version and the sha256
of the sources; `_build/byggrapport.md` lists every design-system rule that was included or left out and why.

## 11. Known limitations (by design)

- The result is an **estimate**: average municipal tax rate 2026 (32.38 %) and the 2026 parameters (prisbasbelopp
  59 200, brytpunkt 643 000, ROT/grön teknik cap 50 000 kr per person and year). The card says so. Municipal rates
  range 28.93-35.65 %; "50 000 kr" without "ca" is shown only when it holds at the lowest rate.
- Simplifications inherited from the model (`logik/README.md`, `research/10`): no sjöinkomst, no sjuk-/aktivitets-
  ersättning, no regional reduction, no capital income; ROT/RUT and grön teknik are separate posts per mode; the
  tool does not deduct amounts already used this year.
- Year parameters live in `logik/engine.js` (`PARAMS_2026`): bump them at the year change and rebuild.
- Browser support: `:has()` (Safari 15.4+, Chrome 105+) for the selected pill, container queries (Safari 16+,
  Chrome 105+) with a viewport-media fallback for older browsers, `replaceChildren` (Safari 14+). `text-wrap:
  pretty/balance` is progressive.
- The template puts the TOC card above the article column on phones (its own `column-reverse` at ≤ 780 px). If the
  owner wants the calculator above the TOC on phones, that is a Bricks order setting on the template, not a snippet
  change.
- Print: no print stylesheet.
