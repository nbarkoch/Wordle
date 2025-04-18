import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';

interface TutorialState {
  step: number;
  tutorialDone: boolean;
  eventTrigger?: {step: number; key: string};
  reset: () => void;
  getStep: () => number;
  nextStep: () => void;
  setStep: (step: number) => void;
  isDone: () => Promise<boolean>;
  setDone: () => Promise<void>;
  triggerEvent: (key: string | undefined) => void;
}

const initialState = {step: 0, eventTrigger: undefined, tutorialDone: false};
export const useTutorialStore = create<TutorialState>((set, get) => ({
  ...initialState,
  reset: () => set(() => initialState),
  getStep: () => get().step,
  setStep: (step: number) => set(() => ({step: step})),
  nextStep: () => set(state => ({step: state.step + 1})),
  isDone: async () => (await AsyncStorage.getItem('Tutorial.Done')) === 'true',
  setDone: async () => await AsyncStorage.setItem('Tutorial.Done', 'true'),
  triggerEvent: (key: string | undefined) =>
    set(state => ({eventTrigger: key ? {step: state.step, key} : undefined})),
}));
