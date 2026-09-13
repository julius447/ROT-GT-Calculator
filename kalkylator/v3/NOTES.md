# v3 "Talet först": anteckningar

Filer: `index.html` (`?m=rot` default, `?m=gt`), `style.css`, `app.js` (importerar `../rakna.js`), `_probe.mjs`
(tillståndsprob), `skarmdumpar/` (tillstånden + `_probe-resultat.json` med alla mått).
Renderingar: `_shots/v3-rot-desktop.png`, `_shots/v3-rot-mobile.png`, `_shots/v3-gt-desktop.png`, `_shots/v3-gt-mobile.png`
(`node tools/shot.mjs kalkylator/v3/index.html _shots/v3-rot --query "?m=rot"` och `_shots/v3-gt --query "?m=gt"`).
Alla fyra körningar: `errors: []`, `overflowX: false`.

## Idén

Resultatet är hjälten. Kortets övre del är en sky mist-yta kant i kant med kortet (etikett i versaler, talet 56 px Outfit 700
med tabulära siffror, "upp till"/"ca" och "kr" i 28 px dämpat på samma baslinje, "Per person och år." under). En hårlinje,
sedan de tre frågorna på EN rad i den vita delen: etiketterna på en linje, kontrollerna på en linje, varje kontroll så bred som
sitt innehåll (Ja/Nej 188 px, Lön/Pension 200 px, beloppet 150 px). Talet räknas om vid varje tryck och gör en liten "tick"
(200 ms, av vid reduced motion), så kunden ser att talet reagerade. Grön bock vid talet när inkomsten är ifylld. Nej på
ägande: talet försvinner, ett rött X (44 px, `--ampy-error-ink`) och beskedet tar dess plats, panelen behåller sin höjd.

**Ytvalet.** Jag valde vitt kort med sky mist-yta i kortets övre del (inte inramad panel med marginal, inte sky mist-kort med
vit frågeremsa). Skälen: (1) alla vänsterkanter blir samma linje, etikett, tal, "Per person", frågor och kontroller ligger
på kortets padding, precis som i LED-kalkylatorn; en inramad panel gav 40 px extra indrag för talet (renderat och förkastat).
(2) Talet läses som "displayen", frågorna som "reglagen", en ordning som ögat känner igen. (3) Ett sky mist-kort på en sky
mist-sida försvinner; vitt kort med tonad topp håller kortet tydligt på artikelns bakgrund. Enda accent: teal i valt läge.
Ingen midnattsyta, ingen gradienttext.

## Uppmätt (Playwright, `_probe.mjs`, `getBoundingClientRect`)

| Mått | Desktop 1440 (980-spalt) | Mobil 390 | Brief |
|---|---|---|---|
| Kort bredd x höjd | 980 x 424 | 347 x 616 | desktop <= 620 (en spalt), mobil <= 640 |
| H2 -> kort | 28 | 20 | |
| Kortkant -> etikett (hjältens padding) | 39,6 | 21,5 | kortpadding 32 till 40 / 20 till 24 |
| Etikett -> tal, tal -> "Per person" | 9,9 / 9,9 | 8,3 / 8,3 | |
| "Per person" -> hårlinje | 40,6 | 22,5 | |
| Hårlinje -> fråga 1 | 39,6 | 21,5 | |
| Fråga -> underrad (fråga 1) | (underraden ligger under kontrollen, 9,9) | 6,6 | 6 till 8 |
| Underrad -> kontroll | | 12 | 12 till 14 |
| Fråga -> kontroll (fråga 1, 2, 3) | 14 / 14 / 14 | 12 / 12 / 12 | 12 till 14 |
| Fråga -> fråga | 43,9 mellan kolumnerna (lika) | 28 / 28 | 28 till 40 |
| Sista kontroll -> kortkant | 40,6 | 22,5 | |
| Segment: höjd, alternativ | 48, 88 x 40 | 48, 145 x 40 (fullbredd) | 48, min 88 |
| Belopp: höjd, bredd | 48, 150 | 48, 302 (fullbredd) | 48 |

Typografi: H2 36/500 (mobil 26,8), frågor 20/500, underrad 16/400 dämpad, etikett 12 versaler spärrad, tal 56/700 (mobil 44/700)
tabulära siffror, prefix/enhet 28 (mobil 22), "Per person och år." 16/400 dämpad, segmenttext 18 (mobil 16,1), belopp 18.
Kontrast: teal-deep på vit 4,9:1, dämpad på sky mist 6,5:1, vitt kryss på `--ampy-error-ink` 9:1, vit bock på `--ampy-success-ink` 6,4:1.

## De fyra tillstånden (PNG i `skarmdumpar/`, desktop + mobil)

1. `desktop-1-ager-nej.png` / `mobil-1-ager-nej.png`: rött X + "Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag."
   Talet borta, "Per person och år." borta, hjältens höjd oförändrad (min-height = tal + rad). Ja igen: talet tillbaka.
2. `desktop-2-aldre-nej.png` / `mobil-2-aldre-nej.png`: "Yngre än fem år: ROT gäller bara reparationer." som rad under talet
   (bredvid "Per person och år." på desktop, egen rad på mobil). Bara ROT.
3. `desktop-3-lon-180000.png` / `mobil-3-lon-180000.png`: "ca 12 000 kr" + grön bock. Fältet formaterar till "180 000".
4. `desktop-4-pension-240000.png` / `mobil-4-pension-240000.png`: "ca 38 000 kr" + bock. Tillbaka till Lön: "ca 21 000 kr".
Grön teknik: `desktop-gt-1-ager-nej.png` ("... rätt till grön teknik-avdrag."). Utgångsläget: `desktop-0-start.png`, `mobil-0-start.png`.

## Självgranskning

1. Femåringstestet. Första renderingen hade tre fel som såg ut precis så: dolda element som syntes (komponenternas `display`
   slog `hidden`), kolumner som kollapsade över varandra (`min-width: 0` lät auto-spåren krympa till noll) och en inramad
   panel som drog in talet 40 px från frågornas kant. Alla tre borta. Kvar i första versionen av raden: fråga 2 och 3 fick sin
   kontroll 69 px under etiketten eftersom underraden till fråga 1 tog en gemensam rad. Löst genom att lägga underraden under
   kontrollen på den breda layouten: etikett -> kontroll 14 px för alla tre, kontrollerna på samma linje. På mobil gäller
   ordningen fråga, underrad, kontroll.
2. Spacing: se tabellen, alla i briefens intervall.
3. Tillstånden: åtta PNG + JSON ovan.
4. Mot LED-kalkylatorn och Hero-1: samma grepp, eyebrow -> stort tal -> enhet dämpad -> underrad, vit yta på sky mist, 1 px
   hårlinje, en teal-accent i valt läge, vänsterkanter på en linje. LED har mer innehåll att fylla ytan med (stat-trio, staplar);
   här är innehållet låst till tre rader, så hjältens högra halva är luft med avsikt.

## Olöst / ägarfrågor

- Fråga 2 (fem år) styr ingenting i `?m=gt` (rakna.js sätter noten bara för ROT). Innehållet är låst så frågan visas i båda
  lägena; i grön teknik-läget gör Nej ingenting. Föreslår att fråga 2 döljs i gt-läget, ägarbeslut.
- Raden med tre frågor slår på när kortets innehållsbredd är >= 860 px (container-fråga, inte fönsterbredd): i demon från
  ca 1010 px fönster, i Bricks när artikelspalten är >= ca 940 px. Smalare spalt ger den staplade layouten.
- Underraden ligger under kontrollen på desktop (hjälptext) men mellan fråga och kontroll på mobil. Avsiktligt (69 px-hålet
  ovan), men avviker från briefens rytm "fråga -> underrad -> kontroll" på just den breda layouten.
- Femårsnoten på mobil lägger till en rad (hjälten växer 24 px) när kunden trycker Nej. Kunden utlöser den själv; ingen
  reserverad tomrad i utgångsläget.
- Subgrid + container queries: Chrome 117+, Safari 16+, Firefox 110+. Äldre webbläsare får den staplade layouten med
  fullbreddskontroller.
