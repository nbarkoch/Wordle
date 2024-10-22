import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import React from 'react-native';
import {HomeScreenProps} from '~/navigation/types';
import SkiaGradientText from '~/components/WordleParagraph';
import MenuButton from '~/components/MenuButton';
import IconButton from '~/components/IconButtons/IconButton';
import ProfileIconButton from '~/components/IconButtons/ProfileButton';
import CanvasBackground from '~/utils/canvas';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import SpecialButton from '~/components/SpecialButton';
import {setColorOpacity} from '~/utils/ui';
import {colors} from '~/utils/colors';
import CoinCostOverlay from '~/components/grid/CoinCostOverlay';
import {useScoreStore} from '~/store/useScore';
import {useDailyGameStore} from '~/store/dailyGameStatus';

function HomeScreen({navigation}: HomeScreenProps) {
  const {isDone, checkDaily} = useDailyGameStore();

  useEffect(() => {
    checkDaily();
  }, [checkDaily]);

  const onNewGame = useCallback(() => {
    navigation.navigate('NewGame');
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
      <View style={styles.header}>
        <SkiaGradientText />
      </View>
      <View style={styles.headerLine}>
        <IconButton
          onPress={() => {
            setHowToPlayVisible(true);
          }}
        />
        <View>
          <CoinCostOverlay scoreCost={userScore} />
          <ProfileIconButton onPress={onUserInfo} />
        </View>
      </View>
      <View style={styles.body}>
        <MenuButton
          text="משחק חדש"
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
    padding: 30,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});
export default HomeScreen;
