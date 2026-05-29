"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="rounded-md border border-signup-input-border px-4 py-2 text-sm font-semibold text-signup-muted transition-colors hover:border-signup-primary hover:text-signup-primary focus:ring-3 focus:ring-signup-primary/25 focus:outline-none"
    >
      Log out
    </button>
  );
}
