import {useCallback, useEffect, useState} from 'react';

import {Correctness, mapSuffix} from '~/utils/words';

import general5 from '~/database/all_5.json';

import {Difficulty, GameCategory} from '~/utils/types';
import {loadGame} from './gameStorageState';
import {wordList} from '~/utils/db';
import {getStoredWords} from './revealsStore';

type WordHandle = {selectedWord: string; about: string};

function getDailyWord(): WordHandle {
  // Combine easy and medium words
  const wordPool: Record<string, string> = {
    ...general5.easy,
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

const newSecretWord = async (
  wordLength: number,
  category: GameCategory,
  difficulty: Difficulty,
): Promise<WordHandle> => {
  const validWords = wordList[category][wordLength][difficulty];
  const words = Object.keys(validWords);

  // Get list of already revealed words for this category and difficulty
  const storedWords = await getStoredWords();
  const revealedWords = await storedWords[category];
  const revealedWordsSet = new Set(revealedWords[difficulty].map(w => w.word));

  // Filter out revealed words
  const unrevealed = words.filter(word => !revealedWordsSet.has(word));

  // If we have unrevealed words, select one randomly
  if (unrevealed.length > 0) {
    const selectedWord =
      unrevealed[Math.floor(Math.random() * unrevealed.length)];
    return {
      selectedWord,
      about: validWords[selectedWord],
    };
  }

  // If all words are revealed, select from revealed words
  // Sort by score (ascending) and time (descending) to prioritize words with lower scores
  const revealedSorted = [...revealedWords[difficulty]].sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score; // Lower scores first
    }
    return b.time - a.time; // Higher times first (older attempts)
  });

  // Take from the first third of sorted revealed words to focus on ones needing improvement
  const selectionPool = revealedSorted.slice(
    0,
    Math.max(1, Math.floor(revealedSorted.length / 3)),
  );

  const selectedRevealedWord =
    selectionPool[Math.floor(Math.random() * selectionPool.length)];

  return {
    selectedWord: selectedRevealedWord.word,
    about: validWords[selectedRevealedWord.word],
  };
};

export const evaluateGuess = (
  guess: string,
  hiddenWord: string,
): Correctness[] => {
  const wordLength = hiddenWord.length;
  const evaluation: Correctness[] = Array(wordLength).fill('notInUse');
  const secretLetters: (string | null)[] = hiddenWord.split('').map(mapSuffix);
  const guessLetters: (string | null)[] = guess.split('').map(mapSuffix);

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
};

const useSecretWord = (
  wordLength: number,
  category: GameCategory,
  difficulty: Difficulty,
  type: 'DAILY' | 'RANDOM',
) => {
  const [wordState, setWordState] = useState<WordHandle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadWordFromStorage: (
    gameType: string,
  ) => Promise<WordHandle | undefined> = useCallback(async gameType => {
    const gameStorageState = await loadGame(gameType);
    if (gameStorageState) {
      return {
        selectedWord: gameStorageState.secretWord,
        about: gameStorageState.aboutWord,
      };
    }
  }, []);

  const getNewWord = useCallback(async (): Promise<WordHandle> => {
    if (type === 'DAILY') {
      return getDailyWord();
    }
    return newSecretWord(wordLength, category, difficulty);
  }, [type, wordLength, category, difficulty]);

  const initializeWord = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedWord = await loadWordFromStorage(type);

      if (storedWord) {
        setWordState(storedWord);
      } else {
        const newWord = await getNewWord();
        setWordState(newWord);
      }
    } catch (error) {
      console.error('Error initializing word:', error);
      // You might want to add error handling state here
    } finally {
      setIsLoading(false);
    }
  }, [type, loadWordFromStorage, getNewWord]);

  const generateSecretWord = useCallback(async () => {
    try {
      setIsLoading(true);
      const newWord = await getNewWord();
      setWordState(newWord);
    } catch (error) {
      console.error('Error generating new word:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getNewWord]);

  useEffect(() => {
    initializeWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    secretWord: wordState?.selectedWord ?? '',
    aboutWord: wordState?.about ?? '',
    generateSecretWord,
    isLoading,
  };
};

export default useSecretWord;
