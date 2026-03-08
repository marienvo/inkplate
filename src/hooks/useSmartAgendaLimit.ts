import { useLayoutEffect, useState, type RefObject } from 'react';

export type LayoutConstraints = {
  showFeelLine: boolean;
  maxEvents: number;
  showSecondFoodLine: boolean;
};

export const AGENDA_REDUCTION_STEPS: readonly LayoutConstraints[] = [
  { showFeelLine: true, maxEvents: 3, showSecondFoodLine: true },
  { showFeelLine: false, maxEvents: 3, showSecondFoodLine: true },
  { showFeelLine: false, maxEvents: 2, showSecondFoodLine: true },
  { showFeelLine: false, maxEvents: 1, showSecondFoodLine: true },
  { showFeelLine: false, maxEvents: 1, showSecondFoodLine: false },
  { showFeelLine: false, maxEvents: 0, showSecondFoodLine: false },
];

export function useSmartAgendaLimit(ref: RefObject<HTMLElement | null>): LayoutConstraints {
  const [stepIndex, setStepIndex] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const updateLimit = () => {
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setStepIndex((currentStepIndex) => {
        if (isOverflowing && currentStepIndex < AGENDA_REDUCTION_STEPS.length - 1) {
          return currentStepIndex + 1;
        }
        return currentStepIndex;
      });
    };

    updateLimit();

    const resizeObserver = new ResizeObserver(() => {
      // Defer to the next frame so we measure after layout settles.
      requestAnimationFrame(updateLimit);
    });
    resizeObserver.observe(element);
    window.addEventListener('resize', updateLimit);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateLimit);
    };
  }, [ref]);

  return AGENDA_REDUCTION_STEPS[Math.min(stepIndex, AGENDA_REDUCTION_STEPS.length - 1)];
}
