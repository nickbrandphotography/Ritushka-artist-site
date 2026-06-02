import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import EnquiryForm from '@/components/EnquiryForm';
import JsonLd from '@/components/JsonLd';
import { mockups, getMockup, getArtwork, formatPrice, dims } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, imageObjectSchema, breadcrumbSchema } from '@/lib/schema';

export function generateStaticParams() { return mockups.map(m => ({ slug: m.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const m = getMockup(params.slug); if (!m) return {};
  return buildMetadata({ title: m.seoTitle, description: m.metaDescription, path: `/mockups/${m.slug}`, image: m.image });
}
export default function MockupPage({ params }: { params: { slug: string } }) {
  const m = getMockup(params.slug); if (!m) notFound();
  const a = getArtwork(m.artworkSlug);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'In Situ', path: '/mockups' }, { name: m.title, path: `/mockups/${m.slug}` }];
  return (
    <Container className="py-14">
      <JsonLd data={graph(imageObjectSchema(m.image, m.alt), breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <PlaceholderImage src={m.image} alt={m.alt} ratio="4 / 3" priority />
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50">{m.room}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{m.title}</h1>
          {a && (
            <div className="mt-6 rounded-lg border border-sand p-6">
              <p className="text-sm text-ink/55">Featured artwork</p>
              <Link href={`/artwork/${a.slug}`} className="mt-1 block font-serif text-2xl text-ink underline">{a.title}</Link>
              <p className="mt-1 text-sm text-ink/60">{dims(a)} · {a.status === 'sold' ? 'Sold' : formatPrice(a.price, a.currency)}</p>
              <div className="mt-4"><EnquiryForm subject={a.title} kind={a.status === 'sold' ? 'commission' : 'enquiry'} /></div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
