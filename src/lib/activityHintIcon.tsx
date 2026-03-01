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

const HINT_ICONS: Record<string, LucideIcon> = {
  'Indoor day': Home,
  'Do not bike': Ban,
  'Slippery outside': TriangleAlert,
  'Cozy inside': Home,
  'Umbrella errands': Umbrella,
  'Rainy day': CloudRain,
  'Dense fog vibes': CloudFog,
  'Mist likely': CloudFog,
  'Misty walk': CloudFog,
  'Heavy summer air': Droplets,
  'Hazy outdoors': Droplets,
  'Stormy chill': CloudLightning,
  'Storm day': CloudLightning,
  'Face-freeze wind': Wind,
  'Wind cuts through': Wind,
  'Brisk coastal air': Wind,
  'Windy but nice': Wind,
  'Wind saves you': Wind,
  'Windy outside': Wind,
  'Air is soup': Droplets,
  'Sticky heat': Droplets,
  'Dry heat day': Sun,
  'Sweaty outside': Droplets,
  'Beach conditions': Sun,
  'Humid terrace': Droplets,
  'Terrace ready': Sun,
  'Perfect terrace': Sun,
  'Outdoor dinner': UtensilsCrossed,
  'Clear winter air': Snowflake,
  'Freeze walk': Snowflake,
  'Crisp blue-sky': Sun,
  'Cold but crisp': Snowflake,
  'Sunny coat weather': Sun,
  'Drizzle + jacket': CloudDrizzle,
  'Warm layers': Wind,
  'Long walk day': Footprints,
  'Fresh city walk': Footprints,
  'Perfect errands': ShoppingBag,
  'Great cycling': Bike,
  'Quick rain breaks': CloudDrizzle,
  'Nice outside': TreePine,
  'Golden outdoor day': Sun,
  'Picnic weather': TreePine,
  'Bike-friendly day': Bike,
  'Walk between showers': Umbrella,
  'Easy outdoors': TreePine,
  'Terrace gamble': Umbrella,
  'Bring a shell': Umbrella,
  'Crystal clear day': Sun,
  'Big sky day': Sun,
  'Clear outdoors': Sun,
  'Good outdoor weather': TreePine,
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
