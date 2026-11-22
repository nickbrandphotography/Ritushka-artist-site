import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import WallVisualiser, { type VisItem } from '@/components/WallVisualiser';
import { availableWorks, formatPrice, priceLabel } from '@/lib/data';
import { allPrintEditions } from '@/lib/prints';
import { buildMetadata } from '@/lib/seo';

const description =
  'See Ritushka’s original paintings and limited edition prints on your own wall at their real size. Photograph your room, swipe through the works and preview framing.';
export const metadata = buildMetadata({ title: 'View Art on Your Wall', description, path: '/view-on-your-wall' });

const r1 = (n: number) => Math.round(n * 10) / 10;

export default function ViewOnYourWall() {
  // Only works with recorded dimensions can be shown at true scale.
  const originals: VisItem[] = availableWorks()
    .filter((a) => a.widthCm != null && a.heightCm != null)
    .map((a) => ({
      slug: a.slug, title: a.title, image: a.image, href: `/artwork/${a.slug}`,
      framed: !!a.framed, depthCm: a.depthCm ?? 4,
      sizes: [{ label: 'Original', w: a.widthCm!, h: a.heightCm!, price: priceLabel(a) === 'Enquire' ? 'Price on application' : priceLabel(a) }],
    }));

  const prints: VisItem[] = allPrintEditions().map((e) => ({
    slug: e.artwork.slug, title: e.artwork.title, image: e.artwork.image, href: `/limited-edition-prints/${e.artwork.slug}`,
    framed: false, depthCm: 0,
    sizes: e.sizes.map((s) => ({
      label: s.label, w: r1(s.widthCm), h: r1(s.heightCm), price: formatPrice(s.price, s.currency),
      note: s.remaining > 0 ? `${s.remaining} of ${s.editionSize} remaining.` : 'This size is sold out.',
      soldOut: s.remaining <= 0,
    })),
  }));

  return (
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'View on your wall', path: '/view-on-your-wall' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">View on your wall</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">
        See a painting in your own room at its real size before you enquire. Swipe through the available originals
        and limited edition prints, and preview a print in a frame.
      </p>
      <div className="mt-10">
        <WallVisualiser originals={originals} prints={prints} />
      </div>
    </Container>
  );
}
