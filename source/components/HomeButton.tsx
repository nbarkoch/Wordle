import React from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '~/components/BasePressable';

interface HomeButtonProps {
  onClick: () => void;
  width?: number;
  height?: number;
}

const HomeButton: React.FC<HomeButtonProps> = ({
  onClick,
  width = 34,
  height = 34,
}) => {
  const magnifierPath =
    'M10.679 24.4854H17.4407V15.9541C17.4407 15.4151 17.0891 15.0635 16.5501 15.0635H11.5813C11.0305 15.0635 10.679 15.4151 10.679 15.9541V24.4854ZM6.09693 25.6924H21.9524C23.6165 25.6924 24.5891 24.7432 24.5891 23.1026V10.1533L22.7024 8.86426V22.6221C22.7024 23.3838 22.2923 23.8057 21.554 23.8057H6.49537C5.74537 23.8057 5.33521 23.3838 5.33521 22.6221V8.87598L3.44849 10.1533V23.1026C3.44849 24.7432 4.42115 25.6924 6.09693 25.6924ZM0.0734863 12.6494C0.0734863 13.1299 0.448486 13.5869 1.0813 13.5869C1.40943 13.5869 1.67896 13.4112 1.92505 13.2119L13.6555 3.36817C13.9133 3.13379 14.2297 3.13379 14.4876 3.36817L26.218 13.2119C26.4524 13.4112 26.7219 13.5869 27.0501 13.5869C27.6008 13.5869 28.0462 13.2471 28.0462 12.6846C28.0462 12.333 27.929 12.0987 27.6829 11.8877L15.4837 1.63379C14.6165 0.895508 13.5383 0.895508 12.6594 1.63379L0.448486 11.8877C0.190674 12.0987 0.0734863 12.3799 0.0734863 12.6494ZM21.6477 7.36426L24.5891 9.84863V4.43457C24.5891 3.91895 24.261 3.59082 23.7454 3.59082H22.4915C21.9876 3.59082 21.6477 3.91895 21.6477 4.43457V7.36426Z';

  const color = colors.green;

  return (
    <BasePressable onPress={onClick}>
      <View style={[styles.container, {borderColor: color}]}>
        <Canvas style={{width, height}}>
          <Group transform={[{scale: width / 29}]}>
            <Path path={magnifierPath} color={color} style="fill" />
          </Group>
        </Canvas>
      </View>
    </BasePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    borderWidth: 2.5,
    padding: 2,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeButton;
