import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion.
 * Respects the `prefers-reduced-motion` CSS media feature.
 * 
 * @returns {boolean} True if user prefers reduced motion
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * 
 * // Use in animations
 * <motion.div
 *   animate={{ x: prefersReducedMotion ? 0 : 100 }}
 *   transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
 * />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if we're on the server
    if (typeof window === 'undefined') {
      return false;
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation duration based on user's motion preference.
 * Returns 0 if user prefers reduced motion, otherwise returns the provided duration.
 * 
 * @param duration - The animation duration in milliseconds
 * @returns The adjusted duration
 */
export function useAnimationDuration(duration: number): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : duration;
}

/**
 * Get animation config that respects reduced motion preference.
 * Useful for animation libraries like Framer Motion.
 * 
 * @returns Animation configuration object
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : undefined,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : undefined,
    initial: prefersReducedMotion ? false : undefined,
  };
}
