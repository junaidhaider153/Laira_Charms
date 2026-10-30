import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProductMediaGallery } from "./ProductMediaGallery";
import type { CatalogProductMedia } from "@/lib/catalog/types";

const mockMedia: CatalogProductMedia[] = [
  {
    id: "m-1",
    productId: "p-1",
    storagePath: "test-1.jpg",
    publicUrl: "https://example.com/test-1.jpg",
    altText: "Test charm photo 1",
    displayOrder: 0,
  },
  {
    id: "m-2",
    productId: "p-1",
    storagePath: "test-2.jpg",
    publicUrl: "https://example.com/test-2.jpg",
    altText: "Test charm photo 2",
    displayOrder: 1,
  },
];

describe("ProductMediaGallery Component", () => {
  it("renders main visual with touch-pan-y class and thumbnail tabs", () => {
    render(
      <ProductMediaGallery media={mockMedia} title="Artisanal Test Charm" />
    );

    const mainRegion = screen.getByRole("region", { name: /Main product visual/i });
    expect(mainRegion).toBeInTheDocument();
    expect(mainRegion).toHaveClass("touch-pan-y");

    const tabList = screen.getByRole("tablist", { name: /Product image thumbnails/i });
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(2);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("switches active image when thumbnail tab is clicked", () => {
    render(<ProductMediaGallery media={mockMedia} title="Artisanal Test Charm" />);

    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[1]);

    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
  });

  it("opens fullscreen lightbox modal on click and closes on Escape key", () => {
    render(<ProductMediaGallery media={mockMedia} title="Artisanal Test Charm" />);

    // Initially lightbox is not open
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click main image region
    const mainRegion = screen.getByRole("region", { name: /Main product visual/i });
    fireEvent.click(mainRegion);

    // Lightbox should now be visible
    const dialog = screen.getByRole("dialog", { name: /image zoom view/i });
    expect(dialog).toBeInTheDocument();

    // Press Escape key
    fireEvent.keyDown(window, { key: "Escape" });

    // Lightbox should now be dismissed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
