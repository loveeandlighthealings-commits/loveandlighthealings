import { saveReflection, setMood } from "@/app/mood-actions";
import { MOOD_OPTIONS, feelGoodMessageForDay, reflectionQuestionForDay } from "@/lib/reflection-content";
import { HeartIcon } from "./icons";
import { SectionIcon } from "./page-icon";

/** The Today screen's daily check-in: a mood picker, a warm reply when things feel low, and a rotating reflection question. */
export function MoodCheckIn({ day, rating, note }: { day: string; rating: number | null; note: string | null }) {
  const question = reflectionQuestionForDay(day);
  const showFeelGood = rating != null && rating <= 2;

  return (
    <section className="card animate-in">
      <div className="mb-3 flex items-center gap-3">
        <SectionIcon icon={HeartIcon} color="var(--color-routine)" />
        <h3 className="font-serif text-2xl leading-tight text-foreground">How are you today?</h3>
      </div>

      <div className="flex items-stretch justify-between gap-1">
        {MOOD_OPTIONS.map((m) => {
          const active = rating === m.value;
          return (
            <form key={m.value} action={setMood} className="flex-1">
              <input type="hidden" name="rating" value={m.value} />
              <button
                type="submit"
                aria-label={m.label}
                aria-pressed={active}
                className="flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 text-2xl transition-transform active:scale-90"
                style={
                  active
                    ? { background: "var(--color-routine-soft)", boxShadow: "inset 0 0 0 1.5px var(--color-routine)" }
                    : undefined
                }
              >
                <span>{m.emoji}</span>
                <span className="text-[10px] font-bold text-foreground-muted">{m.label}</span>
              </button>
            </form>
          );
        })}
      </div>

      {showFeelGood && (
        <div
          className="animate-in mt-4 rounded-2xl p-3.5"
          style={{ background: "var(--color-routine-soft)" }}
          // A stable key per message would replay the animation if it changes,
          // which is exactly the point -- a fresh reply each day it's shown.
          key={feelGoodMessageForDay(day)}
        >
          <p className="text-sm leading-snug text-foreground">{feelGoodMessageForDay(day)}</p>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-bold text-foreground-subtle">Today&rsquo;s reflection</p>
        <p className="mt-1 font-serif text-lg leading-snug text-foreground">{question}</p>
        <form action={saveReflection} className="mt-2">
          <textarea
            name="note"
            defaultValue={note ?? ""}
            rows={2}
            maxLength={500}
            placeholder="A few words are enough..."
            className="w-full rounded-2xl border border-border bg-white/90 px-3.5 py-2.5 text-[15px] text-foreground outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="btn-soft mt-2 flex min-h-[38px] items-center justify-center px-4 text-sm"
          >
            Save
          </button>
        </form>
      </div>
    </section>
  );
}

