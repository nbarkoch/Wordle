import React from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProfileIconButtonProps {
  onPress: () => void;
}

const ProfileIconButton: React.FC<ProfileIconButtonProps> = ({onPress}) => {
  const p2 =
    'M14.0254 24.2314C11.3418 24.2314 8.62305 23.1299 6.83008 21.2198C8.09571 19.2276 10.8496 18.0556 14.0254 18.0556C17.1778 18.0556 19.9551 19.2042 21.2324 21.2198C19.4278 23.1299 16.7207 24.2314 14.0254 24.2314ZM14.0254 16.0634C11.7754 16.04 10.0059 14.165 10.0059 11.6455C9.99415 9.27833 11.7871 7.30957 14.0254 7.30957C16.2754 7.30957 18.0449 9.27833 18.0449 11.6455C18.0449 14.165 16.2871 16.087 14.0254 16.0634Z';

  const width = 50;
  const height = 50;
  const scaleAnimation = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scaleAnimation.value}],
    };
  });

  return (
    <AnimatedPressable
      onPress={() => {
        cancelAnimation(scaleAnimation);
        scaleAnimation.value = withSpring(0.8, {}, () => {
          scaleAnimation.value = withSpring(1);
          runOnJS(onPress)();
        });
      }}
      style={[buttonStyle, styles.container]}>
      <Canvas style={{width, height}}>
        <Group
          transform={[
            {scale: width / 25},
            {translateX: -1.5},
            {translateY: -1.5},
          ]}>
          <Path path={p2} color={'#7FCCB550'} />
        </Group>
      </Canvas>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.green,
  },
  text: {
    fontWeight: '900',
  },
});

export default ProfileIconButton;
