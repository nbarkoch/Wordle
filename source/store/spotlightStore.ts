import {create} from 'zustand';

export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

interface SpotlightState {
  positions: Record<string, ComponentPosition>;
  registerPosition: (id: string, position: ComponentPosition) => void;
}

export const useSpotlightStore = create<SpotlightState>(set => ({
  positions: {},
  registerPosition: (id, position) =>
    set(state => ({
      positions: {
        ...state.positions,
        [id]: position,
      },
    })),
}));
