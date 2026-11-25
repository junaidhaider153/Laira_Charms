import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProductCard } from "./ProductCard";
import { CartProvider } from "@/context/cart-context";
import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";

const readyMadeProduct = FIXTURE_PRODUCTS[0]; // Strawberry Milk Carton
const customProduct = FIXTURE_PRODUCTS[3]; // Custom Pastel Nameplate
const bespokeProduct = FIXTURE_PRODUCTS[5]; // Bespoke Pet Portrait

describe("ProductCard Component", () => {
  it("renders ready-made product with in-stock badge, price, and quick-add button", () => {
    render(
      <CartProvider>
        <ProductCard product={readyMadeProduct} />
      </CartProvider>
    );

    expect(screen.getByText("Strawberry Milk Carton Keychain")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("Rs. 1,200")).toBeInTheDocument();

    const quickAddButton = screen.getByRole("button", {
      name: /Quick add Strawberry Milk Carton Keychain to bag/i,
    });
    expect(quickAddButton).toBeInTheDocument();

    fireEvent.click(quickAddButton);
    expect(screen.getByText("Added")).toBeInTheDocument();
  });

  it("renders customizable product with customizable badge and customize action", () => {
    render(
      <CartProvider>
        <ProductCard product={customProduct} />
      </CartProvider>
    );

    expect(screen.getByText("Custom Pastel Nameplate Keychain")).toBeInTheDocument();
    expect(screen.getByText("Customizable")).toBeInTheDocument();
    expect(screen.getByText("Rs. 1,800")).toBeInTheDocument();
    expect(screen.getByText(/Customize →/i)).toBeInTheDocument();
  });

  it("renders bespoke product with starting estimate and bespoke badge", () => {
    render(
      <CartProvider>
        <ProductCard product={bespokeProduct} />
      </CartProvider>
    );

    expect(screen.getByText("Bespoke Pet Portrait Mini Sculpture")).toBeInTheDocument();
    expect(screen.getByText("Bespoke Quote")).toBeInTheDocument();
    expect(screen.getByText("Starting estimate")).toBeInTheDocument();
    expect(screen.getByText("Rs. 3,500")).toBeInTheDocument();
    expect(screen.getByText(/Inquire →/i)).toBeInTheDocument();
  });
});

