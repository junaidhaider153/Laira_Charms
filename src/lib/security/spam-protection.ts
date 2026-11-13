/**
 * Validates that a honeypot field is completely empty.
 * Automated spam bots typically fill all input fields, while legitimate users will not.
 */
export function isHoneypotClean(honeypotValue?: string | null): boolean {
  if (!honeypotValue) return true;
  return honeypotValue.trim().length === 0;
}

/**
 * Validates Cloudflare Turnstile CAPTCHA response token if configured.
 * Safely permits request execution in local development or test suites.
 */
export async function verifyTurnstileToken(
  token?: string | null,
  clientIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Pass through if secret key is not set or using dummy value (e.g. dev/test)
  if (!secretKey || secretKey.startsWith("dummy") || secretKey === "1x0000000000000000000000000000000AA") {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Bot protection challenge token is required.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const data = (await response.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      return {
        success: false,
        error: `Bot verification challenge failed: ${(data["error-codes"] || []).join(", ") || "invalid token"}`,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error contacting Turnstile verification service.",
    };
  }
}

