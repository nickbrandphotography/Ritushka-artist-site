# Architecture

## Stack
- Next.js 14 App Router, React 18, TypeScript (strict)
- Tailwind CSS design system (`tailwind.config.ts`)
- Static Generation (SSG) via `generateStaticParams` for every dynamic route → fast, cheap, CDN-friendly
- Zero client JS except small interactive islands (`'use client'` forms)

## Folder structure
```
src/
  site.config.ts          # single source of truth: identity, SEO, geo, contact
  app/
    layout.tsx            # root <html>, fonts, global JSON-LD (Person/Org/WebSite)
    sitemap.ts robots.ts manifest.ts
    api/enquiry  api/subscribe        # form endpoints (stub → wire to CRM/email)
    (site)/                           # all public pages share Header/Footer
      page.tsx                        # home
      about portfolio available sold commission framing contact faq shipping
      installation-guide privacy terms
      collections/ + collections/[slug]
      artwork/[slug]
      mockups/ + mockups/[slug]
      blog/ + blog/[slug]
      trade/ + trade/{interior-designers,art-consultants,buyers-agents,corporate}
  components/             # Header, Footer, Gallery, ArtworkCard, EnquiryForm, FAQList, schema JsonLd...
  lib/                    # data.ts (access helpers), seo.ts (metadata), schema.ts (JSON-LD)
  data/                   # types.ts + generated artworks/collections/mockups/blog + programs.ts
scripts/generate-data.mjs # deterministic content generator
public/                   # images, llms.txt
docs/                     # strategy & deployment
```

## URL structure
```
/                              /about            /portfolio
/collections  /collections/:slug
/artwork/:slug
/available    /sold
/mockups      /mockups/:slug
/blog         /blog/:slug
/commission   /framing
/trade  /trade/interior-designers  /art-consultants  /buyers-agents  /corporate
/installation-guide  /shipping  /faq  /contact  /privacy  /terms
```

## Scaling to 500+ works
Records are the only thing that grows. Routes, sitemap, schema, breadcrumbs, related-work logic and
internal links are all derived functions over `src/data`. Add records (CMS or generator) → rebuild → done.
