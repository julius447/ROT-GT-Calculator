/* Avdragskollen v3 "Talet först". All logik ligger i ../rakna.js; här bara läge, bindning och rendering.
   Inget lagras, inget skickas. */
import { berakna, siffra, formatFalt } from '../rakna.js';

const $ = (s) => document.querySelector(s);
const hero = $('#ak-hero'), tal = $('#ak-tal'), prefix = $('#ak-prefix'), siffraEl = $('#ak-siffra');
const stopp = $('#ak-stopp'), stoppText = $('#ak-stopp-text'), rad = $('#ak-rad'), not = $('#ak-not');
const form = $('#ak-fragor'), inkomst = $('#ak-inkomst'), fragaInkomst = $('#ak-fraga-inkomst');

/* Läge ur ?m= (default rot). Visar EN sak per läge; fråga 2 döljs i gt av CSS. */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
const ihop = (s) => s.replace(/grön teknik/g, 'grön\u00a0teknik');   // "grön teknik" bryts aldrig inne i namnet (hårt mellanslag)
document.documentElement.dataset.mode = mode;
document.title = `Räkna ut ditt ${namn}: Ampy`;
$('#ak-rubrik').textContent = ihop(`Räkna ut ditt ${namn}`);
$('#ak-etikett').textContent = ihop(`Ditt ${namn} 2026`);

const val = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motion = () => (reduced.matches ? 'auto' : 'smooth');

/* Skriv bara till DOM när något faktiskt ändrats: annars muterar live-regionen (och läses upp) i onödan */
const text = (el, s) => { if (el.textContent === s) return false; el.textContent = s; return true; };
const visa = (el, ja) => { if (el.hidden === !ja) return false; el.hidden = !ja; return true; };

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
  const nu = r.status + '|' + r.text + '|' + r.prefix + '|' + (r.not || '');
  if (nu === senast) return;                                  // ingenting nytt att visa: inga DOM-skrivningar

  if (hero.classList.contains('is-stopp') !== stoppat) hero.classList.toggle('is-stopp', stoppat);   // krok för CSS/mätning
  if (stoppat) {
    text(stoppText, ihop(r.text));
  } else {
    text(prefix, r.prefix); visa(prefix, !!r.prefix);
    text(siffraEl, r.text.replace(/\s*kr$/u, ''));            // "50 000 kr" -> "50 000" (enheten sätts typografiskt)
    if (r.not) text(not, r.not);
    visa(not, !!r.not);
  }
  visa(tal, !stoppat); visa(stopp, stoppat); visa(rad, !stoppat);

  if (!forst) tick(stoppat ? stopp : tal);
  senast = nu; forst = false;
}

/* På mobil ligger talpanelen under beloppsfältet. Syns den inte hel (tangentbordet uppe), rulla så att fråga 3 och
   panelen står i bild; på blur ("Klar") ser vi till att panelen är i bild. Desktop (panelen ovanför) rörs aldrig. */
const synligHojd = () => (window.visualViewport ? window.visualViewport.height : window.innerHeight);
const panelUnderFaltet = () => hero.getBoundingClientRect().top > inkomst.getBoundingClientRect().top;
const panelSynlig = () => { const h = hero.getBoundingClientRect(); return h.top >= 0 && h.bottom <= synligHojd(); };
function visaPanel(el, block) {
  if (!panelUnderFaltet() || panelSynlig()) return;
  el.scrollIntoView({ block, behavior: motion() });
}

/* Beloppet formateras med mellanslag medan man skriver. Talet räknas om 500 ms efter sista tangenten (annars blinkar
   "ca 0 kr" förbi vid 1, 18, 180 ...), direkt vid change/blur och vid varje knapptryck. */
let timer = 0;
const direkt = () => { clearTimeout(timer); rakna(); };
inkomst.addEventListener('input', () => {
  const v = formatFalt(inkomst.value);
  if (inkomst.value !== v) inkomst.value = v;
  clearTimeout(timer); timer = setTimeout(rakna, 500);
});
inkomst.addEventListener('change', direkt);
inkomst.addEventListener('blur', () => { direkt(); visaPanel(hero, 'nearest'); });
inkomst.addEventListener('focus', () => { setTimeout(() => { if (document.activeElement === inkomst) visaPanel(fragaInkomst, 'start'); }, 300); });   // efter tangentbordets animation
form.addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });   // Enter/"Klar" laddar inte om sidan
document.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', direkt));
rakna();
