#!/usr/bin/env python3
"""Write the modelled retail price into "Artwork Records.ods".

The register is the single source of truth for the website: scripts/sync-register.py
reads it and regenerates src/data/*.ts. This script fills the register's List Price
column from pricing.config.json so that one number — the reference rate — drives every
published price.

    price = referenceRate * area_m2 ** sizeExponent      (+ uplift for premium supports)

Cells are edited in place through odfpy so the workbook's formulas, styles and other
sheets survive untouched. In particular "Price per sq cm" is a live formula and is
never written to — it recalculates from List Price when the file is next opened.

Sold works are skipped: their achieved price is not recorded, and the modelled list
price is not what the buyer paid.

Usage:
    python3 scripts/apply-pricing-model.py            # write prices
    python3 scripts/apply-pricing-model.py --dry-run  # show what would change
"""
import json
import os
import sys

from odf.opendocument import load
from odf.table import Table, TableRow, TableCell
from odf.text import P

REGISTER = 'Artwork Records.ods'
SHEET = 'Artwork Register'
CONFIG = 'pricing.config.json'
HEADER_ROW = 1          # row index of the column headings
FIRST_DATA_ROW = 2


MAX_REPEAT = 200   # runs longer than this are trailing filler, never data


def clone_cell(cell):
    copy = TableCell()
    for attr in ('stylename', 'valuetype', 'value', 'formula'):
        v = cell.getAttribute(attr)
        if v is not None:
            copy.setAttribute(attr, v)
    for child in cell.childNodes:
        copy.addElement(P(text=str(child)))
    return copy


def expand(row):
    """Cells of a row indexed by column. Repeated runs are split into individual
    cells so that writing to one column cannot leak across its neighbours."""
    out = []
    for cell in [c for c in row.childNodes if c.qname[1] == 'table-cell']:
        rep = int(cell.getAttribute('numbercolumnsrepeated') or 1)
        if rep == 1:
            out.append(cell)
        elif rep <= MAX_REPEAT:
            cell.removeAttribute('numbercolumnsrepeated')
            out.append(cell)
            anchor = cell
            for _ in range(rep - 1):
                copy = clone_cell(cell)
                row.insertBefore(copy, anchor.nextSibling)
                out.append(copy)
                anchor = copy
        else:
            out.extend([cell] * MAX_REPEAT)   # trailing filler — read only
    return out


def text_of(cell):
    return ''.join(str(p) for p in cell.childNodes).strip()


def set_number(cell, value, display):
    """Replace a cell's content with a float value, keeping its style."""
    for child in list(cell.childNodes):
        cell.removeChild(child)
    cell.setAttribute('valuetype', 'float')
    cell.setAttribute('value', str(value))
    cell.addElement(P(text=display))


def set_text(cell, value):
    for child in list(cell.childNodes):
        cell.removeChild(child)
    cell.setAttribute('valuetype', 'string')
    cell.addElement(P(text=value))


def price_for(area_m2, cfg, premium):
    raw = cfg['referenceRate'] * (area_m2 ** cfg['sizeExponent'])
    if premium:
        raw *= 1 + cfg['premiumSupportUplift']
    step = cfg['roundTo']
    return int(round(raw / step) * step)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    dry = '--dry-run' in sys.argv

    cfg = json.load(open(CONFIG, encoding='utf-8'))
    doc = load(REGISTER)
    sheet = [t for t in doc.spreadsheet.getElementsByType(Table)
             if t.getAttribute('name') == SHEET][0]
    rows = sheet.getElementsByType(TableRow)

    header = [text_of(c) for c in expand(rows[HEADER_ROW])]
    col = {name: header.index(name) for name in
           ('Title', 'Sold', 'Height (mm)', 'Width (mm)', 'Currency', 'List Price',
            'Support / Substrate', 'Sale Price', 'Date Sold') if name in header}
    missing = {'Title', 'Sold', 'Height (mm)', 'Width (mm)', 'Currency',
               'List Price'} - set(col)
    if missing:
        sys.exit(f'register is missing expected columns: {sorted(missing)}')

    written = skipped_sold = skipped_nosize = 0
    report = []
    for i in range(FIRST_DATA_ROW, len(rows)):
        cells = expand(rows[i])
        if len(cells) <= col['List Price']:
            continue
        title = text_of(cells[col['Title']])
        if not title:
            continue

        def val(name):
            c = cells[col[name]]
            return c.getAttribute('value') or text_of(c)

        # A work counts as sold if the Sold column is ticked OR a sale was recorded.
        # The register's Sold column is not always kept up to date.
        sale_evidence = [n for n in ('Sale Price', 'Date Sold')
                         if n in col and text_of(cells[col[n]])]
        if text_of(cells[col['Sold']]).lower() == 'sold' or sale_evidence:
            skipped_sold += 1
            why = ('sold — no price published' if not sale_evidence
                   else 'sold — no price published (from ' + ', '.join(sale_evidence) + ')')
            report.append((title, None, why))
            continue

        try:
            h_mm, w_mm = float(val('Height (mm)')), float(val('Width (mm)'))
        except (TypeError, ValueError):
            skipped_nosize += 1
            report.append((title, None, 'no dimensions recorded'))
            continue

        area = h_mm * w_mm / 1e6                      # mm2 -> m2
        support = (text_of(cells[col['Support / Substrate']])
                   if 'Support / Substrate' in col else '').lower()
        premium = any(k in support for k in cfg['premiumSupportMatch'])
        price = price_for(area, cfg, premium)

        before = cells[col['List Price']].getAttribute('value')
        if not dry:
            set_number(cells[col['List Price']], price, f'{price:,}')
            if not text_of(cells[col['Currency']]):
                set_text(cells[col['Currency']], cfg['currency'])
        written += 1
        note = f'{area:.3f} m2' + (' · premium support +%d%%' %
                                   (cfg['premiumSupportUplift'] * 100) if premium else '')
        if before and float(before) != price:
            note += f' · was {int(float(before)):,}'
        report.append((title, price, note))

    if not dry:
        doc.save(REGISTER)

    width = max(len(t) for t, _, _ in report) if report else 10
    for title, price, note in report:
        shown = f'${price:>7,}' if price else '       —'
        print(f'  {title:<{width}}  {shown}  {note}')
    print(f'\nreference rate ${cfg["referenceRate"]:,}/m2 · exponent {cfg["sizeExponent"]} '
          f'· rounded to ${cfg["roundTo"]}')
    print(f'priced {written} · sold (skipped) {skipped_sold} · no dimensions {skipped_nosize}')
    print('DRY RUN — nothing written' if dry else f'written to {REGISTER}')
    print('next: python3 scripts/sync-register.py')


if __name__ == '__main__':
    main()
