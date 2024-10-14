import Animated from 'react-native-reanimated';
import {colors} from '~/utils/colors';
import StarCoin from '../StarCoin';

interface CoinCostOverlayProps {
  scoreCost: number;
}

function CoinCostOverlay({scoreCost}: CoinCostOverlayProps) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        padding: 2,
        backgroundColor: colors.white,
        bottom: -5,
        left: 28,
        zIndex: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Animated.Text
        style={{
          fontSize: 12,
          fontWeight: '900',
          color: colors.darkYellow,
        }}>{` ${scoreCost} `}</Animated.Text>
      <StarCoin
        size={13}
        outerRingColor={colors.yellow}
        innerCircleColor={colors.lightYellow}
      />
    </Animated.View>
  );
}

export default CoinCostOverlay;
