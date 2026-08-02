import { site } from '@/site.config';
import type { Artwork, Collection, BlogPost, FAQ } from '@/data/types';

const abs = (p: string) => new URL(p, site.url).toString();

export const personSchema = () => ({
  '@type': 'Person',
  '@id': abs('/#person'),
  name: site.artist.fullName,
  alternateName: site.artist.name,
  jobTitle: site.artist.jobTitle,
  description: site.artist.shortBio,
  nationality: site.artist.nationality,
  url: site.url,
  image: abs(site.defaultOgImage),
  sameAs: site.artist.sameAs,
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.suburb,
    addressRegion: site.location.state,
    addressCountry: site.location.countryCode,
  },
  knowsAbout: ['Abstract landscape art', 'Abstract seascape paintings', 'Contemporary Australian art', 'Large scale painting', 'Art commissions'],
});

export const organizationSchema = () => ({
  '@type': ['Organization', 'LocalBusiness'],
  '@id': abs('/#organization'),
  name: site.brand.name,
  legalName: site.brand.legalName,
  url: site.url,
  logo: abs(site.brand.logoPath),
  email: site.contact.email,
  founder: { '@id': abs('/#person') },
  areaServed: site.location.serviceArea,
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.suburb,
    addressRegion: site.location.state,
    addressCountry: site.location.countryCode,
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.location.geo.lat, longitude: site.location.geo.lng },
});

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': abs('/#website'),
  url: site.url,
  name: site.brand.name,
  publisher: { '@id': abs('/#organization') },
  inLanguage: 'en-AU',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: abs('/portfolio?q={query}') },
    'query-input': 'required name=query',
  },
});

export const visualArtworkSchema = (a: Artwork) => ({
  '@type': 'VisualArtwork',
  '@id': abs(`/artwork/${a.slug}#artwork`),
  name: a.title,
  creator: { '@id': abs('/#person') },
  artform: 'Painting',
  ...(a.medium ? { artMedium: a.medium } : {}),
  artworkSurface: 'Canvas',
  ...(a.widthCm != null ? { width: { '@type': 'QuantitativeValue', value: a.widthCm, unitCode: 'CMT' } } : {}),
  ...(a.heightCm != null ? { height: { '@type': 'QuantitativeValue', value: a.heightCm, unitCode: 'CMT' } } : {}),
  ...(a.year != null ? { dateCreated: String(a.year) } : {}),
  description: a.story,
  image: abs(a.image),
  url: abs(`/artwork/${a.slug}`),
  inLanguage: 'en-AU',
  ...(a.status === 'sold'
    ? { offers: { '@type': 'Offer', availability: 'https://schema.org/SoldOut' } }
    : a.price != null
      ? { offers: { '@type': 'Offer', price: a.price, priceCurrency: a.currency, availability: 'https://schema.org/InStock', url: abs(`/artwork/${a.slug}`), seller: { '@id': abs('/#organization') } } }
      : {}),
});

export const collectionPageSchema = (c: Collection, items: Artwork[]) => ({
  '@type': 'CollectionPage',
  '@id': abs(`/collections/${c.slug}#collection`),
  name: c.heading,
  description: c.metaDescription,
  url: abs(`/collections/${c.slug}`),
  about: c.keyword,
  isPartOf: { '@id': abs('/#website') },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/artwork/${a.slug}`), name: a.title })),
  },
});

export const articleSchema = (p: BlogPost) => ({
  '@type': 'Article',
  '@id': abs(`/blog/${p.slug}#article`),
  headline: p.title,
  description: p.metaDescription,
  datePublished: p.publishedAt,
  dateModified: p.publishedAt,
  author: { '@id': abs('/#person') },
  publisher: { '@id': abs('/#organization') },
  image: abs(p.image),
  mainEntityOfPage: abs(`/blog/${p.slug}`),
  inLanguage: 'en-AU',
});

export const faqSchema = (faqs: FAQ[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const breadcrumbSchema = (crumbs: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
});

export const imageObjectSchema = (url: string, caption: string) => ({
  '@type': 'ImageObject',
  contentUrl: abs(url),
  url: abs(url),
  caption,
  creator: { '@id': abs('/#person') },
  creditText: site.brand.name,
});

/** Wrap any node(s) in a @graph document */
export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
