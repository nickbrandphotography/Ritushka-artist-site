import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import '@/styles/globals.css';
import { site } from '@/site.config';
import { titleTemplate } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { graph, personSchema, organizationSchema, websiteSchema } from '@/lib/schema';

// Self-hosted via next/font: no render-blocking request to fonts.googleapis.com,
// no third-party connection for EU visitors (Google Fonts loaded from Google's
// CDN sends the visitor's IP to Google on every page view — a GDPR exposure
// German courts have fined sites over; self-hosting removes it entirely),
// automatic font-display: swap, and no CLS from a late-swapping web font.
// `latin-ext` is required alongside `latin` — the About page's Hungarian
// letter uses ő/ű (double acute), which the base `latin` subset omits.
const serif = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.artist.name + ' — ' + site.artist.tagline, template: titleTemplate },
  description: site.artist.shortBio,
  applicationName: site.brand.name,
  authors: [{ name: site.artist.fullName }],
  creator: site.artist.fullName,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: site.locale, siteName: site.brand.name },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">
        <JsonLd data={graph(personSchema(), organizationSchema(), websiteSchema())} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-bone">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
