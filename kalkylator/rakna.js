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
