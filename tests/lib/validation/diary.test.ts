import { describe, expect, it } from "vitest";

import { diaryContentMaxLength, diaryEntrySchema } from "@/lib/validation/diary";

describe("diaryEntrySchema", () => {
  it("accepts valid diary entry payloads", () => {
    expect(
      diaryEntrySchema.parse({
        date: "2026-05-29",
        content: "A quiet day.",
      }),
    ).toEqual({
      date: "2026-05-29",
      content: "A quiet day.",
    });
  });

  it("accepts content at the maximum length", () => {
    expect(
      diaryEntrySchema.parse({
        date: "2026-05-29",
        content: "a".repeat(diaryContentMaxLength),
      }).content,
    ).toHaveLength(diaryContentMaxLength);
  });

  it("rejects content over the maximum length", () => {
    expect(() =>
      diaryEntrySchema.parse({
        date: "2026-05-29",
        content: "a".repeat(diaryContentMaxLength + 1),
      }),
    ).toThrow();
  });

  it("reuses diary date validation", () => {
    expect(() =>
      diaryEntrySchema.parse({
        date: "2026-02-31",
        content: "",
      }),
    ).toThrow();
  });
});
