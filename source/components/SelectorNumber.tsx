import {Dispatch, SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '~/components/BasePressable';

const DividerVertical = () => <View style={styles.divider} />;

interface SelectorProps {
  selected: boolean;
  value: number;
  onSelect: (value: number) => void;
}

const Selector = ({selected, value, onSelect}: SelectorProps) => (
  <BasePressable
    style={[
      styles.selector,
      {backgroundColor: selected ? colors.lightGold : colors.gold},
    ]}
    onPress={() => {
      onSelect(value);
    }}>
    <Text style={styles.text}>{value}</Text>
  </BasePressable>
);

interface SelectNumberProps {
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}

function SelectNumber({selected, setSelected}: SelectNumberProps) {
  return (
    <View style={styles.body}>
      <Selector value={5} selected={selected === 5} onSelect={setSelected} />
      <DividerVertical />
      <Selector value={4} selected={selected === 4} onSelect={setSelected} />
      <DividerVertical />
      <Selector value={3} selected={selected === 3} onSelect={setSelected} />
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
  text: {fontSize: 25, fontWeight: '900', color: colors.darkGold},
});
export default SelectNumber;
