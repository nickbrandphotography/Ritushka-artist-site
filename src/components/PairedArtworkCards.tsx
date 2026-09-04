import ArtworkCard from './ArtworkCard';
import type { Artwork } from '@/data/types';

/**
 * Two companion artworks (see src/data/pairs.ts), shown on the same row
 * with a tightened gap-3 instead of the gallery grid's normal gap-x-6 /
 * gap-y-10 — close enough to read as a set. Spans 2 grid columns so the
 * pair fills a full row on the 2-column tablet breakpoint; on mobile
 * (1 column) they stack vertically, still with the tighter gap.
 */
export default function PairedArtworkCards({
  pair, priority = [false, false],
}: { pair: [Artwork, Artwork]; priority?: [boolean, boolean] }) {
  return (
    <div className="col-span-1 flex flex-col gap-3 sm:col-span-2 sm:flex-row">
      <div className="sm:w-1/2"><ArtworkCard a={pair[0]} priority={priority[0]} /></div>
      <div className="sm:w-1/2"><ArtworkCard a={pair[1]} priority={priority[1]} /></div>
    </div>
  );
}
