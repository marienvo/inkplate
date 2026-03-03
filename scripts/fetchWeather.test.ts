import { expect, test } from 'vitest';

import { getFoodWeekKey } from './fetchWeather.ts';

test('uses the same week key from monday through saturday', () => {
  const monday = new Date('2026-03-02T10:00:00');
  const saturday = new Date('2026-03-07T22:00:00');

  expect(getFoodWeekKey(monday)).toBe('2026-03-07');
  expect(getFoodWeekKey(saturday)).toBe('2026-03-07');
});

test('switches to next week key on sunday', () => {
  const sunday = new Date('2026-03-08T08:00:00');

  expect(getFoodWeekKey(sunday)).toBe('2026-03-14');
});

test('keeps next-week key stable during the week after sunday', () => {
  const sunday = new Date('2026-03-08T08:00:00');
  const friday = new Date('2026-03-13T18:30:00');

  expect(getFoodWeekKey(friday)).toBe(getFoodWeekKey(sunday));
});
