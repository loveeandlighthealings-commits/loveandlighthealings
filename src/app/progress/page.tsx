import { getCurrentProfile, getCurrentUser } from "@/lib/current-user";
import { getProgressData } from "@/lib/progress-data";
import {
  ACTIVITY_FACTORS,
  calculateBmi,
  calorieGoalOptions,
  goalProgress,
  type ActivityLevel,
} from "@/lib/formulas";
import { formatDayMonth } from "@/lib/date";
import {
  addWeightEntry,
  deleteWeightEntry,
  updateCalorieInputs,
  updateGoals,
  useCalorieSuggestion,
} from "@/app/progress-actions";
import { addWater, setWater } from "@/app/tracker-actions";
import { DropIcon, FlameIcon, MinusIcon, PulseIcon, ScaleIcon, SlidersIcon, TargetIcon } from "@/app/_components/icons";
import { AutoSubmitField } from "@/app/_components/auto-submit-field";
import { ProgressBar } from "@/app/_components/progress-bar";
import { SectionIcon } from "@/app/_components/page-icon";
import { TabBar } from "@/app/_components/tab-bar";

const fieldClass =
  "w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[16px] text-foreground outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ bmiHeight?: string; bmiWeight?: string }>;
}) {
  const { bmiHeight, bmiWeight } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await getProgressData(user.id);
  const { profile, weights, currentWeight, waterToday } = data;

  const cachedProfile = await getCurrentProfile();
  const hasNumerology = (cachedProfile?.interests ?? []).includes("numerology_daily");

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 pb-32">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-center font-serif text-[32px] leading-none tracking-tight text-foreground">Progress</h1>

        <GoalCard startKg={profile.startKg} targetKg={profile.targetKg} currentWeight={currentWeight} />
        <WaterCard waterMl={waterToday} goalMl={profile.waterGoalMl} />
        <NumbersCard profile={profile} />
        <CalorieHelperCard profile={profile} currentWeight={currentWeight} />
        <BmiCard
          heightCm={bmiHeight ? Number(bmiHeight) : profile.heightCm}
          weightKg={bmiWeight ? Number(bmiWeight) : currentWeight}
          scale={profile.bmiScale}
        />
        <WeightLogCard weights={weights} />
      </div>

      <TabBar hasHealthFood hasNumerology={hasNumerology} />
    </div>
  );
}

function GoalCard({
  startKg,
  targetKg,
  currentWeight,
}: {
  startKg: number | null;
  targetKg: number | null;
  currentWeight: number | null;
}) {
  let body: React.ReactNode;

  if (!targetKg) {
    body = <p className="text-sm text-foreground-muted">Add a target weight below to track how close you are.</p>;
  } else if (currentWeight == null) {
    body = (
      <p className="text-sm text-foreground-muted">
        Log your first weigh-in below to see progress toward {targetKg} kg.
      </p>
    );
  } else {
    const start = startKg ?? currentWeight;
    const remaining = targetKg - currentWeight;
    const reached = Math.abs(remaining) < 0.05;
    const progress = goalProgress(currentWeight, start, targetKg);
    const pct = Math.round(progress * 100);

    body = (
      <>
        <div className="font-serif text-4xl leading-tight tracking-tight text-foreground">
          {reached ? "Target reached" : `${Math.abs(remaining).toFixed(1)} kg to ${remaining < 0 ? "lose" : "gain"}`}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/70 p-2.5">
            <small className="block text-xs font-semibold text-foreground-muted">Start</small>
            <b className="font-serif text-xl text-foreground">{start.toFixed(1)}</b>
          </div>
          <div className="rounded-2xl bg-white/70 p-2.5">
            <small className="block text-xs font-semibold text-foreground-muted">Now</small>
            <b className="font-serif text-xl text-foreground">{currentWeight.toFixed(1)}</b>
          </div>
          <div className="rounded-2xl bg-white/70 p-2.5">
            <small className="block text-xs font-semibold text-foreground-muted">Target</small>
            <b className="font-serif text-xl text-foreground">{targetKg.toFixed(1)}</b>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-weight-soft">
          <div className="progress-fill h-full rounded-full bg-weight" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-foreground-subtle">{pct}% of the way from your starting weight.</p>
      </>
    );
  }

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={TargetIcon} color="var(--color-weight)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">How close am I?</h3>
      </div>
      {body}
    </section>
  );
}

const quickAddButton =
  "min-h-[38px] rounded-full bg-white px-3.5 text-sm font-bold text-foreground shadow-[0_6px_12px_-8px_rgba(60,40,120,0.4)] active:scale-95";

function WaterCard({ waterMl, goalMl }: { waterMl: number; goalMl: number }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={DropIcon} color="var(--color-water)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">Water today</h3>
      </div>
      <form action={setWater} className="flex items-end justify-between gap-3">
        <div className="flex-1">
          <AutoSubmitField
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            name="waterMl"
            defaultValue={waterMl || ""}
            placeholder="0"
            aria-label="Water in ml"
            className="w-full min-w-0 border-0 border-b-2 border-transparent bg-transparent p-0 font-serif text-[46px] leading-none tracking-tight text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
          <small className="mt-0.5 block text-xs font-semibold text-foreground-muted">
            ml{goalMl ? ` of ${goalMl.toLocaleString("en-IN")}` : ""}
          </small>
        </div>
      </form>
      {goalMl > 0 && <ProgressBar pct={waterMl / goalMl} color="water" />}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <form action={addWater}>
          <input type="hidden" name="delta" value={250} />
          <button type="submit" className={quickAddButton}>+250</button>
        </form>
        <form action={addWater}>
          <input type="hidden" name="delta" value={500} />
          <button type="submit" className={quickAddButton}>+500</button>
        </form>
        <form action={addWater}>
          <input type="hidden" name="delta" value={-250} />
          <button type="submit" aria-label="Undo 250 ml" className={quickAddButton}>
            <MinusIcon />
          </button>
        </form>
      </div>
    </section>
  );
}

function NumbersCard({
  profile,
}: {
  profile: Awaited<ReturnType<typeof getProgressData>>["profile"];
}) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={SlidersIcon} color="var(--color-accent)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">Your numbers</h3>
      </div>
      <form action={updateGoals} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="heightCm">Height (cm)</label>
            <input id="heightCm" name="heightCm" type="number" inputMode="decimal" step={0.5} min={0} defaultValue={profile.heightCm ?? ""} placeholder="e.g. 165" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="startKg">Starting weight (kg)</label>
            <input id="startKg" name="startKg" type="number" inputMode="decimal" step={0.1} min={0} defaultValue={profile.startKg ?? ""} placeholder="e.g. 70" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="targetKg">Target weight (kg)</label>
            <input id="targetKg" name="targetKg" type="number" inputMode="decimal" step={0.1} min={0} defaultValue={profile.targetKg ?? ""} placeholder="e.g. 62" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="calGoal">Calorie goal (kcal)</label>
            <input id="calGoal" name="calGoal" type="number" inputMode="numeric" step={10} min={0} defaultValue={profile.calGoal ?? ""} placeholder="e.g. 1800" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="waterGoalMl">Water goal (ml)</label>
            <input id="waterGoalMl" name="waterGoalMl" type="number" inputMode="numeric" step={50} min={0} defaultValue={profile.waterGoalMl} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="stepsGoal">Steps goal</label>
            <input id="stepsGoal" name="stepsGoal" type="number" inputMode="numeric" step={500} min={0} defaultValue={profile.stepsGoal} className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="sleepGoalH">Sleep goal (hours)</label>
            <input id="sleepGoalH" name="sleepGoalH" type="number" inputMode="decimal" step={0.5} min={0} defaultValue={profile.sleepGoalH} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="bmiScale">BMI categories</label>
            <select id="bmiScale" name="bmiScale" defaultValue={profile.bmiScale} className={fieldClass}>
              <option value="who">Standard (WHO)</option>
              <option value="asian">Asian cut-offs</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary flex min-h-[44px] w-full items-center justify-center px-5 text-sm">
          Save
        </button>
      </form>
    </section>
  );
}

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Mostly sitting, little exercise",
  light: "Light exercise, 1 to 3 days a week",
  moderate: "Moderate, 3 to 5 days a week",
  active: "Very active, 6 to 7 days a week",
};

function CalorieHelperCard({
  profile,
  currentWeight,
}: {
  profile: Awaited<ReturnType<typeof getProgressData>>["profile"];
  currentWeight: number | null;
}) {
  const canCalculate = profile.heightCm && currentWeight && profile.age && (profile.sex === "f" || profile.sex === "m");
  const options =
    canCalculate && profile.sex
      ? calorieGoalOptions(currentWeight!, profile.heightCm!, profile.age!, profile.sex, profile.activity)
      : null;

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={FlameIcon} color="var(--color-calories)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">Calorie goal helper</h3>
      </div>
      <form action={updateCalorieInputs} className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="age">Age</label>
          <input id="age" name="age" type="number" inputMode="numeric" min={10} max={100} defaultValue={profile.age ?? ""} placeholder="Years" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="sex">Sex</label>
          <select id="sex" name="sex" defaultValue={profile.sex ?? ""} className={fieldClass}>
            <option value="">Choose</option>
            <option value="f">Female</option>
            <option value="m">Male</option>
          </select>
        </div>
        <div className="col-span-3">
          <label className={labelClass} htmlFor="activity">Activity</label>
          <select id="activity" name="activity" defaultValue={profile.activity} className={fieldClass}>
            {Object.entries(ACTIVITY_FACTORS).map(([key]) => (
              <option key={key} value={key}>
                {ACTIVITY_LABELS[key as ActivityLevel]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-soft col-span-3 flex min-h-[40px] items-center justify-center px-4 text-sm">
          Update
        </button>
      </form>

      {options ? (
        <div className="mt-4 space-y-2">
          {options.map((option) => (
            <div key={option.label} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-3">
              <div>
                <p className="font-serif text-xl leading-tight text-foreground">
                  {option.kcal.toLocaleString("en-IN")} <span className="font-sans text-sm font-semibold text-foreground-muted">kcal/day</span>
                </p>
                <p className="text-xs text-foreground-muted">
                  {option.label}
                  {option.atFloor ? ", at the safe minimum" : ""}
                </p>
              </div>
              <form action={useCalorieSuggestion}>
                <input type="hidden" name="kcal" value={option.kcal} />
                <button type="submit" className="btn-soft min-h-[36px] px-3.5 text-sm">Use this</button>
              </form>
            </div>
          ))}
          <p className="pt-1 text-xs text-foreground-subtle">
            Estimates only, using the Mifflin-St Jeor formula. If you are pregnant, nursing or have a medical condition, check your goal with a doctor or dietitian.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-foreground-subtle">
          Add your height (above), age, sex and a weigh-in to get a suggestion.
        </p>
      )}
    </section>
  );
}

function BmiCard({
  heightCm,
  weightKg,
  scale,
}: {
  heightCm: number | null;
  weightKg: number | null;
  scale: "who" | "asian";
}) {
  const valid = heightCm && heightCm > 50 && heightCm < 260 && weightKg && weightKg > 10 && weightKg < 400;
  const result = valid ? calculateBmi(heightCm!, weightKg!, scale) : null;

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={ScaleIcon} color="var(--color-weight)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">BMI calculator</h3>
      </div>
      <form method="get" className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="bmiHeight">Height (cm)</label>
          <input id="bmiHeight" name="bmiHeight" type="number" inputMode="decimal" step={0.5} defaultValue={heightCm ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="bmiWeight">Weight (kg)</label>
          <input id="bmiWeight" name="bmiWeight" type="number" inputMode="decimal" step={0.1} defaultValue={weightKg ?? ""} className={fieldClass} />
        </div>
        <button type="submit" className="btn-soft col-span-2 flex min-h-[40px] items-center justify-center px-4 text-sm">
          Calculate
        </button>
      </form>

      {result ? (
        <div className="mt-4">
          <div className="flex items-baseline gap-3">
            <b className="font-serif text-5xl text-foreground">{result.bmi.toFixed(1)}</b>
            <span className="font-semibold text-foreground-muted">{result.category}</span>
          </div>
          <p className="mt-2 text-xs text-foreground-subtle">
            Healthy weight for {heightCm} cm: {result.healthyRangeKg[0].toFixed(1)} to {result.healthyRangeKg[1].toFixed(1)} kg.
            BMI is a screening number, not a diagnosis.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-foreground-subtle">Enter your height and weight to see your BMI.</p>
      )}
    </section>
  );
}

function WeightLogCard({ weights }: { weights: { day: string; kg: number }[] }) {
  const recent = weights.slice(-8).reverse();

  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={PulseIcon} color="var(--color-weight)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">Weight log</h3>
      </div>
      {weights.length < 2 && (
        <p className="mb-3 text-sm text-foreground-muted">Log at least two weigh-ins to see your trend.</p>
      )}
      <form action={addWeightEntry} className="mb-3 flex gap-2">
        <input type="date" name="date" className={`${fieldClass} flex-none w-auto`} />
        <input type="number" name="kg" inputMode="decimal" step={0.1} min={0} placeholder="Weight in kg" required className={fieldClass} />
        <button type="submit" className="btn-primary min-h-[44px] flex-none px-5 text-sm">Log</button>
      </form>
      <div className="divide-y divide-border">
        {recent.map((entry) => (
          <div key={entry.day} className="flex items-center gap-3 py-2.5">
            <div className="flex-1">
              <p className="font-medium text-foreground">{entry.kg} kg</p>
              <p className="text-xs text-foreground-subtle">{formatDayMonth(entry.day)}</p>
            </div>
            <form action={deleteWeightEntry}>
              <input type="hidden" name="day" value={entry.day} />
              <button type="submit" className="p-1 text-foreground-subtle" aria-label="Delete entry">
                &#10005;
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
