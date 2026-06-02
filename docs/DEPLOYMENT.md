# Deployment — Vercel & Cloudflare

## Recommended: Vercel
1. Push to GitHub.
2. Import the repo in Vercel → framework auto-detected (Next.js).
3. Set env vars (when wired): `RESEND_API_KEY`, `NEWSLETTER_API_KEY`, etc.
4. Set the production domain; update `site.url` in `src/site.config.ts` to match.
5. Deploy. Routes are statically generated; forms hit `/api/*` serverless functions.
- Add `app/opengraph-image.tsx` later for auto OG images, or place `/public/og/default.jpg`.

## Cloudflare Pages
Two options:
- **Static export** (no API routes): set `output: 'export'` in `next.config.mjs`, move form handling
  to a Cloudflare Worker / Pages Function or a 3rd-party form endpoint. `npm run build` → deploy `out/`.
- **Full SSR on Cloudflare**: use `@cloudflare/next-on-pages`:
  ```bash
  npm i -D @cloudflare/next-on-pages
  npx @cloudflare/next-on-pages
  ```
  Build command `npx @cloudflare/next-on-pages`, output dir `.vercel/output/static`, Node compat flag on.

## Post-deploy checklist
- Submit `sitemap.xml` in Google Search Console & Bing Webmaster Tools.
- Verify `robots.txt` and `llms.txt` resolve at the domain root.
- Run Lighthouse (target: SEO 100, Perf/A11y/Best-Practices 95+) — see PERFORMANCE.md.
- Confirm JSON-LD with Google Rich Results Test for an artwork, collection and article URL.
