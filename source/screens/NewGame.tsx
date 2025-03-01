import {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {NewGameProps} from '~/navigation/types';
import MenuButton from '~/components/MenuButton';
import CanvasBackground from '~/utils/canvas';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import HowToPlayButton from '~/components/IconButtons/HowToPlayButton';
import {colors} from '~/utils/colors';
import GameSwitch from '~/components/GameSwitch';
import CategoryCubes from '~/components/CategoriyCubes';
import {Difficulty, GameCategory} from '~/utils/types';
import BackButton from '~/components/IconButtons/BackButton';
import {setColorOpacity} from '~/utils/ui';
import {saveGame} from '~/store/gameStorageState';
import VolumeButton from '~/components/IconButtons/VolumeButton';
import Selection from '~/components/Selection';
import {DIFFICULTIES, MAP_DIFFICULTY_NAME} from '~/utils/consts';

function NewGameScreen({navigation}: NewGameProps) {
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const [wordLength, setWordLength] = useState<number>(5);
  const [category, setCategory] = useState<GameCategory>('GENERAL');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [enableTimer, setEnableTimer] = useState<boolean>(false);
  const onStartGame = useCallback(() => {
    saveGame('RANDOM', undefined).then(() => {
      navigation.replace('WordGame', {
        maxAttempts: 11 - wordLength,
        wordLength,
        enableTimer,
        category,
        difficulty,
        type: 'RANDOM',
      });
    });
  }, [navigation, wordLength, enableTimer, category, difficulty]);

  return (
    <View style={styles.body}>
      <CanvasBackground />
      <View style={styles.header}>
        <View style={styles.centerer}>
          <BackButton />
        </View>
        <Text style={styles.title}>{'משחק חדש'}</Text>
        <View style={styles.centerer} />
      </View>
      <View style={styles.bodyWrap}>
        <ScrollView
          contentContainerStyle={styles.buttonsContainer}
          style={styles.buttons}>
          <View style={styles.iconAligner}>
            <View style={styles.pusher} />
            <VolumeButton />
            <HowToPlayButton
              onPress={() => {
                setHowToPlayVisible(true);
              }}
            />
          </View>

          <Text style={styles.subjectText}>{'רמת קושי: '}</Text>
          <Selection
            items={DIFFICULTIES.map($difficulty => ({
              value: $difficulty,
              label: MAP_DIFFICULTY_NAME[$difficulty],
            }))}
            selected={difficulty}
            setSelected={setDifficulty}
          />
          <Text style={styles.subjectText}>{'אורך מילה: '}</Text>
          <Selection
            items={[3, 4, 5].map(num => ({
              value: num,
              label: `${num}`,
            }))}
            selected={wordLength}
            setSelected={setWordLength}
          />
          <Text style={styles.subjectText}>{'הצג שעון עצר:'}</Text>
          <View style={styles.switch}>
            <GameSwitch onToggle={setEnableTimer} />
          </View>
          <Text style={styles.subjectText}>{'קטגוריה:'}</Text>
          <CategoryCubes category={category} setCategory={setCategory} />
        </ScrollView>
      </View>
      <View style={styles.footerContainer}>
        <MenuButton
          text="התחל"
          onPress={onStartGame}
          color={setColorOpacity(colors.green, 0.5)}
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
    width: '100%',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.lightYellow,
    fontSize: 23,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  bodyWrap: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttons: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.boxInfo.background,
    borderColor: colors.boxInfo.border,
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  subjectText: {
    textAlign: 'right',
    fontFamily: 'PloniDL1.1AAA-Bold',
    fontSize: 20,
    padding: 10,
    paddingTop: 30,
    color: colors.lightGrey,
  },
  footerContainer: {
    width: '100%',
  },
  switch: {
    borderRadius: 20,
    padding: 5,
    flexWrap: 'wrap',
  },
  centerer: {width: 50, alignItems: 'center'},
  iconAligner: {
    width: '100%',
    flexDirection: 'row',
    gap: 15,
  },
  pusher: {flex: 1},
});
export default NewGameScreen;
