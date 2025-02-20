import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import HomeIcon from '~/assets/icons/house.svg';
import ChevronRight from '~/assets/icons/chevron-right.svg';

import StarRating from './StarRating';
import {useTimerStore} from '~/store/useTimerStore';
import {formatTime} from '../grid/Timer';
import {colors} from '~/utils/colors';
import useSound from '~/useSound';
import {addToRevealedList} from '~/store/revealsStore';
import {Difficulty, GameCategory} from '~/utils/types';

const {width, height} = Dimensions.get('window');
interface GameResultDialogProps {
  isVisible: boolean;
  isSuccess: boolean;
  onNewGame: () => void;
  onGoHome: () => void;
  currentScore: number;
  secretWord: string;
  hint: string;
  category: GameCategory;
  difficulty: Difficulty;
  gameType: 'DAILY' | 'RANDOM';
}

const GameResultDialog = ({
  isVisible,
  onNewGame,
  onGoHome,
  currentScore,
  secretWord,
  isSuccess,
  hint,
  category,
  difficulty,
  gameType,
}: GameResultDialogProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonContainerAnimation = useSharedValue(0);
  const scoreWrapperAnimation = useSharedValue(0);
  const [block, setBlock] = useState<boolean>(false);
  const {playSound: playWinning} = useSound('winning.mp3');
  const {playSound: playSuccess} = useSound('success.mp3');
  const {playSound: playNicelyDone} = useSound('nicely_done.mp3');
  const {playSound: playFailure} = useSound('fail.wav');
  const {time} = useTimerStore();

  const rating = Math.min(
    Math.round(
      ((currentScore - secretWord.length) / secretWord.length) * 3 + 1,
    ),
    3,
  );

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
    return () => {
      cancelAnimation(buttonContainerAnimation);
      cancelAnimation(scoreWrapperAnimation);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [
    isVisible,
    block,
    scale,
    opacity,
    buttonContainerAnimation,
    scoreWrapperAnimation,
  ]);

  useEffect(() => {
    if (isVisible) {
      if (isSuccess) {
        if (rating === 3) {
          playWinning();
        } else if (rating > 1) {
          playSuccess();
        } else {
          playNicelyDone();
        }

        addToRevealedList(
          secretWord,
          time,
          currentScore,
          hint,
          category,
          difficulty,
        );
      } else {
        playFailure();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isVisible, rating]);

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

  if (!block && !isVisible) {
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
                colors={[
                  colors.container.a,
                  colors.container.b,
                  colors.container.c,
                ]}
              />
            </RoundedRect>
            <RoundedRect x={5} y={5} width={290} height={290} r={15}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 300)}
                colors={[colors.secondary.a, colors.secondary.b]}
              />
            </RoundedRect>
          </Canvas>
          <View style={styles.dialog}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{'סיכום'}</Text>
            </View>
            <StarRating width={270} height={100} rating={rating} />
            {isVisible && (
              <>
                {(gameType === 'RANDOM' || isSuccess) && (
                  <>
                    <Text style={styles.secretWordWas}>{'מילה סודית:'}</Text>
                    <Text style={styles.secretWord}>{secretWord}</Text>
                  </>
                )}
                <Animated.View style={[styles.scoreWrapper, scoreWrapperStyle]}>
                  <View style={styles.scoreContainer}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>{'ניקוד'}</Text>
                      <Text style={styles.scoreValue}>{currentScore}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={[styles.scoreRow]}>
                      <Text style={[styles.scoreLabel]}>{'זמן משחק'}</Text>
                      <Text style={styles.scoreValue}>{formatTime(time)}</Text>
                    </View>
                  </View>
                </Animated.View>
              </>
            )}
          </View>
        </View>
        <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
          <Pressable
            style={[styles.button, styles.homeButton]}
            onPress={onGoHome}>
            <HomeIcon width={34} height={34} />
          </Pressable>
          {gameType === 'RANDOM' && (
            <Pressable
              style={[styles.button, styles.nextButton]}
              onPress={onNewGame}>
              <ChevronRight width={34} height={34} />
            </Pressable>
          )}
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
    top: -18,
    backgroundColor: colors.gold,
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
    backgroundColor: colors.boxInfo.background,
    borderColor: colors.boxInfo.border,
    borderWidth: 2,
    borderRadius: 10,
  },
  scoreRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.lightGold,
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
    paddingHorizontal: 50,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 6,
  },
  nextButton: {
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: colors.boxInfo.border,
  },
  secretWordWas: {
    color: colors.boxInfo.border,
    fontWeight: '500',
  },
  secretWord: {
    fontFamily: 'PloniDL1.1AAA-Bold',
    fontSize: 16,
    color: colors.gold,
  },
});

export default GameResultDialog;
