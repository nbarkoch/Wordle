import {useRef} from 'react';

function randomRange(num1: number, num2: number): number {
  const min = Math.ceil(Math.min(num1, num2));
  const max = Math.floor(Math.max(num1, num2));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Hook for managing ad display frequency in games
 *
 * @param frequency How many games to play before showing an ad (default: 3)
 * @returns Object with functions to manage ad counter
 */
export const useAdCounter = () => {
  const gameCountRef = useRef<number>(0);
  const frequencyRef = useRef<number>(randomRange(1, 3));

  /**
   * Check if an ad should be shown and update the counter accordingly
   * @returns {boolean} True if an ad should be shown
   */
  const shouldShowAd = () => {
    // Check if we should show an ad based on the frequency
    const shouldShow = gameCountRef.current >= frequencyRef.current - 1;

    if (shouldShow) {
      // Reset the counter if we're showing an ad
      gameCountRef.current = 0;
    } else {
      // Otherwise increment the counter
      gameCountRef.current += 1;
    }

    return shouldShow;
  };

  /**
   * Reset the game counter
   */
  const resetCounter = () => {
    gameCountRef.current = 0;
    frequencyRef.current = randomRange(1, 3);
  };

  return {
    shouldShowAd,
    resetCounter,
    currentCount: () => gameCountRef.current,
  };
};
