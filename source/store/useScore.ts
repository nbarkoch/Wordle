import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScoreState {
  score: number;
  userScore: number;
  resetScore: () => void;
  setScore: (newScore: number) => void;
  addScore: (newScore: number) => Promise<void>;
  getScore: () => number;
  resetUserScore: () => Promise<void>;
  setUserScore: (newScore: number) => Promise<void>;
  removeFromUserScore: (scoreRemove: number) => Promise<void>;
  getUserScore: () => number;
  loadUserScore: () => Promise<void>;
}

const STORAGE_KEY = '@user_score';

export const useScoreStore = create<ScoreState>((set, get) => ({
  score: 0,
  userScore: 0,
  resetScore: () => set({score: 0}),

  setScore: newScore => set({score: newScore}),

  addScore: async newScore => {
    set(state => ({
      score: state.score + newScore,
      userScore: state.userScore + newScore,
    }));
    const newUserScore = get().userScore;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUserScore));
  },

  getScore: () => get().score,

  resetUserScore: async () => {
    set({userScore: 0});
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(0));
  },

  setUserScore: async newScore => {
    set({userScore: newScore});
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newScore));
  },

  removeFromUserScore: async scoreRemove => {
    set(state => ({userScore: Math.max(0, state.userScore - scoreRemove)}));
    const newUserScore = get().userScore;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUserScore));
  },

  getUserScore: () => get().userScore,

  loadUserScore: async () => {
    try {
      const storedScore = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedScore !== null) {
        set({userScore: JSON.parse(storedScore)});
      }
    } catch (e) {
      console.error('Failed to load user score', e);
    }
  },
}));

// Initialize the store by loading the user score
useScoreStore.getState().loadUserScore();
