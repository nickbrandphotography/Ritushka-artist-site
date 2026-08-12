"""Ritushka Studio Profile — layout engine.
8pp A4 portrait. 12-col grid. Lato + Lora.
"""
import os
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image

MM = 72 / 25.4
PW, PH = 210 * MM, 297 * MM
ML, MR, MT, MB = 20 * MM, 20 * MM, 22 * MM, 24 * MM
COL, GUT = 10.5 * MM, 4 * MM
LIVE_W = 170 * MM

INK = (0x14 / 255, 0x17 / 255, 0x1A / 255)
GRAPHITE = (0x6E / 255, 0x74 / 255, 0x78 / 255)
PAPER = (0xFA / 255, 0xF9 / 255, 0xF6 / 255)
RULE = (0xDC / 255, 0xD9 / 255, 0xD2 / 255)
ACCENT = (0x1F / 255, 0x3A / 255, 0x4D / 255)
WHITE = (1, 1, 1)

FONTS = {
    'Lora': '/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf',
    'LoraI': '/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf',
    'LatoL': '/usr/share/fonts/truetype/lato/Lato-Light.ttf',
    'Lato': '/usr/share/fonts/truetype/lato/Lato-Regular.ttf',
    'LatoSB': '/usr/share/fonts/truetype/lato/Lato-Semibold.ttf',
}
for n, p in FONTS.items():
    pdfmetrics.registerFont(TTFont(n, p))

ART = '/sessions/modest-zealous-bell/mnt/Ritushka/Artwork'


def colx(i):
    return ML + i * (COL + GUT)


def colw(n):
    return n * COL + (n - 1) * GUT


class Doc:
    def __init__(self, path, title, author='Ritushka'):
        self.c = rl_canvas.Canvas(path, pagesize=(PW, PH))
        self.c.setTitle(title)
        self.c.setAuthor(author)
        self.c.setSubject('Original large-scale abstract landscape and seascape painting. Sydney, Australia.')
        self.c.setKeywords('abstract seascape, abstract landscape, commissioned artwork, original painting, Sydney artist, interior designers, art consultants')
        self.page = 0

    # ---------- primitives ----------
    def bg(self, col=PAPER):
        self.c.setFillColorRGB(*col)
        self.c.rect(0, 0, PW, PH, stroke=0, fill=1)

    def text(self, x, y, s, font='Lora', size=10.5, col=INK, track=0, align='l'):
        c = self.c
        cs = track / 1000 * size
        w = (pdfmetrics.stringWidth(s, font, size) + (len(s) - 1) * cs) if s else 0
        if align == 'r':
            x -= w
        elif align == 'c':
            x -= w / 2
        to = c.beginText(x, y)
        to.setFont(font, size)
        to.setFillColorRGB(*col)
        to.setCharSpace(cs)
        to.textOut(s)
        c.drawText(to)
        return w

    def wrap(self, s, font, size, width, track=0):
        words, lines, cur = s.split(), [], ''
        for w in words:
            t = (cur + ' ' + w).strip()
            tw = pdfmetrics.stringWidth(t, font, size) + max(0, len(t) - 1) * (track / 1000 * size)
            if tw <= width or not cur:
                cur = t
            else:
                lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines

    def para(self, x, y, s, width, font='Lora', size=10.5, lead=16, col=INK, track=2, gap_after=0):
        for ln in self.wrap(s, font, size, width, track):
            self.text(x, y, ln, font, size, col, track)
            y -= lead
        return y - gap_after

    def rule(self, x, y, w, col=RULE, lw=0.5):
        self.c.setStrokeColorRGB(*col)
        self.c.setLineWidth(lw)
        self.c.line(x, y, x + w, y)

    def image(self, path, x, y, w, h, mode='cover'):
        """Place image in box (x,y bottom-left, w,h), centre-cropped."""
        key = '%s_%d_%d' % (os.path.basename(path).replace(' ', '_').rsplit('.', 1)[0], int(w), int(h))
        cache = '/tmp/imgcache/%s.jpg' % key
        os.makedirs('/tmp/imgcache', exist_ok=True)
        if os.path.exists(cache):
            self.c.drawImage(cache, x, y, w, h, mask=None)
            return
        im = Image.open(path)
        im.draft('RGB', (int(max(w, h) / 72 * 200), int(max(w, h) / 72 * 200)))
        im = im.convert('RGB')
        iw, ih = im.size
        box_ar, im_ar = w / h, iw / ih
        if mode == 'cover':
            if im_ar > box_ar:
                nw = int(ih * box_ar)
                im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
            else:
                nh = int(iw / box_ar)
                top = int((ih - nh) * 0.42)
                im = im.crop((0, top, iw, top + nh))
        target_px = int(max(w, h) / 72 * 160)
        im.thumbnail((target_px, target_px), Image.LANCZOS)
        im.save(cache, 'JPEG', quality=84, optimize=True)
        self.c.drawImage(cache, x, y, w, h, mask=None)

    # ---------- furniture ----------
    def runhead(self, label):
        y = PH - MT + 6 * MM
        self.text(ML, y, 'RITUSHKA', 'Lato', 6.5, GRAPHITE, 180)
        self.text(colx(4), y, label.upper(), 'Lato', 6.5, GRAPHITE, 180)
        self.text(ML + LIVE_W, y, '%02d' % self.page, 'LatoL', 8, GRAPHITE, 0, 'r')
        self.rule(ML, y - 3 * MM, LIVE_W)

    def footer(self, s='ritushka.com · studio@ritka.net · +61 403 835 467'):
        self.rule(ML, MB - 5 * MM, LIVE_W)
        self.text(ML, MB - 9.5 * MM, s.upper(), 'Lato', 6.5, GRAPHITE, 120)

    def newpage(self, label=None, footer=True, bgcol=PAPER):
        if self.page:
            self.c.showPage()
        self.page += 1
        self.bg(bgcol)
        if label:
            self.runhead(label)
        if footer and label:
            self.footer()
        return PH - MT

    def save(self):
        self.c.save()


# ---------- page builders ----------

def page_cover(d, cover_img, title_lines, year='Sydney · 2026'):
    d.newpage(None, footer=False)
    d.image(os.path.join(ART, cover_img), 0, 0, PW, PH)
    # white panel
    ph = 46 * MM
    py = 24 * MM
    d.c.setFillColorRGB(*PAPER)
    d.c.rect(ML, py, LIVE_W, ph, stroke=0, fill=1)
    y = py + ph - 13 * MM
    d.text(ML + 12 * MM, y, 'RITUSHKA', 'LatoL', 15, INK, 340)
    d.rule(ML + 12 * MM, y - 6 * MM, 14 * MM, INK, 0.7)
    y -= 13 * MM
    for i, ln in enumerate(title_lines):
        d.text(ML + 12 * MM, y, ln, 'Lora', 11.5, INK, 0)
        y -= 6 * MM
    d.text(ML + LIVE_W - 12 * MM, py + 9 * MM, year.upper(), 'Lato', 6.5, GRAPHITE, 120, 'r')


def spec_panel(d, x, y, w, heading, rows, label_col=GRAPHITE):
    d.text(x, y, heading.upper(), 'LatoSB', 7, INK, 140)
    y -= 3 * MM
    d.rule(x, y, w, INK, 0.7)
    y -= 6 * MM
    for k, v in rows:
        d.text(x, y, k.upper(), 'LatoSB', 6.5, label_col, 140)
        y -= 4.6 * MM
        for ln in d.wrap(v, 'Lato', 9, w):
            d.text(x, y, ln, 'Lato', 9, INK, 0)
            y -= 4.2 * MM
        y -= 2.2 * MM
        d.rule(x, y, w, RULE)
        y -= 4.6 * MM
    return y


def page_glance(d, label, headline, standfirst, body, panel_heading, rows):
    y = d.newpage(label)
    tw = colw(7)
    y -= 14 * MM
    for ln in d.wrap(headline, 'Lora', 24, tw, -8):
        d.text(ML, y, ln, 'Lora', 24, INK, -8)
        y -= 29
    y -= 6 * MM
    y = d.para(ML, y, standfirst, tw, 'LoraI', 12.5, 19, INK, 0, 7 * MM)
    for p in body:
        y = d.para(ML, y, p, tw, 'Lora', 10.5, 16, INK, 2, 5.5 * MM)
    spec_panel(d, colx(7), PH - MT - 14 * MM, colw(5), panel_heading, rows)


def page_reasons(d, label, headline, items, img=None, caption=None):
    y = d.newpage(label)
    y -= 12 * MM
    for ln in d.wrap(headline, 'Lora', 20, colw(9), -5):
        d.text(ML, y, ln, 'Lora', 20, INK, -5)
        y -= 25
    d.rule(ML, y - 1 * MM, 14 * MM, INK, 0.7)
    y -= 12 * MM
    for i, (t, b) in enumerate(items):
        ytop = y
        d.text(ML, y, '%02d' % (i + 1), 'LatoL', 20, GRAPHITE, 40)
        yl = y - 7 * MM
        for ln in d.wrap(t.upper(), 'LatoSB', 7, colw(3), 140):
            d.text(ML, yl, ln, 'LatoSB', 7, INK, 140)
            yl -= 3.6 * MM
        y2 = d.para(colx(3), ytop + 0.5 * MM, b, colw(8), 'Lora', 10.5, 16, INK, 2)
        y = min(yl - 2 * MM, y2) - 8 * MM
        d.rule(ML, y + 3 * MM, LIVE_W, RULE)
        y -= 3 * MM
    if img:
        h = 58 * MM
        ybot = MB + 20 * MM
        d.image(os.path.join(ART, img), ML, ybot, colw(7), h)
        if caption:
            yc = ybot + h - 4 * MM
            for ln in d.wrap(caption, 'Lato', 7.5, colw(4), 20):
                d.text(colx(8), yc, ln, 'Lato', 7.5, GRAPHITE, 20)
                yc -= 4 * MM


def page_plate(d, img, caption):
    d.newpage(None, footer=False)
    d.image(os.path.join(ART, img), 0, 0, PW, PH)
    d.c.setFillColorRGB(0, 0, 0)
    d.c.setFillAlpha(0.30)
    d.c.rect(0, 0, PW, 26 * MM, stroke=0, fill=1)
    d.c.setFillAlpha(1)
    d.text(ML, 13 * MM, caption, 'Lato', 7.5, (1, 1, 1), 30)


def page_works(d, label, headline, standfirst, works, cols=3, rows=2, ih=74 * MM):
    y = d.newpage(label)
    y -= 12 * MM
    d.text(ML, y, headline, 'Lora', 20, INK, -5)
    d.rule(ML, y - 6 * MM, 14 * MM, INK, 0.7)
    y -= 15 * MM
    y = d.para(ML, y, standfirst, colw(8), 'LoraI', 10, 15, GRAPHITE, 0, 8 * MM)
    ncol = cols
    cw = (LIVE_W - (ncol - 1) * GUT) / ncol
    top = y
    k = 0
    for r in range(rows):
        yy = top - r * (ih + 15 * MM)
        for cix in range(ncol):
            if k >= len(works):
                break
            fn, t, meta = works[k]
            x = ML + cix * (cw + GUT)
            d.image(os.path.join(ART, fn), x, yy - ih, cw, ih)
            d.text(x, yy - ih - 5 * MM, t, 'LatoSB', 7.5, INK, 20)
            yc = yy - ih - 9 * MM
            for ln in d.wrap(meta, 'Lato', 7, cw, 20):
                d.text(x, yc, ln, 'Lato', 7, GRAPHITE, 20)
                yc -= 3.4 * MM
            k += 1


def page_process(d, label, headline, standfirst, steps, panel_title, panel_body):
    y = d.newpage(label)
    y -= 12 * MM
    for ln in d.wrap(headline, 'Lora', 20, colw(9), -5):
        d.text(ML, y, ln, 'Lora', 20, INK, -5)
        y -= 25
    d.rule(ML, y - 1 * MM, 14 * MM, INK, 0.7)
    y -= 11 * MM
    y = d.para(ML, y, standfirst, colw(8), 'LoraI', 10, 15, GRAPHITE, 0, 8 * MM)
    for i, (name, body, when) in enumerate(steps):
        d.rule(ML, y + 5 * MM, LIVE_W, RULE)
        d.text(ML, y, '%02d' % (i + 1), 'LatoL', 9, GRAPHITE, 60)
        d.text(ML + 9 * MM, y, name.upper(), 'LatoSB', 7.5, INK, 140)
        d.text(ML + LIVE_W, y, when.upper(), 'Lato', 7.5, GRAPHITE, 100, 'r')
        y2 = d.para(colx(3), y, body, colw(7), 'Lora', 9.5, 14, INK, 2)
        y = min(y - 10 * MM, y2) - 6 * MM
    # accent panel
    ph = 30 * MM
    py = MB + 2 * MM
    d.c.setFillColorRGB(*ACCENT)
    d.c.rect(ML, py, LIVE_W, ph, stroke=0, fill=1)
    d.text(ML + 8 * MM, py + ph - 9 * MM, panel_title.upper(), 'LatoSB', 7, (1, 1, 1), 140)
    yy = py + ph - 15 * MM
    for ln in d.wrap(panel_body, 'Lato', 8.5, LIVE_W - 16 * MM):
        d.text(ML + 8 * MM, yy, ln, 'Lato', 8.5, (1, 1, 1), 10)
        yy -= 4.4 * MM


def page_specs(d, label, headline, left_title, left_rows, right_title, right_rows, terms_title, terms_body):
    y = d.newpage(label)
    y -= 12 * MM
    d.text(ML, y, headline, 'Lora', 20, INK, -5)
    d.rule(ML, y - 6 * MM, 14 * MM, INK, 0.7)
    y -= 16 * MM
    w6 = colw(6)
    y1 = spec_panel(d, ML, y, w6, left_title, left_rows)
    y2 = spec_panel(d, colx(6), y, w6, right_title, right_rows)
    yb = min(y1, y2) - 4 * MM
    yb = max(yb, MB + 34 * MM)
    d.text(ML, yb, terms_title.upper(), 'LatoSB', 7, INK, 140)
    d.rule(ML, yb - 3 * MM, LIVE_W, INK, 0.7)
    d.para(ML, yb - 9 * MM, terms_body, LIVE_W, 'Lato', 8.5, 13.5, INK, 0)


def page_invite(d, headline, paras, qr_label, qr_path=None):
    d.newpage(None, footer=False)
    y = PH - MT - 62 * MM
    tw = colw(8)
    for ln in d.wrap(headline, 'Lora', 24, tw, -8):
        d.text(ML, y, ln, 'Lora', 24, INK, -8)
        y -= 30
    y -= 8 * MM
    for p in paras:
        y = d.para(ML, y, p, colw(7), 'Lora', 10.5, 16, INK, 2, 6 * MM)
    y = MB + 46 * MM
    d.rule(ML, y + 6 * MM, 14 * MM, INK, 0.7)
    for ln in ['Ritushka', 'Lane Cove, Sydney NSW, Australia', 'studio@ritka.net',
               '+61 403 835 467', 'ritushka.com']:
        d.text(ML, y, ln, 'Lato', 9, INK, 20)
        y -= 5.2 * MM
    if qr_path and os.path.exists(qr_path):
        s = 22 * MM
        lx = ML + LIVE_W - 44 * MM
        d.c.drawImage(qr_path, ML + LIVE_W - s, MB + 14 * MM, s, s)
        yc = MB + 10 * MM
        for ln in d.wrap(qr_label.upper(), 'Lato', 6, 44 * MM, 100):
            d.text(lx, yc, ln, 'Lato', 6, GRAPHITE, 100)
            yc -= 3.2 * MM
