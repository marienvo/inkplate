import { ACTIVITY_HINTS } from './activityHints';

export type DaySnapshot = {
  feelsLike: number; // degC
  rainChance: number; // %
  windbft: number; // Beaufort
  dauwp: number; // degC dew point
  zicht: number; // meters visibility
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// 1) Big-variation hint set
export function getActivityHint(day: DaySnapshot): string {
  const { feelsLike, rainChance, windbft, dauwp, zicht } = day;

  const dry = rainChance < 25;
  const chanceShowers = rainChance >= 25 && rainChance < 55;
  const wet = rainChance >= 55;
  const veryWet = rainChance >= 80;

  const calm = windbft <= 2;
  const breeze = windbft === 3 || windbft === 4;
  const windy = windbft === 5 || windbft === 6;
  const gale = windbft >= 7;

  const freezing = feelsLike <= 0;
  const cold = feelsLike > 0 && feelsLike <= 5;
  const cool = feelsLike > 5 && feelsLike <= 11;
  const mild = feelsLike > 11 && feelsLike <= 17;
  const warm = feelsLike > 17 && feelsLike <= 23;
  const hot = feelsLike > 23 && feelsLike <= 28;
  const veryHot = feelsLike > 28;

  const muggy = dauwp >= 18;
  const sticky = dauwp >= 21;
  const crisp = dauwp <= 4;

  // Physically this is usually temp - dewPoint. feelsLike is okay for UX.
  const spread = feelsLike - dauwp;
  const nearSaturation = spread <= 2;

  const crystalClear = zicht >= 30000;
  const clearVis = zicht >= 15000 && zicht < 30000;
  const hazy = zicht >= 6000 && zicht < 15000;
  const misty = zicht >= 1500 && zicht < 6000;
  const foggy = zicht < 1500;

  // Hard stops: precipitation & safety vibes
  if (veryWet) return ACTIVITY_HINTS.INDOOR_DAY;
  if (wet && gale) return ACTIVITY_HINTS.DO_NOT_BIKE;
  if (wet && freezing) return ACTIVITY_HINTS.SLIPPERY_OUTSIDE;
  if (wet && cold) return ACTIVITY_HINTS.COZY_INSIDE;
  if (wet && mild) return ACTIVITY_HINTS.UMBRELLA_ERRANDS;
  if (wet) return ACTIVITY_HINTS.RAINY_DAY;

  // Visibility / saturation (mist vibe)
  if (foggy) return ACTIVITY_HINTS.DENSE_FOG;
  if (misty && nearSaturation) return ACTIVITY_HINTS.FOG_LIKELY;
  if (misty) return ACTIVITY_HINTS.MISTY_WALK;
  if (hazy && warm) return ACTIVITY_HINTS.HEAVY_AIR;
  if (hazy) return ACTIVITY_HINTS.HAZY_OUTDOORS;

  // Wind extremes
  if (gale && cold) return ACTIVITY_HINTS.COLD_STORM;
  if (gale) return ACTIVITY_HINTS.STORMY_DAY;
  if (windy && freezing) return ACTIVITY_HINTS.BITING_WIND;
  if (windy && cold) return ACTIVITY_HINTS.CUTTING_WIND;
  if (windy && dry && cool) return ACTIVITY_HINTS.BRISK_AIR;
  if (windy && dry && mild) return ACTIVITY_HINTS.WINDY_BUT_PLEASANT;
  if (windy && warm) return ACTIVITY_HINTS.COOLING_BREEZE;
  if (windy) return ACTIVITY_HINTS.WINDY_DAY;

  // Heat & humidity
  if (veryHot && sticky) return ACTIVITY_HINTS.AIR_FEELS_THICK;
  if (veryHot && muggy) return ACTIVITY_HINTS.STICKY_HEAT;
  if (veryHot && dry) return ACTIVITY_HINTS.DRY_HEAT;
  if (hot && sticky) return ACTIVITY_HINTS.HOT_AND_SWEATY;
  if (hot && dry) return ACTIVITY_HINTS.BEACH_WEATHER;
  if (warm && muggy) return ACTIVITY_HINTS.HUMID_EVENING;
  if (warm && dry && calm) return ACTIVITY_HINTS.TERRACE_READY;
  if (warm && dry && breeze) return ACTIVITY_HINTS.TERRACE_WEATHER;
  if (warm) return ACTIVITY_HINTS.DINNER_OUTSIDE;

  // Cold / crisp / winter-ish
  if (freezing && calm && dry) return ACTIVITY_HINTS.CLEAR_WINTER_DAY;
  if (freezing && dry) return ACTIVITY_HINTS.FREEZING_WALK;
  if (cold && crisp && crystalClear) return ACTIVITY_HINTS.CRISP_BLUE_SKIES;
  if (cold && crisp) return ACTIVITY_HINTS.COLD_AND_CRISP;
  if (cold && calm && dry) return ACTIVITY_HINTS.SUNNY_LIGHT_COAT;
  if (cold && chanceShowers) return ACTIVITY_HINTS.DRIZZLE_AND_JACKET;
  if (cold) return ACTIVITY_HINTS.LAYER_UP;

  // Mild/cool "do stuff" weather
  if (cool && crystalClear && calm) return ACTIVITY_HINTS.LONG_WALK_DAY;
  if (cool && clearVis && breeze) return ACTIVITY_HINTS.FRESH_AIR_WALK;
  if (cool && dry && calm) return ACTIVITY_HINTS.ERRAND_WEATHER;
  if (cool && dry && breeze) return ACTIVITY_HINTS.GREAT_FOR_CYCLING;
  if (cool && chanceShowers) return ACTIVITY_HINTS.RAIN_BREAKS;
  if (cool) return ACTIVITY_HINTS.NICE_OUTDOORS;

  if (mild && dry && calm && crystalClear) return ACTIVITY_HINTS.GOLDEN_DAY;
  if (mild && dry && calm) return ACTIVITY_HINTS.PICNIC_WEATHER;
  if (mild && dry && breeze) return ACTIVITY_HINTS.BIKE_FRIENDLY;
  if (mild && chanceShowers) return ACTIVITY_HINTS.BETWEEN_SHOWERS;
  if (mild) return ACTIVITY_HINTS.EASY_OUTDOOR_DAY;

  // Remaining cases (including chanceShowers + warm)
  if (chanceShowers && warm) return ACTIVITY_HINTS.TERRACE_GAMBLE;
  if (chanceShowers) return ACTIVITY_HINTS.BRING_A_LIGHT_SHELL;

  // Visibility flair (nice-to-have)
  if (crystalClear && crisp) return ACTIVITY_HINTS.CRYSTAL_CLEAR_DAY;
  if (crystalClear) return ACTIVITY_HINTS.BIG_SKY_DAY;
  if (clearVis) return ACTIVITY_HINTS.CLEAR_SKIES;

  return ACTIVITY_HINTS.GOOD_OUTDOORS;
}

// 2) Score aligned with "best day to do stuff"
function scoreDay(day: DaySnapshot): number {
  const { feelsLike, rainChance, windbft, dauwp, zicht } = day;

  const rainPenalty = rainChance * 1.4;
  const windPenalty = Math.max(0, windbft - 3) * 8;

  const comfort = 14 - Math.abs(feelsLike - 16);
  const comfortBonus = clamp(comfort, 0, 14);

  const muggyPenalty = dauwp > 18 ? (dauwp - 18) * 3.0 : 0;
  const crispBonus = dauwp < 6 ? (6 - dauwp) * 1.2 : 0;

  const visBonus = clamp((zicht - 10000) / 20000, 0, 1) * 4;

  const harshPenalty = feelsLike <= 0 && windbft >= 6 ? 8 : 0;

  return (
    60 +
    comfortBonus +
    crispBonus +
    visBonus -
    rainPenalty -
    windPenalty -
    muggyPenalty -
    harshPenalty
  );
}

// 3) One-liner for the weekend.
function otherDaySuffix(day: DaySnapshot): string {
  if (day.rainChance >= 80) return ACTIVITY_HINTS.OTHER_DAY_WET;
  if (day.windbft >= 7) return ACTIVITY_HINTS.OTHER_DAY_STORMY;
  if (day.rainChance >= 55) return ACTIVITY_HINTS.OTHER_DAY_RAINY;
  if (day.feelsLike <= 2) return ACTIVITY_HINTS.OTHER_DAY_COLD;
  return ACTIVITY_HINTS.OTHER_DAY_MEH;
}

function isBigContrast(a: DaySnapshot, b: DaySnapshot): boolean {
  return (
    Math.abs(a.rainChance - b.rainChance) >= 35 ||
    Math.abs(a.windbft - b.windbft) >= 3 ||
    Math.abs(a.feelsLike - b.feelsLike) >= 7
  );
}

export function getWeekendOneLiner(day1: DaySnapshot, day2: DaySnapshot): string {
  const score1 = scoreDay(day1);
  const score2 = scoreDay(day2);

  const best = score1 >= score2 ? day1 : day2;
  const other = score1 >= score2 ? day2 : day1;

  const bestHint = getActivityHint(best);

  const gap = Math.abs(score1 - score2);
  if (isBigContrast(day1, day2) && gap >= 14) {
    return `${bestHint} (${otherDaySuffix(other)})`;
  }

  return bestHint;
}
