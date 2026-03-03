# Weather Vibes Spec

This spec defines how weather maps to recipe vibes and how recipes should be tagged so AI can safely add new recipes to the system.

## Purpose

- Add more nuance than the old binary `indoor`/`outdoor` model.
- Support three cooking moods:
  - rainy/stormy days: cozy and aromatic cooking
  - broad in-between weather: hearty everyday cooking
  - genuinely pleasant days: quick, fresh cooking
- Keep recipe selection deterministic and robust with an `any` fallback.

## Canonical Vibe Values

Use only these values for `Recipe.vibe` and `WeatherVibe`:

- `cozy`
- `hearty`
- `fresh`
- `any`

Do not introduce synonyms (for example `indoor`, `outdoor`, `comfort`, `light`).

## Vibe Semantics

| Vibe     | Weather profile               | Cooking character                                      | Typical examples                                        |
| -------- | ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| `cozy`   | Heavy rain, storm, cold + wet | Slow, aromatic, warming; good for homey cooking smells | soups, stews, gratins, pies, crumbles                   |
| `hearty` | Cool/windy/wet middle ground  | Solid, warming, moderate effort everyday meals         | pasta, curries, braises, mash, stir-fries               |
| `fresh`  | Dry, mild/warm, low wind      | Fast, easy, fresh prep; minimal kitchen heat/time      | salads, chilled dishes, light traybakes, assembly meals |
| `any`    | All weather                   | Works year-round and across weather states             | baseline versatile dishes                               |

## Weather-to-Vibe Mapping

`getWeatherVibe(day)` in `src/config/foodRules.ts` is the source of truth for weather classification.

### Rules

1. Return `cozy` when weather is truly miserable:
   - `rainChance >= 80`, or
   - `rainChance >= 55 && windbft >= 7`, or
   - `windbft >= 7 && feelsLike <= 5`, or
   - `rainChance >= 55 && feelsLike <= 5`
2. Return `fresh` when weather is genuinely pleasant:
   - `rainChance < 30 && feelsLike > 14 && windbft <= 4`
3. Return `hearty` for all remaining conditions.

## Recipe Tagging Rules

When adding or modifying recipes:

1. Pick exactly one vibe from `cozy | hearty | fresh | any`.
2. Use `cozy` for long, aromatic, comfort-style dishes.
3. Use `hearty` for warming but practical everyday meals that fit mixed weather.
4. Use `fresh` for quick, light, low-friction cooking suitable for nice weather.
5. Use `any` only when the recipe truly works in all weather contexts.

## Required Invariants

These invariants must remain true:

1. Every seasonal vegetable key in `SEASONAL_NL` has at least one `SAVORY_RECIPES` entry with `vibe: 'any'`.
2. Every seasonal fruit key in `SEASONAL_NL_FRUIT` has at least one `EXTRA_RECIPES` entry with `vibe: 'any'`.
3. `matchingRecipes` in `src/lib/food.ts` must keep allowing:
   - exact vibe match, or
   - `any` match.
4. New vibe values must be reflected in tests (`src/lib/food.test.ts`).

## Weight Guidance

- Keep `weight` as a relative preference within the same ingredient + vibe candidate set.
- Start at `1` for new recipes unless there is a clear reason to bias frequency.
- Use higher weights sparingly and intentionally to avoid over-repeating a dish.

## AI Checklist For Recipe Changes

Before finalizing recipe updates:

1. Confirm vibe labels use only canonical values.
2. Confirm `any` coverage invariants are still satisfied.
3. Confirm at least one test path covers the updated vibe behavior.
4. Run format, lint, typecheck, and tests.
