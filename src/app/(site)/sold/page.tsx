import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import CtaBand from '@/components/CtaBand';
import { soldWorks } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Sold Works', description: 'An archive of sold paintings by Ritushka. Browse past works for reference and commission a related piece in your size and palette.', path: '/sold' });
export default function Sold() {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Sold Works', path: '/sold' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Sold works</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">A reference archive. Love something that's sold? A related commission can be created for you.</p>
      <div className="mt-10"><Gallery items={soldWorks()} /></div>
      <CtaBand title="Commission a related work" body="Bespoke size, palette and scale in the spirit of a sold piece." primary={{ href: '/commission', label: 'Start a commission' }} />
    </Container>
  );
}
