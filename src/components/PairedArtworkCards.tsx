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
      {/* align="end"/"start" pulls each painting to the shared inner edge —
          without it, a portrait painting centers inside its own square
          stage and the gap-3 above is swallowed by that centering margin,
          so the pair reads no closer together than two unrelated cards. */}
      <div className="sm:w-1/2"><ArtworkCard a={pair[0]} priority={priority[0]} align="end" /></div>
      <div className="sm:w-1/2"><ArtworkCard a={pair[1]} priority={priority[1]} align="start" /></div>
    </div>
  );
}
