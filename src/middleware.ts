import { NextRequest, NextResponse } from 'next/server';

// HTTP Basic Auth gate for /admin and /api/admin.
// Credentials come from env: ADMIN_USER (default "ritushka") and ADMIN_PASSWORD.
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER || 'ritushka';
  const pass = process.env.ADMIN_PASSWORD;

  // If no password configured, deny access entirely (fail closed).
  if (!pass) {
    return new NextResponse('Admin not configured. Set ADMIN_PASSWORD.', { status: 503 });
  }

  const header = req.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    const decoded = atob(header.slice(6));
    const i = decoded.indexOf(':');
    const u = decoded.slice(0, i);
    const p = decoded.slice(i + 1);
    if (u === user && p === pass) return NextResponse.next();
  }
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Ritushka Admin", charset="UTF-8"' },
  });
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
