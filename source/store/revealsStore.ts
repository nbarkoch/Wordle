import AsyncStorage from '@react-native-async-storage/async-storage';
import {Difficulty, GameCategory} from '~/utils/types';

type RevealedWordOverview = {
  word: string;
  time: number;
  score: number;
  hint: string;
};

type WordSection = {
  [K in Difficulty]: RevealedWordOverview[];
};

type WordHierarchy = {
  GENERAL: WordSection;
  ANIMALS: WordSection;
  SCIENCE: WordSection;
  SPORT: WordSection;
  GEOGRAPHY: WordSection;
};

const STORAGE_KEY = '@revealed_words';

const createEmptySection = (): WordSection => ({
  easy: [],
  medium: [],
  hard: [],
});

const createEmptyHierarchy = (): WordHierarchy => ({
  GENERAL: createEmptySection(),
  ANIMALS: createEmptySection(),
  SCIENCE: createEmptySection(),
  SPORT: createEmptySection(),
  GEOGRAPHY: createEmptySection(),
});

function updateWordStats(
  existing: RevealedWordOverview,
  newWord: RevealedWordOverview,
): RevealedWordOverview {
  // If new score is better, update both score and time
  if (newWord.score > existing.score) {
    return {
      ...existing,
      score: newWord.score,
      time: newWord.time,
    };
  }

  // If same score but better time, update only time
  if (newWord.score === existing.score && newWord.time < existing.time) {
    return {
      ...existing,
      time: newWord.time,
    };
  }

  // Otherwise keep existing stats
  return existing;
}

async function addToRevealedList(
  word: string,
  time: number,
  score: number,
  hint: string,
  category: GameCategory,
  difficulty: Difficulty,
): Promise<void> {
  try {
    const storedWords = await getStoredWords();
    const difficultyKey = difficulty;
    const newWord: RevealedWordOverview = {word, time, score, hint};

    // Update in the specified category
    const categoryList = storedWords[category][difficultyKey];
    const existingIndex = categoryList.findIndex(w => w.word === word);

    if (existingIndex !== -1) {
      categoryList[existingIndex] = updateWordStats(
        categoryList[existingIndex],
        newWord,
      );
    } else {
      categoryList.push(newWord);
    }

    // Save updated hierarchy
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedWords));
  } catch (error) {
    console.error('Error adding word to revealed list:', error);
    throw error;
  }
}

async function getStoredWords(): Promise<WordHierarchy> {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return createEmptyHierarchy();
    }

    const parsedData = JSON.parse(storedData) as Partial<WordHierarchy>;
    return {
      GENERAL: {
        easy: parsedData.GENERAL?.easy ?? [],
        medium: parsedData.GENERAL?.medium ?? [],
        hard: parsedData.GENERAL?.hard ?? [],
      },
      ANIMALS: {
        easy: parsedData.ANIMALS?.easy ?? [],
        medium: parsedData.ANIMALS?.medium ?? [],
        hard: parsedData.ANIMALS?.hard ?? [],
      },
      SCIENCE: {
        easy: parsedData.SCIENCE?.easy ?? [],
        medium: parsedData.SCIENCE?.medium ?? [],
        hard: parsedData.SCIENCE?.hard ?? [],
      },
      SPORT: {
        easy: parsedData.SPORT?.easy ?? [],
        medium: parsedData.SPORT?.medium ?? [],
        hard: parsedData.SPORT?.hard ?? [],
      },
      GEOGRAPHY: {
        easy: parsedData.GEOGRAPHY?.easy ?? [],
        medium: parsedData.GEOGRAPHY?.medium ?? [],
        hard: parsedData.GEOGRAPHY?.hard ?? [],
      },
    };
  } catch (error) {
    console.error('Error loading stored words:', error);
    return createEmptyHierarchy();
  }
}

async function getRevealedWords(category: GameCategory): Promise<WordSection> {
  try {
    const storedWords = await getStoredWords();
    return storedWords[category];
  } catch (error) {
    console.error('Error getting revealed words:', error);
    return createEmptySection();
  }
}

export {
  addToRevealedList,
  getRevealedWords,
  type RevealedWordOverview,
  type WordHierarchy,
  type WordSection,
};
