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
  Pasta: CookingPot,
  Risotto: CookingPot,
  'Stir-fry': CookingPot,
  Skillet: CookingPot,
  Fry: CookingPot,
  Braise: CookingPot,
  Comfort: CookingPot,
  Stew: Soup,
  Soup,
  Curry: Soup,
  Bowl: Soup,
  Traybake: Microwave,
  Gratin: Microwave,
  Pie: Cherry,
  Tart: Cherry,
  Galette: Cherry,
  Crumble: Cookie,
  Bars: Cookie,
  Cake: CakeSlice,
  Bake: CakeSlice,
  Muffins: Croissant,
  Compote: Apple,
  Sweet: Apple,
  Salad,
  Snack: LeafyGreen,
  Roast: Carrot,
  Recipe: ChefHat,
};

const TITLE_KEYWORDS: { pattern: RegExp; label: string }[] = [
  { pattern: /stir-fry/i, label: 'Stir-fry' },
  { pattern: /risotto/i, label: 'Risotto' },
  { pattern: /tortilla/i, label: 'Fry' },
  { pattern: /colcannon/i, label: 'Comfort' },
  { pattern: /clafoutis/i, label: 'Bake' },
  { pattern: /focaccia/i, label: 'Bake' },
  { pattern: /remoulade/i, label: 'Snack' },
  { pattern: /traybake/i, label: 'Traybake' },
  { pattern: /gratin/i, label: 'Gratin' },
  { pattern: /pasta/i, label: 'Pasta' },
  { pattern: /stew/i, label: 'Stew' },
  { pattern: /soup/i, label: 'Soup' },
  { pattern: /curry/i, label: 'Curry' },
  { pattern: /bowl/i, label: 'Bowl' },
  { pattern: /pie/i, label: 'Pie' },
  { pattern: /tart/i, label: 'Tart' },
  { pattern: /galette/i, label: 'Galette' },
  { pattern: /crumble/i, label: 'Crumble' },
  { pattern: /bars/i, label: 'Bars' },
  { pattern: /cake/i, label: 'Cake' },
  { pattern: /loaf/i, label: 'Bake' },
  { pattern: /muffins/i, label: 'Muffins' },
  { pattern: /compote/i, label: 'Compote' },
  { pattern: /fool/i, label: 'Sweet' },
  { pattern: /poached/i, label: 'Sweet' },
  { pattern: /salad/i, label: 'Salad' },
  { pattern: /skillet/i, label: 'Skillet' },
  { pattern: /fritters/i, label: 'Fry' },
  { pattern: /braised/i, label: 'Braise' },
  { pattern: /roast|crispy|smashed|baked/i, label: 'Roast' },
  { pattern: /dip/i, label: 'Snack' },
];

function labelFromTitle(title: string): string {
  for (const { pattern, label } of TITLE_KEYWORDS) {
    if (pattern.test(title)) return label;
  }
  return 'Recipe';
}

function parseFoodHint(hint: string): FoodHintParts {
  const colonIndex = hint.indexOf(': ');
  if (colonIndex === -1) {
    return { label: labelFromTitle(hint), value: hint };
  }

  return {
    label: hint.slice(0, colonIndex),
    value: hint.slice(colonIndex + 2),
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
