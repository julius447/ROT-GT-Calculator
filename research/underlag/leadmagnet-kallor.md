# Leadmagnet-källor för 05-leadmagnet-och-konvertering.md och logik/copy-doktrin.md

Vad leadmagnet-agenten faktiskt läste, öppnade eller hämtade 2026-09-11. Regel: allt som bär ett beslut i
05-filen eller copy-doktrinen står här med väg eller URL. Citat är högst 25 ord och återges utan
tankstreck (där originalet har streck är citatet kortat före strecket, markerat "kortat").

## 1. Lokala filer, lästa i sin helhet eller i angivna avsnitt

| Fil | Avsnitt | Använt till |
|---|---|---|
| `rot-gt-calculator/research/00-grundning.md` | allt | uppdraget (inget formulär, säljlänk), sökdatan, vitrummet, kanon, öppna frågor 1 till 4 |
| `rot-gt-calculator/research/04-ux-flode.md` | §1.4, §2.5 till 2.6, §3, §4, §5, §6, §7, §8.2, §10, §12 | beskedsklasser, kortets stack, en primär per klass (tagen som given, etiketter skärpta), `/offert/`-kontraktet (`src m l b v a ak`), embed-budget, delbar länk, events, öppna frågor 3, 4, 7 |
| `rot-gt-calculator/research/03-marknad-och-konkurrens.md` | §D1 till D5, §E1 till E4, "Stjäl/Undvik", "referensverktyget" | källa + datum per regel, "vi sparar inget" intill fältet, preliminär-orden, FAQPage utan SoftwareApplication, canonical utan query, ankartexter, konkurrenternas "på 30 sek"-mönster |
| `rot-gt-calculator/research/01-rot-regelverk.md` | §A (A1, A5, A7, A13), §B (B5, B6, B8, B9, B10, B11, B15), §D (D2 till D7), §E4 (tabell), §F (F3, F5), §G (G1 till G8), §H, GRINDLISTA, Motsägelser | fakturamodellen frivillig (GRIND 1), uppgifter kunden lämnar, timing, pensionärstalen, segmentsvaren, GRIND 2, 10, 12, 14 |
| `rot-gt-calculator/research/02-gron-teknik-regelverk.md` | §A2, §F, §G, §H, §I, GRINDLISTA, Motsägelser | fakturamodellen obligatorisk, 31 januari, vem betalar tillbaka, segmentsvaren, "får inte påstå"-listan, GRIND 1, 5, 8, 9, 10, 11 |
| `rot-gt-calculator/logik/rot-spec.md` | §5, §6, §7 | hedgarna, verdict-copy per flagga, "Så har vi räknat"-raderna |
| `rot-gt-calculator/logik/gt-spec.md` | §3, §5, §6 | verdictklasser, hedgarna, CTA-utkast ("Prata med oss innan du beställer", "Få pris efter avdrag") |
| `rot-gt-calculator/research/underlag/rot-kallor.md`, `gt-kallor.md` | URL-listorna | K3, K5, K11, S1, S2, S3, S12, S16, S17, S18 som länkmål i "Så har vi räknat" |
| `rot-gt-calculator/research/underlag/ux-kallor.md` | allt | formatet för den här filen |
| `Claude Code/ampy-foretagsdata.md` | §1.1, §1.2, §1.4, §2.2, §2.3, §3.4, §3.5, §3.7, §7.1 till 7.4, §8.1 till 8.3, §10.1, §10.2, §11.1 | F-skatt [FACT, självdeklarerat], Elsäkerhetsverket-id `foretag=12047521`, org.nr [GAP], telefon 010-265 79 79, candour som kostsam signal, relayer-mekaniken, publiken jagar haken, värme där sanningen är god, prisspråket "efter ROT-avdrag", timdebitering på service, "1000+ kunder"/"5.0" som ej klarerade, kvalitetsribbans punkt 4 och 5 |
| `.claude/skills/ampy-rost/SKILL.md` | allt | de tolv reglerna, två poler, register per kontext, självkontroll (streck = 0, "!" mätt) |
| `.claude/skills/ampy-rost/rost-samples.md` | §3 till 7 | trust-tripletten, "Få en laddbox-offert", "oftast inom en arbetsdag", disclaimers, "Priser är inkl. moms och installation, efter ROT-avdrag" |
| `.claude/skills/ampy-webb-playbook/SKILL.md` | §1, §3, §4, §5, §5.1 | spine, lead-magnet-doktrinen (värdet gratis, en primär, grön cell säljer inte), experimentordning, guardrail |
| `.claude/skills/ampy-webb-playbook/instrumentation.md` | §6, §7 | ett experiment åt gången, `lead_id`-stygnet, KPI = kvalificerade eller vunna leads per 1 000 |
| `.claude/skills/lead-magnets/SKILL.md` | "Gating Strategy", "Landing Page" | bara hantverk: "Ungated + optional" som gate-typ för verktyg; e-postfångsten gäller inte (ägarkrav) |
| `.claude/skills/free-tools/SKILL.md` | "Core Principles", "Lead Capture", "SEO" | bara hantverk: "Solves a problem your audience actually has", "[thing] calculator" som sidintent |
| `elcentral-kollen/index.html`, `data/elcentralkollen-data.json`, `assets/elcentralkollen.js` (rad 445 till 458, 797 till 802) | meta, rail, lead_form, cta_defs, `resolveCtaUrl`, rail-CTA:erna | hur ett levande verktyg lämnar över: `Kontakta oss` som länk till `https://ampy.se/offert/` i ny flik, `tel:+46102657979`, inbyggt formulär (som vi inte får ha), `ec_surface` per yta. Citat: "En behörig elektriker går igenom dina svar och återkommer med en rådgivning inom 24 timmar!" (lead_form.intro) |

## 2. Hämtat live 2026-09-11

| Källa | Metod | Status | Vad som observerades |
|---|---|---|---|
| https://ampy.se/offert/ | curl (UA Chrome), WebFetch | **301 till https://ampy.se/kontakt/**; `/kontakt/` 200 | `HTTP/2 301`, `location: https://ampy.se/kontakt/` även för `/offert/?src=avdragskollen&m=rot&b=villa&v=ja_villkor&a=30000&ak=20000`: **query-strängen följer inte med**. Title "Kontakta oss", canonical `https://ampy.se/kontakt/`, ingen H1. Bricks-formulär (`brxe-form main-contact__form`): fälten `forenamn`, `efternamn`, `email`, `telefon`, `adress` (sök, required), `adress_gata`, `adress_postnr`, `adress_ort`, `meddelande` (valfritt), dolda `adress_lat`, `adress_lon`, `place_id`, `ampy_tracking`, `form_type="Kontakt"`. Synlig copy: "Få en kostnadsfri rådgivning", "Bli uppringd av vår behöriga elektriker som konsulterar dig från start till mål.", stegen "Skicka in dina uppgifter", "Vi ringer dig inom 24 timmar", "Kostnadsfri rådgivning av elektriker", knapp "Gratis rådgivning", samtycke "Genom att skicka in godkänner du att Ampy kontaktar dig enligt vår integritetspolicy." Socialt bevis på sidan: "5 av 5" med "Betyg på Google", "3 000+ genomförda installationer om året" (ej i datalagret). Meta description: "Letar du efter en trygg och modern elfirma? Kontakta Ampy för en kostnadsfri offert på din nästa elinstallation, laddbox eller hemmabatteri." |
| https://ampy.se/wp-content/cache/flying-press/a70136c5eae9.59-ampy-tracking-fix.js | curl, läst i sin helhet (9,6 kB) | 200 | Whitelist `PARAMS` = utm_source, utm_medium, utm_campaign, utm_id, utm_content, utm_term, gclid, gbraid, wbraid, fbclid, msclkid, ttclid, li_fat_id, twclid, rdt_cid, campaign_id, campaignid, ad_group_id, adgroup_id, adgroupid, adset_id, ad_id, adid, creative, keyword, matchtype, network, device, placement, site_source_name; `ACQUISITION_PARAMS` = delmängd som startar ny session (`acquisitionChanged`). Ny session sparar `source_url: location.href` (full URL med query); `visitor_journey` byggs av `pageUrl()` = `location.origin + location.pathname` (utan query). Lagring i localStorage/sessionStorage bara efter samtycke (`hasConsent()` läser `window.ampyConsent` / `window.AMPY_CONSENT`), annars i minnet. `decorateForms()` skriver JSON-kuvertet i `input[name="ampy_tracking"]` i varje formulär vid DOMContentLoaded och submit. Slutsats: egna parametrar (`src`, `m` …) fångas inte, utom indirekt via `source_url` när sessionen börjar på verktygssidan |
| https://www.elsakerhetsverket.se/kollaelforetaget/foretagsregister/?foretag=12047521&sok=1 | curl | 200 | Sidan visar "Ampy Nordic AB", rubriken "Företagets registerade verksamhetstyper" (stavning i källan), lågspänning och begränsad lågspänning, adress "Hägersten, Västbergavägen 25", "12630 Hägersten", "info@ampy.se", "https://www.ampy.se". Observation utanför uppdraget: datalagret §1.2 säger Ankdammsgatan 33, Solna och [GAP-EMAIL] |
| https://www.skatteverket.se/privat/etjansterochblanketter/allaetjanster/tjanster/hamtaforetagsinformation.4.3810a01c150939e893f3e69.html | curl | 200 | Title "Hämta företagsinformation". Citat: "I tjänsten kan du se om ett företag är godkänt för F-skatt och om det är registrerat för moms och som arbetsgivare." Kräver sökning på företaget (org.nr eller namn), därför `LM-3` (org.nr). Den äldre URL:en `…hamtaforetagsinformation.4.5fc8c94513259a4ba1d800020339.html` ger 404 |
| https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete/villkorforattfarotavdrag.4.5947400c11f47f7f9dd80004014.html (K3) | curl | 200 | Citat: "I tjänsten Hämta företagsinformation kan du till exempel ta reda på om din utförare har F-skatt, betalar moms och arbetsgivaravgifter." Länken på sidan pekar på URL:en ovan |
| https://www7.skatteverket.se/portal/rot-rut (K11) | curl HEAD | 200 | länkmål "exakt uträkning" i "Så har vi räknat" och FAQ |
| https://www7.skatteverket.se/portal/mina-avdrag/ (S17) | curl HEAD | 200 | länkmål vid "redan använt"; kräver e-legitimation (ej inloggat) |
| https://ampy.se/integritetspolicy/ | curl HEAD | 200 | samtyckeslänken på `/kontakt/` finns |
| https://ampy.se/rot-avdrag-2026/ | curl, text extraherad | 200 | Ampys egna processpåståenden (rights: evident, självdeklarerade): "så att du får avdraget direkt på fakturan" (kortat, originalet har streck före), "Du betalar bara din del (70 % av arbetet + material och resa).", "Vi sköter all kontakt med Skatteverket och ansöker om utbetalning för den resterande delen.", "Informationen dyker upp förtryckt i din nästa deklaration.", "det enda vi behöver är personnummer och ägarandel för båda parter.", FAQ "Nej, när du anlitar oss på Ampy sköter vi hela ansökan." Artikeln länkar till `https://ampy.se/kontakt/` (2 st) och `tel:+46102657979` (2 st), inte till `/offert/` |
| https://ampy.se/gron-teknik-2026/ | curl, text extraherad | 200 | Citat: "Du behöver inte ligga ute med pengarna eller ansöka hos Skatteverket själv; vi sköter hela processen åt dig." (kortat) och FAQ-hänvisningen till e-tjänsten "Skattereduktion för grön teknik" (fel namn, se 02 Motsägelser) |

## 3. Citerat ur redan verifierade filer (inte hämtat på nytt i denna session)
| Källa | Påstående jag lutar mig mot |
|---|---|
| `01-rot-regelverk.md` K1, K2, K3, K5, K12, K14 (via filen) | fakturamodellen "inte tvingande" för ROT; uppgifter enligt G4; betalningsdatum styr året; 3/7-regeln vid delbetalning; reparation ger ROT oavsett ålder; värdeår ≤ 2020 för om-/tillbyggnad 2026 |
| `01-rot-regelverk.md` E4 [BERÄKNAT, validerad mot K11] | pensionär 66+ utan fastighetsavgift: 25 000 kr/mån ger 52 015 kr utrymme, 15 000 kr/mån ger 24 276 kr; skrivs "ungefär 50 000" och "ungefär 24 000" |
| `02-gron-teknik-regelverk.md` S2, S3, S8, S12, S18 (via filen) | fakturamodellen obligatorisk, 31 januari efter slutbetalning, batteri utan egen produktion ger inte rätt, p-platskravet i bostadsrätt, Ladda bilen 50 %/15 000 kr (kanon [ASSUMPTION], GT GRIND 11) |
| `ampy-foretagsdata.md` §1.1 | "Holds F-skattsedel" [FACT, självdeklarerat via /rot-avdrag-2026/]; `foretag=12047521` ur Ampys egen "Kolla elföretaget"-länk på /elcentral-guide-2026/ |
| `rost-samples.md` §6 | "Ampys behöriga elektriker hör av sig med ett förslag, oftast inom en arbetsdag." |

## 4. Inte gjort (för tydlighetens skull)
- Ingen webb-kontroll av satser eller tak (CLAUDE.md regel 5). Alla villkor tas ur 01 och 02.
- `/kontakt/` är inte skickat (inget formulär postat); hur `kalkyl`-fältet skulle landa i CRM/mejl är
  läst ur formulärets fältnamn, inte observerat i ett leadmejl.
- Attributionsskriptets beteende är läst i kod, inte kört i webbläsare.
- Inga konkurrentkalkylatorer öppnade; läsningen av dem kommer från 00 och 03.
- Inga sub-agenter, inga andra skrivningar än de tre leveransfilerna.
