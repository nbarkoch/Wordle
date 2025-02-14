import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, SectionList} from 'react-native';
import {Difficulty, GameCategory} from '~/utils/types';
import {colors} from '~/utils/colors';
import {WordCard} from '~/components/overview/WordCard';
import {OutlinedText} from '~/components/CartoonText';
import ProgressIndicator from '~/components/overview/ProgressIndicator';
import {MAP_DIFFICULTY_NAME} from '~/utils/consts';

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
  data: WordsData[][]; // Array of rows, where each row contains up to 3 items
  total: number;
}

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

const renderSectionHeader = ({section}: {section: Section}) => (
  <View style={styles.levelTitle}>
    <View
      style={[
        styles.difficultyContainer,
        {
          backgroundColor: colorMapperLight[section.difficulty],
        },
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
);

// Helper function to chunk array into groups of specified size
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

type SectionsByCategory = Record<GameCategory, Section[]>;

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
          data: chunkArray(words.reveals, 3),
          total: words.total,
        }))
        .filter(section => section.data.length > 0);
    });

    return result;
  }, [wordsOverview]);

  const currentSections = sectionsByCategory[activeCategory] || [];

  const renderRow = useCallback(
    ({item: row}: {item: WordsData[]}) => (
      <View style={styles.row}>
        {row.map(wordData => (
          <WordCard
            key={wordData.word}
            word={wordData.word}
            time={wordData.time}
            score={wordData.score}
            onPress={() => onWordPress(wordData.hint)}
          />
        ))}
      </View>
    ),
    [onWordPress],
  );

  return (
    <SectionList
      sections={currentSections}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderRow}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      keyExtractor={(item, index) => `row-${index}-${item[0]?.word ?? ''}`}
      renderSectionFooter={() => <View style={styles.sectionFooter} />}
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
    height: 20,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
});

export default React.memo(WordsSectionsList);
