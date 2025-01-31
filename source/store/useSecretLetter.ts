import {useCallback, useState} from 'react';
import {Correctness, mapSuffix} from '~/utils/words';

const getRandomLetterAndPosition = (wordLength: number) => {
  const letters = 'קראטופשדגכעיחלזסבהנמצת';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const position = Math.floor(Math.random() * wordLength);
  return {letter, position};
};

const useSecretLetter = (wordLength: number) => {
  const [secretLetterInfo, setSecretLetterInfo] = useState(() =>
    getRandomLetterAndPosition(wordLength),
  );

  const generateSecretLetter = useCallback(() => {
    setSecretLetterInfo(getRandomLetterAndPosition(wordLength));
  }, [wordLength]);

  const evaluateGuess = useCallback(
    (guess: string): Correctness[] => {
      const guessLetters = guess.split('').map(mapSuffix);
      if (guessLetters[secretLetterInfo.position] === secretLetterInfo.letter) {
        const evaluation = Array(wordLength).fill('correct');
        return evaluation;
      } else if (
        guessLetters.find(letter => letter === secretLetterInfo.letter)
      ) {
        const evaluation: Correctness[] = Array(wordLength).fill('exists');
        return evaluation;
      }
      return Array(wordLength).fill('notInUse');
    },
    [secretLetterInfo],
  );

  // For debugging purposes only
  const secretWord = `האות ${secretLetterInfo.letter} במיקום ${
    secretLetterInfo.position + 1
  }`;

  return {
    evaluateGuess,
    generateSecretLetter,
    secretWord,
    aboutWord: 'חפש אות במיקום הנכון', // Hint text
  };
};

export default useSecretLetter;
