import { IEmailProvider, EmailProviderResponse } from "./types";

export interface ResendEmailProviderOptions {
  apiKey?: string;
  fromEmail?: string;
}

/**
 * Resend Email Provider implementation behind IEmailProvider.
 * Uses native fetch to Resend's REST API without adding heavy dependencies.
 */
export class ResendEmailProvider implements IEmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(options?: ResendEmailProviderOptions) {
    this.apiKey = options?.apiKey ?? (process.env.RESEND_API_KEY || "");
    this.fromEmail =
      options?.fromEmail ??
      (process.env.EMAIL_FROM || "Laira Charms <no-reply@lairacharms.pk>");
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<EmailProviderResponse> {
    // In dev or test environments with missing or dummy key, safely mock delivery
    if (!this.apiKey || this.apiKey.startsWith("re_dummy")) {
      if (process.env.NODE_ENV !== "production") {
        return {
          success: true,
          messageId: `mock_resend_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        };
      }
      return {
        success: false,
        error: "RESEND_API_KEY is not configured on production environment.",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        statusCode?: number;
      };

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || `Resend HTTP error ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        messageId: data.id || `resend_${Date.now()}`,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error contacting Resend API",
      };
    }
  }
}

