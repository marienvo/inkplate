import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Apple,
  CakeSlice,
  Carrot,
  ChefHat,
  Cherry,
  Cookie,
  CookingPot,
  Croissant,
  LeafyGreen,
  Microwave,
  Refrigerator,
  Salad,
  Soup,
  UtensilsCrossed,
} from 'lucide-react';

type FoodHintParts = {
  label: string;
  value: string;
};

export type FoodHintItem = {
  icon: ReactNode;
  label: string;
  value: string;
};

export const FOOD_HINT_ICONS: Record<string, LucideIcon> = {
  'Meal prep': CookingPot,
  'Batch cook': ChefHat,
  'Prep & freeze': Refrigerator,
  'Stock the fridge': LeafyGreen,
  'Sunday prep': Salad,
  Traybake: Microwave,
  'Quick pasta': CookingPot,
  'Warm bowl': Soup,
  'Big salad': Salad,
  'Roast veggies': Carrot,
  Bake: CakeSlice,
  Sweet: Apple,
  Recipe: ChefHat,
  crumble: Cookie,
  cake: CakeSlice,
  pie: Cherry,
  muffins: Croissant,
  galette: Cherry,
  bars: Cookie,
  compote: Apple,
};

import { SAVORY_RECIPES, SWEET_RECIPES } from '../config/foodRules';

const RECIPE_TITLES = new Set([
  ...SAVORY_RECIPES.map((r) => r.title),
  ...SWEET_RECIPES.map((r) => r.title),
]);

function parseFoodHint(hint: string): FoodHintParts {
  const [prefix, ...rest] = hint.split(': ');
  if (!prefix || rest.length === 0) {
    return RECIPE_TITLES.has(hint)
      ? { label: 'Recipe', value: hint }
      : { label: 'Food', value: hint };
  }

  return {
    label: prefix,
    value: rest.join(': '),
  };
}

export function renderFoodHint(hint: string): FoodHintItem {
  const parsed = parseFoodHint(hint);
  const Icon = FOOD_HINT_ICONS[parsed.label] ?? UtensilsCrossed;
  return {
    icon: <Icon />,
    label: parsed.label,
    value: parsed.value,
  };
}
