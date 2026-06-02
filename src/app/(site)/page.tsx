import Link from 'next/link';
import Container from '@/components/Container';
import Hero from '@/components/Hero';
import Gallery from '@/components/Gallery';
import CtaBand from '@/components/CtaBand';
import EmailCapture from '@/components/EmailCapture';
import { collections, availableWorks } from '@/lib/data';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Container className="py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-3xl text-ink">Available works</h2>
          <Link href="/available" className="text-sm underline">View all</Link>
        </div>
        <div className="mt-8"><Gallery items={availableWorks()} max={6} /></div>
      </Container>

      <Container className="py-8">
        <h2 className="font-serif text-3xl text-ink">Collections</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {collections.map(c => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="rounded-md border border-sand p-5 hover:border-ink">
              <h3 className="font-serif text-lg text-ink">{c.name}</h3>
              <p className="mt-1 text-xs text-ink/55">{c.keyword}</p>
            </Link>
          ))}
        </div>
      </Container>

      <CtaBand title="Sourcing for a client or project?"
        body="Interior designers, architects and consultants receive trade pricing, reserved previews and white-glove delivery."
        primary={{ href: '/trade/interior-designers', label: 'Trade programs' }}
        secondary={{ href: '/commission', label: 'Commission' }} />

      <Container className="pb-20">
        <div className="rounded-lg bg-ink px-8 py-12 text-bone">
          <h2 className="font-serif text-3xl">Join the collector list</h2>
          <p className="mt-2 max-w-lg text-bone/70">Be first to see new works and private viewings before they reach the public gallery.</p>
          <div className="mt-5 max-w-md"><EmailCapture dark /></div>
        </div>
      </Container>
    </>
  );
}
