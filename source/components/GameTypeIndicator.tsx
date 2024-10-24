import React, {StyleSheet, Text, View} from 'react-native';
import {colors} from '~/utils/colors';
import {setColorOpacity} from '~/utils/ui';

interface GameTypeIndicatorProps {
  title: string;
}
function GameTypeIndicator({title}: GameTypeIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.cube}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cube: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 45,
    borderRadius: 20,
    backgroundColor: setColorOpacity(colors.darkGreen, 0.15),
  },
  text: {
    color: setColorOpacity(colors.white, 0.75),
    fontWeight: '900',
    fontSize: 14,
  },
});

export default GameTypeIndicator;
