import { describe, expect, it } from "vitest";
import { allowedDietTiers } from "./diet";

describe("allowedDietTiers", () => {
  it("returns only vegan for a vegan diet", () => {
    expect(allowedDietTiers("vegan")).toEqual(["vegan"]);
  });

  it("includes vegan and vegetarian for a vegetarian diet", () => {
    expect(allowedDietTiers("vegetarian")).toEqual(["vegan", "vegetarian"]);
  });

  it("includes everything up to non_vegetarian for a non-vegetarian diet", () => {
    expect(allowedDietTiers("non_vegetarian")).toEqual([
      "vegan",
      "vegetarian",
      "eggetarian",
      "pescatarian",
      "non_vegetarian",
    ]);
  });

  it("allows every tier when no preference has been set", () => {
    expect(allowedDietTiers(null)).toHaveLength(5);
  });
});
