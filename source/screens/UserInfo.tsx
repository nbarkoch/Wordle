// UserInfo.tsx
import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {Difficulty, GameCategory} from '~/utils/types';
import {getRevealedWords, WordSection} from '~/store/revealsStore';
import BackButton from '~/components/IconButtons/BackButton';
import CanvasBackground from '~/utils/canvas';
import {colors} from '~/utils/colors';
import {CategorySelector} from '~/components/overview/CategorySelector';
import {WordCard} from '~/components/overview/WordCard';
import AboutWordDialog from '~/components/dialogs/AboutWordDialog';
import {MAP_CATEGORY_NAME, MAP_DIFFICULTY_NAME} from '~/utils/consts';
import {OutlinedText} from '~/components/CartoonText';

const LoadingFallback = () => (
  <View style={styles.loading}>
    <Text style={styles.loadingText}>{'טוען..'}</Text>
    <ActivityIndicator
      size="large"
      color="#ffffff80"
      style={{transform: [{scale: 1.5}]}}
    />
  </View>
);

export default function UserInfo() {
  const {width: windowWidth} = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<GameCategory>('GENERAL');
  const [aboutWord, setAboutWord] = useState<null | string>(null);
  const [wordsOverview, setWordsOverview] = useState<WordSection>({
    easy: [],
    medium: [],
    hard: [],
  });

  const categories = useMemo<Array<{title: string; key: GameCategory}>>(
    () => [
      {title: MAP_CATEGORY_NAME.GENERAL, key: 'GENERAL'},
      {title: MAP_CATEGORY_NAME.ANIMALS, key: 'ANIMALS'},
      {title: MAP_CATEGORY_NAME.GEOGRAPHY, key: 'GEOGRAPHY'},
      {title: MAP_CATEGORY_NAME.SCIENCE, key: 'SCIENCE'},
      {title: MAP_CATEGORY_NAME.SPORT, key: 'SPORT'},
    ],
    [],
  );

  const colorMapperLight: Record<Difficulty, string> = {
    easy: colors.lightGreen,
    medium: colors.lightYellow,
    hard: colors.lightRed,
  };

  const colorMapper: Record<Difficulty, string> = {
    easy: colors.green,
    medium: colors.yellow,
    hard: colors.red,
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      const words = await getRevealedWords(activeCategory);
      setTimeout(async () => {
        setWordsOverview(words);
        setIsLoading(false);
      }, 500);
    };
    loadWords();
  }, [activeCategory]);

  const shouldScroll = categories.length * 80 > windowWidth - 40;

  return (
    <View style={styles.screen}>
      <CanvasBackground />
      <View style={styles.header}>
        <View style={styles.headerButton}>
          <BackButton />
        </View>
        <Text style={styles.title}>הישגי משתמש</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.bodyWrap}>
        <View style={styles.container}>
          <CategorySelector
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            shouldScroll={shouldScroll}
          />
          {isLoading ? (
            <LoadingFallback />
          ) : (
            <ScrollView
              style={styles.wordsScroll}
              contentContainerStyle={styles.wordsContainer}>
              {Object.entries(wordsOverview).map(([difficulty, words]) => (
                <View key={`${activeCategory}-${difficulty}`}>
                  {words.length > 0 && (
                    <View style={styles.levelTitle}>
                      <View
                        style={[
                          styles.difficultyContainer,
                          {
                            backgroundColor:
                              colorMapperLight[difficulty as Difficulty],
                          },
                        ]}>
                        <OutlinedText
                          text={MAP_DIFFICULTY_NAME[difficulty as Difficulty]}
                          fontSize={22}
                          width={300}
                          height={40}
                          fillColor={colors.white}
                          strokeColor={colorMapper[difficulty as Difficulty]}
                          strokeWidth={6}
                        />
                      </View>
                    </View>
                  )}
                  <View style={styles.cards}>
                    {words.map(({word, time, score, hint}) => (
                      <WordCard
                        key={word}
                        word={word}
                        time={time}
                        score={score}
                        onPress={() => setAboutWord(hint)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
      <AboutWordDialog
        isVisible={aboutWord !== null}
        onClose={() => setAboutWord(null)}
        hint={aboutWord || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 50,
    alignItems: 'center',
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
  container: {
    flex: 1,
    width: '100%',
    borderColor: '#77807F',
    backgroundColor: '#19273080',
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  wordsScroll: {
    flex: 1,
  },
  wordsContainer: {
    paddingVertical: 10,
  },
  levelTitle: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyContainer: {
    margin: 5,
    borderRadius: 20,
  },
  cards: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center', // This centers the cards
    alignItems: 'center',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    backgroundColor: '#00000025',
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: '#fffffff0',
    fontFamily: 'PloniDL1.1AAA-Bold',
    fontSize: 20,
  },
});
