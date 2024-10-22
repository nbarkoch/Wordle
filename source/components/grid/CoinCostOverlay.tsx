import {colors} from '~/utils/colors';
import StarCoin from '../StarCoin';
import React, {StyleSheet, Text, View} from 'react-native';

interface CoinCostOverlayProps {
  scoreCost: number;
}

function CoinCostOverlay({scoreCost}: CoinCostOverlayProps) {
  return (
    <View style={styles.container}>
      <StarCoin
        size={13}
        outerRingColor={colors.yellow}
        innerCircleColor={colors.lightYellow}
      />
      <Text style={styles.text}>{` ${scoreCost} `}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 2,
    backgroundColor: '#aaaaaaa0',
    bottom: -5,
    right: 40,
    zIndex: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.white,
  },
});

export default CoinCostOverlay;
