import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {Canvas, Path, Skia} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

interface StripePatternProps {
  width: number;
  height: number;
  style?: any;
  colors: [string, string];
  stripeWidth?: number;
  stripeSpeed?: number;
  compression?: number;
}

const linearEasing = (value: number) => {
  'worklet';
  return value;
};

const StripePattern = ({
  width,
  height,
  style,
  colors,
  stripeWidth = 10,
  stripeSpeed = 2000,
  compression = 2,
}: StripePatternProps) => {
  const offsetX = useSharedValue(0);
  const [primaryColor, secondaryColor] = colors;

  useEffect(() => {
    offsetX.value = withRepeat(
      withTiming(stripeWidth * 4, {
        duration: stripeSpeed,
        easing: linearEasing,
      }),
      -1,
      false,
    );
    return () => cancelAnimation(offsetX);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: offsetX.value - compression * 4}, {scaleX: 2}],
    };
  });

  const stripes = useMemo(() => {
    const stripes = [];

    for (let i = -stripeWidth; i < width + compression; i += stripeWidth) {
      const path = Skia.Path.Make();
      path.moveTo(i, height);
      path.lineTo(i + stripeWidth, height);
      path.lineTo(i + stripeWidth * compression, 0);
      path.lineTo(i + stripeWidth * compression - stripeWidth, 0);
      path.close();

      stripes.push(
        <Path
          key={i}
          path={path}
          color={i % 2 == 0 ? primaryColor : secondaryColor}
        />,
      );
    }
    return stripes;
  }, [colors]);

  return (
    <View style={{backgroundColor: primaryColor, overflow: 'hidden', ...style}}>
      <Animated.View style={animatedStyle}>
        <Canvas style={{width: width, height}}>{stripes}</Canvas>
      </Animated.View>
    </View>
  );
};

export default StripePattern;
