import { expect, test } from "vitest";
import { getActivityHint, getWeekendOneLiner, type DaySnapshot } from "./weekend";

function makeDay(overrides: Partial<DaySnapshot> = {}): DaySnapshot {
  return {
    feelsLike: 12,
    rainChance: 10,
    windbft: 2,
    dauwp: 6,
    zicht: 20000,
    ...overrides
  };
}

test("returns Indoor day for very wet weather", () => {
  const hint = getActivityHint(makeDay({ rainChance: 85 }));
  expect(hint).toBe("Indoor day");
});

test("returns Do not bike for wet and gale conditions", () => {
  const hint = getActivityHint(
    makeDay({
      rainChance: 60,
      windbft: 8
    })
  );
  expect(hint).toBe("Do not bike");
});

test("returns Golden outdoor day for mild, dry, calm, crystal clear weather", () => {
  const hint = getActivityHint(
    makeDay({
      feelsLike: 15,
      rainChance: 0,
      windbft: 2,
      zicht: 40000
    })
  );
  expect(hint).toBe("Golden outdoor day");
});

test("adds other-day suffix when weekend contrast is large", () => {
  const goodDay = makeDay({
    feelsLike: 16,
    rainChance: 0,
    windbft: 1,
    dauwp: 5,
    zicht: 40000
  });
  const badDay = makeDay({
    feelsLike: 4,
    rainChance: 60,
    windbft: 8,
    dauwp: 4,
    zicht: 8000
  });

  expect(getWeekendOneLiner(goodDay, badDay)).toBe("Golden outdoor day (other day stormy)");
});
