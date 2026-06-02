import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import { artworks } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Portfolio', description: 'The complete portfolio of Ritushka — abstract landscapes, seascapes and large-scale contemporary paintings. Original artworks, available and archived.', path: '/portfolio' });
export default function Portfolio() {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Portfolio', path: '/portfolio' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Portfolio</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">The complete body of work — {artworks.length} paintings across ten collections.</p>
      <div className="mt-10"><Gallery items={artworks} /></div>
    </Container>
  );
}
