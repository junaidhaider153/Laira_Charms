import { describe, it, expect, beforeEach } from "vitest";
import {
  listAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  MEMORY_ADDRESSES,
} from "./address-service";
import type { PakistaniProvince } from "@/lib/checkout/types";

describe("Customer Address Service", () => {
  const testUserId = "cust-test-user-456";

  beforeEach(() => {
    MEMORY_ADDRESSES.set(testUserId, []);
  });

  it("automatically sets first saved address as default", async () => {
    const address = await saveAddress(testUserId, {
      recipientName: "Fatima Ali",
      phone: "03211234567",
      addressLine1: "House 24, Block C, Gulberg III",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
      isDefault: false, // even if passed false, first address becomes default
    });

    expect(address.isDefault).toBe(true);

    const addresses = await listAddresses(testUserId);
    expect(addresses.length).toBe(1);
    expect(addresses[0].recipientName).toBe("Fatima Ali");
    expect(addresses[0].isDefault).toBe(true);
  });

  it("enforces single default invariant when saving a second default address", async () => {
    // 1. Save first address
    const addr1 = await saveAddress(testUserId, {
      recipientName: "Fatima Ali (Home)",
      phone: "03211234567",
      addressLine1: "House 24, Block C, Gulberg III",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
    });

    // 2. Save second address as default
    const addr2 = await saveAddress(testUserId, {
      recipientName: "Fatima Ali (Office)",
      phone: "03211234567",
      addressLine1: "Floor 3, Siddiq Trade Centre, Main Boulevard",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54000",
      isDefault: true,
    });

    const addresses = await listAddresses(testUserId);
    expect(addresses.length).toBe(2);

    // addr2 must be default, addr1 must NOT be default
    const updatedAddr1 = addresses.find((a) => a.id === addr1.id);
    const updatedAddr2 = addresses.find((a) => a.id === addr2.id);

    expect(updatedAddr2?.isDefault).toBe(true);
    expect(updatedAddr1?.isDefault).toBe(false);

    // Default address is first in sorted list
    expect(addresses[0].id).toBe(addr2.id);
  });

  it("reassigns default to next remaining address when default is deleted", async () => {
    const addr1 = await saveAddress(testUserId, {
      recipientName: "First Default",
      phone: "03331234567",
      addressLine1: "Street 10, Clifton",
      city: "Karachi",
      province: "Sindh",
      isDefault: true,
    });

    const addr2 = await saveAddress(testUserId, {
      recipientName: "Second Address",
      phone: "03331234567",
      addressLine1: "Street 20, DHA Phase 5",
      city: "Karachi",
      province: "Sindh",
      isDefault: false,
    });

    // Delete the default address (addr1)
    await deleteAddress(testUserId, addr1.id);

    const remaining = await listAddresses(testUserId);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(addr2.id);
    expect(remaining[0].isDefault).toBe(true);
  });

  it("explicitly sets default address using setDefaultAddress", async () => {
    const addr1 = await saveAddress(testUserId, {
      recipientName: "Home",
      phone: "03001234567",
      addressLine1: "House 1",
      city: "Peshawar",
      province: "Khyber Pakhtunkhwa",
    });

    const addr2 = await saveAddress(testUserId, {
      recipientName: "Hostel",
      phone: "03001234567",
      addressLine1: "Room 10",
      city: "Peshawar",
      province: "Khyber Pakhtunkhwa",
    });

    expect(addr1.isDefault).toBe(true);
    expect(addr2.isDefault).toBe(false);

    await setDefaultAddress(testUserId, addr2.id);

    const updated = await listAddresses(testUserId);
    expect(updated[0].id).toBe(addr2.id);
    expect(updated[0].isDefault).toBe(true);
  });

  it("rejects invalid Pakistani phone number or province", async () => {
    await expect(
      saveAddress(testUserId, {
        recipientName: "Invalid Phone",
        phone: "12345",
        addressLine1: "Street 1",
        city: "Lahore",
        province: "Punjab",
      })
    ).rejects.toThrow(/valid Pakistani mobile number/i);

    await expect(
      saveAddress(testUserId, {
        recipientName: "Invalid Province",
        phone: "03001234567",
        addressLine1: "Street 1",
        city: "Lahore",
        province: "Invalid Province" as unknown as PakistaniProvince,
      })
    ).rejects.toThrow();
  });
});
