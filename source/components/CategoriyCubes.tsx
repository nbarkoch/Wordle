import React, {Dispatch, SetStateAction} from 'react';
import {Text, View} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from './BasePressable';
import {GameCategory} from '~/utils/types';

const mapCategoryName: Record<GameCategory, string> = {
  GENERAL: 'ידע כללי',
  ANIMALS: 'בעלי חיים',
  GEOGRAPHY: 'גאוגרפיה',
  SCIENCE: 'מדעים',
  SPORT: 'ספורט',
};

interface GameCategoryCubeProps {
  category: GameCategory;
  selected: boolean;
  setSelected: () => void;
}

function GameCategoryCube({
  category,
  setSelected,
  selected,
}: GameCategoryCubeProps) {
  return (
    <BasePressable style={{width: '48%'}} onPress={setSelected}>
      <View
        style={{
          padding: 20,
          backgroundColor: selected ? colors.green : colors.grey,
          borderRadius: 15,
          marginBottom: 10,
        }}>
        <Text
          style={{
            fontSize: 19,
            fontWeight: '900',
            color: 'white',
            textAlign: 'right',
          }}>
          {mapCategoryName[category]}
        </Text>
      </View>
    </BasePressable>
  );
}

interface CategoryCubesProps {
  category: GameCategory;
  setCategory: Dispatch<SetStateAction<GameCategory>>;
}

function CategoryCubes({category, setCategory}: CategoryCubesProps) {
  const categories: GameCategory[] = [
    'GENERAL',
    'ANIMALS',
    'GEOGRAPHY',
    'SCIENCE',
    'SPORT',
  ];
  return (
    <View
      style={{
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
      {categories.map(c => (
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

export default CategoryCubes;
