import AsyncStorage from '@react-native-async-storage/async-storage';
import {CATEGORIES, DIFFICULTIES} from '~/utils/consts';
import {wordList} from '~/utils/db';
import {Difficulty, GameCategory} from '~/utils/types';

type RevealedWordOverview = {
  word: string;
  time: number;
  score: number;
};

type WordSection = {
  [K in Difficulty]: RevealedWordOverview[];
};

type WordDisplaySection = {
  [K in Difficulty]: {reveals: RevealedWordOverview[]; total: number};
};

type WordDisplayHierarchy = {
  GENERAL: WordDisplaySection;
  ANIMALS: WordDisplaySection;
  SCIENCE: WordDisplaySection;
  SPORT: WordDisplaySection;
  GEOGRAPHY: WordDisplaySection;
};

type WordHierarchy = {
  GENERAL: WordSection;
  ANIMALS: WordSection;
  SCIENCE: WordSection;
  SPORT: WordSection;
  GEOGRAPHY: WordSection;
};

const STORAGE_KEY = '@revealed_words';

const createDisplayEmptySection = (): WordDisplaySection => ({
  easy: {reveals: [], total: 0},
  medium: {reveals: [], total: 0},
  hard: {reveals: [], total: 0},
});

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

const createDisplayEmptyHierarchy = (): WordDisplayHierarchy => ({
  GENERAL: createDisplayEmptySection(),
  ANIMALS: createDisplayEmptySection(),
  SCIENCE: createDisplayEmptySection(),
  SPORT: createDisplayEmptySection(),
  GEOGRAPHY: createDisplayEmptySection(),
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
    const newWord: RevealedWordOverview = {word, time, score};

    // Update in the specified category
    const categorySection = storedWords[category][difficultyKey];
    const existingIndex = categorySection.findIndex(w => w.word === word);

    if (existingIndex !== -1) {
      categorySection[existingIndex] = updateWordStats(
        categorySection[existingIndex],
        newWord,
      );
    } else {
      categorySection.push(newWord);
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

async function getRevealsAndTotals(): Promise<WordDisplayHierarchy> {
  try {
    const storedWords = await getStoredWords();

    // Calculate total counts for all categories
    const totalCounts = Object.entries(wordList).reduce(
      (acc, [category, categoryData]) => {
        acc[category as GameCategory] = Object.entries(categoryData).reduce(
          (diffAcc, [, values]) => {
            Object.entries(values).forEach(([key, value]) => {
              if (key in diffAcc) {
                diffAcc[key as Difficulty] += Object.keys(value).length;
              }
            });
            return diffAcc;
          },
          {easy: 0, medium: 0, hard: 0},
        );
        return acc;
      },
      {} as Record<GameCategory, Record<Difficulty, number>>,
    );

    return CATEGORIES.reduce((acc, category) => {
      acc[category] = DIFFICULTIES.reduce((diffAcc, difficulty) => {
        diffAcc[difficulty] = {
          reveals: storedWords[category]?.[difficulty] ?? [],
          total: totalCounts[category][difficulty],
        };
        return diffAcc;
      }, {} as WordDisplaySection);

      return acc;
    }, {} as WordDisplayHierarchy);
  } catch (error) {
    console.error('Error loading stored words:', error);

    return createDisplayEmptyHierarchy();
  }
}

export {
  getStoredWords,
  addToRevealedList,
  getRevealsAndTotals,
  createDisplayEmptyHierarchy,
  type RevealedWordOverview,
  type WordHierarchy,
  type WordDisplayHierarchy,
  type WordSection,
};
