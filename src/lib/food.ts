import type { DaySnapshot } from './weekend';
import {
  type CoreWeatherVibe,
  type Month,
  type Recipe,
  SEASONAL_NL,
  SEASONAL_NL_FRUIT,
  SAVORY_RECIPES,
  EXTRA_RECIPES,
  getVibeMultiplier,
  getWeatherVibe,
} from '../config/foodRules';
import type { FoodHistoryEntry } from './foodHistory';
import { getWeeksAgo } from './foodHistory';

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

function dateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function seasonalForDate<T extends { months: Month[] }>(items: T[], date: Date): T[] {
  const month = (date.getMonth() + 1) as Month;
  return items.filter((item) => item.months.includes(month));
}

function weightedPick<T>(items: T[], weightOf: (item: T) => number, rnd: () => number): T {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  if (total <= 0) return items[0];
  let roll = rnd() * total;
  for (const item of items) {
    roll -= weightOf(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function weightedPickUnique<T>(
  items: T[],
  weightOf: (item: T) => number,
  count: number,
  rnd: () => number,
): T[] {
  const pool = [...items];
  const chosen: T[] = [];
  while (pool.length > 0 && chosen.length < count) {
    const pick = weightedPick(pool, weightOf, rnd);
    const index = pool.indexOf(pick);
    if (index === -1) break;
    chosen.push(pick);
    pool.splice(index, 1);
  }
  return chosen;
}

function toCoreWeatherVibe(vibe: ReturnType<typeof getWeatherVibe>): CoreWeatherVibe {
  if (vibe === 'any') {
    throw new Error('Weather vibe cannot be any');
  }
  return vibe;
}

function recipeRecencyMultiplier(
  recipeTitle: string,
  history: FoodHistoryEntry[],
  currentWeekKey: string,
): number {
  const seenRecently = history.some((entry) => {
    if (entry.recipe !== recipeTitle) return false;
    const weeksAgo = getWeeksAgo(currentWeekKey, entry.weekKey);
    return weeksAgo !== null && weeksAgo >= 1 && weeksAgo <= 6;
  });

  return seenRecently ? 0.05 : 1;
}

function ingredientRecencyMultiplier(
  ingredient: string,
  history: FoodHistoryEntry[],
  currentWeekKey: string,
): number {
  const weeksAgoMatches = history
    .filter((entry) => entry.ingredient === ingredient)
    .map((entry) => getWeeksAgo(currentWeekKey, entry.weekKey))
    .filter((weeksAgo): weeksAgo is number => weeksAgo !== null && weeksAgo >= 1 && weeksAgo <= 3);

  if (weeksAgoMatches.some((weeksAgo) => weeksAgo <= 2)) return 0.15;
  if (weeksAgoMatches.length > 0) return 0.3;
  return 1;
}

function vibeRecencyMultiplier(
  recipeVibe: Recipe['vibe'],
  history: FoodHistoryEntry[],
  currentWeekKey: string,
): number {
  const repeatedLastWeek = history.some((entry) => {
    const weeksAgo = getWeeksAgo(currentWeekKey, entry.weekKey);
    return weeksAgo === 1 && entry.recipeVibe === recipeVibe;
  });
  return repeatedLastWeek ? 0.8 : 1;
}

type ScoredRecipe = {
  recipe: Recipe;
  effectiveWeight: number;
  fallbackWeight: number;
};

function scoreRecipes(
  recipes: Recipe[],
  ingredientKeys: Set<string>,
  weatherVibe: CoreWeatherVibe,
  history: FoodHistoryEntry[],
  currentWeekKey: string,
): ScoredRecipe[] {
  return recipes
    .filter((recipe) => ingredientKeys.has(recipe.ingredient))
    .map((recipe) => {
      const vibeMult = getVibeMultiplier(weatherVibe, recipe.vibe);
      const fallbackWeight = recipe.weight * vibeMult;
      const effectiveWeight =
        fallbackWeight *
        recipeRecencyMultiplier(recipe.title, history, currentWeekKey) *
        ingredientRecencyMultiplier(recipe.ingredient, history, currentWeekKey) *
        vibeRecencyMultiplier(recipe.vibe, history, currentWeekKey);

      return { recipe, effectiveWeight, fallbackWeight };
    })
    .filter((candidate) => candidate.fallbackWeight > 0);
}

function pickScoredRecipe(candidates: ScoredRecipe[], rnd: () => number): Recipe {
  if (candidates.length === 0) {
    throw new Error('No matching food recipes for current constraints');
  }

  const effectiveTotal = candidates.reduce((sum, candidate) => sum + candidate.effectiveWeight, 0);
  if (effectiveTotal > 0) {
    return weightedPick(candidates, (candidate) => candidate.effectiveWeight, rnd).recipe;
  }

  return weightedPick(candidates, (candidate) => candidate.fallbackWeight, rnd).recipe;
}

export type FoodPick = {
  title: string;
  ingredient: string;
  vibe: Recipe['vibe'];
};

export type FoodPlanHistoryContext = {
  currentWeekKey: string;
  history: FoodHistoryEntry[];
};

export function getWeekendFoodPlan(
  date1: Date,
  day1: DaySnapshot,
  date2: Date,
  day2: DaySnapshot,
  historyContext?: FoodPlanHistoryContext,
): {
  savory: string;
  sweet: string;
  savoryPick: FoodPick;
  sweetPick: FoodPick;
  weatherVibe: CoreWeatherVibe;
} {
  const score1 = scoreNiceDay(day1);
  const score2 = scoreNiceDay(day2);
  const best = score1 >= score2 ? day1 : day2;
  const bestDate = score1 >= score2 ? date1 : date2;
  const weatherVibe = toCoreWeatherVibe(getWeatherVibe(best));
  const currentWeekKey = historyContext?.currentWeekKey ?? dateToKey(bestDate);
  const history = historyContext?.history ?? [];
  const seed = hashSeed(bestDate, best);
  const rnd = mulberry32(seed);

  // --- Savory ---
  const seasonalVeg = seasonalForDate(SEASONAL_NL, bestDate);
  const vegCount = rnd() < 0.65 ? 2 : 3;
  const pickedVeg = weightedPickUnique(
    seasonalVeg,
    (veg) => veg.seasonalPriority * ingredientRecencyMultiplier(veg.key, history, currentWeekKey),
    vegCount,
    rnd,
  );
  const vegKeys = new Set(pickedVeg.map((v) => v.key));
  const seasonalSavory = seasonalForDate(SAVORY_RECIPES, bestDate);
  const savoryCandidates = scoreRecipes(
    seasonalSavory,
    vegKeys,
    weatherVibe,
    history,
    currentWeekKey,
  );
  const savoryRecipe = pickScoredRecipe(savoryCandidates, rnd);

  // --- Sweet ---
  const seasonalFruit = seasonalForDate(SEASONAL_NL_FRUIT, bestDate);
  const pickedFruit = weightedPick(
    seasonalFruit,
    (f) => f.bakeWeight * ingredientRecencyMultiplier(f.key, history, currentWeekKey),
    rnd,
  );
  const seasonalExtra = seasonalForDate(EXTRA_RECIPES, bestDate);
  const sweetCandidates = scoreRecipes(
    seasonalExtra,
    new Set([pickedFruit.key]),
    weatherVibe,
    history,
    currentWeekKey,
  );
  const sweetRecipe = pickScoredRecipe(sweetCandidates, rnd);

  return {
    savory: savoryRecipe.title,
    sweet: sweetRecipe.title,
    savoryPick: {
      title: savoryRecipe.title,
      ingredient: savoryRecipe.ingredient,
      vibe: savoryRecipe.vibe,
    },
    sweetPick: {
      title: sweetRecipe.title,
      ingredient: sweetRecipe.ingredient,
      vibe: sweetRecipe.vibe,
    },
    weatherVibe,
  };
}
