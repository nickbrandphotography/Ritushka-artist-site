'use client';
import { useState } from 'react';
import { site } from '@/site.config';
export default function EnquiryForm({ subject, kind = 'enquiry' }: { subject?: string; kind?: 'enquiry' | 'commission' | 'trade' | 'consultation' }) {
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [failed, setFailed] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setFailed(false);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, kind, subject }) });
      if (!res.ok) { setBusy(false); setFailed(true); return; }
      setSent(true);
    } catch { setFailed(true); }
    setBusy(false);
  }
  if (sent) return <p className="rounded-md bg-sand/60 p-4 text-ink">Thank you — your {kind} request has been received. Ritushka's studio will reply within two business days.</p>;
  const labels: Record<string, string> = { enquiry: 'Enquire about this work', commission: 'Start a commission', trade: 'Apply to the trade program', consultation: 'Book a consultation' };
  return (
    <form onSubmit={submit} className="space-y-4">
      {failed && (
        <p role="alert" className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">
          We couldn’t send that just now. Please email{' '}
          <a href={`mailto:${site.contact.email}`} className="underline">{site.contact.email}</a>{' '}
          or call <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="underline">{site.contact.phone}</a> and
          we’ll pick it up straight away.
        </p>
      )}
      {subject && <input type="hidden" name="subject" value={subject} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Full name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" />
        <Field name="company" label="Company / studio (optional)" />
      </div>
      {kind === 'commission' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="size" label="Desired size (cm)" />
          <Field name="palette" label="Palette / colours" />
        </div>
      )}
      <label className="block text-sm">
        <span className="text-ink/70">Message</span>
        <textarea name="message" rows={4} className="mt-1 w-full rounded-md border border-ink/20 px-3 py-2" defaultValue={subject ? `I'm interested in "${subject}".` : ''} />
      </label>
      <label className="flex items-start gap-2 text-xs text-ink/60">
        <input type="checkbox" name="subscribe" defaultChecked className="mt-0.5" />
        Add me to the collector list for new works and private viewings.
      </label>
      <button disabled={busy} className="rounded-full bg-ink px-6 py-2.5 text-sm text-bone disabled:opacity-60">{busy ? 'Sending…' : labels[kind]}</button>
      <p className="text-xs text-ink/50">Your enquiry goes straight to Ritushka's studio. We reply within two business days.</p>
    </form>
  );
}
function Field({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="text-ink/70">{label}{required && ' *'}</span>
      <input name={name} type={type} required={required} className="mt-1 w-full rounded-md border border-ink/20 px-3 py-2" />
    </label>
  );
}
