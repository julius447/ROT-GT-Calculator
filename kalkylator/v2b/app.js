/* Avdragskollen v2b. Tre svar in, ett besked ut. All logik ligger i ../rakna.js (delad); här bara
   läsning av kontrollerna och rendering av beskedet. Inget lagras, inget skickas. */
import { berakna, siffra, formatFalt } from '../rakna.js';

const $ = (s) => document.querySelector(s);
const rot = $('#avdragskollen');
const h2 = $('#rk-h2'), etikett = $('#rk-etikett');
const utfall = $('#rk-utfall'), prefix = $('#rk-prefix'), num = $('#rk-num'), enhet = $('#rk-enhet'), not = $('#rk-not');
const stopp = $('#rk-stopp'), stoppText = $('#rk-stopp-text');
const inkomst = $('#rk-inkomst');

/* Läget ur ?m= (rot är standard). Verktyget visar en sak per läge, aldrig båda. */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
rot.dataset.mode = mode;
h2.textContent = `Räkna ut ditt ${namn}`;
etikett.textContent = `Ditt ${namn} 2026`;
document.title = `Räkna ut ditt ${namn}: Ampy`;

const valt = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;

/* "50 000 kr" -> tal "50 000" + enhet "kr" (bara typografi, ingen egen räkning; mellanslagen är hårda) */
const delaTal = (text) => { const i = text.search(/\s\S+$/); return { tal: text.slice(0, i), enhet: text.slice(i + 1) }; };

/* De två beskedslägena delar cell i bandet: det dolda ligger kvar (höjden hålls) men osynligt och utanför tillgänglighetsträdet */
function visa(el, ja) { el.classList.toggle('is-dold', !ja); el.setAttribute('aria-hidden', ja ? 'false' : 'true'); }

/* Kort intoning när beskedet byter innehåll; aldrig på första renderingen */
let senast = null;
function tona(el, nyckel) {
  if (senast !== null && senast !== nyckel) { el.classList.remove('is-ny'); void el.offsetWidth; el.classList.add('is-ny'); }
  senast = nyckel;
}

function rendera() {
  const r = berakna({ mode, ager: valt('ager') === 'ja', aldre: valt('aldre') === 'ja', typ: valt('typ'), inkomst: siffra(inkomst.value) });
  rot.dataset.status = r.status;

  if (r.status === 'stopp') {
    stoppText.textContent = r.text;
    visa(stopp, true); visa(utfall, false);
    tona(stopp, 'stopp');
    return;
  }
  const delat = delaTal(r.text);
  prefix.textContent = r.prefix; prefix.hidden = !r.prefix;
  num.textContent = delat.tal; enhet.textContent = delat.enhet;
  not.textContent = r.not || ''; not.hidden = !r.not;
  visa(utfall, true); visa(stopp, false);
  tona(utfall, `${r.prefix}|${delat.tal}|${r.not || ''}`);
}

/* Beloppet formateras med mellanslag medan man skriver (formatFalt), markören hålls i slutet. Enter räknar bara om, skickar inget. */
inkomst.addEventListener('input', () => { inkomst.value = formatFalt(inkomst.value); rendera(); });
document.querySelector('.rk__fragor').addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });
document.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', rendera));
rendera();
