import React from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';

const StarRating = ({rating = 3, width = 300, height = 100}) => {
  // Star shape path
  const starPath =
    'M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 L12 2 Z';

  // Calculate star size and spacing
  const starSize = height * 0.8;
  const spacing = (width - starSize * 3) / 4;
  const positioning: number[] = [20, 0, 0];
  const rotation: number[] = [-0.2, 0, 0.2];
  const starScale: number[] = [1, 1, 1];

  const starCenter = 12;

  return (
    <Canvas style={{width, height}}>
      <Group>
        {[0, 1, 2].map(i => (
          <Group
            key={i}
            transform={[{translateX: spacing + (starSize + spacing) * i}]}>
            <Path
              path={starPath}
              transform={[
                // Move the star to the origin (0, 0)
                {translateX: -starCenter},
                {translateY: -starCenter},
                // Rotate around the star's center
                {rotate: rotation[i]},
                // Move the star back to its original position
                {translateX: starCenter},
                {translateY: starCenter + positioning[i]},
                // Scale the star to the desired size
                {scale: (starScale[i] * starSize) / 24},
              ]}
              color="#FFC107" // Yellow color for the star
              style="fill"
            />
            {rating / 3 < (i + 1) / 3 && (
              <Path
                path={starPath}
                transform={[
                  {translateX: -starCenter},
                  {translateY: -starCenter},
                  {rotate: rotation[i]},
                  {translateX: starCenter},
                  {translateY: starCenter + positioning[i]},
                  {scale: (starScale[i] * starSize) / 24},
                ]}
                color="rgba(0, 0, 0, 0.3)" // Semi-transparent black for dimming
                style="fill"
              />
            )}
          </Group>
        ))}
      </Group>
    </Canvas>
  );
};

export default StarRating;
