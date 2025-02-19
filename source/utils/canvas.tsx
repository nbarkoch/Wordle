import React from 'react';
import {Canvas, LinearGradient, Rect, vec} from '@shopify/react-native-skia';
import {Dimensions, StyleSheet} from 'react-native';
import {colors} from './colors';

const {width, height} = Dimensions.get('window');

function CanvasBackground() {
  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[
            colors.primary.a,
            colors.primary.b,
            colors.primary.c,
            colors.primary.d,
          ]}
        />
      </Rect>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
});

export default CanvasBackground;
