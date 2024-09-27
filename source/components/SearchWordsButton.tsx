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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SearchWordsButtonProps {
  onSearchRequested: () => void;
  scoreCost: number;
}

const SEARCH_THRESHOLD = 5;

const SearchWordsButton: React.FC<SearchWordsButtonProps> = ({
  onSearchRequested,
  scoreCost,
}) => {
  const magnifierPath =
    'M3.0127 11.4468C3.0127 16.603 7.208 20.7983 12.3643 20.7983C14.4033 20.7983 16.2666 20.1421 17.8018 19.0405L23.5674 24.8179C23.8369 25.0874 24.1885 25.2163 24.5635 25.2163C25.3604 25.2163 25.9111 24.6186 25.9111 23.8335C25.9111 23.4585 25.7705 23.1186 25.5244 22.8725L19.7939 17.1069C21.001 15.5366 21.7158 13.5796 21.7158 11.4468C21.7158 6.29052 17.5205 2.09521 12.3643 2.09521C7.208 2.09521 3.0127 6.29052 3.0127 11.4468ZM5.01661 11.4468C5.01661 7.39209 8.30958 4.09912 12.3643 4.09912C16.4189 4.09912 19.7119 7.39209 19.7119 11.4468C19.7119 15.5014 16.4189 18.7944 12.3643 18.7944C8.30958 18.7944 5.01661 15.5014 5.01661 11.4468Z';
  const width = 34;
  const height = 34;
  const {userScore} = useScoreStore();
  const searchLeft = Math.floor(userScore / scoreCost);
  const disabled = searchLeft === 0;
  const color = disabled ? '#F47A89' : '#7FCCB5';
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
      disabled={disabled}
      onPress={() => {
        scaleAnimation.value = withSpring(0.8, {}, () => {
          scaleAnimation.value = withSpring(1);
          runOnJS(onSearchRequested)();
        });
      }}
      style={[styles.container, buttonStyle]}>
      <Animated.Text style={[styles.text, textStyle]}>
        {searchLeft > SEARCH_THRESHOLD ? `${SEARCH_THRESHOLD}+` : searchLeft}
      </Animated.Text>
      <Canvas style={{width, height}}>
        <Group transform={[{scale: width / 29}]}>
          <Path path={magnifierPath} color={color} style="fill" />
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

export default SearchWordsButton;
