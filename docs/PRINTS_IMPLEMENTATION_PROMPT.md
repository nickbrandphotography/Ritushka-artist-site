# RITUSHKA ART — LIMITED EDITION PRINTS
## Master prompt pack v2 — for Claude Code, run at the repo root

This replaces the previous single prompt. It is split into **two prompts** because
the original conflated two different jobs: deciding the print strategy (research,
judgement, Nick's call) and building it (implementation). Run **Prompt A** only if
the decisions in Section 1 are not yet made. Then run **Prompt B**.

---
---

# PROMPT B — IMPLEMENTATION
*(the main prompt — paste everything from here to "END OF PROMPT B")*

## 0. HOW TO RUN THIS DOCUMENT

You are the lead implementation engineer for Ritushka Art, working in the existing
codebase at the repo root. You are simultaneously acting as: senior Next.js/TypeScript
developer, luxury art-ecommerce UX designer, contemporary gallery digital strategist,
conversion specialist, technical SEO and structured-data specialist, accessibility
engineer, and performance engineer.

This is an **implementation task**. Recommendations, plans and example code are not
the deliverable. Working, building, integrated code is.

Three mechanical rules govern how you run, and they exist because long tasks lose
their thread:

**0.1 — The checklist is a file, not a memory.**
Before writing any feature code, create `docs/prints-implementation-checklist.md`
containing every requirement in Sections 4–12 of this document as a line item with
status `NOT STARTED | IN PROGRESS | COMPLETE | BLOCKED`. **Update that file on disk
at the end of every phase, before starting the next.** If you lose context, re-read
that file plus `docs/prints-decisions.md` (Section 1) and resume. Never keep the
checklist only in your head.

**0.2 — Reprint the state header at the start of every phase.**

```
PHASE: <n — name>   |   PREVIOUS PHASE: COMPLETE / BLOCKED (<why>)
REMAINING PHASES: <list>
OPEN BLOCKERS: <list or none>
```

**0.3 — Checkpoint after every phase.** Run `npm run typecheck` at minimum. Do not
carry a broken type state into the next phase.

## 1. STOP GATE — DECISIONS THAT MUST EXIST BEFORE CODE

All print-programme facts live in **one file**: `docs/prints-decisions.md`.

**Read that file first.** If it does not exist, or any field below is empty or still
marked `TODO_CONFIRM`, **stop immediately** and ask Nick — in a single message, all
questions at once, with your recommended default for each. Do not start Phase 1. Do
not invent a value to keep moving. Do not "use a sensible placeholder and continue"
for anything that will be shown to a collector.

Required fields:

| Field | Why it blocks |
|---|---|
| `transactionModel` — `enquiry` \| `reserve` \| `checkout` | Determines whether Phase 6 exists at all. **There is no ecommerce system in this repo today** (see 2.6). |
| `artworksInProgramme` — list of artwork slugs | Which of the works in `src/data/artworks.ts` are released as editions. |
| `editionStructure` — per size, or per artwork | Whether edition numbers are shared across sizes or separate. |
| `editionSize` — integer per edition | Published to collectors. Never guessed. |
| `printSizes` — cm dimensions per artwork or per aspect ratio | Must respect each work's true aspect ratio. |
| `printPricing` — explicit price per size, or a stated formula | See 2.7: original pricing is model-driven; prints must be equally explicit. |
| `printSpecification` — process, paper, ink, lab/printer | Published as fact. |
| `signingPolicy` — signed where, numbered how | Published as fact. |
| `coaPolicy` — certificate issued, by whom, what it states | Published as fact. |
| `originalProtectionPolicy` — max print size vs original, whether an edition is retired when the original sells, whether a sold original still prints | The commercial heart of the feature. |
| `fulfilment` — printed/shipped by whom, from where, lead time, rolled or flat, framed option yes/no | Appears in shipping copy and schema. |
| `soldOriginalWording` — approved sentence | You may not write your own claim about where a sold work now is. |

Anything not in that file and not in the codebase **does not exist**. Never publish
an invented edition number, remaining count, price, paper name, lab name, lead time,
review, rating or availability.

## 2. VERIFIED PROJECT FACTS

These were verified in the actual repo. **Do not spend a discovery phase
re-deriving them.** Confirm them with the five commands in 2.9 and move on.

**2.1 Stack.** Next.js `14.2.35`, App Router. React `18.3.1`. TypeScript `5.5.4`
(strict — check `tsconfig.json`). Tailwind CSS `3.4.7` with `tailwind.config.ts`.
Package manager: **npm** (`package-lock.json`). Scripts available:
`npm run dev | build | start | lint | typecheck`.

**2.2 Dependencies are deliberately minimal.** Runtime dependencies are exactly
three: `next`, `react`, `react-dom`. Everything else is a devDependency. **Adding an
npm dependency is a decision that must be justified in writing and kept to zero if at
all possible.** The Upstash integration (2.6) is written over `fetch` specifically to
avoid a dependency — follow that precedent.

**2.3 Routing.** All public pages live under the route group `src/app/(site)/`.
Existing routes: `/`, `/about`, `/portfolio`, `/available`, `/sold`, `/collections`,
`/collections/[slug]`, `/artwork/[slug]`, `/mockups`, `/mockups/[slug]`, `/blog`,
`/blog/[slug]`, `/commission`, `/framing`, `/installation-guide`, `/shipping`,
`/faq`, `/contact`, `/privacy`, `/terms`, `/trade`, `/trade/interior-designers`,
`/trade/art-consultants`, `/trade/buyers-agents`, `/trade/corporate`. Admin at
`/admin`. Follow these conventions exactly — new routes go in `(site)`.

**2.4 Content data layer.** There is **no CMS and no database for content**. All
content is typed TypeScript modules in `src/data/`:
`types.ts` (all interfaces), `artworks.ts`, `collections.ts`, `mockups.ts`,
`blog.ts`, `programs.ts`, `pairs.ts`. Helper logic is in `src/lib/data.ts`.
The `Artwork` interface already carries: `id, slug, title, inventoryId, year, medium,
widthCm, heightCm, depthCm, widthIn, heightIn, depthIn, framed, frameDescription,
edition, registerDescription, inspiration, imageWidth, imageHeight, palette,
collections, primaryCollection, status, price, currency, orientation, story,
shortDescription, seoTitle, metaDescription, image, alt, mockups`.
`Status = 'available' | 'sold' | 'reserved' | 'enquire'`.
**Extend this model; do not create a parallel one.** Add a `PrintEdition` interface to
`src/data/types.ts` and a `src/data/prints.ts` module that references artworks by
slug — never duplicate title, image, dimensions or story into the print data.

**2.5 SEO plumbing already exists — reuse it, do not rebuild it.**
- `src/lib/seo.ts` → `buildMetadata({ title, description, path, image, type, noindex })`
  returns canonical + Open Graph + Twitter. Every new page must use it.
- `src/lib/schema.ts` → `personSchema`, `organizationSchema`, `websiteSchema`,
  `visualArtworkSchema`, and others. Add print schema here, in the same style, using
  the same `abs()` helper and `@id` conventions.
- `src/components/JsonLd.tsx` renders schema. `src/components/Breadcrumbs.tsx`,
  `FAQList.tsx`, `Container.tsx`, `Prose.tsx`, `CtaBand.tsx`, `EmailCapture.tsx`,
  `Gallery.tsx`, `ArtworkCard.tsx`, `EnquiryForm.tsx` all exist — **reuse them.**
- `src/app/sitemap.ts` and `src/app/robots.ts` exist. **New routes must be added to
  `sitemap.ts` or they will not be indexed.** `manifest.ts`, `icon.png`,
  `apple-icon.png` exist.
- Site-wide constants live in `src/site.config.ts` (brand, artist, location, contact,
  URL, default OG image). Read it before hardcoding anything.

**2.6 There is NO ecommerce system. This is the single biggest gap in the old prompt.**
No cart, no checkout, no payment provider, no inventory system, no Stripe/Shopify/
Snipcart dependency. What exists instead:
- `src/app/api/enquiry/route.ts`, `src/app/api/subscribe/route.ts`,
  `src/app/api/admin/update/route.ts`
- `src/lib/store.ts` — a dependency-free Upstash Redis REST store holding `Enquiry`
  and subscriber records, with `storeEnabled` false-safe fallback to console logging
  when env vars are absent.
- `src/lib/mailer.ts`, `src/components/EnquiryForm.tsx`, `src/components/AdminBoard.tsx`.

So: **do not "integrate with the existing commerce architecture" — there isn't one.**
Follow `transactionModel` from Section 1:
- `enquiry` / `reserve` → extend the existing `Enquiry` model with a new
  `EnquiryKind` (e.g. `'print'`) carrying artwork slug, size and edition context.
  Reuse `EnquiryForm`, `saveEnquiry`, the admin board. **No new dependency.**
- `checkout` → this is a new subsystem, not an integration. Before writing code,
  produce a one-page written comparison (hosted payment links vs. an embedded
  provider) covering: dependency cost, PCI surface, AUD + international shipping,
  and — critically — **how edition inventory is decremented atomically so a numbered
  edition cannot oversell.** Get Nick's approval on the approach before building it.

**Whatever the model: build the data layer so remaining-quantity is a single derived
value from one authoritative field. Never display a remaining count you cannot
prove.** If the platform cannot technically prevent overselling, say so plainly in
the completion report rather than implying a guarantee.

**2.7 Pricing has an existing source of truth — respect it.**
`pricing.config.json` at the repo root governs **original** pricing:
`referenceRate: 5400` AUD per 1.0 m², `sizeExponent: 0.767`
(price = rate × area_m² ^ 0.767 — doubling area multiplies price by ~1.70),
`premiumSupportUplift: 0.10` for linen, `roundTo: 50`, `currency: "AUD"`,
`priceSoldWorks: false` (sold works carry no price — showing a modelled price for a
sold work would be presenting a fabricated figure; **apply the same principle to
sold-out editions**). Scripts `scripts/apply-pricing-model.py` and
`scripts/sync-register.py` regenerate from it.

Print prices must come from `docs/prints-decisions.md`. **Do not derive print prices
from the original-artwork formula** — it models unique works, not editions. If a
formula is agreed, put it in `pricing.config.json` alongside the existing keys, in the
same commented style, so there remains one pricing source of truth.

**2.8 An established house rule you must honour: proportional gallery scale.**
Gallery grids draw each painting at true relative size — size metric is the geometric
mean `sqrt(w*h)` in cm, normalised against the largest work, compressed with
`SCALE_EXPONENT = 0.5`. Lives in `src/lib/data.ts` (`displayScale`, `stageWidth`,
`cardSizes`), `ArtworkCard.tsx`, `Gallery.tsx` (`toScaleNote`). Print cards showing
multiple sizes must not silently break this convention: either route through
`Gallery` or state explicitly in the completion report why a different treatment is
correct for prints (a defensible reason: print sizes are chosen by the collector, so
the card should show the artwork, not a size claim).

**2.9 Verify in five commands, then stop verifying.**

```bash
cat src/site.config.ts
sed -n '1,80p' src/lib/data.ts
sed -n '1,60p' src/app/sitemap.ts
grep -rn "next/image\|<img" src/components | head -20
sed -n '1,40p' src/app/\(site\)/artwork/\[slug\]/page.tsx
```

That is your discovery phase. Report findings in **under 200 words**, then build.

**2.10 Environment caveats.**
- A full `next build` has previously been attempted on a mounted Windows filesystem
  inside a Linux VM and did not reach the compile step in 15+ minutes. If you are
  running natively on Windows this does not apply — run the build. If a build genuinely
  cannot complete in your environment, say so explicitly in the report; do not claim
  the build passed.
- Do not run `git` commands against this repo through a remote/mounted bridge —
  it leaves lock files that cannot be removed. Stage the work and hand commits to
  Nick unless you are running natively on his machine.

## 3. HARD RULES

**R1 — Do not lose the thread.** Rule 0.1's checklist file, updated every phase. Do
not abandon earlier items when new work appears. Do not restart. Do not re-analyse
completed work.

**R2 — Do not refactor beyond the feature.** No framework changes, no global style
changes, no rewriting unrelated components or pages, no removing functionality, no
new dependencies (see 2.2). If an existing system genuinely blocks correct
implementation, write `PROBLEM → WHY IT MATTERS → MINIMUM SAFE FIX` into the
checklist file, implement the minimum safe fix, and continue.

**R3 — Reuse before you write.** Section 2.5 lists what already exists. A new
component is justified only when nothing existing fits.

**R4 — One source of truth.** Print data lives in `src/data/prints.ts` typed by
`src/data/types.ts`. No duplicated edition/price/spec strings across components.
Adding a print must be a data edit, never a component edit.

**R5 — Never invent collector information.** Section 1's list. Where a value is
genuinely unknown, use the literal token `TODO_CONFIRM` in the data file and make the
UI render nothing rather than a guess. Add a check to the checklist: no
`TODO_CONFIRM` may reach a rendered page.

**R6 — Never state a benefit you cannot substantiate.** No "museum quality" without a
named paper and process. No lightfastness or archival-life claim without the
manufacturer's figure. No review, rating or scarcity signal that is not literally
true.

## 4. DESIGN INTEGRATION

Study the existing Ritushka design language before writing markup: colour palette,
type scale and heading hierarchy, spacing rhythm, image treatment, buttons,
navigation, card design, mobile behaviour (`src/styles/`, `tailwind.config.ts`,
`(site)/layout.tsx`, `Header.tsx`, `Footer.tsx`, an existing artwork page).

The prints section must read as native to the site — minimal, editorial, calm,
spacious, gallery-quality, collector-focused. No loud sales banners, countdown
timers, discount language, bright ecommerce buttons, urgency tactics, busy grids or
marketplace aesthetics. **Urgency comes only from genuine edition scarcity.**

## 5. DATA ARCHITECTURE

In `src/data/types.ts`, add interfaces supporting, per edition:
artwork reference (slug — not a copy), edition type, total edition size, edition
policy, sizes (`widthCm`, `heightCm`, `price`, `currency`, `availability`, `sku`,
optional framed dimensions), print specification (process, paper, ink), signing,
certificate, availability, original-artwork relationship (status + URL), and
per-page SEO fields. Design it so adding an edition is one object in
`src/data/prints.ts`. Derive everything derivable (imperial sizes, aspect ratio,
remaining count, "from" price) in `src/lib/` — never store it twice.

## 6. COLLECTION PAGE — `/limited-edition-prints`

Sections, in order: hero (heading, restrained supporting copy, immediate signal of
art/scarcity/quality); short introduction positioning these as fixed editions on
archival materials, not reproductions; the print grid (image, title, limited-edition
designation, size range, edition information, "from" price, single CTA — the artwork
carries the card, not the metadata); collector experience (edition structure,
archival printing, materials, signing, numbering, COA); size guidance, using the
approved size names only; "why a print" — **never framed as "for people who cannot
afford an original"**, and never as an inferior substitute; the edition promise
(sizes fixed, editions finite, prints numbered, editions never quietly expanded,
sold-out stays sold out); original vs. print, positioned as two different collecting
experiences, neither demeaned; FAQ via `FAQList.tsx`, answers consistent with
`docs/prints-decisions.md` only; a restrained closing CTA.

## 7. PRODUCT PAGE — `/limited-edition-prints/[slug]`

Priority order: **artwork → story → collector information → size selection →
purchase.** The artwork is the hero and must not be buried under controls.

Include: large optimised hero image (respect `imageWidth`/`imageHeight` for correct
aspect ratio and zero layout shift); title, artist, collection, limited-edition
designation; edition information displayed only from real data, with the `n / N`
notation explained; size selection showing dimensions, price and availability per
size — the collector never calculates a size themselves; scale context only if
mathematically accurate (**no inaccurate room mockups** — the existing
`src/data/mockups.ts` system is artwork-specific and must not be repurposed to imply
a print size it does not depict); print specification without jargon overload; the
purchase or enquiry section per `transactionModel`, clear and premium, with genuine
availability only; a link to the original artwork page, using the approved wording
when the original is sold and only when factually correct; a small curated set of
related editions — not a marketplace "you may also like".

## 8. SEO

Every page uses `buildMetadata` (2.5). Add print schema to `src/lib/schema.ts`:
`Product` + `Offer` (with real `price`, `priceCurrency: "AUD"`, `availability`,
`priceValidUntil` where applicable), `BreadcrumbList`, `FAQPage`, linked to the
existing `@id` graph (`/#person`, `/#organization`, `/#website`). Where a print
depicts an existing work, express the relationship to the `VisualArtwork` node rather
than duplicating it. **No fake reviews, ratings, prices or availability — validate
the output.** Add all new routes to `src/app/sitemap.ts`. Internal links: from the
relevant artwork pages, the collections index, the homepage and primary navigation —
enough to be crawlable, not enough to be spammy. Image SEO: descriptive filenames,
accurate alt text derived from the artwork, responsive sizing, no layout shift.

Also optimise for AI answer engines the way the rest of the site does: clear heading
hierarchy, self-contained factual paragraphs, entity-consistent naming
(artist name, work titles, `inventoryId`), and FAQ answers that stand alone when
quoted out of context.

## 9. ACCESSIBILITY

Keyboard navigation and visible focus states throughout; size selection operable by
keyboard and announced correctly (real radio semantics, not styled divs); labelled
form controls; accessible accordion for FAQ; colour contrast; correct heading
hierarchy; meaningful alt text. Accessibility is not traded for aesthetics.

## 10. PERFORMANCE

Do not lazy-load the hero artwork. Correct responsive image sizing. Explicit
dimensions everywhere to protect CLS. Minimal client JavaScript — prefer server
components; make only the size selector interactive. No new dependencies (2.2).

## 11. RESPONSIVE

Mobile, tablet, laptop, large desktop. Particular attention to artwork presentation
and aspect ratios, size selection, navigation, text wrapping and CTA visibility. The
mobile experience must be deliberately designed, not a compressed desktop.

## 12. QA — RUN THESE, DO NOT ASSERT THEM

```bash
npm run typecheck
npm run lint
npm run build      # see 2.10 caveat — report honestly if it cannot complete
```

Then verify: every new route loads; every link resolves; size selection updates price
and availability; sold-out behaviour is correct; no `TODO_CONFIRM` reaches a rendered
page; schema validates; canonicals and metadata are present; sitemap includes the new
routes; heading hierarchy is correct; keyboard navigation works; existing pages are
visually and functionally unchanged. Fix every error this work introduced.

## 13. FINAL REVIEW

Answer each, in one line, honestly: Does this reinforce the prestige of the
originals? Do the prints read as genuinely collectible? Does it feel like a gallery
rather than a shop? Is edition information clear and trustworthy? Can a new edition be
added by editing data alone? Is every collector-facing number traceable to
`docs/prints-decisions.md` or the codebase? Does mobile work properly? Are images and
JS optimised? Can search engines and AI assistants understand the collection?

## 14. COMPLETION REPORT

Use exactly this structure:

```
RITUSHKA LIMITED EDITION PRINTS — IMPLEMENTATION COMPLETE
1. WHAT WAS BUILT
2. FILES CREATED
3. FILES MODIFIED
4. DATA STRUCTURE — where print editions are managed
5. HOW TO ADD A NEW PRINT — exact steps, written for a non-developer
6. TRANSACTION STATUS — what works, what needs configuration (env vars,
   print lab, payment), and any limitation the platform cannot enforce
7. TESTING COMPLETED — typecheck / lint / build / responsive / accessibility,
   with actual results, including anything that could not be run
8. BLOCKERS AND REMAINING CONFIGURATION — genuine items only
```

## 15. YOU ARE NOT FINISHED UNTIL

The code exists in the repo; the routes work; the feature uses the existing
architecture; `npm run typecheck` and `npm run lint` pass; the build has been run or
its failure honestly reported; `docs/prints-implementation-checklist.md` shows every
item COMPLETE or BLOCKED with a stated next action; and no invented collector fact
appears anywhere in the output.

**END OF PROMPT B**

---
---

# PROMPT A — RESEARCH AND DECIDE (run first, only if Section 1 is unfilled)

Do not write any application code in this prompt. The deliverable is one file:
`docs/prints-decisions.md`.

You are advising a Sydney-based contemporary abstract landscape and seascape painter
launching a limited edition fine art print programme. Her position, from the completed
Stage-4/Stage-5 pricing work in `Australian Art Pricing Research/`: sells direct via
her own website, to interior designers and trade, and through works placed in physical
retail spaces — **not** through marketplaces. No gallery representation, no captured
awards or exhibition record. Materials are gallery-grade including Belgian linen.
Inventory is 39 works, 0.20–2.16 m². Original pricing is model-driven at A$5,400 per
1.0 m² with a 0.767 size exponent (`pricing.config.json`).

Research and recommend, with a stated recommendation and the reasoning behind each:

1. **Edition strategy** — edition size, whether editions are per-artwork or per-size,
   whether artist proofs exist, and whether an edition is retired when the original
   sells. Ground this in what comparable artists at her tier actually publish.
2. **Print sizes** — respecting each work's true aspect ratio, and the specific
   question of whether prints may exceed the original's dimensions.
3. **Pricing** — as a percentage of original value or as an absolute band, with
   margin checked against real Australian fine-art printing costs and her stated
   A$60/hr floor. Show the arithmetic.
4. **Production specification** — printing process, specific papers with manufacturer
   names, ink system, and realistic Australian fine-art print suppliers.
5. **Signing and authentication** — signing location, numbering convention,
   certificate content and issuer.
6. **Original artwork protection** — how the print programme is structured so it
   raises rather than dilutes original value.
7. **Fulfilment** — rolled vs flat, framing offered or not, lead times, domestic and
   international shipping.
8. **Transaction model** — enquiry, reservation, or full checkout, given that the site
   currently has **no ecommerce system** (three runtime dependencies, enquiry-only).

**Research rules:**
- Prefer primary sources: the artist's own site, the print lab's own specifications,
  the paper manufacturer's datasheet. Cite the URL for every figure.
- Distinguish **asking price** from **achieved price** and say which you have. Never
  present an estimate as a clearing price.
- Never quote a pooled median across incompatible sales channels — the existing
  pricing audit found the market is bimodal and that pooling underprices her by
  roughly two-thirds.
- Mark every number `[verified: source]` or `[estimate: basis]`. Anything you cannot
  source stays out.
- Note where sources conflict rather than averaging them away.

**Output format** — `docs/prints-decisions.md`, one section per field in Prompt B's
Section 1 table, each with: the recommendation, the reasoning, the evidence, and a
`STATUS: PROPOSED` line. Nick changes each to `STATUS: APPROVED` before Prompt B runs.
Finish with a short list of the decisions you are least confident in and what evidence
would settle them.

**END OF PROMPT A**
