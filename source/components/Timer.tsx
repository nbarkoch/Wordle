import React, {useEffect, useState, useCallback} from 'react';
import {Text, StyleSheet} from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

interface TimerProps {
  isActive: boolean;
  onTimerUpdate?: (time: number) => void;
}

const Timer: React.FC<TimerProps> = ({isActive, onTimerUpdate}) => {
  const timerValue = useSharedValue(0);
  const [displayTime, setDisplayTime] = useState('00:00');

  const updateDisplayTime = useCallback((value: number) => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
    setDisplayTime(timeString);
  }, []);

  useEffect(() => {
    let intervalId: number | null = null;
    if (isActive) {
      intervalId = setInterval(() => {
        timerValue.value += 1;
        if (onTimerUpdate) {
          onTimerUpdate(timerValue.value);
        }
      }, 1000);
    } else if (intervalId) {
      clearInterval(intervalId);
      timerValue.value = 0;
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, onTimerUpdate, timerValue]);

  useAnimatedReaction(
    () => timerValue.value,
    value => {
      runOnJS(updateDisplayTime)(value);
    },
    [timerValue],
  );

  return <Text style={styles.timerText}>Time: {displayTime}</Text>;
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F47A89',
    paddingLeft: 20,
  },
});

export default Timer;
