/* Delad logik för alla versioner av kalkylatorn. Tre svar in, ett besked ut. Skattemodellen är samma som
   replikerar Skatteverkets e-tjänst (logik/engine.js, validerad ±1 kr). Inget lagras, inget skickas. */
import { skatteutrymme, PARAMS_2026 as P } from '../logik/engine.js';

export const TAK = P.ROT_TAK;   // 50 000 kr per person och år, samma för ROT och grön teknik

/** Formaterar kronor med hårda mellanslag: 50 000 kr */
export function kr(n) {
  return new Intl.NumberFormat('sv-SE').format(n).replace(/[\s  ]/g, ' ') + ' kr';
}

/** Plockar siffrorna ur ett fält: "300 000" -> 300000 */
export function siffra(str) { return Number(String(str ?? '').replace(/[^\d]/g, '')) || 0; }

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
  const not = (mode === 'rot' && !aldre) ? 'Yngre än fem år: ROT gäller bara reparationer.' : null;
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

/* ---------- Hushåll: flera personer, redan använt avdrag, 18-årsgränsen (v1, ägarbeslut 2026-09-14) ---------- */
const ANTAL_ORD = { 2: 'två', 3: 'tre', 4: 'fyra' };
export const MAX_PERSONER = 4;

/**
 * beraknaHushall({ mode, ager, aldre, myndig, personer: [{ typ: 'lon'|'pension', inkomst: number, anvant: number }] })
 * -> { status: 'stopp'|'tak'|'belopp', belopp, prefix, text, not, per, antal }
 *   ager/aldre som i berakna(); myndig = fyllt 18 senast vid årets slut (gäller den som svarar, övriga personer antas
 *   bo i bostaden och uppfylla villkoren). Varje person har eget tak (50 000) och eget skatteutrymme; det som redan
 *   använts i år dras från personens rest. Summan är hushållets. "upp till" så snart någon inkomst saknas, "ca" så
 *   snart någon person är räknad på inkomst under taket, annars exakt.
 */
export function beraknaHushall({ mode = 'rot', ager = true, aldre = true, myndig = true, personer = [{}] } = {}) {
  const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
  const antal = Math.max(1, personer.length);
  const per = antal === 1 ? 'Per person och år.' : `Ni ${ANTAL_ORD[antal] || antal} tillsammans, per år.`;
  const stopp = (text) => ({ status: 'stopp', belopp: null, prefix: '', text, not: null, per, antal });
  if (!ager) return stopp(`Eftersom du inte äger din bostad har du inte rätt till ${namn}.`);
  if (!myndig) return stopp(`Du behöver ha fyllt 18 år senast vid årets slut för att få ${namn}.`);

  const noter = [];
  if (mode === 'rot' && !aldre) noter.push('Yngre än fem år: ROT gäller bara reparationer.');

  let summa = 0, nagonTak = false, nagonCa = false, anvantTot = 0;
  for (const p of personer) {
    const anvant = Math.max(0, p.anvant || 0);
    anvantTot += anvant;
    if (!p.inkomst) { summa += Math.max(0, TAK - anvant); nagonTak = true; continue; }
    const r = skatteutrymme({
      lon_ar: p.typ === 'pension' ? 0 : p.inkomst,
      pension_ar: p.typ === 'pension' ? p.inkomst : 0,
      ar_66_plus: p.typ === 'pension',
      ks: P.KS_SNITT, taxeringsvarde: 0, ranteutgifter: 0,
    });
    const t = Math.min(TAK, Math.max(0, r.utrymme_rot_rut_gt));
    let rest = Math.max(0, t - anvant);
    if (t < TAK) { rest = Math.round(rest / 1000) * 1000; nagonCa = true; }
    summa += rest;
  }

  if (summa === 0 && anvantTot > 0) {
    noter.push(`${antal === 1 ? 'Du' : 'Ni'} har redan använt hela årets ${namn}.`);
    return { status: 'belopp', belopp: 0, prefix: '', text: kr(0), not: noter.join(' '), per, antal };
  }
  const prefix = nagonTak ? 'upp till' : nagonCa ? 'ca' : '';
  return { status: nagonTak ? 'tak' : 'belopp', belopp: summa, prefix, text: kr(summa), not: noter.join(' ') || null, per, antal };
}
