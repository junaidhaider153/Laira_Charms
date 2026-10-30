import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage Component", () => {
  it("renders the brand heading and artisanal value story", () => {
    render(<HomePage />);

    const brandHeading = screen.getByRole("heading", {
      name: /Handcrafted keepsakes baked to brighten everyday rituals/i,
    });
    expect(brandHeading).toBeInTheDocument();
    expect(screen.getByText(/Polymer Clay, Resin & Endless Affection/i)).toBeInTheDocument();
  });

  it("provides primary call to action links", () => {
    render(<HomePage />);

    const browseLink = screen.getByRole("link", { name: /Browse Ready-Made Charms/i });
    expect(browseLink).toHaveAttribute("href", "/shop");

    const customLink = screen.getByRole("link", { name: /Request Bespoke Charm/i });
    expect(customLink).toHaveAttribute("href", "/custom-order");
  });

  it("renders feature value propositions", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /100% Handcrafted/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /UV Diamond Glaze/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Personalized Atelier/i })).toBeInTheDocument();
  });
});
