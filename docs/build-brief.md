# Wellness Tracker: build brief

This is the full product and engineering spec for this app, pasted verbatim
from the owner. It is the source of truth for scope, schema, business logic,
design and build order. `CLAUDE.md` at the repo root has the short version
of the rules that apply to every change; this file has the detail.

`reference/prototype.html` (once added to the repo) is a working single-file
prototype and is the source of truth for exact copy, the recipe seed data,
the numerology content, and the visual design. Read it before writing any
code that touches those areas.

---

## 1. What we are building

A login-based wellness web app. Each person signs up and gets their own
private tracker:

- water, steps, sleep (went to sleep and woke up times), weight
- a food log with calories and macros, plus a library of Indian and
  international recipes
- weekly meal plan, daily routine checklist, workout links
- tasks (day, week, month views), reminders, shopping list
- BMI calculator, goal progress, 7-day trends, a calorie goal helper
- a "how did today go" score, star rating and note
- numerology: personal year, month and day, universal year, month and day,
  life path and name numbers, with a readable interpretation for each
- Apple Health and Android Health Connect data flowing in automatically
  (phase 2)
- push notifications for reminders, water, meals, routine and the morning
  numerology message (phase 2)

Stack: Next.js (App Router, TypeScript), Tailwind, Supabase (Postgres, Auth,
Row Level Security), Vercel, GitHub. Package manager: pnpm.

Distribution: a website first, installable to the phone's home screen as a
PWA (see section 6c). No Play Store or App Store submission for now.

## 2. Phases

1. Web app with logins. Everything in the prototype, stored in Supabase, one
   private account per user.
2. Health sync via webhook. A secured endpoint plus per-user tokens. iPhone
   users send data with Health Auto Export or an iOS Shortcut. Android users
   send data with a Health Connect webhook app. Adapters normalise both.
3. Store apps (optional, much later). Not part of the current scope. If it
   is ever wanted, wrap the same site with Capacitor and a health plugin
   that reads HealthKit and Health Connect. Do not build this now, but keep
   the API and schema ready for it.

## 3. Setup and workflow

- Create a GitHub repo and use small commits on feature branches. Open PRs
  so Vercel preview deployments run for each one.
- Create a CLAUDE.md in the repo root stating: TypeScript strict, no `any`,
  Zod validation on every API input, never log health data, every table has
  RLS, run `pnpm lint && pnpm test && pnpm build` before every commit.
- Use the Supabase CLI. All schema changes are migration files in
  `/supabase/migrations`, never edited by hand in the dashboard.
- Environment variables (`.env.local` and the Vercel dashboard):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server only, never sent to the browser)
- In Supabase Auth, set the Site URL and redirect URLs to the Vercel
  production and preview domains.
- Auth methods: email and password or magic link, and Google. Add Sign in
  with Apple when the iOS app is built (Apple requires it if other social
  logins are offered there).

## 4. Database schema (migration 001)

Every user-owned table has `user_id uuid not null references auth.users on
delete cascade`, RLS enabled, and this policy pattern:

```sql
alter table <t> enable row level security;
create policy "own rows" on <t>
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

Tables:

```sql
profiles(user_id pk, display_name, height_cm numeric, start_kg numeric, target_kg numeric,
  cal_goal int, water_goal_ml int default 2500, steps_goal int default 8000,
  sleep_goal_h numeric default 8, bmi_scale text default 'who', age int, sex text,
  activity text default 'light', timezone text default 'Asia/Kolkata', calorie_tracking boolean default true,
  birth_date date, full_name text)             -- birth_date and full_name power numerology; both optional

weights(user_id, day date, kg numeric not null, source text default 'manual', pk(user_id, day))

daily_logs(user_id, day date, water_ml int, steps int, bed_time time, wake_time time,
  rating smallint, note text,
  meals_done jsonb default '{}',     -- {"b":true,"l":false}
  routine_done jsonb default '{}',   -- {"<routine_item_id>":true}
  links_done jsonb default '{}',     -- {"<workout_link_id>":true}
  synced jsonb default '{}',         -- {"steps":"apple","weight":"android"}
  pk(user_id, day))

food_entries(id uuid pk default gen_random_uuid(), user_id, day date,
  slot text check (slot in ('b','l','s','d')), name text, serving text,
  qty numeric check (qty > 0), kcal numeric, protein_g numeric, carbs_g numeric, fat_g numeric,
  created_at timestamptz default now())      -- kcal/macros are PER SERVING, total = qty * value

foods(id serial pk, name text, cuisine text, veg boolean, serving text, kcal numeric,
  protein_g numeric, carbs_g numeric, fat_g numeric, ingredients text, method text)
  -- global library: RLS select for authenticated, no insert/update/delete from clients

user_foods(id uuid pk, user_id, name, serving, kcal, protein_g, carbs_g, fat_g)

meal_plan(user_id, weekday smallint check (weekday between 0 and 6), slot text, text text,
  pk(user_id, weekday, slot))                 -- 0 = Monday

routine_items(id uuid pk, user_id, time time, text text)
workout_links(id uuid pk, user_id, title text, url text)      -- validate http/https only
tasks(id uuid pk, user_id, text text, due date null, done boolean default false)
reminders(id uuid pk, user_id, text text, due_date date, due_time time null, done boolean default false)
shopping_items(id uuid pk, user_id, text text, done boolean default false)
month_notes(user_id, month text, note text, pk(user_id, month))

sync_tokens(id uuid pk, user_id, token_hash text unique, label text,
  created_at timestamptz default now(), last_used_at timestamptz, revoked boolean default false)

push_subscriptions(id uuid pk, user_id, endpoint text unique, p256dh text, auth text,
  user_agent text, created_at timestamptz default now(), last_success_at timestamptz, failed_count int default 0)

notification_settings(user_id pk, reminders boolean default true, water boolean default false,
  meals boolean default false, routine boolean default false, numerology boolean default false,
  water_interval_min int default 120, numerology_time time default '07:30',
  quiet_start time default '22:00', quiet_end time default '07:00')

notification_log(user_id, kind text, ref_id text, sent_on date, sent_at timestamptz default now(),
  unique (user_id, kind, ref_id, sent_on))        -- prevents duplicate sends
```

Add indexes on `(user_id, day)` for `food_entries`, `tasks(user_id, due)` and
`reminders(user_id, due_date)`. Add a trigger that creates a `profiles` row
when a user signs up.

## 5. Food library

The `RAW` array in the prototype (about 100 dishes: Indian, Italian,
Mexican, Asian, Mediterranean, Western, basics) is the seed. Write a script
`scripts/seed-foods.ts` that converts it into `supabase/seed.sql` for the
`foods` table.

Values are estimates per typical home serving. Keep the "estimates" note in
the UI.

Search must match name and ingredients. Filters: cuisine, "My foods",
vegetarian. Use the Indian convention: green square-dot for vegetarian, red
for non-veg.

The library is a starter set, not "all recipes". Design a `FoodProvider`
interface so a larger source can be added later, for example USDA
FoodData Central, Open Food Facts or the Indian Food Composition Tables.
Check each source's licence and attribution rules before using it.

Users can add their own foods (`user_foods`) and log a one-off food that is
not saved.

## 6. Business logic (port exactly from the prototype)

- Day score: average of the goal components that exist (water, steps,
  sleep, calories or planned meals, routine, workout). Each is capped at
  100%. Calories use `foodPct`: below 80% of goal it scales up; 80 to 110%
  counts as 100%; above 110% it falls off quickly.
- Sleep hours: from bed time to wake time, wrapping past midnight.
- BMI: WHO cut-offs (18.5, 25, 30) or Asian cut-offs (18.5, 23, 25), user's
  choice. Show the healthy weight range for their height.
- Calorie goal helper: Mifflin-St Jeor BMR times an activity factor (1.2,
  1.375, 1.55, 1.725). Offer maintain, minus 275 (about 0.25 kg a week) and
  minus 550 (about 0.5 kg a week), rounded to 50. Never suggest below 1,200
  kcal (female) or 1,500 kcal (male). Show the "estimates only, check with a
  doctor or dietitian" note.
- Goal progress: `(current - start) / (target - start)`, clamped 0 to 1.
  Works for gaining or losing.
- Weeks start on Monday. Dates are the user's local date
  (`profiles.timezone`), never UTC.

### 6b. Numerology (port from the prototype)

All calculation lives in a pure, tested module `lib/numerology.ts`. The
prototype's `NUM` table holds the readings for 1 to 9 and the master
numbers 11, 22 and 33 (name, keyword, day, month and year readings,
life-path text, good-for and take-care lists, affirmation, colour). Move
that content into a typed constant or a `numerology_content` table.

- `red(n)`: add digits until the result is below 10, but stop at 11, 22 or
  33. `base(n)`: reduce fully to 1 to 9.
- Personal year = `red(digitSum(birthMonth) + digitSum(birthDay) +
  digitSum(currentYear))`. Cycles follow the calendar year.
- Personal month = `red(base(personalYear) + calendarMonth)`.
- Personal day = `red(base(personalMonth) + calendarDay)`.
- Universal year, month, day: the same chain starting from
  `red(digitSum(currentYear))`, with no birth date needed.
- Life path = `red(red(birthMonth) + red(birthDay) + red(birthYear))`.
  Birthday number = `red(birthDay)`.
- Expression, Soul urge, Personality from the full name using Pythagorean
  values (A=1 ... I=9, J=1 ... R=9, S=1 ... Z=8). Expression uses all
  letters, Soul urge the vowels A E I O U, Personality the consonants.
  Strip accents and ignore non-letters.
- Display master numbers as `11/2`, `22/4`, `33/6`.

Include unit tests. Example: birth date 1990-05-14 on 2026-09-21 gives
personal year 2, personal month 11/2, personal day 5, life path 11/2,
universal year 1.

UI: a month calendar showing the personal day number for every date, a Day
/ Month / Year selector, a "core numbers" list with a detail sheet for
each, and a strip on the Today screen linking through. Always show the note
that numerology is a traditional practice for reflection and inspiration,
not a scientific or predictive tool.

### 6c. Installable web app (PWA)

Make the site installable so people can add it to their home screen and
open it full screen with its own icon, like an app.

- Manifest: use Next.js `app/manifest.ts`. Include `name` ("My Wellness
  Tracker" or the final brand), `short_name`, `start_url: "/today"`,
  `scope: "/"`, `display: "standalone"`, `background_color: "#FAF7FD"`,
  `theme_color: "#FAF7FD"`, and icons at 192x192 and 512x512 plus a
  maskable 512x512.
- Icons: create them from the brand. Use the pearl orb with its
  pink-to-violet ring on the pale lilac background, with generous padding
  so the maskable version is not clipped. Also provide a 180x180
  `apple-touch-icon`.
- iOS tags: in the root layout add `apple-touch-icon`,
  `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, and
  `viewport-fit=cover`. Keep the safe-area padding from the prototype so
  nothing sits under the notch or home bar.
- Service worker: register a small one (a maintained helper such as
  Serwist is fine). It caches only the static app shell (JS, CSS, fonts,
  icons) and serves a friendly offline page. Never cache authenticated API
  responses, Supabase requests or anything containing health data. Version
  the cache and delete old caches on activate.
- Offline behaviour (v1): the shell opens offline and shows a clear "You
  are offline" banner. Writes need a connection. Queueing offline edits is
  a later improvement.
- Install prompt:
  - Android and desktop Chrome: listen for `beforeinstallprompt` and show
    an "Install app" button in Settings and once on the Today screen after
    the user's third visit. Let them dismiss it permanently.
  - iOS Safari: there is no install prompt, so show a short in-app guide
    ("Tap Share, then Add to Home Screen") with a small illustration, only
    when the site is not already running in standalone mode. Detect
    standalone with `matchMedia("(display-mode: standalone)")` and
    `navigator.standalone`.
- Auth inside the installed app: test sign-in in standalone mode on a real
  iPhone and a real Android phone. Social-login redirects can behave
  differently in an installed web app, so make email magic link or
  password the primary method and confirm Google sign-in returns to the
  installed app with the session intact.
- Notifications: see section 7b. The service worker you register here also
  handles push.
- HTTPS and domain: Vercel provides HTTPS. Add a custom domain and set it
  as the Supabase Site URL and redirect URL.

## 7. Health sync (phase 2)

- Endpoint: `POST /api/health-sync`, header `Authorization: Bearer <token>`.
- In Settings, a signed-in user taps "Create sync token". Show the token
  once, store only a SHA-256 hash in `sync_tokens`. Let them name, revoke
  and regenerate tokens. Show "last synced" time.
- The route uses the Supabase service-role client on the server only,
  looks up the token hash, and writes rows for that token's `user_id`.
  Validate everything with Zod. Rate limit per token. Cap the payload size.
- Metrics accepted: steps, weight, sleep, water. Ignore everything else. Do
  not store anything we do not use.
- Normalise units: steps (count), weight (kg), water (ml), sleep to bed and
  wake times (or minutes if only duration is provided).
- Assign each record to a day using the user's timezone. Merging rule:
  synced values fill blanks and update earlier synced values; they never
  overwrite a value the user typed manually (track in
  `daily_logs.synced`). Make this a setting.
- Adapters in `lib/health/adapters/`: `healthAutoExport.ts` (iPhone),
  `shortcuts.ts` (iPhone, simple JSON), and `healthConnectWebhook.ts` plus
  `healthconnectExport.ts` (Android). Do not guess payload formats. First
  ask the user to send real sample payloads from each app, save them under
  `fixtures/`, and write the adapters and tests against those. Detect the
  adapter from a `?source=` query parameter set in the user's setup
  instructions.
- Provide in-app setup guides for iPhone and Android with the user's
  personal URL, copy button and a "Send test" check that shows when the
  first data arrives.

### 7b. Push notifications (phase 2)

Web push works on Android and desktop browsers, and on iPhone (iOS 16.4 or
newer) only when the site has been added to the Home Screen and is opened
from that icon. The permission prompt must be triggered by a tap. Some
developers report that iPhone web push can occasionally stop delivering,
and it cannot break through Focus mode, so treat notifications as helpful
nudges, never as the only place a reminder lives. Reminders must always
also show inside the app on the Today screen.

- Library and keys: use the `web-push` package with VAPID keys.
  Environment variables (server only): `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT` (a `mailto:` address); public:
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, plus `CRON_SECRET`.
- Service worker: add `push` and `notificationclick` handlers to the PWA
  service worker. Clicking a notification opens the right screen
  (`/today`, `/more/reminders`, `/numerology`).
- Subscribe flow (Settings > Notifications):
  - A "Turn on notifications" button, which is the required user tap.
  - On iPhone, if the site is not running in standalone mode, show the
    "Add to Home Screen" guide instead of the button. Detect this with
    `matchMedia("(display-mode: standalone)")` and `navigator.standalone`.
  - After permission, call `pushManager.subscribe` and POST the
    subscription to `/api/push/subscribe` (authenticated). Save it in
    `push_subscriptions`. Allow several devices per user. Provide "Turn
    off" and a "Send test notification" button.
- Settings per person: switches for each type (reminders, water, meals,
  routine, morning numerology), the water interval, the numerology time,
  and quiet hours. Everything except reminders is off by default.
- Scheduler: a job that runs every 5 minutes (Vercel Cron or a Supabase
  scheduled function) and calls `/api/push/run`, protected by
  `CRON_SECRET`. For each user with a subscription, in the user's own
  timezone, it finds what is due and sends it:
  - Reminders: at the reminder's date and time.
  - Water: every N minutes between wake-up and quiet hours, but only while
    the day's goal is not yet met.
  - Meals: at typical meal times when a meal is planned for that slot and
    nothing is logged yet.
  - Routine: at the time of each routine item that is not yet ticked.
  - Morning numerology: at the chosen time, for example "Personal day 5,
    The Free Spirit: change and adventure", using the shared numerology
    module.
- No duplicates: write to `notification_log` first (the unique key blocks
  repeats) and send only if the insert succeeds.
- Clean-up: if the push service answers 404 or 410, delete that
  subscription. After repeated failures, mark it and stop sending.
- Privacy: lock screens are visible to other people, so never put weight,
  calories, sleep or other health values in a notification. Keep the
  wording generic, such as "Time for a glass of water".
- Rate and volume: cap notifications per user per day, and respect quiet
  hours strictly.

## 8. Design system (match the prototype)

- Light theme only. No dark mode.
- Fonts: Instrument Serif for headings and big numbers, Manrope for
  everything else (use `next/font`).
- Colours: background `#F8F6FC`, ink `#2B2542`, secondary ink `#5F5878`,
  line `#ECE7F5`, primary `#6A4DD4`, primary soft `#EFEAFD`. Metric colours
  (accent, soft): water `#3B8FEA / #E6F1FE`, steps `#2FB37F / #E2F6EE`,
  sleep `#7A62E0 / #ECE8FC`, calories `#EE8A3C / #FDEEDD`, routine
  `#E5609A / #FCE8F1`, workout `#EF5F55 / #FDE8E6`, weight `#A657C9 /
  #F4E7FA`.
- Background: a fixed full-screen aura (peach top-left, lilac top-right,
  mint bottom-left, rose bottom-right) over a pale lilac base, plus a very
  faint SVG grain overlay. Cards are frosted glass that glide over it as
  the page scrolls.
- Cards: 32px radius, translucent white with backdrop blur and a thin
  pearly gradient edge (white to lilac to peach, drawn with a masked
  pseudo-element).
- Today screen: date pill, a large pearl "orb" with a gradient progress
  ring, a glowing tip and a slow breathing halo showing the day score, a
  verdict line, the numerology strip, then a 2-column grid of pastel tiles
  (water, steps, sleep, weight) with big serif editable numbers, then
  frosted cards.
- Numerology screen: a mandala drawn in SVG in the colour of the selected
  number, a large italic serif number in the centre, three tappable orbs
  for personal day, month and year, and tinted number circles throughout.
- Motion: cards fade and rise in a short stagger when switching tabs or
  days (not on every tap). Respect `prefers-reduced-motion`.
- Navigation: floating pill tab bar with six tabs (Today, Food, Plan,
  Numerology, Progress, More). Inactive tabs show only an icon; the active
  tab expands into a labelled pill. More holds Routine, Reminders and
  Shopping as segments. Bottom-sheet modals for food search, recipe
  detail, custom food and numerology detail.
- Mobile first. Minimum 44px touch targets, visible focus states, respect
  the iOS safe areas, inputs at 16px so iOS does not zoom.

## 9. Privacy, safety and compliance

This is health data. Treat it carefully:

- Privacy policy and terms pages, plus explicit consent before any Health
  data sync is enabled.
- "Delete my account and all data" in Settings (delete the auth user;
  cascades remove every row). Also "Export my data" as JSON or CSV.
- Never log request bodies from the sync endpoint. Never expose the
  service-role key. Health data is never used for advertising.
- A short "not medical advice" note near BMI and the calorie helper. Let
  users switch calorie tracking off (`profiles.calorie_tracking`) and hide
  calorie numbers everywhere when it is off.
- Users under 18 should not be shown weight-loss goals. Ask for age at
  onboarding and adapt.

## 10. Build order

1. Scaffold Next.js, Tailwind, fonts, design tokens, Supabase client, auth
   pages and a protected layout.
2. Migration 001, RLS policies, and RLS tests (a second user must not be
   able to read the first user's rows).
3. Today screen: hero orb, numerology strip, tiles, routine, workout, due,
   wrap-up.
4. Food: seed and browse, log, modals, custom foods, macros summary,
   calorie goal helper.
5. Plan (tasks with day, week, month and all views; weekly meals), More
   (routine, reminders, shopping), and the Numerology screen.
6. Progress: goal, weight log and chart, BMI, 7-day trends.
7. Settings: profile and goals, delete account, export.
8. Add the PWA manifest, icons, service worker and install guides, then
   deploy to Vercel and run through the checklist below on a real iPhone
   and a real Android phone.
9. Phase 2: sync tokens, endpoint, adapters from real fixtures, setup
   guides.
10. Phase 2: push notifications (section 7b), tested on a real Android
    phone and a real iPhone with the site added to the Home Screen.

## 11. Acceptance checklist

- [ ] A new user signs up, sets goals and logs a full day. A second account
      sees none of it.
- [ ] Logging food updates calories, macros and the day score immediately.
- [ ] Deleting an account removes every row for that user.
- [ ] All screens work at 360px wide and look right on a phone.
- [ ] Lighthouse accessibility score of 90 or higher, and the site passes
      the installability checks.
- [ ] The site installs to the home screen on Android and iPhone, opens
      full screen with the right icon, and stays signed in.
- [ ] Offline, the app shell opens with an offline banner, and no
      authenticated data is ever served from the cache.
- [ ] Unit tests cover sleep wrap-around, BMI categories, calorie goal
      floors, goal progress, the day score and every numerology
      calculation, including master numbers.
- [ ] Sync endpoint rejects bad or revoked tokens and oversized payloads,
      and never overwrites manual values by default.
- [ ] Notifications: a test push arrives on Android and on an installed
      iPhone web app; a reminder fires once at the right local time; quiet
      hours are respected; no health values appear in any notification;
      dead subscriptions are removed.
