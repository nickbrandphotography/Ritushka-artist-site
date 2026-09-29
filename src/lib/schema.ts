import { site } from '@/site.config';
import type { Artwork, Collection, BlogPost, FAQ, PrintEdition } from '@/data/types';

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
  image: abs(site.artist.portraitPath),
  ...(site.artist.sameAs.length > 0 ? { sameAs: site.artist.sameAs } : {}),
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
  ...(site.brand.legalName ? { legalName: site.brand.legalName } : {}),
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
  ...(a.widthCm != null ? { width: { '@type': 'QuantitativeValue', value: a.widthCm, unitCode: 'CMT', unitText: 'cm' } } : {}),
  ...(a.heightCm != null ? { height: { '@type': 'QuantitativeValue', value: a.heightCm, unitCode: 'CMT', unitText: 'cm' } } : {}),
  ...(a.depthCm != null ? { depth: { '@type': 'QuantitativeValue', value: a.depthCm, unitCode: 'CMT', unitText: 'cm' } } : {}),
  ...(a.heightCm != null && a.widthCm != null
    ? { size: `${a.heightCm} × ${a.widthCm} cm`, material: a.framed && a.frameDescription ? a.frameDescription : 'Canvas' }
    : {}),
  ...(a.inventoryId ? { identifier: a.inventoryId } : {}),
  ...(a.edition ? { artEdition: a.edition } : {}),
  ...(a.year != null ? { dateCreated: String(a.year) } : {}),
  description: a.story.replace(/\n\n/g, ' '),
  image: abs(a.image),
  url: abs(`/artwork/${a.slug}`),
  inLanguage: 'en-AU',
  // A sold work still carries an Offer, marked SoldOut, so search and AI
  // engines can read the achieved price where one is recorded — the price a
  // painting reached is the strongest signal of the artist's market.
  ...(a.status === 'sold'
    ? { offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/SoldOut',
        ...(a.soldPrice != null
          ? { price: a.soldPrice, priceCurrency: a.currency, url: abs(`/artwork/${a.slug}`) }
          : {}),
      } }
    : a.price != null
      ? { offers: { '@type': 'Offer', price: a.price, priceCurrency: a.currency, availability: 'https://schema.org/InStock', url: abs(`/artwork/${a.slug}`), seller: { '@id': abs('/#organization') } } }
      : {}),
});

/** Product + AggregateOffer for a print edition's product page. Every price
 *  and availability value comes from the edition's own computed sizes
 *  (src/lib/prints.ts) — never a fabricated figure. `isBasedOn` links to the
 *  original's own VisualArtwork node rather than duplicating its facts. */
export const printProductSchema = (edition: PrintEdition) => {
  const a = edition.artwork;
  const prices = edition.sizes.map(s => s.price);
  return {
    '@type': 'Product',
    '@id': abs(`/limited-edition-prints/${a.slug}#product`),
    name: `${a.title} — Limited Edition Print`,
    description: `Limited edition archival giclée print of "${a.title}" by ${site.artist.fullName}, hand-signed and numbered.`,
    image: abs(a.image),
    url: abs(`/limited-edition-prints/${a.slug}`),
    brand: { '@id': abs('/#organization') },
    isBasedOn: { '@id': abs(`/artwork/${a.slug}#artwork`) },
    ...(edition.sizes.length > 0
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: edition.sizes[0].currency,
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: edition.sizes.length,
            offers: edition.sizes.map(s => ({
              '@type': 'Offer',
              name: `${s.label} — ${s.heightCm} × ${s.widthCm} cm`,
              price: s.price,
              priceCurrency: s.currency,
              availability: s.remaining > 0 ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/SoldOut',
              sku: s.sku,
              url: abs(`/limited-edition-prints/${a.slug}`),
              seller: { '@id': abs('/#organization') },
            })),
          },
        }
      : {}),
  };
};

/** CollectionPage/ItemList for the /limited-edition-prints hub. */
export const printsCollectionPageSchema = (editions: PrintEdition[]) => ({
  '@type': 'CollectionPage',
  '@id': abs('/limited-edition-prints#collection'),
  name: 'Limited Edition Prints',
  description: 'Fixed, numbered limited edition archival prints of original paintings by Ritushka, hand-signed and printed on archival cotton rag paper.',
  url: abs('/limited-edition-prints'),
  isPartOf: { '@id': abs('/#website') },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: editions.length,
    itemListElement: editions.map((e, i) => ({
      '@type': 'ListItem', position: i + 1,
      url: abs(`/limited-edition-prints/${e.artwork.slug}`), name: `${e.artwork.title} — Limited Edition Print`,
    })),
  },
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

/** CollectionPage/ItemList for the hub pages that aren't a curated Collection
 *  record — /portfolio, /available, /sold. Same shape as collectionPageSchema
 *  so these pages are legible to search/AI as a defined set of works, not an
 *  unstructured gallery. */
export const worksListPageSchema = (path: string, name: string, description: string, items: Artwork[]) => ({
  '@type': 'CollectionPage',
  '@id': abs(`${path}#collection`),
  name,
  description,
  url: abs(path),
  isPartOf: { '@id': abs('/#website') },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/artwork/${a.slug}`), name: a.title })),
  },
});

/** A service offered alongside the artwork itself (framing, installation) —
 *  distinct from a Product/Offer, since there's no fixed price to publish. */
export const serviceSchema = (path: string, name: string, description: string, areaServed?: readonly string[]) => ({
  '@type': 'Service',
  '@id': abs(`${path}#service`),
  name,
  description,
  url: abs(path),
  provider: { '@id': abs('/#organization') },
  ...(areaServed ? { areaServed } : {}),
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
