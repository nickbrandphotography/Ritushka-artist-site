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
 *
 * `align` moves the painting (and its caption) to one edge of the square
 * stage instead of centering it — used by PairedArtworkCards so a portrait
 * painting, which is already inset well inside its square, has its actual
 * picture edge sitting right against the shared gap rather than floating in
 * the middle of its stage with the gap swallowed by that centering margin.
 */
export default function ArtworkCard({
  a, priority, align = 'center',
}: { a: Artwork; priority?: boolean; align?: 'start' | 'center' | 'end' }) {
  const justify = align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center';
  const captionMargin = align === 'start' ? 'mr-auto' : align === 'end' ? 'ml-auto' : 'mx-auto';
  return (
    <article className="group">
      <Link href={`/artwork/${a.slug}`} className="block">
        <div className={`flex aspect-square w-full items-center ${justify}`}>
          <div style={{ width: stageWidth(a) }}>
            <PlaceholderImage
              src={a.image}
              alt={a.alt}
              ratio={aspect(a)}
              sizes={cardSizes(a)}
              priority={priority}
              framed
              bright
            />
          </div>
        </div>
        {/* Same width as the painting above it (not the full card), so the
            caption sits within the picture's own edges instead of spreading
            out to the stage's full square — a small painting reads with a
            small caption underneath it. */}
        <div className={`mt-3 ${captionMargin}`} style={{ width: stageWidth(a) }}>
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
