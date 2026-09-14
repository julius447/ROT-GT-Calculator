/* Avdragskollen v1 "Två spalter". Tre svar in, ett besked ut. All logik ligger i ../rakna.js; här bara
   läsning av svaren, formatering av fältet och rendering av beskedet. Inget lagras, inget skickas. */
import { berakna, formatFalt, siffra } from '../rakna.js';

const $ = (s) => document.querySelector(s);
const kort = $('#avdragskollen');
const form = $('#rk-form');
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

/* "grön teknik-avdrag" hålls ihop på raden: samma text (textContent oförändrad), men orden ligger i en span
   med white-space: nowrap så varken mellanslaget eller bindestrecket blir en radbrytning. Skriver bara när
   texten faktiskt ändrats (ingen DOM-mutation, ingen uppläsning, i onödan). */
const IHOP = 'grön teknik-avdrag';
function skriv(el, text) {
  if (el.textContent === text) return false;
  const delar = text.split(IHOP);
  el.replaceChildren();
  delar.forEach((d, i) => {
    if (i) { const s = document.createElement('span'); s.className = 'rk__ihop'; s.textContent = IHOP; el.append(s); }
    if (d) el.append(d);
  });
  return true;
}
const gom = (el, dolj) => { if (el.hidden !== dolj) el.hidden = dolj; };

/* Läget ur ?m= (default rot). Ett läge, ett avdrag: aldrig båda. Femårsfrågan visas bara i ROT (style.css). */
const mode = new URLSearchParams(location.search).get('m') === 'gt' ? 'gt' : 'rot';
kort.dataset.mode = mode;
if (mode === 'gt') {
  skriv(rubrik, 'Räkna ut ditt grön teknik-avdrag');
  eyebrow.textContent = 'Ditt grön\u00a0teknik-avdrag 2026';   /* etiketten är inline-flex (ingen span där): hårt mellanslag i stället */
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

  const fran = resultat.dataset.status;
  if (fran !== r.status) resultat.dataset.status = r.status;
  let andrat = false;

  if (r.status === 'stopp') {
    gom(stopp, false);                              /* synlig först, texten sedan: då läser skärmläsaren upp beskedet */
    andrat = skriv(stopptext, r.text);
    gom(not, true);
  } else {
    gom(stopp, true);
    /* "50 000 kr" ur rakna.js: siffrorna som hero, enheten mindre bredvid (som LED-kalkylatorns kr/år) */
    const m = r.text.match(/^(.*\S)\s(kr)$/);
    const nyttTal = m ? m[1] : r.text;
    if (fran === 'stopp') tal.textContent = '';    /* tillbaka från stoppläget: talet skrivs om även om det är samma, så det läses upp igen */
    andrat = [skriv(prefix, r.prefix), skriv(tal, nyttTal), skriv(talenhet, m ? m[2] : ''), skriv(not, r.not || '')].some(Boolean);
    gom(prefix, !r.prefix);
    gom(talenhet, !m);
    gom(not, !r.not);
  }

  if (andrat || fran !== r.status) tona(r.status === 'stopp' ? stopp : talrad);
  forsta = false;
}

/* Beloppet formateras med mellanslag medan hon skriver. Beskedet räknas om 500 ms efter sista tangenten (annars
   blinkar "ca 0 kr" förbi på 1, 18, 180 ...), och direkt när hon lämnar fältet eller trycker Enter/Klar. */
let timer = 0;
const direkt = () => { clearTimeout(timer); timer = 0; rendera(); };
inkomst.addEventListener('input', () => {
  inkomst.value = formatFalt(inkomst.value);
  clearTimeout(timer);
  timer = setTimeout(direkt, 500);
});
inkomst.addEventListener('change', direkt);
inkomst.addEventListener('blur', direkt);
/* Enter/Klar i fältet: aldrig en omladdning (formuläret har inget mål), bara räkna om och stäng tangentbordet */
form.addEventListener('submit', (e) => { e.preventDefault(); inkomst.blur(); });
document.querySelectorAll('.rk input[type="radio"]').forEach((el) => el.addEventListener('change', rendera));

rendera();
