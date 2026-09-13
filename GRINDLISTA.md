# Grindlista: frågor som bara Julius (eller en elektriker/skatteexpert) kan stänga

> **2026-09-14:** kalkylatorn gjordes om från noll till tre frågor och två tal (`kalkylator/`). Grindar som
> bara gällde wireframes-riktningarna (7 CTA-mål, 9 säljlänk, 10, 11, 12, 32, 33) är vilande tills verktyget
> ska få nästa steg. Grindarna som gäller nu: 3 (inkomstfrågan finns, får den vara kvar?), 5 (femårsregeln
> ställs som ja/nej: "Nej" visar "Bara reparationer"), 14 (kommunalskatt = rikssnitt 32,38 %), 23–24
> (artikelrättelser), 26 (årsväxeln).

Sammanställd 2026-09-11 ur alla agenters grindar (ROT 14, grön teknik 11, UX 8, marknad 8, leadmagnet 3)
och deduplicerad. Varje rad: vad frågan gäller, varför den spelar roll, vad wireframen gör tills vidare.
Svara i en tur, numren räcker. Inget av detta blockerar riktningsvalet.

## A. Blockerande innan verktyget får lova något (styr det förvalda beskedet)

1. **Fakturamodellen för ROT.** Drar Ampy alltid ROT direkt på fakturan och begär utbetalning, på alla
   ROT-jobb? (GAP 1 sedan 2026-08-14. För grön teknik är den lagfäst.) *Tills vidare:* "vi räknar av
   avdraget och sköter ansökan", aldrig "aldrig ute med pengarna".
2. **97 %-schablonen (grön teknik).** Skatteverket räknar 97 % av ett fast totalpris som arbete + material
   (resor/projektering räknas bort), dvs 48,5 % i stället för 50 %. Sajten visar 50 %, motorn i
   tidigare bygge 48,5 %. Vilken default gäller Ampys egna jobb: står resor separat på fakturan (50 %)
   eller ingår de i ett fast pris (97 %)? *Tills vidare:* 50 % med frågan "fast totalpris?" avslagen och
   schablonen förklarad i "Så har vi räknat".
3. **Får verktyget fråga om inkomst?** Skatteutrymmes-modellen behöver ungefärlig månadsinkomst
   (inget lagras, aldrig i länken). Den replikerar Skatteverkets egen e-tjänst (0–1 kr skillnad på fyra
   körningar). Alternativet är bara "räcker/räcker inte"-chips utan siffra. *Tills vidare:* chip synlig,
   inkomstband i "Fler detaljer" (riktning C har det synligt).
4. **Typisk arbetskostnad och arbetsandel per jobb.** ROT gäller bara arbete; verktyget behöver Ampys
   typiska belopp (förvalsknappar) och arbetsandel per jobbtyp (byta elcentral, ny elinstallation, m.m.).
   Du är datakällan. *Tills vidare:* förval 30 000 kr, antagen arbetsandel 60 % märkt [GAP], visas som
   intervall.
5. **Jobbkatalog med femårsklass (elektriker signerar).** Skatteverket: femårsregeln spärrar bara
   om-/tillbyggnad/förbättring (t.ex. större elcentral, nya grupper); reparation/byte till likvärdigt ger
   ROT oavsett husets ålder; bostadsrättslägenheter har ingen femårsregel. Vilka Ampy-jobb är vilket?
   *Tills vidare:* verktyget frågar "laga/byta likvärdigt" eller "nytt, mer eller bättre" när huset är
   från 2021 eller senare.
6. **Batteri utan solceller = ROT 30 % på arbetet.** Kanon säger [FACT]; Skatteverket ger ROT för
   eldragningen men "enbart installation av inventarier" är inte ROT. Elektriker/skatteexpert signerar
   innan GT-kalkylatorn lovar reservvägen som siffra. *Tills vidare:* "kan gälla", belopp bara på angiven
   arbetskostnad.

## B. Styr copy, defaults och överlämning

7. **CTA:ns mål.** `/offert/` svarar 301 till `/kontakt/` och tappar query-strängen (testat live
   2026-09-11). Antingen lagas redirecten så parametrar följer med, eller går CTA:n till `/kontakt/`
   direkt, och en snippet skriver `src`/`kalkyl` till ett dolt fält så leads kan attribueras. Utan det
   finns ingen mätning av leads per 1 000 visningar. *Tills vidare:* CTA → `/kontakt/?src=avdragskollen&…`.
8. **URL-slugar för de fristående sidorna.** Förslag: `/rot-kollen/` och `/gron-teknik-kollen/`
   (verktyget kallas "Avdragskollen" internt). Eller bara embed i artiklarna plus telefon.
9. **Säljlänksläget.** När länken bär `src=salj` döljs offert-knappen (kunden har redan en offert) och
   telefonen är enda handlingen; sms-mall i `research/05` §4.1. Ja/nej, och får säljaren signera med
   förnamn i manuella sms?
10. **Skatten räcker bara delvis → telefon, inte offert-knapp.** Skyddar mot kvarskatt, kostar några leads.
    Ja/nej.
11. **Hyresrätt och under 18 får aldrig en säljknapp**, även om det kostar leads (hyresvärden pekas ut).
    Ja/nej.
12. **Hur strikt osäkerheten är.** Ett "vet inte" ger "Ja, om <villkor>" (rekommenderat); två ger OSÄKERT
    med telefon. Alternativ: varje "vet inte" ger OSÄKERT.
13. **Får verktyget nämna "nästa år"** när potten är slut eller huset är för nytt ("betalningsdatumet styr
    året" är fakta, men ett råd att betala i januari är skatteplanering du ska vilja stå för)?
14. **Kommunalskatt.** Default 32,38 % (rikssnitt 2026) med ±band 29–35 % visat, eller kommunväljare
    (290 rader, tabellen inte hämtad)?
15. **Två ägare.** Verktyget summerar två potter och föreslår att fylla den ägare med störst utrymme
    först. Klarar Ampys fakturarutin två personnummer med fri fördelning?
16. **Felsökning som egen tjänst = 0 % ROT** (Skatteverket + HFD 2677-17); felsökning + reparation på
    samma uppdrag = ROT på hela tiden. Skiljer offert och faktura på de två, och lovar
    /elservice/felsökning inte ROT?
17. **Framkörning.** Resor måste debiteras separat och får inte "bjudas på" (annars kan Skatteverket
    minska utbetalningen). Hur står framkörning och minimidebitering på fakturan? (Öppen sedan
    service-annonspaketet.)
18. **Laddbox + elcentral på samma faktura.** Laddpunkten = grön teknik, elcentral-utökningen = ROT,
    aldrig båda på samma arbete. Delas fakturan så, och vet säljarna det?
19. **Lastbalanserare och växelriktare.** Fakturerar Ampy lastbalanseraren som del av laddpunkten (50 %)
    och hybridväxelriktaren vid retrofit-batteri som batterimaterial (50 %)? Skatteverket nämner inte
    det första; det andra är bara förtydligat för det samtidiga fallet (15 %).
20. **Säljer/installerar Ampy solceller?** Avgör om läget "Solceller" får en Ampy-CTA eller bara en
    informations-CTA + "räkna på batteri till solcellerna".
21. **Fler än två ägare.** Lagen tillåter det; UI stannar vid två med raden "fler ägare: ring oss". Ok?
22. **Org.nr** i F-skatt-raden så kunden kan slå upp bolaget hos Skatteverket (datalagret saknar det), och
    om en namngiven granskare ska stå bakom regelraderna eller bara "kontrollerade mot Skatteverket
    2026-09-11".

## C. Artikelrättelser innan verktyget bäddas in (annars säger sida och verktyg olika saker)

23. `/rot-avdrag-2026/`: "bostad äldre än 5 år" som allmänt villkor är fel (se 5); alla "aldrig ute med
    pengarna"-formuleringar (se 1); saknar bidrag/försäkring-undantaget, felsökningsundantaget, att
    betalningsdatumet styr året, och att avdraget är preliminärt med återbetalningsrisk.
24. `/gron-teknik-2026/`: "50 % av din totala kostnad" (ska vara arbete + material, 97 % vid fast pris);
    "resten kan hanteras via ROT när taket nås" är fel i lag (samma åtgärd får aldrig båda); FAQ
    bostadsrätt "dedikerad parkeringsplats" räcker inte (platsen ska höra till bostadsrätten och följa
    med vid försäljning); e-tjänsten heter "Mina skattereduktioner för rot, rut och grön teknik";
    "återbetalningstid under 4 år" ärvs inte av verktyget (kanon säger 7–12 år).
25. `/kontakt/`: "inom 24 timmar" mot kanonens "oftast inom en arbetsdag"; "5 av 5" och "3 000+
    installationer om året" saknar rättighetsklarerad grund i datalagret (noterat, utanför uppdraget).

## D. Underhåll och avgränsning

26. **Årsväxeln.** 66 blir 67 år 2027, prisbasbelopp, skiktgräns och femårsregelns gränsår flyttas;
    "kontrollerad 2026-09-11" måste uppdateras. Vem äger rutinen? Budgetpropositionen för 2027 kollas
    i september 2026.
27. **Förenklingar i skattemodellen** (ingen sjöinkomst, sjuk-/aktivitetsersättning, regional reduktion,
    pensionärers fastighetsavgiftsspärr, fastighetsskatt på tomt). Accepteras med hedge i UI?
28. **Geografi.** Bostad inom EES/Schweiz kan ge ROT; verktyget avgränsas till Sverige. Ok?
29. **Ladda bilen-nivåerna** (50 %, max 15 000 kr per laddpunkt, Naturvårdsverket 2026-09-07) kan
    uppgraderas till [FACT] i datalagret; får BRF-beskedet skriva ut dem?
30. **Adress.** Artikeln säger Västbergavägen 25, Hägersten; datalagret säger Ankdammsgatan 33, Solna;
    Elsäkerhetsverkets register visar Hägersten. Vilken gäller? (Känd sedan tidigare, rör inte verktyget.)

## E. Från granskningen av wireframes (2026-09-11)

31. **Teal-kontrasten.** Vit text på produktionens teal (#00a991) mäter 2,96:1 (WCAG kräver 4,5:1, 3:1 för
    stor text). Det gäller sajtens knappar i dag, inte bara verktyget. Acceptera som produktionen, eller
    införa en mörkare text-teal (#007d6b ≈ 5,1:1) för text på teal i designsystemet? Wireframes behåller
    produktionens token på knappen och undviker teal text lokalt.
32. **Embed-höjden.** Ingen riktning når UX-budgeten 900 px på 390 px i artikeln med fyra synliga frågor
    (A ca 910–1 150, B ca 1 100, C ca 1 200 efter fix). Vad ska fällas i artikeln: två synliga frågor
    (boende + belopp) med resten bakom "Fler frågor", eller acceptera ~1 100 px?
33. **Två ägare med olika skatt.** Motorn lägger avdraget på ägaren med störst pott (rot-spec §4), inte på
    den vars skatt räcker bäst; fakturan får fördela fritt. Ska verktyget föreslå fördelningen efter
    skatteutrymme när båda ägarnas inkomst är ifylld? (Rör grind 15.)

Källor per rad: `research/01-rot-regelverk.md` (GRINDLISTA 1–14), `research/02-gron-teknik-regelverk.md`
(GRINDLISTA 1–11), `research/04-ux-flode.md` §12, `research/03-marknad-och-konkurrens.md` (öppna frågor),
`research/05-leadmagnet-och-konvertering.md` §9.
