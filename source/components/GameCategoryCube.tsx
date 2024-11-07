import React, {StyleSheet, Text, View} from 'react-native';
import BasePressable from './BasePressable';
import {GameCategory} from '~/utils/types';
import {MAP_CATEGORY_NAME} from '~/utils/consts';
import {colors} from '~/utils/colors';

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
  return (
    <BasePressable style={styles.cubeWrapper} onPress={setSelected}>
      <View
        style={[
          styles.cube,
          {backgroundColor: selected ? colors.green : colors.grey},
        ]}>
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
  },
  cubeText: {
    fontSize: 19,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: 'white',
    textAlign: 'center',
  },
});
