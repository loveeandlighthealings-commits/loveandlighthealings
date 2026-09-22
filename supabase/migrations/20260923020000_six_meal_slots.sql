-- Expands meal tracking from 4 slots (breakfast/lunch/snack/dinner) to 6,
-- per the owner's request: Morning Detox, Breakfast, Mid Morning Snack,
-- Lunch, Evening Snack, Dinner.
--
-- Any existing rows using the old single-letter codes are remapped before
-- the new constraint is applied, so this is safe to run against live data.

-- food_entries.slot
update public.food_entries set slot = 'breakfast' where slot = 'b';
update public.food_entries set slot = 'lunch' where slot = 'l';
update public.food_entries set slot = 'evening_snack' where slot = 's';
update public.food_entries set slot = 'dinner' where slot = 'd';

alter table public.food_entries drop constraint if exists food_entries_slot_check;
alter table public.food_entries
  add constraint food_entries_slot_check
  check (slot in ('morning_detox', 'breakfast', 'mid_morning_snack', 'lunch', 'evening_snack', 'dinner'));

-- meal_plan.slot
update public.meal_plan set slot = 'breakfast' where slot = 'b';
update public.meal_plan set slot = 'lunch' where slot = 'l';
update public.meal_plan set slot = 'evening_snack' where slot = 's';
update public.meal_plan set slot = 'dinner' where slot = 'd';

alter table public.meal_plan drop constraint if exists meal_plan_slot_check;
alter table public.meal_plan
  add constraint meal_plan_slot_check
  check (slot in ('morning_detox', 'breakfast', 'mid_morning_snack', 'lunch', 'evening_snack', 'dinner'));
