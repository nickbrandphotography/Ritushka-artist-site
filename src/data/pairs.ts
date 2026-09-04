/**
 * Companion artworks meant to be seen together. Wherever both members of a
 * pair appear in the same gallery grid (Portfolio, Available, Sold, a
 * Collection, or the homepage preview), Gallery renders them side by side
 * with a tightened gap instead of the grid's normal spacing, so they read
 * as a set rather than two cards that happen to be adjacent. If only one
 * member is present in a given list (different status or collection), it
 * just renders as a normal single card — see Gallery.tsx.
 *
 * Order within each tuple is the display order (left/top first).
 */
export const artworkPairs: [string, string][] = [
  ['aqua-frost-thinking-of-you', 'peony-thinking-of-me'],
  ['the-world-in-my-eyes', 'the-world-in-my-eyes-2'],
  ['without-sweet-harmony', 'without-sweet-harmony-2'],
];
