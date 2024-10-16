import React, {memo} from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTimerStore} from '~/store/useTimerStore';
import {colors} from '~/utils/colors';

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const Timer: React.FC = () => {
  const {time} = useTimerStore();

  return <Text style={styles.timerText}>Time: {formatTime(time)}</Text>;
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.red,
    paddingLeft: 20,
  },
});

export default memo(Timer);
