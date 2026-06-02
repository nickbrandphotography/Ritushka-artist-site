import { NextResponse } from 'next/server';
// PLACEHOLDER: connect to your email provider (Mailchimp, Klaviyo, Beehiiv...).
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }));
  console.log('[subscribe]', email);
  return NextResponse.json({ ok: true });
}
