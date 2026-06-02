import Prose from '@/components/Prose';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Privacy Policy', description: 'Privacy policy for the Ritushka Fine Art website.', path: '/privacy', noindex: true });
export default function Page() {
  return (
    <Prose title="Privacy policy" crumbs={[{ name: 'Home', path: '/' }, { name: 'Privacy', path: '/privacy' }]}>
      <p>This placeholder privacy policy explains how {site.brand.name} collects and uses personal information submitted through enquiry and subscription forms. Replace with your reviewed policy before launch.</p>
      <h2>Information we collect</h2>
      <p>Contact details and message content you submit, plus standard analytics data.</p>
      <h2>How we use it</h2>
      <p>To respond to enquiries, fulfil orders, and — with consent — send collector updates. We do not sell personal data.</p>
      <h2>Contact</h2>
      <p>Email {site.contact.email} for any privacy request.</p>
    </Prose>
  );
}
