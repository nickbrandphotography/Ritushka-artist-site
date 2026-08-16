import { NextResponse } from 'next/server';
import { saveEnquiry, saveSubscriber, storeEnabled } from '@/lib/store';
import { sendEnquiryEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, string>));

  // An enquiry is only safe if it lands SOMEWHERE — the database or the inbox.
  // Track both independently so a half-broken pipeline can't look like success.
  let stored = false;
  let emailed = false;
  let enquiry: Awaited<ReturnType<typeof saveEnquiry>> | null = null;

  try {
    enquiry = await saveEnquiry(body);
    stored = storeEnabled;
  } catch (err) {
    console.error('[api/enquiry] STORE FAILED', err);
  }

  try {
    const subscribed = body.subscribe === 'on' || body.subscribe === 'true' || body.subscribe === true;
    if (subscribed && body.email) await saveSubscriber(body.email);
  } catch (err) {
    console.error('[api/enquiry] subscriber save failed (non-critical)', err);
  }

  try {
    const payload = enquiry ?? (body as Record<string, string>);
    const result = await sendEnquiryEmail({
      kind: payload.kind, name: payload.name, email: payload.email, phone: payload.phone,
      company: payload.company, subject: payload.subject, message: payload.message,
      size: payload.size, palette: payload.palette,
    });
    emailed = result.ok;
  } catch (err) {
    console.error('[api/enquiry] EMAIL FAILED', err);
  }

  if (!stored && !emailed) {
    // Nothing captured it. Do not tell the visitor it worked — they'd walk away
    // believing the studio has their details, and it doesn't.
    console.error('[api/enquiry] LEAD LOST — neither storage nor email is working.', body);
    return NextResponse.json(
      { ok: false, error: 'delivery-failed' },
      { status: 503 },
    );
  }

  if (!stored || !emailed) {
    console.warn(`[api/enquiry] partial delivery — stored=${stored} emailed=${emailed}`);
  }

  return NextResponse.json({ ok: true, id: enquiry?.id, stored, emailed });
}
