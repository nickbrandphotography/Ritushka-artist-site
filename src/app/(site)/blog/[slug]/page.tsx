import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { blog, getPost, getCollection } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, articleSchema, breadcrumbSchema } from '@/lib/schema';

export function generateStaticParams() { return blog.map(p => ({ slug: p.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug); if (!p) return {};
  return buildMetadata({ title: p.seoTitle, description: p.metaDescription, path: `/blog/${p.slug}`, image: p.image, type: 'article' });
}

function render(body: string): ReactNode[] {
  const lines = body.split('\n').filter(Boolean);
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      const items = list;
      out.push(<ul key={key}>{items.map((t, j) => <li key={j}>{t}</li>)}</ul>);
      list = [];
    }
  };
  lines.forEach((line, i) => {
    if (line.startsWith('- ')) { list.push(line.slice(2)); return; }
    flush('ul-' + i);
    if (line.startsWith('## ')) out.push(<h2 key={i}>{line.slice(3)}</h2>);
    else if (line.startsWith('### ')) out.push(<h3 key={i}>{line.slice(4)}</h3>);
    else out.push(<p key={i}>{line}</p>);
  });
  flush('ul-end');
  return out;
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();
  const coll = getCollection(p.relatedCollection);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Journal', path: '/blog' }, { name: p.title, path: `/blog/${p.slug}` }];
  return (
    <Container className="py-14">
      <JsonLd data={graph(articleSchema(p), breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <article className="mx-auto mt-6 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-ink/65">For {p.audience} · {new Date(p.publishedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}</p>
        <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">{p.title}</h1>
        <div className="prose-art mt-8">{render(p.body)}</div>
        {coll && <p className="mt-8">Explore <Link href={`/collections/${coll.slug}`} className="underline">{coll.name}</Link>.</p>}
      </article>
      <CtaBand title="Looking for a specific piece?"
        body="Browse available originals or commission a work in your size and palette."
        primary={{ href: '/available', label: 'Available works' }} secondary={{ href: '/commission', label: 'Commission' }} />
    </Container>
  );
}
