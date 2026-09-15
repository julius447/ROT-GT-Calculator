"""Bygger kalkylator/artikel/index.html: en statisk klon av artikelmallen (ampy.se/elcentral-guide-2026/, renderad DOM)
med Avdragskollen injicerad. Två placeringar väljs med ?p=hoger (högerspalten, som TOC-kortet) eller ?p=topp
(överst i artikelspalten); läget med ?m=rot|gt. Klonen: skript borta (utom placeringsskriptet), cookie-rutan borta,
Bricks' "dold tills animation" borta, lazy-bakgrunder visade, tillgångar från ampy.se (absoluta URL:er).

Kör: python3 tools/artikel-klon.py <renderad.html>   (renderad DOM ur tools/klona-artikel.mjs)"""
import re, sys
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/tmp/artikel-rendered.html')
s = src.read_text(encoding='utf-8')

# 1. skript bort (inline, data-URL och externa), noscript bort
s = re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.S)
s = re.sub(r'<script\b[^>]*/>', '', s)
s = re.sub(r'<noscript\b[^>]*>.*?</noscript>', '', s, flags=re.S)

# 2. cookie-rutan bort (overlay + dialog med nästlade div:ar)
def ta_bort_element(html, start_marker):
    i = html.find(start_marker)
    if i < 0: return html
    j = html.rfind('<div', 0, i + 1)
    depth = 0; k = j
    for m in re.finditer(r'<div\b|</div>', html[j:]):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0:
            k = j + m.end(); break
    return html[:j] + html[k:]
s = ta_bort_element(s, 'id="ampy-cc-overlay"')
s = ta_bort_element(s, 'id="ampy-cc"')

# 3. synligt utan JS: Bricks "dold tills animation", FlyingPress lazy-bakgrunder, lazy video/iframe
s = s.replace(' data-interaction-hidden-on-load="1"', '')
s = s.replace('flying-press-lazy-bg', '')
s = s.replace('data-lazy-src=', 'src=')
s = re.sub(r'style="([^"]*)content-visibility:[^;"]*;?([^"]*)"', r'style="\1\2"', s)

# 3b. preload-länkar bort (de skickas före referrer-metan och cachar 403 från hotlink-skyddet; logotypen försvann)
s = re.sub(r'<link rel="preload"[^>]*>', '', s)
# referrer-policyn först i head så ingen begäran hinner gå med Referer
s = s.replace('<head>', '<head><meta name="referrer" content="no-referrer">', 1)

# 4. relativa URL:er -> ampy.se
s = re.sub(r'(href|src|action)="/(?!/)', r'\1="https://ampy.se/', s)
s = re.sub(r'srcset="([^"]*)"', lambda m: 'srcset="' + re.sub(r'(^|,\s*)/(?!/)', r'\1https://ampy.se/', m.group(1)) + '"', s)
s = re.sub(r'url\((["\']?)/(?!/)', r'url(\1https://ampy.se/', s)

# 5. kalkylatorn: markup ur v1/index.html (H2 + section), inbäddad i .ampy-scope
v1 = (ROT / 'kalkylator/v1/index.html').read_text(encoding='utf-8')
h2 = re.search(r'<h2 class="ampy-h2 rk__rubrik"[^>]*>.*?</h2>', v1, flags=re.S).group(0)
sektion = re.search(r'<section class="ampy-card rk".*?</section>', v1, flags=re.S).group(0)
kalkylator = f'''<div class="ampy ampy-kalkylator" id="ampy-kalkylator">
  <div class="rk-behallare">
    {h2}
    {sektion}
  </div>
</div>'''

# 6a. placering "topp": först i vänsterspalten, före Snabbt svar-kortet (direkt efter artikelns stylesheet-element)
i = s.find('id="brxe-pfbtud"')
e = s.find('</style></div>', i)
assert e > 0, 'hittar inte artikelns stylesheet-element'
e += len('</style></div>')
s = s[:e] + '<div id="ampy-plats-topp"></div>' + s[e:]

# 6b. placering "hoger": högerspalten = ny kolumn med kalkylatorn + TOC-kortet (som blir icke-sticky under den)
k = s.find('<div id="brxe-qopmij" class="brxe-block ampy-toc-wrapper">')
assert k > 0, 'hittar inte TOC-kortet'
# TOC-kortets slut: matcha div-djup
depth = 0; slut = k
for m in re.finditer(r'<div\b|</div>', s[k:]):
    depth += 1 if m.group(0) == '<div' else -1
    if depth == 0:
        slut = k + m.end(); break
toc = s[k:slut]
s = s[:k] + '<div id="ampy-hoger" class="brxe-block">' + kalkylator + toc + '</div>' + s[slut:]

# 7. head: kalkylatorns CSS + inbäddningsregler; body-slut: placeringsskript + förhandsvisningsrad + app.js
head_extra = '''
<!-- referrer-policyn ligger först i head (steg 3b): ampy.se hotlink-skyddar bilder, 403 med främmande Referer, 200 utan -->
<link rel="stylesheet" href="../system/tokens.css">
<link rel="stylesheet" href="bas-inbaddad.css">
<link rel="stylesheet" href="../system/components/text.css">
<link rel="stylesheet" href="../system/components/ytor.css">
<link rel="stylesheet" href="../system/components/falt.css">
<link rel="stylesheet" href="../system/components/knappar.css">
<link rel="stylesheet" href="../v1/style.css">
<link rel="stylesheet" href="artikel.css">
'''
s = s.replace('</head>', head_extra + '</head>', 1)

body_extra = '''
<script>
/* Förhandsvisning: ?p=topp flyttar kalkylatorn till artikelspaltens topp (före Snabbt svar). Standard: högerspalten. */
(function () {
  var q = new URLSearchParams(location.search), p = q.get('p') === 'topp' ? 'topp' : 'hoger', m = q.get('m') === 'gt' ? 'gt' : 'rot';
  document.documentElement.dataset.plats = p;
  if (p === 'topp') {
    var k = document.getElementById('ampy-kalkylator'), t = document.getElementById('ampy-plats-topp');
    t.replaceWith(k);
  }
  var bar = document.createElement('div');
  bar.className = 'ampy-forhandsvisning';
  bar.innerHTML = '<span>Förhandsvisning</span>'
    + '<a href="?p=hoger&m=' + m + '"' + (p === 'hoger' ? ' aria-current="true"' : '') + '>Högerspalten</a>'
    + '<a href="?p=topp&m=' + m + '"' + (p === 'topp' ? ' aria-current="true"' : '') + '>Överst i artikeln</a>'
    + '<i></i>'
    + '<a href="?p=' + p + '&m=rot"' + (m === 'rot' ? ' aria-current="true"' : '') + '>ROT</a>'
    + '<a href="?p=' + p + '&m=gt"' + (m === 'gt' ? ' aria-current="true"' : '') + '>Grön teknik</a>';
  document.body.appendChild(bar);
})();
</script>
<script type="module" src="../v1/app.js"></script>
'''
s = s.replace('</body>', body_extra + '</body>', 1)

ut = ROT / 'kalkylator/artikel/index.html'
ut.parent.mkdir(exist_ok=True)
ut.write_text(s, encoding='utf-8')
print(ut, len(s), 'tecken')
