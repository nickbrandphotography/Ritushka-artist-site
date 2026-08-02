import Link from 'next/link';
import Container from './Container';
import PlaceholderImage from './PlaceholderImage';
import { site } from '@/site.config';
import { artworks, getArtwork, aspect } from '@/lib/data';

/** Slug of the painting featured in the homepage hero. Change this to swap it. */
const HERO_SLUG = 'into-the-ever-blue';

export default function Hero() {
  const feature = getArtwork(HERO_SLUG) ?? artworks[0];
  return (
    <section className="border-b border-sand">
      <Container className="grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/55">{site.location.suburb}, {site.location.city} · {site.location.country}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-6xl">{site.artist.name}</h1>
          <p className="mt-4 max-w-md text-lg text-ink/75">{site.artist.tagline}. Large-scale abstract landscapes and seascapes for collectors, designers and architects worldwide.</p>
          <div className="mt-7 flex gap-3">
            <Link href="/available" className="rounded-full bg-ink px-6 py-3 text-sm text-bone">View available works</Link>
            <Link href="/commission" className="rounded-full border border-ink px-6 py-3 text-sm">Commission a painting</Link>
          </div>
        </div>
        <Link href={`/artwork/${feature.slug}`} aria-label={feature.title}>
          <PlaceholderImage src={feature.image} alt={feature.alt} ratio={aspect(feature)} priority framed />
        </Link>
      </Container>
    </section>
  );
}
