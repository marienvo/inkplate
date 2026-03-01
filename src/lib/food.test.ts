import { expect, test } from 'vitest';
import { getWeekendFoodPlan } from './food';
import type { DaySnapshot } from './weekend';

function makeDay(overrides: Partial<DaySnapshot> = {}): DaySnapshot {
  return {
    feelsLike: 14,
    rainChance: 20,
    windbft: 2,
    dauwp: 7,
    zicht: 22000,
    ...overrides,
  };
}

test('returns deterministic output for the same date and weather', () => {
  const date = new Date('2026-03-01T12:00:00.000Z');
  const day1 = makeDay({ feelsLike: 13, rainChance: 15 });
  const day2 = makeDay({ feelsLike: 16, rainChance: 10 });

  const first = getWeekendFoodPlan(date, day1, day2);
  const second = getWeekendFoodPlan(date, day1, day2);

  expect(second).toEqual(first);
});

test('uses only seasonal vegetables in December output', () => {
  const date = new Date('2026-12-14T12:00:00.000Z');
  const plan = getWeekendFoodPlan(date, makeDay(), makeDay({ feelsLike: 10 }));
  const savoryVegText = plan.savory.split(': ')[1] ?? '';
  const pickedVeg = savoryVegText.split(', ').filter(Boolean);

  const allowedInDecember = new Set([
    'leek',
    'kale',
    'sprouts',
    'cabbage',
    'carrot',
    'parsnip',
    'celeriac',
    'beet',
    'onion',
    'potato',
    'chicory',
    'pumpkin',
  ]);

  expect(pickedVeg.length).toBeGreaterThanOrEqual(2);
  for (const veg of pickedVeg) {
    expect(allowedInDecember.has(veg)).toBe(true);
  }
});

test('switches to meal prep + baking in bad weather mode', () => {
  const badWeather = makeDay({
    rainChance: 85,
    windbft: 8,
    feelsLike: 3,
  });
  const otherDay = makeDay({ rainChance: 95, windbft: 7, feelsLike: 5 });

  const plan = getWeekendFoodPlan(new Date('2026-11-08T12:00:00.000Z'), badWeather, otherDay);

  expect(plan.savory).toMatch(
    /^(Meal prep|Batch cook|Prep & freeze|Stock the fridge|Sunday prep): /,
  );
  expect(plan.sweet).toMatch(/^Bake: /);
});
