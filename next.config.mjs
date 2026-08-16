import { readFileSync } from 'node:fs';

// Mockup URLs move when an artwork is matched to a different interior scene.
// scripts/match-scenes.py records every change here so no link ever 404s.
const mockupRedirects = JSON.parse(readFileSync('./mockups/redirects.json', 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
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
      ...Object.entries(mockupRedirects).map(([from, to]) => ({
        source: `/mockups/${from}`,
        destination: `/mockups/${to}`,
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
