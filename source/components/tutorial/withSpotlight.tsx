import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSpotlightStore} from '~/store/spotlightStore';

export interface WithMeasureProps {
  spotlightId: string;
}

export function withMeasure<T extends object>(
  WrappedComponent: React.ComponentType<T>,
) {
  return function WithMeasure({spotlightId, ...props}: T & WithMeasureProps) {
    const ref = useRef<View>(null);
    const insets = useSafeAreaInsets();
    // Get the positions and register function from the store
    const {registering, registerPosition} = useSpotlightStore();

    const measureAndRegister = useCallback(() => {
      if (spotlightId && registering && ref.current) {
        const timeout = setTimeout(() => {
          ref.current?.measure((_, __, width, height, pageX, pageY) => {
            if (width && height) {
              registerPosition(spotlightId, {
                x: pageX,
                y: pageY - insets.top,
                width,
                height,
                id: spotlightId,
              });
            }
            clearTimeout(timeout);
          });
        }, 500);
      }
    }, [insets.top, registerPosition, registering, spotlightId]);

    useEffect(measureAndRegister, [measureAndRegister]);

    return (
      <View ref={ref} onLayout={measureAndRegister} collapsable={false}>
        <WrappedComponent {...(props as T)} />
      </View>
    );
  };
}
