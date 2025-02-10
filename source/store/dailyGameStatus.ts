import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {loadGame, saveGame} from './gameStorageState';

const DAILY_KEY = '@dailyword';

export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

interface DailyGameState {
  isDone: boolean;
  checkDaily: () => Promise<void>;
  markDone: () => Promise<void>;
}

async function validateDailyGameStorage() {
  // for game storage state
  const gameStorageState = await loadGame('DAILY');
  if (gameStorageState?.time) {
    const date = new Date(gameStorageState.time);
    const today = new Date();
    // Set both dates to midnight to ignore time differences
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const isPastDay = dateOnly < todayOnly;

    if (isPastDay) {
      saveGame('DAILY', undefined);
    }
  }
}

export const useDailyGameStore = create<DailyGameState>(set => ({
  isDone: false,

  checkDaily: async () => {
    try {
      const lastPlayed = await AsyncStorage.getItem(DAILY_KEY);
      const today = formatDate(new Date());
      set({isDone: lastPlayed === today});
      validateDailyGameStorage();
    } catch (error) {
      set({isDone: false});
    }
  },

  markDone: async () => {
    try {
      const today = formatDate(new Date());
      await AsyncStorage.setItem(DAILY_KEY, today);
      set({isDone: true});
    } catch (error) {
      console.error('Failed to mark daily game:', error);
    }
  },
}));
