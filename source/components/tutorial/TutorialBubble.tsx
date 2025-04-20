import {useEffect, useState} from 'react';

import React from 'react';

import {Dimensions, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {colors} from '~/utils/colors';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {TutorialStep} from '~/components/tutorial/utils';

const {height, width} = Dimensions.get('screen');

interface ActionBubbleCompProps extends ActiveBubble {
  visible: boolean;
  last: boolean;
  nextStep: () => void;
  bubbleOpacity: SharedValue<number>;
  bubbleScale: SharedValue<number>;
}

const ActionBubbleComp = ({
  visible,
  position,
  text,
  displayButton,
  last,
  nextStep,
  bubbleOpacity,
  bubbleScale,
}: ActionBubbleCompProps) => {
  const bubbleAnimatedStyle = useAnimatedStyle(
    () => ({
      opacity: bubbleOpacity.value,
      transform: [{scale: bubbleScale.value}],
    }),
    [bubbleOpacity, bubbleScale],
  );
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.bubble, positionFormatter[position], bubbleAnimatedStyle]}>
      <Text style={styles.bubbleText}>{text}</Text>
      {displayButton && (
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {last ? 'המשך משחק' : 'המשך'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

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

interface TutorialBubbleProps {
  tutorialSteps: TutorialStep[];
  stepIndex: number;
  nextStep: () => void;
}

function TutorialBubble({
  tutorialSteps,
  stepIndex,
  nextStep,
}: TutorialBubbleProps) {
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

  useEffect(() => {
    if (stepIndex >= tutorialSteps.length) {
      bubble1Opacity.value = withTiming(0, {duration: 150});
      bubble1Scale.value = withTiming(0.8, {duration: 150});
      bubble2Opacity.value = withTiming(0, {duration: 150});
      bubble2Scale.value = withTiming(0.8, {duration: 150});
    } else {
      const cStep = tutorialSteps[stepIndex];
      const {text, displayButton, position} = cStep;
      if (stepIndex % 2 === 0) {
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
    stepIndex,
    bubble1Opacity,
    bubble1Scale,
    bubble2Opacity,
    bubble2Scale,
    tutorialSteps,
  ]);

  return (
    <>
      <ActionBubbleComp
        visible={stepIndex % 2 === 0}
        last={stepIndex + 1 === tutorialSteps.length}
        nextStep={nextStep}
        bubbleOpacity={bubble1Opacity}
        bubbleScale={bubble1Scale}
        text={activeBubble1.text}
        displayButton={activeBubble1.displayButton}
        position={activeBubble1.position}
      />
      <ActionBubbleComp
        visible={stepIndex % 2 === 1}
        last={stepIndex + 1 === tutorialSteps.length}
        nextStep={nextStep}
        bubbleOpacity={bubble2Opacity}
        bubbleScale={bubble2Scale}
        text={activeBubble2.text}
        displayButton={activeBubble2.displayButton}
        position={activeBubble2.position}
      />
    </>
  );
}

export default TutorialBubble;

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
