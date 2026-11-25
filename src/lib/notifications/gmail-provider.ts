import nodemailer, { type Transporter } from "nodemailer";
import type { EmailProviderResponse, IEmailProvider } from "./types";

export interface GmailSmtpProviderOptions {
  user?: string;
  appPassword?: string;
  fromEmail?: string;
  transportFactory?: (config: {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
  }) => Pick<Transporter, "sendMail">;
}

function normalizeSecret(value: string | undefined): string {
  return (value || "").replace(/\s+/g, "").trim();
}

function isPlaceholderCredential(user: string, pass: string): boolean {
  return (
    !user ||
    !pass ||
    user.startsWith("dummy") ||
    user.includes("your_") ||
    user.endsWith("@example.com") ||
    pass.startsWith("dummy") ||
    pass.includes("your_")
  );
}

export function isGmailSmtpConfigured(): boolean {
  const user = (process.env.GMAIL_USER || "").trim();
  const pass = normalizeSecret(process.env.GMAIL_APP_PASSWORD);
  return !isPlaceholderCredential(user, pass);
}

/**
 * Gmail SMTP Email Provider behind IEmailProvider.
 * Authenticates with Gmail 2-Step Verification App Passwords over SMTPS (port 465).
 */
export class GmailSmtpEmailProvider implements IEmailProvider {
  private readonly user: string;
  private readonly appPassword: string;
  private readonly fromEmail: string;
  private readonly transportFactory: NonNullable<GmailSmtpProviderOptions["transportFactory"]>;

  constructor(options?: GmailSmtpProviderOptions) {
    this.user = (options?.user ?? process.env.GMAIL_USER ?? "").trim();
    this.appPassword = normalizeSecret(
      options?.appPassword ?? process.env.GMAIL_APP_PASSWORD
    );

    const configuredFrom = options?.fromEmail ?? process.env.EMAIL_FROM;
    if (
      configuredFrom &&
      !configuredFrom.includes("no-reply@lairacharms.pk")
    ) {
      this.fromEmail = configuredFrom;
    } else if (this.user) {
      this.fromEmail = `Laira Charms <${this.user}>`;
    } else {
      this.fromEmail = "Laira Charms <no-reply@lairacharms.pk>";
    }

    this.transportFactory =
      options?.transportFactory ?? ((config) => nodemailer.createTransport(config));
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<EmailProviderResponse> {
    if (isPlaceholderCredential(this.user, this.appPassword)) {
      if (process.env.NODE_ENV !== "production") {
        return {
          success: true,
          messageId: `mock_gmail_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        };
      }
      return {
        success: false,
        error: "GMAIL_USER and GMAIL_APP_PASSWORD are not configured on production environment.",
      };
    }

    try {
      const transporter = this.transportFactory({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: this.user,
          pass: this.appPassword,
        },
      });

      const info = await transporter.sendMail({
        from: this.fromEmail,
        to,
        replyTo: this.user,
        subject,
        html,
        text,
      });

      return {
        success: true,
        messageId: info?.messageId || `gmail_${Date.now()}`,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to send email via Gmail SMTP",
      };
    }
  }
}
