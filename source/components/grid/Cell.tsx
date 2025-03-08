import React, {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {SharedValue, useAnimatedStyle} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import {colorLightMap, colorMap} from '~/utils/ui';
import {Correctness} from '~/utils/words';

interface CellProps {
  front: {
    letter: string | undefined;
    correctness: Correctness | undefined;
  };
  back: {
    letter: string | undefined;
    correctness: Correctness | undefined;
  };

  onLetterSelected: () => void;
  selected?: boolean;

  rowIndication: 'BEFORE' | 'CURRENT' | 'AFTER';
  flipValue: SharedValue<number>;
}

const CELL_SIZE = 45;

function Cell({
  onLetterSelected,
  selected = false,
  front,
  back,
  rowIndication,
  flipValue,
}: CellProps) {
  // Front face (showing when not flipped)
  const frontStyle = useAnimatedStyle(() => {
    return {
      opacity: flipValue.value >= 90 ? 0 : 1,
      transform: [{rotateX: `${flipValue.value}deg`}],
    };
  });

  const fStyle = {
    backgroundColor: front.correctness
      ? colorLightMap[front.correctness]
      : colors.lightGrey,
    borderWidth: selected ? 3 : 0,
    borderColor: selected
      ? rowIndication === 'CURRENT'
        ? colors.gold
        : colors.blue
      : 'transparent',
  };

  // Back face (showing when flipped)
  const backStyle = useAnimatedStyle(() => {
    return {
      opacity: flipValue.value >= 90 ? 1 : 0,
      transform: [{rotateX: `${180 - flipValue.value}deg`}],
    };
  });

  const bStyle = {
    backgroundColor: back.correctness
      ? colorMap[back.correctness]
      : colors.lightGrey,
    borderWidth: selected ? 3 : 0,
    borderColor: selected
      ? rowIndication === 'CURRENT'
        ? colors.gold
        : colors.blue
      : 'transparent',
  };

  return (
    <Pressable
      style={styles.pressable}
      disabled={rowIndication === 'AFTER'}
      onPress={onLetterSelected}>
      <View style={styles.cellContainer}>
        {/* Front face */}
        <Animated.View style={[styles.cell, frontStyle, fStyle]}>
          <Text
            style={[
              styles.letter,
              {
                color:
                  front?.correctness && !front.letter
                    ? colors.grey
                    : colors.darkGrey,
              },
            ]}>
            {front?.letter || ''}
          </Text>
        </Animated.View>

        {/* Back face */}
        <Animated.View style={[styles.cell, backStyle, bStyle]}>
          <Text style={[styles.letter, {color: colors.white}]}>
            {back?.letter || ''}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cellContainer: {
    position: 'relative',
    width: CELL_SIZE,
    height: CELL_SIZE,
    marginVertical: 4,
    marginHorizontal: 5,
  },
  cell: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  pressable: {
    zIndex: 10,
  },
  letter: {
    fontSize: 28,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
});

export default memo(Cell);
