import {useRef} from 'react';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const useSound = (soundFile: string) => {
  const soundRef = useRef<Sound | null>(null);

  const playSound = () => {
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
