import {useNavigation} from '@react-navigation/native';
import {useEffect, useMemo} from 'react';

import {TutorialNavigationProp} from '~/navigation/types';
import WordleGame from './WordleGame';

import React from 'react';
import TutorialOverlay from '~/components/tutorial/TutorialOverlay';
import {useSpotlightStore} from '~/store/spotlightStore';
import {useTutorialStore} from '~/store/tutorialStore';

import {tutorialSteps} from '~/components/tutorial/utils';
import TutorialBubble from '~/components/tutorial/TutorialBubble';
import {genInitialState} from '~/gameReducer';

const exampleWord = 'מילות';

function Tutorial() {
  const navigation = useNavigation<TutorialNavigationProp>();

  const {reset, setDone, setStep, nextStep, step, eventTrigger, triggerEvent} =
    useTutorialStore(state => state);

  const componentsPositions = useSpotlightStore(state => state.positions);

  const currentStep = useMemo(() => {
    const cStep = tutorialSteps[step];
    if (cStep) {
      const highlightedComponentName = cStep?.highlight;
      const highlightedComponent = highlightedComponentName
        ? componentsPositions[highlightedComponentName]
        : undefined;
      return {...cStep, highlightedComponent};
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

  useEffect(() => {
    if (step >= tutorialSteps.length) {
      setDone();
    }
  }, [step, setDone]);

  useEffect(() => {
    return reset;
  }, [reset]);

  return (
    <>
      {currentStep && (
        <TutorialOverlay
          component={currentStep.highlightedComponent}
          block={currentStep.displayButton}
        />
      )}
      <TutorialBubble
        tutorialSteps={tutorialSteps}
        stepIndex={step}
        nextStep={nextStep}
      />
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

export default Tutorial;
