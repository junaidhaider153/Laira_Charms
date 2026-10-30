import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { QuoteDecisionCard } from "./QuoteDecisionCard";
import type { Quotation, CustomRequest } from "@/lib/custom-order/types";

// Mock the respondToQuotationAction Server Action
vi.mock("@/lib/custom-order/actions", () => ({
  respondToQuotationAction: vi.fn(async (input: { quotationId: string; action: "accept" | "decline" }) => {
    return {
      success: true,
      quotation: {
        id: input.quotationId,
        requestId: "req-1",
        version: 1,
        status: input.action === "accept" ? "accepted" : "declined",
        amountMinor: 380000,
        currency: "PKR",
        scope: "Sample Scope",
        productionDays: 7,
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        createdBy: null,
        acceptedAt: input.action === "accept" ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        isExpired: false,
      },
      message: input.action === "accept" ? "Quotation accepted!" : "Quotation declined.",
    };
  }),
}));

describe("QuoteDecisionCard Component", () => {
  const mockRequest: CustomRequest = {
    id: "req-1",
    customerId: null,
    guestEmail: "fatima@example.com",
    guestTokenHash: "hash123",
    title: "Miniature Calico Cat Charm",
    brief: "Detailed sculpture of our family calico kitten.",
    productReferenceId: null,
    desiredDeliveryDate: null,
    status: "quote_issued",
    assignedAdminId: null,
    media: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const activeQuote: Quotation = {
    id: "quote-active",
    requestId: "req-1",
    version: 1,
    status: "published",
    amountMinor: 380000, // Rs. 3,800
    currency: "PKR",
    scope: "Hand-sculpted calico kitten in polymer clay with gold clasp.",
    productionDays: 7,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdBy: null,
    acceptedAt: null,
    createdAt: new Date().toISOString(),
    isExpired: false,
  };

  const expiredQuote: Quotation = {
    ...activeQuote,
    id: "quote-expired",
    validUntil: new Date(Date.now() - 86400000).toISOString(),
    isExpired: true,
  };

  it("renders active quotation details with formatted PKR total and scope", () => {
    render(
      <QuoteDecisionCard
        quotation={activeQuote}
        request={mockRequest}
        guestToken="test-token"
      />
    );

    expect(screen.getByText("Miniature Calico Cat Charm")).toBeInTheDocument();
    expect(screen.getByText("Rs. 3,800")).toBeInTheDocument();
    expect(screen.getByText(/7 Studio Business Days/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Accept Quotation & Lock Commission/i })
    ).toBeInTheDocument();
  });

  it("disables accept action and displays warning when quotation has expired", () => {
    render(
      <QuoteDecisionCard
        quotation={expiredQuote}
        request={mockRequest}
        guestToken="test-token"
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(/Quote Expired/i);
    expect(
      screen.getByRole("button", { name: /Accept Locked \(Expired\)/i })
    ).toBeDisabled();
  });

  it("calls accept server action and displays success state upon acceptance", async () => {
    render(
      <QuoteDecisionCard
        quotation={activeQuote}
        request={mockRequest}
        guestToken="test-token"
      />
    );

    const acceptBtn = screen.getByRole("button", { name: /Accept Quotation & Lock Commission/i });
    fireEvent.click(acceptBtn);

    const confirmationStatus = await screen.findByRole("status");
    expect(confirmationStatus).toHaveTextContent(/Quotation accepted/i);
  });
});
