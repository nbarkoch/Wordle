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

function HomeScreen({navigation}: HomeScreenProps) {
  const {isDone, checkDaily} = useDailyGameStore();

  useEffect(() => {
    checkDaily();
  }, [checkDaily]);

  const onNewGame = useCallback(() => {
    navigation.navigate('NewGame');
  }, [navigation]);

  const onLetterGame = useCallback(() => {
    navigation.navigate('LetterGame');
  }, [navigation]);

  const onDailyGame = useCallback(() => {
    navigation.navigate('WordGame', {
      maxAttempts: 6,
      wordLength: 5,
      enableTimer: false,
      category: 'GENERAL',
      difficulty: 'easy',
      type: 'DAILY',
    });
  }, [navigation]);

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
        <SkiaGradientText title="ורדל" />
      </View>
      <View style={styles.body}>
        <MenuButton
          text="משחק חדש"
          onPress={onNewGame}
          color={setColorOpacity(colors.green, 0.7)}
        />
        <MenuButton
          text="אות סודית"
          onPress={onLetterGame}
          color={setColorOpacity(colors.lightBlue, 0.7)}
        />
        <SpecialButton
          disabled={isDone}
          text="מילה יומית"
          onPress={onDailyGame}
          color={setColorOpacity(isDone ? colors.grey : colors.red, 0.45)}
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
    padding: 40,
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
