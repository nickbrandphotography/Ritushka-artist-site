import ArtworkCard from './ArtworkCard';
import PairedArtworkCards from './PairedArtworkCards';
import { artworkPairs } from '@/data/pairs';
import type { Artwork } from '@/data/types';

/**
 * Groups a list into singles and companion pairs (see src/data/pairs.ts).
 * A pair only forms when BOTH members are present in `list` — e.g. two
 * companion works with different status only pair up on Portfolio (which
 * lists everything), not on Available/Sold (split by status). Each group
 * keeps the position of whichever member appears first in `list`, but
 * renders in the pair's own declared left/top-first order.
 */
function groupPairs(list: Artwork[]): (Artwork | [Artwork, Artwork])[] {
  const bySlug = new Map(list.map(a => [a.slug, a]));
  const consumed = new Set<string>();
  const groups: (Artwork | [Artwork, Artwork])[] = [];
  for (const item of list) {
    if (consumed.has(item.slug)) continue;
    const pair = artworkPairs.find(([x, y]) => x === item.slug || y === item.slug);
    const first = pair && bySlug.get(pair[0]);
    const second = pair && bySlug.get(pair[1]);
    if (first && second) {
      groups.push([first, second]);
      consumed.add(first.slug);
      consumed.add(second.slug);
    } else {
      groups.push(item);
      consumed.add(item.slug);
    }
  }
  return groups;
}

/**
 * Grid of artwork cards. Paintings are drawn in proportion to one another —
 * see ArtworkCard. Pass `toScaleNote={false}` where the caption would be
 * redundant (for example under a heading that already explains the hang).
 */
export default function Gallery({
  items, max, toScaleNote = true,
}: { items: Artwork[]; max?: number; toScaleNote?: boolean }) {
  const list = max ? items.slice(0, max) : items;
  const groups = groupPairs(list);
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
