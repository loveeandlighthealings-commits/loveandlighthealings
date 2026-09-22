-- Lets each person pick a visual theme (color palette + background mood)
-- for the whole app. All themes stay light-only, per CLAUDE.md -- this is
-- about mood/audience, not a light/dark switch.

alter table public.profiles
  add column if not exists theme text not null default 'default';

alter table public.profiles
  add constraint profiles_theme_check
  check (theme in ('default', 'sunset', 'chakras', 'forest'));
