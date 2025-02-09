import React, {memo} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import {Correctness} from '~/utils/words';
interface CellProps {
  letter: string | undefined;
  onLetterSelected: () => void;
  hint?: HintInfo;
  selected?: boolean;
  correctnessAnim: SharedValue<Correctness | undefined>;
  rowIndication: 'BEFORE' | 'CURRENT' | 'AFTER';
}

const hintColorMap: {[key in Exclude<Correctness, null>]: string} = {
  correct: colors.lightGreen,
  exists: colors.lightYellow,
  notInUse: colors.lightRed,
};

const colorMap: {[key in Exclude<Correctness, null>]: string} = {
  correct: colors.green,
  exists: colors.yellow,
  notInUse: colors.red,
};

type HintInfo =
  | {
      letter: string;
      correctness: Correctness;
    }
  | undefined;

const CELL_SIZE = 45;

function Cell({
  letter,
  onLetterSelected,
  selected = false,
  hint,
  correctnessAnim,
  rowIndication,
}: CellProps) {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const backgroundColor = correctnessAnim.value
      ? colorMap[correctnessAnim.value]
      : hint?.correctness
      ? hintColorMap[hint.correctness]
      : colors.lightGrey;

    return {
      backgroundColor,
      borderWidth: withTiming(selected ? 3 : 0, {duration: 150}),
      borderColor: rowIndication === 'CURRENT' ? colors.gold : colors.blue,
      transform: [
        {
          rotateX: correctnessAnim.value ? '180deg' : '0deg',
        },
      ],
    };
  }, [selected, rowIndication, correctnessAnim.value]);

  const animatedTextStyle = useAnimatedStyle(() => {
    'worklet';
    const textColor = correctnessAnim.value
      ? colors.white
      : hint && !letter
      ? colors.grey
      : colors.darkGrey;
    return {
      color: textColor,
    };
  });

  const displayText = letter || hint?.letter || '';

  return (
    <Pressable
      style={styles.pressable}
      disabled={rowIndication === 'AFTER'}
      onPress={onLetterSelected}>
      <Animated.View
        style={[
          styles.cell,
          animatedStyle,
          rowIndication === 'CURRENT' && {
            backgroundColor: hint?.correctness
              ? hintColorMap[hint.correctness]
              : colors.lightGrey,
          },
        ]}>
        <Animated.Text
          style={[
            styles.letter,
            animatedTextStyle,
            rowIndication === 'CURRENT' && {
              color:
                hint?.correctness && !letter ? colors.grey : colors.darkGrey,
            },
          ]}>
          {displayText}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 17,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    zIndex: 10,
  },
  canvas: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 17,
  },
  letter: {fontSize: 28, fontFamily: 'PloniDL1.1AAA-Bold'},
});

export default memo(Cell);
