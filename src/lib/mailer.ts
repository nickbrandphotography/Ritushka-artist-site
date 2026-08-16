// Email notifications via Resend REST API (no npm dependency).
// Silently no-ops if RESEND_API_KEY is absent.
import { site } from '@/site.config';

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'Ritushka Studio <onboarding@resend.dev>';
const TO = process.env.ENQUIRY_NOTIFY_EMAIL || site.contact.email;

/** True when a Resend API key is present. Used by /admin to show setup status. */
export const mailEnabled = Boolean(KEY);

export type MailResult = { ok: boolean; reason?: string };

export async function sendEnquiryEmail(data: Record<string, string>): Promise<MailResult> {
  if (!KEY) {
    console.error('[mailer] NOT SENT — RESEND_API_KEY is not set. Enquiry would have gone to', TO, data);
    return { ok: false, reason: 'no-api-key' };
  }
  const rows = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;text-transform:capitalize">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
    .join('');
  const subject = `New ${data.kind || 'enquiry'}${data.subject ? `: ${data.subject}` : ''} — ${data.name || 'website'}`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#1a1a18">
    <h2 style="font-weight:600">New ${data.kind || 'enquiry'} from ritushka.com</h2>
    <table>${rows}</table></div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [TO], subject, html, reply_to: data.email || undefined }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error('[mailer] NOT SENT — Resend returned', res.status, detail);
      return { ok: false, reason: `resend-${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[mailer] NOT SENT — request failed', err);
    return { ok: false, reason: 'network' };
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
