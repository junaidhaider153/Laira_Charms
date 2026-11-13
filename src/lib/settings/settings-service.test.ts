import { describe, it, expect, beforeEach } from "vitest";
import {
  getShippingPolicySettings,
  getBannerSettings,
  getAllStoreSettings,
  updateStoreSetting,
  resetMemorySettings,
  DEFAULT_SHIPPING_SETTINGS,
} from "./settings-service";

describe("Store Settings Service", () => {
  beforeEach(() => {
    resetMemorySettings();
  });

  it("retrieves default shipping settings when unconfigured", async () => {
    const shipping = await getShippingPolicySettings();
    expect(shipping.standardRateMinor).toBe(25000); // Rs. 250
    expect(shipping.freeShippingThresholdMinor).toBe(300000); // Rs. 3,000
    expect(shipping.couriers).toContain("TCS");
  });

  it("retrieves default announcement banner", async () => {
    const banner = await getBannerSettings();
    expect(banner.isEnabled).toBe(true);
    expect(banner.text).toContain("Free delivery across Pakistan");
  });

  it("retrieves complete bundle of settings", async () => {
    const all = await getAllStoreSettings();
    expect(all.shippingPolicy).toBeDefined();
    expect(all.banner).toBeDefined();
    expect(all.paymentInstructions).toBeDefined();
    expect(all.paymentInstructions.bankName).toContain("Meezan");
  });

  it("updates setting in memory", async () => {
    await updateStoreSetting("shipping_policy", {
      ...DEFAULT_SHIPPING_SETTINGS,
      standardRateMinor: 25000,
      freeShippingThresholdMinor: 300000,
      couriers: "TCS, PostEx & Call Courier",
    });

    const updated = await getShippingPolicySettings();
    expect(updated.couriers).toBe("TCS, PostEx & Call Courier");
  });
});

