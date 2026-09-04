import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import EnquiryForm from '@/components/EnquiryForm';
import JsonLd from '@/components/JsonLd';
import { mockups, getMockup, getArtwork, priceLabel, aspect, collectionName, dims } from '@/lib/data';
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

  // Breadcrumb runs back through the artwork so there is always a way home.
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'In Situ', path: '/mockups' },
    ...(a ? [{ name: a.title, path: `/artwork/${a.slug}` }] : []),
    { name: m.room, path: `/mockups/${m.slug}` },
  ];

  return (
    <Container className="py-14">
      <JsonLd data={graph(imageObjectSchema(m.image, m.alt), breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />

      {a && (
        <p className="mt-5">
          <Link href={`/artwork/${a.slug}`} className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-ink">
            <span aria-hidden>&larr;</span> Back to {a.title}
          </Link>
        </p>
      )}

      <div className="mt-4 grid gap-12 lg:grid-cols-2">
        {/* The mockup itself links back to the artwork */}
        {a ? (
          <Link href={`/artwork/${a.slug}`} aria-label={`View ${a.title}`} className="block">
            <PlaceholderImage src={m.image} alt={m.alt} ratio={m.aspect} priority />
          </Link>
        ) : (
          <PlaceholderImage src={m.image} alt={m.alt} ratio={m.aspect} priority />
        )}

        <div>
          <p className="text-xs uppercase tracking-widest text-ink/65">{m.room}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">{m.title}</h1>

          {a && (
            <>
              <div className="mt-6 rounded-lg border border-sand p-6">
                <p className="text-xs uppercase tracking-widest text-ink/65">The artwork</p>
                <div className="mt-3 flex items-start gap-4">
                  <Link href={`/artwork/${a.slug}`} className="w-28 shrink-0" aria-label={`View ${a.title}`}>
                    <PlaceholderImage src={a.image} alt={a.alt} ratio={aspect(a)} framed bright />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/artwork/${a.slug}`} className="font-serif text-2xl text-ink hover:underline">{a.title}</Link>
                    <p className="mt-1 text-sm text-ink/65">
                      {collectionName(a.primaryCollection)} · {priceLabel(a) === 'Enquire' ? 'Price on application' : priceLabel(a)}
                    </p>
                    <p className="mt-1 text-sm text-ink/65">{dims(a)}</p>
                    <p className="mt-2 text-xs text-ink/65">
                      {m.sceneId.startsWith('procedural-')
                        ? 'Shown to scale against a 2.7 m wall and a 120 cm bench, so the proportions match the painting in a real room.'
                        : 'Composited into a photographed interior at its true physical size, measured against the room’s own furniture.'}
                    </p>
                    <Link
                      href={`/artwork/${a.slug}`}
                      className="mt-3 inline-block rounded-full bg-ink px-5 py-2 text-sm text-bone"
                    >
                      View the artwork
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-sand p-6">
                <h2 className="font-serif text-2xl text-ink">Enquire about {a.title}</h2>
                <p className="mt-2 text-sm text-ink/65">Ask about size, medium, price and availability.</p>
                <div className="mt-4"><EnquiryForm subject={a.title} kind={a.status === 'sold' ? 'commission' : 'enquiry'} /></div>
              </div>

              <p className="mt-6 text-sm">
                <Link href="/mockups" className="underline">See all rooms</Link>
              </p>
            </>
          )}

          {m.credit && (
            <p className="mt-8 border-t border-sand pt-4 text-xs text-ink/65">
              Interior photograph by{' '}
              <a href={m.credit.photographerUrl} rel="nofollow noopener" className="underline">
                {m.credit.photographer}
              </a>{' '}
              on{' '}
              <a href={m.credit.sourceUrl} rel="nofollow noopener" className="underline">
                {m.credit.source}
              </a>. The artwork is shown composited at its true physical size.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
