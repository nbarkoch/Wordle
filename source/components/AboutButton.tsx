import React from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {Pressable, StyleSheet} from 'react-native';
import {useScoreStore} from '~/store/useScore';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AboutButtonProps {
  onInfoRequested: () => void;
  scoreCost: number;
  disabled?: boolean;
}

const SCORE_THRESHOLD = 5;

const AboutButton: React.FC<AboutButtonProps> = ({
  onInfoRequested,
  scoreCost,
  disabled,
}) => {
  const magnifierPath =
    'M9.08203 21.2725C9.08203 21.8467 9.49219 22.2334 10.1133 22.2334H17.5313C18.1523 22.2334 18.5625 21.8467 18.5625 21.2725C18.5625 20.71 18.1523 20.3233 17.5313 20.3233H15.1758V11.3818C15.1758 10.749 14.7656 10.3271 14.1563 10.3271H10.4414C9.83203 10.3271 9.41016 10.7021 9.41016 11.2646C9.41016 11.8506 9.83203 12.2373 10.4414 12.2373H13.0078V20.3233H10.1133C9.49219 20.3233 9.08203 20.71 9.08203 21.2725ZM11.9883 5.78027C11.9883 6.71777 12.7383 7.46777 13.6758 7.46777C14.625 7.46777 15.3516 6.71777 15.3516 5.78027C15.3516 4.83105 14.625 4.08105 13.6758 4.08105C12.7383 4.08105 11.9883 4.83105 11.9883 5.78027Z';

  const width = 34;
  const height = 34;
  const {userScore} = useScoreStore();
  const timesLeft = Math.floor(userScore / scoreCost);
  const $disabled = timesLeft === 0 || disabled;
  const color = $disabled ? colors.red : colors.green;
  const scaleAnimation = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scaleAnimation.value}],
      borderColor: color,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      color: color,
    };
  });

  return (
    <AnimatedPressable
      disabled={$disabled}
      onPress={() => {
        scaleAnimation.value = withSpring(0.8, {}, () => {
          scaleAnimation.value = withSpring(1);
          runOnJS(onInfoRequested)();
        });
      }}
      style={[styles.container, buttonStyle]}>
      <Animated.Text style={[styles.text, textStyle]}>
        {timesLeft > SCORE_THRESHOLD ? `${SCORE_THRESHOLD}+` : timesLeft}
      </Animated.Text>
      <Canvas style={{width, height}}>
        <Group transform={[{scale: width / 29}]}>
          <Path path={magnifierPath} color={color} opacity={0.85} />
        </Group>
      </Canvas>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    borderWidth: 2.5,
    padding: 2,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '900',
  },
});

export default AboutButton;
