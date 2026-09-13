/* Avdragskollen v1 "Två spalter". Tre svar in, ett besked ut. All logik ligger i ../rakna.js; här bara
   läsning av svaren, formatering av fältet och rendering av beskedet. Inget lagras, inget skickas. */
import { berakna, formatFalt, siffra } from '../rakna.js';

const $ = (s) => document.querySelector(s);
const kort = $('#avdragskollen');
const rubrik = $('#rk-rubrik');
const eyebrow = $('#rk-eyebrow');
const resultat = $('#rk-resultat');
const talrad = $('#rk-talrad');
const prefix = $('#rk-prefix');
const tal = $('#rk-tal');
const talenhet = $('#rk-talenhet');
const not = $('#rk-not');
const stopp = $('#rk-stopp');
const stopptext = $('#rk-stopptext');
const inkomst = $('#rk-inkomst');

/* Läget ur ?m= (default rot). Ett läge, ett avdrag: aldrig båda. */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
kort.dataset.mode = mode;
/* "grön teknik" hålls ihop på raden (hårt mellanslag), så rubriken bryter "Räkna ut ditt / grön teknik-avdrag" */
const ihop = (s) => s.replace(/grön teknik/g, 'grön\u00a0teknik');
if (mode === 'gt') {
  rubrik.textContent = ihop('Räkna ut ditt grön teknik-avdrag');
  eyebrow.textContent = ihop('Ditt grön teknik-avdrag 2026');
  document.title = 'Räkna ut ditt grön teknik-avdrag: Ampy';
}

const val = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;

/* Kort intoning när beskedet byts (aldrig på första renderingen, aldrig count-up) */
let forsta = true;
function tona(el) {
  if (forsta) return;
  el.classList.remove('is-swap');
  void el.offsetWidth;
  el.classList.add('is-swap');
}

function rendera() {
  const r = berakna({
    mode,
    ager: val('ager') === 'ja',
    aldre: val('aldre') === 'ja',
    typ: val('typ'),
    inkomst: siffra(inkomst.value),
  });

  const fore = resultat.dataset.status + '|' + tal.textContent + '|' + prefix.textContent + '|' + (not.hidden ? '' : not.textContent);
  resultat.dataset.status = r.status;

  if (r.status === 'stopp') {
    stopptext.textContent = ihop(r.text);
    stopp.hidden = false;
    not.hidden = true;
  } else {
    stopp.hidden = true;
    prefix.textContent = r.prefix;
    prefix.hidden = !r.prefix;
    /* "50 000 kr" ur rakna.js: siffrorna som hero, enheten mindre bredvid (som LED-kalkylatorns kr/år) */
    const m = r.text.match(/^(.*\S)\s(kr)$/);
    tal.textContent = m ? m[1] : r.text;
    talenhet.textContent = m ? m[2] : '';
    talenhet.hidden = !m;
    not.textContent = r.not || '';
    not.hidden = !r.not;
  }

  const efter = resultat.dataset.status + '|' + tal.textContent + '|' + prefix.textContent + '|' + (not.hidden ? '' : not.textContent);
  if (fore !== efter) tona(r.status === 'stopp' ? stopp : talrad);
  forsta = false;
}

/* Beloppet formateras med mellanslag medan man skriver; fältet är högerställt så markören stannar i slutet */
inkomst.addEventListener('input', () => {
  inkomst.value = formatFalt(inkomst.value);
  rendera();
});
document.querySelectorAll('.rk input[type="radio"]').forEach((el) => el.addEventListener('change', rendera));

rendera();
