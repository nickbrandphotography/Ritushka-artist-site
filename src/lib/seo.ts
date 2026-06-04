import type { Metadata } from 'next';
import { site } from '@/site.config';

interface MetaArgs {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export function buildMetadata({ title, description, path, image, type = 'website', noindex }: MetaArgs): Metadata {
  const url = new URL(path, site.url).toString();
  const ogImage = image ? new URL(image, site.url).toString() : new URL(site.defaultOgImage, site.url).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title, description, url, siteName: site.brand.name, locale: site.locale, type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export const titleTemplate = `%s | ${site.artist.name}`;
