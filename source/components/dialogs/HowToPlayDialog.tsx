import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  I18nManager,
  ScrollView,
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
import {Correctness} from '~/utils/ui';

const {width, height} = Dimensions.get('window');

interface RowMockupProps {
  letters: string[];
  correctness: (Correctness | undefined)[];
}
function RowMockUp({letters, correctness}: RowMockupProps) {
  const getColor = (status: Correctness | undefined) => {
    switch (status) {
      case 'correct':
        return colors.green;
      case 'exists':
        return colors.yellow;
      case 'notInUse':
        return colors.red;
      case undefined:
        return undefined;
      default:
        return colors.lightGrey;
    }
  };

  const getFontColor = (status: Correctness | undefined) => {
    switch (status) {
      case 'correct':
      case 'exists':
      case 'notInUse':
        return colors.white;
      case undefined:
        return 'transparent';
      default:
        return colors.darkGrey;
    }
  };

  return (
    <View style={mockUpStyle.row}>
      {letters.map((letterValue, index) => (
        <Animated.View
          key={`${letterValue}-${index}`}
          style={[
            mockUpStyle.cell,
            {backgroundColor: getColor(correctness[index])},
          ]}>
          <Animated.Text
            style={[
              mockUpStyle.letter,
              {
                color: getFontColor(correctness[index]),
              },
            ]}>
            {letterValue}
          </Animated.Text>
        </Animated.View>
      ))}
    </View>
  );
}

const mockUpStyle = StyleSheet.create({
  row: {
    zIndex: 10,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  cell: {
    width: 45,
    height: 45,
    borderRadius: 17,
    marginVertical: 4,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    zIndex: 10,
  },
  letter: {
    fontSize: 28,
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

interface HowToPlayDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const HowToPlayDialog = ({isVisible, onClose}: HowToPlayDialogProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonContainerAnimation = useSharedValue(0);
  const scoreWrapperAnimation = useSharedValue(0);
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
      scoreWrapperAnimation.value = withDelay(
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
      scoreWrapperAnimation.value = 0;
    }
  }, [
    isVisible,
    block,
    scale,
    opacity,
    buttonContainerAnimation,
    scoreWrapperAnimation,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const scoreWrapperStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scoreWrapperAnimation.value, [0, 1], [0.5, 1]),
      },
    ],
    opacity: scoreWrapperAnimation.value,
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
              <Animated.View style={[styles.scoreWrapper, scoreWrapperStyle]}>
                <Text style={styles.text}>Guess the word in 6 tries</Text>
                <Text style={styles.text}>
                  {
                    'When you press submit, the letters turns to colors for giving you hints'
                  }
                </Text>
                <Text style={styles.text}>{'For example, for the word:'}</Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'S', 'E', 'U', 'G']}
                    correctness={[null, null, null, null, null]}
                  />
                </View>
                <Text style={styles.text}>{'And you guessed..'}</Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'S', 'E', 'U', 'G']}
                    correctness={[
                      'correct',
                      'notInUse',
                      'notInUse',
                      'exists',
                      'correct',
                    ]}
                  />
                </View>
                <Text style={styles.text}>{'Then the colors mean..'}</Text>
                <Text style={styles.text}>
                  {'Letters in the correct position:'}
                </Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'S', 'E', 'U', 'G']}
                    correctness={[
                      'correct',
                      undefined,
                      undefined,
                      undefined,
                      'correct',
                    ]}
                  />
                </View>
                <Text style={styles.text}>
                  {'Letters in the wrong position:'}
                </Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'S', 'E', 'U', 'G']}
                    correctness={[
                      undefined,
                      undefined,
                      undefined,
                      'exists',
                      undefined,
                    ]}
                  />
                </View>
                <Text style={styles.text}>{'Letters not in word:'}</Text>
                <View style={{transform: [{scale: 0.8}]}}>
                  <RowMockUp
                    letters={['S', 'S', 'E', 'U', 'G']}
                    correctness={[
                      undefined,
                      'notInUse',
                      'notInUse',
                      undefined,
                      undefined,
                    ]}
                  />
                </View>
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
    top: -30,
    width: 385,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  scoreWrapper: {
    width: '100%',
    flex: 1,
    padding: 20,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  scoreContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#19273040',
    borderColor: '#77807F',
    borderWidth: 2,
    borderRadius: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.lightGrey,
    paddingVertical: 4,
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.lightGold,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    overflow: 'visible',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 6,
  },
  nextButton: {
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: colors.gold,
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
});

export default HowToPlayDialog;
