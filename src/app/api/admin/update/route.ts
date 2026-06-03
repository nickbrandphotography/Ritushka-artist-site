import { NextResponse } from 'next/server';
import { updateEnquiry, type EnquiryStatus } from '@/lib/store';

export async function POST(req: Request) {
  const { id, status, notes } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 });
  try {
    await updateEnquiry(id, { status: status as EnquiryStatus | undefined, notes });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/update]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
