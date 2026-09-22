-- Full application schema, per docs/build-brief.md section 4.
-- Extends and standardizes the minimal `profiles` table from the first
-- migration, then adds every other table the app needs.
--
-- Policy pattern (per the brief): every user-owned table gets exactly one
-- policy, "own rows", covering all operations:
--   alter table <t> enable row level security;
--   create policy "own rows" on <t>
--     for all to authenticated
--     using (user_id = auth.uid())
--     with check (user_id = auth.uid());
-- This replaces the four separate select/insert/update/delete policies the
-- first migration put on `profiles`, so that table is standardized too.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- profiles: rename id -> user_id and add every column the brief specifies
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;

alter table public.profiles rename column id to user_id;
alter table public.profiles rename column date_of_birth to birth_date;
alter table public.profiles drop column if exists weight_goal_kg;

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists start_kg numeric,
  add column if not exists target_kg numeric,
  add column if not exists cal_goal int,
  add column if not exists water_goal_ml int not null default 2500,
  add column if not exists steps_goal int not null default 8000,
  add column if not exists sleep_goal_h numeric not null default 8,
  add column if not exists bmi_scale text not null default 'who',
  add column if not exists age int,
  add column if not exists sex text,
  add column if not exists activity text not null default 'light',
  add column if not exists timezone text not null default 'Asia/Kolkata',
  add column if not exists calorie_tracking boolean not null default true;

alter table public.profiles
  add constraint profiles_bmi_scale_check check (bmi_scale in ('who', 'asian')),
  add constraint profiles_activity_check check (activity in ('sedentary', 'light', 'moderate', 'active')),
  add constraint profiles_sex_check check (sex is null or sex in ('f', 'm'));

create policy "own rows" on public.profiles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Recreate the signup trigger against the renamed column.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- weights
-- ---------------------------------------------------------------------
create table if not exists public.weights (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  kg numeric not null,
  source text not null default 'manual',
  primary key (user_id, day)
);
alter table public.weights enable row level security;
create policy "own rows" on public.weights
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- daily_logs
-- ---------------------------------------------------------------------
create table if not exists public.daily_logs (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  water_ml int,
  steps int,
  bed_time time,
  wake_time time,
  rating smallint,
  note text,
  meals_done jsonb not null default '{}',
  routine_done jsonb not null default '{}',
  links_done jsonb not null default '{}',
  synced jsonb not null default '{}',
  primary key (user_id, day)
);
alter table public.daily_logs enable row level security;
create policy "own rows" on public.daily_logs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- food_entries
-- ---------------------------------------------------------------------
create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  slot text not null check (slot in ('b', 'l', 's', 'd')),
  name text not null,
  serving text,
  qty numeric not null check (qty > 0),
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  created_at timestamptz not null default now()
);
alter table public.food_entries enable row level security;
create policy "own rows" on public.food_entries
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create index if not exists food_entries_user_day_idx on public.food_entries (user_id, day);

-- ---------------------------------------------------------------------
-- foods: global recipe/food library. Read-only to clients; writes happen
-- via the seed migration or the service-role key, never from the browser.
-- ---------------------------------------------------------------------
create table if not exists public.foods (
  id serial primary key,
  name text not null,
  cuisine text,
  veg boolean,
  serving text,
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  ingredients text,
  method text
);
alter table public.foods enable row level security;
create policy "anyone signed in can read" on public.foods
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- user_foods: a person's own custom foods
-- ---------------------------------------------------------------------
create table if not exists public.user_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  serving text,
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric
);
alter table public.user_foods enable row level security;
create policy "own rows" on public.user_foods
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- meal_plan: a repeating weekly plan, 0 = Monday
-- ---------------------------------------------------------------------
create table if not exists public.meal_plan (
  user_id uuid not null references auth.users on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  slot text not null check (slot in ('b', 'l', 's', 'd')),
  text text,
  primary key (user_id, weekday, slot)
);
alter table public.meal_plan enable row level security;
create policy "own rows" on public.meal_plan
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- routine_items
-- ---------------------------------------------------------------------
create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  time time,
  text text not null
);
alter table public.routine_items enable row level security;
create policy "own rows" on public.routine_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- workout_links
-- ---------------------------------------------------------------------
create table if not exists public.workout_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  url text not null check (url ~ '^https?://')
);
alter table public.workout_links enable row level security;
create policy "own rows" on public.workout_links
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  text text not null,
  due date,
  done boolean not null default false
);
alter table public.tasks enable row level security;
create policy "own rows" on public.tasks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create index if not exists tasks_user_due_idx on public.tasks (user_id, due);

-- ---------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  text text not null,
  due_date date,
  due_time time,
  done boolean not null default false
);
alter table public.reminders enable row level security;
create policy "own rows" on public.reminders
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create index if not exists reminders_user_due_date_idx on public.reminders (user_id, due_date);

-- ---------------------------------------------------------------------
-- shopping_items
-- ---------------------------------------------------------------------
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  text text not null,
  done boolean not null default false
);
alter table public.shopping_items enable row level security;
create policy "own rows" on public.shopping_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- month_notes
-- ---------------------------------------------------------------------
create table if not exists public.month_notes (
  user_id uuid not null references auth.users on delete cascade,
  month text not null,
  note text,
  primary key (user_id, month)
);
alter table public.month_notes enable row level security;
create policy "own rows" on public.month_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- sync_tokens (phase 2: health sync)
-- ---------------------------------------------------------------------
create table if not exists public.sync_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  token_hash text not null unique,
  label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked boolean not null default false
);
alter table public.sync_tokens enable row level security;
create policy "own rows" on public.sync_tokens
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- push_subscriptions (phase 2: push notifications)
-- ---------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_success_at timestamptz,
  failed_count int not null default 0
);
alter table public.push_subscriptions enable row level security;
create policy "own rows" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- notification_settings (phase 2)
-- ---------------------------------------------------------------------
create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users on delete cascade,
  reminders boolean not null default true,
  water boolean not null default false,
  meals boolean not null default false,
  routine boolean not null default false,
  numerology boolean not null default false,
  water_interval_min int not null default 120,
  numerology_time time not null default '07:30',
  quiet_start time not null default '22:00',
  quiet_end time not null default '07:00'
);
alter table public.notification_settings enable row level security;
create policy "own rows" on public.notification_settings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- notification_log (phase 2): prevents duplicate sends
-- ---------------------------------------------------------------------
create table if not exists public.notification_log (
  user_id uuid not null references auth.users on delete cascade,
  kind text not null,
  ref_id text not null,
  sent_on date not null,
  sent_at timestamptz not null default now(),
  unique (user_id, kind, ref_id, sent_on)
);
alter table public.notification_log enable row level security;
create policy "own rows" on public.notification_log
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
