# UX-källor för 04-ux-flode.md

Vad UX-agenten faktiskt läste, öppnade eller hämtade 2026-09-11, och vad som bara citeras ur minnet.
Regel: allt som påverkar en designregel i `04-ux-flode.md` ska stå här med väg eller URL.

## 1. Bindande doktrin (lästa i sin helhet, lokala filer)

| Fil | Använt till |
|---|---|
| `rot-gt-calculator/research/00-grundning.md` | uppdraget, artiklarnas mall, sökdatan (segmentfrågorna), SERP-läsningen, kanon, tidigare arbete, öppna frågor 1 till 4 |
| `.claude/skills/ampy-wireframe-ux/SKILL.md` | register först, det invarianta skelettet (10 punkter), arketyperna, de två layoutfamiljerna, grön cell säljer inte, "Osäker" som fullvärdigt svar |
| `.claude/skills/ampy-wireframe-ux/wireframes.md` | ASCII-schemorna för båda familjerna, mobil är omlagd inte skalad, rail-CTA:erna kollapsar till en sticky på mobil, brytpunkter 992/768/480 |
| `.claude/skills/ampy-wireframe-ux/archetypes.md` | kostnadsuppskattning = intervall, ingen kurva; dubbelbas-vakten (två rader, två baser); diagnostikens hårda golv |
| `.claude/skills/ampy-webb-playbook/SKILL.md` | friktion per tratt-steg, en signaturenhet, lead-magnet-profilen, kvalitetsribbans kompositionslins |
| `.claude/skills/ampy-webb-playbook/instrumentation.md` | consent-gating (buffra, en cookielös ping), bucketing, `experiment_id`, KPI leads per 1000 visningar, inga PII i dataLayer |
| `ampy-foretagsdata.md` §7.1 till 7.4 | köparen jagar haken, mer optimism = mer säljare, förlustaversion, "talk you down" |
| `ampy-foretagsdata.md` §8.1, 8.1b, 8.1c, 8.2, 8.3 | rösten, värme där sanningen är god, register per kontext, guldstandard-strängar (disclaimers, trust-bullets, CTA:er) |
| `ampy-foretagsdata.md` §11.1 till 11.4 | kvalitetsribban (segment ändrar logik, binärt), signaturenhets-tabellen, layoutfamiljerna, token-defekterna (380 px är ingen brytpunkt) |
| `.claude/skills/ampy-design-system/SKILL.md` + `components.md` (grep) | reglage-vokabulären `ampy-calc__segmented/toggle/stepper/slider/input`, rörelse ≤ 300 ms, avdrags-vakten per vertikal |
| `rot-gt-cro/research/underlag/riktning-C.md` | "Avdragskollen": frågebank + besked per läge, no-JS-fallback som villkorslista, mätplanen |
| `rot-gt-cro/research/underlag/granskning-C.md` | sex lägen i stället för fyra (laddbox inte solcellsgrindad), komplett matris med prioritet, en primär CTA efter besked, hyresrätt pekar på hyresvärden, invertera [GAP]-defaulten på fakturaraden, hedga "utan solceller" med "normalt" |

## 2. Levande referenser (öppnade, lokala filer)

| Fil | Vad som stals (grammatik, inte pixlar) |
|---|---|
| `elcentral-kollen/index.html`, `preview/index.html`, `preview/block.html` | mount med `data-layout="block"`, `data-data-url`, noscript-blocket, sticky-header-simulering 66/76 px |
| `elcentral-kollen/data/elcentralkollen-data.json` | frågestruktur (id, axis, type, title, note, options med `vet_inte`), `state_schema` (prefix per fråga), verdict_matrix med `tone` och CTA per cell (grön cell: `primary: null`), `cta_defs`, lead_form-strängar, share-copy per besked, blockläge-copy |
| `elcentral-kollen/assets/elcentralkollen.js` rad 160 till 265 | `encodeVector`/`decodeVector` (`?q=a3.c1…`), `hydrateFromUrl` ("a truncated ?q= must NEVER show a fabricated verdict"), `urlWithoutQ` (bevarar utm/gclid/fbclid), blockläget rör aldrig URL:en, `surfaceParams` (`ec_surface`, `ec_placement`), `hTag()` (h2 → h3 i block), steg-modellen (`step 0..N+1`, `progress "Fråga {n} av {total}"`, history per steg) |
| `elcentral-kollen/assets/elcentralkollen.js` rad 479 till 560 | `syncStickyCta`: mobil-sticky som speglar kortets CTA och döljs via IntersectionObserver, avstängd i blockläge |
| `ampy-behorighetskollen/data/behorighetskollen-data.json` | verdicts green/yellow/red med `token`, `caveat`, `consequence`, `source` (citerad lag), disclaimer "Vägledning, inte juridisk rådgivning", `quick_picks`, `_pending_verification`-mönstret för osignerade fakta |
| `ampy-behorighetskollen/preview/hero.html` | A/B-harness med tema på roten men verktygskortet byte-identiskt, `--ampy-header-h` för scroll-ankare, hero-copy hydrerad från data |

## 3. Hämtat live 2026-09-11

| Källa | Metod | Vad som observerades |
|---|---|---|
| https://ampy.se/rot-avdrag-2026/ | WebFetch | mall: header, bild, H1 "ROT avdrag 2026: Allt du behöver veta", två ingressstycken, Snabbfakta, H2-kedja (10), ingen sidebar, ingen sticky, in-article "Ring en expert"-ruta, FAQ 4 frågor |
| https://ampy.se/gron-teknik-2026/ | WebFetch | mall: samma skelett, H1 "Grön Teknik 2026: Allt du behöver veta", Snabbfakta, H2-kedja (10), avsnittet "Skatteunderlaget: Din personliga gräns" pekar på Skatteverkets e-tjänst, FAQ 4 frågor (bostadsrätt, värmepump, redan använt ROT, räcker skatten) |
| https://www7.skatteverket.se/portal/rot-rut | Browser-panelen (navigerat, sidtext läst via shadow-DOM) | flerstegs e-tjänst: steg 1 födelseår (text, `inputmode=numeric`), kommun (select, 290 alternativ), avdragstyp (radio rot/rut/båda); steg 2 inkomstrader (lön, sjukpenning, pension) och avdrag under tjänst. Listar uttryckligen "Du vill beräkna skattereduktion för installation av grön teknik" som fall där tjänsten inte kan användas. Steg 3 och resultatet observerades inte (sidan bytte till rakna-ut-skatt) |
| https://design-system.service.gov.uk/components/text-input/ | WebFetch | "set the inputmode attribute to numeric", "Do not use `<input type="number">` unless your user research shows that there's a need for it", prefix/suffix för valuta |
| https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | WebFetch | SC 2.5.8 (AA): "at least 24 by 24 CSS pixels"; hänvisar till 2.5.5 (Enhanced) för viktiga kontroller |

## 4. Citerat ur minnet (inte hämtat i den här sessionen, markeras som sådant)

| Källa | Påstående i 04-ux-flode.md |
|---|---|
| Apple Human Interface Guidelines, "Layout" (developer.apple.com/design/human-interface-guidelines/layout) | 44 × 44 pt som rekommenderad tryckyta |
| MDN `inputmode` (developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode) | `inputmode="numeric"` ger sifferknappsats utan `type="number"` |
| MDN Web Share API (developer.mozilla.org/en-US/docs/Web/API/Navigator/share) | `navigator.share` på mobil med URL, fallback till urklipp |
| MDN `prefers-reduced-motion` | rörelse stängs av vid `reduce` |
| web.dev "Cumulative Layout Shift" (web.dev/articles/cls) | reservera höjd, hydrera i stället för injicera |
| WCAG 2.2 SC 4.1.3 Status Messages, ARIA `aria-live="polite"` / `role="status"` | beskedet och "Länk kopierad" annonseras utan fokusflytt |
| Personal-OS-direktiv via `00-grundning.md` §4 | fullbreddsregeln, register allvarligt på ekonomisidor, inga AI-tells, tre divergenta riktningar, grindlista numrerad |
| Hedging-direktivet (Personal-OS via `00-grundning.md` §5) | villkoret sägs en gång i finstilten, inte i varje rad |

## 5. Inte gjort (för tydlighetens skull)
- Konkurrenternas räknare i SERP:en (mowin, rotavdragen.se, ungdomskraft m.fl.) öppnades **inte** av UX-agenten; läsningen av dem kommer från `00-grundning.md` §3.
- Ingen webb-kontroll av satser eller villkor (förbjudet per CLAUDE.md regel 5). Alla villkor är `[→ ROT-agent]` / `[→ GT-agent]`.
- Inga extern UX-studier (Baymard, NN/g) citeras, eftersom inga hämtades. Beslut om ordning och reglage vilar på Ampys egen doktrin och de två levande referenserna.
