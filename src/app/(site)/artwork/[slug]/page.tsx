import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import EnquiryForm from '@/components/EnquiryForm';
import Gallery from '@/components/Gallery';
import JsonLd from '@/components/JsonLd';
import { artworks, getArtwork, relatedArtworks, mockupsForArtwork, collectionName, priceLabel, dims, aspect, framing } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, visualArtworkSchema, breadcrumbSchema } from '@/lib/schema';

export function generateStaticParams() { return artworks.map(a => ({ slug: a.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = getArtwork(params.slug); if (!a) return {};
  return buildMetadata({ title: a.seoTitle, description: a.metaDescription, path: `/artwork/${a.slug}`, image: a.image });
}

export default function ArtworkPage({ params }: { params: { slug: string } }) {
  const a = getArtwork(params.slug); if (!a) notFound();
  const related = relatedArtworks(a);
  const mocks = mockupsForArtwork(a.slug);
  // The register description is Ritushka's own words. The generated `story` is kept
  // for structured data only — its second paragraph repeats size, frame and price,
  // all of which the Specification list below already states.
  const description = a.registerDescription ?? a.story.split('\n\n')[0];
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: collectionName(a.primaryCollection), path: `/collections/${a.primaryCollection}` },
    { name: a.title, path: `/artwork/${a.slug}` },
  ];
  return (
    <Container className="py-14">
      <JsonLd data={graph(visualArtworkSchema(a), breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <div>
          <PlaceholderImage src={a.image} alt={a.alt} ratio={aspect(a)} priority framed />
          {mocks.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {mocks.map(m => (
                <Link key={m.slug} href={`/mockups/${m.slug}`}>
                  <PlaceholderImage src={m.image} alt={m.alt} ratio={m.aspect} />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/65">{collectionName(a.primaryCollection)}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink md:text-5xl">{a.title}</h1>
          <p className="mt-3 text-xl text-ink/70">{priceLabel(a) === 'Enquire' ? 'Price on application' : priceLabel(a)}</p>
          <div className="prose-art mt-6">
            <p>{description}</p>
          </div>
          {a.inspiration && (
            <figure className="mt-6 border-l border-sand pl-5">
              <figcaption className="text-xs uppercase tracking-widest text-ink/65">Artist&rsquo;s inspiration</figcaption>
              <blockquote className="mt-2 font-serif text-lg italic leading-relaxed text-ink/80">{a.inspiration}</blockquote>
            </figure>
          )}

          <section className="mt-8 border-t border-sand pt-6" aria-labelledby="specification">
            <h2 id="specification" className="font-serif text-xl text-ink">Specification</h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
              <dt className="text-ink/65">Dimensions</dt>
              <dd>{dims(a)}</dd>
              {a.depthCm != null && (<>
                <dt className="text-ink/65">Depth</dt>
                <dd>{a.depthCm} cm{a.depthIn != null && ` (${a.depthIn} in)`}</dd>
              </>)}
              <dt className="text-ink/65">Orientation</dt>
              <dd className="capitalize">{a.orientation}</dd>
              <dt className="text-ink/65">Medium</dt>
              <dd>{a.medium || 'Original painting — details on request'}</dd>
              <dt className="text-ink/65">Framing</dt>
              <dd>{framing(a)} — <Link href="/framing" className="underline hover:text-ink">custom framing available</Link></dd>
              <dt className="text-ink/65">Edition</dt>
              <dd>{a.edition}{a.edition === 'Original' && ' — a unique, one-off work'}</dd>
              {a.year != null && (<>
                <dt className="text-ink/65">Year</dt>
                <dd>{a.year}</dd>
              </>)}
              <dt className="text-ink/65">Palette</dt>
              <dd className="capitalize">{a.palette}</dd>
              <dt className="text-ink/65">Availability</dt>
              <dd>{a.status === 'sold' ? 'Sold — commission a related work' : 'Available — enquire to confirm'}</dd>
              <dt className="text-ink/65">Shipping</dt>
              <dd>Worldwide, insured, with certificate of authenticity</dd>
              {a.inventoryId && (<>
                <dt className="text-ink/65">Reference</dt>
                <dd>{a.inventoryId}</dd>
              </>)}
            </dl>
          </section>
          <div className="mt-8 rounded-lg border border-sand p-6">
            <h2 className="font-serif text-2xl text-ink">{a.status === 'sold' ? 'Commission a related work' : 'Enquire about this work'}</h2>
            <p className="mt-2 text-sm text-ink/65">Ask about size, medium, price and availability — Ritushka&rsquo;s studio replies within two business days.</p>
            <div className="mt-4"><EnquiryForm subject={a.title} kind={a.status === 'sold' ? 'commission' : 'enquiry'} /></div>
          </div>
          <p className="mt-4 text-sm">Part of:{' '}
            {a.collections.map((c, i) => (
              <span key={c}>{i > 0 && ', '}<Link href={`/collections/${c}`} className="underline">{collectionName(c)}</Link></span>
            ))}
          </p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20 border-t border-sand pt-10">
          <h2 className="font-serif text-3xl text-ink">Related works</h2>
          <div className="mt-8"><Gallery items={related} /></div>
        </section>
      )}
    </Container>
  );
}
