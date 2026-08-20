"""Generate the site's favicon, Apple touch icon, PWA icon and Organization
logo — a simple ink-on-bone "R" monogram consistent with the site palette
(tailwind.config.ts) and serif family (Georgia, the CSS fallback for
--font-serif). No external assets or network calls; pure PIL.

Run: python3 scripts/generate-brand-icons.py
Outputs:
  src/app/icon.png      512x512  — Next.js favicon convention
  src/app/apple-icon.png 180x180 — Next.js Apple touch icon convention
  public/logo.png        512x512 — Organization/Person schema `logo`
  public/icon-512.png    512x512 — PWA manifest icon
"""
from __future__ import annotations
import os
from PIL import Image, ImageDraw, ImageFont

INK = (0x1a, 0x1a, 0x18, 255)
BONE = (0xf6, 0xf4, 0xef, 255)
FONT_PATH = "C:/Windows/Fonts/georgia.ttf"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def monogram(size: int, bg, fg, letter: str = "R", inset: float = 0.0) -> Image.Image:
    """A centred serif monogram on a solid square background."""
    img = Image.new("RGBA", (size, size), bg)
    draw = ImageDraw.Draw(img)
    # Binary-search the largest font size that fits within (1 - 2*inset) of the canvas.
    target = size * (1 - 2 * inset)
    lo, hi = 1, size * 2
    best = lo
    while lo <= hi:
        mid = (lo + hi) // 2
        font = ImageFont.truetype(FONT_PATH, mid)
        bbox = draw.textbbox((0, 0), letter, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        if max(w, h) <= target:
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1
    font = ImageFont.truetype(FONT_PATH, best)
    bbox = draw.textbbox((0, 0), letter, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), letter, font=font, fill=fg)
    return img


def save(img: Image.Image, rel_path: str) -> None:
    path = os.path.join(ROOT, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print(f"wrote {rel_path}  ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    # Favicon / manifest / logo: ink background, bone letter — reads at any size,
    # matches the dark footer and the site's primary ink tone.
    save(monogram(512, INK, BONE, inset=0.14), "src/app/icon.png")
    save(monogram(512, INK, BONE, inset=0.14), "public/icon-512.png")

    # Apple touch icon: solid background required (no transparency), slightly
    # tighter inset since iOS applies its own corner rounding.
    save(monogram(180, INK, BONE, inset=0.16).convert("RGB"), "src/app/apple-icon.png")

    # Organization/Person schema logo: bone background so it reads on both
    # light and dark surfaces when third parties (Knowledge Panel, directories)
    # place it on their own chrome.
    save(monogram(512, BONE, INK, inset=0.14), "public/logo.png")
