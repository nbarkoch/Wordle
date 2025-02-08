import React, {forwardRef} from 'react';
import {ScrollView, View, StyleSheet, ScrollViewProps} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientOverlayScrollViewProps extends ScrollViewProps {
  upperColor: string;
  bottomColor: string;
  gradientHeight?: number;
}

const GradientOverlayScrollView = forwardRef<
  ScrollView,
  GradientOverlayScrollViewProps
>(
  (
    {
      children,
      upperColor,
      bottomColor,
      gradientHeight = 100,
      style,
      ...scrollViewProps
    },
    ref,
  ) => {
    return (
      <View style={[styles.container, style]}>
        <ScrollView ref={ref} {...scrollViewProps}>
          {children}
        </ScrollView>
        <LinearGradient
          colors={[upperColor, 'transparent']}
          style={[
            styles.gradient,
            styles.topGradient,
            {height: gradientHeight},
          ]}
        />
        <LinearGradient
          colors={['transparent', bottomColor]}
          style={[
            styles.gradient,
            styles.bottomGradient,
            {height: gradientHeight},
          ]}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'column',
  },
  gradientStep: {
    width: '100%',
    flex: 1,
  },
  topGradient: {
    top: 0,
  },
  bottomGradient: {
    bottom: 0,
  },
});

export default GradientOverlayScrollView;
