import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';

const DAILY_KEY = '@dailyword';

function formatDate(date: Date): string {
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

export const useDailyGameStore = create<DailyGameState>(set => ({
  isDone: false,

  checkDaily: async () => {
    try {
      const lastPlayed = await AsyncStorage.getItem(DAILY_KEY);
      const today = formatDate(new Date());
      set({isDone: lastPlayed === today});
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
