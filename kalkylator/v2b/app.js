/* Avdragskollen v2b. Tre svar in, ett besked ut. All logik ligger i ../rakna.js (delad); här bara
   läsning av kontrollerna och rendering av beskedet. Inget lagras, inget skickas. */
import { berakna, siffra, formatFalt } from '../rakna.js';

const $ = (s) => document.querySelector(s);
const rot = $('#avdragskollen');
const h2 = $('#rk-h2'), etikett = $('#rk-etikett'), femar = $('#rk-q2-block');
const utfall = $('#rk-utfall'), prefix = $('#rk-prefix'), num = $('#rk-num'), enhet = $('#rk-enhet'), not = $('#rk-not');
const stopp = $('#rk-stopp'), stoppText = $('#rk-stopp-text');
const inkomst = $('#rk-inkomst');

/* Läget ur ?m= (rot är standard). Verktyget visar en sak per läge, aldrig båda. */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
const namn = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
rot.dataset.mode = mode;
document.title = `Räkna ut ditt ${namn}: Ampy`;

/* Avdragets namn sätts som ett nowrap-spann så "grön teknik-avdrag" aldrig bryts (varken vid mellanslaget eller
   bindestrecket). Texten är oförändrad: textContent blir exakt den låsta strängen. */
function medNamn(el, text) {
  const i = text.indexOf(namn);
  if (i < 0) { el.textContent = text; return; }
  const span = document.createElement('span'); span.className = 'rk__nobr'; span.textContent = namn;
  el.replaceChildren(text.slice(0, i), span, text.slice(i + namn.length));
}
medNamn(h2, `Räkna ut ditt ${namn}`);
medNamn(etikett, `Ditt ${namn} 2026`);

/* Grön teknik har ingen femårsregel: fråga 2 döljs (ägarbeslut 2026-09-14). Radioknapparna finns kvar men är
   display: none, alltså varken fokuserbara eller i tillgänglighetsträdet; berakna() läser inte "aldre" i gt. */
if (mode === 'gt') femar.hidden = true;

const valt = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;

/* "50 000 kr" -> tal "50 000" + enhet "kr" (bara typografi, ingen egen räkning; mellanslagen är hårda) */
const delaTal = (text) => { const i = text.search(/\s\S+$/); return { tal: text.slice(0, i), enhet: text.slice(i + 1) }; };

/* DOM skrivs bara när något faktiskt ändrats: live-regionen (aria-live på .rk__varde) ska ge en uppläsning per
   nytt besked, inte en per tangent (R1 G2). */
const satt = (el, text) => { if (el.textContent !== text) el.textContent = text; };

/* De två beskedslägena delar plats i bandet: det dolda ligger kvar (höjden hålls) men osynligt och utanför tillgänglighetsträdet */
function visa(el, ja) {
  if (el.classList.contains('is-dold') === !ja) return;
  el.classList.toggle('is-dold', !ja); el.setAttribute('aria-hidden', ja ? 'false' : 'true');
}

/* Kort intoning när beskedet byter innehåll; aldrig på första renderingen */
let senast = null;
function tona(el, nyckel) {
  if (senast !== null && senast !== nyckel) { el.classList.remove('is-ny'); void el.offsetWidth; el.classList.add('is-ny'); }
  senast = nyckel;
}

function rendera() {
  const r = berakna({ mode, ager: valt('ager') === 'ja', aldre: valt('aldre') === 'ja', typ: valt('typ'), inkomst: siffra(inkomst.value) });
  if (rot.dataset.status !== r.status) rot.dataset.status = r.status;

  if (r.status === 'stopp') {
    if (stoppText.textContent !== r.text) medNamn(stoppText, r.text);
    visa(stopp, true); visa(utfall, false);
    tona(stopp, 'stopp');
    return;
  }
  const delat = delaTal(r.text);
  satt(prefix, r.prefix); if (prefix.hidden !== !r.prefix) prefix.hidden = !r.prefix;
  satt(num, delat.tal); satt(enhet, delat.enhet);
  satt(not, r.not || '');                                 /* femårsraden: egen rad, tom när den inte gäller (raden är reserverad på desktop) */
  visa(utfall, true); visa(stopp, false);
  tona(utfall, `${r.prefix}|${delat.tal}|${r.not || ''}`);
}

/* Beloppet formateras med mellanslag medan man skriver (formatFalt), markören hålls i slutet. Beskedet räknas om
   500 ms efter sista tangenten (så "ca 0 kr" inte blinkar förbi medan hon skriver 180 000, R1 G1), direkt när hon
   lämnar fältet eller trycker Enter/Klar. Enter skickar inget. */
let timer = 0;
const direkt = () => { clearTimeout(timer); rendera(); };
inkomst.addEventListener('input', () => { inkomst.value = formatFalt(inkomst.value); clearTimeout(timer); timer = setTimeout(rendera, 500); });
inkomst.addEventListener('change', direkt);
inkomst.addEventListener('blur', direkt);
document.querySelector('.rk__fragor').addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });
document.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', direkt));
rendera();
