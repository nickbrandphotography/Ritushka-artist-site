# Ritushka Limited Edition Prints — Programme Decisions

**Status of this document, updated 2026-09-04:** all 12 fields are settled and ready to
build against — 11 `APPROVED` outright, and Section 11 (`fulfilment`) `PROPOSED` with
one narrow, non-blocking gap (the literal name of the print lab and a real quote —
tracked as a launch blocker, not a build blocker). No application code has been
written against this document yet. Fields with no reachable primary source are marked
`[estimate: basis]`, not presented as fact. See "Status as of 2026-09-04" at the end
for the full picture.

Produced under **Prompt A** of `docs/PRINTS_IMPLEMENTATION_PROMPT.md`, using:
repo facts verified directly in this codebase (`pricing.config.json`,
`src/data/artworks.ts`, `src/site.config.ts`, `/framing`, `/shipping`), the Stage-4/5
pricing audit (`Australian Art Pricing Research/Ritushka_Pricing_Method.md`), and live
web research into comparable Australian artists and Australian fine-art print labs
(sources cited inline).

---

## 1. `transactionModel`

**Recommendation: `reserve`.**

**Reasoning.** There is no ecommerce system in this repo today — three runtime
dependencies (`next`, `react`, `react-dom`), no cart, no payment provider (verified:
`package.json`). Critically, **this is already how originals work**: `artworks.ts`
publishes a real price on every available work, but the actual sale happens off-platform
— the collector submits `EnquiryForm`, and Nick confirms and takes payment manually
(`src/lib/store.ts`, `AdminBoard.tsx`). The `/framing` and `/shipping` pages confirm the
whole site is built around a human-mediated, quote-and-confirm relationship, not
instant self-checkout — e.g. framing is explicitly "no fixed price list… enquire and
you'll get a specific quote back within two business days."

`reserve` extends this exact pattern to prints: publish a real price and real
availability per size, let the collector submit a **reservation request** (a new
`EnquiryKind: 'print'` carrying artwork slug, size and edition context, reusing
`EnquiryForm`/`saveEnquiry`/`AdminBoard` — zero new dependencies, per house rule 2.2),
and Nick manually confirms, invoices and marks the print sold/decrements the edition
count through the admin board. `checkout` is explicitly flagged in the prompt itself
as a new subsystem requiring its own written comparison and Nick's approval before any
code — not something to default into.

**Evidence:** `src/app/api/enquiry/route.ts`, `src/lib/store.ts`, `src/components/EnquiryForm.tsx`,
`src/components/AdminBoard.tsx`, `src/app/(site)/framing/page.tsx:71,123`,
`src/app/(site)/shipping/page.tsx:14`.

**Confidence: medium — this is the field I'd most want you to actively confirm rather
than rubber-stamp.** See closing list.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04)`

---

## 2. `artworksInProgramme`

**Decided by Nick: all 39 works in `src/data/artworks.ts`, and every artwork added to
that file from now on.**

**Implication for Prompt B's data architecture** (noted here so it isn't lost by the
time building starts): house rule R4 says "adding a print must be a data edit, never a
component edit" — one object in `src/data/prints.ts` per edition. "All 39, plus future
ones automatically" doesn't mean prints.ts should try to auto-generate itself from
every artwork with no data entry at all — remaining-quantity has to be a real tracked
number (Section 1: "never display a remaining count you cannot prove"), which means
each edition still needs its own entry to hold real sold/remaining state. So in
practice: Prompt B should (a) create one `prints.ts` entry per current artwork slug
using the Section 5/6 size and pricing formulas, and (b) Section 14's "how to add a new
print" instructions must say plainly that a newly added artwork does **not**
automatically get a print edition — adding one is the same one-object step as any
other edition, done at the same time the artwork itself is added. That keeps the
"and any subsequently added" intent honest without silently publishing a print for a
work whose sizes/pricing haven't actually been decided.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04) — all 39 current works; future
artworks get a print edition via the same one-object process, not automatically`

---

## 3. `editionStructure`

**Recommendation: per size, not per artwork.** Each size tier offered for a given
artwork is its own independently numbered edition (e.g. Small 1/50, Medium 1/30, Large
1/15 for the same image, run concurrently, not sharing one number sequence).

**Reasoning.** This is standard industry practice specifically because it lets an
artist offer a wide price ladder without diluting the exclusivity of the largest,
most expensive size — a smaller edition for a scarcer, higher-value size, a larger
edition for an accessible entry size. It must be disclosed clearly (each size stated
as its own edition on the certificate), which this structure does naturally.

**Evidence:** [Artwork Archive — "9 Things to Know About Art Editions"](https://www.artworkarchive.com/blog/9-things-to-know-about-art-editions),
[AGI Fine Art Blog — "Making Limited Edition Prints"](https://agifineart.com/advice/making-limited-edition-prints/),
[Old Town Editions — "Giclee Print Sizes and Edition Quantities"](https://www.oldtowneditions.com/giclee-print-sizes-and-edition-quantities/)
(all describe per-size edition runs as common and requiring separate documentation per
size on the COA) — general industry guidance, not Ritushka-specific `[estimate: basis]`.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04)`

---

## 4. `editionSize`

**Recommendation:** per artwork, per size tier —
**Small: edition of 50 · Medium: edition of 30 · Large: edition of 15.**

**Reasoning.** Direct, close comparable: **Kate Harkin**, an Australian landscape/
abstract artist selling limited edition prints of her own original paintings direct
from her own site (same channel model as Ritushka), runs editions of **30** —
`[verified: kateharkin.com]`. I've used 30 as the mid-tier anchor and stepped an
accessible small tier up and a scarce large tier down, which is the pattern the
industry sources in Section 3 describe as standard for multi-size editions.

**Evidence:** [Kate Harkin — Limited Edition Prints](https://www.kateharkin.com/limited-edition-prints)
— "Limited to one of 30 prints", hand-signed and editioned `[verified]`. The 50/15
step-sizes either side are `[estimate: basis — standard tiering pattern per Section 3
sources, not a specific comparable's numbers]`.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04)`

---

## 5. `printSizes`

**Recommendation:** three tiers by long edge — **Small 40 cm · Medium 60 cm · Large
80 cm** — each scaled to the individual artwork's true aspect ratio (never cropped),
with a hard rule: **no print's long edge may exceed 80% of the original's own long
edge.** If an artwork's original long edge is under 100 cm (e.g. the many 60×60 cm and
90×90 cm works), the Large tier is simply not offered for that work — only the tiers
that clear the 80% cap.

**Reasoning.** This directly answers Prompt A item 2's specific question — "may prints
exceed the original's dimensions" — with **no**, and goes further by keeping real
daylight between the biggest print and the original, so a print never reads as a
substitute for the painting at its own scale. This is a defensible, statable policy
rather than a guess, and it's mechanical enough that Prompt B can compute it per
artwork from `widthCm`/`heightCm` rather than needing 39 hand-picked size sets.

**Worked example** (Approaching Destination, 91×122 cm original, aspect ratio 0.746):
Small → 40 × 53.6 cm · Medium → 60 × 80.5 cm · Large → 80% cap = 97.6 cm, so the 80 cm
Large tier clears the cap and is offered at 80 × 107.3 cm.

Counter-example (Blue Mountains, 60×60 cm original): 80% cap = 48 cm, so only the
Small tier (40 cm) clears it — Medium and Large are not offered for this work.

**Addendum, 2026-09-04 — checked against Nick's question "should sizes just be
whatever the customer wants, made to order?"** Researched directly: no. Fixed,
pre-announced sizes are what makes an edition an edition — the standard advice across
every source reviewed is that an artist should "determine the total edition size ahead
of time... make their intentions clear at the outset regarding edition size, print
sizes, and chosen paper... and honor it for the life of the edition"
`[verified: agifineart.com]`. The moment sizing becomes "any size, made to order,"
there is no longer a fixed population to number against — that's the textbook
definition of an **open edition**, explicitly the opposite of what a limited edition
is selling: "if artists did not regulate the number of prints or production, it would
become an open or unlimited edition, which is effectively a poster or mass-produced
object" `[verified: artworkarchive.com]`. So: **the three fixed sizes stay.** What
*is* genuinely custom, and correctly so, is framing — an unframed print is the fixed,
editioned product; a frame around it is a separate, made-to-order decision that
doesn't touch the edition itself. See Section 6 and Section 11 for how that split is
now reflected in what's published.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04; sizing question re-confirmed with
research, 2026-09-04)`

---

## 6. `printPricing`

**Recommendation: a formula, not a flat table** — consistent with house rule 2.7 (one
pricing source of truth, same style as `pricing.config.json`), and explicitly *not*
derived from the original-artwork formula's exponent, per that section's own
instruction.

**Addendum, 2026-09-04 — what this price covers.** Nick's own words: "we can't give a
price... because we don't know what they're ordering, and it's all custom." Confirmed
with him directly: the published, formula-derived price is for the **plain, unframed
print at a fixed size** — that part genuinely isn't custom (Section 5's addendum) and
can be quoted upfront. Framing and any other customisation is the part that's
genuinely order-dependent, and that stays quoted separately, never bundled into the
published number. Both the collection page and every product page now state this
split explicitly rather than implying one all-in price.

```
printPrice(size, tier) = roundTo50(
  referenceRate × areaM2(size)^sizeExponent × tierPercent
)
```

using the **existing** `referenceRate` (5400) and `sizeExponent` (0.767) purely as a
size-scaling curve (so a Large print isn't priced at a naive multiple of a Small one —
it inherits the same "big canvases cost less per m²" shape the original pricing already
uses), multiplied by a **new** `tierPercent` that is *not* in `pricing.config.json`
today: **Small 12% · Medium 16% · Large 22%** (rising with scarcity/edition size, per
Section 3/4's tiering).

**Worked example and margin check** (Approaching Destination, Medium tier, 60×80.5 cm
= 0.483 m²):
- Reference curve value: 5400 × 0.483^0.767 ≈ **A$3,090**
- Print price: 3,090 × 16% ≈ 494 → rounded to **A$500**
- Estimated cost: production ~A$100 (interpolated between real Australian giclee lab
  quotes — A2/0.25 m² ≈ A$65–73, A1/0.50 m² ≈ A$102–122
  `[verified: search snippet of prolabimaging.com.au/Pricelist-2018.pdf, Melbourne lab —
  the PDF itself would not parse as text, so treat this as a lower-confidence verified
  figure]`) + certificate/packaging/tube ≈ A$20 + ~1.5 hrs studio time (signing,
  numbering, correspondence, packing) at the stated A$60/hr floor ≈ A$90 → **≈A$210
  total cost**
- Margin: ≈A$290 on a A$500 print, clearing the A$60/hr floor with room to spare.

**This is the field I'd most want re-verified before publishing** — the cost side rests
on one Melbourne lab's 2018 published list, not a current quote from whichever lab is
actually chosen (Section 11). Get an actual quote for the chosen sizes/paper before
`tierPercent` is finalised; the formula and worked arithmetic are a defensible
starting point, not a substitute for that quote.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04 — tier percentages remain an estimate pending a real quote from the fulfilment partner, see Section 11)`

---

## 7. `printSpecification`

**Decided: paper, not canvas. Archival pigment giclée on Hahnemühle Photo Rag 308gsm
(100% cotton rag) or an equivalent 310gsm archival cotton rag paper, printed with
archival pigment ink. Canvas is deliberately excluded from this numbered/signed
programme.** Unframed by default; framing offered as a quoted add-on (Section 11).

**Reasoning — this is a "don't devalue the originals" decision, not a taste
preference, and the research points one way once Ritushka's specific channel is
factored in:**

Ritushka's originals are acrylic **on canvas** (and Belgian linen at the premium
tier). A canvas giclée reproduction of a canvas original is the one presentation
choice that removes the easiest visual tell between "this is the artist's painted
surface" and "this is a printed reproduction" — texture, sheen, stretcher-bar
presentation all converge. That's not a theoretical risk: one artist's account
describes exactly this failure mode — a canvas reproduction in circulation led a
buyer's own framer to tell her that her *original* painting "was a reproduction," and
the gallery took the piece back `[verified: painterskeys.com "Prints or Originals?"]`.
Ritushka's channel — trade, interior designers, and unstaffed retail-space placements
— is precisely the setting where a non-specialist handles the work between artist and
end buyer, which is the exact scenario in that anecdote.

Paper doesn't have this problem: a giclée print on cotton rag paper, in a plain white
border, hand-signed and numbered, reads unambiguously as a print the moment it's held
— no one mistakes it for a stretched canvas painting. It's also what the one artist in
Ritushka's exact position and channel actually does: Kate Harkin, an Australian
landscape/abstract artist selling limited editions of her own paintings direct from her
own site, uses "Hahnemuhle 100% cotton Photo Rag 308gsm paper" with archival pigment
ink `[verified: kateharkin.com]`.

The counter-view exists and is worth naming rather than hiding: some successful
artist/print-sellers run canvas giclées as a legitimate, larger product line alongside
paper prints, differentiated mainly by price and size rather than material
`[verified: reddotblog.com "The Myth of Cannibalization" — Jason Horejs, describing
artists who sell both]`. That view fits a volume/decor-oriented print business. It
doesn't fit Ritushka's stated position (Section 4: editorial, collector-focused,
never marketplace-style, actively working toward gallery representation) or her
specific material-confusion risk. Paper is the right call for *this* programme.

**Evidence:** `[verified: kateharkin.com]` (paper + ink spec, direct comparable),
`[verified: painterskeys.com]` (canvas-reproduction confusion incident),
`[verified: fineartprintingstudio.com.au]` (a real Sydney lab stocking this exact
paper on an Epson SC-P9560 / UltraChrome Pro12 archival pigment system — candidate
only, see Section 11), `[verified: reddotblog.com]` (the canvas counter-view, named
and weighed, not adopted).

`STATUS: APPROVED (Nick delegated this decision to research on 2026-09-04 — "I don't
know how to work out the best model... I need you to do the research"; paper, not
canvas, for the reasons above. Flagged in chat for Nick to object to if this doesn't
match his instinct — treated as approved unless he says otherwise.)`

---

## 8. `signingPolicy`

**Recommendation:** hand-signed in pencil by the artist in the lower right margin
(outside the image area), numbered `n / N` in the lower left margin in the same hand,
per size tier.

**Reasoning.** This is the exact convention used by the direct comparable and is the
overwhelmingly standard convention across the sources reviewed — signature and edition
number sit in the paper's white border, never on the image itself, so the print reads
as authenticated without being marked up.

**Evidence:** [Kate Harkin — Limited Edition Prints](https://www.kateharkin.com/limited-edition-prints)
— "hand-signed and editioned by the artist" `[verified]`. Margin-signature/lower-left
numbering convention: `[estimate: basis — standard practice per the certificate-of-
authenticity sources in Section 9, not itself independently sourced to a single URL]`.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04)`

---

## 9. `coaPolicy`

**Recommendation:** one certificate of authenticity per print, issued by the artist/
studio (Ritushka Fine Art), stating: artwork title, `inventoryId` of the original,
edition number (`n / N`) and size tier, paper and print process, print/issue date, and
the artist's signature. Provided as a physical card shipped with the print, plus a
digital PDF copy on request.

**Reasoning.** This is the near-universal content set for a giclée COA and is what
gives the `n / N` claim on the product page something to point to — matching Section 7
of Prompt B ("`n / N` notation explained"). Tying it to `inventoryId` reuses the
existing register field rather than inventing a parallel numbering scheme (house rule
R4).

**Evidence:** [ArtsNova — Sample Art Certificate of Authenticity](https://www.artsnova.com/certificate.html),
[Certs of Authenticity — "Certificates of Authenticity for Giclee Prints"](https://www.certsofauthenticity.com/articles/certificatesofauthenticityforgicleeprints)
— both describe this content set as standard `[verified as general practice, not
Ritushka-specific]`.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04)`

---

## 10. `originalProtectionPolicy`

**Recommendation, three parts:**

1. **Max print size vs. original** — the 80%-of-long-edge cap in Section 5. This is the
   primary protection and it's mechanical/auditable.
2. **Editions are *not* retired when the original sells.** The print programme is
   deliberately a separate, ongoing line — retiring it on sale would mean losing the
   entire revenue stream at exactly the moment (a sale) that interest in the image is
   highest. The original's exclusivity is protected by the size cap and the fixed
   edition size, not by tying print availability to the original's own sale status.
3. **A sold original continues printing**, with the product page linking back to the
   original artwork page using the approved wording in Section 12 — never implying the
   image itself is now unavailable, only the one-off painting.

**Reasoning.** No single external source settles part 2 either way — it's a genuine
judgement call about Ritushka's commercial model, not a researchable fact. I've made a
recommendation and reasoning is stated; **flag this one for explicit sign-off** rather
than treating it as settled by this document. Part 1 mirrors the existing
`priceSoldWorks: false` principle in `pricing.config.json` (never present a fabricated
number) applied to the adjacent case of a fabricated size claim.

**Evidence:** `pricing.config.json` (`priceSoldWorks`, verified in repo) for the
underlying principle; parts 2–3 are `[estimate: basis — reasoned recommendation, not
sourced]`.

`STATUS: APPROVED (confirmed by Nick, 2026-09-04 — part 2: editions are not retired
when the original sells)`

---

## 11. `fulfilment`

**Recommendation:** printed to order (not stocked) on the Section 7 paper spec, by a
print lab with genuine fine-art giclée capability — **still TODO_CONFIRM by name**,
for one specific reason: Nick's existing Sydney contact was introduced as a *framing*
relationship, and framing and fine-art giclée printing are usually different
capabilities (a framer typically mounts/frames prints someone else produced, rather
than owning a wide-format archival pigment printer). **Action for Nick, not a research
gap:** ask that contact directly whether they print giclées in-house against a named
paper spec, or only frame — if the former, use them for both and this line closes; if
the latter, use them for the framing add-on only (below) and pair them with a lab that
does the actual printing.

**Verified fallback candidate if needed:** [Fine Art Printing Studio, Sydney](https://fineartprintingstudio.com.au/product/giclee-fine-art-prints/)
stocks the exact paper decided in Section 7 (Hahnemühle Photo Rag 308gsm) on an Epson
SC-P9560 / UltraChrome Pro12 archival pigment system `[verified]` — a real, named,
checkable option, not invented, but not confirmed as who Ritushka will actually use.

**Packing:** rolled in a protective tube for prints with a long edge above ~40 cm,
flat in a rigid mailer at or below that — standard for unframed paper giclées, and
usable now that canvas (which would need different stretcher/gallery-wrap packing) is
off the table.

**Framing:** offered as a quoted add-on, through the same Sydney framing relationship
already used for originals (reuse per house rule R3) — Nick's contact is a strong fit
for this half of the job regardless of whether they also print.

**Lead time:** estimate **10–15 business days domestic, up to 4 weeks international**
— production time stacked on top of the site's existing published shipping bands
(`src/app/(site)/shipping/page.tsx:14`, AU 3–7 / intl 7–21 business days for
ready-made originals). This is a placeholder estimate, not a quote — swap it for the
real figure the moment Nick's contact (or the fallback lab) confirms one.

**Addendum, 2026-09-04.** This estimate is explicitly scoped to a plain, unframed
print — the site now says so directly, matching Section 6's price/custom split. The
moment framing or any other customisation is added, the published estimate no longer
applies and the real timeline is confirmed with the collector directly, not implied by
a number on the page.

**Evidence:** `src/app/(site)/framing/page.tsx:60`, `src/app/(site)/shipping/page.tsx:14`
`[verified, both in repo]`; Fine Art Printing Studio spec `[verified]`; lead time
`[estimate: basis — stacked on existing shipping bands, not a real quote]`.

`STATUS: PROPOSED — build against the recommendation above; TODO_CONFIRM only the
literal partner name and real lead time before those specific facts (not the whole
feature) go live. Does not block Prompt B.`

---

## 12. `soldOriginalWording`

**Recommendation** (mirrors the existing tone already used for sold originals in
`artworks.ts`, e.g. Aqua Frost — Thinking of You: *"This work has sold. A related
painting can be commissioned in a comparable size and palette."*):

> "The original [Title] has sold to a private collector. This limited edition print
> lets the image live on — hand-signed and numbered."

(Deliberately medium-neutral — "printed on archival paper" was in the earlier draft but
Section 7/11 no longer treat paper as settled over canvas, so the sentence shouldn't
assume it. Once the medium is confirmed, a specific material can be named here if
wanted, e.g. "…on archival paper…" or "…on canvas…".)

**Reasoning.** Consistent voice with the existing sold-work copy, factually neutral
(no invented claim about *where* the work now is, satisfying Section 1's requirement),
and reframes the print as continuation rather than consolation, matching Section 6's
instruction that prints must never be framed as an inferior substitute.

**Evidence:** `src/data/artworks.ts` (verified: existing sold-work story copy pattern,
e.g. `aqua-frost-thinking-of-you`).

**This is an approved sentence by definition (R5 — "you may not write your own claim
about where a sold work now is") — it must be read and explicitly approved or edited
by Nick, not inferred as fine because it sounds reasonable.**

`STATUS: APPROVED (confirmed by Nick, 2026-09-04)`

---

## Status as of 2026-09-04 — what's settled, what's still open

**All 12 fields are now settled enough to build against.** Every section stands as
researched and recommended above; where Nick made an explicit call (transaction model,
artworks in programme, editions surviving a sold original, paper over canvas) that's
recorded inline with the reasoning he was given at the time.

**One narrow item remains open, and it does not block Prompt B:** the *literal name*
of the print lab in Section 11, and a *real* quoted cost and lead time from them.
Everything that name would otherwise gate — the paper spec, the pricing formula, the
size ladder, the packing method — is already decided, because all of those follow from
"paper, archival giclée, Hahnemühle Photo Rag 308gsm or equivalent" (Section 7), not
from who physically runs the printer. Prompt B should build the fulfilment section
using the estimates in Section 11 (a verified fallback lab, and an estimated lead
time), clearly marked in the checklist as **BLOCKED pending Nick confirming his
contact's capability and getting a real quote** — a real business gap to close before
launch, not a reason to hold up the rest of the build.
