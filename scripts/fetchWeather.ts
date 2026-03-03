import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { API_KEY } from '../config.js';
import {
  getOutdoorFeel,
  type OutdoorFeel,
  type WeatherApiSnapshot,
} from '../src/lib/outdoorFeel.ts';
import { getWeekendFoodPlan } from '../src/lib/food.ts';
import { getWeekendOneLiner, type DaySnapshot } from '../src/lib/weekend.ts';

type WeerLiveCurrent = {
  fout?: string;
  temp?: number;
  gtemp?: number;
  samenv?: string;
  lv?: number;
  windms?: number;
  windr?: string;
  windrgr?: number;
  windbft?: number;
  windkmh?: number;
  windknp?: number;
  luchtd?: number;
  dauwp?: number;
  zicht?: number;
  verw?: string;
};

type WeerLiveDayForecast = {
  neersl_perc_dag?: number;
};

type WeerLiveResponse = {
  liveweer?: WeerLiveCurrent[];
  wk_verw?: WeerLiveDayForecast[];
};

type WeatherData = {
  temp: number;
  feelsLike: number;
  summary: string;
  humidity: number;
  windDirection: string;
  windDirectionDegrees: number;
  windBft: number;
  rainChance: number;
  forecast: string;
  outdoorFeel: OutdoorFeel;
  weekend?: {
    label: 'Weekend' | 'Tomorrow' | 'Next weekend';
    value: string;
  };
  food?: {
    savory: string;
    sweet: string;
  };
};

type FoodData = NonNullable<WeatherData['food']>;

type FoodCache = {
  weekKey: string;
  savory: string;
  sweet: string;
};

type OpenMeteoDaily = {
  time?: string[];
  apparent_temperature_max?: Array<number | null>;
  precipitation_probability_max?: Array<number | null>;
  wind_speed_10m_max?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  weather_code?: Array<number | null>;
};

type OpenMeteoResponse = {
  daily?: OpenMeteoDaily;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEATHER_FILE_PATH = resolve(__dirname, '../src/data/weather.json');
const FOOD_CACHE_FILE_PATH = resolve(__dirname, '../.tmp/food-cache.json');
const LOCATION = 'Rotterdam';

function requiredNumber(value: number | undefined, name: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Missing numeric field: ${name}`);
  }
  return value;
}

function requiredString(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing string field: ${name}`);
  }
  return value;
}

function kmhToBft(windKmh: number): number {
  if (windKmh < 1) return 0;
  if (windKmh < 6) return 1;
  if (windKmh < 12) return 2;
  if (windKmh < 20) return 3;
  if (windKmh < 29) return 4;
  if (windKmh < 39) return 5;
  if (windKmh < 50) return 6;
  if (windKmh < 62) return 7;
  if (windKmh < 75) return 8;
  if (windKmh < 89) return 9;
  if (windKmh < 103) return 10;
  if (windKmh < 118) return 11;
  return 12;
}

function visibilityFromCodeAndRain(weatherCode: number, rainChance: number): number {
  const isFog = weatherCode === 45 || weatherCode === 48;
  if (isFog) return 1000;
  if (rainChance >= 55) return 8000;
  return 20000;
}

function buildDaySnapshot(
  feelsLike: number | null,
  rainChance: number | null,
  windKmh: number | null,
  tempMin: number | null,
  weatherCode: number | null,
): DaySnapshot | null {
  if (
    feelsLike === null ||
    rainChance === null ||
    windKmh === null ||
    tempMin === null ||
    weatherCode === null
  ) {
    return null;
  }

  const windbft = kmhToBft(windKmh);
  return {
    feelsLike,
    rainChance,
    windbft,
    dauwp: tempMin,
    zicht: visibilityFromCodeAndRain(weatherCode, rainChance),
  };
}

function weekendTargetFromDay(day: number): {
  label: 'Weekend' | 'Tomorrow' | 'Next weekend';
  firstOffset: number;
  secondOffset: number;
} {
  if (day === 0) {
    return { label: 'Next weekend', firstOffset: 6, secondOffset: 7 };
  }

  if (day === 6) {
    return { label: 'Tomorrow', firstOffset: 1, secondOffset: 1 };
  }

  return {
    label: 'Weekend',
    firstOffset: 6 - day,
    secondOffset: 7 - day,
  };
}

function dateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFoodWeekKey(now: Date): string {
  const currentDay = now.getDay();
  const daysUntilSaturday = currentDay === 0 ? 6 : 6 - currentDay;
  const targetSaturday = new Date(now);
  targetSaturday.setDate(now.getDate() + daysUntilSaturday);
  return dateToKey(targetSaturday);
}

function asFoodCache(value: unknown): FoodCache | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<FoodCache>;
  if (
    typeof record.weekKey !== 'string' ||
    typeof record.savory !== 'string' ||
    typeof record.sweet !== 'string'
  ) {
    return null;
  }
  return record as FoodCache;
}

async function readFoodCache(): Promise<FoodCache | null> {
  try {
    const raw = await readFile(FOOD_CACHE_FILE_PATH, 'utf8');
    return asFoodCache(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    if (error instanceof SyntaxError) {
      console.warn('Food cache is invalid JSON; recalculating food plan.');
      return null;
    }
    throw error;
  }
}

async function writeFoodCache(weekKey: string, food: FoodData): Promise<void> {
  const cache: FoodCache = {
    weekKey,
    savory: food.savory,
    sweet: food.sweet,
  };
  await mkdir(dirname(FOOD_CACHE_FILE_PATH), { recursive: true });
  await writeFile(FOOD_CACHE_FILE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

async function fetchWeekendData(cachedFood?: FoodData): Promise<{
  weekend: NonNullable<WeatherData['weekend']>;
  food: FoodData;
}> {
  const endpoint = new URL('https://api.open-meteo.com/v1/forecast');
  endpoint.searchParams.set('latitude', '51.9225');
  endpoint.searchParams.set('longitude', '4.4791');
  endpoint.searchParams.set(
    'daily',
    'apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max,temperature_2m_min,weather_code',
  );
  endpoint.searchParams.set('timezone', 'Europe/Berlin');
  endpoint.searchParams.set('forecast_days', '10');

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`OpenMeteo request failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as OpenMeteoResponse;
  const daily = body.daily;
  if (!daily) {
    throw new Error('OpenMeteo response missing daily forecast');
  }

  const { firstOffset, secondOffset, label } = weekendTargetFromDay(new Date().getDay());

  const day1 = buildDaySnapshot(
    daily.apparent_temperature_max?.[firstOffset] ?? null,
    daily.precipitation_probability_max?.[firstOffset] ?? null,
    daily.wind_speed_10m_max?.[firstOffset] ?? null,
    daily.temperature_2m_min?.[firstOffset] ?? null,
    daily.weather_code?.[firstOffset] ?? null,
  );
  const day2 = buildDaySnapshot(
    daily.apparent_temperature_max?.[secondOffset] ?? null,
    daily.precipitation_probability_max?.[secondOffset] ?? null,
    daily.wind_speed_10m_max?.[secondOffset] ?? null,
    daily.temperature_2m_min?.[secondOffset] ?? null,
    daily.weather_code?.[secondOffset] ?? null,
  );

  if (!day1 || !day2) {
    throw new Error('OpenMeteo did not provide enough data for weekend one-liner');
  }

  const time1 = daily.time?.[firstOffset];
  const time2 = daily.time?.[secondOffset];
  if (!time1 || !time2) {
    throw new Error('OpenMeteo did not provide time data for weekend days');
  }

  const date1 = new Date(time1);
  const date2 = new Date(time2);
  if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
    throw new Error('OpenMeteo returned invalid weekend dates');
  }

  return {
    weekend: {
      label,
      value: getWeekendOneLiner(day1, day2),
    },
    food: cachedFood ?? getWeekendFoodPlan(date1, day1, date2, day2),
  };
}

function mapApiResponse(body: WeerLiveResponse): WeatherData {
  const current = body.liveweer?.[0];
  const dayForecast = body.wk_verw?.[0];

  if (!current) {
    throw new Error('Weather API response did not contain liveweer[0]');
  }

  if (current.fout) {
    throw new Error(`Weather API error: ${current.fout}`);
  }

  const snapshot: WeatherApiSnapshot = {
    temp: requiredNumber(current.temp, 'liveweer[0].temp'),
    gtemp: current.gtemp,
    lv: requiredNumber(current.lv, 'liveweer[0].lv'),
    windms: requiredNumber(current.windms, 'liveweer[0].windms'),
    windbft: current.windbft,
    windkmh: current.windkmh,
    windknp: current.windknp,
    windr: current.windr,
    windrgr: current.windrgr,
    luchtd: current.luchtd,
    dauwp: requiredNumber(current.dauwp, 'liveweer[0].dauwp'),
    zicht: requiredNumber(current.zicht, 'liveweer[0].zicht'),
    samenv: current.samenv,
  };

  const outdoorFeel = getOutdoorFeel(snapshot);

  return {
    temp: snapshot.temp,
    feelsLike: requiredNumber(current.gtemp, 'liveweer[0].gtemp'),
    summary: requiredString(snapshot.samenv, 'liveweer[0].samenv'),
    humidity: snapshot.lv,
    windDirection: requiredString(current.windr, 'liveweer[0].windr'),
    windDirectionDegrees: requiredNumber(current.windrgr, 'liveweer[0].windrgr'),
    windBft: requiredNumber(current.windbft, 'liveweer[0].windbft'),
    rainChance: requiredNumber(dayForecast?.neersl_perc_dag, 'wk_verw[0].neersl_perc_dag'),
    forecast: requiredString(current.verw, 'liveweer[0].verw'),
    outdoorFeel,
  };
}

async function fetchWeather(): Promise<WeatherData> {
  if (!API_KEY || API_KEY.trim().length === 0) {
    throw new Error('API_KEY is missing in config.js');
  }

  const endpoint = new URL('https://weerlive.nl/api/weerlive_api_v2.php');
  endpoint.searchParams.set('key', API_KEY);
  endpoint.searchParams.set('locatie', LOCATION);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as WeerLiveResponse;
  const weather = mapApiResponse(body);
  const foodWeekKey = getFoodWeekKey(new Date());
  const cachedFoodRecord = await readFoodCache();
  const cachedFood =
    cachedFoodRecord && cachedFoodRecord.weekKey === foodWeekKey
      ? { savory: cachedFoodRecord.savory, sweet: cachedFoodRecord.sweet }
      : undefined;

  try {
    const weekendData = await fetchWeekendData(cachedFood);
    weather.weekend = weekendData.weekend;
    weather.food = weekendData.food;
    if (!cachedFood) {
      await writeFoodCache(foodWeekKey, weekendData.food);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Skipping weekend extras: ${message}`);
  }

  return weather;
}

async function main(): Promise<void> {
  const weather = await fetchWeather();
  await mkdir(dirname(WEATHER_FILE_PATH), { recursive: true });
  await writeFile(WEATHER_FILE_PATH, `${JSON.stringify(weather, null, 2)}\n`, 'utf8');
  console.log(`Weather data written to ${WEATHER_FILE_PATH}`);
}

if (
  process.argv[1] &&
  !process.env.VITEST &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to fetch weather: ${message}`);
    process.exit(1);
  });
}
