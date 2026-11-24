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
import os
from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Resolution of the flat wall-space render, before warping into the photograph.
# 8 px/cm gives a 180 cm painting a 1440 px panel — ample for a 2400 px scene.
PX_PER_CM = 16.0

ENGINE_VERSION = 4  # bump to force a full re-render (4: visible sides, shadows on the wall plane)


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


class WallCamera:
    """The camera that took the photograph, recovered from the wall homography.

    A homography only describes the wall plane itself. To draw anything that stands
    off the wall (the side of a canvas, the depth of a frame), we need the camera.
    For a pinhole camera with square pixels and the principal point at the image
    centre, H = K [r1 r2 t]. The rotation's columns must be orthonormal, which gives
    two equations for the one unknown, the focal length. Those equations are only
    well conditioned when the wall is photographed at an angle. For a wall seen
    nearly straight on, perspective carries no focal information, so a typical
    interior lens is assumed. Straight on, the depth of a canvas barely shows, so
    the guess costs almost nothing.

    Wall coordinates: x right and y down along the wall in centimetres, z into the
    wall. The calibrated quad is taken as the plane of the artwork's front face, so
    the artwork's pixels land exactly where they always have. The real wall is
    `depth` centimetres behind it, at z = +depth.
    """

    DEFAULT_FOCAL = 0.9     # times image width: roughly a 32 mm lens on full frame

    def __init__(self, plane: WallPlane, image_size: tuple, focal_px: float | None = None,
                 principal_y: float | None = None):
        w, h = image_size
        # Architectural photos (and AI images imitating them) are often shot with a
        # shift lens: the camera is level but the frame is moved up or down, so the
        # optical centre is not the middle of the image. It lies on the horizon,
        # which a scene can give as principalY.
        self.cx, self.cy = w / 2.0, (principal_y if principal_y is not None else h / 2.0)
        hm = plane.h / plane.h[2, 2]
        self.estimated = False
        f = focal_px or self._solve_focal(hm, w, plane.width_cm, plane.height_cm)
        if f is None:
            f = self.DEFAULT_FOCAL * w
        else:
            self.estimated = focal_px is None
        self.f = f
        k_inv = np.array([[1 / f, 0, -self.cx / f], [0, 1 / f, -self.cy / f], [0, 0, 1]])
        m = k_inv @ hm
        lam = (np.linalg.norm(m[:, 0]) + np.linalg.norm(m[:, 1])) / 2.0
        if m[2, 2] < 0:          # the wall must be in front of the camera
            lam = -lam
        r1 = m[:, 0] / lam
        r2 = m[:, 1] / lam
        r3 = np.cross(r1, r2)
        r3 /= np.linalg.norm(r3)
        self.r = np.column_stack([r1, r2, r3])
        self.t = m[:, 2] / lam
        self.k = np.array([[f, 0, self.cx], [0, f, self.cy], [0, 0, 1]])
        # Camera centre in wall coordinates: R C + t = 0.
        self.centre = np.linalg.solve(self.r, -self.t)

    def _solve_focal(self, hm: np.ndarray, width: float, wall_w: float, wall_h: float):
        """Focal length in pixels from the homography, or None if it can't be trusted."""
        a1, b1, c1 = hm[0, 0] - self.cx * hm[2, 0], hm[1, 0] - self.cy * hm[2, 0], hm[2, 0]
        a2, b2, c2 = hm[0, 1] - self.cx * hm[2, 1], hm[1, 1] - self.cy * hm[2, 1], hm[2, 1]
        # r1 . r2 = 0  and  |r1| = |r2|, each solved for f^2.
        # c1 and c2 are the perspective terms: zero for a wall seen straight on.
        # Require at least 3% foreshortening across the wall before trusting them.
        if max(abs(c1) * wall_w, abs(c2) * wall_h) < 0.03:
            return None
        big = max(c1 * c1, c2 * c2)
        candidates = []
        for num, den in ((-(a1 * a2 + b1 * b2), c1 * c2),
                         (-(a1 * a1 + b1 * b1 - a2 * a2 - b2 * b2), c1 * c1 - c2 * c2)):
            if abs(den) > 0.05 * big and num / den > 0:
                candidates.append(math.sqrt(num / den))
        good = [f for f in candidates if 0.35 * width < f < 4.0 * width]
        return float(np.median(good)) if good else None

    def project(self, x_cm: float, y_cm: float, z_cm: float = 0.0) -> tuple:
        p = self.k @ (self.r @ np.array([x_cm, y_cm, z_cm]) + self.t)
        return (p[0] / p[2], p[1] / p[2])

    def sees(self, point, normal) -> bool:
        """True if a face through `point` with outward `normal` faces the camera."""
        return float(np.dot(self.centre - np.asarray(point, float), np.asarray(normal, float))) > 0


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


def hang_centre(place: dict, h_cm: float) -> tuple:
    """Where the centre of a work h_cm tall hangs, in wall centimetres.

    `yCm` is the preferred centre (usually 150 cm off the floor). A position above a
    sofa, bed or desk also sets `bottomYCm`, the lowest the bottom edge may go, so a
    tall work rises to clear the furniture instead of sitting on it, while a small
    one still hangs at eye level.
    """
    cy = place['yCm']
    if 'bottomYCm' in place:
        cy = min(cy, place['bottomYCm'] - h_cm / 2)
    if 'topYCm' in place:
        cy = max(cy, place['topYCm'] + h_cm / 2)
    return place['xCm'], cy


def panel_size_cm(w_cm: float, h_cm: float, framed: bool) -> tuple:
    """Outer size of the work as hung: the canvas plus the 10 mm frame if it has one."""
    b = 2 * (FRAME_OAK_MM + FRAME_GAP_MM) / 10.0 if framed else 0.0
    return w_cm + b, h_cm + b


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
    # A perspective transform samples the source without filtering, so a large
    # reduction aliases: fine detail breaks up and frame grain turns to sawteeth.
    # Pre-shrink with a proper Lanczos filter to about 1.5x the largest size the
    # layer will occupy, then warp. Aspect ratio is preserved exactly.
    # The warp also leaves a hard, stair-stepped outline on slanted edges, so it is
    # done at SS times the size and filtered down, which anti-aliases the outline.
    ss = 2
    q = [(x * ss, y * ss) for x, y in dst_quad]
    span_w = max(math.dist(q[0], q[1]), math.dist(q[3], q[2]))
    span_h = max(math.dist(q[0], q[3]), math.dist(q[1], q[2]))
    shrink = max(span_w / layer.width, span_h / layer.height) * 1.5
    # Pillow premultiplies RGBA internally for resize and transform, so edges
    # filter correctly against the transparent surround without help here.
    layer = layer.convert('RGBA')
    if shrink < 1.0:
        layer = layer.resize((max(1, round(layer.width * shrink)),
                              max(1, round(layer.height * shrink))), Image.LANCZOS)
    w, h = layer.size
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    inv = homography(q, src)
    inv = inv / inv[2, 2]
    coeffs = inv.flatten()[:8].tolist()
    # Only the region the layer covers needs the expensive supersampled warp.
    x0 = max(0, int(min(p[0] for p in dst_quad)) - 2)
    y0 = max(0, int(min(p[1] for p in dst_quad)) - 2)
    x1 = min(size[0], int(max(p[0] for p in dst_quad)) + 3)
    y1 = min(size[1], int(max(p[1] for p in dst_quad)) + 3)
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    if x1 <= x0 or y1 <= y0:
        return out
    # Shift the sampling grid to the crop: destination (u, v) in the crop is
    # (u + x0*ss, v + y0*ss) on the full supersampled canvas.
    a, b, c, d, e, f, g, h_ = coeffs
    ox, oy = x0 * ss, y0 * ss
    shifted = [a, b, a * ox + b * oy + c, d, e, d * ox + e * oy + f]
    # The projective denominator g*X + h*Y + 1 also changes with the offset;
    # PIL expects it normalised so its constant term is 1.
    den0 = g * ox + h_ * oy + 1.0
    shifted = [v / den0 for v in shifted] + [g / den0, h_ / den0]
    # Bilinear, not bicubic: bicubic overshoots at a hard edge, which shows up as a
    # light line where the oak meets the wall or the dark reveal.
    warped = layer.transform(((x1 - x0) * ss, (y1 - y0) * ss), Image.PERSPECTIVE, shifted,
                             resample=Image.BILINEAR, fillcolor=(0, 0, 0, 0))
    # A box filter averages the supersamples exactly, with no ringing.
    warped = warped.resize((x1 - x0, y1 - y0), Image.BOX)
    out.paste(warped, (x0, y0))
    return out


# ------------------------------------------------------------------------ wall render
REVEAL = (44, 44, 44)

# The brand frame: a floating oak frame 10 mm wide in total, 7 mm of oak plus a 3 mm
# shadow gap, the same as the websites draw it. Its look comes from the same image
# the NITA site uses (mockups/frame-oak.png), so a mock-up and the shop page match.
FRAME_OAK_MM = 7.0
FRAME_GAP_MM = 3.0
_FRAME_TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'mockups', 'frame-oak.png')
_FRAME_TEX_BORDER = 56     # px of oak (40) + gap (16) along each edge of that image
_FRAME_TEX_OAK = 40
_frame_tex_cache: dict = {}


def _frame_texture(border_px: int) -> Image.Image:
    """The brand frame image, scaled so its oak + gap border is `border_px` wide."""
    if border_px not in _frame_tex_cache:
        tex = Image.open(_FRAME_TEX).convert('RGBA')
        # The image has a bright highlight along its outer edge, drawn for a frame
        # shown large on a web page. At a few pixels wide it reads as a white line, so
        # pull anything brighter than the oak's typical tone most of the way back.
        arr = np.asarray(tex, dtype=np.float32)
        oak = arr[..., 3] > 0
        lum = arr[..., :3].mean(axis=2)
        ref = np.percentile(lum[oak & (lum > 120)], 60)
        over = np.clip((lum - ref) / np.maximum(lum, 1), 0, None)[..., None]
        arr[..., :3] *= 1 - 0.8 * over
        tex = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
        s = border_px / _FRAME_TEX_BORDER
        size = max(3 * border_px, round(tex.width * s))
        _frame_tex_cache[border_px] = tex.resize((size, size), Image.LANCZOS)
    return _frame_tex_cache[border_px]


def _tile(strip: Image.Image, length: int, horizontal: bool) -> Image.Image:
    """Repeat a rail strip to `length`, mirroring alternate copies so there are no seams."""
    w, h = strip.size
    n = (length // (w if horizontal else h)) + 2
    flip = Image.FLIP_LEFT_RIGHT if horizontal else Image.FLIP_TOP_BOTTOM
    out = Image.new('RGBA', (length, h) if horizontal else (w, length))
    pos = 0
    for i in range(n):
        piece = strip if i % 2 == 0 else strip.transpose(flip)
        out.paste(piece, (pos, 0) if horizontal else (0, pos))
        pos += w if horizontal else h
    return out


def _frame_face(ow: int, oh: int, b: int) -> Image.Image:
    """Frame face (oak + gap) for a panel of ow x oh, border b px. Mitred corners
    come straight from the texture; the rails are repeated along their length."""
    tex = _frame_texture(b)
    t = tex.width
    face = Image.new('RGBA', (ow, oh), (0, 0, 0, 0))
    # corners
    face.paste(tex.crop((0, 0, b, b)), (0, 0))
    face.paste(tex.crop((t - b, 0, t, b)), (ow - b, 0))
    face.paste(tex.crop((0, t - b, b, t)), (0, oh - b))
    face.paste(tex.crop((t - b, t - b, t, t)), (ow - b, oh - b))
    # rails
    face.paste(_tile(tex.crop((b, 0, t - b, b)), ow - 2 * b, True), (b, 0))
    face.paste(_tile(tex.crop((b, t - b, t - b, t)), ow - 2 * b, True), (b, oh - b))
    face.paste(_tile(tex.crop((0, b, b, t - b)), oh - 2 * b, False), (0, b))
    face.paste(_tile(tex.crop((t - b, b, t, t - b)), oh - 2 * b, False), (ow - b, b))
    return face


def _oak_side(long: int, dpx: int, horizontal: bool, border_px: int) -> Image.Image:
    """The outside edge of the moulding: oak from the same texture, grain along its length."""
    tex = _frame_texture(border_px)
    t = tex.width
    oak = max(1, round(_FRAME_TEX_OAK * border_px / _FRAME_TEX_BORDER))
    # Middle of the oak band only: its edges carry the face's highlight and shadow,
    # which would draw lines along the side.
    lo, hi = max(0, round(oak * 0.3)), max(round(oak * 0.3) + 1, round(oak * 0.7))
    strip = tex.crop((border_px, lo, t - border_px, hi))
    strip = strip.resize((strip.width, dpx), Image.BILINEAR)
    arr = np.asarray(strip, dtype=np.float32)
    arr[..., :3] *= 0.9                                       # turns away from the room
    strip = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
    rail = _tile(strip, long, True)
    return rail if horizontal else rail.transpose(Image.ROTATE_90)


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
                 seed: int = 0) -> Image.Image:
    """The artwork, plus its frame if it has one, drawn flat in wall space.

    The artwork keeps its own aspect ratio exactly: never cropped, never stretched.
    A framed work gets the brand floating oak frame, 10 mm in total (7 mm oak and a
    3 mm gap) on every side, at true scale against the artwork.
    """
    aw, ah = int(round(w_cm * PX_PER_CM)), int(round(h_cm * PX_PER_CM))
    art_r = art.convert('RGB').resize((max(aw, 1), max(ah, 1)), Image.LANCZOS)

    if not framed:
        panel = Image.new('RGBA', (aw, ah), (0, 0, 0, 0))
        panel.paste(art_r, (0, 0))
        return panel

    b = max(2, int(round((FRAME_OAK_MM + FRAME_GAP_MM) / 10.0 * PX_PER_CM)))
    ow, oh = aw + 2 * b, ah + 2 * b
    panel = Image.new('RGBA', (ow, oh), (0, 0, 0, 0))
    panel.paste(art_r, (b, b))
    panel.alpha_composite(_frame_face(ow, oh, b))
    return panel


# ---------------------------------------------------------------------- depth & sides
def box_corners(cam: WallCamera, cx, cy, w_cm, h_cm, depth_cm) -> tuple:
    """Image corners (TL, TR, BR, BL) of the front face and of the back face on the wall."""
    x0, x1 = cx - w_cm / 2, cx + w_cm / 2
    y0, y1 = cy - h_cm / 2, cy + h_cm / 2
    rect = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    front = [cam.project(x, y, 0.0) for x, y in rect]
    back = [cam.project(x, y, depth_cm) for x, y in rect]
    return front, back


def _side_texture(panel: Image.Image, side: str, dpx: int, framed: bool, seed: int) -> Image.Image:
    """What the side of the work looks like, unrolled flat.

    Frameless canvas: a mirrored strip from the edge of the image, the usual
    gallery-wrap finish, so the colour carries round the corner. Framed: timber.
    Either way it is a presentation layer. The artwork face itself is not changed.
    """
    w, h = panel.size
    long = h if side in ('left', 'right') else w
    if framed:
        # The outside of the moulding: the same oak, grain along its length.
        b = max(2, int(round((FRAME_OAK_MM + FRAME_GAP_MM) / 10.0 * PX_PER_CM)))
        return _oak_side(long, dpx, side in ('top', 'bottom'), b)
    src = panel.convert('RGBA')
    if side == 'left':
        return src.crop((0, 0, dpx, h)).transpose(Image.FLIP_LEFT_RIGHT)
    if side == 'right':
        return src.crop((w - dpx, 0, w, h)).transpose(Image.FLIP_LEFT_RIGHT)
    if side == 'top':
        return src.crop((0, 0, w, dpx)).transpose(Image.FLIP_TOP_BOTTOM)
    return src.crop((0, h - dpx, w, h)).transpose(Image.FLIP_TOP_BOTTOM)


def render_sides(panel: Image.Image, cam: WallCamera, cx, cy, w_cm, h_cm, depth_cm,
                 size: tuple, light_from: str, framed: bool, seed: int) -> Image.Image:
    """The visible sides of the work, warped into the photograph.

    Which sides show depends on where the camera stands relative to the work, so
    a painting on a wall seen from the left shows its left edge, and one high on
    a wall shows its underside. Each side is shaded by how it faces the light.
    """
    front, back = box_corners(cam, cx, cy, w_cm, h_cm, depth_cm)
    # Tuck each side's front edge about 1.5 px in under the face, which is drawn on
    # top. Where two anti-aliased edges merely meet, the wall shows through the seam
    # as a pale line; overlapping them closes it.
    fx = sum(p[0] for p in front) / 4
    fy = sum(p[1] for p in front) / 4

    def tuck(p, px=1.5):
        dx, dy = fx - p[0], fy - p[1]
        n = math.hypot(dx, dy) or 1.0
        return (p[0] + dx / n * px * 1.414, p[1] + dy / n * px * 1.414)

    front = [tuck(p) for p in front]
    x0, x1 = cx - w_cm / 2, cx + w_cm / 2
    y0, y1 = cy - h_cm / 2, cy + h_cm / 2
    zc = depth_cm / 2
    lit, shade = (0.92, 0.58) if light_from == 'left' else (0.58, 0.92)
    # side: (outward normal, point on face, quad TL/TR/BR/BL of the unrolled texture, shade)
    faces = {
        'left': ((-1, 0, 0), (x0, cy, zc), [back[0], front[0], front[3], back[3]], lit),
        'right': ((1, 0, 0), (x1, cy, zc), [front[1], back[1], back[2], front[2]], shade),
        'top': ((0, -1, 0), (cx, y0, zc), [back[0], back[1], front[1], front[0]], 0.88),
        'bottom': ((0, 1, 0), (cx, y1, zc), [front[3], front[2], back[2], back[3]], 0.45),
    }
    dpx = max(2, int(round(depth_cm * PX_PER_CM)))
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    for side, (normal, point, quad, gain) in faces.items():
        if not cam.sees(point, normal):
            continue
        tex = _side_texture(panel, side, dpx, framed, seed)
        arr = np.asarray(tex, dtype=np.float32)
        arr[..., :3] *= gain
        tex = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
        warped = warp_into(tex, quad, size)
        layer = Image.alpha_composite(layer, warped)
    return layer


def wall_shadow(size: tuple, cam: WallCamera, cx, cy, w_cm, h_cm, depth_cm,
                light_from: str, strength: float, softness_cm: float, px_per_cm: float) -> Image.Image:
    """Soft shadow on the wall, offset along the wall itself rather than across the image.

    On an angled wall a shadow 3 cm to the right is fewer pixels at the far end, and
    it follows the wall's slope. Working in wall centimetres gets both right.
    """
    dx = depth_cm * 0.85 * (1 if light_from == 'left' else -1)
    dy = depth_cm * 0.55
    _, back = box_corners(cam, cx + dx, cy + dy, w_cm, h_cm, depth_cm)
    layer = Image.new('L', size, 0)
    ImageDraw.Draw(layer).polygon([tuple(p) for p in back], fill=int(255 * strength))
    return layer.filter(ImageFilter.GaussianBlur(max(2.0, softness_cm * px_per_cm)))


def wall_contact_shadow(size: tuple, cam: WallCamera, cx, cy, w_cm, h_cm, depth_cm,
                        px_per_cm: float) -> Image.Image:
    """The tight dark line where the back of the work meets the wall."""
    _, back = box_corners(cam, cx, cy, w_cm, h_cm, depth_cm)
    layer = Image.new('L', size, 0)
    ImageDraw.Draw(layer).polygon([tuple(p) for p in back], fill=150)
    return layer.filter(ImageFilter.GaussianBlur(max(1.0, 0.8 * px_per_cm)))


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
    # Brightening is capped at 12%: enough to follow a sunlit patch of wall, not
    # enough to wash out pale passages of a painting or blow the frame out to white.
    gain = np.clip(gain * exposure, 0.55, 1.12)

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
