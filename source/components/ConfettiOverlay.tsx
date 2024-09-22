import React, {
  useCallback,
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
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import confettiSpark from '~/assets/lottie/confetti_1.json';
import confettiParty from '~/assets/lottie/confetti_2.json';

const {width, height} = Dimensions.get('window');

interface ConfettiOverlayProps {}

type ConfettiType = 'spark' | 'party';

const SPRING_DELAY = 300;
const TEXT_DISPLAY_DUR = 2000;
const OPACITY_DUR = 600;
const SCALE_DUR = 500;
export interface ConfettiOverlayRef {
  triggerFeedback: (type: ConfettiType) => void;
}

const ConfettiOverlay = forwardRef<ConfettiOverlayRef, ConfettiOverlayProps>(
  ({}, ref) => {
    const [showFeedback, setShowFeedback] = useState<ConfettiType | null>(null);
    const [showText, setShowText] = useState<string | null>(null);

    const textScale = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    const animateFeedbackIn = useCallback(
      (text: string, confettiType: ConfettiType) => {
        setShowFeedback(confettiType);
        setShowText(text);

        textScale.value = withSequence(
          withSpring(1, {damping: 5, stiffness: 80}),
          withDelay(
            TEXT_DISPLAY_DUR,
            withTiming(0, {
              duration: SCALE_DUR,
              easing: Easing.out(Easing.cubic),
            }),
          ),
        );

        textOpacity.value = withSequence(
          withTiming(1, {
            duration: OPACITY_DUR,
            easing: Easing.out(Easing.cubic),
          }),
          withDelay(
            TEXT_DISPLAY_DUR + SPRING_DELAY,
            withTiming(
              0,
              {
                duration: OPACITY_DUR,
                easing: Easing.out(Easing.cubic),
              },
              finished => {
                if (finished) {
                  runOnJS(setShowText)(null);
                }
              },
            ),
          ),
        );
      },
      [textOpacity, textScale],
    );

    useImperativeHandle(ref, () => ({
      triggerFeedback: (type: ConfettiType) => {
        switch (type) {
          case 'party':
            animateFeedbackIn('Congrats!', type);
            break;
          case 'spark':
            animateFeedbackIn('Strike!', type);
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
        {(showFeedback || showText) && (
          <View style={styles.feedbackContainer} pointerEvents="none">
            <LottieView
              style={styles.confetti}
              source={showFeedback === 'party' ? confettiParty : confettiSpark}
              autoPlay
              loop={false}
              resizeMode={showFeedback === 'party' ? 'cover' : 'center'}
              onAnimationFinish={() => {
                setShowFeedback(null);
              }}
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
