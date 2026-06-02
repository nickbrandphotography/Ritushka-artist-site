import ArtworkCard from './ArtworkCard';
import type { Artwork } from '@/data/types';
export default function Gallery({ items, max }: { items: Artwork[]; max?: number }) {
  const list = max ? items.slice(0, max) : items;
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((a, i) => <ArtworkCard key={a.slug} a={a} priority={i < 3} />)}
    </div>
  );
}
