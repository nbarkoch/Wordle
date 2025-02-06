import React, {memo, Suspense, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  I18nManager,
  ActivityIndicator,
  Text,
} from 'react-native';
import {LetterCellLocation, LineHint} from '~/utils/words';
import WordleRow from './WordleRow';
import {ROW_SAVED_DELAY} from '~/utils/consts';
import {GameState} from '~/gameReducer';

const LoadingFallback = () => (
  <View style={styles.loading}>
    <Text style={styles.loadingText}>{'טוען..'}</Text>
    <ActivityIndicator size="large" color="#ffffff80" />
  </View>
);

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
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{scale: 1.5}],
    gap: 10,
    borderRadius: 20,
    backgroundColor: '#00000025',
    width: 120,
    height: 110,
  },
  loadingText: {
    color: '#fffffff0',
    fontFamily: 'PloniDL1.1AAA-Bold',
    fontSize: 16,
  },
});

export default memo(SuspendedWordleGrid);
