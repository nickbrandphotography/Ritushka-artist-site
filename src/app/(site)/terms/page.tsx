import Prose from '@/components/Prose';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Terms', description: `Terms of sale and website use for ${site.brand.name}.`, path: '/terms', noindex: true });
const updated = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
export default function Page() {
  return (
    <Prose title="Terms" intro={`Last updated ${updated}.`} crumbs={[{ name: 'Home', path: '/' }, { name: 'Terms', path: '/terms' }]}>
      <p>These terms govern the purchase of artwork from, and use of, {site.url.replace('https://', '')}. By submitting
        an enquiry, commission or order through this site you agree to them.</p>

      <h2>Originals & authenticity</h2>
      <p>Every work sold through this site is an original, hand-painted piece — not a print or reproduction — supplied
        with a certificate of authenticity. Colours may vary slightly between screen and the physical work; where
        exact colour matching matters, request additional photographs before purchase.</p>

      <h2>Pricing & payment</h2>
      <p>Prices listed on artwork pages are in Australian dollars and exclude insured shipping, which is quoted
        separately for your destination. Commissions require a 50% deposit to begin work, with the balance due before
        delivery. Trade and corporate clients may be offered separate invoicing terms — see the relevant
        {' '}<a href="/trade/interior-designers">trade program</a> page.</p>

      <h2>Shipping & risk</h2>
      <p>Works ship worldwide, fully insured to value, as described on the <a href="/shipping">Shipping</a> page. Risk
        in the work passes to you on delivery; international duties and import taxes are the recipient&rsquo;s
        responsibility and vary by country.</p>

      <h2>Returns</h2>
      <p>Available originals purchased directly may be returned within 14 days of delivery, in original condition and
        packaging, for a refund of the purchase price excluding outbound and return shipping. Commissions are
        non-refundable once the final design has been approved and studio work has begun, given their bespoke
        nature — see the <a href="/commission">commission process</a> for how approval is confirmed along the way.</p>

      <h2>Copyright</h2>
      <p>Copyright in every artwork and in the photography on this site remains with the artist. Purchasing a
        physical work does not transfer reproduction rights; images may not be reproduced, printed or used
        commercially without written permission.</p>

      <h2>Contact</h2>
      <p>Questions about an order or these terms: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.</p>
    </Prose>
  );
}
