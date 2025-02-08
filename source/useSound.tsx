import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useRef} from 'react';
import Sound from 'react-native-sound';
import {create} from 'zustand';

Sound.setCategory('Playback');

// Define the store state type
interface SoundState {
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => Promise<void>;
  toggleSound: () => Promise<void>;
}

// Create the zustand store
export const useSoundStore = create<SoundState>((set, get) => ({
  isSoundEnabled: true, // default value
  setIsSoundEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    set({isSoundEnabled: enabled});
  },
  toggleSound: async () => {
    const newState = !get().isSoundEnabled;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    set({isSoundEnabled: newState});
  },
}));

// Initialize the store with saved value
const STORAGE_KEY = '@sounds';
AsyncStorage.getItem(STORAGE_KEY).then(value => {
  if (value !== null) {
    useSoundStore.getState().setIsSoundEnabled(JSON.parse(value));
  }
});

const useSound = (soundFile: string) => {
  const soundRef = useRef<Sound | null>(null);
  const isSoundEnabled = useSoundStore(state => state.isSoundEnabled);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  const playSound = () => {
    // Don't play if sound is disabled
    if (!isSoundEnabled) {
      return;
    }

    // Release the current sound if it exists
    if (soundRef.current) {
      soundRef.current.release();
    }

    // Create a new Sound instance
    soundRef.current = new Sound(soundFile, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error('Failed to load sound', error, soundFile);
        return;
      }
      // Play the sound
      soundRef.current?.play(success => {
        if (!success) {
          console.error('Sound playback failed', soundFile);
        }
      });
    });
  };

  return {playSound};
};

export default useSound;
