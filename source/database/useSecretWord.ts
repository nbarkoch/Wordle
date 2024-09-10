import {useMemo} from 'react';

import wordList from '~/database/wordlist';
import {Correctness} from '~/utils/ui';

const WORD_LENGTH = 5;

const useSecretWord = () => {
  const secretWord: string = useMemo(() => {
    const validWords = wordList.trim().split('\n');
    return validWords[Math.floor(Math.random() * validWords.length)].trim();
  }, []);

  const evaluateGuess = (guess: string): Correctness[] => {
    const evaluation: Correctness[] = Array(WORD_LENGTH).fill('notInUse');
    const secretLetters: (string | null)[] = secretWord.split('');
    const guessLetters: (string | null)[] = guess.split('');

    // First pass: Identify correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === secretLetters[i]) {
        evaluation[i] = 'correct';
        secretLetters[i] = guessLetters[i] = null; // Mark as evaluated
      }
    }

    // Second pass: Identify misplaced letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] && secretLetters.includes(guessLetters[i])) {
        evaluation[i] = 'exists';
        secretLetters[secretLetters.indexOf(guessLetters[i])] = null; // Mark as evaluated
      }
    }

    return evaluation;
  };

  return {
    secretWord,
    evaluateGuess,
  };
};

export default useSecretWord;
