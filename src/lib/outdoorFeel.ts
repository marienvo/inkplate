export type WeatherApiSnapshot = {
  temp: number; // Air temperature (degC)
  gtemp?: number; // Ground temperature (degC), optional
  lv: number; // Relative humidity (%)
  windms: number; // Wind speed (m/s)
  windbft?: number;
  windkmh?: number;
  windknp?: number;
  windr?: string; // Wind direction label (e.g. "ZZW")
  windrgr?: number; // Wind direction degrees
  luchtd?: number; // Pressure hPa
  dauwp: number; // Dew point (degC)
  zicht: number; // Visibility (meters)
  samenv?: string; // Summary text (Dutch)
};

export type OutdoorFeel = {
  feelsLikeC: number;
  feelText: string; // One-liner for UI
  chips: string[]; // Short tags/chips
  details: {
    humidityFeel: string;
    visibilityFeel: string;
    windFeel: string;
    condensationRisk: "Low" | "Medium" | "High";
    frostOrSlipHint: "None" | "Possible" | "Likely";
  };
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Vapor pressure (hPa) from dew point (degC)
function vaporPressureFromDewPoint(dewPointC: number): number {
  // Magnus formula
  return 6.105 * Math.exp((17.27 * dewPointC) / (237.7 + dewPointC));
}

// Apparent Temperature (Steadman), used by BOM (Australia) style
// AT = T + 0.33*e - 0.70*ws - 4.00
function apparentTemperatureC(tempC: number, dewPointC: number, windMs: number): number {
  const e = vaporPressureFromDewPoint(dewPointC);
  return tempC + 0.33 * e - 0.7 * windMs - 4.0;
}

// Wind Chill (Environment Canada / NWS). Valid when T <= 10degC and wind > 1.34 m/s.
function windChillC(tempC: number, windMs: number): number {
  const windKmh = windMs * 3.6;
  return (
    13.12 +
    0.6215 * tempC -
    11.37 * Math.pow(windKmh, 0.16) +
    0.3965 * tempC * Math.pow(windKmh, 0.16)
  );
}

// Heat Index (NOAA). Typically valid for T >= 27degC and RH >= 40%.
function heatIndexC(tempC: number, relativeHumidity: number): number {
  // Convert to Fahrenheit for the NOAA regression, then back.
  const tF = (tempC * 9) / 5 + 32;
  const rh = relativeHumidity;

  const hiF =
    -42.379 +
    2.04901523 * tF +
    10.14333127 * rh -
    0.22475541 * tF * rh -
    0.00683783 * tF * tF -
    0.05481717 * rh * rh +
    0.00122874 * tF * tF * rh +
    0.00085282 * tF * rh * rh -
    0.00000199 * tF * tF * rh * rh;

  // Adjustment terms (NOAA)
  let adjustedHiF = hiF;
  if (rh < 13 && tF >= 80 && tF <= 112) {
    adjustedHiF -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
  } else if (rh > 85 && tF >= 80 && tF <= 87) {
    adjustedHiF += ((rh - 85) / 10) * ((87 - tF) / 5);
  }

  return ((adjustedHiF - 32) * 5) / 9;
}

function humidityFeelFromDewPoint(dewPointC: number): string {
  if (dewPointC < 0) return "Very dry";
  if (dewPointC < 7) return "Dry";
  if (dewPointC < 13) return "Comfortable";
  if (dewPointC < 16) return "Slightly muggy";
  if (dewPointC < 19) return "Muggy";
  return "Sticky";
}

function windFeelFromMs(windMs: number): string {
  if (windMs < 1.5) return "Calm";
  if (windMs < 5) return "Light breeze";
  if (windMs < 9) return "Breezy";
  if (windMs < 14) return "Windy";
  return "Very windy";
}

function visibilityFeelFromMeters(visibilityMeters: number, spreadC: number): string {
  // Base on visibility, then nudge worse if air near saturation (low spread).
  let label: "Crystal clear" | "Clear" | "Hazy" | "Misty" | "Dense fog";
  if (visibilityMeters < 500) label = "Dense fog";
  else if (visibilityMeters < 2000) label = "Misty";
  else if (visibilityMeters < 10000) label = "Hazy";
  else if (visibilityMeters < 20000) label = "Clear";
  else label = "Crystal clear";

  if (spreadC <= 2) {
    if (label === "Crystal clear") label = "Clear";
    else if (label === "Clear") label = "Hazy";
    else if (label === "Hazy") label = "Misty";
  }
  return label;
}

function condensationRiskFromSpread(spreadC: number): "Low" | "Medium" | "High" {
  if (spreadC <= 1) return "High";
  if (spreadC <= 3) return "Medium";
  return "Low";
}

function frostOrSlipHint(
  tempC: number,
  groundTempC: number | undefined,
  dewPointC: number
): "None" | "Possible" | "Likely" {
  // Ground temp helps a lot; otherwise use air temp and dew point.
  const gt = groundTempC ?? tempC;
  const spread = tempC - dewPointC;

  if (gt <= 0 && spread <= 2) return "Likely";
  if (gt <= 1 || (tempC <= 1 && spread <= 3)) return "Possible";
  return "None";
}

export function getOutdoorFeel(snapshot: WeatherApiSnapshot): OutdoorFeel {
  const tempC = snapshot.temp;
  const dewPointC = snapshot.dauwp;
  const rh = clamp(snapshot.lv, 0, 100);
  const windMs = Math.max(0, snapshot.windms);
  const spread = tempC - dewPointC;

  const condensationRisk = condensationRiskFromSpread(spread);
  const humidityFeel = humidityFeelFromDewPoint(dewPointC);
  const windFeel = windFeelFromMs(windMs);
  const visibilityFeel = visibilityFeelFromMeters(snapshot.zicht, spread);
  const frostHint = frostOrSlipHint(tempC, snapshot.gtemp, dewPointC);

  // Pick best feels-like model for the conditions.
  let feelsLike = apparentTemperatureC(tempC, dewPointC, windMs);
  const canUseWindChill = tempC <= 10 && windMs > 1.34;
  const canUseHeatIndex = tempC >= 27 && rh >= 40;

  if (canUseWindChill) feelsLike = windChillC(tempC, windMs);
  if (canUseHeatIndex) feelsLike = heatIndexC(tempC, rh);

  feelsLike = round1(feelsLike);

  // Build UI text
  const chips: string[] = [];

  // Thermal description based on feels-like
  let thermal: string;
  if (feelsLike <= 0) thermal = "Freezing";
  else if (feelsLike <= 5) thermal = "Cold";
  else if (feelsLike <= 12) thermal = "Cool";
  else if (feelsLike <= 18) thermal = "Mild";
  else if (feelsLike <= 25) thermal = "Warm";
  else if (feelsLike <= 30) thermal = "Hot";
  else thermal = "Very hot";

  chips.push(thermal);
  chips.push(humidityFeel);
  chips.push(windFeel);
  chips.push(visibilityFeel);

  if (condensationRisk === "High") chips.push("Mist/condensation risk");
  if (frostHint !== "None") chips.push(frostHint === "Likely" ? "Slip risk likely" : "Slip risk possible");

  // One-liner (keep it short for UI)
  const feelText =
    `${thermal}, ${humidityFeel.toLowerCase()}, ${windFeel.toLowerCase()}` +
    (condensationRisk === "High" ? ". Air is near saturation." : "") +
    (frostHint !== "None" ? " Watch for slippery spots." : "");

  // If you want to surface original Dutch summary as a secondary line:
  // snapshot.samenv could be shown separately.

  return {
    feelsLikeC: feelsLike,
    feelText,
    chips,
    details: {
      humidityFeel,
      visibilityFeel,
      windFeel,
      condensationRisk,
      frostOrSlipHint: frostHint
    }
  };
}
