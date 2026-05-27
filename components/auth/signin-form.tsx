export function SigninForm() {
  return (
    <form className="space-y-6" aria-label="Sign in form">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs leading-tight font-semibold text-signup-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          aria-describedby="email-helper"
          className="border-0 border-b-2 border-signup-input-border bg-transparent px-0 py-2 text-base leading-relaxed text-signup-text outline-none placeholder:text-signup-placeholder focus:border-signup-primary focus:ring-0"
        />
        <p id="email-helper" className="sr-only">
          Enter the email for your Diary account.
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
          autoComplete="current-password"
          placeholder="Password"
          aria-describedby="password-helper"
          className="border-0 border-b-2 border-signup-input-border bg-transparent px-0 py-2 text-base leading-relaxed text-signup-text outline-none placeholder:text-signup-placeholder focus:border-signup-primary focus:ring-0"
        />
        <p id="password-helper" className="sr-only">
          Enter your account password.
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          className="w-full rounded-lg bg-signup-primary px-12 py-6 text-sm leading-tight font-medium text-signup-on-primary shadow-sm transition-colors duration-300 hover:bg-signup-primary-hover focus:ring-3 focus:ring-signup-primary/25 focus:outline-none active:scale-95"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
