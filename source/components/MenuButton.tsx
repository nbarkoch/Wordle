import {useCallback} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import React from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {setColorOpacity, lightenColor} from '~/utils/ui';

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
        style={[
          styles.button,
          animatedStyle,
          {
            backgroundColor: color,
            borderColor: setColorOpacity(lightenColor(color, 10), 0.7),
          },
        ]}>
        <Text style={styles.buttonText}>{text.toLocaleUpperCase()}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 15,
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 50,
    zIndex: 10,
    borderWidth: 5,
  },
  buttonText: {fontSize: 22, fontWeight: '700', color: 'white'},
});

export default MenuButton;
