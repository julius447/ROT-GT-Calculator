/* Delad logik för alla versioner av kalkylatorn. Tre svar in, ett besked ut. Skattemodellen är samma som
   replikerar Skatteverkets e-tjänst (logik/engine.js, validerad ±1 kr). Inget lagras, inget skickas. */
import { skatteutrymme, PARAMS_2026 as P } from '../logik/engine.js';

export const TAK = P.ROT_TAK;   // 50 000 kr per person och år, samma för ROT och grön teknik

/** Formaterar kronor med hårda mellanslag: 50 000 kr */
export function kr(n) {
  return new Intl.NumberFormat('sv-SE').format(n).replace(/[\s  ]/g, ' ') + ' kr';
}

/** Plockar siffrorna ur ett fält: "300 000" -> 300000 */
/* "300 000,50 kr" -> 300000 (öretal med komma eller punkt stryks, "300.000" behålls som tusental), högst nio siffror */
export function siffra(str) {
  return Number(String(str ?? '').replace(/[,.]\d{1,2}(?!\d)\s*(kr)?\s*$/i, '').replace(/[^\d]/g, '').slice(0, 9)) || 0;
}

/** Formaterar fältets värde med mellanslag medan man skriver */
export function formatFalt(str) {
  const n = siffra(str);
  return n ? new Intl.NumberFormat('sv-SE').format(n).replace(/[\s  ]/g, ' ') : '';
}

/**
 * berakna({ mode: 'rot'|'gt', ager: true|false, aldre: true|false, typ: 'lon'|'pension', inkomst: number })
 * -> { status: 'stopp'|'tak'|'belopp', belopp: number|null, prefix: ''|'upp till'|'ca', text: string, not: string|null }
 *   status 'stopp'  = äger inte: inget avdrag, texten är beskedet (rött X)
 *   status 'tak'    = inkomst saknas: det lagliga taket ("upp till 50 000 kr")
 *   status 'belopp' = räknat på inkomsten ("ca 31 000 kr" eller "50 000 kr")
 *   not             = kort rad under talet när huset är yngre än fem år (bara ROT), annars null
 */
export function berakna({ mode = 'rot', ager = true, aldre = true, typ = 'lon', inkomst = 0 } = {}) {
  const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
  if (!ager) {
    return { status: 'stopp', belopp: null, prefix: '', text: `Eftersom du inte äger din bostad har du inte rätt till ${namn}.`, not: null };
  }
  const not = (mode === 'rot' && !aldre) ? 'Yngre än fem år: ROT gäller reparation och underhåll, inte om- och tillbyggnad.' : null;
  if (!inkomst) {
    return { status: 'tak', belopp: TAK, prefix: 'upp till', text: kr(TAK), not };
  }
  const r = skatteutrymme({
    lon_ar: typ === 'lon' ? inkomst : 0,
    pension_ar: typ === 'pension' ? inkomst : 0,
    ar_66_plus: typ === 'pension',
    ks: P.KS_SNITT, taxeringsvarde: 0, ranteutgifter: 0,
  });
  const utrymme = Math.max(0, r.utrymme_rot_rut_gt);
  const t = Math.min(TAK, utrymme);
  if (t >= TAK) return { status: 'belopp', belopp: TAK, prefix: '', text: kr(TAK), not };
  const avrundat = Math.round(t / 1000) * 1000;
  return { status: 'belopp', belopp: avrundat, prefix: 'ca', text: kr(avrundat), not };
}

/* ---------- Hushåll: flera personer, redan använt avdrag, ålder, bolåneränta (ägarbeslut 2026-09-14, research 07-10 2026-09-16) ---------- */
const ANTAL_ORD = { 2: 'två', 3: 'tre', 4: 'fyra' };
export const MAX_PERSONER = 4;

/** Lön och pension ur svaren. "Båda": fältet är hela inkomsten och "Varav pension" är pensionsdelen (research/12 Major 2). */
function inkomstDelar(p) {
  const inkomst = Math.max(0, p.inkomst || 0);
  if (p.typ === 'pension') return { lon: 0, pension: inkomst };
  if (p.typ === 'bada') {
    const pension = Math.min(inkomst || Math.max(0, p.pension || 0), Math.max(0, p.pension || 0));
    return inkomst ? { lon: inkomst - pension, pension } : { lon: 0, pension };   /* bara pensionen ifylld: räkna på den (research/12 Minor 1) */
  }
  return { lon: inkomst, pension: 0 };
}

/** Utrymmet för en person vid en given kommunalskatt (delad med ålder från frågan, inte från inkomsttypen: research/10 F1) */
function utrymmeFor(p, ks) {
  const delar = inkomstDelar(p);
  const r = skatteutrymme({
    lon_ar: delar.lon,
    pension_ar: delar.pension,
    ar_66_plus: p.alder === '66+',
    ks, taxeringsvarde: 0,
    ranteutgifter: Math.max(0, p.ranta || 0),        /* underskott av kapital ligger före ROT i 67 kap. 2 § (research/10 F2) */
  });
  return Math.max(0, r.utrymme_rot_rut_gt);
}

/**
 * beraknaHushall({ mode, ager, aldre, personer: [{ typ, inkomst, alder: 'u18'|'18-65'|'66+', ranta, anvant, gtAnvant }] })
 * -> { status: 'stopp'|'tak'|'belopp', belopp, prefix, text, not, per, antal }
 *   ager/aldre som i berakna(); person 1:s ålder 'u18' = fyller 18 först nästa år -> stopp (67 kap. 11 §).
 *   Per person (67 kap. 19 § tak + 67 kap. 2 § pott): rest = min(50 000, utrymme) − det som redan använts i år av
 *   SAMMA post (ROT och RUT i ROT-läget, grön teknik i grön teknik-läget). Ägarbeslut 2026-09-16: posterna hålls isär
 *   och syns inte i varandra; att ROT/RUT ligger före grön teknik i 67 kap. 2 § är därför en känd förenkling
 *   (uppskattning, research/10 F3).
 *   Summan är hushållets. "upp till" så snart någon inkomst saknas, "ca" så snart någon är räknad under taket eller när
 *   "50 000" inte håller vid landets lägsta kommunalskatt (research/10 F6), annars exakt.
 */
export function beraknaHushall({ mode = 'rot', ager = true, aldre = true, myndig, personer = [{}] } = {}) {
  const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
  const antal = Math.max(1, personer.length);
  const per = antal === 1 ? 'Per person och år.' : `Ni ${ANTAL_ORD[antal] || antal} tillsammans, per år.`;
  const stopp = (text) => ({ status: 'stopp', belopp: null, prefix: '', text, not: null, per, antal });
  if (!ager) return stopp(`Eftersom du inte äger din bostad har du inte rätt till ${namn}.`);
  const under18 = myndig === false || (myndig === undefined && personer[0] && personer[0].alder === 'u18');
  if (under18) return stopp(`Du behöver ha fyllt 18 år senast vid årets slut för att få ${namn}.`);

  const noter = [];
  if (mode === 'rot' && !aldre) noter.push('Yngre än fem år: ROT gäller reparation och underhåll, inte om- och tillbyggnad.');

  let summa = 0, nagonTak = false, nagonCa = false, anvantTot = 0, forMycket = 0, nagonInkomst = false, lon66 = false;
  for (const p of personer) {
    const anvant = Math.max(0, (mode === 'gt' ? p.gtAnvant : p.anvant) || 0);
    anvantTot += anvant;
    const restVid = (u) => Math.min(TAK, u) - anvant;
    const delar = inkomstDelar(p);
    if (delar.lon + delar.pension === 0) { summa += Math.max(0, restVid(Infinity)); nagonTak = true; continue; }
    nagonInkomst = true;
    const u = utrymmeFor(p, P.KS_SNITT);
    if (u === 0 && p.alder === '66+' && p.typ === 'lon') lon66 = true;   /* 66+ med bara lön: förhöjt grundavdrag + jobbskatteavdrag 66+ äter hela kommunalskatten (verifierat: SKV-72) */
    let rest = restVid(u);
    if (anvant > u) forMycket += anvant - u;         /* kvarskatt bara när skatten inte räcker; ROT och RUT får passera 50 000 (75 000 tillsammans, 67 kap. 19 §) (research/12 Major 1) */
    rest = Math.max(0, rest);
    const exakt = rest >= TAK && restVid(utrymmeFor(p, P.KS_BAND[0])) >= TAK;   /* "50 000 kr" bara om det håller i Österåker (28,93 %) */
    if (!exakt) { rest = Math.round(rest / 1000) * 1000; nagonCa = true; }
    summa += rest;
  }

  const ni = antal > 1;
  if (summa === 0 && anvantTot > 0) noter.push(`${ni ? 'Ni' : 'Du'} har redan använt hela årets ${namn}.`);
  else if (summa === 0 && nagonInkomst) noter.push(lon66
    ? `Från 66 år är skatten på en lön som din så låg att inget blir kvar att dra ${namn}et från. Har du också pension, välj Båda.`
    : `${ni ? 'Er' : 'Din'} skatt ser inte ut att räcka till något ${namn} i år.`);
  if (forMycket > 0) {
    const fm = Math.max(1000, Math.round(forMycket / 1000) * 1000);
    noter.push(`${ni ? 'Ni' : 'Du'} har ${summa === 0 && anvantTot > 0 ? 'dessutom ' : ''}använt ca ${kr(fm)} mer än skatten räcker till. Den delen kan Skatteverket kräva tillbaka i deklarationen.`);
  }
  if (summa === 0) return { status: 'belopp', belopp: 0, prefix: '', text: kr(0), not: noter.join(' ') || null, per, antal };
  const prefix = nagonTak ? 'upp till' : nagonCa ? 'ca' : '';
  return { status: nagonTak ? 'tak' : 'belopp', belopp: summa, prefix, text: kr(summa), not: noter.join(' ') || null, per, antal };
}
