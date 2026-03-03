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

export type Recipe = {
  title: string;
  ingredient: string;
  vibe: WeatherVibe;
  weight: number;
};

export const GENERIC_FALLBACK_WEIGHT = 2;

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

// ---------------------------------------------------------------------------
// Ingredient-based recipes
// When the engine picks a seasonal ingredient, it checks this list for a
// matching recipe. If one is found, it competes (by weight) with the generic
// template pool above. Recipes inherit their season from the ingredient.
// ---------------------------------------------------------------------------

export const SAVORY_RECIPES: Recipe[] = [
  // Leek
  { title: 'Leek and Potato Mustard Pie', ingredient: 'leek', vibe: 'indoor', weight: 1 },
  {
    title: 'Braised Leeks with White Beans and Lemon',
    ingredient: 'leek',
    vibe: 'indoor',
    weight: 1,
  },
  { title: 'Creamy Leek Pasta with Nutritional Yeast', ingredient: 'leek', vibe: 'any', weight: 1 },

  // Kale
  { title: 'Kale and Cannellini Skillet', ingredient: 'kale', vibe: 'any', weight: 1 },
  { title: 'Kale Walnut Pesto Pasta', ingredient: 'kale', vibe: 'any', weight: 1 },
  { title: 'Crispy Roasted Kale with Potatoes', ingredient: 'kale', vibe: 'any', weight: 1 },

  // Carrot
  {
    title: 'Roasted Carrots with Tahini Lemon Sauce',
    ingredient: 'carrot',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Carrot and Lentil Stew', ingredient: 'carrot', vibe: 'indoor', weight: 1 },
  { title: 'Carrot and Thyme Traybake', ingredient: 'carrot', vibe: 'any', weight: 1 },

  // Potato
  { title: 'Crispy Smashed Potatoes', ingredient: 'potato', vibe: 'any', weight: 1 },
  { title: 'Potato and Leek Gratin', ingredient: 'potato', vibe: 'indoor', weight: 1 },
  { title: 'Spanish Tortilla with Potato and Onion', ingredient: 'potato', vibe: 'any', weight: 1 },

  // Spinach
  { title: 'Lemon Spinach Pasta', ingredient: 'spinach', vibe: 'any', weight: 1 },
  { title: 'Spinach and White Bean Stew', ingredient: 'spinach', vibe: 'indoor', weight: 1 },
  { title: 'Savory Spinach Pie', ingredient: 'spinach', vibe: 'indoor', weight: 1 },

  // Broccoli
  { title: 'Broccoli Lemon Garlic Pasta', ingredient: 'broccoli', vibe: 'any', weight: 1 },
  { title: 'Roasted Broccoli with Tahini', ingredient: 'broccoli', vibe: 'any', weight: 1 },
  { title: 'Broccoli and Potato Soup', ingredient: 'broccoli', vibe: 'indoor', weight: 1 },

  // Tomato
  { title: 'Slow-Roasted Tomato Pasta', ingredient: 'tomato', vibe: 'any', weight: 1 },
  { title: 'Tomato and Lentil Stew', ingredient: 'tomato', vibe: 'indoor', weight: 1 },
  { title: 'Tomato and Zucchini Traybake', ingredient: 'tomato', vibe: 'outdoor', weight: 1 },

  // Pumpkin
  { title: 'Roasted Pumpkin with Sage', ingredient: 'pumpkin', vibe: 'any', weight: 1 },
  { title: 'Pumpkin and White Bean Stew', ingredient: 'pumpkin', vibe: 'indoor', weight: 1 },
  { title: 'Creamy Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'indoor', weight: 1 },

  // Asparagus
  { title: 'Asparagus Risotto', ingredient: 'asparagus', vibe: 'any', weight: 1 },
];

export const SWEET_RECIPES: Recipe[] = [
  // Apple
  { title: 'Apple Crumble', ingredient: 'apple', vibe: 'indoor', weight: 1 },
  { title: 'Simple Apple Cake', ingredient: 'apple', vibe: 'any', weight: 1 },
  { title: 'Baked Apples with Oats', ingredient: 'apple', vibe: 'indoor', weight: 1 },

  // Pear
  { title: 'Pear Almond Cake', ingredient: 'pear', vibe: 'any', weight: 1 },
  { title: 'Poached Pears', ingredient: 'pear', vibe: 'indoor', weight: 1 },
  { title: 'Pear Crumble', ingredient: 'pear', vibe: 'indoor', weight: 1 },
];
