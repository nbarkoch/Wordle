import React from 'react';
import {StyleSheet, View} from 'react-native';
import {CATEGORIES} from '~/utils/consts';

import {GameCategory} from '~/utils/types';
import {GameCategoryCube} from './GameCategoryCube';

interface CategoryCubesProps {
  category: GameCategory;
  setCategory: (category: GameCategory) => void;
}

export default function CategoryCubes({
  category,
  setCategory,
}: CategoryCubesProps) {
  return (
    <View style={styles.container}>
      {CATEGORIES.map(c => (
        <GameCategoryCube
          key={c}
          category={c}
          selected={category === c}
          setSelected={() => setCategory(c)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
