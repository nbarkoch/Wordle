import {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react-native';
import {NewGameProps} from '~/navigation/types';
import MenuButton from '~/components/MenuButton';
import CanvasBackground from '~/utils/canvas';
import HowToPlayDialog from '~/components/dialogs/HowToPlayDialog';
import HowToPlayButton from '~/components/IconButtons/HowToPlayButton';
import {colors} from '~/utils/colors';
import GameSwitch from '~/components/new/GameSwitch';
import CategoryCubes from '~/components/new/CategoriyCubes';
import {Difficulty, GameCategory} from '~/utils/types';
import BackButton from '~/components/IconButtons/BackButton';
import {setColorOpacity} from '~/utils/ui';
import {saveGame} from '~/store/gameStorageState';
import VolumeButton from '~/components/IconButtons/VolumeButton';
import Selection from '~/components/Selection';
import {CATEGORIES, DIFFICULTIES, MAP_DIFFICULTY_NAME} from '~/utils/consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use a single key for storing all game settings
const GAME_SETTINGS_KEY = '@game_settings';

interface GameSettings {
  wordLength: number;
  category: GameCategory;
  difficulty: Difficulty;
  enableTimer: boolean;
}

// Default settings
const DEFAULT_SETTINGS: GameSettings = {
  wordLength: 5,
  category: 'GENERAL',
  difficulty: 'easy',
  enableTimer: false,
};

function NewGameScreen({navigation}: NewGameProps) {
  const [howToPlayVisible, setHowToPlayVisible] = useState<boolean>(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const eventDisabled = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {wordLength, category, difficulty, enableTimer} = settings;

  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(GAME_SETTINGS_KEY);

        if (savedSettings) {
          const parsedSettings: GameSettings = JSON.parse(savedSettings);

          const validatedSettings = {
            ...DEFAULT_SETTINGS,
            wordLength:
              Number(parsedSettings.wordLength) || DEFAULT_SETTINGS.wordLength,
            category: CATEGORIES.includes(parsedSettings.category)
              ? parsedSettings.category
              : DEFAULT_SETTINGS.category,
            difficulty: DIFFICULTIES.includes(parsedSettings.difficulty)
              ? parsedSettings.difficulty
              : DEFAULT_SETTINGS.difficulty,
            enableTimer: Boolean(parsedSettings.enableTimer),
          };

          setSettings(validatedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSettings();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prevSettings => ({...prevSettings, ...newSettings}));
  }, []);

  // Individual setters for improved readability
  const setWordLength = useCallback(
    (value: number) => updateSettings({wordLength: value}),
    [updateSettings],
  );

  const setCategory = useCallback(
    (value: GameCategory) => updateSettings({category: value}),
    [updateSettings],
  );

  const setDifficulty = useCallback(
    (value: Difficulty) => updateSettings({difficulty: value}),
    [updateSettings],
  );

  const setEnableTimer = useCallback(
    (value: boolean) => updateSettings({enableTimer: value}),
    [updateSettings],
  );

  const onStartGame = useCallback(async () => {
    if (eventDisabled.current) {
      return;
    }
    eventDisabled.current = true;

    try {
      await AsyncStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
      await saveGame('RANDOM', undefined);
    } catch (error) {
      console.error('Error saving in store', error);
    }

    navigation.replace('WordGame', {
      maxAttempts: 11 - wordLength,
      wordLength,
      displayTimer: enableTimer,
      category,
      difficulty,
      type: 'RANDOM',
    });
  }, [navigation, wordLength, enableTimer, category, difficulty, settings]);

  if (isLoading) {
    return (
      <View style={styles.body}>
        <CanvasBackground />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

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
            <GameSwitch onToggle={setEnableTimer} defaultValue={enableTimer} />
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
  loadingText: {
    color: colors.lightYellow,
    fontSize: 20,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
});

export default NewGameScreen;
