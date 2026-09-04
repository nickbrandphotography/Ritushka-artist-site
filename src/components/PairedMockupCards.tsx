import Link from 'next/link';
import PlaceholderImage from './PlaceholderImage';
import type { Mockup } from '@/data/types';

/**
 * Two companion mockups (see src/data/pairs.ts), shown on the same row with
 * a tightened gap-3 instead of the grid's normal gap-x-6 / gap-y-10. Unlike
 * PairedArtworkCards, mockup images already fill their box edge to edge
 * (PlaceholderImage's object-cover figure, no square "stage" centering), so
 * no alignment override is needed for the gap to actually read as tighter.
 */
export default function PairedMockupCards({
  pair, priority = [false, false],
}: { pair: [Mockup, Mockup]; priority?: [boolean, boolean] }) {
  return (
    <div className="col-span-1 flex flex-col gap-3 sm:col-span-2 sm:flex-row">
      {pair.map((m, i) => (
        <Link key={m.slug} href={`/mockups/${m.slug}`} className="group sm:w-1/2">
          <PlaceholderImage src={m.image} alt={m.alt} ratio={m.aspect} priority={priority[i]} />
          <h2 className="mt-3 font-serif text-lg text-ink group-hover:underline">{m.title}</h2>
          <p className="text-sm text-ink/65">{m.room}</p>
        </Link>
      ))}
    </div>
  );
}
