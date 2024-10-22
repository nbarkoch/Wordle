import React, {
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import WordleGrid from '~/components/grid/WordleGrid';
import useWordValidator from '~/database/useWordValidator';
import Keyboard from '~/components/grid/Keyboard';
import useSecretWord from '~/database/useSecretWord';
import {
  calculateHintForLetter,
  giveHint,
  guessesInitialGridState,
  keyboardInitialKeysState,
  LetterCellLocation,
  mergeHints,
} from '~/utils/ui';
import GameResultDialog from '~/components/dialogs/GameResultDialog';
import TopBar from '~/components/grid/TopBar';
import {useTimerStore} from '~/store/useTimerStore';
import ConfettiOverlay, {
  ConfettiOverlayRef,
} from '~/components/ConfettiOverlay';
import {useScoreStore} from '~/store/useScore';
import {ROW_SAVED_DELAY} from '~/utils/consts';
import HintWordButton from '~/components/grid/HintWordsButton';
import SubmitButton from '~/components/grid/SubmitButton';
import AboutButton from '~/components/grid/AboutButton';
import {
  WordGameScreenProps,
  WordleGameNavigationProp,
} from '~/navigation/types';
import {useNavigation} from '@react-navigation/native';
import CanvasBackground from '~/utils/canvas';
import GradientOverlayScrollView from '~/components/GridScrollView';
import AboutWordDialog from '~/components/dialogs/AboutWordDialog';
import gameReducer, {GameState} from '~/gameReducer';
import showAppOpenAd from '~/components/ads/fullScreenAd';
import useSound from '~/useSound';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';

const {width} = Dimensions.get('window');

const WordleGame: React.FC<WordGameScreenProps> = ({
  route: {
    params: {
      maxAttempts,
      wordLength,
      enableTimer = false,
      category,
      difficulty,
    },
  },
}) => {
  const initialState: GameState = {
    correctLetters: Array(wordLength).fill(false),
    currentAttempt: 0,
    selectedLetter: {rowIndex: 0, colIndex: 0},
    currentGuess: [],
    guesses: guessesInitialGridState(maxAttempts, wordLength),
    keyboardLetters: keyboardInitialKeysState,
    isGameEnd: false,
    aboutShown: false,
    aboutWasShown: false,
    numberOfSavedRows: 0,
    gameStatus: 'PLAYING',
    isValidGuess: null,
    maxAttempts,
    wordLength,
  };
  const [recentReveals, setRecentReveals] = useState<boolean[]>(
    Array(wordLength).fill(false),
  );

  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const {
    evaluateGuess,
    secretWord,
    generateSecretWord,
    hint: aboutWord,
  } = useSecretWord(wordLength, category, difficulty);
  const {start, stop, reset} = useTimerStore();
  const {setScore, addScore, getScore, removeFromUserScore} = useScoreStore();
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const confettiRef = useRef<ConfettiOverlayRef>(null);
  const {isValidWord} = useWordValidator(wordLength);
  const navigation = useNavigation<WordleGameNavigationProp>();
  const shakeAnimation = useSharedValue(0);
  const {playSound: playSubmit} = useSound('submit.mp3');
  const {playSound: playWrong} = useSound('wrong.mp3');

  useEffect(() => {
    console.log(secretWord);
  }, [secretWord]);

  const resetGame = useCallback(() => {
    dispatch({type: 'RESET_GAME', wordLength, maxAttempts});
    reset();
    generateSecretWord();
    setScore(0);
    global.gc?.();
  }, [reset, generateSecretWord, setScore]);

  const handleNewGame = useCallback(() => {
    showAppOpenAd(start);
    resetGame();
    start();
  }, [resetGame]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleHowToPlay = useCallback(() => {
    setHowToPlayVisible(true);
  }, []);

  useEffect(() => {
    start();
    return resetGame;
  }, []);

  const onHintRequested = useCallback(async () => {
    giveHint(secretWord, gameState.guesses, gameState.lineHint).then(
      $lineHint => {
        removeFromUserScore(10);
        dispatch({
          type: 'SET_LINE_HINT',
          hint: mergeHints(gameState.lineHint, $lineHint),
        });
      },
    );
  }, [secretWord, gameState.guesses, gameState.lineHint, removeFromUserScore]);

  const finalLineHint = useMemo(() => {
    return mergeHints(
      gameState.selectedLetter?.rowIndex !== gameState.currentAttempt
        ? gameState.lineSearch
        : undefined,
      gameState.lineHint,
    );
  }, [
    gameState.selectedLetter?.rowIndex,
    gameState.currentAttempt,
    gameState.lineSearch,
    gameState.lineHint,
  ]);

  const $setSelectedLetter = useCallback(
    async ($selectedLetter: LetterCellLocation) => {
      dispatch({type: 'SET_SELECTED_LETTER', location: $selectedLetter});
      if (gameState.currentAttempt === $selectedLetter?.rowIndex) {
        dispatch({type: 'SET_LINE_SEARCH', search: undefined});
        return;
      }
      if ($selectedLetter) {
        const $lineSearch = await calculateHintForLetter(
          gameState.guesses,
          $selectedLetter,
        );
        dispatch({type: 'SET_LINE_SEARCH', search: $lineSearch});
      } else {
        dispatch({type: 'SET_LINE_SEARCH', search: undefined});
      }
    },
    [gameState.guesses],
  );

  const onInfoRequested = useCallback(async () => {
    dispatch({type: 'SET_ABOUT_SHOWN', shown: true});
    if (!gameState.aboutWasShown) {
      dispatch({type: 'SET_ABOUT_WAS_SHOWN'});
      removeFromUserScore(5);
    }
  }, [removeFromUserScore, gameState.aboutWasShown]);

  const handleKeyPress = useCallback((key: string) => {
    dispatch({type: 'KEY_PRESS', key});
  }, []);

  const handleDelete = useCallback(() => {
    dispatch({type: 'DELETE_LETTER'});
  }, []);

  const handleSubmit = useCallback(() => {
    if (
      gameState.isValidGuess &&
      gameState.currentGuess.every(letter => letter !== undefined)
    ) {
      playSubmit();
      const correctness = evaluateGuess(gameState.currentGuess.join(''));
      const currentLetters = [...gameState.currentGuess] as string[];
      const correctLetters = [...gameState.correctLetters];
      const reveal = Array(wordLength).fill(false);

      currentLetters.forEach((_, index) => {
        const newReveal =
          correctness[index] === 'correct' && !correctLetters[index];
        if (newReveal) {
          reveal[index] = true;
          correctLetters[index] = true;
        }
        return newReveal;
      });

      const secretWordRevealed = correctness.every(
        letter => letter === 'correct',
      );
      const newRevealLength = reveal.filter(Boolean).length;

      if (
        newRevealLength >= 3 &&
        newRevealLength < wordLength &&
        !secretWordRevealed
      ) {
        confettiRef.current?.triggerFeedback('spark');
      }

      setRecentReveals(reveal);
      addScore(newRevealLength);

      dispatch({
        type: 'SUBMIT_GUESS',
        correctness,
        letters: currentLetters,
        correctLetters: correctLetters,
      });

      if (secretWordRevealed) {
        dispatch({type: 'END_GAME', status: 'SUCCESS'});
        stop();
        const delayConfetti = setTimeout(() => {
          confettiRef.current?.triggerFeedback('party');
          clearTimeout(delayConfetti);
        }, 400);
      } else if (gameState.currentAttempt + 1 === maxAttempts) {
        dispatch({type: 'END_GAME', status: 'FAILURE'});
        stop();
      }
    } else {
      playWrong();
      shakeAnimation.value = withSequence(
        withTiming(-5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(-5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(5, {duration: 50, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 50, easing: Easing.inOut(Easing.quad)}),
      );
    }
  }, [
    gameState,
    evaluateGuess,
    wordLength,
    maxAttempts,
    addScore,
    stop,
    shakeAnimation,
  ]);

  useEffect(() => {
    const guessStr = gameState.currentGuess.join('');
    if (guessStr.length === wordLength) {
      dispatch({type: 'SET_VALID_GUESS', isValid: isValidWord(guessStr)});
    } else {
      dispatch({type: 'SET_VALID_GUESS', isValid: null});
    }
  }, [isValidWord, gameState.currentGuess, wordLength]);
  useEffect(() => {
    if (gameState.gameStatus !== 'PLAYING') {
      const timeout = setTimeout(() => {
        const savedRows = maxAttempts - gameState.currentAttempt;
        dispatch({type: 'SET_NUMBER_OF_SAVED_ROWS', number: savedRows});
        const endTimeout = setTimeout(() => {
          dispatch({type: 'SET_GAME_END', isEnd: true});
          clearTimeout(endTimeout);
        }, ROW_SAVED_DELAY * savedRows + 500);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [gameState.gameStatus, gameState.currentAttempt, maxAttempts]);

  return (
    <View style={styles.container}>
      <CanvasBackground />
      <View style={[styles.content]}>
        <TopBar
          displayTimer={enableTimer}
          onGoHome={handleGoHome}
          onHowToPlay={handleHowToPlay}
        />
        <GradientOverlayScrollView
          upperColor={'#343D4E'}
          bottomColor={'#3A4F6C'}
          gradientHeight={20}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
          }}>
          <Animated.View
            style={[
              styles.gridContainer,
              useAnimatedStyle(() => ({
                transform: [{translateX: shakeAnimation.value}],
              })),
            ]}>
            <WordleGrid
              gameState={gameState}
              onLetterSelected={$setSelectedLetter}
              lineHint={finalLineHint}
              recentReveals={recentReveals}
            />
          </Animated.View>
        </GradientOverlayScrollView>
        <View style={styles.bottomContainer}>
          <Keyboard
            disabled={
              gameState.selectedLetter.rowIndex !== gameState.currentAttempt
            }
            handleKeyPress={handleKeyPress}
            handleDelete={handleDelete}
            keyboardLetters={gameState.keyboardLetters}
            disableDelete={
              gameState.selectedLetter.colIndex === 0 &&
              gameState.currentGuess[0] === undefined
            }
          />
          <View style={styles.footer}>
            <View style={styles.centerer}>
              <AboutButton
                displayOverlay={!gameState.aboutWasShown}
                onInfoRequested={onInfoRequested}
                scoreCost={5}
              />
            </View>
            <SubmitButton
              handleSubmit={handleSubmit}
              isValidGuess={gameState.isValidGuess}
            />
            <View style={styles.centerer}>
              <HintWordButton
                displayOverlay={true}
                onHintRequested={onHintRequested}
                scoreCost={10}
              />
            </View>
          </View>
        </View>
        <ConfettiOverlay ref={confettiRef} />
        <HowToPlayDialog
          onClose={() => setHowToPlayVisible(false)}
          isVisible={howToPlayVisible}
        />
        <AboutWordDialog
          isVisible={gameState.aboutShown && !gameState.isGameEnd}
          onClose={() => dispatch({type: 'SET_ABOUT_SHOWN', shown: false})}
          hint={aboutWord}
        />
        <GameResultDialog
          isVisible={gameState.isGameEnd}
          isSuccess={gameState.gameStatus === 'SUCCESS'}
          onNewGame={handleNewGame}
          onGoHome={handleGoHome}
          currentScore={getScore()}
          secretWord={secretWord}
          hint={aboutWord}
          category={category}
          difficulty={difficulty}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderColor: 'white',
    borderRadius: 20,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  content: {
    paddingTop: 10,
    flex: 1,
  },
  footer: {
    width: width,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WordleGame;
