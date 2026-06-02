# CMS Structure

The site reads typed records from `src/data`. Any headless CMS that can output these shapes works
(Sanity, Contentful, Payload, Keystatic, or Git-based MDX). Map collections 1:1 to the interfaces in
`src/data/types.ts`.

## Content models
**Artwork** — title, slug, year, medium, width/height (mm+cm), palette, collections[] (ref),
primaryCollection (ref), status (available|sold|reserved), price, currency, orientation, story,
shortDescription, seoTitle, metaDescription, image, alt, mockups[] (ref).

**Collection** — name, slug, keyword, intent, heading, seoTitle, metaDescription, intro, faqs[].

**Mockup** — room, artwork (ref), title, image, alt, seoTitle, metaDescription.

**BlogPost** — title, slug, audience, publishedAt, readMinutes, excerpt, seoTitle, metaDescription,
relatedCollection (ref), image, body (markdown).

**Program** (trade) — audience, title, seoTitle, metaDescription, intro, benefits[], faqs[].

## Integration steps
1. Recreate the models above in your CMS.
2. Replace the static imports in `src/lib/data.ts` with async fetchers (keep the same exported
   function signatures so pages don't change).
3. Add ISR: `export const revalidate = 3600` on dynamic routes, or on-demand revalidation via webhook.
4. Keep `src/site.config.ts` for global identity, or move it to a CMS "Settings" singleton.
