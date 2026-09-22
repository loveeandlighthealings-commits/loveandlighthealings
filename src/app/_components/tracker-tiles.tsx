import { formatDayMonth } from "@/lib/date";
import type { TodayData } from "@/lib/today";
import { addSteps, addWater, setSleep, setSteps, setWater, setWeight } from "@/app/tracker-actions";
import { AutoSubmitField } from "./auto-submit-field";
import { DropIcon, MinusIcon, MoonIcon, PulseIcon, ScaleIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

const numberField =
  "w-full min-w-0 border-0 border-b-2 border-transparent bg-transparent p-0 font-serif text-[46px] leading-none tracking-tight text-foreground placeholder:text-foreground-subtle focus:outline-none";

const quickAddButton =
  "min-h-[38px] rounded-full bg-white px-3.5 text-sm font-bold text-foreground shadow-[0_6px_12px_-8px_rgba(60,40,120,0.4)] active:scale-95";

function TileShell({
  colorVar,
  softVar,
  icon,
  title,
  children,
}: {
  colorVar: string;
  softVar: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-[30px] p-4"
      style={{
        background: `linear-gradient(160deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 55%), ${softVar}`,
        boxShadow: `0 18px 34px -24px ${colorVar}`,
      }}
    >
      <div className="flex items-center gap-2 text-sm font-bold" style={{ color: colorVar }}>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white">{icon}</span>
        <span className="text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function TrackerTiles({ data }: { data: TodayData }) {
  const stepsLeft = data.stepsGoal ? data.stepsGoal - data.steps : 0;

  const weightNote = (() => {
    if (data.weightKg != null && data.previousWeight) {
      const diff = data.weightKg - data.previousWeight.kg;
      const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
      return `${sign}${Math.abs(diff).toFixed(1)} kg since ${formatDayMonth(data.previousWeight.day)}`;
    }
    if (data.weightKg == null && data.previousWeight) {
      return `Last: ${data.previousWeight.kg} kg, ${formatDayMonth(data.previousWeight.day)}`;
    }
    if (data.weightKg != null) return "First entry";
    return "Enter today’s weight";
  })();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Water */}
      <TileShell colorVar="var(--color-water)" softVar="var(--color-water-soft)" icon={<DropIcon />} title="Water">
        <form action={setWater}>
          <AutoSubmitField
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            name="waterMl"
            defaultValue={data.water || ""}
            placeholder="0"
            aria-label="Water in ml"
            className={numberField}
          />
          <small className="mt-0.5 block text-xs font-semibold text-foreground-muted">
            ml{data.waterGoalMl ? ` of ${data.waterGoalMl.toLocaleString("en-IN")}` : ""}
          </small>
        </form>
        {data.waterGoalMl > 0 && <ProgressBar pct={data.water / data.waterGoalMl} color="water" />}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <form action={addWater}>
            <input type="hidden" name="delta" value={250} />
            <button type="submit" className={quickAddButton}>
              +250
            </button>
          </form>
          <form action={addWater}>
            <input type="hidden" name="delta" value={500} />
            <button type="submit" className={quickAddButton}>
              +500
            </button>
          </form>
          <form action={addWater}>
            <input type="hidden" name="delta" value={-250} />
            <button type="submit" aria-label="Undo 250 ml" className={quickAddButton}>
              <MinusIcon />
            </button>
          </form>
        </div>
      </TileShell>

      {/* Steps */}
      <TileShell colorVar="var(--color-steps)" softVar="var(--color-steps-soft)" icon={<PulseIcon />} title="Steps">
        <form action={setSteps}>
          <AutoSubmitField
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            name="steps"
            defaultValue={data.steps || ""}
            placeholder="0"
            aria-label="Steps walked"
            className={numberField}
          />
          <small className="mt-0.5 block text-xs font-semibold text-foreground-muted">
            {data.stepsGoal ? (stepsLeft > 0 ? `${stepsLeft.toLocaleString("en-IN")} to go` : "Goal reached") : "steps"}
          </small>
        </form>
        {data.stepsGoal > 0 && <ProgressBar pct={data.steps / data.stepsGoal} color="steps" />}
        <div className="mt-1.5">
          <form action={addSteps}>
            <input type="hidden" name="delta" value={1000} />
            <button type="submit" className={quickAddButton}>
              +1,000
            </button>
          </form>
        </div>
      </TileShell>

      {/* Sleep */}
      <TileShell colorVar="var(--color-sleep)" softVar="var(--color-sleep-soft)" icon={<MoonIcon />} title="Sleep">
        <div>
          <div className="font-serif text-[46px] leading-none tracking-tight text-foreground">
            {data.sleptHours == null
              ? "–"
              : `${Math.floor(data.sleptHours)}h ${String(Math.round((data.sleptHours % 1) * 60)).padStart(2, "0")}`}
          </div>
          <small className="mt-0.5 block text-xs font-semibold text-foreground-muted">
            {data.sleepGoalH ? `of ${data.sleepGoalH} h goal` : "slept"}
          </small>
        </div>
        {data.sleepGoalH > 0 && data.sleptHours != null && (
          <ProgressBar pct={data.sleptHours / data.sleepGoalH} color="sleep" />
        )}
        <form action={setSleep} className="flex flex-col gap-1 text-xs font-semibold text-foreground-muted">
          <label className="flex flex-col gap-0.5">
            Went to sleep
            <AutoSubmitField
              type="time"
              name="bedTime"
              defaultValue={data.bedTime ?? ""}
              className="min-h-[40px] rounded-2xl border border-transparent bg-white/90 px-2.5 text-[15px] font-medium text-foreground"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            Woke up
            <AutoSubmitField
              type="time"
              name="wakeTime"
              defaultValue={data.wakeTime ?? ""}
              className="min-h-[40px] rounded-2xl border border-transparent bg-white/90 px-2.5 text-[15px] font-medium text-foreground"
            />
          </label>
        </form>
      </TileShell>

      {/* Weight */}
      <TileShell colorVar="var(--color-weight)" softVar="var(--color-weight-soft)" icon={<ScaleIcon />} title="Weight">
        <form action={setWeight}>
          <AutoSubmitField
            type="number"
            inputMode="decimal"
            step={0.1}
            min={0}
            name="kg"
            defaultValue={data.weightKg ?? ""}
            placeholder="–"
            aria-label="Weight in kg"
            className={numberField}
          />
          <small className="mt-0.5 block text-xs font-semibold text-foreground-muted">kg</small>
        </form>
        <p className="mt-2 text-xs font-medium text-foreground-subtle">{weightNote}</p>
      </TileShell>
    </div>
  );
}
