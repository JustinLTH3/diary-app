import { beforeEach, describe, expect, it, vi } from "vitest";

const createUserMock = vi.hoisted(() => vi.fn());
const DuplicateUserErrorMock = vi.hoisted(
  () =>
    class DuplicateUserError extends Error {
      constructor() {
        super("A user with this username already exists.");
        this.name = "DuplicateUserError";
      }
    },
);

vi.mock("@/lib/auth/createUser", () => {
  return {
    createUser: createUserMock,
    DuplicateUserError: DuplicateUserErrorMock,
  };
});

import { DuplicateUserError } from "@/lib/auth/createUser";
import { POST } from "@/app/api/auth/signup/route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user", async () => {
    createUserMock.mockResolvedValue({
      id: "user_1",
      username: "person_test",
      createdAt: new Date("2026-05-25T00:00:00.000Z"),
      updatedAt: new Date("2026-05-25T00:00:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username: "person_test", password: "password123" }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      user: {
        id: "user_1",
        username: "person_test",
        createdAt: "2026-05-25T00:00:00.000Z",
        updatedAt: "2026-05-25T00:00:00.000Z",
      },
    });
    expect(response.status).toBe(201);
    expect(createUserMock).toHaveBeenCalledWith("person_test", "password123");
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username: "ab", password: "short" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 409 for duplicate usernames", async () => {
    createUserMock.mockRejectedValue(new DuplicateUserError());

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username: "person_test", password: "password123" }),
      }),
    );

    expect(response.status).toBe(409);
  });
});
