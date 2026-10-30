import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProductInfo } from "./ProductInfo";
import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";

const addItemMock = vi.fn();
const openDrawerMock = vi.fn();

vi.mock("@/context/cart-context", () => ({
  useCart: () => ({
    addItem: addItemMock,
    openDrawer: openDrawerMock,
    items: [],
  }),
}));

describe("ProductInfo Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ready-made product information with PKR price and lead time", () => {
    const readyMade = FIXTURE_PRODUCTS.find((p) => p.productType === "ready_made")!;
    render(<ProductInfo product={readyMade} />);

    expect(screen.getByRole("heading", { level: 1, name: readyMade.title })).toBeInTheDocument();
    expect(screen.getByText("Rs. 1,200")).toBeInTheDocument();
    expect(screen.getByText(/Ready-Made In Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/In Studio: Dispatches in 24 hours/i)).toBeInTheDocument();
  });

  it("adjusts quantity within stock bounds and adds to bag", () => {
    const readyMade = FIXTURE_PRODUCTS.find((p) => p.productType === "ready_made")!;
    render(<ProductInfo product={readyMade} />);

    const decBtn = screen.getByRole("button", { name: /Decrease quantity/i });
    const incBtn = screen.getByRole("button", { name: /Increase quantity/i });

    // Decrementing at 1 is disabled
    expect(decBtn).toBeDisabled();

    // Increment to 2
    fireEvent.click(incBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Add to bag
    const addBtn = screen.getByRole("button", { name: /Add to Bag/i });
    fireEvent.click(addBtn);

    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: readyMade.id,
        title: readyMade.title,
        basePriceMinor: readyMade.basePriceMinor,
        quantity: 2,
      })
    );
    expect(openDrawerMock).toHaveBeenCalledTimes(1);
  });

  it("renders bespoke atelier commission CTA for bespoke products", () => {
    const bespoke = FIXTURE_PRODUCTS.find((p) => p.productType === "bespoke_quote")!;
    render(<ProductInfo product={bespoke} />);

    expect(screen.getByText(/Bespoke Commission/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Request Custom Commission Quote/i })).toBeInTheDocument();
  });
});
