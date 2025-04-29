import {Difficulty, GameCategory} from './types';

export const ROW_SAVED_DELAY = 170;
export const LETTER_CELL_DISPLAY_DELAY = 100;
export const LETTER_READ_DURATION = 275;

export const CATEGORIES: GameCategory[] = [
  'GENERAL',
  'ANIMALS',
  'GEOGRAPHY',
  'SCIENCE',
  'SPORT',
];

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const MAP_CATEGORY_NAME: Record<GameCategory, string> = {
  GENERAL: 'ידע כללי',
  ANIMALS: 'בעלי חיים',
  GEOGRAPHY: 'גאוגרפיה',
  SCIENCE: 'מדעים',
  SPORT: 'ספורט',
};

export const MAP_DIFFICULTY_NAME: Record<Difficulty, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
};
