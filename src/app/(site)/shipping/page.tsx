import Link from 'next/link';
import Prose from '@/components/Prose';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({
  title: 'Shipping & Delivery',
  description: 'Worldwide insured shipping for original paintings by Ritushka, including free local delivery within Greater Sydney and an optional installation service.',
  path: '/shipping',
});
export default function Page() {
  return (
    <Prose title="Shipping & delivery" intro="Insured worldwide delivery, professionally packed." crumbs={[{ name: 'Home', path: '/' }, { name: 'Shipping', path: '/shipping' }]}>
      <h2>Worldwide delivery</h2>
      <p>All works ship worldwide, fully insured to value, with tracking. Australian delivery is typically 3–7 business days; international 7–21 business days depending on destination and customs.</p>
      <h2>Local delivery, {site.location.city}</h2>
      <p>
        Free local delivery is included on original paintings over A$1,000, within roughly 50km of the studio
        in {site.location.suburb} — covering Greater {site.location.city}. Smaller pieces outside that
        radius are shipped as above.
      </p>
      <h2>Installation</h2>
      <p>
        A hands-on installation service — the piece hung, levelled and lit — is available at an additional
        cost: for smaller works, for addresses outside the local delivery area, and for international
        deliveries. Ask when you enquire, or see the <Link href="/installation-guide">installation guide</Link>{' '}
        if you&rsquo;d rather hang it yourself.
      </p>
      <h2>Packaging</h2>
      <p>Smaller works are boxed; large works are professionally crated. Stretched canvases may ship rolled for international transit and be re-stretched locally where appropriate.</p>
      <h2>Duties & taxes</h2>
      <p>International duties and import taxes are the responsibility of the recipient and vary by country.</p>
      <h2>Trade & corporate</h2>
      <p>White-glove delivery and installation can be arranged for trade and corporate clients — see the <Link href="/trade">trade programs</Link>.</p>
    </Prose>
  );
}
