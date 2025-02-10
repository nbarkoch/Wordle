import AsyncStorage from '@react-native-async-storage/async-storage';
import {GameState} from '~/gameReducer';
import {Difficulty, GameCategory} from '~/utils/types';

interface GameStorageState {
  category: GameCategory;
  difficulty: Difficulty;
  enableTimer?: boolean;
  secretWord: string;
  aboutWord: string;
  gameState: GameState;
  time?: string;
}

export const saveGame = async (
  gameId: string,
  gameStorageState: GameStorageState | undefined,
) => {
  if (gameStorageState) {
    const today = new Date().toISOString();
    gameStorageState.time = today;
    await AsyncStorage.setItem(
      `GameStorageState.${gameId}`,
      JSON.stringify(gameStorageState),
    );
  } else {
    await AsyncStorage.removeItem(`GameStorageState.${gameId}`);
  }
};

export const loadGame = async (
  gameId: string,
): Promise<GameStorageState | undefined> => {
  const savedGameStateFromStorage = await AsyncStorage.getItem(
    `GameStorageState.${gameId}`,
  );
  if (savedGameStateFromStorage) {
    const savedGameState: GameStorageState = JSON.parse(
      savedGameStateFromStorage,
    );
    return savedGameState;
  }
};
