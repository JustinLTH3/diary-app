import { describe, expect, it } from "vitest";

import { authCredentialsSchema } from "@/lib/validation/auth";

describe("authCredentialsSchema", () => {
  it("normalizes valid credentials", () => {
    const credentials = authCredentialsSchema.parse({
      email: "  PERSON@Example.COM  ",
      password: "password123",
    });

    expect(credentials).toEqual({
      email: "person@example.com",
      password: "password123",
    });
  });

  it("rejects invalid credentials", () => {
    expect(() =>
      authCredentialsSchema.parse({
        email: "not-an-email",
        password: "short",
      }),
    ).toThrow();
  });
});
