/* WCAG-kontrast för alla text/yta-par som förekommer i v1, v2b, v3 (tokens ur system/tokens.css). */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
const blend = (rgba, a, bg) => rgba.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const vit = hex('#ffffff'), sky = hex('#f5f9ff'), midnight = hex('#090b32'), muted = hex('#565e82'), faint = hex('#6a7190');
const tealDeep = hex('#007a69'), errorInk = hex('#7a1623'), successInk = hex('#0f6e56');
const track = blend(midnight, 0.07, vit);          /* --ampy-field-track rgba(9,11,50,.07) på vitt kort */
const par = [
  ['midnight (tal, frågor, stopptext) på vit', midnight, vit],
  ['midnight (tal) på sky mist (panel/band/hjälte)', midnight, sky],
  ['muted (underrad, prefix, kr, "Per person") på vit', muted, vit],
  ['muted (etikett 12 px, prefix, "Per person") på sky mist', muted, sky],
  ['muted (ovalt segmentalternativ) på spåret rgba(9,11,50,.07)', muted, track],
  ['teal-deep (valt segmentalternativ) på vit pill', tealDeep, vit],
  ['faint (placeholder 300 000) på vit', faint, vit],
  ['vitt kryss på error-ink', vit, errorInk],
  ['vit bock på success-ink (v3)', vit, successInk],
];
for (const [namn, a, b] of par) console.log(`${ratio(a, b).padStart(6)}:1  ${namn}`);
console.log('spårfärg blandad:', '#' + track.map((c) => c.toString(16).padStart(2, '0')).join(''));
