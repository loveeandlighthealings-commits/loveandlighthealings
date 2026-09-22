/**
 * Numerology calculations, ported exactly from reference/prototype.html
 * per docs/build-brief.md section 6b. Pure functions, no I/O.
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

export interface PersonalNumbers {
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  universalYear: number;
  universalMonth: number;
  universalDay: number;
  lifePath: number;
  birthdayNumber: number;
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

  const lifePath = red(red(birthMonth) + red(birthDay) + red(birthYear));
  const birthdayNumber = red(birthDay);

  return {
    personalYear,
    personalMonth,
    personalDay,
    universalYear,
    universalMonth,
    universalDay,
    lifePath,
    birthdayNumber,
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
}

/**
 * Expression, Soul urge and Personality numbers from a full name. Strips
 * accents and non-letters. Returns null for a name with no letters at all.
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
  for (const letter of cleaned) {
    const value = LETTER_VALUES[letter];
    all += value;
    if (VOWELS.has(letter)) vowels += value;
    else consonants += value;
  }

  return {
    expression: red(all),
    soulUrge: vowels ? red(vowels) : 0,
    personality: consonants ? red(consonants) : 0,
  };
}
