import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import React from 'react-native';
import {HomeScreenProps} from '~/navigation/types';
import SkiaGradientText from '~/components/TitleParagraph';
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
import {GameStorageState, loadGame} from '~/store/gameStorageState';
import {useFocusEffect} from '@react-navigation/native';
import AnimatedLetterCubes from '~/components/AnimatedCubes';

function HomeScreen({navigation}: HomeScreenProps) {
  const {isDone, checkDaily} = useDailyGameStore();

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

      checkDailyStatus();
      return () => (isBusy = false);
    }, [checkDaily]),
  );

  const onNewGame = useCallback(async () => {
    if (storageStates.random) {
      const {gameState, enableTimer, category, difficulty} =
        storageStates.random;
      navigation.navigate('WordGame', {
        maxAttempts: gameState.maxAttempts,
        wordLength: gameState.wordLength,
        enableTimer,
        category,
        difficulty,
        type: 'RANDOM',
        savedGameState: gameState,
      });
    } else {
      navigation.navigate('NewGame');
    }
  }, [navigation, storageStates.random]);

  const onDailyGame = useCallback(async () => {
    navigation.navigate('WordGame', {
      maxAttempts: 6,
      wordLength: 5,
      enableTimer: false,
      category: 'GENERAL',
      difficulty: 'easy',
      type: 'DAILY',
      savedGameState: storageStates.daily?.gameState,
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
        <View style={{flexDirection: 'row', gap: 20}}>
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
        <SkiaGradientText title="משחק ניחוש מילים בעברית" />
      </View>
      <View style={styles.body}>
        <MenuButton
          text={storageStates.random === undefined ? 'משחק חדש' : 'המשך משחק'}
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
});
export default HomeScreen;
