import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { CatalogFilters } from "./CatalogFilters";
import { FIXTURE_CATEGORIES } from "@/lib/catalog/fixtures";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  usePathname: () => "/shop",
  useSearchParams: () => new URLSearchParams("category=ready-made-charms&type=ready_made"),
}));

describe("CatalogFilters Component", () => {
  it("renders all category filter links", () => {
    render(<CatalogFilters categories={FIXTURE_CATEGORIES} totalProducts={12} />);

    expect(screen.getByRole("link", { name: /All Keepsakes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ready-Made Charms" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Personalized Charms" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Bespoke Atelier" }).length).toBeGreaterThanOrEqual(1);
  });

  it("displays product count and sort dropdown", () => {
    render(<CatalogFilters categories={FIXTURE_CATEGORIES} totalProducts={12} />);

    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort catalog products/i)).toBeInTheDocument();
  });

  it("renders Clear Filters link when filters are active", () => {
    render(<CatalogFilters categories={FIXTURE_CATEGORIES} totalProducts={12} />);

    const clearLink = screen.getByRole("link", { name: /Clear Filters/i });
    expect(clearLink).toBeInTheDocument();
    expect(clearLink).toHaveAttribute("href", "/shop");
  });
});
