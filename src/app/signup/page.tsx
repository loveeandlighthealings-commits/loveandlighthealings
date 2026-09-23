import Link from "next/link";
import { GoogleIcon, SparkleIcon } from "@/app/_components/icons";
import { loginWithGoogle } from "@/app/oauth-actions";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="card w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <SparkleIcon width={22} height={22} />
          </span>
          <h1 className="font-serif text-4xl tracking-tight text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Start tracking your daily wellness, your way.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-full border border-border bg-white px-5 text-[14.5px] font-semibold text-foreground active:scale-[0.98]"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs font-semibold text-foreground-subtle">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

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
              className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
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
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>

          <button
            type="submit"
            className="btn-primary flex min-h-[48px] w-full items-center justify-center px-5 text-[14.5px]"
          >
            Sign up
          </button>
        </form>

        <p className="text-center text-sm text-foreground-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
