import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import CtaBand from '@/components/CtaBand';
import { availableWorks } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Available Works', description: 'Original abstract paintings by Ritushka, Lane Cove Sydney. Browse the current collection and enquire for size, price and availability. Worldwide insured shipping.', path: '/available' });
export default function Available() {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Available Works', path: '/available' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Available works</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">Original paintings from the studio. Enquire about any work for dimensions, medium, price and current availability — each ships worldwide, insured, with a certificate of authenticity.</p>
      <div className="mt-10"><Gallery items={availableWorks()} /></div>
      <CtaBand title="Can't find the right size?" body="Commission a bespoke painting in your dimensions and palette." primary={{ href: '/commission', label: 'Commission' }} />
    </Container>
  );
}
