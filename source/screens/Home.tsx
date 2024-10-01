import {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import React from 'react-native';
import {HomeScreenProps} from '~/navigation/types';
import SkiaGradientText from '~/components/WordleParagraph';
import MenuButton from '~/components/MenuButton';
import IconButton from '~/components/IconButton';
import ProfileIconButton from '~/components/IconButtons.tsx/ProfileButton';
import CanvasBackground from '~/utils/canvas';

function HomeScreen({navigation}: HomeScreenProps) {
  const onNewGame = useCallback(() => {
    navigation.navigate('WordGame', {maxAttempts: 6, wordLength: 5});
  }, [navigation]);
  return (
    <View style={styles.body}>
      <CanvasBackground />
      <View style={styles.header}>
        <SkiaGradientText width={300} height={50} />
      </View>

      <View style={styles.headerLine}>
        <ProfileIconButton onPress={onNewGame} />
        <IconButton onPress={onNewGame} />
      </View>
      <View style={styles.body}>
        <MenuButton text="New Game" onPress={onNewGame} color="#7FCCB550" />
        <MenuButton text="Daily Task" onPress={onNewGame} color="#F47A8950" />
      </View>
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
