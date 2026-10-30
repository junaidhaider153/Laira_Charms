import { describe, it, expect } from "vitest";
import { formatMoney, toMinorUnits, cn } from "./utils";

describe("Utils & Money Helpers", () => {
  describe("cn", () => {
    it("should merge tailwind classes properly", () => {
      expect(cn("bg-red-500", "p-4", "p-6")).toBe("bg-red-500 p-6");
      expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
    });
  });

  describe("formatMoney", () => {
    it("should format whole rupee amounts correctly", () => {
      expect(formatMoney(150000)).toBe("Rs. 1,500");
      expect(formatMoney(0)).toBe("Rs. 0");
    });

    it("should format fractional rupee amounts with paisa", () => {
      expect(formatMoney(150050)).toBe("Rs. 1,500.50");
      expect(formatMoney(99)).toBe("Rs. 0.99");
    });

    it("should handle negative amounts safely", () => {
      expect(formatMoney(-50000)).toBe("-Rs. 500");
    });

    it("should handle invalid inputs gracefully", () => {
      expect(formatMoney(NaN)).toBe("PKR 0.00");
    });
  });

  describe("toMinorUnits", () => {
    it("should accurately convert major unit numbers to paisa minor units without float drift", () => {
      expect(toMinorUnits(1500)).toBe(150000);
      expect(toMinorUnits(19.99)).toBe(1999);
      expect(toMinorUnits("250.50")).toBe(25050);
      expect(toMinorUnits("invalid")).toBe(0);
    });
  });
});

