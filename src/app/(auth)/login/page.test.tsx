import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "reset" ? "success" : null),
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("LoginPage Component", () => {
  it("renders welcome heading and essential form inputs", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("displays success notification after successful password reset", () => {
    render(<LoginPage />);

    expect(
      screen.getByText(/Your password has been successfully reset/i)
    ).toBeInTheDocument();
  });

  it("provides links to forgot password and registration", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /Forgot password\?/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
    expect(screen.getByRole("link", { name: /Create one now/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
