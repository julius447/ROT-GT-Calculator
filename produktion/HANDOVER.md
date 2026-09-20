# Avdragskollen (ROT / grön teknik calculator): WordPress handover

For Chris. Package version 1.0.0, built 2026-09-20 from `kalkylator/v1` (the approved design) by
`produktion/_build/paketera.mjs`, verified by `produktion/_build/paritet.mjs` (211/211 checks, see §7).

## 1. What this is (and what it is not)

Three FluentSnippets snippets that render the calculator on ampy.se exactly as the approved standalone build
(`kalkylator/v1/index.html`): same pixels, same behaviour, on desktop and mobile. Everything is namespaced under
`.ampy-avdragskollen`, so the snippets cannot restyle the site and the site cannot restyle the calculator.

It is **not** a lead-capture tool: it collects nothing and sends nothing. No REST route, no webhook, no nonce,
no tracking, no cookies, no external requests, no data injection. The number on screen is computed in the
visitor's browser from the answers on the card. There is nothing to configure after pasting.

| File | Size | Type | FluentSnippets settings |
|---|---|---|---|
| `dist/styles.css` | 31.9 kB, 448 lines | **CSS** snippet | Run: **Frontend**, location **wp_head** (default for CSS) |
| `dist/backend.php` | 17.2 kB, 267 lines | **Functions (PHP)** snippet | Run: **Frontend & Backend** |
| `dist/engine.js` | 25.3 kB, 483 lines | **JS** snippet | Run: **Frontend**, location **footer** (`wp_footer`) |
| `dist/fonts/Outfit-VariableFont_wght.woff2` | 44.7 kB | reserve only | nothing to upload, see §4 |

`preview/index.html` is the reference page: it loads those three `dist/` files **by reference** (not copies) and
shows both modes on one page (instance 1 = ROT, instance 2 = grön teknik). What you see there is what the site gets.
`preview/host-sim.html` is the same page wrapped in the site's real CSS (theme, Bricks, the "14-global-css" snippet,
fetched 2026-09-20) and renders identically, which is the proof that the site's CSS does not leak in.

## 2. Install (three snippets, ~5 minutes)

Paste each file **raw** (no editor auto-format, no re-indent, no minifier) and check the paste with a byte diff
(§8). Activate in the order CSS → JS → PHP.

1. **CSS**: FluentSnippets → New snippet → type **CSS**. Paste `dist/styles.css` verbatim. Run location:
   Frontend, head. Save, activate.
2. **JS**: New snippet → type **JS**. Paste `dist/engine.js` verbatim. Run location: Frontend, footer. Save,
   activate. (The script also works if FlyingPress delays it: it boots on `document.readyState`.)
3. **PHP**: New snippet → type **Functions / PHP**. Paste `dist/backend.php` verbatim. Run location:
   **Frontend & Backend**. The file starts with `<?php`; if the FluentSnippets editor already shows its own fixed
   `<?php` line, paste from line 2. **Test on staging first and run `php -l` on the pasted code**: a PHP error
   white-screens the site. `php -l` on `dist/backend.php` is clean (PHP 8.5.7).

The PHP snippet only registers a shortcode. It registers no hooks, prints nothing on its own, and is inert on pages
that do not use the shortcode. Several instances on one page are supported (every id, `for`, `aria-*` and radio
`name` is prefixed `ak1-`, `ak2-`, ... per instance; each instance has its own `<form>`).

## 3. Place it (Bricks Shortcode element)

Use a Bricks **Shortcode** element (never the Code element). Two article pages, one shortcode each:

| Page | Shortcode | Renders |
|---|---|---|
| ROT article | `[ampy_avdragskollen mode="rot"]` | heading "Räkna ut ditt ROT-avdrag" + the ROT card (with the "äldre än fem år" question) |
| Grön teknik article | `[ampy_avdragskollen mode="gt"]` | heading "Räkna ut ditt grön teknik-avdrag" + the grön teknik card |

Options:

- `heading="Your own heading"`: replaces the default heading text (plain text, escaped).
- `heading=""`: no heading at all (the card still gets an accessible name via `aria-label`).
- `heading_level="3"`: renders the heading as `<h3>` instead of `<h2>` (for a sidebar placement; it looks
  identical, the `.ampy-h2` class sets every property).
- `mode` defaults to `rot` if omitted or misspelled.

Do not add a second heading above the shortcode: the shortcode renders its own.

**Recommended placement (decided 2026-09-20):** first block in the article column, directly above the
"Snabbt svar" card, on both /rot-avdrag-2026/ and /gron-teknik-2026/. That is the placement that was reviewed on
26 device profiles (research/13). The right-hand sidebar (the TOC column, 30 % of the row) is only wide enough
for the card from a 1 260 px viewport and up; if the owner ever wants the sidebar placement, the column has to
stack below 1 260 px (the CSS for that lives in `kalkylator/artikel/artikel.css`, not in the snippets).

Layout: the card measures **its own container width** (CSS container query on `.ampy-avdragskollen-outer`),
not the viewport. In a column 720 px or wider it shows two columns (questions left, result right); narrower
than 720 px it stacks (questions first, result below, full-width controls). Below 340 px the segment buttons
tighten and the big number goes to 44 px. So it works in the article column (two columns), in a sidebar or
narrow column (stacked) and on phones (stacked), without any per-breakpoint CSS in Bricks. Do **not** add
responsive CSS in the Bricks element's custom-CSS boxes; it is all inside `styles.css`. Give the column
`min-width: 0` if the Bricks column clips (the card shadow is 0 10px 30px) and avoid `overflow: hidden` on it.
The spacing tokens are viewport-based `clamp()` values (the design system's fluid scale), so in a narrow column on
a wide screen the paddings are desktop-size: same as the approved reference.

## 4. Fonts: nothing to upload

`styles.css` declares one `@font-face` for Outfit (variable, weights 100-900) pointing at the site's **existing**
file `/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2` (sha256 `99bd3f38d4854dbb…`, HTTP 200,
10-year cache, checked 2026-09-20). The theme already loads the same URL, so it costs no extra download.
`dist/fonts/` holds a byte-identical copy as a reserve: if the site's file ever moves, upload the copy to
`/wp-content/uploads/ampy-fonts/` and change the two `url(...)` values in block 1 of `styles.css` (or the
`FONT_SITE` constant in `_build/paketera.mjs` and rebuild). No Google Fonts, no CDN, no third-party request.

## 5. Caching / FlyingPress

- Purge the cache after activating the three snippets.
- "Remove unused CSS": add `ampy-avdragskollen` (and `rk`) to the exclusion list. Several rules only apply in
  JavaScript-driven states (`.is-swap`, `[data-status="stopp"]`, `[data-antal]`, `[data-typ="bada"]`,
  `.rk__tal--lang`) and an unused-CSS scan would drop them.
- "Delay JS" is safe (the script boots on `readyState` and `DOMContentLoaded`).
- Minification: the JS is plain ES2020 (template strings, `??`, spread, `replaceChildren`; no `?.`, no numeric
  separators). If the minifier still complains, exclude the snippet from minification rather than editing it.
- Do not minify or reformat the files by hand.

## 6. Site CSS we already neutralised (and what to do if the site CSS changes)

Measured in `preview/host-sim.html` against the site's real CSS files (theme `style.css`, Bricks frontend,
core-framework inline, FluentSnippet "14-global-css"):

- `input:focus { border-color: #5EB1BF !important }` in the site's "14-global-css" snippet. Countered by
  `.ampy-avdragskollen .rk__input:focus / :focus-visible { border-color: ... !important }` with the design's own
  values (teal-deep `#007a69` on focus, ring `0 0 0 3px rgba(0,122,105,.9)`).
- Bricks' `@layer bricks` element rules (`label { margin-bottom: 5px }`, `input { padding: 0 12px; line-height:
  40px }`, `fieldset { padding }`, `legend { display: table; max-width: 100% }`, `button { text-align: inherit;
  -webkit-appearance: button }`, `:where(p) { margin-block }`): all lose to the prefixed rules; the properties we
  do not set ourselves are pinned in the last block of `styles.css` ("Skydd mot värdsidans element-regler").
- The theme's `html { font-size: 62.5% }`: irrelevant, the package contains **zero `rem`** (the one `rem` left in
  the sources, the segment's `34rem` narrow-mode query, became `340px` at 1 rem = 10 px; the build refuses any
  other `rem`).

If the theme, Bricks or a global snippet changes: re-fetch the site CSS into
`research/underlag/14-kod/host-*.css`, rebuild, and run `node produktion/_build/paritet.mjs`. The host-sim rows
of the table show any property that drifts.

## 7. Staging QA after pasting (10 minutes)

The parity script proves the package against the reference in Chromium (1280×900 and 390×844 touch). On staging,
check the same things by hand:

1. Both pages render: ROT page shows the five-year question, grön teknik page does not. Heading text per mode,
   "grön teknik-avdrag" never breaks across lines.
2. At phone width the card stacks (questions first, result below); at article width it shows two columns.
3. Type 300000 in "Din inkomst förra året": the result reads **ca 31 000 kr** (and "12 000" for 180 000, "38 000"
   for pension 240 000 + Över 65, "50 000 kr" without "ca" for 1 200 000).
4. "Nej" on "Äger du din bostad?" shows the red X and the stop message; "Ja" brings the number back.
5. "Lägg till en person" adds "Person 2" with its own fields; "Ta bort" removes it; four persons hide the link.
6. Keyboard: Tab into the income field shows the teal-deep border + ring (not the site's light blue); Enter in a
   field never reloads the page; the "Lägg till" link shows the 2 px navy outline.
7. If two shortcodes sit on one page: answering in one does not change the other.
8. DevTools console: 0 errors, 0 warnings. Network tab: no request except the site's own Outfit file.
9. Optional: Lighthouse accessibility on the page is at least what it was before the shortcode.

What the parity script measured for this package (`_build/out/paritet.json`, `_build/out/*.png`):

| Check | Result |
|---|---|
| Computed styles, 1481 values on 26 elements (57 properties + box size; wrapper, H2, question, sub-line, segment unselected/selected, input + placeholder, unit, link, panel, eyebrow, number row, number, prefix, unit, per-line, disclaimer, stop, stop text, X, note, detail field, person label) | 1481/1481 identical, ROT and grön teknik, 1280 and 390, also inside the site's CSS (host-sim) |
| Card size | 980 × 823 (ROT) and 980 × 708 (GT) at 1280; 356.5 × 1108.5 and 356.5 × 1013.5 at 390: identical |
| Screenshots heading + card, reference vs package | ROT: byte-identical PNG at both widths. GT: 0 differing pixels at 1280, 8 of 1.66 M pixels at 390 (0.000 %, anti-aliasing at one field corner because instance 2 sits at a different sub-pixel y than the reference) |
| State walk (10 states, both modes, both widths): result text, status and computed styles after each | identical, incl. 300 000 → "ca 31 000 kr", Nej → stop, Under 18 → stop, two persons → "upp till 62 000 kr", four persons → "upp till 200 000 kr" |
| DOM: duplicate ids with two instances, dangling `for`/`aria-*`, legend first, template, tab stops (14 ROT / 12 GT) | 0 duplicates, 0 dangling, identical counts |
| Two instances independent, `data-booted` guard, Enter never reloads | pass |
| Keyboard focus: income field ring + border, "Lägg till" outline, segment pill ring; mouse click in the field inside the site's CSS | pass (border `rgb(0, 122, 105)`, not `#5EB1BF`) |
| Console errors/warnings; requests outside localhost | 0 / 0; the only font request is the site path `/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2` |
| Reduced motion | animation duration 1e-06 s in both |

Nothing could not be made identical. The only deliberate differences are format, not design: the wrapper carries
the tokens instead of `:root`, `rem` became px, ids/names are prefixed per instance, the mode comes from the
shortcode attribute instead of `?m=`, and the heading/eyebrow are rendered by PHP from the start (no JS rewrite,
no "ROT" flash on the grön teknik page).

## 8. Versioning: never edit `dist/` by hand

`dist/` is generated. To change anything, edit the sources (`kalkylator/v1/index.html`, `style.css`, `app.js`,
`kalkylator/rakna.js`, `logik/engine.js`, `kalkylator/system/*`) and run from the repo root:

```
node produktion/_build/paketera.mjs      # rebuilds dist/, preview/, host rules; runs php -l and a PHP-vs-Node byte diff
node produktion/_build/paritet.mjs       # Chromium parity against kalkylator/v1, exit 1 on any drift
```

The build refuses to write if the result contains `:root`, `html{`, `body{`, `rem`, an external font host, or an
unprefixed selector, and if a source line it expects has changed (so a source edit that needs a decision stops the
build instead of silently shipping). The file headers carry the package version and the sha256 of the sources;
`_build/byggrapport.md` lists every design-system rule that was included or left out and why.

Byte check after pasting: copy the snippet content back out of FluentSnippets into a file and
`diff dist/styles.css <file>` (same for `engine.js`, `backend.php`). Any difference means the editor changed it.
Current hashes (sha256, first 16): `styles.css e5ce605af26b148c`, `engine.js 55e8ad27ba505efc`,
`backend.php 4f3d65f5378bde44`.

## 9. Placement CSS for the article page is a page matter, not a snippet

Where the card sits in the article template (right column / top of the column, column widths, the stacking
under 1260 px) is page-level Bricks CSS: see `kalkylator/artikel/artikel.css` (`#ampy-hoger`, `[data-plats]`).
It is not part of the three snippets and is not needed for the card itself.

## 10. Known limitations (by design)

- The result is an **estimate**: it uses the average municipal tax rate for 2026 (32.38 %) and the 2026 tax
  parameters (prisbasbelopp 59 200, brytpunkt 643 000, ROT/grön teknik cap 50 000 kr per person and year). The
  card says so ("Uppskattning med snittkommunalskatt. Skatteverket kan landa på ett annat belopp."). Municipal
  rates range 28.93-35.65 %; a "50 000 kr" without "ca" is shown only when it holds at the lowest rate.
- Simplifications inherited from the model (documented in `logik/README.md` and `research/10`): no sjöinkomst,
  no sjuk-/aktivitetsersättning, no regional reduction, no capital income; ROT/RUT and grön teknik are kept
  apart per mode.
- Year parameters live in `logik/engine.js` (`PARAMS_2026`): bump them at the year change and rebuild.
- Browser support: `:has()` (Safari 15.4+, Chrome 105+) for the selected segment pill, container queries
  (Safari 16+, Chrome 105+) for the layout with a viewport-media fallback for older browsers, `replaceChildren`
  (Safari 14+). `text-wrap: pretty/balance` is progressive.
- Print: no print stylesheet (the panel background may not print by default).
