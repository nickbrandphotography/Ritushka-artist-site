import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PrintCard from '@/components/PrintCard';
import FAQList from '@/components/FAQList';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { allPrintEditions, PRINT_SPECIFICATION, PRINT_EDITION_PROMISE } from '@/lib/prints';
import { buildMetadata } from '@/lib/seo';
import { graph, printsCollectionPageSchema, faqSchema, breadcrumbSchema } from '@/lib/schema';
import { site } from '@/site.config';

export const metadata = buildMetadata({
  title: 'Limited Edition Prints',
  description: `Fixed, numbered limited edition archival prints of original paintings by ${site.artist.name}. Hand-signed, printed on archival cotton rag paper, never at the scale of the original.`,
  path: '/limited-edition-prints',
});

const faqs = [
  {
    q: 'What is a limited edition print?',
    a: `An archival giclée print of one of ${site.artist.name}'s original paintings — printed on ${PRINT_SPECIFICATION.paper}, hand-signed by the artist in pencil, and numbered as part of a fixed, finite edition. It is not an open-ended reproduction; once an edition's numbers are gone, no more are made.`,
  },
  {
    q: 'How many prints are made of each work?',
    a: 'Each size is its own independently numbered edition: 50 for Small, 30 for Medium, 15 for Large. A size is never reopened or expanded once its numbers are sold.',
  },
  {
    q: 'What sizes are available, and can a print match the size of the original?',
    a: 'Up to three sizes — Small, Medium and Large — each true to the painting’s own proportions. A print’s longest edge is always capped well below the original’s own dimensions, so a print is never offered at, or near, the scale of the original painting. Not every size is offered for every work — the cap means some smaller originals only support a Small print.',
  },
  {
    q: 'Can I order a print of a painting that has already sold?',
    a: 'Yes. The print programme runs independently of an individual painting’s sale status — a sold original’s page will say so plainly, and its print edition continues as normal.',
  },
  {
    q: 'How do I purchase a print?',
    a: 'Choose a size on the print’s page and submit a reservation. Ritushka’s studio confirms availability and sends an invoice within two business days — there is no instant online checkout.',
  },
  {
    q: 'Are prints framed?',
    a: `${PRINT_SPECIFICATION.framing}.`,
  },
  {
    q: 'Is a certificate of authenticity included?',
    a: `${PRINT_SPECIFICATION.certificate}.`,
  },
  {
    q: 'How long does a print take to arrive?',
    a: `${PRINT_SPECIFICATION.leadTime}.`,
  },
];

export default function LimitedEditionPrintsPage() {
  const editions = allPrintEditions();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Limited Edition Prints', path: '/limited-edition-prints' }];

  return (
    <Container className="py-14">
      <JsonLd data={graph(printsCollectionPageSchema(editions), faqSchema(faqs), breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />

      <h1 className="mt-5 max-w-3xl font-serif text-4xl text-ink md:text-5xl">Limited Edition Prints</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">
        Fixed, numbered editions of {site.artist.name}&rsquo;s original paintings — archival pigment giclée on cotton
        rag paper, hand-signed and numbered, each size capped well below the scale of the original.
      </p>

      <div className="prose-art mt-6 max-w-2xl">
        <p>
          These are not reproductions in the poster sense. Each print is made to order on {PRINT_SPECIFICATION.paper},
          with {PRINT_SPECIFICATION.ink.toLowerCase()}, in a fixed edition that is never expanded once set. The paper
          itself is part of the decision: a print on cotton rag paper reads unmistakably as a print, never as a
          stand-in for the painted canvas it comes from.
        </p>
      </div>

      <div className="mt-10">
        {editions.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {editions.map((e, i) => <PrintCard key={e.artwork.slug} edition={e} priority={i < 3} />)}
          </div>
        ) : (
          <p className="text-ink/65">The print programme is being prepared — check back shortly.</p>
        )}
      </div>

      <section className="mt-20 border-t border-sand pt-10" aria-labelledby="collector-experience">
        <h2 id="collector-experience" className="font-serif text-3xl text-ink">The collector experience</h2>
        <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-ink">Edition structure</dt>
            <dd className="mt-1 text-ink/70">Each size is its own numbered edition — 50 Small, 30 Medium, 15 Large — never shared across sizes.</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Archival printing</dt>
            <dd className="mt-1 text-ink/70">{PRINT_SPECIFICATION.process} with {PRINT_SPECIFICATION.ink.toLowerCase()}.</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Materials</dt>
            <dd className="mt-1 text-ink/70">{PRINT_SPECIFICATION.paper}.</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Signing &amp; numbering</dt>
            <dd className="mt-1 text-ink/70">{PRINT_SPECIFICATION.signing}. {PRINT_SPECIFICATION.numbering}.</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Certificate of authenticity</dt>
            <dd className="mt-1 text-ink/70">{PRINT_SPECIFICATION.certificate}.</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Fulfilment</dt>
            <dd className="mt-1 text-ink/70">{PRINT_SPECIFICATION.fulfilment}. {PRINT_SPECIFICATION.leadTime}.</dd>
          </div>
        </dl>
      </section>

      <section className="mt-16 border-t border-sand pt-10" aria-labelledby="sizes">
        <h2 id="sizes" className="font-serif text-3xl text-ink">Sizes</h2>
        <p className="mt-4 max-w-2xl text-ink/70">
          Three sizes — <strong>Small</strong>, <strong>Medium</strong> and <strong>Large</strong> — each printed to
          the painting&rsquo;s own true proportions, never cropped. A print&rsquo;s longest edge is always kept well
          below the original&rsquo;s own dimensions, so not every size is offered for every work: smaller originals
          may only support a Small print. Exact dimensions and pricing are shown on each print&rsquo;s own page.
        </p>
      </section>

      <section className="mt-16 border-t border-sand pt-10" aria-labelledby="why-a-print">
        <h2 id="why-a-print" className="font-serif text-3xl text-ink">Why a print</h2>
        <p className="mt-4 max-w-2xl text-ink/70">
          A print is a different way of collecting {site.artist.name}&rsquo;s work — not a lesser one. Where an
          original is a single, unrepeatable object, a numbered print lets an image reach more than one wall while
          staying genuinely limited: fixed in number, hand-signed, and never printed at the original&rsquo;s own scale.
        </p>
      </section>

      <section className="mt-16 border-t border-sand pt-10" aria-labelledby="edition-promise">
        <h2 id="edition-promise" className="font-serif text-3xl text-ink">The edition promise</h2>
        <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-ink/70">
          {PRINT_EDITION_PROMISE.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      </section>

      <section className="mt-16 border-t border-sand pt-10" aria-labelledby="original-vs-print">
        <h2 id="original-vs-print" className="font-serif text-3xl text-ink">Original or print</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="font-serif text-xl text-ink">An original painting</h3>
            <p className="mt-2 text-ink/70">
              A single, unrepeatable work — the artist&rsquo;s own hand on canvas, one collector, one piece.
              See the <Link href="/portfolio" className="underline">full portfolio</Link>.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl text-ink">A limited edition print</h3>
            <p className="mt-2 text-ink/70">
              A fixed, numbered edition on archival paper — a way to live with an image in a form and at a price
              point an original doesn&rsquo;t offer, without pretending to be one.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-16"><FAQList faqs={faqs} /></div>

      <CtaBand
        title="Have a question before you reserve?"
        body="Ask about a specific size, edition status or shipping — Ritushka's studio replies within two business days."
        primary={{ href: '/contact', label: 'Contact the studio' }}
        secondary={{ href: '/portfolio', label: 'View original paintings' }}
      />
    </Container>
  );
}
