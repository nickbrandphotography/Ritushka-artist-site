import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import PlaceholderImage from '@/components/PlaceholderImage';
import CtaBand from '@/components/CtaBand';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'About The Artist', description: 'Ritushka is a contemporary abstract landscape and seascape artist based in Lane Cove, Sydney, creating large-scale original paintings for collectors and designers worldwide.', path: '/about' });
export default function About() {
  return (
    <>
      <Container className="py-14">
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:items-center">
          <PlaceholderImage src="/about/portrait.jpg" alt={`${site.artist.name}, contemporary abstract artist, in her ${site.location.suburb} studio`} ratio="4 / 5" priority />
          <div>
            <h1 className="font-serif text-4xl text-ink md:text-5xl">About {site.artist.name}</h1>
            <div className="prose-art mt-6">
              <p>{site.artist.shortBio}</p>
              <p>Working from a studio in {site.location.suburb}, {site.location.city}, Ritushka builds large abstract landscapes and seascapes in translucent layers, drawing on Australian coastline, light and weather. The work is held in private and corporate collections and is sought by interior designers and architects for residential and commercial projects.</p>
              <p>Each painting is an original, signed and accompanied by a certificate of authenticity, and ships worldwide. Commissions are welcomed for bespoke size, palette and scale.</p>
            </div>
          </div>
        </div>
      </Container>
      <CtaBand title="Acquire or commission" body="Browse available originals or commission a work for your space." primary={{ href: '/available', label: 'Available works' }} secondary={{ href: '/commission', label: 'Commission' }} />
    </>
  );
}
