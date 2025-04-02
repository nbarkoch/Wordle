import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
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
import {colors} from '~/utils/colors';
import CloseIcon from './CloseIcon';
import RowMockUp from './MockUpRow';
import HintWordButton from '../grid/HintWordsButton';
import AboutButton from '../grid/AboutButton';
import GradientOverlayScrollView from '../GridScrollView';
import LinearGradient from 'react-native-linear-gradient';

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
        withSpring(1, {damping: 11, stiffness: 100}),
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
      <Animated.View style={animatedStyle}>
        <View style={styles.dialogWrapper}>
          <LinearGradient
            style={styles.canvas}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={[
              colors.container.a,
              colors.container.b,
              colors.container.c,
            ]}>
            <View style={styles.titleContainer}>
              <CloseIcon onPress={onClose} />
            </View>
            <LinearGradient
              style={styles.dialog}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              colors={[colors.secondary.a, colors.secondary.b]}>
              <Text style={styles.title}>{'איך משחקים'}</Text>
              <View style={styles.frame}>
                <Animated.View
                  style={[styles.animatedContent, introductionStyle]}>
                  <GradientOverlayScrollView
                    upperColor={colors.secondary.a}
                    bottomColor={colors.secondary.b}
                    gradientHeight={30}
                    horizontal={false}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.introduction}>
                      <Text style={styles.text}>
                        {'המשחק בוחר מילה סודית עם 5 אותיות'}
                      </Text>
                      <Text style={styles.text}>
                        {'צריך לנחש את המילה תוך 6 ניסיונות'}
                      </Text>

                      <View style={styles.divider} />
                      <Text style={styles.boldTitle}>{'איך זה עובד:'}</Text>
                      <Text style={styles.text}>
                        {'לדוגמה: כשהמילה הסודית היא "מלכות"'}
                      </Text>
                      <Text style={styles.text}>
                        {'והניחוש שלכם הוא "מילות"'}
                      </Text>
                      <View style={styles.adjustment}>
                        <RowMockUp
                          letters={['מ', 'י', 'ל', 'ו', 'ת']}
                          correctness={[null, null, null, null, null]}
                        />
                      </View>
                      <Text style={styles.text}>
                        {'המשחק יצבע את האותיות כך:'}
                      </Text>
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
                      <Text style={styles.text}>{'משמעות הצבעים:'}</Text>
                      <LineAbout
                        title={'ירוק'}
                        color={colors.green}
                        info={'האות נמצאת במקום הנכון'}
                      />
                      <LineAbout
                        title={'צהוב'}
                        color={colors.yellow}
                        info={'האות נמצאת במילה אבל במקום אחר'}
                      />
                      <LineAbout
                        title={'אדום'}
                        color={colors.red}
                        info={'האות לא נמצאת במילה כלל'}
                      />
                      <View style={styles.divider} />
                      <Text style={styles.boldTitle}>{'אם צריכים עזרה:'}</Text>
                      <View style={styles.row}>
                        <HintWordButton
                          onHintRequested={() => {}}
                          scoreCost={0}
                        />
                        <AboutButton onInfoRequested={() => {}} scoreCost={0} />
                      </View>
                      <Text style={styles.text}>
                        {'אפשר להשתמש ברמזים, אבל זה עולה נקודות'}
                      </Text>
                      <LineAbout
                        title={'מידע'}
                        color={colors.blue}
                        info={'נותן רמז או מילה נרדפת למילה הסודית'}
                      />
                      <LineAbout
                        title={'נורה'}
                        color={colors.yellow}
                        info={'חושפת אותיות מהמילה הסודית'}
                      />
                      <View style={styles.divider} />
                      <Text style={styles.boldTitle}>{'בהצלחה!'}</Text>
                      <Text style={styles.text}>
                        {'נחשו את המילה הסודית ותזכו בנקודות'}
                      </Text>
                    </View>
                  </GradientOverlayScrollView>
                </Animated.View>
              </View>
            </LinearGradient>
          </LinearGradient>
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
    elevation: 6,
    width: dialogWidth,
    height: dialogHeight < 450 ? 450 : dialogHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    alignItems: 'center',
    paddingTop: 25,
    borderRadius: 15,
    overflow: 'hidden',
  },
  titleContainer: {
    position: 'absolute',
    top: -20,
    width: dialogWidth + 17.5,
    alignItems: 'flex-end',
    borderRadius: 15,
    zIndex: 1,
  },
  introduction: {
    width: '95%',
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.lightGrey,
    paddingVertical: 5,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontSize: 18,
    color: colors.lightGrey,
    textAlign: 'center',
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  boldTitle: {
    fontSize: 20,
    color: colors.lightYellow,
    textAlign: 'center',
    fontFamily: 'PloniDL1.1AAA-Bold',
    marginBottom: 6,
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
    fontSize: 26,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  scrollView: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingBottom: 5,
    paddingHorizontal: 5,
  },
  row: {flexDirection: 'row', padding: 10, gap: 30},
  adjustment: {transform: [{scale: 0.8}], padding: 5},
  canvas: {
    padding: 5,
    borderRadius: 20,
  },
  animatedContent: {
    flex: 1,
  },
  frame: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default HowToPlayDialog;
