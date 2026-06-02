import type { Metadata } from 'next';
import '@/styles/globals.css';
import { site } from '@/site.config';
import { titleTemplate } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import { graph, personSchema, organizationSchema, websiteSchema } from '@/lib/schema';

// Fonts loaded via stylesheet link in <head> (build-safe; swap to next/font in prod for best CLS).

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
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" />
      </head>
      <body className="font-sans">
        <JsonLd data={graph(personSchema(), organizationSchema(), websiteSchema())} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-bone">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
