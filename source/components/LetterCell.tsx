import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import {Correctness} from '~/utils/ui';

export type LetterCellLocation = {rowIndex: number; colIndex: number};
interface LetterCellProps {
  letter: string;
  viewed?: Correctness;
  delay: number;
  rowIndex: number;
  colIndex: number;
  selectedLetter?: LetterCellLocation;
  onLetterSelected: (selectedLetterLocation?: LetterCellLocation) => void;
}

function LetterCell({
  letter,
  viewed,
  delay,
  colIndex,
  rowIndex,
  selectedLetter,
  onLetterSelected,
}: LetterCellProps) {
  const animatedValue = useSharedValue(0);
  const flipValue = useSharedValue(0);
  const cellScale = useSharedValue(1);

  const [letterValue, setLetterValue] = useState<string>(letter);
  const [letterViewed, setLetterViewed] = useState<Correctness | undefined>(
    viewed,
  );

  const selected = useMemo(() => {
    return (
      selectedLetter?.colIndex === colIndex &&
      selectedLetter?.rowIndex === rowIndex
    );
  }, [colIndex, rowIndex, selectedLetter?.colIndex, selectedLetter?.rowIndex]);

  useEffect(() => {
    if (letterViewed === null || letterViewed === undefined) {
      setLetterValue(letter);
    }
    if (letter !== '') {
      animatedValue.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
    }
  }, [animatedValue, letter, letterViewed, viewed]);

  const resetLetter = useCallback(() => {
    setLetterViewed(undefined);
    animatedValue.value = 0;
  }, [animatedValue]);

  useEffect(() => {
    if (viewed) {
      setLetterViewed(viewed);
      flipValue.value = withDelay(delay, withTiming(180, {duration: 500}));
    } else if (viewed !== letterViewed) {
      flipValue.value = withTiming(0, {duration: 500}, finished => {
        if (finished) {
          runOnJS(resetLetter)();
        }
      });
    }
  }, [flipValue, viewed, delay, resetLetter, letterViewed]);

  const letterCellStyle = useAnimatedStyle(() => {
    const color =
      letterViewed === 'correct'
        ? '#7FCCB5'
        : letterViewed === 'exists'
        ? '#F9B033'
        : '#F47A89';

    const defaultColor = letterValue ? '#e5e5e5' : '#EDEFEC';
    const backgroundColor = interpolateColor(
      flipValue.value,
      [0, 89, 90, 180],
      [defaultColor, defaultColor, color, color],
    );

    return {
      backgroundColor,
      borderWidth: selected ? 3 : 0,
      borderColor: '#2993d1',
      transform: [{scale: cellScale.value}, {rotateX: `${flipValue.value}deg`}],
    };
  });

  const letterStyle = useAnimatedStyle(() => {
    const textColor = letter === '' ? 'transparent' : '#6a6a6a';

    const color = interpolateColor(
      flipValue.value,
      [0, 89, 90, 180],
      [textColor, textColor, '#ffffff', '#ffffff'],
    );
    return {
      color,
      transform: [
        {rotateX: `${-flipValue.value}deg`},
        {scale: animatedValue.value},
      ],
    };
  });

  useEffect(() => {
    if (!selected) {
      cellScale.value = 0.8;
      cellScale.value = withSpring(
        1.0,
        {damping: 6, stiffness: 200},
        $finished => {
          if ($finished) {
            cellScale.value = withSpring(1, {
              damping: 15,
              stiffness: 180,
            });
          }
        },
      );
    }
  }, [cellScale, selected]);

  const handlePress = useCallback(() => {
    if (!selected) {
      onLetterSelected({colIndex, rowIndex});
    } else {
      onLetterSelected(undefined);
    }

    if (!selected) {
      cellScale.value = withSpring(
        0.9,
        {damping: 20, stiffness: 200},
        finished => {
          if (finished) {
            cellScale.value = withSpring(
              1.05,
              {damping: 4, stiffness: 200},
              $finished => {
                if ($finished) {
                  cellScale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 180,
                  });
                }
              },
            );
          }
        },
      );
    }
  }, [selected, onLetterSelected, colIndex, rowIndex, cellScale]);

  if (selected) {
    console.log('render');
  }
  return (
    <Pressable style={[styles.cell, styles.pressable]} onPress={handlePress}>
      <Animated.View style={[styles.cell, letterCellStyle]}>
        <Animated.Text style={[styles.letter, letterStyle]}>
          {letterValue}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    zIndex: 10,
  },
  letter: {
    fontSize: 24,
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default memo(LetterCell);
