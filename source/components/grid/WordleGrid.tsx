import React, {memo, Suspense, useEffect, useState} from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';
import {LetterCellLocation, LineHint} from '~/utils/words';
import WordleRow from './WordleRow';
import {ROW_SAVED_DELAY} from '~/utils/consts';
import {GameState} from '~/gameReducer';
import {withMeasure} from '../tutorial/withSpotlight';
import LoadingFallback from '../LoadingFallback';

interface WordleGridProps {
  gameState: GameState;
  onLetterSelected: (selectedLetterLocation: LetterCellLocation) => void;
  lineHint?: LineHint;
  recentReveals: boolean[];
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
      await new Promise(resolve => setTimeout(resolve, 500));
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
          const rowIndicationNum = rowIndex - currentAttempt;
          const rowIndication =
            rowIndicationNum === 0
              ? 'CURRENT'
              : rowIndicationNum < 0
              ? 'BEFORE'
              : 'AFTER';
          const isCurrentRow = rowIndication === 'CURRENT';

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
              rowIndication={rowIndication}
              reveals={recentReveals}
              spotlightId={`row-${rowIndex}`}
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
});

export default memo(withMeasure(SuspendedWordleGrid));
