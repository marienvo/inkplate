import type { DaySnapshot } from '../lib/weekend';

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type WeatherVibe = 'cozy' | 'hearty' | 'fresh' | 'lightWarm' | 'any';
export type CoreWeatherVibe = Exclude<WeatherVibe, 'any'>;

export type SeasonalVeg = {
  key: string;
  label: string;
  seasonalPriority: number;
  months: Month[];
};

export type SeasonalFruit = {
  key: string;
  label: string;
  months: Month[];
  bakeWeight: number;
};

export type Recipe = {
  title: string;
  ingredient: string;
  vibe: WeatherVibe;
  weight: number;
  months: Month[];
};

export const ALL_MONTHS: Month[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const COLD_MONTHS: Month[] = [1, 2, 3, 10, 11, 12];
export const COOL_MONTHS: Month[] = [1, 2, 3, 4, 9, 10, 11, 12];
export const WARM_MONTHS: Month[] = [4, 5, 6, 7, 8, 9];

// ---------------------------------------------------------------------------
// Seasonal produce
// ---------------------------------------------------------------------------

export const SEASONAL_NL: SeasonalVeg[] = [
  { key: 'cabbage', label: 'cabbage', seasonalPriority: 1.5, months: [1, 2, 3, 10, 11, 12] },
  { key: 'onion', label: 'onion', seasonalPriority: 0.5, months: ALL_MONTHS },
  { key: 'spinach', label: 'spinach', seasonalPriority: 0.6, months: ALL_MONTHS },
  { key: 'endive', label: 'endive', seasonalPriority: 1.2, months: [4, 5, 6, 9, 10] },
  { key: 'peas', label: 'peas', seasonalPriority: 0.6, months: ALL_MONTHS },
  { key: 'greenBeans', label: 'green beans', seasonalPriority: 1.2, months: [6, 7, 8, 9] },
  { key: 'zucchini', label: 'zucchini', seasonalPriority: 1.2, months: [6, 7, 8, 9] },
  { key: 'tomato', label: 'tomato', seasonalPriority: 1.5, months: [5, 6, 7, 8, 9, 10] },
  { key: 'pumpkin', label: 'pumpkin', seasonalPriority: 1.5, months: [9, 10, 11] },
];

export const SEASONAL_NL_FRUIT: SeasonalFruit[] = [
  { key: 'pantry', label: 'pantry', months: ALL_MONTHS, bakeWeight: 0.3 },
];

// ---------------------------------------------------------------------------
// Weather vibe
// ---------------------------------------------------------------------------

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
  const veryWet = day.rainChance >= 80;
  const wet = day.rainChance >= 55;
  const gale = day.windbft >= 7;
  const cold = day.feelsLike <= 5;

  // Cozy: truly miserable weather where slower, aromatic cooking fits best.
  if (veryWet) return 'cozy';
  if (wet && gale) return 'cozy';
  if (gale && cold) return 'cozy';
  if (wet && cold) return 'cozy';

  const dry = day.rainChance < 40;
  const mild = day.feelsLike >= 12;
  const hot = day.feelsLike >= 22;
  const calm = day.windbft <= 5;

  // LightWarm: hot, pleasant weather where low-friction cooking fits best.
  if (dry && hot && calm) return 'lightWarm';

  // Fresh: pleasantly dry and mild weather.
  if (dry && mild && calm) return 'fresh';

  // Hearty: everything in the broad middle ground.
  return 'hearty';
}

const VIBE_DISTANCE: Record<CoreWeatherVibe, number> = {
  cozy: 0,
  hearty: 1,
  fresh: 2,
  lightWarm: 3,
};

export function getVibeMultiplier(weatherVibe: CoreWeatherVibe, recipeVibe: WeatherVibe): number {
  if (recipeVibe === 'any') return 0.65;
  if (recipeVibe === weatherVibe) return 1.0;

  const distance = Math.abs(VIBE_DISTANCE[weatherVibe] - VIBE_DISTANCE[recipeVibe]);
  if (distance === 1) return 0.8;
  return 0;
}

// ---------------------------------------------------------------------------
// Savory recipes
//
// Every seasonal vegetable needs at least one recipe with vibe 'any' so
// there is always a match regardless of weather.
// ---------------------------------------------------------------------------

export const SAVORY_RECIPES: Recipe[] = [
  // Cabbage
  {
    title: 'Krautsalat',
    ingredient: 'cabbage',
    vibe: 'fresh',
    weight: 5,
    months: [1, 2, 3, 10, 11, 12],
  },
  {
    title: 'Pasta con Crema di Verza',
    ingredient: 'cabbage',
    vibe: 'any',
    weight: 5,
    months: [1, 2, 3, 10, 11, 12],
  },

  // Onion
  { title: 'Pasta e Ceci', ingredient: 'onion', vibe: 'hearty', weight: 5, months: COOL_MONTHS },
  {
    title: 'Sedanini Carbonara',
    ingredient: 'onion',
    vibe: 'any',
    weight: 3,
    months: ALL_MONTHS,
  },

  // Spinach
  { title: 'Almkäse Pasta', ingredient: 'spinach', vibe: 'hearty', weight: 5, months: COLD_MONTHS },
  {
    title: 'Linguine Spinaci e Ricotta',
    ingredient: 'spinach',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Radiatori Spinaci Gorgonzola',
    ingredient: 'spinach',
    vibe: 'any',
    weight: 5,
    months: COOL_MONTHS,
  },
  {
    title: 'Rigatoni al Pesto di Avocado',
    ingredient: 'spinach',
    vibe: 'any',
    weight: 5,
    months: WARM_MONTHS,
  },

  // Endive
  {
    title: 'Endive and Potato Mash',
    ingredient: 'endive',
    vibe: 'any',
    weight: 5,
    months: [4, 5, 6, 9, 10],
  },

  // Peas
  { title: 'Pasta e Piselli', ingredient: 'peas', vibe: 'any', weight: 5, months: ALL_MONTHS },

  // Green Beans
  {
    title: 'Green Bean Peanut Pasta',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 5,
    months: [6, 7, 8, 9],
  },
  {
    title: 'Trofie al Pesto',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 5,
    months: [6, 7, 8, 9],
  },

  // Zucchini
  {
    title: 'Radiatori da Philadelphia',
    ingredient: 'zucchini',
    vibe: 'any',
    weight: 5,
    months: [6, 7, 8, 9],
  },

  // Tomato
  {
    title: 'Paccheri al Pomodoro',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: [5, 6, 7, 8, 9, 10],
  },
  {
    title: 'Paccheri al Pomodoro e Fontina',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: [5, 6, 7, 8, 9, 10],
  },
  {
    title: 'Fusilli Pollo Vegano',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: [5, 6, 7, 8, 9, 10],
  },
  {
    title: "Penne all'Arrabbiata",
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: [5, 6, 7, 8, 9, 10],
  },
  {
    title: 'Piatto di Pollo Messicano',
    ingredient: 'tomato',
    vibe: 'hearty',
    weight: 5,
    months: [5, 6, 7, 8, 9, 10],
  },
  {
    title: 'Ragù di Lenticchie',
    ingredient: 'tomato',
    vibe: 'cozy',
    weight: 5,
    months: [9, 10],
  },

  // Pumpkin
  { title: 'Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'any', weight: 5, months: [9, 10, 11] },
];

// ---------------------------------------------------------------------------
// Extra recipes (sweet + non-meal)
//
// Every seasonal fruit needs at least one recipe with vibe 'any', plus optional
// pantry picks for condiments and prep items.
// ---------------------------------------------------------------------------

export const EXTRA_RECIPES: Recipe[] = [
  // Pantry
  { title: 'Caju Fresco', ingredient: 'pantry', vibe: 'lightWarm', weight: 5, months: WARM_MONTHS },
  { title: 'Cashew Parmigiano', ingredient: 'pantry', vibe: 'any', weight: 5, months: ALL_MONTHS },
  { title: 'Spice Blend', ingredient: 'pantry', vibe: 'any', weight: 5, months: ALL_MONTHS },
];
