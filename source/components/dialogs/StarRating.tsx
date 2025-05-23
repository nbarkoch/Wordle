import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import {range} from '~/utils/ui';

const starPath =
  'M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z';

interface StarRatingProps {
  rating: number;
  width: number;
  height: number;
  numStars: number;
}

const StarRating = ({
  rating = 3,
  width = 300,
  height = 100,
  numStars = 3,
}: StarRatingProps) => {
  const starSize = height * 0.8;

  const stars = range(numStars).map(i => (
    <StarComponent
      key={i}
      i={i}
      rating={rating}
      starSize={starSize}
      total={numStars}
    />
  ));

  return <View style={[styles.container, {width, height}]}>{stars}</View>;
};

const StarComponent = ({
  i,
  rating,
  starSize,
  total,
}: {
  i: number;
  rating: number;
  starSize: number;
  total: number;
}) => {
  const scale = useSharedValue(0);
  const fillOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateY: Math.abs(Math.floor(total / 2) - i) * 10},
        {scale: scale.value},
      ],
    };
  });
  useEffect(() => {
    scale.value = withDelay(
      i * 200,
      withSpring(1, {damping: 12, stiffness: 90}),
    );

    fillOpacity.value = withDelay(
      i * 200,
      withTiming(rating / 3 >= (i + 1) / 3 ? 1 : 0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      }),
    );
  }, [scale, fillOpacity, i, rating]);

  const rotate = (rotation: number) => [
    {translateX: starSize / 7},
    {translateY: starSize / 7},
    {rotate: rotation},
    {translateX: -starSize / 7},
    {translateY: -starSize / 7},
  ];

  return (
    <Animated.View style={[styles.starContainer, animatedStyle]}>
      <Canvas style={{width: starSize, height: starSize}}>
        <Group
          transform={[
            {scale: starSize / 24},
            ...rotate((Math.floor(total / 2) - i) * 0.25),
          ]}>
          <Path path={starPath} color="#b2925b70" style="fill" />
          <Path
            path={starPath}
            color="#FDD284"
            style="fill"
            opacity={fillOpacity}
          />
        </Group>
      </Canvas>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StarRating;
