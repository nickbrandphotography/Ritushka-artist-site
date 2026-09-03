import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageWatermark from '@/components/PageWatermark';
import { collections, artworksInCollection } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Collections', description: 'Browse Ritushka\'s collections of abstract landscapes, seascapes and large-scale contemporary paintings. Original art for collectors, designers and architects.', path: '/collections' });
export default function CollectionsIndex() {
  return (
    <PageWatermark src="/about/watermark-collections.jpg">
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Collections</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">{collections.length} curated bodies of work, from abstract seascapes to large-scale statement paintings.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map(c => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="rounded-md border border-sand bg-bone/90 p-6 hover:border-ink">
            <h2 className="font-serif text-2xl text-ink">{c.name}</h2>
            <p className="mt-2 text-sm text-ink/65">{c.intro.slice(0, 120)}…</p>
            <p className="mt-3 text-xs uppercase tracking-widest text-ink/65">{artworksInCollection(c.slug).length} works</p>
          </Link>
        ))}
      </div>
    </Container>
    </PageWatermark>
  );
}
