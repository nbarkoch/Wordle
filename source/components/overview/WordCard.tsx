import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Canvas, LinearGradient, Rect, vec} from '@shopify/react-native-skia';
import {colors} from '~/utils/colors';
import StarCoin from '~/components/StarCoin';
import TimerIcon from '~/components/TimerIcon';
import {formatTime} from '~/components/grid/Timer';
import BasePressable from '../BasePressable';

interface WordCardProps {
  word: string;
  time: number;
  score: number;
  onPress: () => void;
}

export const WordCard = ({word, time, score, onPress}: WordCardProps) => {
  return (
    <BasePressable onPress={onPress}>
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Rect x={0} y={0} width={100} height={100}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, 100)}
              colors={['#e0b87fa0', '#bc822380']}
            />
          </Rect>
        </Canvas>
        <Text style={styles.wordText}>{word}</Text>
        <View style={styles.row}>
          <StarCoin
            size={13}
            outerRingColor={colors.darkYellow}
            innerCircleColor={colors.white}
          />
          <Text style={styles.scoreText}>{` ${score} `}</Text>
        </View>
        <View style={styles.row}>
          <TimerIcon size={13} fillColor={colors.white} />
          <Text style={styles.timeText}>{` ${formatTime(time)} `}</Text>
        </View>
      </View>
    </BasePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0b87fff',
    overflow: 'hidden',
    width: 90,
    height: 90,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  canvas: {
    width: 90,
    height: 90,
    position: 'absolute',
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
});
