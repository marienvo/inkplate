import { isValidElement } from 'react';
import { expect, test } from 'vitest';
import { Cookie, CookingPot, IceCreamCone, Soup, UtensilsCrossed } from 'lucide-react';
import { renderFoodHint, splitFoodValueWrapGroups } from './foodHintIcon';

test('detects Crumble keyword with Cookie icon', () => {
  const item = renderFoodHint('Apple Crumble');

  expect(item.label).toBe('Crumble');
  expect(item.value).toBe('Apple Crumble');
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(Cookie);
  }
});

test('detects Stew keyword with Soup icon', () => {
  const item = renderFoodHint('Carrot and Lentil Stew');

  expect(item.label).toBe('Stew');
  expect(item.value).toBe('Carrot and Lentil Stew');
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(Soup);
  }
});

test('detects Pasta keyword with CookingPot icon', () => {
  const item = renderFoodHint('Creamy Leek Pasta with Nutritional Yeast');

  expect(item.label).toBe('Pasta');
  expect(item.value).toBe('Creamy Leek Pasta with Nutritional Yeast');
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(CookingPot);
  }
});

test('detects Italian pasta names with CookingPot icon', () => {
  const item = renderFoodHint("Penne all'Arrabbiata");

  expect(item.label).toBe('Pasta');
  expect(item.value).toBe("Penne all'Arrabbiata");
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(CookingPot);
  }
});

test('detects Fresco keyword as Frozen with IceCream icon', () => {
  const item = renderFoodHint('Caju Fresco');

  expect(item.label).toBe('Frozen');
  expect(item.value).toBe('Caju Fresco');
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(IceCreamCone);
  }
});

test('falls back to Food label for unknown text without colon', () => {
  const item = renderFoodHint('Just some text');

  expect(item.label).toBe('Recipe');
  expect(item.value).toBe('Just some text');
});

test('uses fallback utensil icon for unknown colon-prefixed hints', () => {
  const item = renderFoodHint('Unexpected: message');

  expect(item.label).toBe('Unexpected');
  expect(item.value).toBe('message');
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(UtensilsCrossed);
  }
});

test('groups connector phrase with following capitalized words', () => {
  const groups = splitFoodValueWrapGroups('Beet and Walnut Dip with Flatbread');
  expect(groups).toEqual(['Beet', 'and Walnut Dip', 'with Flatbread']);
});

test('keeps fully capitalized run together as one group', () => {
  const groups = splitFoodValueWrapGroups('Simple Apple Cake');
  expect(groups).toEqual(['Simple Apple Cake']);
});
