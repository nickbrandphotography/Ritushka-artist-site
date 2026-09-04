import Link from 'next/link';
import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import Gallery from '@/components/Gallery';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import AvailableBanner from '@/components/AvailableBanner';
import { availableWorks } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { graph, worksListPageSchema } from '@/lib/schema';
const description = 'Original abstract paintings by Ritushka, Lane Cove Sydney. Browse the current collection and enquire for size, price and availability. Worldwide insured shipping.';
export const metadata = buildMetadata({ title: 'Available Works', description, path: '/available' });
export default function Available() {
  const works = availableWorks();
  return (
    <>
    <AvailableBanner />
    <Container className="py-14">
      <JsonLd data={graph(worksListPageSchema('/available', 'Available Works — Ritushka', description, works))} />
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Available Works', path: '/available' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Available works</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">Original paintings from the studio. Enquire about any work for dimensions, medium, price and current availability — each ships worldwide, insured, with a certificate of authenticity.</p>
      <div className="mt-10"><Gallery items={works} /></div>
      <p className="mt-10 text-sm text-ink/65">
        Looking for a piece that&rsquo;s already found a home? Browse the{' '}
        <Link href="/sold" className="underline hover:text-ink">sold works archive</Link> and commission a related painting.
      </p>
      <CtaBand title="Can't find the right size?" body="Commission a bespoke painting in your dimensions and palette." primary={{ href: '/commission', label: 'Commission' }} />
    </Container>
    </>
  );
}
