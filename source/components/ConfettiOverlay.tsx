import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const {width, height} = Dimensions.get('window');

interface ConfettiOverlayProps {}

type ConfettiType = 'spark' | 'party';

export interface ConfettiOverlayRef {
  triggerFeedback: (type: ConfettiType) => void;
}

const ConfettiOverlay = forwardRef<ConfettiOverlayRef, ConfettiOverlayProps>(
  ({}, ref) => {
    const [showFeedback, setShowFeedback] = useState<ConfettiType | null>(null);
    const [showText, setShowText] = useState<string | null>(null);

    const feedbackTimeout = useRef<number | null>(null);
    const textTimeout = useRef<number | null>(null);

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
            runOnJS(setShowText)(null);
          }
        },
      );
      textTimeout.current && clearTimeout(textTimeout.current);
    }, [textOpacity, textScale]);

    const animateFeedbackIn = useCallback(
      (
        text: string,
        confettiType: ConfettiType,
        animDuration: number,
        textDuration: number,
      ) => {
        setShowFeedback(confettiType);
        setShowText(text);
        textScale.value = withSpring(1, {damping: 5, stiffness: 80});
        textOpacity.value = withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        });

        console.log('animDuration', animDuration);
        feedbackTimeout.current = setTimeout(() => {
          setShowFeedback(null);
          feedbackTimeout.current && clearTimeout(feedbackTimeout.current);
        }, animDuration);

        textTimeout.current = setTimeout(animateFeedbackOut, textDuration);
      },
      [animateFeedbackOut, textOpacity, textScale],
    );

    useImperativeHandle(ref, () => ({
      triggerFeedback: (type: ConfettiType) => {
        switch (type) {
          case 'party':
            animateFeedbackIn('Congrats!', type, 7000, 3000);
            break;
          case 'spark':
            animateFeedbackIn('Strike!', type, 3000, 2000);
            break;
        }
      },
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
      transform: [{scale: textScale.value}],
      opacity: textOpacity.value,
    }));

    return (
      <>
        {showFeedback && (
          <View style={styles.feedbackContainer} pointerEvents="none">
            <LottieView
              style={styles.confetti}
              source={
                showFeedback === 'party'
                  ? require('~/assets/lottie/confetti_2.json')
                  : require('~/assets/lottie/confetti_1.json')
              }
              autoPlay
              loop={false}
              resizeMode={showFeedback === 'party' ? 'cover' : 'center'}
            />
            {showText && (
              <Animated.View style={[styles.feedbackView, animatedTextStyle]}>
                <Text style={styles.feedbackText}> {showText}</Text>
              </Animated.View>
            )}
          </View>
        )}
      </>
    );
  },
);

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    width: width,
    height: height,
    position: 'absolute',
    overflow: 'hidden',
  },
  feedbackView: {
    textShadowColor: '#353f4f',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 20,
    borderRadius: 27,
    backgroundColor: '#5c92ffd0',
    padding: 17,
  },
  feedbackText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    fontStyle: 'italic',
  },
});

export default ConfettiOverlay;
