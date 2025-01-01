import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-3655197897637289/1571864948';

export const showGameRestartAd = (onClose?: () => void) => {
  const interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
    customTargeting: {
      content_rating: 'general_audience',
      app_category: 'family_games',
    },
    keywords: ['games', 'puzzle', 'word', 'family friendly', 'education'],
  });

  const unsubscribeLoaded = interstitialAd.addAdEventListener(
    AdEventType.LOADED,
    () => {
      console.log('Interstitial ad loaded successfully');
      interstitialAd.show();
    },
  );

  const unsubscribeClosed = interstitialAd.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      console.log('Interstitial ad closed');
      onClose?.();
      cleanup(); // Unsubscribe when the ad closes
    },
  );

  interstitialAd.load();

  // Cleanup function to remove event listeners
  const cleanup = () => {
    unsubscribeLoaded();
    unsubscribeClosed();
  };

  // Set a timeout to automatically unsubscribe after 10 seconds
  setTimeout(cleanup, 10000);
};
