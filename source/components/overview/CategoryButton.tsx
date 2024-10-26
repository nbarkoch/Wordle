import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {View} from 'react-native';
import BasePressable from '~/components/BasePressable';
import {colors} from '~/utils/colors';

interface CategoryButtonProps {
  title: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isActive: boolean;
}

export const CategoryButton = ({
  title,
  onPress,
  isFirst,
  isLast,
  isActive,
}: CategoryButtonProps) => (
  <>
    <BasePressable style={[styles.container]} onPress={onPress}>
      <View
        style={[
          styles.view,
          isFirst && styles.firstButton,
          isLast && styles.lastButton,
          {backgroundColor: isActive ? colors.lightGold : colors.gold},
        ]}>
        <Text style={[styles.text]}>{title}</Text>
      </View>
    </BasePressable>
    {!isLast && <View style={styles.divider} />}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  view: {
    height: 40,
    textAlign: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    padding: 10,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: colors.darkGrey,
  },
  firstButton: {
    borderTopLeftRadius: 8,
  },
  lastButton: {
    borderTopRightRadius: 8,
  },
  divider: {
    width: 2,
    backgroundColor: colors.darkGold,
  },
});
