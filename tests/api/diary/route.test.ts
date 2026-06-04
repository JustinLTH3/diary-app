import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.hoisted(() => vi.fn());
const saveEntryContentMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/diary/saveEntryContent", () => ({
  saveEntryContent: saveEntryContentMock,
}));

import { POST } from "@/app/api/diary/route";

describe("POST /api/diary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user_1" });
  });

  it("saves a diary entry for the authenticated user", async () => {
    saveEntryContentMock.mockResolvedValue({
      date: new Date("2026-05-29T00:00:00.000Z"),
      content: "A quiet day.",
      updatedAt: new Date("2026-05-29T12:00:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api/diary", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-05-29",
          content: "A quiet day.",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      entry: {
        date: "2026-05-29",
        content: "A quiet day.",
        updatedAt: "2026-05-29T12:00:00.000Z",
      },
    });
    expect(response.status).toBe(200);
    expect(saveEntryContentMock).toHaveBeenCalledWith(
      "user_1",
      new Date("2026-05-29T00:00:00.000Z"),
      "A quiet day.",
    );
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/diary", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-02-31",
          content: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(saveEntryContentMock).not.toHaveBeenCalled();
  });

  it("lets authentication redirects propagate", async () => {
    requireUserMock.mockRejectedValue(new Error("NEXT_REDIRECT"));

    await expect(
      POST(
        new Request("http://localhost/api/diary", {
          method: "POST",
          body: JSON.stringify({
            date: "2026-05-29",
            content: "A quiet day.",
          }),
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
  });

  it("returns 500 for unexpected save failures", async () => {
    saveEntryContentMock.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(
      new Request("http://localhost/api/diary", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-05-29",
          content: "A quiet day.",
        }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
