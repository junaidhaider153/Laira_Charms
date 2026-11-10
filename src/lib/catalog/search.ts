/**
 * Search Tokenizer and Matching Utilities for Laira Charms Catalog.
 * Implements tokenization, punctuation neutralization, and multi-token matching.
 */

export function tokenizeSearchQuery(raw?: string | null): string[] {
  if (!raw) return [];
  const t = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .map((s) => s.trim().slice(0, 40))
    .filter(Boolean);
  return Array.from(new Set(t)).slice(0, 6);
}

export function matchesAllTokens(
  tokens: string[],
  fields: Array<string | undefined | null>
): boolean {
  if (!tokens.length) return true;
  const hay = fields
    .filter((f): f is string => typeof f === "string")
    .join(" ")
    .toLowerCase()
    .replace(/-/g, " ");
  return tokens.every((t) => hay.includes(t));
}

