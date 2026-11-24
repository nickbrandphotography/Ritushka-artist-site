'use client';
// "View on your wall": photograph a wall (or pick a sample room), set the scale from one known measurement,
// then swipe through Ritushka's available originals or limited edition prints at true size.
//
// Originals are shown exactly as they are: their real size, in their floating oak frame where the register
// records one. Prints can be previewed in a frame with a mat and glass, but framing is custom and quoted
// separately (see src/lib/prints.ts), so the price shown is always the print price alone.
import { useCallback, useEffect, useRef, useState } from 'react';
import EnquiryForm from './EnquiryForm';

// w × h is the recorded size, shown as text. dw × dh is the size the work is drawn at: the photograph's
// own proportions at the recorded area, so the image is never cropped or stretched.
export type VisSize = { label: string; w: number; h: number; dw?: number; dh?: number; price: string; note?: string; soldOut?: boolean };
const drawn = (s: VisSize) => ({ w: s.dw ?? s.w, h: s.dh ?? s.h });
export type VisItem = {
  slug: string; title: string; image: string; href: string;
  sizes: VisSize[]; // one entry for an original
  framed: boolean; // drawn in the floating oak frame (house style: always, for originals)
  soldFramed?: boolean; // originals: the register says it is sold in the frame
  depthCm: number;
};

type Pt = { x: number; y: number };
type M3 = number[]; // 3x3 matrix, row-major

// ---------------------------------------------------------------- perspective
// A wall is a flat plane, so one 3x3 projective matrix (a homography) maps centimetres on the wall
// to pixels in the photo, including the foreshortening of a wall photographed at an angle. It comes
// from four points: the corners of something rectangular on the wall whose size is known.
function solveH(src: Pt[], dst: Pt[]): M3 {
  const a: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i], { x: u, y: v } = dst[i];
    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {                       // Gaussian elimination with pivoting
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c || a[c][c] === 0) continue;
      const f = a[r][c] / a[c][c];
      for (let k = c; k < 9; k++) a[r][k] -= f * a[c][k];
    }
  }
  const h = a.map((row, i) => row[8] / row[i]);
  return [...h, 1];
}
const mul3 = (a: M3, b: M3): M3 => {
  const o: number[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]);
  return o;
};
function inv3(m: M3): M3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det);
}
const applyH = (m: M3, p: Pt): Pt => {
  const w = m[6] * p.x + m[7] * p.y + m[8];
  return { x: (m[0] * p.x + m[1] * p.y + m[2]) / w, y: (m[3] * p.x + m[4] * p.y + m[5]) / w };
};
/** CSS matrix3d for a 2D homography (column-major 4x4). */
const cssMatrix = (m: M3) => `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,${m[8]})`;

// H maps wall cm to photo px. sample: where works hang in that room, in wall cm (y measured down).
// floorY: the floor's wall y, when the reference rectangle stood on it (a door).
type Room = {
  src: string; w: number; h: number; H: M3 | null; floorY?: number;
  sample?: { centreX: number; eyeY: number; furnitureTop: number; topY: number };
};
type Mode = 'originals' | 'prints';

// Sample rooms from the mockup library (mockups/rooms.json, scenes.json), measured there. H maps the
// back wall in cm (origin at the wall's top-left) to pixels of the 1600 px image, so the two angled
// rooms show a work in true perspective. centreX, eyeY (150 cm off the floor), furnitureTop and topY
// are wall cm.
const SAMPLES = [
  { id: 'calm-living-room', label: 'Living room', src: '/rooms/calm-living-room.jpg', thumb: '/rooms/calm-living-room-thumb.jpg', w: 1600, h: 1073,
    H: [2.34396, 0, 227.848, 0, 2.34403, 137.975, 0, 0, 1], centreX: 243.0, eyeY: 130.0, furnitureTop: 208.4, topY: 25 },
  { id: 'hotel-suite-bedroom', label: 'Bedroom', src: '/rooms/hotel-suite-bedroom.jpg', thumb: '/rooms/hotel-suite-bedroom-thumb.jpg', w: 1600, h: 1073,
    H: [2.39622, 0, 212.025, 0, 2.39602, 107.595, 0, 0, 1], centreX: 245.7, eyeY: 130.0, furnitureTop: 176.5, topY: 25 },
  { id: 'office-reception', label: 'Office', src: '/rooms/office-reception.jpg', thumb: '/rooms/office-reception-thumb.jpg', w: 1600, h: 1073,
    H: [2.77086, 0, 0, 0, 2.77075, 68.3544, 0, 0, 1], centreX: 292.4, eyeY: 120.0, furnitureTop: 171.8, topY: 25 },
  { id: 'limestone-hotel-lobby', label: 'Hotel lobby', src: '/rooms/limestone-hotel-lobby.jpg', thumb: '/rooms/limestone-hotel-lobby-thumb.jpg', w: 1600, h: 1073,
    H: [1.8288, 0, 37.9747, 0, 1.82878, 107.595, 0, 0, 1], centreX: 417.0, eyeY: 230.0, furnitureTop: 308.0, topY: 25 },
  { id: 'coastal-living-room', label: 'Living room, angled wall', src: '/rooms/coastal-living-room.jpg', thumb: '/rooms/coastal-living-room-thumb.jpg', w: 1600, h: 1073,
    H: [3.47387, 0, 227.848, 0.634429, 2.89381, 91.2025, 0.00117977, 0, 1], centreX: 271.0, eyeY: 120.0, furnitureTop: 189.0, topY: 25 },
  { id: 'architect-studio-entry', label: 'Studio, angled wall', src: '/rooms/architect-studio-entry.jpg', thumb: '/rooms/architect-studio-entry-thumb.jpg', w: 1600, h: 1073,
    H: [3.52279, 0, 455.696, 0.646071, 2.7055, 31.2658, 0.00129147, 0, 1], centreX: 247.7, eyeY: 170.0, furnitureTop: 241.5, topY: 25 },
];

// Something rectangular on the wall, of known size. A door also tells us where the floor is.
const PRESETS: { label: string; w: number | null; h: number | null; floor?: boolean }[] = [
  { label: 'A standard door (82 × 204 cm)', w: 82, h: 204, floor: true },
  { label: 'An A4 sheet taped up (21 × 29.7 cm)', w: 21, h: 29.7 },
  { label: 'A light switch plate (7.2 × 11.5 cm)', w: 7.2, h: 11.5 },
  { label: "Something else I've measured", w: null, h: null },
];
const KPX = 4; // pixels per cm at which a work is drawn before it is projected onto the wall

// Print framing preview only. Build in cm.
// The oak shadow frame (7 mm oak, 3 mm gap, no mat) is the house frame and the default; the others are
// alternatives a buyer can preview.
const MOULDINGS = [
  { id: 'oak-shadow', label: 'Oak shadow frame' },
  { id: 'none', label: 'Unframed' },
  { id: 'black', label: 'Black' },
  { id: 'oak', label: 'Oak' },
  { id: 'white', label: 'White' },
];
const MATS = [
  { id: 'none', label: 'No mat', width: 0, color: null as string | null },
  { id: 'white-5', label: 'White 5 cm', width: 5, color: '#f3f1ea' },
  { id: 'white-8', label: 'White 8 cm', width: 8, color: '#f3f1ea' },
  { id: 'white-12', label: 'White 12 cm', width: 12, color: '#f3f1ea' },
];
const GLASS = [
  { id: 'clear', label: 'Clear', reflect: 0.2, note: 'Standard picture glass. Clear, but you will see reflections.' },
  { id: 'non-reflective', label: 'Non-reflective', reflect: 0.06, note: 'Etched to cut glare. Detail is very slightly softened.' },
  { id: 'museum', label: 'Museum', reflect: 0.02, note: 'Anti-reflective and UV protective. Almost invisible.' },
  { id: 'acrylic', label: 'Acrylic', reflect: 0.12, note: 'Lighter and shatter-resistant. Good for larger prints.' },
];
// The floating oak frame on Ritushka's originals: 7 mm of oak and a 3 mm shadow gap, 10 mm in all.
const FLOAT = { face: 0.7, gap: 0.3 };
const PAPER_FACE = 2.4;
const BEVEL = 0.35;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=128&q=60`;

function mouldingStyle(id: string): React.CSSProperties {
  if (id === 'oak')
    return {
      background:
        'repeating-linear-gradient(100deg, rgba(110,75,40,0.16) 0 2px, transparent 2px 6px, rgba(255,240,210,0.10) 6px 7px, transparent 7px 11px),' +
        'linear-gradient(135deg, #d6b583 0%, #bb915d 45%, #c9a26d 70%, #b08452 100%)',
    };
  if (id === 'white') return { background: 'linear-gradient(135deg, #fdfcf8 0%, #ebe8e0 60%, #f5f3ee 100%)' };
  return { background: 'linear-gradient(135deg, #2e2e2e 0%, #101010 45%, #1f1f1f 100%)' };
}

type Look = { kind: 'canvas'; framed: boolean } | { kind: 'paper'; moulding: string; mat: string; glass: string };

function outerCm(rec: VisSize, look: Look) {
  const size = drawn(rec);
  if (look.kind === 'canvas') {
    const add = look.framed ? 2 * (FLOAT.face + FLOAT.gap) : 0;
    return { w: size.w + add, h: size.h + add };
  }
  if (look.moulding === 'none') return { w: size.w, h: size.h };
  if (look.moulding === 'oak-shadow') return { w: size.w + 2 * (FLOAT.face + FLOAT.gap), h: size.h + 2 * (FLOAT.face + FLOAT.gap) };
  const m = MATS.find((x) => x.id === look.mat)?.width ?? 0;
  const add = 2 * (m + PAPER_FACE);
  return { w: size.w + add, h: size.h + add };
}

/** The work as it would hang, drawn at k display pixels per cm. */
function Piece({ image, size: rec, look, k }: { image: string; size: VisSize; look: Look; k: number }) {
  const size = drawn(rec);
  const px = (cm: number) => Math.max(1, cm * k);
  const wallShadow = `${px(0.6)}px ${px(1.8)}px ${px(3.5)}px rgba(0,0,0,0.38), 0 ${px(0.3)}px ${px(0.8)}px rgba(0,0,0,0.25)`;
  const img = (
    <img src={image} alt="" draggable={false}
      style={{ display: 'block', width: size.w * k, height: size.h * k, objectFit: 'contain', userSelect: 'none' }} />
  );

  if (look.kind === 'canvas' || (look.kind === 'paper' && look.moulding === 'oak-shadow')) {
    if (look.kind === 'canvas' && !look.framed) return <div style={{ boxShadow: `${px(1)}px ${px(2.5)}px ${px(4)}px rgba(0,0,0,0.4)` }}>{img}</div>;
    // The brand frame image (the same one the NITA site and the room mockups use): 56 px of oak and
    // shadow gap around its edge, stretched to 10 mm at this scale.
    const b = px(FLOAT.face + FLOAT.gap);
    return (
      <div style={{ borderStyle: 'solid', borderWidth: b, borderImage: 'url(/brand/frame-oak.png) 56 stretch',
        boxShadow: wallShadow, boxSizing: 'content-box', width: size.w * k, height: size.h * k }}>
        {img}
      </div>
    );
  }

  // Unframed print: paper sitting flat on the wall, with a faint shadow.
  if (look.moulding === 'none') return <div style={{ boxShadow: `0 ${px(0.3)}px ${px(1)}px rgba(0,0,0,0.3)` }}>{img}</div>;

  const mat = MATS.find((m) => m.id === look.mat) ?? MATS[0];
  const glass = GLASS.find((g) => g.id === look.glass) ?? GLASS[0];
  const inner = mat.width > 0 ? (
    <div style={{ background: mat.color ?? undefined, padding: px(mat.width), boxShadow: `inset ${px(0.25)}px ${px(0.25)}px ${px(0.6)}px rgba(0,0,0,0.35)` }}>
      <div style={{ outline: `${px(BEVEL)}px solid #f7f5ef`, boxShadow: `0 0 0 ${px(BEVEL) + 1}px rgba(0,0,0,0.12)` }}>{img}</div>
    </div>
  ) : img;
  return (
    <div style={{ position: 'relative', ...mouldingStyle(look.moulding), padding: px(PAPER_FACE), boxShadow: `${wallShadow}, inset 0 0 0 1px rgba(0,0,0,0.2)` }}>
      <div style={{ boxShadow: `inset 0 0 ${px(0.5)}px rgba(0,0,0,0.5)` }}>{inner}</div>
      <div aria-hidden style={{
        position: 'absolute', inset: px(PAPER_FACE), pointerEvents: 'none',
        background: `linear-gradient(115deg, rgba(255,255,255,${glass.reflect * 1.4}) 0%, rgba(255,255,255,${glass.reflect * 0.5}) 22%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,${glass.reflect * 0.6}) 78%, rgba(255,255,255,0) 92%)`,
      }} />
    </div>
  );
}

export default function WallVisualiser({ originals, prints }: { originals: VisItem[]; prints: VisItem[] }) {
  const [step, setStep] = useState<'start' | 'measure' | 'place'>('start');
  const [room, setRoom] = useState<Room | null>(null);
  // Corners of the reference rectangle in photo pixels: top-left, top-right, bottom-right, bottom-left.
  const [handles, setHandles] = useState<Pt[]>([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
  const [preset, setPreset] = useState(0);
  const [refW, setRefW] = useState<number>(82);
  const [refH, setRefH] = useState<number>(204);
  const [mode, setMode] = useState<Mode>('originals');
  const [idx, setIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [moulding, setMoulding] = useState('oak-shadow');
  const [mat, setMat] = useState('none');
  const [glass, setGlass] = useState('non-reflective');
  const [pos, setPos] = useState<Pt | null>(null);
  const [brightness, setBrightness] = useState(1);
  const [scale, setScale] = useState(0.3);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ kind: 'art' | 'handle' | 'swipe'; i?: number; start: Pt; origin: Pt; t: number } | null>(null);

  const list = mode === 'originals' ? originals : prints;
  const item = list[clamp(idx, 0, list.length - 1)];
  const size = item.sizes[clamp(sizeIdx, 0, item.sizes.length - 1)];
  const look: Look = mode === 'originals' ? { kind: 'canvas', framed: item.framed } : { kind: 'paper', moulding, mat, glass };
  const outer = outerCm(size, look);

  // Start on ?work=slug (and ?type=print), if given.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const slug = p.get('work');
    const wantPrint = p.get('type') === 'print';
    const inOriginals = originals.findIndex((a) => a.slug === slug);
    const inPrints = prints.findIndex((a) => a.slug === slug);
    if (wantPrint && inPrints >= 0) { setMode('prints'); setIdx(inPrints); }
    else if (inOriginals >= 0) setIdx(inOriginals);
    else if (inPrints >= 0) { setMode('prints'); setIdx(inPrints); }
  }, [originals, prints]);

  useEffect(() => {
    if (!room || !wrapRef.current) return;
    const el = wrapRef.current;
    const fit = () => {
      const maxH = window.innerHeight * 0.75;
      setScale(Math.min(el.clientWidth, (maxH * room.w) / room.h) / room.w);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [room, step]);

  // Positions are kept in wall centimetres, so moving a work along an angled wall keeps it on the wall.
  const H = room?.H ?? null;
  const Hinv = H ? inv3(H) : null;
  const autoPos = useCallback((): Pt => {
    if (!room || !H) return { x: 0, y: 0 };
    if (room.sample) {
      const s = room.sample;
      // Eye level, unless the work would come down onto the sofa or bed, in which case it clears it by 25 cm.
      const y = Math.min(s.eyeY, s.furnitureTop - 25 - outer.h / 2);
      return { x: s.centreX, y: Math.max(s.topY + outer.h / 2, y) };
    }
    const mid = applyH(inv3(H), { x: room.w / 2, y: room.h * 0.45 });
    return { x: mid.x, y: room.floorY != null ? room.floorY - 150 : mid.y };
  }, [room, H, outer.h]);
  const centre = pos ?? autoPos();

  /** Photo pixel under a pointer event. */
  function photoPt(e: React.PointerEvent): Pt {
    const r = stageRef.current?.getBoundingClientRect();
    return r ? { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale } : { x: 0, y: 0 };
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  async function measureBrightness(src: string) {
    try {
      const im = await loadImage(src);
      const c = document.createElement('canvas'); c.width = 32; c.height = 32;
      const ctx = c.getContext('2d'); if (!ctx) return;
      ctx.drawImage(im, 0, 0, 32, 32);
      const d = ctx.getImageData(0, 0, 32, 32).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      setBrightness(clamp(0.6 + (sum / (d.length / 4) / 255) * 0.55, 0.72, 1.02));
    } catch { setBrightness(1); }
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const src = URL.createObjectURL(f);
    const im = await loadImage(src);
    const w = im.naturalWidth, h = im.naturalHeight;
    setRoom({ src, w, h, H: null });
    // Start with a door-shaped box the user drags onto the real thing.
    const x0 = w * 0.12, x1 = w * 0.26, y0 = h * 0.2, y1 = h * 0.88;
    setHandles([{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }]);
    setPos(null);
    measureBrightness(src);
    setStep('measure');
    e.target.value = '';
  }
  function pickSample(s: (typeof SAMPLES)[number]) {
    setRoom({ src: s.src, w: s.w, h: s.h, H: s.H,
      sample: { centreX: s.centreX, eyeY: s.eyeY, furnitureTop: s.furnitureTop, topY: s.topY } });
    setPos(null); setBrightness(1); setStep('place');
  }
  // The four corners must make a real, non-folded shape before they can define the wall.
  const quadArea = handles.reduce((s, p, i) => {
    const q = handles[(i + 1) % 4];
    return s + p.x * q.y - q.x * p.y;
  }, 0) / 2;
  const measureOk = Math.abs(quadArea) > 400 && refW > 0 && refH > 0;
  function confirmMeasure() {
    if (!room || !measureOk) return;
    const Hm = solveH([{ x: 0, y: 0 }, { x: refW, y: 0 }, { x: refW, y: refH }, { x: 0, y: refH }], handles);
    setRoom({ ...room, H: Hm, floorY: PRESETS[preset].floor ? refH : undefined });
    setPos(null); setStep('place');
  }

  const go = useCallback((dir: 1 | -1) => {
    setIdx((i) => (i + dir + list.length) % list.length);
    setSizeIdx(0);
  }, [list.length]);

  useEffect(() => {
    if (step !== 'place') return;
    const strip = document.getElementById('vis-thumbs');
    const el = strip?.children[idx] as HTMLElement | undefined;
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [idx, step, mode]);

  useEffect(() => {
    if (step !== 'place') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, go]);

  function down(e: React.PointerEvent, kind: 'art' | 'handle' | 'swipe', i?: number) {
    e.stopPropagation();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    const origin = kind === 'art' ? centre : kind === 'handle' ? handles[i!] : { x: 0, y: 0 };
    // For the artwork, remember where on the wall the pointer started, in wall cm.
    const start = kind === 'art' && Hinv ? applyH(Hinv, photoPt(e)) : { x: e.clientX, y: e.clientY };
    drag.current = { kind, i, start, origin, t: Date.now() };
  }
  function move(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !room) return;
    if (d.kind === 'art' && Hinv) {
      const p = applyH(Hinv, photoPt(e));
      setPos({ x: d.origin.x + p.x - d.start.x, y: d.origin.y + p.y - d.start.y });
    } else if (d.kind === 'handle') {
      const dx = (e.clientX - d.start.x) / scale, dy = (e.clientY - d.start.y) / scale;
      const p = { x: clamp(d.origin.x + dx, 0, room.w), y: clamp(d.origin.y + dy, 0, room.h) };
      setHandles((hs) => hs.map((h, j) => (j === d.i ? p : h)));
    }
  }
  function up(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.kind !== 'swipe') return;
    const dx = e.clientX - d.start.x, dy = e.clientY - d.start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - d.t < 700) go(dx < 0 ? 1 : -1);
  }

  const pill = (on: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${on ? 'border-ink bg-ink text-bone' : 'border-ink/20 hover:border-ink'}`;
  const primary = 'rounded-full bg-ink px-6 py-3 text-sm text-bone transition hover:bg-ink/85 disabled:opacity-40';
  const cols = 'grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]';

  if (step === 'start' || !room) {
    return (
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/65">Step 1</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Photograph your wall</h2>
          <p className="mt-4 max-w-md text-ink/70">
            Take a photo of the wall from where you would usually see it, straight on or at an angle. Include something
            rectangular you know the size of: a door, an A4 sheet taped to the wall, or a light switch plate. Your photo
            stays on your device and is never uploaded.
          </p>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
          <button onClick={() => fileRef.current?.click()} className={`mt-6 ${primary}`}>Take or upload a photo</button>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/65">Or try a sample room</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {SAMPLES.map((s) => (
              <button key={s.id} onClick={() => pickSample(s)} className="group text-left">
                <img src={s.thumb} alt={`Sample ${s.label.toLowerCase()}`} loading="lazy" width={640} height={429}
                  className="w-full rounded-md border border-sand transition group-hover:border-ink" />
                <span className="mt-2 block text-sm text-ink/70">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stageW = room.w * scale, stageH = room.h * scale;

  if (step === 'measure') {
    const poly = handles.map((h) => `${h.x * scale},${h.y * scale}`).join(' ');
    const corner = ['Top left', 'Top right', 'Bottom right', 'Bottom left'];
    return (
      <div className={cols}>
        <div ref={wrapRef} className="w-full min-w-0">
          <div className="relative mx-auto select-none" style={{ width: stageW, height: stageH, touchAction: 'none' }}
            onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <img src={room.src} alt="Your wall" draggable={false} className="block h-full w-full" />
            <svg className="absolute inset-0" width={stageW} height={stageH}>
              <polygon points={poly} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={4} strokeOpacity={0.9} />
              <polygon points={poly} fill="none" stroke="#1a1a18" strokeWidth={2} strokeDasharray="8 6" />
            </svg>
            {handles.map((h, i) => (
              <div key={i} role="slider" aria-label={`${corner[i]} corner`} aria-valuenow={0}
                onPointerDown={(e) => down(e, 'handle', i)}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center"
                style={{ left: h.x * scale, top: h.y * scale, touchAction: 'none' }}>
                <span className="block h-5 w-5 rounded-full border-2 border-white bg-ink shadow" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/65">Step 2</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Mark something on the wall</h2>
          <p className="mt-4 text-ink/70">
            Drag the four dots onto the four corners of something rectangular in the photo, such as a door frame. It tells
            us how big everything on the wall is and the angle you photographed it from, so the art is drawn in true
            perspective.
          </p>
          <label className="mt-6 block text-sm">
            <span className="text-ink/70">What are you marking?</span>
            <select value={preset} onChange={(e) => {
              const i = +e.target.value; setPreset(i);
              if (PRESETS[i].w && PRESETS[i].h) { setRefW(PRESETS[i].w!); setRefH(PRESETS[i].h!); }
            }} className="mt-1 w-full rounded-md border border-ink/20 bg-bone px-3 py-2">
              {PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
            </select>
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-ink/70">Width in cm</span>
              <input type="number" inputMode="decimal" min={1} step="0.1" value={refW || ''}
                onChange={(e) => { setRefW(parseFloat(e.target.value)); setPreset(PRESETS.length - 1); }}
                className="mt-1 w-full rounded-md border border-ink/20 bg-bone px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-ink/70">Height in cm</span>
              <input type="number" inputMode="decimal" min={1} step="0.1" value={refH || ''}
                onChange={(e) => { setRefH(parseFloat(e.target.value)); setPreset(PRESETS.length - 1); }}
                className="mt-1 w-full rounded-md border border-ink/20 bg-bone px-3 py-2" />
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={confirmMeasure} disabled={!measureOk} className={primary}>Place artwork</button>
            <button onClick={() => setStep('start')} className="rounded-full border border-ink/20 px-5 py-3 text-sm hover:border-ink">Back</button>
          </div>
          <p className="mt-4 text-xs text-ink/65">
            Tip: use something flat on the same wall you want to hang the art on. A door frame works best: it is large, and
            it also tells us where the floor is, so the art starts at eye level.
          </p>
        </div>
      </div>
    );
  }

  // The work is drawn flat at KPX px per cm, then projected onto the wall: local pixel -> wall cm (T)
  // -> photo pixel (H) -> screen pixel (S). On an angled wall that foreshortens it exactly as the wall is.
  const X0 = centre.x - outer.w / 2, Y0 = centre.y - outer.h / 2;
  const T: M3 = [1 / KPX, 0, X0, 0, 1 / KPX, Y0, 0, 0, 1];
  const S: M3 = [scale, 0, 0, 0, scale, 0, 0, 0, 1];
  const project = H ? mul3(S, mul3(H, T)) : null;
  const glassInfo = GLASS.find((g) => g.id === glass) ?? GLASS[0];
  const subject = mode === 'originals'
    ? `${item.title} (seen on my wall)`
    : `${item.title}, ${size.label} limited edition print (seen on my wall)`;

  return (
    <div className={cols}>
      <div ref={wrapRef} className="w-full min-w-0">
        <div ref={stageRef} className="relative mx-auto select-none overflow-hidden rounded-md" style={{ width: stageW, height: stageH, touchAction: 'pan-y' }}
          onPointerDown={(e) => down(e, 'swipe')} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <img src={room.src} alt="Your wall" draggable={false} className="block h-full w-full" />
          {project && (
            <div onPointerDown={(e) => down(e, 'art')} className="absolute left-0 top-0 cursor-grab active:cursor-grabbing"
              style={{
                width: outer.w * KPX, height: outer.h * KPX, transformOrigin: '0 0', transform: cssMatrix(project),
                touchAction: 'none', filter: brightness < 0.99 ? `brightness(${brightness})` : undefined,
              }}>
              <Piece image={item.image} size={size} look={look} k={KPX} />
            </div>
          )}
          <button aria-label="Previous artwork" onClick={() => go(-1)} onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-bone/85 text-lg shadow hover:bg-bone">‹</button>
          <button aria-label="Next artwork" onClick={() => go(1)} onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-bone/85 text-lg shadow hover:bg-bone">›</button>
        </div>
        <p className="mt-3 text-center text-xs text-ink/65">Drag the artwork to move it. Swipe across the wall, or use the arrows, to try another work.</p>
        <div id="vis-thumbs" className="relative mt-5 flex snap-x gap-3 overflow-x-auto pb-2">
          {list.map((a, i) => (
            <button key={a.slug} onClick={() => { setIdx(i); setSizeIdx(0); }} aria-label={a.title}
              className={`shrink-0 snap-start rounded border-2 p-0.5 transition ${i === idx ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={thumb(a.image)} alt="" className="h-16 w-auto" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <button className={pill(mode === 'originals')} onClick={() => { setMode('originals'); setIdx(0); setSizeIdx(0); }}>Original paintings</button>
          <button className={pill(mode === 'prints')} onClick={() => { setMode('prints'); setIdx(0); setSizeIdx(0); }}>Limited edition prints</button>
        </div>
        <p className="mt-6 text-xs uppercase tracking-widest text-ink/65">{idx + 1} of {list.length}</p>
        <h2 className="mt-1 font-serif text-3xl text-ink">{item.title}</h2>

        {mode === 'prints' && (
          <>
            <div className="mt-5">
              <p className="mb-2 text-sm text-ink/70">Print size</p>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((s, i) => (
                  <button key={s.label} className={pill(i === sizeIdx)} onClick={() => setSizeIdx(i)}>{s.label} · {s.w} × {s.h} cm</button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm text-ink/70">Preview a frame</p>
              <div className="flex flex-wrap gap-2">
                {MOULDINGS.map((m) => <button key={m.id} className={pill(moulding === m.id)} onClick={() => setMoulding(m.id)}>{m.label}</button>)}
              </div>
            </div>
            {moulding !== 'none' && moulding !== 'oak-shadow' && (
              <>
                <div className="mt-5">
                  <p className="mb-2 text-sm text-ink/70">Mat board</p>
                  <div className="flex flex-wrap gap-2">
                    {MATS.map((m) => <button key={m.id} className={pill(mat === m.id)} onClick={() => setMat(m.id)}>{m.label}</button>)}
                  </div>
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-sm text-ink/70">Glass</p>
                  <div className="flex flex-wrap gap-2">
                    {GLASS.map((g) => <button key={g.id} className={pill(glass === g.id)} onClick={() => setGlass(g.id)}>{g.label}</button>)}
                  </div>
                  <p className="mt-2 text-xs text-ink/65">{glassInfo.note}</p>
                </div>
              </>
            )}
          </>
        )}

        <div className="mt-6 border-t border-sand pt-5">
          <p className="font-serif text-2xl text-ink">{size.price}</p>
          <p className="mt-1 text-sm text-ink/70">
            {mode === 'originals'
              ? `Original painting, ${size.w} × ${size.h} cm${item.soldFramed ? ', in a floating oak frame' : ', sold unframed (pictured in a floating oak frame)'}.`
              : `Unframed print, ${size.w} × ${size.h} cm.${size.note ? ' ' + size.note : ''}`}
            {(outer.w !== size.w || outer.h !== size.h) && (mode === 'prints'
              ? ` In the frame you're previewing, about ${Math.round(outer.w)} × ${Math.round(outer.h)} cm overall.`
              : ` Overall about ${Math.round(outer.w)} × ${Math.round(outer.h)} cm.`)}
          </p>
          {mode === 'prints' && moulding !== 'none' && (
            <p className="mt-1 text-xs text-ink/65">Framing is custom and quoted separately. Mention the frame you liked in your message.</p>
          )}
          <a href={item.href} className="mt-3 inline-block text-sm underline hover:text-ink">Full details</a>
          <div className="mt-4 flex gap-4 text-xs text-ink/65">
            {!room.sample && <button className="underline hover:text-ink" onClick={() => setStep('measure')}>Re-measure</button>}
            {pos && <button className="underline hover:text-ink" onClick={() => setPos(null)}>Re-centre</button>}
            <button className="underline hover:text-ink" onClick={() => setStep('start')}>Change room</button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-sand p-5">
          <h3 className="font-serif text-xl text-ink">{mode === 'originals' ? 'Enquire about this work' : 'Reserve this print'}</h3>
          <div className="mt-3">
            <EnquiryForm key={subject} subject={subject} kind={mode === 'originals' ? 'enquiry' : 'print'}
              size={mode === 'prints' ? `${size.label}, ${size.w} × ${size.h} cm, ${size.price}` : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
