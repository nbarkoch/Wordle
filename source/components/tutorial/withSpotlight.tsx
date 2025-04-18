import React, {useRef} from 'react';
import {View} from 'react-native';
import {useSpotlightStore, ComponentPosition} from '~/store/spotlightStore';

export interface WithMeasureProps {
  spotlightId: string;
}

export function withMeasure<T extends object>(
  WrappedComponent: React.ComponentType<T>,
) {
  return function WithMeasure({spotlightId, ...props}: T & WithMeasureProps) {
    const ref = useRef<View>(null);
    const {registerPosition} = useSpotlightStore();

    const handleLayout = () => {
      if (ref.current) {
        ref.current.measure((_, __, width, height, pageX, pageY) => {
          const position: ComponentPosition = {
            x: pageX,
            y: pageY,
            width,
            height,
            id: spotlightId,
          };
          registerPosition(spotlightId, position);
        });
      }
    };

    return (
      <View ref={ref} onLayout={handleLayout}>
        <WrappedComponent {...(props as T)} />
      </View>
    );
  };
}
