import { describe, it, expect } from "vitest";
import { isAdmin } from "./rbac";

describe("Role-Based Access Control (RBAC)", () => {
  describe("isAdmin", () => {
    it("should return true for admin profile", () => {
      expect(isAdmin({ role: "admin" })).toBe(true);
    });

    it("should return false for customer profile", () => {
      expect(isAdmin({ role: "customer" })).toBe(false);
    });

    it("should return false for undefined or null profile", () => {
      expect(isAdmin(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });
});
