import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Timer from './Timer';
import {useScoreStore} from '~/store/useScore';

const TopBar: React.FC = () => {
  const {userScore} = useScoreStore();
  return (
    <View style={styles.topBar}>
      <Timer />
      <Text style={styles.topBarScore}>Score: {userScore}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarScore: {fontSize: 18, fontWeight: '900', color: '#7FCCB5'},
});

export default TopBar;
