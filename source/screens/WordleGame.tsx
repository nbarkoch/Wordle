import React, {useState, useCallback, useEffect, ReactNode} from 'react';
import {View, StyleSheet, Pressable, Text, ViewStyle} from 'react-native';
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
import DeleteKeyIcon from '~/assets/icons/backspace-delete.svg';
import WordleGrid from './wordleGrid';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface KeyboardKeyProps {
  letter?: string;
  onPress: (key: string) => void;
  style?: ViewStyle;
  disabled?: boolean;
  children?: ReactNode;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  letter,
  onPress,
  style,
  disabled = false,
  children,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.8, {
      duration: 100,
      easing: Easing.inOut(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.inOut(Easing.quad),
    });
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[styles.key, style ?? {}, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => runOnJS(onPress)(letter ?? '')}>
      {children ?? <Text style={styles.keyText}>{letter}</Text>}
    </AnimatedPressable>
  );
};

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

export type Correctness = 'correct' | 'exists' | 'notInUse' | null;

export type WordGuess = {
  letters: string[];
  correctness: Correctness[];
};

function generateRandomWordState(): Correctness[] {
  const options: Correctness[] = ['correct', 'exists', 'notInUse'];

  return Array(5)
    .fill(null)
    .map(() => {
      const randomIndex = Math.floor(Math.random() * options.length);
      return options[randomIndex];
    });
}

const WordleGame: React.FC = () => {
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [guesses, setGuesses] = useState<WordGuess[]>(
    Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() => ({
        letters: Array(WORD_LENGTH).fill(''),
        correctness: Array(WORD_LENGTH).fill(null),
      })),
  );
  const [currentGuess, setCurrentGuess] = useState('');

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
    // if not legal word?
    if (currentGuess.length === WORD_LENGTH) {
      setGuesses(prev => {
        return prev.map((guess, index) => {
          if (index === currentAttempt) {
            return {
              letters: currentGuess.split(''),
              correctness: generateRandomWordState(),
            };
          }
          return guess;
        });
      });
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
  }, [currentGuess, currentAttempt, shakeAnimation]);

  const renderKeyboard = () => {
    const keys = 'קראטופשדגכעיחלזסבהנמצת'.split('');
    return (
      <View style={[styles.keyboard]}>
        {keys.map(key => (
          <KeyboardKey
            disabled={currentGuess.length >= WORD_LENGTH}
            key={key}
            letter={key}
            onPress={handleKeyPress}
          />
        ))}
        <KeyboardKey
          disabled={currentGuess.length === 0}
          onPress={handleDelete}
          style={styles.wideKey}>
          <DeleteKeyIcon width={40} height={50} />
        </KeyboardKey>
      </View>
    );
  };

  useEffect(() => {
    submitColorAnimation.value = withTiming(
      currentGuess.length === WORD_LENGTH ? 1 : 0,
      {duration: 300, easing: Easing.inOut(Easing.quad)},
    );
  }, [currentGuess.length, submitColorAnimation]);

  const submitButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      submitColorAnimation.value,
      [0, 1],
      ['#A0A0A0', '#4CAF50'], // Grey when disabled, Green when enabled
    );

    return {
      backgroundColor,
      transform: [{scale: submitScaleAnimation.value}],
    };
  });

  return (
    <View style={styles.container}>
      <GameBannerAd />
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
      <View style={styles.bottomContainer}>
        {renderKeyboard()}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: WORD_LENGTH * 50,
    height: MAX_ATTEMPTS * 50,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
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
    backgroundColor: '#e0e0e0',
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WordleGame;
