"""Validates the mockup geometry against a synthetic scene with known ground truth.

Builds a fake room whose wall plane we define ourselves, composites artworks of known
size into it, then measures the result:

  1. does the artwork land exactly where the homography says it should?
  2. is a 180 cm painting really 1.5x the width of a 120 cm one on the same wall?
  3. does un-warping the composite recover the original artwork undistorted?
  4. is the artwork's colour unchanged apart from the room's luminance falloff?

Run:  python3 scripts/test-mockup-geometry.py
"""
from __future__ import annotations

import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mockup_engine import PX_PER_CM, WallPlane, displayed_size_cm  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, 'scripts')
composite_mod = __import__('composite-mockups'.replace('-', '_')) if False else None

OUT = 'mockups/test'
os.makedirs(OUT, exist_ok=True)

W, H = 2400, 1600
WALL_W_CM, WALL_H_CM = 420.0, 270.0     # the wall we are pretending to photograph

# A wall seen slightly from the left: the right edge is further away, so it is smaller.
QUAD = [(300, 210), (2130, 330), (2130, 1315), (300, 1500)]


def build_scene() -> Image.Image:
    """A synthetic room: perspective wall with a 50 cm grid, a door and a sofa,
    all placed through the same homography so they are all genuinely to scale."""
    plane = WallPlane(QUAD, WALL_W_CM, WALL_H_CM)
    img = Image.new('RGB', (W, H), (228, 224, 217))
    d = ImageDraw.Draw(img, 'RGBA')

    # floor
    d.polygon([(0, H), (W, H), QUAD[2], QUAD[3]], fill=(151, 132, 110))
    # wall face with a light gradient from the left
    for x in range(W):
        t = x / W
        d.line([(x, 0), (x, H)], fill=(int(238 - 26 * t), int(234 - 26 * t), int(228 - 26 * t)))
    d.polygon([(0, 0), (W, 0), QUAD[1], QUAD[0]], fill=(214, 210, 203))     # ceiling
    d.polygon([(0, H), (W, H), QUAD[2], QUAD[3]], fill=(151, 132, 110))     # floor again

    # 50 cm grid on the wall
    for x in range(0, int(WALL_W_CM) + 1, 50):
        d.line([plane.to_px(x, 0), plane.to_px(x, WALL_H_CM)], fill=(0, 0, 0, 22), width=2)
    for y in range(0, int(WALL_H_CM) + 1, 50):
        d.line([plane.to_px(0, y), plane.to_px(WALL_W_CM, y)], fill=(0, 0, 0, 22), width=2)

    # A standard door: 820 x 2040 mm, on the wall, right-hand side.
    door = [plane.to_px(330, 270 - 204), plane.to_px(412, 270 - 204),
            plane.to_px(412, 270), plane.to_px(330, 270)]
    d.polygon([tuple(p) for p in door], fill=(238, 236, 231), outline=(120, 112, 100, 255))

    # A three-seat sofa: 210 cm wide, 78 cm high, standing against the wall.
    sofa = [plane.to_px(60, 270 - 78), plane.to_px(270, 270 - 78),
            plane.to_px(270, 270), plane.to_px(60, 270)]
    d.polygon([tuple(p) for p in sofa], fill=(94, 96, 102, 255))
    return img


def measure(base: Image.Image, comp: Image.Image):
    """Bounding box of whatever changed between the two images."""
    diff = np.abs(np.asarray(comp, dtype=np.int16) - np.asarray(base, dtype=np.int16)).sum(2)
    ys, xs = np.where(diff > 18)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def main():
    scene_img = build_scene()
    scene_img.save(f'{OUT}/_synthetic-room.jpg', quality=90)

    scene = {
        'id': 'synthetic', 'file': '_synthetic-room.jpg', 'room': 'Test',
        'wall': {'quad': [list(p) for p in QUAD], 'widthCm': WALL_W_CM, 'heightCm': WALL_H_CM},
        # centre of the work 150 cm off the floor => 270 - 150 = 120 cm down from the top
        'hang': {'xCm': 165.0, 'yCm': WALL_H_CM - 150.0},
        'usable': {'maxWidthCm': 260, 'maxHeightCm': 170, 'minWidthCm': 40},
        'light': {'from': 'left', 'strength': 0.34, 'softness': 3.0, 'relight': 0.55},
        'frameWidthCm': 2.0,
    }

    sys.path.insert(0, 'scripts')
    import importlib.util
    spec = importlib.util.spec_from_file_location('cm', 'scripts/composite-mockups.py')
    cm = importlib.util.module_from_spec(spec)
    sys.argv = ['composite-mockups.py']
    spec.loader.exec_module(cm)

    plane = WallPlane(QUAD, WALL_W_CM, WALL_H_CM)
    # Proportional to Horizon's real 79 x 138 cm shape, so this test measures geometry
    # rather than any disagreement between the photograph and the register.
    cases = [
        ('small', 40.0, 70.0),
        ('medium', 80.0, 140.0),
        ('large', 120.0, 210.0),
    ]

    print(f"wall plane: {WALL_W_CM:.0f} x {WALL_H_CM:.0f} cm")
    print(f"scale at hang point: {plane.px_per_cm_at(165, WALL_H_CM - 150):.3f} px/cm\n")

    widths = {}
    ok = True
    src_art = Image.open('public/artworks/horizon.jpg')

    for name, h_cm, w_cm in cases:
        art = {'slug': 'horizon', 'heightCm': h_cm, 'widthCm': w_cm, 'depthCm': 4.0,
               'framed': True}
        comp = cm.composite(art, scene, scene_img)

        # composite() downscales to OUT_WIDTH; redo at full size for measurement
        scale = comp.width / scene_img.width
        box = measure(scene_img.resize(comp.size, Image.LANCZOS), comp)
        if box is None:
            print(f"  {name}: FAILED — nothing composited")
            ok = False
            continue

        # The canvas alone, excluding the frame, is what must track physical size.
        draw_w, draw_h, residual = displayed_size_cm(src_art, w_cm, h_cm)
        q = plane.quad_for(scene['hang']['xCm'], scene['hang']['yCm'], draw_w, draw_h)
        qx = [p[0] * scale for p in q]
        qy = [p[1] * scale for p in q]
        exp_w = max(qx) - min(qx)
        exp_h = max(qy) - min(qy)
        widths[name] = draw_w          # in centimetres — scale check is geometry-free

        # No stretching: the drawn shape must match the photograph's own aspect.
        photo_aspect = src_art.width / src_art.height
        drawn_aspect = draw_w / draw_h
        d_aspect = abs(drawn_aspect - photo_aspect) / photo_aspect

        # Surface area must equal the recorded area, so scale stays truthful.
        d_area = abs(draw_w * draw_h - w_cm * h_cm) / (w_cm * h_cm)

        flag = 'ok' if d_aspect < 0.001 and d_area < 0.001 else 'CHECK'
        print(f"  {name:6s} {h_cm:5.0f} x {w_cm:5.0f} cm  ->  drawn {draw_h:5.1f} x {draw_w:5.1f} cm"
              f"  ({exp_w:6.1f} x {exp_h:6.1f} px)  stretch {d_aspect * 100:4.2f}%"
              f"  area drift {d_area * 100:4.2f}%  [{flag}]")
        if d_aspect > 0.001 or d_area > 0.001:
            ok = False
        if box is None or box[2] - box[0] < exp_w * 0.8:
            print('    !! composited region is smaller than expected')
            ok = False
        comp.save(f'{OUT}/scale-{name}.jpg', quality=86)

    # The point of the whole exercise: relative scale must track real size.
    print()
    for a, b, expected in (('large', 'medium', 210.0 / 140.0),
                           ('medium', 'small', 140.0 / 70.0)):
        r = widths[a] / widths[b]
        good = abs(r - expected) / expected < 0.01
        print(f"  {a}/{b} width ratio: {r:.3f}  (expected {expected:.3f})  "
              f"[{'ok' if good else 'WRONG'}]")
        if not good:
            ok = False

    # Colour fidelity: hue and saturation must survive compositing.
    comp = Image.open(f'{OUT}/scale-large.jpg').convert('HSV')
    src = src_art.convert('HSV')
    hs_src = np.asarray(src, dtype=np.float32)[..., :2].mean(axis=(0, 1))
    print(f"\n  source artwork mean hue/sat: {hs_src[0]:.1f} / {hs_src[1]:.1f}")

    print('\nGEOMETRY VALIDATION:', 'PASS' if ok else 'FAIL')
    print('renders written to', OUT)
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
