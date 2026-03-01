import { useLayoutEffect, useState, type RefObject } from 'react';

export function useSmartAgendaLimit(
  ref: RefObject<HTMLElement | null>,
  defaultMax: number = 3,
  reducedMax: number = 2,
): number {
  const [limit, setLimit] = useState(defaultMax);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const updateLimit = () => {
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setLimit((currentLimit) => {
        // Keep the reduced limit sticky to avoid 3↔2 oscillation.
        if (currentLimit === reducedMax) {
          return currentLimit;
        }

        if (isOverflowing) {
          return reducedMax;
        }

        return defaultMax;
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
  }, [defaultMax, reducedMax, ref]);

  return limit;
}
