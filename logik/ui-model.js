/**
 * ui-model.js  (ES module, pure, DOM-free, no dependencies)
 *
 * The ONE shared UI contract for the three wireframes of Ampy's Avdragskollen (ROT + grön teknik, 2026).
 * Every wireframe imports this file and renders what evaluate() returns. Numbers, verdicts, headlines,
 * villkor rows, amount-panel states and CTAs are therefore identical everywhere ("consistency = credibility").
 *
 * Exports
 *   COPY                     every Swedish string, keyed by stable id (a copy agent rewrites HERE, nowhere else)
 *   LINKS                    the few hrefs the CTAs need
 *   BANKS                    the question banks per mode (rot, gt) -> arrays of question objects
 *   defaultState(mode)       the load state (instant value on load)
 *   effectiveState(mode, s)  resolves the "auto" defaults (null -> derived value)
 *   resolveBank(mode, s)     bank with strings resolved, visibility computed, values filled (render helper)
 *   toEngineInput(mode, s)   UI state -> engine.js input shape
 *   evaluate(mode, s, touched) -> the result contract (see README "The evaluate() contract")
 *   resolveTexts(result)     same result with every textKey resolved to `text`
 *   encodeState / decodeState  share-link codec (UX §7.1 whitelist, never income or tax amounts)
 *   formatKr / round100 / t
 *
 * Doctrine sources: logik/rot-spec.md, logik/gt-spec.md (LOGIC wins), research/04-ux-flode.md (PRESENTATION
 * wins: classes, headline grammar, amount states, CTA per class). Reconciliations: logik/README.md.
 *
 * String rules (ampy-rost): du-tilltal, "kan" on everything Skatteverket decides, no em/en dashes, no "·",
 * at most one "!" per string, amounts "9 000 kr", percent "30 %". test.mjs enforces the character rules.
 */

import { PARAMS_2026 as P, beraknaRot, beraknaGt, skatteutrymme, harledTaxeringsvarde } from './engine.js';

// ---------------------------------------------------------------------------------------------------
// Links (facts from ampy-foretagsdata / the research files; [GAP] where the owner has not decided)
// ---------------------------------------------------------------------------------------------------
export const LINKS = Object.freeze({
  offert: '/kontakt/',                                             // research/05 §1.4 (live 2026-09-11: /offert/ 301 -> /kontakt/ and drops the query); params contract UX §5.4, [GAP dev LM-1]
  tel: 'tel:+46102657979',                                         // [FACT] ampy-foretagsdata §1
  tel_text: '010-265 79 79',
  skatteverket_rot_rut: 'https://www7.skatteverket.se/portal/rot-rut',       // "Räkna ut rot- och rutavdrag"
  skatteverket_mina_avdrag: 'https://www7.skatteverket.se/portal/mina-avdrag/', // "Mina skattereduktioner" (S17)
  ladda_bilen: 'https://www.naturvardsverket.se/amnesomraden/klimatomstallningen/ladda-bilen/ladda-bilen-for-foreningar-och-boendeorganisationer/', // S18
  artikel_villkor: '#villkor',        // [GAP ägare] anchor in the article for "Läs mer om villkoren"
  artikel_hyresratt: '#hyresratt',    // [GAP ägare] anchor for the hyresrätt section
  artikel_nasta_ar: '#nasta-ar',      // [GAP ägare, fråga 7] anchor for "Vad gäller nästa år?"
  foreningar: null,                   // [GAP ägare] page "Så hjälper vi föreningar" does not exist yet
});

// ---------------------------------------------------------------------------------------------------
// Defaults that are GAPs (owner input pending). Flagged so nobody mistakes them for facts.
// ---------------------------------------------------------------------------------------------------
export const GAP_DEFAULTS = Object.freeze({
  // [GAP, GRIND 2] typical labour share per job type, percent of the total price. 60 is a placeholder.
  JOBB_ARBETSANDEL: Object.freeze({ byta_elcentral: 60, annat: 60 }),
  // [GAP] typical amounts. ROT: total incl. moms for a typical Ampy job. GT: round numbers, not Ampy prices (GRIND 1).
  BELOPP_DEFAULT: Object.freeze({ rot: 30_000, laddbox: 20_000, batteri: 70_000, sol: 150_000 }),
  BELOPP_PRESETS: Object.freeze({
    rot: Object.freeze([15_000, 30_000, 60_000]),
    laddbox: Object.freeze([15_000, 20_000, 30_000]),
    batteri: Object.freeze([50_000, 70_000, 120_000]),
    sol: Object.freeze([100_000, 150_000, 250_000]),
  }),
  INTERVALL_PP: 15,                   // ± percentage points around the assumed labour share (UX §3.6 intervall)
  KOMMUNALSKATT_DEFAULT: 32.38,       // [FACT] Skatteverket average 2026; GRIND 7 (band 29–35 % shown as min/max)
  MANADSINKOMST_DEFAULT: 35_000,
});

// ---------------------------------------------------------------------------------------------------
// COPY: every string, one place. Keys are stable ids; banks and evaluate() reference keys only.
// ---------------------------------------------------------------------------------------------------
export const COPY = Object.freeze({
  // --- questions: ROT ---
  'q.boende.label': 'Hur bor du där jobbet ska göras?',
  'q.boende.gt.label': 'Hur bor du där det ska installeras?',
  'q.boende.help': 'Vi antar att du äger bostaden, helt eller delvis.',
  'q.boende.villa': 'Villa eller radhus',
  'q.boende.brf': 'Bostadsrätt',
  'q.boende.fritid': 'Fritidshus',
  'q.boende.hyra': 'Hyresrätt',
  'q.boende.foralder': 'Föräldrarnas bostad',
  'q.vardear.label': 'När blev huset färdigbyggt (värdeår)?',
  'q.vardear.help': 'Står i ditt senaste fastighetstaxeringsbeslut eller på Mina sidor hos Skatteverket. Reparation ger ROT oavsett husets ålder. Nytt eller bättre kräver värdeår 2020 eller tidigare.',
  'q.vardear.t2011': '2011 eller tidigare',
  'q.vardear.2012_2020': '2012 till 2020',
  'q.vardear.2021_2025': '2021 till 2025',
  'q.vardear.2026_ej_fardig': '2026, eller inte färdigt än',
  'q.vardear.vet_inte': 'Vet inte',
  'q.arbetstyp.label': 'Vad ska göras?',
  'q.arbetstyp.help': 'Är huset yngre än fem år avgör jobbets typ. Reparation ger ROT oavsett husets ålder.',
  'q.arbetstyp.reparation': 'Laga eller byta ut något som finns, till likvärdigt',
  'q.arbetstyp.ombyggnad': 'Nytt, mer eller bättre än idag',
  'q.arbetstyp.ombyggnad.help': 'Till exempel större elcentral, nya grupper eller förberedelse för laddbox.',
  'q.arbetstyp.vet_inte': 'Vet inte',
  'q.belopp.label': 'Vad kostar jobbet ungefär?',
  'q.belopp.help': 'Totalpris inkl. moms, från offerten eller på en höft. Lämna tomt om du inte vet.',
  'q.belopp.annat': 'Annat belopp',
  'q.arbete.label': 'Varav arbete, ungefär (procent)',
  'q.arbete.help': 'ROT gäller bara arbetet. Tills du anger annat antar vi {andel} % av priset [GAP: Ampys andel per jobbtyp].',
  'q.arbete_kr.label': 'Arbetskostnad i kronor, från offerten',
  'q.arbete_kr.help': 'Står som egen rad på Ampys offert. Anger du den får du ett belopp i stället för ett spann.',
  'q.jobb.label': 'Vilket jobb gäller det?',
  'q.jobb.help': 'Styr hur stor del av priset vi antar är arbete.',
  'q.jobb.byta_elcentral': 'Byta elcentral',
  'q.jobb.annat': 'Annat elarbete',
  'q.plats.label': 'Var i bostaden görs jobbet?',
  'q.plats.help': 'I en bostadsrätt gäller ROT bara inne i lägenheten.',
  'q.plats.inne': 'Inne i lägenheten (elcentral, uttag, belysning)',
  'q.plats.utanfor': 'Utanför: fasad, trapphus, förråd, garage, p-plats',
  'q.plats.vet_inte': 'Vet inte',
  'q.agare.label': 'Hur många äger bostaden?',
  'q.agare.help': 'Taket är per person. Två ägare som bor där kan dela på avdraget.',
  'q.agare.1': 'En',
  'q.agare.2': 'Två eller fler',
  'q.anvant_rot.label': 'ROT redan använt i år',
  'q.anvant_rot.help': 'Står under Mina skattereduktioner hos Skatteverket.',
  'q.anvant_rut.label': 'RUT redan använt i år',
  'q.anvant_rut.help': 'ROT och RUT får tillsammans vara högst 75 000 kr per person och år.',
  'q.under18.label': 'Jag fyller inte 18 i år',
  'q.under18.help': 'Avdraget kräver att du fyllt 18 senast vid årets slut.',
  'q.bor_detalj.label': 'Stämmer något av det här?',
  'q.bor_detalj.help': 'ROT kräver att bostaden är ditt hushåll: du använder den själv, som hem eller fritidshus.',
  'q.bor_detalj.ingen': 'Nej, inget av det här',
  'q.bor_detalj.uthyrd': 'Jag hyr ut bostaden',
  'q.bor_detalj.barn': 'Mitt barn bor där',
  'q.bor_detalj.sarbo': 'Min särbo bor där',
  'q.bor_detalj.nykopt': 'Nyköpt, jag flyttar in efter jobbet',
  'q.skatt.label': 'Betalar du inkomstskatt på lön eller pension?',
  'q.skatt.help': 'Avdraget räknas av mot din inkomstskatt. Räcker den inte betalar du mellanskillnaden.',
  'q.skatt.lon': 'Ja, på lön',
  'q.skatt.pension': 'Ja, på pension',
  'q.skatt.lag': 'Låg eller ingen inkomst',
  'q.skatt.vet': 'Vet inte',
  'q.skatt_djup.label': 'Räkna på om skatten räcker',
  'q.skatt_djup.help': 'Frivilligt. Det du skriver här stannar i din webbläsare, vi sparar inget. Samma räknesätt som Skatteverkets e-tjänst.',
  'q.inkomsttyp.label': 'Vad har du för inkomst?',
  'q.inkomsttyp.lon': 'Lön',
  'q.inkomsttyp.pension': 'Pension',
  'q.inkomsttyp.bada': 'Både lön och pension',
  'q.manadsinkomst.label': 'Inkomst per månad, före skatt',
  'q.manadsinkomst.help': 'Ungefär räcker. Beskedet blir ett spann.',
  'q.lon_manad.label': 'Varav lön per månad',
  'q.pension_manad.label': 'Varav pension per månad',
  'q.fyllt66.label': 'Hade du fyllt 66 den 1 januari 2026?',
  'q.fyllt66.help': 'Från 66 räknas skatten med ett högre grundavdrag. Det ändrar utrymmet.',
  'q.ranteutgifter_ar.label': 'Ränteutgifter per år (valfritt)',
  'q.ranteutgifter_ar.help': 'Bolåneräntan ger ränteavdrag som räknas av före ROT. 100 000 kr i ränta tar 30 000 kr av utrymmet.',
  'q.kommunalskatt.label': 'Kommunalskatt i procent (valfritt)',
  'q.kommunalskatt.help': 'Snittet 2026 är 32,38 %. Vet du inte din räknar vi med ett spann på 29 till 35 %.',
  'q.gt_planerad_kr.label': 'Planerar du också grön teknik i år? Avdraget, ungefär',
  'q.gt_planerad_kr.help': 'Laddbox, batteri eller solceller. ROT räknas av före grön teknik, så det är grön teknik som faller bort först om skatten inte räcker.',
  'q.inkomsttyp_2.label': 'Ägare 2: vad har hen för inkomst?',
  'q.manadsinkomst_2.label': 'Ägare 2: inkomst per månad, före skatt',
  'q.fyllt66_2.label': 'Ägare 2: hade hen fyllt 66 den 1 januari 2026?',
  // --- questions: GT ---
  'q.lage.label': 'Vad ska du installera?',
  'q.lage.laddbox': 'Laddbox',
  'q.lage.batteri': 'Solcellsbatteri',
  'q.lage.sol': 'Solceller',
  'q.sol.label': 'Har du solceller på bostaden?',
  'q.sol.help': 'Solcellerna ska vara dina egna och sitta på samma fastighet. Grannens eller föreningens räknas inte.',
  'q.sol.har': 'Ja, redan installerade',
  'q.sol.samtidigt': 'Nej, men de installeras samtidigt som batteriet',
  'q.sol.nej': 'Nej',
  'q.sol.vet_inte': 'Vet inte',
  'q.belopp.laddbox.label': 'Pris för laddbox med installation, inkl. moms',
  'q.belopp.batteri.label': 'Pris för batteri med installation, inkl. moms',
  'q.belopp.sol.label': 'Pris för solcellsanläggningen med installation, inkl. moms',
  'q.belopp.gt.help': 'Arbete och material inkl. moms. Ett runt tal räcker. Lämna tomt om du inte vet.',
  'q.arbete_kr.gt.label': 'Varav arbete (installationen), inkl. moms',
  'q.arbete_kr.gt.help': 'Behövs när du köper eller hyr utrustningen själv, och för ROT på elarbetet.',
  'q.material.label': 'Vem levererar utrustningen?',
  'q.material.help': 'Köper eller hyr du den själv ger bara installationsarbetet avdrag.',
  'q.material.installator': 'Samma företag som installerar',
  'q.material.sjalv': 'Jag köper den själv',
  'q.material.leasing': 'Jag hyr eller leasar den',
  'q.fastpris.label': 'Fast totalpris där resor och projektering ingår?',
  'q.fastpris.help': 'Då räknar Skatteverket normalt 97 % av priset som arbete och material.',
  'q.pplats.label': 'Var ska laddboxen sitta?',
  'q.pplats.help': 'Platsen ska höra till bostadsrätten och följa med när du säljer.',
  'q.pplats.foljer_bostadsratten': 'På en p-plats som hör till min bostadsrätt och följer med när jag säljer',
  'q.pplats.hyrd_uppsagningsbar': 'På en p-plats jag hyr av föreningen',
  'q.pplats.gemensamt': 'I föreningens gemensamma garage eller laddplatser',
  'q.pplats.vet_inte': 'Vet inte',
  'q.tillagg_elcentral_kr.label': 'Byts eller byggs elcentralen ut samtidigt? Ungefärlig kostnad',
  'q.tillagg_elcentral_kr.help': 'Elcentralen ger inte grön teknik, men kan ge ROT.',
  'q.anvant_gt.label': 'Grön teknik-avdrag redan använt i år',
  'q.anvant_gt.help': 'Solceller, batteri och laddbox delar samma pott på 50 000 kr per person.',
  'q.anvant_rot_rut.label': 'ROT eller RUT redan använt i år',
  'q.anvant_rot_rut.help': 'ROT och RUT tar sin del av skatten före grön teknik.',
  'q.batteri_samtidigt_kr.label': 'Installerar du batteri samtidigt? Pris för batteridelen',
  'q.batteri_samtidigt_kr.help': 'Solceller ger 15 % och batteri 50 %, två rader under samma tak.',
  'q.anvandning.label': 'Vem använder bostaden?',
  'q.anvandning.sjalv': 'Jag själv, som hem eller fritidshus',
  'q.anvandning.foralder': 'Min förälder bor där',
  'q.anvandning.annan': 'Den hyrs ut eller någon annan bor där',
  // --- toggles ---
  'toggle.ja': 'Ja',
  'toggle.nej': 'Nej',
  'ui.fler_detaljer': 'Fler detaljer',
  'ui.kopiera_lank': 'Kopiera länk',
  'ui.skriv_ut': 'Skriv ut',
  'ui.sa_har_vi_raknat': 'Så har vi räknat',
  'ui.vad_hander_nu': 'Vad händer nu',
  'ui.antaget': 'antaget',
  'ui.vet_inte': 'vet inte',
  'ui.skoter_vi': 'det sköter vi',
  'ui.stammer_inte': 'Stämmer inte?',

  // --- eyebrow, ram, disclaimer ---
  'eyebrow.rot': 'Ditt besked, ROT-avdraget 2026',
  'eyebrow.gt': 'Ditt besked, grön teknik 2026',
  'ram.ja': 'Vi räknar av avdraget och sköter ansökan hos Skatteverket',
  'ram.ja_villkor.ett': 'Ett villkor kvar att kolla, se nedan',
  'ram.ja_villkor.flera': '{n} saker att kolla, se nedan',
  'ram.ja_men': 'Vi räknar av avdraget, men se begränsningen nedan',
  'ram.troligen': 'Skatteverket avgör i deklarationen. Vill du, går vi igenom det med dig innan du bestämmer något',
  'ram.nej': 'Inget avdrag med de här svaren. Vad som gäller i stället står nedan',
  'ram.osaker': 'Det som avgör står nedan. Vi reder ut det med dig innan du bestämmer något',
  'disclaimer': 'Vägledande besked utifrån dina svar, inte ett beslut från Skatteverket och inte ett erbjudande. Skatteverket avgör i deklarationen. Exakt belopp står på offerten.',
  'hedge.kan': 'Inte ett erbjudande, inte bindande.',

  // --- headlines (UX §3.2, §4.3 grammar) ---
  'h.rot.ja': 'Ja, du kan använda ROT-avdraget',
  'h.gt.ja': 'Ja, du kan använda grön teknik-avdraget',
  'h.ja_om': 'Ja, om {villkor}',
  'h.ja_om_stammer': 'Ja, om det här stämmer:',
  'h.ja_men': 'Ja, men {begransning}',
  'h.troligen.femarsregeln': 'Troligen inte, huset är yngre än fem år och jobbet räknas som ombyggnad',
  'h.troligen.skatt_lag': 'Troligen inte, avdraget kräver skatt att räkna av mot',
  'h.troligen.batteri_utan_sol': 'Troligen inte grön teknik utan egna solceller. ROT kan gälla elarbetet i stället',
  'h.nej.hyra': 'Nej, avdraget gäller den som äger bostaden',
  'h.nej.under18': 'Nej, du behöver ha fyllt 18 senast vid årets slut',
  'h.nej.inte_i_ar': 'Nej, inte i år. Årets pott är använd',
  'h.nej.inte_an': 'Nej, inte än. ROT gäller först när huset är taxerat som färdigbyggt',
  'h.nej.uthyrd': 'Nej, en bostad du hyr ut räknas inte som ditt hushåll',
  'h.nej.barn': 'Nej, ditt barns bostad räknas inte som ditt hushåll',
  'h.nej.sarbo': 'Nej, din särbos bostad räknas inte som ditt hushåll',
  'h.nej.bor_inte': 'Nej, ingen i hushållet bor i bostaden',
  'h.nej.utanfor': 'Nej, i en bostadsrätt gäller ROT bara inne i lägenheten',
  'h.nej.ager': 'Nej, avdraget kräver att du äger bostaden',
  'h.nej.anvandning': 'Nej, bostaden ska användas av dig eller din förälder',
  'h.nej.brf_gemensamt': 'Nej, i föreningens garage är det föreningen som installerar',
  'h.nej.brf_pplats_hyrd': 'Nej, en p-plats du hyr av föreningen ger inte grön teknik',
  'h.nej.bidrag': 'Nej, inte för arbete som betalas av försäkring, bidrag eller grön teknik-avdrag',
  'h.nej.dodsbo': 'Nej, ett dödsbo kan bara få ROT för arbete före dödsfallet',
  'h.nej.skattskyldig': 'Nej, avdraget förutsätter att du betalar skatt i Sverige',
  'h.osaker': 'Osäkert. Vi behöver veta om {sak1} och om {sak2}',
  'h.osaker.flera': 'Osäkert. Några saker avgör, se listan',
  'h.osaker.brf_batteri': 'Osäkert. Batteri i bostadsrätt kräver egna solceller kopplade till lägenheten',

  // --- villkor rows: text (row) and fras (headline clause after "Ja, om" / "Ja, men") ---
  'v.rot.ager_villa': 'Du äger villan eller radhuset, helt eller delvis',
  'v.rot.ager_villa.fras': 'du äger bostaden',
  'v.rot.ager_brf': 'Du äger bostadsrätten',
  'v.rot.ager_brf.fras': 'du äger bostadsrätten',
  'v.rot.fritid': 'Du äger fritidshuset och ingen annan bor där permanent',
  'v.rot.fritid.fras': 'ingen annan bor permanent i fritidshuset',
  'v.rot.foraldrar': 'Du äger del av bostaden, du betalar fakturan och dina föräldrar bor i Sverige',
  'v.rot.foraldrar.fras': 'du äger del av föräldrarnas bostad och betalar fakturan',
  'v.rot.nykopt': 'Ingen annan bor där under jobbet och du flyttar in direkt efter',
  'v.rot.nykopt.fras': 'du flyttar in direkt efter jobbet',
  'v.rot.hyresratt': 'Hyresrätt: hyresvärden äger bostaden och ansvarar för elen. Hör med din hyresvärd',
  'v.rot.uthyrd': 'En bostad du hyr ut räknas inte som ditt hushåll, så avdraget gäller inte den',
  'v.rot.barn': 'Ditt barns bostad räknas inte som ditt hushåll, även om du äger den. Är barnet ägare kan barnet få avdraget',
  'v.rot.sarbo': 'Särbos bostad räknas inte som ditt hushåll. Din särbo kan få avdraget om hen äger bostaden',
  'v.rot.brf_stadgar': 'Jobbet görs inne i lägenheten och gäller sådant du själv ansvarar för enligt stadgarna. Elcentral, uttag och belysning brukar vara ditt',
  'v.rot.brf_stadgar.fras': 'jobbet gäller det du själv ansvarar för i lägenheten',
  'v.rot.utanfor': 'I en bostadsrätt gäller ROT bara inne i lägenheten. Fasad, trapphus, förråd och p-plats är föreningens sak',
  'v.rot.plats_okand': 'Var jobbet görs: vet inte. Elcentral och uttag inne är ok, fasad och p-plats är inte',
  'v.rot.plats_okand.fras': 'jobbet görs inne i lägenheten',
  'v.rot.aldre_fem_ar': 'Huset är äldre än fem år (värdeår 2020 eller tidigare)',
  'v.rot.aldre_fem_ar.fras': 'huset är äldre än fem år',
  'v.rot.reparation_oavsett_alder': 'Reparation ger ROT oavsett husets ålder',
  'v.rot.femar_reparation': 'Huset är yngre än fem år, så avdraget gäller bara om jobbet återställer elen till samma skick med likvärdigt material',
  'v.rot.femar_reparation.fras': 'jobbet är en reparation med likvärdigt material',
  'v.rot.femar_ombyggnad': 'Huset är yngre än fem år (värdeår 2021 eller senare). Då ger nytt, mer eller bättre inget ROT de fem första åren efter värdeåret. Att laga eller byta till likvärdigt går',
  'v.rot.femar_arbetstyp_okand': 'Huset är yngre än fem år. Om jobbet är en reparation kan du få ROT, om det är nytt eller bättre troligen inte. Vi reder ut vilket',
  'v.rot.femar_arbetstyp_okand.fras': 'jobbet är en reparation',
  'v.rot.vardear_okant': 'Värdeåret: vet inte. Det står i ditt senaste fastighetstaxeringsbeslut eller på Mina sidor hos Skatteverket. Vi kollar det åt dig',
  'v.rot.vardear_okant.fras': 'huset är äldre än fem år',
  'v.rot.ej_fardigt': 'Tills huset är taxerat som färdigbyggt räknas allt elarbete som del av bygget, och bygget ger inte ROT',
  'v.fskatt': 'F-skatt: det har vi. Elektronisk betalning: du betalar med bank, Swish eller kort, inte kontant',
  'v.under18.ok': 'Du har fyllt 18 år vid årets slut',
  'v.under18.stopp': 'Du behöver fylla 18 senast vid årets slut. En vuxen ägare kan stå på fakturan i stället',
  'v.skatt.lon': 'Du betalar inkomstskatt på lön',
  'v.skatt.lon.fras': 'du betalar inkomstskatt på lön',
  'v.skatt.pension': 'Du betalar inkomstskatt på pension. Ingen övre åldersgräns, det som avgör är skatten',
  'v.skatt.pension.fras': 'du betalar skatt på din pension',
  'v.skatt.lag': 'Låg eller ingen inkomst: avdraget kräver skatt att räkna av mot. Räkna på din skatt under Fler detaljer, eller kolla hos Skatteverket',
  'v.skatt.vet': 'Skatt att räkna av mot: vet inte. Räkna på det under Fler detaljer, eller kolla hos Skatteverket',
  'v.skatt.vet.fras': 'skatten räcker',
  'v.skatt.ryms': 'Din skatt räcker preliminärt till hela avdraget: ungefär {utrymme} att räkna av mot, avdraget är {behov}',
  'v.skatt.ryms_band': 'Din skatt räcker preliminärt till hela avdraget: ungefär {min} till {max} att räkna av mot, avdraget är {behov}',
  'v.skatt.delvis': 'Din skatt räcker preliminärt till {ryms} av {behov}. Resten, {risk}, kan bli kvarskatt nästa år',
  'v.skatt.delvis.fras': 'skatten räcker till ungefär {ryms} av {behov}',
  'v.skatt.inte': 'Din skatt räcker preliminärt inte till avdraget. Hela beloppet, {behov}, kan bli kvarskatt',
  'v.agare.bada_skatt': 'Ni båda har skatt att räkna av mot, och båda står på fakturan',
  'v.agare.bada_skatt.fras': 'ni båda har skatt att räkna av mot',
  'v.agare.omfordela': 'Skatten räcker inte hos er båda. Lägg mer av avdraget på den av er som har mest utrymme, inom 50 000 kr per person',
  'v.pott.kvar': '{kvar} kvar av årets pott',
  'v.pott.delvis': 'Bara {kvar} kvar av årets pott, jobbet skulle ge {brutto}. Betalningsdatumet avgör vilket år avdraget hamnar på',
  'v.pott.delvis.fras': 'bara {kvar} kvar i år',
  'v.pott.slut': 'Årets pott är använd. Det är betalningsdatumet som avgör vilket år avdraget hamnar på',
  'v.tak': 'Taket är {tak} per person och år, och 75 000 kr för ROT och RUT tillsammans',
  'v.tak.fras': 'taket på {tak} per person slår i',
  'v.gt_efter_rot': 'ROT räknas av före grön teknik. Med både ROT och grön teknik i år räcker din skatt preliminärt inte till hela grön teknik-avdraget, {risk} kan bli kvarskatt',
  'v.gt.ager_villa': 'Du äger villan eller radhuset, helt eller delvis',
  'v.gt.ager_villa.fras': 'du äger bostaden',
  'v.gt.ager_brf': 'Du äger bostadsrätten',
  'v.gt.ager_brf.fras': 'du äger bostadsrätten',
  'v.gt.fritid': 'Du äger fritidshuset och använder det själv',
  'v.gt.fritid.fras': 'du använder fritidshuset själv',
  'v.gt.foralder': 'Du äger del av bostaden, du betalar fakturan och din förälder bor där',
  'v.gt.foralder.fras': 'du äger del av bostaden och betalar fakturan',
  'v.gt.hyresratt': 'Hyresrätt: hyresvärden äger bostaden och är den som kan installera. Hör med din hyresvärd',
  'v.gt.annan': 'Bostaden ska användas av dig eller din förälder. En uthyrd bostad eller ditt barns bostad ger inget avdrag',
  'v.gt.sol_har': 'Du har egna solceller på bostaden',
  'v.gt.sol_har.fras': 'du har egna solceller på bostaden',
  'v.gt.sol_samtidigt': 'Solcellerna installeras samtidigt som batteriet. Växelriktaren hör då till solcellsdelen (15 %)',
  'v.gt.sol_nej': 'Utan egna solceller gäller inte grön teknik för batteriet. ROT kan i stället ge 30 % på arbetskostnaden för elarbetet',
  'v.gt.sol_okand': 'Egna solceller: vet inte. Vi kollar det åt dig innan du bestämmer något',
  'v.gt.sol_okand.fras': 'du har egna solceller',
  'v.gt.brf_batteri': 'Batteri i bostadsrätt kräver egna solceller kopplade till lägenheten. Det kan vi inte bedöma här',
  'v.gt.pplats_ok': 'P-platsen hör till bostadsrätten och följer med när du säljer. Föreningen ska godkänna installationen',
  'v.gt.pplats_ok.fras': 'p-platsen hör till bostadsrätten och följer med när du säljer',
  'v.gt.pplats_hyrd': 'En p-plats du hyr av föreningen ger inte grön teknik. Platsen måste höra till bostadsrätten och följa med när du säljer',
  'v.gt.pplats_gemensamt': 'I föreningens garage är det föreningen som installerar. Den kan söka Naturvårdsverkets bidrag Ladda bilen i stället',
  'v.gt.pplats_okand': 'Var laddboxen ska sitta: vet inte. Det avgörs av om p-platsen följer bostadsrätten när du säljer. Fråga föreningen, eller ring oss',
  'v.gt.pplats_okand.fras': 'p-platsen följer bostadsrätten när du säljer',
  'v.gt.material_ok': 'Material och installation från samma företag: det är så vi säljer',
  'v.gt.material_sjalv': 'Utrustningen du köper själv ger inget avdrag, bara installationsarbetet. Köper du den av installatören gäller avdraget på båda',
  'v.gt.material_sjalv.fras': 'bara på arbetet, utrustningen du köper själv ger inget avdrag',
  'v.gt.leasing': 'En hyrd eller leasad box räknas inte som material. Bara installationsarbetet ger avdrag',
  'v.gt.leasing.fras': 'bara på arbetet, en hyrd box ger inget avdrag',
  'v.gt.elcentral': 'Elcentralen ligger utanför grön teknik. Den delen kan i stället ge ROT',
  'v.gt.pott.kvar': '{kvar} kvar av årets grön teknik-pott',
  'v.gt.pott.delvis': 'Bara {kvar} kvar av årets grön teknik-pott, installationen skulle ge {brutto}. Solceller, batteri och laddbox delar samma pott',
  'v.gt.pott.delvis.fras': 'bara {kvar} kvar i år',
  'v.gt.pott.slut': 'Årets grön teknik-pott är använd. Slutbetalningen avgör vilket år avdraget hamnar på',
  'v.gt.tak': 'Taket är {tak} per person och år för solceller, batteri och laddbox tillsammans',
  'v.gt.tak.fras': 'taket på {tak} per person slår i',
  'v.gt.skatt.ryms': 'Din skatt räcker preliminärt till hela avdraget: ungefär {utrymme} kvar att räkna av mot efter ROT och RUT, avdraget är {behov}',
  'v.gt.skatt.ryms_band': 'Din skatt räcker preliminärt till hela avdraget: ungefär {min} till {max} kvar att räkna av mot efter ROT och RUT, avdraget är {behov}',
  'v.gt.skatt.delvis': 'Din skatt räcker preliminärt till {ryms} av {behov}. Resten, {risk}, kan bli kvarskatt nästa år',
  'v.gt.skatt.delvis.fras': 'skatten räcker till ungefär {ryms} av {behov}',
  'v.gt.skatt.inte': 'Din skatt räcker preliminärt inte till avdraget. Hela beloppet, {behov}, kan bli kvarskatt',

  // --- amount panel (UX §3.6) ---
  'b.rubrik.punkt': 'Uppskattat avdrag: {avdrag}',
  'b.rubrik.intervall': 'Ungefär {min} till {max}',
  'b.rubrik.tak': 'Upp till {tak} i år',
  'b.rubrik.begransad_skatt': 'Din skatt räcker till ungefär {tacker} av {avdrag}',
  'b.rubrik.begransad_pott': '{kvar} kvar av potten i år',
  'b.rubrik.noll': '0 kr i år',
  'b.rubrik.alt_rot': 'ROT 30 % på arbetet: ungefär {rot}',
  'b.rubrik.alt_rot.utan_belopp': 'ROT 30 % på arbetskostnaden kan gälla i stället',
  'b.punkt.rot': '30 % av arbetskostnaden {arbete}. Materialet ger inget avdrag',
  'b.punkt.gt': '{sats} % av arbete och material, {underlag}',
  'b.punkt.gt.arbete': '{sats} % av installationsarbetet {underlag}. Utrustning du köper eller hyr själv ger inget avdrag',
  'b.punkt.gt.schablon': '{sats} % av 97 % av priset {belopp}, resor och projektering räknas bort',
  'b.punkt.gt.tva_rader': 'Solceller 15 % av {underlag}: {sol}. Batteri 50 % av {batteri_underlag}: {batteri}. Ett gemensamt tak på {tak} per person',
  'b.intervall.rot': 'Beror på hur stor del av {belopp} som är arbete. Vi antar ungefär {andel} %, exakt andel står på offerten',
  'b.tak': 'Om villkoren stämmer. Ange vad jobbet kostar så räknar vi ut ditt belopp',
  'b.tak.osaker': 'Om villkoren stämmer. Vi reder ut dem med dig',
  'b.begransad_skatt': 'Avdraget på fakturan är {avdrag}. Det skatten inte täcker, {risk}, kan bli kvarskatt nästa år',
  'b.begransad_pott': 'Jobbet skulle ge {brutto}. Det som inte ryms i årets pott betalar du utan avdrag',
  'b.noll': 'Potten är per person och år. Det är betalningsdatumet som avgör vilket år avdraget hamnar på',
  'b.alt_rot': 'Grön teknik gäller normalt inte utan solceller. ROT gäller arbetskostnaden för elarbetet, inte batteriet',
  'b.alt_rot.utan_belopp': 'Ange arbetskostnaden från offerten så räknar vi. Hur stor arbetsdelen är avgör beloppet',
  'b.att_betala': 'Att betala efter avdrag: {att_betala}',
  'b.att_betala.intervall': 'Att betala efter avdrag: ungefär {min} till {max}',
  'b.tak_slar_i': 'Taket på {tak} per person slår i',
  'b.rad.sol': 'Solceller 15 %: {avdrag}',
  'b.rad.batteri': 'Batteri 50 %: {avdrag}',
  'b.bara_arbete': 'Bara arbetskostnaden ger avdrag, inte material eller resor',

  // --- tax block (rot-spec §6) ---
  'sk.ryms': 'Din skatt räcker preliminärt till hela avdraget: ungefär {utrymme} att räkna av mot, avdraget är {behov}',
  'sk.ryms_band': 'Din skatt räcker preliminärt till hela avdraget: ungefär {min} till {max} att räkna av mot, avdraget är {behov}',
  'sk.ryms_delvis': 'Din skatt räcker preliminärt till {ryms} av {behov}. Resten, {risk}, kan bli kvarskatt nästa år',
  'sk.ryms_inte': 'Din skatt räcker preliminärt inte till avdraget. Hela beloppet, {behov}, kan bli kvarskatt',
  'sk.ej_bedomd': 'Fyll i din inkomst under Fler detaljer så räknar vi på om skatten räcker',
  'sk.ej_bedomd.lag': 'Du angav låg eller ingen inkomst. Räkna på din skatt under Fler detaljer, eller kolla hos Skatteverket',
  'sk.ej_bedomd.vet': 'Vet du inte hur mycket skatt du betalar: räkna på det under Fler detaljer, eller kolla hos Skatteverket',
  'sk.hedge': 'Preliminärt. Skatteverket avgör i slutskattebeskedet. Räcker inte skatten betalar du mellanskillnaden',

  // --- next steps (UX §4.5) ---
  's.ja.1': 'Du får ett pris efter avdrag. Vi räknar av avdraget på fakturan och sköter ansökan hos Skatteverket',
  's.ja.villkor': 'Först reder vi ut om {villkor}. Sedan bestämmer du',
  's.ja.antaget': 'Stämmer det att {villkor}? Då får du ett pris efter avdrag',
  's.ja.skatt_vet': 'Kolla ditt utrymme i Skatteverkets Räkna ut rot- och rutavdrag, eller räkna på det under Fler detaljer',
  's.ja.2': 'När jobbet är klart och betalt skickar vi ansökan till Skatteverket',
  's.ja.3': 'Beloppet står förtryckt i din deklaration. Där stämmer Skatteverket av det mot din skatt',
  's.tro.femarsregeln': 'Skatteverket bedömer varje jobb för sig. Ring så kollar vi vad som räknas som reparation i ditt fall',
  's.tro.skatt_lag': 'Kolla ditt utrymme hos Skatteverket, eller räkna på det under Fler detaljer',
  's.tro.batteri_utan_sol': 'ROT kan i stället ge 30 % på arbetskostnaden för elarbetet, inte på batteriet. Räkna med ROT så ser du beloppet',
  's.tro.2': 'Vill du, lämnar vi ett pris utan avdrag. Inga överraskningar på fakturan',
  's.nej_hyra.1': 'Hör med din hyresvärd. Det är fastighetsägaren som äger och ansvarar för elen',
  's.nej_hyra.2': 'Läs vad som gäller för hyresrätt i artikeln',
  's.nej_inte_an.1': 'När huset är taxerat som färdigbyggt ger reparation ROT direkt. Nytt eller bättre ger ROT från sjätte året efter värdeåret',
  's.nej_inte_an.2': 'Laddbox eller batteri? Grön teknik har ingen femårsregel och gäller även hus som byggs just nu',
  's.nej_inte_i_ar.1': 'Årets pott är använd. Outnyttjat avdrag går inte att spara, men det är betalningsdatumet som avgör vilket år avdraget hamnar på',
  's.nej.ager': 'Den som äger bostaden kan i stället stå på fakturan',
  's.nej.artikel': 'Läs mer om villkoren i artikeln',
  's.nej.brf': 'Föreningen kan söka Naturvårdsverkets bidrag Ladda bilen',
  's.osaker.1': 'Ring så reder vi ut det',
  's.osaker.2': 'Eller kolla själv hos Skatteverket',

  // --- CTA (UX §5.2, one primary per class) ---
  'cta.offert': 'Få ett pris efter avdrag',
  'cta.offert_laddbox': 'Få ett pris på laddbox efter avdrag',
  'cta.offert_utan_avdrag': 'Få ett pris utan avdrag',
  'cta.tel_osaker': 'Ring så reder vi ut det',
  'cta.tel_forening': 'Ring så reder vi ut vad som gäller i din förening',
  'cta.tel_prata': 'Prata med oss',
  'cta.tel_sekundar': 'Hellre prata? {tel}',
  'cta.lage_byte_rot': 'Räkna med ROT i stället',
  'cta.skatteverket_utrymme': 'Kolla ditt utrymme hos Skatteverket',
  'cta.hyresvard': 'Hör med din hyresvärd',
  'cta.artikel_villkor': 'Läs mer om villkoren',
  'cta.nasta_ar': 'Vad gäller nästa år?',
  'cta.ladda_bilen': 'Ladda bilen hos Naturvårdsverket',

  // --- "Så har vi räknat" (rot-spec §7, gt-spec §5) ---
  'metod.rot.1': '30 % av arbetskostnaden inklusive moms. Material, resor, maskiner och administration ger inget avdrag. Taket är 50 000 kr per person och år, 75 000 kr för ROT och RUT tillsammans. Källa: Skatteverket, Så fungerar rotavdraget, och inkomstskattelagen 67 kap.',
  'metod.rot.2': 'Skatteutrymmet är din kommunala och statliga inkomstskatt plus fastighetsavgift, minus de skattereduktioner som räknas av före ROT: allmän pensionsavgift, jobbskatteavdrag, skattereduktion för förvärvsinkomst och ränteavdrag. Räcker inte skatten betalar du mellanskillnaden i slutskatten. Källa: inkomstskattelagen 67 kap. 2 §, Skatteverkets rättsliga vägledning 2026',
  'metod.rot.3': 'Vi räknar med 2026 års belopp: prisbasbelopp 59 200 kr, snittkommunalskatt 32,38 %, skiktgräns 643 000 kr. Skatteverkets egen räknare ger samma resultat med samma uppgifter. Källa: Skatteverket, Belopp och procent 2026, och e-tjänsten Räkna ut rot- och rutavdrag',
  'metod.rot.4': 'Vi antar att du betalar skatt i Sverige, betalar elektroniskt (Swish, kort eller bank) och anlitar ett företag med F-skatt. Ampy har F-skatt. Betalningsdatumet avgör vilket år avdraget hamnar på. Källa: Skatteverket, Så fungerar rotavdraget',
  'metod.gt.1': 'Avdraget är en skattereduktion. Räcker inte din skatt kan Skatteverket kräva tillbaka mellanskillnaden i slutskatten. Källa: Skatteverkets rättsliga vägledning 2026, Grön teknik, installation',
  'metod.gt.2': 'Underlaget är arbete och material inklusive moms. Resor, frakt och projektering ger inte avdrag. Vid fast totalpris räknar Skatteverket normalt 97 % av priset som arbete och material. Källa: Skatteverket, Grön teknik, och ställningstagandet 2021-01-27 om schablonen',
  'metod.gt.3': 'Taket är 50 000 kr per person och år för solceller, batteri och laddbox tillsammans. ROT och RUT har en egen pott, men skatten ska räcka till allt, och ROT och RUT räknas av först. Källa: inkomstskattelagen 67 kap. 2 och 45 §§',
  'metod.gt.4': 'Vi antar att du fyllt 18 år vid årets slut och betalar skatt i Sverige. Ändra om det inte stämmer. Källa: inkomstskattelagen 67 kap. 36 §',
  'metod.gt.5': 'Avdraget dras på fakturan och företaget som installerar ansöker senast 31 januari året efter slutbetalningen. Slutbetalningen avgör vilket år avdraget hamnar på. Källa: Skatteverket, Grön teknik, och lagen om förfarandet vid skattereduktion för installation av grön teknik',
  'metod.gt.batteri': 'Batteriet ska lagra el från egna solceller som finns eller installeras samtidigt. Att det också används till stödtjänster eller till att köpa billig el påverkar inte avdraget. Källa: Skatteverkets ställningstaganden 2023-11-30 och 2024-07-04',
  'metod.gt.sol': 'Solcellerna ska anslutas till elnätet och förse bara din bostad. Källa: Skatteverket, Godkända arbeten, grön teknik',
  'metod.gt.8': 'Uppskattning, inte ett besked från Skatteverket och inte ett erbjudande. Företaget som installerar ansöker om avdraget, du kan inte göra det i deklarationen i efterhand. Källa: Skatteverkets rättsliga vägledning 2026, Grön teknik, installation',
  'metod.gt.batteri_utan_sol': 'ROT gäller arbetskostnaden för elarbetet, inte batteriet. Hur stor arbetsdelen är avgör beloppet. Källa: Skatteverket, Ger arbetet rätt till rotavdrag?',
  'metod.kontrollerad': 'Reglerna gäller 2026 och kontrollerades mot Skatteverket 2026-09-11',
});

// ---------------------------------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------------------------------
const NBSP = ' ';

/** "9 000 kr" with non-breaking spaces, no decimals, plain hyphen-minus for negatives. */
export function formatKr(n) {
  const v = Math.round(Number(n) || 0);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${v < 0 ? '-' : ''}${s}${NBSP}kr`;
}

/** Round to nearest 100 kr (display rule, UX §3.6). */
export function round100(n) { return Math.round((Number(n) || 0) / 100) * 100; }

/** Display form of an amount: round100 then formatKr. */
export function kr100(n) { return formatKr(round100(n)); }

/** Resolve a COPY key with {param} interpolation. Unknown key -> the key itself (visible in QA). */
export function t(key, params) {
  const s = COPY[key];
  if (s === undefined) return key;
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined || params[k] === null ? m : String(params[k])));
}

// ---------------------------------------------------------------------------------------------------
// Mappings UI -> engine
// ---------------------------------------------------------------------------------------------------
export const BOENDE_ROT = Object.freeze({
  villa: Object.freeze({ bostadstyp: 'smahus', ager: 'ja', bor: 'jag' }),
  brf: Object.freeze({ bostadstyp: 'bostadsratt', ager: 'ja', bor: 'jag' }),
  fritid: Object.freeze({ bostadstyp: 'smahus', ager: 'ja', bor: 'fritid' }),
  hyra: Object.freeze({ bostadstyp: 'hyresratt' }),
  foralder: Object.freeze({ bostadstyp: 'smahus', ager: 'ja', bor: 'foraldrar' }),
});
export const BOENDE_GT = Object.freeze({
  villa: Object.freeze({ bostad: 'smahus', ager: true, anvandning: 'sjalv' }),
  brf: Object.freeze({ bostad: 'bostadsratt', ager: true, anvandning: 'sjalv' }),
  fritid: Object.freeze({ bostad: 'fritidshus', ager: true, anvandning: 'sjalv' }),
  hyra: Object.freeze({ bostad: 'hyresratt' }),
  foralder: Object.freeze({ bostad: 'smahus', ager: true, anvandning: 'foralder' }),
});
const BOR_DETALJ = Object.freeze({ uthyrd: 'uthyrd', barn: 'barn', sarbo: 'sarbo', nykopt: 'nykopt_flyttar_in' });
const LAGE_ENGINE = Object.freeze({ laddbox: 'gt_laddbox', batteri: 'gt_batteri', sol: 'gt_sol' });
const SMAHUS_BOENDE = new Set(['villa', 'fritid', 'foralder']);

// ---------------------------------------------------------------------------------------------------
// Question banks
//   { id, label (COPY key), help (COPY key|null), widget, options: [{id, label (COPY key), help?}], default,
//     visible: boolean | (effState) => boolean   (false = under "Fler detaljer"),
//     showWhen?: (effState) => boolean            (false = not rendered at all),
//     min?, max?, step?, presets?, gate? }
//   `default: null` means "auto": the effective value is derived (see effectiveState).
// ---------------------------------------------------------------------------------------------------
const chips = (ids, prefix) => ids.map((id) => ({ id, label: `${prefix}.${id}` }));
const BOENDE_OPTS = chips(['villa', 'brf', 'fritid', 'hyra', 'foralder'], 'q.boende');
const SKATT_OPTS = chips(['lon', 'pension', 'lag', 'vet'], 'q.skatt');
const isRotSmahus = (s) => SMAHUS_BOENDE.has(s.boende);
const isBrf = (s) => s.boende === 'brf';
const djupOn = (s) => Boolean(s.skatt_djup);
const djup2 = (s) => Boolean(s.skatt_djup) && Number(s.agare) === 2;

const SKATT_DJUP_QUESTIONS = (mode) => [
  { id: 'skatt_djup', label: 'q.skatt_djup.label', help: 'q.skatt_djup.help', widget: 'toggle', default: false, visible: false },
  { id: 'inkomsttyp', label: 'q.inkomsttyp.label', help: null, widget: 'chips', options: chips(['lon', 'pension', 'bada'], 'q.inkomsttyp'), default: null, visible: false, showWhen: djupOn },
  { id: 'manadsinkomst', label: 'q.manadsinkomst.label', help: 'q.manadsinkomst.help', widget: 'slider', min: 10_000, max: 100_000, step: 1_000, default: GAP_DEFAULTS.MANADSINKOMST_DEFAULT, visible: false, showWhen: (s) => djupOn(s) && effInkomsttyp(s) !== 'bada' },
  { id: 'lon_manad', label: 'q.lon_manad.label', help: null, widget: 'amount', default: 20_000, visible: false, showWhen: (s) => djupOn(s) && effInkomsttyp(s) === 'bada' },
  { id: 'pension_manad', label: 'q.pension_manad.label', help: null, widget: 'amount', default: 15_000, visible: false, showWhen: (s) => djupOn(s) && effInkomsttyp(s) === 'bada' },
  { id: 'fyllt66', label: 'q.fyllt66.label', help: 'q.fyllt66.help', widget: 'toggle', default: null, visible: false, showWhen: djupOn },
  { id: 'ranteutgifter_ar', label: 'q.ranteutgifter_ar.label', help: 'q.ranteutgifter_ar.help', widget: 'amount', default: 0, visible: false, showWhen: djupOn },
  { id: 'kommunalskatt', label: 'q.kommunalskatt.label', help: 'q.kommunalskatt.help', widget: 'amount', min: 25, max: 40, step: 0.01, default: GAP_DEFAULTS.KOMMUNALSKATT_DEFAULT, visible: false, showWhen: djupOn },
  ...(mode === 'rot'
    ? [{ id: 'gt_planerad_kr', label: 'q.gt_planerad_kr.label', help: 'q.gt_planerad_kr.help', widget: 'amount', default: 0, visible: false, showWhen: djupOn }]
    : []),
  { id: 'inkomsttyp_2', label: 'q.inkomsttyp_2.label', help: null, widget: 'chips', options: chips(['lon', 'pension'], 'q.inkomsttyp'), default: 'lon', visible: false, showWhen: djup2 },
  { id: 'manadsinkomst_2', label: 'q.manadsinkomst_2.label', help: 'q.manadsinkomst.help', widget: 'slider', min: 10_000, max: 100_000, step: 1_000, default: GAP_DEFAULTS.MANADSINKOMST_DEFAULT, visible: false, showWhen: djup2 },
  { id: 'fyllt66_2', label: 'q.fyllt66_2.label', help: null, widget: 'toggle', default: null, visible: false, showWhen: djup2 },
];

function effInkomsttyp(s, owner = 1) {
  if (owner === 2) return s.inkomsttyp_2 ?? 'lon';
  if (s.inkomsttyp) return s.inkomsttyp;
  return s.skatt === 'pension' ? 'pension' : 'lon';
}

export const BANKS = Object.freeze({
  rot: [
    // --- visible (4) ---
    { id: 'boende', gate: true, label: 'q.boende.label', help: 'q.boende.help', widget: 'chips', options: BOENDE_OPTS, default: 'villa', visible: true },
    { id: 'vardear', gate: true, label: 'q.vardear.label', help: 'q.vardear.help', widget: 'chips',
      options: chips(['t2011', '2012_2020', '2021_2025', '2026_ej_fardig', 'vet_inte'], 'q.vardear'), default: 't2011', visible: true, showWhen: isRotSmahus },
    { id: 'arbetstyp', gate: true, label: 'q.arbetstyp.label', help: 'q.arbetstyp.help', widget: 'chips',
      options: [{ id: 'reparation', label: 'q.arbetstyp.reparation' }, { id: 'ombyggnad', label: 'q.arbetstyp.ombyggnad', help: 'q.arbetstyp.ombyggnad.help' }, { id: 'vet_inte', label: 'q.arbetstyp.vet_inte' }],
      default: 'vet_inte', visible: true, showWhen: (s) => isRotSmahus(s) && (s.vardear === '2021_2025' || s.vardear === 'vet_inte') },
    { id: 'belopp', label: 'q.belopp.label', help: 'q.belopp.help', widget: 'amount', min: 0, max: 1_000_000, step: 5_000, presets: GAP_DEFAULTS.BELOPP_PRESETS.rot, default: null, visible: true, showWhen: (s) => s.boende !== 'hyra' },
    { id: 'skatt', gate: true, label: 'q.skatt.label', help: 'q.skatt.help', widget: 'chips', options: SKATT_OPTS, default: 'lon', visible: true, showWhen: (s) => s.boende !== 'hyra' },
    // --- Fler detaljer ---
    { id: 'jobb', label: 'q.jobb.label', help: 'q.jobb.help', widget: 'chips', options: chips(['byta_elcentral', 'annat'], 'q.jobb'), default: 'byta_elcentral', visible: false },
    { id: 'arbete', label: 'q.arbete.label', help: 'q.arbete.help', widget: 'slider', min: 0, max: 100, step: 5, default: null, visible: false, showWhen: (s) => s.arbete_kr === null || s.arbete_kr === undefined },
    { id: 'arbete_kr', label: 'q.arbete_kr.label', help: 'q.arbete_kr.help', widget: 'amount', min: 0, max: 1_000_000, step: 1_000, default: null, visible: false },
    { id: 'plats', gate: true, label: 'q.plats.label', help: 'q.plats.help', widget: 'chips', options: chips(['inne', 'utanfor', 'vet_inte'], 'q.plats'), default: 'inne', visible: false, showWhen: isBrf },
    { id: 'agare', gate: true, label: 'q.agare.label', help: 'q.agare.help', widget: 'toggle', options: chips(['1', '2'], 'q.agare'), default: 1, visible: false },
    { id: 'anvant_rot', label: 'q.anvant_rot.label', help: 'q.anvant_rot.help', widget: 'stepper', min: 0, max: 50_000, step: 5_000, default: 0, visible: false },
    { id: 'anvant_rut', label: 'q.anvant_rut.label', help: 'q.anvant_rut.help', widget: 'stepper', min: 0, max: 75_000, step: 5_000, default: 0, visible: false },
    { id: 'under18', gate: true, label: 'q.under18.label', help: 'q.under18.help', widget: 'checkbox', default: false, visible: false },
    { id: 'bor_detalj', gate: true, label: 'q.bor_detalj.label', help: 'q.bor_detalj.help', widget: 'chips', options: chips(['ingen', 'uthyrd', 'barn', 'sarbo', 'nykopt'], 'q.bor_detalj'), default: 'ingen', visible: false, showWhen: (s) => s.boende !== 'hyra' },
    ...SKATT_DJUP_QUESTIONS('rot'),
  ],
  gt: [
    // --- visible ---
    { id: 'lage', label: 'q.lage.label', help: null, widget: 'chips', options: chips(['laddbox', 'batteri', 'sol'], 'q.lage'), default: 'laddbox', visible: true },
    { id: 'boende', gate: true, label: 'q.boende.gt.label', help: 'q.boende.help', widget: 'chips', options: BOENDE_OPTS, default: 'villa', visible: true },
    { id: 'sol', gate: true, label: 'q.sol.label', help: 'q.sol.help', widget: 'chips', options: chips(['har', 'samtidigt', 'nej', 'vet_inte'], 'q.sol'), default: 'har', visible: true, showWhen: (s) => s.lage === 'batteri' && s.boende !== 'hyra' },
    { id: 'pplats', gate: true, label: 'q.pplats.label', help: 'q.pplats.help', widget: 'chips', options: chips(['foljer_bostadsratten', 'hyrd_uppsagningsbar', 'gemensamt', 'vet_inte'], 'q.pplats'), default: 'vet_inte', visible: true, showWhen: (s) => s.lage === 'laddbox' && isBrf(s) },
    { id: 'belopp', label: 'q.belopp.laddbox.label', help: 'q.belopp.gt.help', widget: 'amount', min: 0, max: 1_000_000, step: 5_000, presets: null, default: null, visible: true, showWhen: (s) => s.boende !== 'hyra' },
    { id: 'skatt', gate: true, label: 'q.skatt.label', help: 'q.skatt.help', widget: 'chips', options: SKATT_OPTS, default: 'lon', visible: true, showWhen: (s) => s.boende !== 'hyra' },
    { id: 'agare', gate: true, label: 'q.agare.label', help: 'q.agare.help', widget: 'toggle', options: chips(['1', '2'], 'q.agare'), default: 1, visible: (s) => s.lage === 'batteri' || s.lage === 'sol', showWhen: (s) => s.boende !== 'hyra' },
    // --- Fler detaljer ---
    { id: 'material', gate: true, label: 'q.material.label', help: 'q.material.help', widget: 'chips', options: chips(['installator', 'sjalv', 'leasing'], 'q.material'), default: 'installator', visible: false },
    { id: 'arbete_kr', label: 'q.arbete_kr.gt.label', help: 'q.arbete_kr.gt.help', widget: 'amount', min: 0, max: 1_000_000, step: 1_000, default: null, visible: false,
      showWhen: (s) => s.material !== 'installator' || (s.lage === 'batteri' && s.sol === 'nej') },
    { id: 'fastpris', label: 'q.fastpris.label', help: 'q.fastpris.help', widget: 'toggle', default: false, visible: false },
    { id: 'tillagg_elcentral_kr', label: 'q.tillagg_elcentral_kr.label', help: 'q.tillagg_elcentral_kr.help', widget: 'amount', min: 0, max: 200_000, step: 1_000, default: 0, visible: false, showWhen: (s) => s.lage === 'laddbox' },
    { id: 'anvant_gt', label: 'q.anvant_gt.label', help: 'q.anvant_gt.help', widget: 'stepper', min: 0, max: 50_000, step: 5_000, default: 0, visible: false },
    { id: 'anvant_rot_rut', label: 'q.anvant_rot_rut.label', help: 'q.anvant_rot_rut.help', widget: 'stepper', min: 0, max: 75_000, step: 5_000, default: 0, visible: false },
    { id: 'batteri_samtidigt_kr', label: 'q.batteri_samtidigt_kr.label', help: 'q.batteri_samtidigt_kr.help', widget: 'amount', min: 0, max: 500_000, step: 5_000, default: 0, visible: false, showWhen: (s) => s.lage === 'sol' },
    { id: 'under18', gate: true, label: 'q.under18.label', help: 'q.under18.help', widget: 'checkbox', default: false, visible: false },
    { id: 'anvandning', gate: true, label: 'q.anvandning.label', help: null, widget: 'chips', options: chips(['sjalv', 'foralder', 'annan'], 'q.anvandning'), default: null, visible: false, showWhen: (s) => s.boende !== 'hyra' },
    ...SKATT_DJUP_QUESTIONS('gt'),
  ],
});

const MODES = ['rot', 'gt'];
function assertMode(mode) { if (!MODES.includes(mode)) throw new Error(`ui-model: okänt mode "${mode}"`); }

/** Load state: every question at its default. */
export function defaultState(mode) {
  assertMode(mode);
  const s = {};
  for (const q of BANKS[mode]) s[q.id] = q.default;
  return s;
}

function withDefaults(mode, uiState) {
  const s = defaultState(mode);
  for (const k of Object.keys(uiState || {})) if (k in s && uiState[k] !== undefined) s[k] = uiState[k];
  return s;
}

/**
 * Effective state: `null` defaults resolved.
 *   belopp        null -> GAP_DEFAULTS.BELOPP_DEFAULT[mode/läge]; 0 -> "tomt" (tak-läge)
 *   arbete        null -> GAP_DEFAULTS.JOBB_ARBETSANDEL[jobb]   (assumed share -> intervall)
 *   inkomsttyp    null -> from the skatt chip (pension -> pension, else lon)
 *   fyllt66       null -> true when inkomsttyp is pension, else false (rot-spec §2 block 3)
 *   anvandning    null -> from boende (foralder -> foralder, else sjalv)
 * Also adds derived helpers: belopp_tomt, arbete_andel, arbetskostnad_kr, punkt.
 */
export function effectiveState(mode, uiState = {}) {
  assertMode(mode);
  const s = withDefaults(mode, uiState);
  const e = { ...s };
  e.agare = Number(s.agare) === 2 ? 2 : 1;
  const beloppKey = mode === 'rot' ? 'rot' : s.lage;
  e.belopp = s.belopp === null || s.belopp === undefined ? GAP_DEFAULTS.BELOPP_DEFAULT[beloppKey] : Math.max(0, Number(s.belopp) || 0);
  e.belopp_tomt = !(e.belopp > 0);
  e.inkomsttyp = effInkomsttyp(s, 1);
  e.fyllt66 = s.fyllt66 === null || s.fyllt66 === undefined ? e.inkomsttyp === 'pension' : Boolean(s.fyllt66);
  e.inkomsttyp_2 = effInkomsttyp(s, 2);
  e.fyllt66_2 = s.fyllt66_2 === null || s.fyllt66_2 === undefined ? e.inkomsttyp_2 === 'pension' : Boolean(s.fyllt66_2);
  e.skatt_djup = Boolean(s.skatt_djup);
  e.under18 = Boolean(s.under18);
  if (mode === 'rot') {
    e.arbete_andel = s.arbete === null || s.arbete === undefined ? GAP_DEFAULTS.JOBB_ARBETSANDEL[s.jobb] ?? GAP_DEFAULTS.JOBB_ARBETSANDEL.annat : clampPct(s.arbete);
    e.arbete_kr = s.arbete_kr === null || s.arbete_kr === undefined ? null : Math.max(0, Number(s.arbete_kr) || 0);
    e.arbetskostnad_kr = e.arbete_kr !== null ? Math.min(e.arbete_kr, e.belopp) : Math.round(e.belopp * e.arbete_andel / 100);
  } else {
    e.anvandning = s.anvandning ?? (s.boende === 'foralder' ? 'foralder' : 'sjalv');
    e.arbete_kr = s.arbete_kr === null || s.arbete_kr === undefined ? null : Math.max(0, Number(s.arbete_kr) || 0);
    e.fastpris = Boolean(s.fastpris);
  }
  return e;
}

function clampPct(x) { return Math.max(0, Math.min(100, Number(x) || 0)); }

/** Is the question rendered at all (showWhen) and is it in the main panel (visible) for this state? */
export function questionState(q, effState) {
  const shown = q.showWhen ? Boolean(q.showWhen(effState)) : true;
  const visible = typeof q.visible === 'function' ? Boolean(q.visible(effState)) : Boolean(q.visible);
  return { shown, folded: shown && !visible };
}

/** Render helper: the bank with strings resolved, visibility computed and effective values filled. */
export function resolveBank(mode, uiState = {}) {
  assertMode(mode);
  const eff = effectiveState(mode, uiState);
  return BANKS[mode].map((q) => {
    const { shown, folded } = questionState(q, eff);
    let labelKey = q.label;
    let help = q.help;
    let presets = q.presets;
    if (mode === 'gt' && q.id === 'belopp') { labelKey = `q.belopp.${eff.lage}.label`; presets = GAP_DEFAULTS.BELOPP_PRESETS[eff.lage]; }
    const out = {
      ...q, labelKey, label: labelKey ? t(labelKey) : '', helpKey: help, help: help ? t(help, { andel: eff.arbete_andel }) : '',
      shown, folded, presets, value: uiState && uiState[q.id] !== undefined ? uiState[q.id] : q.default, effectiveValue: eff[q.id],
      options: (q.options || []).map((o) => ({ ...o, labelKey: o.label, label: t(o.label), help: o.help ? t(o.help) : '' })),
    };
    return out;
  });
}

// ---------------------------------------------------------------------------------------------------
// UI state -> engine input
// ---------------------------------------------------------------------------------------------------
function personTax(mode, eff, owner) {
  const typ = owner === 2 ? eff.inkomsttyp_2 : eff.inkomsttyp;
  const man = owner === 2 ? Number(eff.manadsinkomst_2) || 0 : Number(eff.manadsinkomst) || 0;
  const p66 = owner === 2 ? eff.fyllt66_2 : eff.fyllt66;
  let lonAr = 0; let penAr = 0;
  if (typ === 'bada' && owner === 1) { lonAr = (Number(eff.lon_manad) || 0) * 12; penAr = (Number(eff.pension_manad) || 0) * 12; }
  else if (typ === 'pension') penAr = man * 12;
  else lonAr = man * 12;
  return {
    lon_ar: lonAr, pension_ar: penAr, ar_66_plus: Boolean(p66),
    ks: (Number(eff.kommunalskatt) || GAP_DEFAULTS.KOMMUNALSKATT_DEFAULT) / 100,
    taxeringsvarde: taxeringsvardeFor(mode, eff),
    ranteutgifter: owner === 1 ? Math.max(0, Number(eff.ranteutgifter_ar) || 0) : 0,
  };
}

/**
 * Property fee base. ROT: rot-spec §2 derivation by bostadstyp + vardear. GT has no vardear question, so the
 * fee is left at 0 for every bostad (conservative: utrymme is understated by at most 10 425 kr). [reconciliation]
 */
function taxeringsvardeFor(mode, eff) {
  if (mode !== 'rot') return 0;
  const m = BOENDE_ROT[eff.boende] || {};
  return harledTaxeringsvarde(m.bostadstyp, eff.vardear);
}

function rotOwner(eff, owner, opts) {
  const a = { taxeringsvarde: taxeringsvardeFor('rot', eff) };
  if (owner === 1) {
    a.rot_anvant_i_ar = Math.max(0, Number(eff.anvant_rot) || 0);
    a.rut_anvant_i_ar = Math.max(0, Number(eff.anvant_rut) || 0);
  } else { a.rot_anvant_i_ar = 0; a.rut_anvant_i_ar = 0; }
  if (eff.skatt_djup) {
    const typ = owner === 2 ? eff.inkomsttyp_2 : eff.inkomsttyp;
    const man = owner === 2 ? eff.manadsinkomst_2 : eff.manadsinkomst;
    a.inkomsttyp = typ;
    a.manadsinkomst = typ === 'bada' && owner === 1 ? (Number(eff.lon_manad) || 0) + (Number(eff.pension_manad) || 0) : Number(man) || 0;
    if (typ === 'bada' && owner === 1) { a.lon_manad = Number(eff.lon_manad) || 0; a.pension_manad = Number(eff.pension_manad) || 0; }
    a.fyllt_66_vid_arets_ingang = owner === 2 ? eff.fyllt66_2 : eff.fyllt66;
    a.kommunalskatt = (opts && opts.ks !== undefined) ? opts.ks : (Number(eff.kommunalskatt) || GAP_DEFAULTS.KOMMUNALSKATT_DEFAULT) / 100;
    a.ranteutgifter_ar = owner === 1 ? Math.max(0, Number(eff.ranteutgifter_ar) || 0) : 0;
    a.gron_teknik_planerad_i_ar = owner === 1 ? Math.max(0, Number(eff.gt_planerad_kr) || 0) : 0;
  }
  return a;
}

/**
 * toEngineInput(mode, uiState, opts?) -> engine input.
 *   opts.arbeteAndel  (rot) override the labour share in percent (used for the intervall min/max runs)
 *   opts.ks           override kommunalskatt as a fraction (used for the 29–35 % band)
 */
export function toEngineInput(mode, uiState = {}, opts = {}) {
  assertMode(mode);
  const eff = effectiveState(mode, uiState);
  if (mode === 'rot') {
    const m = BOENDE_ROT[eff.boende] || BOENDE_ROT.villa;
    const inp = { bostadstyp: m.bostadstyp };
    if (m.ager) inp.ager = m.ager;
    if (m.bor) inp.bor = eff.bor_detalj && eff.bor_detalj !== 'ingen' ? BOR_DETALJ[eff.bor_detalj] : m.bor;
    if (m.bostadstyp === 'smahus') { inp.vardear = eff.vardear; inp.arbetstyp = eff.arbetstyp; }
    if (m.bostadstyp === 'bostadsratt') inp.plats = eff.plats;
    inp.myndig_vid_arsskiftet = !eff.under18;
    let arb = eff.arbetskostnad_kr;
    if (opts.arbeteAndel !== undefined && eff.arbete_kr === null) arb = Math.round(eff.belopp * clampPct(opts.arbeteAndel) / 100);
    inp.arbetskostnad_inkl_moms = arb;
    inp.material_inkl_moms = Math.max(0, eff.belopp - arb);
    inp.agare = [rotOwner(eff, 1, opts)];
    if (eff.agare === 2) inp.agare.push(rotOwner(eff, 2, opts));
    return inp;
  }
  const m = BOENDE_GT[eff.boende] || BOENDE_GT.villa;
  const n = eff.agare;
  const inp = { lage: LAGE_ENGINE[eff.lage] || 'gt_laddbox', bostad: m.bostad };
  if (m.ager !== undefined) { inp.ager = m.ager; inp.anvandning = eff.anvandning; }
  inp.alder_18 = !eff.under18;
  if (eff.lage === 'batteri') inp.solceller = eff.sol;
  if (eff.lage === 'laddbox' && m.bostad === 'bostadsratt') inp.pplats = eff.pplats;
  inp.pris_total_kr = eff.belopp;
  inp.pris_arbete_kr = eff.arbete_kr ?? 0;
  inp.material_fran_installator = eff.material !== 'sjalv';
  inp.leasing = eff.material === 'leasing';
  inp.fast_pris_schablon = eff.fastpris;
  inp.antal_agare = n;
  inp.gt_anvant_kr = [Math.max(0, Number(eff.anvant_gt) || 0), 0].slice(0, n);
  inp.rot_rut_anvant_kr = [Math.max(0, Number(eff.anvant_rot_rut) || 0), 0].slice(0, n);
  inp.tillagg_elcentral_kr = eff.lage === 'laddbox' ? Math.max(0, Number(eff.tillagg_elcentral_kr) || 0) : 0;
  inp.skatt_tillganglig_kr = [];
  for (let i = 1; i <= n; i++) {
    if (!eff.skatt_djup) { inp.skatt_tillganglig_kr.push(null); continue; }
    const pt = personTax('gt', eff, i);
    if (opts.ks !== undefined) pt.ks = opts.ks;
    inp.skatt_tillganglig_kr.push(skatteutrymme(pt).utrymme_rot_rut_gt);
  }
  return inp;
}

// ---------------------------------------------------------------------------------------------------
// evaluate()
// ---------------------------------------------------------------------------------------------------
const NEJ_SUBTYP_ROT = Object.freeze({
  hyresratt: 'hyra', under_18: 'under18', ager_inte: 'ager', uthyrd_bostad: 'uthyrd', barnets_bostad: 'barn',
  sarbos_bostad: 'sarbo', bor_inte_dar: 'bor_inte', ej_fardigstallt_nybygge: 'inte_an', utanfor_lagenheten: 'utanfor',
  bidrag_forsakring_eller_gt_samma_arbete: 'bidrag', dodsbo_efter_dodsfall: 'dodsbo', ej_skattskyldig_sverige: 'skattskyldig',
});
const NEJ_SUBTYP_GT = Object.freeze({
  ej_hyresratt: 'hyra', ej_ager_inte: 'ager', ej_anvands_av_annan: 'anvandning', ej_person: 'under18',
  ej_brf_gemensamt: 'brf_gemensamt', ej_brf_pplats_hyrd: 'brf_pplats_hyrd',
});

function row(id, fraga, status, typ, textKey, params, frasKey) {
  return { id, fraga, status, typ, textKey, params: params || {}, frasKey: frasKey || null };
}

/** Tax band: utrymme at the two ends of KS_BAND for owner 1 (the skatt chip owner). */
function taxBand(mode, uiState) {
  const eff = effectiveState(mode, uiState);
  // ROT: owner 1 (the skatt chip owner; ROT rows are per owner). GT: the household, because the GT engine
  // tests the deduction against the SUM of the owners' room after ROT/RUT (gt-spec §4 step 4).
  const owners = mode === 'gt' ? eff.agare : 1;
  const rotRut = mode === 'gt' ? Math.max(0, Number(eff.anvant_rot_rut) || 0) : 0;
  const vals = P.KS_BAND.map((ks) => {
    let sum = 0;
    for (let i = 1; i <= owners; i++) {
      const u = skatteutrymme({ ...personTax(mode, eff, i), ks }).utrymme_rot_rut_gt;
      sum += mode === 'gt' ? Math.max(0, u - (i === 1 ? rotRut : 0)) : u;
    }
    return sum;
  });
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

/**
 * evaluate(mode, uiState, touched) -> result (see README for the full contract). `touched` = Set/array of
 * question ids the user has interacted with. Untouched gate answers are "antaget"; "vet inte" is "okand".
 * Link-prefilled answers are NOT touched (a säljare cannot confirm on the customer's behalf, UX §7.1).
 */
export function evaluate(mode, uiState = {}, touched = []) {
  assertMode(mode);
  const touchedSet = touched instanceof Set ? touched : new Set(touched || []);
  const state = withDefaults(mode, uiState);
  const eff = effectiveState(mode, state);
  return mode === 'rot' ? evaluateRot(state, eff, touchedSet) : evaluateGt(state, eff, touchedSet);
}

// ---------- shared pieces ----------

function skattRows(mode, eff, raw, band, skattStatus, isT) {
  // returns { rows, skattBlock }
  const rows = [];
  const pre = mode === 'rot' ? 'v.skatt' : 'v.gt.skatt';
  const s0 = mode === 'rot' ? raw.skatt[0] : null;
  const block = { status: skattStatus, hedgeKey: 'sk.hedge' };
  if (eff.skatt_djup && skattStatus !== 'ej_relevant') {
    let utrymme; let behov; let ryms; let risk;
    if (mode === 'rot') {
      utrymme = s0.utrymme_kr; behov = s0.behov_rot_rut_kr; risk = s0.aterbetalningsrisk_kr; ryms = behov - risk;
    } else {
      utrymme = raw._skatt_tillganglig_kr.reduce((acc, u, i) => acc + Math.max(0, (u || 0) - (raw._rot_rut[i] || 0)), 0); behov = raw.avdrag_kr; ryms = raw.avdrag_efter_skatt_kr; risk = raw.aterbetalningsrisk_kr;
    }
    Object.assign(block, { utrymme_kr: utrymme, utrymme_min_kr: band.min, utrymme_max_kr: band.max, behov_kr: behov, aterbetalningsrisk_kr: risk });
    const pr = { utrymme: kr100(utrymme), min: kr100(band.min), max: kr100(band.max), behov: kr100(behov), ryms: kr100(ryms), risk: kr100(risk) };
    if (skattStatus === 'ryms') { rows.push(row('skatt', 'skatt', 'ok', 'info', band.min !== band.max ? `${pre}.ryms_band` : `${pre}.ryms`, pr)); block.textKey = band.min !== band.max ? 'sk.ryms_band' : 'sk.ryms'; }
    else if (skattStatus === 'ryms_delvis') { rows.push(row('skatt', 'skatt', 'varning', 'begransning', `${pre}.delvis`, pr, `${pre}.delvis.fras`)); block.textKey = 'sk.ryms_delvis'; }
    else if (skattStatus === 'ryms_inte') { rows.push(row('skatt', 'skatt', 'varning', 'troligen', `${pre}.inte`, pr)); block.textKey = 'sk.ryms_inte'; }
    else { rows.push(row('skatt', 'skatt', 'antaget', 'grind', 'v.skatt.lon', {}, 'v.skatt.lon.fras')); block.textKey = 'sk.ej_bedomd'; }
    block.params = pr;
    return { rows, block };
  }
  if (skattStatus === 'ej_relevant') { block.textKey = null; return { rows, block }; }
  switch (eff.skatt) {
    case 'pension': rows.push(row('skatt', 'skatt', isT('skatt') ? 'ok' : 'antaget', 'grind', 'v.skatt.pension', {}, 'v.skatt.pension.fras')); block.textKey = 'sk.ej_bedomd'; break;
    case 'lag': rows.push(row('skatt', 'skatt', 'varning', 'troligen', 'v.skatt.lag')); block.textKey = 'sk.ej_bedomd.lag'; break;
    case 'vet': rows.push(row('skatt', 'skatt', 'okand', 'grind', 'v.skatt.vet', {}, 'v.skatt.vet.fras')); block.textKey = 'sk.ej_bedomd.vet'; break;
    default: rows.push(row('skatt', 'skatt', isT('skatt') ? 'ok' : 'antaget', 'grind', 'v.skatt.lon', {}, 'v.skatt.lon.fras')); block.textKey = 'sk.ej_bedomd';
  }
  return { rows, block };
}

function agareRow(eff, raw, isT) {
  if (eff.agare !== 2) return [];
  const rows = [];
  const s1 = raw.skatt && raw.skatt[1];
  if (eff.skatt_djup && s1 && s1.status && s1.status !== 'ej_bedomd' && (isT('manadsinkomst_2') || isT('inkomsttyp_2'))) {
    if (s1.status === 'ryms') rows.push(row('agare', 'agare', 'ok', 'info', 'v.agare.bada_skatt'));
    else rows.push(row('agare', 'agare', 'varning', 'begransning', 'v.agare.omfordela', {}, 'v.agare.bada_skatt.fras'));
  } else {
    rows.push(row('agare', 'agare', 'antaget', 'grind', 'v.agare.bada_skatt', {}, 'v.agare.bada_skatt.fras'));
  }
  return rows;
}

function classify(rows, eff, opts) {
  // opts: { hard: {klass, subtyp}|null, troligen: subtyp|null, osakerFast: subtyp|null, mode }
  if (opts.hard) return { klass: 'nej', subtyp: opts.hard };
  if (opts.troligen) return { klass: 'troligen_inte', subtyp: opts.troligen };
  const okanda = rows.filter((r) => r.status === 'okand');
  if (opts.osakerFast) return { klass: 'osaker', subtyp: opts.osakerFast, okanda };
  if (okanda.length >= 2 || (okanda.length >= 1 && eff.boende === 'foralder')) return { klass: 'osaker', subtyp: 'flera_okanda', okanda };
  const open = rows.filter((r) => r.status === 'okand' || r.status === 'antaget' || (r.status === 'varning' && r.typ === 'villkor'));
  const begr = rows.filter((r) => r.status === 'varning' && r.typ === 'begransning');
  if (open.length >= 2) return { klass: 'ja_villkor', subtyp: 'flera_villkor', open, begr };
  if (open.length === 1) return { klass: 'ja_villkor', subtyp: open[0].id, open, begr };
  if (begr.length >= 1) return { klass: 'ja_villkor', subtyp: begr[0].id, open, begr };
  return { klass: 'ja', subtyp: null, open, begr };
}

function fras(r) { return r.frasKey ? t(r.frasKey, r.params) : t(r.textKey, r.params); }

function headlineFor(mode, cls, rows) {
  const { klass, subtyp } = cls;
  if (klass === 'ja') return { key: mode === 'rot' ? 'h.rot.ja' : 'h.gt.ja', params: {} };
  if (klass === 'ja_villkor') {
    if (subtyp === 'flera_villkor') return { key: 'h.ja_om_stammer', params: {} };
    if (cls.open.length === 1) return { key: 'h.ja_om', params: { villkor: fras(cls.open[0]) } };
    return { key: 'h.ja_men', params: { begransning: fras(cls.begr[0]) } };
  }
  if (klass === 'troligen_inte') return { key: `h.troligen.${subtyp}`, params: {} };
  if (klass === 'nej') return { key: `h.nej.${subtyp}`, params: {} };
  // osaker
  if (subtyp === 'brf_batteri') return { key: 'h.osaker.brf_batteri', params: {} };
  const saker = [...cls.okanda, ...rows.filter((r) => (r.status === 'antaget' || (r.status === 'varning' && r.typ === 'villkor')) && !cls.okanda.includes(r))];
  if (saker.length === 2) return { key: 'h.osaker', params: { sak1: fras(saker[0]), sak2: fras(saker[1]) } };
  return { key: 'h.osaker.flera', params: {} };
}

function ramFor(cls, rows) {
  const { klass } = cls;
  if (klass === 'ja') return { key: 'ram.ja', params: {} };
  if (klass === 'ja_villkor') {
    const n = (cls.open || []).length;
    if (n >= 2) return { key: 'ram.ja_villkor.flera', params: { n } };
    if (n === 1) return { key: 'ram.ja_villkor.ett', params: {} };
    return { key: 'ram.ja_men', params: {} };
  }
  if (klass === 'troligen_inte') return { key: 'ram.troligen', params: {} };
  if (klass === 'nej') return { key: 'ram.nej', params: {} };
  return { key: 'ram.osaker', params: {} };
}

function offertHref(mode, eff, klass) {
  const q = new URLSearchParams();
  q.set('src', 'avdragskollen'); q.set('m', mode);
  if (mode === 'gt') q.set('l', eff.lage);
  q.set('b', eff.boende); q.set('v', klass);
  if (!eff.belopp_tomt) q.set('a', String(Math.round(eff.belopp / 1000) * 1000));
  if (mode === 'rot' && eff.arbete_kr !== null) q.set('ak', String(eff.arbete_kr));
  return `${LINKS.offert}?${q.toString()}`;
}

const TEL_SEC = () => ({ labelKey: 'cta.tel_sekundar', kind: 'tel', href: LINKS.tel, params: { tel: LINKS.tel_text } });
const SKV_SEC = () => ({ labelKey: 'cta.skatteverket_utrymme', kind: 'skatteverket', href: LINKS.skatteverket_rot_rut });

function ctaFor(mode, eff, cls, rows) {
  const { klass, subtyp } = cls;
  const none = { labelKey: null, kind: 'none', href: null, solid: false };
  const offert = (labelKey) => ({ labelKey, kind: 'offert', href: offertHref(mode, eff, klass), solid: true });
  if (klass === 'ja' || klass === 'ja_villkor') {
    // BRF + laddbox with the p-plats unresolved: Ampy cannot quote before the association question is settled (UX §5.2)
    if (mode === 'gt' && rows.some((r) => r.id === 'pplats' && r.status === 'okand')) return { primary: { labelKey: 'cta.tel_forening', kind: 'tel', href: LINKS.tel, solid: true }, secondary: SKV_SEC() };
    return { primary: offert(mode === 'gt' && eff.lage === 'laddbox' ? 'cta.offert_laddbox' : 'cta.offert'), secondary: TEL_SEC() };
  }
  if (klass === 'troligen_inte') {
    if (subtyp === 'batteri_utan_sol') {
      return { primary: { labelKey: 'cta.lage_byte_rot', kind: 'lage_byte', href: '#rot', solid: true,
        byte: { mode: 'rot', state: { boende: eff.boende, skatt: eff.skatt, agare: eff.agare, belopp: eff.belopp_tomt ? 0 : eff.belopp, arbete_kr: eff.arbete_kr, skatt_djup: eff.skatt_djup } } }, secondary: TEL_SEC() };
    }
    if (subtyp === 'skatt_lag') return { primary: { ...SKV_SEC(), solid: false }, secondary: TEL_SEC() };
    // femarsregeln
    return { primary: { labelKey: 'cta.offert_utan_avdrag', kind: 'offert', href: offertHref(mode, eff, klass), solid: false }, secondary: TEL_SEC() };
  }
  if (klass === 'nej') {
    if (subtyp === 'hyra') return { primary: none, secondary: { labelKey: 'cta.hyresvard', kind: 'artikel', href: LINKS.artikel_hyresratt } };
    if (subtyp === 'under18' || subtyp === 'skattskyldig') return { primary: none, secondary: null };
    if (subtyp === 'inte_an') return { primary: { labelKey: 'cta.offert_utan_avdrag', kind: 'offert', href: offertHref(mode, eff, klass), solid: false }, secondary: TEL_SEC() };
    if (subtyp === 'inte_i_ar') return { primary: { labelKey: 'cta.nasta_ar', kind: 'artikel', href: LINKS.artikel_nasta_ar, solid: false }, secondary: TEL_SEC() };
    if (subtyp === 'brf_gemensamt' || subtyp === 'brf_pplats_hyrd') return { primary: { labelKey: 'cta.ladda_bilen', kind: 'artikel', href: LINKS.ladda_bilen, solid: false }, secondary: TEL_SEC() };
    return { primary: { labelKey: 'cta.artikel_villkor', kind: 'artikel', href: LINKS.artikel_villkor, solid: false }, secondary: TEL_SEC() };
  }
  // osaker
  if (subtyp === 'brf_batteri') return { primary: { labelKey: 'cta.tel_prata', kind: 'tel', href: LINKS.tel, solid: true }, secondary: SKV_SEC() };
  return { primary: { labelKey: 'cta.tel_osaker', kind: 'tel', href: LINKS.tel, solid: true }, secondary: SKV_SEC() };
}

function stegFor(cls, rows) {
  const { klass, subtyp } = cls;
  if (klass === 'ja') return [{ key: 's.ja.1' }, { key: 's.ja.2' }, { key: 's.ja.3' }];
  if (klass === 'ja_villkor') {
    const first = (cls.open && cls.open[0]) || (cls.begr && cls.begr[0]);
    let s1;
    if (first && first.id === 'skatt' && first.status === 'okand') s1 = { key: 's.ja.skatt_vet' };
    else if (first && first.status === 'antaget') s1 = { key: 's.ja.antaget', params: { villkor: fras(first) } };
    else if (first && (first.status === 'okand' || first.typ === 'villkor')) s1 = { key: 's.ja.villkor', params: { villkor: fras(first) } };
    else s1 = { key: 's.ja.1' };
    return [s1, { key: 's.ja.2' }, { key: 's.ja.3' }];
  }
  if (klass === 'troligen_inte') return [{ key: `s.tro.${subtyp}` }, { key: 's.tro.2' }];
  if (klass === 'nej') {
    if (subtyp === 'hyra') return [{ key: 's.nej_hyra.1' }, { key: 's.nej_hyra.2' }];
    if (subtyp === 'under18' || subtyp === 'skattskyldig') return [];
    if (subtyp === 'inte_an') return [{ key: 's.nej_inte_an.1' }, { key: 's.nej_inte_an.2' }];
    if (subtyp === 'inte_i_ar') return [{ key: 's.nej_inte_i_ar.1' }];
    if (subtyp === 'brf_gemensamt' || subtyp === 'brf_pplats_hyrd') return [{ key: 's.nej.brf' }, { key: 's.nej.artikel' }];
    if (subtyp === 'ager' || subtyp === 'barn' || subtyp === 'sarbo') return [{ key: 's.nej.ager' }, { key: 's.nej.artikel' }];
    return [{ key: 's.nej.artikel' }];
  }
  return [{ key: 's.osaker.1' }, { key: 's.osaker.2' }];
}

function metodFor(mode, eff, cls) {
  if (mode === 'rot') return ['metod.rot.1', 'metod.rot.2', 'metod.rot.3', 'metod.rot.4', 'metod.kontrollerad'];
  const m = ['metod.gt.1', 'metod.gt.2', 'metod.gt.3', 'metod.gt.4', 'metod.gt.5'];
  if (eff.lage === 'batteri') m.push(cls.subtyp === 'batteri_utan_sol' ? 'metod.gt.batteri_utan_sol' : 'metod.gt.batteri');
  if (eff.lage === 'sol') m.push('metod.gt.sol');
  m.push('metod.gt.8', 'metod.kontrollerad');
  return m;
}

// ---------- ROT ----------

function evaluateRot(state, eff, touched) {
  const isT = (id) => touched.has(id);
  const m = BOENDE_ROT[eff.boende] || BOENDE_ROT.villa;
  const smahus = m.bostadstyp === 'smahus';
  const brf = m.bostadstyp === 'bostadsratt';
  const raw = beraknaRot(toEngineInput('rot', state));
  const punkt = eff.arbete_kr !== null || isT('arbete');
  let rawMin = null; let rawMax = null;
  if (!eff.belopp_tomt && !punkt) {
    rawMin = beraknaRot(toEngineInput('rot', state, { arbeteAndel: eff.arbete_andel - GAP_DEFAULTS.INTERVALL_PP }));
    rawMax = beraknaRot(toEngineInput('rot', state, { arbeteAndel: eff.arbete_andel + GAP_DEFAULTS.INTERVALL_PP }));
  }
  const band = eff.skatt_djup ? taxBand('rot', state) : null;
  const fl = new Set(raw.flaggor);

  // skatt status (ryms_inte for the "lag" chip without deep-dive, per task; deep-dive overrides the chip)
  let skattStatus;
  if (raw.verdict === 'nej') skattStatus = 'ej_relevant';
  else if (eff.skatt_djup) skattStatus = raw.skatt_racker;
  else skattStatus = eff.skatt === 'lag' ? 'ryms_inte' : 'ej_bedomd';

  // ---- villkor rows, question order ----
  const rows = [];
  // boende
  if (eff.boende === 'hyra') rows.push(row('boende', 'boende', 'stopp', 'stopp', 'v.rot.hyresratt'));
  else if (eff.bor_detalj === 'uthyrd') rows.push(row('bor_detalj', 'bor_detalj', 'stopp', 'stopp', 'v.rot.uthyrd'));
  else if (eff.bor_detalj === 'barn') rows.push(row('bor_detalj', 'bor_detalj', 'stopp', 'stopp', 'v.rot.barn'));
  else if (eff.bor_detalj === 'sarbo') rows.push(row('bor_detalj', 'bor_detalj', 'stopp', 'stopp', 'v.rot.sarbo'));
  else {
    if (eff.boende === 'villa') rows.push(row('boende', 'boende', isT('boende') ? 'ok' : 'antaget', 'grind', 'v.rot.ager_villa', {}, 'v.rot.ager_villa.fras'));
    else if (eff.boende === 'brf') rows.push(row('boende', 'boende', isT('boende') ? 'ok' : 'antaget', 'grind', 'v.rot.ager_brf', {}, 'v.rot.ager_brf.fras'));
    else if (eff.boende === 'fritid') rows.push(row('boende', 'boende', isT('boende') ? 'ok' : 'antaget', 'grind', 'v.rot.fritid', {}, 'v.rot.fritid.fras'));
    else if (eff.boende === 'foralder') rows.push(row('boende', 'boende', 'varning', 'villkor', 'v.rot.foraldrar', {}, 'v.rot.foraldrar.fras'));
    if (eff.bor_detalj === 'nykopt') rows.push(row('bor_detalj', 'bor_detalj', 'varning', 'villkor', 'v.rot.nykopt', {}, 'v.rot.nykopt.fras'));
  }
  // plats (brf)
  if (brf && eff.boende !== 'hyra') {
    if (eff.plats === 'utanfor') rows.push(row('plats', 'plats', 'stopp', 'stopp', 'v.rot.utanfor'));
    else if (eff.plats === 'vet_inte') rows.push(row('plats', 'plats', 'okand', 'grind', 'v.rot.plats_okand', {}, 'v.rot.plats_okand.fras'));
    else rows.push(row('plats', 'plats', isT('plats') ? 'varning' : 'antaget', 'villkor', 'v.rot.brf_stadgar', {}, 'v.rot.brf_stadgar.fras'));
  }
  // vardear / arbetstyp (smahus)
  if (smahus) {
    const v = eff.vardear;
    if (v === '2026_ej_fardig') rows.push(row('vardear', 'vardear', 'stopp', 'stopp', 'v.rot.ej_fardigt'));
    else if (v === '2021_2025') {
      if (eff.arbetstyp === 'reparation') rows.push(row('vardear', 'arbetstyp', 'varning', 'villkor', 'v.rot.femar_reparation', {}, 'v.rot.femar_reparation.fras'));
      else if (eff.arbetstyp === 'ombyggnad') rows.push(row('vardear', 'arbetstyp', 'varning', 'troligen', 'v.rot.femar_ombyggnad'));
      else rows.push(row('vardear', 'arbetstyp', 'okand', 'grind', 'v.rot.femar_arbetstyp_okand', {}, 'v.rot.femar_arbetstyp_okand.fras'));
    } else if (v === 'vet_inte') {
      if (eff.arbetstyp === 'reparation') rows.push(row('vardear', 'arbetstyp', 'ok', 'info', 'v.rot.reparation_oavsett_alder'));
      else rows.push(row('vardear', 'vardear', 'okand', 'grind', 'v.rot.vardear_okant', {}, 'v.rot.vardear_okant.fras'));
    } else rows.push(row('vardear', 'vardear', isT('vardear') ? 'ok' : 'antaget', 'grind', 'v.rot.aldre_fem_ar', {}, 'v.rot.aldre_fem_ar.fras'));
  }
  // skatt
  const sk = skattRows('rot', eff, raw, band, skattStatus, isT);
  rows.push(...sk.rows);
  // agare
  rows.push(...agareRow(eff, raw, isT));
  // pott / tak
  const brutto = raw.avdrag_brutto_kr;
  const anvant = (Number(eff.anvant_rot) || 0) + (Number(eff.anvant_rut) || 0);
  const takKr = P.ROT_TAK * eff.agare;
  if (raw.verdict !== 'nej') {
    if (raw.pott_kvar_kr === 0) rows.push(row('pott', 'anvant_rot', 'stopp', 'stopp', 'v.pott.slut'));
    else if (anvant > 0 && raw.pott_kvar_kr < brutto) rows.push(row('pott', 'anvant_rot', 'varning', 'begransning', 'v.pott.delvis', { kvar: kr100(raw.pott_kvar_kr), brutto: kr100(brutto) }, 'v.pott.delvis.fras'));
    else if (anvant > 0) rows.push(row('pott', 'anvant_rot', 'ok', 'info', 'v.pott.kvar', { kvar: kr100(raw.pott_kvar_kr) }));
    else if (fl.has('taket_begransar')) rows.push(row('tak', 'belopp', 'varning', 'begransning', 'v.tak', { tak: formatKr(P.ROT_TAK) }, 'v.tak.fras'));
    if (fl.has('gt_efter_rot_racker_inte')) rows.push(row('gt_planerad', 'gt_planerad_kr', 'varning', 'info', 'v.gt_efter_rot', { risk: kr100(raw.skatt[0].gt_aterbetalningsrisk_kr) }));
  }
  // under 18 (prefilled row) + process facts
  rows.push(eff.under18 ? row('under18', 'under18', 'stopp', 'stopp', 'v.under18.stopp') : row('under18', 'under18', 'ok', 'info', 'v.under18.ok'));
  rows.push(row('fskatt', null, 'skoter_vi', 'skoter_vi', 'v.fskatt'));

  // ---- class ----
  let hard = null; let troligen = null;
  if (raw.verdict === 'nej') hard = NEJ_SUBTYP_ROT[raw.flaggor.find((f) => f in NEJ_SUBTYP_ROT)] || 'ager';
  else if (raw.pott_kvar_kr === 0) hard = 'inte_i_ar';
  else if (raw.verdict === 'troligen_ej') troligen = 'femarsregeln';
  else if (skattStatus === 'ryms_inte') troligen = 'skatt_lag';
  const cls = classify(rows, eff, { hard, troligen, osakerFast: null });
  const { klass, subtyp } = cls;

  // ---- belopp ----
  let belopp;
  const attBetala = raw.att_betala_kr;
  if (klass === 'nej' && subtyp === 'inte_i_ar') belopp = { state: 'noll', avdrag_kr: 0, att_betala_kr: attBetala, tak_kr: takKr, rubrikKey: 'b.rubrik.noll', bas_textKey: 'b.noll', params: {} };
  else if (klass === 'nej' || klass === 'troligen_inte') belopp = { state: 'dold', avdrag_kr: 0, att_betala_kr: attBetala, tak_kr: takKr, rubrikKey: null, bas_textKey: null, params: {} };
  else if (klass === 'osaker' || eff.belopp_tomt) belopp = { state: 'tak', avdrag_kr: null, att_betala_kr: null, tak_kr: takKr, rubrikKey: 'b.rubrik.tak', bas_textKey: klass === 'osaker' ? 'b.tak.osaker' : 'b.tak', params: { tak: formatKr(takKr) } };
  else {
    const b = {
      state: rawMin ? 'intervall' : 'punkt', avdrag_kr: raw.avdrag_kr, avdrag_brutto_kr: brutto, att_betala_kr: attBetala,
      arbetskostnad_kr: eff.arbetskostnad_kr, belopp_kr: eff.belopp, tak_kr: takKr,
      tak_slar_i: fl.has('taket_begransar'), pott_kvar_kr: raw.pott_kvar_kr,
      params: { avdrag: kr100(raw.avdrag_kr), att_betala: kr100(attBetala), tak: formatKr(takKr), belopp: formatKr(eff.belopp), andel: eff.arbete_andel },
    };
    b.params.arbete = formatKr(b.arbetskostnad_kr);
    if (rawMin) {
      Object.assign(b, { avdrag_min_kr: rawMin.avdrag_kr, avdrag_max_kr: rawMax.avdrag_kr, att_betala_min_kr: rawMax.att_betala_kr, att_betala_max_kr: rawMin.att_betala_kr });
      Object.assign(b.params, { min: kr100(rawMin.avdrag_kr), max: kr100(rawMax.avdrag_kr), att_betala_min: kr100(rawMax.att_betala_kr), att_betala_max: kr100(rawMin.att_betala_kr) });
      b.rubrikKey = 'b.rubrik.intervall'; b.bas_textKey = 'b.intervall.rot';
    } else { b.rubrikKey = 'b.rubrik.punkt'; b.bas_textKey = 'b.punkt.rot'; }
    if (eff.skatt_djup && skattStatus === 'ryms_delvis') {
      const risk = Math.min(raw.avdrag_kr, raw.aterbetalningsrisk_kr);
      Object.assign(b, { state: 'begransad_skatt', skatt_tacker_kr: raw.avdrag_kr - risk, aterbetalningsrisk_kr: risk, rubrikKey: 'b.rubrik.begransad_skatt', bas_textKey: 'b.begransad_skatt' });
      Object.assign(b.params, { tacker: kr100(raw.avdrag_kr - risk), risk: kr100(risk) });
    } else if (anvant > 0 && raw.pott_kvar_kr < brutto) {
      Object.assign(b, { state: 'begransad_pott', rubrikKey: 'b.rubrik.begransad_pott', bas_textKey: 'b.begransad_pott' });
      Object.assign(b.params, { kvar: kr100(raw.pott_kvar_kr), brutto: kr100(brutto) });
    }
    belopp = b;
  }

  return finish('rot', eff, cls, rows, belopp, sk.block, raw, { rawMin, rawMax });
}

// ---------- GT ----------

function evaluateGt(state, eff, touched) {
  const isT = (id) => touched.has(id);
  const m = BOENDE_GT[eff.boende] || BOENDE_GT.villa;
  const brf = m.bostad === 'bostadsratt';
  const inp = toEngineInput('gt', state);
  const raw = beraknaGt(inp);
  raw._skatt_tillganglig_kr = inp.skatt_tillganglig_kr;
  raw._rot_rut = inp.rot_rut_anvant_kr;
  const band = eff.skatt_djup ? taxBand('gt', state) : null;
  const fl = new Set(raw.flaggor);
  const isStopp = raw.verdict.startsWith('ej_');

  // sol + batteri samtidigt (lage sol): second engine run, same pott (two rows, one cap)
  let batt = null;
  if (eff.lage === 'sol' && Number(eff.batteri_samtidigt_kr) > 0 && !isStopp) {
    const inp2 = { ...inp, lage: 'gt_batteri', solceller: 'samtidigt', pris_total_kr: Number(eff.batteri_samtidigt_kr), tillagg_elcentral_kr: 0,
      gt_anvant_kr: inp.gt_anvant_kr.map((x, i) => (i === 0 ? x + raw.avdrag_kr : x)) };
    // the tax that is left after the solar row
    inp2.rot_rut_anvant_kr = inp.rot_rut_anvant_kr.map((x, i) => (x === null ? null : (i === 0 ? x + raw.avdrag_kr : x)));
    batt = beraknaGt(inp2);
  }
  const avdragTot = raw.avdrag_kr + (batt ? batt.avdrag_kr : 0);
  const bruttoTot = raw.avdrag_brutto_kr + (batt ? batt.avdrag_brutto_kr : 0);
  const attBetala = raw.att_betala_kr + (batt ? batt.att_betala_kr : 0);
  const risk = raw.aterbetalningsrisk_kr + (batt ? batt.aterbetalningsrisk_kr : 0);
  const efterSkatt = avdragTot - risk;

  let skattStatus;
  if (isStopp) skattStatus = 'ej_relevant';
  else if (eff.skatt_djup && raw.skatt_racker !== 'okant' && raw.skatt_racker !== 'rot_modellen') skattStatus = risk === 0 ? 'ryms' : (efterSkatt > 0 ? 'ryms_delvis' : 'ryms_inte');
  else if (raw.skatt_racker === 'rot_modellen') skattStatus = 'ej_bedomd';
  else skattStatus = eff.skatt === 'lag' ? 'ryms_inte' : 'ej_bedomd';
  // let the shared skatt block see the household totals
  raw._tot = { avdrag: avdragTot, efter: efterSkatt, risk };

  // ---- rows ----
  const rows = [];
  if (eff.boende === 'hyra') rows.push(row('boende', 'boende', 'stopp', 'stopp', 'v.gt.hyresratt'));
  else if (eff.anvandning === 'annan') rows.push(row('anvandning', 'anvandning', 'stopp', 'stopp', 'v.gt.annan'));
  else {
    if (eff.boende === 'villa') rows.push(row('boende', 'boende', isT('boende') ? 'ok' : 'antaget', 'grind', 'v.gt.ager_villa', {}, 'v.gt.ager_villa.fras'));
    else if (eff.boende === 'brf') rows.push(row('boende', 'boende', isT('boende') ? 'ok' : 'antaget', 'grind', 'v.gt.ager_brf', {}, 'v.gt.ager_brf.fras'));
    else if (eff.boende === 'fritid') rows.push(row('boende', 'boende', isT('boende') ? 'ok' : 'antaget', 'grind', 'v.gt.fritid', {}, 'v.gt.fritid.fras'));
    if (eff.boende === 'foralder' || eff.anvandning === 'foralder') rows.push(row(eff.boende === 'foralder' ? 'boende' : 'anvandning', eff.boende === 'foralder' ? 'boende' : 'anvandning', 'varning', 'villkor', 'v.gt.foralder', {}, 'v.gt.foralder.fras'));
  }
  if (eff.lage === 'laddbox' && brf && eff.boende !== 'hyra') {
    if (eff.pplats === 'foljer_bostadsratten') rows.push(row('pplats', 'pplats', 'varning', 'villkor', 'v.gt.pplats_ok', {}, 'v.gt.pplats_ok.fras'));
    else if (eff.pplats === 'hyrd_uppsagningsbar') rows.push(row('pplats', 'pplats', 'stopp', 'stopp', 'v.gt.pplats_hyrd'));
    else if (eff.pplats === 'gemensamt') rows.push(row('pplats', 'pplats', 'stopp', 'stopp', 'v.gt.pplats_gemensamt'));
    else rows.push(row('pplats', 'pplats', 'okand', 'grind', 'v.gt.pplats_okand', {}, 'v.gt.pplats_okand.fras'));
  }
  if (eff.lage === 'batteri' && eff.boende !== 'hyra') {
    if (brf) rows.push(row('sol', 'sol', 'okand', 'grind', 'v.gt.brf_batteri'));
    else if (eff.sol === 'har') rows.push(row('sol', 'sol', isT('sol') ? 'ok' : 'antaget', 'grind', 'v.gt.sol_har', {}, 'v.gt.sol_har.fras'));
    else if (eff.sol === 'samtidigt') rows.push(row('sol', 'sol', 'ok', 'info', 'v.gt.sol_samtidigt'));
    else if (eff.sol === 'nej') rows.push(row('sol', 'sol', 'varning', 'troligen', 'v.gt.sol_nej'));
    else rows.push(row('sol', 'sol', 'okand', 'grind', 'v.gt.sol_okand', {}, 'v.gt.sol_okand.fras'));
  }
  const sk = skattRows('gt', eff, raw, band, skattStatus, isT);
  rows.push(...sk.rows);
  if (eff.agare === 2) {
    if (eff.skatt_djup && skattStatus !== 'ej_relevant' && (isT('manadsinkomst_2') || isT('inkomsttyp_2'))) rows.push(row('agare', 'agare', skattStatus === 'ryms' ? 'ok' : 'varning', skattStatus === 'ryms' ? 'info' : 'begransning', skattStatus === 'ryms' ? 'v.agare.bada_skatt' : 'v.agare.omfordela', {}, 'v.agare.bada_skatt.fras'));
    else rows.push(row('agare', 'agare', 'antaget', 'grind', 'v.agare.bada_skatt', {}, 'v.agare.bada_skatt.fras'));
  }
  if (!isStopp) {
    if (eff.material === 'sjalv') rows.push(row('material', 'material', 'varning', 'begransning', 'v.gt.material_sjalv', {}, 'v.gt.material_sjalv.fras'));
    else if (eff.material === 'leasing') rows.push(row('material', 'material', 'varning', 'begransning', 'v.gt.leasing', {}, 'v.gt.leasing.fras'));
    else rows.push(row('material', 'material', 'skoter_vi', 'skoter_vi', 'v.gt.material_ok'));
    if (fl.has('elcentral_ej_gt_kan_vara_rot')) rows.push(row('elcentral', 'tillagg_elcentral_kr', 'varning', 'info', 'v.gt.elcentral'));
  }
  const takKr = P.GT_TAK * eff.agare;
  const anvantGt = Number(eff.anvant_gt) || 0;
  if (!isStopp && raw.verdict !== 'batteri_utan_sol_rot') {
    if (raw.tak_kvar_kr === 0) rows.push(row('pott', 'anvant_gt', 'stopp', 'stopp', 'v.gt.pott.slut'));
    else if (anvantGt > 0 && raw.tak_kvar_kr < bruttoTot) rows.push(row('pott', 'anvant_gt', 'varning', 'begransning', 'v.gt.pott.delvis', { kvar: kr100(raw.tak_kvar_kr), brutto: kr100(bruttoTot) }, 'v.gt.pott.delvis.fras'));
    else if (anvantGt > 0) rows.push(row('pott', 'anvant_gt', 'ok', 'info', 'v.gt.pott.kvar', { kvar: kr100(raw.tak_kvar_kr) }));
    else if (bruttoTot > raw.tak_kvar_kr) rows.push(row('tak', 'belopp', 'varning', 'begransning', 'v.gt.tak', { tak: formatKr(P.GT_TAK) }, 'v.gt.tak.fras'));
  }
  rows.push(eff.under18 ? row('under18', 'under18', 'stopp', 'stopp', 'v.under18.stopp') : row('under18', 'under18', 'ok', 'info', 'v.under18.ok'));
  rows.push(row('fskatt', null, 'skoter_vi', 'skoter_vi', 'v.fskatt'));

  // ---- class ----
  let hard = null; let troligen = null; let osakerFast = null;
  if (isStopp) hard = NEJ_SUBTYP_GT[raw.verdict];
  else if (raw.tak_kvar_kr === 0) hard = 'inte_i_ar';
  else if (raw.verdict === 'batteri_utan_sol_rot') troligen = 'batteri_utan_sol';
  else if (skattStatus === 'ryms_inte') troligen = 'skatt_lag';
  else if (fl.has('brf_batteri_kraver_egen_produktion')) osakerFast = 'brf_batteri';
  const cls = classify(rows, eff, { hard, troligen, osakerFast });
  const { klass, subtyp } = cls;

  // ---- belopp ----
  let belopp;
  const sats = Math.round(P.GT_RATE[inp.lage] * 100);
  if (klass === 'nej' && subtyp === 'inte_i_ar') belopp = { state: 'noll', avdrag_kr: 0, att_betala_kr: attBetala, tak_kr: takKr, rubrikKey: 'b.rubrik.noll', bas_textKey: 'b.noll', params: {} };
  else if (klass === 'nej' || (klass === 'troligen_inte' && subtyp !== 'batteri_utan_sol')) belopp = { state: 'dold', avdrag_kr: 0, att_betala_kr: attBetala, tak_kr: takKr, rubrikKey: null, bas_textKey: null, params: {} };
  else if (klass === 'troligen_inte') {
    const rot = eff.arbete_kr !== null && eff.arbete_kr > 0 ? raw.rot_fallback_kr : null;
    belopp = { state: 'alt_rot', avdrag_kr: 0, rot_avdrag_kr: rot, arbetskostnad_kr: eff.arbete_kr, att_betala_kr: rot !== null ? attBetala : null, tak_kr: P.ROT_TAK * eff.agare,
      rubrikKey: rot !== null ? 'b.rubrik.alt_rot' : 'b.rubrik.alt_rot.utan_belopp', bas_textKey: rot !== null ? 'b.alt_rot' : 'b.alt_rot.utan_belopp',
      params: { rot: rot !== null ? kr100(rot) : '', att_betala: rot !== null ? kr100(attBetala) : '' } };
  } else if (klass === 'osaker' || eff.belopp_tomt) belopp = { state: 'tak', avdrag_kr: null, att_betala_kr: null, tak_kr: takKr, rubrikKey: 'b.rubrik.tak', bas_textKey: klass === 'osaker' ? 'b.tak.osaker' : 'b.tak', params: { tak: formatKr(takKr) } };
  else {
    const underlagKr = inp.material_fran_installator && !inp.leasing ? eff.belopp : (eff.arbete_kr ?? 0);
    const b = {
      state: 'punkt', avdrag_kr: avdragTot, avdrag_brutto_kr: bruttoTot, att_betala_kr: attBetala, belopp_kr: eff.belopp, underlag_kr: underlagKr, sats,
      tak_kr: takKr, tak_slar_i: bruttoTot > raw.tak_kvar_kr, pott_kvar_kr: raw.tak_kvar_kr,
      rader: [{ typ: eff.lage, sats, underlag_kr: underlagKr, avdrag_kr: raw.avdrag_kr }],
      rubrikKey: 'b.rubrik.punkt',
      bas_textKey: eff.fastpris ? 'b.punkt.gt.schablon' : (inp.material_fran_installator && !inp.leasing ? 'b.punkt.gt' : 'b.punkt.gt.arbete'),
      params: { avdrag: kr100(avdragTot), att_betala: kr100(attBetala), tak: formatKr(takKr), belopp: formatKr(eff.belopp), sats, underlag: formatKr(underlagKr) },
    };
    if (batt) {
      b.rader.push({ typ: 'batteri', sats: 50, underlag_kr: Number(eff.batteri_samtidigt_kr), avdrag_kr: batt.avdrag_kr });
      Object.assign(b.params, { sol: kr100(raw.avdrag_kr), batteri: kr100(batt.avdrag_kr), batteri_underlag: formatKr(Number(eff.batteri_samtidigt_kr)) });
      b.bas_textKey = 'b.punkt.gt.tva_rader';
    }
    if (eff.skatt_djup && skattStatus === 'ryms_delvis') {
      Object.assign(b, { state: 'begransad_skatt', skatt_tacker_kr: efterSkatt, aterbetalningsrisk_kr: risk, rubrikKey: 'b.rubrik.begransad_skatt', bas_textKey: 'b.begransad_skatt' });
      Object.assign(b.params, { tacker: kr100(efterSkatt), risk: kr100(risk) });
    } else if (anvantGt > 0 && raw.tak_kvar_kr < bruttoTot) {
      Object.assign(b, { state: 'begransad_pott', rubrikKey: 'b.rubrik.begransad_pott', bas_textKey: 'b.begransad_pott' });
      Object.assign(b.params, { kvar: kr100(raw.tak_kvar_kr), brutto: kr100(bruttoTot) });
    }
    belopp = b;
  }
  const rawOut = { ...raw };
  delete rawOut._skatt_tillganglig_kr; delete rawOut._rot_rut; delete rawOut._tot;
  if (batt) rawOut.batteri_samtidigt = batt;
  return finish('gt', eff, cls, rows, belopp, sk.block, rawOut, {});
}

function finish(mode, eff, cls, rows, belopp, skattBlock, raw, extra) {
  const { klass, subtyp } = cls;
  const headline = headlineFor(mode, cls, rows);
  const villkor = rows.map(({ id, fraga, status, typ, textKey, params, frasKey }) => ({ id, fraga, status, typ, textKey, params, frasKey }));
  const counts = {
    antagna: rows.filter((r) => r.status === 'antaget').length,
    okanda: rows.filter((r) => r.status === 'okand').length,
    villkor: rows.filter((r) => r.status === 'varning' && r.typ === 'villkor').length,
    begransningar: rows.filter((r) => r.status === 'varning' && r.typ === 'begransning').length,
    stopp: rows.filter((r) => r.status === 'stopp').length,
  };
  const skatt = { ...skattBlock };
  if (klass === 'nej') { skatt.status = 'ej_relevant'; skatt.textKey = null; }
  return {
    mode, lage: mode === 'gt' ? eff.lage : null, klass, subtyp, headline,
    eyebrowKey: mode === 'rot' ? 'eyebrow.rot' : 'eyebrow.gt',
    ram: ramFor(cls, rows),
    villkor, counts, belopp, skatt,
    nasta_steg: stegFor(cls, rows),
    cta: ctaFor(mode, eff, cls, rows),
    metod: metodFor(mode, eff, cls),
    disclaimerKey: 'disclaimer',
    flaggor: raw.flaggor,
    raw: mode === 'rot' ? { rot: raw, rot_min: extra.rawMin || null, rot_max: extra.rawMax || null } : { gt: raw },
  };
}

/** Same result, with `text` next to every key (headline.text, villkor[].text, belopp.rubrik/bas_text, ...). */
export function resolveTexts(result) {
  const r = JSON.parse(JSON.stringify(result));
  r.headline.text = t(r.headline.key, r.headline.params);
  r.eyebrow = t(r.eyebrowKey);
  r.ram.text = t(r.ram.key, r.ram.params);
  r.disclaimer = t(r.disclaimerKey);
  for (const v of r.villkor) { v.text = t(v.textKey, v.params); v.fras = v.frasKey ? t(v.frasKey, v.params) : null; }
  r.belopp.rubrik = r.belopp.rubrikKey ? t(r.belopp.rubrikKey, r.belopp.params) : '';
  r.belopp.bas_text = r.belopp.bas_textKey ? t(r.belopp.bas_textKey, r.belopp.params) : '';
  if (r.belopp.params && r.belopp.params.att_betala) r.belopp.att_betala_text = r.belopp.state === 'intervall' ? t('b.att_betala.intervall', { min: r.belopp.params.att_betala_min, max: r.belopp.params.att_betala_max }) : t('b.att_betala', r.belopp.params);
  r.skatt.text = r.skatt.textKey ? t(r.skatt.textKey, r.skatt.params) : '';
  r.skatt.hedge = t(r.skatt.hedgeKey);
  r.nasta_steg = r.nasta_steg.map((s) => ({ ...s, text: t(s.key, s.params) }));
  if (r.cta.primary) r.cta.primary.label = r.cta.primary.labelKey ? t(r.cta.primary.labelKey, r.cta.primary.params) : '';
  if (r.cta.secondary) r.cta.secondary.label = r.cta.secondary.labelKey ? t(r.cta.secondary.labelKey, r.cta.secondary.params) : '';
  r.metod_text = r.metod.map((k) => t(k));
  return r;
}

// ---------------------------------------------------------------------------------------------------
// Share-link codec (UX §7.1). Whitelist: m, l, b, y, yy, p, a, ak, a2, s, o, u, ur, src. NEVER income,
// tax amounts, ränteutgifter, kommunalskatt or the deep-dive toggle. Invalid values are ignored silently.
// ---------------------------------------------------------------------------------------------------
const DOM = Object.freeze({
  m: ['rot', 'gt'], l: ['laddbox', 'batteri', 'sol'], b: ['villa', 'brf', 'fritid', 'hyra', 'foralder'],
  y: ['t2011', '2012_2020', '2021_2025', '2026_ej_fardig', 'vet_inte', 'ja', 'nej', 'vet'],
  p: ['ja', 'sam', 'nej'], s: ['lon', 'pension', 'lag', 'vet'], o: ['1', '2'], src: ['salj', 'artikel'],
});
const SOL_ENC = Object.freeze({ har: 'ja', samtidigt: 'sam', nej: 'nej' });
const SOL_DEC = Object.freeze({ ja: 'har', sam: 'samtidigt', nej: 'nej' });
const KR_MAX = 1_000_000;

function intParam(v) { return /^\d{1,7}$/.test(v) && Number(v) <= KR_MAX ? Number(v) : null; }

/** encodeState(mode, uiState, { src }) -> query string without "?". Only values that differ from the default. */
export function encodeState(mode, uiState = {}, opts = {}) {
  assertMode(mode);
  const s = withDefaults(mode, uiState);
  const d = defaultState(mode);
  const q = new URLSearchParams();
  q.set('m', mode);
  const put = (k, v) => { if (v !== null && v !== undefined && v !== '') q.set(k, String(v)); };
  const kr = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= KR_MAX ? Math.round(v) : null);
  if (mode === 'gt') {
    if (DOM.l.includes(s.lage)) put('l', s.lage);
    if (s.boende !== d.boende && DOM.b.includes(s.boende)) put('b', s.boende);
    if (s.lage === 'batteri' && s.sol !== d.sol && SOL_ENC[s.sol]) put('p', SOL_ENC[s.sol]);
    if (s.belopp !== null && s.belopp !== undefined) put('a', kr(Number(s.belopp)));
    if (s.lage === 'sol' && Number(s.batteri_samtidigt_kr) > 0) put('a2', kr(Number(s.batteri_samtidigt_kr)));
    if (s.skatt !== d.skatt && DOM.s.includes(s.skatt)) put('s', s.skatt);
    if (Number(s.agare) === 2) put('o', '2');
    if (Number(s.anvant_gt) > 0) put('u', kr(Number(s.anvant_gt)));
  } else {
    if (s.boende !== d.boende && DOM.b.includes(s.boende)) put('b', s.boende);
    if (s.vardear !== d.vardear && DOM.y.includes(s.vardear)) put('y', s.vardear);
    if (s.belopp !== null && s.belopp !== undefined) put('a', kr(Number(s.belopp)));
    if (s.arbete_kr !== null && s.arbete_kr !== undefined) put('ak', kr(Number(s.arbete_kr)));
    if (s.skatt !== d.skatt && DOM.s.includes(s.skatt)) put('s', s.skatt);
    if (Number(s.agare) === 2) put('o', '2');
    if (Number(s.anvant_rot) > 0) put('u', kr(Number(s.anvant_rot)));
    if (Number(s.anvant_rut) > 0) put('ur', kr(Number(s.anvant_rut)));
  }
  if (opts.src && DOM.src.includes(opts.src)) put('src', opts.src);
  return q.toString();
}

/**
 * decodeState(searchString) -> { mode, state, prefilled, src }. mode is null when `m` is missing/invalid
 * (caller uses defaults). Every decoded answer is "antaget" (not touched). Legacy `y=ja|nej|vet` (+ `yy`) from
 * UX §7.1 is mapped onto the vardear chips.
 */
export function decodeState(searchString = '') {
  const q = new URLSearchParams(String(searchString || '').replace(/^\?/, ''));
  const g = (k) => (q.has(k) ? q.get(k) : null);
  const mode = DOM.m.includes(g('m')) ? g('m') : null;
  const src = DOM.src.includes(g('src')) ? g('src') : null;
  const state = {};
  const prefilled = [];
  if (!mode) return { mode: null, state, prefilled, src };
  const set = (id, v) => { state[id] = v; prefilled.push(id); };
  const b = g('b'); if (DOM.b.includes(b)) set('boende', b);
  const s = g('s'); if (DOM.s.includes(s)) set('skatt', s);
  const o = g('o'); if (DOM.o.includes(o)) set('agare', Number(o));
  const a = g('a'); if (a !== null && intParam(a) !== null) set('belopp', intParam(a));
  const u = g('u');
  if (mode === 'gt') {
    const l = g('l'); if (DOM.l.includes(l)) set('lage', l);
    const p = g('p'); if (SOL_DEC[p]) set('sol', SOL_DEC[p]);
    const a2 = g('a2'); if (a2 !== null && intParam(a2) !== null) set('batteri_samtidigt_kr', intParam(a2));
    if (u !== null && intParam(u) !== null) set('anvant_gt', intParam(u));
  } else {
    const y = g('y');
    if (DOM.y.includes(y)) {
      let v = y;
      if (y === 'ja') v = 't2011';
      else if (y === 'vet') v = 'vet_inte';
      else if (y === 'nej') {
        const yy = g('yy');
        const year = /^\d{4}$/.test(yy || '') ? Number(yy) : null;
        if (year !== null && year >= 2019 && year <= 2026) v = year <= P.FEMARSREGEL_SISTA_VARDEAR ? '2012_2020' : (year >= 2026 ? '2026_ej_fardig' : '2021_2025');
        else v = '2021_2025';
      }
      set('vardear', v);
    }
    const ak = g('ak'); if (ak !== null && intParam(ak) !== null) set('arbete_kr', intParam(ak));
    if (u !== null && intParam(u) !== null) set('anvant_rot', intParam(u));
    const ur = g('ur'); if (ur !== null && intParam(ur) !== null) set('anvant_rut', intParam(ur));
  }
  return { mode, state, prefilled, src };
}

export { P as PARAMS };
