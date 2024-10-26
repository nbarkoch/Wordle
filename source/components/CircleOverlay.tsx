import React, {useImperativeHandle, forwardRef} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import useSound from '~/useSound';

export interface CircleOverlayRef {
  activateOverlay: () => void;
}

interface CircleOverlayProps {
  color: string;
}

const CircleOverlay = forwardRef<CircleOverlayRef, CircleOverlayProps>(
  ({color}, ref) => {
    const animation = useSharedValue(0);
    const {playSound} = useSound('submit.mp3');

    const activateOverlay = () => {
      cancelAnimation(animation);
      playSound();
      animation.value = withTiming(
        1,
        {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        },
        finished => {
          if (finished) {
            animation.value = 0;
          }
        },
      );
    };

    useImperativeHandle(ref, () => ({
      activateOverlay,
    }));

    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animation.value,
        [0, 0.1, 0.5, 1],
        [0, 1, 0.85, 0],
      );
      const scaleX = interpolate(animation.value, [0, 1], [0.875, 1.5]);
      const scaleY = interpolate(animation.value, [0, 1], [0.875, 1.5]);
      return {
        opacity,
        transform: [{scaleY: scaleY}, {scaleX: scaleX}],
      };
    });

    return (
      <Animated.View
        style={[styles.CircleOverlay, animatedStyle, {borderColor: color}]}
      />
    );
  },
);

const styles = StyleSheet.create({
  CircleOverlay: {
    zIndex: 1,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderRadius: 25,
  },
});

export default CircleOverlay;
