import {create} from 'zustand';

interface TimerState {
  time: number;
  isActive: boolean;
  resetKey: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  increment: () => void;
}

export const useTimerStore = create<TimerState>(set => ({
  time: 0,
  isActive: false,
  resetKey: 0,
  start: () => set({isActive: true}),
  stop: () => set({isActive: false}),
  reset: () =>
    set(state => ({time: 0, isActive: false, resetKey: state.resetKey + 1})),
  increment: () => set(state => ({time: state.time + 1})),
}));
