import React, {useCallback, useEffect, useMemo, useRef} from 'react';
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
    const readyToMeasure = useRef<boolean>(false);

    const {registerPosition, registeredInEvent} = useSpotlightStore();

    const registered = useMemo(
      () => registeredInEvent.includes(spotlightId),
      [registeredInEvent, spotlightId],
    );

    const registerMeasurement = useCallback(() => {
      if (registered && readyToMeasure.current) {
        const timeout = setTimeout(() => {
          ref.current?.measure((_, __, width, height, pageX, pageY) => {
            const position: ComponentPosition = {
              x: pageX,
              y: pageY,
              width,
              height,
              id: spotlightId,
            };
            registerPosition(spotlightId, position);
            clearTimeout(timeout);
          });
        }, 500);
      }
    }, [registerPosition, registered, spotlightId]);

    useEffect(() => {
      registerMeasurement();
    }, [registerMeasurement]);

    const measureAndRegister = async () => {
      if (spotlightId.length > 0 && ref.current && !readyToMeasure.current) {
        readyToMeasure.current = true;
        registerMeasurement();
      }
    };

    return (
      <View ref={ref} onLayout={measureAndRegister} collapsable={false}>
        <WrappedComponent {...(props as T)} />
      </View>
    );
  };
}
