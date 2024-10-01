import React, {memo, useCallback, useEffect, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SubmitButtonProps {
  handleSubmit: () => void;
  isValidGuess: boolean | null;
}

function SubmitButton({handleSubmit, isValidGuess}: SubmitButtonProps) {
  const submitScaleAnimation = useSharedValue(1);
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
  }, [isValidGuess, submitColorAnimation, updateInternalState]);

  const submitButtonStyle = useAnimatedStyle(() => {
    const validGuess = isValidGuess ?? internalIsValidGuess;

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
      transform: [{scale: submitScaleAnimation.value}],
    };
  });

  return (
    <AnimatedPressable
      disabled={isValidGuess === null}
      style={[styles.submitButton, submitButtonStyle]}
      onPress={() => {
        submitScaleAnimation.value = withSpring(0.8, {}, () => {
          submitScaleAnimation.value = withSpring(1);
        });
        runOnJS(handleSubmit)();
      }}>
      <Animated.Text style={styles.submitButtonText}>SUBMIT</Animated.Text>
    </AnimatedPressable>
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
