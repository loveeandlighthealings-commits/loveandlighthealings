@AGENTS.md

# Love and Light Healings

Build a light-themed, mobile-first wellness tracker as an installable website (Next.js, Supabase with private per-user logins, Vercel) that combines daily tracking of water, steps, sleep and weight with a food and calorie log, a 100-dish Indian and international recipe library, meal planning, tasks, reminders and routines, a day score, BMI and goal progress, personal numerology (personal year, month and day), and Apple Health and Android Health Connect sync.

## Stack
- Next.js (App Router, TypeScript), installable as a PWA
- Supabase: Postgres + Auth; every table has row-level security so users only see their own rows
- Vercel: auto-deploys from the GitHub `main` branch
- GitHub: source of truth

## Rules
- Mobile-first, light theme.
- Never commit `.env*` files or Supabase service-role keys. Only the anon key and URL may be exposed to the browser.
- Every new table needs an RLS policy in the same migration. Migrations live in `supabase/migrations`.
