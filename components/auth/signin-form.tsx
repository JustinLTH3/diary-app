"use client";

import { type SubmitEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { FormStatus } from "@/lib/auth/form-status";

const statusMessages: Partial<Record<FormStatus, string>> = {
  [FormStatus.Idle]: "Sign in to continue writing.",
  [FormStatus.Submitting]: "Signing in...",
  [FormStatus.InvalidCredentials]: "Invalid username or password.",
  [FormStatus.GenericError]: "Unable to sign in. Please try again.",
};

export function SigninForm() {
  const router = useRouter();
  const [status, setStatus] = useState(FormStatus.Idle);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    setStatus(FormStatus.Submitting);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.ok && !result.error) {
        setStatus(FormStatus.Idle);
        router.push("/calendar");
        router.refresh();
        return;
      }

      setStatus(FormStatus.InvalidCredentials);
    } catch {
      setStatus(FormStatus.GenericError);
    }
  }

  return (
    <form className="space-y-6" aria-describedby="signin-form-status" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label className="text-xs leading-tight font-semibold text-signup-muted">
          Username
          <input
            name="username"
            required
            autoComplete="username"
            placeholder="Username"
            className="mt-1 block w-full border-0 border-b-2 border-signup-input-border bg-transparent px-0 py-2 text-base leading-relaxed text-signup-text outline-none placeholder:text-signup-placeholder focus:border-signup-primary focus:ring-0 font-normal"
          />
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs leading-tight font-semibold text-signup-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="Password"
          aria-describedby="password-helper"
          className="border-0 border-b-2 border-signup-input-border bg-transparent px-0 py-2 text-base leading-relaxed text-signup-text outline-none placeholder:text-signup-placeholder focus:border-signup-primary focus:ring-0"
        />
        <p id="password-helper" className="sr-only">
          Enter your account password.
        </p>
      </div>

      <p id="signin-form-status" aria-live="polite" className="min-h-5 text-xs text-signup-status">
        {statusMessages[status]}
      </p>

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === FormStatus.Submitting}
          className="w-full rounded-lg bg-signup-primary px-12 py-6 text-sm leading-tight font-medium text-signup-on-primary shadow-sm transition-colors duration-300 hover:bg-signup-primary-hover focus:ring-3 focus:ring-signup-primary/25 focus:outline-none active:scale-95"
        >
          {status === FormStatus.Submitting ? "Signing In" : "Sign In"}
        </button>
      </div>
    </form>
  );
}
