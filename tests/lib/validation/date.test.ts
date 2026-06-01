import { describe, expect, it } from "vitest";

import { diaryDateSchema } from "@/lib/validation/date";

describe("diaryDateSchema", () => {
  it("accepts valid diary date strings", () => {
    expect(diaryDateSchema.parse("2026-05-29")).toBe("2026-05-29");
    expect(diaryDateSchema.parse("2024-02-29")).toBe("2024-02-29");
  });

  it("rejects invalid diary date strings", () => {
    expect(() => diaryDateSchema.parse("2026-5-29")).toThrow();
    expect(() => diaryDateSchema.parse("2026-02-30")).toThrow();
    expect(() => diaryDateSchema.parse("2026-02-29")).toThrow();
  });

  it("rejects non-string values", () => {
    expect(() => diaryDateSchema.parse(null)).toThrow();
    expect(() => diaryDateSchema.parse(20260529)).toThrow();
  });
});
