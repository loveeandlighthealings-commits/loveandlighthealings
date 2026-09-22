/**
 * Numerology calculations. The core personal/universal cycle numbers and
 * name numbers are ported exactly from reference/prototype.html per
 * docs/build-brief.md section 6b. This also adds the deeper traditional
 * layer a full reading includes: Karmic Debt, Challenge numbers, Pinnacle
 * numbers (with their life-stage age ranges), the Maturity number and the
 * Hidden Passion number. Pure functions, no I/O.
 *
 * Numerology is a traditional practice offered here for reflection and
 * inspiration, not a scientific or predictive tool -- see the note
 * rendered alongside every numerology screen.
 */

function digitSum(n: number): number {
  return String(Math.abs(n))
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
}

/** Reduces to a single digit, except it stops at the master numbers 11, 22, 33. */
export function red(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = digitSum(n);
  return n;
}

/** Reduces all the way to a single digit (1-9), even past a master number. */
export function base(n: number): number {
  while (n > 9) n = digitSum(n);
  return n;
}

/** "11/2" for master numbers, otherwise the number itself. */
export function displayNumber(n: number): string {
  return n > 9 ? `${n}/${base(n)}` : String(n);
}

const KARMIC_DEBT_NUMBERS = new Set([13, 14, 16, 19]);

/**
 * Reduces `n` the same way `red()` does, but also reports whether one of
 * the traditional Karmic Debt numbers (13, 14, 16, 19) appeared anywhere
 * in the reduction chain before the final value -- e.g. a Life Path whose
 * pre-reduction total was 16 carries a Karmic Debt even though the final
 * Life Path number is 7.
 */
function reduceTracked(n: number, keepMaster: boolean): { value: number; karmicDebt: number | null } {
  const chain = [n];
  let current = n;
  while (current > 9 && !(keepMaster && (current === 11 || current === 22 || current === 33))) {
    current = digitSum(current);
    chain.push(current);
  }
  const debt = chain.slice(0, -1).find((v) => KARMIC_DEBT_NUMBERS.has(v));
  return { value: current, karmicDebt: debt ?? null };
}

export interface PersonalNumbers {
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  universalYear: number;
  universalMonth: number;
  universalDay: number;
  lifePath: number;
  birthdayNumber: number;
  lifePathKarmicDebt: number | null;
  birthdayKarmicDebt: number | null;
}

/**
 * Personal and universal cycle numbers for one date, given a birth date.
 * Both dates are "YYYY-MM-DD" strings, using the person's own local date
 * (never UTC) per docs/build-brief.md section 6. Cycles follow the
 * calendar year, not the birth anniversary.
 */
export function calculatePersonalNumbers(birthDate: string, forDate: string): PersonalNumbers {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = forDate.split("-").map(Number);

  const personalYear = red(digitSum(birthMonth) + digitSum(birthDay) + digitSum(year));
  const personalMonth = red(base(personalYear) + month);
  const personalDay = red(base(personalMonth) + day);

  const universalYear = red(digitSum(year));
  const universalMonth = red(base(universalYear) + month);
  const universalDay = red(base(universalMonth) + day);

  const lifePathSum = red(birthMonth) + red(birthDay) + red(birthYear);
  const lifePathResult = reduceTracked(lifePathSum, true);
  const birthdayResult = reduceTracked(birthDay, true);

  return {
    personalYear,
    personalMonth,
    personalDay,
    universalYear,
    universalMonth,
    universalDay,
    lifePath: lifePathResult.value,
    birthdayNumber: birthdayResult.value,
    lifePathKarmicDebt: lifePathResult.karmicDebt,
    birthdayKarmicDebt: birthdayResult.karmicDebt,
  };
}

/**
 * The Maturity number: the theme you grow into as your Life Path and
 * Expression numbers merge, usually felt from the mid-30s onward.
 */
export function calculateMaturity(lifePath: number, expression: number): number {
  return red(lifePath + expression);
}

export interface Challenges {
  first: number;
  second: number;
  third: number;
  fourth: number;
}

/**
 * The four Challenge numbers: the growth-edge each life stage asks you to
 * work through. Unlike most numerology numbers these can be 0 (meaning no
 * single fixed obstacle -- every lesson is available to you) and are never
 * master numbers.
 */
export function calculateChallenges(birthDate: string): Challenges {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const m = base(birthMonth);
  const d = base(birthDay);
  const y = base(digitSum(birthYear));

  const first = base(Math.abs(m - d));
  const second = base(Math.abs(d - y));
  const third = base(Math.abs(first - second));
  const fourth = base(Math.abs(m - y));

  return { first, second, third, fourth };
}

export interface Pinnacle {
  number: number;
  fromAge: number;
  /** null means this pinnacle runs for the rest of life. */
  toAge: number | null;
}

export interface Pinnacles {
  first: Pinnacle;
  second: Pinnacle;
  third: Pinnacle;
  fourth: Pinnacle;
}

/**
 * The four Pinnacles: major life-stage themes and the age ranges they
 * cover. The first Pinnacle's end age depends on the Life Path number
 * (36 minus its base digit); each Pinnacle after that runs 9 years, with
 * the fourth lasting the rest of life.
 */
export function calculatePinnacles(birthDate: string, lifePath: number): Pinnacles {
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const m = base(birthMonth);
  const d = base(birthDay);
  const y = base(digitSum(birthYear));

  const first = red(m + d);
  const second = red(d + y);
  const third = red(first + second);
  const fourth = red(m + y);

  const firstEnds = 36 - base(lifePath);

  return {
    first: { number: first, fromAge: 0, toAge: firstEnds },
    second: { number: second, fromAge: firstEnds, toAge: firstEnds + 9 },
    third: { number: third, fromAge: firstEnds + 9, toAge: firstEnds + 18 },
    fourth: { number: fourth, fromAge: firstEnds + 18, toAge: null },
  };
}

// Pythagorean letter values: A-I = 1-9, J-R = 1-9, S-Z = 1-8.
const LETTER_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export interface NameNumbers {
  /** From every letter. */
  expression: number;
  /** From the vowels only -- what your heart desires. */
  soulUrge: number;
  /** From the consonants only -- how others first see you. */
  personality: number;
  expressionKarmicDebt: number | null;
  soulUrgeKarmicDebt: number | null;
  personalityKarmicDebt: number | null;
  /** The letter value(s) appearing most often in the name -- a talent used so naturally it can go unnoticed. More than one number if tied. */
  hiddenPassion: number[];
}

/**
 * Expression, Soul urge, Personality and Hidden Passion numbers from a
 * full name. Strips accents and non-letters. Returns null for a name with
 * no letters at all.
 */
export function calculateNameNumbers(fullName: string): NameNumbers | null {
  const cleaned = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!cleaned) return null;

  let all = 0;
  let vowels = 0;
  let consonants = 0;
  const frequency: Record<number, number> = {};

  for (const letter of cleaned) {
    const value = LETTER_VALUES[letter];
    all += value;
    frequency[value] = (frequency[value] ?? 0) + 1;
    if (VOWELS.has(letter)) vowels += value;
    else consonants += value;
  }

  const expressionResult = reduceTracked(all, true);
  const soulUrgeResult = vowels ? reduceTracked(vowels, true) : { value: 0, karmicDebt: null };
  const personalityResult = consonants ? reduceTracked(consonants, true) : { value: 0, karmicDebt: null };

  const maxFrequency = Math.max(...Object.values(frequency));
  const hiddenPassion = Object.entries(frequency)
    .filter(([, count]) => count === maxFrequency)
    .map(([value]) => Number(value))
    .sort((a, b) => a - b);

  return {
    expression: expressionResult.value,
    soulUrge: soulUrgeResult.value,
    personality: personalityResult.value,
    expressionKarmicDebt: expressionResult.karmicDebt,
    soulUrgeKarmicDebt: soulUrgeResult.karmicDebt,
    personalityKarmicDebt: personalityResult.karmicDebt,
    hiddenPassion,
  };
}
