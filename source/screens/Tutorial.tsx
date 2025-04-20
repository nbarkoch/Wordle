import {useNavigation} from '@react-navigation/native';
import {useEffect, useMemo, useState} from 'react';

import {TutorialNavigationProp} from '~/navigation/types';
import WordleGame from './WordleGame';

import React from 'react';
import TutorialOverlay from '~/components/tutorial/TutorialOverlay';
import {useSpotlightStore} from '~/store/spotlightStore';
import {useTutorialStore} from '~/store/tutorialStore';
import {Dimensions, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {colors} from '~/utils/colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type TutorialStep = {
  text: string;
  highlight?: string;
  displayButton?: boolean;
  position: 'top' | 'center' | 'bottom';
};

const {height, width} = Dimensions.get('screen');

const tutorialSteps: TutorialStep[] = [
  {
    text: 'ברוכים הבאים לוורדל IL!\nמשחק ניחוש מילים מספר אחד בישראל!\nבואו נלמד איך לשחק',

    displayButton: true,
    position: 'center',
  },
  {
    text: 'המטרה היא לנחש את המילה הסודית בפחות מ-6 ניסיונות',

    displayButton: true,
    position: 'center',
  },
  {
    text: 'המילה היא באורך של 5 אותיות',

    displayButton: true,
    position: 'center',
  },
  {
    text: 'ניתן להזין את המילה באמצעות המקלדת מטה',
    highlight: 'keyboard',
    displayButton: true,
    position: 'center',
  },
  {
    text: 'את מה שיוקלד יהיה ניתן לראות בשורה בה המשחק נמצא בפוקוס כעת',
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: "במשחק זה, המילה הסודית היא 'מלכות'",

    displayButton: true,
    position: 'center',
  },
  {
    text: "בוא ננסה לנחש את המילה 'מילות'\nהקלד 'מ'",
    highlight: 'key-מ',
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'י'",
    highlight: 'key-י',
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'ל'",
    highlight: 'key-ל',
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'ו'",
    highlight: 'key-ו',
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'ת'",
    highlight: 'key-ת',
    displayButton: false,
    position: 'top',
  },
  {
    text: "עכשיו לחץ על כפתור 'אישור' כדי לשלוח את הניחוש",
    highlight: 'submit',
    displayButton: false,
    position: 'center',
  },
  {
    text: 'מעולה!',
    highlight: 'grid',
    displayButton: false,
    position: 'bottom',
  },
  {
    text: 'הצבעים מראים לך כמה קרוב היית למילה הסודית',
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: "ירוק: האות במקום הנכון. 'מ','ו','ת' הם במקום הנכון!",
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: "צהוב: האות נמצאת במילה אבל במקום אחר. 'ל' נמצא במילה אבל במקום אחר.",
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: "אדום: האות לא נמצאת במילה. 'י' לא נמצא במילה 'מלכות'.",
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המשך לנחש עד שתמצא את המילה הסודית או עד שיגמרו הניסיונות',
    highlight: 'row-1',
    displayButton: true,
    position: 'center',
  },
  {
    text: "עכשיו תורך! נסה להשתמש במידע שקיבלת כדי לנחש את המילה 'מלכות'",
    highlight: 'row-1',
    displayButton: true,
    position: 'center',
  },
];

type ActiveBubble = {
  text: string;
  displayButton: boolean;
  position: 'top' | 'center' | 'bottom';
};

const positionFormatter = {
  top: {
    top: 40,
  },
  center: {
    top: height / 2.5,
  },
  bottom: {
    bottom: 40,
  },
};

const exampleWord = 'מילות';

function Tutorial() {
  const navigation = useNavigation<TutorialNavigationProp>();

  const {reset, setDone, setStep, nextStep, step, eventTrigger, triggerEvent} =
    useTutorialStore(state => state);

  const bubble1Opacity = useSharedValue(0);
  const bubble1Scale = useSharedValue(0.8);
  const bubble2Opacity = useSharedValue(0);
  const bubble2Scale = useSharedValue(0.8);

  const [activeBubble1, setActiveBubble1] = useState<ActiveBubble>({
    text: tutorialSteps[0].text,
    displayButton: tutorialSteps[0].displayButton ?? false,
    position: tutorialSteps[0].position,
  });
  const [activeBubble2, setActiveBubble2] = useState<ActiveBubble>({
    text: tutorialSteps[1].text,
    displayButton: tutorialSteps[1].displayButton ?? false,
    position: tutorialSteps[1].position,
  });

  const componentsPositions = useSpotlightStore(state => state.positions);

  const currentStep = useMemo(() => {
    const cStep = tutorialSteps[step];
    if (!cStep) {
      return undefined;
    }

    const highlightedComponentName = cStep?.highlight;
    const highlightedComponent = highlightedComponentName
      ? componentsPositions[highlightedComponentName]
      : undefined;

    // console.log('components', components, componentsPositions);
    return {...cStep, highlightedComponent};
  }, [componentsPositions, step]);

  useEffect(() => {
    // Early return if button is displayed or no event trigger
    if (currentStep?.displayButton || !eventTrigger) {
      return;
    }

    const startOffset: number = 6;

    // Define the expected key for each step
    const expectedKeys = exampleWord
      .split('')
      .reduce<Record<number, string>>((acc, l, i) => {
        acc[startOffset + i] = `key-${l}`;
        return acc;
      }, {});
    expectedKeys[startOffset + exampleWord.length] = 'submit';

    const expectedKey = expectedKeys[step];

    if (!expectedKey) {
      return;
    }

    if (eventTrigger.step === step && eventTrigger.key === expectedKey) {
      if (expectedKey === 'submit') {
        triggerEvent(undefined);
        nextStep();
        const timeout = setTimeout(() => {
          triggerEvent(undefined);
          nextStep();
          clearTimeout(timeout);
        }, 2000);
      } else {
        nextStep();
        triggerEvent(undefined);
      }
    }
    // For steps after the first tutorial step, go back to step 4 on mismatch
    else if (step > startOffset) {
      setStep(startOffset);
    }
  }, [
    step,
    eventTrigger,
    nextStep,
    setStep,
    currentStep?.displayButton,
    triggerEvent,
  ]);

  const bubble1AnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: bubble1Opacity.value,
      transform: [{scale: bubble1Scale.value}],
    }),
    [bubble1Opacity, bubble1Scale],
  );

  const bubble2AnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: bubble2Opacity.value,
      transform: [{scale: bubble2Scale.value}],
    }),
    [bubble2Opacity, bubble2Scale],
  );

  useEffect(() => {
    if (step >= tutorialSteps.length) {
      setDone();
      bubble1Opacity.value = withTiming(0, {duration: 150});
      bubble1Scale.value = withTiming(0.8, {duration: 150});
      bubble2Opacity.value = withTiming(0, {duration: 150});
      bubble2Scale.value = withTiming(0.8, {duration: 150});
    } else {
      const cStep = tutorialSteps[step];
      const {text, displayButton, position} = cStep;
      if (step % 2 === 0) {
        bubble2Opacity.value = withTiming(0, {duration: 150});
        bubble2Scale.value = withTiming(0.8, {duration: 150});
        setActiveBubble1({
          text,
          displayButton: displayButton ?? false,
          position,
        });
        bubble1Opacity.value = withTiming(1, {duration: 300});
        bubble1Scale.value = withTiming(1, {duration: 300});
      } else {
        bubble1Opacity.value = withTiming(0, {duration: 150});
        bubble1Scale.value = withTiming(0.8, {duration: 150});
        setActiveBubble2({
          text,
          displayButton: displayButton ?? false,
          position,
        });
        bubble2Opacity.value = withTiming(1, {duration: 300});
        bubble2Scale.value = withTiming(1, {duration: 300});
      }
    }
  }, [
    step,
    setDone,
    bubble1Opacity,
    bubble1Scale,
    bubble2Opacity,
    bubble2Scale,
  ]);
  useEffect(() => {
    return reset;
  }, [reset]);

  return (
    <>
      {currentStep && (
        <>
          <TutorialOverlay
            component={currentStep.highlightedComponent}
            block={currentStep.displayButton}
          />
          <Animated.View
            pointerEvents={step % 2 === 0 ? 'auto' : 'none'}
            style={[
              styles.bubble,
              positionFormatter[activeBubble1.position],
              bubble1AnimatedStyle,
            ]}>
            <Text style={styles.bubbleText}>{activeBubble1.text}</Text>
            {activeBubble1.displayButton && (
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>
                  {step + 1 < tutorialSteps.length ? 'המשך' : 'המשך משחק'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
          <Animated.View
            pointerEvents={step % 2 === 1 ? 'auto' : 'none'}
            style={[
              styles.bubble,
              positionFormatter[activeBubble2.position],
              bubble2AnimatedStyle,
            ]}>
            <Text style={styles.bubbleText}>{activeBubble2.text}</Text>
            {activeBubble2.displayButton && (
              <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                <Text style={styles.nextButtonText}>
                  {step + 1 < tutorialSteps.length ? 'המשך' : 'המשך משחק'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </>
      )}

      <WordleGame
        navigation={navigation as any}
        route={{
          params: {
            maxAttempts: 6,
            wordLength: 5,
            category: 'GENERAL',
            difficulty: 'easy',
            type: 'RANDOM',
          },
          name: 'WordGame',
          key: 'WordGame',
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    paddingBottom: 10,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1001,
  },
  bubbleText: {
    fontSize: 18,
    color: colors.primary.d,
    textAlign: 'center',
    fontFamily: 'PloniDL1.1AAA-Bold',
    marginBottom: 15,
  },
  nextButton: {
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
});
export default Tutorial;
