import React from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '../BasePressable';

const path =
  'M5.34316 23.4438C5.75331 23.8423 6.433 23.8423 6.83144 23.4438L14.3314 15.9438L21.8314 23.4438C22.2299 23.8423 22.9213 23.854 23.3197 23.4438C23.7181 23.0337 23.7181 22.3657 23.3197 21.9673L15.8197 14.4556L23.3197 6.95558C23.7181 6.55714 23.7299 5.87746 23.3197 5.47902C22.9095 5.06886 22.2299 5.06886 21.8314 5.47902L14.3314 12.979L6.83144 5.47902C6.433 5.06886 5.74159 5.05714 5.34316 5.47902C4.94472 5.88918 4.94472 6.55714 5.34316 6.95558L12.8432 14.4556L5.34316 21.9673C4.94472 22.3657 4.933 23.0454 5.34316 23.4438Z';

interface CloseIconProps {
  onPress?: () => void;
}

const CloseIcon: React.FC<CloseIconProps> = ({onPress}) => {
  const width = 25;
  const height = 25;
  return (
    <BasePressable onPress={onPress}>
      <View style={[styles.container]}>
        <Canvas style={{width, height}}>
          <Group
            transform={[
              {scale: width / 25},
              {translateX: -1.5},
              {translateY: -1.5},
            ]}>
            <Path path={path} color={colors.white} />
          </Group>
        </Canvas>
      </View>
    </BasePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    borderWidth: 3,
    padding: 7,
    borderColor: colors.darkRed,
    backgroundColor: colors.red,
  },
});

export default CloseIcon;
