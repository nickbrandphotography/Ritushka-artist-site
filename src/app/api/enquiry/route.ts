import { NextResponse } from 'next/server';
import { saveEnquiry, saveSubscriber } from '@/lib/store';
import { sendEnquiryEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, string>));
  try {
    const enquiry = await saveEnquiry(body);
    if (body.subscribe === 'on' || body.subscribe === 'true' || body.subscribe === true) {
      await saveSubscriber(body.email);
    }
    await sendEnquiryEmail({
      kind: enquiry.kind, name: enquiry.name, email: enquiry.email, phone: enquiry.phone,
      company: enquiry.company, subject: enquiry.subject, message: enquiry.message,
      size: enquiry.size, palette: enquiry.palette,
    });
    return NextResponse.json({ ok: true, id: enquiry.id });
  } catch (err) {
    console.error('[api/enquiry]', err);
    // Never fail the visitor's submission outright
    return NextResponse.json({ ok: true });
  }
}
