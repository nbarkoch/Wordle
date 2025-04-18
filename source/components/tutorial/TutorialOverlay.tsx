import {
  Canvas,
  Group,
  Mask,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import {Dimensions, StyleSheet, View} from 'react-native';
import React from 'react';
import {ComponentPosition} from '~/store/spotlightStore';

const {width, height} = Dimensions.get('screen');

interface TutorialOverlayProps {
  components: ComponentPosition[];
  block?: boolean;
}

function TutorialOverlay({
  components = [],
  block = false,
}: TutorialOverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents={block ? 'box-only' : 'none'}>
      <Canvas style={styles.overlay}>
        <Mask
          mode="luminance"
          mask={
            <Group>
              <Rect x={0} y={0} width={width} height={height} color={'white'} />
              {components.map(component => (
                <RoundedRect
                  key={component.id}
                  x={component.x - 10}
                  y={component.y - 5}
                  width={component.width + 20}
                  height={component.height + 10}
                  r={25}
                  color={'black'}
                />
              ))}
            </Group>
          }>
          <Rect x={0} y={0} width={width} height={height} color={'#000000c1'} />
        </Mask>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width,
    height,
    zIndex: 5,
  },
});
export default TutorialOverlay;
