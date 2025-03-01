import React, {useMemo} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {WordDisplayHierarchy} from '~/store/revealsStore';
import {useScoreStore} from '~/store/useScore';
import {colors} from '~/utils/colors';
import StarCoin from '../StarCoin';

interface ProfileStatsProps {
  wordsOverview: WordDisplayHierarchy;
  isLoading: boolean;
}
const ProfileStats = ({wordsOverview, isLoading}: ProfileStatsProps) => {
  const {userScore} = useScoreStore();

  const totalReveals = useMemo(() => {
    return Object.values(wordsOverview).reduce((acc, category) => {
      return (
        acc +
        category.easy.reveals.length +
        category.medium.reveals.length +
        category.hard.reveals.length
      );
    }, 0);
  }, [wordsOverview]);

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <View style={styles.coinContainer}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#ffffff80"
              style={{transform: [{scale: 1}]}}
            />
          ) : (
            <>
              <Text style={styles.statValue}>{userScore}</Text>
              <StarCoin outerRingColor={colors.gold} />
            </>
          )}
        </View>
        <Text style={styles.statLabel}>ניקוד</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statBox}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#ffffff80"
            style={{transform: [{scale: 1}]}}
          />
        ) : (
          <Text style={styles.statValue}>{totalReveals}</Text>
        )}
        <Text style={styles.statLabel}>מילים שנחשפו</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#19273040',
    borderColor: '#77807F',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    width: '50%',
  },
  statValue: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.lightGrey,
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'PloniDL1.1AAA-Bold',
  },
  divider: {
    height: '100%',
    width: 1,
    backgroundColor: colors.gold,
    marginHorizontal: 20,
  },
  coinContainer: {alignItems: 'center', flexDirection: 'row', gap: 5},
});

export default ProfileStats;
