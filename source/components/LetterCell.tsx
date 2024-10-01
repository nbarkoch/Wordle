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
import {Correctness, LetterCellLocation, LineHint} from '~/utils/ui';

interface LetterCellProps {
  letter: string | undefined;
  viewed?: Correctness;
  delay: number;
  rowIndex: number;
  colIndex: number;
  selectedLetter?: LetterCellLocation;
  onLetterSelected: (selectedLetterLocation?: LetterCellLocation) => void;
  lineHint?: LineHint | undefined;
}

function LetterCell({
  letter,
  viewed,
  delay,
  colIndex,
  rowIndex,
  selectedLetter,
  onLetterSelected,
  lineHint,
}: LetterCellProps) {
  const letterScale = useSharedValue(0);
  const flipValue = useSharedValue(0);
  const cellScale = useSharedValue(1);

  const [letterValue, setLetterValue] = useState<string | undefined>(letter);
  const [letterViewed, setLetterViewed] = useState<Correctness | undefined>(
    viewed,
  );

  const selected = useMemo(() => {
    return (
      selectedLetter?.colIndex === colIndex &&
      selectedLetter?.rowIndex === rowIndex
    );
  }, [colIndex, rowIndex, selectedLetter?.colIndex, selectedLetter?.rowIndex]);

  const hint = useMemo<
    {letter: string; correctness: Correctness} | undefined
  >(() => {
    return lineHint !== undefined
      ? {
          letter: lineHint?.letters[colIndex],
          correctness: lineHint?.correctness[colIndex],
        }
      : undefined;
  }, [colIndex, lineHint]);

  useEffect(() => {
    if (letterViewed === null || letterViewed === undefined) {
      if (letter) {
        letterScale.value = withSpring(1, {
          damping: 20,
          stiffness: 400,
        });
      } else {
        letterScale.value = 0;
      }
      setLetterValue(letter);
    }
  }, [letterScale, letter, letterValue, letterViewed, viewed]);

  const resetLetter = useCallback(() => {
    setLetterViewed(undefined);
  }, []);

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
    const getColor = (status: Correctness | undefined) => {
      switch (status) {
        case 'correct':
          return '#7FCCB5';
        case 'exists':
          return '#F9B033';
        case 'notInUse':
          return '#F47A89';
        default:
          return '#e5e5e5';
      }
    };

    const getHintColor = (status: Correctness | undefined) => {
      switch (status) {
        case 'correct':
          return '#c7fce6';
        case 'exists':
          return '#ffd593';
        case 'notInUse':
          return '#e5b7bc';
        default:
          return '#e5e5e5';
      }
    };

    const defaultColor = letterValue ? '#e5e5e5' : '#EDEFEC';
    const viewedColor = getColor(letterViewed);
    const hintColor = getHintColor(hint?.correctness);

    const backgroundColor =
      letterValue === undefined && hint
        ? hintColor
        : interpolateColor(
            flipValue.value,
            [0, 89, 90, 180],
            [defaultColor, defaultColor, viewedColor, viewedColor],
          );
    return {
      backgroundColor: backgroundColor,
      borderWidth: selected ? 3 : 0,
      borderColor: '#2993d1',
      transform: [{scale: cellScale.value}, {rotateX: `${flipValue.value}deg`}],
    };
  });

  const letterStyle = useAnimatedStyle(() => {
    const textColor = !letter ? 'transparent' : '#6a6a6a';

    const color = interpolateColor(
      flipValue.value,
      [0, 89, 90, 180],
      [textColor, textColor, '#ffffff', '#ffffff'],
    );

    return {
      color: color,
      transform: [
        {rotateX: `${-flipValue.value}deg`},
        {scale: hint ? 1 : letterScale.value},
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

  const $letterStyle =
    letterValue === undefined && hint ? {color: '#bfbfbf'} : letterStyle;

  return (
    <Pressable
      style={[styles.cell, styles.pressable]}
      disabled={viewed === null}
      onPress={handlePress}>
      <Animated.View style={[styles.cell, letterCellStyle]}>
        <Animated.Text style={[styles.letter, $letterStyle]}>
          {letterValue ?? hint?.letter}
        </Animated.Text>
      </Animated.View>
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

export default memo(LetterCell);
