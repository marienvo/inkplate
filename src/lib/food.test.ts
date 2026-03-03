import { expect, test } from 'vitest';
import { getWeekendFoodPlan } from './food';
import type { DaySnapshot } from './weekend';
import { SAVORY_RECIPES, SWEET_RECIPES } from '../config/foodRules';

const SAVORY_TITLES = new Set(SAVORY_RECIPES.map((r) => r.title));
const SWEET_TITLES = new Set(SWEET_RECIPES.map((r) => r.title));

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
  const date1 = new Date('2026-03-07T12:00:00.000Z');
  const date2 = new Date('2026-03-08T12:00:00.000Z');
  const day1 = makeDay({ feelsLike: 13, rainChance: 15 });
  const day2 = makeDay({ feelsLike: 16, rainChance: 10 });

  const first = getWeekendFoodPlan(date1, day1, date2, day2);
  const second = getWeekendFoodPlan(date1, day1, date2, day2);

  expect(second).toEqual(first);
});

test('always produces a known recipe title for savory and sweet', () => {
  const dates = [
    ['2026-01-10', '2026-01-11'],
    ['2026-04-18', '2026-04-19'],
    ['2026-07-11', '2026-07-12'],
    ['2026-10-10', '2026-10-11'],
  ] as const;

  for (const [d1, d2] of dates) {
    const plan = getWeekendFoodPlan(new Date(d1), makeDay(), new Date(d2), makeDay());

    expect(SAVORY_TITLES.has(plan.savory)).toBe(true);
    expect(SWEET_TITLES.has(plan.sweet)).toBe(true);
  }
});

test('does not produce outdoor-only recipes in bad weather', () => {
  const badWeather = makeDay({ rainChance: 85, windbft: 8, feelsLike: 3 });
  const otherDay = makeDay({ rainChance: 95, windbft: 7, feelsLike: 5 });

  const plan = getWeekendFoodPlan(
    new Date('2026-11-08T12:00:00.000Z'),
    badWeather,
    new Date('2026-11-09T12:00:00.000Z'),
    otherDay,
  );

  const outdoorOnly = new Set(
    [...SAVORY_RECIPES, ...SWEET_RECIPES].filter((r) => r.vibe === 'outdoor').map((r) => r.title),
  );

  expect(outdoorOnly.has(plan.savory)).toBe(false);
  expect(outdoorOnly.has(plan.sweet)).toBe(false);
});

test('produces non-empty output for every season', () => {
  const months = [1, 3, 5, 7, 9, 11];
  for (const m of months) {
    const d1 = new Date(2026, m - 1, 10);
    const d2 = new Date(2026, m - 1, 11);
    const plan = getWeekendFoodPlan(d1, makeDay(), d2, makeDay());

    expect(plan.savory.length).toBeGreaterThan(0);
    expect(plan.sweet.length).toBeGreaterThan(0);
  }
});
