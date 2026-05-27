import type { Metadata } from "next";
import Link from "next/link";

import { SigninForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign in | Diary",
  description: "Sign in to your Diary account.",
};

export default function SigninPage() {
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
              Welcome Back
            </h1>
            <p className="mt-1 text-base leading-relaxed text-signup-muted">
              Return to your private place for the days, details, and reflections you want to keep.
            </p>
          </header>

          <SigninForm />

          <div className="mt-6 border-t border-divider pt-6 text-center">
            <p className="text-base leading-relaxed text-muted">
              Need an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
