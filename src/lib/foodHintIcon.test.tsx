import { isValidElement } from "react";
import { expect, test } from "vitest";
import { CookingPot, UtensilsCrossed } from "lucide-react";
import { renderFoodHint } from "./foodHintIcon";

test("parses prefixed food hint into label and value", () => {
  const item = renderFoodHint("Meal prep: leek, kale");

  expect(item.label).toBe("Meal prep");
  expect(item.value).toBe("leek, kale");
  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(CookingPot);
  }
});

test("falls back to generic food label when prefix is missing", () => {
  const item = renderFoodHint("Just some text");

  expect(item.label).toBe("Food");
  expect(item.value).toBe("Just some text");
});

test("uses fallback utensil icon for unknown prefixes", () => {
  const item = renderFoodHint("Unexpected: message");

  expect(isValidElement(item.icon)).toBe(true);
  if (isValidElement(item.icon)) {
    expect(item.icon.type).toBe(UtensilsCrossed);
  }
});
