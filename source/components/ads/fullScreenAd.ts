import {AdEventType, AppOpenAd, TestIds} from 'react-native-google-mobile-ads';

const showAppOpenAd = () => {
  const appOpenAd = AppOpenAd.createForAdRequest(TestIds.APP_OPEN, {
    requestNonPersonalizedAdsOnly: true,
  });

  appOpenAd.load();

  const unsubscribeLoaded = appOpenAd.addAdEventListener(
    AdEventType.LOADED,
    () => {
      appOpenAd.show();
    },
  );

  const unsubscribeClosed = appOpenAd.addAdEventListener(
    AdEventType.CLOSED,
    () => {
      console.log('App Open Ad closed');
      // Perform any action after the ad is closed
    },
  );

  // Clean up event listeners after a reasonable timeout
  setTimeout(() => {
    unsubscribeLoaded();
    unsubscribeClosed();
  }, 10000); // Adjust this timeout as needed
};

export default showAppOpenAd;
