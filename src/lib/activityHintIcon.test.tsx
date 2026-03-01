import { isValidElement, type ReactElement } from 'react';
import { expect, test } from 'vitest';
import { Home, Sun } from 'lucide-react';
import { renderActivityHint } from './activityHintIcon';
import { ACTIVITY_HINTS } from './activityHints';

test('returns text as-is for unknown hints', () => {
  const result = renderActivityHint('Some unknown hint');
  expect(result).toBe('Some unknown hint');
});

test('renders icon + label for known hints', () => {
  const result = renderActivityHint(ACTIVITY_HINTS.INDOOR_DAY);

  expect(isValidElement(result)).toBe(true);
  if (isValidElement(result)) {
    const typedResult = result as ReactElement<{
      className: string;
      children: [unknown, unknown];
    }>;
    expect(typedResult.type).toBe('span');
    expect(typedResult.props.className).toBe('activity-hint');
    const children = typedResult.props.children;
    const iconNode = children[0];

    expect(isValidElement(iconNode)).toBe(true);
    if (isValidElement(iconNode)) {
      expect(iconNode.type).toBe(Home);
    }
  }
});

test('renders primary icon when hint includes other-day suffix', () => {
  const result = renderActivityHint(
    `${ACTIVITY_HINTS.GOLDEN_DAY} (${ACTIVITY_HINTS.OTHER_DAY_STORMY})`,
  );

  expect(isValidElement(result)).toBe(true);
  if (isValidElement(result)) {
    const typedResult = result as ReactElement<{
      className: string;
      children: [unknown, unknown];
    }>;
    expect(typedResult.type).toBe('span');
    const children = typedResult.props.children;
    const iconNode = children[0];

    expect(isValidElement(iconNode)).toBe(true);
    if (isValidElement(iconNode)) {
      expect(iconNode.type).toBe(Sun);
    }
  }
});
