export type Status = 'available' | 'sold' | 'reserved';

export interface FAQ { q: string; a: string; }

export interface Collection {
  id: string; slug: string; name: string; keyword: string; intent: string;
  heading: string; seoTitle: string; metaDescription: string; intro: string;
  faqs: FAQ[];
}

export interface Artwork {
  id: string; slug: string; title: string; year: number; medium: string;
  widthMm: number; heightMm: number; widthCm: number; heightCm: number;
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
