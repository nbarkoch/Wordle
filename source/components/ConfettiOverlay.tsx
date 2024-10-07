import React, {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  withSequence,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

import confettiSpark from '~/assets/lottie/confetti_1.json';
import confettiParty from '~/assets/lottie/confetti_2.json';
import {OutlinedText} from './CartoonText';
import {colors} from '~/utils/colors';

const {width, height} = Dimensions.get('window');

interface ConfettiOverlayProps {}

type ConfettiType = 'spark' | 'party';

const SPRING_DELAY = 200;
const TEXT_DISPLAY_DUR = 2000;
const OPACITY_DUR = 400;
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
    const rotation = useSharedValue(-270);

    const animateFeedbackIn = useCallback(
      (text: string, confettiType: ConfettiType) => {
        setShowFeedback(confettiType);
        setShowText(text);
        cancelAnimation(textScale);
        cancelAnimation(rotation);
        cancelAnimation(textOpacity);
        textScale.value = withSequence(
          withTiming(1.2, {duration: OPACITY_DUR - SPRING_DELAY}),
          withTiming(1, {duration: SPRING_DELAY}),
          withDelay(
            TEXT_DISPLAY_DUR + SPRING_DELAY,
            withTiming(0, {
              duration: SCALE_DUR,
              easing: Easing.out(Easing.cubic),
            }),
          ),
        );

        rotation.value = withSequence(
          withTiming(0, {
            duration: OPACITY_DUR,
            easing: Easing.out(Easing.cubic),
          }),
          withDelay(
            TEXT_DISPLAY_DUR + SPRING_DELAY,
            withTiming(-270, {
              duration: OPACITY_DUR,
              easing: Easing.in(Easing.cubic),
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
      [rotation, textOpacity, textScale],
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
      transform: [{scale: textScale.value}, {rotate: `${rotation.value}deg`}],
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
                <OutlinedText
                  text={showText}
                  fontSize={42}
                  width={250}
                  height={70}
                  fillColor="#ffffff"
                  strokeColor={colors.blue}
                  strokeWidth={12}
                />
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
    transform: [{translateY: -50}],
  },
  confetti: {
    width: width,
    height: height,
    position: 'absolute',
    overflow: 'hidden',
  },
  feedbackView: {
    padding: 17,
  },
  feedbackText: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.white,
    fontStyle: 'italic',
  },
});

export default ConfettiOverlay;
