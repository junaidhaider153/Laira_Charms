import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterPage from "./page";

describe("RegisterPage Component", () => {
  it("renders all required registration fields", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: /Create Your Account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Account/i })
    ).toBeInTheDocument();
  });

  it("links to sign in for existing users", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("link", { name: /Sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
