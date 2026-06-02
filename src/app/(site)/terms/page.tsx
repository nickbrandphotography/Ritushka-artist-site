import Prose from '@/components/Prose';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Terms', description: 'Terms of sale and website use for Ritushka Fine Art.', path: '/terms', noindex: true });
export default function Page() {
  return (
    <Prose title="Terms" crumbs={[{ name: 'Home', path: '/' }, { name: 'Terms', path: '/terms' }]}>
      <p>These placeholder terms govern purchases and use of the {site.brand.name} website. Replace with your reviewed terms before launch.</p>
      <h2>Originals & authenticity</h2>
      <p>All works are original and supplied with a certificate of authenticity. Colours may vary slightly from screen.</p>
      <h2>Payment & commissions</h2>
      <p>Commissions require a 50% deposit to begin, with the balance due before delivery.</p>
      <h2>Returns</h2>
      <p>Available originals may be returned within 14 days of delivery in original condition. Commissions are non-refundable once approved.</p>
      <h2>Copyright</h2>
      <p>Copyright in all works and images remains with the artist.</p>
    </Prose>
  );
}
