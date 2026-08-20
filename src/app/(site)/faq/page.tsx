import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import FAQList from '@/components/FAQList';
import { buildMetadata } from '@/lib/seo';
const faqs = [
  { q: 'Are the paintings original?', a: 'Yes — every work is an original, hand-painted, signed and accompanied by a certificate of authenticity. Prints are not sold.' },
  { q: 'Do you ship worldwide?', a: 'Yes. All works ship worldwide, fully insured, with tracking. Large works are professionally crated.' },
  { q: 'How are paintings packaged?', a: 'Smaller works ship rolled or boxed; large works are crated. All shipments are insured to full value.' },
  { q: 'Do you deliver locally?', a: 'Yes — free delivery within roughly 50km of the Lane Cove studio (Greater Sydney) on originals over A$1,000. A paid installation service is also available; see Shipping for details.' },
  { q: 'Can I get a custom frame?', a: 'Yes — every original, available or commissioned, can be custom framed in a range of materials and finishes, quoted individually. See Custom Framing.' },
  { q: 'Can I commission a custom size?', a: 'Yes. Commissions are tailored to your size, palette and space, typically over 4–8 weeks.' },
  { q: 'Do you offer trade pricing?', a: 'Yes — interior designers, art consultants, buyer\'s agents and corporate buyers can register for trade programs.' },
  { q: 'What is your return policy?', a: 'Originals may be returned within 14 days of delivery in original condition; see Terms for details.' },
  { q: 'Can I visit the studio?', a: 'Studio visits in Lane Cove, Sydney are available by appointment.' },
  { q: 'How do I care for the painting?', a: 'Keep out of direct sunlight and dust gently with a soft dry cloth. See the Installation Guide for more.' },
];
export const metadata = buildMetadata({ title: 'FAQ', description: 'Frequently asked questions about buying original abstract art from Ritushka — authenticity, worldwide shipping, commissions, trade pricing and returns.', path: '/faq' });
export default function FAQPage() {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Frequently asked questions</h1>
      <div className="mt-10 max-w-2xl"><FAQList faqs={faqs} heading="" /></div>
    </Container>
  );
}
