"""Generates in-situ interior mockups from the real artwork images.

Everything is drawn to a single real-world scale: the room is 2.7 m floor to
ceiling, the bench is 45 cm high and 120 cm wide, and each painting is placed at
its recorded size from the Artwork Register. A 180 x 120 cm work therefore reads
as far larger than a 40 x 50 cm one, and hangs with its centre at gallery height.

Re-run after syncing the register:  python3 scripts/generate-mockups.py
"""
import json, hashlib, random, os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def load_ts_array(path):
    src = open(path, encoding='utf-8').read()
    return json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])


mockups = load_ts_array('src/data/mockups.ts')
artworks = {a['slug']: a for a in load_ts_array('src/data/artworks.ts')}


def seedof(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)


# ---------------------------------------------------------------- real-world scale
W, H = 1600, 1100
WALL_H_CM = 270.0          # floor to ceiling
FLOOR_FRAC = 0.80          # where the floor line sits in the frame
VISIBLE_H_CM = WALL_H_CM / FLOOR_FRAC   # total vertical span of the image, in cm
PX_PER_CM = H / VISIBLE_H_CM            # single scale factor for the whole scene
FLOOR_Y = int(H * FLOOR_FRAC)
HANG_CENTRE_CM = 150.0     # gallery standard: centre of the work 150 cm off the floor

cm = lambda v: v * PX_PER_CM            # centimetres -> pixels

ROOMS = {
    'Living Room': ((234, 228, 216), (208, 198, 180)), 'Luxury Home': ((238, 234, 228), (214, 206, 194)),
    'Coastal Home': ((240, 240, 236), (216, 224, 224)), 'Modern Apartment': ((232, 232, 234), (202, 202, 206)),
    'Architectural Interior': ((224, 222, 218), (192, 190, 186)), 'Commercial Space': ((230, 230, 232), (200, 200, 204)),
    'Designer Space': ((236, 230, 226), (210, 200, 194)), 'Penthouse': ((234, 230, 226), (208, 202, 196)),
    'Hotel Lobby': ((228, 224, 218), (200, 194, 186)), 'Boardroom': ((226, 226, 228), (196, 196, 200)),
}
TIMBER_LIGHT, TIMBER_MID, TIMBER_DARK = (214, 184, 140), (198, 165, 120), (170, 136, 94)
REVEAL = (51, 51, 51)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def timber_panel(w, h, rnd, vertical=False):
    p = Image.new('RGB', (max(w, 1), max(h, 1)), TIMBER_MID)
    d = ImageDraw.Draw(p)
    for i in range(0, max(w, h), 2):
        c = lerp(TIMBER_LIGHT, TIMBER_DARK, 0.25 + 0.5 * rnd.random())
        if vertical:
            d.line([(0, i), (w, i)], fill=c)
        else:
            d.line([(i, 0), (i, h)], fill=c)
    return p.filter(ImageFilter.GaussianBlur(0.6))


BENCH_TOP, BENCH_FACE, BENCH_LEG = (206, 174, 128), (176, 143, 99), (150, 119, 80)
BENCH_W_CM, BENCH_H_CM, SEAT_T_CM = 120.0, 45.0, 4.0


def draw_bench(img, rnd):
    """A 120 x 45 cm timber bench, drawn at the same scale as everything else."""
    d = ImageDraw.Draw(img, 'RGBA')
    bw = int(cm(BENCH_W_CM))
    bx = (W - bw) // 2
    seat_t = max(4, int(cm(SEAT_T_CM)))
    leg_h = int(cm(BENCH_H_CM - SEAT_T_CM))
    seat_y = FLOOR_Y + int((H - FLOOR_Y) * 0.30) - leg_h - seat_t
    depth = max(6, int(cm(9)))
    leg_w = max(6, int(cm(4.5)))
    inset = int(bw * 0.10)

    sh = Image.new('RGBA', (bw + 120, leg_h + 90), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([40, leg_h + 10, 40 + bw, leg_h + 58], fill=(0, 0, 0, 80))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    img.paste(sh, (bx - 60, seat_y - 10), sh)

    for lx in (bx + inset, bx + bw - inset - leg_w):
        d.polygon([(lx, seat_y + seat_t), (lx + leg_w, seat_y + seat_t),
                   (lx + leg_w - 2, seat_y + seat_t + leg_h), (lx + 2, seat_y + seat_t + leg_h)],
                  fill=BENCH_LEG + (255,))
    d.rectangle([bx + inset + leg_w, seat_y + seat_t + int(leg_h * 0.62),
                 bx + bw - inset - leg_w, seat_y + seat_t + int(leg_h * 0.62) + 6],
                fill=BENCH_LEG + (230,))
    d.polygon([(bx, seat_y), (bx + bw, seat_y),
               (bx + bw - depth, seat_y - depth), (bx + depth, seat_y - depth)],
              fill=BENCH_TOP + (255,))
    d.rectangle([bx, seat_y, bx + bw, seat_y + seat_t], fill=BENCH_FACE + (255,))
    for i in range(bx, bx + bw, 3):
        d.line([(i, seat_y + 1), (i, seat_y + seat_t - 1)],
               fill=lerp(BENCH_FACE, BENCH_TOP, 0.15 + 0.5 * rnd.random()) + (110,))
    d.line([(bx, seat_y), (bx + bw, seat_y)], fill=(236, 214, 178, 160), width=1)
    d.line([(bx, seat_y + seat_t), (bx + bw, seat_y + seat_t)], fill=(90, 70, 48, 120), width=1)


os.makedirs('public/mockups', exist_ok=True)
skipped = []

for m in mockups:
    a = artworks.get(m['artworkSlug'], {})
    h_cm, w_cm = a.get('heightCm'), a.get('widthCm')

    sd = seedof(m['slug'])
    rnd = random.Random(sd)
    wt, wb = ROOMS.get(m['room'], ROOMS['Living Room'])
    floor = (150, 134, 112)

    img = Image.new('RGB', (W, H))
    px = img.load()
    for y in range(H):
        if y < FLOOR_Y:
            c = lerp(wt, wb, y / FLOOR_Y)
        else:
            t = (y - FLOOR_Y) / (H - FLOOR_Y)
            c = lerp(floor, tuple(max(0, v - 30) for v in floor), t)
        for x in range(W):
            px[x, y] = c
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, FLOOR_Y - 6, W, FLOOR_Y + 4], fill=(255, 255, 255, 60))
    d.rectangle([0, FLOOR_Y, W, H], fill=(255, 255, 255, 10))

    art = Image.open('public/artworks/%s.jpg' % m['artworkSlug']).convert('RGB')

    if h_cm and w_cm:
        # True scale: the painting occupies its real size on a 2.7 m wall.
        th, tw = int(round(cm(h_cm))), int(round(cm(w_cm)))
    else:
        # No recorded size — fall back to a neutral 90 cm height.
        skipped.append(m['artworkSlug'])
        th = int(round(cm(90)))
        tw = int(round(th * art.size[0] / art.size[1]))

    art_r = art.resize((max(tw, 1), max(th, 1)), Image.LANCZOS)
    ax = (W - tw) // 2
    # Hang the centre of the work 150 cm above the floor.
    ay = FLOOR_Y - int(round(cm(HANG_CENTRE_CM))) - th // 2

    FR = max(3, int(round(cm(1.8))))    # slim floating-frame profile
    GAP = max(2, int(round(cm(0.6))))
    ox, oy = ax - FR - GAP, ay - FR - GAP
    ow, oh = tw + 2 * (FR + GAP), th + 2 * (FR + GAP)

    sh = Image.new('RGBA', (ow + 60, oh + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([30, 34, 30 + ow, 34 + oh], fill=(0, 0, 0, 70))
    sh = sh.filter(ImageFilter.GaussianBlur(16))
    img.paste(sh, (ox - 30, oy - 18), sh)

    img.paste(timber_panel(ow, FR, rnd, vertical=True), (ox, oy))
    img.paste(timber_panel(ow, FR, rnd, vertical=True), (ox, oy + oh - FR))
    img.paste(timber_panel(FR, oh, rnd), (ox, oy))
    img.paste(timber_panel(FR, oh, rnd), (ox + ow - FR, oy))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([ox + FR, oy + FR, ox + ow - FR, oy + oh - FR], fill=REVEAL + (255,))
    d.rectangle([ox, oy, ox + ow, oy + oh], outline=(120, 96, 64, 90), width=1)
    d.line([(ox, oy), (ox + ow, oy)], fill=(232, 208, 172, 130), width=1)

    img.paste(art_r, (ax, ay))
    d.rectangle([ax - 1, ay - 1, ax + tw, ay + th], outline=(0, 0, 0, 60), width=1)

    draw_bench(img, rnd)

    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([-400, -400, 650, 520], fill=(255, 244, 220, 38))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    img.save('public/mockups/%s.jpg' % m['slug'], quality=82, optimize=True, progressive=True)

print(f"mockups rendered to scale: {len(mockups)} "
      f"(1 cm = {PX_PER_CM:.2f} px, wall {WALL_H_CM:.0f} cm)")
if skipped:
    print('  no recorded size, drawn at a nominal 90 cm:', ', '.join(skipped))
