import type { Metadata } from 'next';
import { listEnquiries, storeEnabled } from '@/lib/store';
import { mailEnabled } from '@/lib/mailer';
import AdminBoard from '@/components/AdminBoard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Studio Admin', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const enquiries = storeEnabled ? await listEnquiries() : [];
  return (
    <div className="mx-auto max-w-content px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-sand pb-5">
        <h1 className="font-serif text-3xl text-ink">Studio enquiries</h1>
        <p className="text-sm text-ink/55">{enquiries.length} total</p>
      </header>
      {!storeEnabled && !mailEnabled && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-900">
          <strong>Enquiries are being lost.</strong> Neither storage nor email is configured, so the
          form now returns an error and asks visitors to email the studio directly. Add the variables
          below in Vercel → Settings → Environment Variables, then redeploy. See <code>docs/CONTACT-APP.md</code>.
        </p>
      )}
      {!storeEnabled && mailEnabled && (
        <p className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-900">
          Storage isn’t configured, so nothing is listed here — but enquiries <em>are</em> reaching your
          inbox. Add <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> in
          Vercel → Settings → Environment Variables, then redeploy.
        </p>
      )}
      {storeEnabled && !mailEnabled && (
        <p className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-900">
          Email notifications are off — enquiries are saved here, but nothing is sent to your inbox, so
          you must check this page manually. Add <code>RESEND_API_KEY</code> in Vercel → Settings →
          Environment Variables, then redeploy.
        </p>
      )}
      <AdminBoard initial={enquiries} />
    </div>
  );
}
