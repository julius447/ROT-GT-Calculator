/* Avdragskollen v2. Tre svar in, två tal ut. Räknar med samma skatteutrymmes-modell som replikerar
   Skatteverkets e-tjänst (logik/engine.js, validerad ±1 kr). Inget lagras, inget skickas. */
import { skatteutrymme, PARAMS_2026 as P } from '../logik/engine.js';

const $ = (s) => document.querySelector(s);
const tak = $('#rk-tak'), rot = $('#rk-rot'), gt = $('#rk-gt'), rotNot = $('#rk-rot-not'), fot = $('#rk-fot'), stopp = $('#rk-stopp');
const inkomst = $('#rk-inkomst');

const q = new URLSearchParams(location.search);
if (q.get('m') === 'gt') tak.dataset.forst = 'gt';

const kr = (n) => new Intl.NumberFormat('sv-SE').format(n).replace(/ /g, ' ') + ' kr';
const val = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;

function siffra(str) { return Number(String(str).replace(/[^\d]/g, '')) || 0; }

function rakna() {
  const ager = val('ager') === 'ja';
  const aldre = val('aldre') === 'ja';
  const typ = val('typ');
  const ink = siffra(inkomst.value);

  stopp.hidden = ager; tak.hidden = !ager; fot.hidden = !ager;
  if (!ager) return;

  let text;
  if (!ink) {
    text = `<small>upp till</small> ${kr(P.ROT_TAK)}`;
  } else {
    const r = skatteutrymme({ lon_ar: typ === 'lon' ? ink : 0, pension_ar: typ === 'pension' ? ink : 0, ar_66_plus: typ === 'pension', ks: P.KS_SNITT, taxeringsvarde: 0, ranteutgifter: 0 });
    const utrymme = Math.max(0, r.utrymme_rot_rut_gt);
    const t = Math.min(P.ROT_TAK, utrymme);
    text = t >= P.ROT_TAK ? kr(P.ROT_TAK) : `<small>ca</small> ${kr(Math.round(t / 1000) * 1000)}`;
  }
  rot.innerHTML = text; gt.innerHTML = text;
  rotNot.hidden = aldre;
}

/* Beloppet formateras med mellanslag medan man skriver, markören hålls i slutet */
inkomst.addEventListener('input', () => {
  const n = siffra(inkomst.value);
  inkomst.value = n ? new Intl.NumberFormat('sv-SE').format(n).replace(/ /g, ' ') : '';
  rakna();
});
document.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', rakna));
rakna();
