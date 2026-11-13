import { describe, it, expect } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("SEO - Robots & Sitemap Configuration", () => {
  it("generates robots.txt rules that protect admin and allow storefront", () => {
    const config = robots();
    expect(config.rules).toBeDefined();

    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    expect(rules.allow).toContain("/products/");
    expect(rules.allow).toContain("/shop");
    expect(rules.disallow).toContain("/admin/");
    expect(rules.disallow).toContain("/account/");
    expect(config.sitemap).toContain("/sitemap.xml");
  });

  it("generates sitemap.xml containing core pages, categories, and products", async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(5);

    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/shop"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/custom-order"))).toBe(true);
    expect(urls.some((u) => u.includes("/products/"))).toBe(true);
  });
});

