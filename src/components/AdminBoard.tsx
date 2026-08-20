'use client';
import { useMemo, useState } from 'react';
import type { Enquiry, EnquiryStatus } from '@/lib/store';

const STATUSES: EnquiryStatus[] = ['new', 'replied', 'won', 'archived'];
const KINDS = ['all', 'enquiry', 'commission', 'trade', 'consultation'] as const;
const statusColor: Record<EnquiryStatus, string> = {
  new: 'bg-sea/15 text-sea', replied: 'bg-amber-100 text-amber-800',
  won: 'bg-green-100 text-green-800', archived: 'bg-ink/10 text-ink/65',
};

export default function AdminBoard({ initial }: { initial: Enquiry[] }) {
  const [rows, setRows] = useState<Enquiry[]>(initial);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all');
  const [status, setStatus] = useState<'all' | EnquiryStatus>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => rows.filter(r =>
    (kind === 'all' || r.kind === kind) &&
    (status === 'all' || r.status === status) &&
    (!q || `${r.name} ${r.email} ${r.subject} ${r.message} ${r.company}`.toLowerCase().includes(q.toLowerCase()))
  ), [rows, kind, status, q]);

  async function patch(id: string, p: { status?: EnquiryStatus; notes?: string }) {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)));
    await fetch('/api/admin/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...p }) }).catch(() => {});
  }

  function exportCsv() {
    const cols = ['createdAt', 'kind', 'status', 'name', 'email', 'phone', 'company', 'subject', 'message', 'size', 'palette', 'notes'];
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [cols.join(',')];
    for (const r of filtered) lines.push(cols.map(c => esc(c === 'createdAt' ? new Date(r.createdAt).toISOString() : (r as any)[c])).join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `ritushka-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <select value={kind} onChange={e => setKind(e.target.value as any)} className="rounded-md border border-ink/20 px-3 py-1.5 text-sm capitalize">
          {KINDS.map(k => <option key={k} value={k}>{k === 'all' ? 'All types' : k}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="rounded-md border border-ink/20 px-3 py-1.5 text-sm capitalize">
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="grow rounded-md border border-ink/20 px-3 py-1.5 text-sm" />
        <button onClick={exportCsv} className="rounded-full bg-ink px-4 py-1.5 text-sm text-bone">Download CSV</button>
      </div>

      <p className="mt-3 text-xs text-ink/65">{filtered.length} shown</p>

      <ul className="mt-4 space-y-4">
        {filtered.map(r => (
          <li key={r.id} className="rounded-lg border border-sand p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{r.name || '(no name)'} · <span className="capitalize text-ink/65">{r.kind}</span></p>
                <p className="text-sm text-ink/65">
                  {r.email && <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>}
                  {r.phone && <> · <a className="underline" href={`tel:${r.phone.replace(/\s+/g, '')}`}>{r.phone}</a></>}
                  {r.company && <> · {r.company}</>}
                </p>
                {r.subject && <p className="mt-1 text-sm text-ink/70">Re: {r.subject}</p>}
              </div>
              <div className="text-right">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs capitalize ${statusColor[r.status]}`}>{r.status}</span>
                <p className="mt-1 text-xs text-ink/65">{new Date(r.createdAt).toLocaleString('en-AU')}</p>
              </div>
            </div>
            {r.message && <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">{r.message}</p>}
            {(r.size || r.palette) && <p className="mt-2 text-xs text-ink/65">{r.size && `Size: ${r.size}`} {r.palette && `· Palette: ${r.palette}`}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-ink/65">Status
                <select value={r.status} onChange={e => patch(r.id, { status: e.target.value as EnquiryStatus })} className="ml-2 rounded border border-ink/20 px-2 py-1 text-sm capitalize">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <input
                defaultValue={r.notes}
                placeholder="Add a note…"
                onBlur={e => { if (e.target.value !== r.notes) patch(r.id, { notes: e.target.value }); }}
                className="grow rounded border border-ink/20 px-2 py-1 text-sm"
              />
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li className="py-10 text-center text-ink/65">No enquiries yet.</li>}
      </ul>
    </div>
  );
}
