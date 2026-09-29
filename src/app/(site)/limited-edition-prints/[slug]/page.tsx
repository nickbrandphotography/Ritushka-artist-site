import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import PrintSizeSelector from '@/components/PrintSizeSelector';
import PrintCard from '@/components/PrintCard';
import JsonLd from '@/components/JsonLd';
import { collectionName, aspect } from '@/lib/data';
import { allPrintEditions, getPrintEdition, PRINT_SPECIFICATION, soldOriginalPrintNote } from '@/lib/prints';
import { buildMetadata } from '@/lib/seo';
import { graph, printProductSchema, breadcrumbSchema } from '@/lib/schema';
import { printEditions } from '@/data/prints';

export function generateStaticParams() {
  return printEditions.map(p => ({ slug: p.artworkSlug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const edition = getPrintEdition(params.slug);
  if (!edition) return {};
  const { artwork: a, fromPrice, sizes } = edition;
  return buildMetadata({
    title: `${a.title} — Limited Edition Print`,
    description: `Limited edition archival print of "${a.title}" by Ritushka. Hand-signed, numbered edition of ${sizes[0]?.editionSize ?? ''}${fromPrice != null ? `, from A$${fromPrice.toLocaleString('en-AU')}` : ''}.`,
    path: `/limited-edition-prints/${a.slug}`,
    image: a.image,
  });
}

export default function PrintProductPage({ params }: { params: { slug: string } }) {
  const edition = getPrintEdition(params.slug);
  if (!edition) notFound();
  const { artwork: a, sizes, soldOut } = edition;

  const related = allPrintEditions()
    .filter(e => e.artwork.slug !== a.slug && e.artwork.primaryCollection === a.primaryCollection)
    .slice(0, 3);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Limited Edition Prints', path: '/limited-edition-prints' },
    { name: a.title, path: `/limited-edition-prints/${a.slug}` },
  ];

  const description = a.registerDescription ?? a.story.split('\n\n')[0];

  return (
    <Container className="py-14">
      <JsonLd data={graph(printProductSchema(edition), breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />

      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <div>
          <PlaceholderImage src={a.image} alt={a.alt} ratio={aspect(a)} priority framed bright />
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-ink/65">
            {collectionName(a.primaryCollection)} · Limited edition print
          </p>
          <h1 className="mt-2 font-serif text-4xl text-ink md:text-5xl">{a.title}</h1>
          <p className="mt-2 text-sm text-ink/65">An original painting by Ritushka</p>

          <div className="prose-art mt-6">
            <p>{description}</p>
          </div>

          <section className="mt-8 border-t border-sand pt-6" aria-labelledby="edition-info">
            <h2 id="edition-info" className="font-serif text-xl text-ink">Edition information</h2>
            <p className="mt-3 text-sm text-ink/70">
              Each size is its own fixed, numbered edition — shown as <strong>n / N</strong> on the certificate, where{' '}
              <strong>N</strong> is the total edition size for that size and <strong>n</strong> is this print&rsquo;s
              own number within it. {soldOut ? 'This edition is fully sold.' : 'Choose a size below to see its remaining availability.'}
            </p>
          </section>

          <section className="mt-8 border-t border-sand pt-6" aria-labelledby="print-selection">
            <h2 id="print-selection" className="sr-only">Size and reservation</h2>
            <PrintSizeSelector artworkTitle={a.title} sizes={sizes} />
          </section>

          <section className="mt-8 border-t border-sand pt-6" aria-labelledby="specification">
            <h2 id="specification" className="font-serif text-xl text-ink">Print specification</h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
              <dt className="text-ink/65">Process</dt>
              <dd>{PRINT_SPECIFICATION.process}</dd>
              <dt className="text-ink/65">Paper</dt>
              <dd>{PRINT_SPECIFICATION.paper}</dd>
              <dt className="text-ink/65">Signing</dt>
              <dd>{PRINT_SPECIFICATION.signing}</dd>
              <dt className="text-ink/65">Numbering</dt>
              <dd>{PRINT_SPECIFICATION.numbering}</dd>
              <dt className="text-ink/65">Certificate</dt>
              <dd>{PRINT_SPECIFICATION.certificate}</dd>
              <dt className="text-ink/65">Framing</dt>
              <dd>{PRINT_SPECIFICATION.framing} — <Link href="/framing" className="underline hover:text-ink">learn more</Link></dd>
              <dt className="text-ink/65">Shipping</dt>
              <dd>{PRINT_SPECIFICATION.fulfilment}. {PRINT_SPECIFICATION.leadTime}.</dd>
            </dl>
          </section>

          <p className="mt-8 border-t border-sand pt-6 text-sm">
            {a.status === 'sold' ? (
              <>{soldOriginalPrintNote(a.title)} <Link href={`/artwork/${a.slug}`} className="underline">View the original</Link>.</>
            ) : (
              <>Prefer the original painting? <Link href={`/artwork/${a.slug}`} className="underline">View {a.title}</Link>.</>
            )}
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-sand pt-10" aria-labelledby="related-editions">
          <h2 id="related-editions" className="font-serif text-3xl text-ink">More from {collectionName(a.primaryCollection)}</h2>
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(e => <PrintCard key={e.artwork.slug} edition={e} />)}
          </div>
        </section>
      )}
    </Container>
  );
}
