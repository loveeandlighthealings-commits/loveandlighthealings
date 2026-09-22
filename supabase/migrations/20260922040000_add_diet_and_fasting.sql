-- Dietary preference (per-user) and richer recipe classification, plus
-- intermittent fasting tracking.
--
-- Diet is modeled as a hierarchy, from strictest to least strict:
--   vegan < vegetarian < eggetarian < pescatarian < non_vegetarian
-- Each dish is tagged with the loosest tier still required to eat it (a
-- plain dal is 'vegan', a paneer dish is 'vegetarian', an egg dish is
-- 'eggetarian', a fish dish is 'pescatarian', chicken/mutton is
-- 'non_vegetarian'). A user following diet X can eat any dish tagged with
-- X or a stricter tier. No dish in this app's library uses beef.

alter table public.profiles
  add column if not exists diet text;

alter table public.profiles
  add constraint profiles_diet_check
  check (diet is null or diet in ('vegan', 'vegetarian', 'eggetarian', 'pescatarian', 'non_vegetarian'));

alter table public.foods
  add column if not exists diet text,
  add column if not exists meal_category text[] not null default '{}';

alter table public.foods
  add constraint foods_diet_check
  check (diet is null or diet in ('vegan', 'vegetarian', 'eggetarian', 'pescatarian', 'non_vegetarian')),
  add constraint foods_meal_category_check
  check (meal_category <@ array['detox', 'breakfast', 'lunch', 'snack', 'dinner', 'salad']::text[]);

-- ---------------------------------------------------------------------
-- fasting_sessions: intermittent fasting (12h, 16h, 18h, 20h, ...)
-- ---------------------------------------------------------------------
create table if not exists public.fasting_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  started_at timestamptz not null default now(),
  planned_hours numeric not null check (planned_hours > 0 and planned_hours <= 72),
  ended_at timestamptz,
  broken boolean not null default false
);
alter table public.fasting_sessions enable row level security;
create policy "own rows" on public.fasting_sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create index if not exists fasting_sessions_user_started_idx on public.fasting_sessions (user_id, started_at desc);

-- A user should only have one fast running at a time.
create unique index if not exists fasting_sessions_one_active_per_user
  on public.fasting_sessions (user_id)
  where ended_at is null;
