export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;
export type Correctness = 'correct' | 'exists' | 'notInUse' | null;

export type WordGuess = {
  letters: string[];
  correctness: Correctness[];
};
export type LetterCellLocation = {rowIndex: number; colIndex: number};

export type LineHint = {letters: string[]; correctness: (Correctness | null)[]};

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

export async function calculateHintForLetter(
  guesses: WordGuess[],
  letter: LetterCellLocation,
): Promise<LineHint> {
  return new Promise(resolve => {
    const wordLength = guesses[0].letters.length;
    const letterCorrectness =
      guesses[letter.rowIndex].correctness[letter.colIndex];

    const letterValue = guesses[letter.rowIndex].letters[letter.colIndex];
    // 1. finding all greens letters
    // 2. find all places where we see the letter yellow
    // 3. infer where it could be remain
    const letterNotTherePositions: number[] = [];
    if (letterCorrectness === 'notInUse') {
      resolve({
        letters: Array(wordLength).fill(''),
        correctness: Array(wordLength).fill(null),
      });
    }

    guesses.forEach(guess => {
      guess.correctness.forEach((correctness, i) => {
        if (correctness === 'correct' && !letterNotTherePositions.includes(i)) {
          letterNotTherePositions.push(i);
        } else if (
          guess.letters[i] === letterValue &&
          (correctness === 'exists' || correctness === 'notInUse') &&
          !letterNotTherePositions.includes(i)
        ) {
          letterNotTherePositions.push(i);
        }
      });
    });

    const line = {
      letters: Array(wordLength)
        .fill(letterValue)
        .map((l, i) =>
          letterNotTherePositions.find(j => j === i) !== undefined ? '' : l,
        ),
      correctness: Array(wordLength)
        .fill('exists')
        .map((c, i) => {
          const found = letterNotTherePositions.find(j => j === i);
          const isSingle =
            letterCorrectness === 'exists' &&
            wordLength - letterNotTherePositions.length <= 1;

          return found !== undefined ? null : isSingle ? 'correct' : c;
        }),
    };
    resolve(line);
  });
}
