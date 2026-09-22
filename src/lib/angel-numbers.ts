/**
 * Meanings for common repeating and sequential number patterns people
 * notice on clocks, receipts, plates and so on -- "angel numbers", a
 * popular folk practice distinct from core numerology. Offered the same
 * way as the rest of this app's numerology content: for reflection, not
 * as prediction.
 */
export interface AngelNumber {
  sequence: string;
  title: string;
  meaning: string;
}

export const ANGEL_NUMBERS: AngelNumber[] = [
  { sequence: "000", title: "Wholeness", meaning: "A sense of coming full circle, connection to source, and infinite potential. A good moment to set an intention from a clean slate." },
  { sequence: "111", title: "New beginnings", meaning: "A manifestation gateway -- what you're focusing on right now takes root quickly. Notice your thoughts and point them where you want to go." },
  { sequence: "121", title: "Partnership", meaning: "Balance within a relationship or collaboration. Keep communication open as things shift toward something new." },
  { sequence: "222", title: "Balance and trust", meaning: "Reassurance that something is falling into place, even if progress feels slow. Keep faith in the process and in your partnerships." },
  { sequence: "333", title: "Growth and support", meaning: "Encouragement to express your creativity, with support close by. A nudge to grow into your own potential." },
  { sequence: "444", title: "Protection and stability", meaning: "A sense of being steadied and supported, often after a stretch of hard work. Foundations are solid; keep building." },
  { sequence: "555", title: "Change", meaning: "A significant shift is underway or approaching. Stay flexible rather than resisting the transition." },
  { sequence: "555 (repeating often)", title: "Transformation", meaning: "Bigger change than a single 555 -- a whole chapter turning. Trust that the disruption is clearing space for something better." },
  { sequence: "666", title: "Rebalance", meaning: "A prompt to check whether your attention has tipped too far toward worry or material concerns, and to come back to center." },
  { sequence: "777", title: "Alignment", meaning: "A sense of things clicking into place -- insight, luck and learning arriving together. A good time for reflection." },
  { sequence: "888", title: "Abundance", meaning: "Flow, especially around effort finally paying off. Traditionally linked to financial or material reward and closing a cycle fairly." },
  { sequence: "999", title: "Completion", meaning: "A chapter closing so a new one can begin. Good for finishing loose ends, forgiving, and making room for what's next." },
  { sequence: "123", title: "Next step", meaning: "Simplicity and forward motion -- take the next natural step rather than overthinking the whole staircase." },
  { sequence: "1010", title: "Awakening", meaning: "New beginnings arriving with a sense of support. Often noticed during a period of personal growth or spiritual opening." },
  { sequence: "1111", title: "Synchronicity", meaning: "The most talked-about sequence: a felt sense of alignment between your inner world and outer reality. A moment to notice what you were just thinking about." },
  { sequence: "1212", title: "Expansion", meaning: "Encouragement to stay optimistic while something in your life expands. Keep your thoughts aligned with where you want to grow." },
  { sequence: "1234", title: "Steady progress", meaning: "Life unfolding in order, one step at a time. A reminder that gradual, sequential progress still counts." },
];

export function findAngelNumber(sequence: string): AngelNumber | null {
  const cleaned = sequence.trim();
  return ANGEL_NUMBERS.find((a) => a.sequence === cleaned) ?? null;
}
