# SEO Strategy

## Keyword clusters → page mapping
| Cluster | Primary page | Supporting |
|---|---|---|
| Abstract landscape art | /collections/abstract-landscapes | artwork pages, blog |
| Abstract seascape paintings | /collections/abstract-seascapes | artwork pages, blog |
| Contemporary Australian artist | /about, /collections/modern-australian-art | home, journal |
| Large scale art | /collections/large-scale-paintings | "Large Scale Art For Luxury Homes" |
| Coastal art | /collections/coastal-abstract-art | "Best Art For Coastal Homes" |
| Original paintings | /available | /portfolio |
| Commissioned artwork | /commission | sold works, collection CTAs |
| Luxury art | /collections/statement-artworks | trade pages |
| Art for interior designers | /trade/interior-designers | designer blog posts |
| Art for architects / developers | /trade/corporate, /trade/buyers-agents | mockups |
| Art consultant services | /trade/art-consultants | journal |

## Technical SEO (implemented)
- SSG + SSR-safe metadata; canonical on every page (`buildMetadata`)
- `sitemap.xml` (all 139 routes, priority-weighted), `robots.txt`, `manifest`
- Open Graph + Twitter cards; `metadataBase` set for absolute URLs
- Semantic HTML, single H1/page, breadcrumb trails, descriptive alt text
- Image optimisation path via `next/image` (AVIF/WebP) once real assets land
- Security headers in `next.config.mjs`

## On-page pattern (every artwork)
Unique title, meta description, story, dimensions, medium, availability, price, shipping, enquiry form,
VisualArtwork + Breadcrumb schema, links to its collection(s), related works and in-situ mockups.

## Topical authority
Collection (hub) → artworks (spokes) → mockups (proof) → blog (intent) all interlink. Each collection
page surfaces related journal posts; each post links back to a collection and conversion CTA.
