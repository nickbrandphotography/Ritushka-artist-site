import ArtworkCard from './ArtworkCard';
import type { Artwork } from '@/data/types';

/**
 * Grid of artwork cards. Paintings are drawn in proportion to one another —
 * see ArtworkCard. Pass `toScaleNote={false}` where the caption would be
 * redundant (for example under a heading that already explains the hang).
 */
export default function Gallery({
  items, max, toScaleNote = true,
}: { items: Artwork[]; max?: number; toScaleNote?: boolean }) {
  const list = max ? items.slice(0, max) : items;
  return (
    <div>
      {toScaleNote && list.length > 1 && (
        <p className="mb-5 text-xs uppercase tracking-[0.14em] text-ink/45">
          Shown in proportion to one another
        </p>
      )}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a, i) => <ArtworkCard key={a.slug} a={a} priority={i < 3} />)}
      </div>
    </div>
  );
}
