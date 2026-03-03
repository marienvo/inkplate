import type { DaySnapshot } from '../lib/weekend';

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type WeatherVibe = 'indoor' | 'outdoor' | 'any';

export type SeasonalVeg = {
  key: string;
  label: string;
  months: Month[];
};

export type SeasonalFruit = {
  key: string;
  label: string;
  months: Month[];
  bakeWeight: number;
};

export type Dish = {
  template: string;
  months: Month[];
  vibe: WeatherVibe | 'any';
  weight: number;
  excludeFruits?: string[];
  onlyFruits?: string[];
};

export const ALL_MONTHS: Month[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const SEASONAL_NL: SeasonalVeg[] = [
  { key: 'leek', label: 'leek', months: [1, 2, 3, 10, 11, 12] },
  { key: 'kale', label: 'kale', months: [1, 2, 3, 11, 12] },
  { key: 'sprouts', label: 'sprouts', months: [1, 2, 3, 11, 12] },
  { key: 'cabbage', label: 'cabbage', months: [1, 2, 3, 10, 11, 12] },
  { key: 'carrot', label: 'carrot', months: [1, 2, 3, 4, 10, 11, 12] },
  { key: 'parsnip', label: 'parsnip', months: [1, 2, 3, 10, 11, 12] },
  { key: 'celeriac', label: 'celeriac', months: [1, 2, 3, 10, 11, 12] },
  { key: 'beet', label: 'beet', months: [1, 2, 3, 9, 10, 11, 12] },
  { key: 'onion', label: 'onion', months: ALL_MONTHS },
  { key: 'potato', label: 'potato', months: ALL_MONTHS },
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

export const SAFE_VEG_FALLBACK: SeasonalVeg[] = [
  { key: 'onion', label: 'onion', months: ALL_MONTHS },
  { key: 'carrot', label: 'carrot', months: [1, 2, 3, 4, 10, 11, 12] },
  { key: 'potato', label: 'potato', months: ALL_MONTHS },
];

export const SEASONAL_NL_FRUIT: SeasonalFruit[] = [
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

export const SAFE_FRUIT_FALLBACK: SeasonalFruit[] = [
  { key: 'apple', label: 'apple', months: [1, 2, 3, 4, 9, 10, 11, 12], bakeWeight: 1.0 },
  { key: 'pear', label: 'pear', months: [1, 2, 3, 9, 10, 11, 12], bakeWeight: 1.0 },
];

export function isBadWeatherForOutdoors(day: DaySnapshot): boolean {
  const veryWet = day.rainChance >= 80;
  const wet = day.rainChance >= 55;
  const gale = day.windbft >= 7;
  const windy = day.windbft >= 5;
  const cold = day.feelsLike <= 5;

  if (veryWet) return true;
  if (wet && (gale || cold)) return true;
  if (gale) return true;
  if (wet && windy) return true;
  return false;
}

export function getWeatherVibe(day: DaySnapshot): WeatherVibe {
  return isBadWeatherForOutdoors(day) ? 'indoor' : 'outdoor';
}

export const SAVORY_DISHES: Dish[] = [
  // === Specific seasonal dishes (example of how to add them) ===
  { template: 'Spinach pie', months: [3, 4, 5, 9, 10], vibe: 'any', weight: 0.5 },
  { template: 'Pumpkin soup', months: [9, 10, 11], vibe: 'indoor', weight: 0.5 },
  { template: 'Asparagus risotto', months: [4, 5, 6], vibe: 'any', weight: 0.5 },

  // === INDOOR / MEAL PREP ===
  { template: 'Meal prep: {veg}', months: ALL_MONTHS, vibe: 'indoor', weight: 1 },
  { template: 'Batch cook: {veg}', months: ALL_MONTHS, vibe: 'indoor', weight: 1 },
  { template: 'Prep & freeze: {veg}', months: ALL_MONTHS, vibe: 'indoor', weight: 1 },
  { template: 'Stock the fridge: {veg}', months: ALL_MONTHS, vibe: 'indoor', weight: 1 },
  { template: 'Sunday prep: {veg}', months: ALL_MONTHS, vibe: 'indoor', weight: 1 },

  // === OUTDOOR / FRESH COOK ===
  { template: 'Traybake: {veg}', months: ALL_MONTHS, vibe: 'outdoor', weight: 1 },
  { template: 'Quick pasta: {veg}', months: ALL_MONTHS, vibe: 'outdoor', weight: 1 },
  { template: 'Warm bowl: {veg}', months: ALL_MONTHS, vibe: 'outdoor', weight: 1 },
  { template: 'Big salad: {veg}', months: ALL_MONTHS, vibe: 'outdoor', weight: 1 },
  { template: 'Roast veggies: {veg}', months: ALL_MONTHS, vibe: 'outdoor', weight: 1 },
];

export const SWEET_DISHES: Dish[] = [
  // Both indoor and outdoor
  {
    template: 'Bake: {fruit} crumble',
    months: ALL_MONTHS,
    vibe: 'any',
    weight: 1,
    excludeFruits: ['grape'],
  },
  { template: 'Bake: {fruit} cake', months: ALL_MONTHS, vibe: 'any', weight: 1 },

  // Indoor specific
  {
    template: 'Bake: warm {fruit} crumble',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 0.7,
    excludeFruits: ['grape'],
  },
  { template: 'Bake: {fruit} loaf', months: ALL_MONTHS, vibe: 'indoor', weight: 0.7 }, // treating loaf as cake, grape allowed
  {
    template: 'Bake: {fruit} pie',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 1,
    excludeFruits: ['rhubarb', 'grape'],
  },
  {
    template: 'Bake: rustic {fruit} pie',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 0.7,
    excludeFruits: ['rhubarb', 'grape'],
  },
  {
    template: 'Bake: {fruit} galette',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 1,
    excludeFruits: ['grape'],
  },
  {
    template: 'Bake: rustic {fruit} galette',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 0.7,
    excludeFruits: ['grape'],
  },
  {
    template: 'Bake: {fruit} bars',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 1,
    excludeFruits: ['grape'],
  },
  {
    template: 'Bake: {fruit} oat bars',
    months: ALL_MONTHS,
    vibe: 'indoor',
    weight: 0.7,
    excludeFruits: ['grape'],
  },

  // Outdoor specific
  {
    template: 'Bake: {fruit} muffins',
    months: ALL_MONTHS,
    vibe: 'outdoor',
    weight: 1,
    excludeFruits: ['grape'],
  },
  {
    template: 'Bake: {fruit} muffins (batch)',
    months: ALL_MONTHS,
    vibe: 'outdoor',
    weight: 0.7,
    excludeFruits: ['grape'],
  },
  { template: 'Bake: {fruit} compote', months: ALL_MONTHS, vibe: 'outdoor', weight: 1 },
  { template: 'Bake: oven {fruit} compote', months: ALL_MONTHS, vibe: 'outdoor', weight: 0.7 },

  // Non-bake option (only outdoors, ~45% probability relative to bakes)
  { template: 'Sweet: {fruit}', months: ALL_MONTHS, vibe: 'outdoor', weight: 4.5 },
];
