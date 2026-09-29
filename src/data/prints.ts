// Limited edition print programme — one entry per artwork released as an
// edition. See docs/prints-decisions.md for the approved facts this
// implements, and src/lib/prints.ts for how sizes, prices and remaining
// counts are derived. This file holds the ONLY thing that should be
// hand-edited per print: `sold`, updated once a reservation is confirmed and
// paid (there is no automated inventory system — see house rule 2.6).
//
// To add a new artwork to the print programme: add its slug here. To remove
// one: delete its entry. Nothing else needs to change.
import type { PrintEditionRecord } from './types';

export const printEditions: PrintEditionRecord[] = [
  { artworkSlug: 'approaching-destination' },
  { artworkSlug: 'aqua-frost-thinking-of-you' },
  { artworkSlug: 'blue-mountains' },
  { artworkSlug: 'bush' },
  { artworkSlug: 'coastal-waters' },
  { artworkSlug: 'deliciousness' },
  { artworkSlug: 'desire' },
  { artworkSlug: 'eruption' },
  { artworkSlug: 'go-with-the-flow' },
  { artworkSlug: 'horizon' },
  { artworkSlug: 'into-the-ever-blue' },
  { artworkSlug: 'just-add-champagne' },
  { artworkSlug: 'life-chooses-you' },
  { artworkSlug: 'marshmallow' },
  { artworkSlug: 'numero-uno' },
  { artworkSlug: 'one-of-a-kind' },
  { artworkSlug: 'paragliding' },
  { artworkSlug: 'peony-thinking-of-me' },
  { artworkSlug: 'peace-of-white-heaven' },
  { artworkSlug: 'plateau' },
  { artworkSlug: 'reflection' },
  { artworkSlug: 'river-of-my-thoughts' },
  { artworkSlug: 'rushing-shallows' },
  { artworkSlug: 'set-sail' },
  { artworkSlug: 'shoreham' },
  { artworkSlug: 'soft-awakening' },
  { artworkSlug: 'softly-loving-dreamscape' },
  { artworkSlug: 'stillness' },
  { artworkSlug: 'strangely-attracted-to-you' },
  { artworkSlug: 'sunrise-over-tokyo' },
  { artworkSlug: 'the-apostles' },
  { artworkSlug: 'the-world-in-my-eyes-2' },
  { artworkSlug: 'the-world-in-my-eyes' },
  { artworkSlug: 'tree-of-our-lives' },
  { artworkSlug: 'turbulence' },
  { artworkSlug: 'turquoise-tuesday' },
  { artworkSlug: 'urban-jungle' },
  { artworkSlug: 'without-sweet-harmony-2' },
  { artworkSlug: 'without-sweet-harmony' },
  { artworkSlug: 'behind-the-scenes' },
];
