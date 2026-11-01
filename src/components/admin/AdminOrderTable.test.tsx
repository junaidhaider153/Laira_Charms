import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminOrderTable } from "./AdminOrderTable";
import type { Order } from "@/lib/checkout/types";

const mockOrders: Order[] = [
  {
    id: "ord-test-1",
    reference: "LC-20261031-9988",
    customerId: null,
    guestEmail: "test@example.com",
    guestTokenHash: null,
    shippingAddressSnapshot: {
      fullName: "Maryam Bibi",
      email: "test@example.com",
      phone: "03001234567",
      streetAddress: "House 12",
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      postalCode: "44000",
    },
    subtotalMinor: 180000,
    shippingMinor: 25000,
    totalMinor: 205000,
    currency: "PKR",
    orderStatus: "confirmed",
    paymentStatus: "verified",
    notes: null,
    idempotencyKey: "k1",
    items: [
      {
        id: "item-1",
        orderId: "ord-test-1",
        productId: "p1",
        productTitle: "Test Charm",
        unitPriceMinor: 180000,
        quantity: 1,
        totalMinor: 180000,
        customizationSnapshot: null,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("AdminOrderTable Component", () => {
  it("renders order row with reference, customer name, total, and statuses", () => {
    render(<AdminOrderTable orders={mockOrders} />);

    expect(screen.getByText("LC-20261031-9988")).toBeInTheDocument();
    expect(screen.getByText("Maryam Bibi")).toBeInTheDocument();
    expect(screen.getByText("Rs. 2,050")).toBeInTheDocument();
    expect(screen.getByText("Confirmed & Queued")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Manage →/i })).toBeInTheDocument();
  });

  it("renders empty state when orders array is empty", () => {
    render(<AdminOrderTable orders={[]} />);

    expect(screen.getByText(/No Orders Found in This Queue/i)).toBeInTheDocument();
  });
});
