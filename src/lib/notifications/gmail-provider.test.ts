import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GmailSmtpEmailProvider, isGmailSmtpConfigured } from "./gmail-provider";
import { getActiveEmailProvider } from "./outbox-service";

describe("GmailSmtpEmailProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns mock success in non-production when credentials are missing", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const provider = new GmailSmtpEmailProvider({ user: "", appPassword: "" });

    const result = await provider.sendEmail(
      "shopper@example.pk",
      "Order Confirmed",
      "<p>Thank you</p>",
      "Thank you"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toContain("mock_gmail_");
  });

  it("fails cleanly in production when Gmail credentials are missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const provider = new GmailSmtpEmailProvider({ user: "", appPassword: "" });

    const result = await provider.sendEmail(
      "shopper@example.pk",
      "Order Confirmed",
      "<p>Thank you</p>",
      "Thank you"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("GMAIL_USER and GMAIL_APP_PASSWORD are not configured");
  });

  it("strips spaces from 16-char Gmail App Password and sends over SMTPS port 465", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const sendMail = vi.fn().mockResolvedValue({ messageId: "<gmail-msg-001@smtp.gmail.com>" });
    const transportFactory = vi.fn().mockReturnValue({ sendMail });

    const provider = new GmailSmtpEmailProvider({
      user: "studio@gmail.com",
      appPassword: "abcd efgh ijkl mnop",
      fromEmail: "Laira Charms <studio@gmail.com>",
      transportFactory,
    });

    const result = await provider.sendEmail(
      "customer@example.pk",
      "Custom Charm Quote Ready",
      "<p>Ready!</p>",
      "Ready!"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("<gmail-msg-001@smtp.gmail.com>");
    expect(transportFactory).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "studio@gmail.com",
        pass: "abcdefghijklmnop",
      },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: "Laira Charms <studio@gmail.com>",
      to: "customer@example.pk",
      replyTo: "studio@gmail.com",
      subject: "Custom Charm Quote Ready",
      html: "<p>Ready!</p>",
      text: "Ready!",
    });
  });

  it("handles SMTP transport errors gracefully", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const sendMail = vi.fn().mockRejectedValue(new Error("Invalid login: 535-5.7.8 BadCredentials"));
    const provider = new GmailSmtpEmailProvider({
      user: "studio@gmail.com",
      appPassword: "wrongpassword1234",
      transportFactory: () => ({ sendMail }),
    });

    const result = await provider.sendEmail(
      "customer@example.pk",
      "Subject",
      "<p>Hi</p>",
      "Hi"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("535-5.7.8");
  });

  it("activates GmailSmtpEmailProvider automatically when GMAIL_USER and GMAIL_APP_PASSWORD are set", () => {
    vi.stubEnv("GMAIL_USER", "studio@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "abcd efgh ijkl mnop");
    vi.stubEnv("EMAIL_PROVIDER", "auto");

    expect(isGmailSmtpConfigured()).toBe(true);
    expect(getActiveEmailProvider()).toBeInstanceOf(GmailSmtpEmailProvider);
  });
});
