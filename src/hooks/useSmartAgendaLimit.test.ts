import { expect, test } from 'vitest';

import { AGENDA_REDUCTION_STEPS } from './useSmartAgendaLimit';

test('defines the expected overflow reduction sequence', () => {
  expect(AGENDA_REDUCTION_STEPS).toEqual([
    { showFeelLine: true, maxEvents: 3, showSecondFoodLine: true },
    { showFeelLine: false, maxEvents: 3, showSecondFoodLine: true },
    { showFeelLine: false, maxEvents: 2, showSecondFoodLine: true },
    { showFeelLine: false, maxEvents: 1, showSecondFoodLine: true },
    { showFeelLine: false, maxEvents: 1, showSecondFoodLine: false },
    { showFeelLine: false, maxEvents: 0, showSecondFoodLine: false },
  ]);
});

test('step sequence never adds back removed content', () => {
  for (let index = 1; index < AGENDA_REDUCTION_STEPS.length; index += 1) {
    const previous = AGENDA_REDUCTION_STEPS[index - 1];
    const current = AGENDA_REDUCTION_STEPS[index];

    if (!previous.showFeelLine) {
      expect(current.showFeelLine).toBe(false);
    }
    expect(current.maxEvents).toBeLessThanOrEqual(previous.maxEvents);
    if (!previous.showSecondFoodLine) {
      expect(current.showSecondFoodLine).toBe(false);
    }
  }
});
