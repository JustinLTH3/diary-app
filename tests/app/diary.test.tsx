import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DiaryPage from "@/app/(app)/diary/[date]/page";

const requireUserMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: requireUserMock,
}));

vi.mock("next-auth/react", () => ({
  signOut: signOutMock,
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();

  return {
    ...actual,
    notFound: notFoundMock,
  };
});

describe("DiaryPage", () => {
  beforeEach(() => {
    notFoundMock.mockImplementation(() => {
      throw new Error("not-found");
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated user before rendering the diary editor", async () => {
    render(
      await DiaryPage({
        params: Promise.resolve({ date: "2026-05-29" }),
      }),
    );

    expect(requireUserMock).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Friday, 29 May 2026" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to calendar" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=5",
    );
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.getByLabelText("Diary entry")).toHaveValue("");
  });

  it("shows unsaved changes after editing content", async () => {
    const user = userEvent.setup();

    render(
      await DiaryPage({
        params: Promise.resolve({ date: "2026-05-29" }),
      }),
    );

    await user.type(screen.getByLabelText("Diary entry"), "A quiet day.");

    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.getByText("3 words")).toBeInTheDocument();
  });

  it("returns not found for invalid diary dates", async () => {
    await expect(
      DiaryPage({
        params: Promise.resolve({ date: "2026-02-31" }),
      }),
    ).rejects.toThrow("not-found");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("signs out to the signin page", async () => {
    const user = userEvent.setup();

    render(
      await DiaryPage({
        params: Promise.resolve({ date: "2026-05-29" }),
      }),
    );

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/signin" });
  });
});
