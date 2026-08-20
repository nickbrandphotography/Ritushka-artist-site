import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import JsonLd from '@/components/JsonLd';
import { artworks, collections } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, worksListPageSchema } from '@/lib/schema';
const description = 'The complete portfolio of Ritushka — abstract landscapes, seascapes and large-scale contemporary paintings. Original artworks, available and archived.';
export const metadata = buildMetadata({ title: 'Portfolio', description, path: '/portfolio' });
export default function Portfolio() {
  return (
    <Container className="py-14">
      <JsonLd data={graph(worksListPageSchema('/portfolio', 'Portfolio — Ritushka', description, artworks))} />
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Portfolio', path: '/portfolio' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Portfolio</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">
        The complete body of work — {artworks.length} paintings across {collections.length} collections.
        Browse by <Link href="/available" className="underline hover:text-ink">what&rsquo;s currently available</Link>,{' '}
        the <Link href="/sold" className="underline hover:text-ink">sold archive</Link>, or{' '}
        <Link href="/collections" className="underline hover:text-ink">collection</Link>.
      </p>
      <div className="mt-10"><Gallery items={artworks} /></div>
    </Container>
  );
}
