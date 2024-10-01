import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  WordGame: {maxAttempts: number; wordLength: number};
  UserInfo: {user: string};
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
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
