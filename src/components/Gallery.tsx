import ArtworkCard from './ArtworkCard';
import PairedArtworkCards from './PairedArtworkCards';
import { artworkPairs } from '@/data/pairs';
import { groupPairs } from '@/lib/groupPairs';
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
  const groups = groupPairs(list, artworkPairs, a => a.slug);
  let rendered = 0;
  return (
    <div>
      {toScaleNote && list.length > 1 && (
        <p className="mb-5 text-xs uppercase tracking-[0.14em] text-ink/65">
          Shown in proportion to one another
        </p>
      )}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(g => {
          if (Array.isArray(g)) {
            const priority: [boolean, boolean] = [rendered < 3, rendered + 1 < 3];
            rendered += 2;
            return <PairedArtworkCards key={`${g[0].slug}+${g[1].slug}`} pair={g} priority={priority} />;
          }
          const priority = rendered < 3;
          rendered += 1;
          return <ArtworkCard key={g.slug} a={g} priority={priority} />;
        })}
      </div>
    </div>
  );
}
