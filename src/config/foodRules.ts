import type { DaySnapshot } from '../lib/weekend';

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type WeatherVibe = 'cozy' | 'hearty' | 'fresh' | 'any';

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

export type Recipe = {
  title: string;
  ingredient: string;
  vibe: WeatherVibe;
  weight: number;
  months: Month[];
};

export const ALL_MONTHS: Month[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ---------------------------------------------------------------------------
// Seasonal produce
// ---------------------------------------------------------------------------

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
  { key: 'spinach', label: 'spinach', months: ALL_MONTHS },
  { key: 'endive', label: 'endive', months: [4, 5, 6, 9, 10] },
  { key: 'chicory', label: 'chicory', months: [1, 2, 3, 10, 11, 12] },
  { key: 'asparagus', label: 'asparagus', months: [4, 5, 6] },
  { key: 'cauliflower', label: 'cauliflower', months: [4, 5, 6, 7, 8, 9, 10] },
  { key: 'broccoli', label: 'broccoli', months: ALL_MONTHS },
  { key: 'peas', label: 'peas', months: ALL_MONTHS },
  { key: 'greenBeans', label: 'green beans', months: [6, 7, 8, 9] },
  { key: 'zucchini', label: 'zucchini', months: [6, 7, 8, 9] },
  { key: 'tomato', label: 'tomato', months: [5, 6, 7, 8, 9, 10] },
  { key: 'cucumber', label: 'cucumber', months: [7, 8, 9] },
  { key: 'eggplant', label: 'eggplant', months: [7, 8, 9] },
  { key: 'pumpkin', label: 'pumpkin', months: [9, 10, 11] },
  { key: 'pointedCabbage', label: 'pointed cabbage', months: ALL_MONTHS },
  { key: 'shallot', label: 'shallot', months: ALL_MONTHS },
  { key: 'bellPepper', label: 'bell pepper', months: ALL_MONTHS },
  { key: 'radish', label: 'radish', months: ALL_MONTHS },
  { key: 'bokChoy', label: 'bok choy', months: ALL_MONTHS },
];

export const SEASONAL_NL_FRUIT: SeasonalFruit[] = [
  { key: 'apple', label: 'apple', months: [9, 10, 11, 12, 1, 2, 3, 4], bakeWeight: 1.0 },
  { key: 'pear', label: 'pear', months: [9, 10, 11, 12, 1, 2, 3], bakeWeight: 1.0 },
  { key: 'rhubarb', label: 'rhubarb', months: [4, 5, 6], bakeWeight: 1.0 },
  { key: 'strawberry', label: 'strawberry', months: [5, 6, 7], bakeWeight: 2 },
  { key: 'cherry', label: 'cherry', months: [6, 7], bakeWeight: 0.8 },
  { key: 'plum', label: 'plum', months: [7, 8, 9], bakeWeight: 1.0 },
  { key: 'blueberry', label: 'blueberry', months: [7, 8], bakeWeight: 0.85 },
  { key: 'blackberry', label: 'blackberry', months: [8, 9], bakeWeight: 0.85 },
  { key: 'grape', label: 'grape', months: [9, 10], bakeWeight: 0.55 },
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

  const dry = day.rainChance < 30;
  const mild = day.feelsLike > 14;
  const calm = day.windbft <= 4;

  // Fresh: genuinely pleasant outdoor weather.
  if (dry && mild && calm) return 'fresh';

  // Hearty: everything in the broad middle ground.
  return 'hearty';
}

// ---------------------------------------------------------------------------
// Savory recipes
//
// Every seasonal vegetable needs at least one recipe with vibe 'any' so
// there is always a match regardless of weather.
// ---------------------------------------------------------------------------

export const SAVORY_RECIPES: Recipe[] = [
  // Leek
  {
    title: 'Leek and Potato Mustard Pie',
    ingredient: 'leek',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Braised Leeks with White Beans and Lemon',
    ingredient: 'leek',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Creamy Leek Pasta with Nutritional Yeast',
    ingredient: 'leek',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Kale
  {
    title: 'Kale and Cannellini Skillet',
    ingredient: 'kale',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Kale Walnut Pesto Pasta',
    ingredient: 'kale',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Crispy Roasted Kale with Potatoes',
    ingredient: 'kale',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Sprouts
  {
    title: 'Roasted Sprouts with Potatoes and Lentils',
    ingredient: 'sprouts',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Sprouts and Chestnut Stir-Fry',
    ingredient: 'sprouts',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Crispy Sprouts with Mustard Potatoes',
    ingredient: 'sprouts',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Cabbage
  {
    title: 'Braised Cabbage with Apple, Beans, and Potato Mash',
    ingredient: 'cabbage',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Cabbage and Potato Colcannon',
    ingredient: 'cabbage',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Roasted Cabbage Steaks with Tahini',
    ingredient: 'cabbage',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Warm Cabbage and Potato Skillet',
    ingredient: 'cabbage',
    vibe: 'fresh',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Pasta con Crema di Verza',
    ingredient: 'cabbage',
    vibe: 'hearty',
    weight: 5,
    months: ALL_MONTHS,
  },

  // Pointed Cabbage
  {
    title: 'Stir-Fried Pointed Cabbage with Noodles and Tofu',
    ingredient: 'pointedCabbage',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Pointed Cabbage and Noodle Bowl',
    ingredient: 'pointedCabbage',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Carrot
  {
    title: 'Roasted Carrots with Couscous and Chickpeas',
    ingredient: 'carrot',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Carrot and Lentil Stew',
    ingredient: 'carrot',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Carrot and Thyme Lentil Traybake',
    ingredient: 'carrot',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Parsnip
  {
    title: 'Honey-Roasted Parsnips with Barley and Kale',
    ingredient: 'parsnip',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Parsnip and Apple Soup',
    ingredient: 'parsnip',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Parsnip and Potato Mash Gratin',
    ingredient: 'parsnip',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Celeriac
  {
    title: 'Celeriac and Potato Gratin',
    ingredient: 'celeriac',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Roasted Celeriac with Lentils and Walnut Pesto',
    ingredient: 'celeriac',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Celeriac and Lentil Mustard Bowl',
    ingredient: 'celeriac',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Beet
  {
    title: 'Roasted Beet and Lentil Grain Bowl',
    ingredient: 'beet',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Beet and White Bean Stew',
    ingredient: 'beet',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Beet and Walnut Flatbread with Chickpeas',
    ingredient: 'beet',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Onion
  { title: 'French Onion Soup', ingredient: 'onion', vibe: 'cozy', weight: 1, months: ALL_MONTHS },
  {
    title: 'Caramelized Onion Tart',
    ingredient: 'onion',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Onion and Thyme Bean Stew',
    ingredient: 'onion',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  { title: 'Pasta e Ceci', ingredient: 'onion', vibe: 'hearty', weight: 5, months: ALL_MONTHS },
  {
    title: 'Sedanini Carbonara',
    ingredient: 'onion',
    vibe: 'hearty',
    weight: 3,
    months: ALL_MONTHS,
  },

  // Shallot
  {
    title: 'Caramelized Shallot and White Bean Tart',
    ingredient: 'shallot',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Roasted Shallots with Orzo and White Beans',
    ingredient: 'shallot',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Potato
  {
    title: 'Crispy Smashed Potatoes with Broccoli and Beans',
    ingredient: 'potato',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Potato and Leek Gratin',
    ingredient: 'potato',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Spanish Tortilla with Potato and Onion',
    ingredient: 'potato',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: "Mezze Maniche alla Valle d'Aosta",
    ingredient: 'potato',
    vibe: 'hearty',
    weight: 3,
    months: ALL_MONTHS,
  },

  // Spinach
  {
    title: 'Lemon Spinach Pasta',
    ingredient: 'spinach',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Spinach and White Bean Stew',
    ingredient: 'spinach',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Savory Spinach Pie',
    ingredient: 'spinach',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  { title: 'Almkase Pasta', ingredient: 'spinach', vibe: 'any', weight: 5, months: ALL_MONTHS },
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
    months: ALL_MONTHS,
  },
  {
    title: 'Rigatoni al Pesto di Avocado',
    ingredient: 'spinach',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },

  // Endive
  {
    title: 'Braised Endive with Mustard and Cannellini Beans',
    ingredient: 'endive',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Endive and Walnut Pasta',
    ingredient: 'endive',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Gratin of Endive with Béchamel',
    ingredient: 'endive',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Endive and Potato Mash',
    ingredient: 'endive',
    vibe: 'hearty',
    weight: 5,
    months: ALL_MONTHS,
  },

  // Chicory
  {
    title: 'Caramelized Chicory with Lentils and Orange',
    ingredient: 'chicory',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Chicory and Potato Gratin',
    ingredient: 'chicory',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Braised Chicory with White Beans and Polenta',
    ingredient: 'chicory',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Asparagus
  {
    title: 'Asparagus Risotto',
    ingredient: 'asparagus',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Roasted Asparagus with Lemon Orzo and Peas',
    ingredient: 'asparagus',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Asparagus and Pea Pasta',
    ingredient: 'asparagus',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Cauliflower
  {
    title: 'Whole Roasted Cauliflower with Tahini',
    ingredient: 'cauliflower',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Cauliflower and Potato Curry',
    ingredient: 'cauliflower',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Cauliflower Cheese Bake',
    ingredient: 'cauliflower',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Broccoli
  {
    title: 'Broccoli Lemon Garlic Pasta',
    ingredient: 'broccoli',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Roasted Broccoli with Tahini Rice and Chickpeas',
    ingredient: 'broccoli',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Broccoli and Potato Soup',
    ingredient: 'broccoli',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Peas
  { title: 'Pea and Mint Risotto', ingredient: 'peas', vibe: 'any', weight: 1, months: ALL_MONTHS },
  {
    title: 'Pea and Potato Samosa Bake',
    ingredient: 'peas',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Spring Pea Pasta with Lemon',
    ingredient: 'peas',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  { title: 'Pasta Piselli Porri', ingredient: 'peas', vibe: 'any', weight: 5, months: ALL_MONTHS },

  // Green Beans
  {
    title: 'Green Bean and Potato Mustard Skillet',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Braised Green Beans with Tomato and Butter Beans',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Green Bean and Coconut Stir-Fry',
    ingredient: 'greenBeans',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Green Bean Peanut Pasta',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Trofie al Pesto',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },

  // Zucchini
  {
    title: 'Zucchini and Ricotta Pasta',
    ingredient: 'zucchini',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Stuffed Zucchini Boats',
    ingredient: 'zucchini',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Zucchini and Chickpea Rice Bowl',
    ingredient: 'zucchini',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Radiatori da Philadelphia',
    ingredient: 'zucchini',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },

  // Tomato
  {
    title: 'Slow-Roasted Tomato Pasta',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Tomato and Lentil Stew',
    ingredient: 'tomato',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Tomato and Zucchini Traybake with Chickpeas and Orzo',
    ingredient: 'tomato',
    vibe: 'fresh',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Paccheri al Pomodoro',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Paccheri al Pomodoro e Fontina',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Fusilli Pollo Vegano',
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: "Penne all'Arrabbiata",
    ingredient: 'tomato',
    vibe: 'any',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Piatto di Pollo Messicano',
    ingredient: 'tomato',
    vibe: 'hearty',
    weight: 5,
    months: ALL_MONTHS,
  },
  {
    title: 'Ragu di Lenticchie',
    ingredient: 'tomato',
    vibe: 'cozy',
    weight: 5,
    months: ALL_MONTHS,
  },

  // Bell Pepper
  {
    title: 'Stuffed Bell Peppers with Rice',
    ingredient: 'bellPepper',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Roasted Bell Pepper Pasta',
    ingredient: 'bellPepper',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Radish
  {
    title: 'Roasted Radishes with Herby Potatoes and Peas',
    ingredient: 'radish',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Radish and Cucumber Grain Bowl',
    ingredient: 'radish',
    vibe: 'fresh',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Bok Choy
  {
    title: 'Bok Choy and Mushroom Stir-Fry',
    ingredient: 'bokChoy',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Braised Bok Choy with Ginger Rice and Tofu',
    ingredient: 'bokChoy',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Cucumber
  {
    title: 'Chilled Cucumber and Dill Soup',
    ingredient: 'cucumber',
    vibe: 'fresh',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Cucumber and Chickpea Bowl',
    ingredient: 'cucumber',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Smashed Cucumber Sesame Noodle Bowl',
    ingredient: 'cucumber',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Eggplant
  {
    title: 'Roasted Eggplant with Miso Glaze',
    ingredient: 'eggplant',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Eggplant and Chickpea Stew',
    ingredient: 'eggplant',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Stuffed Eggplant with Couscous',
    ingredient: 'eggplant',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Pumpkin
  {
    title: 'Roasted Pumpkin with Sage and Lentil Orzo',
    ingredient: 'pumpkin',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Pumpkin and White Bean Stew',
    ingredient: 'pumpkin',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Creamy Pumpkin Pasta',
    ingredient: 'pumpkin',
    vibe: 'hearty',
    weight: 1,
    months: ALL_MONTHS,
  },
  { title: 'Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'hearty', weight: 5, months: ALL_MONTHS },
];

// ---------------------------------------------------------------------------
// Extra recipes (sweet + non-meal)
//
// Every seasonal fruit needs at least one recipe with vibe 'any', plus optional
// pantry picks for condiments and prep items.
// ---------------------------------------------------------------------------

export const EXTRA_RECIPES: Recipe[] = [
  // Apple
  { title: 'Apple Crumble', ingredient: 'apple', vibe: 'cozy', weight: 1, months: ALL_MONTHS },
  { title: 'Simple Apple Cake', ingredient: 'apple', vibe: 'any', weight: 1, months: ALL_MONTHS },
  {
    title: 'Baked Apples with Oats',
    ingredient: 'apple',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Pear
  { title: 'Pear Almond Cake', ingredient: 'pear', vibe: 'any', weight: 1, months: ALL_MONTHS },
  { title: 'Poached Pears', ingredient: 'pear', vibe: 'cozy', weight: 1, months: ALL_MONTHS },
  { title: 'Pear Crumble', ingredient: 'pear', vibe: 'cozy', weight: 1, months: ALL_MONTHS },

  // Rhubarb
  { title: 'Rhubarb Crumble', ingredient: 'rhubarb', vibe: 'cozy', weight: 1, months: ALL_MONTHS },
  {
    title: 'Rhubarb and Custard Cake',
    ingredient: 'rhubarb',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Rhubarb Compote with Yogurt',
    ingredient: 'rhubarb',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Strawberry
  {
    title: 'Strawberry Galette',
    ingredient: 'strawberry',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Strawberry Oat Bars',
    ingredient: 'strawberry',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Strawberry Fool',
    ingredient: 'strawberry',
    vibe: 'fresh',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Cherry
  { title: 'Cherry Clafoutis', ingredient: 'cherry', vibe: 'any', weight: 1, months: ALL_MONTHS },
  { title: 'Cherry Almond Cake', ingredient: 'cherry', vibe: 'any', weight: 1, months: ALL_MONTHS },
  {
    title: 'Cherry Compote with Vanilla',
    ingredient: 'cherry',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Plum
  { title: 'Plum Crumble', ingredient: 'plum', vibe: 'cozy', weight: 1, months: ALL_MONTHS },
  { title: 'Plum and Almond Tart', ingredient: 'plum', vibe: 'any', weight: 1, months: ALL_MONTHS },
  {
    title: 'Roasted Plums with Cinnamon',
    ingredient: 'plum',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Blueberry
  {
    title: 'Blueberry Muffins',
    ingredient: 'blueberry',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Blueberry Lemon Cake',
    ingredient: 'blueberry',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Blueberry Oat Crumble',
    ingredient: 'blueberry',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Blackberry
  {
    title: 'Blackberry and Apple Crumble',
    ingredient: 'blackberry',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Blackberry Fool',
    ingredient: 'blackberry',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Blackberry Oat Bars',
    ingredient: 'blackberry',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Grape
  { title: 'Grape Focaccia', ingredient: 'grape', vibe: 'any', weight: 1, months: ALL_MONTHS },
  {
    title: 'Roasted Grapes with Walnut Cake',
    ingredient: 'grape',
    vibe: 'any',
    weight: 1,
    months: ALL_MONTHS,
  },
  {
    title: 'Grape and Almond Tart',
    ingredient: 'grape',
    vibe: 'cozy',
    weight: 1,
    months: ALL_MONTHS,
  },

  // Pantry
  { title: 'Caju Fresco', ingredient: 'pantry', vibe: 'fresh', weight: 5, months: ALL_MONTHS },
  { title: 'Cashew Parmigiano', ingredient: 'pantry', vibe: 'any', weight: 5, months: ALL_MONTHS },
  { title: 'Spice Blend', ingredient: 'pantry', vibe: 'any', weight: 5, months: ALL_MONTHS },
];
