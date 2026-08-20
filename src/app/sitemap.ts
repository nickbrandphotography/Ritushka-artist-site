import type { MetadataRoute } from 'next';
import { site } from '@/site.config';
import { artworks, collections, mockups, blog } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => new URL(p, site.url).toString();
  const now = new Date();
  const statics = ['', '/about', '/portfolio', '/collections', '/available', '/sold', '/commission',
    '/trade', '/trade/interior-designers', '/trade/art-consultants', '/trade/buyers-agents', '/trade/corporate',
    '/installation-guide', '/shipping', '/faq', '/contact', '/mockups', '/blog', '/privacy', '/terms'];
  return [
    ...statics.map(p => ({ url: u(p || '/'), lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...collections.map(c => ({ url: u(`/collections/${c.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...artworks.map(a => ({ url: u(`/artwork/${a.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9 })),
    ...mockups.map(m => ({ url: u(`/mockups/${m.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...blog.map(p => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.publishedAt), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
