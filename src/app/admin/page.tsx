import type { Metadata } from 'next';
import { listEnquiries, storeEnabled } from '@/lib/store';
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
      {!storeEnabled && (
        <p className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-900">
          Storage isn’t configured yet. Add <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> in
          Vercel → Settings → Environment Variables, then redeploy. See <code>docs/CONTACT-APP.md</code>.
        </p>
      )}
      <AdminBoard initial={enquiries} />
    </div>
  );
}
