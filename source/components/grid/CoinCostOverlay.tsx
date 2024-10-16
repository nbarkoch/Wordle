import {colors} from '~/utils/colors';
import StarCoin from '../StarCoin';
import {Text, View} from 'react-native';

interface CoinCostOverlayProps {
  scoreCost: number;
}

function CoinCostOverlay({scoreCost}: CoinCostOverlayProps) {
  return (
    <View
      style={{
        position: 'absolute',
        padding: 2,
        backgroundColor: '#FFFFFF60',
        bottom: -5,
        left: 40,
        zIndex: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '900',
          color: colors.white,
        }}>{` ${scoreCost} `}</Text>
      <StarCoin
        size={13}
        outerRingColor={colors.yellow}
        innerCircleColor={colors.lightYellow}
      />
    </View>
  );
}

export default CoinCostOverlay;
