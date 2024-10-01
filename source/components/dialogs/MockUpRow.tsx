import React from 'react';
import {View, StyleSheet, I18nManager} from 'react-native';

import {colors} from '~/utils/colors';
import {Correctness} from '~/utils/ui';
import Animated from 'react-native-reanimated';

interface RowMockupProps {
  letters: string[];
  correctness: (Correctness | undefined)[];
}
function RowMockUp({letters, correctness}: RowMockupProps) {
  const getColor = (status: Correctness | undefined) => {
    switch (status) {
      case 'correct':
        return colors.green;
      case 'exists':
        return colors.yellow;
      case 'notInUse':
        return colors.red;
      case undefined:
        return undefined;
      default:
        return colors.lightGrey;
    }
  };

  const getFontColor = (status: Correctness | undefined) => {
    switch (status) {
      case 'correct':
      case 'exists':
      case 'notInUse':
        return colors.white;
      case undefined:
        return 'transparent';
      default:
        return colors.darkGrey;
    }
  };

  return (
    <View style={mockUpStyle.row}>
      {letters.map((letterValue, index) => (
        <Animated.View
          key={`${letterValue}-${index}`}
          style={[
            mockUpStyle.cell,
            {backgroundColor: getColor(correctness[index])},
          ]}>
          <Animated.Text
            style={[
              mockUpStyle.letter,
              {
                color: getFontColor(correctness[index]),
              },
            ]}>
            {letterValue}
          </Animated.Text>
        </Animated.View>
      ))}
    </View>
  );
}

const mockUpStyle = StyleSheet.create({
  row: {
    zIndex: 10,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  cell: {
    width: 45,
    height: 45,
    borderRadius: 17,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    zIndex: 10,
  },
  letter: {
    fontSize: 28,
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default RowMockUp;
