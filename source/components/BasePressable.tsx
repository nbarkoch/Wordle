import {ReactNode, useCallback} from 'react';
import {Pressable} from 'react-native';
import React from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface BasePressableProps {
  onPress?: () => void;
  children: ReactNode;
  style: any;
}

function BasePressable(props: BasePressableProps) {
  const {onPress, style, children, ...rest} = props;
  const scaleAnimation = useSharedValue<number>(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleAnimation.value}],
  }));

  const $onPress = useCallback(() => {
    if (onPress !== undefined) {
      scaleAnimation.value = withSpring(0.9, {}, () => {
        scaleAnimation.value = withSpring(1);
        runOnJS(onPress)();
      });
    }
  }, [onPress, scaleAnimation]);

  return (
    <Pressable onPress={$onPress} style={style} {...rest}>
      <Animated.View style={[animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

export default BasePressable;
