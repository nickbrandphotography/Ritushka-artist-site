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
  price == null ? 'Sold' : new Intl.NumberFormat('en-AU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);

export const dims = (a: Artwork): string => `${a.heightCm} × ${a.widthCm} cm (${(a.heightMm/10/2.54).toFixed(0)} × ${(a.widthMm/10/2.54).toFixed(0)} in)`;
