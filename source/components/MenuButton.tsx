import {StyleSheet, Text, View} from 'react-native';
import React from 'react-native';

import {setColorOpacity, lightenColor} from '~/utils/ui';
import BasePressable from '~/components/BasePressable';

interface MenuButtonProps {
  onPress: () => void;
  text: string;
  color: string;
  disabled?: boolean;
}
function MenuButton({onPress, text, color, disabled = false}: MenuButtonProps) {
  return (
    <BasePressable onPress={onPress} disabled={disabled}>
      <View
        style={[
          styles.button,
          {
            backgroundColor: color,
            borderColor: setColorOpacity(lightenColor(color, 10), 0.7),
          },
        ]}>
        <Text style={styles.buttonText}>{text.toLocaleUpperCase()}</Text>
      </View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 15,
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 50,
    zIndex: 10,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: 'white',
  },
});

export default MenuButton;
