import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, SectionList} from 'react-native';
import {Difficulty, GameCategory} from '~/utils/types';
import {colors} from '~/utils/colors';
import {WordCard} from '~/components/overview/WordCard';
import {OutlinedText} from '~/components/CartoonText';
import ProgressIndicator from '~/components/overview/ProgressIndicator';
import {MAP_DIFFICULTY_NAME} from '~/utils/consts';

const ITEMS_PER_ROW = 3;
const ROW_HEIGHT = 90; // Adjust based on your WordCard height
const SECTION_FOOTER_HEIGHT = 20;

interface WordsData {
  word: string;
  time: number;
  score: number;
  hint: string;
}

interface DifficultyData {
  reveals: WordsData[];
  total: number;
}

interface WordsListProps {
  wordsOverview: Record<GameCategory, Record<Difficulty, DifficultyData>>;
  activeCategory: GameCategory;
  onWordPress: (hint: string) => void;
}

interface Section {
  difficulty: Difficulty;
  data: WordsData[][];
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
  ({row, onPress}: {row: WordsData[]; onPress: (hint: string) => void}) => (
    <View style={styles.row}>
      {row.map(wordData => (
        <WordCard
          key={wordData.word}
          word={wordData.word}
          time={wordData.time}
          score={wordData.score}
          onPress={() => onPress(wordData.hint)}
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
    const result: SectionsByCategory = {} as SectionsByCategory;

    Object.entries(wordsOverview).forEach(([category, difficulties]) => {
      result[category as GameCategory] = Object.entries(difficulties)
        .map(([difficulty, words]) => ({
          difficulty: difficulty as Difficulty,
          data: chunkArray(words.reveals),
          total: words.total,
        }))
        .filter(section => section.data.length > 0);
    });

    return result;
  }, [wordsOverview]);

  const currentSections = useMemo(
    () => sectionsByCategory[activeCategory] || [],
    [sectionsByCategory, activeCategory],
  );

  const renderItem = useCallback(
    ({item: row}: {item: WordsData[]}) => (
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
    (item: WordsData[], index: number) => `row-${index}-${item[0]?.word ?? ''}`,
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
