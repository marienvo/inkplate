import type { DaySnapshot } from "./weekend";

type VegKey =
  | "leek"
  | "kale"
  | "sprouts"
  | "cabbage"
  | "carrot"
  | "parsnip"
  | "celeriac"
  | "beet"
  | "onion"
  | "potato"
  | "spinach"
  | "endive"
  | "chicory"
  | "cauliflower"
  | "broccoli"
  | "greenBeans"
  | "peas"
  | "asparagus"
  | "zucchini"
  | "eggplant"
  | "tomato"
  | "cucumber"
  | "pumpkin";

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type SeasonalVeg = {
  key: VegKey;
  label: string;
  months: Month[];
};

const SEASONAL_NL: SeasonalVeg[] = [
  { key: "leek", label: "leek", months: [1, 2, 3, 10, 11, 12] },
  { key: "kale", label: "kale", months: [1, 2, 3, 11, 12] },
  { key: "sprouts", label: "sprouts", months: [1, 2, 3, 11, 12] },
  { key: "cabbage", label: "cabbage", months: [1, 2, 3, 10, 11, 12] },
  { key: "carrot", label: "carrot", months: [1, 2, 3, 4, 10, 11, 12] },
  { key: "parsnip", label: "parsnip", months: [1, 2, 3, 10, 11, 12] },
  { key: "celeriac", label: "celeriac", months: [1, 2, 3, 10, 11, 12] },
  { key: "beet", label: "beet", months: [1, 2, 3, 9, 10, 11, 12] },
  { key: "onion", label: "onion", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: "potato", label: "potato", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: "spinach", label: "spinach", months: [3, 4, 5, 9, 10] },
  { key: "endive", label: "endive", months: [4, 5, 6, 9, 10] },
  { key: "chicory", label: "chicory", months: [1, 2, 3, 10, 11, 12] },
  { key: "asparagus", label: "asparagus", months: [4, 5, 6] },
  { key: "cauliflower", label: "cauliflower", months: [4, 5, 6, 7, 8, 9, 10] },
  { key: "broccoli", label: "broccoli", months: [5, 6, 7, 8, 9, 10] },
  { key: "peas", label: "peas", months: [5, 6, 7] },
  { key: "greenBeans", label: "green beans", months: [6, 7, 8, 9] },
  { key: "zucchini", label: "zucchini", months: [6, 7, 8, 9] },
  { key: "tomato", label: "tomato", months: [7, 8, 9] },
  { key: "cucumber", label: "cucumber", months: [7, 8, 9] },
  { key: "eggplant", label: "eggplant", months: [7, 8, 9] },
  { key: "pumpkin", label: "pumpkin", months: [9, 10, 11] }
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreNiceDay(day: DaySnapshot): number {
  // Independent scoring: "nice to go outside"
  const rainPenalty = day.rainChance * 1.2;
  const windPenalty = Math.max(0, day.windbft - 3) * 7;

  const comfort = 14 - Math.abs(day.feelsLike - 16);
  const comfortBonus = clamp(comfort, 0, 14);

  const muggyPenalty = day.dauwp > 18 ? (day.dauwp - 18) * 2.5 : 0;
  const visBonus = clamp((day.zicht - 8000) / 22000, 0, 1) * 4;

  return 55 + comfortBonus + visBonus - rainPenalty - windPenalty - muggyPenalty;
}

function pickBestDay(day1: DaySnapshot, day2: DaySnapshot): DaySnapshot {
  return scoreNiceDay(day1) >= scoreNiceDay(day2) ? day1 : day2;
}

function mulberry32(seed: number): () => number {
  // Deterministic pseudo-random generator
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(date: Date, day: DaySnapshot): number {
  // Stable output for same date + similar weather
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

function seasonalVegForDate(date: Date): SeasonalVeg[] {
  const month = (date.getMonth() + 1) as Month;
  return SEASONAL_NL.filter((v) => v.months.includes(month));
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

function formatVegListShort(vegs: SeasonalVeg[]): string {
  return vegs.map((v) => v.label).join(", ");
}

function isBadWeatherForOutdoors(day: DaySnapshot): boolean {
  const veryWet = day.rainChance >= 80;
  const wet = day.rainChance >= 55;
  const gale = day.windbft >= 7;
  const windy = day.windbft >= 5;
  const cold = day.feelsLike <= 5;

  // "Prep mode" triggers: indoor vibes or unpleasant outdoors
  if (veryWet) return true;
  if (wet && (gale || cold)) return true;
  if (gale) return true;
  if (wet && windy) return true;
  return false;
}

type FoodMode = "mealPrep" | "freshCook";

function getFoodMode(day: DaySnapshot): FoodMode {
  return isBadWeatherForOutdoors(day) ? "mealPrep" : "freshCook";
}

function shortFoodLine(mode: FoodMode, vegs: SeasonalVeg[], rnd: () => number): string {
  const vegText = formatVegListShort(vegs);

  const mealPrepTemplates = [
    `Meal prep: ${vegText}`,
    `Batch cook: ${vegText}`,
    `Prep & freeze: ${vegText}`,
    `Stock the fridge: ${vegText}`,
    `Sunday prep: ${vegText}`
  ];

  const freshCookTemplates = [
    `Traybake: ${vegText}`,
    `Quick pasta: ${vegText}`,
    `Warm bowl: ${vegText}`,
    `Big salad: ${vegText}`,
    `Roast veggies: ${vegText}`
  ];

  const templates = mode === "mealPrep" ? mealPrepTemplates : freshCookTemplates;
  return templates[Math.floor(rnd() * templates.length)];
}

/**
 * Very short seasonal cooking hint for the nicest weekend day.
 * Bad weather -> meal prep focus. Good weather -> fresh/quick cook.
 * Output is deterministic but varied.
 */
export function getWeekendFoodHint(date: Date, day1: DaySnapshot, day2: DaySnapshot): string {
  const best = pickBestDay(day1, day2);
  const seasonal = seasonalVegForDate(date);

  const safeFallback: SeasonalVeg[] = [
    { key: "onion", label: "onion", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { key: "carrot", label: "carrot", months: [1, 2, 3, 4, 10, 11, 12] },
    { key: "potato", label: "potato", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
  ];

  const seed = hashSeed(date, best);
  const rnd = mulberry32(seed);

  const pool = seasonal.length >= 6 ? seasonal : [...seasonal, ...safeFallback];

  // 2-3 veggies keeps it short but still varied
  const vegCount = rnd() < 0.65 ? 2 : 3;
  const pickedVeg = pickUnique(pool, vegCount, rnd);

  const mode = getFoodMode(best);
  return shortFoodLine(mode, pickedVeg, rnd);
}
