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
import { ACTIVITY_HINTS } from './activityHints';

export const HINT_ICONS: Record<string, LucideIcon> = {
  [ACTIVITY_HINTS.INDOOR_DAY]: Home,
  [ACTIVITY_HINTS.DO_NOT_BIKE]: Ban,
  [ACTIVITY_HINTS.SLIPPERY_OUTSIDE]: TriangleAlert,
  [ACTIVITY_HINTS.COZY_INSIDE]: Home,
  [ACTIVITY_HINTS.UMBRELLA_ERRANDS]: Umbrella,
  [ACTIVITY_HINTS.RAINY_DAY]: CloudRain,
  [ACTIVITY_HINTS.DENSE_FOG]: CloudFog,
  [ACTIVITY_HINTS.FOG_LIKELY]: CloudFog,
  [ACTIVITY_HINTS.MISTY_WALK]: CloudFog,
  [ACTIVITY_HINTS.HEAVY_AIR]: Droplets,
  [ACTIVITY_HINTS.HAZY_OUTDOORS]: Droplets,
  [ACTIVITY_HINTS.COLD_STORM]: CloudLightning,
  [ACTIVITY_HINTS.STORMY_DAY]: CloudLightning,
  [ACTIVITY_HINTS.BITING_WIND]: Wind,
  [ACTIVITY_HINTS.CUTTING_WIND]: Wind,
  [ACTIVITY_HINTS.BRISK_AIR]: Wind,
  [ACTIVITY_HINTS.WINDY_BUT_PLEASANT]: Wind,
  [ACTIVITY_HINTS.COOLING_BREEZE]: Wind,
  [ACTIVITY_HINTS.WINDY_DAY]: Wind,
  [ACTIVITY_HINTS.AIR_FEELS_THICK]: Droplets,
  [ACTIVITY_HINTS.STICKY_HEAT]: Droplets,
  [ACTIVITY_HINTS.DRY_HEAT]: Sun,
  [ACTIVITY_HINTS.HOT_AND_SWEATY]: Droplets,
  [ACTIVITY_HINTS.BEACH_WEATHER]: Sun,
  [ACTIVITY_HINTS.HUMID_EVENING]: Droplets,
  [ACTIVITY_HINTS.TERRACE_READY]: Sun,
  [ACTIVITY_HINTS.TERRACE_WEATHER]: Sun,
  [ACTIVITY_HINTS.DINNER_OUTSIDE]: UtensilsCrossed,
  [ACTIVITY_HINTS.CLEAR_WINTER_DAY]: Snowflake,
  [ACTIVITY_HINTS.FREEZING_WALK]: Snowflake,
  [ACTIVITY_HINTS.CRISP_BLUE_SKIES]: Sun,
  [ACTIVITY_HINTS.COLD_AND_CRISP]: Snowflake,
  [ACTIVITY_HINTS.SUNNY_LIGHT_COAT]: Sun,
  [ACTIVITY_HINTS.DRIZZLE_AND_JACKET]: CloudDrizzle,
  [ACTIVITY_HINTS.LAYER_UP]: Wind,
  [ACTIVITY_HINTS.LONG_WALK_DAY]: Footprints,
  [ACTIVITY_HINTS.FRESH_AIR_WALK]: Footprints,
  [ACTIVITY_HINTS.ERRAND_WEATHER]: ShoppingBag,
  [ACTIVITY_HINTS.GREAT_FOR_CYCLING]: Bike,
  [ACTIVITY_HINTS.RAIN_BREAKS]: CloudDrizzle,
  [ACTIVITY_HINTS.NICE_OUTDOORS]: TreePine,
  [ACTIVITY_HINTS.GOLDEN_DAY]: Sun,
  [ACTIVITY_HINTS.PICNIC_WEATHER]: TreePine,
  [ACTIVITY_HINTS.BIKE_FRIENDLY]: Bike,
  [ACTIVITY_HINTS.BETWEEN_SHOWERS]: Umbrella,
  [ACTIVITY_HINTS.EASY_OUTDOOR_DAY]: TreePine,
  [ACTIVITY_HINTS.TERRACE_GAMBLE]: Umbrella,
  [ACTIVITY_HINTS.BRING_A_LIGHT_SHELL]: Umbrella,
  [ACTIVITY_HINTS.CRYSTAL_CLEAR_DAY]: Sun,
  [ACTIVITY_HINTS.BIG_SKY_DAY]: Sun,
  [ACTIVITY_HINTS.CLEAR_SKIES]: Sun,
  [ACTIVITY_HINTS.GOOD_OUTDOORS]: TreePine,
  [ACTIVITY_HINTS.OTHER_DAY_WET]: CloudRain,
  [ACTIVITY_HINTS.OTHER_DAY_STORMY]: CloudLightning,
  [ACTIVITY_HINTS.OTHER_DAY_RAINY]: CloudDrizzle,
  [ACTIVITY_HINTS.OTHER_DAY_COLD]: Snowflake,
  [ACTIVITY_HINTS.OTHER_DAY_MEH]: TreePine,
};

export function renderActivityHint(hint: string): ReactNode {
  const suffixStart = hint.indexOf(' (other day ');
  const hintKey = suffixStart === -1 ? hint : hint.slice(0, suffixStart);
  const Icon = HINT_ICONS[hintKey];
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
