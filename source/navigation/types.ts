import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  NewGame: undefined;
  WordGame: {maxAttempts: number; wordLength: number; enableTimer?: boolean};
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

// navigation props
export type WordleGameNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WordGame'
>;
