import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {colors} from '~/utils/colors';

interface ProgressBarProps {
  progress: number;
  color: string;
}

const ProgressBar = ({progress, color}: ProgressBarProps) => (
  <View style={styles.progressBarContainer}>
    <View
      style={[
        styles.progressBarFill,
        {
          width: `${Math.min(100, progress)}%`,
          backgroundColor: color,
        },
      ]}
    />
  </View>
);

interface ProgressIndicatorProps {
  totalWords: number;
  revealedWords: number;
  color: string;
  lightColor: string;
}

const ProgressIndicator = ({
  totalWords,
  revealedWords,
  color = colors.lightGold,
  lightColor = colors.lightGold,
}: ProgressIndicatorProps) => {
  const percentage = totalWords > 0 ? (revealedWords / totalWords) * 100 : 0;

  const formattedPercentage = percentage.toFixed(2);

  return (
    <View style={[styles.container, {backgroundColor: `${lightColor}30`}]}>
      <ProgressBar progress={percentage} color={color} />
      <Text style={[styles.percentageText, {color}]}>
        {formattedPercentage}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 8,
  },
  progressBarContainer: {
    width: 64,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProgressIndicator;
