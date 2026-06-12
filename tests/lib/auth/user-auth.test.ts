import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import { createUser } from "@/lib/auth/createUser";
import { verifyPassword } from "@/lib/auth/verifyPassword";
import { verifyCredentials } from "@/lib/auth/verifyCredentials";

describe("user auth helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user with a username and an Argon2 password hash", async () => {
    prismaMock.user.create.mockResolvedValue({
      id: "user_1",
      username: "person_test",
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z"),
    });

    await createUser("person_test", "password123");

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        username: "person_test",
        passwordHash: expect.stringMatching(/^\$argon2/),
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const createArgs = prismaMock.user.create.mock.calls[0][0];
    expect(createArgs.data.passwordHash).not.toBe("password123");
    await expect(verifyPassword(createArgs.data.passwordHash, "password123")).resolves.toBe(true);
  });

  it("returns null when credentials do not match a user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(verifyCredentials("missing_user", "password123")).resolves.toBeNull();
  });

  it("returns null when the password is invalid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      username: "person_test",
      passwordHash: await import("@/lib/auth/hashPassword").then(({ hashPassword }) =>
        hashPassword("correct-password"),
      ),
    });

    await expect(verifyCredentials("person_test", "wrong-password")).resolves.toBeNull();
  });

  it("returns the user id and username when credentials are valid", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      username: "person_test",
      passwordHash: await import("@/lib/auth/hashPassword").then(({ hashPassword }) =>
        hashPassword("correct-password"),
      ),
    });

    await expect(verifyCredentials("person_test", "correct-password")).resolves.toEqual({
      id: "user_1",
      username: "person_test",
    });
  });
});
