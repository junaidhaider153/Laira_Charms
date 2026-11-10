import { describe, it, expect, vi } from "vitest";
import { tokenizeSearchQuery, matchesAllTokens } from "./search";
import { getProducts } from "./catalog-service";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockRejectedValue(new Error("Use fixtures")),
}));

describe("Search Tokenizer and Matching (search.ts)", () => {
  it("converts uppercase to lowercase and trims tokens", () => {
    const tokens = tokenizeSearchQuery("STRAWBERRY Charm");
    expect(tokens).toEqual(["strawberry", "charm"]);
  });

  it("removes duplicate tokens", () => {
    const tokens = tokenizeSearchQuery("charm charm berry charm");
    expect(tokens).toEqual(["charm", "berry"]);
  });

  it("neutralizes special characters and punctuation safely", () => {
    const tokens = tokenizeSearchQuery("strawberry, charm! (keychain) <script>alert(1)</script>");
    expect(tokens).toContain("strawberry");
    expect(tokens).toContain("charm");
    expect(tokens).toContain("keychain");
    expect(tokens).toContain("script");
    expect(tokens).toContain("alert");
    // Ensure no raw commas or parentheses in tokens
    expect(tokens.every((t) => !t.includes(",") && !t.includes("(") && !t.includes(")"))).toBe(true);
  });

  it("handles blank, whitespace, and null inputs returning empty arrays", () => {
    expect(tokenizeSearchQuery("")).toEqual([]);
    expect(tokenizeSearchQuery("   ")).toEqual([]);
    expect(tokenizeSearchQuery(null)).toEqual([]);
    expect(tokenizeSearchQuery(undefined)).toEqual([]);
  });

  it("caps unique tokens to a maximum of 6", () => {
    const tokens = tokenizeSearchQuery("one two three four five six seven eight nine");
    expect(tokens.length).toBe(6);
    expect(tokens).toEqual(["one", "two", "three", "four", "five", "six"]);
  });

  it("splits hyphenated words into separate tokens", () => {
    const tokens = tokenizeSearchQuery("ready-made");
    expect(tokens).toEqual(["ready", "made"]);
  });

  describe("matchesAllTokens helper", () => {
    it("returns true when tokens is empty", () => {
      expect(matchesAllTokens([], ["Any Field", "Another"])).toBe(true);
    });

    it("returns true when all tokens match across any combined fields", () => {
      expect(matchesAllTokens(["strawberry", "charm"], ["Sweet Strawberry", "Clay charm accessory"])).toBe(true);
    });

    it("returns false if any token is missing", () => {
      expect(matchesAllTokens(["strawberry", "spaceship"], ["Sweet Strawberry", "Clay charm"])).toBe(false);
    });
  });

  describe("getProducts multi-word search integration", () => {
    it("returns results for multi-word queries in any order", async () => {
      const forward = await getProducts({ query: "strawberry charm" });
      const reversed = await getProducts({ query: "charm strawberry" });

      expect(forward.products.length).toBeGreaterThan(0);
      expect(reversed.products.length).toBeGreaterThan(0);
      expect(forward.products.some((p) => p.title.toLowerCase().includes("strawberry"))).toBe(true);
      expect(reversed.products.some((p) => p.title.toLowerCase().includes("strawberry"))).toBe(true);
    });

    it("finds keychains when searched as two words 'key chain'", async () => {
      const res = await getProducts({ query: "key chain" });
      expect(res.products.length).toBeGreaterThan(0);
    });

    it("returns 0 results for non-matching multi-word queries", async () => {
      const res = await getProducts({ query: "strawberry spaceship" });
      expect(res.products.length).toBe(0);
      expect(res.total).toBe(0);
    });

    it("does not crash and handles punctuation safely", async () => {
      const resPunctuation = await getProducts({ query: "a,b" });
      expect(Array.isArray(resPunctuation.products)).toBe(true);

      const resParen = await getProducts({ query: "x)" });
      expect(Array.isArray(resParen.products)).toBe(true);
    });

    it("returns all products when search query is whitespace only", async () => {
      const resAll = await getProducts({});
      const resWhitespace = await getProducts({ query: "   " });
      expect(resWhitespace.total).toBe(resAll.total);
    });
  });
});

