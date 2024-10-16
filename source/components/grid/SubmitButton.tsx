import React, {memo, useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import BasePressable from '../BasePressable';

interface SubmitButtonProps {
  handleSubmit: () => void;
  isValidGuess: boolean | null;
}

function SubmitButton({handleSubmit, isValidGuess}: SubmitButtonProps) {
  const submitColorAnimation = useSharedValue(0);
  const [internalIsValidGuess, setInternalIsValidGuess] = useState<
    boolean | null
  >(isValidGuess);

  const updateInternalState = useCallback(() => {
    setInternalIsValidGuess(isValidGuess);
  }, [isValidGuess]);

  useEffect(() => {
    submitColorAnimation.value = withTiming(
      isValidGuess === null ? 0 : 1,
      {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
      },
      finished => {
        if (finished) {
          runOnJS(updateInternalState)();
        }
      },
    );
    return () => cancelAnimation(submitColorAnimation);
  }, [isValidGuess, submitColorAnimation, updateInternalState]);

  const validGuess = isValidGuess ?? internalIsValidGuess;

  const submitButtonStyle = useAnimatedStyle(() => {
    const finalColor =
      validGuess === null ? '#A0A0A0' : validGuess ? colors.green : colors.red;
    const finalBorderColor =
      validGuess === null ? '#898989' : validGuess ? '#5eb299' : '#c9505e';
    const backgroundColor = interpolateColor(
      submitColorAnimation.value,
      [0, 1],
      ['#A0A0A0', finalColor],
    );

    const borderColor = interpolateColor(
      submitColorAnimation.value,
      [0, 1],
      ['#898989', finalBorderColor],
    );

    return {
      backgroundColor,
      borderColor,
    };
  });

  const submitTextStyle = useAnimatedStyle(() => {
    const finalFontColor =
      validGuess === null
        ? colors.darkGrey
        : validGuess
        ? colors.white
        : colors.darkRed;

    const fontColor = interpolateColor(
      submitColorAnimation.value,
      [0, 1],
      [colors.darkGrey, finalFontColor],
    );

    return {
      color: fontColor,
    };
  });
  return (
    <BasePressable disabled={isValidGuess === null} onPress={handleSubmit}>
      <Animated.View style={[styles.submitButton, submitButtonStyle]}>
        <Animated.Text style={[styles.submitButtonText, submitTextStyle]}>
          {'אישור'}
        </Animated.Text>
      </Animated.View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
});

export default memo(SubmitButton);
