import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '~/utils/colors';
import StarCoin from '~/components/StarCoin';
import TimerIcon from '~/components/TimerIcon';
import {formatTime} from '~/components/grid/Timer';
import BasePressable from '../BasePressable';
import LinearGradient from 'react-native-linear-gradient';

interface WordCardProps {
  word: string;
  time: number;
  score: number;
  disabled?: boolean;
  onPress: () => void;
}

export const WordCard = ({
  word,
  time,
  score,
  onPress,
  disabled = false,
}: WordCardProps) => {
  return (
    <BasePressable onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={['#ffffff60', '#ffffff09']}
        style={[styles.container, disabled && styles.disabled]}>
        <Text style={styles.wordText}>{word}</Text>
        <View style={styles.row}>
          <StarCoin
            size={13}
            outerRingColor={colors.darkYellow}
            innerCircleColor={colors.lightYellow}
          />
          <Text style={styles.scoreText}>{` ${score} `}</Text>
        </View>
        <View style={styles.row}>
          <TimerIcon size={13} fillColor={colors.lightGrey} />
          <Text style={styles.timeText}>{` ${formatTime(time)} `}</Text>
        </View>
      </LinearGradient>
    </BasePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 15,
    overflow: 'hidden',
    width: 90,
    height: 90,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  wordText: {
    fontWeight: '600',
    fontSize: 15,
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: colors.white,
    fontWeight: '600',
  },
  timeText: {
    color: colors.white,
  },
  disabled: {opacity: 0.35},
});
