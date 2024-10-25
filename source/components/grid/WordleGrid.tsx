import React, {memo, Suspense, useEffect, useState} from 'react';
import {View, StyleSheet, I18nManager, ActivityIndicator} from 'react-native';
import {LetterCellLocation, LineHint} from '~/utils/ui';
import WordleRow from './WordleRow';
import {ROW_SAVED_DELAY} from '~/utils/consts';
import {GameState} from '~/gameReducer';

const LoadingFallback = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color="#ffffff80" />
  </View>
);

interface WordleGridProps {
  gameState: GameState;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  lineHint?: LineHint;
  recentReveals?: boolean[];
}

const WordleGrid: React.FC<WordleGridProps> = ({
  gameState,
  onLetterSelected,
  lineHint,
  recentReveals,
}) => {
  const {
    guesses,
    currentAttempt,
    currentGuess,
    maxAttempts,
    wordLength,
    numberOfSavedRows,
    selectedLetter,
  } = gameState;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGameState = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadGameState();
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

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
              delay={(maxAttempts - rowIndex - 1) * ROW_SAVED_DELAY}
              selectedLetter={selectedLetter}
              onLetterSelected={onLetterSelected}
              lineHint={$lineHint}
              isCurrentRow={isCurrentRow}
              reveals={recentReveals}
            />
          );
        })}
    </View>
  );
};

const SuspendedWordleGrid = (props: WordleGridProps) => (
  <Suspense fallback={<LoadingFallback />}>
    <WordleGrid {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});

export default memo(SuspendedWordleGrid);
