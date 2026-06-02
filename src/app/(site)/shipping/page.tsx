import Prose from '@/components/Prose';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Shipping Information', description: 'Worldwide insured shipping for original paintings by Ritushka. Crating, lead times, tracking and customs information for collectors and trade clients.', path: '/shipping' });
export default function Page() {
  return (
    <Prose title="Shipping information" intro="Insured worldwide delivery, professionally packed." crumbs={[{ name: 'Home', path: '/' }, { name: 'Shipping', path: '/shipping' }]}>
      <h2>Worldwide delivery</h2>
      <p>All works ship worldwide, fully insured to value, with tracking. Australian delivery is typically 3–7 business days; international 7–21 business days depending on destination and customs.</p>
      <h2>Packaging</h2>
      <p>Smaller works are boxed; large works are professionally crated. Stretched canvases may ship rolled for international transit and be re-stretched locally where appropriate.</p>
      <h2>Duties & taxes</h2>
      <p>International duties and import taxes are the responsibility of the recipient and vary by country.</p>
      <h2>Trade & corporate</h2>
      <p>White-glove delivery and installation can be arranged for trade and corporate clients. Contact the studio for a quote.</p>
    </Prose>
  );
}
