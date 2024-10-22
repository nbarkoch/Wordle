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
import HomeButton from '../HomeButton';
import IconButton from '../IconButtons/IconButton';

interface TopBarProps {
  displayTimer?: boolean;
  onGoHome: () => void;
  onHowToPlay: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  displayTimer = true,
  onGoHome,
  onHowToPlay,
}) => {
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
      <View style={[styles.topBarScore]}>
        <Animated.Text
          style={[
            styles.topBarScoreText,
            scoreAnimatedStyle,
            {color: textScoreColor},
          ]}>
          {' '}
          {userScore}{' '}
        </Animated.Text>
        <StarCoin outerRingColor={textScoreColor} />
      </View>
      {displayTimer && <Timer />}
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 15,
        }}>
        <HomeButton onClick={onGoHome} width={30} height={30} />
        <IconButton onPress={onHowToPlay} width={30} height={30} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10,
  },
  topBarScore: {flexDirection: 'row-reverse', alignItems: 'center'},
  topBarScoreText: {fontSize: 18, fontWeight: '900'},
});

export default TopBar;
