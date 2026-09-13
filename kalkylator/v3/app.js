/* Avdragskollen v3 "Talet först". All logik ligger i ../rakna.js; här bara läge, bindning och rendering.
   Inget lagras, inget skickas. */
import { berakna, siffra, formatFalt } from '../rakna.js';

const $ = (s) => document.querySelector(s);
const hero = $('#ak-hero'), tal = $('#ak-tal'), prefix = $('#ak-prefix'), siffraEl = $('#ak-siffra'), bock = $('#ak-bock');
const stopp = $('#ak-stopp'), stoppText = $('#ak-stopp-text'), rad = $('#ak-rad'), not = $('#ak-not');
const inkomst = $('#ak-inkomst');

/* Läge ur ?m= (default rot). Visar EN sak per läge. */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
document.documentElement.dataset.mode = mode;
document.title = `Räkna ut ditt ${namn}: Ampy`;
$('#ak-rubrik').textContent = `Räkna ut ditt ${namn}`;
$('#ak-etikett').textContent = `Ditt ${namn} 2026`;

const val = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/* Liten "tick" när talet byts, så kunden ser att det reagerade. Aldrig vid första renderingen. */
function tick(el) {
  if (reduced.matches) return;
  el.classList.remove('is-tick');
  void el.offsetWidth;
  el.classList.add('is-tick');
}

let forst = true, senast = '';
function rakna() {
  const r = berakna({ mode, ager: val('ager') === 'ja', aldre: val('aldre') === 'ja', typ: val('typ'), inkomst: siffra(inkomst.value) });
  const stoppat = r.status === 'stopp';

  hero.classList.toggle('is-stopp', stoppat);   // krok för CSS/mätning, själva döljandet sker med hidden nedan
  tal.hidden = stoppat; stopp.hidden = !stoppat; rad.hidden = stoppat;

  if (stoppat) {
    stoppText.textContent = r.text;
  } else {
    prefix.textContent = r.prefix; prefix.hidden = !r.prefix;
    siffraEl.textContent = r.text.replace(/\s*kr$/u, '');   // "50 000 kr" -> "50 000" (enheten sätts typografiskt)
    bock.hidden = r.status !== 'belopp';
    not.hidden = !r.not;
    if (r.not) not.textContent = r.not;
  }

  const nu = r.status + '|' + r.text + '|' + r.prefix;
  if (!forst && nu !== senast) tick(stoppat ? stopp : tal);
  senast = nu; forst = false;
}

/* Beloppet formateras med mellanslag medan man skriver, markören hålls i slutet */
inkomst.addEventListener('input', () => { inkomst.value = formatFalt(inkomst.value); rakna(); });
document.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', rakna));
rakna();
