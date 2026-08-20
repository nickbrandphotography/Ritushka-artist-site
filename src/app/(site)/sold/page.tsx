import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import { soldWorks } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, worksListPageSchema } from '@/lib/schema';
const description = 'An archive of sold paintings by Ritushka. Browse past works for reference and commission a related piece in your size and palette.';
export const metadata = buildMetadata({ title: 'Sold Works', description, path: '/sold' });
export default function Sold() {
  const works = soldWorks();
  return (
    <Container className="py-14">
      <JsonLd data={graph(worksListPageSchema('/sold', 'Sold Works — Ritushka', description, works))} />
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Sold Works', path: '/sold' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Sold works</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">A reference archive. Love something that&rsquo;s sold? A related commission can be created for you.</p>
      <div className="mt-10"><Gallery items={works} /></div>
      <p className="mt-10 text-sm text-ink/65">
        See what&rsquo;s still available in the <Link href="/available" className="underline hover:text-ink">current collection</Link>.
      </p>
      <CtaBand title="Commission a related work" body="Bespoke size, palette and scale in the spirit of a sold piece." primary={{ href: '/commission', label: 'Start a commission' }} />
    </Container>
  );
}
