import Container from './Container';
import Breadcrumbs from './Breadcrumbs';
import EnquiryForm from './EnquiryForm';
import FAQList from './FAQList';
import JsonLd from './JsonLd';
import type { Program } from '@/data/programs';
import { graph, breadcrumbSchema } from '@/lib/schema';
export default function ProgramPage({ p }: { p: Program }) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Trade', path: '/trade' }, { name: p.title, path: `/trade/${p.slug}` }];
  return (
    <Container className="py-14">
      <JsonLd data={graph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">{p.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">{p.intro}</p>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-ink">What you receive</h2>
          <ul className="mt-4 space-y-2">
            {p.benefits.map(b => <li key={b} className="flex gap-3 text-ink/80"><span aria-hidden className="text-accent">—</span>{b}</li>)}
          </ul>
          <div className="mt-10"><FAQList faqs={p.faqs} /></div>
        </div>
        <div className="rounded-lg border border-sand p-6 h-fit">
          <h2 className="font-serif text-2xl text-ink">Apply to the {p.audience.toLowerCase()} program</h2>
          <div className="mt-4"><EnquiryForm kind="trade" subject={p.title} /></div>
        </div>
      </div>
    </Container>
  );
}
