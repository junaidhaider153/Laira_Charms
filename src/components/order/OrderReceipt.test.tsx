import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderReceipt } from "./OrderReceipt";
import type { Order } from "@/lib/checkout/types";

const mockOrder: Order = {
  id: "order-123",
  reference: "LC-20261115-9988",
  customerId: null,
  guestEmail: "ayesha@example.com",
  guestTokenHash: "hash123",
  shippingAddressSnapshot: {
    fullName: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "03001234567",
    streetAddress: "House 12, Street 4, F-7/2",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    postalCode: "44000",
  },
  subtotalMinor: 250000,
  shippingMinor: 25000,
  totalMinor: 275000,
  currency: "PKR",
  orderStatus: "confirmed",
  paymentStatus: "verified",
  notes: null,
  idempotencyKey: "key-123",
  items: [
    {
      id: "item-1",
      orderId: "order-123",
      productId: "prod-1",
      productTitle: "Personalized Daisy Keychain",
      unitPriceMinor: 250000,
      quantity: 1,
      totalMinor: 250000,
      customizationSnapshot: {
        customText: "Ayesha",
      },
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: "2026-11-15T12:00:00.000Z",
  updatedAt: "2026-11-15T12:00:00.000Z",
};

describe("OrderReceipt Component", () => {
  it("renders statutory invoice details compliant with Section 19 PCPA 2005", () => {
    render(<OrderReceipt order={mockOrder} />);

    // Reference & Seller
    expect(screen.getByText(/Order #LC-20261115-9988/i)).toBeInTheDocument();
    expect(screen.getByText("Laira Charms")).toBeInTheDocument();
    expect(screen.getAllByText(/lairacharmsofficial@gmail.com/i).length).toBeGreaterThanOrEqual(1);

    // Customer info
    expect(screen.getByText("Ayesha Khan")).toBeInTheDocument();
    expect(screen.getByText(/Islamabad, Islamabad Capital Territory 44000/i)).toBeInTheDocument();

    // Items and prices
    expect(screen.getByText("Personalized Daisy Keychain")).toBeInTheDocument();
    expect(screen.getByText(/Stamped: “Ayesha”/i)).toBeInTheDocument();

    // Print button
    expect(screen.getByRole("button", { name: /Print \/ Save Receipt/i })).toBeInTheDocument();

    // Statutory disclosure
    expect(
      screen.getByText(/Consumer Information & Policy Notice \(Punjab Consumer Protection Act 2005\)/i)
    ).toBeInTheDocument();
  });
});
