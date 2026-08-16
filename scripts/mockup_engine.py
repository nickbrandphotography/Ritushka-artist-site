"""Geometry and compositing engine for the interior mockup system.

The one idea worth holding on to: every scene defines a *wall plane*. Four points in
the photograph mark the corners of a rectangle whose real size we know, which gives a
homography mapping wall-plane centimetres to image pixels. Artwork is laid out in
centimetres on that plane and warped into the photograph — so physical scale, and the
foreshortening of an angled wall, both come out for free.

Nothing here is expressed as a percentage of the image.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Resolution of the flat wall-space render, before warping into the photograph.
# 8 px/cm gives a 180 cm painting a 1440 px panel — ample for a 2400 px scene.
PX_PER_CM = 8.0

ENGINE_VERSION = 3  # bump to force a full re-render


# --------------------------------------------------------------------------- geometry
def homography(src: list, dst: list) -> np.ndarray:
    """3x3 matrix mapping src quad -> dst quad. Points are [(x, y), ...] x4."""
    a = []
    b = []
    for (x, y), (u, v) in zip(src, dst):
        a.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        a.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        b += [u, v]
    h = np.linalg.solve(np.asarray(a, dtype=float), np.asarray(b, dtype=float))
    return np.append(h, 1.0).reshape(3, 3)


def apply_h(h: np.ndarray, pt) -> tuple:
    x, y, w = h @ np.array([pt[0], pt[1], 1.0])
    return (x / w, y / w)


@dataclass
class WallPlane:
    """Maps wall-plane centimetres to pixels in the scene photograph."""
    quad: list          # [[x, y] x4] in image space: TL, TR, BR, BL
    width_cm: float
    height_cm: float

    def __post_init__(self):
        src = [(0, 0), (self.width_cm, 0), (self.width_cm, self.height_cm), (0, self.height_cm)]
        self.h = homography(src, [tuple(p) for p in self.quad])

    def to_px(self, x_cm: float, y_cm: float) -> tuple:
        return apply_h(self.h, (x_cm, y_cm))

    def quad_for(self, cx_cm, cy_cm, w_cm, h_cm) -> list:
        """Image-space quad for a rectangle centred at (cx, cy) on the wall."""
        x0, y0 = cx_cm - w_cm / 2, cy_cm - h_cm / 2
        x1, y1 = cx_cm + w_cm / 2, cy_cm + h_cm / 2
        return [self.to_px(x0, y0), self.to_px(x1, y0), self.to_px(x1, y1), self.to_px(x0, y1)]

    def px_per_cm_at(self, x_cm, y_cm) -> float:
        """Local scale, for sanity checks and sizing blur radii."""
        a = self.to_px(x_cm, y_cm)
        b = self.to_px(x_cm + 10, y_cm)
        return math.dist(a, b) / 10.0


def placements_of(scene: dict) -> list:
    """Hanging positions available in a scene.

    A room usually offers more than one: a modest spot above a sideboard where
    anything tall would foul the objects standing on it, and a clear stretch of
    wall that takes a large work. Each position carries its own limits, which is
    how the system avoids drawing a painting over a plant standing in front of
    the wall — the compositor has no depth information, so the clearances have to
    be stated.
    """
    if scene.get('placements'):
        return scene['placements']
    return [{
        'id': 'default',
        'xCm': scene['hang']['xCm'],
        'yCm': scene['hang']['yCm'],
        **scene.get('usable', {}),
    }]


def choose_placement(scene: dict, w_cm: float, h_cm: float):
    """The tightest position that still fits the work. Deterministic."""
    ok = [p for p in placements_of(scene)
          if w_cm <= p.get('maxWidthCm', 1e9) and h_cm <= p.get('maxHeightCm', 1e9)]
    if not ok:
        return None
    return min(ok, key=lambda p: (p.get('maxWidthCm', 1e9), p.get('id', '')))


def warp_into(layer: Image.Image, dst_quad: list, size: tuple) -> Image.Image:
    """Warp an RGBA layer so its corners land on dst_quad, on a canvas of `size`.

    PIL's PERSPECTIVE transform maps destination pixels back to source, so the
    coefficients are built from the inverse homography.
    """
    w, h = layer.size
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    inv = homography([tuple(p) for p in dst_quad], src)
    inv = inv / inv[2, 2]
    coeffs = inv.flatten()[:8].tolist()
    return layer.transform(size, Image.PERSPECTIVE, coeffs,
                           resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))


# ------------------------------------------------------------------------ wall render
OAK_LIGHT, OAK_MID, OAK_DARK = (216, 187, 145), (197, 165, 121), (168, 135, 95)
REVEAL = (44, 44, 44)


def _timber(w: int, h: int, rng: np.random.Generator, vertical: bool) -> Image.Image:
    """A wood-grain rail with fine striations."""
    n = h if vertical else w
    t = rng.random(max(n, 1)) * 0.5 + 0.25
    ramp = np.array([[OAK_LIGHT[i] + (OAK_DARK[i] - OAK_LIGHT[i]) * t for i in range(3)]])
    band = ramp.reshape(-1, 3)
    arr = np.tile(band[:, None, :], (1, w, 1)) if vertical else np.tile(band[None, :, :], (h, 1, 1))
    img = Image.fromarray(arr.astype(np.uint8), 'RGB')
    return img.filter(ImageFilter.GaussianBlur(0.5))


def displayed_size_cm(art: Image.Image, w_cm: float, h_cm: float) -> tuple:
    """Size to draw the artwork at, in centimetres, never distorting it.

    A photograph of a canvas is rarely a perfect match for the measured dimensions —
    a degree of camera tilt puts the two a percent or two apart. Stretching the image
    onto the recorded rectangle would distort the artwork, which is not allowed, so
    instead the photograph's own aspect ratio is kept and scaled to cover the same
    surface area as the recorded size. Any discrepancy is split between the two axes,
    halving the error on each and keeping physical scale honest.

    Returns (width_cm, height_cm, residual) where residual is the fractional
    disagreement between the photograph and the register.
    """
    pw, ph = art.size
    photo_aspect = pw / ph
    recorded_aspect = w_cm / h_cm
    residual = abs(photo_aspect - recorded_aspect) / recorded_aspect

    scale = math.sqrt((w_cm * h_cm) / (pw * ph))
    return pw * scale, ph * scale, residual


def render_panel(art: Image.Image, w_cm: float, h_cm: float, framed: bool,
                 frame_width_cm: float, seed: int) -> Image.Image:
    """The artwork, plus its frame if it has one, drawn flat in wall space.

    The artwork keeps its own aspect ratio exactly — never cropped, never stretched.
    """
    rng = np.random.default_rng(seed)
    aw, ah = int(round(w_cm * PX_PER_CM)), int(round(h_cm * PX_PER_CM))
    art_r = art.convert('RGB').resize((max(aw, 1), max(ah, 1)), Image.LANCZOS)

    if not framed:
        panel = Image.new('RGBA', (aw, ah), (0, 0, 0, 0))
        panel.paste(art_r, (0, 0))
        # A canvas edge catches a little light on top, loses it underneath.
        d = ImageDraw.Draw(panel, 'RGBA')
        d.line([(0, 0), (aw, 0)], fill=(255, 255, 255, 40))
        d.line([(0, ah - 1), (aw, ah - 1)], fill=(0, 0, 0, 70))
        return panel

    fr = max(2, int(round(frame_width_cm * PX_PER_CM)))
    gap = max(1, int(round(0.5 * PX_PER_CM)))          # floating-frame reveal
    ow, oh = aw + 2 * (fr + gap), ah + 2 * (fr + gap)
    panel = Image.new('RGBA', (ow, oh), (0, 0, 0, 0))

    d = ImageDraw.Draw(panel, 'RGBA')
    d.rectangle([0, 0, ow - 1, oh - 1], fill=REVEAL + (255,))

    panel.paste(_timber(ow, fr, rng, vertical=True), (0, 0))
    panel.paste(_timber(ow, fr, rng, vertical=True), (0, oh - fr))
    panel.paste(_timber(fr, oh, rng, vertical=False), (0, 0))
    panel.paste(_timber(fr, oh, rng, vertical=False), (ow - fr, 0))

    panel.paste(art_r, (fr + gap, fr + gap))

    d = ImageDraw.Draw(panel, 'RGBA')
    # Reveal gap reads as a shadowed recess around the canvas.
    d.rectangle([fr + gap - 1, fr + gap - 1, ow - fr - gap, oh - fr - gap],
                outline=(0, 0, 0, 90), width=max(1, gap))
    # Frame edges: light along the top, shade underneath.
    d.line([(0, 0), (ow, 0)], fill=(238, 214, 180, 150))
    d.line([(0, oh - 1), (ow, oh - 1)], fill=(96, 74, 50, 140))
    d.rectangle([0, 0, ow - 1, oh - 1], outline=(122, 98, 66, 110))
    return panel


# --------------------------------------------------------------------------- lighting
def sample_wall_field(scene: Image.Image, quad: list, blur: float = 60.0) -> np.ndarray:
    """Low-frequency luminance of the wall behind the artwork, normalised to its mean.

    Multiplying the artwork by this puts the room's own falloff and vignetting across
    it, which is most of what makes a composite sit in a photograph.
    """
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    box = (max(0, int(min(xs))), max(0, int(min(ys))),
           min(scene.width, int(max(xs)) + 1), min(scene.height, int(max(ys)) + 1))
    if box[2] <= box[0] or box[3] <= box[1]:
        return np.ones((1, 1), dtype=np.float32), (0, 0, 1, 1)
    patch = scene.crop(box).convert('L').filter(ImageFilter.GaussianBlur(blur))
    arr = np.asarray(patch, dtype=np.float32)
    mean = float(arr.mean()) or 1.0
    return arr / mean, box


def relight(art_layer: Image.Image, scene: Image.Image, quad: list,
            strength: float = 0.55, exposure: float = 1.0) -> Image.Image:
    """Apply the wall's luminance field to the warped artwork layer.

    Luminance only — RGB channels are scaled together, so hue and saturation are
    untouched and the artwork stays faithful to the original.
    """
    field, box = sample_wall_field(scene, quad)
    full = np.ones((scene.height, scene.width), dtype=np.float32)
    full[box[1]:box[3], box[0]:box[2]] = field
    gain = (1.0 - strength) + strength * full
    gain = np.clip(gain * exposure, 0.55, 1.45)

    arr = np.asarray(art_layer, dtype=np.float32)
    rgb = np.clip(arr[..., :3] * gain[..., None], 0, 255)
    out = np.dstack([rgb, arr[..., 3:4]]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def cast_shadow(size: tuple, quad: list, light_from: str, depth_cm: float,
                px_per_cm: float, strength: float, softness_cm: float) -> Image.Image:
    """Soft shadow thrown onto the wall by a work standing off it by depth_cm.

    Offset is horizontal away from the light and always slightly downward, which is
    how a wall-mounted object behaves under ceiling-biased interior lighting.
    """
    dx = depth_cm * 0.85 * px_per_cm * (1 if light_from == 'left' else -1)
    dy = depth_cm * 0.55 * px_per_cm
    shifted = [(x + dx, y + dy) for x, y in quad]

    layer = Image.new('L', size, 0)
    ImageDraw.Draw(layer).polygon([tuple(p) for p in shifted], fill=int(255 * strength))
    return layer.filter(ImageFilter.GaussianBlur(max(2.0, softness_cm * px_per_cm)))


def contact_shadow(size: tuple, quad: list, px_per_cm: float) -> Image.Image:
    """The tight dark line where the frame nearly meets the wall."""
    layer = Image.new('L', size, 0)
    ImageDraw.Draw(layer).polygon([tuple(p) for p in quad], fill=150)
    return layer.filter(ImageFilter.GaussianBlur(max(1.0, 0.8 * px_per_cm)))


def multiply_shadow(scene: Image.Image, shadow: Image.Image, tint=(38, 34, 30)) -> Image.Image:
    """Darken the scene through a shadow mask, warm-neutral rather than pure black."""
    dark = Image.new('RGB', scene.size, tint)
    return Image.composite(Image.blend(scene, dark, 0.82), scene, shadow)
