import { readFileSync } from 'node:fs';

// Mockup URLs move when an artwork is matched to a different interior scene.
// scripts/match-scenes.py records every change here so no link ever 404s.
const mockupRedirects = JSON.parse(readFileSync('./mockups/redirects.json', 'utf8'));

// Blog posts retired in the templated-content cleanup (scripts/rewrite-blog-content.py)
// — each 301s to the closest surviving post or collection so no former URL 404s.
const blogRedirects = JSON.parse(readFileSync('./scripts/.blog-redirects.json', 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Every image on the site ships from /public — there is no remote or
    // user-supplied image source. A wildcard remotePatterns entry would let
    // the Image Optimizer fetch and proxy any HTTPS URL (SSRF / cost-abuse
    // surface) for no benefit. Add a specific hostname here only when a real
    // remote source (e.g. a CMS media host) is wired in.
  },
  // Titles corrected against the Artwork Register — keep the old URLs alive.
  async redirects() {
    const slugs = {
      erruption: 'eruption',
      mashmellow: 'marshmallow',
      'piece-of-white-heavan': 'peace-of-white-heaven',
      'tree-of-our-life': 'tree-of-our-lives',
    };
    const rooms = {
      erruption: 'penthouse',
      mashmellow: 'modern-apartment',
      'piece-of-white-heavan': 'hotel-lobby',
      'tree-of-our-life': 'modern-apartment',
    };
    return [
      ...Object.entries(slugs).map(([from, to]) => ({
        source: `/artwork/${from}`,
        destination: `/artwork/${to}`,
        permanent: true,
      })),
      ...Object.entries(slugs).map(([from, to]) => ({
        source: `/mockups/${from}-in-${rooms[from]}`,
        destination: `/mockups/${to}-in-${rooms[from]}`,
        permanent: true,
      })),
      // "Wave" was a stray duplicate entry, never part of the Artwork
      // Register — removed from artworks.ts/mockups.ts. Redirected rather
      // than left to 404, in case either URL was ever crawled or bookmarked.
      { source: '/artwork/wave', destination: '/collections/abstract-seascapes', permanent: true },
      { source: '/mockups/wave-in-boardroom', destination: '/mockups', permanent: true },
      ...Object.entries(mockupRedirects).map(([from, to]) => ({
        source: `/mockups/${from}`,
        destination: `/mockups/${to}`,
        permanent: true,
      })),
      ...Object.entries(blogRedirects).map(([from, to]) => ({
        source: `/blog/${from}`,
        destination: to,
        permanent: true,
      })),
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};
export default nextConfig;
