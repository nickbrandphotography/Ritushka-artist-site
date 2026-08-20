/**
 * SINGLE SOURCE OF TRUTH for artist identity & brand.
 * Swap these placeholder values for production. Everything (SEO, schema,
 * metadata, OG tags, contact details) reads from here.
 */
export const site = {
  artist: {
    name: 'Ritushka',
    fullName: 'Ritushka', // e.g. 'Ritushka Surname' when finalised
    tagline: 'Contemporary Abstract Landscape & Seascape Artist',
    shortBio:
      'Ritushka is a contemporary abstract artist based in Lane Cove, Sydney, creating large-scale abstract landscapes and seascapes for collectors, designers and architects worldwide.',
    nationality: 'Australian',
    jobTitle: 'Painter',
    portraitPath: '/about/ritushka-portrait.jpg',
    // Real, live social profile URLs only — schema.org `sameAs` and the
    // Person/Organization JSON-LD tell search engines and AI systems "this
    // is the same entity as this profile". A dead or placeholder URL here is
    // worse than none: it either 404s or, worse, resolves to someone else's
    // account. Add each handle here the day it goes live; leave empty until
    // then. See docs/SEO-STRATEGY.md "Remaining external actions".
    sameAs: [] as string[],
  },
  brand: {
    name: 'Ritushka Fine Art',
    // Legal entity name for Organization schema — only set this once it is
    // confirmed (sole trader vs. a registered Pty Ltd, and its exact
    // registered name/ABN). An unverified legal name in structured data is a
    // trust and compliance risk. Leave null until confirmed.
    legalName: null as string | null,
    logoPath: '/logo.png',
  },
  contact: {
    email: 'studio@ritushka.art',
    phone: '+61 403 835 467',
    studioByAppointment: true,
  },
  location: {
    suburb: 'Lane Cove',
    city: 'Sydney',
    state: 'NSW',
    country: 'Australia',
    countryCode: 'AU',
    region: 'New South Wales',
    geo: { lat: -33.8146, lng: 151.1696 }, // Lane Cove approx
    serviceArea: ['Sydney', 'Australia', 'Worldwide'],
  },
  url: 'https://www.ritushka.com', // production domain (canonical host)
  defaultOgImage: '/og/default.jpg',
  locale: 'en_AU',
  currency: 'AUD',
} as const;

export type Site = typeof site;
