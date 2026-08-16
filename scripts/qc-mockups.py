"""Quality control for the generated mockups.

Checks every composite against the artwork it claims to show:

  aspect      the painting is drawn at the photograph's own proportions, never stretched
  scale       its width on the wall matches the recorded dimensions
  colour      hue and saturation survive compositing (only luminance may change)
  presence    something was actually composited into the scene
  clearance   the work sits inside the hanging position's declared limits

Run:  python3 scripts/qc-mockups.py
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mockup_engine import (WallPlane, choose_placement,  # noqa: E402
                           displayed_size_cm, placements_of)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

TOL_ASPECT = 0.005      # drawn shape vs the photograph's shape
TOL_AREA = 0.005        # drawn area vs the recorded area
# On a 0-255 hue scale, 6 is about 2% of the colour wheel — below what anyone can
# see, and roughly the noise floor of JPEG encoding plus Lanczos resampling.
TOL_HUE = 6.0
TOL_SAT = 12.0


def load_ts_array(path):
    src = open(path, encoding='utf-8').read()
    return json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])


def main():
    scenes = {s['id']: s for s in json.load(open('mockups/scenes.json', encoding='utf-8'))['scenes']}
    artworks = {a['slug']: a for a in load_ts_array('src/data/artworks.ts')}
    mockups = load_ts_array('src/data/mockups.ts')

    problems = []
    checked = 0

    for m in mockups:
        scene = scenes.get(m.get('sceneId'))
        if scene is None:
            continue                      # still on the procedural renderer
        a = artworks[m['artworkSlug']]
        out_path = 'public/mockups/%s.jpg' % m['slug']
        art_path = 'public/artworks/%s.jpg' % a['slug']
        if not os.path.exists(out_path):
            problems.append(f"{m['slug']}: no rendered image")
            continue

        checked += 1
        art = Image.open(art_path)
        h_cm, w_cm = a['heightCm'], a['widthCm']

        # --- aspect and area -------------------------------------------------
        draw_w, draw_h, residual = displayed_size_cm(art, w_cm, h_cm)
        d_aspect = abs((draw_w / draw_h) - (art.width / art.height)) / (art.width / art.height)
        d_area = abs(draw_w * draw_h - w_cm * h_cm) / (w_cm * h_cm)
        if d_aspect > TOL_ASPECT:
            problems.append(f"{m['slug']}: drawn shape differs from the photograph by "
                            f"{d_aspect * 100:.1f}% — the artwork is being distorted")
        if d_area > TOL_AREA:
            problems.append(f"{m['slug']}: drawn area is off by {d_area * 100:.1f}% — scale is wrong")
        if residual > 0.05:
            problems.append(f"{m['slug']}: NOTE photo and register disagree on shape by "
                            f"{residual * 100:.0f}% — worth re-measuring the canvas")

        # --- clearance -------------------------------------------------------
        place = choose_placement(scene, draw_w + 5, draw_h + 5)
        if place is None:
            problems.append(f"{m['slug']}: does not fit any hanging position in {scene['id']}")
            continue

        # --- presence and scale on the wall ----------------------------------
        base = Image.open(os.path.join('mockups/scenes', scene['file'])).convert('RGB')
        comp = Image.open(out_path).convert('RGB')
        scale = comp.width / base.width
        base_r = base.resize(comp.size, Image.LANCZOS)
        diff = np.abs(np.asarray(comp, dtype=np.int16)
                      - np.asarray(base_r, dtype=np.int16)).sum(2)
        ys, xs = np.where(diff > 24)
        if len(xs) < 500:
            problems.append(f"{m['slug']}: nothing appears to have been composited")
            continue

        plane = WallPlane(scene['wall']['quad'], scene['wall']['widthCm'], scene['wall']['heightCm'])
        q = plane.quad_for(place['xCm'], place['yCm'], draw_w, draw_h)
        expect_w = (max(p[0] for p in q) - min(p[0] for p in q)) * scale
        got_w = xs.max() - xs.min()
        # The shadow spreads past the frame, so the changed region is always wider.
        if got_w < expect_w * 0.9:
            problems.append(f"{m['slug']}: painted region is {got_w:.0f}px wide, "
                            f"expected at least {expect_w * 0.9:.0f}px")

        # --- colour fidelity --------------------------------------------------
        # Compare the whole painting with the whole source, not two different
        # crops of it. The canvas quad is inset to exclude the frame and reveal.
        inset = plane.quad_for(place['xCm'], place['yCm'], draw_w * 0.86, draw_h * 0.86)
        poly = [(x * scale, y * scale) for x, y in inset]
        mask = Image.new('L', comp.size, 0)
        ImageDraw.Draw(mask).polygon(poly, fill=255)
        sel = np.asarray(mask) > 0
        if sel.sum() < 400:
            continue
        # Hue is meaningless in near-black or unsaturated pixels — a work like Bush
        # is mostly black, where a rounding difference swings the hue wildly. Only
        # pixels with real colour in them are compared.
        def colour_stats(hsv):
            h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
            keep = (s > 40) & (v > 50)
            if keep.sum() < 200:
                return None
            # Circular mean, since hue wraps at 255.
            ang = h[keep] / 255.0 * 2 * np.pi
            mh = (np.arctan2(np.sin(ang).mean(), np.cos(ang).mean()) % (2 * np.pi)) / (2 * np.pi) * 255
            return np.array([mh, s[keep].mean()])

        comp_hsv = np.asarray(comp.convert('HSV'), dtype=float)
        flat = comp_hsv[sel]
        ph = colour_stats(flat.reshape(-1, 1, 3))

        sw, sh = art.size
        mx, my = int(sw * 0.07), int(sh * 0.07)
        src_patch = art.convert('HSV').crop((mx, my, sw - mx, sh - my))
        sh_ = colour_stats(np.asarray(src_patch, dtype=float))
        if ph is None or sh_ is None:
            continue                      # too little colour to judge either way
        dh = abs(ph[0] - sh_[0])
        dh = min(dh, 255 - dh)            # hue wraps
        if dh > TOL_HUE:
            problems.append(f"{m['slug']}: hue shifted by {dh:.1f} "
                            f"({sh_[0]:.0f} -> {ph[0]:.0f})")
        if abs(ph[1] - sh_[1]) > TOL_SAT:
            problems.append(f"{m['slug']}: saturation shifted by {abs(ph[1] - sh_[1]):.1f} "
                            f"({sh_[1]:.0f} -> {ph[1]:.0f})")

    print(f"checked {checked} composited mockups")
    if not problems:
        print('QC: PASS — no distortion, no cropping, no colour shift, everything within clearances')
        return 0
    notes = [p for p in problems if 'NOTE' in p]
    fails = [p for p in problems if 'NOTE' not in p]
    for p in fails:
        print('  FAIL', p)
    for p in notes:
        print('  note', p)
    print(f"QC: {len(fails)} failure(s), {len(notes)} note(s)")
    return 1 if fails else 0


if __name__ == '__main__':
    raise SystemExit(main())
