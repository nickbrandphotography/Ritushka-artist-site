# Ritushka — Artist SEO Machine

A production-ready **Next.js 14 (App Router)** website for **Ritushka**, a contemporary abstract
landscape & seascape artist based in **Lane Cove, Sydney**. Built as both a luxury gallery and an
SEO / AI-discovery lead-generation engine.

## Quick start
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (SSG)
npm run typecheck  # tsc --noEmit
```

## Edit the artist identity in ONE place
All branding, SEO defaults, schema and contact details read from **`src/site.config.ts`**.
Change the name, domain, email, social links and geo there — every page, sitemap, OG tag and
JSON-LD block updates automatically.

## Content is data-driven (scales to 500+ works)
`src/data/` holds typed records. Regenerate placeholder content any time:
```bash
node scripts/generate-data.mjs   # 50 artworks, 10 collections, 50 mockups, 50 posts
```
To grow the catalogue, raise `N_ARTWORKS` in the generator **or** add records by hand / wire a CMS
(see `docs/CMS-STRUCTURE.md`). No routing or architectural change is needed — dynamic routes,
sitemap, schema and internal links all derive from the data.

### Swapping in real images
`PlaceholderImage` renders a deterministic SVG. Drop real files at the data-driven paths
(`/public/artworks/<slug>.jpg`, `/public/mockups/<slug>.jpg`, `/public/blog/<slug>.jpg`) and
replace `PlaceholderImage` with `next/image` for automatic AVIF/WebP optimisation.

## What's included
- 19 core pages + 10 collections + 50 artwork pages + 50 mockups + 50 blog posts (139 routes)
- Full JSON-LD: Person, Organization/LocalBusiness, WebSite, VisualArtwork, CollectionPage,
  Article, FAQPage, BreadcrumbList, ImageObject
- `sitemap.xml`, `robots.txt` (AI crawlers explicitly welcomed), `manifest`, `llms.txt`
- Canonical URLs, Open Graph, Twitter cards, per-page metadata via `src/lib/seo.ts`
- Conversion: artwork enquiry, commission, trade application, email capture, consultation
- Internal linking: artwork ↔ collection ↔ mockup ↔ blog ↔ commission/trade

See `docs/` for the full strategy, architecture, internal-linking map and deployment plan.
