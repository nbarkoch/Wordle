import React, {memo} from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';

import {LetterCellLocation, LineHint, WordGuess} from '~/utils/ui';
import WordleRow from './WordleRow';
import {ROW_SAVED_DELAY} from '~/utils/consts';

interface WordleGridProps {
  guesses: WordGuess[];
  currentAttempt: number;
  currentGuess: (string | undefined)[];
  maxAttempts: number;
  wordLength: number;
  numberOfSavedRows: number;
  selectedLetter?: LetterCellLocation;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  lineHint?: LineHint;
}

const WordleGrid: React.FC<WordleGridProps> = ({
  guesses,
  currentAttempt,
  currentGuess,
  maxAttempts,
  wordLength,
  numberOfSavedRows,
  selectedLetter,
  onLetterSelected,
  lineHint,
}) => {
  return (
    <View style={styles.grid}>
      {Array(maxAttempts)
        .fill(0)
        .map((_, rowIndex) => {
          const isCurrentRow = rowIndex === currentAttempt;

          const shouldShowOverlay = rowIndex >= maxAttempts - numberOfSavedRows;

          const letters = isCurrentRow
            ? currentGuess
            : guesses[rowIndex]?.letters || [];
          const correctness = guesses[rowIndex]?.correctness || [];

          const $lineHint = isCurrentRow ? lineHint : undefined;
          return (
            <WordleRow
              key={rowIndex}
              rowIndex={rowIndex}
              wordLength={wordLength}
              letters={letters}
              correctness={correctness}
              shouldShowOverlay={shouldShowOverlay}
              delay={(maxAttempts - rowIndex) * ROW_SAVED_DELAY}
              selectedLetter={selectedLetter}
              onLetterSelected={onLetterSelected}
              lineHint={$lineHint}
              isCurrentRow={isCurrentRow}
            />
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
});

export default memo(WordleGrid);
