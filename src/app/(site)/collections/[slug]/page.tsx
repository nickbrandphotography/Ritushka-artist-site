import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import FAQList from '@/components/FAQList';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { collections, getCollection, artworksInCollection, postsForCollection } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, collectionPageSchema } from '@/lib/schema';

export function generateStaticParams() { return collections.map(c => ({ slug: c.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = getCollection(params.slug); if (!c) return {};
  return buildMetadata({ title: c.name, description: c.metaDescription, path: `/collections/${c.slug}` });
}
export default function CollectionPage({ params }: { params: { slug: string } }) {
  const c = getCollection(params.slug); if (!c) notFound();
  const items = artworksInCollection(c.slug);
  const posts = postsForCollection(c.slug);
  return (
    <Container className="py-14">
      <JsonLd data={graph(collectionPageSchema(c, items))} />
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }, { name: c.name, path: `/collections/${c.slug}` }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">{c.heading}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">{c.intro}</p>
      <div className="mt-10"><Gallery items={items} /></div>
      <div className="mt-16"><FAQList faqs={c.faqs} /></div>
      {posts.length > 0 && (
        <section className="mt-16 border-t border-sand pt-10">
          <h2 className="font-serif text-2xl text-ink">Related reading</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {posts.map(p => <li key={p.slug}><Link href={`/blog/${p.slug}`} className="underline">{p.title}</Link></li>)}
          </ul>
        </section>
      )}
      <CtaBand title="Commission a bespoke painting"
        body={`A bespoke ${c.name.toLowerCase()} work in your size, palette and scale — painted for your space and shipped worldwide.`}
        primary={{ href: '/commission', label: 'Start a commission' }} secondary={{ href: '/contact', label: 'Contact studio' }} />
    </Container>
  );
}
