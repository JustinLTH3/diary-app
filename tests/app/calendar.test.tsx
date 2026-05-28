import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import CalendarPage from "@/app/(app)/calendar/page";

const signOutMock = vi.hoisted(() => vi.fn());

vi.mock("next-auth/react", () => ({
  signOut: signOutMock,
}));

describe("CalendarPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the temporary signin success page", () => {
    render(<CalendarPage />);

    expect(screen.getByRole("heading", { name: "Sign in success." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("signs out to the signin page", async () => {
    const user = userEvent.setup();

    render(<CalendarPage />);

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/signin" });
  });
});
