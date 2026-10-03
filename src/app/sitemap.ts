import type { MetadataRoute } from 'next';
import { site } from '@/site.config';
import { artworks, collections, mockups, blog } from '@/lib/data';
import { allPrintEditions } from '@/lib/prints';

// lastModified is only set where we have a real date (blog posts). Stamping every URL with the
// build time teaches Google to ignore lastmod, so it is omitted elsewhere.
// /privacy and /terms are disallowed in robots.ts, so they are left out here too.
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => new URL(p, site.url).toString();
  const statics = ['', '/about', '/portfolio', '/collections', '/available', '/sold', '/commission', '/framing',
    '/trade', '/trade/interior-designers', '/trade/art-consultants', '/trade/buyers-agents', '/trade/corporate',
    '/installation-guide', '/shipping', '/faq', '/contact', '/mockups', '/blog',
    '/limited-edition-prints'];
  return [
    ...statics.map(p => ({ url: u(p || '/'), changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...collections.map(c => ({ url: u(`/collections/${c.slug}`), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...artworks.map(a => ({ url: u(`/artwork/${a.slug}`), changeFrequency: 'monthly' as const, priority: 0.9 })),
    ...allPrintEditions().map(e => ({ url: u(`/limited-edition-prints/${e.artwork.slug}`), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...mockups.map(m => ({ url: u(`/mockups/${m.slug}`), changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...blog.map(p => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.publishedAt), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
