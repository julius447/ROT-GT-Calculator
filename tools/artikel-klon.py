"""Bygger kalkylator/artikel/index.html: en statisk klon av artikelmallen (ampy.se/elcentral-guide-2026/, renderad DOM)
med Avdragskollen (källan kalkylator/v1) överst i artikelspalten, före Snabbt svar-kortet: den enda placeringen
(ägarbeslut 2026-09-21; högerspalten och förhandsvisningsraden togs bort). Läget med ?m=rot|gt. Klonen: skript
borta, cookie-rutan borta, Bricks' "dold tills animation" borta, lazy-bakgrunder visade, sajtens CSS sparad lokalt,
bilder från ampy.se (absoluta URL:er). Klonen är REFERENSEN för produktion/preview/artikel-*.html (paritet.mjs).

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

# 4b. sajtens stylesheets sparas lokalt (FlyingPress byter hashar vid cache-rens: länkarna 404:ar annars, research/13 M5).
#     Relativa url() i CSS:en löses mot originaladressen så bilder fortfarande hämtas från ampy.se.
import urllib.request, hashlib
from urllib.parse import urljoin
cssdir = ROT / 'kalkylator/artikel/css'; cssdir.mkdir(exist_ok=True)
def spara_css(m):
    url = m.group(1)
    namn = url.rsplit('/', 1)[-1].split('?')[0]
    mal = cssdir / namn
    if not mal.exists():
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            css = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
        except Exception as e:
            print('CSS kunde inte hämtas, länken behålls:', url, e); return m.group(0)
        css = re.sub(r"url\((['\"]?)(?!data:|https?:|//)([^'\")]+)\1\)", lambda u: 'url(' + u.group(1) + urljoin(url, u.group(2)) + u.group(1) + ')', css)
        mal.write_text(css, encoding='utf-8')
    return m.group(0).replace(url, 'css/' + namn)
s = re.sub(r'<link[^>]+rel="stylesheet"[^>]+href="(https://ampy\.se/[^"]+\.css[^"]*)"[^>]*>', spara_css, s)

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

# 6. placeringen: först i artikelspalten (#brxe-pfbtud, Bricks Block), direkt efter artikelns Code-element (CSS:en)
#    och före Snabbt svar-kortet (#brxe-vjjqxy)
i = s.find('id="brxe-pfbtud"')
e = s.find('</style></div>', i)
assert e > 0, 'hittar inte artikelns stylesheet-element'
e += len('</style></div>')
assert s.find('id="brxe-vjjqxy"', e) - e < 200, 'Snabbt svar-kortet följer inte direkt på Code-elementet'
s = s[:e] + kalkylator + s[e:]

# 7. head: kalkylatorns CSS + inbäddningsregler; body-slut: app.js
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
<script type="module" src="../v1/app.js"></script>
'''
s = s.replace('</body>', body_extra + '</body>', 1)

ut = ROT / 'kalkylator/artikel/index.html'
ut.parent.mkdir(exist_ok=True)
ut.write_text(s, encoding='utf-8')
print(ut, len(s), 'tecken')
