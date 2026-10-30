import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CheckoutForm } from "./CheckoutForm";
import { CartProvider } from "@/context/cart-context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockCartItem = {
  id: "prod-peach::sample",
  productId: "prod-peach",
  slug: "peachy-charm",
  title: "Handmade Peach Charm",
  basePriceMinor: 125000,
  unitPriceMinor: 125000,
  quantity: 1,
  imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
  leadTimeDays: 3,
};

describe("CheckoutForm Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders empty bag view when bag is empty", () => {
    render(
      <CartProvider>
        <CheckoutForm />
      </CartProvider>
    );

    expect(screen.getByText(/Your Shopping Bag is Empty/i)).toBeInTheDocument();
  });

  it("renders contact fields and all 7 Pakistani provinces in dropdown", async () => {
    localStorage.setItem("laira_charms_cart_v1", JSON.stringify([mockCartItem]));

    render(
      <CartProvider>
        <CheckoutForm />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pakistani Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Province \/ Region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Postal Code/i)).toBeInTheDocument();

    const provinceSelect = screen.getByLabelText(/Province \/ Region/i) as HTMLSelectElement;
    expect(provinceSelect.options.length).toBe(7);
    expect(screen.getByRole("option", { name: "Punjab" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sindh" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Khyber Pakhtunkhwa" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Balochistan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Islamabad Capital Territory" })).toBeInTheDocument();
  });

  it("renders manual payment instructions callout and place order button", async () => {
    localStorage.setItem("laira_charms_cart_v1", JSON.stringify([mockCartItem]));

    render(
      <CartProvider>
        <CheckoutForm />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Payment Method: Manual Transfer/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Meezan Bank/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Place Order/i })).toBeInTheDocument();
  });
});
