import { z } from "zod";

// Pakistan mobile number regex: matches 03001234567, 0300-1234567, +923001234567
const pkPhoneRegex = /^(?:(?:\+92)|(?:0092)|(?:92)|0)?(3[0-9]{2})[- ]?([0-9]{7})$/;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Name must be at least 2 characters long."),
    email: z.string().trim().email("Please enter a valid email address."),
    phone: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || pkPhoneRegex.test(val),
        "Please enter a valid Pakistani phone number (e.g., 0300-1234567)."
      )
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter.")
      .regex(/[0-9]/, "Password must include at least one digit."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter.")
      .regex(/[0-9]/, "Password must include at least one digit."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/**
 * Validates that a returnTo URL is a safe local pathname.
 * Rejects protocol-relative paths (//evil.com), backslashes (/\evil.com), and absolute URLs.
 */
export function isSafeReturnTo(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\");
}

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

