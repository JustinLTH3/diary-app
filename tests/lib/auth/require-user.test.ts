import { beforeEach, describe, expect, it, vi } from "vitest";

const getServerSessionMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const authOptionsMock = vi.hoisted(() => ({ session: { strategy: "jwt" } }));

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/auth", () => ({
  authOptions: authOptionsMock,
}));

import { authOptions } from "@/auth";
import { requireUser } from "@/lib/auth/requireUser";

describe("requireUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated session user", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "user_1",
        email: "person@example.com",
      },
    });

    await expect(requireUser()).resolves.toEqual({
      id: "user_1",
      email: "person@example.com",
    });
  });

  it("passes the app auth options to Auth.js", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "user_1",
      },
    });

    await requireUser();

    expect(getServerSessionMock).toHaveBeenCalledWith(authOptions);
  });

  it("redirects to signin when there is no session", async () => {
    getServerSessionMock.mockResolvedValue(null);
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("redirects to signin when the session has no user id", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        email: "person@example.com",
      },
    });
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });
});
