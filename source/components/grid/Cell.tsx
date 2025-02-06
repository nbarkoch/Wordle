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

const getColor = (status: Correctness | undefined) => {
  'worklet';
  switch (status) {
    case 'correct':
      return colors.green;
    case 'exists':
      return colors.yellow;
    case 'notInUse':
      return colors.red;
    default:
      return colors.lightGrey;
  }
};

const getHintColor = (status: Correctness | undefined) => {
  'worklet';
  switch (status) {
    case 'correct':
      return colors.lightGreen;
    case 'exists':
      return colors.lightYellow;
    case 'notInUse':
      return colors.lightRed;
    default:
      return colors.lightGrey;
  }
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
      ? getColor(correctnessAnim.value)
      : hint
      ? getHintColor(hint?.correctness)
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
            backgroundColor: hint
              ? getHintColor(hint?.correctness)
              : colors.lightGrey,
          },
        ]}>
        <Animated.Text
          style={[
            styles.letter,
            animatedTextStyle,
            rowIndication === 'CURRENT' && {
              color: hint && !letter ? colors.grey : colors.darkGrey,
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
