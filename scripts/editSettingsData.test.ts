import { expect, test } from 'vitest';

import type { ChallengeSettings } from '../src/lib/challengeSettings.ts';
import { buildMonthRange, upsertChallengeForRange } from './editSettingsData.ts';

test('prunes past challenges and overwrites an existing range', () => {
  const settings: ChallengeSettings = {
    challenges: [
      {
        start: '2026-01-01',
        end: '2026-01-31',
        label: 'January',
        value: 'Old',
      },
      {
        start: '2026-04-01',
        end: '2026-04-30',
        label: 'April',
        value: 'No Sugar',
      },
    ],
  };

  const updated = upsertChallengeForRange(
    settings,
    {
      start: '2026-04-01',
      end: '2026-04-30',
      label: 'April Reset',
      value: 'No Snacks',
    },
    new Date('2026-03-07T12:00:00Z'),
  );

  expect(updated).toEqual({
    challenges: [
      {
        start: '2026-04-01',
        end: '2026-04-30',
        label: 'April Reset',
        value: 'No Snacks',
      },
    ],
  });
});

test('appends challenge when range does not yet exist', () => {
  const settings: ChallengeSettings = {
    challenges: [
      {
        start: '2026-03-01',
        end: '2026-03-31',
        label: 'March',
        value: 'No Sweets',
      },
    ],
  };

  const updated = upsertChallengeForRange(
    settings,
    {
      start: '2026-04-01',
      end: '2026-04-30',
      label: 'April',
      value: 'No Alcohol',
    },
    new Date('2026-03-07T12:00:00Z'),
  );

  expect(updated).toEqual({
    challenges: [
      {
        start: '2026-03-01',
        end: '2026-03-31',
        label: 'March',
        value: 'No Sweets',
      },
      {
        start: '2026-04-01',
        end: '2026-04-30',
        label: 'April',
        value: 'No Alcohol',
      },
    ],
  });
});

test('buildMonthRange handles leap-year February boundaries', () => {
  const range = buildMonthRange(new Date(Date.UTC(2024, 0, 15)), 1);

  expect(range).toEqual({
    start: '2024-02-01',
    end: '2024-02-29',
    monthLabel: 'February',
    monthYearLabel: 'February 2024',
  });
});

test('buildMonthRange handles 30-day month boundaries', () => {
  const range = buildMonthRange(new Date(Date.UTC(2026, 1, 10)), 2);

  expect(range).toEqual({
    start: '2026-04-01',
    end: '2026-04-30',
    monthLabel: 'April',
    monthYearLabel: 'April 2026',
  });
});
