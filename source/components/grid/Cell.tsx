import React, {memo, useCallback, useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import {Correctness, LetterCellLocation} from '~/utils/ui';

interface CellProps {
  letter: string | undefined;
  viewed: Correctness | undefined;
  rowIndex: number;
  colIndex: number;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  isCurrentRow?: boolean;
  hint?: HintInfo;
  selected?: boolean;
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

function Cell({
  letter,
  viewed,
  colIndex,
  rowIndex,
  onLetterSelected,
  isCurrentRow = false,
  selected = false,
  hint,
}: CellProps) {
  const animatedStyle = useMemo(() => {
    const backgroundColor = viewed
      ? getColor(viewed)
      : hint
      ? getHintColor(hint?.correctness)
      : colors.lightGrey;

    const rotation = viewed ? 180 : 0;

    return {
      backgroundColor,
      transform: [{rotateX: `${rotation}deg`}],
      borderWidth: selected ? 3 : 0,
      borderColor: isCurrentRow ? colors.gold : colors.blue,
    };
  }, [hint, viewed, selected]);

  const latterStyle = useMemo(() => {
    return {
      color: viewed
        ? colors.white
        : hint && !letter
        ? colors.grey
        : colors.darkGrey,
    };
  }, [hint, viewed, selected]);

  const handlePress = useCallback(() => {
    if (!selected) {
      onLetterSelected({colIndex, rowIndex});
    }
  }, [selected, onLetterSelected, colIndex, rowIndex]);

  return (
    <Pressable
      style={styles.pressable}
      disabled={!isCurrentRow && viewed === null}
      onPress={handlePress}>
      <View style={[styles.cell, animatedStyle]}>
        <Text style={[styles.letter, latterStyle]}>
          {letter || hint?.letter}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 45,
    height: 45,
    borderRadius: 17,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    zIndex: 10,
  },
  letter: {
    fontSize: 28,
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default memo(Cell);
