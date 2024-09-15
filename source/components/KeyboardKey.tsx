import React, {useState, useMemo} from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';

import {Correctness, darkenColor} from '~/utils/ui';

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

  const baseColor = useMemo(() => {
    switch (correctness) {
      case 'correct':
        return '#2fb56b';
      case 'exists':
        return '#ffcf42';
      case 'notInUse':
        return '#999999';
      default:
        return '#e0e0e0';
    }
  }, [correctness]);

  const letterColor = useMemo(() => {
    switch (correctness) {
      case null:
        return '#6a6a6a';
      default:
        return '#ffff';
    }
  }, [correctness]);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const keyStyle = useMemo(() => {
    const baseStyle = [
      styles.key,
      style,
      {backgroundColor: baseColor},
      disabled && styles.keyDisabled,
    ];

    if (isPressed) {
      return [
        ...baseStyle,
        {backgroundColor: darkenColor(baseColor, 20)},
        {transform: [{scale: 0.9}]},
      ];
    }

    return baseStyle;
  }, [style, baseColor, disabled, isPressed]);

  return (
    <Pressable
      disabled={disabled}
      style={keyStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(letter ?? '')}>
      {children ?? (
        <Text style={[styles.keyText, {color: letterColor}]}>{letter}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  key: {
    width: 30,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default KeyboardKey;
