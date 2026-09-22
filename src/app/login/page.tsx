import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="card w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Sign in to your Love and Light Healings account.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={login} className="space-y-4">
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
              className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
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
              autoComplete="current-password"
              className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>

          <button
            type="submit"
            className="btn-primary flex min-h-[48px] w-full items-center justify-center px-5 text-[14.5px]"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
