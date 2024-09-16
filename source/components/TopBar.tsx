import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Timer from './Timer';

interface TopBarProps {
  score: number;
}

const TopBar: React.FC<TopBarProps> = ({score}) => {
  return (
    <View style={styles.topBar}>
      <Timer />
      <Text style={styles.topBarScore}>Score: {score}</Text>
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
