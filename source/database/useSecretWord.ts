import {useState} from 'react';

import {Correctness} from '~/utils/ui';

import wordList3 from '~/database/wordle_3.json';
import wordList4 from '~/database/wordle_4.json';
import wordList5 from '~/database/wordle_5.json';

const wordLists: {[key: number]: string[]} = {
  3: wordList3,
  4: wordList4,
  5: wordList5,
};

const newSecretWord = (wordLength: number) => {
  const validWords = wordLists[wordLength];
  return validWords[Math.floor(Math.random() * validWords.length)].trim();
};

const useSecretWord = (wordLength: number) => {
  const [secretWord, setSecretWord] = useState<string>(
    newSecretWord(wordLength),
  );
  const generateSecretWord = () => {
    setSecretWord(newSecretWord(wordLength));
  };

  const evaluateGuess = (guess: string): Correctness[] => {
    const evaluation: Correctness[] = Array(wordLength).fill('notInUse');
    const secretLetters: (string | null)[] = secretWord.split('');
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
        secretLetters[secretLetters.indexOf(guessLetters[i])] = null; // Mark as evaluated
      }
    }

    return evaluation;
  };

  return {
    secretWord,
    evaluateGuess,
    generateSecretWord,
  };
};

export default useSecretWord;
