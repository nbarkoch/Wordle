import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, SectionList} from 'react-native';
import {Difficulty, GameCategory} from '~/utils/types';
import {colors} from '~/utils/colors';
import {WordCard} from '~/components/overview/WordCard';
import {OutlinedText} from '~/components/CartoonText';
import ProgressIndicator from '~/components/overview/ProgressIndicator';
import {MAP_DIFFICULTY_NAME} from '~/utils/consts';
import {RevealedWordOverview} from '~/store/revealsStore';
import {wordList} from '~/utils/db';

const ITEMS_PER_ROW = 3;
const ROW_HEIGHT = 90; // Adjust based on your WordCard height
const SECTION_FOOTER_HEIGHT = 20;

interface DifficultyData {
  reveals: RevealedWordOverview[];
  total: number;
}

type WordData = RevealedWordOverview & {info: string};

interface WordsListProps {
  wordsOverview: Record<GameCategory, Record<Difficulty, DifficultyData>>;
  activeCategory: GameCategory;
  onWordPress: (hint: string) => void;
}

interface Section {
  difficulty: Difficulty;
  data: WordData[][];
  total: number;
}

type SectionsByCategory = Record<GameCategory, Section[]>;

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

// Optimized chunk array function
const chunkArray = <T,>(array: T[]): T[][] => {
  if (array.length === 0) {
    return [];
  }
  const chunks: T[][] = [];
  let i = 0;
  while (i < array.length) {
    chunks.push(array.slice(i, i + ITEMS_PER_ROW));
    i += ITEMS_PER_ROW;
  }
  return chunks;
};

// Memoized Section Header Component
const SectionHeader = React.memo(({section}: {section: Section}) => (
  <View style={styles.levelTitle}>
    <View
      style={[
        styles.difficultyContainer,
        {backgroundColor: colorMapperLight[section.difficulty]},
      ]}>
      <OutlinedText
        text={MAP_DIFFICULTY_NAME[section.difficulty]}
        fontSize={22}
        width={300}
        height={40}
        fillColor={colors.white}
        strokeColor={colorMapper[section.difficulty]}
        strokeWidth={6}
      />
      <ProgressIndicator
        totalWords={section.total}
        revealedWords={section.data.reduce((acc, row) => acc + row.length, 0)}
        color={colorMapper[section.difficulty]}
        lightColor={colorMapperLight[section.difficulty]}
      />
    </View>
  </View>
));

// Memoized Row Component
const WordRow = React.memo(
  ({row, onPress}: {row: WordData[]; onPress: (info: string) => void}) => (
    <View style={styles.row}>
      {row.map(wordData => (
        <WordCard
          key={wordData.word}
          word={wordData.word}
          time={wordData.time}
          score={wordData.score}
          onPress={() => onPress(wordData.info)}
          disabled={!wordData.info}
        />
      ))}
    </View>
  ),
);

export const WordsSectionsList: React.FC<WordsListProps> = ({
  wordsOverview,
  activeCategory,
  onWordPress,
}) => {
  const sectionsByCategory = useMemo<SectionsByCategory>(() => {
    const result = {} as SectionsByCategory;

    Object.entries(wordsOverview).forEach(([category, difficulties]) => {
      const gameCategory = category as GameCategory;

      result[gameCategory] = Object.entries(difficulties)
        .map(([difficulty, words]) => {
          const difficultyValue = difficulty as Difficulty;
          const categoryWordList = wordList[gameCategory];

          // Filter words that exist in the wordList
          const validReveals = words.reveals.map(reveal => ({
            ...reveal,
            info: categoryWordList[reveal.word.length]?.[difficultyValue]?.[
              reveal.word
            ],
          }));
          return {
            difficulty: difficultyValue,
            data: chunkArray(validReveals),
            total: words.total,
          };
        })
        .filter(section => section.data.length > 0);
    });

    return result;
  }, [wordsOverview]);

  const currentSections = useMemo(
    () => sectionsByCategory[activeCategory] || [],
    [sectionsByCategory, activeCategory],
  );

  const renderItem = useCallback(
    ({item: row}: {item: WordData[]}) => (
      <WordRow row={row} onPress={onWordPress} />
    ),
    [onWordPress],
  );

  const renderSectionHeader = useCallback(
    ({section}: {section: Section}) => <SectionHeader section={section} />,
    [],
  );

  const renderSectionFooter = useCallback(
    () => <View style={styles.sectionFooter} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: RevealedWordOverview[], index: number) =>
      `row-${index}-${item[0]?.word ?? ''}`,
    [],
  );

  return (
    <SectionList
      sections={currentSections}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      renderSectionFooter={renderSectionFooter}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      initialNumToRender={7}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
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
  sectionFooter: {
    height: SECTION_FOOTER_HEIGHT,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 5,
    height: ROW_HEIGHT,
  },
});

export default React.memo(WordsSectionsList);
