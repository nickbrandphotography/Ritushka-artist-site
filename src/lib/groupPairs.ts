/**
 * Groups a list into singles and companion pairs (see src/data/pairs.ts for
 * the artwork/mockup pair lists). A pair only forms when BOTH members
 * (matched by slug) are present in `list` — e.g. two companion artworks
 * with different status only pair up on Portfolio (which lists everything),
 * not on Available/Sold (split by status). Each group keeps the position of
 * whichever member appears first in `list`, but renders in the pair's own
 * declared left/top-first order.
 */
export function groupPairs<T>(
  list: T[], pairs: [string, string][], slugOf: (item: T) => string,
): (T | [T, T])[] {
  const bySlug = new Map(list.map(item => [slugOf(item), item]));
  const consumed = new Set<string>();
  const groups: (T | [T, T])[] = [];
  for (const item of list) {
    const slug = slugOf(item);
    if (consumed.has(slug)) continue;
    const pair = pairs.find(([x, y]) => x === slug || y === slug);
    const first = pair && bySlug.get(pair[0]);
    const second = pair && bySlug.get(pair[1]);
    if (first && second) {
      groups.push([first, second]);
      consumed.add(slugOf(first));
      consumed.add(slugOf(second));
    } else {
      groups.push(item);
      consumed.add(slug);
    }
  }
  return groups;
}
