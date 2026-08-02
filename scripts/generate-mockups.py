"""Generates in-situ interior mockups from the real artwork images.
Light timber (oak) floating frame. Re-run: python3 scripts/generate-mockups.py"""
import json, hashlib, random, os
from PIL import Image, ImageDraw, ImageFilter

src = open('src/data/mockups.ts').read()
arr = json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])
def seedof(s): return int(hashlib.md5(s.encode()).hexdigest(), 16)

ROOMS = {
 'Living Room':((234,228,216),(208,198,180)),'Luxury Home':((238,234,228),(214,206,194)),
 'Coastal Home':((240,240,236),(216,224,224)),'Modern Apartment':((232,232,234),(202,202,206)),
 'Architectural Interior':((224,222,218),(192,190,186)),'Commercial Space':((230,230,232),(200,200,204)),
 'Designer Space':((236,230,226),(210,200,194)),'Penthouse':((234,230,226),(208,202,196)),
 'Hotel Lobby':((228,224,218),(200,194,186)),'Boardroom':((226,226,228),(196,196,200)),
}
# light timber / natural oak
TIMBER_LIGHT = (214, 184, 140)
TIMBER_MID   = (198, 165, 120)
TIMBER_DARK  = (170, 136,  94)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def timber_panel(w, h, rnd, vertical=False):
    """A wood-grain panel with subtle striations."""
    p = Image.new('RGB', (max(w,1), max(h,1)), TIMBER_MID)
    d = ImageDraw.Draw(p)
    n = max(w, h)
    for i in range(0, n, 2):
        t = rnd.random()
        c = lerp(TIMBER_LIGHT, TIMBER_DARK, 0.25 + 0.5 * t)
        if vertical: d.line([(0, i), (w, i)], fill=c)
        else:        d.line([(i, 0), (i, h)], fill=c)
    return p.filter(ImageFilter.GaussianBlur(0.6))

os.makedirs('public/mockups', exist_ok=True)
for m in arr:
    sd = seedof(m['slug']); rnd = random.Random(sd)
    W, H = 1600, 1100
    wt, wb = ROOMS.get(m['room'], ROOMS['Living Room']); floor = (150, 134, 112)
    img = Image.new('RGB', (W, H)); px = img.load(); fh = int(H * 0.80)
    for y in range(H):
        if y < fh: c = lerp(wt, wb, y / fh)
        else:
            t = (y - fh) / (H - fh); c = lerp(floor, tuple(max(0, v - 30) for v in floor), t)
        for x in range(W): px[x, y] = c
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, fh - 6, W, fh + 4], fill=(255, 255, 255, 60))
    d.rectangle([0, fh, W, H], fill=(255, 255, 255, 10))

    art = Image.open('public/artworks/%s.jpg' % m['artworkSlug']).convert('RGB')
    aw, ah = art.size
    th = int(H * 0.52); tw = int(th * aw / ah)
    if tw > W * 0.46: tw = int(W * 0.46); th = int(tw * ah / aw)
    art_r = art.resize((tw, th), Image.LANCZOS)
    ax = (W - tw) // 2; ay = int(fh * 0.5) - th // 2 + int(H * 0.03)

    FR = 11                     # frame width
    GAP = 5                     # shadow gap of a floating frame
    ox, oy = ax - FR - GAP, ay - FR - GAP
    ow, oh = tw + 2 * (FR + GAP), th + 2 * (FR + GAP)

    # wall shadow behind the frame
    sh = Image.new('RGBA', (ow + 60, oh + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([30, 34, 30 + ow, 34 + oh], fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(16)); img.paste(sh, (ox - 30, oy - 18), sh)

    # timber frame: four mitred rails
    img.paste(timber_panel(ow, FR, rnd, vertical=True),  (ox, oy))                 # top
    img.paste(timber_panel(ow, FR, rnd, vertical=True),  (ox, oy + oh - FR))       # bottom
    img.paste(timber_panel(FR, oh, rnd),                 (ox, oy))                 # left
    img.paste(timber_panel(FR, oh, rnd),                 (ox + ow - FR, oy))       # right
    d = ImageDraw.Draw(img, 'RGBA')
    # inner reveal (dark gap) + soft edge definition
    d.rectangle([ox + FR, oy + FR, ox + ow - FR, oy + oh - FR], fill=(38, 32, 26, 255))
    d.rectangle([ox, oy, ox + ow, oy + oh], outline=(120, 96, 64, 90), width=1)
    d.line([(ox, oy), (ox + ow, oy)], fill=(232, 208, 172, 140), width=2)  # top light catch

    img.paste(art_r, (ax, ay))
    d.rectangle([ax - 1, ay - 1, ax + tw, ay + th], outline=(0, 0, 0, 60), width=1)

    cy = int(fh + (H - fh) * 0.16)
    d.rectangle([int(W * 0.30), cy, int(W * 0.70), cy + 11], fill=(60, 50, 42, 175))
    d.line([(int(W * 0.34), cy), (int(W * 0.34), cy + 95)], fill=(60, 50, 42, 145), width=9)
    d.line([(int(W * 0.66), cy), (int(W * 0.66), cy + 95)], fill=(60, 50, 42, 145), width=9)

    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([-400, -400, 650, 520], fill=(255, 244, 220, 38))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    img.save('public/mockups/%s.jpg' % m['slug'], quality=82, optimize=True, progressive=True)

print("mockups regenerated with light timber frames:", len(arr))
