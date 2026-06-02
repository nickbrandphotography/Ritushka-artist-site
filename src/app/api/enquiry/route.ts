import { NextResponse } from 'next/server';
// PLACEHOLDER: pipe to your CRM / email (Resend, HubSpot, etc.).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  console.log('[enquiry]', body);
  return NextResponse.json({ ok: true });
}
