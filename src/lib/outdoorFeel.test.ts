import { expect, test } from 'vitest';
import { getOutdoorFeel, type WeatherApiSnapshot } from './outdoorFeel';

function baseSnapshot(overrides: Partial<WeatherApiSnapshot> = {}): WeatherApiSnapshot {
  return {
    temp: 10,
    gtemp: 10,
    lv: 60,
    windms: 2,
    dauwp: 6,
    zicht: 12000,
    ...overrides,
  };
}

test('applies wind chill for cold and windy conditions', () => {
  const result = getOutdoorFeel(
    baseSnapshot({
      temp: 2,
      windms: 10,
      lv: 70,
      dauwp: 0,
    }),
  );

  expect(result.feelsLikeC).toBeLessThan(0);
  expect(result.chips).toContain('Windy');
});

test('applies heat index for hot and humid conditions', () => {
  const result = getOutdoorFeel(
    baseSnapshot({
      temp: 30,
      lv: 80,
      windms: 1.5,
      dauwp: 24,
    }),
  );

  expect(result.feelsLikeC).toBeGreaterThan(30);
  expect(result.details.humidityFeel).toBe('Sticky');
  expect(result.feelText.toLowerCase()).toContain('sticky');
});

test('marks likely slip risk for freezing ground and near saturation air', () => {
  const result = getOutdoorFeel(
    baseSnapshot({
      temp: 0,
      gtemp: -1,
      dauwp: -1,
      lv: 95,
      windms: 1,
    }),
  );

  expect(result.details.frostOrSlipHint).toBe('Likely');
  expect(result.chips).toContain('Slip risk likely');
});
