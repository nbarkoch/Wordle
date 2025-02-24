import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';

const {width} = Dimensions.get('window');

interface LetterCubeProps {
  letter: string;
  index: number;
  color: string;
}

const LetterCube: React.FC<LetterCubeProps> = ({letter, index, color}) => {
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const startRandomAnimation = () => {
    const randomAnim = Math.floor(Math.random() * 3);

    switch (randomAnim) {
      case 0: // Jump animation
        translateY.value = withSequence(
          withTiming(-30, {duration: 300, easing: Easing.ease}),
          withTiming(0, {duration: 300, easing: Easing.bounce}),
        );
        break;
      case 1: // Rotation animation (nodding)
        rotation.value = withSequence(
          withTiming(-0.15, {duration: 200}),
          withRepeat(
            withSequence(
              withTiming(0.15, {duration: 400}),
              withTiming(-0.15, {duration: 400}),
            ),
            2,
          ),
          withTiming(0, {duration: 200}),
        );
        break;
      case 2: // Scale pulse animation
        scale.value = withSequence(
          withTiming(1.2, {duration: 200}),
          withTiming(0.9, {duration: 150}),
          withTiming(1.1, {duration: 150}),
          withTiming(1, {duration: 200}),
        );
        break;
    }

    // Schedule the next animation
    const timeout = setTimeout(() => {
      runOnJS(startRandomAnimation)();
    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds

    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    // Start animations with staggered delay based on index
    const initialDelay = setTimeout(() => {
      startRandomAnimation();
    }, 1000 + index * 800);

    return () => clearTimeout(initialDelay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {translateY: translateY.value},
        {rotateZ: `${rotation.value}rad`},
        {scale: scale.value},
      ],
    };
  });

  return (
    <Animated.View style={[styles.cubeContainer, animatedStyle]}>
      <View style={[styles.cube, {backgroundColor: color}]}>
        <Text style={styles.letter}>{letter}</Text>
      </View>
      <View style={styles.shadow} />
    </Animated.View>
  );
};

const AnimatedLetterCubes: React.FC = () => {
  const letters = ['ו', 'ר', 'ד', 'ל'].reverse();
  const letterColors = [colors.blue, colors.red, colors.green, colors.yellow];

  return (
    <View style={styles.container}>
      {letters.map((letter, index) => (
        <LetterCube
          key={index}
          letter={letter}
          index={index}
          color={letterColors[index]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#343E4F',
  },
  cubeContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cube: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  letter: {
    fontSize: 40,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: 'white',
  },
  shadow: {
    position: 'absolute',
    bottom: -5,
    width: 50,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 50,
    zIndex: -1,
  },
});

export default AnimatedLetterCubes;
