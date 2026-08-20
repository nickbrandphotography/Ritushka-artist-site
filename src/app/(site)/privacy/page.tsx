import Prose from '@/components/Prose';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `How ${site.brand.name} collects, stores and uses personal information submitted through enquiry, commission, trade and newsletter forms.`,
  path: '/privacy',
  noindex: true,
});
const updated = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
export default function Page() {
  return (
    <Prose title="Privacy policy" intro={`Last updated ${updated}.`} crumbs={[{ name: 'Home', path: '/' }, { name: 'Privacy', path: '/privacy' }]}>
      <p>
        This policy explains what personal information {site.brand.name} collects through {site.url.replace('https://', '')},
        why, and what happens to it. It applies to the enquiry, commission, trade and newsletter forms on this site.
      </p>

      <h2>Information we collect</h2>
      <p>Only what you submit directly through a form: your name, email address, and — depending on the form — phone
        number, company or studio name, the message you write, and for commission enquiries, a desired size and
        palette. Newsletter sign-up collects only an email address. This site does not currently use analytics,
        advertising trackers or cookies of any kind — nothing is collected about your visit beyond what you
        voluntarily submit.</p>

      <h2>How we use it</h2>
      <p>To respond to your enquiry, progress a commission or trade application, and — only if you&rsquo;ve ticked the
        collector-list checkbox on a form, or signed up separately — to send occasional updates about new work and
        private viewings. We do not use your information for any other purpose, and we do not sell, rent or trade
        personal information to third parties.</p>

      <h2>Where it&rsquo;s stored</h2>
      <p>Form submissions are stored in a private database (Upstash, a Redis hosting provider) and enquiry
        notifications are sent by email via Resend, a transactional email provider. Both are processors acting on the
        studio&rsquo;s behalf — they do not use your information for their own purposes. Only the studio can access stored
        enquiries, through a password-protected admin dashboard.</p>

      <h2>How long we keep it</h2>
      <p>Enquiry and commission records are kept for as long as reasonably needed to manage the relationship — including
        after a sale, for authenticity, warranty and resale-provenance purposes — and can be deleted on request at any
        time (see below). Newsletter addresses are kept until you unsubscribe or ask to be removed.</p>

      <h2>Your rights</h2>
      <p>You can ask what information we hold about you, ask us to correct it, ask us to delete it, or withdraw
        consent to marketing emails at any time, by emailing <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        We&rsquo;ll respond within a reasonable time and confirm once it&rsquo;s actioned.</p>

      <h2>Contact</h2>
      <p>For any privacy question or request, email <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.</p>
    </Prose>
  );
}
