import React, {useCallback} from 'react';
import {Canvas, Path, Group} from '@shopify/react-native-skia';
import {StyleSheet, View} from 'react-native';
import {colors} from '~/utils/colors';
import BasePressable from '../BasePressable';
import {WordleGameNavigationProp} from '~/navigation/types';
import {useNavigation} from '@react-navigation/native';

interface IconButtonProps {
  onPress?: () => void;
  width?: number;
  height?: number;
}

const DEFAULT_SIZE = 34;

function BackButton({
  onPress,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
}: IconButtonProps) {
  const navigation = useNavigation<WordleGameNavigationProp>();

  const backArrow =
    'M8.05664 14.2168C8.05664 14.5097 8.16211 14.7676 8.38477 14.9902L17.6777 24.0722C17.877 24.2832 18.1347 24.3887 18.4394 24.3887C19.0488 24.3887 19.5175 23.9316 19.5175 23.3222C19.5175 23.0176 19.3886 22.7597 19.2011 22.5605L10.6699 14.2168L19.2011 5.87304C19.3886 5.67383 19.5175 5.4043 19.5175 5.11133C19.5175 4.50195 19.0488 4.04492 18.4394 4.04492C18.1347 4.04492 17.877 4.15039 17.6777 4.34961L8.38477 13.4434C8.16211 13.6543 8.05664 13.9238 8.05664 14.2168Z';

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  }, [onPress, navigation]);

  return (
    <BasePressable onPress={handlePress}>
      <View style={[styles.container, {width: width + 6, height: height + 6}]}>
        <Canvas style={[styles.canvas, {width, height}]}>
          <Group transform={[{scale: width / 29}]}>
            <Path path={backArrow} color={colors.white} />
          </Group>
        </Canvas>
      </View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(BackButton);
