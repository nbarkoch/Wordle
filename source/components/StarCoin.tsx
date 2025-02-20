import React from 'react';
import {Canvas, Circle, Path, Group} from '@shopify/react-native-skia';
import {colors} from '~/utils/colors';

interface StarCoinProps {
  size?: number;
  outerRingColor?: string;
  innerCircleColor?: string;
}

const StarCoin = ({
  size = 24,
  outerRingColor = colors.gold,
  innerCircleColor = colors.mediumGold,
}: StarCoinProps) => {
  // Star path
  const starPath =
    'M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z';

  return (
    <Canvas style={{width: size, height: size}}>
      <Group transform={[{scale: size / 100}]}>
        <Circle cx={50} cy={50} r={47} color={outerRingColor} />

        <Circle cx={50} cy={50} r={37} color={innerCircleColor} />

        {/* Star */}
        <Group transform={[{translateX: 17}, {translateY: 16}, {scale: 2.75}]}>
          <Path path={starPath} color={outerRingColor} />
        </Group>
      </Group>
    </Canvas>
  );
};

export default StarCoin;
