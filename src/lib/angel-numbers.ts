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

  // Double-digit repeaters -- everyday cousins of the master numbers 11 and 22.
  { sequence: "11", title: "Spiritual awakening", meaning: "A gateway number said to mark heightened intuition and a fresh sense of purpose. Pay attention to the idea you had just before you noticed it." },
  { sequence: "22", title: "Dreams into form", meaning: "The master builder's everyday cousin -- a nudge that a big goal you've been holding is more buildable than it feels. Keep pairing vision with practical steps." },
  { sequence: "33", title: "Guided compassion", meaning: "Associated with nurturing, teaching energy close at hand. A good moment to offer -- or accept -- some care." },
  { sequence: "44", title: "Steady protection", meaning: "Traditionally read as reassurance that your foundations are solid and support is close, even if you can't see it directly." },
  { sequence: "55", title: "Change is near", meaning: "A milder cousin of 555 -- change is approaching rather than already underway. Start loosening your grip on rigid plans." },
  { sequence: "66", title: "Rebalance the material", meaning: "A gentle version of 666: check whether worry about money or logistics has crowded out everything else, and come back to center." },
  { sequence: "77", title: "Inner alignment", meaning: "A quieter 777 -- a sense that reflection and learning are about to pay off. Good for study, meditation or simply noticing what you've absorbed." },
  { sequence: "88", title: "Flow returning", meaning: "Linked to abundance and karmic balance, on a smaller scale than 888. Effort already spent is said to be about to even out." },
  { sequence: "99", title: "A small completion", meaning: "A gentler 999 -- something minor is wrapping up. Let it close fully before starting the next thing." },

  // Four-digit repeaters -- the more emphatic versions of the triple-digit set above.
  { sequence: "0000", title: "Total reset", meaning: "An intensified 000: a clean slate, a sense of being back at zero with nothing carried over. A strong moment to set a clear intention." },
  { sequence: "2222", title: "Deep reassurance", meaning: "An amplified 222 -- patience is being tested but the underlying situation is said to be more stable than it feels. Keep trusting the process." },
  { sequence: "3333", title: "Support close by", meaning: "A stronger 333: creative energy and a felt sense of not being alone in what you're building." },
  { sequence: "4444", title: "Strong foundations", meaning: "Traditionally the most emphatic protection number -- a sense of being solidly held while you keep building." },
  { sequence: "5555", title: "Major transformation", meaning: "A bigger, faster-moving 555. Significant change is said to be arriving all at once rather than gradually -- steady yourself and stay flexible." },
  { sequence: "6666", title: "A stronger prompt to rebalance", meaning: "An intensified 666: a clearer signal that attention has tipped toward material worry, asking for a real reset rather than a small adjustment." },
  { sequence: "7777", title: "A run of alignment", meaning: "An amplified 777 -- multiple things clicking into place close together: insight, luck and timing arriving as a set." },
  { sequence: "8888", title: "Significant abundance", meaning: "A stronger 888: a larger sense of reward for sustained effort, often tied to career or finances reaching a turning point." },
  { sequence: "9999", title: "A full chapter closing", meaning: "The most emphatic completion number -- not just a task finishing but a whole phase of life. Give it a proper close before turning the page." },

  // Mirror-hour doubles (spotted on clocks) -- a popular folk-numerology tradition of its own.
  { sequence: "0101", title: "A path opening", meaning: "Read as new beginnings paired with self-leadership -- the confidence to start rather than wait for permission." },
  { sequence: "0202", title: "Patience in partnership", meaning: "A quieter, relationship-focused cousin of 222. Give a collaboration or connection a little more time before judging it." },
  { sequence: "0303", title: "Creative encouragement", meaning: "A nudge that your ideas have support nearby, even if it isn't loud. Share the thing you've been sitting on." },
  { sequence: "0404", title: "Stay the course", meaning: "A steadying number -- whatever structure you've built is said to be sound. Keep showing up rather than starting over." },
  { sequence: "0505", title: "Change accelerating", meaning: "Movement picking up pace. Loosen your schedule where you can rather than resisting the shift." },
  { sequence: "0606", title: "Reconnect at home", meaning: "A prompt to check in on home and family, and to notice where you might be over-functioning for others." },
  { sequence: "0707", title: "Quiet work paying off", meaning: "Study, rest or reflection you've put in is said to be close to bearing fruit, even without visible progress yet." },
  { sequence: "0808", title: "Reward approaching", meaning: "Traditionally tied to karmic and material reward -- a sense that a cycle of effort is nearing its payoff." },
  { sequence: "0909", title: "A completion nearing", meaning: "A gentler 999 on a clock -- something is close to finished. Start tying up loose ends now rather than later." },

  // More four-digit doubles, often tied to relationships and personal growth in folk readings.
  { sequence: "1313", title: "Creative foundations", meaning: "Pairs the Communicator's spark with the Builder's steadiness -- a good stretch for turning a creative idea into something structured." },
  { sequence: "1414", title: "Grounded through change", meaning: "A reminder to keep routines steady even while things shift around you. Structure is what makes the change bearable." },
  { sequence: "1515", title: "Freedom-minded change", meaning: "Encouragement to choose the more adventurous option in front of you, and to trust your ability to adapt." },
  { sequence: "1616", title: "Check the harmony at home", meaning: "A prompt to notice whether care at home is flowing both ways, and to ask for support if you've mostly been giving it." },
  { sequence: "1717", title: "Insight deepening", meaning: "Often read as a sign that spiritual or intuitive understanding is building layer by layer. Keep whatever reflective practice you're already doing." },
  { sequence: "1818", title: "Abundance through effort", meaning: "Traditionally linked to material reward that follows sustained work, not luck alone -- a nudge to keep going." },
  { sequence: "1919", title: "One door closing, one opening", meaning: "Combines the Initiator and the Humanitarian -- an ending and a beginning arriving close together. Let the first finish before leaning fully into the second." },
  { sequence: "2020", title: "Clear sight", meaning: "Read as a moment of clarity -- a situation that's been confusing is said to come into focus. Trust what you're finally seeing plainly." },
  { sequence: "2121", title: "Growing together", meaning: "A partnership or collaboration number -- encouragement to expand something you're building with someone else, rather than solo." },

  // Ascending/descending sequences -- simplicity and momentum, in either direction.
  { sequence: "234", title: "Building on momentum", meaning: "Continues where 123 leaves off -- structure catching up to the fresh start you already made." },
  { sequence: "345", title: "Expansion", meaning: "Steady progress opening into more freedom and options. A sign that it's safe to loosen the plan a little." },
  { sequence: "456", title: "Stability into flow", meaning: "Groundwork settling into something that finally feels easier. Keep the routines that got you here." },
  { sequence: "567", title: "Change opening into insight", meaning: "A transition that's about to make more sense than it currently does. Give it a little longer before judging the outcome." },
  { sequence: "678", title: "Insight taking shape", meaning: "Reflection turning into visible results. A good time to act on something you've been quietly working out." },
  { sequence: "789", title: "Results into wisdom", meaning: "An achievement settling into a lesson you'll carry forward. Take a moment to notice what it taught you, not just what it earned you." },
  { sequence: "321", title: "Simplify before you begin", meaning: "A countdown feel -- useful for clearing distractions before a fresh start rather than adding anything new." },
  { sequence: "4321", title: "Back to basics", meaning: "A bigger release than 321 -- stripping something back to its essentials before rebuilding it better." },
];

export function findAngelNumber(sequence: string): AngelNumber | null {
  const cleaned = sequence.trim();
  return ANGEL_NUMBERS.find((a) => a.sequence === cleaned) ?? null;
}
