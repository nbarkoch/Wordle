import React, {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  withSequence,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

import confettiSpark from '~/assets/lottie/confetti_1.json';
import confettiParty from '~/assets/lottie/confetti_2.json';
import {OutlinedText} from './CartoonText';
import {colors, ThemeColor} from '~/utils/colors';
import useSound from '~/useSound';

const {width, height} = Dimensions.get('window');

const partyStrings = [
  'מצויין',
  'כל הכבוד',
  'איחוליי',
  'שאפו',
  'מדהים',
  'תם ונשלם',
  'יפה מאוד',
  'נצחון',
  'אליפות',
  'שיחקת אותה',
  'נהדר',
];
const quickSolverStrings = [
  'מה פתאום?',
  'לא נורמאלי',
  'בלתי יאומן',
  'מה קרה פה עכשיו?',
  'מההה?',
  'שברת את המשחק',
  'הזייה!!',
];
const strikeStrings = [
  'סטרייק',
  'מגניב',
  'קומבו',
  'ירוק בעיניים',
  'סחטיין',
  'על הכיפ-אק',
  'מטורף',
  'איזה מהלך',
  'עף לי הפוני',
  'כמעט שם',
];

const strings: {[key in ConfettiType]: string[]} = {
  party: partyStrings,
  spark: strikeStrings,
  'quick-solver': quickSolverStrings,
};

const confettiConfig: {
  [key in ConfettiType]: {
    texts: string[];
    resource: any;
    color: ThemeColor;
    fontSize: number;
    resizeMode: 'center' | 'cover' | 'contain' | undefined;
  };
} = {
  party: {
    texts: partyStrings,
    color: colors.blue,
    resource: confettiParty,
    fontSize: 42,
    resizeMode: 'cover',
  },
  spark: {
    texts: strikeStrings,
    color: colors.blue,
    resource: confettiSpark,
    fontSize: 42,
    resizeMode: 'center',
  },
  'quick-solver': {
    texts: quickSolverStrings,
    color: colors.mediumRed,
    resource: confettiParty,
    fontSize: 47,
    resizeMode: 'cover',
  },
};

type ConfettiType = 'spark' | 'party' | 'quick-solver';

const SPRING_DELAY = 200;
const TEXT_DISPLAY_DUR = 2000;
const OPACITY_DUR = 400;
const SCALE_DUR = 500;
export interface ConfettiOverlayRef {
  triggerFeedback: (type: ConfettiType) => void;
}

const ConfettiOverlay = forwardRef<ConfettiOverlayRef>(({}, ref) => {
  const [showFeedback, setShowFeedback] = useState<ConfettiType | null>(null);
  const [showText, setShowText] = useState<string | null>(null);

  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const rotation = useSharedValue(-270);

  const {playSound: playStrike} = useSound('good.mp3');
  const {playSound: playParty} = useSound('finish.mp3');

  const playSound: {[key in ConfettiType]: () => void} = {
    party: playParty,
    spark: playStrike,
    'quick-solver': playParty,
  };

  const animateFeedbackIn = useCallback(
    (text: string, confettiType: ConfettiType) => {
      setShowFeedback(confettiType);
      setShowText(text);
      cancelAnimation(textScale);
      cancelAnimation(rotation);
      cancelAnimation(textOpacity);
      textScale.value = withSequence(
        withTiming(1.2, {duration: OPACITY_DUR - SPRING_DELAY}),
        withTiming(1, {duration: SPRING_DELAY}),
        withDelay(
          TEXT_DISPLAY_DUR + SPRING_DELAY,
          withTiming(0, {
            duration: SCALE_DUR,
            easing: Easing.out(Easing.cubic),
          }),
        ),
      );

      rotation.value = withSequence(
        withTiming(0, {
          duration: OPACITY_DUR,
          easing: Easing.out(Easing.cubic),
        }),
        withDelay(
          TEXT_DISPLAY_DUR + SPRING_DELAY,
          withTiming(-270, {
            duration: OPACITY_DUR,
            easing: Easing.in(Easing.cubic),
          }),
        ),
      );

      textOpacity.value = withSequence(
        withTiming(1, {
          duration: OPACITY_DUR,
          easing: Easing.out(Easing.cubic),
        }),
        withDelay(
          TEXT_DISPLAY_DUR + SPRING_DELAY,
          withTiming(
            0,
            {
              duration: OPACITY_DUR,
              easing: Easing.out(Easing.cubic),
            },
            finished => {
              if (finished) {
                runOnJS(setShowText)(null);
              }
            },
          ),
        ),
      );
    },
    [rotation, textOpacity, textScale],
  );

  useImperativeHandle(ref, () => ({
    triggerFeedback: (type: ConfettiType) => {
      const feedback = `${
        strings[type][Math.floor(Math.random() * strings[type].length)]
      }!`;
      const playConfettiSound = playSound[type];

      animateFeedbackIn(feedback, type);
      playConfettiSound();
    },
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{scale: textScale.value}, {rotate: `${rotation.value}deg`}],
    opacity: textOpacity.value,
  }));

  return (
    <>
      {(showFeedback || showText) && (
        <View style={styles.feedbackContainer} pointerEvents="none">
          {showFeedback && (
            <LottieView
              style={styles.confetti}
              source={confettiConfig[showFeedback].resource}
              autoPlay
              loop={false}
              resizeMode={confettiConfig[showFeedback].resizeMode}
              onAnimationFinish={() => {
                if (!showText) {
                  setShowFeedback(null);
                }
              }}
            />
          )}
          {showText && showFeedback && (
            <Animated.View style={[styles.feedbackView, animatedTextStyle]}>
              <OutlinedText
                text={showText}
                fontSize={42}
                width={width}
                height={70}
                fillColor={colors.white}
                strokeColor={confettiConfig[showFeedback].color}
                strokeWidth={12}
              />
            </Animated.View>
          )}
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{translateY: -50}],
  },
  confetti: {
    width: width,
    height: height,
    position: 'absolute',
    overflow: 'hidden',
  },
  feedbackView: {
    padding: 17,
  },
  feedbackText: {
    fontSize: 40,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: colors.white,
    fontStyle: 'italic',
  },
});

export default ConfettiOverlay;
