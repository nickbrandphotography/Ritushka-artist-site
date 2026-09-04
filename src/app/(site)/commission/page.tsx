import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnquiryForm from '@/components/EnquiryForm';
import FAQList from '@/components/FAQList';
import PageWatermark from '@/components/PageWatermark';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Commission a Painting', description: 'Commission an original abstract landscape or seascape by Ritushka, tailored to your size, palette and space. Worldwide delivery. Enquire to begin.', path: '/commission' });
const steps = [
  ['Brief', 'Share your space, size, palette and timeline.'],
  ['Proposal', 'Receive a concept, dimensions and quote with a 50% deposit to begin.'],
  ['Creation', 'Your painting is created over 4–8 weeks with progress images.'],
  ['Delivery', 'Final approval, balance, then insured worldwide delivery with certificate of authenticity.'],
];
const faqs = [
  { q: 'How much does a commission cost?', a: 'Commissions are priced by size and complexity, comparable to available works. You receive a fixed quote before any work begins.' },
  { q: 'How long does a commission take?', a: 'Typically 4–8 weeks of studio time plus shipping. Rush timelines can sometimes be accommodated.' },
  { q: 'Can I specify the colours?', a: 'Yes. Ritushka works to your palette and the light in your space, sharing progress images along the way.' },
  { q: 'Do you work with interior designers?', a: 'Extensively — see the trade programs for designer, consultant and corporate terms.' },
  { q: 'Can a commission be custom framed?', a: 'Yes — every commission can be framed to order, in a range of materials and finishes, quoted separately from the painting itself.' },
];
export default function Commission() {
  return (
    <PageWatermark src="/about/watermark-commission.jpg">
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Commission', path: '/commission' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Commission a painting</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">An original abstract landscape or seascape, created for your space — your size, your palette, your scale.</p>
      <p className="mt-2 max-w-2xl text-sm text-ink/65">
        Every commission can also be <Link href="/framing" className="underline hover:text-ink">custom framed</Link>{' '}
        to suit the room it&rsquo;s going into.
      </p>
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="rounded-md border border-sand bg-bone/90 p-5">
            <span className="font-serif text-3xl text-ink/65">{i + 1}</span>
            <h2 className="mt-1 font-serif text-xl text-ink">{t}</h2>
            <p className="mt-1 text-sm text-ink/65">{d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="rounded-lg border border-sand bg-bone/90 p-6">
          <h2 className="font-serif text-2xl text-ink">Start your commission</h2>
          <div className="mt-4"><EnquiryForm kind="commission" /></div>
        </div>
        <FAQList faqs={faqs} />
      </div>
    </Container>
    </PageWatermark>
  );
}
