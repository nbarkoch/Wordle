export type GameCategory =
  | 'GENERAL'
  | 'ANIMALS'
  | 'SCIENCE'
  | 'SPORT'
  | 'GEOGRAPHY';

export type Difficulty = 'hard' | 'medium' | 'easy';

export type DifficultySections = {
  easy: Record<string, string>;
  medium: Record<string, string>;
  hard: Record<string, string>;
};

export type CategoryWords = {
  [key: number]: DifficultySections;
};

export type ExtractLeafValues<T> = T extends object
  ? {[K in keyof T]: ExtractLeafValues<T[K]>}[keyof T]
  : T;
