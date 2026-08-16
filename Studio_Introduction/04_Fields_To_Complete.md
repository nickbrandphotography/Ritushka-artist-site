# Fields To Complete Before Sending

Everything inside `‹angle brackets›` in the PDFs and the DOCX master is a fact I could not verify. **Do not send any version until these are resolved.** They are ordered by how much damage a wrong answer does.

---

## Tier 1 — the document does not work without these

| Field | Appears on | Current placeholder | Notes |
|---|---|---|---|
| **Price band** | Page 2, all versions | `$2,400 – $14,000 AUD ex-GST` | Every published art-consultancy intake spec asks for pricing. Omitting it is the single most common failure in artist submissions. A band is enough — you do not need a per-work list. |
| **Lead time** | Pages 2, 6, 7 | `8–10 weeks standard, 6 weeks expedited` | Must be a number you will actually hold. If it slips once, the relationship is over. Quote the number you can hit on a bad month, not a good one. |
| **Size range** | Pages 2, 7 | `800 × 800 mm to 3,000 × 1,800 mm` | State the largest you have actually made and can move out of the studio. |
| **Trade discount** | Page 7 | `Trade discount available` — no figure | Decide the number now (industry range is broad; 10–20% is common for designers, deeper net pricing for consultants) and put it in writing, or delete the line. A vague discount invites negotiation on every piece. |
| **Deposit terms** | Page 6 accent panel | `50% deposit, balance on completion` | Confirm this matches how you actually invoice. |

## Tier 2 — credibility fields

| Field | Appears on | Notes |
|---|---|---|
| **ABN and entity name** | Corporate + hotel versions, page 2 and 7 | `Ritushka Fine Art Pty Ltd` and the ABN are placeholders from `src/site.config.ts`. If the entity is a sole trader, say so — procurement does not mind, but a wrong ABN is fatal. |
| **Public liability cover** | Corporate + hotel versions | `$20,000,000` is a plausible commercial figure, **not a verified one**. Put your actual policy figure in or delete the line entirely. |
| **Insurance in transit** | All versions, page 7 | Confirm your freight arrangement actually covers this before claiming it. |
| **Support / stretcher spec** | Page 7 | `38 mm profile`, `Belgian linen` — confirm. |
| **Varnish and finish options** | Page 7 | Confirm you offer matt/satin/gloss and that they are UV-inhibiting. |
| **Output per year** | Consultant + gallery versions | `30–40 works a year` — replace with your real number. Galleries assess supply capacity as hard as they assess the work. |
| **Available works count** | Consultant + gallery versions | `18 works unencumbered` — count them. |
| **Body of work / years** | Gallery version | `40+ works, 2022–2026`, `one continuous body since 2022` — confirm the start year. |

## Tier 3 — artwork data

Every image caption reads `‹H × W cm› · ‹Available›`. These come from `Artwork Records.xlsx`, which currently holds only two sample rows (`RIT-0001 Coastal Rhythm`, `RIT-0002 Tidal Memory`).

**Fill the register.** For each of the works used in the PDFs you need at minimum: title, year, medium, height, width, status, list price.

Works currently placed:

| Version | Page | Works |
|---|---|---|
| All | Cover | *Softly Loving Dreamscape* |
| All | 3 | *Shoreham* |
| All | 4 (plate) | *Eruption* — note the file is spelled `Erruption.jpg`; fix the filename |
| All except galleries | 5 | *Into the Ever Blue*, *Deliciousness*, *Stillness*, *Sunrise Over Tokyo*, *Turquoise Tuesday*, *Without Sweet Harmony* |
| Galleries | 5 | the six above plus *Horizon*, *Peony Thinking of Me*, *The Apostles*, *Plateau*, *Rushing Shallows*, *Set Sail* |

Once the register has real data, the captions can be regenerated automatically from the spreadsheet.

## Tier 4 — hospitality version only

| Field | Notes |
|---|---|
| **Per-key cost** | `from $180 per key` is a placeholder. Cost this properly — it is the number that decides whether you are in or out of a hotel budget. |
| **Edition programme** | Do you actually offer edition prints on canvas/aluminium? If not, delete the guestroom rows and reposition the hotel version around public areas only. |
| **Guestroom lead time** | `10–14 weeks for a full programme` — only claim this if you have the capacity. |

## Tier 5 — gallery version only

The gallery version has a **Record** block covering biography, exhibitions, collections, education and press. All of it is bracketed because none of it is verified.

**If a heading has nothing real under it, delete the heading.** Two genuine exhibition entries outperform eight padded ones, and galleries read padding instantly. A strong body of work with a thin CV is a normal, workable position. An inflated CV is not.

---

## Things I deliberately did not invent

No testimonials, no press quotes, no awards, no named clients, no exhibition history, no collection names. All of these were considered and excluded in the research, and none appear in any version.

**When you have one real testimonial** — a named designer or collector, one specific sentence — add it to page 3 of the interior designer and consultant versions, under the third numbered point. One specific attributed line outperforms five vague ones. Zero is better than one invented.

---

## Domain and links

`src/site.config.ts` sets the canonical host as `https://www.ritushka.com` while the studio email is `studio@ritushka.art`. That mismatch will read as an error to a careful buyer. Resolve it before printing — the QR codes in the PDFs point at `ritushka.com`.

QR destinations used:

| Version | URL | Route file |
|---|---|---|
| Interior designers | `ritushka.com/trade/interior-designers` | `src/app/(site)/trade/interior-designers/page.tsx` |
| Art consultants | `ritushka.com/trade/art-consultants` | `src/app/(site)/trade/art-consultants/page.tsx` |
| Corporate | `ritushka.com/trade/corporate` | `src/app/(site)/trade/corporate/page.tsx` |
| Hotels | `ritushka.com/trade/corporate` | as above |
| Galleries | `ritushka.com/portfolio` | `src/app/(site)/portfolio/` |

All five routes exist in the Next.js site. Confirm they are live on the production domain before printing anything — a dead QR code on a printed document is unfixable.

**Hotels currently share the corporate page.** If hospitality becomes a real channel, build `/trade/hospitality` and repoint that QR.
