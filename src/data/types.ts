export type Status = 'available' | 'sold' | 'reserved' | 'enquire';

export interface FAQ { q: string; a: string; }

export interface Collection {
  id: string; slug: string; name: string; keyword: string; intent: string;
  heading: string; seoTitle: string; metaDescription: string; intro: string;
  faqs: FAQ[];
}

export interface Artwork {
  id: string; slug: string; title: string;
  /** Inventory ID from the Artwork Register, e.g. "RIT-0007". */
  inventoryId: string | null;
  /** Year created — null until recorded in the Artwork Register. */
  year: number | null;
  /** Medium — empty string until recorded. */
  medium: string;
  /** Physical canvas size in cm — null until recorded (shown as "on request"). */
  widthCm: number | null; heightCm: number | null;
  /** Canvas depth in cm — the profile of the stretcher. */
  depthCm: number | null;
  /** Imperial equivalents, derived from the centimetre values. */
  widthIn: number | null; heightIn: number | null; depthIn: number | null;
  /** Framing, as recorded in the register. */
  framed: boolean; frameDescription: string | null;
  /** Edition type — "Original" unless recorded otherwise. */
  edition: string;
  /** The artist's own words about the work, from the register. */
  registerDescription: string | null;
  /** Where the work came from — kept in the data, not currently displayed. */
  inspiration: string | null;
  /** Pixel dimensions of the photograph, used for correct display aspect ratio. */
  imageWidth: number; imageHeight: number;
  palette: string; collections: string[]; primaryCollection: string;
  status: Status; price: number | null; currency: string;
  /** Achieved sale price, from the register's "Sale Price" column. Set only on
   *  sold works, and only where the sale was actually recorded — a sold work
   *  with no recorded figure keeps this null and reads as a plain "Sold". */
  soldPrice: number | null;
  orientation: 'landscape' | 'portrait' | 'square';
  story: string; shortDescription: string;
  seoTitle: string; metaDescription: string;
  image: string; alt: string; mockups: string[];
}

/** Attribution for a master interior photograph. Required by the Unsplash licence. */
export interface PhotoCredit {
  photographer: string; photographerUrl: string; source: string; sourceUrl: string;
}

export interface Mockup {
  id: string; slug: string; room: string; artworkSlug: string;
  /** Which master interior this was composited into — see mockups/scenes.json. */
  sceneId: string;
  title: string; image: string; alt: string;
  seoTitle: string; metaDescription: string;
  credit: PhotoCredit | null;
  /** CSS aspect-ratio of the rendered image — scenes are framed differently. */
  aspect: string;
}

/* --- Limited edition prints ------------------------------------------------
   See docs/prints-decisions.md for the researched/approved facts this model
   implements (edition structure, size cap, pricing formula, spec, signing).
   One `PrintEditionRecord` per artwork in src/data/prints.ts is the only thing
   that should ever be hand-edited — sizes, prices and remaining counts are all
   derived in src/lib/prints.ts from the artwork's own dimensions plus
   pricing.config.json, never stored twice (house rule R4). */

export type PrintTier = 'small' | 'medium' | 'large';

/** The one authoritative fact stored per edition per size: how many have sold.
 *  Remaining count is always `editionSize - sold`, computed, never stored —
 *  see docs/PRINTS_IMPLEMENTATION_PROMPT.md Section 2.6: "remaining-quantity
 *  is a single derived value from one authoritative field." Update this by
 *  hand once a reservation (transactionModel: reserve) is confirmed and paid
 *  — there is no automated inventory system, so this field is only as
 *  accurate as it is kept. Omitted tiers default to 0 sold. */
export interface PrintEditionRecord {
  artworkSlug: string;
  sold?: Partial<Record<PrintTier, number>>;
}

/** A single size tier of a print edition, fully computed — nothing here is
 *  hand-entered. See computePrintSizes() in src/lib/prints.ts. */
export interface PrintSize {
  tier: PrintTier;
  label: string;
  widthCm: number;
  heightCm: number;
  widthIn: number;
  heightIn: number;
  editionSize: number;
  sold: number;
  remaining: number;
  price: number;
  currency: string;
  sku: string;
}

/** A full print edition for one artwork — the artwork itself is looked up by
 *  slug, never duplicated (title/image/dimensions/story stay in Artwork). */
export interface PrintEdition {
  artwork: Artwork;
  sizes: PrintSize[];
  fromPrice: number | null;
  soldOut: boolean;
}

export interface BlogPost {
  id: string; slug: string; title: string; audience: string;
  publishedAt: string; readMinutes: number; excerpt: string;
  seoTitle: string; metaDescription: string; relatedCollection: string;
  image: string; body: string;
}
