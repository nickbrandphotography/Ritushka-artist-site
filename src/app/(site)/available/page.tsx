import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import CtaBand from '@/components/CtaBand';
import { availableWorks } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Available Works', description: 'Original abstract paintings available now from Ritushka, Sydney. Worldwide insured shipping and certificate of authenticity. Reserve or enquire today.', path: '/available' });
export default function Available() {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Available Works', path: '/available' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Available works</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">Original paintings ready to acquire, shipped worldwide with insurance and a certificate of authenticity.</p>
      <div className="mt-10"><Gallery items={availableWorks()} /></div>
      <CtaBand title="Can't find the right size?" body="Commission a bespoke painting in your dimensions and palette." primary={{ href: '/commission', label: 'Commission' }} />
    </Container>
  );
}
