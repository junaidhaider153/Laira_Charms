import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { OptionSelector } from "./OptionSelector";
import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";
import { FIXTURE_OPTION_GROUPS } from "@/lib/customization/fixtures";

const addItemMock = vi.fn();
const openDrawerMock = vi.fn();

vi.mock("@/context/cart-context", () => ({
  useCart: () => ({
    addItem: addItemMock,
    openDrawer: openDrawerMock,
    items: [],
  }),
}));

describe("OptionSelector Component", () => {
  const customizableProduct = FIXTURE_PRODUCTS.find((p) => p.id === "prod-004")!;
  const optionGroups = FIXTURE_OPTION_GROUPS["prod-004"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders customization option groups, swatches, and character counter", () => {
    render(<OptionSelector product={customizableProduct} groups={optionGroups} />);

    expect(screen.getByText("Clay Palette Shade")).toBeInTheDocument();
    expect(screen.getByText("Custom Stamped Name")).toBeInTheDocument();
    expect(screen.getByText("Hardware Finish")).toBeInTheDocument();
    expect(screen.getByText("0/10")).toBeInTheDocument();
  });

  it("updates live unit price dynamically when hardware finish with delta is selected", () => {
    render(<OptionSelector product={customizableProduct} groups={optionGroups} />);

    // Initial base price is Rs. 1,800
    expect(screen.getAllByText("Rs. 1,800").length).toBeGreaterThanOrEqual(1);

    // Select Silver Heart Keychain Ring (+Rs. 50)
    const silverHeartBtn = screen.getByRole("button", { name: /Silver Heart Keychain Ring/i });
    fireEvent.click(silverHeartBtn);

    // Price should now recalculate to Rs. 1,850
    expect(screen.getAllByText("Rs. 1,850").length).toBeGreaterThanOrEqual(1);
  });

  it("displays validation error when attempting to add without entering required custom name", () => {
    render(<OptionSelector product={customizableProduct} groups={optionGroups} />);

    const addToBagBtn = screen.getByRole("button", { name: /Add Custom Keepsake/i });
    fireEvent.click(addToBagBtn);

    // Error message should appear
    expect(screen.getByRole("alert")).toHaveTextContent(/Custom Stamped Name is required/i);
    expect(addItemMock).not.toHaveBeenCalled();
  });

  it("adds customized item with canonical configuration to bag when valid", () => {
    render(<OptionSelector product={customizableProduct} groups={optionGroups} />);

    // Type custom name
    const textInput = screen.getByPlaceholderText(/e.g. LAIRA/i);
    fireEvent.change(textInput, { target: { value: "ZAHRA" } });

    // Select Rose Gold Lobster Hook (+Rs. 100)
    const roseGoldBtn = screen.getByRole("button", { name: /Rose Gold Lobster Hook/i });
    fireEvent.click(roseGoldBtn);

    // Add to bag
    const addToBagBtn = screen.getByRole("button", { name: /Add Custom Keepsake/i });
    fireEvent.click(addToBagBtn);

    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "prod-004",
        title: customizableProduct.title,
        unitPriceMinor: 190000, // Rs. 1,800 base + Rs. 100 delta = Rs. 1,900
        customText: "ZAHRA",
      })
    );
    expect(openDrawerMock).toHaveBeenCalledTimes(1);
  });
});

