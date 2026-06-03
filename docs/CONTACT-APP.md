# Contact App — Setup Guide

The site has a built-in contact system:

- Every form (enquiry, commission, trade, consultation) **saves to a database** and **emails you**.
- A private **`/admin`** dashboard lists all enquiries with status, notes, type filter and CSV export.
- Newsletter signups are saved too.

Everything works over plain HTTPS APIs — no extra npm packages. Until you add the keys below, the
forms still work (they just log to the server and store nothing). Once the keys are set, data flows.

You need two free accounts (Upstash for storage, Resend for email) and then five environment
variables in Vercel. Takes about 10 minutes.

---

## 1. Storage — Upstash Redis (free, no card)

1. Go to **upstash.com** → sign up (GitHub login is fine).
2. **Create Database** → name it `ritushka` → type **Redis** → pick the region closest to Sydney
   (e.g. `ap-southeast` / Singapore) → Create.
3. On the database page, scroll to **REST API** and copy these two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## 2. Email — Resend (free)

1. Go to **resend.com** → sign up.
2. **API Keys → Create API Key** → copy it (starts with `re_`). This is `RESEND_API_KEY`.
3. **Domains → Add Domain** → enter `ritushka.com`, add the DNS records it shows you in Squarespace
   (same DNS panel you used before). This lets email send from your own domain.
   - *Shortcut for testing:* skip the domain for now and leave `RESEND_FROM` unset — email will send
     from Resend's shared `onboarding@resend.dev` address, which can only deliver to the email on your
     Resend account. Verify the domain when you want it to look professional.
4. Once the domain is verified, set `RESEND_FROM` to e.g. `Ritushka Studio <studio@ritushka.com>`.

## 3. Admin password

Pick a username and a strong password for the dashboard. These become `ADMIN_USER` and
`ADMIN_PASSWORD`.

## 4. Add the variables in Vercel

Vercel → your project → **Settings → Environment Variables**. Add each (Environment: **Production**,
and Preview if you want):

| Key | Value |
|-----|-------|
| `UPSTASH_REDIS_REST_URL` | from Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash |
| `RESEND_API_KEY` | from Resend (`re_…`) |
| `ENQUIRY_NOTIFY_EMAIL` | `studio@ritka.net` (where notifications go) |
| `ADMIN_USER` | your chosen admin username |
| `ADMIN_PASSWORD` | your chosen admin password |
| `RESEND_FROM` *(optional)* | `Ritushka Studio <studio@ritushka.com>` once domain verified |

Then **redeploy** (Deployments → ⋯ → Redeploy, or just push any commit).

## 5. Use it

- Visit **ritushka.com/admin** → browser asks for the username/password you set → the dashboard opens.
- Submit a test enquiry from the contact page; it should appear in `/admin` and arrive at
  `studio@ritka.net` within a few seconds.
- In the dashboard: change a status (new → replied → won → archived), type a note (saves when you click
  away), filter by type/status, search, and **Download CSV** to export.

## Notes & limits

- **Security:** `/admin` and `/api/admin/*` are protected by HTTP Basic Auth (the `ADMIN_*` vars) and
  excluded from search engines. Use a strong password. If `ADMIN_PASSWORD` is unset, `/admin` returns
  503 (locked) rather than exposing data.
- **Capacity:** Upstash's free tier easily covers an artist site's enquiry volume.
- **No data is lost if email fails:** the enquiry is saved first, then emailed; a failed email is logged
  but the visitor still gets a success message and you still see it in `/admin`.
- **Local dev:** put the same keys in a `.env.local` file (already git-ignored) to test on your machine.
