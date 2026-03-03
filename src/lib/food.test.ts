import { expect, test } from 'vitest';
import { getWeekendFoodPlan } from './food';
import type { DaySnapshot } from './weekend';
import { SAVORY_RECIPES, SWEET_RECIPES } from '../config/foodRules';

const SAVORY_RECIPE_TITLES = new Set(SAVORY_RECIPES.map((r) => r.title));
const SWEET_RECIPE_TITLES = new Set(SWEET_RECIPES.map((r) => r.title));

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

test('uses only seasonal vegetables in December generic output', () => {
  const date1 = new Date('2026-12-12T12:00:00.000Z');
  const date2 = new Date('2026-12-13T12:00:00.000Z');
  const plan = getWeekendFoodPlan(date1, makeDay(), date2, makeDay({ feelsLike: 10 }));

  const isRecipe = SAVORY_RECIPE_TITLES.has(plan.savory);
  if (!isRecipe) {
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
  }
});

test('does not produce outdoor-only output in bad weather', () => {
  const badWeather = makeDay({
    rainChance: 85,
    windbft: 8,
    feelsLike: 3,
  });
  const otherDay = makeDay({ rainChance: 95, windbft: 7, feelsLike: 5 });

  const plan = getWeekendFoodPlan(
    new Date('2026-11-08T12:00:00.000Z'),
    badWeather,
    new Date('2026-11-09T12:00:00.000Z'),
    otherDay,
  );

  const outdoorOnlySavory = /^(Traybake|Quick pasta|Warm bowl|Big salad|Roast veggies): /;
  expect(plan.savory).not.toMatch(outdoorOnlySavory);

  expect(plan.sweet).not.toMatch(/^Sweet: /);
});

test('produces non-empty savory and sweet strings', () => {
  const date1 = new Date('2026-06-06T12:00:00.000Z');
  const date2 = new Date('2026-06-07T12:00:00.000Z');
  const plan = getWeekendFoodPlan(date1, makeDay(), date2, makeDay());

  expect(plan.savory.length).toBeGreaterThan(0);
  expect(plan.sweet.length).toBeGreaterThan(0);
});

test('recipe titles are recognized as valid savory or sweet output', () => {
  const dates = [
    ['2026-01-10', '2026-01-11'],
    ['2026-04-18', '2026-04-19'],
    ['2026-07-11', '2026-07-12'],
    ['2026-10-10', '2026-10-11'],
  ] as const;

  const results = dates.map(([d1, d2]) =>
    getWeekendFoodPlan(new Date(d1), makeDay(), new Date(d2), makeDay()),
  );

  for (const plan of results) {
    const savoryIsRecipe = SAVORY_RECIPE_TITLES.has(plan.savory);
    const savoryIsGeneric = plan.savory.includes(': ');
    expect(savoryIsRecipe || savoryIsGeneric).toBe(true);

    const sweetIsRecipe = SWEET_RECIPE_TITLES.has(plan.sweet);
    const sweetIsGeneric = plan.sweet.includes(': ');
    expect(sweetIsRecipe || sweetIsGeneric).toBe(true);
  }
});
