import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import SignupPage from "@/app/(auth)/signup/page";

const fetchMock = vi.fn<typeof fetch>();
const signInMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock("next-auth/react", () => ({
  signIn: signInMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("SignupPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    vi.clearAllMocks();
  });

  it("renders the frontend signup form", () => {
    render(<SignupPage />);

    expect(screen.getByRole("heading", { name: "Begin Your Journey" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/signin");
  });

  it("submits signup credentials to the signup API", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "user_1" } }), { status: 201 }),
    );
    signInMock.mockResolvedValue({ ok: false, error: "CredentialsSignin" });
    vi.stubGlobal("fetch", fetchMock);

    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "person@example.com",
        password: "password123",
      }),
    });
    expect(await screen.findByText("Account created.")).toBeInTheDocument();
  });

  it("signs in and redirects to calendar after successful signup", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "user_1" } }), { status: 201 }),
    );
    signInMock.mockResolvedValue({ ok: true, error: null });
    vi.stubGlobal("fetch", fetchMock);

    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(signInMock).toHaveBeenCalledWith("credentials", {
      email: "person@example.com",
      password: "password123",
      redirect: false,
    });
    expect(pushMock).toHaveBeenCalledWith("/calendar");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows duplicate email feedback from the signup API", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "A user with this email already exists." }), {
        status: 409,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByText("A user with this email already exists.")).toBeInTheDocument();
  });

  it("disables the submit button while signup is pending", async () => {
    const user = userEvent.setup();
    let resolveSignup: (response: Response) => void;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveSignup = resolve;
      }),
    );
    signInMock.mockResolvedValue({ ok: false, error: "CredentialsSignin" });
    vi.stubGlobal("fetch", fetchMock);

    render(<SignupPage />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByRole("button", { name: "Creating Account" })).toBeDisabled();
    expect(screen.getByText("Creating account...")).toBeInTheDocument();

    resolveSignup!(new Response(JSON.stringify({ user: { id: "user_1" } }), { status: 201 }));

    expect(await screen.findByRole("button", { name: "Create Account" })).toBeEnabled();
  });
});
