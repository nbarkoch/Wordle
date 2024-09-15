import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Timer from './Timer';

interface TopBarProps {
  score: number;
  isGameActive: boolean;
  onTimerUpdate: (time: number) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  score,
  isGameActive,
  onTimerUpdate,
}) => {
  return (
    <View style={styles.topBar}>
      <Timer isActive={isGameActive} onTimerUpdate={onTimerUpdate} />
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
