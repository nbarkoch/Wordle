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

const TopBar: React.FC = () => {
  const {userScore} = useScoreStore();
  const scaleAnimation = useSharedValue(1);
  const lastUserScore = useRef<number>(userScore);

  const [textScoreColor, setTextScoreColor] = useState<string>(colors.gold);

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

  return (
    <View style={styles.topBar}>
      <Timer />
      <View style={[styles.topBarScore]}>
        <Animated.Text
          style={[styles.topBarScoreText, {color: textScoreColor}]}>
          {'Score: '}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.topBarScoreText,
            scoreAnimatedStyle,
            {color: textScoreColor},
          ]}>
          {userScore}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarScore: {flexDirection: 'row-reverse'},
  topBarScoreText: {fontSize: 18, fontWeight: '900'},
});

export default TopBar;
