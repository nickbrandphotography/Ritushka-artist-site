# Design Specification & Page Wireframes

**Ritushka Studio Profile · 8pp A4 portrait**

---

## 1. Format

| | Digital (primary) | Print |
|---|---|---|
| Trim | 210 × 297 mm (A4) | 210 × 297 mm |
| Pages | 8 | 8 (single section) |
| Orientation | Portrait | Portrait |
| Bleed | none | 3 mm all edges |
| Slug | — | 5 mm, crop + fold marks |
| Colour | sRGB | CMYK (FOGRA39 / ISO Coated v2), rich black **not** used for text |
| Image res | 150 ppi at final size | 300 ppi at final size |
| Target file size | **≤ 2.5 MB** | — |
| PDF standard | PDF 1.7, searchable text, fonts embedded, tagged | PDF/X-4 |
| Binding | — | Saddle-stitch, 2 folded A3 sheets |
| Filename | `Ritushka-Studio-Profile-[Audience]-2026.pdf` | — |

**Why A4 portrait, not landscape.** Landscape reads as a pitch deck. Portrait A4 is what design and procurement teams print, annotate and file. It is also the only format that survives being printed by a recipient's assistant on office stock without looking wrong.

---

## 2. Grid

**12-column grid, portrait A4.**

| Element | Value |
|---|---|
| Left margin | 20 mm |
| Right margin | 20 mm |
| Top margin | 22 mm |
| Bottom margin | 24 mm (deeper than top — optical balance) |
| Live area | 170 × 251 mm |
| Columns | 12 |
| Column width | 10.5 mm |
| Gutter | 4 mm |
| Baseline grid | 4 mm |

Column *x* positions: `x(i) = 20 + 14.5i` mm. Span widths: 3 cols = 39.5 mm · 4 cols = 54 mm · 5 cols = 68.5 mm · 6 cols = 83 mm · 7 cols = 97.5 mm · 8 cols = 112 mm · 12 cols = 170 mm.

**Working column combinations**

- **7 + 5** — the primary asymmetric split. Text left (7 cols, x = 20 mm), spec panel right (5 cols, x = 121.5 mm). Used on pages 2, 3, 6, 7.
- **3 + 8** — numeral/label well plus body. Pages 3 and 6.
- **6 + 6** — twin spec stacks, page 7.
- **12** — full measure for image plates and the closing page.
- **4 / 4 / 4** — three-up image row, page 5 (image width 54 mm each).
- **Full bleed** — cover and page 4 only. Full bleed is a *rare* event; using it exactly twice makes both instances count.

**Rule:** body text never exceeds 7 columns (97.5 mm). At 10.5 pt Lora that is 48–55 characters per line — inside the optimal measure. This is a fluency decision, not a taste one.

---

## 3. Typography

### Specified (ideal) typefaces

| Role | Typeface | Rationale |
|---|---|---|
| Display / wordmark / labels | **Neue Haas Grotesk Display** (or Söhne, or Suisse Int'l) | Neutral, Swiss, non-decorative. The type must not compete with the paintings. |
| Body / editorial | **Lyon Text** (or Freight Text Pro, or Tiempos Text) | Warm transitional serif. Sets long text elegantly at small sizes. |

### Substituted (open licence — used in the supplied PDFs)

| Role | Typeface | Where to get it |
|---|---|---|
| Display / labels | **Lato** — Light, Regular, Semibold | Google Fonts (free, commercial use) |
| Body | **Lora** — Regular, Italic | Google Fonts (free, commercial use) |

Lato/Lora is a legitimate permanent choice, not a placeholder. Only upgrade if you licence the specified set.

### Type scale

| Style | Face | Size | Leading | Tracking | Case |
|---|---|---|---|---|---|
| Wordmark | Lato Light | 15 pt | — | **+340** | UPPER |
| Page label (running head) | Lato Regular | 6.5 pt | 9 pt | +180 | UPPER |
| Section number | Lato Light | 8 pt | — | +120 | — |
| Display headline (p2, p8) | Lora Regular | 27 pt | 32 pt | −8 | Sentence |
| Page headline | Lora Regular | 20 pt | 25 pt | −5 | Sentence |
| Standfirst / lead | Lora Italic | 12.5 pt | 19 pt | 0 | Sentence |
| Body | Lora Regular | 10.5 pt | 16 pt | +2 | Sentence |
| Spec label | Lato Semibold | 7 pt | 11 pt | +140 | UPPER |
| Spec value | Lato Regular | 9.5 pt | 14 pt | 0 | Sentence |
| Caption | Lato Regular | 7.5 pt | 11 pt | +20 | Sentence |
| Footer | Lato Regular | 6.5 pt | — | +120 | UPPER |
| Folio (page no.) | Lato Light | 8 pt | — | 0 | — |

**Never:** bold body text, underlines, more than two weights on a page, justified text, hyphenation, or any type set smaller than 6.5 pt.

**Always:** ranging (old-style) figures in body text where available; lining figures in spec tables.

---

## 4. Colour

| Name | Use | HEX | CMYK | Pantone (nearest) |
|---|---|---|---|---|
| **Ink** | All body and display text | `#14171A` | 78 / 66 / 60 / 72 | Black 6 C |
| **Graphite** | Labels, captions, secondary | `#6E7478` | 55 / 44 / 42 / 8 | Cool Gray 9 C |
| **Paper** | Background | `#FAF9F6` | 2 / 2 / 4 / 0 | — |
| **Rule** | Hairlines, table rules | `#DCD9D2` | 12 / 10 / 14 / 0 | — |
| **Accent — Studio Blue** | One rule, one CTA panel, per page maximum | `#1F3A4D` | 90 / 68 / 45 / 35 | 302 C |

**Five colours. No sixth.** Never black `#000000` — pure black next to a warm paper tone reads as cheap digital output. `#14171A` on `#FAF9F6` gives contrast ratio ≈ 15:1, well past WCAG AAA.

The accent exists to be used **once per page at most**. Its scarcity is what makes it read as considered.

**The paintings supply all the other colour in the document.** This is the whole point.

---

## 5. Imagery

| Rule | Spec |
|---|---|
| Total images | 9–12 across 8 pages |
| Full-bleed instances | Exactly 2 (cover, page 4) |
| Minimum image height | 60 mm — anything smaller reads as a thumbnail and devalues the work |
| Aspect | Never distort. Crop to the grid, never scale non-uniformly |
| Treatment | No drop shadows, no borders, no rounded corners, no frames, no filters |
| Caption position | Directly under image, left-aligned to image left edge, 3 mm gap |
| Caption content | *Title*, year · medium · H × W cm · availability |
| Colour management | Embed sRGB IEC61966-2.1. Soft-proof before print |
| Sharpening | Output-sharpen at final size only |

**Image sequencing rule.** Order images so consecutive works differ in palette temperature. Two cool blue works side by side flatten each other; a warm work between them makes both read stronger.

---

## 6. White space

| Page | Target ink coverage | Notes |
|---|---|---|
| 1 — Cover | ~92% (full bleed) | The exception |
| 2 — At a glance | 45–50% | Densest text page; still 50% air |
| 3 — Why commission | 35% | |
| 4 — Plate | ~100% | Full bleed |
| 5 — Selected works | 55% | |
| 6 — Process | 35% | |
| 7 — Specifications | 50% | |
| 8 — Invitation | **18–22%** | The most empty page in the document, deliberately |

**Document average target: 45–50% white space.** Below 40% it reads as a brochure. Above 60% it reads as pretentious and under-informed.

The closing page is the emptiest by design: confidence is legible as restraint, and the eye has nowhere to go except the one line of the call to action.

---

## 7. Page-by-page wireframe

Each page below specifies: purpose, the reader's emotional state on arrival, psychology, layout, and why it exists.

---

### PAGE 1 — COVER

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                                      │
│         [ FULL-BLEED ARTWORK ]       │
│         portrait crop, 100%          │
│         no overlay, no gradient      │
│                                      │
│                                      │
│                                      │
│  ┌────────────────────────────────┐  │  ← white panel, 170 × 46 mm
│  │  R I T U S H K A               │  │     seated 24 mm from foot
│  │  ────                          │  │
│  │  Studio Profile                │  │
│  │  for Interior Designers        │  │
│  │                    Sydney 2026 │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Purpose:** buy three seconds.
**Reader's state on arrival:** neutral-to-sceptical. They have received artist emails before.
**Psychology:** the cover makes one claim — *this person is serious* — and makes it non-verbally. Processing fluency: a single high-contrast image with one clean typographic panel is maximally easy to process, and that ease transfers to the artwork.
**Image:** one work, portrait crop, strongest palette. Never a collage. Never a logo lockup over the painting.
**Typography:** wordmark 15pt Lato Light at +340 tracking. Nothing else larger than 9.5 pt.
**White space:** the panel is the only air, and it is what makes the image read as art rather than wallpaper.
**CTA:** none.
**Why it exists:** a cover that sells is a cover that gets closed. A cover that is simply beautiful gets turned.

---

### PAGE 2 — AT A GLANCE  ★ *the load-bearing page*

```
┌──────────────────────────────────────┐
│ RITUSHKA          STUDIO PROFILE  02 │  ← running head, hairline under
│                                      │
│  ┌─────────────────┐ ┌────────────┐  │
│  │ 7 columns       │ │ 5 columns  │  │
│  │                 │ │            │  │
│  │ Headline        │ │ AT A GLANCE│  │  ← spec panel, ruled
│  │ 27/32 Lora      │ │ ────────── │  │
│  │                 │ │ SCALE      │  │
│  │ Standfirst      │ │ value      │  │
│  │ 12.5/19 italic  │ │ ────────── │  │
│  │                 │ │ MEDIUM     │  │
│  │ Body ¶1         │ │ value      │  │
│  │ Body ¶2         │ │ ────────── │  │
│  │ Body ¶3         │ │ LEAD TIME  │  │
│  │                 │ │ value      │  │
│  │                 │ │ ────────── │  │
│  │                 │ │ PRICE      │  │
│  │                 │ │ value      │  │
│  │                 │ │ ────────── │  │
│  │                 │ │ DELIVERY   │  │
│  │                 │ │ value      │  │
│  │                 │ │ ────────── │  │
│  │                 │ │ TERMS      │  │
│  │                 │ │ value      │  │
│  └─────────────────┘ └────────────┘  │
│  ────────────────────────────────    │
│  ritushka.com · studio@ritka.net     │
└──────────────────────────────────────┘
```

**Purpose:** survive the six-second scan, alone, with no other page.
**Reader's state:** deciding, right now, whether to keep reading. Attention is at its absolute peak and will not return to this level.
**Psychology:** the spec panel is doing the persuading, not the prose. It converts an aesthetic judgement ("do I like this?") into a supplier judgement ("can this person deliver what my project needs?"). The second question is far easier to answer yes to, and answering it creates commitment.
**Layout:** 7 + 5. The panel is right-hand because Western reading exits right — it is the last thing seen before the page turns.
**Typography:** headline is the only 27 pt on the page. Panel labels 7 pt Lato Semibold caps at +140; values 9.5 pt.
**Image:** none. This page is deliberately image-free — it signals that the document has content, not just pictures.
**White space:** 50%.
**CTA:** none yet. Asking here is premature.
**Why it exists:** because capability-statement research is unambiguous that buyers scan for ~6 seconds and one page must carry the whole case. This is that page. If you only ever send one sheet, send this one.

---

### PAGE 3 — WHY CLIENTS COMMISSION ORIGINAL WORK

```
┌──────────────────────────────────────┐
│ RITUSHKA          STUDIO PROFILE  03 │
│                                      │
│  Headline 20/25                      │
│  ──────                              │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │  01      │  │ 7 cols body      │  │
│  │  Label   │  │                  │  │
│  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────────────┐  │
│  │  02      │  │                  │  │
│  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────────────┐  │
│  │  03      │  │                  │  │
│  └──────────┘  └──────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  [ image, 5 cols × 62 mm ]     │  │
│  └────────────────────────────────┘  │
│  ────────────────────────────────    │
└──────────────────────────────────────┘
```

**Purpose:** give the reader language to justify the decision to someone else.
**Reader's state:** mildly interested, now asking *why would my client pay for this rather than buy a print*.
**Psychology:** decision-makers rarely decide alone. Three numbered, short, concrete reasons are memorable and repeatable — the reader can relay them to a principal or client without re-reading. This page is written to be quoted.
**Layout:** numeral in a 3-col well, body in 7 cols. The numerals create vertical rhythm and let the page be skimmed in ten seconds.
**Typography:** numerals 8 pt Lato Light with a 24 pt figure — deliberately understated; a large numeral would read as infographic.
**White space:** 35%.
**CTA:** none.
**Why it exists:** it is the only page that argues. Everything else describes.

---

### PAGE 4 — PLATE

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│      [ FULL-BLEED ARTWORK ]          │
│      single work, full page          │
│                                      │
│                                      │
│                                      │
│                                      │
│  Title, year · medium · H × W cm     │  ← 7.5pt reversed caption, 18mm from foot
└──────────────────────────────────────┘
```

**Purpose:** let one painting do its work with no interference.
**Reader's state:** has read two pages of argument. Needs relief and needs proof.
**Psychology:** pacing. A document that argues for four straight pages exhausts the reader. A full-bleed image resets attention and — because it arrives *after* the credibility pages rather than before — is now read as evidence rather than decoration.
**Image:** the single strongest work. Landscape works crop well here at full bleed.
**Typography:** one line, reversed out, 7.5 pt. Nothing else.
**CTA:** none.
**Why it exists:** to earn the right to page 5's detail.

---

### PAGE 5 — SELECTED WORKS

```
┌──────────────────────────────────────┐
│ RITUSHKA          STUDIO PROFILE  05 │
│  Headline 20/25                      │
│  ──────                              │
│  Standfirst, 7 cols                  │
│                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ img  │  │ img  │  │ img  │        │  ← 4/4/4, equal height 74 mm
│  └──────┘  └──────┘  └──────┘        │
│  caption   caption   caption         │
│                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ img  │  │ img  │  │ img  │        │
│  └──────┘  └──────┘  └──────┘        │
│  caption   caption   caption         │
│  ────────────────────────────────    │
└──────────────────────────────────────┘
```

**Purpose:** demonstrate range *and* consistency simultaneously.
**Reader's state:** assessing whether there is a body of work or one lucky painting.
**Psychology:** six works is the sweet spot — enough to establish a recognisable hand, few enough to avoid the choice paralysis a 30-image portfolio creates. Uniform image height and identical caption structure make comparison effortless, which is a direct fluency gain.
**Captions carry dimensions and availability** because that is what the buyer is actually reading for.
**White space:** 55%.
**CTA:** none.
**Why it exists:** this page replaces the entire portfolio.

---

### PAGE 6 — HOW A COMMISSION WORKS

```
┌──────────────────────────────────────┐
│ RITUSHKA          STUDIO PROFILE  06 │
│  Headline 20/25                      │
│  ──────                              │
│  Standfirst                          │
│                                      │
│  01 ── Brief            Week 0       │
│      body 2 lines                    │
│  ─────────────────────────────────   │
│  02 ── Concept          Week 1–2     │
│      body 2 lines                    │
│  ─────────────────────────────────   │
│  03 ── Approval         Week 2       │
│  ─────────────────────────────────   │
│  04 ── Studio           Week 3–8     │
│  ─────────────────────────────────   │
│  05 ── Delivery         Week 9–10    │
│  ─────────────────────────────────   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ accent panel: payment terms    │  │  ← Studio Blue, reversed, 170 × 26 mm
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Purpose:** eliminate the fear of an open-ended, uncontrollable process.
**Reader's state:** interested, now anxious. Commissioning an artist feels risky: no fixed date, no approval gate, no recourse.
**Psychology:** the perceived risk of commissioning is not about money, it is about *loss of control on someone else's schedule*. Naming five steps, an approval gate and a week-number for each converts an unbounded risk into a bounded one. The right-aligned week column is doing more selling than the prose.
**Typography:** week numbers in Lato Regular, right-aligned on a common axis — the alignment is what makes it read as a schedule rather than a wish.
**Accent:** the one Studio Blue panel in the document, carrying deposit and balance terms. Money stated plainly is a trust signal.
**White space:** 35%.
**CTA:** none.
**Why it exists:** this is the page that turns interest into an enquiry. It is the second-most-important page after page 2.

---

### PAGE 7 — SPECIFICATIONS

```
┌──────────────────────────────────────┐
│ RITUSHKA          STUDIO PROFILE  07 │
│  Headline 20/25                      │
│  ──────                              │
│                                      │
│  ┌───────────────┐ ┌───────────────┐ │
│  │ THE WORK      │ │ LOGISTICS     │ │  ← two 6-col spec stacks
│  │ ───────────── │ │ ───────────── │ │
│  │ Media         │ │ Packing       │ │
│  │ Surfaces      │ │ Freight       │ │
│  │ Sizes         │ │ Lead time     │ │
│  │ Framing       │ │ Installation  │ │
│  │ Signing       │ │ Documentation │ │
│  │ Editions      │ │ Insurance     │ │
│  └───────────────┘ └───────────────┘ │
│                                      │
│  TRADE TERMS                         │
│  ────────────────────────────────    │
│  short paragraph                     │
│  ────────────────────────────────    │
└──────────────────────────────────────┘
```

**Purpose:** answer, pre-emptively, every operational question that would otherwise become an email — or a silence.
**Reader's state:** now seriously considering. Running an internal checklist: can I insure it, can I freight it, who hangs it, what's the discount.
**Psychology:** unanswered logistics questions do not usually generate an email. They generate a deferral, and deferral is how most art enquiries die. Answering before being asked is also a competence signal — it says *I have done this before*.
**Layout:** two 6-column stacks with hairline rules between rows. Labels 7 pt caps, values 9.5 pt. Scannable in fifteen seconds.
**White space:** 50%.
**CTA:** none.
**Why it exists:** it is the page that removes reasons to say no. Every other page adds reasons to say yes.

---

### PAGE 8 — INVITATION

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                                      │
│                                      │
│   Display headline, 27/32, 7 cols    │
│                                      │
│   Two short paragraphs               │
│                                      │
│                                      │
│                                      │
│   ────────                           │
│   Ritushka                           │
│   Lane Cove, Sydney NSW              │
│   studio@ritka.net                   │
│   +61 403 835 467                    │
│   ritushka.com                       │
│                                 ┌──┐ │
│                                 │QR│ │  ← 22 × 22 mm, bottom right
│                                 └──┘ │
└──────────────────────────────────────┘
```

**Purpose:** one bounded, low-cost, easy-to-accept ask.
**Reader's state:** decided in principle. Now needs the next step to be small enough to take today.
**Psychology:** the "But You Are Free" effect — explicitly acknowledging that the reader may decline reliably increases compliance (meta-analysis of 52 experiments, N = 19,528, g = 0.44), and the effect is *strongest in real-time interaction*, which is exactly what a studio visit is. The ask is also bounded and specific — "send me the project, I'll come back with three works" — rather than the open, unanswerable "get in touch".
**Typography:** the display size returns here for the only time since page 2. That symmetry closes the document.
**White space:** 80% empty. This is not minimalism for its own sake; an empty page with one ask on it makes the ask unavoidable.
**Image:** none. An image here competes with the ask.
**QR:** one only, 22 mm, pointing to a trade-specific landing page (not the homepage), with a 6.5 pt label beneath saying where it goes. Unlabelled QR codes are not scanned.
**Why it exists:** every preceding page has been building permission. This spends it.

---

## 8. Production notes

### Print

| | |
|---|---|
| Cover stock | **300 gsm** uncoated, warm white, lightly textured — e.g. Colorplan Natural, Keaykolour Wholefeel, or Ecostar 300 |
| Text stock | **148–170 gsm** uncoated, matching white |
| Finish | None. No lamination, no spot UV, no foil. |
| Optional | Blind deboss of the wordmark on the cover — the only permissible embellishment |
| Ink | 4-colour process. Text in Ink `#14171A` built as K-heavy, not rich black |
| Binding | Saddle-stitch, 2 wire |
| Quantity | 50–100. Below 50 the unit cost is indefensible; above 200 you will reprint before you use them |

Uncoated warm stock is chosen against gloss deliberately: haptic research associates heavier, softer materials with perceived competence and warmth, and gloss on an art document reads as a promotional flyer. The paper is the only channel through which the printed version outperforms the PDF — spend there and nowhere else.

### Digital

- Export at 150 ppi, sRGB, JPEG quality 80–85. Target ≤ 2.5 MB total.
- **Keep text as live text.** Do not flatten to images — procurement teams search PDFs, and AI assistants that summarise attachments cannot read a flattened one.
- Add document metadata: Title = "Ritushka — Studio Profile", Author = "Ritushka", Keywords = abstract seascape, abstract landscape, commissioned artwork, Sydney.
- Set initial view to "Fit Page", single page, bookmarks panel off.

### Accessibility

- Tag the PDF. Set reading order. Add alt text to every image (the caption text is sufficient).
- Contrast ≥ 15:1 for body, ≥ 4.5:1 for the reversed caption on page 4 — check the crop; if the image is light behind the caption, move the caption, do not add a scrim.

---

## 9. What would ruin this document

Listed because they are the defaults every template pushes you toward:

- A logo with a paintbrush, a wave, or the artist's initials in a circle
- A tagline under the wordmark
- Drop shadows on artwork images
- More than two typefaces
- Any gradient
- Stock photography of a "luxury interior" that is not one of your installations
- Page borders or decorative rules
- Centred body text
- More than one call to action
- Social media icons anywhere except a single line on page 8
- The words *passion*, *journey*, *soul*, *evoke*, *capture the essence*, *bespoke*, *curated*, *elevate*, *transform your space*
- Invented testimonials, invented press, invented client lists
