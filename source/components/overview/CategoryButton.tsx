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
    <BasePressable style={{flex: 1}} onPress={onPress}>
      <Text
        style={[
          styles.text,
          {backgroundColor: isActive ? colors.lightGold : colors.gold},
          isFirst && styles.firstButton,
          isLast && styles.lastButton,
        ]}>
        {title}
      </Text>
    </BasePressable>
    {!isLast && <View style={styles.divider} />}
  </>
);

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    padding: 10,
    fontWeight: '900',
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
