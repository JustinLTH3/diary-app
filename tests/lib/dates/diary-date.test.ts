import { describe, expect, it } from "vitest";

import { parseDiaryDate } from "@/lib/dates/parseDiaryDate";

describe("parseDiaryDate", () => {
  it("parses valid diary dates at UTC midnight", () => {
    const date = parseDiaryDate("2026-05-29");

    expect(date).toBeInstanceOf(Date);
    expect(date?.toISOString()).toBe("2026-05-29T00:00:00.000Z");
  });

  it("accepts valid leap day dates", () => {
    expect(parseDiaryDate("2024-02-29")?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });

  it("rejects malformed diary dates", () => {
    expect(parseDiaryDate("2026-5-29")).toBeNull();
    expect(parseDiaryDate("2026-05-2")).toBeNull();
    expect(parseDiaryDate("05/29/2026")).toBeNull();
    expect(parseDiaryDate("2026-05-29T00:00:00.000Z")).toBeNull();
  });

  it("rejects impossible diary dates", () => {
    expect(parseDiaryDate("2026-00-10")).toBeNull();
    expect(parseDiaryDate("2026-13-10")).toBeNull();
    expect(parseDiaryDate("2026-02-30")).toBeNull();
    expect(parseDiaryDate("2026-04-31")).toBeNull();
    expect(parseDiaryDate("2026-02-29")).toBeNull();
  });
});
