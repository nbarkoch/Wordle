import {useNavigation} from '@react-navigation/native';
import {useEffect, useMemo} from 'react';

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
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type TutorialStep = {
  text: string;
  highlights?: string[];
  displayButton?: boolean;
  position: 'top' | 'center' | 'bottom';
};

const {height, width} = Dimensions.get('screen');

const tutorialSteps: TutorialStep[] = [
  {
    text: 'ברוכים הבאים לוורדל IL!\nמשחק ניחוש מילים מספר אחד בישראל!\nבואו נלמד איך לשחק',
    highlights: [],
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המטרה היא לנחש את המילה הסודית בפחות מ-6 ניסיונות',
    highlights: [],
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המילה היא באורך של 5 אותיות',
    highlights: [],
    displayButton: true,
    position: 'center',
  },
  {
    text: 'ניתן להזין את המילה באמצעות המקלדת מטה',
    highlights: ['keyboard'],
    displayButton: true,
    position: 'center',
  },
  {
    text: 'את מה שיוקלד יהיה ניתן לראות בשורה בה המשחק נמצא בפוקוס כעת',
    highlights: ['row-0'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "במשחק זה, המילה הסודית היא 'מלכות'",
    highlights: [],
    displayButton: true,
    position: 'center',
  },
  {
    text: "בוא ננסה לנחש את המילה 'מילות'\nהקלד 'מ'",
    highlights: ['key-מ'],
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'י'",
    highlights: ['key-י'],
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'ל'",
    highlights: ['key-ל'],
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'ו'",
    highlights: ['key-ו'],
    displayButton: false,
    position: 'top',
  },
  {
    text: "הקלד 'ת'",
    highlights: ['key-ת'],
    displayButton: false,
    position: 'top',
  },
  {
    text: "עכשיו לחץ על כפתור 'אישור' כדי לשלוח את הניחוש",
    highlights: ['submit'],
    displayButton: false,
    position: 'center',
  },
  {
    text: 'הצבעים מראים לך כמה קרוב היית למילה הסודית',
    highlights: ['row-0'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "ירוק: האות במקום הנכון. 'מ','ו','ת' הם במקום הנכון!",
    highlights: ['row-0'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "צהוב: האות נמצאת במילה אבל במקום אחר. 'ל' נמצא במילה אבל במקום אחר.",
    highlights: ['row-0'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "אדום: האות לא נמצאת במילה. 'י' לא נמצא במילה 'מלכות'.",
    highlights: ['row-0'],
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המשך לנחש עד שתמצא את המילה הסודית או עד שיגמרו הניסיונות',
    highlights: ['row-1'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "עכשיו תורך! נסה להשתמש במידע שקיבלת כדי לנחש את המילה 'מלכות'",
    highlights: ['row-1'],
    displayButton: true,
    position: 'center',
  },
];

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

  const bubbleOpacity = useSharedValue(0);
  const bubbleScale = useSharedValue(0.8);

  const componentsPositions = useSpotlightStore(state => state.positions);

  const currentStep = useMemo(() => {
    const cStep = tutorialSteps[step];
    if (!cStep) {
      return undefined;
    }

    const components = (cStep?.highlights ?? [])
      .map(name => componentsPositions[name])
      .filter(component => component !== undefined);

    // console.log('components', components, componentsPositions);
    return {...cStep, components};
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
      nextStep();
      triggerEvent(undefined);
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

  const bubbleAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: bubbleOpacity.value,
      transform: [{scale: bubbleScale.value}],
    }),
    [bubbleOpacity, bubbleScale],
  );

  useEffect(() => {
    if (step >= tutorialSteps.length) {
      setDone();
    }
    bubbleOpacity.value = withSequence(
      withTiming(0, {duration: 150}),
      withTiming(1, {duration: 300}),
    );

    bubbleScale.value = withSequence(
      withTiming(0.8, {duration: 150}),
      withTiming(1, {duration: 300}),
    );
  }, [bubbleOpacity, bubbleScale, step, setDone]);

  useEffect(() => {
    return reset;
  }, [reset]);

  return (
    <>
      {currentStep && (
        <>
          <TutorialOverlay
            components={currentStep.components}
            block={currentStep.displayButton}
          />
          <Animated.View
            style={[
              styles.bubble,
              positionFormatter[currentStep.position],
              bubbleAnimatedStyle,
            ]}>
            <Text style={styles.bubbleText}>{currentStep.text}</Text>
            {currentStep.displayButton && (
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
