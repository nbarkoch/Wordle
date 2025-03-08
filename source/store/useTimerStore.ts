import {create} from 'zustand';

interface TimerState {
  time: number;
  isActive: boolean;
  resetKey: number;
  silentMode: boolean; // Flag to control whether updates cause re-renders

  start: () => void;
  stop: () => void;
  reset: (initialTime?: number) => void;
  increment: (callback?: (time: number) => void) => void;

  setSilentMode: (silent: boolean) => void; // Toggle silent mode
  getTime: () => number; // Get current time without subscribing
}

export const useTimerStore = create<TimerState>((set, get) => {
  // Internal reference to track time without causing re-renders
  const internalTime = {value: 0};

  return {
    time: 0,
    isActive: false,
    resetKey: 0,
    silentMode: false,

    start: () => set({isActive: true}),
    stop: () => set({isActive: false}),

    reset: (initialTime = 0) => {
      internalTime.value = initialTime;
      set(state => ({
        time: initialTime,
        isActive: false,
        resetKey: state.resetKey + 1,
      }));
    },

    increment: callback => {
      internalTime.value += 1;
      // Only update the visible state if not in silent mode
      if (!get().silentMode) {
        set({time: internalTime.value});
      }
      callback?.(internalTime.value);
    },

    setSilentMode: (silent: boolean) => {
      set({silentMode: silent});

      // If turning silent mode off, sync the visible time
      if (!silent) {
        set({time: internalTime.value});
      }
    },

    getTime: () => internalTime.value,
  };
});
