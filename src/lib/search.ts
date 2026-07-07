/**
 * Filter used by the global command palette (cmdk).
 *
 * cmdk's default filter is subsequence fuzzy matching, which scatter-matches a
 * query's letters across long solution text and returns far too many false
 * positives. Instead, every whitespace-separated query token must appear as a
 * substring of the item's combined searchable value (title, tags, visibility,
 * solution). This is precise and order-independent — "migration prisma" still
 * matches "Prisma migration failed".
 *
 * Returns a cmdk score: `1` to keep the item, `0` to filter it out.
 */
export function paletteFilter(value: string, search: string, keywords?: string[]): number {
  const haystack = `${value} ${keywords?.join(' ') ?? ''}`.toLowerCase()
  const tokens = search.toLowerCase().split(/\s+/).filter(Boolean)
  return tokens.every(token => haystack.includes(token)) ? 1 : 0
}
