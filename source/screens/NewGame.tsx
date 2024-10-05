import {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {NewGameProps} from '~/navigation/types';
import MenuButton from '~/components/MenuButton';
import CanvasBackground from '~/utils/canvas';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import IconButton from '~/components/IconButtons.tsx/IconButton';
import {colors} from '~/utils/colors';
import SelectNumber from '~/components/SelectorNumber';

function NewGameScreen({navigation}: NewGameProps) {
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<number>(5);
  const onStartGame = useCallback(() => {
    navigation.replace('WordGame', {
      maxAttempts: 6,
      wordLength: selected,
    });
  }, [navigation, selected]);

  return (
    <View style={styles.body}>
      <CanvasBackground />
      <View style={styles.header}>
        <Text style={styles.title}>{'NEW GAME'}</Text>
      </View>

      <View style={styles.bodyWrap}>
        <View style={styles.buttonsContainer}>
          <IconButton
            onPress={() => {
              setHowToPlayVisible(true);
            }}
          />
          <Text style={styles.subjectText}>{'Word Length:'}</Text>
          <SelectNumber selected={selected} setSelected={setSelected} />

          <Text style={styles.subjectText}>{'Category:'}</Text>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <MenuButton text="Start" onPress={onStartGame} color="#7FCCB570" />
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
  header: {paddingVertical: 20},
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
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#19273040',
    borderColor: '#77807F',
    borderWidth: 2,
    borderRadius: 10,
  },
  subjectText: {fontWeight: '700', fontSize: 20, padding: 10, paddingTop: 30},
  footerContainer: {
    width: '100%',
  },
});
export default NewGameScreen;
