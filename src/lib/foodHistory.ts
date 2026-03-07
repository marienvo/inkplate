import type { CoreWeatherVibe, WeatherVibe } from '../config/foodRules';

export type FoodHistoryEntry = {
  weekKey: string;
  recipe: string;
  ingredient: string;
  recipeVibe: WeatherVibe;
  weatherVibe: CoreWeatherVibe;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function parseWeekKey(weekKey: string): Date | null {
  const date = new Date(`${weekKey}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isValidHistoryEntry(value: unknown): value is FoodHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<FoodHistoryEntry>;
  return (
    typeof record.weekKey === 'string' &&
    typeof record.recipe === 'string' &&
    typeof record.ingredient === 'string' &&
    typeof record.recipeVibe === 'string' &&
    ['cozy', 'hearty', 'fresh', 'any'].includes(record.recipeVibe) &&
    typeof record.weatherVibe === 'string' &&
    ['cozy', 'hearty', 'fresh'].includes(record.weatherVibe)
  );
}

export function readFoodHistory(json: string): FoodHistoryEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isValidHistoryEntry);
}

export function writeFoodHistory(entries: FoodHistoryEntry[]): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}

export function getWeeksAgo(currentWeekKey: string, entryWeekKey: string): number | null {
  const current = parseWeekKey(currentWeekKey);
  const entry = parseWeekKey(entryWeekKey);
  if (!current || !entry) return null;
  const delta = current.getTime() - entry.getTime();
  if (delta < 0) return null;
  return Math.floor(delta / WEEK_MS);
}

export function pruneFoodHistory(
  entries: FoodHistoryEntry[],
  currentWeekKey: string,
  maxWeeks: number,
): FoodHistoryEntry[] {
  return entries.filter((entry) => {
    const weeksAgo = getWeeksAgo(currentWeekKey, entry.weekKey);
    return weeksAgo !== null && weeksAgo <= maxWeeks;
  });
}

export function appendFoodHistory(
  entries: FoodHistoryEntry[],
  newEntries: FoodHistoryEntry[],
): FoodHistoryEntry[] {
  const dedupe = new Set(entries.map((entry) => `${entry.weekKey}|${entry.recipe}`));
  const merged = [...entries];
  for (const entry of newEntries) {
    const key = `${entry.weekKey}|${entry.recipe}`;
    if (dedupe.has(key)) continue;
    dedupe.add(key);
    merged.push(entry);
  }
  return merged;
}
