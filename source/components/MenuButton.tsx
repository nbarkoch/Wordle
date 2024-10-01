import {useCallback} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import React from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface MenuButtonProps {
  onPress: () => void;
  text: string;
  color: string;
}
function MenuButton({onPress, text, color}: MenuButtonProps) {
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
      <Animated.View
        style={[styles.button, animatedStyle, {backgroundColor: color}]}>
        <Text style={styles.buttonText}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    zIndex: 10,
    borderColor: 'white',
    borderWidth: 2,
  },
  buttonText: {fontSize: 25, fontWeight: '900', color: 'white'},
});

export default MenuButton;
