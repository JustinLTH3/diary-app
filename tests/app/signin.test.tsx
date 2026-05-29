import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import SigninPage from "@/app/(auth)/signin/page";

const getServerSessionMock = vi.hoisted(() => vi.fn());
const signInMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/auth", () => ({
  authOptions: {},
}));

vi.mock("next-auth/react", () => ({
  signIn: signInMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("SigninPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the frontend signin form when there is no session", async () => {
    getServerSessionMock.mockResolvedValue(null);

    render(await SigninPage());

    expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign In" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
  });

  it("redirects signed-in users to calendar before rendering", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "user_1",
      },
    });

    await SigninPage();

    expect(redirectMock).toHaveBeenCalledWith("/calendar");
  });

  it("submits signin credentials through Auth.js and redirects to calendar", async () => {
    const user = userEvent.setup();
    getServerSessionMock.mockResolvedValue(null);
    signInMock.mockResolvedValue({ ok: true, error: null });

    render(await SigninPage());

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(signInMock).toHaveBeenCalledWith("credentials", {
      email: "person@example.com",
      password: "password123",
      redirect: false,
    });
    expect(pushMock).toHaveBeenCalledWith("/calendar");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows invalid credentials feedback from Auth.js", async () => {
    const user = userEvent.setup();
    getServerSessionMock.mockResolvedValue(null);
    signInMock.mockResolvedValue({ ok: false, error: "CredentialsSignin" });

    render(await SigninPage());

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("disables the submit button while signin is pending", async () => {
    const user = userEvent.setup();
    getServerSessionMock.mockResolvedValue(null);
    let resolveSignin: (result: { ok: boolean; error: string | null }) => void;
    signInMock.mockReturnValue(
      new Promise((resolve) => {
        resolveSignin = resolve;
      }),
    );

    render(await SigninPage());

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByRole("button", { name: "Signing In" })).toBeDisabled();
    expect(screen.getByText("Signing in...")).toBeInTheDocument();

    resolveSignin!({ ok: true, error: null });

    expect(await screen.findByRole("button", { name: "Sign In" })).toBeEnabled();
  });

  it("shows generic feedback when signin fails unexpectedly", async () => {
    const user = userEvent.setup();
    getServerSessionMock.mockResolvedValue(null);
    signInMock.mockRejectedValue(new Error("network error"));

    render(await SigninPage());

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Unable to sign in. Please try again.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
