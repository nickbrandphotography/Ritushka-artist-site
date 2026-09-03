import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageWatermark from '@/components/PageWatermark';
import { blog } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Art Journal', description: 'Guides on choosing, commissioning, placing and investing in original abstract art — for collectors, interior designers, architects and luxury homeowners.', path: '/blog' });
export default function BlogIndex() {
  return (
    // Positioned so the visible window falls around eyes-through-chin rather
    // than top-aligned (cuts the mouth/chin) or centred (cuts the beard).
    <PageWatermark src="/about/watermark-journal.jpg" position="center 38%">
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Journal', path: '/blog' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Art Journal</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">Practical, authoritative guides for collectors, designers, architects and homeowners.</p>
      <ul className="mt-10 divide-y divide-sand">
        {blog.map(p => (
          <li key={p.slug} className="py-6">
            <Link href={`/blog/${p.slug}`} className="group block">
              <h2 className="font-serif text-2xl text-ink group-hover:underline">{p.title}</h2>
              <p className="mt-1 text-ink/65">{p.excerpt}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-ink/65">For {p.audience} · {p.readMinutes} min read</p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
    </PageWatermark>
  );
}
