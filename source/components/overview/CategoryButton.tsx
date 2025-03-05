import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {View} from 'react-native';
import BasePressable from '~/components/BasePressable';
import {colors} from '~/utils/colors';
import {lightenColor, setColorOpacity} from '~/utils/ui';

interface CategoryButtonProps {
  title: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isActive: boolean;
}

export const _CategoryButton = ({
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
          {
            backgroundColor: isActive
              ? lightenColor(colors.gold, 17)
              : colors.gold,
          },
        ]}>
        <Text style={[styles.text]}>{title}</Text>
      </View>
    </BasePressable>
    {!isLast && <View style={styles.divider} />}
  </>
);

export const CategoryButton = React.memo(
  _CategoryButton,
  (prevProps, nextProps) =>
    prevProps.isActive === nextProps.isActive &&
    prevProps.title === nextProps.title,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: setColorOpacity(colors.gold, 0.5),
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
    backgroundColor: setColorOpacity(colors.gold, 0.5),
  },
});
