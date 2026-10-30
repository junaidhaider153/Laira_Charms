import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ForgotPasswordPage from "./page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

describe("ForgotPasswordPage Component", () => {
  it("renders heading and email address input", () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByRole("heading", { name: /Reset Your Password/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Password Reset Link/i })
    ).toBeInTheDocument();
  });

  it("provides link back to sign in", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole("link", { name: /Sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});

