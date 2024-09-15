import React from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {
  Canvas,
  Image,
  useImage,
  BackdropFilter,
  Blur,
  Fill,
  rect,
  rrect,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useAnimatedReaction,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BackdropFilterArea {
  x: number;
  y: number;
  width: number;
  height: number;
  blurAmount: number;
  borderRadius?: number;
}

interface BackgroundImageProps {
  imagePath: number;
  width: number;
  height: number;
  backdropFilterAreas: BackdropFilterArea[];
  overlayColor?: string;
  style?: ViewStyle;
  scrollSpeed?: number;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  imagePath,
  width,
  height,
  backdropFilterAreas,
  overlayColor = 'rgba(255, 255, 255, 0.05)',
  style,
  scrollSpeed = 0.25,
}) => {
  const image = useImage(imagePath);

  const translateX = useSharedValue(0);
  const skiaTranslateX = useSharedValue(0);

  // Set up the animation
  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-width, {
        duration: 10000 / scrollSpeed,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [width, scrollSpeed, translateX]);

  // Bridge between Reanimated and Skia
  useAnimatedReaction(
    () => translateX.value,
    value => {
      skiaTranslateX.value = value;
    },
    [skiaTranslateX],
  );

  if (!image) {
    return null;
  }

  return (
    <Canvas style={[styles.canvas, {width, height}, style]}>
      <Image
        image={image}
        x={skiaTranslateX}
        y={0}
        width={width * 2}
        height={height}
        fit="cover"
      />
      <Image
        image={image}
        x={skiaTranslateX}
        y={0}
        width={width * 2}
        height={height}
        fit="cover"
        transform={[{translateX: width}]}
      />
      {backdropFilterAreas.map((area, index) => (
        <BackdropFilter
          key={index}
          filter={<Blur blur={area.blurAmount} />}
          clip={rrect(
            rect(area.x, area.y, area.width, area.height),
            area.borderRadius || 0,
            area.borderRadius || 0,
          )}>
          <Fill color={overlayColor} />
        </BackdropFilter>
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
  },
});
