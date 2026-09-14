/* Avdragskollen v1 "Två spalter". Svaren in, ett besked ut. All logik ligger i ../rakna.js; här bara läsning av
   svaren, formatering av fälten, personer som läggs till och rendering av beskedet. Inget lagras, inget skickas. */
import { beraknaHushall, formatFalt, siffra, MAX_PERSONER } from '../rakna.js';

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
const per = $('#rk-per');
const not = $('#rk-not');
const stopp = $('#rk-stopp');
const stopptext = $('#rk-stopptext');
const personer = $('#rk-personer');
const lagg = $('#rk-lagg');
const mall = $('#rk-personmall');

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
const NAMN = mode === 'gt' ? 'grön teknik-avdrag' : 'ROT-avdrag';
const ANVANT = mode === 'gt'
  ? { forsta: 'Grön teknik du redan använt i år', ovriga: 'Grön teknik använt i år' }
  : { forsta: 'ROT du redan använt i år', ovriga: 'ROT använt i år' };
if (mode === 'gt') {
  skriv(rubrik, 'Räkna ut ditt grön teknik-avdrag');
  document.title = 'Räkna ut ditt grön teknik-avdrag: Ampy';
  personer.querySelector('[data-etikett="anvant"]').textContent = ANVANT.forsta;
}

const val = (name, rot = document) => (rot.querySelector(`input[name="${name}"]:checked`) || {}).value;

/* Kort intoning när beskedet byts (aldrig på första renderingen, aldrig count-up) */
let forsta = true;
function tona(el) {
  if (forsta) return;
  el.classList.remove('is-swap');
  void el.offsetWidth;
  el.classList.add('is-swap');
}

/* Personerna: person 1 står i HTML:en, fler klonas ur mallen med löpnummer. Etiketterna numreras om när någon tas
   bort så det alltid står Person 1 .. N. Ett hushåll har högst MAX_PERSONER. */
let lopnummer = 1;
function block() { return [...personer.querySelectorAll('.rk__person')]; }
function numrera() {
  const alla = block();
  alla.forEach((b, i) => {
    b.dataset.person = String(i + 1);
    b.querySelector('.rk__personetikett').textContent = `Person ${i + 1}`;
  });
  personer.dataset.antal = String(alla.length);
  gom(lagg.parentElement, alla.length >= MAX_PERSONER);
}
function laggTill() {
  const n = ++lopnummer;
  const html = mall.innerHTML.replaceAll('-N"', `-${n}"`).replaceAll('typ-N', `typ-${n}`);
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const b = tmp.firstElementChild;
  b.querySelector('[data-etikett="anvant"]').textContent = ANVANT.ovriga;
  koppla(b);
  personer.append(b);
  numrera();
  rendera();
  b.querySelector('[data-falt="inkomst"]').focus({ preventScroll: false });
}
function taBort(b) {
  const nasta = b.previousElementSibling || personer;
  b.remove();
  numrera();
  rendera();
  (lagg.parentElement.hidden ? nasta.querySelector('[data-falt="inkomst"]') : lagg).focus();
}
lagg.addEventListener('click', laggTill);

function lasPersoner() {
  return block().map((b) => ({
    typ: val(`typ-${b.querySelector('input[type="radio"]').name.split('-')[1]}`, b),
    inkomst: siffra(b.querySelector('[data-falt="inkomst"]').value),
    anvant: siffra(b.querySelector('[data-falt="anvant"]').value),
  }));
}

function rendera() {
  const r = beraknaHushall({
    mode,
    ager: val('ager') === 'ja',
    aldre: val('aldre') === 'ja',
    myndig: val('myndig') === 'ja',
    personer: lasPersoner(),
  });

  const fran = resultat.dataset.status;
  if (fran !== r.status) resultat.dataset.status = r.status;
  let andrat = false;

  skriv(eyebrow, `${r.antal > 1 ? 'Ert' : 'Ditt'} tillgängliga ${NAMN}`);   /* ägarens ordval 2026-09-14: "tillgängliga", inget årtal */

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
    andrat = [skriv(prefix, r.prefix), skriv(tal, nyttTal), skriv(talenhet, m ? m[2] : ''), skriv(per, r.per), skriv(not, r.not || '')].some(Boolean);
    gom(prefix, !r.prefix);
    gom(talenhet, !m);
    gom(not, !r.not);
  }

  if (andrat || fran !== r.status) tona(r.status === 'stopp' ? stopp : talrad);
  forsta = false;
}

/* Beloppen formateras med mellanslag medan hon skriver. Beskedet räknas om 500 ms efter sista tangenten (annars
   blinkar "ca 0 kr" förbi på 1, 18, 180 ...), och direkt när hon lämnar fältet eller trycker Enter/Klar. */
let timer = 0;
const direkt = () => { clearTimeout(timer); timer = 0; rendera(); };
function koppla(rot) {
  rot.querySelectorAll('.rk__input').forEach((f) => {
    f.addEventListener('input', () => {
      f.value = formatFalt(f.value);
      clearTimeout(timer);
      timer = setTimeout(direkt, 500);
    });
    f.addEventListener('change', direkt);
    f.addEventListener('blur', direkt);
  });
  rot.querySelectorAll('input[type="radio"]').forEach((el) => el.addEventListener('change', rendera));
  const bort = rot.querySelector('.rk__tabort');
  if (bort) bort.addEventListener('click', () => taBort(rot));
}
/* Enter/Klar i ett fält: aldrig en omladdning (formuläret har inget mål), bara räkna om och stäng tangentbordet */
form.addEventListener('submit', (e) => { e.preventDefault(); if (document.activeElement?.classList.contains('rk__input')) document.activeElement.blur(); });

koppla(kort);
rendera();
