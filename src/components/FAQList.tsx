import JsonLd from './JsonLd';
import { graph, faqSchema } from '@/lib/schema';
import type { FAQ } from '@/data/types';
export default function FAQList({ faqs, heading = 'Frequently asked questions' }: { faqs: FAQ[]; heading?: string }) {
  return (
    <section aria-labelledby="faq-h" className="border-t border-sand pt-10">
      <JsonLd data={graph(faqSchema(faqs))} />
      <h2 id="faq-h" className="font-serif text-2xl text-ink">{heading}</h2>
      <dl className="mt-6 divide-y divide-sand">
        {faqs.map((f, i) => (
          <div key={i} className="py-4">
            <dt className="font-medium text-ink">{f.q}</dt>
            <dd className="mt-1.5 text-ink/70">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
