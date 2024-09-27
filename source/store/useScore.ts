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
  removeFromUserScore: (scoreRemove: number) => void;
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
  userScore: 1000,
  resetUserScore: () => set({userScore: 0}),
  removeFromUserScore: scoreRemove =>
    set(state => ({userScore: state.userScore - scoreRemove})),
  setUserScore: newScore => set({userScore: newScore}),
  getUserScore: () => get().userScore,
}));
