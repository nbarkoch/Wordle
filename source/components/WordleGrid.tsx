import React from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';

import {WordGuess} from '~/utils/ui';
import LetterCell from './LetterCell';

interface WordleGridProps {
  guesses: WordGuess[];
  currentAttempt: number;
  currentGuess: string;
  maxAttempts: number;
  wordLength: number;
}

const WordleGrid: React.FC<WordleGridProps> = ({
  guesses,
  currentAttempt,
  currentGuess,
  maxAttempts,
  wordLength,
}) => {
  return (
    <View style={styles.grid}>
      {Array(maxAttempts)
        .fill(0)
        .map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {Array(wordLength)
              .fill(0)
              .map((__, colIndex) => {
                const letter =
                  rowIndex === currentAttempt
                    ? currentGuess[colIndex]
                    : guesses[rowIndex]?.letters[colIndex] ?? '';

                return (
                  <LetterCell
                    key={`${rowIndex}-${colIndex}`}
                    letter={letter}
                    viewed={guesses[rowIndex]?.correctness[colIndex]}
                    delay={colIndex * 100}
                  />
                );
              })}
          </View>
        ))}
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
