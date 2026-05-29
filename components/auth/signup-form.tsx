"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const initialStatus = "Create your account to begin writing.";
const successStatus = "Account created.";
const genericErrorStatus = "Unable to create account. Please try again.";

type SignupResponse = {
  error?: string;
};

export function SignupForm() {
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    setStatus("Creating account...");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        setStatus(successStatus);
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok && !result.error) {
          router.push("/calendar");
          router.refresh();
          return;
        }
        return;
      }

      const result = (await response.json().catch(() => ({}))) as SignupResponse;

      if (response.status === 400) {
        setStatus(result.error ?? "Invalid signup credentials.");
        return;
      }

      if (response.status === 409) {
        setStatus(result.error ?? "A user with this email already exists.");
        return;
      }

      setStatus(result.error ?? genericErrorStatus);
    } catch {
      setStatus(genericErrorStatus);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" aria-describedby="signup-form-status" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs leading-tight font-semibold text-signup-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="email@example.com"
          aria-describedby="email-helper"
          className="border-0 border-b-2 border-signup-input-border bg-transparent px-0 py-2 text-base leading-relaxed text-signup-text outline-none placeholder:text-signup-placeholder focus:border-signup-primary focus:ring-0"
        />
        <p id="email-helper" className="sr-only">
          Enter the email you want to use when signing in.
        </p>
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
          autoComplete="new-password"
          placeholder="Password"
          aria-describedby="password-helper"
          className="border-0 border-b-2 border-signup-input-border bg-transparent px-0 py-2 text-base leading-relaxed text-signup-text outline-none placeholder:text-signup-placeholder focus:border-signup-primary focus:ring-0"
        />
        <p id="password-helper" className="sr-only">
          Use at least 8 characters.
        </p>
      </div>

      <p id="signup-form-status" aria-live="polite" className="min-h-5 text-xs text-signup-status">
        {status}
      </p>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-signup-primary px-12 py-6 text-sm leading-tight font-medium text-signup-on-primary shadow-sm transition-colors duration-300 hover:bg-signup-primary-hover focus:ring-3 focus:ring-signup-primary/25 focus:outline-none active:scale-95"
        >
          {isSubmitting ? "Creating Account" : "Create Account"}
        </button>
      </div>
    </form>
  );
}
