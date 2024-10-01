import React, {useImperativeHandle, forwardRef} from 'react';
import {StyleSheet, Vibration} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {useScoreStore} from '~/store/useScore';
import {colors} from '~/utils/colors';

const vibrate = () => {
  Vibration.vibrate([0, 70]);
};

export interface RowOverlayRef {
  activateOverlay: (delay: number) => void;
}

interface RowOverlayProps {
  aspect: number;
}

const RowOverlay = forwardRef<RowOverlayRef, RowOverlayProps>(
  ({aspect}, ref) => {
    const animation = useSharedValue(0);

    const {addScore} = useScoreStore();

    const activateOverlay = (delay: number) => {
      const timeout = setTimeout(() => {
        vibrate();
        addScore(+1);
        clearTimeout(timeout);
      }, delay);

      animation.value = withDelay(
        delay,
        withTiming(
          1,
          {
            duration: 1000,
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
        [0, 0.5, 0.1, 0],
      );
      const scaleX = interpolate(animation.value, [0, 1], [1 - 0.025, 1.1]);
      const scaleY = interpolate(
        animation.value,
        [0, 1],
        [1 - 0.025 * aspect, 1.1 * aspect],
      );

      return {
        opacity,
        transform: [{scaleY: scaleY}, {scaleX: scaleX}],
      };
    });

    return <Animated.View style={[styles.rowOverlay, animatedStyle]} />;
  },
);

const styles = StyleSheet.create({
  rowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: colors.green,
    borderWidth: 4,
    borderRadius: 10,
  },
});

export default RowOverlay;
