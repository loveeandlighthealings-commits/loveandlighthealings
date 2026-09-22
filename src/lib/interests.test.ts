import { describe, expect, it } from "vitest";
import { INTERESTS, interestLabel, interestsSchema } from "./interests";

describe("interestsSchema", () => {
  it("accepts a valid subset of known keys", () => {
    const result = interestsSchema.parse(["meditation", "affirmations"]);
    expect(result).toEqual(["meditation", "affirmations"]);
  });

  it("accepts an empty array", () => {
    expect(interestsSchema.parse([])).toEqual([]);
  });

  it("rejects an unknown category", () => {
    expect(() => interestsSchema.parse(["not_a_real_category"])).toThrow();
  });

  it("de-duplicates repeated keys", () => {
    expect(interestsSchema.parse(["meditation", "meditation"])).toEqual(["meditation"]);
  });

  it("rejects more items than exist in the known list", () => {
    const tooMany = Array(INTERESTS.length + 1).fill("meditation");
    expect(() => interestsSchema.parse(tooMany)).toThrow();
  });
});

describe("interestLabel", () => {
  it("returns the human label for a known key", () => {
    expect(interestLabel("eft_tapping")).toBe("EFT Tapping");
  });

  it("falls back to the raw key for an unknown value", () => {
    expect(interestLabel("mystery")).toBe("mystery");
  });
});
