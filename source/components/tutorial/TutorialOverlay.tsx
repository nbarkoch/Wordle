import {
  Canvas,
  Group,
  Mask,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import {Dimensions, StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {ComponentPosition} from '~/store/spotlightStore';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

const {width, height} = Dimensions.get('screen');

interface TutorialOverlayProps {
  component: ComponentPosition | undefined;
  block?: boolean;
}

function TutorialOverlay({component, block = false}: TutorialOverlayProps) {
  // Animated values for the spotlight
  const x = useSharedValue(width / 2);
  const y = useSharedValue(height / 2);
  const rectWidth = useSharedValue(0);
  const rectHeight = useSharedValue(0);

  // For rendering - these will be updated in a way compatible with Skia
  const [animatedValues, setAnimatedValues] = React.useState({
    x: width / 2,
    y: height / 2,
    width: 0,
    height: 0,
  });

  // Update the Skia rendering values whenever Reanimated values change
  useAnimatedReaction(
    () => {
      return {
        x: x.value,
        y: y.value,
        width: rectWidth.value,
        height: rectHeight.value,
      };
    },
    current => {
      runOnJS(setAnimatedValues)(current);
    },
    [x.value, y.value, rectWidth.value, rectHeight.value],
  );

  // Update animated values when component changes
  useEffect(() => {
    if (component) {
      // Animate to new position and size
      x.value = withTiming(component.x - 10, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      y.value = withTiming(component.y - 5, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      rectWidth.value = withTiming(component.width + 20, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      rectHeight.value = withTiming(component.height + 10, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      // Default values or off-screen positioning when no component
      x.value = withTiming(width / 2, {duration: 300});
      y.value = withTiming(height / 2, {duration: 300});
      rectWidth.value = withTiming(0, {duration: 300});
      rectHeight.value = withTiming(0, {duration: 300});
    }
  }, [component, rectHeight, rectWidth, x, y]);

  return (
    <View style={styles.overlay} pointerEvents={block ? 'box-only' : 'none'}>
      <Canvas style={styles.overlay}>
        <Mask
          mode="luminance"
          mask={
            <Group>
              <Rect x={0} y={0} width={width} height={height} color="white" />
              <RoundedRect
                x={animatedValues.x}
                y={animatedValues.y}
                width={animatedValues.width}
                height={animatedValues.height}
                r={25}
                color="black"
              />
            </Group>
          }>
          <Rect x={0} y={0} width={width} height={height} color="#000000c1" />
        </Mask>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width,
    height,
    zIndex: 5,
  },
});

export default TutorialOverlay;
