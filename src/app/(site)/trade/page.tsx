import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { programs } from '@/data/programs';
import { buildMetadata } from '@/lib/seo';
import { graph, breadcrumbSchema } from '@/lib/schema';

const list = Object.values(programs);
const description = 'Trade programs for interior designers, art consultants, buyer’s agents and corporate buyers sourcing original paintings by Ritushka — trade pricing, reserved previews and bespoke sizing.';

export const metadata = buildMetadata({ title: 'Trade Programs', description, path: '/trade' });

export default function TradeIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Trade', path: '/trade' }];
  return (
    <Container className="py-14">
      <JsonLd data={graph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Trade programs</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">
        Four programs built around how each trade actually sources art — trade pricing, reserved
        previews before public release, bespoke sizing and reliable lead times.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {list.map(p => (
          <Link
            key={p.slug}
            href={`/trade/${p.slug}`}
            className="rounded-md border border-sand p-6 hover:border-ink"
          >
            <h2 className="font-serif text-2xl text-ink">{p.title}</h2>
            <p className="mt-2 text-sm text-ink/65">{p.intro}</p>
            <p className="mt-4 text-xs uppercase tracking-widest text-ink/65">
              {p.benefits.length} benefits &middot; {p.faqs.length} FAQs
            </p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
