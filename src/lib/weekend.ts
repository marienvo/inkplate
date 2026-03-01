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
  if (veryWet) return "Indoor day";
  if (wet && gale) return "Do not bike";
  if (wet && freezing) return "Slippery outside";
  if (wet && cold) return "Cozy inside";
  if (wet && mild) return "Umbrella errands";
  if (wet) return "Rainy day";

  // Visibility / saturation (mist vibe)
  if (foggy) return "Dense fog vibes";
  if (misty && nearSaturation) return "Mist likely";
  if (misty) return "Misty walk";
  if (hazy && warm) return "Heavy summer air";
  if (hazy) return "Hazy outdoors";

  // Wind extremes
  if (gale && cold) return "Stormy chill";
  if (gale) return "Storm day";
  if (windy && freezing) return "Face-freeze wind";
  if (windy && cold) return "Wind cuts through";
  if (windy && dry && cool) return "Brisk coastal air";
  if (windy && dry && mild) return "Windy but nice";
  if (windy && warm) return "Wind saves you";
  if (windy) return "Windy outside";

  // Heat & humidity
  if (veryHot && sticky) return "Air is soup";
  if (veryHot && muggy) return "Sticky heat";
  if (veryHot && dry) return "Dry heat day";
  if (hot && sticky) return "Sweaty outside";
  if (hot && dry) return "Beach conditions";
  if (warm && muggy) return "Humid terrace";
  if (warm && dry && calm) return "Terrace ready";
  if (warm && dry && breeze) return "Perfect terrace";
  if (warm) return "Outdoor dinner";

  // Cold / crisp / winter-ish
  if (freezing && calm && dry) return "Clear winter air";
  if (freezing && dry) return "Freeze walk";
  if (cold && crisp && crystalClear) return "Crisp blue-sky";
  if (cold && crisp) return "Cold but crisp";
  if (cold && calm && dry) return "Sunny coat weather";
  if (cold && chanceShowers) return "Drizzle + jacket";
  if (cold) return "Warm layers";

  // Mild/cool "do stuff" weather
  if (cool && crystalClear && calm) return "Long walk day";
  if (cool && clearVis && breeze) return "Fresh city walk";
  if (cool && dry && calm) return "Perfect errands";
  if (cool && dry && breeze) return "Great cycling";
  if (cool && chanceShowers) return "Quick rain breaks";
  if (cool) return "Nice outside";

  if (mild && dry && calm && crystalClear) return "Golden outdoor day";
  if (mild && dry && calm) return "Picnic weather";
  if (mild && dry && breeze) return "Bike-friendly day";
  if (mild && chanceShowers) return "Walk between showers";
  if (mild) return "Easy outdoors";

  // Remaining cases (including chanceShowers + warm)
  if (chanceShowers && warm) return "Terrace gamble";
  if (chanceShowers) return "Bring a shell";

  // Visibility flair (nice-to-have)
  if (crystalClear && crisp) return "Crystal clear day";
  if (crystalClear) return "Big sky day";
  if (clearVis) return "Clear outdoors";

  return "Good outdoor weather";
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
  if (day.rainChance >= 80) return "other day wet";
  if (day.windbft >= 7) return "other day stormy";
  if (day.rainChance >= 55) return "other day rainy";
  if (day.feelsLike <= 2) return "other day cold";
  return "other day meh";
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
