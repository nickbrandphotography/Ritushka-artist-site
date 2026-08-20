import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnquiryForm from '@/components/EnquiryForm';
import FAQList from '@/components/FAQList';
import JsonLd from '@/components/JsonLd';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
import { graph, breadcrumbSchema, serviceSchema } from '@/lib/schema';

const description = 'Custom framing for any original painting or commission by Ritushka — a wide range of materials and finishes, priced individually and quoted before you commit. Placement and installation guidance included.';

export const metadata = buildMetadata({ title: 'Custom Framing', description, path: '/framing' });

const faqs = [
  {
    q: 'Do all artworks come with the same frame?',
    a: 'The floating oak frame shown on each artwork page is the studio’s standard choice, not the only one. Every original — available now or commissioned — can be custom framed to a different material or finish on request.',
  },
  {
    q: 'How is custom framing priced?',
    a: 'Individually, based on the material, the size of the artwork and the complexity of the frame — there’s no fixed price list, because bespoke framing genuinely varies that much. Enquire with the piece (or its dimensions, for a commission) and you’ll receive a specific quote before anything is ordered.',
  },
  {
    q: 'Can I choose a different frame to the one shown on the site?',
    a: 'Yes. The photographed frame is a starting reference, not a limit — ask about alternative materials and finishes when you enquire.',
  },
  {
    q: 'Does custom framing apply to commissions too?',
    a: 'Yes — framing is available on every original, whether it’s an available work or a bespoke commission built to your size and palette.',
  },
  {
    q: 'Who does the framing?',
    a: 'Work is framed through specialist framing partners in Sydney, chosen for the material and finish you’ve asked for.',
  },
];

export default function FramingPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Custom Framing', path: '/framing' }];
  return (
    <Container className="py-14">
      <JsonLd
        data={graph(
          breadcrumbSchema(crumbs),
          serviceSchema('/framing', 'Custom Framing', description, site.location.serviceArea),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Custom framing</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">
        The frame shown on an artwork&rsquo;s page is a starting point, not a limit. Every original —
        available now or built as a commission — can be custom framed to suit the space it&rsquo;s going into.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-2xl text-ink">The options</h2>
            <p className="mt-3 text-ink/75">
              Work is framed to order through specialist framing partners in Sydney, offering a wide range of
              materials and finishes beyond the studio&rsquo;s standard floating oak — different timbers, tones
              and profiles. Bring a reference from the room it&rsquo;s going into, or ask for a recommendation
              once you enquire.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">The pricing</h2>
            <p className="mt-3 text-ink/75">
              Framing is quoted individually — it&rsquo;s priced on the material, the size of the artwork and
              the complexity of the frame, so a fixed price list wouldn&rsquo;t be an honest one. Enquire about
              a specific piece (or share dimensions, for a commission) and you&rsquo;ll receive a clear quote
              before anything is ordered.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">Where to put it</h2>
            <p className="mt-3 text-ink/75">
              Scale and wall width matter more than most people expect before a piece arrives — a work sized
              well in a gallery can read very differently against a specific wall at home. The full placement
              reasoning is in the{' '}
              <Link href="/blog/the-complete-art-placement-guide" className="underline hover:text-ink">
                Art Placement Guide
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">How to put it up</h2>
            <p className="mt-3 text-ink/75">
              Hanging height, fixings and lighting angle are covered in full in the{' '}
              <Link href="/installation-guide" className="underline hover:text-ink">
                Installation Guide
              </Link>{' '}
              — and delivery and hands-on installation can be arranged directly; see{' '}
              <Link href="/shipping" className="underline hover:text-ink">
                Shipping
              </Link>{' '}
              for details.
            </p>
          </section>

          <section className="border-t border-sand pt-8">
            <p className="text-ink/75">
              Looking for the right piece first? Browse{' '}
              <Link href="/available" className="underline hover:text-ink">
                available works
              </Link>{' '}
              or{' '}
              <Link href="/commission" className="underline hover:text-ink">
                start a commission
              </Link>{' '}
              — framing is arranged alongside either.
            </p>
          </section>
        </div>

        <div className="rounded-lg border border-sand p-6 h-fit">
          <h2 className="font-serif text-2xl text-ink">Get a framing quote</h2>
          <p className="mt-2 text-sm text-ink/65">
            Tell us which artwork (or its dimensions, for a commission) and any material preference —
            you&rsquo;ll get a specific quote back within two business days.
          </p>
          <div className="mt-4"><EnquiryForm kind="framing" /></div>
        </div>
      </div>

      <div className="mt-16"><FAQList faqs={faqs} /></div>
    </Container>
  );
}
