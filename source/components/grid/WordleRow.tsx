import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';

import {Correctness, LetterCellLocation, LineHint} from '~/utils/ui';
import LetterCell from './LetterCell';
import RowOverlay, {RowOverlayRef} from './RowOverlay';
import {LETTER_CELL_DISPLAY_DELAY} from '~/utils/consts';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface WordleRowProps {
  rowIndex: number;
  wordLength: number;
  letters: (string | undefined)[];
  correctness: Correctness[];
  shouldShowOverlay: boolean;
  delay: number;
  selectedLetter?: LetterCellLocation;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  lineHint?: LineHint;
  isCurrentRow: boolean;
}

const WordleRow: React.FC<WordleRowProps> = ({
  rowIndex,
  wordLength,
  letters,
  correctness,
  shouldShowOverlay,
  delay,
  selectedLetter,
  onLetterSelected,
  lineHint,
  isCurrentRow,
}) => {
  const rowOverlayRef = useRef<RowOverlayRef>(null);
  const scaleAnimation = useSharedValue(1);

  useEffect(() => {
    if (shouldShowOverlay) {
      rowOverlayRef.current?.activateOverlay(delay);
    }
  }, [delay, shouldShowOverlay]);

  useEffect(() => {
    scaleAnimation.value = withSpring(isCurrentRow ? 1 : 0);
  }, [isCurrentRow, scaleAnimation]);

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + scaleAnimation.value * 0.05}],
  }));

  return (
    <View style={styles.rowContainer}>
      <Animated.View style={[styles.row, rowAnimatedStyle]}>
        {Array(wordLength)
          .fill(0)
          .map((_, colIndex) => (
            <LetterCell
              key={`${rowIndex}-${colIndex}`}
              rowIndex={rowIndex}
              colIndex={colIndex}
              letter={letters[colIndex]}
              viewed={correctness[colIndex]}
              delay={colIndex * LETTER_CELL_DISPLAY_DELAY}
              selectedLetter={selectedLetter}
              onLetterSelected={onLetterSelected}
              lineHint={lineHint}
              isCurrentRow={isCurrentRow}
            />
          ))}
      </Animated.View>
      <RowOverlay ref={rowOverlayRef} aspect={1.3} />
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative',
    marginVertical: 2,
  },
  row: {
    zIndex: 10,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default WordleRow;
