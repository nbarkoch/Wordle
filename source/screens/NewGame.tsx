import {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {NewGameProps} from '~/navigation/types';
import MenuButton from '~/components/MenuButton';
import CanvasBackground from '~/utils/canvas';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import IconButton from '~/components/IconButtons/IconButton';
import {colors} from '~/utils/colors';
import SelectNumber from '~/components/SelectorNumber';
import GameSwitch from '~/components/GameSwitch';
import CategoryCubes from '~/components/CategoriyCubes';
import {Difficulty, GameCategory} from '~/utils/types';
import SelectDifficulty from '~/components/SelectDifficulty';
import BackButton from '~/components/IconButtons/BackButton';

function NewGameScreen({navigation}: NewGameProps) {
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const [wordLength, setWordLength] = useState<number>(5);
  const [category, setCategory] = useState<GameCategory>('ALL');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [enableTimer, setEnableTimer] = useState<boolean>(false);
  const onStartGame = useCallback(() => {
    navigation.replace('WordGame', {
      maxAttempts: 11 - wordLength,
      wordLength,
      enableTimer,
      category,
      difficulty,
    });
  }, [navigation, wordLength, enableTimer, category, difficulty]);

  return (
    <View style={styles.body}>
      <CanvasBackground />
      <View style={styles.header}>
        <View style={{width: 50, alignItems: 'center'}}>
          <BackButton />
        </View>
        <Text style={styles.title}>{'משחק חדש'}</Text>
        <View style={{width: 50, alignItems: 'center'}}></View>
      </View>
      <View style={styles.bodyWrap}>
        <ScrollView
          contentContainerStyle={styles.buttonsContainer}
          style={styles.buttons}>
          <View
            style={{
              width: '100%',
              alignItems: 'flex-end',
            }}>
            <IconButton
              onPress={() => {
                setHowToPlayVisible(true);
              }}
            />
          </View>
          <Text style={styles.subjectText}>{'רמת קושי: '}</Text>
          <SelectDifficulty selected={difficulty} setSelected={setDifficulty} />
          <Text style={styles.subjectText}>{'אורך מילה: '}</Text>
          <SelectNumber selected={wordLength} setSelected={setWordLength} />
          <Text style={styles.subjectText}>{'הצג שעון עצר:'}</Text>
          <View style={styles.switch}>
            <GameSwitch onToggle={setEnableTimer} />
          </View>
          <Text style={styles.subjectText}>{'קטגוריה:'}</Text>
          <CategoryCubes category={category} setCategory={setCategory} />
        </ScrollView>
      </View>
      <View style={styles.footerContainer}>
        <MenuButton text="התחל" onPress={onStartGame} color="#7FCCB570" />
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
    fontWeight: '900',
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
    borderColor: '#77807F',
    backgroundColor: '#19273040',
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  subjectText: {
    textAlign: 'right',
    fontWeight: '700',
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
});
export default NewGameScreen;
