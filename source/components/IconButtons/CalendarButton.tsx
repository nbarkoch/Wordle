import React from 'react';
import {
  Canvas,
  Rect,
  Circle,
  Group,
  RoundedRect,
} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';
import BasePressable from '../BasePressable';
import {colors} from '~/utils/colors';

interface CalendarIconProps {
  size?: number;
  onPress: () => void;
}

const CalendarIcon = ({size = 29, onPress}: CalendarIconProps) => {
  // Scale factor to fit the icon in the desired size
  const scale = size / 116; // Original width is 116

  return (
    <BasePressable onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            borderWidth: size / 10,
            width: size + 25,
            height: size + 25,
          },
        ]}>
        <Canvas style={{width: size, height: size * (120 / 116)}}>
          <Group transform={[{scale}]}>
            {/* Main calendar body */}
            <RoundedRect
              x={0}
              y={11}
              width={116}
              height={109}
              r={17}
              color="#FEFAE7"
            />

            {/* Top red sections */}
            <RoundedRect
              x={0}
              y={11}
              width={116}
              height={26}
              r={13}
              color="#EA5957"
            />
            <Rect x={0} y={24} width={116} height={13} color="#EA5957" />

            {/* Ring holes */}
            <Circle cx={28} cy={21} r={7} color="#244751" />
            <Circle cx={88} cy={21} r={7} color="#244751" />

            {/* Calendar dots - Row 1 */}
            <Circle cx={57.5} cy={51.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={39.5} cy={51.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={21.5} cy={51.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={75.5} cy={51.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={93.5} cy={51.5} r={3.5} color={'#3D8F8A'} />

            {/* Calendar dots - Row 2 */}
            <Circle cx={57.5} cy={68.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={39.5} cy={68.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={21.5} cy={68.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={75.5} cy={68.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={93.5} cy={68.5} r={3.5} color={'#3D8F8A'} />

            {/* Calendar dots - Row 3 */}
            <Circle cx={57.5} cy={84.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={39.5} cy={84.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={21.5} cy={84.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={75.5} cy={84.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={93.5} cy={84.5} r={3.5} color={'#3D8F8A'} />

            {/* Calendar dots - Row 4 */}
            <Circle cx={57.5} cy={101.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={39.5} cy={101.5} r={3.5} color={'#3D8F8A'} />
            <Circle cx={21.5} cy={101.5} r={3.5} color={'#3D8F8A'} />

            {/* Ring tabs */}
            <RoundedRect
              x={23}
              y={0}
              width={10}
              height={24}
              r={5}
              color="#FBDFB0"
            />
            <RoundedRect
              x={83}
              y={0}
              width={10}
              height={24}
              r={5}
              color="#FBDFB0"
            />
          </Group>
        </Canvas>
      </View>
    </BasePressable>
  );
};

export default CalendarIcon;

const styles = StyleSheet.create({
  container: {
    borderColor: colors.green,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
