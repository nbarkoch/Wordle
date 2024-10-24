import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const REWARDED_INTERSTITIAL_ID = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : 'ca-app-pub-3655197897637289/5366174687';

export const showGameRestartAd = (onClose?: () => void) => {
  const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
    REWARDED_INTERSTITIAL_ID,
    {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['game', 'puzzle', 'hebrew'],
    },
  );

  const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
    RewardedAdEventType.LOADED,
    reward => {
      console.log(`Ad loaded with reward: ${reward.amount} ${reward.type}`);
      rewardedInterstitial.show();
    },
  );

  const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    reward => {
      console.log(`User earned reward: ${reward.amount} ${reward.type}`);
      onClose?.();
    },
  );

  rewardedInterstitial.load();

  // Cleanup
  setTimeout(() => {
    unsubscribeLoaded();
    unsubscribeEarned();
  }, 10000);
};
