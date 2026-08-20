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
        {/* Same width as the painting above it (not the full card), so the
            caption sits within the picture's own edges instead of spreading
            out to the stage's full square — a small painting reads with a
            small caption underneath it. */}
        <div className="mx-auto mt-3" style={{ width: stageWidth(a) }}>
          <h3 className="font-serif text-lg leading-tight text-ink">{a.title}</h3>
          <p className="text-sm text-ink/65">{dimsShort(a)}{a.year ? ` · ${a.year}` : ''}</p>
          <p className="text-sm text-ink/65">
            {a.medium}{a.medium && ' · '}{priceLabel(a)}
          </p>
        </div>
      </Link>
    </article>
  );
}
