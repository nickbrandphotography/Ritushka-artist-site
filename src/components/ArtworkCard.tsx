import Link from 'next/link';
import PlaceholderImage from './PlaceholderImage';
import { formatPrice } from '@/lib/data';
import type { Artwork } from '@/data/types';

export default function ArtworkCard({ a, priority }: { a: Artwork; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/artwork/${a.slug}`} className="block">
        <PlaceholderImage src={a.image} alt={a.alt} ratio={a.orientation === 'portrait' ? '3 / 4' : a.orientation === 'square' ? '1 / 1' : '4 / 3'} priority={priority} />
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-ink group-hover:underline">{a.title}</h3>
          <span className="shrink-0 text-sm text-ink/60">{a.status === 'sold' ? 'Sold' : formatPrice(a.price, a.currency)}</span>
        </div>
        <p className="text-sm text-ink/55">{a.heightCm} × {a.widthCm} cm · {a.year}</p>
      </Link>
    </article>
  );
}
