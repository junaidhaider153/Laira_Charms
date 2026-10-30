import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter Component", () => {
  it("renders customer care and policy links", () => {
    render(<SiteFooter />);

    expect(
      screen.getByRole("link", { name: /Shipping & Delivery Policy/i })
    ).toHaveAttribute("href", "/shipping");
    expect(
      screen.getByRole("link", { name: /Returns & Replacement Policy/i })
    ).toHaveAttribute("href", "/returns");
    expect(
      screen.getByRole("link", { name: /Charm Care & FAQ/i })
    ).toHaveAttribute("href", "/faq");
    expect(
      screen.getByRole("link", { name: /Privacy Policy/i })
    ).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("link", { name: /Terms of Service/i })
    ).toHaveAttribute("href", "/terms");
  });

  it("handles newsletter subscription submission", () => {
    render(<SiteFooter />);

    const emailInput = screen.getByLabelText(/Email address for newsletter/i);
    const submitButton = screen.getByRole("button", { name: /Join Collector Club/i });

    fireEvent.change(emailInput, { target: { value: "collector@example.pk" } });
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/Thank you! You're subscribed to studio drops/i)
    ).toBeInTheDocument();
  });
});
