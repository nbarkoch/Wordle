import React, {memo} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {useTimerStore} from '~/store/useTimerStore';
import {colors} from '~/utils/colors';
import TimerIcon from '../TimerIcon';

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const color = colors.lightRed;

const Timer: React.FC = () => {
  const {time} = useTimerStore();
  return (
    <View style={styles.container}>
      <TimerIcon size={24} fillColor={color} />
      <Text style={styles.timerText}>{` ${formatTime(time)}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 18,
    fontWeight: '900',
    color: color,
  },
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
  },
});

export default memo(Timer);
