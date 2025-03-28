import {
  guessesInitialGridState,
  keyboardInitialKeysState,
  LetterCellLocation,
  LineHint,
  WordGuess,
  Correctness,
  suffixOriginalLetterMapper,
  suffixLetterMapper,
  suffixLetters,
} from '~/utils/words';

// Define the state shape
export interface GameState {
  correctLetters: boolean[];
  currentAttempt: number;
  selectedLetter: LetterCellLocation;
  currentGuess: (string | undefined)[];
  guesses: WordGuess[];
  keyboardLetters: Record<string, Correctness>;
  lineHint?: LineHint;
  lineSearch?: LineHint;
  isGameEnd: boolean;
  aboutShown: boolean;
  aboutWasShown: boolean;
  specialHintUsed: boolean;
  numberOfSavedRows: number;
  gameStatus: 'PLAYING' | 'SUCCESS' | 'FAILURE';
  isValidGuess: boolean | null;
  maxAttempts: number;
  wordLength: number;
  score: number;
}

// Define action types
export type GameAction =
  | {
      type: 'SUBMIT_GUESS';
      correctness: Correctness[];
      letters: string[];
      correctLetters: boolean[];
      addedScore: number;
    }
  | {type: 'KEY_PRESS'; key: string}
  | {type: 'DELETE_LETTER'}
  | {type: 'SET_SELECTED_LETTER'; location: LetterCellLocation}
  | {type: 'SET_LINE_HINT'; hint: LineHint | undefined}
  | {type: 'SET_LINE_SEARCH'; search: LineHint | undefined}
  | {type: 'END_GAME'; status: 'SUCCESS' | 'FAILURE'}
  | {type: 'SET_ABOUT_SHOWN'; shown: boolean}
  | {type: 'SET_ABOUT_WAS_SHOWN'}
  | {type: 'SET_NUMBER_OF_SAVED_ROWS'; number: number}
  | {type: 'SET_GAME_END'; isEnd: boolean}
  | {type: 'SET_VALID_GUESS'; isValid: boolean | null}
  | {type: 'RESET_GAME'; maxAttempts: number; wordLength: number};

const initialState: GameState = {
  correctLetters: [],
  currentAttempt: 0,
  selectedLetter: {rowIndex: 0, colIndex: 0},
  currentGuess: [],
  guesses: [],
  keyboardLetters: keyboardInitialKeysState,
  isGameEnd: false,
  aboutShown: false,
  aboutWasShown: false,
  specialHintUsed: false,
  numberOfSavedRows: 0,
  gameStatus: 'PLAYING',
  isValidGuess: null,
  maxAttempts: 0,
  wordLength: 0,
  score: 0,
};

function updateCorrectness(
  curLettersCorrectness: Record<string, Correctness>,
  letterInput: {
    letter: string;
    newCorrectness: Correctness;
  },
) {
  const {letter, newCorrectness} = letterInput;
  const suffixLetter = suffixOriginalLetterMapper[letter] ?? letter;
  const originalLetter = suffixLetterMapper[letter] ?? letter;
  const isOriginal = originalLetter === letter;
  const isSuffix = suffixLetter === letter && letter !== originalLetter;

  switch (newCorrectness) {
    case 'exists': {
      if (
        !curLettersCorrectness[suffixLetter] ||
        !curLettersCorrectness[originalLetter]
      ) {
        if (isSuffix) {
          curLettersCorrectness[suffixLetter] = 'notInUse';
          curLettersCorrectness[originalLetter] = 'exists';
        } else if (isOriginal) {
          curLettersCorrectness[originalLetter] = 'exists';
          if (curLettersCorrectness[suffixLetter] === null) {
            curLettersCorrectness[suffixLetter] = 'exists';
          }
        }
      }
      break;
    }
    case 'correct': {
      if (isSuffix) {
        // Mark all suffix letters as notInUse
        suffixLetters.forEach(sLetter => {
          curLettersCorrectness[sLetter] = 'notInUse';
        });
        // Override this specific suffix letter
        curLettersCorrectness[suffixLetter] = 'correct';
      } else if (isOriginal) {
        curLettersCorrectness[originalLetter] = 'correct';
        if (curLettersCorrectness[suffixLetter] === 'exists') {
          curLettersCorrectness[suffixLetter] = null;
        }
      }
      break;
    }
    case 'notInUse': {
      curLettersCorrectness[originalLetter] = 'notInUse';
      curLettersCorrectness[suffixLetter] = 'notInUse';
      break;
    }
    default: {
    }
  }
}

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SUBMIT_GUESS':
      const newGuesses = [...state.guesses];
      newGuesses[state.currentAttempt] = {
        letters: action.letters,
        correctness: action.correctness,
      };

      const newKeyboardLetters = {...state.keyboardLetters};

      action.letters.forEach((letter, index) => {
        const letterCorrectness = action.correctness[index];
        updateCorrectness(newKeyboardLetters, {
          letter,
          newCorrectness: letterCorrectness,
        });
      });

      return {
        ...state,
        correctLetters: action.correctLetters,
        currentAttempt: state.currentAttempt + 1,
        selectedLetter: {rowIndex: state.currentAttempt + 1, colIndex: 0},
        currentGuess: [],
        guesses: newGuesses,
        keyboardLetters: newKeyboardLetters,
        lineHint: undefined,
        lineSearch: undefined,
        score: state.score + action.addedScore,
      };
    case 'KEY_PRESS':
      if (
        state.currentGuess.length <= state.guesses[0].letters.length &&
        state.selectedLetter.rowIndex === state.currentAttempt
      ) {
        const newGuess = [...state.currentGuess];
        newGuess[state.selectedLetter.colIndex] = action.key;
        let newColIndex = state.selectedLetter.colIndex;
        if (newColIndex < state.guesses[0].letters.length - 1) {
          newColIndex++;
        }
        return {
          ...state,
          currentGuess: newGuess,
          selectedLetter: {...state.selectedLetter, colIndex: newColIndex},
        };
      }
      return state;
    case 'DELETE_LETTER':
      const updatedGuess = [...state.currentGuess];
      let newColIndex = state.selectedLetter.colIndex;
      if (updatedGuess[newColIndex] !== undefined) {
        updatedGuess[newColIndex] = undefined;
      } else if (newColIndex > 0) {
        newColIndex--;
        updatedGuess[newColIndex] = undefined;
      }
      return {
        ...state,
        currentGuess: updatedGuess,
        selectedLetter: {...state.selectedLetter, colIndex: newColIndex},
      };
    case 'SET_SELECTED_LETTER':
      return {...state, selectedLetter: action.location};
    case 'SET_LINE_HINT':
      return {...state, lineHint: action.hint, specialHintUsed: true};
    case 'SET_LINE_SEARCH':
      return {...state, lineSearch: action.search};
    case 'END_GAME':
      return {
        ...state,
        gameStatus: action.status,
        selectedLetter: {rowIndex: -1, colIndex: -1},
        lineHint: undefined,
        lineSearch: undefined,
      };
    case 'SET_ABOUT_SHOWN':
      return {...state, aboutShown: action.shown};
    case 'SET_ABOUT_WAS_SHOWN':
      return {...state, aboutWasShown: true};
    case 'SET_NUMBER_OF_SAVED_ROWS':
      return {...state, numberOfSavedRows: action.number};
    case 'SET_GAME_END':
      return {...state, isGameEnd: action.isEnd};
    case 'SET_VALID_GUESS':
      return {...state, isValidGuess: action.isValid};
    case 'RESET_GAME':
      return {
        ...initialState,
        maxAttempts: action.maxAttempts,
        wordLength: action.wordLength,
        correctLetters: Array(action.wordLength).fill(false),
        guesses: guessesInitialGridState(action.maxAttempts, action.wordLength),
        keyboardLetters: keyboardInitialKeysState,
      };
    default:
      return state;
  }
}

export default gameReducer;
