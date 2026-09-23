"use client";

import { useEffect, useState } from "react";
import { fastingProgress, formatDuration } from "@/lib/fasting";
import { endFast, resetFast, startFast } from "@/app/fasting-actions";
import { MoonIcon } from "./icons";
import { ProgressBar } from "./progress-bar";

const PRESETS = [12, 16, 18, 20];

const quickAddButton =
  "min-h-[38px] rounded-full bg-white px-3.5 text-sm font-bold text-foreground shadow-[0_6px_12px_-8px_rgba(60,40,120,0.4)] active:scale-95";

export interface ActiveFast {
  id: string;
  startedAt: string;
  plannedHours: number;
}

export function FastingTimer({ active }: { active: ActiveFast | null }) {
  // Ticks once a minute so the displayed duration stays current -- no need
  // for anything faster, since this only ever shows hours and minutes.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div
      className="tile flex flex-col gap-1.5 rounded-[30px] p-4"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 55%), var(--color-fasting-soft)",
        boxShadow: "0 18px 34px -24px var(--color-fasting)",
      }}
    >
      <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-fasting)" }}>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]">
          <MoonIcon />
        </span>
        <span className="text-foreground">Fasting</span>
      </div>

      {!active ? (
        <>
          <p className="mt-1 text-sm text-foreground-muted">Start a fast to track your window.</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PRESETS.map((h) => (
              <form key={h} action={startFast}>
                <input type="hidden" name="hours" value={h} />
                <button type="submit" className={quickAddButton}>
                  {h}h
                </button>
              </form>
            ))}
          </div>
        </>
      ) : (
        <FastingActive active={active} now={now} />
      )}
    </div>
  );
}

function FastingActive({ active, now }: { active: ActiveFast; now: Date }) {
  const progress = fastingProgress(new Date(active.startedAt), active.plannedHours, now);

  return (
    <>
      <div className="mt-1">
        <div className="font-serif text-[38px] leading-none tracking-tight text-foreground">
          {formatDuration(progress.elapsedHours)}
        </div>
        <small className="mt-0.5 block text-xs font-semibold text-foreground-muted">
          {progress.isComplete
            ? "Goal reached — keep going or end your fast"
            : `${formatDuration(progress.remainingHours)} to go, of ${active.plannedHours}h`}
        </small>
      </div>
      <ProgressBar pct={progress.pct} color="fasting" />
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <form action={endFast}>
          <input type="hidden" name="id" value={active.id} />
          <input type="hidden" name="broken" value={progress.isComplete ? "false" : "true"} />
          <button type="submit" className={quickAddButton}>
            {progress.isComplete ? "End fast" : "Break fast early"}
          </button>
        </form>
        <form action={resetFast}>
          <input type="hidden" name="id" value={active.id} />
          <button
            type="submit"
            aria-label="Reset timer and start over"
            className="min-h-[38px] rounded-full border border-white/70 bg-transparent px-3.5 text-sm font-bold text-foreground-muted active:scale-95"
          >
            Reset
          </button>
        </form>
      </div>
    </>
  );
}
