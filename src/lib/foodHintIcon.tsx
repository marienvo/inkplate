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
  Flame,
  IceCreamCone,
  LeafyGreen,
  Microwave,
  Salad,
  Sparkles,
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
  Frozen: IceCreamCone,
  Topping: Sparkles,
  Prep: Flame,
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
  {
    pattern: /linguine|paccheri|radiatori|penne|rigatoni|trofie|fusilli|sedanini|mezze/i,
    label: 'Pasta',
  },
  { pattern: /ragù|ragu/i, label: 'Pasta' },
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
  { pattern: /krautsalat|salat/i, label: 'Salad' },
  { pattern: /salad/i, label: 'Salad' },
  { pattern: /mash/i, label: 'Comfort' },
  { pattern: /skillet/i, label: 'Skillet' },
  { pattern: /fritters/i, label: 'Fry' },
  { pattern: /braised/i, label: 'Braise' },
  { pattern: /piatto/i, label: 'Roast' },
  { pattern: /fresco/i, label: 'Frozen' },
  { pattern: /parmigiano/i, label: 'Topping' },
  { pattern: /spice/i, label: 'Prep' },
  { pattern: /stuffed/i, label: 'Roast' },
  { pattern: /roast|crispy|smashed|baked/i, label: 'Roast' },
  { pattern: /dip/i, label: 'Snack' },
];

function firstAsciiLetter(word: string): string | null {
  const match = /[A-Za-z]/.exec(word);
  return match ? match[0] : null;
}

function startsWithLowercase(word: string): boolean {
  const letter = firstAsciiLetter(word);
  return letter !== null && letter >= 'a' && letter <= 'z';
}

function startsWithUppercase(word: string): boolean {
  const letter = firstAsciiLetter(word);
  return letter !== null && letter >= 'A' && letter <= 'Z';
}

// Keep connector-led chunks together while still allowing natural line wraps between chunks.
export function splitFoodValueWrapGroups(value: string): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;

  const groups: string[] = [];
  let currentCapitalizedRun: string[] = [];

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];

    if (startsWithLowercase(word)) {
      if (currentCapitalizedRun.length > 0) {
        groups.push(currentCapitalizedRun.join(' '));
        currentCapitalizedRun = [];
      }

      const connectorGroup = [word];
      let cursor = i + 1;
      while (cursor < words.length && startsWithUppercase(words[cursor])) {
        connectorGroup.push(words[cursor]);
        cursor += 1;
      }
      groups.push(connectorGroup.join(' '));
      i = cursor - 1;
      continue;
    }

    currentCapitalizedRun.push(word);
  }

  if (currentCapitalizedRun.length > 0) {
    groups.push(currentCapitalizedRun.join(' '));
  }

  return groups.length > 0 ? groups : [value];
}

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
