import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

import {Correctness, LetterCellLocation, LineHint} from '~/utils/ui';
import Cell from './Cell';
import CellOverlay, {CellOverlayRef} from './CellOverlay';
import {View} from 'react-native';

interface LetterCellProps {
  letter: string | undefined;
  viewed?: Correctness;
  delay: number;
  rowIndex: number;
  colIndex: number;
  selectedLetter?: LetterCellLocation;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  lineHint?: LineHint | undefined;
  isCurrentRow?: boolean;
  revealed?: boolean;
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
  isCurrentRow = false,
  revealed = false,
}: LetterCellProps) {
  const flipValue = useSharedValue(0);
  const cellScale = useSharedValue(1);
  const cellOverlayRef = useRef<CellOverlayRef>(null);
  const cellWasSelected = useRef<boolean>(false);

  const [viewedState, setViewedState] = useState<Correctness | undefined>(
    viewed,
  );

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
      if (currentFlipValue >= 90 && viewed !== viewedState) {
        // Update state exactly at 90 degrees
        runOnJS(setViewedState)(viewed);
      }
    },
    [viewed],
  );

  useEffect(() => {
    if (viewed !== viewedState) {
      if (viewed) {
        if (revealed && viewed !== viewedState && viewed === 'correct') {
          cellOverlayRef.current?.activateOverlay(delay + 500);
        }
        flipValue.value = withDelay(delay, withTiming(180, {duration: 500}));
      } else {
        flipValue.value = withTiming(0, {duration: 500});
      }
    }
  }, [flipValue, viewed, delay, viewedState, revealed]);

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
      <CellOverlay ref={cellOverlayRef} />
      <Animated.View style={animatedStyle}>
        <Cell
          letter={letter}
          viewed={viewedState}
          selected={selected}
          isCurrentRow={isCurrentRow}
          hint={hint}
          onLetterSelected={$onLetterSelected}
        />
      </Animated.View>
    </View>
  );
}

export default memo(LetterCell);
