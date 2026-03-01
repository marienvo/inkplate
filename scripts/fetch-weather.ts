import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { API_KEY } from "../config.js";
import { getOutdoorFeel, type OutdoorFeel, type WeatherApiSnapshot } from "../src/lib/outdoor-feel.ts";

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
  windBft: number;
  rainChance: number;
  forecast: string;
  outdoorFeel: OutdoorFeel;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEATHER_FILE_PATH = resolve(__dirname, "../src/data/weather.json");
const LOCATION = "Rotterdam";

function requiredNumber(value: number | undefined, name: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
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

function mapApiResponse(body: WeerLiveResponse): WeatherData {
  const current = body.liveweer?.[0];
  const dayForecast = body.wk_verw?.[0];

  if (!current) {
    throw new Error("Weather API response did not contain liveweer[0]");
  }

  if (current.fout) {
    throw new Error(`Weather API error: ${current.fout}`);
  }

  const snapshot: WeatherApiSnapshot = {
    temp: requiredNumber(current.temp, "liveweer[0].temp"),
    gtemp: current.gtemp,
    lv: requiredNumber(current.lv, "liveweer[0].lv"),
    windms: requiredNumber(current.windms, "liveweer[0].windms"),
    windbft: current.windbft,
    windkmh: current.windkmh,
    windknp: current.windknp,
    windr: current.windr,
    windrgr: current.windrgr,
    luchtd: current.luchtd,
    dauwp: requiredNumber(current.dauwp, "liveweer[0].dauwp"),
    zicht: requiredNumber(current.zicht, "liveweer[0].zicht"),
    samenv: current.samenv
  };

  const outdoorFeel = getOutdoorFeel(snapshot);

  return {
    temp: snapshot.temp,
    feelsLike: requiredNumber(current.gtemp, "liveweer[0].gtemp"),
    summary: requiredString(snapshot.samenv, "liveweer[0].samenv"),
    humidity: snapshot.lv,
    windDirection: requiredString(current.windr, "liveweer[0].windr"),
    windBft: requiredNumber(current.windbft, "liveweer[0].windbft"),
    rainChance: requiredNumber(dayForecast?.neersl_perc_dag, "wk_verw[0].neersl_perc_dag"),
    forecast: requiredString(current.verw, "liveweer[0].verw"),
    outdoorFeel
  };
}

async function fetchWeather(): Promise<WeatherData> {
  if (!API_KEY || API_KEY.trim().length === 0) {
    throw new Error("API_KEY is missing in config.js");
  }

  const endpoint = new URL("https://weerlive.nl/api/weerlive_api_v2.php");
  endpoint.searchParams.set("key", API_KEY);
  endpoint.searchParams.set("locatie", LOCATION);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as WeerLiveResponse;
  return mapApiResponse(body);
}

async function main(): Promise<void> {
  const weather = await fetchWeather();
  await mkdir(dirname(WEATHER_FILE_PATH), { recursive: true });
  await writeFile(WEATHER_FILE_PATH, `${JSON.stringify(weather, null, 2)}\n`, "utf8");
  console.log(`Weather data written to ${WEATHER_FILE_PATH}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to fetch weather: ${message}`);
  process.exit(1);
});
