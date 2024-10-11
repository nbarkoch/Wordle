import React from 'react';
import {ScrollView, View, StyleSheet, ScrollViewProps} from 'react-native';

interface GradientOverlayScrollViewProps extends ScrollViewProps {
  upperColor: string;
  bottomColor: string;
  gradientHeight?: number;
}

const GradientOverlayScrollView: React.FC<GradientOverlayScrollViewProps> = ({
  children,
  upperColor,
  bottomColor,
  gradientHeight = 100,
  style,
  ...scrollViewProps
}) => {
  const gh = gradientHeight;
  return (
    <View style={[styles.container, style]}>
      <ScrollView {...scrollViewProps}>{children}</ScrollView>
      <View
        style={[styles.gradient, styles.topGradient, {height: gradientHeight}]}>
        {[...Array(gh)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.gradientStep,
              {
                backgroundColor: upperColor,
                opacity: 1 - index / gh,
                flex: 1,
              },
            ]}
          />
        ))}
      </View>
      <View
        style={[
          styles.gradient,
          styles.bottomGradient,
          {height: gradientHeight},
        ]}>
        {[...Array(gh)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.gradientStep,
              {
                backgroundColor: bottomColor,
                opacity: index / gh,
                flex: 1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

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
  },
  topGradient: {
    top: 0,
  },
  bottomGradient: {
    bottom: 0,
  },
});

export default GradientOverlayScrollView;
