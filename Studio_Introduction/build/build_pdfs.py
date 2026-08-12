"""Build the five Ritushka Studio Profile PDFs."""
import os, qrcode
from build_lib import *

OUT = '/sessions/modest-zealous-bell/mnt/Ritushka/Studio_Introduction/PDF'
os.makedirs(OUT, exist_ok=True)
TMP = '/tmp/qr'
os.makedirs(TMP, exist_ok=True)


def qr(url, name):
    p = f'{TMP}/{name}.png'
    q = qrcode.QRCode(box_size=10, border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url); q.make(fit=True)
    q.make_image(fill_color=(0x14, 0x17, 0x1a), back_color=(0xFA, 0xF9, 0xF6)).save(p)
    return p


COVER = 'Softly loving dreamscape.jpg'
PLATE = 'Erruption.jpg'
P3IMG = 'Shoreham.jpg'

DIM = '‹H × W cm›'
AV = '‹Available›'
MED = 'acrylic and oil on canvas'

def cap(t):
    return f'{DIM} · {AV}'


# Sequenced so consecutive works alternate palette temperature.
SIX = [(f, t, cap(t)) for f, t in [
    ('Into the Ever Blue.jpg', 'Into the Ever Blue'),
    ('Deliciousness.jpg', 'Deliciousness'),
    ('Stillness.jpg', 'Stillness'),
    ('Sunrise over Tokyo.jpg', 'Sunrise Over Tokyo'),
    ('Turquoise Tuesday.jpg', 'Turquoise Tuesday'),
    ('Without sweet Harmony.jpg', 'Without Sweet Harmony'),
]]

TWELVE = SIX + [(f, t, cap(t)) for f, t in [
    ('Horizon.jpg', 'Horizon'),
    ('Peony thinking of me.jpg', 'Peony Thinking of Me'),
    ('The Apostles.jpg', 'The Apostles'),
    ('Plateau.jpg', 'Plateau'),
    ('Rushing shallows.jpg', 'Rushing Shallows'),
    ('Set sail.jpg', 'Set Sail'),
]]

# ---- shared page 6 (commission process) ----
STEPS = [
    ('Brief', 'You send the scheme, the elevation, the dimensions and the date. A twenty-minute call, or a site visit if you are in Sydney.', 'Week 0'),
    ('Concept', 'Two to three concepts, each with a colour board keyed to your finishes and a scale drawing against your elevation.', 'Week 1–2'),
    ('Approval', 'You choose one and confirm palette, size and delivery date in writing. Price is fixed at this point.', 'Week 2'),
    ('Studio', 'The work is made. One progress image at the halfway mark. Revisions to palette are possible until the final glazing stage.', 'Week 3–8'),
    ('Delivery', 'Cured, varnished, signed, documented and packed. Delivered and hung, or crated for freight.', 'Week 9–10'),
]
TERMS_PANEL = ('Terms', '‹50% deposit confirms the commission and the delivery date. Balance on completion, before dispatch. If the approved concept is not delivered as agreed, the deposit is returned in full.›')

WORK_ROWS = [
    ('Media', 'Acrylic and oil, mixed media, texture medium'),
    ('Support', '‹Stretched cotton canvas or Belgian linen on 38 mm profile stretcher›'),
    ('Sizes', '‹800 × 800 mm to 3,000 × 1,800 mm. Diptych and triptych to any elevation.›'),
    ('Finish', '‹Matt, satin or gloss varnish. UV-inhibiting. Specified at approval.›'),
    ('Framing', 'Supplied unframed as standard, edges painted and gallery-finished. Floating oak, black or white frames on request, ‹priced separately›.'),
    ('Signing', 'Signed verso. Certificate of authenticity with each work, numbered to the studio register.'),
]
LOG_ROWS = [
    ('Packing', 'Corner-protected, glassine-wrapped, foam and board. Timber crate for works over ‹1,800 mm› or international freight.'),
    ('Freight', 'Sydney metro delivered by hand at no charge. Interstate and international by specialist art freight, quoted at cost.'),
    ('Lead time', '‹8–10 weeks standard from approved concept. 6 weeks expedited.›'),
    ('Installation', 'Supplied ready to hang with D-rings and cord fitted. Hanging attended in Sydney at no charge.'),
    ('Documentation', 'Certificate of authenticity, high-resolution image file, condition report and insurance valuation with every work.'),
    ('Insurance', '‹Insured in transit to full replacement value. Studio carries public liability cover of $20,000,000.›'),
]


VERSIONS = []


def build(fname, cover_lines, glance, reasons, works, process, specs, invite, twelve=False):
    VERSIONS.append(dict(fname=fname, cover=cover_lines, glance=glance, reasons=reasons,
                         works=works, process=process, specs=specs, invite=invite))
    d = Doc(os.path.join(OUT, fname), 'Ritushka — ' + cover_lines[0])
    page_cover(d, COVER, cover_lines)
    page_glance(d, glance['label'], glance['headline'], glance['standfirst'], glance['body'], glance['panel'], glance['rows'])
    page_reasons(d, glance['label'], reasons['headline'], reasons['items'], P3IMG,
                 f'Shoreham · {MED} · {DIM}')
    page_plate(d, PLATE, f'Eruption · {MED} · {DIM}')
    page_works(d, glance['label'], works['headline'], works['standfirst'],
               TWELVE if twelve else SIX, cols=4 if twelve else 3, rows=3 if twelve else 2,
               ih=(48 * MM if twelve else 74 * MM))
    if process['kind'] == 'process':
        page_process(d, glance['label'], process['headline'], process['standfirst'],
                     process['steps'], process['panel'][0], process['panel'][1])
    else:
        page_specs(d, glance['label'], process['headline'], process['left_title'], process['left_rows'],
                   process['right_title'], process['right_rows'], process['terms_title'], process['terms_body'])
    page_specs(d, glance['label'], specs['headline'], specs['left_title'], specs['left_rows'],
               specs['right_title'], specs['right_rows'], specs['terms_title'], specs['terms_body'])
    page_invite(d, invite['headline'], invite['paras'], invite['qr_label'], qr(invite['qr_url'], fname[:12]))
    d.save()
    print('built', fname, round(os.path.getsize(os.path.join(OUT, fname)) / 1e6, 2), 'MB')


WORKS_STD = {
    'headline': 'A working selection.',
    'standfirst': 'Six recent works, chosen to show range of scale and palette rather than to be bought from this page. All works acrylic and oil on canvas or Belgian linen. The full register — dimensions, availability and price — is sent on request against a live project.',
}

# =====================================================================
# 1 — INTERIOR DESIGNERS
# =====================================================================
build(
    'Ritushka-Studio-Profile-Interior-Designers-2026.pdf',
    ['Studio Profile', 'for Interior Designers'],
    dict(label='Studio Profile', panel='At a glance',
         headline='Original artwork, specified like any other finished element.',
         standfirst='Most projects don’t fail on taste. They fail because the right piece is the wrong size, the wrong palette, or six weeks too late.',
         body=[
             'I paint large-scale abstract landscapes and seascapes from a studio in Lane Cove, Sydney. Almost all of it is made for a specific room, in a specific palette, to a specific date.',
             'Designers come to me at the point where the wall is too big, too visible, or too particular for anything available off a gallery floor. I work from your scheme — the joinery, the stone, the textiles, the light at four in the afternoon — and return two or three concepts before anything is committed to canvas.',
             'The work is original, signed, documented and insured to value. It arrives ready to hang. You keep control of the frame, the palette and the date.'],
         rows=[
             ('Scale', '‹800 × 800 mm to 3,000 × 1,800 mm. Larger by arrangement. Diptych and triptych available.›'),
             ('Medium', 'Acrylic and oil on stretched canvas or Belgian linen'),
             ('Palette', 'Worked to your scheme. Sample boards supplied before commencement.'),
             ('Lead time', '‹8–10 weeks from approved concept. 6 weeks expedited where the schedule requires it.›'),
             ('Price', '‹From $2,400 for 800 × 800 mm to $14,000 for 3,000 × 1,800 mm. AUD, ex-GST, ex-freight.›'),
             ('Delivery', 'Sydney metro by hand. Interstate and international by specialist art freight.'),
             ('Trade terms', '‹Trade discount available to registered practices. Applied at invoice, not negotiated per piece.›'),
         ]),
    dict(headline='Three reasons a client pays for an original.',
         items=[
             ('Scale', 'Above about 1,600 mm the market thins out fast, and what remains is usually a print. A painting made to the wall is often the only way to hold a double-height space without filling it with three smaller works that fight each other.'),
             ('Control of the palette', 'A sourced work is a compromise between what exists and what the room needs. A commissioned work starts from your scheme. If the stone shifts warmer at specification stage, the painting shifts with it.'),
             ('It cannot be found anywhere else', 'Clients who have spent two years on a house notice when the artwork is available online. An original with a signed certificate, a title and a documented provenance reads differently — and it is the one element of the scheme that appreciates rather than dates.'),
         ]),
    WORKS_STD,
    dict(kind='process', headline='Five steps. Two approval points. One date.',
         standfirst='Nothing is committed to canvas until you have approved a concept in writing.',
         steps=STEPS, panel=TERMS_PANEL),
    dict(headline='The practical detail.', left_title='The work', left_rows=WORK_ROWS,
         right_title='Logistics', right_rows=LOG_ROWS, terms_title='Trade terms',
         terms_body='‹A trade discount applies to registered design practices on all original work, applied at invoice. Works can be held on approval for up to fourteen days against a confirmed project. Invoicing to the practice or direct to the client, whichever suits the way you bill. ABN 00 000 000 000; GST applies to Australian sales.›'),
    dict(headline='Send me a project and I’ll tell you honestly whether I’m the right studio for it.',
         paras=[
             'If you have a wall you have not solved, send the elevation and the finishes schedule. Within a week you will have two or three works from the register that fit, or a concept sketch if nothing existing does — at no cost, and with no expectation that you proceed.',
             'The studio in Lane Cove is open by appointment, most weekdays. Seeing a three-metre painting in person answers questions a PDF cannot, and it is the fastest way to find out whether this is worth either of our time.'],
         qr_label='Trade enquiry · ritushka.com/trade/interior-designers',
         qr_url='https://www.ritushka.com/trade/interior-designers'),
)

# =====================================================================
# 2 — ART CONSULTANTS
# =====================================================================
build(
    'Ritushka-Studio-Profile-Art-Consultants-2026.pdf',
    ['Studio Profile', 'for Art Consultants'],
    dict(label='Studio Profile', panel='At a glance',
         headline='A studio that works to a brief, a budget and a date.',
         standfirst='You are not looking for an artist to represent. You are looking for one who will not become a problem on a project you are already accountable for.',
         body=[
             'I paint large-scale abstract landscapes and seascapes in Lane Cove, Sydney. The studio produces ‹30–40› original works a year, plus commissioned work made to a supplied brief.',
             'I understand that your obligation is to your client, not to me. What that means in practice: I quote in writing, I hold the date, I don’t approach your client directly, and I don’t undercut the price you have placed the work at.',
             'Palette, scale, orientation and finish are all specifiable. Series of related works for multi-room or multi-unit placements are straightforward — that is most of what the studio does.'],
         rows=[
             ('Available now', '‹18 original works, 800 × 800 mm to 2,400 × 1,500 mm›'),
             ('To brief', 'Palette, scale, orientation, finish. Series of ‹2–20› related works.'),
             ('Lead time', '‹8–10 weeks standard. 6 weeks expedited. Series quoted individually.›'),
             ('Price to trade', '‹Net trade pricing supplied on registration. Retail from $2,400 to $14,000 AUD ex-GST.›'),
             ('Licensing', '‹Available for large-scale reproduction and edition print, licensed per project.›'),
             ('Delivery', 'Australia-wide and international specialist art freight'),
             ('Protocol', 'No direct approach to your client. No price undercutting. Written quotes.'),
         ]),
    dict(headline='Three reasons consultants come back.',
         items=[
             ('The brief is taken literally', 'Send a palette, a dimension and a date and you will get work against those constraints, not an interpretation of them. If a brief cannot be met, you will hear that in the first conversation rather than in week seven.'),
             ('Volume without repetition', 'A series of eight related works for a development is a different problem from eight separate paintings. The studio is set up for it: shared palette, varied composition, consistent finish, delivered together.'),
             ('The relationship is protected', 'Your client stays your client. Enquiries that originate from your project are referred back to you, priced consistently with what you have quoted, and never fulfilled around you.'),
         ]),
    WORKS_STD,
    dict(kind='process', headline='Five steps. Two approval points. One date you can quote to your client.',
         standfirst='Nothing is committed to canvas until the concept is approved in writing.',
         steps=STEPS, panel=TERMS_PANEL),
    dict(headline='The practical detail.', left_title='The work',
         left_rows=WORK_ROWS[:5] + [('Editions', '‹Originals as standard. Limited-edition reproduction available and licensed per project.›')],
         right_title='Logistics', right_rows=LOG_ROWS, terms_title='Consultant terms',
         terms_body='‹Net trade pricing is supplied on registration and is consistent across all consultants — you are never competing against a lower price from the studio. Works can be held for up to twenty-one days against a named project. Consignment considered for confirmed installations. Licensing for large-scale reproduction is available and quoted per project. ABN 00 000 000 000; GST applies to Australian sales.›'),
    dict(headline='Send me a live brief and you’ll have a costed response inside a week.',
         paras=[
             'Palette, dimensions, quantity, budget band, delivery date. You will get back a shortlist of existing work that fits, a concept for anything that needs making, a firm price and a firm date — at no cost and no obligation.',
             'If the answer is that the studio is wrong for the project, you will get that too, in the first reply rather than the fifth.'],
         qr_label='Consultant registration · ritushka.com/trade/art-consultants',
         qr_url='https://www.ritushka.com/trade/art-consultants'),
)

# =====================================================================
# 3 — CORPORATE
# =====================================================================
build(
    'Ritushka-Capability-Statement-Corporate-2026.pdf',
    ['Capability Statement', 'Original Australian artwork for commercial interiors'],
    dict(label='Capability Statement', panel='Capability',
         headline='Original Australian artwork, procured like any other supplied item.',
         standfirst='Artwork is usually the last line on the schedule and the first to cause a problem, because it is bought differently from everything else in the fit-out. It doesn’t have to be.',
         body=[
             'Ritushka Fine Art is a Sydney studio producing original large-scale abstract landscapes and seascapes for commercial interiors — receptions, boardrooms, client floors, lobbies and executive suites.',
             'The studio supplies against a written quote, a fixed delivery date and a purchase order. Every work arrives with a certificate of authenticity, a condition report, an insurance valuation and a high-resolution image file for your asset register.',
             'Work is made to the interior’s palette and to the dimension of the wall, which is generally cheaper than framing three sourced pieces to cover the same span, and considerably faster than importing.'],
         rows=[
             ('Core offer', 'Original large-scale abstract painting, commissioned to brief or supplied from register'),
             ('Scale', '‹800 × 800 mm to 3,000 × 1,800 mm. Multi-panel to any wall dimension.›'),
             ('Lead time', '‹8–10 weeks from approved concept.› Imported artwork typically runs 18–24 weeks.'),
             ('Price band', '‹$2,400 – $14,000 AUD ex-GST per work. Series quoted per project.›'),
             ('Entity', '‹Ritushka Fine Art Pty Ltd · ABN 00 000 000 000 · GST registered›'),
             ('Insurance', '‹Public liability $20,000,000. Works insured in transit to full replacement value.›'),
             ('Terms', '‹Purchase order accepted. 50% deposit, balance on delivery. 30-day terms on approved account.›'),
         ]),
    dict(headline='Three reasons this is a capital decision rather than a decorating one.',
         items=[
             ('The space says something before anyone speaks', 'A reception is read in the first fifteen seconds of a client visit, and read again by every candidate you interview. Original work signals investment and permanence in a way that reproduction does not, because everyone can tell the difference.'),
             ('It is an asset, not a consumable', 'Original artwork is capitalised, valued, insured and retained. It survives a refurbishment, moves to a new tenancy, and is documented for your asset register from day one.'),
             ('Australian, made locally, delivered to schedule', 'Overseas-sourced artwork commonly runs 18–24 weeks and arrives fixed. A Sydney studio delivers in ‹8–10›, to your palette, with a named person accountable for the date.'),
         ]),
    WORKS_STD,
    dict(kind='process', headline='Five steps, two approval points, one delivery date on your programme.',
         standfirst='Price and date are fixed at concept approval and do not move.',
         steps=STEPS, panel=TERMS_PANEL),
    dict(headline='The practical detail.', left_title='The work', left_rows=WORK_ROWS,
         right_title='Logistics', right_rows=LOG_ROWS, terms_title='Procurement',
         terms_body='‹Entity: Ritushka Fine Art Pty Ltd. ABN 00 000 000 000. GST registered. Purchase orders accepted; invoices issued against PO number and payable by EFT. 50% deposit confirms the commission and the delivery date; balance on delivery. Thirty-day terms available on approved account. Public liability insurance $20,000,000 — certificate of currency supplied on request. Installation carried out by insured art installers with SWMS and site induction as required. Each work supplied with certificate of authenticity, condition report, insurance valuation and high-resolution image file for asset registration.›'),
    dict(headline='Send the elevation and the budget line, and you will have a costed proposal in a week.',
         paras=[
             'A written proposal covering concept, dimensions, palette, fixed price, fixed delivery date and installation method — at no cost and with no obligation to proceed.',
             'Site visits across Sydney by arrangement. If the studio is not the right supplier for the project, you will be told in the first conversation.'],
         qr_label='Corporate art services · ritushka.com/trade/corporate',
         qr_url='https://www.ritushka.com/trade/corporate'),
)

# =====================================================================
# 4 — LUXURY HOTELS
# =====================================================================
HOTEL_STEPS = [
    ('Brief', 'Palette, key count, elevations, budget band and the FF&E installation window.', 'Week 0'),
    ('Concept', 'Concepts for public areas and a guestroom scheme, with colour boards keyed to your finishes and a per-key cost.', 'Week 1–3'),
    ('Approval', 'Signed off in writing. Price and delivery window fixed.', 'Week 3'),
    ('Production', 'Public-area originals and the guestroom programme run in parallel. Progress images at the halfway mark.', 'Week 4–12'),
    ('Delivery', 'Consolidated consignment per phase, delivered inside your installation window, framed and ready to hang.', 'Week 13–14'),
]
build(
    'Ritushka-Studio-Profile-Hospitality-2026.pdf',
    ['Studio Profile', 'Hospitality'],
    dict(label='Studio Profile · Hospitality', panel='At a glance',
         headline='An art package that arrives on the FF&E schedule.',
         standfirst='Art is usually specified late, sourced overseas, and lands at 18–24 weeks against a programme that has already moved twice.',
         body=[
             'Ritushka is a Sydney studio producing original abstract landscape and seascape painting for hotels — lobbies, restaurants, suites, corridors and guestroom programmes.',
             'The studio works two ways. Signature originals for public areas, where one large work has to carry a space. And coordinated series or licensed editions for guestroom counts, where forty rooms need work that is related but not identical, at a per-key cost that survives the budget.',
             'Everything is made to your palette, coordinated to your FF&E dates, and delivered in a single consignment per phase.'],
         rows=[
             ('Public areas', 'Original large-scale painting ‹to 3,000 × 1,800 mm›. Multi-panel to any span.'),
             ('Guestrooms', '‹Coordinated series, or licensed edition print on canvas or aluminium, to any key count.›'),
             ('Per key', '‹Edition programmes from $180 per key, framed and ready to hang. Quoted per project.›'),
             ('Lead time', '‹8–10 weeks originals. 10–14 weeks for a full guestroom programme.›'),
             ('Durability', '‹UV-inhibiting varnish. Edition works face-mounted or sealed for high-traffic areas.›'),
             ('Delivery', 'Single consignment per phase, coordinated to the FF&E installation window'),
             ('Entity', '‹Ritushka Fine Art Pty Ltd · ABN 00 000 000 000 · PL $20,000,000›'),
         ]),
    dict(headline='Three reasons this route costs less than it appears to.',
         items=[
             ('The lobby only needs one piece to work', 'Original work in public areas is what guests photograph and what the property is remembered for. It is a small proportion of the art budget doing most of the brand work.'),
             ('Guestrooms need coherence, not uniqueness', 'A coordinated series or a licensed edition gives every room a related work at a per-key cost comparable to imported decorative art — with the difference that it is by a named artist and it is yours alone.'),
             ('Local supply protects the programme', 'Overseas art runs 18–24 weeks and cannot be changed once shipped. A Sydney studio delivers in ‹8–10›, absorbs a palette change at week four, and coordinates delivery to your installation window rather than to a container schedule.'),
         ]),
    WORKS_STD,
    dict(kind='process', headline='Five steps, mapped to your FF&E programme.',
         standfirst='Public-area originals and the guestroom programme run in parallel, not in sequence.',
         steps=HOTEL_STEPS, panel=TERMS_PANEL),
    dict(headline='The practical detail.', left_title='The work',
         left_rows=WORK_ROWS[:5] + [('Guestroom editions', '‹Edition print on canvas, aluminium or acrylic. Face-mounted or sealed. Framed to your specification, supplied with fixings suitable for high-traffic areas.›')],
         right_title='Logistics',
         right_rows=LOG_ROWS[:2] + [('Phasing', '‹Delivery split by phase or tower to match the installation programme at no additional cost.›')] + LOG_ROWS[2:5],
         terms_title='Commercial terms',
         terms_body='‹Entity: Ritushka Fine Art Pty Ltd. ABN 00 000 000 000. GST registered. Purchase orders accepted. 50% deposit confirms the programme and the delivery window; balance on delivery per phase. Public liability insurance $20,000,000 — certificate of currency supplied on request. Works insured in transit to full replacement value. Edition programmes quoted per key, inclusive of framing and fixings. Licensing terms for reproduction supplied with the quotation.›'),
    dict(headline='Send the art schedule and the key count, and you will have a costed package in ten days.',
         paras=[
             'A package covering public-area concepts, a guestroom scheme, a per-key cost, a fixed delivery window mapped to your FF&E programme, and framing and fixing specifications — at no cost and no obligation.',
             'Studio visits in Lane Cove by appointment, and site visits anywhere in Sydney.'],
         qr_label='Hospitality enquiries · ritushka.com/trade/corporate',
         qr_url='https://www.ritushka.com/trade/corporate'),
)

# =====================================================================
# 5 — GALLERIES
# =====================================================================
build(
    'Ritushka-Studio-Introduction-Galleries-2026.pdf',
    ['Studio Introduction', 'Abstract landscape and seascape'],
    dict(label='Studio Introduction', panel='The studio',
         headline='Abstract landscape and seascape, made at scale, in Sydney.',
         standfirst='A coherent body of ‹40›+ works in one language, and a studio producing ‹30–40› a year.',
         body=[
             'I paint abstract landscapes and seascapes in acrylic and oil, mostly large, from a studio in Lane Cove. The work has stayed in one territory for ‹four› years: horizon, water, weather and the moment a landscape stops being a place and becomes a colour.',
             '‹I have sold consistently through direct and commissioned channels, principally to Australian collectors and through interior design practices. I am now looking for gallery representation in Sydney and Melbourne.›',
             'The studio can supply a solo hang of ‹12–18› works, or a consistent supply of ‹6–10› works a year to a stable, alongside commissioned work.'],
         rows=[
             ('Body of work', '‹40+ completed works in one continuous language, 2022–2026›'),
             ('Available', '‹18 works unencumbered, 800 × 800 mm to 2,400 × 1,500 mm›'),
             ('Output', '‹30–40 works a year›'),
             ('Media', 'Acrylic and oil on canvas and Belgian linen'),
             ('Retail band', '‹$2,400 – $14,000 AUD›'),
             ('Representation', '‹Currently unrepresented. Direct and trade sales only.›'),
             ('Studio', 'Lane Cove, Sydney. Works to ‹3,000 × 1,800 mm› can be made and moved.'),
         ]),
    dict(headline='What the paintings are about.',
         items=[
             ('Place', 'The paintings begin from specific places — ‹the coast between Shoreham and the Apostles, and the escarpment west of Sydney› — and are finished away from them. What survives the studio is not the view but the residue of it: the temperature of the light, the weight of the water, the horizon that has stopped being a line.'),
             ('Surface', 'Structurally the work is built in layers — thin glazes over dragged and scraped ground — so the surface holds a history of its own making. At scale, that history becomes the subject. Standing close, the paintings are texture and incident. At six metres they resolve into weather.'),
             ('Title', 'Titles are taken from the language of experience rather than of place — Stillness, Turbulence, Go With The Flow — because the works are about a state rather than a location.'),
         ]),
    dict(headline='Recent work.',
         standfirst='Twelve works from ‹2024–2026›. All acrylic and oil on canvas or Belgian linen. Full register with dimensions, media, provenance and net prices supplied on request.'),
    dict(kind='specs', headline='What the studio can supply.',
         left_title='Supply', left_rows=[
             ('Output', '‹30–40 works a year. A solo hang of 12–18 works can be delivered in 5–6 months from commitment.›'),
             ('Consistency', '‹One continuous body of work since 2022. No stylistic break planned.›'),
             ('Commissions', '‹Commissioned work runs through the gallery at gallery terms, not around it.›'),
             ('Studio', '‹Dedicated studio, Lane Cove. Works to 3,000 × 1,800 mm can be made and moved.›'),
         ],
         right_title='Terms', right_rows=[
             ('Existing channels', '‹Direct and trade sales. Existing collectors and design-practice relationships would be disclosed and handled to the gallery’s preference.›'),
             ('Commission', '‹Open to standard commission terms.›'),
             ('Consignment', '‹Consignment periods and exclusivity by territory negotiable.›'),
             ('Condition', 'Every work signed verso, varnished, wired and supplied with a certificate of authenticity.'),
         ],
         terms_title='Record',
         terms_body='‹Ritushka. b. year, place. Lives and works in Lane Cove, Sydney. — Selected exhibitions: list only what is real; two genuine entries outperform eight group shows. — Collections: private collections, Australia. — Education and press: include only if recent and recognisable, otherwise delete these headings entirely rather than padding them.›'),
    dict(headline='The practical detail.', left_title='The work', left_rows=WORK_ROWS,
         right_title='Logistics', right_rows=LOG_ROWS, terms_title='Note',
         terms_body='High-resolution files, a full register with dimensions, media and provenance, and condition reports for any work shown here are available on request. Studio visits, Lane Cove, most weekdays by appointment.'),
    dict(headline='The studio is twenty minutes from the city and the work is large. It is better seen than sent.',
         paras=[
             'If the work looks like it belongs in the program, come and see it — Lane Cove, most weekdays, by appointment.',
             'The full register with dimensions, media, provenance and prices, and high-resolution files for any work here, are available on request.'],
         qr_label='Full register · ritushka.com/portfolio',
         qr_url='https://www.ritushka.com/portfolio'),
    twelve=True,
)

# ---- export content for the editable DOCX master ----
import json
NAMES = {
    'Ritushka-Studio-Profile-Interior-Designers-2026.pdf': 'Version 1 — Interior Designers (master)',
    'Ritushka-Studio-Profile-Art-Consultants-2026.pdf': 'Version 2 — Art Consultants',
    'Ritushka-Capability-Statement-Corporate-2026.pdf': 'Version 3 — Corporate Buyers',
    'Ritushka-Studio-Profile-Hospitality-2026.pdf': 'Version 4 — Luxury Hotels',
    'Ritushka-Studio-Introduction-Galleries-2026.pdf': 'Version 5 — Galleries',
}
PURPOSE = {
    1: 'Buy three seconds. One image, one typographic panel, no sell.',
    2: 'Survive the six-second scan, alone, with no other page. The load-bearing page.',
    3: 'Give the reader language they can repeat to someone else.',
    4: 'Pacing and proof. One painting, full bleed, no interference.',
    5: 'Show range and consistency at once. This page replaces the portfolio.',
    6: 'Convert an unbounded risk into a bounded one.',
    7: 'Answer every operational question before it becomes a silence.',
    8: 'One bounded, low-cost ask that is easy to accept.',
}
out = {'versions': []}
for v in VERSIONS:
    g, r, w, pr, sp, iv = v['glance'], v['reasons'], v['works'], v['process'], v['specs'], v['invite']
    pages = [
        dict(n=1, title='Cover', purpose=PURPOSE[1],
             body=['RITUSHKA'] + v['cover'] + ['Sydney · 2026']),
        dict(n=2, title='At a glance', purpose=PURPOSE[2], headline=g['headline'],
             standfirst=g['standfirst'], body=g['body'], panelTitle=g['panel'], panel=g['rows']),
        dict(n=3, title='The argument', purpose=PURPOSE[3], headline=r['headline'],
             items=r['items'], caption='Shoreham · acrylic and oil on canvas · ‹H × W cm›'),
        dict(n=4, title='Plate', purpose=PURPOSE[4],
             caption='Eruption · acrylic and oil on canvas · ‹H × W cm›'),
        dict(n=5, title='Selected works', purpose=PURPOSE[5], headline=w['headline'],
             standfirst=w['standfirst'],
             body=['Caption format for every image: Title / ‹H × W cm› · ‹Available›']),
    ]
    if pr['kind'] == 'process':
        pages.append(dict(n=6, title='Commission process', purpose=PURPOSE[6], headline=pr['headline'],
                          standfirst=pr['standfirst'],
                          steps=[['%02d' % (i + 1), s2[0], s2[1], s2[2]] for i, s2 in enumerate(pr['steps'])],
                          terms=[pr['panel'][0], pr['panel'][1]]))
    else:
        pages.append(dict(n=6, title=pr['headline'], purpose='What the studio can supply.',
                          headline=pr['headline'],
                          blocks=[[pr['left_title'], pr['left_rows']], [pr['right_title'], pr['right_rows']]],
                          terms=[pr['terms_title'], pr['terms_body']]))
    pages.append(dict(n=7, title='Specifications', purpose=PURPOSE[7], headline=sp['headline'],
                      blocks=[[sp['left_title'], sp['left_rows']], [sp['right_title'], sp['right_rows']]],
                      terms=[sp['terms_title'], sp['terms_body']]))
    pages.append(dict(n=8, title='Invitation', purpose=PURPOSE[8], headline=iv['headline'],
                      body=iv['paras'],
                      contact=['Ritushka', 'Lane Cove, Sydney NSW, Australia', 'studio@ritka.net',
                               '+61 403 835 467', 'ritushka.com'],
                      qr=iv['qr_label']))
    out['versions'].append(dict(name=NAMES[v['fname']], coverTitle=' — '.join(v['cover']), pages=pages))
json.dump(out, open('/tmp/docx_content.json', 'w'), ensure_ascii=False, indent=1)
print('done')
