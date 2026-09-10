import { NextRequest, NextResponse } from 'next/server';

const BYPASS_COOKIE = 'rt_bypass';

/**
 * Site-wide "pause" switch. Set MAINTENANCE_MODE=true in the Vercel project's
 * environment variables (Settings -> Environment Variables) to show every
 * visitor a plain "back soon" page instead of the real site; unset it (or
 * set to anything else) to bring the site back. Takes effect on the next
 * request after Vercel redeploys — a plain env var change there triggers
 * that automatically, no code change or git push needed.
 *
 * Deliberately does NOT gate /admin or /api/admin — those keep their own
 * password check below regardless of maintenance mode, so the owner can
 * always get into the admin tools.
 *
 * Optional preview bypass: set MAINTENANCE_BYPASS_SECRET to some string,
 * then visit any page with ?preview=<that string> once. That sets a cookie
 * so you (and only you) keep seeing the real site while it's paused for
 * everyone else. Leave MAINTENANCE_BYPASS_SECRET unset to disable this —
 * maintenance mode then simply blocks everyone, no exceptions.
 */
function maintenanceResponse(req: NextRequest): NextResponse | null {
  if (process.env.MAINTENANCE_MODE !== 'true') return null;

  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;
  if (bypassSecret) {
    const previewParam = req.nextUrl.searchParams.get('preview');
    if (previewParam === bypassSecret) {
      // Redirect to the clean URL (without ?preview=...) and set the cookie
      // there, so the secret doesn't linger in the address bar or get
      // shared accidentally via a copied link.
      const clean = req.nextUrl.clone();
      clean.searchParams.delete('preview');
      const res = NextResponse.redirect(clean);
      res.cookies.set(BYPASS_COOKIE, bypassSecret, {
        httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }
    if (req.cookies.get(BYPASS_COOKIE)?.value === bypassSecret) return null;
  }

  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Hints this is temporary rather than gone for good — search engines
      // keep indexing the real pages instead of dropping them. Not a hard
      // deadline; just the standard, low-stakes value for planned downtime.
      'Retry-After': '3600',
    },
  });
}

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ritushka — back soon</title>
<style>
  html,body{height:100%;margin:0;}
  body{
    display:flex;align-items:center;justify-content:center;
    background:#f6f4ef;color:#1a1a18;
    font-family:Georgia,'Times New Roman',serif;
    padding:1.5rem;text-align:center;
  }
  .wrap{max-width:32rem;}
  h1{font-weight:400;font-size:clamp(1.75rem,5vw,2.5rem);margin:0 0 0.75rem;letter-spacing:0.02em;}
  p{font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:1rem;line-height:1.6;color:rgba(26,26,24,0.7);margin:0;}
</style>
</head>
<body>
  <div class="wrap">
    <h1>Ritushka</h1>
    <p>The site is offline for a short while. Back soon.</p>
  </div>
</body>
</html>`;

// HTTP Basic Auth gate for /admin and /api/admin.
// Credentials come from env: ADMIN_USER (default "ritushka") and ADMIN_PASSWORD.
function adminGate(req: NextRequest): NextResponse {
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

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    return adminGate(req);
  }
  return maintenanceResponse(req) ?? NextResponse.next();
}

// Runs on every route except Next's own static/image internals — that way
// the maintenance page (and the admin gate) can intercept anything,
// including robots.txt, sitemap.xml and the API routes.
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
