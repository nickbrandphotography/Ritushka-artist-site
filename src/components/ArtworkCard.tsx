import Link from 'next/link';
import PlaceholderImage from './PlaceholderImage';
import { priceLabel, aspect, dimsShort, stageWidth, cardSizes } from '@/lib/data';
import type { Artwork } from '@/data/types';

/**
 * A gallery card. Every card occupies the same square "stage", but the
 * painting inside is sized to its true scale relative to the largest work in
 * the register — so the 180 cm works read as large and the 60 cm works read as
 * small, exactly as they would on a wall. Uniform stages keep the titles and
 * prices on a common baseline across each row.
 */
export default function ArtworkCard({ a, priority }: { a: Artwork; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/artwork/${a.slug}`} className="block">
        <div className="flex aspect-square w-full items-center justify-center">
          <div style={{ width: stageWidth(a) }}>
            <PlaceholderImage
              src={a.image}
              alt={a.alt}
              ratio={aspect(a)}
              sizes={cardSizes(a)}
              priority={priority}
              framed
            />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight text-ink group-hover:underline">{a.title}</h3>
          <span className="shrink-0 text-sm text-ink/65">{priceLabel(a)}</span>
        </div>
        <p className="text-sm text-ink/65">{dimsShort(a)}{a.year ? ` · ${a.year}` : ''}</p>
      </Link>
    </article>
  );
}
