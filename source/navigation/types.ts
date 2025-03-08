import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {GameState} from '~/gameReducer';
import {Difficulty, GameCategory} from '~/utils/types';

export type RootStackParamList = {
  Home: undefined;
  NewGame: undefined;
  WordGame: {
    maxAttempts: number;
    wordLength: number;
    enableTimer?: boolean;
    category: GameCategory;
    difficulty: Difficulty;
    type: 'RANDOM' | 'DAILY';
    savedGameState?: GameState;
    startTime?: number;
  };
  UserInfo: {user: string};
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;
export type NewGameProps = NativeStackScreenProps<
  RootStackParamList,
  'NewGame'
>;
export type WordGameScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WordGame'
>;
export type DetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'UserInfo'
>;

export type WordleGameNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WordGame'
>;
