// Limited edition print programme — all derived logic lives here so
// src/data/prints.ts never has to store a size, a price or a remaining count
// by hand (house rule R4 — one source of truth). See docs/prints-decisions.md
// for the approved facts this implements.
import pricingConfig from '../../pricing.config.json';
import { getArtwork } from './data';
import { printEditions } from '@/data/prints';
import type { Artwork, PrintEdition, PrintSize, PrintTier } from '@/data/types';

const TIER_ORDER: PrintTier[] = ['small', 'medium', 'large'];
const TIER_LABEL: Record<PrintTier, string> = { small: 'Small', medium: 'Medium', large: 'Large' };

const LONG_EDGE_CM: Record<PrintTier, number> = pricingConfig.printSizeLongEdgeCm as Record<PrintTier, number>;
const EDITION_SIZE: Record<PrintTier, number> = pricingConfig.printEditionSize as Record<PrintTier, number>;
const TIER_PERCENT: Record<PrintTier, number> = pricingConfig.printTierPercent as Record<PrintTier, number>;
const SIZE_CAP_PERCENT: number = pricingConfig.printSizeCapPercent;
const { referenceRate, sizeExponent, roundTo, printCurrency } = pricingConfig;

const roundToStep = (n: number, step: number): number => Math.round(n / step) * step;
const cmToIn = (cm: number): number => Math.round((cm / 2.54) * 10) / 10;
const round1 = (n: number): number => Math.round(n * 10) / 10;

/**
 * Every size tier this artwork qualifies for, fully priced. A tier is
 * dropped entirely (not shown, not sold) when its target long edge would
 * exceed printSizeCapPercent of the original's own long edge — see
 * docs/prints-decisions.md Section 5. Returns [] for an artwork whose
 * physical dimensions aren't recorded, same "render nothing over a guess"
 * rule the rest of the site follows.
 */
export function computePrintSizes(a: Artwork): Omit<PrintSize, 'sold' | 'remaining'>[] {
  if (a.widthCm == null || a.heightCm == null) return [];
  const originalLongEdge = Math.max(a.widthCm, a.heightCm);
  const cap = originalLongEdge * SIZE_CAP_PERCENT;
  const widthIsLongEdge = a.widthCm >= a.heightCm;
  const aspect = a.widthCm / a.heightCm;

  return TIER_ORDER
    .filter(tier => LONG_EDGE_CM[tier] <= cap)
    .map(tier => {
      const longEdge = LONG_EDGE_CM[tier];
      const widthCm = widthIsLongEdge ? longEdge : longEdge * aspect;
      const heightCm = widthIsLongEdge ? longEdge / aspect : longEdge;
      const areaM2 = (widthCm * heightCm) / 10000;
      const referenceValue = referenceRate * Math.pow(areaM2, sizeExponent);
      const price = roundToStep(referenceValue * TIER_PERCENT[tier], roundTo);
      return {
        tier,
        label: TIER_LABEL[tier],
        widthCm: round1(widthCm),
        heightCm: round1(heightCm),
        widthIn: cmToIn(widthCm),
        heightIn: cmToIn(heightCm),
        editionSize: EDITION_SIZE[tier],
        price,
        currency: printCurrency,
        sku: `${a.inventoryId ?? a.slug.toUpperCase()}-PRINT-${tier.toUpperCase()}`,
      };
    });
}

/** Full print edition for one artwork, combining computed sizes with the
 *  hand-maintained sold count. Undefined if the artwork isn't in the
 *  programme, doesn't exist, or has no dimensions recorded to size prints from. */
export function getPrintEdition(slug: string): PrintEdition | undefined {
  const record = printEditions.find(p => p.artworkSlug === slug);
  const artwork = getArtwork(slug);
  if (!record || !artwork) return undefined;
  const sizes: PrintSize[] = computePrintSizes(artwork).map(s => {
    const sold = record.sold?.[s.tier] ?? 0;
    return { ...s, sold, remaining: Math.max(0, s.editionSize - sold) };
  });
  if (sizes.length === 0) return undefined;
  return {
    artwork,
    sizes,
    fromPrice: Math.min(...sizes.map(s => s.price)),
    soldOut: sizes.every(s => s.remaining <= 0),
  };
}

/** Every print edition in the programme, in the order declared in prints.ts. */
export function allPrintEditions(): PrintEdition[] {
  return printEditions
    .map(r => getPrintEdition(r.artworkSlug))
    .filter((e): e is PrintEdition => e !== undefined);
}

export function isInPrintProgramme(slug: string): boolean {
  return printEditions.some(p => p.artworkSlug === slug);
}

/** The specification, signing, authentication and fulfilment facts common to
 *  every print in the programme — decided once in docs/prints-decisions.md,
 *  never re-typed per page or per component. */
export const PRINT_SPECIFICATION = {
  process: 'Archival pigment giclée',
  paper: 'Hahnemühle Photo Rag 308gsm, 100% cotton rag (or an equivalent archival cotton rag paper)',
  ink: 'Archival pigment ink',
  medium: 'Fine art paper — not canvas, so a print is never mistaken for the original painting',
  signing: 'Hand-signed by the artist in pencil, lower right margin',
  numbering: 'Numbered n / N in pencil, lower left margin — each size is its own numbered edition',
  certificate: 'A certificate of authenticity is issued with every print, referencing the original work’s inventory ID',
  framing: 'Shipped unframed by default; framing is genuinely custom — its price and timeline are quoted separately once you tell us what you have in mind, through the same Sydney framing partners used for originals',
  fulfilment: 'Printed to order in Sydney — packed rolled in a protective tube for larger sizes, flat in a rigid mailer for smaller ones',
  leadTime: 'The prices and sizes above are for an unframed print. An estimated 10–15 business days domestically, up to 4 weeks internationally, once your reservation is confirmed — an estimate pending your print partner’s own confirmation, not a guaranteed date. Framing or any other customisation is quoted with its own price and its own timeline, confirmed with you directly before anything is ordered',
} as const;

/** The commitments that structurally protect the originals — shown on the
 *  collection page as "the edition promise" (Section 6). */
export const PRINT_EDITION_PROMISE: string[] = [
  'Every print size is capped well below the scale of the original painting — a print is never offered at, or near, the original’s own dimensions.',
  'Each size is its own fixed, numbered edition. The edition size is set before the first print is made and is never quietly expanded.',
  'Every print is hand-signed and numbered n / N by the artist.',
  'Sold out stays sold out. Once an edition’s numbers are gone, that size is not reopened.',
];

/** Approved wording for a print of a sold original — see
 *  docs/prints-decisions.md Section 12. Never write a different claim about
 *  where a sold original now is. */
export const soldOriginalPrintNote = (title: string): string =>
  `The original ${title} has sold to a private collector. This limited edition print lets the image live on — hand-signed and numbered.`;
