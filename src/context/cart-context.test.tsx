import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { CartProvider, useCart } from "./cart-context";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("initializes with an empty cart and zero subtotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotalMinor).toBe(0);
  });

  it("adds an item and increments itemCount and subtotalMinor", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        productId: "charm-01",
        slug: "strawberry-milk-charm",
        title: "Strawberry Milk Charm",
        basePriceMinor: 150000,
        unitPriceMinor: 150000,
        quantity: 1,
        imageUrl: "/charms/strawberry.png",
        leadTimeDays: 2,
      });
    });

    expect(result.current.itemCount).toBe(1);
    expect(result.current.subtotalMinor).toBe(150000);
    expect(result.current.items[0].title).toBe("Strawberry Milk Charm");
    expect(result.current.isDrawerOpen).toBe(true);
  });

  it("consolidates duplicate items with identical customizations", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        productId: "charm-01",
        slug: "strawberry-milk-charm",
        title: "Strawberry Milk Charm",
        basePriceMinor: 150000,
        unitPriceMinor: 150000,
        quantity: 1,
        imageUrl: "/charms/strawberry.png",
        leadTimeDays: 2,
      });
    });

    act(() => {
      result.current.addItem({
        productId: "charm-01",
        slug: "strawberry-milk-charm",
        title: "Strawberry Milk Charm",
        basePriceMinor: 150000,
        unitPriceMinor: 150000,
        quantity: 2,
        imageUrl: "/charms/strawberry.png",
        leadTimeDays: 2,
      });
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.itemCount).toBe(3);
    expect(result.current.subtotalMinor).toBe(450000);
  });

  it("creates separate entries for items with distinct custom text or options", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        productId: "custom-01",
        slug: "nameplate-charm",
        title: "Nameplate Charm",
        basePriceMinor: 200000,
        unitPriceMinor: 200000,
        quantity: 1,
        imageUrl: "/charms/nameplate.png",
        customText: "Ayesha",
        leadTimeDays: 5,
      });
    });

    act(() => {
      result.current.addItem({
        productId: "custom-01",
        slug: "nameplate-charm",
        title: "Nameplate Charm",
        basePriceMinor: 200000,
        unitPriceMinor: 200000,
        quantity: 1,
        imageUrl: "/charms/nameplate.png",
        customText: "Zara",
        leadTimeDays: 5,
      });
    });

    expect(result.current.items.length).toBe(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.subtotalMinor).toBe(400000);
  });

  it("updates quantity and removes item when quantity reaches zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        productId: "charm-02",
        slug: "peach-bunny-charm",
        title: "Peach Bunny Charm",
        basePriceMinor: 120000,
        unitPriceMinor: 120000,
        quantity: 2,
        imageUrl: "/charms/bunny.png",
        leadTimeDays: 3,
      });
    });

    const itemId = result.current.items[0].id;

    act(() => {
      result.current.updateQuantity(itemId, 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.subtotalMinor).toBe(600000);

    act(() => {
      result.current.updateQuantity(itemId, 0);
    });
    expect(result.current.items.length).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });
});
