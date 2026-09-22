-- Lets each person choose which dashboard sections they want to see.
-- Stored as an array of category keys on their profile. An empty array
-- means "hasn't chosen yet", which the app treats as a signal to send
-- them through onboarding.

alter table public.profiles
  add column if not exists interests text[] not null default '{}';

alter table public.profiles
  add constraint profiles_interests_check
  check (
    interests <@ array[
      'health_food',
      'meditation',
      'angel_numbers',
      'numerology_daily',
      'eft_tapping',
      'affirmations',
      'spiritual_insights'
    ]::text[]
  );
