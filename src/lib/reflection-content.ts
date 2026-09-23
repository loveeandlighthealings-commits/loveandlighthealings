import { dayOfYear } from "@/lib/date";

/**
 * The Today screen's daily check-in: "how are you, and what's on your
 * mind" -- separate from the numerology/food content since it's about
 * the person's actual day, not a traditional practice. Nothing here is
 * clinical advice; the feel-good replies are warmth, not therapy.
 */

export interface MoodOption {
  value: number;
  emoji: string;
  label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

export function moodLabel(value: number): string {
  return MOOD_OPTIONS.find((m) => m.value === value)?.label ?? "Okay";
}

/** A time-of-day greeting in the person's own timezone. */
export function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

/** Ten rotating self-reflection prompts -- one shown per day, all year round. */
export const REFLECTION_QUESTIONS: string[] = [
  "What's one thing that went well today, even a small one?",
  "What's weighing on you right now, and what's one small step that would ease it?",
  "Who or what are you grateful for today?",
  "What did you do today that was just for you?",
  "What's a challenge you handled better than you expected to?",
  "If today had a headline, what would it be?",
  "What's something you're looking forward to?",
  "What would make tomorrow just 1% better than today?",
  "What's a kind thing someone did for you recently -- or that you did for someone else?",
  "What's one thing you'd like to let go of before you sleep tonight?",
];

/** The same question all day, rotating to a new one each calendar day. */
export function reflectionQuestionForDay(day: string): string {
  return REFLECTION_QUESTIONS[(dayOfYear(day) - 1) % REFLECTION_QUESTIONS.length];
}

/** Twenty warm, specific replies shown when someone logs a low mood. */
export const FEEL_GOOD_MESSAGES: string[] = [
  "Rough days happen, and showing up here anyway says something good about you.",
  "This feeling is real, but it isn't permanent. Be gentle with yourself today.",
  "You don't have to have it figured out today. Small steps still count.",
  "Whatever's going on, you don't have to carry it perfectly -- just carry it through today.",
  "You've gotten through every hard day so far. That's not nothing.",
  "It's okay to do the bare minimum today. Rest is productive too.",
  "One low day doesn't undo the good ones. It's just one page, not the whole book.",
  "You're allowed to feel exactly how you feel, without needing a reason.",
  "Drink some water, take three slow breaths, and lower the bar for today.",
  "Someone, somewhere, is glad you exist -- even on the days you can't feel it.",
  "This moment is asking for softness, not solutions. Give yourself that first.",
  "You are not behind. You are exactly where your day needed you to be.",
  "Small comforts count: a warm drink, a favourite song, five quiet minutes.",
  "You don't need to perform okay-ness for anyone right now, including yourself.",
  "Whatever mistake or worry is looping in your head, it does not define you.",
  "Tomorrow is a new page, and you don't have to write today's ending yet.",
  "You've survived 100% of your hard days. That track record is real.",
  "It's okay to ask for help. Strength includes knowing when to lean on someone.",
  "Notice one thing around you that's calm or beautiful right now. Just one.",
  "Be as kind to yourself tonight as you would be to a friend having this day.",
];

/** Stable within a day, varies day to day -- no client JS or randomness needed. */
export function feelGoodMessageForDay(day: string): string {
  let hash = 0;
  for (const char of day) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return FEEL_GOOD_MESSAGES[hash % FEEL_GOOD_MESSAGES.length];
}

/**
 * Shown alongside the feel-good message only for the lowest mood option
 * ("Low"), never for a merely "Meh" day -- a quiet, non-alarming pointer
 * to real support, not a diagnosis or a substitute for it. Until the app
 * has its own counsellors on board, this points people to an existing,
 * free, 24/7 national helpline (plus a general fallback for anyone
 * outside India).
 */
export const CRISIS_RESOURCE_NOTE =
  "If today feels like more than a rough day, please don't carry it alone. In India, KIRAN (the government's free, 24/7 mental health helpline) is reachable at 1800-599-0019. Outside India, please reach out to a local crisis line, a doctor, or someone you trust.";
