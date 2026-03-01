import type { DaySnapshot } from './weekend';

type VegKey =
  | 'leek'
  | 'kale'
  | 'sprouts'
  | 'cabbage'
  | 'carrot'
  | 'parsnip'
  | 'celeriac'
  | 'beet'
  | 'onion'
  | 'potato'
  | 'spinach'
  | 'endive'
  | 'chicory'
  | 'cauliflower'
  | 'broccoli'
  | 'greenBeans'
  | 'peas'
  | 'asparagus'
  | 'zucchini'
  | 'eggplant'
  | 'tomato'
  | 'cucumber'
  | 'pumpkin';

type FruitKey =
  | 'apple'
  | 'pear'
  | 'rhubarb'
  | 'strawberry'
  | 'cherry'
  | 'plum'
  | 'blueberry'
  | 'blackberry'
  | 'grape';

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type SeasonalVeg = {
  key: VegKey;
  label: string;
  months: Month[];
};

type SeasonalFruit = {
  key: FruitKey;
  label: string;
  months: Month[];
  bakeWeight: number;
};

const SEASONAL_NL: SeasonalVeg[] = [
  { key: 'leek', label: 'leek', months: [1, 2, 3, 10, 11, 12] },
  { key: 'kale', label: 'kale', months: [1, 2, 3, 11, 12] },
  { key: 'sprouts', label: 'sprouts', months: [1, 2, 3, 11, 12] },
  { key: 'cabbage', label: 'cabbage', months: [1, 2, 3, 10, 11, 12] },
  { key: 'carrot', label: 'carrot', months: [1, 2, 3, 4, 10, 11, 12] },
  { key: 'parsnip', label: 'parsnip', months: [1, 2, 3, 10, 11, 12] },
  { key: 'celeriac', label: 'celeriac', months: [1, 2, 3, 10, 11, 12] },
  { key: 'beet', label: 'beet', months: [1, 2, 3, 9, 10, 11, 12] },
  { key: 'onion', label: 'onion', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: 'potato', label: 'potato', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { key: 'spinach', label: 'spinach', months: [3, 4, 5, 9, 10] },
  { key: 'endive', label: 'endive', months: [4, 5, 6, 9, 10] },
  { key: 'chicory', label: 'chicory', months: [1, 2, 3, 10, 11, 12] },
  { key: 'asparagus', label: 'asparagus', months: [4, 5, 6] },
  { key: 'cauliflower', label: 'cauliflower', months: [4, 5, 6, 7, 8, 9, 10] },
  { key: 'broccoli', label: 'broccoli', months: [5, 6, 7, 8, 9, 10] },
  { key: 'peas', label: 'peas', months: [5, 6, 7] },
  { key: 'greenBeans', label: 'green beans', months: [6, 7, 8, 9] },
  { key: 'zucchini', label: 'zucchini', months: [6, 7, 8, 9] },
  { key: 'tomato', label: 'tomato', months: [7, 8, 9] },
  { key: 'cucumber', label: 'cucumber', months: [7, 8, 9] },
  { key: 'eggplant', label: 'eggplant', months: [7, 8, 9] },
  { key: 'pumpkin', label: 'pumpkin', months: [9, 10, 11] },
];

const SEASONAL_NL_FRUIT: SeasonalFruit[] = [
  { key: 'apple', label: 'apple', months: [9, 10, 11, 12, 1, 2, 3, 4], bakeWeight: 1.0 },
  { key: 'pear', label: 'pear', months: [9, 10, 11, 12, 1, 2, 3], bakeWeight: 1.0 },
  { key: 'rhubarb', label: 'rhubarb', months: [4, 5, 6], bakeWeight: 1.0 },
  { key: 'strawberry', label: 'strawberry', months: [5, 6, 7], bakeWeight: 0.7 },
  { key: 'cherry', label: 'cherry', months: [6, 7], bakeWeight: 0.8 },
  { key: 'plum', label: 'plum', months: [7, 8, 9], bakeWeight: 1.0 },
  { key: 'blueberry', label: 'blueberry', months: [7, 8], bakeWeight: 0.85 },
  { key: 'blackberry', label: 'blackberry', months: [8, 9], bakeWeight: 0.85 },
  { key: 'grape', label: 'grape', months: [9, 10], bakeWeight: 0.55 },
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

type SavoryMode = 'mealPrep' | 'freshCook';

function getSavoryMode(day: DaySnapshot): SavoryMode {
  return isBadWeatherForOutdoors(day) ? 'mealPrep' : 'freshCook';
}

function savoryLine(mode: SavoryMode, vegs: SeasonalVeg[], rnd: () => number): string {
  const vegText = formatListShort(vegs);

  const mealPrepTemplates = [
    `Meal prep: ${vegText}`,
    `Batch cook: ${vegText}`,
    `Prep & freeze: ${vegText}`,
    `Stock the fridge: ${vegText}`,
    `Sunday prep: ${vegText}`,
  ];

  const freshCookTemplates = [
    `Traybake: ${vegText}`,
    `Quick pasta: ${vegText}`,
    `Warm bowl: ${vegText}`,
    `Big salad: ${vegText}`,
    `Roast veggies: ${vegText}`,
  ];

  const templates = mode === 'mealPrep' ? mealPrepTemplates : freshCookTemplates;
  return templates[Math.floor(rnd() * templates.length)];
}

type BakeStyle = 'crumble' | 'cake' | 'pie' | 'muffins' | 'galette' | 'bars' | 'compote';

function bakeLine(fruit: SeasonalFruit, bestDay: DaySnapshot, rnd: () => number): string {
  const indoor = isBadWeatherForOutdoors(bestDay);
  const indoorStyles: BakeStyle[] = ['crumble', 'cake', 'pie', 'galette', 'bars'];
  const outdoorStyles: BakeStyle[] = ['muffins', 'compote', 'cake', 'crumble'];
  const styles = indoor ? indoorStyles : outdoorStyles;

  const allowedStyles = styles.filter((style) => {
    if (fruit.key === 'rhubarb') return style !== 'pie';
    if (fruit.key === 'grape') return style === 'cake' || style === 'compote';
    return true;
  });

  const style = allowedStyles[Math.floor(rnd() * allowedStyles.length)];
  const templatesByStyle: Record<BakeStyle, string[]> = {
    crumble: [`Bake: ${fruit.label} crumble`, `Bake: warm ${fruit.label} crumble`],
    cake: [`Bake: ${fruit.label} cake`, `Bake: ${fruit.label} loaf`],
    pie: [`Bake: ${fruit.label} pie`, `Bake: rustic ${fruit.label} pie`],
    muffins: [`Bake: ${fruit.label} muffins`, `Bake: ${fruit.label} muffins (batch)`],
    galette: [`Bake: ${fruit.label} galette`, `Bake: rustic ${fruit.label} galette`],
    bars: [`Bake: ${fruit.label} bars`, `Bake: ${fruit.label} oat bars`],
    compote: [`Bake: ${fruit.label} compote`, `Bake: oven ${fruit.label} compote`],
  };

  const templates = templatesByStyle[style];
  const pickIndex =
    indoor && templates.length > 1 ? (rnd() < 0.7 ? 1 : 0) : Math.floor(rnd() * templates.length);

  return templates[Math.max(0, Math.min(pickIndex, templates.length - 1))];
}

/**
 * Two-line weekend food plan:
 * Line 1: savory seasonal idea (meal prep vs fresh cook)
 * Line 2: baking/sweet suggestion using seasonal fruit
 *
 * Output is deterministic but varied.
 */
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

  const seasonalVeg = seasonalForDate(SEASONAL_NL, bestDate);
  const seasonalFruit = seasonalForDate(SEASONAL_NL_FRUIT, bestDate);

  const safeVegFallback: SeasonalVeg[] = [
    { key: 'onion', label: 'onion', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { key: 'carrot', label: 'carrot', months: [1, 2, 3, 4, 10, 11, 12] },
    { key: 'potato', label: 'potato', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  ];
  const safeFruitFallback: SeasonalFruit[] = [
    { key: 'apple', label: 'apple', months: [1, 2, 3, 4, 9, 10, 11, 12], bakeWeight: 1.0 },
    { key: 'pear', label: 'pear', months: [1, 2, 3, 9, 10, 11, 12], bakeWeight: 1.0 },
  ];

  const seed = hashSeed(bestDate, best);
  const rnd = mulberry32(seed);
  const vegPool = seasonalVeg.length >= 6 ? seasonalVeg : [...seasonalVeg, ...safeVegFallback];
  const fruitPool = seasonalFruit.length > 0 ? seasonalFruit : safeFruitFallback;

  // 2-3 veggies keeps it short but still varied
  const vegCount = rnd() < 0.65 ? 2 : 3;
  const pickedVeg = pickUnique(vegPool, vegCount, rnd);
  const mode = getSavoryMode(best);
  const savory = savoryLine(mode, pickedVeg, rnd);

  const indoor = isBadWeatherForOutdoors(best);
  const shouldBake = indoor ? true : rnd() < 0.55;
  const fruit = weightedPick(fruitPool, (item) => item.bakeWeight, rnd);
  const sweet = shouldBake ? bakeLine(fruit, best, rnd) : `Sweet: ${fruit.label}`;

  return { savory, sweet };
}
