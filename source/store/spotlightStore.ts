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
  // event
  triggerRegisterEvent: (keys: string[]) => void;
  registeredInEvent: string[];
}

export const useSpotlightStore = create<SpotlightState>(set => ({
  positions: {},
  registeredInEvent: [],
  registerPosition: (id, position) =>
    set(state => ({
      positions: {
        ...state.positions,
        [id]: position,
      },
      registeredInEvent: state.registeredInEvent.filter(key => key !== id),
    })),
  triggerRegisterEvent: (keys: string[] | undefined) =>
    set(() => ({registeredInEvent: keys})),
}));
