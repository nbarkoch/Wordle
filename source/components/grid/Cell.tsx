import React, {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '~/utils/colors';
import {colorLightMap, colorMap} from '~/utils/ui';
import {Correctness} from '~/utils/words';
interface CellProps {
  letter: string | undefined;
  onLetterSelected: () => void;
  hint?: HintInfo;
  selected?: boolean;
  correctness: Correctness | undefined;
  rowIndication: 'BEFORE' | 'CURRENT' | 'AFTER';
}

type HintInfo =
  | {
      letter: string;
      correctness: Correctness;
    }
  | undefined;

const CELL_SIZE = 45;

function Cell({
  letter,
  onLetterSelected,
  selected = false,
  hint,
  correctness,
  rowIndication,
}: CellProps) {
  const viewStyle = {
    backgroundColor:
      hint?.correctness && !letter
        ? colorLightMap[hint.correctness]
        : correctness
        ? colorMap[correctness]
        : colors.lightGrey,
    borderWidth: selected ? 3 : 0,
    borderColor: selected
      ? rowIndication === 'CURRENT'
        ? colors.gold
        : colors.blue
      : 'transparent',
    transform: [
      {
        rotateX: correctness ? '180deg' : '0deg',
      },
    ],
  };

  const textStyle = {
    color:
      hint?.correctness && !letter
        ? colors.grey
        : correctness
        ? colors.white
        : colors.darkGrey,
  };

  const displayText = letter || hint?.letter || '';

  return (
    <Pressable
      style={styles.pressable}
      disabled={rowIndication === 'AFTER'}
      onPress={onLetterSelected}>
      <View style={[styles.cell, viewStyle]}>
        <Text style={[styles.letter, textStyle]}>{displayText}</Text>
      </View>
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
  letter: {fontSize: 28, fontFamily: 'PloniDL1.1AAA-Bold'},
});

export default memo(Cell);
