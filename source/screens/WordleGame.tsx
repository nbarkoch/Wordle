import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import WordleGrid from '~/components/WordleGrid';
import useWordValidator from '~/database/useWordValidator';
import Keyboard from '~/components/Keyboard';
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
import GameResultDialog from '~/components/GameResultDialog';
import TopBar from '~/components/TopBar';
import {useTimerStore} from '~/store/useTimerStore';
import ConfettiOverlay, {
  ConfettiOverlayRef,
} from '~/components/ConfettiOverlay';
import {useScoreStore} from '~/store/useScore';
import {ROW_SAVED_DELAY} from '~/utils/consts';
import HintWordButton from '~/components/HintWordsButton';
import SubmitButton from '~/components/SubmitButton';
import AboutButton from '~/components/AboutButton';
import {
  WordGameScreenProps,
  WordleGameNavigationProp,
} from '~/navigation/types';
import {useNavigation} from '@react-navigation/native';
import CanvasBackground from '~/utils/canvas';

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
    params: {maxAttempts, wordLength},
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
  const [selectedLetter, setSelectedLetter] = useState<
    LetterCellLocation | undefined
  >();
  const [lineHint, setLineHint] = useState<LineHint | undefined>();
  const [lineSearch, setLineSearch] = useState<LineHint | undefined>();

  const previousCorrectLetters = useRef<Set<string>>(new Set());

  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [gameStatus, setGameStatus] = useState<
    'PLAYING' | 'SUCCESS' | 'FAILURE'
  >('PLAYING');

  function endGame(status: 'SUCCESS' | 'FAILURE') {
    stop();
    setSelectedLetter(undefined);
    setLineHint(undefined);
    setLineSearch(undefined);
    setGameStatus(status);
    const delayConfetti = setTimeout(() => {
      confettiRef.current?.triggerFeedback('party');
      clearTimeout(delayConfetti);
    }, 750);
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
    start();
    return () => stop();
  }, [start, stop]);

  const handleNewGame = useCallback(() => {
    setCurrentAttempt(0);
    setGuesses(initialGuessesState);
    setKeyboardLetters(keyboardInitialKeysState);
    setCurrentGuess('');
    setGameEnd(false);
    setGameStatus('PLAYING');
    reset();
    start();
    generateSecretWord();
    setNumberOfSavedRows(0);
    setScore(0);
  }, [initialGuessesState, reset, start, generateSecretWord, setScore]);

  const navigation = useNavigation<WordleGameNavigationProp>();

  const handleGoHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const [guesses, setGuesses] = useState<WordGuess[]>(initialGuessesState);
  const [keyboardLetters, setKeyboardLetters] = useState(
    keyboardInitialKeysState,
  );

  const [currentGuess, setCurrentGuess] = useState('');
  const {isValidWord} = useWordValidator(wordLength);
  const [isValidGuess, setIsValidGuess] = useState<boolean | null>(null);

  const shakeAnimation = useSharedValue(0);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (currentGuess.length < wordLength) {
        setCurrentGuess(prev => prev + key);
      }
    },
    [currentGuess, wordLength],
  );

  const onHintRequested = useCallback(async () => {
    giveHint(secretWord, guesses, lineHint).then($lineHint => {
      removeFromUserScore(10);
      setLineHint(prev => {
        return mergeHints(prev, $lineHint);
      });
    });
  }, [secretWord, guesses, lineHint, removeFromUserScore]);

  const finalLineHint = useMemo(() => {
    return mergeHints(lineSearch, lineHint);
  }, [lineSearch, lineHint]);

  const $setSelectedLetter = useCallback(
    async ($selectedLetter: LetterCellLocation | undefined) => {
      setSelectedLetter($selectedLetter);
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
    [guesses],
  );

  const onInfoRequested = useCallback(async () => {
    removeFromUserScore(5);
  }, [removeFromUserScore]);

  const handleDelete = useCallback(() => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (isValidGuess) {
      const correctness = evaluateGuess(currentGuess);
      const currentLetters = currentGuess.split('');
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

      if (
        newCorrectLetters.length >= 3 &&
        newCorrectLetters.length < wordLength
      ) {
        confettiRef.current?.triggerFeedback('spark');
      }

      setKeyboardLetters(prev => {
        const newState = {...prev};
        currentGuess.split('').forEach((letter, index) => {
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

      const secretWordRevealed = correctness.every(
        letter => letter === 'correct',
      );
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
      setCurrentGuess('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isValidGuess,
    evaluateGuess,
    currentGuess,
    currentAttempt,
    shakeAnimation,
    setUserScore,
  ]);

  useEffect(() => {
    if (currentGuess.length === wordLength) {
      setIsValidGuess(isValidWord(currentGuess));
    } else {
      setIsValidGuess(null);
    }
  }, [isValidWord, currentGuess, wordLength]);

  return (
    <View style={styles.container}>
      <CanvasBackground />
      <View style={styles.content}>
        <GameBannerAd />
        <View>
          <TopBar />
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
        </View>
        <View style={styles.bottomContainer}>
          <Keyboard
            handleKeyPress={handleKeyPress}
            handleDelete={handleDelete}
            keyboardLetters={keyboardLetters}
            currentGuessLength={currentGuess.length}
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
    justifyContent: 'space-between',
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
