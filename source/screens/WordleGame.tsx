import React, {
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
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
  LineHint,
  mergeHints,
  WordGuess,
  Correctness,
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

const {width} = Dimensions.get('window');

const GameBannerAd = () => {
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'YOUR_PRODUCTION_BANNER_AD_UNIT_ID';

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
};

const WordleGame: React.FC<WordGameScreenProps> = ({
  route: {
    params: {maxAttempts, wordLength, enableTimer = false},
  },
}) => {
  const initialState: GameState = {
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
  };

  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const {
    evaluateGuess,
    secretWord,
    generateSecretWord,
    hint: aboutWord,
  } = useSecretWord(wordLength);
  const {start, stop, reset} = useTimerStore();
  const {setScore, addScore, getScore, removeFromUserScore} = useScoreStore();
  const confettiRef = useRef<ConfettiOverlayRef>(null);
  const previousCorrectLetters = useRef<Set<string>>(new Set());
  const {isValidWord} = useWordValidator(wordLength);
  const navigation = useNavigation<WordleGameNavigationProp>();
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    if (enableTimer) {
      start();
    }
    return () => stop();
  }, [start, enableTimer, stop]);

  const handleNewGame = useCallback(() => {
    dispatch({type: 'RESET_GAME', wordLength, maxAttempts});
    if (enableTimer) {
      reset();
      start();
    }
    generateSecretWord();
    setScore(0);
    global.gc?.();
  }, [enableTimer, reset, start, generateSecretWord, setScore]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    return handleNewGame;
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
    [gameState.guesses, gameState.currentAttempt],
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
      const correctness = evaluateGuess(gameState.currentGuess.join(''));
      const currentLetters = [...gameState.currentGuess] as string[];

      dispatch({type: 'SUBMIT_GUESS', correctness, letters: currentLetters});

      const newCorrectLetters = currentLetters.filter(
        (letter, index) =>
          correctness[index] === 'correct' &&
          !previousCorrectLetters.current.has(letter),
      );
      newCorrectLetters.forEach(letter =>
        previousCorrectLetters.current.add(letter),
      );

      const secretWordRevealed = correctness.every(
        letter => letter === 'correct',
      );

      if (
        newCorrectLetters.length >= 3 &&
        newCorrectLetters.length < wordLength &&
        !secretWordRevealed
      ) {
        confettiRef.current?.triggerFeedback('spark');
      }

      addScore(newCorrectLetters.length);
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
        const savedRows = maxAttempts - gameState.currentAttempt - 1;
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
      <View style={styles.content}>
        <GameBannerAd />
        <TopBar displayTimer={enableTimer} />
        <GradientOverlayScrollView
          upperColor={'#343D4E'}
          bottomColor={'#3A4F6C'}
          gradientHeight={20}>
          <Animated.View
            style={[
              styles.gridContainer,
              useAnimatedStyle(() => ({
                transform: [{translateX: shakeAnimation.value}],
              })),
            ]}>
            <WordleGrid
              guesses={gameState.guesses}
              currentAttempt={gameState.currentAttempt}
              currentGuess={gameState.currentGuess}
              maxAttempts={maxAttempts}
              wordLength={wordLength}
              numberOfSavedRows={gameState.numberOfSavedRows}
              selectedLetter={gameState.selectedLetter}
              onLetterSelected={$setSelectedLetter}
              lineHint={finalLineHint}
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
    flex: 1,
    alignItems: 'center',
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
