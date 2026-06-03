import { NextResponse } from 'next/server';
import { saveSubscriber } from '@/lib/store';

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }));
  try { await saveSubscriber(email); } catch (err) { console.error('[api/subscribe]', err); }
  return NextResponse.json({ ok: true });
}
