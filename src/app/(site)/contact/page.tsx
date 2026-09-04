import Container from '@/components/Container';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnquiryForm from '@/components/EnquiryForm';
import PageWatermark from '@/components/PageWatermark';
import { site } from '@/site.config';
import { buildMetadata } from '@/lib/seo';
export const metadata = buildMetadata({ title: 'Contact', description: 'Contact Ritushka\'s studio in Lane Cove, Sydney to enquire about original paintings, commissions, trade programs or studio visits by appointment.', path: '/contact' });
export default function Contact() {
  return (
    <PageWatermark src="/about/watermark-contact.jpg">
    <Container className="py-14">
      <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
      <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">Contact the studio</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="text-ink/75">
          <p>For acquisitions, commissions, trade enquiries and press.</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div><dt className="text-ink/65">Email</dt><dd><a href={`mailto:${site.contact.email}`} className="underline hover:text-ink">{site.contact.email}</a></dd></div>
            <div><dt className="text-ink/65">Phone</dt><dd><a href={`tel:${site.contact.phone.replace(/\s+/g, '')}`} className="underline hover:text-ink">{site.contact.phone}</a></dd></div>
            <div><dt className="text-ink/65">Studio</dt><dd>{site.location.suburb}, {site.location.city}, {site.location.state} — by appointment</dd></div>
            <div><dt className="text-ink/65">Shipping</dt><dd>Worldwide, insured</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-sand bg-bone/90 p-6"><EnquiryForm kind="enquiry" /></div>
      </div>
    </Container>
    </PageWatermark>
  );
}
