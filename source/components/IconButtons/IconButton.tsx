import React from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '../BasePressable';

interface IconButtonProps {
  onPress: () => void;
  width?: number;
  height?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  width = 34,
  height = 34,
}) => {
  const magnifierPath =
    'M13.8323 19.1474C14.6526 19.1474 15.0276 18.585 15.0276 17.835C15.0276 17.706 15.0276 17.5654 15.0276 17.4365C15.051 15.8896 15.6018 15.2451 17.4768 13.956C19.4924 12.5967 20.7698 11.0264 20.7698 8.76465C20.7698 5.24902 17.9104 3.2334 14.3479 3.2334C11.6995 3.2334 9.37915 4.4873 8.38306 6.74902C8.13696 7.2998 8.03149 7.83887 8.03149 8.28418C8.03149 8.95215 8.41821 9.4209 9.13305 9.4209C9.73071 9.4209 10.1292 9.06933 10.3049 8.49512C10.9026 6.26855 12.3792 5.4248 14.2659 5.4248C16.551 5.4248 18.344 6.71387 18.344 8.75293C18.344 10.4287 17.301 11.3662 15.801 12.4209C13.9612 13.6982 12.6135 15.0693 12.6135 17.1318C12.6135 17.3779 12.6135 17.624 12.6135 17.8701C12.6135 18.6201 13.0237 19.1474 13.8323 19.1474ZM13.8323 25.5576C14.7698 25.5576 15.5081 24.8076 15.5081 23.8935C15.5081 22.9678 14.7698 22.2295 13.8323 22.2295C12.9182 22.2295 12.1682 22.9678 12.1682 23.8935C12.1682 24.8076 12.9182 25.5576 13.8323 25.5576Z';
  return (
    <BasePressable onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            borderWidth: width / 10,
            width: width + 6,
            height: height + 6,
          },
        ]}>
        <Canvas
          style={[
            styles.canvas,
            {
              width,
              height,
            },
          ]}>
          <Group transform={[{scale: width / 29}]}>
            <Path path={magnifierPath} color={colors.green} />
          </Group>
        </Canvas>
      </View>
    </BasePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: colors.green,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconButton;
