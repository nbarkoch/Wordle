import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '../BasePressable';
import {Canvas, Group, Path} from '@shopify/react-native-skia';

const path =
  'M5.34316 23.4438C5.75331 23.8423 6.433 23.8423 6.83144 23.4438L14.3314 15.9438L21.8314 23.4438C22.2299 23.8423 22.9213 23.854 23.3197 23.4438C23.7181 23.0337 23.7181 22.3657 23.3197 21.9673L15.8197 14.4556L23.3197 6.95558C23.7181 6.55714 23.7299 5.87746 23.3197 5.47902C22.9095 5.06886 22.2299 5.06886 21.8314 5.47902L14.3314 12.979L6.83144 5.47902C6.433 5.06886 5.74159 5.05714 5.34316 5.47902C4.94472 5.88918 4.94472 6.55714 5.34316 6.95558L12.8432 14.4556L5.34316 21.9673C4.94472 22.3657 4.933 23.0454 5.34316 23.4438Z';
const width = 25;
const height = 25;
function SkipTutorialButton({onPress}: {onPress: () => void}) {
  return (
    <BasePressable style={styles.button} onPress={onPress}>
      <View style={styles.buttonContainer} pointerEvents="none">
        <Canvas style={{width, height}}>
          <Group
            transform={[{scale: 0.8}, {translateX: 1.5}, {translateY: 1.5}]}>
            <Path path={path} color={colors.white} />
          </Group>
        </Canvas>
        <Text style={styles.buttonText}>{'דלג על המדריך'}</Text>
      </View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    zIndex: 50,
    left: 20,
    top: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'PloniDL1.1AAA-Bold',
    marginRight: 5,
  },
  buttonContainer: {
    backgroundColor: colors.red,

    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    borderColor: colors.darkRed,
    borderWidth: 2.5,
    gap: 5,
  },
  iconWrapper: {
    transform: [{scale: 0.75}],
    marginLeft: -5,
  },
});

export default SkipTutorialButton;
