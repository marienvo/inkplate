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

  // todo: new, no recipes yet
  { key: 'pointedCabbage', label: 'pointed cabbage', months: ALL_MONTHS },
  { key: 'shallot', label: 'shallot', months: ALL_MONTHS },
  { key: 'springOnion', label: 'spring onion', months: ALL_MONTHS },
  { key: 'bellPepper', label: 'bell pepper', months: ALL_MONTHS },
  { key: 'lettuce', label: 'lettuce', months: ALL_MONTHS },
  { key: 'radish', label: 'radish', months: ALL_MONTHS },
  { key: 'bokChoy', label: 'bok choy', months: ALL_MONTHS },
  { key: 'cherryTomato', label: 'cherry tomato', months: ALL_MONTHS },
  { key: 'romaine', label: 'romaine lettuce', months: ALL_MONTHS },
  { key: 'icebergLettuce', label: 'iceberg lettuce', months: ALL_MONTHS },
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
  return isBadWeatherForOutdoors(day) ? 'indoor' : 'outdoor';
}

// ---------------------------------------------------------------------------
// Savory recipes
//
// Every seasonal vegetable needs at least one recipe with vibe 'any' so
// there is always a match regardless of weather.
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

  // Sprouts
  { title: 'Roasted Sprouts with Balsamic Glaze', ingredient: 'sprouts', vibe: 'any', weight: 1 },
  { title: 'Sprouts and Chestnut Stir-Fry', ingredient: 'sprouts', vibe: 'indoor', weight: 1 },
  { title: 'Crispy Sprouts with Mustard Dressing', ingredient: 'sprouts', vibe: 'any', weight: 1 },

  // Cabbage
  {
    title: 'Braised Cabbage with Apple and Caraway',
    ingredient: 'cabbage',
    vibe: 'indoor',
    weight: 1,
  },
  { title: 'Cabbage and Potato Colcannon', ingredient: 'cabbage', vibe: 'indoor', weight: 1 },
  { title: 'Roasted Cabbage Steaks with Tahini', ingredient: 'cabbage', vibe: 'any', weight: 1 },
  { title: 'Krautsalat', ingredient: 'cabbage', vibe: 'outdoor', weight: 5 },
  { title: 'Pasta con Crema di Verza', ingredient: 'cabbage', vibe: 'indoor', weight: 5 },

  // Carrot
  {
    title: 'Roasted Carrots with Tahini Lemon Sauce',
    ingredient: 'carrot',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Carrot and Lentil Stew', ingredient: 'carrot', vibe: 'indoor', weight: 1 },
  { title: 'Carrot and Thyme Traybake', ingredient: 'carrot', vibe: 'any', weight: 1 },

  // Parsnip
  { title: 'Honey-Roasted Parsnips with Thyme', ingredient: 'parsnip', vibe: 'any', weight: 1 },
  { title: 'Parsnip and Apple Soup', ingredient: 'parsnip', vibe: 'indoor', weight: 1 },
  { title: 'Parsnip and Potato Mash Gratin', ingredient: 'parsnip', vibe: 'indoor', weight: 1 },

  // Celeriac
  { title: 'Celeriac and Potato Gratin', ingredient: 'celeriac', vibe: 'indoor', weight: 1 },
  { title: 'Roasted Celeriac with Walnut Pesto', ingredient: 'celeriac', vibe: 'any', weight: 1 },
  { title: 'Celeriac Remoulade with Mustard', ingredient: 'celeriac', vibe: 'any', weight: 1 },

  // Beet
  { title: 'Roasted Beet and Lentil Salad', ingredient: 'beet', vibe: 'any', weight: 1 },
  { title: 'Beet and White Bean Stew', ingredient: 'beet', vibe: 'indoor', weight: 1 },
  { title: 'Beet and Walnut Dip with Flatbread', ingredient: 'beet', vibe: 'any', weight: 1 },

  // Onion
  { title: 'French Onion Soup', ingredient: 'onion', vibe: 'indoor', weight: 1 },
  { title: 'Caramelized Onion Tart', ingredient: 'onion', vibe: 'any', weight: 1 },
  { title: 'Onion and Thyme Focaccia', ingredient: 'onion', vibe: 'any', weight: 1 },
  { title: 'Pasta e Ceci', ingredient: 'onion', vibe: 'indoor', weight: 5 },
  { title: 'Sedanini Carbonara', ingredient: 'onion', vibe: 'indoor', weight: 3 },

  // Potato
  { title: 'Crispy Smashed Potatoes', ingredient: 'potato', vibe: 'any', weight: 1 },
  { title: 'Potato and Leek Gratin', ingredient: 'potato', vibe: 'indoor', weight: 1 },
  { title: 'Spanish Tortilla with Potato and Onion', ingredient: 'potato', vibe: 'any', weight: 1 },
  { title: "Mezze Maniche alla Valle d'Aosta", ingredient: 'potato', vibe: 'indoor', weight: 3 },

  // Spinach
  { title: 'Lemon Spinach Pasta', ingredient: 'spinach', vibe: 'any', weight: 1 },
  { title: 'Spinach and White Bean Stew', ingredient: 'spinach', vibe: 'indoor', weight: 1 },
  { title: 'Savory Spinach Pie', ingredient: 'spinach', vibe: 'indoor', weight: 1 },
  { title: 'Almkase Pasta', ingredient: 'spinach', vibe: 'any', weight: 5 },
  { title: 'Linguine Spinaci e Ricotta', ingredient: 'spinach', vibe: 'any', weight: 5 },
  { title: 'Radiatori Spinaci Gorgonzola', ingredient: 'spinach', vibe: 'any', weight: 5 },
  { title: 'Rigatoni al Pesto di Avocado', ingredient: 'spinach', vibe: 'any', weight: 5 },

  // Endive
  { title: 'Braised Endive with Mustard Sauce', ingredient: 'endive', vibe: 'indoor', weight: 1 },
  { title: 'Endive and Walnut Salad', ingredient: 'endive', vibe: 'any', weight: 1 },
  { title: 'Gratin of Endive with Béchamel', ingredient: 'endive', vibe: 'indoor', weight: 1 },
  { title: 'Endive and Potato Mash', ingredient: 'endive', vibe: 'indoor', weight: 5 },

  // Chicory
  { title: 'Caramelized Chicory with Orange', ingredient: 'chicory', vibe: 'any', weight: 1 },
  { title: 'Chicory and Potato Gratin', ingredient: 'chicory', vibe: 'indoor', weight: 1 },
  { title: 'Braised Chicory with White Wine', ingredient: 'chicory', vibe: 'indoor', weight: 1 },

  // Asparagus
  { title: 'Asparagus Risotto', ingredient: 'asparagus', vibe: 'any', weight: 1 },
  { title: 'Roasted Asparagus with Lemon Zest', ingredient: 'asparagus', vibe: 'any', weight: 1 },
  { title: 'Asparagus and Pea Pasta', ingredient: 'asparagus', vibe: 'any', weight: 1 },

  // Cauliflower
  {
    title: 'Whole Roasted Cauliflower with Tahini',
    ingredient: 'cauliflower',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Cauliflower and Potato Curry', ingredient: 'cauliflower', vibe: 'indoor', weight: 1 },
  { title: 'Cauliflower Cheese Bake', ingredient: 'cauliflower', vibe: 'indoor', weight: 1 },

  // Broccoli
  { title: 'Broccoli Lemon Garlic Pasta', ingredient: 'broccoli', vibe: 'any', weight: 1 },
  { title: 'Roasted Broccoli with Tahini', ingredient: 'broccoli', vibe: 'any', weight: 1 },
  { title: 'Broccoli and Potato Soup', ingredient: 'broccoli', vibe: 'indoor', weight: 1 },

  // Peas
  { title: 'Pea and Mint Risotto', ingredient: 'peas', vibe: 'any', weight: 1 },
  { title: 'Pea and Potato Samosa Bake', ingredient: 'peas', vibe: 'indoor', weight: 1 },
  { title: 'Spring Pea Pasta with Lemon', ingredient: 'peas', vibe: 'any', weight: 1 },
  { title: 'Pasta Piselli Porri', ingredient: 'peas', vibe: 'any', weight: 5 },

  // Green Beans
  {
    title: 'Green Bean and Potato Salad with Mustard',
    ingredient: 'greenBeans',
    vibe: 'any',
    weight: 1,
  },
  { title: 'Braised Green Beans with Tomato', ingredient: 'greenBeans', vibe: 'any', weight: 1 },
  { title: 'Green Bean and Coconut Stir-Fry', ingredient: 'greenBeans', vibe: 'indoor', weight: 1 },
  { title: 'Green Bean Peanut Pasta', ingredient: 'greenBeans', vibe: 'any', weight: 5 },
  { title: 'Trofie al Pesto', ingredient: 'greenBeans', vibe: 'any', weight: 5 },

  // Zucchini
  { title: 'Zucchini and Ricotta Pasta', ingredient: 'zucchini', vibe: 'any', weight: 1 },
  { title: 'Stuffed Zucchini Boats', ingredient: 'zucchini', vibe: 'any', weight: 1 },
  { title: 'Zucchini Fritters with Yogurt Dip', ingredient: 'zucchini', vibe: 'any', weight: 1 },
  { title: 'Radiatori da Philadelphia', ingredient: 'zucchini', vibe: 'any', weight: 5 },

  // Tomato
  { title: 'Slow-Roasted Tomato Pasta', ingredient: 'tomato', vibe: 'any', weight: 1 },
  { title: 'Tomato and Lentil Stew', ingredient: 'tomato', vibe: 'indoor', weight: 1 },
  { title: 'Tomato and Zucchini Traybake', ingredient: 'tomato', vibe: 'outdoor', weight: 1 },
  { title: 'Paccheri al Pomodoro', ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: 'Paccheri al Pomodoro e Fontina', ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: 'Fusilli Pollo Vegano', ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: "Penne all'Arrabbiata", ingredient: 'tomato', vibe: 'any', weight: 5 },
  { title: 'Piatto di Pollo Messicano', ingredient: 'tomato', vibe: 'indoor', weight: 5 },
  { title: 'Ragu di Lenticchie', ingredient: 'tomato', vibe: 'indoor', weight: 5 },

  // Cucumber
  { title: 'Chilled Cucumber and Dill Soup', ingredient: 'cucumber', vibe: 'outdoor', weight: 1 },
  { title: 'Cucumber and Chickpea Bowl', ingredient: 'cucumber', vibe: 'any', weight: 1 },
  { title: 'Smashed Cucumber Salad with Sesame', ingredient: 'cucumber', vibe: 'any', weight: 1 },

  // Eggplant
  { title: 'Roasted Eggplant with Miso Glaze', ingredient: 'eggplant', vibe: 'any', weight: 1 },
  { title: 'Eggplant and Chickpea Stew', ingredient: 'eggplant', vibe: 'indoor', weight: 1 },
  { title: 'Stuffed Eggplant with Couscous', ingredient: 'eggplant', vibe: 'any', weight: 1 },

  // Pumpkin
  { title: 'Roasted Pumpkin with Sage', ingredient: 'pumpkin', vibe: 'any', weight: 1 },
  { title: 'Pumpkin and White Bean Stew', ingredient: 'pumpkin', vibe: 'indoor', weight: 1 },
  { title: 'Creamy Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'indoor', weight: 1 },
  { title: 'Pumpkin Pasta', ingredient: 'pumpkin', vibe: 'indoor', weight: 5 },
];

// ---------------------------------------------------------------------------
// Extra recipes (sweet + non-meal)
//
// Every seasonal fruit needs at least one recipe with vibe 'any', plus optional
// pantry picks for condiments and prep items.
// ---------------------------------------------------------------------------

export const EXTRA_RECIPES: Recipe[] = [
  // Apple
  { title: 'Apple Crumble', ingredient: 'apple', vibe: 'indoor', weight: 1 },
  { title: 'Simple Apple Cake', ingredient: 'apple', vibe: 'any', weight: 1 },
  { title: 'Baked Apples with Oats', ingredient: 'apple', vibe: 'indoor', weight: 1 },

  // Pear
  { title: 'Pear Almond Cake', ingredient: 'pear', vibe: 'any', weight: 1 },
  { title: 'Poached Pears', ingredient: 'pear', vibe: 'indoor', weight: 1 },
  { title: 'Pear Crumble', ingredient: 'pear', vibe: 'indoor', weight: 1 },

  // Rhubarb
  { title: 'Rhubarb Crumble', ingredient: 'rhubarb', vibe: 'indoor', weight: 1 },
  { title: 'Rhubarb and Custard Cake', ingredient: 'rhubarb', vibe: 'any', weight: 1 },
  { title: 'Rhubarb Compote with Yogurt', ingredient: 'rhubarb', vibe: 'any', weight: 1 },

  // Strawberry
  { title: 'Strawberry Galette', ingredient: 'strawberry', vibe: 'any', weight: 1 },
  { title: 'Strawberry Oat Bars', ingredient: 'strawberry', vibe: 'any', weight: 1 },
  { title: 'Strawberry Fool', ingredient: 'strawberry', vibe: 'outdoor', weight: 1 },

  // Cherry
  { title: 'Cherry Clafoutis', ingredient: 'cherry', vibe: 'any', weight: 1 },
  { title: 'Cherry Almond Cake', ingredient: 'cherry', vibe: 'any', weight: 1 },
  { title: 'Cherry Compote with Vanilla', ingredient: 'cherry', vibe: 'indoor', weight: 1 },

  // Plum
  { title: 'Plum Crumble', ingredient: 'plum', vibe: 'indoor', weight: 1 },
  { title: 'Plum and Almond Tart', ingredient: 'plum', vibe: 'any', weight: 1 },
  { title: 'Roasted Plums with Cinnamon', ingredient: 'plum', vibe: 'any', weight: 1 },

  // Blueberry
  { title: 'Blueberry Muffins', ingredient: 'blueberry', vibe: 'any', weight: 1 },
  { title: 'Blueberry Lemon Cake', ingredient: 'blueberry', vibe: 'any', weight: 1 },
  { title: 'Blueberry Oat Crumble', ingredient: 'blueberry', vibe: 'indoor', weight: 1 },

  // Blackberry
  { title: 'Blackberry and Apple Crumble', ingredient: 'blackberry', vibe: 'indoor', weight: 1 },
  { title: 'Blackberry Fool', ingredient: 'blackberry', vibe: 'any', weight: 1 },
  { title: 'Blackberry Oat Bars', ingredient: 'blackberry', vibe: 'any', weight: 1 },

  // Grape
  { title: 'Grape Focaccia', ingredient: 'grape', vibe: 'any', weight: 1 },
  { title: 'Roasted Grapes with Walnut Cake', ingredient: 'grape', vibe: 'any', weight: 1 },
  { title: 'Grape and Almond Tart', ingredient: 'grape', vibe: 'indoor', weight: 1 },

  // Pantry
  { title: 'Caju Fresco', ingredient: 'pantry', vibe: 'outdoor', weight: 5 },
  { title: 'Cashew Parmigiano', ingredient: 'pantry', vibe: 'any', weight: 5 },
  { title: 'Spice Blend', ingredient: 'pantry', vibe: 'any', weight: 5 },
];
