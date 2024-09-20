import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {View, StyleSheet, Pressable, Text, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  Easing,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import WordleGrid from '~/components/WordleGrid';
import useWordValidator from '~/database/useWordValidator';
import Keyboard from '~/components/Keyboard';
import useSecretWord from '~/database/useSecretWord';
import {
  guessesInitialGridState,
  keyboardInitialKeysState,
  MAX_ATTEMPTS,
  WORD_LENGTH,
  WordGuess,
} from '~/utils/ui';
import GameResultDialog from '~/components/GameResultDialog';
import {Canvas, LinearGradient, Rect, vec} from '@shopify/react-native-skia';
import TopBar from '~/components/TopBar';
import {useTimerStore} from '~/store/useTimerStore';
import ConfettiOverlay, {
  ConfettiOverlayRef,
} from '~/components/ConfettiOverlay';
import {useScoreStore} from '~/store/useScore';
import {ROW_SAVED_DELAY} from '~/utils/consts';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const {width, height} = Dimensions.get('window');

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

const WordleGame: React.FC = () => {
  const {evaluateGuess, secretWord, generateSecretWord} = useSecretWord();
  console.log('secretWord', secretWord);
  const {start, stop, reset} = useTimerStore();
  const {score, setScore, addScore, userScore, getScore, setUserScore} =
    useScoreStore();

  const [isGameEnd, setGameEnd] = useState<boolean>(false);
  const confettiRef = useRef<ConfettiOverlayRef>(null);
  const [numberOfSavedRows, setNumberOfSavedRows] = useState<number>(0);

  const previousCorrectLetters = useRef<Set<string>>(new Set());

  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [gameStatus, setGameStatus] = useState<
    'PLAYING' | 'SUCCESS' | 'FAILURE'
  >('PLAYING');

  function endGame(status: 'SUCCESS' | 'FAILURE') {
    stop();
    setGameStatus(status);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      checkSavedRows();
    }, 2000);
    previousCorrectLetters.current.clear();
  }

  const checkSavedRows = useCallback(() => {
    const savedRows = MAX_ATTEMPTS - currentAttempt - 1;
    setNumberOfSavedRows(savedRows);
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      setUserScore(userScore + getScore());
      setGameEnd(true);
    }, ROW_SAVED_DELAY * savedRows + 500);
  }, [userScore, currentAttempt, setUserScore, getScore]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  const handleNewGame = useCallback(() => {
    setCurrentAttempt(0);
    setGuesses(guessesInitialGridState);
    setKeyboardLetters(keyboardInitialKeysState);
    setCurrentGuess('');
    setGameEnd(false);
    setGameStatus('PLAYING');
    reset();
    start();
    generateSecretWord();
    setScore(0);
    setNumberOfSavedRows(0);
  }, [generateSecretWord, reset, setScore, start]);

  const handleGoHome = useCallback(() => {
    // Implement the logic to navigate to the home screen
    // This might involve using a navigation library or state management
    // console.log('Navigate to home screen');
  }, []);

  const [guesses, setGuesses] = useState<WordGuess[]>(guessesInitialGridState);
  const [keyboardLetters, setKeyboardLetters] = useState(
    keyboardInitialKeysState,
  );

  const [currentGuess, setCurrentGuess] = useState('');
  const {isValidWord} = useWordValidator();
  const [isValidGuess, setIsValidGuess] = useState<boolean | null>(null);

  const shakeAnimation = useSharedValue(0);

  const submitScaleAnimation = useSharedValue(1);
  const submitColorAnimation = useSharedValue(0);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + key);
      }
    },
    [currentGuess],
  );

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
        newCorrectLetters.length < WORD_LENGTH
      ) {
        confettiRef.current?.triggerFeedback('spark');
      }

      console.log('newCorrectLetters.length', newCorrectLetters.length);

      setKeyboardLetters(prev => {
        const newState = {...prev};
        currentGuess.split('').forEach((letter, index) => {
          const letterCorrectness = correctness[index];
          if (
            newState[letter] !== letterCorrectness &&
            (letterCorrectness === 'correct' ||
              (letterCorrectness === 'exists' &&
                newState[letter] === 'notInUse') ||
              (letterCorrectness === 'notInUse' && !newState[letter]))
          ) {
            newState[letter] = letterCorrectness;
          }
        });

        return newState;
      });

      const secretWordRevealed = correctness.every(
        letter => letter === 'correct',
      );
      if (secretWordRevealed) {
        confettiRef.current?.triggerFeedback('party');
        return endGame('SUCCESS');
      }
      if (currentAttempt + 1 === MAX_ATTEMPTS) {
        return endGame('FAILURE');
      }
      addScore(newCorrectLetters.length);
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
    score,
  ]);

  useEffect(() => {
    if (currentGuess.length === WORD_LENGTH) {
      setIsValidGuess(isValidWord(currentGuess));
    }
    submitColorAnimation.value = withTiming(
      currentGuess.length < WORD_LENGTH ? 0 : 1,
      {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
      },
    );
  }, [submitColorAnimation, isValidWord, currentGuess]);

  const submitButtonStyle = useAnimatedStyle(() => {
    const finalColor =
      isValidGuess === null ? '#A0A0A0' : isValidGuess ? '#7FCCB5' : '#F47A89';
    const backgroundColor = interpolateColor(
      submitColorAnimation.value,
      [0, 1, 2],
      ['#A0A0A0', finalColor],
    );

    return {
      backgroundColor,
      transform: [{scale: submitScaleAnimation.value}],
    };
  }, [isValidGuess]);

  const memoizedKeyboard = useMemo(
    () => (
      <Keyboard
        handleKeyPress={handleKeyPress}
        handleDelete={handleDelete}
        keyboardLetters={keyboardLetters}
        currentGuessLength={currentGuess.length}
      />
    ),
    [handleKeyPress, handleDelete, keyboardLetters, currentGuess.length],
  );

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={['#343D4E', '#384555', '#3A4F6C']}
          />
        </Rect>
      </Canvas>
      <View style={styles.content}>
        <GameBannerAd />
        <View>
          <TopBar score={userScore + score} />
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
              maxAttempts={MAX_ATTEMPTS}
              wordLength={WORD_LENGTH}
              numberOfSavedRows={numberOfSavedRows}
            />
          </Animated.View>
        </View>
        <View style={styles.bottomContainer}>
          {memoizedKeyboard}
          <AnimatedPressable
            disabled={currentGuess.length < WORD_LENGTH}
            style={[styles.submitButton, submitButtonStyle]}
            onPress={() => {
              submitScaleAnimation.value = withSpring(0.8, {}, () => {
                submitScaleAnimation.value = withSpring(1);
              });
              runOnJS(handleSubmit)();
            }}>
            <Text style={styles.submitButtonText}>אישור</Text>
          </AnimatedPressable>
        </View>
        <ConfettiOverlay ref={confettiRef} />
        <GameResultDialog
          isVisible={isGameEnd}
          isSuccess={gameStatus === 'SUCCESS'}
          onNewGame={handleNewGame}
          onGoHome={handleGoHome}
          currentScore={score}
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
    backgroundColor: '#343E4F',
    elevation: 6,
    borderRadius: 20,
  },
  grid: {
    width: WORD_LENGTH * 50,
    height: MAX_ATTEMPTS * 50,
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
    backgroundColor: '#7FCCB5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  canvas: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default WordleGame;
