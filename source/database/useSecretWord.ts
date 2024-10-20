import {useCallback, useEffect, useState} from 'react';

import {Correctness} from '~/utils/ui';

import all3 from '~/database/all_3.json';
import all4 from '~/database/all_4.json';
import all5 from '~/database/all_5.json';

import geography3 from '~/database/geography_3.json';
import geography4 from '~/database/geography_4.json';
import geography5 from '~/database/geography_5.json';

import animals3 from '~/database/animals_3.json';
import animals4 from '~/database/animals_4.json';
import animals5 from '~/database/animals_5.json';

import science3 from '~/database/science_3.json';
import science4 from '~/database/science_4.json';
import science5 from '~/database/science_5.json';

import sports3 from '~/database/sports_3.json';
import sports4 from '~/database/sports_4.json';
import sports5 from '~/database/sports_5.json';

import {GameCategory} from '~/utils/types';

type CategoryWords = {[key: number]: Record<string, string>};

const all: {[key: number]: Record<string, string>} = {
  3: all3,
  4: all4,
  5: all5,
};

const science: {[key: number]: Record<string, string>} = {
  3: science3,
  4: science4,
  5: science5,
};

const animals: {[key: number]: Record<string, string>} = {
  3: animals3,
  4: animals4,
  5: animals5,
};

const geography: {[key: number]: Record<string, string>} = {
  3: geography3,
  4: geography4,
  5: geography5,
};

const sports: {[key: number]: Record<string, string>} = {
  3: sports3,
  4: sports4,
  5: sports5,
};

const wordList: Record<GameCategory, CategoryWords> = {
  ALL: all,
  SCIENCE: science,
  GEOGRAPHY: geography,
  ANIMALS: animals,
  SPORT: sports,
};

type WordHandle = {selectedWord: string; about: string};

const newSecretWord = (
  wordLength: number,
  category: GameCategory,
): WordHandle => {
  const validWords = wordList[category][wordLength];
  const words = Object.keys(validWords);

  const selectedWord = words[Math.floor(Math.random() * words.length)];
  return {selectedWord, about: validWords[selectedWord]};
};

const useSecretWord = (wordLength: number, category: GameCategory) => {
  const [secretWord, setSecretWord] = useState<WordHandle>(
    newSecretWord(wordLength, category),
  );

  const generateSecretWord = () => {
    setSecretWord(newSecretWord(wordLength, category));
  };

  const evaluateGuess = useCallback(
    (guess: string): Correctness[] => {
      const evaluation: Correctness[] = Array(wordLength).fill('notInUse');
      const secretLetters: (string | null)[] =
        secretWord.selectedWord.split('');
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
    [secretWord, wordLength, category],
  );

  return {
    secretWord: secretWord.selectedWord,
    hint: secretWord.about,
    evaluateGuess,
    generateSecretWord,
  };
};

export default useSecretWord;
