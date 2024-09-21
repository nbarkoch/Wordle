import {create} from 'zustand';

interface ScoreState {
  score: number;
  resetScore: () => void;
  setScore: (newScore: number) => void;
  addScore: (newScore: number) => void;
  getScore: () => number;
  userScore: number;
  resetUserScore: () => void;
  setUserScore: (newScore: number) => void;
  getUserScore: () => number;
}

export const useScoreStore = create<ScoreState>((set, get) => ({
  score: 0,
  resetScore: () => set({score: 0}),
  setScore: newScore => set({score: newScore}),
  addScore: newScore =>
    set(state => ({
      score: state.score + newScore,
      userScore: state.userScore + newScore,
    })),
  getScore: () => get().score,
  userScore: 0,
  resetUserScore: () => set({userScore: 0}),
  setUserScore: newScore => set({userScore: newScore}),
  getUserScore: () => get().userScore,
}));
