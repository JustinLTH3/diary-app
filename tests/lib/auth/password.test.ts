import { describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/hashPassword";
import { verifyPassword } from "@/lib/auth/verifyPassword";

describe("password helpers", () => {
  it("hashes and verifies passwords with Argon2", async () => {
    const passwordHash = await hashPassword("correct-password");

    expect(passwordHash).not.toBe("correct-password");
    expect(passwordHash).toMatch(/^\$argon2/);
    await expect(verifyPassword(passwordHash, "correct-password")).resolves.toBe(true);
    await expect(verifyPassword(passwordHash, "wrong-password")).resolves.toBe(false);
  });
});
