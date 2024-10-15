import {useCallback, useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
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

const {width, height} = Dimensions.get('window');

function HomeScreen({navigation}: HomeScreenProps) {
  const onNewGame = useCallback(() => {
    navigation.navigate('NewGame');
  }, [navigation]);

  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  return (
    <View style={styles.body}>
      <CanvasBackground />
      <View style={styles.header}>
        <SkiaGradientText width={300} height={50} />
      </View>
      <View style={styles.headerLine}>
        <ProfileIconButton onPress={onNewGame} />
        <IconButton
          onPress={() => {
            setHowToPlayVisible(true);
          }}
        />
      </View>
      <View style={styles.body}>
        <MenuButton
          text="New Game"
          onPress={onNewGame}
          color={setColorOpacity(colors.green, 0.7)}
        />
        <SpecialButton
          text="Daily Task"
          onPress={onNewGame}
          color={setColorOpacity(colors.blue, 0.5)}
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
