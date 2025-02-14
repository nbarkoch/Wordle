import general3 from '~/database/all_3.json';
import general4 from '~/database/all_4.json';
import general5 from '~/database/all_5.json';

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
import {CategoryWords, GameCategory} from './types';

const general: CategoryWords = {
  3: general3,
  4: general4,
  5: general5,
};

const science: CategoryWords = {
  3: science3,
  4: science4,
  5: science5,
};

const animals: CategoryWords = {
  3: animals3,
  4: animals4,
  5: animals5,
};

const geography: CategoryWords = {
  3: geography3,
  4: geography4,
  5: geography5,
};

const sports: CategoryWords = {
  3: sports3,
  4: sports4,
  5: sports5,
};

export const wordList: Record<GameCategory, CategoryWords> = {
  GENERAL: general,
  SCIENCE: science,
  GEOGRAPHY: geography,
  ANIMALS: animals,
  SPORT: sports,
};
