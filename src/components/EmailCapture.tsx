'use client';
import { useState } from 'react';
export default function EmailCapture({ dark }: { dark?: boolean }) {
  const [email, setEmail] = useState(''); const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try { await fetch('/api/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) }); } catch {}
    setDone(true);
  }
  if (done) return <p className={dark ? 'text-sm text-bone/80' : 'text-sm text-ink/70'}>Thank you — you're on the list.</p>;
  return (
    <form onSubmit={submit} className="flex gap-2">
      <label className="sr-only" htmlFor="ec">Email address</label>
      <input id="ec" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
        className={`w-full rounded-full border px-4 py-2 text-sm ${dark ? 'border-bone/30 bg-transparent text-bone placeholder:text-bone/40' : 'border-ink/25 bg-white text-ink'}`} />
      <button className={`shrink-0 rounded-full px-4 py-2 text-sm ${dark ? 'bg-bone text-ink' : 'bg-ink text-bone'}`}>Join</button>
    </form>
  );
}
