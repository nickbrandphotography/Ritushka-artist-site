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
  orientation: 'landscape' | 'portrait' | 'square';
  story: string; shortDescription: string;
  seoTitle: string; metaDescription: string;
  image: string; alt: string; mockups: string[];
}

export interface Mockup {
  id: string; slug: string; room: string; artworkSlug: string;
  title: string; image: string; alt: string;
  seoTitle: string; metaDescription: string;
}

export interface BlogPost {
  id: string; slug: string; title: string; audience: string;
  publishedAt: string; readMinutes: number; excerpt: string;
  seoTitle: string; metaDescription: string; relatedCollection: string;
  image: string; body: string;
}
