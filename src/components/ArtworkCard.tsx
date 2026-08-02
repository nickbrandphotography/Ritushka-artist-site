import Link from 'next/link';
import PlaceholderImage from './PlaceholderImage';
import { priceLabel, aspect } from '@/lib/data';
import type { Artwork } from '@/data/types';

export default function ArtworkCard({ a, priority }: { a: Artwork; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/artwork/${a.slug}`} className="block">
        <PlaceholderImage src={a.image} alt={a.alt} ratio={aspect(a)} priority={priority} framed />
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-ink group-hover:underline">{a.title}</h3>
          <span className="shrink-0 text-sm text-ink/60">{priceLabel(a)}</span>
        </div>
        <p className="text-sm text-ink/55">Original painting{a.year ? ` · ${a.year}` : ''}</p>
      </Link>
    </article>
  );
}
