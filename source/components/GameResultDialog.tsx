import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
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

interface GameResultDialogProps {
  isVisible: boolean;
  isSuccess: boolean;
  onNewGame: () => void;
  onGoHome: () => void;
  currentScore: number;
  bestScore: number;
}

const GameResultDialog = ({
  isVisible,
  // isSuccess,
  onNewGame,
  onGoHome,
  currentScore,
  bestScore,
}: GameResultDialogProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSpring(1, {damping: 12, stiffness: 100});
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.exp),
      });
    }
  }, [isVisible, scale, opacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
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
                colors={['#F6B871', '#F6B871', '#FF6347']}
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
            <View style={styles.scoreWrapper}>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>{currentScore}</Text>
                  <Text style={styles.scoreLabel}>SCORE</Text>
                </View>
                <View style={[styles.scoreRow, {marginTop: 10}]}>
                  <Text style={styles.scoreValue}>{bestScore}</Text>
                  <Text style={[styles.scoreLabel]}>TIME</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
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
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayDialog: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F8E4A3',
    borderRadius: 17,
    alignItems: 'center',
    paddingTop: 30,
  },
  titleContainer: {
    position: 'absolute',
    top: -15,
    backgroundColor: '#FF6347',
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
    backgroundColor: '#FFC68A',
    borderColor: '#E89A60',
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
    color: '#943007',
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#943007',
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
    backgroundColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameResultDialog;
