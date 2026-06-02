import Link from 'next/link';
import JsonLd from './JsonLd';
import { graph, breadcrumbSchema } from '@/lib/schema';
export default function Breadcrumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-widest text-ink/60">
      <JsonLd data={graph(breadcrumbSchema(crumbs))} />
      <ol className="flex flex-wrap gap-2">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {i < crumbs.length - 1 ? <Link href={c.path} className="hover:text-ink">{c.name}</Link> : <span className="text-ink">{c.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
