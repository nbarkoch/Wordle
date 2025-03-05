import React, {useMemo} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {GameCategory} from '~/utils/types';
import {colors} from '~/utils/colors';
import {CategoryButton} from './CategoryButton';

interface CategorySelectorProps {
  categories: Array<{title: string; key: GameCategory}>;
  activeCategory: GameCategory;
  onCategoryChange: (category: GameCategory) => void;
  shouldScroll: boolean;
}

export const CategorySelector = React.memo(
  ({
    categories,
    activeCategory,
    onCategoryChange,
    shouldScroll,
  }: CategorySelectorProps) => {
    const CategoryButtons = useMemo(
      () =>
        categories.map((category, index) => (
          <CategoryButton
            key={category.key}
            title={category.title}
            onPress={() => onCategoryChange(category.key)}
            isActive={activeCategory === category.key}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        )),
      [categories, activeCategory, onCategoryChange],
    );

    return (
      <View style={styles.container}>
        {shouldScroll ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {CategoryButtons}
          </ScrollView>
        ) : (
          <View style={styles.flexContainer}>{CategoryButtons}</View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkGrey,
    paddingBottom: 2,
  },
  flexContainer: {
    flexDirection: 'row',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
