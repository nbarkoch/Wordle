import React, {useRef} from 'react';
import {View} from 'react-native';
import {useSpotlightStore, ComponentPosition} from '~/store/spotlightStore';
import {useTutorialStore} from '~/store/tutorialStore';

export interface WithMeasureProps {
  spotlightId: string;
}

export function withMeasure<T extends object>(
  WrappedComponent: React.ComponentType<T>,
) {
  return function WithMeasure({spotlightId, ...props}: T & WithMeasureProps) {
    const ref = useRef<View>(null);

    const {registerPosition} = useSpotlightStore();
    const isTutorialDone = useTutorialStore(state => state.isDone);

    const measureAndRegister = async () => {
      if (spotlightId.length > 0 && ref.current) {
        const isNotTutorial = await isTutorialDone();
        if (!isNotTutorial) {
          // Use requestAnimationFrame to batch layout calculations
          requestAnimationFrame(() => {
            ref.current?.measure((_, __, width, height, pageX, pageY) => {
              const position: ComponentPosition = {
                x: pageX,
                y: pageY,
                width,
                height,
                id: spotlightId,
              };
              registerPosition(spotlightId, position);
            });
          });
        }
      }
    };

    return (
      <View ref={ref} onLayout={measureAndRegister} collapsable={false}>
        <WrappedComponent {...(props as T)} />
      </View>
    );
  };
}
