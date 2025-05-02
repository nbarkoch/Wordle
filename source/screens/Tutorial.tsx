import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {TutorialNavigationProp} from '~/navigation/types';
import WordleGame from './WordleGame';
import React from 'react';
import TutorialOverlay from '~/components/tutorial/TutorialOverlay';
import {ComponentPosition, useSpotlightStore} from '~/store/spotlightStore';
import {useTutorialStore} from '~/store/tutorialStore';
import {TutorialStep, tutorialSteps} from '~/components/tutorial/utils';
import TutorialBubble from '~/components/tutorial/TutorialBubble';
import {genInitialState} from '~/gameReducer';
import LoadingFallback from '~/components/LoadingFallback';
import {Dimensions, StyleSheet, View} from 'react-native';
import CanvasBackground from '~/utils/canvas';
import SkipTutorialButton from '~/components/tutorial/SkipTutorialButton';

const {width, height} = Dimensions.get('screen');

const exampleWord = 'מילות';
const stepSeperateor = 13;

function Tutorial() {
  const navigation = useNavigation<TutorialNavigationProp>();

  const {reset, setDone, setStep, nextStep, step, eventTrigger, triggerEvent} =
    useTutorialStore(state => state);

  const [componentsPositions, setComponentsPositions] = useState<
    Record<string, ComponentPosition>
  >({});

  const waitForRegistrations = useSpotlightStore(
    state => state.waitForRegistrations,
  );
  const {registering} = useSpotlightStore(state => state);

  const currentStep = useMemo(() => {
    const cStep = tutorialSteps[step];
    if (cStep) {
      return {
        ...cStep,
        highlightedComponent: cStep.highlight
          ? componentsPositions[cStep.highlight]
          : undefined,
        secondaryHighlightedComponents: cStep.secondHighlights?.map(
          name => componentsPositions[name],
        ),
      };
    }
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
        }, 2250);
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

  useEffect(() => {
    if (step >= tutorialSteps.length) {
      setDone();
    }
  }, [step, setDone]);

  const registerStepsPositions = useCallback((steps: TutorialStep[]) => {
    const highlights = steps
      .map(s => s.highlight)
      .concat(steps.flatMap(s => s.secondHighlights))
      .filter(Boolean) as string[];
    // Remove duplicates
    const uniqueHighlights = [...new Set(highlights)];
    // Register to components that should be measured
    waitForRegistrations(uniqueHighlights).then(setComponentsPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerStepsPositions(tutorialSteps.slice(0, stepSeperateor));
    return reset;
  }, [registerStepsPositions, reset]);

  useEffect(() => {
    if (step === stepSeperateor) {
      registerStepsPositions(tutorialSteps.slice(stepSeperateor));
    }
  }, [registerStepsPositions, step]);

  return (
    <>
      {currentStep && (
        <>
          <TutorialOverlay
            component={currentStep.highlightedComponent}
            block={currentStep.displayButton}
            components={currentStep.secondaryHighlightedComponents}
          />
          {registering ? (
            <View style={styles.loader}>
              {step === 0 && <CanvasBackground />}
              <LoadingFallback />
            </View>
          ) : (
            <>
              <SkipTutorialButton
                onPress={() => setStep(tutorialSteps.length)}
              />
              <TutorialBubble
                tutorialSteps={tutorialSteps}
                stepIndex={step}
                nextStep={nextStep}
              />
            </>
          )}
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
            savedGameState: {
              ...genInitialState(5, 6),
              aboutWasShown: true,
              specialHintUsed: true,
            },
          },
          name: 'WordGame',
          key: 'WordGame',
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    zIndex: 10,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Tutorial;
