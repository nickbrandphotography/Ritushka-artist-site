"""Normalises master interior photographs.

Downscales to 2400 px on the long edge, strips EXIF, converts to sRGB JPEG, and reports
each file's dimensions so the wall quad can be calibrated against them.

Run after dropping new photographs into mockups/scenes/:

    python3 scripts/ingest-scenes.py
"""
from __future__ import annotations

import json
import os

from PIL import Image, ImageCms

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

SCENE_DIR = 'mockups/scenes'
MAX_EDGE = 2400
QUALITY = 90


def main():
    scenes = {}
    if os.path.exists('mockups/scenes.json'):
        scenes = {s['file']: s for s in json.load(open('mockups/scenes.json', encoding='utf-8'))['scenes']}

    files = sorted(f for f in os.listdir(SCENE_DIR)
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
    if not files:
        print(f'No photographs in {SCENE_DIR} yet — see {SCENE_DIR}/README.md')
        return

    for f in files:
        path = os.path.join(SCENE_DIR, f)
        img = Image.open(path)
        original = img.size

        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        if max(img.size) > MAX_EDGE:
            scale = MAX_EDGE / max(img.size)
            img = img.resize((round(img.width * scale), round(img.height * scale)),
                             Image.LANCZOS)

        out = os.path.splitext(path)[0] + '.jpg'
        clean = Image.new('RGB', img.size)
        clean.putdata(list(img.convert('RGB').getdata()))       # drops EXIF and metadata
        clean.save(out, quality=QUALITY, optimize=True, progressive=True)
        if out != path:
            os.remove(path)

        calibrated = os.path.basename(out) in scenes
        print(f"  {os.path.basename(out):34s} {original[0]}x{original[1]} -> "
              f"{clean.width}x{clean.height}  {os.path.getsize(out) // 1024} KB"
              f"  {'calibrated' if calibrated else 'NEEDS CALIBRATION'}")

    print(f"\n{len(files)} scene(s). Calibrate any marked NEEDS CALIBRATION in "
          "mockups/scenes.json — see mockups/README.md.")


if __name__ == '__main__':
    main()
