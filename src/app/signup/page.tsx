import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start tracking your daily wellness, your way.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Sign up
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
