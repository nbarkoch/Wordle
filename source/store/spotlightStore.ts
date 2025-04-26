import {create} from 'zustand';

export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

interface SpotlightState {
  registering: boolean;
  registerPosition: (id: string, position: ComponentPosition) => void;
  waitForRegistrations: (
    keys: string[],
  ) => Promise<Record<string, ComponentPosition>>;
}

const positionsCache: Record<string, ComponentPosition> = {};
const pendingResolvers: Record<string, (position: ComponentPosition) => void> =
  {};

export const useSpotlightStore = create<SpotlightState>(set => {
  // Promise resolution tracking

  return {
    registering: false,

    registerPosition: (id, position) => {
      // Store position in external cache
      positionsCache[id] = position;

      // Resolve pending promise if exists
      if (pendingResolvers[id]) {
        pendingResolvers[id](position);
        delete pendingResolvers[id];
      }
    },

    waitForRegistrations: async keys => {
      // Filter to find which keys are still missing
      const missingKeys = keys.filter(key => !positionsCache[key]);
      if (missingKeys.length !== 0) {
        set(() => ({registering: true}));
        await Promise.all(
          missingKeys.map(
            key =>
              new Promise<void>(resolve => {
                if (positionsCache[key]) {
                  resolve();
                  return;
                }
                pendingResolvers[key] = () => resolve();
              }),
          ),
        );
        set(() => ({registering: false}));
      }
      return {...positionsCache};
    },
  };
});
