import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  diaryEntry: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import { getEntryForDate } from "@/lib/diary/getEntryForDate";
import { saveEntryContent } from "@/lib/diary/saveEntryContent";

describe("diary entry helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty content when no entry exists", async () => {
    const date = new Date("2026-05-29T00:00:00.000Z");
    prismaMock.diaryEntry.findUnique.mockResolvedValue(null);

    await expect(getEntryForDate("user_1", date)).resolves.toBe("");
  });

  it("reads entries by user id and date", async () => {
    const date = new Date("2026-05-29T00:00:00.000Z");
    prismaMock.diaryEntry.findUnique.mockResolvedValue({ content: "Saved content." });

    await expect(getEntryForDate("user_1", date)).resolves.toBe("Saved content.");

    expect(prismaMock.diaryEntry.findUnique).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: "user_1",
          date,
        },
      },
      select: {
        content: true,
      },
    });
  });

  it("upserts entries by user id and date", async () => {
    const date = new Date("2026-05-29T00:00:00.000Z");
    const updatedAt = new Date("2026-05-29T12:00:00.000Z");
    prismaMock.diaryEntry.upsert.mockResolvedValue({
      date,
      content: "Updated content.",
      updatedAt,
    });

    await expect(saveEntryContent("user_1", date, "Updated content.")).resolves.toEqual({
      date,
      content: "Updated content.",
      updatedAt,
    });

    expect(prismaMock.diaryEntry.upsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: "user_1",
          date,
        },
      },
      create: {
        userId: "user_1",
        date,
        content: "Updated content.",
      },
      update: {
        content: "Updated content.",
      },
      select: {
        date: true,
        content: true,
        updatedAt: true,
      },
    });
  });
});
