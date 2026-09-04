import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import PairedMockupCards from '@/components/PairedMockupCards';
import { mockups } from '@/lib/data';
import { mockupPairs } from '@/data/pairs';
import { groupPairs } from '@/lib/groupPairs';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'In Situ — Art in Interiors', description: 'See Ritushka\'s paintings styled in living rooms, luxury and coastal homes, apartments and architectural interiors. Scale and placement references for designers and collectors.', path: '/mockups' });
export default function MockupsIndex() {
  const groups = groupPairs(mockups, mockupPairs, m => m.slug);
  let rendered = 0;
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'In Situ', path: '/mockups' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Art in interiors</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">Placement and scale references across living rooms, luxury homes, coastal homes, apartments and commercial spaces.</p>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(g => {
          if (Array.isArray(g)) {
            const priority: [boolean, boolean] = [rendered < 3, rendered + 1 < 3];
            rendered += 2;
            return <PairedMockupCards key={`${g[0].slug}+${g[1].slug}`} pair={g} priority={priority} />;
          }
          const priority = rendered < 3;
          rendered += 1;
          return (
            <Link key={g.slug} href={`/mockups/${g.slug}`} className="group">
              <PlaceholderImage src={g.image} alt={g.alt} ratio={g.aspect} priority={priority} />
              <h2 className="mt-3 font-serif text-lg text-ink group-hover:underline">{g.title}</h2>
              <p className="text-sm text-ink/65">{g.room}</p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
