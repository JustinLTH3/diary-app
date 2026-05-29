import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up | Diary",
  description: "Create your Diary account.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-signup-background px-6 py-20 text-signup-text">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="font-serif text-5xl leading-tight font-bold text-signup-primary"
          >
            Diary
          </Link>
        </div>

        <section className="rounded-xl border border-signup-card-border bg-signup-card p-6 shadow-signup-card md:p-12">
          <header className="mb-6">
            <h1 className="font-serif text-3xl leading-tight font-semibold text-signup-text">
              Begin Your Journey
            </h1>
            <p className="mt-1 text-base leading-relaxed text-signup-muted">
              Keep a simple record of what happened, what mattered, and what you want to remember
              next.
            </p>
          </header>

          <SignupForm />

          <div className="mt-6 border-t border-divider pt-6 text-center">
            <p className="text-base leading-relaxed text-muted">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
