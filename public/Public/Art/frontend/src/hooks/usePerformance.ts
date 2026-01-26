import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook to track component render count
 */
export function useRenderCount() {
  const renders = useRef(0);
  
  useEffect(() => {
    renders.current += 1;
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Render count:', renders.current);
  }

  return renders.current;
}

/**
 * Hook to track component performance
 */
export function usePerformance(componentName: string) {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 16.67) {
        console.warn(`${componentName} took longer than 60fps target (16.67ms)`);
      }
    }

    renderStart.current = performance.now();
  });
}

/**
 * Hook for memoizing expensive computations
 */
export function useMemoCompare<T>(
  next: T,
  compare: (previous: T | undefined, next: T) => boolean
): T {
  const previousRef = useRef<T>();
  const previous = previousRef.current;

  const isEqual = compare(previous, next);

  useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });

  return isEqual && previous !== undefined ? previous : next;
}

/**
 * Hook for detecting slow renders
 */
export function useSlowRenderDetector(threshold = 100) {
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();

    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        if (renderTime > threshold) {
          console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
}

import { useState } from 'react';
