import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';

import {Correctness} from '~/utils/ui';
import LetterCell from './LetterCell';
import RowOverlay, {RowOverlayRef} from './RowOverlay';
import Animated from 'react-native-reanimated';
import {LETTER_CELL_DISPLAY_DELAY} from '~/utils/consts';

interface WordleRowProps {
  rowIndex: number;
  wordLength: number;
  letters: string[];
  correctness: Correctness[];
  shouldShowOverlay: boolean;
  delay: number;
}

const WordleRow: React.FC<WordleRowProps> = ({
  rowIndex,
  wordLength,
  letters,
  correctness,
  shouldShowOverlay,
  delay,
}) => {
  const rowOverlayRef = useRef<RowOverlayRef>(null);

  useEffect(() => {
    if (shouldShowOverlay) {
      rowOverlayRef.current?.activateOverlay(delay);
    }
  }, [delay, shouldShowOverlay]);

  return (
    <View style={styles.rowContainer}>
      <Animated.View style={styles.row}>
        {Array(wordLength)
          .fill(0)
          .map((_, colIndex) => (
            <LetterCell
              key={`${rowIndex}-${colIndex}`}
              letter={letters[colIndex] || ''}
              viewed={correctness[colIndex]}
              delay={colIndex * LETTER_CELL_DISPLAY_DELAY}
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
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default WordleRow;
