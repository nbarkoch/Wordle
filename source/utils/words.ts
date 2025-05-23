export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;
export type Correctness = 'correct' | 'exists' | 'notInUse' | null;

export type WordGuess = {
  letters: string[];
  correctness: Correctness[];
};
export type LetterCellLocation = {rowIndex: number; colIndex: number};

export type LineHint = {letters: string[]; correctness: (Correctness | null)[]};

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
    const currentGuess = guesses[letter.rowIndex];
    const letterCorrectness = currentGuess.correctness[letter.colIndex];
    const letterValue = mapSuffix(currentGuess.letters[letter.colIndex]) ?? '';

    // Early return for "notInUse" case
    if (letterCorrectness === 'notInUse') {
      resolve({
        letters: Array(wordLength).fill(''),
        correctness: Array(wordLength).fill(null),
      });
      return;
    }

    const letterNotTherePositions = new Set<number>();
    const letterWasTherePositions = new Set<number>();

    // Process all guesses to find constraints
    guesses.forEach(guess => {
      guess.correctness.forEach((correctness, i) => {
        if (correctness === 'correct') {
          letterNotTherePositions.add(i);
          // If that correct letter is our target letter, remember this position
          if (mapSuffix(guess.letters[i]) === letterValue) {
            letterWasTherePositions.add(i);
          }
        } else if (
          mapSuffix(guess.letters[i]) === letterValue &&
          (correctness === 'exists' || correctness === 'notInUse')
        ) {
          letterNotTherePositions.add(i);
        }
      });
    });

    // Determine if this is a single-position case
    const correctOccurrences = currentGuess.letters.filter(
      (l, i) =>
        mapSuffix(l) === letterValue &&
        currentGuess.correctness[i] === 'correct',
    ).length;

    const isSingle =
      letterWasTherePositions.size === correctOccurrences &&
      wordLength - letterNotTherePositions.size <= 1;

    const line = {
      letters: Array(wordLength)
        .fill('')
        .map((_, i) => (!letterNotTherePositions.has(i) ? letterValue : '')),
      correctness: Array(wordLength)
        .fill(null)
        .map((_, i) =>
          !letterNotTherePositions.has(i)
            ? isSingle
              ? 'correct'
              : 'exists'
            : null,
        ),
    };

    resolve(line);
  });
}

export const suffixLetterMapper: Record<string, string> = {
  ן: 'נ',
  ם: 'מ',
  ף: 'פ',
  ך: 'כ',
  ץ: 'צ',
};

export const suffixOriginalLetterMapper: Record<string, string> = {
  נ: 'ן',
  מ: 'ם',
  פ: 'ף',
  כ: 'ך',
  צ: 'ץ',
};

export const suffixLetters = ['ן', 'ם', 'ף', 'ך', 'ץ'];

export const mapSuffix = (letter: string | null): string | null => {
  return letter ? suffixLetterMapper[letter] ?? letter : null;
};

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
