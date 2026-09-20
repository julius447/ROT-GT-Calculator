const hex = (h) => { h = h.replace('#',''); if (h.length===3) h = h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
const lum = ([r,g,b]) => { const f = (c) => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio = (a,b) => { const [l1,l2] = [lum(a),lum(b)].sort((x,y)=>y-x); return (l1+0.05)/(l2+0.05); };
const blend = (fg, alpha, bg) => fg.map((c,i)=>Math.round(c*alpha + bg[i]*(1-alpha)));
const W = hex('#ffffff'), MIST = hex('#f5f9ff'), INK = hex('#090b32'), MUTED = hex('#565e82'), FAINT = hex('#6a7190'), TEAL_DEEP = hex('#007a69'), TEAL = hex('#00a991'), ERR_INK = hex('#7a1623'), ERR = hex('#b3261e');
const track = blend(INK, .07, W);          // segment track on white
const lineStrong = blend(INK, .48, W);     // input border
const line = blend(INK, .14, W);
const focusRing = blend(TEAL_DEEP, .9, W);
const rows = [
  ['--ampy-ink-muted #565e82 på vit (rk__under 16/400, rk__enhet "kr" 16/400, segment ovald 16/500)', MUTED, W, 4.5],
  ['--ampy-ink-muted på sky mist #f5f9ff (eyebrow 12/600, rk__per 16/400, rk__fin 14/400)', MUTED, MIST, 4.5],
  ['--ampy-ink-muted på sky mist, STOR text (rk__prefix/rk__talenhet 28 resp 26 px /500)', MUTED, MIST, 3],
  ['--ampy-ink-muted på segmentspåret (ink .07 på vit)', MUTED, track, 4.5],
  ['--ampy-ink #090b32 på vit (frågor, fältsiffror)', INK, W, 4.5],
  ['--ampy-ink #090b32 på sky mist (talet 56/700, stopptext 18/500, rk__not)', INK, MIST, 4.5],
  ['--ampy-action-strong #007a69 på vit (länkar 16/500, vald segmentpill 16/600)', TEAL_DEEP, W, 4.5],
  ['--ampy-action-strong #007a69 på sky mist', TEAL_DEEP, MIST, 4.5],
  ['teal-core #00a991 på vit (får ALDRIG vara text, kontroll)', TEAL, W, 4.5],
  ['--ampy-ink-faint #6a7190 placeholder "300 000" 18/400 på vit', FAINT, W, 4.5],
  ['--ampy-ink-faint på sky mist', FAINT, MIST, 4.5],
  ['vit X på --ampy-error-ink #7a1623 (stoppikonen, grafik 3:1)', W, ERR_INK, 3],
  ['--ampy-error-ink #7a1623 mot sky mist (ikonens kant mot panelen, 3:1)', ERR_INK, MIST, 3],
  ['--ampy-error #b3261e på vit (felkant, 3:1) och som text 4,5:1', ERR, W, 4.5],
  ['fältkant --ampy-line-strong (ink .48) mot vit, icke-text 3:1', lineStrong, W, 3],
  ['hårlinje --ampy-line (ink .14) mot vit (dekorativ)', line, W, 3],
  ['fokusring rgba(0,122,105,.9) mot vit, 3:1', focusRing, W, 3],
  ['segmentspår (ink .07) mot vit pill (kontrollgräns 1.4.11, 3:1)', track, W, 3],
  ['vald pilltext #007a69 mot ovald text #565e82 (skillnad mellan lägena)', TEAL_DEEP, MUTED, 3],
  ['disabled input: muted på sky mist (används ej i kalkylatorn)', MUTED, MIST, 4.5],
];
for (const [name, a, b, need] of rows) { const r = ratio(a,b); console.log((r>=need?'PASS':'FAIL').padEnd(5), r.toFixed(2).padStart(6), '(krav '+need+')', name); }
