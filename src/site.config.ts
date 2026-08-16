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
    sameAs: [
      'https://www.instagram.com/PLACEHOLDER',
      'https://www.facebook.com/PLACEHOLDER',
      'https://www.pinterest.com/PLACEHOLDER',
    ],
  },
  brand: {
    name: 'Ritushka Fine Art',
    legalName: 'Ritushka Fine Art Pty Ltd', // PLACEHOLDER
    logoPath: '/logo.svg',
  },
  contact: {
    email: 'studio@ritka.net',
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
