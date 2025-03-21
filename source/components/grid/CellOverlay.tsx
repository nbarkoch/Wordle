import React, {useImperativeHandle, forwardRef} from 'react';
import {StyleSheet, Vibration} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import useSound from '~/useSound';

const vibrate = () => {
  Vibration.vibrate([20, 20]);
};

export interface CellOverlayRef {
  activateOverlay: (delay: number) => void;
}

interface CellOverlayProps {
  color: string;
}

const CellOverlay = forwardRef<CellOverlayRef, CellOverlayProps>(
  ({color}, ref) => {
    const animation = useSharedValue(0);
    const {playSound} = useSound('correct.wav');

    const activateOverlay = (delay: number) => {
      const timeout = setTimeout(() => {
        vibrate();
        playSound();
        clearTimeout(timeout);
      }, delay);
      cancelAnimation(animation);
      animation.value = withDelay(
        delay,
        withTiming(
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
        ),
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
        style={[styles.CellOverlay, animatedStyle, {borderColor: color}]}
      />
    );
  },
);

const styles = StyleSheet.create({
  CellOverlay: {
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

export default CellOverlay;
