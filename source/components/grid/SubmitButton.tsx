import React, {useEffect} from 'react';
import {Platform, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import BasePressable from '../BasePressable';
import {colors} from '~/utils/colors';

const ANIMATION_DURATION = 300;

// Color configuration object for different states
const buttonColors = {
  default: {
    background: '#A0A0A0',
    border: colors.mediumGrey,
    text: colors.darkGrey,
  },
  valid: {
    background: colors.green,
    border: colors.mediumGreen,
    text: colors.white,
  },
  invalid: {
    background: colors.red,
    border: '#c9505e',
    text: colors.darkRed,
  },
};

interface SubmitButtonProps {
  handleSubmit: () => void;
  isValidGuess: boolean | null;
}

function SubmitButton({handleSubmit, isValidGuess}: SubmitButtonProps) {
  const animationProgress = useSharedValue(0);
  const currentState = useSharedValue<boolean | null>(null);
  const previousState = useSharedValue<boolean | null>(null);

  useEffect(() => {
    // Reset and start new animation
    const startNewAnimation = () => {
      animationProgress.value = 0;
      currentState.value = isValidGuess;

      animationProgress.value = withTiming(
        1,
        {
          duration: ANIMATION_DURATION,
          easing: Easing.inOut(Easing.quad),
        },
        finished => {
          if (finished) {
            previousState.value = isValidGuess;
          }
        },
      );
    };

    startNewAnimation();

    return () => cancelAnimation(animationProgress);
  }, [isValidGuess, animationProgress, currentState, previousState]);

  const getStateColors = (state: boolean | null) => {
    'worklet';
    if (state === null) {
      return buttonColors.default;
    }
    return state ? buttonColors.valid : buttonColors.invalid;
  };

  const buttonStyle = useAnimatedStyle(() => {
    const currentColors = getStateColors(currentState.value);
    const previousColors = getStateColors(previousState.value);

    return {
      backgroundColor: interpolateColor(
        animationProgress.value,
        [0, 1],
        [previousColors.background, currentColors.background],
      ),
      borderColor: interpolateColor(
        animationProgress.value,
        [0, 1],
        [previousColors.border, currentColors.border],
      ),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const currentColors = getStateColors(currentState.value);
    const previousColors = getStateColors(previousState.value);

    return {
      color: interpolateColor(
        animationProgress.value,
        [0, 1],
        [previousColors.text, currentColors.text],
      ),
    };
  });

  return (
    <BasePressable disabled={isValidGuess === null} onPress={handleSubmit}>
      <Animated.View style={[styles.button, buttonStyle]}>
        <Animated.Text style={[styles.buttonText, textStyle]}>
          {'אישור'}
        </Animated.Text>
      </Animated.View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2.5,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'PloniDL1.1AAA-Bold',
    paddingTop: Platform.OS === 'ios' ? 3 : 0,
  },
});

export default React.memo(SubmitButton);
