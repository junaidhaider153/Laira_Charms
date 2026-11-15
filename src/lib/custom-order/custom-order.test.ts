import { describe, it, expect } from "vitest";
import {
  createCustomRequestSchema,
  isDeliveryDateAcceptable,
} from "./schemas";
import {
  createCustomRequest,
  getQuotationById,
  respondToQuotation,
} from "./custom-order-service";

describe("Custom Order & Quotation Logic", () => {
  it("validates Pakistani phone formats strictly", () => {
    // Valid phone numbers
    expect(
      createCustomRequestSchema.safeParse({
        title: "Calico Cat",
        brief: "Detailed sculpture brief with over 15 characters minimum.",
        customerName: "Fatima Tariq",
        customerEmail: "fatima@example.com",
        customerPhone: "03001234567",
      }).success
    ).toBe(true);

    expect(
      createCustomRequestSchema.safeParse({
        title: "Calico Cat",
        brief: "Detailed sculpture brief with over 15 characters minimum.",
        customerName: "Fatima Tariq",
        customerEmail: "fatima@example.com",
        customerPhone: "+923001234567",
      }).success
    ).toBe(true);

    // Invalid phone numbers
    expect(
      createCustomRequestSchema.safeParse({
        title: "Calico Cat",
        brief: "Detailed sculpture brief with over 15 characters minimum.",
        customerName: "Fatima Tariq",
        customerEmail: "fatima@example.com",
        customerPhone: "12345", // too short
      }).success
    ).toBe(false);

    expect(
      createCustomRequestSchema.safeParse({
        title: "Calico Cat",
        brief: "Detailed sculpture brief with over 15 characters minimum.",
        customerName: "Fatima Tariq",
        customerEmail: "fatima@example.com",
        customerPhone: "02131234567", // landline
      }).success
    ).toBe(false);
  });

  it("enforces minimum 7 days studio craft lead time on requested delivery date", () => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const inTenDays = new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0];

    expect(isDeliveryDateAcceptable(today)).toBe(false);
    expect(isDeliveryDateAcceptable(tomorrow)).toBe(false);
    expect(isDeliveryDateAcceptable(inTenDays)).toBe(true);
  });

  it("creates custom request and returns secure guest token for unauthenticated customers", async () => {
    const { request, guestToken, trackingUrl } = await createCustomRequest({
      title: "Miniature Pet Commission",
      brief: "Hand-sculpted miniature corgi in polymer clay with gold star swivel.",
      customerName: "Bilal Khan",
      customerEmail: "bilal@example.com",
      customerPhone: "03211234567",
    });

    expect(request.id).toBeDefined();
    expect(request.status).toBe("submitted");
    expect(guestToken).toBeDefined();
    expect(request.guestTokenHash).toBeDefined();
    expect(trackingUrl).toContain(request.id);
    expect(trackingUrl).toContain("token=");
  });

  it("detects expired quotations and prevents customer acceptance", async () => {
    const expiredQuoteId = "44444444-4444-4444-4444-444444444402";
    const quote = await getQuotationById(expiredQuoteId);

    expect(quote).not.toBeNull();
    expect(quote!.isExpired).toBe(true);

    // Attempting to accept an expired quotation throws an informative error
    await expect(
      respondToQuotation(
        {
          quotationId: expiredQuoteId,
          action: "accept",
          guestToken: "sample-guest-token-123",
        },
        null,
        false
      )
    ).rejects.toThrow(/expired and can no longer be accepted/i);
  });

  it("successfully updates quotation and custom request to accepted on active quote and creates order (H-05)", async () => {
    const activeQuoteId = "44444444-4444-4444-4444-444444444401";

    const result = await respondToQuotation(
      {
        quotationId: activeQuoteId,
        action: "accept",
        guestToken: "sample-guest-token-123",
      },
      null,
      false
    );

    expect(result.success).toBe(true);
    expect(result.quotation.status).toBe("accepted");
    expect(result.quotation.acceptedAt).toBeDefined();
    expect(result.orderUrl).toBeDefined();
  });

  it("blocks accepting an older quotation version when a newer revision exists (H-05)", async () => {
    const olderQuoteId = "44444444-4444-4444-4444-444444444402"; // v1 where v2 exists

    await expect(
      respondToQuotation(
        {
          quotationId: olderQuoteId,
          action: "accept",
          guestToken: "sample-guest-token-123",
        },
        null,
        false
      )
    ).rejects.toThrow();
  });
});

