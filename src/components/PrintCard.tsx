import Link from 'next/link';
import PlaceholderImage from './PlaceholderImage';
import { aspect, formatPrice, stageWidth, cardSizes } from '@/lib/data';
import type { PrintEdition } from '@/data/types';

/**
 * A print edition card for the /limited-edition-prints grid. Deliberately
 * not <ArtworkCard>/<Gallery> — see docs/prints-decisions.md and house rule
 * 2.8: the artwork still renders at its true proportional scale (reusing
 * stageWidth/cardSizes, the same helpers Gallery uses), but the caption shows
 * print-specific facts (size range, edition, "from" price) that ArtworkCard
 * has no concept of. Per 2.8's own carve-out: print sizes are chosen by the
 * collector, so the card leads with the artwork, not a single size claim.
 */
export default function PrintCard({ edition, priority }: { edition: PrintEdition; priority?: boolean }) {
  const { artwork: a, sizes, fromPrice } = edition;
  const smallest = sizes[0];
  const largest = sizes[sizes.length - 1];
  const sizeRange = sizes.length > 1
    ? `${smallest.heightCm} × ${smallest.widthCm} cm – ${largest.heightCm} × ${largest.widthCm} cm`
    : `${smallest.heightCm} × ${smallest.widthCm} cm`;

  return (
    <article className="group">
      <Link href={`/limited-edition-prints/${a.slug}`} className="block">
        <div className="flex aspect-square w-full items-center justify-center">
          <div style={{ width: stageWidth(a) }}>
            <PlaceholderImage src={a.image} alt={a.alt} ratio={aspect(a)} sizes={cardSizes(a)} priority={priority} framed bright />
          </div>
        </div>
        <div className="mx-auto mt-3" style={{ width: stageWidth(a) }}>
          <p className="text-xs uppercase tracking-widest text-ink/65">Limited edition print</p>
          <h3 className="mt-1 font-serif text-lg leading-tight text-ink">{a.title}</h3>
          <p className="mt-1 text-sm text-ink/65">{sizeRange}</p>
          <p className="text-sm text-ink/65">
            {sizes.length > 1 ? `${sizes.length} sizes · ` : ''}Editions of {sizes.map(s => s.editionSize).join('/')}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">
            {edition.soldOut ? 'Sold out' : fromPrice != null ? `From ${formatPrice(fromPrice, sizes[0].currency)}` : ''}
          </p>
        </div>
      </Link>
    </article>
  );
}
