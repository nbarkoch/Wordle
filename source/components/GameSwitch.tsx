import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
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
import {colors} from '~/utils/colors';

interface GameSwitchProps {
  width?: number;
  height?: number;
  borderWidth?: number; // New prop for border width
  onToggle: (value: boolean) => void;
  ballMargin?: number;
}

const AnimatedCanvas = Animated.createAnimatedComponent(Canvas);

const GameSwitch: React.FC<GameSwitchProps> = ({
  width = 110,
  height = 50,
  borderWidth = 3,
  ballMargin = 4,
  onToggle,
}) => {
  const [isOn, setIsOn] = useState<boolean>(false);

  const startColor = useSharedValue(colors.darkRed);
  const endColor = useSharedValue(colors.red);
  const ballColor = useSharedValue(colors.lightRed);
  const borderColor = useSharedValue(colors.lightRed);
  const ballPosition = useSharedValue(borderWidth);

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
      startColor.value = withTiming(colors.darkRed);
      endColor.value = withTiming(colors.red);
      ballColor.value = withTiming(colors.lightRed);
      borderColor.value = withTiming(colors.lightRed);
      ballPosition.value = withTiming(borderWidth, {duration: 300}); // Move ball to the left
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
    transform: [{translateX: ballPosition.value - borderWidth}],
    backgroundColor: ballColor.value,
  }));

  return (
    <Pressable onPress={handlePress}>
      <AnimatedCanvas style={[{width, height}]}>
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
            r={(height - borderWidth * 2) / 2}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, 0)}
              colors={gradientColors}
            />
          </RoundedRect>
        </Group>
      </AnimatedCanvas>
      <Animated.View
        style={[
          ballStyle,
          {
            position: 'absolute',
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

const styles = StyleSheet.create({});

export default GameSwitch;
