import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import { mockups } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'In Situ — Art in Interiors', description: 'See Ritushka\'s paintings styled in living rooms, luxury and coastal homes, apartments and architectural interiors. Scale and placement references for designers and collectors.', path: '/mockups' });
export default function MockupsIndex() {
  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'In Situ', path: '/mockups' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Art in interiors</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">Placement and scale references across living rooms, luxury homes, coastal homes, apartments and commercial spaces.</p>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {mockups.map((m, i) => (
          <Link key={m.slug} href={`/mockups/${m.slug}`} className="group">
            <PlaceholderImage src={m.image} alt={m.alt} ratio={m.aspect} priority={i < 3} />
            <h2 className="mt-3 font-serif text-lg text-ink group-hover:underline">{m.title}</h2>
            <p className="text-sm text-ink/65">{m.room}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
