// UserInfo.tsx
import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {GameCategory} from '~/utils/types';
import {getRevealedWords, RevealedWordOverview} from '~/store/revealsStore';
import BackButton from '~/components/IconButtons/BackButton';
import CanvasBackground from '~/utils/canvas';
import {colors} from '~/utils/colors';
import {CategorySelector} from '~/components/overview/CategorySelector';
import {WordCard} from '~/components/overview/WordCard';
import AboutWordDialog from '~/components/dialogs/AboutWordDialog';
import {MAP_CATEGORY_NAME} from '~/utils/consts';

export default function UserInfo() {
  const {width: windowWidth} = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<GameCategory>('GENERAL');
  const [aboutWord, setAboutWord] = useState<null | string>(null);
  const [wordsOverview, setWordsOverview] = useState<RevealedWordOverview[]>(
    [],
  );

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

  useEffect(() => {
    getRevealedWords(activeCategory).then(setWordsOverview);
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
          <ScrollView
            style={styles.wordsScroll}
            contentContainerStyle={styles.wordsContainer}>
            {wordsOverview.map(({word, time, score, hint}) => (
              <WordCard
                key={word}
                word={word}
                time={time}
                score={score}
                onPress={() => setAboutWord(hint)}
              />
            ))}
          </ScrollView>
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
    fontWeight: '900',
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
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 10,
  },
});
