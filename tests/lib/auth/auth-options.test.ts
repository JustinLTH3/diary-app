import type { Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyCredentialsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/verifyCredentials", () => ({
  verifyCredentials: verifyCredentialsMock,
}));

import { authOptions } from "@/auth";

type DiaryCredentialsConfig = CredentialsConfig<{
  email: { label: string; type: string };
  password: { label: string; type: string };
}>;

const credentialsProvider = authOptions.providers[0] as { options: DiaryCredentialsConfig };

const request = {
  body: {},
  query: {},
  headers: {},
  method: "POST",
};

describe("authOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authorizes valid signin credentials", async () => {
    verifyCredentialsMock.mockResolvedValue({
      id: "user_1",
      email: "person@example.com",
    });

    const user = await credentialsProvider.options.authorize(
      {
        email: "person@example.com",
        password: "password123",
      },
      request,
    );

    expect(user).toEqual({
      id: "user_1",
      email: "person@example.com",
    });
    expect(verifyCredentialsMock).toHaveBeenCalledWith("person@example.com", "password123");
  });

  it("rejects invalid signin credentials", async () => {
    verifyCredentialsMock.mockResolvedValue(null);

    const user = await credentialsProvider.options.authorize(
      {
        email: "person@example.com",
        password: "wrong-password",
      },
      request,
    );

    expect(user).toBeNull();
  });

  it("rejects missing signin credentials", async () => {
    const user = await credentialsProvider.options.authorize(undefined, request);

    expect(user).toBeNull();
    expect(verifyCredentialsMock).not.toHaveBeenCalled();
  });

  it("rejects malformed signin credentials before verification", async () => {
    const user = await credentialsProvider.options.authorize(
      {
        email: "person@example.com",
        password: 123,
      } as never,
      request,
    );

    expect(user).toBeNull();
    expect(verifyCredentialsMock).not.toHaveBeenCalled();
  });

  it("stores the signed-in user id on the JWT token", async () => {
    const jwt = authOptions.callbacks?.jwt;
    expect(jwt).toBeDefined();

    const token = await jwt!({
      token: {},
      user: {
        id: "user_1",
        email: "person@example.com",
      },
      account: null,
    });

    expect(token).toMatchObject({ id: "user_1" });
  });

  it("copies the JWT user id to the session", async () => {
    const sessionCallback = authOptions.callbacks?.session;
    expect(sessionCallback).toBeDefined();

    const session = await sessionCallback!({
      session: {
        user: {
          id: "existing_user",
          email: "person@example.com",
        },
        expires: "2026-05-27T00:00:00.000Z",
      } satisfies Session,
      token: {
        id: "user_1",
      } satisfies JWT,
      user: {
        id: "user_1",
        email: "person@example.com",
        emailVerified: null,
      } satisfies AdapterUser,
      newSession: null,
      trigger: "update",
    });

    expect(session.user).toMatchObject({ id: "user_1" });
  });
});
