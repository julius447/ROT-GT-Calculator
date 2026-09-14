"""Skapar galleribilder ur desktop-skärmdumpar: hitta verktygets ruta (icke-vita pixlar), beskär med luft, skala till 1400 px bredd.
Användning: python3 tools/galleri.py <in.png> <ut.jpg> [max_hojd_px_i_2x]"""
import sys
from PIL import Image, ImageChops

src, dst = sys.argv[1], sys.argv[2]
max_h = int(sys.argv[3]) if len(sys.argv) > 3 else 1300
im = Image.open(src).convert('RGB')
w, h = im.size
top = im.crop((0, 0, w, min(h, max_h)))
# hitta innehållets ruta mot vit bakgrund
bg = Image.new('RGB', top.size, (255, 255, 255))
diff = ImageChops.difference(top, bg).convert('L').point(lambda p: 255 if p > 8 else 0)
box = diff.getbbox()
if not box:
    box = (0, 0, w, min(h, max_h))
pad = 48
x0, y0, x1, y1 = box
x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
x1, y1 = min(w, x1 + pad), min(top.size[1], y1 + pad)
out = top.crop((x0, y0, x1, y1))
target_w = 1400
out = out.resize((target_w, round(out.size[1] * target_w / out.size[0])), Image.LANCZOS)
out.save(dst, 'JPEG', quality=86, optimize=True)
print(dst, out.size, 'box', box)
