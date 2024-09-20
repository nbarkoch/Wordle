import {create} from 'zustand';

interface ScoreState {
  score: number;
  reset: () => void;
  addScore: (newScore: number) => void;
}

export const useScoreStore = create<ScoreState>(set => ({
  score: 0,
  reset: () => set(() => ({score: 0})),
  addScore: newScore => set(state => ({score: state.score + newScore})),
}));
