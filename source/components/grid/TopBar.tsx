import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Timer from './Timer';
import {useScoreStore} from '~/store/useScore';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import StarCoin from '../StarCoin';
import {useTimerStore} from '~/store/useTimerStore';

interface TopBarProps {
  displayTimer?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({displayTimer = true}) => {
  const {userScore} = useScoreStore();
  const scaleAnimation = useSharedValue(1);
  const lastUserScore = useRef<number>(userScore);

  const [textScoreColor, setTextScoreColor] = useState<string>(colors.gold);
  const {isActive, resetKey, increment} = useTimerStore();

  useEffect(() => {
    scaleAnimation.value = withTiming(1.25, {duration: 50}, () => {
      scaleAnimation.value = withTiming(1, {duration: 200});
      runOnJS(setTextScoreColor)(colors.gold);
    });
    setTextScoreColor(
      lastUserScore.current <= userScore ? colors.green : colors.red,
    );
    lastUserScore.current = userScore;
    return () => cancelAnimation(scaleAnimation);
  }, [scaleAnimation, userScore]);

  const scoreAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scaleAnimation.value}],
    };
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive) {
      intervalId = setInterval(() => {
        increment();
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, increment, resetKey]);

  return (
    <View style={styles.topBar}>
      {displayTimer && <Timer />}
      <View style={[styles.topBarScore]}>
        <StarCoin outerRingColor={textScoreColor} />
        <Animated.Text
          style={[
            styles.topBarScoreText,
            scoreAnimatedStyle,
            {color: textScoreColor},
          ]}>
          {' '}
          {userScore}{' '}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  topBarScore: {flexDirection: 'row-reverse', alignItems: 'center'},
  topBarScoreText: {fontSize: 18, fontWeight: '900'},
});

export default TopBar;
