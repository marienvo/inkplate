import { isValidElement, type ReactElement } from "react";
import { expect, test } from "vitest";
import { Home } from "lucide-react";
import { renderActivityHint } from "./activity-hint-icon";

test("returns text as-is for unknown hints", () => {
  const result = renderActivityHint("Some unknown hint");
  expect(result).toBe("Some unknown hint");
});

test("renders icon + label for known hints", () => {
  const result = renderActivityHint("Indoor day");

  expect(isValidElement(result)).toBe(true);
  if (isValidElement(result)) {
    const typedResult = result as ReactElement<{
      className: string;
      children: [unknown, unknown];
    }>;
    expect(typedResult.type).toBe("span");
    expect(typedResult.props.className).toBe("activity-hint");
    const children = typedResult.props.children;
    const iconNode = children[0];

    expect(isValidElement(iconNode)).toBe(true);
    if (isValidElement(iconNode)) {
      expect(iconNode.type).toBe(Home);
    }
  }
});
