import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Ban,
  Bike,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  Droplets,
  Footprints,
  Home,
  ShoppingBag,
  Snowflake,
  Sun,
  TreePine,
  TriangleAlert,
  Umbrella,
  UtensilsCrossed,
  Wind,
} from 'lucide-react';

export const HINT_ICONS: Record<string, LucideIcon> = {
  'Indoor day': Home,
  'Do not bike': Ban,
  'Slippery outside': TriangleAlert,
  'Cozy inside': Home,
  'Umbrella errands': Umbrella,
  'Rainy day': CloudRain,
  'Dense fog': CloudFog,
  'Fog likely': CloudFog,
  'Misty walk': CloudFog,
  'Heavy air': Droplets,
  'Hazy outdoors': Droplets,
  'Cold storm': CloudLightning,
  'Stormy day': CloudLightning,
  'Biting wind': Wind,
  'Cutting wind': Wind,
  'Brisk air': Wind,
  'Windy but pleasant': Wind,
  'Cooling breeze': Wind,
  'Windy day': Wind,
  'Air feels thick': Droplets,
  'Sticky heat': Droplets,
  'Dry heat': Sun,
  'Hot and sweaty': Droplets,
  'Beach weather': Sun,
  'Humid evening': Droplets,
  'Terrace ready': Sun,
  'Terrace weather': Sun,
  'Dinner outside': UtensilsCrossed,
  'Clear winter day': Snowflake,
  'Freezing walk': Snowflake,
  'Crisp blue skies': Sun,
  'Cold and crisp': Snowflake,
  'Sunny, light coat': Sun,
  'Drizzle + jacket': CloudDrizzle,
  'Layer up': Wind,
  'Long walk day': Footprints,
  'Fresh-air walk': Footprints,
  'Errand weather': ShoppingBag,
  'Great for cycling': Bike,
  'Rain breaks': CloudDrizzle,
  'Nice outdoors': TreePine,
  'Golden day': Sun,
  'Picnic weather': TreePine,
  'Bike-friendly': Bike,
  'Between showers': Umbrella,
  'Easy outdoor day': TreePine,
  'Terrace gamble': Umbrella,
  'Bring a light shell': Umbrella,
  'Crystal-clear day': Sun,
  'Big-sky day': Sun,
  'Clear skies': Sun,
  'Good outdoors': TreePine,
  'other day wet': CloudRain,
  'other day stormy': CloudLightning,
  'other day rainy': CloudDrizzle,
  'other day cold': Snowflake,
  'other day meh': TreePine,
};

export function renderActivityHint(hint: string): ReactNode {
  const Icon = HINT_ICONS[hint];
  if (!Icon) {
    return hint;
  }

  return (
    <span className="activity-hint">
      <Icon className="activity-hint-icon" aria-hidden="true" />
      <span>{hint}</span>
    </span>
  );
}
