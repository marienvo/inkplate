import type { DaySnapshot } from './weekend';
import {
  type Month,
  type Recipe,
  type WeatherVibe,
  SEASONAL_NL,
  SEASONAL_NL_FRUIT,
  SAVORY_RECIPES,
  SWEET_RECIPES,
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

function matchingRecipes(
  recipes: Recipe[],
  ingredientKeys: Set<string>,
  vibe: WeatherVibe,
): Recipe[] {
  return recipes.filter(
    (r) => ingredientKeys.has(r.ingredient) && (r.vibe === 'any' || r.vibe === vibe),
  );
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
  const vibe = getWeatherVibe(best);
  const seed = hashSeed(bestDate, best);
  const rnd = mulberry32(seed);

  // --- Savory ---
  const seasonalVeg = seasonalForDate(SEASONAL_NL, bestDate);
  const vegCount = rnd() < 0.65 ? 2 : 3;
  const pickedVeg = pickUnique(seasonalVeg, vegCount, rnd);
  const vegKeys = new Set(pickedVeg.map((v) => v.key));
  const savoryHits = matchingRecipes(SAVORY_RECIPES, vegKeys, vibe);
  const savory = weightedPick(savoryHits, (r) => r.weight, rnd).title;

  // --- Sweet ---
  const seasonalFruit = seasonalForDate(SEASONAL_NL_FRUIT, bestDate);
  const pickedFruit = weightedPick(seasonalFruit, (f) => f.bakeWeight, rnd);
  const sweetHits = matchingRecipes(SWEET_RECIPES, new Set([pickedFruit.key]), vibe);
  const sweet = weightedPick(sweetHits, (r) => r.weight, rnd).title;

  return { savory, sweet };
}
