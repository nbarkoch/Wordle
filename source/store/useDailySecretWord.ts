import {useCallback, useMemo} from 'react';
import general5 from '~/database/all_5.json';
import {Correctness} from '~/utils/ui';

type WordHandle = {
  selectedWord: string;
  about: string;
};

function getDailyWord(): WordHandle {
  // Combine easy and medium words
  const wordPool: Record<string, string> = {
    ...general5.easy,
    ...general5.medium,
  };

  // Get today's date and create a seed
  const today = new Date();
  const dateString = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  // Create a deterministic hash from the date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
    // eslint-disable-next-line no-bitwise
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Get all possible words
  const words = Object.keys(wordPool);

  // Use the hash to select today's word
  const index = Math.abs(hash) % words.length;
  const selectedWord = words[index];

  return {
    selectedWord,
    about: wordPool[selectedWord],
  };
}

function useDailySecretWord() {
  // Get the daily word - memoize it so it doesn't change during the session
  const dailyWord = useMemo(() => getDailyWord(), []);

  const evaluateGuess = useCallback(
    (guess: string): Correctness[] => {
      const wordLength = 5; // Always 5 for daily word
      const evaluation: Correctness[] = Array(wordLength).fill('notInUse');
      const secretLetters: (string | null)[] = dailyWord.selectedWord.split('');
      const guessLetters: (string | null)[] = guess.split('');

      // First pass: Identify correct letters
      for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] === secretLetters[i]) {
          evaluation[i] = 'correct';
          secretLetters[i] = guessLetters[i] = null;
        }
      }

      // Second pass: Identify misplaced letters
      for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] && secretLetters.includes(guessLetters[i])) {
          evaluation[i] = 'exists';
          secretLetters[secretLetters.indexOf(guessLetters[i])] = null;
        }
      }

      return evaluation;
    },
    [dailyWord],
  );

  return {
    secretWord: dailyWord.selectedWord,
    hint: dailyWord.about,
    evaluateGuess,
  };
}

// Utility function to get word for a specific date (useful for testing)
export function getWordForDate(date: Date): WordHandle {
  const currentImplementation = getDailyWord;

  // Override the Date object temporarily
  const OriginalDate = global.Date;
  (global as any).Date = class extends Date {
    constructor() {
      super();
      return date;
    }
  };

  const result = currentImplementation();

  // Restore the original Date object
  (global as any).Date = OriginalDate;

  return result;
}

export default useDailySecretWord;
