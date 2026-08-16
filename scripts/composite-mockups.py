"""Composites artworks into the master interior scenes.

    python3 scripts/composite-mockups.py                 # render what changed
    python3 scripts/composite-mockups.py --force         # render everything
    python3 scripts/composite-mockups.py --only <slug>   # one mockup
    python3 scripts/composite-mockups.py --check <scene> # calibration overlay

Only mockups whose artwork, scene config or engine version changed are re-rendered,
so adding one artwork costs one image.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mockup_engine import (ENGINE_VERSION, PX_PER_CM, WallPlane, cast_shadow,  # noqa: E402
                           choose_placement, contact_shadow, placements_of, displayed_size_cm, multiply_shadow, relight,
                           render_panel, warp_into)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SCENES_JSON = 'mockups/scenes.json'
MANIFEST = 'mockups/manifest.json'
SCENE_DIR = 'mockups/scenes'
OUT_DIR = 'public/mockups'
OUT_WIDTH = 1800
OUT_QUALITY = 84


def load_ts_array(path):
    src = open(path, encoding='utf-8').read()
    return json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])


def file_hash(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()[:16]


def signature(art, scene, art_hash, scene_hash):
    """Everything that affects the output. Changes here trigger a re-render."""
    payload = {
        'engine': ENGINE_VERSION,
        'art': art_hash,
        'scene': scene_hash,
        'dims': [art.get('heightCm'), art.get('widthCm'), art.get('depthCm')],
        'framed': art.get('framed'),
        'geometry': [scene['wall'], placements_of(scene), scene['light']],
        'out': [OUT_WIDTH, OUT_QUALITY],
    }
    return hashlib.sha1(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16]


# ------------------------------------------------------------------------ the composite
def composite(art_meta, scene, scene_img):
    """Place one artwork into one scene photograph, to scale."""
    plane = WallPlane(scene['wall']['quad'], scene['wall']['widthCm'], scene['wall']['heightCm'])

    h_cm = art_meta.get('heightCm')
    w_cm = art_meta.get('widthCm')
    if not h_cm or not w_cm:
        raise ValueError(f"{art_meta['slug']} has no recorded dimensions")

    depth_cm = art_meta.get('depthCm') or 4.0
    framed = bool(art_meta.get('framed'))
    frame_cm = float(scene.get('frameWidthCm', 2.0))

    art = Image.open('public/artworks/%s.jpg' % art_meta['slug'])
    # Keep the photograph's aspect ratio; match the recorded surface area.
    draw_w, draw_h, residual = displayed_size_cm(art, w_cm, h_cm)
    if residual > 0.03:
        print(f"     note: {art_meta['slug']} photo and register disagree on shape by "
              f"{residual * 100:.0f}% — drawn undistorted at "
              f"{draw_h:.0f} x {draw_w:.0f} cm; worth re-measuring")
    panel = render_panel(art, draw_w, draw_h, framed, frame_cm,
                         seed=int(hashlib.md5(art_meta['slug'].encode()).hexdigest()[:8], 16))

    # Panel is the artwork plus frame, so it is slightly larger than the canvas.
    panel_w_cm = panel.width / PX_PER_CM
    panel_h_cm = panel.height / PX_PER_CM

    place = choose_placement(scene, panel_w_cm, panel_h_cm)
    if place is None:
        raise ValueError(f"{art_meta['slug']} ({h_cm}x{w_cm} cm) does not fit any "
                         f"hanging position in {scene['id']}")
    cx, cy = place['xCm'], place['yCm']
    quad = plane.quad_for(cx, cy, panel_w_cm, panel_h_cm)
    local_scale = plane.px_per_cm_at(cx, cy)

    out = scene_img.convert('RGB')
    light = scene.get('light', {})
    side = light.get('from', 'left')

    # Shadows go down before the artwork does.
    cast = cast_shadow(out.size, quad, side, depth_cm, local_scale,
                       float(light.get('strength', 0.34)),
                       float(light.get('softness', 3.0)))
    out = multiply_shadow(out, cast)
    out = multiply_shadow(out, contact_shadow(out.size, quad, local_scale))

    layer = warp_into(panel, quad, out.size)
    layer = relight(layer, out, quad,
                    strength=float(light.get('relight', 0.55)),
                    exposure=float(light.get('exposure', 1.0)))
    out = Image.alpha_composite(out.convert('RGBA'), layer).convert('RGB')

    if out.width > OUT_WIDTH:
        h = round(out.height * OUT_WIDTH / out.width)
        out = out.resize((OUT_WIDTH, h), Image.LANCZOS)
    return out


def calibration_overlay(scene, scene_img):
    """Draw the wall quad, hang point and a 100 cm ruler, to check the geometry by eye."""
    plane = WallPlane(scene['wall']['quad'], scene['wall']['widthCm'], scene['wall']['heightCm'])
    img = scene_img.convert('RGB').copy()
    d = ImageDraw.Draw(img, 'RGBA')

    d.polygon([tuple(p) for p in scene['wall']['quad']], outline=(255, 60, 60, 255))
    step = 50
    for x in range(0, int(scene['wall']['widthCm']) + 1, step):
        d.line([plane.to_px(x, 0), plane.to_px(x, scene['wall']['heightCm'])],
               fill=(255, 60, 60, 90), width=2)
    for y in range(0, int(scene['wall']['heightCm']) + 1, step):
        d.line([plane.to_px(0, y), plane.to_px(scene['wall']['widthCm'], y)],
               fill=(255, 60, 60, 90), width=2)

    for pl in placements_of(scene):
        cx, cy = pl['xCm'], pl['yCm']
        p = plane.to_px(cx, cy)
        d.ellipse([p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9], fill=(40, 200, 90, 255))
        a, b = plane.to_px(cx - 50, cy), plane.to_px(cx + 50, cy)
        d.line([a, b], fill=(40, 200, 90, 255), width=5)
        d.text((a[0], a[1] - 28), f"100 cm  [{pl.get('id', '')}]", fill=(40, 200, 90, 255))
        q = plane.quad_for(cx, cy, pl.get('maxWidthCm', 150), pl.get('maxHeightCm', 120))
        d.polygon([tuple(pt) for pt in q], outline=(60, 140, 255, 255))
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--only')
    ap.add_argument('--check', metavar='SCENE_ID')
    args = ap.parse_args()

    if not os.path.exists(SCENES_JSON):
        sys.exit(f"No {SCENES_JSON} yet — add master interiors first (see mockups/README.md).")

    scenes = {s['id']: s for s in json.load(open(SCENES_JSON, encoding='utf-8'))['scenes']}

    if args.check:
        s = scenes[args.check]
        img = Image.open(os.path.join(SCENE_DIR, s['file']))
        os.makedirs('mockups/calibration', exist_ok=True)
        out = f"mockups/calibration/{s['id']}.jpg"
        calibration_overlay(s, img).save(out, quality=88)
        print('calibration overlay ->', out)
        return

    artworks = {a['slug']: a for a in load_ts_array('src/data/artworks.ts')}
    mockups = load_ts_array('src/data/mockups.ts')
    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}

    scene_hashes = {i: file_hash(os.path.join(SCENE_DIR, s['file'])) for i, s in scenes.items()}
    scene_cache = {}
    os.makedirs(OUT_DIR, exist_ok=True)

    rendered = skipped = failed = 0
    for m in mockups:
        if args.only and m['slug'] != args.only:
            continue
        art = artworks.get(m['artworkSlug'])
        scene = scenes.get(m.get('sceneId'))
        if not art or not scene:
            print('  skip (no artwork or scene):', m['slug'])
            failed += 1
            continue

        art_path = 'public/artworks/%s.jpg' % art['slug']
        if not os.path.exists(art_path):
            print('  skip (missing image):', art_path)
            failed += 1
            continue

        sig = signature(art, scene, file_hash(art_path), scene_hashes[scene['id']])
        out_path = os.path.join(OUT_DIR, m['slug'] + '.jpg')
        if not args.force and manifest.get(m['slug']) == sig and os.path.exists(out_path):
            skipped += 1
            continue

        if scene['id'] not in scene_cache:
            scene_cache[scene['id']] = Image.open(os.path.join(SCENE_DIR, scene['file']))
        try:
            img = composite(art, scene, scene_cache[scene['id']])
        except Exception as e:                                    # noqa: BLE001
            print('  FAILED', m['slug'], '-', e)
            failed += 1
            continue
        img.save(out_path, quality=OUT_QUALITY, optimize=True, progressive=True)
        manifest[m['slug']] = sig
        rendered += 1
        print('  rendered', m['slug'])

    json.dump(manifest, open(MANIFEST, 'w', encoding='utf-8'), indent=1, sort_keys=True)
    print(f"rendered {rendered}, unchanged {skipped}, failed {failed}")


if __name__ == '__main__':
    main()
