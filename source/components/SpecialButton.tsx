import React, {useState, useCallback} from 'react';
import {StyleSheet, Text, View, LayoutChangeEvent} from 'react-native';
import {setColorOpacity, lightenColor} from '~/utils/ui';
import BasePressable from './BasePressable';
import StripePattern from './StripePattern';

interface SpecialButtonProps {
  onPress: () => void;
  text: string;
  color: string;
}

function SpecialButton({onPress, text, color}: SpecialButtonProps) {
  const [buttonDimensions, setButtonDimensions] = useState({
    width: 0,
    height: 0,
  });
  const colorOpacity = setColorOpacity(lightenColor(color, 5), 0.5);

  const onButtonLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setButtonDimensions({width, height});
  }, []);

  return (
    <BasePressable onPress={onPress}>
      <View style={styles.button2}>
        {buttonDimensions.width > 0 && buttonDimensions.height > 0 && (
          <StripePattern
            width={buttonDimensions.width}
            height={buttonDimensions.height}
            colors={[color, colorOpacity]}
            style={styles.stripe}
            stripeWidth={5}
            compression={5}
          />
        )}
        <View
          style={[
            styles.button,
            {
              borderColor: colorOpacity,
            },
          ]}
          onLayout={onButtonLayout}>
          <Text style={styles.buttonText}>{text.toLocaleUpperCase()}</Text>
        </View>
      </View>
    </BasePressable>
  );
}

const styles = StyleSheet.create({
  button2: {
    margin: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 50,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
  },
  stripe: {
    position: 'absolute',
    borderRadius: 50,
    overflow: 'hidden',
  },
});

export default SpecialButton;
