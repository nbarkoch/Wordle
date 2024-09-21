import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import {Correctness} from '~/utils/ui';

interface LetterCellProps {
  letter: string;
  viewed?: Correctness;
  delay: number;
}

function LetterCell({letter, viewed, delay}: LetterCellProps) {
  const animatedValue = useSharedValue(0);
  const flipValue = useSharedValue(0);

  const [letterValue, setLetterValue] = useState<string>(letter);
  const [letterViewed, setLetterViewed] = useState<Correctness | undefined>(
    viewed,
  );

  const letterCellStyle = letterValue
    ? {
        backgroundColor: '#e5e5e5',
      }
    : {backgroundColor: '#EDEFEC'};

  useEffect(() => {
    if (!letterViewed) {
      setLetterValue(letter);
    }
    if (letter !== '') {
      animatedValue.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
    } else {
      animatedValue.value = 0;
    }
  }, [animatedValue, letter, letterViewed, viewed]);

  const resetLetter = useCallback(() => {
    setLetterValue('');
    setLetterViewed(undefined);
  }, []);

  useEffect(() => {
    if (viewed) {
      setLetterViewed(viewed);
      flipValue.value = withDelay(delay, withTiming(180, {duration: 500}));
    } else {
      flipValue.value = withTiming(0, {duration: 500}, finished => {
        if (finished) {
          runOnJS(resetLetter)();
        }
      });
    }
  }, [flipValue, viewed, delay, resetLetter]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: animatedValue.value}],
    };
  });

  const flipStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotateX: `${flipValue.value}deg`}],
    };
  });

  const interpolatedColor = useAnimatedStyle(() => {
    const color =
      letterViewed === 'correct'
        ? '#7FCCB5'
        : letterViewed === 'exists'
        ? '#F9B033'
        : '#F47A89';
    const backgroundColor = interpolateColor(
      flipValue.value,
      [0, 89, 90, 180],
      ['#e5e5e5', '#e5e5e5', color, color],
    );

    return {
      backgroundColor,
    };
  });

  const letterStyle = useAnimatedStyle(() => {
    let textColor = '#6a6a6a';
    if (letter === '') {
      textColor = 'transparent';
    }

    const color = interpolateColor(
      flipValue.value,
      [0, 89, 90, 180],
      [textColor, textColor, '#ffffff', '#ffffff'],
    );
    return {
      color,
      transform: [{rotateX: `${-flipValue.value}deg`}],
    };
  });

  return (
    <Animated.View
      style={[styles.cell, letterCellStyle, interpolatedColor, flipStyle]}>
      <Animated.Text style={[styles.letter, letterStyle, animatedStyle]}>
        {letterValue}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 24,
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default LetterCell;
