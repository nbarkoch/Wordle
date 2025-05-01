import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {GameCategory} from '~/utils/types';
import {MAP_CATEGORY_NAME} from '~/utils/consts';
import {colors} from '~/utils/colors';
import BasePressable from '~/components/BasePressable';
import CategoryIcon from './CategoryIcon';

interface GameCategoryCubeProps {
  category: GameCategory;
  selected: boolean;
  setSelected: () => void;
}

export function GameCategoryCube({
  category,
  setSelected,
  selected,
}: GameCategoryCubeProps) {
  const backgroundColor = selected ? colors.green : colors.grey;

  return (
    <BasePressable style={styles.cubeWrapper} onPress={setSelected}>
      <View
        style={[
          styles.cube,
          {
            backgroundColor,
            borderColor: selected ? colors.mediumGreen : colors.mediumGrey,
          },
        ]}>
        <View style={styles.iconAdjuster}>
          <CategoryIcon
            category={category}
            size={80}
            color={selected ? colors.darkGreen : colors.darkGrey}
          />
        </View>
        <Text style={styles.cubeText}>{MAP_CATEGORY_NAME[category]}</Text>
      </View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  cubeWrapper: {
    width: '48%',
  },
  cube: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
  },
  cubeText: {
    fontSize: 19,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: 'white',
    textAlign: 'center',
  },
  iconAdjuster: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    opacity: 0.2,
    transform: [{rotate: '-25deg'}],
  },
});
