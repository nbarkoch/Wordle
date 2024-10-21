import React, {memo, useMemo} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {Canvas, Text, useFont, Group} from '@shopify/react-native-skia';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import {Correctness} from '~/utils/ui';

interface CellProps {
  letter: string | undefined;
  viewed: Correctness | undefined;
  onLetterSelected: () => void;
  isCurrentRow?: boolean;
  hint?: HintInfo;
  selected?: boolean;
}

const getColor = (status: Correctness | undefined) => {
  switch (status) {
    case 'correct':
      return colors.green;
    case 'exists':
      return colors.yellow;
    case 'notInUse':
      return colors.red;
    default:
      return colors.lightGrey;
  }
};

const getHintColor = (status: Correctness | undefined) => {
  switch (status) {
    case 'correct':
      return colors.lightGreen;
    case 'exists':
      return colors.lightYellow;
    case 'notInUse':
      return colors.lightRed;
    default:
      return colors.lightGrey;
  }
};

type HintInfo =
  | {
      letter: string;
      correctness: Correctness;
    }
  | undefined;

const CELL_SIZE = 45;

function Cell({
  letter,
  viewed,
  onLetterSelected,
  isCurrentRow = false,
  selected = false,
  hint,
}: CellProps) {
  const font = useFont(require('~/assets/fonts/ganclm_bold-webfont.ttf'), 30);

  const backgroundColor = viewed
    ? getColor(viewed)
    : hint
    ? getHintColor(hint?.correctness)
    : colors.lightGrey;

  const textColor = viewed
    ? colors.white
    : hint && !letter
    ? colors.grey
    : colors.darkGrey;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor,
      borderWidth: withTiming(selected ? 3 : 0, {duration: 150}),
      borderColor: isCurrentRow ? colors.gold : colors.blue,
      transform: [
        {
          rotateX: viewed ? '180deg' : '0deg',
        },
      ],
    };
  }, [backgroundColor, selected, isCurrentRow, viewed]);

  const displayText = letter || hint?.letter || '';

  const textPosition = useMemo(() => {
    if (!font) return {x: CELL_SIZE / 2, y: CELL_SIZE / 2};
    const measurement = font.measureText(displayText);
    const x = (CELL_SIZE - measurement.width) / 2;
    const y = measurement.height - 13 + (CELL_SIZE - measurement.height); // Slight adjustment for visual centering
    return {x, y};
  }, [font, displayText]);

  if (!font) {
    return <Animated.View style={[styles.cell, animatedStyle]} />;
  }

  return (
    <Pressable
      style={styles.pressable}
      disabled={!isCurrentRow && viewed === null}
      onPress={onLetterSelected}>
      <Animated.View style={[styles.cell, animatedStyle]}>
        <Canvas style={styles.canvas}>
          <Group>
            <Text
              x={textPosition.x}
              y={textPosition.y}
              text={displayText}
              font={font}
              color={textColor}
              opacity={1}
            />
          </Group>
        </Canvas>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 17,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    zIndex: 10,
  },
  canvas: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 17,
  },
});

export default memo(Cell);
