import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CalendarPage from "@/app/(app)/calendar/page";

const requireUserMock = vi.hoisted(() => vi.fn());
const listEntryDatesForMonthMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/diary/listEntryDatesForMonth", () => ({
  listEntryDatesForMonth: listEntryDatesForMonthMock,
}));

vi.mock("next-auth/react", () => ({
  signOut: signOutMock,
}));

describe("CalendarPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 29));
    requireUserMock.mockResolvedValue({ id: "user_1" });
    listEntryDatesForMonthMock.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("requires an authenticated user before rendering the default calendar month", async () => {
    render(await CalendarPage());

    expect(requireUserMock).toHaveBeenCalled();
    expect(listEntryDatesForMonthMock).toHaveBeenCalledWith("user_1", 2026, 5);
    expect(screen.getByText("Diary")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "May 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("renders the selected calendar month from search params", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ year: "2026", month: "1" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "January 2026" })).toBeInTheDocument();
    expect(listEntryDatesForMonthMock).toHaveBeenCalledWith("user_1", 2026, 1);
  });

  it("links each day to the matching diary route", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ year: "2026", month: "5" }),
      }),
    );

    expect(screen.getByRole("link", { name: "May 1, 2026" })).toHaveAttribute(
      "href",
      "/diary/2026-05-01",
    );
    expect(screen.getByRole("link", { name: "Today, May 29, 2026" })).toHaveAttribute(
      "href",
      "/diary/2026-05-29",
    );
  });

  it("renders markers for days with saved diary content", async () => {
    listEntryDatesForMonthMock.mockResolvedValue(["2026-05-01", "2026-05-29"]);

    render(
      await CalendarPage({
        searchParams: Promise.resolve({ year: "2026", month: "5" }),
      }),
    );

    expect(screen.getByTestId("entry-marker-2026-05-01")).toBeInTheDocument();
    expect(screen.getByTestId("entry-marker-2026-05-29")).toBeInTheDocument();
    expect(screen.queryByTestId("entry-marker-2026-05-02")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "May 1, 2026" })).toHaveAttribute(
      "href",
      "/diary/2026-05-01",
    );
  });

  it("fetches entry markers for the fallback current month when search params are invalid", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ year: "2026", month: "13" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "May 2026" })).toBeInTheDocument();
    expect(listEntryDatesForMonthMock).toHaveBeenCalledWith("user_1", 2026, 5);
  });

  it("links to previous and next months", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ year: "2026", month: "5" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=4",
    );
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=5",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=6",
    );
  });

  it("rolls month navigation across year boundaries", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ year: "2026", month: "1" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/calendar?year=2025&month=12",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=2",
    );
  });

  it("signs out to the signin page", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();

    render(await CalendarPage());

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/signin" });
  });
});
