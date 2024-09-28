import {Canvas, LinearGradient, Rect, vec} from '@shopify/react-native-skia';
import {useCallback} from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {HomeScreenProps} from '~/navigation/types';
import SkiaGradientText from '~/components/WordleParagraph';

const {width, height} = Dimensions.get('window');

function Header() {
  return (
    <View style={stylesHeader.header}>
      <SkiaGradientText width={300} height={40} />
    </View>
  );
}

const stylesHeader = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
  },
});

interface MenuButtonProps {
  onPress: () => void;
  text: string;
}
function MenuButton({onPress, text}: MenuButtonProps) {
  const scaleAnimation = useSharedValue<number>(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleAnimation.value}],
  }));

  const $onPress = useCallback(() => {
    scaleAnimation.value = withSpring(0.8, {}, () => {
      scaleAnimation.value = withSpring(1);
      runOnJS(onPress)();
    });
  }, [onPress, scaleAnimation]);

  return (
    <Pressable onPress={$onPress}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={styles.buttonText}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

function HomeScreen({navigation}: HomeScreenProps) {
  const onNewGame = useCallback(() => {
    navigation.navigate('WordGame', {maxAttempts: 6, wordLength: 5});
  }, [navigation]);
  return (
    <View style={styles.body}>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={['#343D4E', '#384555', '#3A4F6C']}
          />
        </Rect>
      </Canvas>
      <Header />
      <View style={styles.body}>
        <MenuButton text="New Game" onPress={onNewGame} />
        <MenuButton text="User Info" onPress={onNewGame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  button: {
    margin: 10,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#7FCCB5',
    zIndex: 10,
  },
  buttonText: {fontSize: 25, fontWeight: '900'},
});
export default HomeScreen;
