// Engine truth for the six review scenarios. Touched sets mirror what a user clicking the chips would produce.
import { evaluate, resolveTexts, defaultState } from '../../logik/ui-model.js';

export const SCENARIOS = [
  { id: 1, name: 'defaults ROT', mode: 'rot', state: {}, touched: [] },
  { id: 2, name: 'ROT villa, vardear 2021_2025, belopp 60000, skatt lön', mode: 'rot',
    state: { boende: 'villa', vardear: '2021_2025', belopp: 60000, skatt: 'lon' }, touched: ['boende', 'vardear', 'belopp', 'skatt'] },
  { id: 3, name: 'ROT hyresrätt', mode: 'rot', state: { boende: 'hyra' }, touched: ['boende'] },
  { id: 4, name: 'GT laddbox bostadsrätt (pplats untouched)', mode: 'gt', state: { lage: 'laddbox', boende: 'brf' }, touched: ['lage', 'boende'] },
  { id: 5, name: 'GT batteri, sol = nej', mode: 'gt', state: { lage: 'batteri', sol: 'nej' }, touched: ['lage', 'sol'] },
  { id: 6, name: 'ROT Fler detaljer: agare 2, anvant_rot 40000, belopp 100000, arbete_kr 60000', mode: 'rot',
    state: { agare: 2, anvant_rot: 40000, belopp: 100000, arbete_kr: 60000 }, touched: ['agare', 'anvant_rot', 'belopp', 'arbete_kr'] },
];

export function truth(sc) {
  const r = resolveTexts(evaluate(sc.mode, { ...defaultState(sc.mode), ...sc.state }, sc.touched));
  return {
    klass: r.klass, subtyp: r.subtyp, headline: r.headline.text, eyebrow: r.eyebrow, ram: r.ram.text,
    belopp_state: r.belopp.state, belopp_rubrik: r.belopp.rubrik, bas_text: r.belopp.bas_text, att_betala: r.belopp.att_betala_text || '',
    skatt_status: r.skatt.status, skatt_text: r.skatt.text, skatt_hedge: r.skatt.hedge,
    cta_label: r.cta.primary.label, cta_kind: r.cta.primary.kind, cta_solid: r.cta.primary.solid, cta_href: r.cta.primary.href,
    sec_label: r.cta.secondary ? r.cta.secondary.label : null, sec_href: r.cta.secondary ? r.cta.secondary.href : null,
    villkor: r.villkor.map(v => `${v.status}|${v.text}`), steg: r.nasta_steg.map(s => s.text), disclaimer: r.disclaimer,
    raw_avdrag: r.belopp.avdrag_kr, raw_min: r.belopp.avdrag_min_kr, raw_max: r.belopp.avdrag_max_kr, raw_att_betala: r.belopp.att_betala_kr,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const sc of SCENARIOS) { console.log(`\n=== ${sc.id}. ${sc.name} ===`); console.log(JSON.stringify(truth(sc), null, 1)); }
}
