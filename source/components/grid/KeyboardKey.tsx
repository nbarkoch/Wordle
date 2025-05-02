import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {Correctness} from '~/utils/words';
import {colors} from '~/utils/colors';
import {colorMap, colorMediumMap} from '~/utils/ui';
import {withMeasure} from '../tutorial/withSpotlight';
import DeleteKeyIcon from '~/assets/icons/backspace-delete.svg';

export const KEY_VARIANTS = {
  NORMAL: 'normal',
  WIDE: 'wide',
  START: 'start',
  END: 'end',
};

interface KeyboardKeyProps {
  letter: string;
  correctness?: Correctness | null;
  disabled?: boolean;
  variant?: string;
  onPress: () => void;
}

const KeyboardKeyComponent = ({
  letter,
  correctness,
  disabled = false,
  variant = KEY_VARIANTS.NORMAL,
  onPress,
}: KeyboardKeyProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const isDeleteKey = letter === 'DELETE';

  // Combine styles based on props
  const containerStyle = [
    styles.container,
    styles[variant as keyof typeof styles] as ViewStyle,
    disabled && styles.disabled,
  ];

  const keyStyle = [
    styles.key,
    isPressed && {
      backgroundColor: correctness
        ? colorMediumMap[correctness]
        : colors.mediumGrey,
      transform: [{scale: 0.9}],
    },
  ];

  return (
    <Pressable
      style={containerStyle}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}>
      <View style={keyStyle}>
        {isDeleteKey ? (
          <DeleteKeyIcon width={30} height={50} />
        ) : (
          <Text
            style={[
              styles.keyText,
              {color: correctness ? colorMap[correctness] : colors.lightGrey},
            ]}>
            {letter}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 31,
    height: 40,
    marginHorizontal: 3,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normal: {
    width: 31,
    alignItems: 'center',
  },
  start: {
    width: 50,
    alignItems: 'flex-end',
  },
  end: {
    width: 50,
    alignItems: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  key: {
    width: 31,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 24,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
});

export default withMeasure(KeyboardKeyComponent);
