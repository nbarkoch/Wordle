import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import HomeIcon from '~/assets/icons/home.svg';
import ChevronRight from '~/assets/icons/chevron-right.svg';

import StarRating from './StarRating';
import {useTimerStore} from '~/store/useTimerStore';
import {formatTime} from './Timer';

const {width, height} = Dimensions.get('window');
interface GameResultDialogProps {
  isVisible: boolean;
  isSuccess: boolean;
  onNewGame: () => void;
  onGoHome: () => void;
  currentScore: number;
  secretWord: string;
}

const GameResultDialog = ({
  isVisible,
  onNewGame,
  onGoHome,
  currentScore,
  secretWord,
}: GameResultDialogProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonContainerAnimation = useSharedValue(0);
  const scoreWrapperAnimation = useSharedValue(0);

  const {time} = useTimerStore();

  useEffect(() => {
    if (isVisible) {
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
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.exp),
      });
      buttonContainerAnimation.value = 0;
      scoreWrapperAnimation.value = 0;
    }
  }, [
    isVisible,
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

  const buttonContainerStyle = useAnimatedStyle(() => ({
    zIndex: -1,
    transform: [
      {
        translateY: interpolate(
          buttonContainerAnimation.value,
          [0, 1],
          [-50, 0],
        ),
      },
    ],
    opacity: buttonContainerAnimation.value,
  }));

  const scoreWrapperStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scoreWrapperAnimation.value, [0, 1], [0.5, 1]),
      },
    ],
    opacity: scoreWrapperAnimation.value,
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="auto">
      <Animated.View style={[styles.overlayDialog, animatedStyle]}>
        <View style={styles.dialogWrapper}>
          <Canvas style={styles.canvas}>
            <RoundedRect x={0} y={0} width={300} height={300} r={20}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(300, 300)}
                colors={['#BBB6A6', '#e0b87f', '#BBB6A6']}
              />
            </RoundedRect>
            <RoundedRect x={5} y={5} width={290} height={290} r={15}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 300)}
                colors={['#224d66', '#3B4457']}
              />
            </RoundedRect>
          </Canvas>
          <View style={styles.dialog}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>SUMMARY</Text>
            </View>
            <StarRating
              width={270}
              height={100}
              rating={Math.min(currentScore, 3)}
            />
            <Text style={styles.secretWordWas}>{'Secret Word:'}</Text>
            <Text style={styles.secretWord}>{secretWord}</Text>
            <Animated.View style={[styles.scoreWrapper, scoreWrapperStyle]}>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>{currentScore}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
                <View style={styles.divider} />
                <View style={[styles.scoreRow]}>
                  <Text style={styles.scoreValue}>{formatTime(time)}</Text>
                  <Text style={[styles.scoreLabel]}>Time</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
        <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
          <Pressable
            style={[styles.button, styles.nextButton]}
            onPress={onNewGame}>
            <ChevronRight width={34} height={34} />
          </Pressable>

          <Pressable
            style={[styles.button, styles.homeButton]}
            onPress={onGoHome}>
            <HomeIcon width={34} height={34} />
          </Pressable>
        </Animated.View>
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
    height: 300,
    padding: 3,
    elevation: 6,
  },
  canvas: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  dialog: {
    height: '100%',
    borderRadius: 17,
    alignItems: 'center',
    paddingTop: 30,
  },
  titleContainer: {
    position: 'absolute',
    top: -15,
    backgroundColor: '#F7C275',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreWrapper: {
    width: '100%',
    flex: 1,
    padding: 20,
    marginHorizontal: 10,
    justifyContent: 'center',
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
  scoreLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F9F3AC',
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F9F3AC',
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
    backgroundColor: '#7FCCB5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#2993d1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: '#e0b87f',
  },
  secretWordWas: {
    color: '#758082',
    fontWeight: '500',
  },
  secretWord: {
    fontWeight: '900',
    fontSize: 16,
    color: '#e0b87f',
  },
});

export default GameResultDialog;
