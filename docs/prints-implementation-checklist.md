# Ritushka Limited Edition Prints — Implementation Checklist

Tracks Prompt B (`docs/PRINTS_IMPLEMENTATION_PROMPT.md`), against decisions locked in
`docs/prints-decisions.md`. Status values: `NOT STARTED | IN PROGRESS | COMPLETE |
BLOCKED`.

## Phase 0 — Discovery (2.9)
- [x] COMPLETE — 5 verification files read, conventions confirmed (Container/Prose/
  FAQList/Breadcrumbs/JsonLd/Gallery/ArtworkCard reused; buildMetadata/schema.ts
  reused; Enquiry/EnquiryForm/AdminBoard reused for the `reserve` model; proportional
  gallery scale (`stageWidth`/`cardSizes`) reused in the new print card).

## Phase 1 — Data architecture (Section 5)
- [x] COMPLETE — `PrintTier`, `PrintEditionRecord`, `PrintSize`, `PrintEdition`
  added to `src/data/types.ts`
- [x] COMPLETE — `src/data/prints.ts` created, 39 entries (one per current artwork),
  slug-only references, nothing duplicated
- [x] COMPLETE — all derived values (sizes, imperial, price, remaining, "from" price,
  spec text) computed in `src/lib/prints.ts`, nothing stored twice
- [x] COMPLETE — `printSizeLongEdgeCm`, `printSizeCapPercent`, `printEditionSize`,
  `printTierPercent`, `printCurrency` added to `pricing.config.json` in the existing
  commented style; `referenceRate`/`sizeExponent` untouched, reused only as a curve

## Phase 2 — Transaction model (`reserve`)
- [x] COMPLETE — `EnquiryKind` extended with `'print'` in `src/lib/store.ts`
- [x] COMPLETE — `EnquiryForm` extended (label, hidden `size` field); `AdminBoard`
  filter extended; reservation flow is 100% the existing enquiry pipeline — no new
  dependency, no new API route

## Phase 3 — Collection page `/limited-edition-prints`
- [x] COMPLETE — hero, intro, print grid (`PrintCard`), collector experience, sizes,
  why-a-print, edition promise, original-vs-print, FAQ, closing CTA

## Phase 4 — Product page `/limited-edition-prints/[slug]`
- [x] COMPLETE — hero image, story, edition info (n/N explained), `PrintSizeSelector`
  (real radios), specification, sold-original wording where applicable, related
  editions (same collection, max 3)

## Phase 5 — SEO (Section 8)
- [x] COMPLETE — `buildMetadata` on both routes; `printProductSchema` (Product +
  AggregateOffer, linked to the original via `isBasedOn`) and
  `printsCollectionPageSchema` added to `src/lib/schema.ts`; both routes in
  `src/app/sitemap.ts` (verified: 39 product + 1 collection URL present); internal
  links added from nav, homepage, collections index, and every artwork page that has
  a print edition

## Phase 6 — Accessibility (Section 9)
- [x] COMPLETE — verified in browser: real `<input type="radio">` elements (not
  styled divs) in a labelled `role="radiogroup"`, each wrapped in a `<label>`;
  disabled state on sold-out sizes; `EnquiryForm` fields already labelled; heading
  hierarchy checked (h1 → h2 sections, no skipped levels)

## Phase 7 — Performance (Section 10)
- [x] COMPLETE — hero image not lazy-loaded (`priority`); `next/image` with explicit
  aspect-ratio throughout (no CLS); only `PrintSizeSelector` is a client component,
  everything else stays server-rendered

## Phase 8 — Responsive (Section 11)
- [x] COMPLETE — verified at 375px (mobile) in browser: stacked layout, full-width
  tappable size rows, no overflow, reuses the same breakpoint pattern as the existing
  artwork page

## Phase 9 — QA (Section 12)
- [x] `npm run typecheck` — PASS, 0 errors
- [x] `npm run lint` — PASS, 0 warnings
- [x] `npm run build` — PASS, all 39 print product pages + collection page statically
  generated (native Windows build, 2.10 caveat does not apply)
- [x] Manual checks — both routes load, JSON-LD validated (parsed + inspected in
  browser), sitemap contains all 40 new URLs, size selection updates price/
  availability/reservation panel live, sold-original wording confirmed on a sold
  work's print page, no console errors

## Phase 10 — Final review + completion report
- [x] COMPLETE — see completion report in chat

---
No `TODO_CONFIRM` reaches a rendered page. One real launch gap remains and is
tracked, not hidden: the actual print-lab/framing partner's name and a real quote —
see docs/prints-decisions.md Section 11.

## Post-launch revision, 2026-09-04
Nick flagged that price/lead time can't be stated as one all-in number since framing
and other customisation are genuinely order-dependent. Resolved: published price and
the lead-time estimate are now explicitly scoped to a plain unframed print on both
pages (`PRINT_SPECIFICATION.leadTime`/`.framing` in `src/lib/prints.ts`); framing and
any customisation are quoted separately, never bundled. Re-checked whether sizes
themselves should be made-to-order instead of fixed tiers — researched, confirmed
fixed sizes stay (docs/prints-decisions.md Section 5 addendum: open/custom sizing is
definitionally an open edition, not a limited one, and would undercut the entire
scarcity claim). Re-verified: typecheck, lint, build all pass; rendered copy checked
live.
