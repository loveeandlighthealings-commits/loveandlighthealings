@AGENTS.md

# Love and Light Healings

A login-based, light-themed, mobile-first wellness tracker, installable as a
PWA: water/steps/sleep/weight tracking, a food and calorie log with an
Indian/international recipe library, meal planning, tasks/reminders/
routines, a day score, BMI and goal progress, personal numerology, and
(phase 2) Apple Health / Android Health Connect sync plus push
notifications.

**The full spec is [docs/build-brief.md](docs/build-brief.md) — read it
before starting any new area of work.** It has the exact database schema,
business-logic formulas, numerology rules, design system and build order.
`reference/prototype.html`, once added, is the source of truth for exact
copy, the recipe seed data and the visual design — read it before touching
food, numerology or design work.

## Stack
- Next.js (App Router, TypeScript, strict mode), Tailwind
- Supabase: Postgres + Auth; every table has row-level security so users
  only see their own rows
- Vercel: auto-deploys from the GitHub `main` branch
- GitHub: source of truth
- Package manager: **pnpm** (not npm/yarn)

## Rules
- Never commit or push directly to `main`. Every change, however small,
  goes on a new branch (e.g. `feat/water-tracker`, `fix/login-redirect`)
  and is merged by the owner via pull request.
- Run `pnpm lint && pnpm test && pnpm build` before every commit.
- TypeScript strict, no `any`.
- Zod validation on every API input.
- Never log health data (request bodies, weight, calories, sleep, etc.).
  Never log health data on the client either.
- Every table needs an RLS policy in the same migration that creates it.
  Migrations live in `supabase/migrations`, and schema is never edited by
  hand in the Supabase dashboard.
- Never commit `.env*` files or the Supabase service-role key. Only the
  anon key and URL may be exposed to the browser.
- Mobile-first, light theme only — no dark-mode media query.
- Notifications and any at-a-glance UI must never show health values
  (weight, calories, sleep) where someone other than the account owner
  could glance at it (e.g. lock-screen notifications).
