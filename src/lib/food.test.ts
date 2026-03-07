import { expect, test } from 'vitest';
import { getWeekendFoodPlan, seasonalForDate } from './food';
import type { DaySnapshot } from './weekend';
import type { CoreWeatherVibe, Month } from '../config/foodRules';
import {
  ALL_MONTHS,
  EXTRA_RECIPES,
  SAVORY_RECIPES,
  SEASONAL_NL,
  SEASONAL_NL_FRUIT,
  getWeatherVibe,
  getVibeMultiplier,
} from '../config/foodRules';
import { renderFoodHint } from './foodHintIcon';

const SAVORY_TITLES = new Set(SAVORY_RECIPES.map((r) => r.title));
const EXTRA_TITLES = new Set(EXTRA_RECIPES.map((r) => r.title));

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

function monthsCover(availableMonths: Month[], requiredMonths: Month[]): boolean {
  return requiredMonths.every((month) => availableMonths.includes(month));
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

test('always produces a known recipe title for savory and extra', () => {
  const dates = [
    ['2026-01-10', '2026-01-11'],
    ['2026-04-18', '2026-04-19'],
    ['2026-07-11', '2026-07-12'],
    ['2026-10-10', '2026-10-11'],
  ] as const;

  for (const [d1, d2] of dates) {
    const plan = getWeekendFoodPlan(new Date(d1), makeDay(), new Date(d2), makeDay());

    expect(SAVORY_TITLES.has(plan.savory)).toBe(true);
    expect(EXTRA_TITLES.has(plan.sweet)).toBe(true);
  }
});

test('savory recipes are always meal-like labels for line 1', () => {
  const disallowedLabels = new Set(['Snack', 'Prep', 'Topping', 'Frozen']);
  for (const recipe of SAVORY_RECIPES) {
    const parsed = renderFoodHint(recipe.title);
    expect(disallowedLabels.has(parsed.label)).toBe(false);
  }
});

test('does not produce fresh-only recipes in cozy weather', () => {
  const badWeather = makeDay({ rainChance: 85, windbft: 8, feelsLike: 3 });
  const otherDay = makeDay({ rainChance: 95, windbft: 7, feelsLike: 5 });

  const plan = getWeekendFoodPlan(
    new Date('2026-11-08T12:00:00.000Z'),
    badWeather,
    new Date('2026-11-09T12:00:00.000Z'),
    otherDay,
  );

  const freshOnly = new Set(
    [...SAVORY_RECIPES, ...EXTRA_RECIPES].filter((r) => r.vibe === 'fresh').map((r) => r.title),
  );

  expect(freshOnly.has(plan.savory)).toBe(false);
  expect(freshOnly.has(plan.sweet)).toBe(false);
});

test('does not produce cozy-only recipes in fresh weather', () => {
  const freshWeather = makeDay({ rainChance: 5, windbft: 2, feelsLike: 21 });
  const otherDay = makeDay({ rainChance: 10, windbft: 3, feelsLike: 19 });

  const plan = getWeekendFoodPlan(
    new Date('2026-07-11T12:00:00.000Z'),
    freshWeather,
    new Date('2026-07-12T12:00:00.000Z'),
    otherDay,
  );

  const cozyOnly = new Set(
    [...SAVORY_RECIPES, ...EXTRA_RECIPES].filter((r) => r.vibe === 'cozy').map((r) => r.title),
  );

  expect(cozyOnly.has(plan.savory)).toBe(false);
  expect(cozyOnly.has(plan.sweet)).toBe(false);
});

test('classifies wider pleasant conditions as fresh', () => {
  const pleasantButNotPerfect = makeDay({ rainChance: 35, feelsLike: 12, windbft: 5 });
  const tooWet = makeDay({ rainChance: 40, feelsLike: 12, windbft: 5 });

  expect(getWeatherVibe(pleasantButNotPerfect)).toBe('fresh');
  expect(getWeatherVibe(tooWet)).toBe('hearty');
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

test('seasonalForDate filters recipes by month', () => {
  const janOnly = { title: 'Jan Only', months: [1] as Month[] };
  const allYear = { title: 'All Year', months: ALL_MONTHS };

  const janDate = new Date(2026, 0, 15);
  const julDate = new Date(2026, 6, 15);

  const janResults = seasonalForDate([janOnly, allYear], janDate);
  expect(janResults).toHaveLength(2);

  const julResults = seasonalForDate([janOnly, allYear], julDate);
  expect(julResults).toHaveLength(1);
  expect(julResults[0]).toEqual(allYear);
});

test('every seasonal ingredient has an any-vibe recipe that covers its full season', () => {
  const anyRecipes = [...SAVORY_RECIPES, ...EXTRA_RECIPES].filter(
    (recipe) => recipe.vibe === 'any',
  );
  const anyRecipesByIngredient = new Map<string, typeof anyRecipes>();

  for (const recipe of anyRecipes) {
    const existing = anyRecipesByIngredient.get(recipe.ingredient) ?? [];
    existing.push(recipe);
    anyRecipesByIngredient.set(recipe.ingredient, existing);
  }

  for (const produce of [...SEASONAL_NL, ...SEASONAL_NL_FRUIT]) {
    const matches = anyRecipesByIngredient.get(produce.key) ?? [];
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((recipe) => monthsCover(recipe.months, produce.months))).toBe(true);
  }
});

test('applies vibe multipliers as configured', () => {
  const weatherVibes: CoreWeatherVibe[] = ['cozy', 'hearty', 'fresh'];

  for (const weatherVibe of weatherVibes) {
    expect(getVibeMultiplier(weatherVibe, weatherVibe)).toBe(1.0);
    expect(getVibeMultiplier(weatherVibe, 'any')).toBe(0.65);
  }

  expect(getVibeMultiplier('cozy', 'hearty')).toBe(0.8);
  expect(getVibeMultiplier('hearty', 'cozy')).toBe(0.8);
  expect(getVibeMultiplier('hearty', 'fresh')).toBe(0.8);
  expect(getVibeMultiplier('fresh', 'hearty')).toBe(0.8);
  expect(getVibeMultiplier('cozy', 'fresh')).toBe(0);
  expect(getVibeMultiplier('fresh', 'cozy')).toBe(0);
});

test('recency penalty strongly reduces repeated recipe suggestions', () => {
  const date1 = new Date('2026-01-10T12:00:00.000Z');
  const date2 = new Date('2026-01-11T12:00:00.000Z');
  const freshDay = makeDay({ rainChance: 5, windbft: 2, feelsLike: 20 });
  const baseline = getWeekendFoodPlan(date1, freshDay, date2, freshDay, {
    currentWeekKey: '2026-01-10',
    history: [],
  });

  const withRecentHistory = getWeekendFoodPlan(date1, freshDay, date2, freshDay, {
    currentWeekKey: '2026-01-10',
    history: [
      {
        weekKey: '2026-01-03',
        recipe: baseline.sweetPick.title,
        ingredient: baseline.sweetPick.ingredient,
        recipeVibe: baseline.sweetPick.vibe,
        weatherVibe: 'fresh',
      },
    ],
  });

  expect(withRecentHistory.sweet).not.toBe(baseline.sweet);
});

test('seasonal priorities keep all-year produce below seasonal stars', () => {
  const priorities = new Map(SEASONAL_NL.map((veg) => [veg.key, veg.seasonalPriority]));

  expect(priorities.get('tomato')).toBe(1.5);
  expect(priorities.get('pumpkin')).toBe(1.5);
  expect(priorities.get('cabbage')).toBe(1.5);
  expect(priorities.get('onion')).toBeLessThan(priorities.get('tomato') ?? 0);
  expect(priorities.get('spinach')).toBeLessThan(priorities.get('pumpkin') ?? 0);
  expect(priorities.get('peas')).toBeLessThan(priorities.get('cabbage') ?? 0);
});
