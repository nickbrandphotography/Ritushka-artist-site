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

## The spreadsheet is the source of truth
`Artwork Records.ods` → sheet **Artwork Register** drives the catalogue. Edit the spreadsheet,
then run:
```bash
python3 scripts/sync-register.py     # register -> src/data/*.ts + public/llms.txt
python3 scripts/generate-mockups.py  # re-render room mockups at true scale
```
`sync-register.py` reads the register, matches each row to its artwork by title, and updates
dimensions, depth, orientation, framing, the artist's description, sold status and every piece of
SEO copy that mentions a size. Curated fields (palette, collections, subject line) are preserved.
Blank columns stay blank on the site — nothing is invented. Fill **Medium**, **Year Created** and
**List Price** in the register and they will appear on the artwork pages automatically.

Rows are matched on **Title**, so a title change in the spreadsheet renames the page. Slug changes
need a 301 added to `redirects()` in `next.config.mjs`.

Mockups are drawn to a single real-world scale: a 2.7 m wall, a 120 × 45 cm bench, and each
painting at its recorded size, hung with its centre 150 cm off the floor.

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
- 19 core pages + 10 collections + 40 artwork pages + 40 mockups + 31 blog posts (140 routes) — the
  Journal was cut from 50 templated posts to 31 hand-written ones in Aug 2026; see
  `scripts/rewrite-blog-content.py`.
- Full JSON-LD: Person, Organization/LocalBusiness, WebSite, VisualArtwork, CollectionPage,
  Article, FAQPage, BreadcrumbList, ImageObject
- `sitemap.xml`, `robots.txt` (AI crawlers explicitly welcomed), `manifest`, `llms.txt`
- Canonical URLs, Open Graph, Twitter cards, per-page metadata via `src/lib/seo.ts`
- Conversion: artwork enquiry, commission, trade application, email capture, consultation
- Internal linking: artwork ↔ collection ↔ mockup ↔ blog ↔ commission/trade

See `docs/` for the full strategy, architecture, internal-linking map and deployment plan.
