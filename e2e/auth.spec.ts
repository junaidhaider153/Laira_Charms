import { test, expect } from "@playwright/test";

test.describe("Customer Identity & Auth Workflows", () => {
  test("allows navigating to login and displays accessible login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h2")).toContainText(/Welcome Back/i);
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
  });

  test("allows navigating to registration and displays validation-ready fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("h2")).toContainText(/Create Your Account/i);
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Mobile Number/i)).toBeVisible();
    await expect(page.getByLabel(/^Password/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Create Account/i })).toBeVisible();
  });

  test("AUTH-014: forgot password displays generic confirmation without account enumeration", async ({
    page,
  }) => {
    await page.goto("/forgot-password");

    await expect(page.locator("h2")).toContainText(/Reset Your Password/i);
    await page.getByLabel(/Email Address/i).fill("customer@example.pk");
    await page.getByRole("button", { name: /Send Password Reset Link/i }).click();

    // Verify generic message is displayed
    const statusBox = page.getByRole("status");
    await expect(statusBox).toBeVisible({ timeout: 10000 });
    await expect(statusBox).toContainText(/instructions to reset your password have been dispatched/i);
  });

  test("displays verify email page with recipient email", async ({ page }) => {
    await page.goto("/verify-email?email=ayesha%40example.pk");

    await expect(page.locator("h2")).toContainText(/Check Your Inbox/i);
    await expect(page.locator("body")).toContainText("ayesha@example.pk");
    await expect(page.getByRole("link", { name: /Proceed to Sign In/i })).toBeVisible();
  });
});
