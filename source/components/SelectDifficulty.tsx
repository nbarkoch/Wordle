import {Dispatch, SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '~/components/BasePressable';
import {Difficulty} from '~/utils/types';
import {MAP_DIFFICULTY_NAME} from '~/utils/consts';

const DividerVertical = () => <View style={styles.divider} />;

interface SelectorProps {
  selected: boolean;
  value: string;
  onSelect: () => void;
}

const Selector = ({selected, value, onSelect}: SelectorProps) => (
  <BasePressable
    style={[
      styles.selector,
      {backgroundColor: selected ? colors.lightGold : colors.gold},
    ]}
    onPress={onSelect}>
    <Text style={styles.text}>{value}</Text>
  </BasePressable>
);

interface SelectNumberProps {
  selected: Difficulty;
  setSelected: Dispatch<SetStateAction<Difficulty>>;
}

function SelectDifficulty({selected, setSelected}: SelectNumberProps) {
  return (
    <View style={styles.body}>
      <Selector
        value={MAP_DIFFICULTY_NAME.hard}
        selected={selected === 'hard'}
        onSelect={() => setSelected('hard')}
      />
      <DividerVertical />
      <Selector
        value={MAP_DIFFICULTY_NAME.medium}
        selected={selected === 'medium'}
        onSelect={() => setSelected('medium')}
      />
      <DividerVertical />
      <Selector
        value={MAP_DIFFICULTY_NAME.easy}
        selected={selected === 'easy'}
        onSelect={() => setSelected('easy')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    backgroundColor: colors.gold,
    borderRadius: 30,
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: colors.darkGold,
    borderWidth: 4,
  },
  selector: {
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: '100%',
    backgroundColor: colors.darkGold,
    width: 3,
  },
  text: {
    fontSize: 25,
    fontFamily: 'Ploni-Bold-AAA',
    color: colors.darkGold,
  },
});
export default SelectDifficulty;
