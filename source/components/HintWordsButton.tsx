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

interface HintWordButtonProps {
  onHintRequested: () => void;
  scoreCost: number;
}

const HINT_THRESHOLD = 5;

const HintWordButton: React.FC<HintWordButtonProps> = ({
  onHintRequested,
  scoreCost,
}) => {
  const magnifierDisabledPath =
    'M6 7.30859C6 11.8086 8.69531 12.9218 9.44531 20.7382C9.49219 21.1601 9.72656 21.4296 10.1719 21.4296H17.5078C17.9648 21.4296 18.1992 21.1601 18.2461 20.7382C18.9961 12.9218 21.6797 11.8086 21.6797 7.30859C21.6797 3.26562 18.2227 0.0898438 13.8398 0.0898438C9.45703 0.0898438 6 3.26562 6 7.30859ZM7.76953 7.30859C7.76953 4.14453 10.5469 1.85937 13.8398 1.85937C17.1328 1.85937 19.9102 4.14453 19.9102 7.30859C19.9102 10.6718 17.6836 11.4687 16.6289 19.6601H11.0625C9.99609 11.4687 7.76953 10.6718 7.76953 7.30859ZM10.1367 23.9609H17.5547C17.9414 23.9609 18.2344 23.6562 18.2344 23.2695C18.2344 22.8945 17.9414 22.5898 17.5547 22.5898H10.1367C9.75 22.5898 9.44531 22.8945 9.44531 23.2695C9.44531 23.6562 9.75 23.9609 10.1367 23.9609ZM13.8398 27.3593C15.6562 27.3593 17.168 26.4687 17.2852 25.121H10.4062C10.4883 26.4687 12.0117 27.3593 13.8398 27.3593Z';
  const magnifierActivePath1 =
    'M10.1472 23.9609H17.5652C17.9519 23.9609 18.2449 23.6562 18.2449 23.2695C18.2449 22.8945 17.9519 22.5898 17.5652 22.5898H10.1472C9.7605 22.5898 9.45581 22.8945 9.45581 23.2695C9.45581 23.6562 9.7605 23.9609 10.1472 23.9609ZM13.8503 27.3593C15.6668 27.3593 17.1785 26.4687 17.2957 25.121H10.4168C10.4988 26.4687 12.0222 27.3593 13.8503 27.3593Z';
  const magnifierActivePath2 =
    'M6.0105 7.30859C6.0105 11.8086 8.97534 12.9218 9.45581 20.7382C9.47925 21.1601 9.73706 21.4296 10.1824 21.4296H17.5183C17.9753 21.4296 18.2214 21.1601 18.2566 20.7382C18.7371 12.9218 21.6902 11.8086 21.6902 7.30859C21.6902 3.26562 18.2332 0.0898438 13.8503 0.0898438C9.46753 0.0898438 6.0105 3.26562 6.0105 7.30859Z';
  const width = 34;
  const height = 34;
  const {userScore} = useScoreStore();
  const hintsLeft = Math.floor(userScore / scoreCost);
  const disabled = hintsLeft === 0;
  const color = disabled ? colors.red : colors.yellow;
  const scaleAnimation = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scaleAnimation.value}],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      color: color,
    };
  });

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={() => {
        scaleAnimation.value = withSpring(0.8, {}, () => {
          scaleAnimation.value = withSpring(1);
          runOnJS(onHintRequested)();
        });
      }}
      style={[styles.container, buttonStyle, {borderColor: color}]}>
      <Animated.Text style={[styles.text, textStyle]}>
        {hintsLeft > HINT_THRESHOLD ? `${HINT_THRESHOLD}+` : hintsLeft}
      </Animated.Text>
      <Canvas style={{width, height}}>
        <Group transform={[{scale: width / 32}, {translateY: 2}]}>
          {disabled ? (
            <Path path={magnifierDisabledPath} color={color} style="fill" />
          ) : (
            <>
              <Path path={magnifierActivePath1} color={color} style="fill" />
              <Path path={magnifierActivePath2} color={color} style="fill" />
            </>
          )}
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

export default HintWordButton;
