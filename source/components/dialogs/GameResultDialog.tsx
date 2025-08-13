import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
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
import LinearGradient from 'react-native-linear-gradient';
import HomeIcon from '~/assets/icons/house.svg';
import ChevronRight from '~/assets/icons/chevron-right.svg';

import StarRating from './StarRating';
import {useTimerStore} from '~/store/useTimerStore';
import {formatTime} from '../grid/Timer';
import {colors} from '~/utils/colors';
import useSound from '~/useSound';
import {addToRevealedList} from '~/store/revealsStore';
import {Difficulty, GameCategory} from '~/utils/types';
import {Canvas, Group, Path} from '@shopify/react-native-skia';
import BasePressable from '../BasePressable';
import InfoBubble from '../InfoBubble';
import {LETTER_READ_DURATION} from '~/utils/consts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

interface InfoIconProps {
  size?: number;
  fillColor?: string;
}

const InfoIcon = ({size = 22, fillColor = colors.gold}: InfoIconProps) => {
  const infoPath =
    'M12.0084 22.03C17.5358 22.03 22.0316 17.5342 22.0316 12.0067C22.0316 6.4793 17.5358 1.9834 12.0084 1.9834C6.48089 1.9834 1.98499 6.4793 1.98499 12.0067C1.98499 17.5342 6.48089 22.03 12.0084 22.03ZM12.0084 7.0184C12.7834 7.0184 13.4228 7.65778 13.4228 8.43278C13.4228 9.19599 12.7834 9.84716 12.0084 9.84716C11.2451 9.84716 10.5939 9.19599 10.5939 8.43278C10.5939 7.65778 11.2451 7.0184 12.0084 7.0184ZM13.7393 16.9951C13.7393 17.4638 13.3413 17.8617 12.8725 17.8617H11.1443C10.6755 17.8617 10.2775 17.4638 10.2775 16.9951V16.1284C10.2775 15.6596 10.6755 15.2617 11.1443 15.2617H11.5775V13.0067H11.1443C10.6755 13.0067 10.2775 12.6088 10.2775 12.1401V11.2734C10.2775 10.8046 10.6755 10.4067 11.1443 10.4067H12.8725C13.3413 10.4067 13.7393 10.8046 13.7393 11.2734V15.2617H13.8725C14.3413 15.2617 14.7393 15.6596 14.7393 16.1284V16.9951C14.7393 17.4638 14.3413 17.8617 13.8725 17.8617H13.7393V16.9951Z';
  return (
    <Canvas style={{width: size, height: size}}>
      <Group transform={[{scale: size / 24}]}>
        <Path path={infoPath} color={fillColor} />
      </Group>
    </Canvas>
  );
};

interface GameResultParams {
  isSuccess: boolean;
  currentScore: number;
  secretWord: string;
  hint: string;
  category: GameCategory;
  difficulty: Difficulty;
  gameType: 'DAILY' | 'RANDOM';
  maxAttempts: number;
  currentAttempt: number;
}

interface GameResultDialogProps {
  onNewGame: () => void;
  onGoHome: () => void;
}

export interface GameResultDialogRef {
  open: (params: GameResultParams) => void;
  close: () => void;
}

const GameResultDialog = React.memo(
  forwardRef<GameResultDialogRef, GameResultDialogProps>(
    ({onNewGame, onGoHome}, ref) => {
      const scale = useSharedValue(0);
      const opacity = useSharedValue(0);
      const buttonContainerAnimation = useSharedValue(0);
      const scoreWrapperAnimation = useSharedValue(0);
      const [block, setBlock] = useState<boolean>(false);
      const {playSound: playWinning} = useSound('winning.mp3');
      const {playSound: playSuccess} = useSound('success.mp3');
      const {playSound: playNicelyDone} = useSound('nicely_done.mp3');
      const {playSound: playFailure} = useSound('fail.wav');
      const [infoRevealed, setInfoRevealed] = useState<boolean>(false);
      const infoIconRef = useRef<View>(null);
      const [bubblePosition, setBubblePosition] = useState({top: 0, left: 0});
      const {getTime} = useTimerStore();

      const [isVisible, setIsVisible] = useState<boolean>(false);
      const [dialogParams, setDialogParams] = useState<GameResultParams>({
        isSuccess: false,
        currentScore: 0,
        secretWord: '',
        hint: '',
        category: 'GENERAL',
        difficulty: 'easy',
        gameType: 'RANDOM',
        maxAttempts: 0,
        currentAttempt: 0,
      });

      useImperativeHandle(ref, () => ({
        open: params => {
          setDialogParams(params);
          setIsVisible(true);
        },
        close: () => {
          setIsVisible(false);
        },
      }));

      const {
        isSuccess,
        currentAttempt,
        maxAttempts,
        gameType,
        category,
        difficulty,
        currentScore,
        secretWord,
        hint,
      } = dialogParams;

      const insets = useSafeAreaInsets();

      const rating = useMemo(
        () =>
          isSuccess
            ? currentAttempt < 4
              ? 3
              : Math.min(
                  Math.ceil(
                    ((maxAttempts - currentAttempt + 1) / maxAttempts) * 3,
                  ),
                  3,
                )
            : 0,
        [currentAttempt, isSuccess, maxAttempts],
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
                runOnJS(setInfoRevealed)(false);
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
              getTime(),
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

      const timeoutRef = useRef<NodeJS.Timeout | null>(null);

      useEffect(() => {
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };
      }, []);

      const handleInfoPress = useCallback(() => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (infoRevealed) {
          setInfoRevealed(false);
          return;
        }

        if (infoIconRef.current) {
          infoIconRef.current.measure((_, __, ___, h, pageX, pageY) => {
            setBubblePosition({
              top: pageY + h - insets.top,
              left: pageX,
            });
          });
        }

        setInfoRevealed(true);
        // Set a new timeout to hide it
        timeoutRef.current = setTimeout(() => {
          setInfoRevealed(false);
          timeoutRef.current = null;
        }, 1000 + LETTER_READ_DURATION * hint.length);
      }, [infoRevealed, hint.length, insets.top]);
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
        <Animated.View
          style={[styles.overlay, overlayStyle]}
          pointerEvents="auto">
          <Animated.View style={[styles.overlayDialog, animatedStyle]}>
            <LinearGradient
              colors={[
                colors.container.a,
                colors.container.b,
                colors.container.c,
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.dialogWrapper}>
              <LinearGradient
                colors={[colors.secondary.a, colors.secondary.b]}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={styles.innerWrapper}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{'סיכום'}</Text>
                </View>
                <View style={styles.dialog}>
                  <StarRating
                    width={270}
                    height={100}
                    rating={rating}
                    numStars={3}
                  />
                  {isVisible && (
                    <>
                      {(gameType === 'RANDOM' || isSuccess) && (
                        <>
                          <Text style={styles.secretWordWas}>
                            {'מילה סודית:'}
                          </Text>
                          <View style={styles.secretWordContainer}>
                            <View ref={infoIconRef} collapsable={false}>
                              <BasePressable onPress={handleInfoPress}>
                                <InfoIcon
                                  fillColor={
                                    infoRevealed ? colors.green : colors.gold
                                  }
                                />
                              </BasePressable>
                            </View>
                            <Text style={styles.secretWord}>{secretWord}</Text>
                          </View>
                        </>
                      )}
                      <Animated.View
                        style={[styles.scoreWrapper, scoreWrapperStyle]}>
                        <View style={styles.scoreContainer}>
                          <View style={styles.scoreRow}>
                            <Text style={styles.scoreLabel}>{'ניקוד'}</Text>
                            <Text style={styles.scoreValue}>
                              {currentScore}
                            </Text>
                          </View>
                          <View style={styles.divider} />
                          <View style={[styles.scoreRow]}>
                            <Text style={[styles.scoreLabel]}>
                              {'זמן משחק'}
                            </Text>
                            <Text style={styles.scoreValue}>
                              {formatTime(getTime())}
                            </Text>
                          </View>
                        </View>
                      </Animated.View>
                    </>
                  )}
                </View>
              </LinearGradient>
            </LinearGradient>
            <Animated.View
              style={[styles.buttonContainer, buttonContainerStyle]}>
              <BasePressable onPress={onGoHome}>
                <View style={[styles.button, styles.homeButton]}>
                  <HomeIcon width={34} height={34} />
                </View>
              </BasePressable>
              {gameType === 'RANDOM' && (
                <BasePressable onPress={onNewGame}>
                  <View style={[styles.button, styles.nextButton]}>
                    <ChevronRight width={34} height={34} />
                  </View>
                </BasePressable>
              )}
            </Animated.View>
          </Animated.View>

          <InfoBubble
            hint={hint}
            isVisible={infoRevealed}
            position={bubblePosition}
            close={() => setInfoRevealed(false)}
          />
        </Animated.View>
      );
    },
  ),
);

const styles = StyleSheet.create({
  overlay: {
    width,
    height,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  overlayDialog: {
    width,
    height,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 16,
    top: -18,
  },
  dialogWrapper: {
    width: 300,
    height: 300,
    elevation: 6,
    borderRadius: 20,
    borderTopRightRadius: 80,
    borderTopLeftRadius: 80,
    padding: 5,
  },
  innerWrapper: {
    flex: 1,
    borderRadius: 15,
    borderTopRightRadius: 75,
    borderTopLeftRadius: 75,
  },
  dialog: {
    alignItems: 'center',
    paddingTop: 22.5,
  },
  titleContainer: {
    top: -20,
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 10,
    elevation: 6,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreWrapper: {
    width: '100%',
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
    zIndex: 10,
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
  secretWordContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GameResultDialog;
