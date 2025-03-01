import {StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '~/components/BasePressable';
import {lightenColor, setColorOpacity} from '~/utils/ui';
import {Fragment} from 'react';

const dividerColor = lightenColor(colors.gold, -15);
const borderColor = setColorOpacity(lightenColor(colors.gold, -35), 0.35);
const letterColor = lightenColor(colors.gold, -40);
const cubeSelectedColor = lightenColor(colors.gold, 15);

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
      {backgroundColor: selected ? cubeSelectedColor : colors.gold},
    ]}
    onPress={onSelect}>
    <Text style={styles.text}>{value}</Text>
  </BasePressable>
);

type SelectionItem<T> = {value: T; label: string};
interface SelectNumberProps<T> {
  selected: T;
  setSelected: (value: T) => void;
  items: SelectionItem<T>[];
}

function Selection<T>({selected, setSelected, items}: SelectNumberProps<T>) {
  return (
    <View style={styles.body}>
      {items.map((item, index) => (
        <Fragment key={`${item.value}`}>
          <Selector
            value={item.label}
            selected={selected === item.value}
            onSelect={() => setSelected(item.value)}
          />
          {index < items.length - 1 && <DividerVertical />}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.gold,
    borderRadius: 30,
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: borderColor,
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
    backgroundColor: dividerColor,
    width: 3,
  },
  text: {
    fontSize: 25,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: letterColor,
  },
});
export default Selection;
