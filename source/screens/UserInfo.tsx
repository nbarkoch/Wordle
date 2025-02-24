import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import {GameCategory} from '~/utils/types';
import {
  createDisplayEmptyHierarchy,
  getRevealsAndTotals,
  WordDisplayHierarchy,
} from '~/store/revealsStore';
import BackButton from '~/components/IconButtons/BackButton';
import CanvasBackground from '~/utils/canvas';
import {colors} from '~/utils/colors';
import {CategorySelector} from '~/components/overview/CategorySelector';
import AboutWordDialog from '~/components/dialogs/AboutWordDialog';
import {MAP_CATEGORY_NAME} from '~/utils/consts';
import WordsSectionsList from '~/components/overview/WordsSectionsList';
import ProfileStats from '~/components/overview/ProfileStats';

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
  const [wordsOverview, setWordsOverview] = useState<WordDisplayHierarchy>(
    createDisplayEmptyHierarchy(),
  );

  const categories = useMemo<Array<{title: string; key: GameCategory}>>(
    () =>
      Object.entries(wordsOverview)
        .filter(
          ([_, value]) =>
            value.easy.reveals.length +
              value.medium.reveals.length +
              value.hard.reveals.length >
            0,
        )
        .map(([key, _]) => {
          const $key = key as GameCategory;
          return {
            title: MAP_CATEGORY_NAME[$key],
            key: $key,
          };
        }),
    [wordsOverview],
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      const revealsAndTotals = await getRevealsAndTotals();
      setWordsOverview(revealsAndTotals);
      setIsLoading(false);
    };
    loadWords();
  }, []);

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
        <ProfileStats wordsOverview={wordsOverview} isLoading={isLoading} />
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
            <WordsSectionsList
              wordsOverview={wordsOverview}
              activeCategory={activeCategory}
              onWordPress={setAboutWord}
            />
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
    alignItems: 'center',
  },
  cards: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    color: colors.white,
    fontFamily: 'PloniDL1.1AAA-Bold',
    fontSize: 20,
  },
});
