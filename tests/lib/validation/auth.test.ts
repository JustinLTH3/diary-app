import { describe, expect, it } from "vitest";

import { authCredentialsSchema } from "@/lib/validation/auth";

describe("authCredentialsSchema", () => {
  it("validates valid credentials", () => {
    const credentials = authCredentialsSchema.parse({
      username: "person_test",
      password: "password123",
    });

    expect(credentials).toEqual({
      username: "person_test",
      password: "password123",
    });
  });

  it("rejects invalid credentials", () => {
    expect(() =>
      authCredentialsSchema.parse({
        username: "ab",
        password: "short",
      }),
    ).toThrow();
  });
});
