import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  I18nManager,
  ViewStyle,
} from 'react-native';
import {
  Canvas,
  RoundedRect,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  Easing,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import HebrewFont from '~/assets/fonts/VarelaRound-Regular.ttf';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface KeyboardKeyProps {
  letter: string;
  onPress: (key: string) => void;
  style?: ViewStyle;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({letter, onPress, style}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.8, {
      duration: 100,
      easing: Easing.inOut(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.inOut(Easing.quad),
    });
  };

  return (
    <AnimatedPressable
      style={[styles.key, style ?? {}, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => runOnJS(onPress)(letter)}>
      <Text style={styles.keyText}>{letter}</Text>
    </AnimatedPressable>
  );
};

const AddsBlock = () => {
  return (
    <View style={{height: 100, width: '100%', backgroundColor: 'gray'}}></View>
  );
};

const WordleGame: React.FC = () => {
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [guesses, setGuesses] = useState<string[]>(
    Array(MAX_ATTEMPTS).fill(''),
  );
  const [currentGuess, setCurrentGuess] = useState('');

  const shakeAnimation = useSharedValue(0);

  const submitScaleAnimation = useSharedValue(1);
  const submitColorAnimation = useSharedValue(0);

  const font = useFont(HebrewFont, 24);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + key);
      }
    },
    [currentGuess],
  );

  const handleDelete = useCallback(() => {
    setCurrentGuess(prev => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    // if not legal word?
    if (currentGuess.length === WORD_LENGTH) {
      setGuesses(prev => {
        const newGuesses = [...prev];
        newGuesses[currentAttempt] = currentGuess;
        return newGuesses;
      });
      setCurrentAttempt(prev => prev + 1);
      setCurrentGuess('');
    } else {
      // New shake animation
      shakeAnimation.value = withSequence(
        withTiming(-5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(-5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 50, easing: Easing.inOut(Easing.quad)}),
      );
    }
  }, [currentGuess, currentAttempt, shakeAnimation]);

  const renderGrid = () => {
    return (
      <Canvas style={[styles.grid]}>
        {Array(MAX_ATTEMPTS)
          .fill(0)
          .map((_, rowIndex) =>
            Array(WORD_LENGTH)
              .fill(0)
              .map((__, colIndex) => {
                const letter =
                  guesses[rowIndex][colIndex] ||
                  (rowIndex === currentAttempt ? currentGuess[colIndex] : '');
                const xPos = I18nManager.isRTL
                  ? (WORD_LENGTH - 1 - colIndex) * 50 + 5
                  : colIndex * 50 + 5;
                return (
                  <React.Fragment key={`${rowIndex}-${colIndex}`}>
                    <RoundedRect
                      x={xPos}
                      y={rowIndex * 50 + 5}
                      width={40}
                      height={40}
                      r={5}
                      color={letter ? '#4CAF50' : '#e0e0e0'}
                    />
                    {font && (
                      <SkiaText
                        x={xPos + 13}
                        y={rowIndex * 50 + 32}
                        text={letter || ' '}
                        font={font}
                        color="white"
                      />
                    )}
                  </React.Fragment>
                );
              }),
          )}
      </Canvas>
    );
  };

  const renderKeyboard = () => {
    const keys = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');
    return (
      <View style={[styles.keyboard]}>
        {keys.map(key => (
          <KeyboardKey key={key} letter={key} onPress={handleKeyPress} />
        ))}
        <KeyboardKey
          letter="DELETE"
          onPress={handleDelete}
          style={styles.wideKey}
        />
      </View>
    );
  };

  useEffect(() => {
    submitColorAnimation.value = withTiming(
      currentGuess.length === WORD_LENGTH ? 1 : 0,
      {duration: 300, easing: Easing.inOut(Easing.quad)},
    );
  }, [currentGuess.length, submitColorAnimation]);

  const submitButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      submitColorAnimation.value,
      [0, 1],
      ['#A0A0A0', '#4CAF50'], // Grey when disabled, Green when enabled
    );

    return {
      backgroundColor,
      transform: [{scale: submitScaleAnimation.value}],
    };
  });

  return (
    <View style={styles.container}>
      <AddsBlock />
      <Animated.View
        style={[
          styles.gridContainer,
          useAnimatedStyle(() => ({
            transform: [{translateX: shakeAnimation.value}],
          })),
        ]}>
        {renderGrid()}
      </Animated.View>
      <View style={styles.bottomContainer}>
        {renderKeyboard()}
        <AnimatedPressable
          disabled={currentGuess.length < WORD_LENGTH}
          style={[styles.submitButton, submitButtonStyle]}
          onPress={() => {
            submitScaleAnimation.value = withSpring(0.8, {}, () => {
              submitScaleAnimation.value = withSpring(1);
            });
            runOnJS(handleSubmit)();
          }}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: WORD_LENGTH * 50,
    height: MAX_ATTEMPTS * 50,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  key: {
    width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  wideKey: {
    width: 70,
  },
  keyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WordleGame;
