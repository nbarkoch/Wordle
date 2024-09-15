import React, {useEffect} from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import {WordGuess} from '~/utils/ui';

interface WordleGridProps {
  guesses: WordGuess[];
  currentAttempt: number;
  currentGuess: string;
  maxAttempts: number;
  wordLength: number;
}

interface LetterCellProps {
  letter: string;
  viewed?: 'correct' | 'exists' | 'notInUse' | null;
  delay: number;
}

function LetterCell({letter, viewed, delay}: LetterCellProps) {
  const letterCellStyle = letter
    ? {
        backgroundColor: '#e5e5e5',
      }
    : {backgroundColor: '#EDEFEC'};

  const animatedValue = useSharedValue(0);
  const flipValue = useSharedValue(0);

  useEffect(() => {
    if (letter) {
      animatedValue.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
    } else {
      animatedValue.value = 0;
    }
  }, [animatedValue, letter]);

  useEffect(() => {
    if (viewed) {
      flipValue.value = withDelay(delay, withTiming(180, {duration: 500}));
    } else {
      flipValue.value = withTiming(0, {duration: 500});
    }
  }, [flipValue, viewed, delay]);

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
      viewed === 'correct'
        ? '#7FCCB5'
        : viewed === 'exists'
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
    const color = interpolateColor(
      flipValue.value,
      [0, 89, 90, 180],
      ['#6a6a6a', '#6a6a6a', '#ffffff', '#ffffff'],
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
        {letter}
      </Animated.Text>
    </Animated.View>
  );
}

const WordleGrid: React.FC<WordleGridProps> = ({
  guesses,
  currentAttempt,
  currentGuess,
  maxAttempts,
  wordLength,
}) => {
  return (
    <View style={styles.grid}>
      {Array(maxAttempts)
        .fill(0)
        .map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {Array(wordLength)
              .fill(0)
              .map((__, colIndex) => {
                const letter =
                  rowIndex === currentAttempt
                    ? currentGuess[colIndex]
                    : guesses[rowIndex]?.letters[colIndex] ?? '';

                return (
                  <LetterCell
                    key={`${rowIndex}-${colIndex}`}
                    letter={letter}
                    viewed={guesses[rowIndex]?.correctness[colIndex]}
                    delay={colIndex * 100} // 100ms delay between each cell
                  />
                );
              })}
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
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

export default WordleGrid;
