import { describe, it, expect } from "vitest";
import { validateAndCalculateCustomization } from "./calculator";
import { getOptionGroupsForProduct } from "./service";
import { FIXTURE_OPTION_GROUPS } from "./fixtures";

describe("Customization Calculator & Server-Authoritative Price Engine", () => {
  const product = {
    id: "prod-004",
    basePriceMinor: 180000, // Rs. 1,800
  };
  const groups = FIXTURE_OPTION_GROUPS["prod-004"];

  it("calculates exact unit price in paisa minor units when valid selections are made", () => {
    // Base: Rs. 1,800 (180,000)
    // Hardware: Silver Heart Keychain (+Rs. 50 / 5,000)
    // Addon: Mini Clay Daisy Bell (+Rs. 150 / 15,000)
    // Total should be Rs. 2,000 (200,000 paisa)
    const result = validateAndCalculateCustomization(product, groups, {
      options: {
        "grp-004-color": "val-color-pink",
        "grp-004-clasp": "val-clasp-silver-heart",
        "grp-004-addon": "val-addon-daisy",
      },
      customText: "LAIRA",
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.calculatedUnitPriceMinor).toBe(200000);
    expect(result.canonicalCustomText).toBe("LAIRA");
    expect(result.selectedBreakdown.length).toBe(4);
  });

  it("rejects customization when required choice option is missing", () => {
    const result = validateAndCalculateCustomization(product, groups, {
      options: {
        // Missing "grp-004-color"
        "grp-004-clasp": "val-clasp-star",
      },
      customText: "AYESHA",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors["grp-004-color"]).toBeDefined();
    expect(result.errors["grp-004-color"]).toContain("Please select an option");
  });

  it("rejects customization when required text input is empty", () => {
    const result = validateAndCalculateCustomization(product, groups, {
      options: {
        "grp-004-color": "val-color-mint",
        "grp-004-clasp": "val-clasp-star",
      },
      customText: "   ",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors["grp-004-name"]).toBeDefined();
    expect(result.errors["grp-004-name"]).toContain("is required");
  });

  it("rejects text that exceeds maximum character length", () => {
    const result = validateAndCalculateCustomization(product, groups, {
      options: {
        "grp-004-color": "val-color-mint",
        "grp-004-clasp": "val-clasp-star",
      },
      customText: "TOOLONGNAME123", // 14 chars, max is 10
    });

    expect(result.isValid).toBe(false);
    expect(result.errors["grp-004-name"]).toContain("cannot exceed 10 characters");
  });

  it("rejects text containing illegal symbols", () => {
    const result = validateAndCalculateCustomization(product, groups, {
      options: {
        "grp-004-color": "val-color-mint",
        "grp-004-clasp": "val-clasp-star",
      },
      customText: "LAIRA$#",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors["grp-004-name"]).toContain("contains invalid characters");
  });

  it("retrieves option groups for configured product", async () => {
    const fetchedGroups = await getOptionGroupsForProduct("prod-004");
    expect(fetchedGroups.length).toBeGreaterThanOrEqual(3);
    expect(fetchedGroups[0].name).toBe("Clay Palette Shade");
  });
});
