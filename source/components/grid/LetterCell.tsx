import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
  useAnimatedReaction,
} from 'react-native-reanimated';

import {Correctness, LetterCellLocation, LineHint} from '~/utils/words';
import Cell from './Cell';
import CellOverlay, {CellOverlayRef} from './CellOverlay';
import {View} from 'react-native';
import {colors} from '~/utils/colors';

interface LetterCellProps {
  letter: string | undefined;
  correctness?: Correctness;
  delay: number;
  rowIndex: number;
  colIndex: number;
  selectedLetter?: LetterCellLocation;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  lineHint?: LineHint | undefined;
  rowIndication: 'BEFORE' | 'CURRENT' | 'AFTER';
  revealed?: boolean; // for the score only
}

function LetterCell({
  letter,
  correctness,
  delay,
  colIndex,
  rowIndex,
  selectedLetter,
  onLetterSelected,
  lineHint,
  rowIndication,
  revealed = false,
}: LetterCellProps) {
  const flipValue = useSharedValue(0);
  const cellScale = useSharedValue(1);
  const sharedCorrectness = useSharedValue<Correctness | undefined>(
    correctness,
  );
  const cellOverlayRef = useRef<CellOverlayRef>(null);
  const cellWasSelected = useRef<boolean>(false);

  const selected = useMemo(
    () =>
      selectedLetter?.colIndex === colIndex &&
      selectedLetter?.rowIndex === rowIndex,
    [selectedLetter, colIndex, rowIndex],
  );

  const hint = useMemo(
    () =>
      lineHint && {
        letter: lineHint.letters[colIndex],
        correctness: lineHint.correctness[colIndex],
      },
    [lineHint, colIndex],
  );

  useEffect(() => {
    if (cellWasSelected.current === selected) {
      return;
    }
    cellWasSelected.current = selected;
    if (!selected) {
      cellScale.value = withSequence(
        withTiming(0.97, {duration: 10}),
        withSpring(1.0, {damping: 600, stiffness: 200}),
        withSpring(1, {
          damping: 15,
          stiffness: 180,
        }),
      );
    } else {
      cellScale.value = withSequence(
        withSpring(0.9, {damping: 20, stiffness: 200}),
        withSpring(1.05, {damping: 4, stiffness: 200}),
        withSpring(1, {
          damping: 15,
          stiffness: 180,
        }),
      );
    }
    return () => {
      cancelAnimation(cellScale);
    };
  }, [cellScale, selected]);

  useAnimatedReaction(
    () => flipValue.value,
    currentFlipValue => {
      if (currentFlipValue >= 90 && correctness !== sharedCorrectness.value) {
        // Update state exactly at 90 degrees
        sharedCorrectness.value = correctness;
      }
    },
    [correctness],
  );

  useEffect(() => {
    if (correctness !== sharedCorrectness.value) {
      if (correctness) {
        if (revealed && correctness === 'correct') {
          cellOverlayRef.current?.activateOverlay(delay + 500);
        }
        flipValue.value = withDelay(delay, withTiming(180, {duration: 500}));
      } else {
        flipValue.value = withTiming(0, {duration: 500});
      }
    }
  }, [flipValue, correctness, delay, revealed]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: cellScale.value}, {rotateX: `${flipValue.value}deg`}],
    };
  });

  const $onLetterSelected = useCallback(() => {
    onLetterSelected({colIndex, rowIndex});
  }, [colIndex, rowIndex, onLetterSelected]);

  return (
    <View>
      <CellOverlay ref={cellOverlayRef} color={colors.lightGreen} />
      <Animated.View style={animatedStyle}>
        <Cell
          letter={letter}
          selected={selected}
          hint={hint}
          onLetterSelected={$onLetterSelected}
          correctnessAnim={sharedCorrectness}
          rowIndication={rowIndication}
        />
      </Animated.View>
    </View>
  );
}

export default memo(LetterCell);
