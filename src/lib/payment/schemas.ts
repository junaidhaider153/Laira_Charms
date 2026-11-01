import { z } from "zod";

export const submitPaymentProofSchema = z.object({
  orderReference: z
    .string()
    .trim()
    .min(5, "Order reference is required"),
  methodId: z.enum(["meezan", "easypaisa", "jazzcash"], {
    errorMap: () => ({ message: "Please select a valid payment method (Meezan Bank, EasyPaisa, or JazzCash)" }),
  }),
  senderName: z
    .string()
    .trim()
    .min(2, "Sender account title must be at least 2 characters")
    .max(100, "Sender account title cannot exceed 100 characters"),
  transactionId: z
    .string()
    .trim()
    .min(3, "Please enter a valid Transaction / Reference ID from your receipt")
    .max(60, "Transaction ID cannot exceed 60 characters"),
  proofPath: z
    .string()
    .trim()
    .min(3, "Payment screenshot proof is required"),
  guestToken: z.string().optional(),
});

export const reviewPaymentSchema = z
  .object({
    paymentId: z.string().uuid("Invalid payment ID"),
    action: z.enum(["verify", "reject"]),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.action === "reject") {
        return Boolean(data.rejectionReason && data.rejectionReason.trim().length >= 5);
      }
      return true;
    },
    {
      message: "A specific rejection reason of at least 5 characters is required when rejecting payment proof.",
      path: ["rejectionReason"],
    }
  );

export type SubmitPaymentProofInputSchema = z.infer<typeof submitPaymentProofSchema>;
export type ReviewPaymentInputSchema = z.infer<typeof reviewPaymentSchema>;

