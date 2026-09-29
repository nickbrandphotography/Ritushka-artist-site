'use client';
import { useId, useState } from 'react';
import EnquiryForm from './EnquiryForm';
import { formatPrice } from '@/lib/data';
import type { PrintSize } from '@/data/types';

/**
 * The one interactive piece of the print product page (Section 10 — minimal
 * client JS, everything else stays a server component). Real radio inputs,
 * not styled divs, so size selection is keyboard-operable and announced
 * correctly by assistive tech (Section 9).
 */
export default function PrintSizeSelector({ artworkTitle, sizes }: { artworkTitle: string; sizes: PrintSize[] }) {
  const groupName = useId();
  const firstAvailable = sizes.find(s => s.remaining > 0) ?? sizes[0];
  const [selectedTier, setSelectedTier] = useState(firstAvailable?.tier);
  const selected = sizes.find(s => s.tier === selectedTier) ?? firstAvailable;

  if (!selected) return null;

  const dimsLabel = `${selected.heightCm} × ${selected.widthCm} cm (${selected.heightIn} × ${selected.widthIn} in)`;
  const subject = `${artworkTitle} — ${selected.label} print, ${dimsLabel}`;
  const sizeContext = `${selected.label} — ${dimsLabel} — edition of ${selected.editionSize}`;

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Choose a size</legend>
        <div className="mt-3 space-y-3" role="radiogroup" aria-label="Print size">
          {sizes.map(s => {
            const soldOut = s.remaining <= 0;
            const inputId = `${groupName}-${s.tier}`;
            return (
              <label
                key={s.tier}
                htmlFor={inputId}
                className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 text-sm transition-colors ${
                  selected.tier === s.tier ? 'border-ink' : 'border-sand'
                } ${soldOut ? 'cursor-not-allowed opacity-50' : 'hover:border-ink/60'}`}
              >
                <span className="flex items-start gap-3">
                  <input
                    id={inputId}
                    type="radio"
                    name={groupName}
                    value={s.tier}
                    checked={selected.tier === s.tier}
                    disabled={soldOut}
                    onChange={() => setSelectedTier(s.tier)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-ink">{s.label} — {s.heightCm} × {s.widthCm} cm</span>
                    <span className="block text-ink/65">{s.heightIn} × {s.widthIn} in · Edition of {s.editionSize}</span>
                    <span className="block text-ink/65">
                      {soldOut ? 'Sold out' : `${s.remaining} of ${s.editionSize} remaining`}
                    </span>
                  </span>
                </span>
                <span className="whitespace-nowrap font-medium text-ink">{formatPrice(s.price, s.currency)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 rounded-lg border border-sand p-6">
        {selected.remaining > 0 ? (
          <>
            <h2 className="font-serif text-2xl text-ink">Reserve this print</h2>
            <p className="mt-2 text-sm text-ink/65">
              {selected.label} — {formatPrice(selected.price, selected.currency)}, edition {selected.editionSize}, {selected.remaining} remaining.
              Submit a reservation and Ritushka&rsquo;s studio will confirm and invoice within two business days.
            </p>
            <div className="mt-4"><EnquiryForm subject={subject} kind="print" size={sizeContext} /></div>
          </>
        ) : (
          <>
            <h2 className="font-serif text-2xl text-ink">This size is sold out</h2>
            <p className="mt-2 text-sm text-ink/65">
              The {selected.label.toLowerCase()} edition of {artworkTitle} is sold out. Choose another size above, or enquire about future availability.
            </p>
            <div className="mt-4"><EnquiryForm subject={`${artworkTitle} — sold-out ${selected.label} print`} kind="print" /></div>
          </>
        )}
      </div>
    </div>
  );
}
