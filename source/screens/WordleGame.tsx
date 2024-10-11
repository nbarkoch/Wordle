import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {View, StyleSheet, Dimensions, ScrollView} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import WordleGrid from '~/components/grid/WordleGrid';
import useWordValidator from '~/database/useWordValidator';
import Keyboard from '~/components/grid/Keyboard';
import useSecretWord from '~/database/useSecretWord';
import {
  calculateHintForLetter,
  giveHint,
  guessesInitialGridState,
  keyboardInitialKeysState,
  LetterCellLocation,
  LineHint,
  mergeHints,
  WordGuess,
} from '~/utils/ui';
import GameResultDialog from '~/components/dialogs/GameResultDialog';
import TopBar from '~/components/grid/TopBar';
import {useTimerStore} from '~/store/useTimerStore';
import ConfettiOverlay, {
  ConfettiOverlayRef,
} from '~/components/ConfettiOverlay';
import {useScoreStore} from '~/store/useScore';
import {ROW_SAVED_DELAY} from '~/utils/consts';
import HintWordButton from '~/components/grid/HintWordsButton';
import SubmitButton from '~/components/grid/SubmitButton';
import AboutButton from '~/components/grid/AboutButton';
import {
  WordGameScreenProps,
  WordleGameNavigationProp,
} from '~/navigation/types';
import {useNavigation} from '@react-navigation/native';
import CanvasBackground from '~/utils/canvas';
import GradientOverlayScrollView from '~/components/GridScrollView';
import {colors} from '~/utils/colors';

const {width} = Dimensions.get('window');

const GameBannerAd = () => {
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'YOUR_PRODUCTION_BANNER_AD_UNIT_ID';

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
};

const WordleGame: React.FC<WordGameScreenProps> = ({
  route: {
    params: {maxAttempts, wordLength, enableTimer = false},
  },
}) => {
  const {evaluateGuess, secretWord, generateSecretWord} =
    useSecretWord(wordLength);

  useEffect(() => {
    console.log('secretWord', secretWord);
  }, [secretWord]);

  const {start, stop, reset} = useTimerStore();
  const {setScore, addScore, getScore, setUserScore, removeFromUserScore} =
    useScoreStore();

  const [isGameEnd, setGameEnd] = useState<boolean>(false);
  const confettiRef = useRef<ConfettiOverlayRef>(null);
  const [numberOfSavedRows, setNumberOfSavedRows] = useState<number>(0);
  const initialGuessesState = guessesInitialGridState(maxAttempts, wordLength);
  const [selectedLetter, setSelectedLetter] = useState<LetterCellLocation>({
    rowIndex: 0,
    colIndex: 0,
  });
  const [lineHint, setLineHint] = useState<LineHint | undefined>();
  const [lineSearch, setLineSearch] = useState<LineHint | undefined>();

  const previousCorrectLetters = useRef<Set<string>>(new Set());

  const [currentAttempt, setCurrentAttempt] = useState(0);

  const [gameStatus, setGameStatus] = useState<
    'PLAYING' | 'SUCCESS' | 'FAILURE'
  >('PLAYING');

  function endGame(status: 'SUCCESS' | 'FAILURE') {
    stop();
    setSelectedLetter({rowIndex: -1, colIndex: -1});
    setLineHint(undefined);
    setLineSearch(undefined);
    setGameStatus(status);
    if (status === 'SUCCESS') {
      const delayConfetti = setTimeout(() => {
        confettiRef.current?.triggerFeedback('party');
        clearTimeout(delayConfetti);
      }, 400);
    }
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      checkSavedRows();
    }, 2000);
    previousCorrectLetters.current.clear();
  }

  const checkSavedRows = useCallback(() => {
    const savedRows = maxAttempts - currentAttempt - 1;
    setNumberOfSavedRows(savedRows);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      setGameEnd(true);
    }, ROW_SAVED_DELAY * savedRows + 500);
  }, [currentAttempt, maxAttempts]);

  useEffect(() => {
    if (enableTimer) {
      start();
    }
    return () => stop();
  }, [start, enableTimer, stop]);

  const handleNewGame = useCallback(() => {
    setCurrentAttempt(0);
    setGuesses(initialGuessesState);
    setKeyboardLetters(keyboardInitialKeysState);
    setCurrentGuess([]);
    setGameEnd(false);
    setGameStatus('PLAYING');
    setSelectedLetter({rowIndex: 0, colIndex: 0});
    if (enableTimer) {
      reset();
      start();
    }
    generateSecretWord();
    setNumberOfSavedRows(0);
    setScore(0);
    global.gc?.();
  }, [initialGuessesState, reset, start, generateSecretWord, setScore]);

  const navigation = useNavigation<WordleGameNavigationProp>();

  const handleGoHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    return handleNewGame;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [guesses, setGuesses] = useState<WordGuess[]>(initialGuessesState);
  const [keyboardLetters, setKeyboardLetters] = useState(
    keyboardInitialKeysState,
  );

  const [currentGuess, setCurrentGuess] = useState<(string | undefined)[]>([]);
  const {isValidWord} = useWordValidator(wordLength);
  const [isValidGuess, setIsValidGuess] = useState<boolean | null>(null);

  const shakeAnimation = useSharedValue(0);

  const onHintRequested = useCallback(async () => {
    giveHint(secretWord, guesses, lineHint).then($lineHint => {
      removeFromUserScore(10);
      setLineHint(prev => {
        return mergeHints(prev, $lineHint);
      });
    });
  }, [secretWord, guesses, lineHint, removeFromUserScore]);

  const finalLineHint = useMemo(() => {
    return mergeHints(
      selectedLetter?.rowIndex !== currentAttempt ? lineSearch : undefined,
      lineHint,
    );
  }, [selectedLetter?.rowIndex, currentAttempt, lineSearch, lineHint]);

  const $setSelectedLetter = useCallback(
    async ($selectedLetter: LetterCellLocation) => {
      setSelectedLetter($selectedLetter);
      if (currentAttempt === $selectedLetter?.rowIndex) {
        setLineSearch(undefined);
        return;
      }
      if ($selectedLetter) {
        const $lineSearch = await calculateHintForLetter(
          guesses,
          $selectedLetter,
        );
        setLineSearch($lineSearch);
      } else {
        setLineSearch(undefined);
      }
    },
    [guesses, currentAttempt],
  );

  const onInfoRequested = useCallback(async () => {
    removeFromUserScore(5);
  }, [removeFromUserScore]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (currentGuess.length <= wordLength) {
        if (selectedLetter.rowIndex === currentAttempt) {
          setCurrentGuess(prev => {
            const newGuess = [...prev];
            newGuess[selectedLetter.colIndex] = key;
            return newGuess;
          });
          setSelectedLetter(prev => {
            if (selectedLetter.colIndex < wordLength - 1) {
              return {...prev, colIndex: prev.colIndex + 1};
            } else {
              return prev;
            }
          });
        }
      }
    },
    [
      currentGuess.length,
      wordLength,
      selectedLetter,
      currentAttempt,
      setSelectedLetter,
    ],
  );
  const handleDelete = useCallback(() => {
    setCurrentGuess(prev => {
      const updatedGuess = [...prev];
      let newColIndex = selectedLetter.colIndex;

      // If there's a letter at the current position, delete it
      if (updatedGuess[newColIndex] !== undefined) {
        updatedGuess[newColIndex] = undefined;
      }
      // Otherwise, move left and delete (if not at the start)
      else if (newColIndex > 0) {
        newColIndex--;
        updatedGuess[newColIndex] = undefined;
      }

      // Update the selected letter position
      setSelectedLetter(prevSelected => ({
        ...prevSelected,
        colIndex: newColIndex,
      }));

      return updatedGuess;
    });
  }, [selectedLetter.colIndex]);
  const handleSubmit = useCallback(() => {
    if (isValidGuess && currentGuess.every(letter => letter !== undefined)) {
      const correctness = evaluateGuess(currentGuess.join(''));
      const currentLetters = [...currentGuess];
      setGuesses(prev =>
        prev.map((guess, index) =>
          index === currentAttempt
            ? {letters: currentLetters, correctness}
            : guess,
        ),
      );

      const newCorrectLetters = currentLetters.filter(
        (letter, index) =>
          correctness[index] === 'correct' &&
          !previousCorrectLetters.current.has(letter),
      );
      newCorrectLetters.forEach(letter =>
        previousCorrectLetters.current.add(letter),
      );

      const secretWordRevealed = correctness.every(
        letter => letter === 'correct',
      );

      if (
        newCorrectLetters.length >= 3 &&
        newCorrectLetters.length < wordLength &&
        !secretWordRevealed
      ) {
        confettiRef.current?.triggerFeedback('spark');
      }

      setKeyboardLetters(prev => {
        const newState = {...prev};
        currentLetters.forEach((letter, index) => {
          const letterCorrectness = correctness[index];
          if (
            letterCorrectness === 'correct' ||
            (letterCorrectness === 'exists' &&
              newState[letter] !== 'correct') ||
            (letterCorrectness === 'notInUse' && !newState[letter])
          ) {
            newState[letter] = letterCorrectness;
          }
        });
        return newState;
      });

      addScore(newCorrectLetters.length);
      if (secretWordRevealed) {
        return endGame('SUCCESS');
      }
      if (currentAttempt + 1 === maxAttempts) {
        return endGame('FAILURE');
      }
      setLineHint(undefined);
      setLineSearch(undefined);
      setCurrentAttempt(prev => prev + 1);
      setSelectedLetter({
        rowIndex: currentAttempt + 1,
        colIndex: 0,
      });
      setCurrentGuess([]);
    } else {
      // New shake animation
      shakeAnimation.value = withSequence(
        withTiming(-5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(-5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 50, easing: Easing.inOut(Easing.quad)}),
      );
    }
  }, [
    isValidGuess,
    evaluateGuess,
    currentGuess,
    currentAttempt,
    shakeAnimation,
    setUserScore,
  ]);

  useEffect(() => {
    const guessStr = currentGuess.join('');
    if (guessStr.length === wordLength) {
      setIsValidGuess(isValidWord(guessStr));
    } else {
      setIsValidGuess(null);
    }
  }, [isValidWord, currentGuess, wordLength]);

  return (
    <View style={styles.container}>
      <CanvasBackground />
      <View style={styles.content}>
        <GameBannerAd />
        <TopBar displayTimer={enableTimer} />
        <GradientOverlayScrollView
          upperColor={'#343D4E'}
          bottomColor={'#3A4F6C'}
          gradientHeight={20}>
          <Animated.View
            style={[
              styles.gridContainer,
              useAnimatedStyle(() => ({
                transform: [{translateX: shakeAnimation.value}],
              })),
            ]}>
            <WordleGrid
              guesses={guesses}
              currentAttempt={currentAttempt}
              currentGuess={currentGuess}
              maxAttempts={maxAttempts}
              wordLength={wordLength}
              numberOfSavedRows={numberOfSavedRows}
              selectedLetter={selectedLetter}
              onLetterSelected={$setSelectedLetter}
              lineHint={finalLineHint}
            />
          </Animated.View>
        </GradientOverlayScrollView>
        <View style={styles.bottomContainer}>
          <Keyboard
            disabled={selectedLetter.rowIndex !== currentAttempt}
            handleKeyPress={handleKeyPress}
            handleDelete={handleDelete}
            keyboardLetters={keyboardLetters}
            disableDelete={
              selectedLetter.colIndex === 0 && currentGuess[0] === undefined
            }
          />
          <View style={styles.footer}>
            <View style={styles.centerer}>
              <AboutButton onInfoRequested={onInfoRequested} scoreCost={5} />
            </View>
            <SubmitButton
              handleSubmit={handleSubmit}
              isValidGuess={isValidGuess}
            />
            <View style={styles.centerer}>
              <HintWordButton
                onHintRequested={onHintRequested}
                scoreCost={10}
              />
            </View>
          </View>
        </View>
        <ConfettiOverlay ref={confettiRef} />
        <GameResultDialog
          isVisible={isGameEnd}
          isSuccess={gameStatus === 'SUCCESS'}
          onNewGame={handleNewGame}
          onGoHome={handleGoHome}
          currentScore={getScore()}
          secretWord={secretWord}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderColor: 'white',
    // borderWidth: 2,
    borderRadius: 20,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  keyboard: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  key: {
    width: 32,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    marginVertical: 5,

    borderRadius: 5,
  },
  wideKey: {
    width: 65,
  },
  keyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  footer: {
    width: width,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WordleGame;
