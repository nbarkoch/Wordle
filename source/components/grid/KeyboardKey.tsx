import React, {useState, useMemo, useCallback} from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {colors} from '~/utils/colors';
import {colorMap, colorMediumMap} from '~/utils/ui';
import {Correctness} from '~/utils/words';
import {withMeasure} from '../tutorial/withSpotlight';

interface KeyboardKeyProps {
  letter?: string;
  onPress: (key: string) => void;
  style?: ViewStyle;
  disabled?: boolean;
  children?: React.ReactNode;
  correctness?: Correctness;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  letter,
  onPress,
  style,
  disabled = false,
  children,
  correctness,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const keyStyle = useMemo(() => {
    const baseStyle = [styles.key, style, disabled && styles.keyDisabled];

    if (isPressed) {
      return [
        ...baseStyle,
        {
          backgroundColor: correctness
            ? colorMediumMap[correctness]
            : colors.mediumGrey,
        },
        {transform: [{scale: 0.9}]},
      ];
    }

    return baseStyle;
  }, [style, correctness, disabled, isPressed]);

  const $onPress = useCallback(() => onPress(letter ?? ''), [letter, onPress]);

  return (
    <Pressable
      disabled={disabled}
      style={keyStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={$onPress}>
      {children ?? (
        <Text
          style={[
            styles.keyText,
            {color: correctness ? colorMap[correctness] : colors.lightGrey},
          ]}>
          {letter}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  key: {
    width: 31,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    marginVertical: 5,
    borderRadius: 5,
  },
  keyDisabled: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 24,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
});

export default withMeasure(KeyboardKey);
