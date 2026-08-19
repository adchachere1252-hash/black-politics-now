/**
 * Produces equal adjacent sequences for a seamless translateX(-50%) ticker.
 * The ticker contains no interactive control; reduced-motion users receive the
 * same result items in a manually scrollable viewport via CSS.
 */
export function createTickerSequences<T>(items: readonly T[]): [readonly T[], readonly T[]] {
  return [items, items];
}
