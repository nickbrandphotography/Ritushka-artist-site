"""Syncs the site data from the Artwork Register spreadsheet.

Source of truth: "Artwork Records.ods" -> sheet "Artwork Register".
Reads the register, matches each row to the existing artwork entry, and rewrites
src/data/artworks.ts and src/data/mockups.ts with the real recorded values
(dimensions, depth, orientation, framing, description, sold status).

Curated editorial fields (palette, collections, subject line) are preserved.
Nothing is invented: columns left blank in the register stay blank on the site.

Re-run after editing the spreadsheet:  python3 scripts/sync-register.py
"""
import json, os, re, difflib, sys
import pandas as pd

REGISTER = 'Artwork Records.ods'
SHEET = 'Artwork Register'

# Register spellings that supersede the earlier working titles, with the
# typography we want on the site.
TITLE_OVERRIDES = {
    'eruption': 'Eruption',
    'marshmallow': 'Marshmallow',
    'peace-of-white-heaven': 'Peace of White Heaven',
    'tree-of-our-lives': 'Tree of Our Lives',
}
# Old slug -> new slug, for asset renames and 301 redirects.
SLUG_CORRECTIONS = {
    'erruption': 'eruption',
    'mashmellow': 'marshmallow',
    'piece-of-white-heavan': 'peace-of-white-heaven',
    'tree-of-our-life': 'tree-of-our-lives',
}
# Works confirmed sold by the artist whose register row does not yet carry the
# sale. Each entry is a note that the register needs filling in, not a
# permanent fact: once the row records "Sold" or a Sale Price, the entry here
# becomes redundant and should be deleted.
SOLD_OVERRIDES = set()  # Stillness removed 2026-09-29: register row now records the sale


def norm(s):
    s = re.sub(r'[^a-z0-9]', '', str(s).lower())
    # "The World In My Eyes II" and "... 2" are the same painting
    return re.sub(r'ii$', '2', s)


def slugify(s):
    s = str(s).strip().lower()
    s = s.replace('&', ' and ')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def cell(row, hdr, name):
    """Value for a named column, or None when blank."""
    if name not in hdr:
        return None
    v = row[hdr.index(name)]
    if v is None:
        return None
    s = str(v).strip()
    if s == '' or s.lower() == 'nan':
        return None
    return v


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def trim_cm(x):
    """900.0 -> 90, 91.0 -> 91, 76.5 -> 76.5"""
    return int(x) if abs(x - round(x)) < 1e-9 else round(x, 1)


def read_register(path=REGISTER):
    df = pd.read_excel(path, sheet_name=SHEET, header=None, engine='odf')
    hdr = [str(v).strip() for v in df.iloc[1].tolist()]
    out = []
    for i in range(2, df.shape[0]):
        row = df.iloc[i].tolist()
        title = cell(row, hdr, 'Title')
        if not title:
            continue
        h_mm = num(cell(row, hdr, 'Height (mm)'))
        w_mm = num(cell(row, hdr, 'Width (mm)'))
        # The "Sold" column is the primary marker; a recorded Sale Price is
        # equally conclusive. "Status" and "Date Sold" are deliberately ignored:
        # both still carry the workbook template's sample values on the first
        # rows (RIT-0002 shows a Date Sold, invoice number and gallery show that
        # ship with the blank template), which would otherwise retire a work
        # that has never sold.
        sold_flag = cell(row, hdr, 'Sold')
        sale_price = num(str(cell(row, hdr, 'Sale Price') or '').replace(',', '').strip() or None)
        sold = str(sold_flag).strip().lower() == 'sold' or sale_price is not None
        # Orientation is derived from the recorded size when the typed label
        # contradicts it (RIT-0040 was entered "Portrait" at 600 x 1500 mm).
        orient = (str(cell(row, hdr, 'Orientation') or '').strip().lower() or None)
        if h_mm and w_mm:
            by_size = ('square' if abs(h_mm - w_mm) < 1e-9
                       else 'landscape' if w_mm > h_mm else 'portrait')
            if orient != by_size:
                if orient:
                    print(f"   !! {title}: register says {orient} but {h_mm:g} x {w_mm:g} mm "
                          f"is {by_size} — using {by_size}")
                orient = by_size
        frame_desc = (str(cell(row, hdr, 'Frame Description') or '').strip() or None)
        out.append({
            'inventoryId': cell(row, hdr, 'Inventory ID'),
            'title': ' '.join(str(title).split()),
            'description': (str(cell(row, hdr, 'Description') or '').strip() or None),
            'inspiration': (str(cell(row, hdr, 'Inspiration / Location') or '').strip() or None),
            'orientation': orient,
            'heightCm': trim_cm(h_mm / 10) if h_mm else None,
            'widthCm': trim_cm(w_mm / 10) if w_mm else None,
            'depthCm': num(cell(row, hdr, 'Depth (cm)')),
            # A recorded frame description is as good as "Yes" in Framed?.
            'framed': (str(cell(row, hdr, 'Framed?') or '').strip().lower() == 'yes'
                       or frame_desc is not None),
            'frameDescription': frame_desc,
            'edition': (str(cell(row, hdr, 'Edition Type') or '').strip() or None),
            'sold': sold,
            # Published retail price. Written by scripts/apply-pricing-model.py from
            # pricing.config.json — the register stays the single source of truth.
            'price': num(cell(row, hdr, 'List Price')),
            # What the work actually sold for, as recorded in the register.
            # Published on the artwork page — see build_story() below.
            'soldPrice': sale_price,
            'currency': (str(cell(row, hdr, 'Currency') or '').strip() or 'AUD'),
        })
    return out


def load_ts_array(path):
    src = open(path, encoding='utf-8').read()
    return json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])


def write_ts(path, name, type_name, data):
    banner = '// AUTO-GENERATED by scripts/sync-register.py from "Artwork Records.ods".\n'
    body = json.dumps(data, indent=2, ensure_ascii=False)
    open(path, 'w', encoding='utf-8').write(
        f"{banner}import type {{ {type_name} }} from './types';\n"
        f"export const {name}: {type_name}[] = {body};\n")


def inches(cm):
    return round(cm / 2.54, 1)


def money(v, currency='AUD'):
    """5850 -> 'A$5,850'. Whole dollars only — the price list is rounded."""
    symbol = 'A$' if currency == 'AUD' else f'{currency} '
    return f"{symbol}{int(round(v)):,}"


def size_phrase(a):
    if a['heightCm'] is None or a['widthCm'] is None:
        return None
    return (f"{trim_cm(a['heightCm'])} × {trim_cm(a['widthCm'])} cm "
            f"({inches(a['heightCm']):g} × {inches(a['widthCm']):g} in)")


META_MAX = 160  # Google truncates longer descriptions in results

# Singular, readable form of each collection for "an original ___ painting".
KIND = {
    'abstract-landscapes': 'abstract landscape', 'abstract-seascapes': 'abstract seascape',
    'large-scale-paintings': 'large-scale abstract', 'coastal-abstract-art': 'coastal abstract',
    'ocean-inspired-paintings': 'ocean-inspired abstract',
    'contemporary-landscape-art': 'contemporary landscape',
    'textured-abstract-paintings': 'textured abstract', 'blue-abstract-paintings': 'blue abstract',
    'modern-australian-art': 'modern Australian', 'statement-artworks': 'statement abstract',
    'other-works': '',
}


def kind_of(collection_slug):
    k = KIND.get(collection_slug, collection_slug.replace('-', ' '))
    return k


def a_an(word):
    return 'an' if word[:1].lower() in 'aeiou' else 'a'


def fit(parts, limit=META_MAX):
    """Join the required first part with as many optional parts as fit, in order."""
    out = parts[0]
    for p in parts[1:]:
        if p and len(out) + 1 + len(p) <= limit:
            out += ' ' + p
    return out


def artwork_meta(a, kind, subject, price_txt, sold_txt):
    painting = f"{kind} painting" if kind else 'painting'
    cm = (f"{trim_cm(a['heightCm'])} × {trim_cm(a['widthCm'])} cm."
          if a.get('heightCm') is not None and a.get('widthCm') is not None else None)
    status = (f"Sold for {sold_txt}; commissions open." if sold_txt
              else 'Sold; commissions open.' if a['status'] == 'sold'
              else f"{price_txt}, available now." if price_txt
              else 'Enquire for price.')
    subj = subject[0].upper() + subject[1:] + '.' if subject else None
    lead = f"{a['title']}, an original {painting} by Sydney artist Ritushka."
    # Size and price matter most in search results; the subject line adds
    # uniqueness when there is room for it.
    core = fit([lead, cm, status])
    with_subj = fit([lead, subj, cm, status])
    best = with_subj if len(with_subj) > len(core) and cm in with_subj and status in with_subj else core
    return fit([best, 'Ships worldwide.'])


def mockup_meta(title, room, size):
    lead = f"See {title} by Ritushka styled in {a_an(room)} {room.lower()}, shown to scale"
    size_part = f"({size.split(' (')[0]})" if size else None  # cm only; no nested brackets
    tail = '— a placement reference for collectors and designers.'
    with_size = fit([lead, size_part]) if size_part else lead
    return fit([with_size, tail]) if len(with_size) + len(tail) < META_MAX else fit([lead, tail])


def build_story(a, subject):
    """Artist's own words first, then the studio/material context."""
    parts = []
    if a.get('description'):
        d = a['description'].strip()
        parts.append(d if d.endswith(('.', '!', '?', '—')) else d + '.')
    size = size_phrase(a)
    frame = a.get('frameDescription')
    sentence = (f"{a['title']} is an original painting by Ritushka — {subject}, "
                f"worked in {a['palette']}. Built in layers from her Lane Cove studio "
                f"in Sydney, the surface is developed and reworked so that light seems "
                f"to shift across it as you move.")
    parts.append(sentence)
    if size:
        detail = f"The painting measures {size}"
        if a.get('depthCm'):
            detail += f", {trim_cm(a['depthCm'])} cm deep"
        if frame:
            detail += f", and is presented in a {frame[0].lower() + frame[1:]}"
        detail += '.'
        parts.append(detail)
    if a['status'] == 'sold':
        sold_for = (f" for {money(a['soldPrice'], a.get('currency') or 'AUD')}"
                    if a.get('soldPrice') else '')
        parts.append(f"This work sold{sold_for}. A related painting can be commissioned "
                     "in a comparable size and palette.")
    elif a.get('price'):
        parts.append(f"{money(a['price'], a.get('currency') or 'AUD')}"
                     + (' framed' if a.get('framed') else ' unframed')
                     + ', with insured worldwide shipping quoted on request.')
    else:
        parts.append('Price is available on application.')
    # First paragraph is the artist's own description, where one is recorded.
    if a.get('description') and len(parts) > 1:
        return parts[0] + '\n\n' + ' '.join(parts[1:])
    return ' '.join(parts)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)

    reg = read_register()
    art = load_ts_array('src/data/artworks.ts')
    by_norm = {norm(a['title']): a for a in art}
    by_slug = {a['slug']: a for a in art}

    # Preserve the subject clause from the existing story for reuse.
    # Anchored on "by Ritushka — " rather than the first em dash: a title that
    # itself contains "—" (e.g. "Aqua Frost — Thinking of You") used to match
    # early, pulling part of the title into the subject and adding another
    # copy of it on every run. The rsplit also repairs stories that already
    # carry those repeats.
    def subject_of(a):
        m = re.search(r'by Ritushka — (.+?), worked in ', a.get('story', ''))
        return (m.group(1).rsplit('by Ritushka — ', 1)[-1] if m
                else f"an original work in {a['palette']}")

    # Exact matches first, then fuzzy over what is left — one row per artwork.
    matched, unmatched, taken = {}, [], set()
    pending = []
    for r in reg:
        target = by_norm.get(norm(r['title']))
        if target and target['slug'] not in taken:
            matched[target['slug']] = r
            taken.add(target['slug'])
        else:
            pending.append(r)
    for r in pending:
        pool = [k for k, v in by_norm.items() if v['slug'] not in taken]
        cand = difflib.get_close_matches(norm(r['title']), pool, n=1, cutoff=0.6)
        if not cand:
            unmatched.append(r['title'])
            continue
        target = by_norm[cand[0]]
        matched[target['slug']] = r
        taken.add(target['slug'])

    if unmatched:
        print('!! register rows with no artwork on the site:', unmatched)

    slug_changes = {}
    for a in art:
        r = matched.get(a['slug'])
        if not r:
            print('   no register row for:', a['slug'], '- left unchanged')
            continue

        subject = subject_of(a)
        old_slug = a['slug']

        # Title / slug corrections
        new_slug = SLUG_CORRECTIONS.get(old_slug, old_slug)
        if new_slug in TITLE_OVERRIDES:
            a['title'] = TITLE_OVERRIDES[new_slug]
        if new_slug != old_slug:
            slug_changes[old_slug] = new_slug
            a['slug'] = new_slug
            a['image'] = f'/artworks/{new_slug}.jpg'

        # Recorded physical facts. The photograph is used as an independent
        # check: if the recorded ratio is the inverse of the photographed one,
        # height and width were entered the wrong way round.
        h, w = r['heightCm'], r['widthCm']
        if h and w and a.get('imageWidth') and a.get('imageHeight'):
            photo = a['imageWidth'] / a['imageHeight']
            if abs((w / h) - photo) / photo > 0.12 and abs((h / w) - photo) / photo < 0.12:
                print(f"   !! {a['slug']}: height/width look swapped in the register "
                      f"({h} x {w} cm vs a {'landscape' if photo > 1 else 'portrait'} "
                      f"photograph) — using {w} x {h} cm")
                h, w = w, h
                r['orientation'] = 'landscape' if photo > 1 else 'portrait'
        r['heightCm'], r['widthCm'] = h, w

        a['inventoryId'] = r['inventoryId']
        a['heightCm'] = r['heightCm']
        a['widthCm'] = r['widthCm']
        a['depthCm'] = r['depthCm']
        a['heightIn'] = inches(r['heightCm']) if r['heightCm'] else None
        a['widthIn'] = inches(r['widthCm']) if r['widthCm'] else None
        a['depthIn'] = inches(r['depthCm']) if r['depthCm'] else None
        a['framed'] = r['framed']
        a['frameDescription'] = r['frameDescription']
        a['edition'] = r['edition'] or 'Original'
        a['inspiration'] = r['inspiration']
        a['registerDescription'] = r['description']
        if r['orientation'] in ('landscape', 'portrait', 'square'):
            a['orientation'] = r['orientation']
        # A sold work never carries a list price — the modelled list price is not
        # what the buyer paid. What it carries instead is `soldPrice`: the achieved
        # figure from the register's "Sale Price" column, which the site publishes.
        sold = r['sold'] or a['slug'] in SOLD_OVERRIDES
        a['price'] = None if sold or not r['price'] else int(round(r['price']))
        a['soldPrice'] = int(round(r['soldPrice'])) if sold and r['soldPrice'] else None
        a['currency'] = r['currency'] or 'AUD'
        a['status'] = ('sold' if sold
                       else 'available' if a['price'] else 'enquire')

        # Copy that now carries the real size
        size = size_phrase({**a})
        coll = kind_of(a['primaryCollection'])
        a['story'] = build_story({**a, 'description': r['description']}, subject)
        price_txt = money(a['price'], a['currency']) if a['price'] else None
        sold_txt = money(a['soldPrice'], a['currency']) if a['soldPrice'] else None
        a['shortDescription'] = (
            f"{a['title']} — an original {coll} painting by Sydney artist Ritushka"
            + (f", {size}" if size else '')
            + (f", {price_txt}." if price_txt
               else f", sold for {sold_txt}." if sold_txt
               else '.' if size
               else '. Enquire for dimensions and price.'))
        a['metaDescription'] = artwork_meta(a, coll, subject, price_txt, sold_txt)
        a['alt'] = (f"{a['title']} — original {coll} painting by Ritushka in "
                    f"{a['palette']}" + (f", {size}" if size else ''))

    # Fields for works with no register row yet
    for a in art:
        a.setdefault('inventoryId', None)
        a.setdefault('depthCm', None)
        a.setdefault('heightIn', None)
        a.setdefault('widthIn', None)
        a.setdefault('depthIn', None)
        a.setdefault('framed', False)
        a.setdefault('frameDescription', None)
        a.setdefault('edition', 'Original')
        a.setdefault('inspiration', None)
        a.setdefault('registerDescription', None)
        a.setdefault('price', None)
        a.setdefault('soldPrice', None)
        a.setdefault('currency', 'AUD')

    # Mockups follow any slug/title change
    mock = load_ts_array('src/data/mockups.ts')
    for m in mock:
        new = slug_changes.get(m['artworkSlug'])
        a = by_slug.get(m['artworkSlug']) or {}
        if new:
            old = m['artworkSlug']
            m['artworkSlug'] = new
            m['slug'] = new + m['slug'][len(old):]
            m['image'] = f"/mockups/{m['slug']}.jpg"
        title = (by_slug.get(m['artworkSlug']) or a).get('title', m['title'])
        room = m['room']
        size = size_phrase(by_slug.get(m['artworkSlug']) or a) if (by_slug.get(m['artworkSlug']) or a) else None
        m['title'] = f"{title} in {a_an(room)} {room}"
        m['alt'] = (f"{title} by Ritushka displayed in {a_an(room)} {room.lower()}"
                    + (f" — {size}" if size else ''))
        # No "| Ritushka" — the root layout's title template appends it.
        m['seoTitle'] = m['title']
        m['metaDescription'] = mockup_meta(title, room, size)

    for a in art:
        a['mockups'] = [m['slug'] for m in mock if m['artworkSlug'] == a['slug']]

    # Rename image assets for corrected slugs
    for old, new in slug_changes.items():
        for folder in ('public/artworks', 'public/mockups'):
            for f in os.listdir(folder):
                if f.startswith(old):
                    src = os.path.join(folder, f)
                    dst = os.path.join(folder, f.replace(old, new, 1))
                    if src != dst and not os.path.exists(dst):
                        os.rename(src, dst)
                        print('   renamed', src, '->', dst)

    # Collections: replace the "sizes on request" copy with the real range
    cols = load_ts_array('src/data/collections.ts')
    for c in cols:
        works = [a for a in art if c['slug'] in a['collections'] and a['heightCm'] and a['widthCm']]
        if not works:
            continue
        smallest = min(works, key=lambda a: a['heightCm'] * a['widthCm'])
        largest = max(works, key=lambda a: a['heightCm'] * a['widthCm'])
        rng = (f"{trim_cm(smallest['heightCm'])} × {trim_cm(smallest['widthCm'])} cm "
               f"to {trim_cm(largest['heightCm'])} × {trim_cm(largest['widthCm'])} cm")
        avail = sum(1 for a in art if c['slug'] in a['collections'] and a['status'] != 'sold')
        priced = [a['price'] for a in art
                  if c['slug'] in a['collections'] and a.get('price')]
        price_rng = (f"Prices in this collection run from {money(min(priced))} to "
                     f"{money(max(priced))}." if len(priced) > 1
                     else f"Works in this collection are {money(priced[0])}." if priced
                     else 'Price is available on application.')
        c['intro'] = re.sub(
            r'(Dimensions, medium and price for any work are available on request\.'
            r'|Works in this collection range from .*?on application\.'
            r'|Works in this collection range from .*?to \$[\d,]+\.)',
            f"Works in this collection range from {rng}, and every painting page lists its "
            f"exact dimensions, depth and framing. {price_rng}",
            c['intro'], count=1)
        for f in c['faqs']:
            if 'cost' in f['q'].lower() or f['q'].lower().startswith('how much'):
                if len(priced) > 1:
                    f['a'] = (f"Original paintings in this collection are "
                              f"{money(min(priced))} to {money(max(priced))} in Australian "
                              f"dollars, listed on each artwork page. Price follows the size "
                              f"of the work: the smallest are {money(min(priced))} and the "
                              f"largest {money(max(priced))}. Every price includes the frame "
                              f"where the work is framed, and a certificate of authenticity. "
                              f"Insured worldwide shipping is quoted separately. Interior "
                              f"designers and trade buyers can apply for trade terms.")
                elif priced:
                    f['a'] = (f"Original paintings in this collection are {money(priced[0])} "
                              f"in Australian dollars, listed on the artwork page, including "
                              f"the frame and a certificate of authenticity. Insured worldwide "
                              f"shipping is quoted separately.")
            if f['q'].lower().startswith('what sizes'):
                f['a'] = (f"This collection ranges from {rng} — {smallest['title']} is the most "
                          f"intimate and {largest['title']} the largest. Exact height, width, depth "
                          f"and framing are listed on every artwork page, and each work is shown "
                          f"to scale in a room mockup. There are currently {avail} works available "
                          f"in this collection.")
    write_ts('src/data/collections.ts', 'collections', 'Collection', cols)

    write_ts('src/data/artworks.ts', 'artworks', 'Artwork', art)
    write_ts('src/data/mockups.ts', 'mockups', 'Mockup', mock)

    # llms.txt: an explicit, machine-readable index of the works with sizes
    all_priced = [a['price'] for a in art if a.get('price')]
    lines = ['## Original works',
             'Every work is an original painting, framed unless noted, shipped worldwide '
             'insured with a certificate of authenticity. Prices are in Australian dollars'
             + (f", from {money(min(all_priced))} to {money(max(all_priced))}."
                if all_priced else '. Price on application.')]
    for a in sorted(art, key=lambda x: -(x['heightCm'] * x['widthCm'] if x['heightCm'] and x['widthCm'] else 0)):
        size = (f"{trim_cm(a['heightCm'])} x {trim_cm(a['widthCm'])} cm"
                if a['heightCm'] and a['widthCm'] else 'size on request')
        state = (
            (f"sold for {money(a['soldPrice'], a['currency'])}" if a.get('soldPrice') else 'sold')
            if a['status'] == 'sold'
            else f"{money(a['price'], a['currency'])}, available" if a.get('price')
            else 'available, price on application')
        lines.append(f"- {a['title']} — {size}, {state}: /artwork/{a['slug']}")
    block = '\n'.join(lines)
    txt = open('public/llms.txt', encoding='utf-8').read()
    if '## Original works' in txt:
        txt = re.sub(r'## Original works.*?(?=\n## |\Z)', block + '\n\n', txt, flags=re.S)
    else:
        txt = txt.rstrip() + '\n\n' + block + '\n'
    open('public/llms.txt', 'w', encoding='utf-8').write(txt)

    sold = sum(1 for a in art if a['status'] == 'sold')
    sized = sum(1 for a in art if a['heightCm'])
    print(f"register rows {len(reg)} | artworks {len(art)} | with dimensions {sized} | sold {sold}")
    if slug_changes:
        print('slug corrections:', slug_changes)
    json.dump(slug_changes, open('scripts/.slug-redirects.json', 'w'), indent=2)


def _old_of(mapping, new):
    for k, v in mapping.items():
        if v == new:
            return k
    return new


if __name__ == '__main__':
    main()
