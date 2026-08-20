# -*- coding: utf-8 -*-
"""
One-off content rewrite: the previous generator (scripts/regenerate-blog-bodies.mjs)
assembled every post from a shared pool of ~7 paragraph blocks and ~20 bullet
points, mad-libs style. With 50 posts drawing two body paragraphs each from
that pool, most posts ended up sharing verbatim paragraphs with several
others — textbook templated/duplicate content (Google's "scaled content
abuse" pattern), and useless to AI answer engines looking for a specific
answer.

This script:
1. Keeps the 31 posts covering genuinely distinct search intents.
2. Replaces each one's body, excerpt, seoTitle and metaDescription with
   hand-written, non-templated content grounded only in facts already
   established elsewhere on the site (site.config.ts, collections.ts,
   the commission/shipping/installation-guide pages, the About page).
3. Drops the 19 posts that duplicated a keeper's topic/intent.
4. Writes scripts/.blog-redirects.json — consumed by next.config.mjs — so
   every dropped slug 301s to its closest surviving page instead of 404ing.

Run: python3 scripts/rewrite-blog-content.py
"""
import json
import re

FILE = 'src/data/blog.ts'
src = open(FILE, encoding='utf-8').read()
k = src.index('= [')
posts = json.loads(src[k + 2: src.rindex(']') + 1])
by_slug = {p['slug']: p for p in posts}

COLL_NAME = {
    'abstract-landscapes': 'Abstract Landscapes', 'abstract-seascapes': 'Abstract Seascapes',
    'large-scale-paintings': 'Large Scale Paintings', 'coastal-abstract-art': 'Coastal Abstract Art',
    'ocean-inspired-paintings': 'Ocean Inspired Paintings', 'contemporary-landscape-art': 'Contemporary Landscape Art',
    'textured-abstract-paintings': 'Textured Abstract Paintings', 'blue-abstract-paintings': 'Blue Abstract Paintings',
    'modern-australian-art': 'Modern Australian Art', 'statement-artworks': 'Statement Artworks',
}

# ---------------------------------------------------------------- overrides
# slug -> { body, excerpt, seoTitle, metaDescription }  (title/audience/
# publishedAt/relatedCollection/image are kept as already assigned)
OVERRIDES = {}

def add(slug, excerpt, meta, body):
    OVERRIDES[slug] = {
        'excerpt': excerpt,
        # No trailing "| Ritushka" here — buildMetadata's title flows through
        # the root layout's `%s | Ritushka` template, which appends the brand
        # name exactly once. Baking it in here as well doubled it in every
        # <title> tag (confirmed live: "... | Art Journal | Ritushka | Ritushka").
        'seoTitle': f"{by_slug[slug]['title']} | Art Journal",
        'metaDescription': meta,
        'body': body.strip(),
    }

add('how-to-choose-art-for-a-large-wall',
    "A practical framework for sizing art to a genuinely large wall — width, not just height, and why two smaller works rarely read as well as one considered piece.",
    "How to choose art for a large wall: a sizing framework, why width usually matters more than height, and when to commission instead of compromise. From Ritushka's Lane Cove studio.",
    """A large wall is not really a size problem — it is a proportion problem. The instinct is to hunt for "a big painting", but the number that matters most is how much of the wall's *width* the work occupies, not its area. As a working guide, a single piece should fill roughly two-thirds to three-quarters of the wall's width to read as intentional rather than incidental; anything narrower starts to look like it wandered there by accident, however tall it is.

### Why one piece usually beats a cluster

On a genuinely large wall — a double-height stairwell, an open-plan living wall, a boardroom end wall — a single statement piece almost always outperforms a grid of smaller works. A cluster asks the eye to do more work at exactly the distance a large room is designed to be seen from. One painting, sized correctly, holds the wall the way the room was built to be held.

### The measurement that gets skipped

Photograph the wall with something of known size in frame — a door, a person — before deciding on dimensions. A painting that looks generous on a gallery wall, lit and unobstructed, can shrink dramatically against a genuinely tall, open span at home. Size up rather than down, and check the ceiling height against the work's height, not just the floor-to-ceiling distance in the abstract.

### When off-the-shelf doesn't fit

If nothing in a collection lands at the right width for the wall, a commission removes the guesswork entirely — Ritushka works to the exact dimensions, over roughly four to eight weeks, with progress images along the way. Browse [Abstract Landscapes](/collections/abstract-landscapes) for large-format examples already at scale, or [start a commission](/commission) built for the wall in question."""
    )

add('original-art-vs-prints-what-collectors-should-know',
    "Ritushka does not sell prints — only signed originals. Here is the practical difference that decision makes for value, texture and what actually arrives at your door.",
    "Original art vs. prints: what the distinction actually means for surface, provenance and resale — and why Ritushka's studio sells only signed originals, no editions.",
    """This site does not sell prints, and that is a deliberate choice worth explaining rather than assuming. A print — even a good one — is a reproduction of a decision the artist already finished making. An original is the decision itself: the actual layers of acrylic, the ridges where a palette knife dragged through wet paint, the places where one colour was scraped back to let an earlier one breathe through. None of that survives being photographed and reprinted, no matter how good the paper.

### What you're actually paying for

Two things a print cannot replicate: surface and scarcity. Texture reads from across a room in a way a flat reproduction never will — impasto and layered acrylic catch light differently as you move past them. And because there is exactly one of each work, provenance and resale value follow it in a way an open or even limited edition print's value structure doesn't.

### What ships with an original

Every original from the studio is hand-painted, signed, and accompanied by a certificate of authenticity — the paperwork that matters if the work is ever insured, appraised or resold. It ships fully insured, worldwide, with tracking; see [Shipping](/shipping) for exact timeframes by region.

### If the exact size or palette doesn't exist yet

Because nothing here is editioned, availability is genuinely one-of-one — when a piece sells, it's gone. A [commission](/commission) is the way to get an original in a specific size or palette when the current [Abstract Seascapes](/collections/abstract-seascapes) collection doesn't have quite the right piece in stock."""
    )

add('how-to-commission-an-abstract-painting',
    "What actually happens between briefing a commission and hanging it — brief, proposal, four to eight weeks of studio time, delivery. The real sequence, not a sales pitch.",
    "How to commission an abstract painting from Ritushka: the brief, proposal and deposit, the four-to-eight-week studio process with progress images, and insured delivery.",
    """A commission exists to remove one specific compromise: searching a finished collection for a work that almost fits, in almost the right palette, at almost the right size. Instead, the dimensions, palette and orientation are specified up front, and the painting is built for that exact wall.

### The sequence

It runs in four stages. First, a brief — share the space, size, palette direction and timeline, ideally with photos of the room. Second, a proposal: a concept, confirmed dimensions and a fixed quote, with a 50% deposit to begin work — so there are no surprises on price once painting starts. Third, creation: four to eight weeks of studio time, with progress images sent along the way so the direction can be confirmed before the work is finished, not after. Fourth, delivery: final approval, the balance paid, then insured worldwide shipping with a certificate of authenticity.

### What to bring to the brief

The most useful brief isn't a mood board of other artists' work — it's the room itself. Wall dimensions, the light direction at the time of day the room is actually used, and the palette already in the space (a fabric swatch or paint sample photographs well) do more than a Pinterest board of references.

### Timing it realistically

Rush timelines can sometimes be accommodated, but the honest number to plan around is four to eight weeks of studio time plus shipping — worth knowing before a fit-out deadline gets fixed. For a first look at scale and palette direction, browse [Ocean Inspired Paintings](/collections/ocean-inspired-paintings) or [start the brief](/commission)."""
    )

add('best-art-for-coastal-homes',
    "The mistake most coastal homes make with their art: choosing literal seascapes instead of the abstracted light and horizon that actually holds up over years of daily living with a piece.",
    "Best art for coastal homes: why abstraction usually outperforms literal seascapes, which palettes read as coastal without looking like a postcard, and where to look first.",
    """The obvious move in a coastal home is a literal seascape — a horizon, some waves, a lighthouse if you're really committing. It's also usually the wrong one. A photographic view of the ocean competes with the real one out the window; an abstracted field of the right blues, greys and foam-whites holds the *feeling* of the coast without trying to out-picture the view itself, and it doesn't date the way a literal scene does.

### What "coastal" actually means in a palette

It isn't just blue. The most convincing coastal work usually sits somewhere between cooler blues and greens that recede and calm a room, and warmer sand, bone or weathered-timber tones that keep it from feeling cold. Cooler tones alone can read as a hotel lobby; the warmth is what makes it feel like a home near the water rather than a brochure for one.

### Where light changes the answer

Coastal homes tend to have more direct, harsher light than inland rooms, and that light shifts a painting's read dramatically between morning and evening. View any candidate work in the room itself, at both ends of the day, before deciding — a palette that looks perfect at 10am can go flat and washed out by 4pm sun.

### A practical starting point

[Contemporary Landscape Art](/collections/contemporary-landscape-art) and [Coastal Abstract Art](/collections/coastal-abstract-art) are the two collections built specifically around this brief. If nothing in either matches the exact wall and light, a [commission](/commission) can be built to the room's own palette and orientation."""
    )

add('the-complete-art-placement-guide',
    "The full mechanics of hanging art well: eye-level centring, furniture clearance, wall-fill percentage and negative space, in one reference.",
    "The complete art placement guide: correct hanging height, furniture clearance, how much of a wall a piece should fill, and how negative space finishes the composition.",
    """Placement is mostly arithmetic, not instinct — a handful of numbers that, followed consistently, make almost any painting look considered.

### Height

Centre the piece at roughly 145–150cm from the floor to its midpoint — the standard museum eye-level convention, and one that works in most residential ceiling heights too. Above furniture, leave 15–25cm of clearance between the top of a sofa or console and the base of the frame; tighter than that and the piece looks like it's resting on the furniture rather than hanging above it. The full mechanics of fixings and weight-rated hardware are covered in the [installation guide](/installation-guide).

### Width

A painting should fill roughly two-thirds to three-quarters of the width of the wall or furniture piece it relates to. Narrower than that and it reads as an afterthought; wider and it starts to crowd the architecture around it.

### Negative space is part of the composition

The empty wall around a piece isn't wasted space — it's what lets the eye land on the work at all. Resist the urge to fill every remaining gap with smaller pieces; a single painting with room to breathe almost always reads as more considered than a wall with no visual rest at all.

### Framed or unframed

Deep-edge, gallery-wrapped canvases can hang unframed for a clean contemporary line, or float in a slim frame for definition against a busy wall — see [Framing vs Unframed](/blog/framing-vs-unframed-contemporary-canvas-art) for the trade-offs. For a piece sized to a specific wall from the outset, a [commission](/commission) removes the guesswork; [Textured Abstract Paintings](/collections/textured-abstract-paintings) is a good starting point for scale reference."""
    )

add('is-original-art-a-good-investment',
    "A grounded answer, not a sales pitch: what actually drives resale value in original art, what doesn't, and the paperwork that protects it either way.",
    "Is original art a good investment? What genuinely affects resale value — provenance, scarcity, condition records — versus what's marketing, with a straight answer.",
    """The honest answer is: sometimes, and rarely predictably — treat any suggestion otherwise with suspicion. Original art can hold or grow in value, but it is not a liquid asset, and nobody can promise a specific return on a painting the way they might project a return on shares or property.

### What actually moves the number

Three things matter more than anything else at resale: scarcity (a one-off original, not one of an edition), provenance (a documented, continuous chain of ownership and paperwork), and the artist's own trajectory over time. None of these are things a buyer controls after the sale — they're set at the point of purchase by what's bought and how it's documented.

### The paperwork that protects it

Keep the certificate of authenticity that ships with every original, along with condition notes and photographs taken on delivery. If the work is ever insured, appraised or resold, this is what an assessor asks for first — and it costs nothing to keep at the time, versus being very difficult to reconstruct years later.

### The honest caveat

Buying purely for appreciation is a weaker strategy than buying because a work genuinely holds your attention. Conviction is also the only part of the decision you can actually control — the market for any individual artist's work isn't. [Blue Abstract Paintings](/collections/blue-abstract-paintings) and the current [Available Works](/available) are a reasonable starting point if you're weighing a first acquisition on these terms."""
    )

add('how-to-hang-oversized-paintings',
    "The practical mechanics specific to genuinely oversized canvases — weight-rated fixings, two-point hanging, crating lead times — that a standard hanging guide skips.",
    "How to hang oversized paintings: weight-rated fixings, two-point hanging for stability, and the crating lead time large works add that smaller pieces don't.",
    """Oversized work follows the same eye-level and clearance rules as any painting, but the mechanics change once a canvas gets genuinely large — and this is where most of the actual risk sits.

### Fixings, not framing, is the real decision

A large stretched canvas is heavier and more torque-sensitive than it looks. Use fixings rated well above the work's actual weight, anchored into wall studs where possible rather than plasterboard alone, and hang from two points rather than one — a single central hook lets a large canvas twist and drift off-level over time, especially in a room with any foot traffic or door movement nearby. The full fixing specifications are in the [installation guide](/installation-guide).

### Plan the logistics before the painting arrives

Large works are professionally crated for transit, which adds real time to a delivery window that a smaller, boxed piece doesn't need — order well ahead of any deadline, particularly for a new-build handover or an event. [Shipping](/shipping) has exact timeframes by destination.

### Scale is where people misjudge, not height

The single most common error isn't hanging technique — it's misjudging scale before the work arrives. A canvas that looks generous under gallery lighting, seen unobstructed, can look surprisingly modest against a tall, open residential wall. Measure the actual wall and size up rather than down; a photograph with a person standing in frame is a better scale reference than the dimensions alone. [Modern Australian Art](/collections/modern-australian-art) includes several large-format examples, or a [commission](/commission) can be built to the wall's exact dimensions from the outset."""
    )

add('how-architects-specify-art-for-new-builds',
    "Specifying art before a wall exists means working from plans, not photographs — what to lock in early, and what to leave until the room is actually built.",
    "How architects specify art for new builds: what to lock into the brief from floor plans alone, and why final placement decisions wait until the room exists.",
    """Specifying art for a build still under construction means working entirely from plans and renders — no room to stand in, no light to check, no furniture to measure against. That constraint changes what can responsibly be decided early versus what has to wait.

### What can be locked in from plans alone

Wall dimensions, ceiling height and the general light direction (north-facing versus south, and where windows fall) can all be taken from the drawings with confidence, and are usually enough to commission a piece to the right scale well ahead of handover — useful when a four-to-eight-week studio lead time needs to land before practical completion.

### What has to wait for the finished room

Final palette confirmation is riskier from swatches and renders alone; paint, stone and timber finishes read differently under a screen's colour profile than under the room's actual light. Where possible, confirm the final palette direction against physical samples on site, even if the commission itself starts earlier.

### Making the case to a client

High-resolution imagery and to-scale in-situ mockups do more to secure a client's confidence than a swatch or a verbal description — see the [In Situ](/mockups) gallery for examples of how a piece reads against real furniture and light before it's committed to. Trade pricing and reserved lead times are available for architects and designers working to a build schedule; details are on the [Interior Designers](/trade/interior-designers) trade page, and [Abstract Seascapes](/collections/abstract-seascapes) is a useful starting reference for scale."""
    )

add('art-for-property-developers-display-suites-that-sell',
    "Art in a display suite has one job — make the room feel finished and aspirational to a buyer who's there for twenty minutes. Practical guidance for that specific brief.",
    "Art for property developers: how a display suite's art differs from a private home's — reusable across units, photographs well, and reads instantly to a buyer in the room briefly.",
    """A display suite is not a home — it's a twenty-minute pitch, and the art in it has to work at pitch speed. That changes the brief from a private commission in a real, specific way.

### The piece has to read instantly

A buyer moving through a display suite doesn't have time to grow into a painting the way an owner living with it does. Bold, legible palette and scale beat subtlety here — a work that "reveals itself over time" is the wrong brief for a room people spend minutes in, not years.

### It has to photograph as well as it hangs

Most buyers experience the display suite twice: in person, and again in the listing photography they return to before deciding. A painting that reads well in a wide-angle interior photograph — clear colour, strong shape, no fine detail that gets lost at web resolution — earns its place in both.

### Plan for reuse across the campaign

Developers commonly need the same or a matching work across a display suite and multiple show units, sometimes over a multi-stage release. Discuss reuse and multi-unit terms with the studio up front rather than after the first placement — it's easier to plan for scale, freight and timing across a whole campaign than to retrofit it. [Large Scale Paintings](/collections/large-scale-paintings) is a practical starting point for the scale a display suite usually needs, and trade terms for developers and their consultants are outlined on the [Corporate Art](/trade/corporate) page."""
    )

add('colour-theory-for-choosing-abstract-art',
    "The one colour rule that actually matters when buying abstract art for a room: echo an existing accent, don't try to match it exactly.",
    "Colour theory for choosing abstract art: why echoing an existing accent beats matching it exactly, and how warm and cool palettes change how a room feels.",
    """The most common colour mistake isn't picking the wrong hue — it's trying to match a painting to a room too literally. A painting that echoes an existing accent colour, without matching it exactly, sits far more naturally in a space than one hunted for as a precise swatch match.

### Warm and cool do different jobs

Cooler blues and greens recede and calm a room — useful in a space that already runs busy or bright. Warmer ochres, corals and terracottas advance and energise a room, which is exactly what a cooler, more neutral interior often needs to avoid feeling flat. Neither is "correct" in the abstract; the right choice depends on what the room is already doing.

### Trust the mood over the subject

In an abstract work, there's no literal subject to check against the room — no ocean to confirm is blue enough, no sky to confirm is the right grey. What matters is whether the palette and the *mood* it creates fit the space, not whether individual colours are technically "on scheme". A painting that feels right in the room, even if it isn't the exact shade of the sofa, will outlast a literal colour match by years.

### Where to look

[Coastal Abstract Art](/collections/coastal-abstract-art) leans toward the cooler, calmer end of this range; if nothing in the current collection has quite the right balance of warm and cool, that balance is exactly the kind of thing a [commission](/commission) can be tuned to."""
    )

add('how-to-care-for-an-acrylic-painting',
    "Acrylic behaves differently to oil over the long term — what actually threatens the surface, and the two things (sunlight, solvents) that cause almost all the damage.",
    "How to care for an acrylic painting long-term: the sunlight and humidity risks specific to acrylic, correct cleaning, and when re-varnishing is worth considering.",
    """Acrylic paint cures fast and stays flexible for decades, which makes it forgiving day to day — but it has its own specific vulnerabilities that differ from oil, and most damage to a well-made acrylic work traces back to one of two causes.

### The two real risks

Direct sunlight is the main one: UV exposure fades pigment gradually and, unlike a scratch, the damage is invisible until it's already done — position work away from direct sun, or behind UV-filtering glass if the room can't avoid it. The second is humidity swings, which can stress a stretched canvas over years, causing it to loosen on the frame. A stable, moderate indoor environment — the kind most homes already maintain — is enough to avoid both.

### Cleaning, simply

Dust gently with a soft, dry cloth, working in one direction rather than circular scrubbing. Never use water, solvents or household cleaning sprays on the surface — acrylic remains slightly water-reactive even fully cured, and solvents can lift or cloud the paint film permanently. If a work is visibly dirty beyond dusting, that's a job for a conservator, not a cloth.

### When to consider professional attention

A canvas that's loosened on its stretcher can usually be re-tensioned by a framer rather than restretched from scratch — worth doing before it's noticeable from across the room, not after. For day-to-day hanging height and lighting angle, the [installation guide](/installation-guide) covers the mechanics that prevent most damage before it starts; [Ocean Inspired Paintings](/collections/ocean-inspired-paintings) is a good place to see the surface quality this care protects."""
    )

add('framing-vs-unframed-contemporary-canvas-art',
    "Deep-edge canvas doesn't need a frame to look finished — when to leave it bare, and the specific cases where a slim frame genuinely earns its place.",
    "Framing vs. unframed contemporary canvas: when a deep-edge gallery-wrapped canvas works better bare, and the cases — busy walls, resale, formality — where a frame helps.",
    """A gallery-wrapped canvas with a deep edge — where the image continues around the sides, or the sides are a clean painted finish — was designed to hang without a frame. That's not a compromise; it's the intended presentation, and forcing one into a frame can actually undersell it.

### The case for unframed

Deep-edge canvas reads as more contemporary and less fussy, and it lets the painting's own edge do the work a frame would otherwise do — defining where the piece ends. It's also simpler and lighter to hang, ship and eventually rehang if the room changes.

### The case for a frame

A slim floating frame earns its place in two situations: a genuinely busy wall — patterned wallpaper, exposed brick, a heavily textured surface — where the work needs a defined edge to separate it visually from its surroundings; and a more formal, traditional room where an unframed canvas can look slightly unfinished against period detailing. A frame also protects the canvas edge in a high-traffic space where it might get brushed against.

### There's no resale penalty either way

Neither choice affects the certificate of authenticity or the work's value — framing is a display decision, not a provenance one. If a frame is wanted later, most framers can add one to an existing deep-edge canvas without altering the work itself. [Contemporary Landscape Art](/collections/contemporary-landscape-art) includes both framed and unframed pieces, each noted on its own artwork page."""
    )

add('how-art-consultants-work-with-collectors',
    "What a working relationship between an art consultant and this studio actually looks like — briefing, previews, trade terms — from the artist's side of the desk.",
    "How art consultants work with collectors and this studio: briefing on a client's behalf, reserved previews of new work, and the trade terms that make it repeatable.",
    """An art consultant sits between a collector's brief and the studio's output, and the relationship works best when that role is treated as a genuine trade partnership rather than a one-off referral.

### Briefing on a client's behalf

A consultant briefing a work for a client benefits from the same detail a direct commission would — room dimensions, light, existing palette, budget — plus context the studio wouldn't otherwise have: the client's taste history, what's already in the collection, and what they've previously rejected and why. That context shortens the number of rounds needed to land on the right piece.

### Reserved previews

Trade partners can see new work ahead of its public listing, which matters when a consultant is trying to place a specific piece with a specific client before it's visible to other buyers. This is arranged directly with the studio rather than through the public site.

### Terms that make it repeatable

A single successful placement is worth less to a consultant than a reliable, repeatable source — clear trade pricing, dependable lead times, and high-resolution imagery for client presentations turn one good outcome into an ongoing relationship. Full terms are outlined on the [Art Consultants](/trade/art-consultants) trade page; [Blue Abstract Paintings](/collections/blue-abstract-paintings) is a reasonable starting reference to share with a client browsing for the first time."""
    )

add('commissioning-art-for-a-corporate-lobby',
    "A lobby commission answers to a different brief than a home does — durability, scale from a distance, and a palette that reads consistently under commercial lighting.",
    "Commissioning art for a corporate lobby: the durability, scale-from-a-distance and lighting considerations that differ from a residential commission brief.",
    """A lobby is seen briefly, from a distance, by people who aren't there to look at art — which makes it a genuinely different brief from a painting commissioned for a home someone lives in daily.

### Scale reads differently at a distance

A lobby painting is usually viewed from across a foyer, not up close, so detail that rewards close inspection is largely wasted — bold shape and confident colour carry further than fine texture. Size the work to the sightline from the entrance and the lift lobby, not just the wall it hangs on.

### Commercial lighting is less forgiving

Fluorescent and LED downlighting common in commercial fit-outs render colour differently to residential warm lighting, and can flatten a palette that looked rich under gallery light. Confirm the lobby's actual lighting spec before finalising palette, or request progress images taken under comparable lighting during the commission.

### Durability and handling

A work destined for a high-traffic public space benefits from careful placement away from direct foot traffic and door swing, and from a robust hanging system rated for the additional vibration a busy foyer carries over years. These are worth flagging at the brief stage, not discovering after installation.

### Process and terms

The commission runs on the same four-to-eight-week studio timeline as any bespoke work, with insured delivery and installation coordination available for corporate sites. See [Commission](/commission) for the process, or [Corporate Art](/trade/corporate) for trade terms; [Modern Australian Art](/collections/modern-australian-art) is a useful scale reference for a foyer-sized piece."""
    )

add('how-to-build-a-cohesive-art-collection',
    "A cohesive collection is built on one shared thread, not identical pieces — the difference between a considered wall of art and a mismatched one.",
    "How to build a cohesive art collection: why one shared thread — palette, scale or subject — ties a group of works together better than matching them exactly.",
    """A collection that feels considered rarely comes from matching pieces to each other — it comes from each piece sharing one thread with the others, whether that's palette, scale, or a recurring subject, while otherwise being free to differ.

### Pick the thread deliberately

Decide early which single thread is doing the work. A palette thread means every piece sits within a related colour range even if the compositions differ wildly. A scale thread means works of similar proportion across different rooms, creating rhythm through a home. A subject thread — landscape, seascape, or a recurring motif — ties pieces together conceptually even across very different palettes. Trying to hold two or three threads at once is usually what makes a collection feel busy rather than cohesive.

### Buy for the collection you're building, not the room you're in

The strongest collections are usually assembled slowly, with each new piece considered against what's already owned, not against the wall it happens to be filling that year. Keep a simple record — photos, dimensions, palette notes — of the collection as it grows; this also matters for the certificate-of-authenticity records each piece already carries.

### Trust conviction over consistency

A collection built purely to "match" ends up feeling static. Buying what genuinely holds your attention, within the thread you've chosen, tends to age far better than buying strictly to a formula. [Abstract Landscapes](/collections/abstract-landscapes) is a natural starting point for a collection built around a landscape or palette thread."""
    )

add('buying-art-as-an-interior-designer-a-workflow',
    "The repeatable process — not the one-off purchase — that turns sourcing original art into something a design practice can build into every project without reinventing it each time.",
    "Buying art as an interior designer: a repeatable sourcing workflow — brief, mockup, trade quote, delivery — built to slot into a project timeline without last-minute scrambling.",
    """The difference between sourcing art once and sourcing it as a repeatable part of a design practice is almost entirely process — the same four steps, run consistently, rather than reinvented under deadline pressure each time.

### 1. Brief early, not last

Art sourced in the final weeks of a project is sourced under pressure, with less choice and no time for a commission if nothing off-the-shelf fits. Bringing the art brief in alongside furniture and finishes — not after them — gives a genuine four-to-eight-week commission window if needed.

### 2. Use in-situ mockups in client presentations

A flat product photo rarely closes a client on a large-format piece; seeing it composited to scale in a comparable room does. The [In Situ](/mockups) gallery exists specifically for this — pull a relevant mockup into a client deck rather than describing scale in words.

### 3. Confirm trade terms once, reuse them

Trade pricing, lead times and invoicing terms are set once through the [Interior Designers](/trade/interior-designers) trade page rather than renegotiated per project, which is what makes repeat sourcing actually efficient rather than a fresh negotiation each time.

### 4. Build in freight lead time for large work

Large canvases are professionally crated, which adds real time beyond the studio's four-to-eight-week production window — factor this into any handover date rather than assuming delivery is instant once a piece is finished. [Large Scale Paintings](/collections/large-scale-paintings) is a practical starting reference for scale across a typical project brief."""
    )

add('texture-and-materiality-in-abstract-painting',
    "Why texture is the one quality a print or a screen can never actually show you — and what to look for in person that a photograph of a painting hides.",
    "Texture and materiality in abstract painting: why layered acrylic surface only reads in person, and what to check when viewing a textured work before buying.",
    """A photograph of a textured painting is, in an important sense, lying to you — flattening exactly the quality that makes the work worth having in person. Texture is the one part of an abstract painting that a screen, and even a good print, simply cannot transmit.

### How the surface is actually built

Layered, worked acrylic — built up in passes, sometimes pulled back with a palette knife or scraped through to reveal an earlier layer underneath — creates real physical relief on the canvas. That relief catches ambient light differently depending on where you stand and what time of day it is, which is why a textured piece can look subtly different in the morning than it does at night under lamplight. This is also exactly what separates an original from any reproduction of it, regardless of print quality.

### What to check in person if you can

If a studio visit is possible before buying a heavily textured piece, look at it from an angle as well as face-on — raking light across the surface reveals texture that direct, flat lighting hides completely. Photographs on the site are lit to show this as honestly as possible, but they're still a translation, not the thing itself.

### Where texture suits a room

Textured work rewards a room where people spend real time up close — a living room, a study — more than a space seen only in passing. [Coastal Abstract Art](/collections/coastal-abstract-art) includes several heavily worked, textured pieces; studio visits in Lane Cove, Sydney can be arranged by appointment via [Contact](/contact)."""
    )

add('how-to-light-a-large-painting',
    "One number matters more than any other for lighting art well: roughly thirty degrees. Here's why that angle works and what happens either side of it.",
    "How to light a large painting correctly: why a picture light at roughly thirty degrees works, and the glare and flattening that happen either side of it.",
    """Lighting a painting well comes down to one variable most people never adjust: the angle. A picture light or adjustable spot aimed at roughly thirty degrees from the wall keeps a painting alive after dark without either washing it out or throwing distracting glare back at the viewer.

### Why thirty degrees specifically

Lower than that and light grazes too flat across the surface, throwing odd shadows off any texture and creating hot spots low on the canvas. Steeper, more overhead angles flatten texture entirely and can catch varnish or a glossy passage as glare exactly where a viewer is standing to look at it. Thirty degrees is the angle most textured, acrylic surfaces read most naturally under — enough to reveal surface relief without distorting it.

### Natural light changes the answer through the day

Before committing to fixed lighting, view the work in the room at both ends of the day. A north-facing wall in direct afternoon sun needs very different supplementary lighting to a shaded south wall that's dim by 4pm — the picture light is compensating for whatever natural light isn't doing, not replacing it.

### What to avoid

Avoid positioning any light source where it puts the painting in direct line of a window's reflection, and never rely on overhead room lighting alone for a large or textured piece — general ambient light flattens exactly the surface quality worth lighting for. The [installation guide](/installation-guide) covers hanging height alongside this; [Ocean Inspired Paintings](/collections/ocean-inspired-paintings) is a good reference for how texture responds to angled light."""
    )

add('art-for-hotels-and-hospitality-spaces',
    "Hospitality art has to survive being seen by thousands of different people for years, in spaces designed around flow, not contemplation. That changes the brief entirely.",
    "Art for hotels and hospitality spaces: durability, guest-flow sightlines and consistent palette across multiple keys or public areas — the brief that differs from a private home.",
    """Art in a hotel or hospitality venue answers to guests who are moving through the space, not sitting with it — which changes almost every decision from what would apply in a private home.

### Sightlines follow guest flow, not room geometry

Position pieces where the natural path through a lobby, corridor or dining room actually puts a guest's eye, not just where a wall happens to be free. A striking piece in a rarely-glanced-at corner does less work than a modest one placed exactly where guests pause — at a check-in desk, a lift lobby, the top of a staircase.

### Consistency matters across multiple pieces

Where a venue needs art across several public areas, or a run of guest rooms, a consistent palette or thread across the pieces reads as a considered brand decision rather than a series of unrelated purchases — even when the individual works differ. This is worth deciding before the first piece is placed, not after several are already installed.

### Durability under public conditions

Public and semi-public spaces see more incidental contact, humidity variation and light exposure than a private room does over the same number of years. Discuss placement away from direct guest contact and flag any unusually bright or variable lighting at the brief stage.

### Scoping a multi-piece programme

For anything beyond a single work — guest room runs, multiple public areas — discuss scope, timeline and per-piece budget with the studio directly rather than commissioning one piece at a time; it's easier to plan production and freight across a whole programme than to retrofit it later. [Contemporary Landscape Art](/collections/contemporary-landscape-art) and [Corporate Art](/trade/corporate) are useful starting points for scoping this conversation."""
    )

add('understanding-certificates-of-authenticity',
    "What the certificate that ships with every original actually proves, why it matters years later at resale or insurance time, and how to keep it usable.",
    "Understanding certificates of authenticity: what the document proves, why it matters for insurance and resale years later, and how to store it so it stays useful.",
    """A certificate of authenticity is easy to file away and forget — until the day a work needs to be insured, appraised or resold, at which point it becomes the single most important piece of paper attached to the painting.

### What it actually establishes

The certificate ties a specific physical work — by title, dimensions and often a photograph — directly to the artist who made it, at the point of sale. It's the document an insurer, appraiser or future buyer uses to confirm the work is what it's claimed to be, rather than taking a seller's word for it.

### Why it matters more over time, not less

At the point of purchase, provenance feels almost redundant — you were there, you know where it came from. Ten or twenty years later, after the work may have changed hands, been rehung by a different owner, or simply been forgotten about, the certificate is what reconnects the physical object to its history. Losing it doesn't make a work worthless, but it makes reconstructing provenance far harder than keeping the original document ever would have been.

### Keeping it usable

Store it somewhere separate from the painting itself — a fire or flood that damages the artwork can just as easily destroy paperwork stored alongside it. A photograph of the certificate, kept digitally, is a reasonable backup. Every original sold through this studio ships with one as standard; if a certificate for an earlier purchase has been misplaced, [contact the studio](/contact) directly to discuss what can be reissued."""
    )

add('art-shipping-and-insurance-explained',
    "What worldwide insured shipping actually covers, what it doesn't, and the practical difference between how small and large works travel internationally.",
    "Art shipping and insurance explained: what full-value cover actually includes, how small versus large works are packed differently, and who pays customs duties.",
    """"Fully insured" is a phrase worth unpacking rather than taking on faith — here is what it actually covers, and the practical mechanics of how a painting travels once it leaves the studio.

### What the insurance covers

Every shipment is insured to the full value of the work for the duration of transit, covering loss or transit damage from the studio to the delivery address. This is arranged and paid for by the studio as part of the sale, not an optional add-on the buyer has to organise separately.

### How packing differs by size

Smaller works ship rolled or boxed with rigid corner protection; large works are professionally crated, which takes real preparation time and is why big pieces need to be ordered well ahead of any deadline. Some stretched canvases travel rolled for international transit and are re-stretched locally on arrival where that's the more practical option — this is confirmed with the buyer before shipping, not decided unilaterally.

### Timeframes

Australian delivery typically runs 3–7 business days; international delivery 7–21 business days, depending on destination and customs processing. Full detail is on the [Shipping](/shipping) page.

### Duties and customs

International duties and import taxes are the responsibility of the recipient and vary significantly by country — worth checking with local customs before ordering internationally if the total landed cost matters to the decision. Trade and corporate clients can arrange white-glove delivery and installation directly through the studio; see [Corporate Art](/trade/corporate) or [contact the studio](/contact) for a quote on a specific destination."""
    )

add('why-linen-canvas-matters',
    "What actually differs between linen and cotton canvas — weight, longevity, cost — and the honest questions worth asking before assuming a work is one or the other.",
    "Linen vs. cotton canvas: what genuinely differs in weight, longevity and cost, and why it's worth confirming a specific work's support rather than assuming.",
    """Canvas support is one of those details that matters more at year twenty than at year one, and it's worth understanding even though it rarely shows up in a photograph.

### The genuine difference

Linen canvas is woven from flax fibre, which is naturally stronger and more dimensionally stable than cotton — it resists sagging and humidity-driven stretching better over decades, which is why higher-end and larger-format works are often built on it. Cotton duck is more affordable, takes paint slightly differently, and is a perfectly durable support for most works, particularly at moderate scale — the idea that cotton is somehow inferior is more market signalling than material fact for the vast majority of paintings' realistic lifespans.

### Where it actually matters

The practical difference shows up most on very large canvases, where the support has to hold significant weight and tension over a big span without sagging, and in genuinely humid or variable climates, where dimensional stability matters more over time. On a moderately sized work in a stable indoor environment, the difference is close to academic.

### The honest answer for a specific piece

Canvas support isn't always listed on every artwork page, and it's a completely reasonable thing to ask about directly for a specific work you're considering — particularly for a large-format piece or one destined for a demanding climate. [Contact the studio](/contact) with the artwork's name or a link to its page for a straight answer rather than assuming either way. [Large Scale Paintings](/collections/large-scale-paintings) is the collection where this question is most worth asking."""
    )

add('the-difference-between-landscape-and-seascape-abstraction',
    "Landscape and seascape abstraction aren't just different subjects — they behave differently on the wall, in palette, horizon and movement. Here's the actual distinction.",
    "The difference between landscape and seascape abstraction: how horizon placement, palette and implied movement genuinely differ between the two, not just the subject label.",
    """The two collection names — Abstract Landscapes and Abstract Seascapes — aren't just a subject label for cataloguing purposes; the two genuinely behave differently once they're on a wall, and knowing the difference helps in choosing between them.

### Horizon and structure

Landscape abstraction tends to work with more implied structure — layered horizontal bands suggesting land, ridge lines, strata — even when nothing in the composition is literally representational. Seascape abstraction leans toward movement and translucency instead: layered, often more fluid passages that suggest water's depth and light rather than a fixed horizon line. Neither approach depicts an actual place; both work through implication rather than illustration.

### Palette tends to follow the same split

Landscape work often draws on warmer earth tones — ochre, rust, stone, taupe — alongside cooler greys and blues. Seascape work leans further into blues, teals and foam-whites, with warmer tones used more sparingly, as accent rather than base. This isn't a hard rule — some of the strongest pieces in either collection cross the line deliberately — but it's a useful starting expectation.

### Which suits a given room

A landscape piece tends to sit more comfortably in a room with warmer materials — timber, stone, brick. A seascape piece tends to suit cooler, brighter, more reflective interiors — glass, polished concrete, coastal light. Neither is more "abstract" than the other; the choice comes down to which underlying structure — land or water — suits the room's own materials and light. [Abstract Landscapes](/collections/abstract-landscapes) and [Abstract Seascapes](/collections/abstract-seascapes) are both worth browsing side by side before deciding."""
    )

add('how-buyers-agents-add-value-with-art',
    "Where art fits in a buyer's agent's actual scope of work — property styling for resale versus a genuine acquisition for a client who's moving in, and why the brief differs.",
    "How buyers agents add value with art: the difference between styling a property to sell and sourcing a genuine piece for a client's own home, and why the brief differs.",
    """Art shows up in a buyer's agent's work in two quite different ways, and conflating them leads to the wrong brief being given to the wrong purpose.

### Styling for resale is not the same brief as acquisition

If the art is part of preparing a property to sell — styling a display or a listing photo shoot — the brief is about broad, immediate appeal to as many buyers as possible: safe palettes, clear shapes, nothing polarising. If the art is a genuine acquisition for a client moving into a home they've just bought, the brief is the opposite — specific to that client's taste, their existing collection if they have one, and the actual light and palette of the home they're settling into. A buyer's agent moving between these two roles for different clients benefits from treating them as genuinely separate briefs, not one generic "add some art" instruction.

### Where a buyer's agent adds real value

Beyond the purchase itself, a buyer's agent who understands scale, light and placement can flag during a property inspection whether a client's existing collection — or the kind of statement piece they're likely to want — will actually work in the home being considered, before the purchase is finalised. That's advice a seller's stylist or the client themselves rarely thinks to check at inspection stage.

### Working directly with the studio

For a genuine client acquisition, direct contact with the studio secures the same trade terms, previews and lead-time reliability available to interior designers and consultants — see [Buyer's Agents](/trade/buyers-agents) for details, or browse [Contemporary Landscape Art](/collections/contemporary-landscape-art) as a starting reference to share with a client."""
    )

add('how-to-price-original-art',
    "How this studio actually prices work — size-driven, transparent, published — and the honest reasons prices vary between two paintings of a similar size.",
    "How original art is priced: why size is the primary driver, what else moves the number, and why this studio publishes prices rather than quoting on request.",
    """Original art pricing can feel opaque from the outside — galleries that won't publish a number, wildly different prices for seemingly similar work. Here's how it actually works on this site, and the reasoning behind it.

### Size is the primary driver

Across the current collection, prices run from roughly A$2,450 for the smallest works up to A$7,350 for the largest, and size is the single biggest factor in that range — a larger canvas takes more time, more material, and more studio space to produce than a small one, and the price broadly tracks that. Every listed price includes the frame where a work is framed, plus the certificate of authenticity; insured shipping is quoted separately based on destination.

### What else moves the number within a size band

Beyond raw dimensions, complexity of technique and time invested in a particular piece's layering and surface work can shift price within a similar size range — two 90 × 90cm works aren't always priced identically if one involved substantially more studio time. This is priced honestly per piece rather than on a rigid size-only formula.

### Why prices are published, not quoted on request

Publishing prices on every artwork page — rather than the "price on request" convention common in galleries — is a deliberate choice: it respects a buyer's time and lets a genuine decision be made without a negotiation step neither party particularly wants. Trade buyers can register for separate trade pricing through the relevant [trade programs](/trade/interior-designers). Browse [Blue Abstract Paintings](/collections/blue-abstract-paintings) or the full [Available Works](/available) to see current pricing across the size range."""
    )

add('galleries-vs-buying-direct-from-the-artist',
    "What a gallery adds to a purchase that buying direct doesn't — and, just as honestly, what buying direct from the studio offers that a gallery markup doesn't.",
    "Galleries vs. buying direct from the artist: what a gallery's commission actually pays for, and what buying direct — like this studio — offers instead.",
    """Neither route is simply "better" — a gallery and a direct studio purchase serve genuinely different needs, and it's worth understanding what you're actually paying for, or skipping, in each.

### What a gallery's margin pays for

A gallery typically takes a significant commission — often 40–50% — in exchange for curation, a physical space to view work alongside other artists, existing relationships with collectors, and marketing reach an individual artist may not have alone. For a first-time buyer wanting guided context, or a collector building a mixed-artist collection, that curatorial layer has real value.

### What buying direct offers instead

Buying directly from a working artist's studio — as this site is set up to do — removes that margin from the price, which is part of why originals here can be priced more accessibly than comparable gallery work of similar scale and quality. It also means direct access to the artist's own reasoning about a piece, and the option to commission a bespoke work built to a specific brief, which most galleries can't offer since they represent finished inventory rather than take custom work.

### The honest trade-off

What's genuinely lost buying direct is the gallery's independent curatorial validation — a collector has to trust their own eye, or their own consultant, rather than a gallery's selection process. For many buyers, particularly those working with an interior designer or [art consultant](/trade/art-consultants) already, that trade-off favours buying direct. [Modern Australian Art](/collections/modern-australian-art) and the full [Portfolio](/portfolio) are a reasonable place to start evaluating the work on its own terms."""
    )

add('how-to-commission-a-diptych-or-triptych',
    "A multi-panel commission isn't just one painting split in two or three — it changes the brief around gaps, alignment and how the piece is meant to be read as a whole.",
    "How to commission a diptych or triptych: how panel gaps, cross-panel alignment and hanging sequence change the brief compared with commissioning a single canvas.",
    """A diptych or triptych is not simply a large painting sliced into panels after the fact — treating it that way is the most common way a multi-panel commission goes wrong. The panel gap and cross-panel alignment need to be part of the brief from the start, not resolved at hanging time.

### Decide the gap before the brief, not after

The space between panels — typically somewhere between 3cm and 10cm depending on the wall and the composition — changes how continuous or deliberately fragmented the finished piece reads. A narrow, consistent gap reads as one continuous image interrupted by the panel edge; a wider gap reads as three related but distinct compositions. This decision belongs in the brief, since it affects how the composition itself is designed to flow — or deliberately not flow — across the break.

### Composition has to work both ways

A well-designed multi-panel work should read convincingly as a single composition from a distance and hold up as individual panels up close — elements shouldn't rely entirely on being read together to make sense, in case a panel is ever rehung separately or one panel needs to travel or be reframed independently down the line.

### Practically, on the wall

Confirm the wall's total width including the gaps before finalising individual panel dimensions, and measure for level across all panels together, not one at a time — a small error compounds visibly across three panels in a way it wouldn't on one canvas. The full commission process — brief, proposal, four-to-eight-week studio time, delivery — runs the same as a single-panel work; [start the brief](/commission) specifying the multi-panel format from the outset."""
    )

add('how-designers-present-art-to-clients',
    "The gap between an art recommendation a client trusts and one they hesitate on usually isn't the work itself — it's how it's presented. Practical presentation tactics that close that gap.",
    "How designers present art to clients: using scaled in-situ mockups instead of flat product shots, and the sequencing that gets a client to a confident decision faster.",
    """A client rarely rejects a genuinely good art recommendation on the work itself — far more often, they hesitate because they can't picture it in their own space from a flat product photo alone. Presentation, not persuasion, is usually the actual gap.

### Show scale, don't describe it

A dimension in centimetres means very little to most clients until they see it against furniture they recognise. The [In Situ](/mockups) gallery exists specifically to solve this — pieces composited to true scale against real interiors — and pulling a relevant mockup into a client deck does more work than a paragraph of description or a flat crop of the canvas alone.

### Sequence the presentation deliberately

Lead with the piece in context — the mockup or a rendering against the actual room — before the artwork-alone photograph, and before the price. Clients anchor on whatever they see first; starting with an isolated product shot and a number invites a value judgement before they've connected the work to their own space at all.

### Give one strong recommendation, not five options

Presenting a single, well-reasoned recommendation, backed by a clear rationale tied to the room's light and palette, closes faster than a grid of five alternatives that puts the entire decision back on the client. If a genuine second option is warranted, offer it as a considered alternative with its own rationale, not as a menu.

### Where high-resolution assets come from

Trade partners have access to high-resolution imagery and mockup assets for client presentations directly through the studio — request these when briefing a piece rather than screenshotting the public site. See [Ocean Inspired Paintings](/collections/ocean-inspired-paintings) for the kind of imagery available, or the [Art Consultants](/trade/art-consultants) page for trade access."""
    )

add('investing-in-emerging-australian-artists',
    "What \"emerging\" actually signals for value and risk, and what to look for in an emerging Australian artist's practice before committing to a body of work early.",
    "Investing in emerging Australian artists: what \"emerging\" actually signals for price and risk, and the practical signs of a developing, coherent practice worth watching.",
    """"Emerging" is a label that gets used loosely, and it's worth being precise about what it actually signals for anyone considering a purchase partly on the strength of an artist's trajectory rather than name recognition alone.

### What "emerging" really means for price

An emerging artist's prices are typically set by current demand and studio output rather than an established secondary market — which is exactly why entry prices tend to be more accessible than an artist with decades of exhibition history and gallery representation behind them. That accessibility is the upside; the corresponding honest risk is that there's no long track record to point to, only the current body of work and its trajectory so far.

### What to actually look for

Beyond simply liking the work, look for a coherent, developing practice rather than a scattered one — is there a consistent thread across a body of work, evolving rather than repeating? A documented history of continuous practice (even without gallery representation) and legitimate exhibition history, however modest, both matter more than any single striking piece in isolation.

### A specific, real example

Ritushka's own practice runs a documented, continuous line: training at Willoughby Art School, exhibited work accepted into the Hunters Hill Art Exhibition, and a body of abstract landscape and seascape work built consistently from a Lane Cove studio since transitioning from earlier commissioned work. None of that guarantees future value — nothing legitimately can — but it's the kind of continuous, verifiable trajectory worth checking for in any emerging artist under consideration. Read more on the [About](/about) page, or browse [Textured Abstract Paintings](/collections/textured-abstract-paintings) to see the current body of work directly."""
    )

add('how-to-acquire-a-sold-out-series-work',
    "The specific piece you wanted has sold — what actually happens next, and why a related commission is usually the better path than waiting for a resale.",
    "How to acquire a sold-out series work: why a related commission usually beats waiting for a resale, and what to bring to that brief from the sold piece.",
    """A specific piece selling before you acted on it is a genuinely common frustration, and the honest advice is usually the same: a related commission, not waiting, is the faster and more reliable path back to something close to what you wanted.

### Why waiting for a resale rarely works

Because nothing here is editioned, a sold work isn't reprinted or reissued — it's simply gone, in the hands of whoever bought it. Waiting for that specific owner to eventually resell is not a realistic acquisition strategy for most buyers; it could be years, or never.

### What a related commission actually offers

The [Sold Works](/sold) archive exists specifically as a reference for this — browse the archive, find the piece or the palette that resonated, and describe it as the starting reference for a new commission "in the spirit of" that sold work, rather than an exact reproduction (which, as an original, isn't something the studio recreates piece-for-piece). The result won't be identical — no two originals ever are — but it can share the same palette family, scale and mood that drew you to the sold piece in the first place.

### What to bring to that brief

Reference the sold work's title directly when briefing the commission, along with what specifically drew you to it — the palette, the scale, a particular passage of texture — so the new piece can be built around what actually mattered to you, not just superficially resemble the original. [Start a commission](/commission) referencing a specific sold piece, or browse [Blue Abstract Paintings](/collections/blue-abstract-paintings) for the closest currently available works in a similar register."""
    )

add('a-collector-s-guide-to-contemporary-abstraction',
    "A short, honest orientation to contemporary abstraction for a new collector — what to actually look at, and the two questions worth asking before any purchase.",
    "A collector's guide to contemporary abstraction: what to actually look at in an abstract work, and the two honest questions worth asking before buying one.",
    """Contemporary abstraction can feel like it comes with no rules to check a purchase against — no recognisable subject to judge accuracy by, no obvious technical benchmark. That openness is exactly what makes a first purchase feel harder than it needs to be.

### What to actually look at

Set the absence of a literal subject aside and look instead at three things: composition (does the arrangement of shape and colour hold together, or does the eye keep restlessly searching for something to land on), surface (does the paint handling — layering, texture, the visible evidence of how it was made — reward a closer look), and palette (does the colour relationship feel resolved, or arbitrary). These three hold up as genuine criteria regardless of style or artist.

### The two honest questions worth asking

First: does this hold your attention from across the room, not just up close where every painting looks more interesting under scrutiny? Second: will this still feel resolved in five years, or does its appeal depend entirely on a trend that's currently in fashion? Neither question has a universally right answer — they're personal — but asking them honestly, before buying, filters out most purchases a collector later regrets.

### A practical way to start

Browsing widely before committing — across different artists, palettes and scales — sharpens what you actually respond to far faster than reading about abstraction in the abstract. [Statement Artworks](/collections/statement-artworks) and the full [Portfolio](/portfolio) are a reasonable cross-section to start that process with; the [About](/about) page covers how one working artist's own abstract practice developed, for context on how a body of work like this comes together over time."""
    )

# ------------------------------------------------------------- redirects
REDIRECTS = {
    'how-interior-designers-source-original-artwork': '/blog/buying-art-as-an-interior-designer-a-workflow',
    'large-scale-art-for-luxury-homes': '/blog/how-to-hang-oversized-paintings',
    'choosing-art-that-increases-with-value': '/blog/is-original-art-a-good-investment',
    'abstract-art-for-minimalist-interiors': '/blog/the-complete-art-placement-guide',
    'sourcing-australian-art-for-global-interiors': '/blog/buying-art-as-an-interior-designer-a-workflow',
    'coastal-colour-palettes-in-contemporary-art': '/blog/colour-theory-for-choosing-abstract-art',
    'statement-art-for-double-height-walls': '/blog/how-to-hang-oversized-paintings',
    'how-to-photograph-art-for-a-listing': '/blog/art-for-property-developers-display-suites-that-sell',
    'best-blue-paintings-for-calm-interiors': '/blog/colour-theory-for-choosing-abstract-art',
    'sizing-art-to-a-sofa-or-console': '/blog/the-complete-art-placement-guide',
    'how-to-work-with-an-artist-on-a-commission': '/blog/how-to-commission-an-abstract-painting',
    'curating-art-for-a-coastal-new-build': '/blog/best-art-for-coastal-homes',
    'art-trends-in-luxury-australian-homes': '/collections/modern-australian-art',
    'building-an-art-wall-in-an-open-plan-home': '/blog/the-complete-art-placement-guide',
    'choosing-art-for-resale-ready-homes': '/blog/is-original-art-a-good-investment',
    'neutral-art-for-warm-minimalism': '/blog/colour-theory-for-choosing-abstract-art',
    'art-for-architectural-concrete-interiors': '/blog/best-art-for-coastal-homes',
    'seasonal-light-and-abstract-colour': '/blog/colour-theory-for-choosing-abstract-art',
    'scale-negative-space-and-impact': '/blog/how-to-hang-oversized-paintings',
}

assert set(REDIRECTS.keys()) & set(OVERRIDES.keys()) == set(), "a slug can't be both kept and redirected"
missing = set(OVERRIDES.keys()) - set(by_slug.keys())
assert not missing, f"unknown slugs in OVERRIDES: {missing}"
missing_r = set(REDIRECTS.keys()) - set(by_slug.keys())
assert not missing_r, f"unknown slugs in REDIRECTS: {missing_r}"

kept = []
for p in posts:
    if p['slug'] in REDIRECTS:
        continue
    if p['slug'] in OVERRIDES:
        p = {**p, **OVERRIDES[p['slug']]}
    kept.append(p)

assert len(kept) == len(OVERRIDES), f"expected {len(OVERRIDES)} kept posts, got {len(kept)}"
print(f"Kept {len(kept)} posts, retired {len(REDIRECTS)} with redirects.")

banner = (
    "// Hand-written by scripts/rewrite-blog-content.py — do not regenerate with\n"
    "// scripts/regenerate-blog-bodies.mjs, which produces templated, duplicate\n"
    "// content across posts. Edit bodies directly, or extend the override map\n"
    "// in the rewrite script and re-run it.\n"
)
open(FILE, 'w', encoding='utf-8').write(
    banner + "import type { BlogPost } from './types';\nexport const blog: BlogPost[] = "
    + json.dumps(kept, indent=2, ensure_ascii=False) + ";\n"
)
print(f"Wrote {FILE}")

import os
os.makedirs('scripts', exist_ok=True)
json.dump(REDIRECTS, open('scripts/.blog-redirects.json', 'w', encoding='utf-8'), indent=2)
print("Wrote scripts/.blog-redirects.json")
