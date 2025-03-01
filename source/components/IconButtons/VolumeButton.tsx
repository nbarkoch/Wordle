import React, {useCallback, useRef} from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '../BasePressable';
import {useSoundStore} from '~/useSound';
import CircleOverlay, {CircleOverlayRef} from '../CircleOverlay';

interface VolumeButtonProps {
  width?: number;
  height?: number;
}

const VolumeButton: React.FC<VolumeButtonProps> = ({
  width = 34,
  height = 34,
}) => {
  const isSoundEnabled = useSoundStore(state => state.isSoundEnabled);
  const setIsSoundEnabled = useSoundStore(state => state.setIsSoundEnabled);
  const circleOverlayRef = useRef<CircleOverlayRef>(null);

  const $onPress = useCallback(() => {
    setIsSoundEnabled(!isSoundEnabled);
    circleOverlayRef.current?.activateOverlay();
  }, [isSoundEnabled, setIsSoundEnabled]);

  const volPath =
    'M18.4028 24.6704C19.1762 24.6704 19.727 24.1196 19.727 23.3579V5.38136C19.727 4.61964 19.1762 3.99854 18.3794 3.99854C17.8403 3.99854 17.4653 4.23292 16.8676 4.80714L11.8755 9.49464C11.7935 9.56495 11.6997 9.60011 11.5825 9.60011H8.21924C6.63721 9.60011 5.77002 10.479 5.77002 12.1665V16.5258C5.77002 18.2251 6.63721 19.0922 8.21924 19.0922H11.5825C11.6997 19.0922 11.7935 19.1274 11.8755 19.1977L16.8676 23.9321C17.4067 24.4477 17.8637 24.6704 18.4028 24.6704Z';
  const off2 =
    'M22.7973 26.8618C23.6997 27.7524 25.1528 27.7524 26.02 26.8383C26.8872 25.9594 26.8872 24.5415 26.0083 23.6508L5.94581 3.6001C5.05518 2.70947 3.60206 2.70947 2.71143 3.6001C1.84424 4.46728 1.84424 5.93213 2.71143 6.81103L22.7973 26.8618Z';
  const off3 =
    'M23.77 25.9008C24.1215 26.2524 24.6958 26.2524 25.0473 25.9008C25.3872 25.5376 25.3989 24.9751 25.0473 24.6235L4.97315 4.56103C4.62159 4.20947 4.03565 4.20947 3.68409 4.56103C3.34424 4.90088 3.34424 5.49853 3.68409 5.83838L23.77 25.9008Z';
  const on2 =
    'M19.2344 19.4584C19.6212 19.728 20.1719 19.6459 20.4883 19.1889C21.3907 18.0053 21.9298 16.2592 21.9298 14.4662C21.9298 12.6732 21.3907 10.9389 20.4883 9.74354C20.1719 9.28651 19.6212 9.19276 19.2344 9.47401C18.754 9.80214 18.6837 10.3881 19.0469 10.8685C19.7266 11.806 20.1133 13.1068 20.1133 14.4662C20.1133 15.8256 19.7149 17.1147 19.0469 18.0639C18.6954 18.5561 18.754 19.1186 19.2344 19.4584Z';

  return (
    <BasePressable onPress={$onPress}>
      <View
        style={[
          styles.container,
          {
            width: width + 6,
            height: height + 6,
          },
        ]}>
        <CircleOverlay ref={circleOverlayRef} color={colors.lightGreen} />
        <Canvas
          style={[
            styles.canvas,
            {
              width,
              height,
            },
          ]}>
          <Group transform={[{scale: width / 29}]}>
            <Path path={volPath} color={colors.green} />
            {isSoundEnabled ? (
              <>
                <Group transform={[{translateX: 3}]}>
                  <Path path={on2} color={colors.green} />
                </Group>
              </>
            ) : (
              <>
                <Path path={off2} color={colors.primary.c} />
                <Path path={off3} color={colors.green} />
              </>
            )}
          </Group>
        </Canvas>
        <View
          style={[
            styles.border,
            {
              borderWidth: width / 10,
              width: width + 6,
              height: height + 6,
            },
          ]}
        />
      </View>
    </BasePressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    position: 'absolute',
    borderColor: colors.green,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default VolumeButton;
