import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
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
import RowMockUp from './MockUpRow';
import HintWordButton from '../HintWordsButton';
import AboutButton from '../AboutButton';

const {width, height} = Dimensions.get('window');

interface HowToPlayDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const HowToPlayDialog = ({isVisible, onClose}: HowToPlayDialogProps) => {
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
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="auto">
      <Animated.View style={[styles.overlayDialog, animatedStyle]}>
        <View style={styles.dialogWrapper}>
          <Canvas style={styles.canvas}>
            <RoundedRect x={0} y={0} width={300} height={height - 100} r={20}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(300, 300)}
                colors={['#BBB6A6', '#e0b87f', '#BBB6A6']}
              />
            </RoundedRect>
            <RoundedRect x={5} y={5} width={290} height={height - 110} r={15}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 300)}
                colors={['#224d66', '#3B4457']}
              />
            </RoundedRect>
          </Canvas>
          <View style={styles.dialog}>
            <View style={styles.titleContainer}>
              <CloseIcon onPress={onClose} />
            </View>
            <Text style={styles.title}>{'How To Play'}</Text>
            <ScrollView
              horizontal={false}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}>
              <Animated.View style={[styles.introduction, introductionStyle]}>
                <Text style={styles.text}>Guess the word in 6 tries</Text>
                <Text style={styles.text}>
                  {'Colors show hint after each guess'}
                </Text>
                <Text style={styles.text}>{'Example:'}</Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'D', 'R', 'O', 'W']}
                    correctness={[null, null, null, null, null]}
                  />
                </View>
                <Text style={styles.text}>{'Your guess:'}</Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'D', 'R', 'O', 'W']}
                    correctness={[
                      'correct',
                      'notInUse',
                      'notInUse',
                      'exists',
                      'correct',
                    ]}
                  />
                </View>
                <Text style={styles.text}>{'Green: Correct position'}</Text>
                <Text style={styles.text}>{'Yellow: Wrong position'}</Text>
                <Text style={styles.text}>{'Red: Not in word'}</Text>
                <View style={styles.divider} />
                <Text style={styles.text}>{'Hint buttons:'}</Text>
                <View style={styles.row}>
                  <HintWordButton onHintRequested={() => {}} scoreCost={0} />
                  <View style={styles.padder} />
                  <AboutButton onInfoRequested={() => {}} scoreCost={0} />
                </View>
                <Text style={styles.text}>{'Using hints costs points'}</Text>
                <Text style={styles.text}>
                  {'i: Word info, Bulb: Reveal letters'}
                </Text>
              </Animated.View>
            </ScrollView>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
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
    width: 300,
    height: height - 100,
    padding: 3,
    elevation: 6,
  },
  canvas: {
    position: 'absolute',
    width: 300,
    height: height - 100,
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
    width: 380,
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
    fontSize: 15,
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

export default HowToPlayDialog;
