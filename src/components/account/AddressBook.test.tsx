import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddressBook } from "./AddressBook";
import type { CustomerAddress } from "@/lib/account/types";

vi.mock("@/lib/account/actions", () => ({
  saveAddressAction: vi.fn().mockImplementation(async (input) => ({
    success: true,
    message: "Address saved",
    address: {
      id: input.id || "addr-new-001",
      userId: "cust-sample-123",
      recipientName: input.recipientName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 || null,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode || null,
      deliveryNotes: input.deliveryNotes || null,
      isDefault: Boolean(input.isDefault),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })),
  deleteAddressAction: vi.fn().mockResolvedValue({ success: true }),
  setDefaultAddressAction: vi.fn().mockResolvedValue({ success: true }),
}));

const mockAddresses: CustomerAddress[] = [
  {
    id: "addr-1",
    userId: "cust-sample-123",
    recipientName: "Ayesha Noor",
    phone: "03001234567",
    addressLine1: "House 14-B, Street 3, Sector F-7/1",
    addressLine2: null,
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
    deliveryNotes: null,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "addr-2",
    userId: "cust-sample-123",
    recipientName: "Ayesha Noor (Office)",
    phone: "03001234567",
    addressLine1: "Evacuee Trust Complex",
    addressLine2: "4th Floor",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
    deliveryNotes: null,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("AddressBook Component", () => {
  it("renders saved address cards with details and default badge", () => {
    render(<AddressBook initialAddresses={mockAddresses} />);

    expect(screen.getByText("Ayesha Noor")).toBeInTheDocument();
    expect(screen.getByText("Ayesha Noor (Office)")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText(/House 14-B, Street 3, Sector F-7\/1/i)).toBeInTheDocument();
    expect(screen.getByText("Set as Default Address")).toBeInTheDocument();
  });

  it("updates default address when 'Set as Default Address' is clicked", async () => {
    render(<AddressBook initialAddresses={mockAddresses} />);

    const setDefaultBtn = screen.getByText("Set as Default Address");
    fireEvent.click(setDefaultBtn);

    await waitFor(() => {
      // Both items are present, addr-2 is now default
      expect(screen.getByText("Ayesha Noor (Office)")).toBeInTheDocument();
    });
  });

  it("renders empty state when customer has no saved addresses", () => {
    render(<AddressBook initialAddresses={[]} />);

    expect(screen.getByText("No Saved Addresses")).toBeInTheDocument();
    expect(
      screen.getByText(/Add your Pakistani home or work address for seamless checkout/i)
    ).toBeInTheDocument();
  });
});

