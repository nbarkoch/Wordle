import {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import React from 'react-native';
import {HomeScreenProps} from '~/navigation/types';
import MenuButton from '~/components/MenuButton';
import HowToPlayButton from '~/components/IconButtons/HowToPlayButton';
import ProfileIconButton from '~/components/IconButtons/ProfileButton';
import CanvasBackground from '~/utils/canvas';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import SpecialButton from '~/components/SpecialButton';
import {setColorOpacity} from '~/utils/ui';
import {colors} from '~/utils/colors';
import CoinCostOverlay from '~/components/grid/CoinCostOverlay';
import {useScoreStore} from '~/store/useScore';
import {useDailyGameStore} from '~/store/dailyGameStatus';
import VolumeButton from '~/components/IconButtons/VolumeButton';
import {GameStorageState, loadGame, saveGame} from '~/store/gameStorageState';
import {useFocusEffect} from '@react-navigation/native';
import AnimatedLetterCubes from '~/components/AnimatedCubes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTutorialStore} from '~/store/tutorialStore';
import {GameType} from '~/utils/types';
import {initialState} from '~/gameReducer';
import SlidingText from '~/components/overview/SlidingText';

async function loadTimer(gameType: GameType): Promise<number> {
  const timeStr = await AsyncStorage.getItem(`@time_${gameType}`);
  if (timeStr) {
    const time = +timeStr;
    return isNaN(time) ? 0 : time;
  }
  return 0;
}

function HomeScreen({navigation}: HomeScreenProps) {
  const {isDone, checkDaily} = useDailyGameStore();
  const isTutorialDone = useTutorialStore(state => state.isDone);

  const [storageStates, setStorageStates] = useState<{
    random?: GameStorageState;
    daily?: GameStorageState;
  }>({});

  useFocusEffect(
    useCallback(() => {
      let isBusy = true;

      const checkDailyStatus = async () => {
        if (isBusy) {
          await checkDaily();
          const randomGameState = await loadGame('RANDOM');
          const dailyGameState = await loadGame('DAILY');
          setStorageStates({random: randomGameState, daily: dailyGameState});
        }
      };

      const checkIsTutorialDone = async () => {
        if (isBusy) {
          const tutorialWasDone = await isTutorialDone();
          if (!tutorialWasDone) {
            await saveGame('RANDOM', {
              gameState: initialState,
              category: 'GENERAL',
              difficulty: 'easy',
              secretWord: 'מלכות',
              aboutWord: 'שלטון של מלך או מלכה',
            });
            navigation.navigate('Tutorial');
          }
        }
      };

      checkDailyStatus();
      checkIsTutorialDone();
      return () => (isBusy = false);
    }, [checkDaily, isTutorialDone, navigation]),
  );

  const onNewGame = useCallback(async () => {
    navigation.navigate('NewGame');
  }, [navigation]);

  const onContinueGame = useCallback(async () => {
    if (storageStates.random) {
      const {gameState, displayTimer, category, difficulty} =
        storageStates.random;
      const startTime = await loadTimer('RANDOM');
      navigation.navigate('WordGame', {
        maxAttempts: gameState.maxAttempts,
        wordLength: gameState.wordLength,
        displayTimer,
        category,
        difficulty,
        type: 'RANDOM',
        savedGameState: gameState,
        startTime,
      });
    }
  }, [navigation, storageStates.random]);

  const onDailyGame = useCallback(async () => {
    const startTime = await loadTimer('DAILY');
    navigation.navigate('WordGame', {
      maxAttempts: 6,
      wordLength: 5,
      displayTimer: false,
      category: 'GENERAL',
      difficulty: 'easy',
      type: 'DAILY',
      savedGameState: storageStates.daily?.gameState,
      startTime,
    });
  }, [navigation, storageStates.daily]);

  const onUserInfo = useCallback(() => {
    navigation.navigate('UserInfo', {user: ''});
  }, [navigation]);

  const {userScore} = useScoreStore();

  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  return (
    <View style={styles.body}>
      <CanvasBackground />

      <View style={styles.headerLine}>
        <View style={styles.controlsContainer}>
          <HowToPlayButton onPress={() => setHowToPlayVisible(true)} />
          <VolumeButton />
        </View>
        <View>
          <CoinCostOverlay scoreCost={userScore} />
          <ProfileIconButton onPress={onUserInfo} />
        </View>
      </View>

      <View style={styles.header}>
        <AnimatedLetterCubes />
        <SlidingText />
      </View>
      <View style={styles.body}>
        <MenuButton
          disabled={storageStates.random === undefined}
          text={'המשך משחק'}
          onPress={onContinueGame}
          color={setColorOpacity(
            storageStates.random === undefined
              ? colors.grey
              : colors.mediumGreen,
            0.7,
          )}
        />
        <MenuButton
          text={'משחק חדש'}
          onPress={onNewGame}
          color={setColorOpacity(colors.green, 0.7)}
        />
        <SpecialButton
          disabled={isDone}
          text="חידה יומית"
          onPress={onDailyGame}
          color={setColorOpacity(isDone ? colors.grey : colors.blue, 0.5)}
        />
      </View>
      <HowToPlayDialog
        onClose={() => setHowToPlayVisible(false)}
        isVisible={howToPlayVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    paddingTop: 25,
    alignItems: 'center',
  },
  adjustment: {transform: [{scale: 1}]},
  controlsContainer: {flexDirection: 'row', gap: 20},
});
export default HomeScreen;
