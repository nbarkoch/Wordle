import React, {useState, useCallback, useEffect} from 'react';
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
import WordleGrid from './wordleGrid';
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
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [gameStatus, setGameStatus] = useState<
    'PLAYING' | 'SUCCESS' | 'FAILURE'
  >('PLAYING');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);

  function endGame(status: 'SUCCESS' | 'FAILURE') {
    setGameStatus(status);
    if (status === 'SUCCESS') {
      setScore(prevScore => prevScore + 1);
    }
  }

  const handleNewGame = useCallback(() => {
    setCurrentAttempt(0);
    setGuesses(guessesInitialGridState);
    setKeyboardLetters(keyboardInitialKeysState);
    setCurrentGuess('');
    setGameStatus('PLAYING');
    setTimer(0);
    generateSecretWord();
  }, [generateSecretWord]);

  const handleGoHome = useCallback(() => {
    // Implement the logic to navigate to the home screen
    // This might involve using a navigation library or state management
    console.log('Navigate to home screen');
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
      setGuesses(prev =>
        prev.map((guess, index) =>
          index === currentAttempt
            ? {letters: currentGuess.split(''), correctness}
            : guess,
        ),
      );
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
      if (secretWordRevealed) {
        return endGame('SUCCESS');
      }
      if (currentAttempt + 1 === MAX_ATTEMPTS) {
        return endGame('FAILURE');
      }
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
  }, [
    isValidGuess,
    evaluateGuess,
    currentGuess,
    currentAttempt,
    shakeAnimation,
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

  const handleTimerUpdate = useCallback((newTime: number) => {
    setTimer(newTime);
  }, []);

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
          <TopBar
            score={score}
            isGameActive={gameStatus === 'PLAYING'}
            onTimerUpdate={handleTimerUpdate}
          />
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
        <GameResultDialog
          isVisible={gameStatus !== 'PLAYING'}
          isSuccess={gameStatus === 'SUCCESS'}
          onNewGame={handleNewGame}
          onGoHome={handleGoHome}
          currentScore={0}
          bestScore={0}
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
