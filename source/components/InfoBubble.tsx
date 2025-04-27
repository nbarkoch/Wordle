import React, {memo, useState} from 'react';

import {useEffect} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import {setColorOpacity} from '~/utils/ui';

const {width, height} = Dimensions.get('window');

const bubbleBackgroundColor = setColorOpacity('#000000', 0.65);

interface InfoBubbleProps {
  hint: string;
  isVisible: boolean;
  position: {top: number; left: number};
  close: () => void;
}

const InfoBubble = ({
  hint,
  isVisible,
  position = {top: 0, left: 0},
  close,
}: InfoBubbleProps) => {
  const scaleY = useSharedValue(isVisible ? 1 : 0);
  const opacity = useSharedValue(isVisible ? 1 : 0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isVisible) {
      setHidden(false);
      scaleY.value = withSpring(1, {damping: 15, stiffness: 120});
      opacity.value = withTiming(1, {duration: 200});
    } else {
      scaleY.value = withSpring(0, {damping: 15, stiffness: 120});
      opacity.value = withTiming(0, {duration: 150}, finish =>
        runOnJS(setHidden)(!!finish),
      );
    }
  }, [isVisible, scaleY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scaleY: scaleY.value},
      {translateY: interpolate(scaleY.value, [0, 1], [-5, 1])},
    ],
    opacity: opacity.value,
  }));

  if (!isVisible && hidden) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.bubble, animatedStyle]}>
        <View style={[styles.bubbleArrow, position]} />
        <View
          style={[
            styles.infoBubble,
            {left: position.left / 2 - 10, top: position.top + 10},
          ]}>
          <Text style={styles.bubbleText}>{hint}</Text>
        </View>
      </Animated.View>
      {isVisible && (
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.bubbleDismissOverlay} />
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width,
    height,
    zIndex: 21,
    pointerEvents: 'box-none',
  },
  infoBubble: {
    position: 'absolute',
    backgroundColor: bubbleBackgroundColor,
    borderRadius: 10,
    padding: 10,
    minWidth: 200,
    maxWidth: width - 110,
    zIndex: 22,
  },
  bubbleArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: bubbleBackgroundColor,
  },
  bubbleText: {
    color: colors.lightGrey,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  bubbleDismissOverlay: {
    position: 'absolute',
    width,
    height,
    zIndex: 20,
  },
});

export default memo(InfoBubble);
