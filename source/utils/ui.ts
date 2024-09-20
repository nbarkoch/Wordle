export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;
export type Correctness = 'correct' | 'exists' | 'notInUse' | null;

export type WordGuess = {
  letters: string[];
  correctness: Correctness[];
};

// Helper function to darken a hex color
export const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = ((num >> 8) & 0x00ff) - amt,
    B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

export const keyboardInitialKeysState = 'קראטוןםפשדגכעיחלךףזסבהנמצתץ'
  .split('')
  .reduce<Record<string, Correctness>>((acc, letter) => {
    acc[letter] = null;
    return acc;
  }, {});

export const keyboardFormat = {chunks: [8, 10, 9], deleteAtChunkIndex: 0};

export const guessesInitialGridState = (
  maxAttempts: number,
  wordLength: number,
) =>
  Array(maxAttempts)
    .fill(null)
    .map(() => ({
      letters: Array(wordLength).fill(''),
      correctness: Array(wordLength).fill(null),
    }));
