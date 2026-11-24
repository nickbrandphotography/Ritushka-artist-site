"""Turns the measured AI interiors in mockups/rooms.json into calibrated scenes.

    python3 scripts/calibrate-rooms.py --src <folder with the room images>

For each room it copies the image (byte for byte, so its provenance metadata stays
intact) to mockups/scenes/<id>.jpg and writes a scene into mockups/scenes.json,
replacing any earlier entry with the same id. Scenes not listed in rooms.json are
left alone.

A straight-on room is measured as the back wall's bounding box plus its real height.
Pixels are square on a wall facing the camera, so the width follows from the height.
The hanging position is worked out from what stands in front of the wall:

  - above furniture (hangAbove), the bottom edge sits 20 cm above its highest point;
    on an open wall the centre is 150 cm off the floor (gallery convention)
  - works are centred on the furniture below (centreX) when there is some
  - the top edge stays 25 cm below the ceiling, or below anything hanging from it
  - the sides keep within the clear stretch of wall
"""
from __future__ import annotations

import argparse
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

GAP_ABOVE_FURNITURE_CM = 20
GAP_BELOW_CEILING_CM = 25
SIDE_MARGIN_CM = 10
EYE_LEVEL_CM = 150


def straight_on(r: dict) -> dict:
    left, top, right, bottom = r['wall']
    s = (bottom - top) / r['heightCm']                     # px per cm on the wall
    width_cm = (right - left) / s
    x1, x2 = r['clear']
    cx = r.get('centreX', (x1 + x2) / 2)        # centre on the furniture below, if any
    bottom_y = (r['furnitureTop'] - top) / s - GAP_ABOVE_FURNITURE_CM
    top_y = (max(r.get('topLimit', top), top) - top) / s + GAP_BELOW_CEILING_CM
    max_w = 2 * min(cx - x1, x2 - cx) / s - 2 * SIDE_MARGIN_CM
    place = {
        'id': 'main-wall',
        'xCm': round((cx - left) / s, 1),
        # Above a sofa, bed or desk a work sits a set gap above it, as a designer
        # would hang it; on an open wall its centre is at eye level.
        'yCm': round(bottom_y if r.get('hangAbove') else r['heightCm'] - EYE_LEVEL_CM, 1),
        'maxWidthCm': round(max_w, 1),
        'maxHeightCm': round(bottom_y - top_y, 1),
        'minWidthCm': round(max_w * 0.22, 1),
        'bottomYCm': round(bottom_y, 1),
        'topYCm': round(top_y, 1),
    }
    return {
        'wall': {'quad': [[left, top], [right, top], [right, bottom], [left, bottom]],
                 'widthCm': round(width_cm, 1), 'heightCm': r['heightCm']},
        'placements': [place],
        '_calibration': f"{s:.3f} px/cm. {r.get('note', '')}".strip(),
    }


def angled(r: dict) -> dict:
    return {
        'wall': {'quad': r['quad'], 'widthCm': r['widthCm'], 'heightCm': r['heightCm']},
        'camera': {k: r[k] for k in ('focalPx', 'principalY') if k in r},
        'placements': r['placements'],
        '_calibration': r.get('note', ''),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True, help='folder holding the room images named in rooms.json')
    args = ap.parse_args()

    rooms = json.load(open('mockups/rooms.json', encoding='utf-8'))['rooms']
    # These rooms were made to suit any of the collections, so unless a room says
    # otherwise it is open to all of them.
    src = open('src/data/artworks.ts', encoding='utf-8').read()
    collections = sorted({a['primaryCollection'] for a in
                          json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])})
    data = json.load(open('mockups/scenes.json', encoding='utf-8'))
    by_id = {s['id']: i for i, s in enumerate(data['scenes'])}

    for r in rooms:
        file = f"{r['id']}.jpg"
        shutil.copyfile(os.path.join(args.src, r['src']), os.path.join('mockups/scenes', file))
        geo = angled(r) if 'quad' in r else straight_on(r)
        scene = {
            'id': r['id'],
            'name': r['name'],
            'room': r['room'],
            'file': file,
            **geo,
            'light': {'from': r['light'], 'strength': 0.30, 'softness': 3.5, 'relight': 0.5,
                      'exposure': 1.0},
            'match': {'orientations': r.get('orientations', ['landscape', 'portrait', 'square']),
                      'palettes': r['palettes'],
                      'styles': r.get('styles', collections)},
            'credit': None,
            'source': 'AI-generated interior (Google Gemini / Nano Banana), Nov 2026',
        }
        if r['id'] in by_id:
            data['scenes'][by_id[r['id']]] = scene
        else:
            data['scenes'].append(scene)
        p = scene['placements'][0]
        print(f"  {r['id']:26s} wall {scene['wall']['widthCm']:6.0f} x {scene['wall']['heightCm']:4.0f} cm"
              f"   takes up to {p['maxWidthCm']:5.0f} x {p['maxHeightCm']:4.0f} cm")

    json.dump(data, open('mockups/scenes.json', 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
    print(f"{len(rooms)} rooms calibrated into mockups/scenes.json")


if __name__ == '__main__':
    main()
