import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DiaryPage from "@/app/(app)/diary/[date]/page";
import { DiaryEditor } from "@/components/diary/diary-editor";

const requireUserMock = vi.hoisted(() => vi.fn());
const getEntryForDateMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/diary/getEntryForDate", () => ({
  getEntryForDate: getEntryForDateMock,
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
    requireUserMock.mockResolvedValue({ id: "user_1" });
    getEntryForDateMock.mockResolvedValue("");
    notFoundMock.mockImplementation(() => {
      throw new Error("not-found");
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("requires an authenticated user before rendering the diary editor", async () => {
    render(
      await DiaryPage({
        params: Promise.resolve({ date: "2026-05-29" }),
      }),
    );

    expect(requireUserMock).toHaveBeenCalled();
    expect(getEntryForDateMock).toHaveBeenCalledWith(
      "user_1",
      new Date("2026-05-29T00:00:00.000Z"),
    );
    expect(screen.getByRole("heading", { name: "Friday, 29 May 2026" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to calendar" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=5",
    );
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.getByLabelText("Diary entry")).toHaveValue("");
  });

  it("renders saved diary content", async () => {
    getEntryForDateMock.mockResolvedValue("Previously saved.");

    render(
      await DiaryPage({
        params: Promise.resolve({ date: "2026-05-29" }),
      }),
    );

    expect(screen.getByLabelText("Diary entry")).toHaveValue("Previously saved.");
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

  it("debounces auto-save after editing content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          entry: {
            date: "2026-05-29",
            content: "A quiet day.",
            updatedAt: "2026-05-29T12:00:00.000Z",
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();

    render(<DiaryEditor date="2026-05-29" />);

    fireEvent.change(screen.getByLabelText("Diary entry"), {
      target: { value: "A quiet day." },
    });

    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });

    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/diary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: "2026-05-29",
        content: "A quiet day.",
      }),
    });
  });

  it("does not save unchanged content", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();

    render(<DiaryEditor date="2026-05-29" initialContent="Already saved." />);

    fireEvent.change(screen.getByLabelText("Diary entry"), {
      target: { value: "Already saved." },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows a non-blocking error and retries after the next edit", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            entry: {
              date: "2026-05-29",
              content: "A quiet day.",
              updatedAt: "2026-05-29T12:00:00.000Z",
            },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();

    render(<DiaryEditor date="2026-05-29" />);

    fireEvent.change(screen.getByLabelText("Diary entry"), {
      target: { value: "A quiet" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText("Unable to save")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Diary entry"), {
      target: { value: "A quiet day." },
    });

    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
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
