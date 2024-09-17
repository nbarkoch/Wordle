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
  gameStatus: 'PLAYING' | 'SUCCESS' | 'FAILURE';
}

type ConfettiType = 'spark' | 'party';

type Feedback = {
  type: ConfettiType;
  text: string;
};

function ConfettiOverlay({
  guesses,
  currentAttempt,
  gameStatus,
}: ConfettiOverlayProps) {
  const [showFeedback, setShowFeedback] = useState<Feedback | null>(null);

  const timeout = useRef<number | null>(null);

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
          runOnJS(setShowFeedback)(null);
        }
      },
    );
  }, [textOpacity, textScale]);

  const animateFeedbackIn = useCallback(
    (text: string, confettiType: ConfettiType, duration: number) => {
      setShowFeedback({text, type: confettiType});
      textScale.value = withSpring(1, {damping: 5, stiffness: 80});
      textOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });

      timeout.current = setTimeout(animateFeedbackOut, duration);
    },
    [animateFeedbackOut, textOpacity, textScale],
  );

  useEffect(() => {
    if (gameStatus === 'SUCCESS') {
      animateFeedbackIn('Congrats!', 'party', 7000);
    }
    if (gameStatus !== 'PLAYING') {
      previousCorrectLetters.current.clear();
    }
  }, [animateFeedbackIn, gameStatus]);

  useEffect(() => {
    if (currentAttempt > 0 && gameStatus === 'PLAYING') {
      const lastGuess = guesses[currentAttempt - 1];
      if (lastGuess) {
        const newCorrectLetters = lastGuess.letters.filter(
          (letter, index) =>
            lastGuess.correctness[index] === 'correct' &&
            !previousCorrectLetters.current.has(letter),
        );
        newCorrectLetters.forEach(letter =>
          previousCorrectLetters.current.add(letter),
        );
        if (newCorrectLetters.length >= 3) {
          animateFeedbackIn('Strike!', 'spark', 3000);
        }
      }
    }
    if (currentAttempt === 0 && gameStatus === 'PLAYING') {
      animateFeedbackOut();
    }
  }, [
    currentAttempt,
    guesses,
    animateFeedbackIn,
    gameStatus,
    animateFeedbackOut,
  ]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{scale: textScale.value}],
    opacity: textOpacity.value,
  }));

  return (
    <>
      {showFeedback !== null && (
        <View style={styles.feedbackContainer}>
          <LottieView
            style={styles.confetti}
            source={
              showFeedback.type === 'spark'
                ? require('~/assets/lottie/confetti_1.json')
                : require('~/assets/lottie/confetti_2.json')
            }
            autoPlay
            loop={false}
          />
          <Animated.Text style={[styles.niceText, animatedTextStyle]}>
            {showFeedback.text}
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
    zIndex: 1,
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
    color: '#ffffff',
    textShadowColor: '#353f4f',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 20,
    borderRadius: 27,
    backgroundColor: '#5c92ffd0',
    padding: 17,
    fontStyle: 'italic',
  },
});

export default ConfettiOverlay;
