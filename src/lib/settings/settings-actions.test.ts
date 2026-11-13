import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStoreSettingsAction,
  updateShippingSettingsAction,
  updateBannerSettingsAction,
  updatePaymentSettingsAction,
} from "./settings-actions";
import {
  resetMemorySettings,
  getShippingPolicySettings,
  getBannerSettings,
} from "./settings-service";

vi.mock("@/lib/auth/guards", () => ({
  guardAdmin: vi.fn().mockResolvedValue({
    id: "admin-test",
    role: "admin",
    email: "admin@lairacharms.pk",
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Settings Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMemorySettings();
  });

  it("loads all store settings for admin", async () => {
    const res = await getStoreSettingsAction();
    expect(res.success).toBe(true);
    expect(res.settings?.shippingPolicy.standardRateMinor).toBe(25000);
    expect(res.settings?.banner.isEnabled).toBe(true);
  });

  it("updates shipping policy settings", async () => {
    const res = await updateShippingSettingsAction({
      standardRatePkr: 250,
      freeShippingThresholdPkr: 3000,
      couriers: "TCS, PostEx, Leopard",
      estimatedDays: "2 to 4 business days",
    });

    expect(res.success).toBe(true);
    const updated = await getShippingPolicySettings();
    expect(updated.standardRateMinor).toBe(25000);
    expect(updated.freeShippingThresholdMinor).toBe(300000);
    expect(updated.couriers).toBe("TCS, PostEx, Leopard");
  });

  it("rejects invalid negative shipping rates", async () => {
    const res = await updateShippingSettingsAction({
      standardRatePkr: -50,
      freeShippingThresholdPkr: 3000,
      couriers: "TCS",
      estimatedDays: "3 days",
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain("Shipping fee cannot be negative");
  });

  it("updates announcement banner text and visibility", async () => {
    const res = await updateBannerSettingsAction({
      text: "🎉 New Spring Resin Charms Collection Dropping Friday!",
      isEnabled: true,
    });

    expect(res.success).toBe(true);
    const banner = await getBannerSettings();
    expect(banner.text).toContain("Spring Resin Charms");
  });

  it("updates manual payment transfer instructions", async () => {
    const res = await updatePaymentSettingsAction({
      bankName: "Meezan Bank",
      accountTitle: "Laira Charms Official",
      accountNumber: "1122334455",
      iban: "PK99MEZN11223344556677",
      instructions: "Transfer exact total and upload confirmation slip.",
    });

    expect(res.success).toBe(true);
  });
});

