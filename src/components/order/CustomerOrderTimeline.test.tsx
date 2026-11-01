import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerOrderTimeline } from "./CustomerOrderTimeline";

describe("CustomerOrderTimeline Component", () => {
  it("renders all 5 progressive production steps", () => {
    render(
      <CustomerOrderTimeline
        orderStatus="pending_payment"
        paymentStatus="awaiting_payment"
      />
    );

    expect(screen.getByText("Order Placed")).toBeInTheDocument();
    expect(screen.getByText("Payment Verified")).toBeInTheDocument();
    expect(screen.getByText("Studio Crafting")).toBeInTheDocument();
    expect(screen.getByText("Dispatched")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("highlights 'Studio Crafting' as current stage when in_production", () => {
    render(
      <CustomerOrderTimeline
        orderStatus="in_production"
        paymentStatus="verified"
      />
    );

    expect(screen.getByText("Current Stage")).toBeInTheDocument();
    expect(screen.getByText("Studio Crafting")).toBeInTheDocument();
  });

  it("displays courier partner and tracking number when order is shipped", () => {
    render(
      <CustomerOrderTimeline
        orderStatus="shipped"
        paymentStatus="verified"
        notes="Courier: Trax | CN: TRX-99887766 | URL: https://sonic.pk/tracking"
      />
    );

    expect(screen.getByText(/Courier: Trax/i)).toBeInTheDocument();
    expect(screen.getByText("TRX-99887766")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Track Package with Courier/i })).toBeInTheDocument();
  });

  it("displays on hold badge when order is on hold", () => {
    render(
      <CustomerOrderTimeline
        orderStatus="on_hold"
        paymentStatus="rejected"
      />
    );

    expect(screen.getByText(/On Hold/i)).toBeInTheDocument();
  });
});

