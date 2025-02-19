import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';

import {colors} from '~/utils/colors';
import CloseIcon from './CloseIcon';
import RowMockUp from './MockUpRow';
import HintWordButton from '../grid/HintWordsButton';
import AboutButton from '../grid/AboutButton';
import GradientOverlayScrollView from '../GridScrollView';

const {width, height} = Dimensions.get('window');
const dialogWidth = width - 60;
const dialogHeight = height - (Platform.OS === 'ios' ? 200 : 100);

const LineAbout = ({
  title,
  info,
  color,
}: {
  title: string;
  info: string;
  color: string;
}) => {
  return (
    <Text>
      <Text style={[styles.boldText, {color}]}>{title}</Text>
      <Text style={[styles.boldText, {color}]}>{': '}</Text>
      <Text style={styles.text}>{info}</Text>
    </Text>
  );
};

interface HowToPlayDialogProps {
  isVisible: boolean;
  onClose: () => void;
}

const HowToPlayDialog = ({isVisible, onClose}: HowToPlayDialogProps) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonContainerAnimation = useSharedValue(0);
  const introductionAnimation = useSharedValue(0);
  const [block, setBlock] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible) {
      setBlock(true);
      scale.value = withSpring(1, {damping: 12, stiffness: 100});
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.exp),
      });
      buttonContainerAnimation.value = withDelay(
        500,
        withSpring(1, {damping: 15, stiffness: 80}),
      );
      introductionAnimation.value = withDelay(
        300,
        withSpring(1, {damping: 12, stiffness: 100}),
      );
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(
        0,
        {
          duration: 200,
          easing: Easing.in(Easing.exp),
        },
        finish => {
          if (finish) {
            runOnJS(setBlock)(false);
          }
        },
      );
      buttonContainerAnimation.value = 0;
      introductionAnimation.value = 0;
    }
  }, [
    isVisible,
    block,
    scale,
    opacity,
    buttonContainerAnimation,
    introductionAnimation,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const introductionStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(introductionAnimation.value, [0, 1], [0.5, 1]),
      },
    ],
    opacity: introductionAnimation.value,
  }));

  if (!block && !isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="auto">
      <Animated.View style={[animatedStyle]}>
        <View style={styles.dialogWrapper}>
          <Canvas style={styles.canvas}>
            <RoundedRect
              x={0}
              y={0}
              width={dialogWidth}
              height={dialogHeight}
              r={20}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(300, 300)}
                colors={[
                  colors.container.a,
                  colors.container.b,
                  colors.container.c,
                ]}
              />
            </RoundedRect>
            <RoundedRect
              x={5}
              y={5}
              width={dialogWidth - 10}
              height={dialogHeight - 10}
              r={15}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 300)}
                colors={[colors.secondary.a, colors.secondary.b]}
              />
            </RoundedRect>
          </Canvas>
          <View style={styles.dialog}>
            <View style={styles.titleContainer}>
              <CloseIcon onPress={onClose} />
            </View>
            <Text style={styles.title}>{'איך משחקים'}</Text>
            <GradientOverlayScrollView
              upperColor={colors.secondary.a}
              bottomColor={colors.secondary.b}
              gradientHeight={30}
              horizontal={false}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}>
              <Animated.View style={[styles.introduction, introductionStyle]}>
                <Text style={styles.text}>
                  {'נחשו את המילה באורך 5 אותיות, תוך 6 ניסיונות'}
                </Text>
                <Text style={styles.text}>
                  {'מילת הניחוש חייבת להיות מילה תקנית'}
                </Text>
                <Text style={styles.text}>
                  {
                    'בתגובה לכל ניחוש המערכת מגיבה בצביעת האותיות לפי הימצאותן ומיקומן במילה הסודית'
                  }
                </Text>
                <Text style={styles.text}>
                  {'על כל ניחוש נכון תצברו נקודות'}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.boldTitle}>{'דוגמה:'}</Text>
                <Text style={styles.text}>
                  {'נניח המילה הסודית היא: מלכות'}
                </Text>
                <Text style={styles.text}>{'והניחוש שלך:'}</Text>
                <View style={styles.adjustment}>
                  <RowMockUp
                    letters={['מ', 'י', 'ל', 'ו', 'ת']}
                    correctness={[null, null, null, null, null]}
                  />
                </View>
                <Text style={styles.text}>{'לאחר שתלחץ על אישור'}</Text>
                <View style={styles.adjustment}>
                  <RowMockUp
                    letters={['מ', 'י', 'ל', 'ו', 'ת']}
                    correctness={[
                      'correct',
                      'notInUse',
                      'exists',
                      'correct',
                      'correct',
                    ]}
                  />
                </View>
                <Text style={styles.text}>{'הצבעים יראו רמז לאחר הניחוש'}</Text>
                <LineAbout
                  title={'ירוק'}
                  color={colors.green}
                  info={'האות קיימת במילה במיקום זהה'}
                />
                <LineAbout
                  title={'צהוב'}
                  color={colors.yellow}
                  info={'האות קיימת במילה במיקום אחר'}
                />
                <LineAbout
                  title={'אדום'}
                  color={colors.red}
                  info={'האות אינה קיימת בכלל במילה'}
                />
                <View style={styles.divider} />
                <Text style={styles.boldTitle}>{'כפתורי רמז:'}</Text>
                <View style={styles.row}>
                  <HintWordButton onHintRequested={() => {}} scoreCost={0} />
                  <AboutButton onInfoRequested={() => {}} scoreCost={0} />
                </View>
                <Text style={styles.text}>{'שימוש ברמזים עולה נקודות'}</Text>
                <LineAbout
                  title={'מידע'}
                  color={colors.blue}
                  info={'מילה נרדפת או רמז על המילה'}
                />
                <LineAbout
                  title={'נורה'}
                  color={colors.yellow}
                  info={'חושפת אותיות'}
                />
              </Animated.View>
            </GradientOverlayScrollView>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogWrapper: {
    padding: 3,
    elevation: 6,
    width: dialogWidth,
    height: dialogHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    width: dialogWidth,
    height: dialogHeight,
  },
  dialog: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 5,
    width: dialogWidth,
    height: dialogHeight,
    paddingHorizontal: 5,
  },
  titleContainer: {
    position: 'absolute',
    top: -20,
    width: dialogWidth + 35,
    alignItems: 'flex-end',
    borderRadius: 15,
  },
  introduction: {
    width: '100%',
    flex: 1,
    padding: 20,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: colors.lightGrey,
    paddingVertical: 4,
    textAlign: 'center',
  },
  boldText: {
    fontSize: 17,
    color: colors.lightGrey,
    textAlign: 'center',
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  boldTitle: {
    fontSize: 18,
    color: colors.lightGrey,
    textAlign: 'center',
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  divider: {
    height: 2,
    width: '100%',
    backgroundColor: colors.gold,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  title: {
    color: colors.lightYellow,
    fontSize: 23,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  scrollView: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  row: {flexDirection: 'row', padding: 10, gap: 30},
  adjustment: {transform: [{scale: 0.8}], padding: 5},
});

export default HowToPlayDialog;
