import React from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';

import {WordGuess} from '~/utils/ui';
import WordleRow from './WordleRow';
import {ROW_SAVED_DELAY} from '~/utils/consts';

interface WordleGridProps {
  guesses: WordGuess[];
  currentAttempt: number;
  currentGuess: string;
  maxAttempts: number;
  wordLength: number;
  numberOfSavedRows: number;
}

const WordleGrid: React.FC<WordleGridProps> = ({
  guesses,
  currentAttempt,
  currentGuess,
  maxAttempts,
  wordLength,
  numberOfSavedRows,
}) => {
  return (
    <View style={styles.grid}>
      {Array(maxAttempts)
        .fill(0)
        .map((_, rowIndex) => {
          const isCurrentRow = rowIndex === currentAttempt;

          const shouldShowOverlay = rowIndex >= maxAttempts - numberOfSavedRows;

          const letters = isCurrentRow
            ? currentGuess.split('')
            : guesses[rowIndex]?.letters || [];
          const correctness = guesses[rowIndex]?.correctness || [];

          return (
            <WordleRow
              key={rowIndex}
              rowIndex={rowIndex}
              wordLength={wordLength}
              letters={letters}
              correctness={correctness}
              shouldShowOverlay={shouldShowOverlay}
              delay={(maxAttempts - rowIndex) * ROW_SAVED_DELAY}
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

export default WordleGrid;
