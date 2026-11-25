import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SiteHeader } from "./SiteHeader";
import { CartProvider } from "@/context/cart-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => ({ get: () => null }),
}));

const renderHeader = () =>
  render(
    <CartProvider>
      <SiteHeader />
    </CartProvider>
  );

describe("SiteHeader Component", () => {
  it("renders brand logo, title and navigation links flush at the top without an announcement banner", () => {
    const { container } = renderHeader();

    expect(container.firstElementChild?.tagName).toBe("HEADER");
    expect(screen.getByText("Laira Charms")).toBeInTheDocument();
    expect(screen.getByText("Artisanal Keepsakes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Shop Catalog/i })).toHaveAttribute("href", "/shop");
    expect(screen.getByRole("link", { name: /Custom Atelier/i })).toHaveAttribute("href", "/custom-order");
    expect(screen.getByRole("link", { name: /Story & Care/i })).toHaveAttribute("href", "/about");
  });

  it("renders search input, account link, and shopping bag trigger", () => {
    renderHeader();

    expect(screen.getByLabelText(/Search charms/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Profile/i)).toHaveAttribute("href", "/account");
    expect(screen.getByRole("button", { name: /Bag/i })).toBeInTheDocument();
  });

  it("toggles mobile menu drawer when hamburger button is clicked", () => {
    renderHeader();

    const mobileMenuButton = screen.getByLabelText(/Toggle mobile menu/i);
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: /Mobile Navigation/i })).toBeInTheDocument();

    const closeButton = screen.getByLabelText(/Close mobile menu/i);
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog", { name: /Mobile Navigation/i })).not.toBeInTheDocument();
  });
});

