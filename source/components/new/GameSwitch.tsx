import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  Group,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors, ThemeColor } from '~/utils/colors';

interface GameSwitchProps {
  width?: number;
  height?: number;
  borderWidth?: number;
  onToggle: (value: boolean) => void;
  ballMargin?: number;
  defaultValue?: boolean;
}

const GameSwitch: React.FC<GameSwitchProps> = ({
  width = 110,
  height = 50,
  borderWidth = 3,
  ballMargin = 4,
  onToggle,
  defaultValue = false,
}) => {
  const [isOn, setIsOn] = useState<boolean>(defaultValue);

  const startColor = useSharedValue<ThemeColor>(
    isOn ? colors.darkGreen : colors.darkGrey,
  );
  const endColor = useSharedValue<ThemeColor>(
    isOn ? colors.green : colors.grey,
  );
  const ballColor = useSharedValue<ThemeColor>(
    isOn ? colors.lightGreen : colors.lightGrey,
  );
  const borderColor = useSharedValue<ThemeColor>(
    isOn ? colors.lightGreen : colors.lightGrey,
  );
  const ballPosition = useSharedValue(
    isOn ? width - height + borderWidth : borderWidth,
  );

  // Effect to handle changes to defaultValue from parent
  useEffect(() => {
    if (defaultValue !== isOn) {
      setIsOn(defaultValue);

      if (defaultValue) {
        startColor.value = withTiming(colors.darkGreen);
        endColor.value = withTiming(colors.green);
        ballColor.value = withTiming(colors.lightGreen);
        borderColor.value = withTiming(colors.lightGreen);
        ballPosition.value = withTiming(width - height + borderWidth, {
          duration: 300,
        });
      } else {
        startColor.value = withTiming(colors.darkGrey);
        endColor.value = withTiming(colors.grey);
        ballColor.value = withTiming(colors.lightGrey);
        borderColor.value = withTiming(colors.lightGrey);
        ballPosition.value = withTiming(borderWidth, { duration: 300 });
      }
    }
  }, [
    defaultValue,
    ballPosition,
    ballColor,
    borderColor,
    borderWidth,
    endColor,
    height,
    isOn,
    startColor,
    width,
  ]);

  const handlePress = () => {
    const newValue = !isOn;
    setIsOn(newValue);

    if (newValue) {
      startColor.value = withTiming(colors.darkGreen);
      endColor.value = withTiming(colors.green);
      ballColor.value = withTiming(colors.lightGreen);
      borderColor.value = withTiming(colors.lightGreen);
      ballPosition.value = withTiming(width - height + borderWidth, {
        duration: 300,
      });
    } else {
      startColor.value = withTiming(colors.darkGrey);
      endColor.value = withTiming(colors.grey);
      ballColor.value = withTiming(colors.lightGrey);
      borderColor.value = withTiming(colors.lightGrey);
      ballPosition.value = withTiming(borderWidth, { duration: 300 }); // Move ball to the left
    }
    onToggle(newValue);
  };

  const gradientColors = useDerivedValue(() => {
    return [startColor.value, endColor.value];
  });

  const derivedBorderColor = useDerivedValue(() => {
    return borderColor.value;
  });

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballPosition.value - borderWidth }],
    backgroundColor: ballColor.value,
  }));

  return (
    <Pressable onPress={handlePress}>
      <Canvas style={[{ width, height }]}>
        <Group>
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={height / 2}
            color={derivedBorderColor}
          />
          <RoundedRect
            x={borderWidth}
            y={borderWidth}
            width={width - borderWidth * 2}
            height={height - borderWidth * 2}
            r={(height - borderWidth * 2) / 2}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, 0)}
              colors={gradientColors}
            />
          </RoundedRect>
        </Group>
      </Canvas>
      <Animated.View
        style={[
          ballStyle,
          styles.ball,
          {
            width: height - borderWidth * 2 - ballMargin,
            height: height - borderWidth * 2 - ballMargin,
            borderRadius: (height - borderWidth * 2) / 2,
            top: borderWidth + ballMargin / 2,
            left: borderWidth + ballMargin / 2,
          },
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  ball: { position: 'absolute' },
});

export default GameSwitch;
