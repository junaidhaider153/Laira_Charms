import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CartView } from "./CartView";
import { CartProvider } from "@/context/cart-context";

describe("CartView Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders empty state when shopping bag has no items", () => {
    render(
      <CartProvider>
        <CartView />
      </CartProvider>
    );

    expect(screen.getByText(/Your Charm Bag is Empty/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore Handmade Collection/i })).toBeInTheDocument();
  });

  it("renders line items with customization badges and subtotal", async () => {
    const testItem = {
      id: "prod-1::test",
      productId: "prod-1",
      slug: "test-charm",
      title: "Miniature Daisy Charm",
      basePriceMinor: 110000,
      unitPriceMinor: 110000,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
      leadTimeDays: 3,
      customization: { Palette: "Rose Quartz" },
      customText: "LARA",
    };
    localStorage.setItem("laira_charms_cart_v1", JSON.stringify([testItem]));

    render(
      <CartProvider>
        <CartView />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Miniature Daisy Charm")).toBeInTheDocument();
    });
    expect(screen.getByText(/Rose Quartz/i)).toBeInTheDocument();
    expect(screen.getByText(/"LARA"/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Proceed to Checkout/i })).toBeInTheDocument();
  });

  it("displays free delivery progress bar indicating remaining amount", async () => {
    const testItem = {
      id: "prod-1::test",
      productId: "prod-1",
      slug: "test-charm",
      title: "Miniature Daisy Charm",
      basePriceMinor: 100000,
      unitPriceMinor: 100000,
      quantity: 1,
      imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
      leadTimeDays: 3,
    };
    localStorage.setItem("laira_charms_cart_v1", JSON.stringify([testItem]));

    render(
      <CartProvider>
        <CartView />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/more to unlock/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/FREE Delivery/i)).toBeInTheDocument();
  });
});
