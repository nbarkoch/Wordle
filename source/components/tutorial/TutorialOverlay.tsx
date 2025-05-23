import React, {useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {ComponentPosition} from '~/store/spotlightStore';
import {
  Canvas,
  Group,
  Mask,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

const {width, height} = Dimensions.get('screen');

const InteractionBlocker = ({component}: {component: ComponentPosition}) => {
  const up = {
    top: 0,
    left: 0,
    right: 0,
    height: component.y,
  };
  const down = {
    top: component.y + component.height,
    left: 0,
    right: 0,
    height: height - component.y,
  };
  const left = {
    top: component.y,
    left: component.x + component.width,
    right: 0,
    height: component.height,
  };
  const right = {
    top: component.y,
    left: 0,
    right: width - component.x,
    height: component.height,
  };
  return (
    <>
      <View style={[styles.blocker, up]} pointerEvents={'box-only'} />
      <View style={[styles.blocker, down]} pointerEvents={'box-only'} />
      <View style={[styles.blocker, left]} pointerEvents={'box-only'} />
      <View style={[styles.blocker, right]} pointerEvents={'box-only'} />
    </>
  );
};

interface TutorialOverlayProps {
  component: ComponentPosition | undefined;
  components?: ComponentPosition[];
  block?: boolean;
}

function TutorialOverlay({
  component,
  components,
  block = false,
}: TutorialOverlayProps) {
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
      if (rectWidth.value === 0 && rectHeight.value === 0) {
        x.value = component.x - 10 + (component.width + 20) / 2;
        y.value = component.y - 5 + (component.height + 10) / 2;
      }

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
      x.value = withTiming(x.value + rectWidth.value / 2, {duration: 300});
      y.value = withTiming(y.value + rectHeight.value / 2, {duration: 300});
      rectWidth.value = withTiming(0, {duration: 300}, finish => {
        if (finish) {
          x.value = width / 2;
          y.value = height / 2;
        }
      });
      rectHeight.value = withTiming(0, {duration: 300});
    }
  }, [component, rectHeight, rectWidth, x, y]);

  return (
    <>
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
                  color={components ? '#00000090' : 'black'}
                />
                {components?.map($component => (
                  <RoundedRect
                    key={$component.id}
                    x={$component.x}
                    y={$component.y}
                    width={$component.width}
                    height={$component.height}
                    r={25}
                    color="black"
                  />
                ))}
              </Group>
            }>
            <Rect x={0} y={0} width={width} height={height} color="#000000c1" />
          </Mask>
        </Canvas>
      </View>
      {component && <InteractionBlocker component={component} />}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width,
    height,
    zIndex: 5,
  },
  blocker: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default TutorialOverlay;
