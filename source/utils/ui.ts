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

export function rgbaToHex(rgba: string) {
  // Use a regular expression to extract the rgba values
  const result = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

  if (!result) {
    throw new Error('Invalid RGBA format');
  }

  const r = parseInt(result[1], 10);
  const g = parseInt(result[2], 10);
  const b = parseInt(result[3], 10);
  const a = parseFloat(result[4]);

  // Helper function to convert a number to a two-digit hex
  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Convert the alpha to a two-digit hex value (from 0-255)
  const alpha = Math.round(a * 255);

  // Return the formatted hex color
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
}

/**
 * Sets the opacity of a color string (hex or rgba).
 * @param {string} color - The color string (hex or rgba).
 * @param {number} opacity - The opacity value (0 to 1).
 * @returns {string} The color string with the new opacity.
 */
export function setColorOpacity(color: string, opacity: number) {
  // Check if the color is in hex format
  if (color.startsWith('#')) {
    color = color.replace('#', '');
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (color.length === 3) {
      color = color
        .split('')
        .map(char => char + char)
        .join('');
    }
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    return rgbaToHex(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  // Check if the color is in rgba format
  const rgbaMatch = color.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/,
  );
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return rgbaToHex(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  // If the color format is not recognized, return the original color
  console.warn('Unrecognized color format. Returning original color.');
  return color;
}

export const lightenColor = (color: string, percent: number): string => {
  // Remove the hash if it exists
  color = color.replace('#', '');

  let R, G, B, A;

  if (color.length === 8) {
    // Color has opacity
    R = parseInt(color.slice(0, 2), 16);
    G = parseInt(color.slice(2, 4), 16);
    B = parseInt(color.slice(4, 6), 16);
    A = color.slice(6, 8);
  } else if (color.length === 6) {
    // Color doesn't have opacity
    R = parseInt(color.slice(0, 2), 16);
    G = parseInt(color.slice(2, 4), 16);
    B = parseInt(color.slice(4, 6), 16);
  } else {
    throw new Error('Invalid hex color format');
  }

  // Calculate the lightening effect
  const amt = Math.round(2.55 * percent);
  R = Math.min(255, Math.max(0, R + amt));
  G = Math.min(255, Math.max(0, G + amt));
  B = Math.min(255, Math.max(0, B + amt));

  // Convert back to hex
  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  // Return the result with or without opacity
  return A ? `#${RR}${GG}${BB}${A}` : `#${RR}${GG}${BB}`;
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

function shuffleAndSplit(str: string): string[] {
  // Convert the string into an array of characters
  const charArray = str.split('');

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [charArray[i], charArray[j]] = [charArray[j], charArray[i]]; // Swap elements
  }
  return charArray;
}

export function mergeHints(
  hint1: LineHint | undefined,
  hint2: LineHint | undefined,
): LineHint | undefined {
  if (hint1 === undefined) {
    return hint2;
  }
  if (hint2 === undefined) {
    return hint1;
  }

  const mergedCorLet: {letter: string; correctness: Correctness}[] =
    hint1.correctness.map((c, i) => {
      if (c === 'correct') {
        return {letter: hint1.letters[i], correctness: 'correct'};
      } else if (hint2.correctness[i] === 'correct') {
        return {letter: hint2.letters[i], correctness: 'correct'};
      }
      if (c === 'exists') {
        return {letter: hint1.letters[i], correctness: 'exists'};
      } else if (hint2.correctness[i] === 'exists') {
        return {letter: hint2.letters[i], correctness: 'exists'};
      }
      if (c === 'notInUse') {
        return {letter: hint1.letters[i], correctness: 'notInUse'};
      } else if (hint2.correctness[i] === 'notInUse') {
        return {letter: hint2.letters[i], correctness: 'notInUse'};
      }
      return {letter: '', correctness: null};
    });

  if (mergedCorLet.filter(cor => cor.correctness === 'exists').length === 1) {
    const index = mergedCorLet.findIndex(cor => cor.correctness === 'exists');
    if (
      mergedCorLet.filter(cor => cor.letter === mergedCorLet[index].letter)
        .length === 1
    ) {
      mergedCorLet[index].correctness = 'correct';
    }
  }

  return {
    letters: mergedCorLet.map(cor => cor.letter),
    correctness: mergedCorLet.map(cor => cor.correctness),
  };
}

export async function giveHint(
  secretWord: string,
  guesses: WordGuess[],
  lineHint?: LineHint,
): Promise<LineHint> {
  return new Promise(resolve => {
    const reveals = Array(secretWord.length).fill(null);
    const maxReveal = 2;
    guesses.forEach(guess => {
      guess.correctness.forEach((correctness, i) => {
        if (correctness === 'correct') {
          reveals[i] = false;
        }
      });
    });
    lineHint?.correctness.forEach((correctness, i) => {
      if (correctness === 'correct') {
        reveals[i] = false;
      }
    });

    secretWord.split('').forEach((_, i) => {
      if (reveals[i] === null) {
        reveals[i] = reveals[i] || true;
      } else {
        reveals[i] = reveals[i] || false;
      }
    });

    const revealedLetters = secretWord
      .split('')
      .map((l, i) => (reveals[i] ? l : ''));

    let letterRevealed = revealedLetters.filter(l => l !== '').length;
    shuffleAndSplit(secretWord).forEach(w => {
      if (letterRevealed <= maxReveal) {
        return;
      }
      const indexToRemove = revealedLetters.findIndex(l => w === l);
      revealedLetters[indexToRemove] = '';
      letterRevealed = revealedLetters.filter(l => l !== '').length;
    });

    resolve({
      letters: revealedLetters,
      correctness: revealedLetters.map(l => (l === '' ? null : 'correct')),
    });
  });
}

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

export async function calculateHintForAllLetters(guesses: WordGuess[]) {
  const lettersMap: Record<string, number[]> = {};

  guesses.forEach(guess => {
    guess.correctness.forEach((correctness, i) => {
      'קראטוןםפשדגכעיחלךףזסבהנמצתץ'.split('').forEach(l => {
        if (correctness === 'correct' && !lettersMap[l]?.includes(i)) {
          lettersMap[l].push(i);
        } else if (
          guess.letters[i] === l &&
          (correctness === 'exists' || correctness === 'notInUse') &&
          !lettersMap[l]?.includes(i)
        ) {
          lettersMap[l].push(i);
        }
      });
    });
  });
  return lettersMap;
}
