import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SigninPage from "@/app/(auth)/signin/page";

describe("SigninPage", () => {
  it("renders the visual-only signin form", () => {
    render(<SigninPage />);

    expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign In" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
  });
});
