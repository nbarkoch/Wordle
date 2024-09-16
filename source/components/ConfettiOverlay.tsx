import LottieView from 'lottie-react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import {WordGuess} from '~/utils/ui';

const {width, height} = Dimensions.get('window');

interface ConfettiOverlayProps {
  guesses: WordGuess[];
  currentAttempt: number;
  secretWord: string;
}

function ConfettiOverlay({
  guesses,
  currentAttempt,
  secretWord,
}: ConfettiOverlayProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const previousCorrectLetters = useRef<Set<string>>(new Set());
  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const animateFeedbackOut = useCallback(() => {
    textScale.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    textOpacity.value = withTiming(
      0,
      {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      },
      finished => {
        if (finished) {
          runOnJS(setShowFeedback)(false);
        }
      },
    );
  }, [textOpacity, textScale]);

  useEffect(() => {
    previousCorrectLetters.current.clear();
  }, [secretWord]);

  useEffect(() => {
    if (currentAttempt > 0) {
      const lastGuess = guesses[currentAttempt - 1];
      if (lastGuess) {
        const newCorrectLetters = lastGuess.letters.filter(
          (letter, index) =>
            lastGuess.correctness[index] === 'correct' &&
            !previousCorrectLetters.current.has(letter),
        );

        if (newCorrectLetters.length >= 3) {
          setShowFeedback(true);
          textScale.value = withSpring(1, {damping: 5, stiffness: 80});
          textOpacity.value = withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.cubic),
          });

          newCorrectLetters.forEach(letter =>
            previousCorrectLetters.current.add(letter),
          );

          // Hide feedback after 3 seconds
          setTimeout(animateFeedbackOut, 3000);
        }
      }
    }
  }, [currentAttempt, guesses, textScale, textOpacity, animateFeedbackOut]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{scale: textScale.value}],
    opacity: textOpacity.value,
  }));

  return (
    <>
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <LottieView
            style={styles.confetti}
            source={require('~/assets/lottie/confetti_1.json')}
            autoPlay
            loop={false}
          />
          <Animated.Text style={[styles.niceText, animatedTextStyle]}>
            NICE!
          </Animated.Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  niceText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#84f4ff',
    textShadowColor: '#353f4f',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 20,
    padding: 20,
  },
});

export default ConfettiOverlay;
