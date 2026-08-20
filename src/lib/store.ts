// Lightweight data store backed by Upstash Redis REST API.
// No npm dependency — everything goes over fetch.
// If env vars are absent, falls back to console logging so the site never breaks.

const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
export const storeEnabled = Boolean(URL_ && TOKEN);

async function redis(command: (string | number)[]): Promise<any> {
  if (!storeEnabled) return null;
  const res = await fetch(URL_!, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.result;
}

async function pipeline(commands: (string | number)[][]): Promise<any[]> {
  if (!storeEnabled) return [];
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upstash pipeline error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.map((r: any) => r.result);
}

export type EnquiryKind = 'enquiry' | 'commission' | 'trade' | 'consultation' | 'framing';
export type EnquiryStatus = 'new' | 'replied' | 'won' | 'archived';

export interface Enquiry {
  id: string;
  createdAt: number;
  kind: EnquiryKind;
  status: EnquiryStatus;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  size: string;
  palette: string;
  notes: string;
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function saveEnquiry(input: Partial<Enquiry>): Promise<Enquiry> {
  const e: Enquiry = {
    id: newId(),
    createdAt: Date.now(),
    kind: (input.kind as EnquiryKind) || 'enquiry',
    status: 'new',
    name: input.name || '',
    email: input.email || '',
    phone: input.phone || '',
    company: input.company || '',
    subject: input.subject || '',
    message: input.message || '',
    size: input.size || '',
    palette: input.palette || '',
    notes: '',
  };
  if (storeEnabled) {
    await redis(['HSET', `enq:${e.id}`, ...Object.entries(e).flatMap(([k, v]) => [k, String(v)])]);
    await redis(['ZADD', 'enq:index', e.createdAt, e.id]);
  } else {
    console.log('[enquiry:no-store]', e);
  }
  return e;
}

export async function listEnquiries(limit = 500): Promise<Enquiry[]> {
  if (!storeEnabled) return [];
  const ids: string[] = (await redis(['ZREVRANGE', 'enq:index', 0, limit - 1])) || [];
  if (!ids.length) return [];
  const results = await pipeline(ids.map(id => ['HGETALL', `enq:${id}`]));
  return results.map((arr: any) => hashToEnquiry(arr)).filter(Boolean) as Enquiry[];
}

export async function updateEnquiry(id: string, patch: { status?: EnquiryStatus; notes?: string }): Promise<void> {
  if (!storeEnabled) return;
  const fields: (string | number)[] = [];
  if (patch.status) fields.push('status', patch.status);
  if (patch.notes !== undefined) fields.push('notes', patch.notes);
  if (!fields.length) return;
  await redis(['HSET', `enq:${id}`, ...fields]);
}

function hashToEnquiry(arr: string[] | Record<string, string> | null): Enquiry | null {
  if (!arr) return null;
  let o: Record<string, string> = {};
  if (Array.isArray(arr)) { for (let i = 0; i < arr.length; i += 2) o[arr[i]] = arr[i + 1]; }
  else o = arr as Record<string, string>;
  if (!o.id) return null;
  return {
    id: o.id, createdAt: Number(o.createdAt) || 0,
    kind: (o.kind as EnquiryKind) || 'enquiry', status: (o.status as EnquiryStatus) || 'new',
    name: o.name || '', email: o.email || '', phone: o.phone || '', company: o.company || '',
    subject: o.subject || '', message: o.message || '', size: o.size || '', palette: o.palette || '', notes: o.notes || '',
  };
}

export async function saveSubscriber(email: string): Promise<void> {
  if (!email) return;
  if (storeEnabled) {
    await redis(['ZADD', 'subs:index', Date.now(), email]);
  } else {
    console.log('[subscribe:no-store]', email);
  }
}

export async function listSubscribers(): Promise<{ email: string; at: number }[]> {
  if (!storeEnabled) return [];
  const res: string[] = (await redis(['ZREVRANGE', 'subs:index', 0, -1, 'WITHSCORES'])) || [];
  const out: { email: string; at: number }[] = [];
  for (let i = 0; i < res.length; i += 2) out.push({ email: res[i], at: Number(res[i + 1]) });
  return out;
}
