import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {colors} from './colors';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

function CanvasBackground({opacity = 1}) {
  return (
    <LinearGradient
      style={[styles.canvas, {opacity}]}
      colors={[
        colors.primary.a,
        colors.primary.b,
        colors.primary.c,
        colors.primary.d,
      ]}
    />
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
