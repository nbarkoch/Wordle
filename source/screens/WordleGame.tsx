import React, {
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Vibration,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import WordleGrid from '~/components/grid/WordleGrid';
import useWordValidator from '~/store/useWordValidator';
import Keyboard from '~/components/grid/Keyboard';
import useSecretWord, {evaluateGuess} from '~/store/useSecretWord';
import {
  calculateHintForLetter,
  giveHint,
  guessesInitialGridState,
  keyboardInitialKeysState,
  LetterCellLocation,
  mergeHints,
} from '~/utils/words';
import GameResultDialog from '~/components/dialogs/GameResultDialog';
import TopBar from '~/components/grid/TopBar';
import {useTimerStore} from '~/store/useTimerStore';
import ConfettiOverlay, {
  ConfettiOverlayRef,
} from '~/components/ConfettiOverlay';
import {useScoreStore} from '~/store/useScore';
import {
  MAP_CATEGORY_NAME,
  MAP_DIFFICULTY_NAME,
  ROW_SAVED_DELAY,
} from '~/utils/consts';
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
import useSound from '~/useSound';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import {useDailyGameStore} from '~/store/dailyGameStatus';
import {showGameRestartAd} from '~/components/ads/fullScreenAd';
import GameTypeIndicator from '~/components/GameTypeIndicator';
import {saveGame} from '~/store/gameStorageState';
import {colors} from '~/utils/colors';

const {width} = Dimensions.get('window');

const smallVibration = () => {
  Vibration.vibrate([2, 2]);
};

const WordleGame: React.FC<WordGameScreenProps> = ({
  route: {
    params: {
      maxAttempts,
      wordLength,
      enableTimer = false,
      category,
      difficulty,
      type: gameType,
      savedGameState,
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
    score: 0,
  };
  const [recentReveals, setRecentReveals] = useState<boolean[]>(
    Array(wordLength).fill(false),
  );

  const [gameState, dispatch] = useReducer(
    gameReducer,
    savedGameState ?? initialState,
  );

  const {secretWord, aboutWord, generateSecretWord} = useSecretWord(
    wordLength,
    category,
    difficulty,
    gameType,
  );

  const {markDone} = useDailyGameStore();

  const {start, stop, reset} = useTimerStore();
  const {setScore, addScore, getScore, removeFromUserScore} = useScoreStore();
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const confettiRef = useRef<ConfettiOverlayRef>(null);
  const {isValidWord} = useWordValidator(wordLength);
  const navigation = useNavigation<WordleGameNavigationProp>();
  const shakeAnimation = useSharedValue(0);
  const {playSound: playSubmit} = useSound('submit.mp3');
  const {playSound: playWrong} = useSound('wrong.mp3');
  const gridScrollViewRef = useRef<ScrollView>(null);

  const currentWordGuess = useMemo(
    () => gameState.currentGuess.join(''),
    [gameState.currentGuess],
  );

  useEffect(() => {
    console.log(secretWord.split('').reverse().join(''));
  }, [secretWord]);

  useEffect(() => {
    if (gameState.gameStatus === 'PLAYING') {
      saveGame(gameType, {
        gameState,
        category,
        difficulty,
        secretWord,
        aboutWord,
      });
    } else {
      saveGame(gameType, undefined);
    }
  }, [gameState, secretWord, difficulty, category, gameType]);

  const resetGame = useCallback(() => {
    dispatch({type: 'RESET_GAME', wordLength, maxAttempts});
    reset();
    generateSecretWord();
    setRecentReveals(Array(wordLength).fill(false));
    gridScrollViewRef?.current?.scrollTo({y: 0});
    setScore(0);
    global.gc?.();
  }, [wordLength, maxAttempts, reset, generateSecretWord, setScore]);

  const handleNewGame = useCallback(() => {
    showGameRestartAd(() => {
      reset();
      start();
    });
    start();
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleHowToPlay = useCallback(() => {
    setHowToPlayVisible(true);
  }, []);

  useEffect(() => {
    start();
    setScore(gameState.score);
    return resetGame;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    [gameState.currentAttempt, gameState.guesses],
  );

  const onInfoRequested = useCallback(async () => {
    dispatch({type: 'SET_ABOUT_SHOWN', shown: true});
    if (!gameState.aboutWasShown) {
      dispatch({type: 'SET_ABOUT_WAS_SHOWN'});
      removeFromUserScore(5);
    }
  }, [removeFromUserScore, gameState.aboutWasShown]);

  const handleKeyPress = useCallback((key: string) => {
    requestAnimationFrame(() => dispatch({type: 'KEY_PRESS', key}));
    smallVibration();
  }, []);

  const handleDelete = useCallback(() => {
    dispatch({type: 'DELETE_LETTER'});
    smallVibration();
  }, []);

  const handleSubmit = useCallback(() => {
    if (gameState.isValidGuess && currentWordGuess.length === wordLength) {
      playSubmit();
      const correctness = evaluateGuess(currentWordGuess, secretWord);
      const currentLetters = [...gameState.currentGuess] as string[];
      const correctLetters = [...gameState.correctLetters];
      const reveal = Array<boolean>(wordLength).fill(false);

      currentLetters.forEach((_, index) => {
        const isNewReveal =
          correctness[index] === 'correct' && !correctLetters[index];
        if (isNewReveal) {
          reveal[index] = true;
          correctLetters[index] = true;
        }
        return isNewReveal;
      });

      const isSecretWordRevealed = correctness.every(
        correctness => correctness === 'correct',
      );
      const newRevealLength = reveal.filter(Boolean).length;

      if (
        newRevealLength >= 3 &&
        newRevealLength < wordLength &&
        !isSecretWordRevealed
      ) {
        confettiRef.current?.triggerFeedback('spark');
      }

      setRecentReveals(reveal);
      addScore(newRevealLength);

      requestAnimationFrame(() => {
        dispatch({
          type: 'SUBMIT_GUESS',
          correctness,
          letters: currentLetters,
          correctLetters: correctLetters,
          addedScore: newRevealLength,
        });
      });

      if (isSecretWordRevealed) {
        if (gameType === 'DAILY') {
          markDone();
        }
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
    gameState.isValidGuess,
    currentWordGuess,
    gameState.correctLetters,
    gameState.currentAttempt,
    playSubmit,
    evaluateGuess,
    wordLength,
    addScore,
    maxAttempts,
    gameType,
    stop,
    markDone,
    playWrong,
    shakeAnimation,
  ]);

  useEffect(() => {
    if (currentWordGuess.length === wordLength) {
      dispatch({
        type: 'SET_VALID_GUESS',
        isValid: isValidWord(currentWordGuess),
      });
    } else {
      dispatch({type: 'SET_VALID_GUESS', isValid: null});
    }
  }, [isValidWord, currentWordGuess, wordLength]);
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
        <GameTypeIndicator
          title={
            gameType === 'RANDOM'
              ? `${MAP_CATEGORY_NAME[category]} (${MAP_DIFFICULTY_NAME[difficulty]})`
              : 'חידה יומית'
          }
        />
        <GradientOverlayScrollView
          ref={gridScrollViewRef}
          upperColor={colors.primary.b}
          bottomColor={colors.primary.c}
          gradientHeight={20}
          contentContainerStyle={styles.scrollViewContent}>
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
              gameState.selectedLetter.rowIndex !== gameState.currentAttempt ||
              gameState.gameStatus !== 'PLAYING'
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
                clicked={gameState.aboutWasShown}
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
          gameType={gameType}
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
    width: '100%',
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
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
