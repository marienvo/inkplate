import type { DaySnapshot } from './weekend';
import {
  type Month,
  type Recipe,
  type WeatherVibe,
  SEASONAL_NL,
  SEASONAL_NL_FRUIT,
  SAFE_VEG_FALLBACK,
  SAFE_FRUIT_FALLBACK,
  SAVORY_DISHES,
  SWEET_DISHES,
  SAVORY_RECIPES,
  SWEET_RECIPES,
  GENERIC_FALLBACK_WEIGHT,
  getWeatherVibe,
} from '../config/foodRules';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreNiceDay(day: DaySnapshot): number {
  const rainPenalty = day.rainChance * 1.2;
  const windPenalty = Math.max(0, day.windbft - 3) * 7;

  const comfort = 14 - Math.abs(day.feelsLike - 16);
  const comfortBonus = clamp(comfort, 0, 14);

  const muggyPenalty = day.dauwp > 18 ? (day.dauwp - 18) * 2.5 : 0;
  const visBonus = clamp((day.zicht - 8000) / 22000, 0, 1) * 4;

  return 55 + comfortBonus + visBonus - rainPenalty - windPenalty - muggyPenalty;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(date: Date, day: DaySnapshot): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const feels = Math.round(day.feelsLike);
  const rain = Math.round(day.rainChance / 5);
  const wind = Math.round(day.windbft);
  const dew = Math.round(day.dauwp);

  return (
    (y * 10000 + m * 100 + d) ^
    (feels * 73856093) ^
    (rain * 19349663) ^
    (wind * 83492791) ^
    (dew * 2654435761)
  );
}

function seasonalForDate<T extends { months: Month[] }>(items: T[], date: Date): T[] {
  const month = (date.getMonth() + 1) as Month;
  return items.filter((item) => item.months.includes(month));
}

function pickUnique<T>(items: T[], count: number, rnd: () => number): T[] {
  const pool = [...items];
  const chosen: T[] = [];
  while (pool.length > 0 && chosen.length < count) {
    const idx = Math.floor(rnd() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}

function weightedPick<T>(items: T[], weightOf: (item: T) => number, rnd: () => number): T {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let roll = rnd() * total;
  for (const item of items) {
    roll -= weightOf(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function formatListShort(items: { label: string }[]): string {
  return items.map((item) => item.label).join(', ');
}

function matchingRecipes(
  recipes: Recipe[],
  ingredientKeys: Set<string>,
  vibe: WeatherVibe,
): Recipe[] {
  return recipes.filter(
    (r) => ingredientKeys.has(r.ingredient) && (r.vibe === 'any' || r.vibe === vibe),
  );
}

function pickRecipeOrGeneric(
  recipes: Recipe[],
  genericFn: () => string,
  rnd: () => number,
): string {
  if (recipes.length === 0) return genericFn();

  const recipeWeight = recipes.reduce((sum, r) => sum + r.weight, 0);
  const total = recipeWeight + GENERIC_FALLBACK_WEIGHT;

  if (rnd() * total >= recipeWeight) return genericFn();
  return weightedPick(recipes, (r) => r.weight, rnd).title;
}

export function getWeekendFoodPlan(
  date1: Date,
  day1: DaySnapshot,
  date2: Date,
  day2: DaySnapshot,
): { savory: string; sweet: string } {
  const score1 = scoreNiceDay(day1);
  const score2 = scoreNiceDay(day2);
  const best = score1 >= score2 ? day1 : day2;
  const bestDate = score1 >= score2 ? date1 : date2;
  const month = (bestDate.getMonth() + 1) as Month;
  const vibe = getWeatherVibe(best);
  const seed = hashSeed(bestDate, best);
  const rnd = mulberry32(seed);

  // --- Savory ---
  const seasonalVeg = seasonalForDate(SEASONAL_NL, bestDate);
  const vegPool = seasonalVeg.length >= 6 ? seasonalVeg : [...seasonalVeg, ...SAFE_VEG_FALLBACK];
  const vegCount = rnd() < 0.65 ? 2 : 3;
  const pickedVeg = pickUnique(vegPool, vegCount, rnd);
  const vegKeys = new Set(pickedVeg.map((v) => v.key));

  const savoryHits = matchingRecipes(SAVORY_RECIPES, vegKeys, vibe);
  const savory = pickRecipeOrGeneric(
    savoryHits,
    () => {
      const candidates = SAVORY_DISHES.filter(
        (d) => d.months.includes(month) && (d.vibe === 'any' || d.vibe === vibe),
      );
      const dish = weightedPick(candidates, (d) => d.weight, rnd);
      return dish.template.replace('{veg}', formatListShort(pickedVeg));
    },
    rnd,
  );

  // --- Sweet ---
  const seasonalFruit = seasonalForDate(SEASONAL_NL_FRUIT, bestDate);
  const fruitPool = seasonalFruit.length > 0 ? seasonalFruit : SAFE_FRUIT_FALLBACK;
  const pickedFruit = weightedPick(fruitPool, (f) => f.bakeWeight, rnd);
  const fruitKeys = new Set([pickedFruit.key]);

  const sweetHits = matchingRecipes(SWEET_RECIPES, fruitKeys, vibe);
  const sweet = pickRecipeOrGeneric(
    sweetHits,
    () => {
      const candidates = SWEET_DISHES.filter((d) => {
        if (!d.months.includes(month)) return false;
        if (d.vibe !== 'any' && d.vibe !== vibe) return false;
        if (d.excludeFruits?.includes(pickedFruit.key)) return false;
        if (d.onlyFruits && !d.onlyFruits.includes(pickedFruit.key)) return false;
        return true;
      });
      const dish = weightedPick(candidates, (d) => d.weight, rnd);
      return dish.template.replace('{fruit}', pickedFruit.label);
    },
    rnd,
  );

  return { savory, sweet };
}
