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
  { title: 'Leek and Potato Mustard Pie', ingredient: 'leek', vibe: 'cozy', weight: 1 },
  {
    title: 'Braised Leeks with White Beans and Lemon',
    ingredient: 'leek',
    vibe: 'cozy',
    weight: 1,
  },
  { title: 'Creamy Leek Pasta with Nutritional Yeast', ingredient: 'leek', vibe: 'any', weight: 1 },

  // Kale
  { title: 'Kale and Cannellini Skillet', ingredient: 'kale', vibe: 'any', weight: 1 },
  { title: 'Kale Walnut Pesto Pasta', ingredient: 'kale', vibe: 'any', weight: 1 },
  { title: 'Crispy Roasted Kale with Potatoes', ingredient: 'kale', vibe: 'any', weight: 1 },

  // Sprouts
  {
    title: 'Roasted Sprouts with Potatoes and Lentils',
    ingredient: 'sprouts',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Sprouts and Chestnut Stir-Fry', ingredient: 'sprouts', vibe: 'hearty', weight: 1 },
  { title: 'Crispy Sprouts with Mustard Potatoes', ingredient: 'sprouts', vibe: 'any', weight: 1 },

  // Cabbage
  {
    title: 'Braised Cabbage with Apple, Beans, and Potato Mash',
    ingredient: 'cabbage',
    vibe: 'cozy',
    weight: 1,
  },
  { title: 'Cabbage and Potato Colcannon', ingredient: 'cabbage', vibe: 'hearty', weight: 1 },
  { title: 'Roasted Cabbage Steaks with Tahini', ingredient: 'cabbage', vibe: 'any', weight: 1 },
  { title: 'Warm Cabbage and Potato Skillet', ingredient: 'cabbage', vibe: 'fresh', weight: 5 },
  { title: 'Pasta con Crema di Verza', ingredient: 'cabbage', vibe: 'hearty', weight: 5 },

  // Pointed Cabbage
  {
    title: 'Stir-Fried Pointed Cabbage with Noodles and Tofu',
    ingredient: 'pointedCabbage',
    vibe: 'any',
    weight: 1,
  },
  {
    title: 'Pointed Cabbage and Noodle Bowl',
    ingredient: 'pointedCabbage',
    vibe: 'any',
    weight: 1,
  },

  // Carrot
  {
    title: 'Roasted Carrots with Couscous and Chickpeas',
    ingredient: 'carrot',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Carrot and Lentil Stew', ingredient: 'carrot', vibe: 'cozy', weight: 1 },
  { title: 'Carrot and Thyme Lentil Traybake', ingredient: 'carrot', vibe: 'any', weight: 1 },

  // Parsnip
  {
    title: 'Honey-Roasted Parsnips with Barley and Kale',
    ingredient: 'parsnip',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Parsnip and Apple Soup', ingredient: 'parsnip', vibe: 'cozy', weight: 1 },
  { title: 'Parsnip and Potato Mash Gratin', ingredient: 'parsnip', vibe: 'cozy', weight: 1 },

  // Celeriac
  { title: 'Celeriac and Potato Gratin', ingredient: 'celeriac', vibe: 'cozy', weight: 1 },
  {
    title: 'Roasted Celeriac with Lentils and Walnut Pesto',
    ingredient: 'celeriac',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Celeriac and Lentil Mustard Bowl', ingredient: 'celeriac', vibe: 'any', weight: 1 },

  // Beet
  { title: 'Roasted Beet and Lentil Grain Bowl', ingredient: 'beet', vibe: 'any', weight: 1 },
  { title: 'Beet and White Bean Stew', ingredient: 'beet', vibe: 'cozy', weight: 1 },
  { title: 'Beet and Walnut Flatbread with Chickpeas', ingredient: 'beet', vibe: 'any', weight: 1 },

  // Onion
  { title: 'French Onion Soup', ingredient: 'onion', vibe: 'cozy', weight: 1 },
  { title: 'Caramelized Onion Tart', ingredient: 'onion', vibe: 'any', weight: 1 },
  { title: 'Onion and Thyme Bean Stew', ingredient: 'onion', vibe: 'any', weight: 1 },
  { title: 'Pasta e Ceci', ingredient: 'onion', vibe: 'hearty', weight: 5 },
  { title: 'Sedanini Carbonara', ingredient: 'onion', vibe: 'hearty', weight: 3 },

  // Shallot
  {
    title: 'Caramelized Shallot and White Bean Tart',
    ingredient: 'shallot',
    vibe: 'any',
    weight: 1,
  },
  {
    title: 'Roasted Shallots with Orzo and White Beans',
    ingredient: 'shallot',
    vibe: 'any',
    weight: 1,
  },

  // Potato
  {
    title: 'Crispy Smashed Potatoes with Broccoli and Beans',
    ingredient: 'potato',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Potato and Leek Gratin', ingredient: 'potato', vibe: 'cozy', weight: 1 },
  { title: 'Spanish Tortilla with Potato and Onion', ingredient: 'potato', vibe: 'any', weight: 1 },
  { title: "Mezze Maniche alla Valle d'Aosta", ingredient: 'potato', vibe: 'hearty', weight: 3 },

  // Spinach
  { title: 'Lemon Spinach Pasta', ingredient: 'spinach', vibe: 'any', weight: 1 },
  { title: 'Spinach and White Bean Stew', ingredient: 'spinach', vibe: 'cozy', weight: 1 },
  { title: 'Savory Spinach Pie', ingredient: 'spinach', vibe: 'cozy', weight: 1 },
  { title: 'Almkase Pasta', ingredient: 'spinach', vibe: 'any', weight: 5 },
  { title: 'Linguine Spinaci e Ricotta', ingredient: 'spinach', vibe: 'any', weight: 5 },
  { title: 'Radiatori Spinaci Gorgonzola', ingredient: 'spinach', vibe: 'any', weight: 5 },
  { title: 'Rigatoni al Pesto di Avocado', ingredient: 'spinach', vibe: 'any', weight: 5 },

  // Endive
  {
    title: 'Braised Endive with Mustard and Cannellini Beans',
    ingredient: 'endive',
    vibe: 'hearty',
    weight: 1,
  },
  { title: 'Endive and Walnut Pasta', ingredient: 'endive', vibe: 'any', weight: 1 },
  { title: 'Gratin of Endive with Béchamel', ingredient: 'endive', vibe: 'cozy', weight: 1 },
  { title: 'Endive and Potato Mash', ingredient: 'endive', vibe: 'hearty', weight: 5 },

  // Chicory
  {
    title: 'Caramelized Chicory with Lentils and Orange',
    ingredient: 'chicory',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Chicory and Potato Gratin', ingredient: 'chicory', vibe: 'cozy', weight: 1 },
  {
    title: 'Braised Chicory with White Beans and Polenta',
    ingredient: 'chicory',
    vibe: 'hearty',
    weight: 1,
  },

  // Asparagus
  { title: 'Asparagus Risotto', ingredient: 'asparagus', vibe: 'any', weight: 1 },
  {
    title: 'Roasted Asparagus with Lemon Orzo and Peas',
    ingredient: 'asparagus',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Asparagus and Pea Pasta', ingredient: 'asparagus', vibe: 'any', weight: 1 },

  // Cauliflower
  {
    title: 'Whole Roasted Cauliflower with Tahini',
    ingredient: 'cauliflower',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Cauliflower and Potato Curry', ingredient: 'cauliflower', vibe: 'hearty', weight: 1 },
  { title: 'Cauliflower Cheese Bake', ingredient: 'cauliflower', vibe: 'cozy', weight: 1 },

  // Broccoli
  { title: 'Broccoli Lemon Garlic Pasta', ingredient: 'broccoli', vibe: 'any', weight: 1 },
  {
    title: 'Roasted Broccoli with Tahini Rice and Chickpeas',
    ingredient: 'broccoli',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Broccoli and Potato Soup', ingredient: 'broccoli', vibe: 'cozy', weight: 1 },

  // Peas
  { title: 'Pea and Mint Risotto', ingredient: 'peas', vibe: 'any', weight: 1 },
  { title: 'Pea and Potato Samosa Bake', ingredient: 'peas', vibe: 'hearty', weight: 1 },
  { title: 'Spring Pea Pasta with Lemon', ingredient: 'peas', vibe: 'any', weight: 1 },
  { title: 'Pasta Piselli Porri', ingredient: 'peas', vibe: 'any', weight: 5 },

  // Green Beans
  {
    title: 'Green Bean and Potato Mustard Skillet',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 1,
  },
  {
    title: 'Braised Green Beans with Tomato and Butter Beans',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Green Bean and Coconut Stir-Fry', ingredient: 'greenBeans', vibe: 'hearty', weight: 1 },
  { title: 'Green Bean Peanut Pasta', ingredient: 'greenBeans', vibe: 'any', weight: 5 },
  { title: 'Trofie al Pesto', ingredient: 'greenBeans', vibe: 'any', weight: 5 },

  // Zucchini
  { title: 'Zucchini and Ricotta Pasta', ingredient: 'zucchini', vibe: 'any', weight: 1 },
  { title: 'Stuffed Zucchini Boats', ingredient: 'zucchini', vibe: 'any', weight: 1 },
  { title: 'Zucchini and Chickpea Rice Bowl', ingredient: 'zucchini', vibe: 'any', weight: 1 },
  { title: 'Radiatori da Philadelphia', ingredient: 'zucchini', vibe: 'any', weight: 5 },

  // Tomato
  { title: 'Slow-Roasted Tomato Pasta', ingredient: 'tomato', vibe: 'any', weight: 1 },
  { title: 'Tomato and Lentil Stew', ingredient: 'tomato', vibe: 'cozy', weight: 1 },
  {
    title: 'Tomato and Zucchini Traybake with Chickpeas and Orzo',
    ingredient: 'tomato',
    vibe: 'fresh',
    weight: 1,
  },
  { title: 'Paccheri al Pomodoro', ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: 'Paccheri al Pomodoro e Fontina', ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: 'Fusilli Pollo Vegano', ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: "Penne all'Arrabbiata", ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: 'Piatto di Pollo Messicano', ingredient: 'tomato', vibe: 'hearty', weight: 5 },
  { title: 'Ragu di Lenticchie', ingredient: 'tomato', vibe: 'cozy', weight: 5 },

  // Bell Pepper
  { title: 'Stuffed Bell Peppers with Rice', ingredient: 'bellPepper', vibe: 'any', weight: 1 },
  { title: 'Roasted Bell Pepper Pasta', ingredient: 'bellPepper', vibe: 'any', weight: 1 },

  // Radish
  {
    title: 'Roasted Radishes with Herby Potatoes and Peas',
    ingredient: 'radish',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Radish and Cucumber Grain Bowl', ingredient: 'radish', vibe: 'fresh', weight: 1 },

  // Bok Choy
  { title: 'Bok Choy and Mushroom Stir-Fry', ingredient: 'bokChoy', vibe: 'any', weight: 1 },
  {
    title: 'Braised Bok Choy with Ginger Rice and Tofu',
    ingredient: 'bokChoy',
    vibe: 'hearty',
    weight: 1,
  },

  // Cucumber
  { title: 'Chilled Cucumber and Dill Soup', ingredient: 'cucumber', vibe: 'fresh', weight: 1 },
  { title: 'Cucumber and Chickpea Bowl', ingredient: 'cucumber', vibe: 'any', weight: 1 },
  { title: 'Smashed Cucumber Sesame Noodle Bowl', ingredient: 'cucumber', vibe: 'any', weight: 1 },

  // Eggplant
  { title: 'Roasted Eggplant with Miso Glaze', ingredient: 'eggplant', vibe: 'any', weight: 1 },
  { title: 'Eggplant and Chickpea Stew', ingredient: 'eggplant', vibe: 'cozy', weight: 1 },
  { title: 'Stuffed Eggplant with Couscous', ingredient: 'eggplant', vibe: 'any', weight: 1 },

  // Pumpkin
  {
    title: 'Roasted Pumpkin with Sage and Lentil Orzo',
    ingredient: 'pumpkin',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Pumpkin and White Bean Stew', ingredient: 'pumpkin', vibe: 'cozy', weight: 1 },
  { title: 'Creamy Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'hearty', weight: 1 },
  { title: 'Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'hearty', weight: 5 },
];

// ---------------------------------------------------------------------------
// Extra recipes (sweet + non-meal)
//
// Every seasonal fruit needs at least one recipe with vibe 'any', plus optional
// pantry picks for condiments and prep items.
// ---------------------------------------------------------------------------

export const EXTRA_RECIPES: Recipe[] = [
  // Apple
  { title: 'Apple Crumble', ingredient: 'apple', vibe: 'cozy', weight: 1 },
  { title: 'Simple Apple Cake', ingredient: 'apple', vibe: 'any', weight: 1 },
  { title: 'Baked Apples with Oats', ingredient: 'apple', vibe: 'cozy', weight: 1 },

  // Pear
  { title: 'Pear Almond Cake', ingredient: 'pear', vibe: 'any', weight: 1 },
  { title: 'Poached Pears', ingredient: 'pear', vibe: 'cozy', weight: 1 },
  { title: 'Pear Crumble', ingredient: 'pear', vibe: 'cozy', weight: 1 },

  // Rhubarb
  { title: 'Rhubarb Crumble', ingredient: 'rhubarb', vibe: 'cozy', weight: 1 },
  { title: 'Rhubarb and Custard Cake', ingredient: 'rhubarb', vibe: 'any', weight: 1 },
  { title: 'Rhubarb Compote with Yogurt', ingredient: 'rhubarb', vibe: 'any', weight: 1 },

  // Strawberry
  { title: 'Strawberry Galette', ingredient: 'strawberry', vibe: 'any', weight: 1 },
  { title: 'Strawberry Oat Bars', ingredient: 'strawberry', vibe: 'any', weight: 1 },
  { title: 'Strawberry Fool', ingredient: 'strawberry', vibe: 'fresh', weight: 1 },

  // Cherry
  { title: 'Cherry Clafoutis', ingredient: 'cherry', vibe: 'any', weight: 1 },
  { title: 'Cherry Almond Cake', ingredient: 'cherry', vibe: 'any', weight: 1 },
  { title: 'Cherry Compote with Vanilla', ingredient: 'cherry', vibe: 'cozy', weight: 1 },

  // Plum
  { title: 'Plum Crumble', ingredient: 'plum', vibe: 'cozy', weight: 1 },
  { title: 'Plum and Almond Tart', ingredient: 'plum', vibe: 'any', weight: 1 },
  { title: 'Roasted Plums with Cinnamon', ingredient: 'plum', vibe: 'any', weight: 1 },

  // Blueberry
  { title: 'Blueberry Muffins', ingredient: 'blueberry', vibe: 'any', weight: 1 },
  { title: 'Blueberry Lemon Cake', ingredient: 'blueberry', vibe: 'any', weight: 1 },
  { title: 'Blueberry Oat Crumble', ingredient: 'blueberry', vibe: 'cozy', weight: 1 },

  // Blackberry
  { title: 'Blackberry and Apple Crumble', ingredient: 'blackberry', vibe: 'cozy', weight: 1 },
  { title: 'Blackberry Fool', ingredient: 'blackberry', vibe: 'any', weight: 1 },
  { title: 'Blackberry Oat Bars', ingredient: 'blackberry', vibe: 'any', weight: 1 },

  // Grape
  { title: 'Grape Focaccia', ingredient: 'grape', vibe: 'any', weight: 1 },
  { title: 'Roasted Grapes with Walnut Cake', ingredient: 'grape', vibe: 'any', weight: 1 },
  { title: 'Grape and Almond Tart', ingredient: 'grape', vibe: 'cozy', weight: 1 },

  // Pantry
  { title: 'Caju Fresco', ingredient: 'pantry', vibe: 'fresh', weight: 5 },
  { title: 'Cashew Parmigiano', ingredient: 'pantry', vibe: 'any', weight: 5 },
  { title: 'Spice Blend', ingredient: 'pantry', vibe: 'any', weight: 5 },
];
