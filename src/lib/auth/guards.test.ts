import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { guardAdmin, guardCustomer, DEV_ADMIN_PROFILE } from "./guards";
import * as rbac from "./rbac";
import { SAMPLE_CUSTOMER_USER_ID } from "@/lib/account/address-service";

// Mock next/navigation redirect
const redirectMock = vi.fn((url: string) => {
  const err = new Error(`NEXT_REDIRECT: ${url}`);
  (err as unknown as { digest: string }).digest = `NEXT_REDIRECT;${url}`;
  throw err;
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe("Route guards (guardAdmin & guardCustomer)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("guardAdmin", () => {
    it("redirects signed-out visitor to /login?returnTo=%2Fadmin%2Fproducts in live mode", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";
      vi.spyOn(rbac, "getCurrentProfile").mockResolvedValue(null);

      await expect(guardAdmin("/admin/products")).rejects.toThrow(
        "NEXT_REDIRECT: /login?returnTo=%2Fadmin%2Fproducts"
      );
      expect(redirectMock).toHaveBeenCalledWith("/login?returnTo=%2Fadmin%2Fproducts");
    });

    it("redirects authenticated customer (role !== 'admin') to / in live mode", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";
      vi.spyOn(rbac, "getCurrentProfile").mockResolvedValue({
        id: "user-cust-123",
        email: "customer@example.com",
        display_name: "Customer",
        phone: null,
        role: "customer",
      });

      await expect(guardAdmin("/admin/products")).rejects.toThrow("NEXT_REDIRECT: /");
      expect(redirectMock).toHaveBeenCalledWith("/");
    });

    it("allows authenticated admin in live mode and returns the admin profile", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";
      const adminProfile = {
        id: "user-admin-456",
        email: "admin@example.com",
        display_name: "Admin",
        phone: null,
        role: "admin" as const,
      };
      vi.spyOn(rbac, "getCurrentProfile").mockResolvedValue(adminProfile);

      const result = await guardAdmin("/admin/products");
      expect(result).toEqual(adminProfile);
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("treats profile lookup error as signed-out and redirects to login", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";
      vi.spyOn(rbac, "getCurrentProfile").mockRejectedValue(new Error("Database connection lost"));

      await expect(guardAdmin("/admin/orders")).rejects.toThrow(
        "NEXT_REDIRECT: /login?returnTo=%2Fadmin%2Forders"
      );
      expect(redirectMock).toHaveBeenCalledWith("/login?returnTo=%2Fadmin%2Forders");
    });

    it("production + placeholder keys fails closed and redirects to /login", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";

      await expect(guardAdmin("/admin/orders")).rejects.toThrow(
        "NEXT_REDIRECT: /login?returnTo=%2Fadmin%2Forders"
      );
      expect(redirectMock).toHaveBeenCalledWith("/login?returnTo=%2Fadmin%2Forders");
    });

    it("dev + placeholder keys passes and returns fallback admin profile", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";

      const result = await guardAdmin("/admin/orders");
      expect(result).toEqual(DEV_ADMIN_PROFILE);
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe("guardCustomer", () => {
    it("redirects signed-out visitor to /login?returnTo=%2Faccount in live mode", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";
      vi.spyOn(rbac, "getCurrentProfile").mockResolvedValue(null);

      await expect(guardCustomer("/account")).rejects.toThrow(
        "NEXT_REDIRECT: /login?returnTo=%2Faccount"
      );
      expect(redirectMock).toHaveBeenCalledWith("/login?returnTo=%2Faccount");
    });

    it("returns real user id for signed-in customer in live mode", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://liveproject.supabase.co";
      vi.spyOn(rbac, "getCurrentProfile").mockResolvedValue({
        id: "real-customer-uuid-789",
        email: "ayesha@example.com",
        display_name: "Ayesha",
        phone: null,
        role: "customer",
      });

      const userId = await guardCustomer("/account");
      expect(userId).toBe("real-customer-uuid-789");
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("production + placeholder keys fails closed and redirects to /login", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";

      await expect(guardCustomer("/account")).rejects.toThrow(
        "NEXT_REDIRECT: /login?returnTo=%2Faccount"
      );
      expect(redirectMock).toHaveBeenCalledWith("/login?returnTo=%2Faccount");
    });

    it("dev + placeholder keys passes and returns sample customer id", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";

      const userId = await guardCustomer("/account");
      expect(userId).toBe(SAMPLE_CUSTOMER_USER_ID);
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });
});

