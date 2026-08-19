import { artworks } from '@/data/artworks';
import { collections } from '@/data/collections';
import { mockups } from '@/data/mockups';
import { blog } from '@/data/blog';
import type { Artwork, Collection, Mockup, BlogPost } from '@/data/types';

export { artworks, collections, mockups, blog };

export const getArtwork = (slug: string): Artwork | undefined => artworks.find(a => a.slug === slug);
export const getCollection = (slug: string): Collection | undefined => collections.find(c => c.slug === slug);
export const getMockup = (slug: string): Mockup | undefined => mockups.find(m => m.slug === slug);
export const getPost = (slug: string): BlogPost | undefined => blog.find(p => p.slug === slug);

export const availableWorks = (): Artwork[] => artworks.filter(a => a.status !== 'sold');
export const soldWorks = (): Artwork[] => artworks.filter(a => a.status === 'sold');

export const artworksInCollection = (slug: string): Artwork[] =>
  artworks.filter(a => a.collections.includes(slug));

export const mockupsForArtwork = (slug: string): Mockup[] =>
  mockups.filter(m => m.artworkSlug === slug);

export const collectionName = (slug: string): string =>
  collections.find(c => c.slug === slug)?.name ?? slug;

// Related works: same primary collection, excluding self
export const relatedArtworks = (a: Artwork, n = 4): Artwork[] =>
  artworks.filter(x => x.slug !== a.slug && x.primaryCollection === a.primaryCollection).slice(0, n);

export const postsForCollection = (slug: string): BlogPost[] =>
  blog.filter(p => p.relatedCollection === slug);

export const formatPrice = (price: number | null, currency = 'AUD'): string =>
  price == null ? 'Price on application' : new Intl.NumberFormat('en-AU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);

/** Physical dimensions, or an honest fallback when not yet recorded. */
export const dims = (a: Artwork): string =>
  a.heightCm != null && a.widthCm != null
    ? `${a.heightCm} × ${a.widthCm} cm (${a.heightIn ?? (a.heightCm / 2.54).toFixed(1)} × ${a.widthIn ?? (a.widthCm / 2.54).toFixed(1)} in)`
    : 'Available on request';

/** Compact size label for cards and listings. */
export const dimsShort = (a: Artwork): string =>
  a.heightCm != null && a.widthCm != null ? `${a.heightCm} × ${a.widthCm} cm` : 'Size on request';

/** Surface area in square centimetres — used to sort by scale. */
export const areaCm2 = (a: Artwork): number =>
  a.heightCm != null && a.widthCm != null ? a.heightCm * a.widthCm : 0;

/** Framing line for the specification list. */
export const framing = (a: Artwork): string =>
  a.framed ? (a.frameDescription ?? 'Framed') : 'Unframed — ready to hang';

/** CSS aspect-ratio string taken from the real photograph. */
export const aspect = (a: Artwork): string => `${a.imageWidth} / ${a.imageHeight}`;

/** Short label for price/availability used on cards. */
export const priceLabel = (a: Artwork): string =>
  a.status === 'sold' ? 'Sold' : a.price != null ? formatPrice(a.price, a.currency) : 'Enquire';

/* --- Proportional display scale ------------------------------------------
   Gallery cards used to render every painting at the same width, so a 40 cm
   study read as large as a 180 cm statement work. These helpers size each
   painting against the largest work in the register, so the grid tells the
   truth about scale.

   Size is measured by the geometric mean of the canvas (the square root of the
   area) rather than by the longest edge: a 152 x 122 cm work and a 180 x 120 cm
   work have almost the same long edge but very different presence on a wall,
   and matching long edges would draw the smaller one larger. Working from area
   keeps the rendered order strictly faithful to the real one.

   The drawn box uses the photograph's own aspect ratio, so nothing is cropped;
   only its area is controlled. */

/** Compression applied to the linear ratio. 1 = literal 1:1 scale;
 *  0.5 (square root) keeps the difference honest but readable — the largest
 *  works fill their cell and the smallest sit at just over half, where a
 *  literal ratio would drop them to a quarter and make them unreadable as
 *  thumbnails. Lower to flatten the range, raise towards 1 to exaggerate it. */
const SCALE_EXPONENT = 0.5;

/** Rendered size for a work whose dimensions are not yet recorded. */
const UNSIZED_SCALE = 0.72;

/** Geometric mean of the canvas in cm — the linear "how big is this" measure. */
const sizeCm = (a: Artwork): number =>
  a.widthCm != null && a.heightCm != null ? Math.sqrt(a.widthCm * a.heightCm) : 0;

/** The largest work in the register, against which everything else is scaled. */
const REFERENCE_CM: number = Math.max(1, ...artworks.map(sizeCm));

/** Compressed linear scale factor for a work, largest work = 1. */
const scaleFactor = (a: Artwork): number => {
  const size = sizeCm(a);
  return size ? Math.min(1, (size / REFERENCE_CM) ** SCALE_EXPONENT) : UNSIZED_SCALE;
};

/** Unnormalised drawn width and height, in stage units. */
const rawBox = (a: Artwork): [number, number] => {
  const root = Math.sqrt(a.imageWidth / a.imageHeight);
  const k = scaleFactor(a);
  return [k * root, k / root];
};

/** Divisor that makes the largest drawn work exactly fill its square stage. */
const STAGE_UNIT: number = Math.max(
  0.0001,
  ...artworks.map(a => Math.max(...rawBox(a))),
);

/**
 * How large this work should render relative to the largest work in the
 * register — 1 for the largest, ~0.5 for the smallest. Exposed for callers
 * that need the number itself rather than a CSS value.
 */
export const displayScale = (a: Artwork): number => scaleFactor(a);

/**
 * Width of the painting inside its square card stage, as a CSS percentage.
 * Height follows from the image's aspect ratio, so the drawn area — not the
 * longest edge — is what stays proportional between works.
 */
export const stageWidth = (a: Artwork): string =>
  `${((rawBox(a)[0] / STAGE_UNIT) * 100).toFixed(2)}%`;

/**
 * `sizes` hint for next/image on a scaled card, so a work drawn at half the
 * stage does not download a full-column image.
 */
export const cardSizes = (a: Artwork): string => {
  const fraction = rawBox(a)[0] / STAGE_UNIT;
  const vw = (column: number) => Math.max(8, Math.round(fraction * column));
  return `(max-width: 640px) ${vw(100)}vw, (max-width: 1024px) ${vw(50)}vw, ${vw(33)}vw`;
};
