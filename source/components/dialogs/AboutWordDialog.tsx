import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';

import {colors} from '~/utils/colors';
import CloseIcon from './CloseIcon';

const {width, height} = Dimensions.get('window');

const dialogWidth = Math.min(width, height) - 60;
const dialogHeight = dialogWidth - 100;

interface AboutWordDialogProps {
  isVisible: boolean;
  onClose: () => void;
  hint: string;
}

const AboutWordDialog = ({isVisible, onClose, hint}: AboutWordDialogProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonContainerAnimation = useSharedValue(0);
  const introductionAnimation = useSharedValue(0);
  const [block, setBlock] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible) {
      setBlock(true);
      scale.value = withSpring(1, {damping: 12, stiffness: 100});
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      buttonContainerAnimation.value = withDelay(
        500,
        withSpring(1, {damping: 15, stiffness: 80}),
      );
      introductionAnimation.value = withDelay(
        300,
        withSpring(1, {damping: 12, stiffness: 100}),
      );
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(
        0,
        {
          duration: 200,
          easing: Easing.in(Easing.exp),
        },
        finish => {
          if (finish) {
            runOnJS(setBlock)(false);
          }
        },
      );
      buttonContainerAnimation.value = 0;
      introductionAnimation.value = 0;
    }
  }, [
    isVisible,
    block,
    scale,
    opacity,
    buttonContainerAnimation,
    introductionAnimation,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const introductionStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(introductionAnimation.value, [0, 1], [0.5, 1]),
      },
    ],
    opacity: introductionAnimation.value,
  }));

  if (!block && !isVisible) {
    return null;
  }

  return (
    <Pressable style={{position: 'absolute', width, height}} onPress={onClose}>
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        pointerEvents="auto">
        <Animated.View style={[styles.overlayDialog, animatedStyle]}>
          <View style={styles.dialogWrapper}>
            <Canvas style={styles.canvas}>
              <RoundedRect
                x={0}
                y={0}
                width={dialogWidth}
                height={dialogHeight}
                r={20}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(dialogWidth, dialogHeight)}
                  colors={['#BBB6A6', '#e0b87f', '#BBB6A6']}
                />
              </RoundedRect>
              <RoundedRect
                x={5}
                y={5}
                width={dialogWidth - 10}
                height={dialogHeight - 10}
                r={15}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, dialogHeight)}
                  colors={['#224d66', '#3B4457']}
                />
              </RoundedRect>
            </Canvas>
            <View style={styles.dialog}>
              <View style={styles.titleContainer}>
                <CloseIcon onPress={onClose} />
              </View>
              <Text style={styles.title}>{'About Word'}</Text>
              <ScrollView
                horizontal={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}>
                <Animated.View style={[styles.introduction, introductionStyle]}>
                  <Text style={styles.text}>{hint}</Text>
                </Animated.View>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width,
    height,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayDialog: {
    width,
    height,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  dialogWrapper: {
    width: dialogWidth,
    height: dialogHeight,
    padding: 3,
    elevation: 6,
  },
  canvas: {
    position: 'absolute',
    width: dialogWidth,
    height: dialogHeight,
  },
  dialog: {
    height: '100%',
    borderRadius: 17,
    alignItems: 'center',
    paddingTop: 30,
  },
  titleContainer: {
    position: 'absolute',
    top: -25,
    width: dialogWidth + 70,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  introduction: {
    width: '100%',
    flex: 1,
    padding: 20,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.lightGrey,
    paddingVertical: 4,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    width: '100%',
    backgroundColor: colors.gold,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  title: {
    color: colors.lightYellow,
    fontSize: 23,
    fontWeight: '900',
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  padder: {
    width: 30,
  },
  row: {flexDirection: 'row', padding: 10},
});

export default AboutWordDialog;
