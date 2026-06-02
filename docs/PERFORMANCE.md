# Performance & Lighthouse targets

Targets: **SEO 100 · Performance 95+ · Accessibility 95+ · Best Practices 95+ · Mobile 95+**

## How the build hits them
- **SEO 100**: canonical, titles/descriptions on every route, sitemap+robots, valid structured data,
  crawlable links, descriptive alt text, `lang="en-AU"`.
- **Performance**: SSG/CDN delivery, near-zero client JS (forms are the only islands), `next/font`
  (no layout shift), AVIF/WebP via `next/image` once real assets are added, no blocking 3rd-party JS.
- **Accessibility**: semantic landmarks, skip link, one H1/page, labelled form fields, SVG `role="img"`
  + aria-label, AA-contrast palette.
- **Best Practices**: HTTPS, security headers, no console errors, `poweredByHeader: false`.

## Before launch
- Replace SVG placeholders with optimised real images sized to layout.
- Add `priority` only to above-the-fold images (already set on first gallery row / hero).
- Consider `app/opengraph-image.tsx` for dynamic social cards.
